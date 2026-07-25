---
name: create-task
description: Orchestrate an explicitly requested implementation task from classification through PR, including work that creates or modifies reusable skills. Use when the user wants a feature, fix, refactor, chore, docs, test, or performance task with a branch, OpenSpec artifacts, quality gates, spec archival, commit, push, and pull request. Once invoked, this workflow remains authoritative when the task also matches a specialist skill.
license: MIT
metadata:
  author: saamanthacosta
  version: "1.3"
---

# create-task

Single entry point for implementation tasks. Classifies the request, prepares a safe
branch, drives OpenSpec, security, and project-verification phases, and delivers a
clean PR using the workspace's existing conventions.

This skill is instruction-driven. Slash commands and skill files are prompts, not
subroutines. The phases below apply the canonical rules of the existing skills
(`openspec-explore`, `openspec-propose`, `openspec-apply-change`,
`openspec-archive-change`, `openspec-vault-link`, `commit`, `create-pr`,
`cve-scan`) rather than reimplementing them.

## 1. Orchestrator contract

### 1.1 Task-type classification

Read the user's natural-language request and classify it into exactly one type.
Mapping is fixed; do not invent types without confirmation.

| Type        | Branch prefix       | Use when                                              |
| ----------- | ------------------- | ----------------------------------------------------- |
| `feature`   | `feat/<slug>`       | New user-facing capability or non-trivial enhancement |
| `fix`       | `fix/<slug>`        | Bug, regression, or corrective change                 |
| `refactor`  | `refactor/<slug>`   | Internal restructuring with no behavior change         |
| `chore`     | `chore/<slug>`      | Tooling, deps, repo hygiene without behavior change   |
| `docs`      | `docs/<slug>`       | Documentation-only edits                              |
| `test`      | `test/<slug>`       | Adding or restructuring tests only                    |
| `perf`      | `perf/<slug>`       | Performance work with no behavior change              |

Personal skill work uses these existing types rather than introducing a `skill`
type. Creating a new reusable skill is a `chore`; correcting broken skill behavior
is a `fix`; restructuring without behavior change is a `refactor`; documentation
work or test-only work keeps the corresponding type. Confirm the selected type and
branch before repository mutation.

### 1.2 Slug derivation

Derive a kebab-case slug from the user's words: lowercase, ASCII letters/digits,
hyphens only, no leading/trailing hyphens, max ~50 chars. If uncertain, propose
a slug and ask for confirmation **before** any repository mutation.

Examples:

- "add CSV export to reports" → `csv-export`
- "fix login redirect loop" → `login-redirect-loop`
- "rename UserService methods" → `refactor-user-service-methods`

### 1.3 Phase-state model

Workflow state lives in observable places; do not invent a separate state file.

```
preflight → explore → propose → apply → verify → archive → cve-report → commit → push → pr
```

Resume detection: read OpenSpec status, task checkboxes, current branch,
`git status`, upstream tracking, and existing PRs before deciding what to skip.

**Orchestrator ownership:** once the user explicitly invokes `create-task`, this
workflow remains authoritative from preflight through PR. A specialist skill
loaded during `apply` provides bounded methodology for that phase and returns
control afterward. Specialist completion is not task completion, and clarification
inside a specialist pauses and resumes the same `create-task` phase.

### 1.4 Approval checkpoints

Stop and ask before any of these:

- Switching branches with stashed changes
- Creating or checking out a branch
- Archiving the OpenSpec change or syncing its delta specs
- Committing
- Pushing
- Opening a PR
- Deleting or force-pushing branches
- Resolving stash conflicts

Never auto-reset, force-push, or silently drop work.

## 2. Repository preflight

Preflight runs **before** any exploration, proposal, or file change.

### 2.1 Resolve the target Git worktree

Detect the current repository root via `git rev-parse --show-toplevel`. If the
working directory is a multi-repo workspace container (no `.git` at root, multiple
child repos visible), list candidates and ask the user to pick before any Git
operation. Reject ambiguous invocations.

### 2.2 Inspect worktree state

Collect, in one read:

```bash
git branch --show-current
git status --porcelain
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "no upstream"
git rev-list --left-right --count origin/main...HEAD 2>/dev/null
git remote -v
git branch -a | grep -E "(remotes/origin/<slug>|<slug>)"
```

Classify into one of:

- `clean-on-main` — on `main`, no changes, in sync with upstream
- `clean-on-feature` — on a feature branch, in sync, no local changes
- `dirty-modifications` — tracked changes present
- `dirty-untracked` — untracked files present
- `ahead-of-main` — current branch has commits not on `main`
- `diverged` — branch and `main` have diverged
- `no-remote` — no `origin` configured
- `missing-main` — `main` (or `origin/main`) does not exist

### 2.3 Clean-worktree path

When `git status --porcelain` is empty and the branch is `main`:

1. Confirm with the user: type, slug, branch name.
2. `git checkout main`
3. `git pull --ff-only` (stop on non-ff; never merge/rebase)
4. `git checkout -b <prefix>/<slug>`

### 2.4 Dirty-worktree path

When `git status --porcelain` is non-empty:

1. Show the porcelain output to the user.
2. Ask explicitly: stash, commit on current branch first, or abort.
3. If approved, create a uniquely labeled stash:
   ```
   git stash push --include-untracked -m "create-task/<prefix>/<slug> <ISO-timestamp>"
   ```
4. `git checkout main && git pull --ff-only`
5. `git checkout -b <prefix>/<slug>`
6. `git stash pop` — restore by exact label, verify `git status --porcelain`
7. If conflicts appear: **stop**, leave the stash intact (`git stash list` should
   still show it), report the conflict, and do not begin proposal or
   implementation work.

### 2.5 Fail-safe handling

- **Missing remote:** stop after preflight. Offer commit-only path; do not attempt push/PR.
- **Missing `main`:** stop. Ask the user to specify the base branch.
- **Diverged history:** stop. Do not merge, rebase, or force-push. Report the
  divergence and ask the user how to proceed.
- **Existing commits ahead of `main`:** those are not stashable; ask to resume
  the current branch, branch from current history, or abort.
- **Pull failure:** stop. Show the upstream error. Never fall back to merge or rebase.
- **Stash conflict:** stop. Keep the stash. Report files and ask for guidance.
- **User cancellation:** revert to the previous branch when safe, otherwise
  report current branch state and exit.

## 3. OpenSpec phase integration

OpenSpec phases are prompts, not executable subroutines. Apply their rules
inline rather than reimplementing them.

### 3.1 Phase integration

- **explore** → apply `openspec-explore` rules, including the CVE threat-model
  prompts from §4.1.
- **propose** → apply `openspec-propose` rules, including proposal/design
  security validation from §4.2.
- **apply** → apply `openspec-apply-change` rules, including the full audit from §4.4.
  When the task subject matches a specialist skill, load and apply that skill as
  bounded phase guidance. Require a visible `## Specialist Phase: <name> — done`
  boundary, then continue with the next incomplete `create-task` phase. Never let
  a specialist completion summary replace verify, archive, security, commit, push,
  or PR delivery.
- **verify** → run the repository and implementation checks defined in §4.3.
- **archive** → after verification passes, synchronously apply all delta specs and
  archive with `openspec-archive-change`, then perform best-effort
  `openspec-vault-link` wiring. Sync and archive must complete before CVE reports.
- **cve-report** → after archive, generate the final full-audit report and trend
  index defined in §4.4. The staged scan runs after staging but before `git commit`;
  all security gates must pass before the commit executes.

### 3.2 Resume detection

Before any phase, run:

```bash
openspec list --json
openspec status --change "<name>" --json   # when an active change matches
```

If an active change already exists with completed proposal/design artifacts
and partially completed tasks, skip proposal and resume at the first incomplete
task in `tasks.md`. Never recreate completed artifacts. Never re-run destructive
Git operations that already succeeded.

### 3.3 Visible checkpoints

After each phase, print:

```
## Phase: <name> — <status>
- Result: <one-line summary>
- Next: <next phase> (<reason>)
```

Pause phases: clarification, proposal approval, blocker during apply, completion
of a destructive step. Use the `question` tool for clarification when ambiguous
type/slug/repo arises; otherwise surface the pause in plain text and wait.

### 3.4 Archive before commit

After implementation and all repository verification checks pass:

1. Resolve the active change name from the current workflow state. If ambiguous,
   list active changes and ask the user to select; never guess.
2. Apply the `openspec-archive-change` completion checks. If delta specs exist,
   synchronize them into the canonical specs; do not offer an archive-without-sync
   path. Show the combined sync-and-archive plan and request one approval.
3. After approval, sync all delta specs, verify the canonical specs were updated,
   then move the change to `openspec/changes/archive/YYYY-MM-DD-<name>/` and run
   the `openspec-vault-link` integration as best-effort enrichment.
4. Verify the active change no longer appears in `openspec list --json`, the
   archive path exists, and any synchronized canonical specs contain the expected
   updates. Rerun any verification command whose scope includes files changed by
   archival, synchronization, or vault linking.
5. Include the archived artifacts, canonical spec updates, vault links, and index
   changes among the intended files in the commit preview.

An archive or synchronization failure blocks the CVE-report and commit phases.
Vault-link failure does not undo a successful archive, but it must be reported in
verification notes. Proceed next to `cve-report`, never directly to commit.

## 4. Quality and security gates

### 4.1 Explore — CVE threat-model prompts

Before exiting explore, ensure the user has answered (or explicitly waived) each:

- Data touched (PII, secrets, credentials, tokens, customer content)?
- Trust boundaries crossed (network, process, user/role, tenant)?
- Third-party trust (deps, APIs, models, supply chain)?
- Persistence (DB, files, cache, logs)?
- Privilege escalation surface (auth, RBAC, sudo, IAM)?
- Specialist handoff (does the task match another skill, and if so, how will that
  phase return control without skipping verification or delivery)?

Record answers in the explore notes.

### 4.2 Proposal/design — security-section validation

Before apply begins, confirm the proposal/design contain a `## Security` (or
equivalent) section addressing:

- Threat model summary
- Affected data and trust boundaries
- Mitigations
- Residual risk

Missing section → blocking finding; pause and ask for the section or an explicit
methodology override.

### 4.3 Verify phase scope

The `verify` phase runs before archive and covers non-CVE correctness checks:

- Confirm all OpenSpec artifacts are complete and every required task is checked.
- Review `git diff` and `git status` for intended scope, accidental files, and
  unresolved conflicts.
- Run discovered lint, typecheck, test, and build commands when applicable.
- Validate task-specific acceptance criteria and regression coverage.
- Record every command, exit status, output summary, and blocking result.

Verification does not produce the final CVE reports because archive and spec sync
change the working tree. Final security reporting therefore runs in the mandatory
post-archive `cve-report` phase.

### 4.4 Apply + post-archive CVE reports

- **Apply boundary:** run the generalized full audit:
  `node .agents/skills/cve-scan/bin/full-audit.mjs --change <name> --phase=apply`.
  CRITICAL or unoverridden HIGH findings block the affected task.
- **Post-archive report:** after sync and archive, run:
  `node .agents/skills/cve-scan/bin/full-audit.mjs --change <archive-path> --phase=pre-commit --scope=<name>`.
  This must write the final report under `docs/cve-reports/` and cover the archived
  proposal plus the complete working tree.
- Run `node .agents/skills/cve-scan/bin/format-report.mjs` to regenerate the CVE
  trend index after the final report is written.
- **Commit boundary:** after commit approval, stage only intended files, including
  the archive, synchronized specs, CVE reports, and trend index. Run
  `node .agents/skills/cve-scan/bin/scan-staged.mjs`. CRITICAL or unoverridden HIGH
  findings block the commit. If a staged report file is generated, stage it and
  rerun the staged scan before executing `git commit`.

A missing final report, stale trend index, scanner error, CRITICAL finding, or
unoverridden HIGH finding blocks the commit. When the cve-scan tooling is
unavailable, apply the methodology fallback in `.agents/skills/cve-scan/SKILL.md`
and surface missing coverage in the verification report.

### 4.5 Repository verification discovery

Inspect (in this order) for available commands:

1. `package.json` `scripts` → `lint`, `typecheck`, `test`, `build`, `security`
2. `Makefile` / `Justfile` targets with the same names
3. `pyproject.toml`, `Cargo.toml`, `go.mod`, etc. for equivalent tasks
4. `docs/` README sections declaring verification commands
5. CI configs (`.github/workflows/*`) for the canonical command list

Record each discovered command and its applicability. Do not invent commands.

### 4.6 Result handling

For each check, record:

- Command (or "none — skipped")
- Exit status
- Output summary (truncated)
- Blocking? yes/no

Required pre-archive checks: lint, typecheck, and test; build when applicable.
Non-zero exits block delivery. A missing repository command may proceed only after
explicit user acknowledgement. Post-archive CVE reporting and the staged scan are
mandatory and cannot be skipped or replaced by acknowledgement.

### 4.7 Pre-PR readiness check

Immediately before opening a PR:

1. `git status --porcelain` must be empty.
2. The branch must have an upstream (`git rev-parse --abbrev-ref --symbolic-full-name @{u}`).
3. The latest commit must be the task's intended commit (`git log -1 --stat`).
4. All required checks must be green; CRITICAL/HIGH findings must be resolved or
   explicitly overridden.
5. The archived OpenSpec path must be present in the intended commit and the
   corresponding active change must be absent.
6. The final post-archive CVE report, trend index, and staged scan must be current,
   included in the intended commit where applicable, and free of blockers.

Stop and report if any of these fail.

## 5. Archive, CVE report, commit, push, and PR delivery

### 5.1 Archive gate

Do not prepare or stage a commit until §3.4 is complete. Confirm that:

- The OpenSpec change is under `openspec/changes/archive/YYYY-MM-DD-<name>/`.
- All delta specs were synchronized into canonical specs before archive.
- Archive and vault-link changes are included in the intended file list.
- Any archive or vault-link warnings are visible in the commit preview.

### 5.2 CVE-report gate

After archive and before commit preparation:

1. Generate the post-archive full-audit report and trend index from §4.4.
2. Verify the report names the archived change scope and has no blocking findings.
3. Add all generated report and index paths to the intended commit file list.
4. Stop on missing, stale, malformed, or blocking reports.

The staged scan runs after approval and staging but before the `git commit` command.
No commit may execute until both the post-archive report and staged scan pass.

### 5.3 Commit grouping and message rules

Use the `commit` skill for message format:

- Title ≤ 30 chars, imperative mood, no trailing period.
- Body paragraphs are single lines (no soft-wrap inside a phrase).
- Stage only intended files; never `git add -A` or `git add .`.

Preview the commit metadata before staging:

```
## Commit Preview
Branch:    <branch>
Files:     <list>
Title:     <title>
Body:
  <body line 1>
  <body line 2>
```

### 5.4 Approval and verification

Show the preview and ask the user to approve. After approval:

1. Stage only the approved intended files.
2. Run the staged CVE scan from §4.4 and block on failure.
3. Stage any generated CVE report/index updates and rerun the staged scan.
4. Execute `git commit` only after the final staged scan passes.

After commit, verify:

```bash
git log -1 --stat
git diff HEAD~1 -- <expected paths>
```

If the diff does not match the intended change, stop and report.

### 5.5 Push with verified upstream

```bash
git push --set-upstream origin <branch>
```

Then verify:

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u}
git ls-remote --heads origin <branch>
```

On any failure, stop. Never silently fall back, never open a PR on a failed push.

### 5.6 PR preview

Use the `create-pr` skill format for the preview:

- Short title (≤ ~70 chars)
- Structured description: Summary, Why, Changes, File tree, Commits, Notes
- File tree of the branch diff vs base
- List of commits (`git log <base>..HEAD --oneline`)
- Any caveats, including skipped checks

### 5.7 PR creation

1. `gh pr list --head <branch> --state all --json url` — if a PR exists, return
   its URL and stop.
2. Show the preview, request approval.
3. `gh pr create --base main --head <branch> --title "..." --body "..." --assignee "@me"`
4. Return the PR URL.

The PR must include the archived OpenSpec change; if archive completion cannot be
verified, stop before PR creation.

## 6. Output formats

### 6.1 Phase output

```
## Phase: preflight — done
- Repository: <repo path>
- Branch: <from> → <to>
- Slug: <slug>
- Type: <type>
- Stash: <none | label>
- Next: explore
```

### 6.2 Verification and CVE-report output

```
## Specialist Phase: <name> — done
- Result: <specialist output and path>
- Status: <validated | needs clarification>
- Next: <next create-task phase>

## Verification — Pre-Archive
| Check      | Command           | Status | Notes                |
| ---------- | ----------------- | ------ | -------------------- |
| lint       | <cmd>             | pass   |                      |
| typecheck  | <cmd>             | pass   |                      |
| test       | <cmd>             | pass   |                      |
| build      | <cmd>             | skip   | not applicable       |

## CVE Reports — Post-Archive
| Check       | Report/Command    | Status | Notes                |
| ----------- | ----------------- | ------ | -------------------- |
| full audit  | <report path>     | pass   | archived scope       |
| trend index | <index path>      | pass   | regenerated          |
| staged scan | <cmd>             | pass   | before commit        |
```

### 6.3 Completion output

```
## Implementation Complete
- Branch:  <branch>
- Archive: openspec/changes/archive/YYYY-MM-DD-<name>/
- CVE:     docs/cve-reports/<report>.md
- Commits: <N>
- PR:      <url>
- Checks:  <pass count>/<total>
```

## 7. Recovery paths

- **Wrong branch?** `git checkout <correct-branch>` — but only when worktree is clean.
- **Stash not restored?** `git stash list` to locate, then `git stash pop` or `git stash apply`.
- **Pull failed (non-ff):** `git fetch origin`, inspect diverged commits, ask user.
- **Push rejected:** read remote error (auth, protected branch, hook); do not force-push.
- **PR opened on wrong base:** close it, fix `--base`, reopen.
- **Archive failed:** keep the active change in place, report the failure, and do not prepare or stage a commit.
- **Resume after interruption:** rerun the skill; resume detection picks up at the first incomplete phase.

## 8. Guardrails

- Never auto-reset, force-push, or delete branches.
- Never bypass the security gate on CRITICAL findings; HIGH requires an explicit override.
- Never archive without synchronizing all delta specs into canonical specs.
- Never commit before the OpenSpec change has been archived and post-archive CVE reports pass.
- Never assume a package manager, test runner, or remote provider.
- Never surrender lifecycle ownership to a specialist skill after `create-task` has been explicitly invoked.
- Never treat specialist completion as permission to skip verification, archive, security, commit, push, or PR phases.
- Never open a PR on a failed push or failed check.
- Never stash existing commits; only stash working-tree changes.
