---
name: create-task
description: Orchestrate a new implementation task from classification through PR. Use when the user wants to start a feature, fix, refactor, chore, docs, test, or performance task that requires a branch, OpenSpec artifacts, quality gates, commit, push, and pull request.
license: MIT
metadata:
  author: saamanthacosta
  version: "1.0"
---

# create-task

Single entry point for implementation tasks. Classifies the request, prepares a safe
branch, drives OpenSpec, security, and project-verification phases, and delivers a
clean PR using the workspace's existing conventions.

This skill is instruction-driven. Slash commands and skill files are prompts, not
subroutines. The phases below apply the canonical rules of the existing skills
(`openspec-explore`, `openspec-propose`, `openspec-apply-change`, `commit`,
`create-pr`, `cve-scan`) rather than reimplementing them.

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
preflight → explore → propose → apply → verify → commit → push → pr
```

Resume detection: read OpenSpec status, task checkboxes, current branch,
`git status`, upstream tracking, and existing PRs before deciding what to skip.

### 1.4 Approval checkpoints

Stop and ask before any of these:

- Switching branches with stashed changes
- Creating or checking out a branch
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
- **apply** → apply `openspec-apply-change` rules, including the full audit from §4.3.

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

### 3.4 Archive and vault-link separation

Opening a PR does **not** archive the OpenSpec change. After a successful PR,
print archive as an optional follow-up:

```
PR opened: <url>
Optional follow-up: archive the change with `/opsx-archive create-task-workflow`
                     and link the vault with `/opsx-link openspec-vault-link -- <change-dir>`.
```

Do not invoke those skills automatically.

## 4. Quality and security gates

### 4.1 Explore — CVE threat-model prompts

Before exiting explore, ensure the user has answered (or explicitly waived) each:

- Data touched (PII, secrets, credentials, tokens, customer content)?
- Trust boundaries crossed (network, process, user/role, tenant)?
- Third-party trust (deps, APIs, models, supply chain)?
- Persistence (DB, files, cache, logs)?
- Privilege escalation surface (auth, RBAC, sudo, IAM)?

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

### 4.3 Apply + staged-commit — CVE scans

- **Apply boundary:** run the generalized full audit (see
  `.agents/skills/cve-scan/bin/full-audit.mjs`). CRITICAL or unoverridden HIGH
  findings block the affected task.
- **Commit boundary:** run the staged scan (see
  `.agents/skills/cve-scan/bin/scan-staged.mjs`). CRITICAL or unoverridden HIGH
  findings block the commit.

When the cve-scan tooling is unavailable, apply the methodology fallback in
`.agents/skills/cve-scan/SKILL.md` and surface missing coverage in the
verification report.

### 4.4 Repository verification discovery

Inspect (in this order) for available commands:

1. `package.json` `scripts` → `lint`, `typecheck`, `test`, `build`, `security`
2. `Makefile` / `Justfile` targets with the same names
3. `pyproject.toml`, `Cargo.toml`, `go.mod`, etc. for equivalent tasks
4. `docs/` README sections declaring verification commands
5. CI configs (`.github/workflows/*`) for the canonical command list

Record each discovered command and its applicability. Do not invent commands.

### 4.5 Result handling

For each check, record:

- Command (or "none — skipped")
- Exit status
- Output summary (truncated)
- Blocking? yes/no

Required checks: lint, typecheck, test, security. Any required check with
non-zero exit blocks delivery. Skipped required checks require explicit user
acknowledgement to proceed.

### 4.6 Pre-PR readiness check

Immediately before opening a PR:

1. `git status --porcelain` must be empty.
2. The branch must have an upstream (`git rev-parse --abbrev-ref --symbolic-full-name @{u}`).
3. The latest commit must be the task's intended commit (`git log -1 --stat`).
4. All required checks must be green; CRITICAL/HIGH findings must be resolved or
   explicitly overridden.

Stop and report if any of these fail.

## 5. Commit, push, and PR delivery

### 5.1 Commit grouping and message rules

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

### 5.2 Approval and verification

Show the preview and ask the user to approve. After commit, verify:

```bash
git log -1 --stat
git diff HEAD~1 -- <expected paths>
```

If the diff does not match the intended change, stop and report.

### 5.3 Push with verified upstream

```bash
git push --set-upstream origin <branch>
```

Then verify:

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u}
git ls-remote --heads origin <branch>
```

On any failure, stop. Never silently fall back, never open a PR on a failed push.

### 5.4 PR preview

Use the `create-pr` skill format for the preview:

- Short title (≤ ~70 chars)
- Structured description: Summary, Why, Changes, File tree, Commits, Notes
- File tree of the branch diff vs base
- List of commits (`git log <base>..HEAD --oneline`)
- Any caveats, including skipped checks

### 5.5 PR creation

1. `gh pr list --head <branch> --state all --json url` — if a PR exists, return
   its URL and stop.
2. Show the preview, request approval.
3. `gh pr create --base main --head <branch> --title "..." --body "..." --assignee "@me"`
4. Return the PR URL.

Archive is **not** performed automatically.

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

### 6.2 Verification output

```
## Verification
| Check      | Command           | Status | Notes                |
| ---------- | ----------------- | ------ | -------------------- |
| lint       | <cmd>             | pass   |                      |
| typecheck  | <cmd>             | pass   |                      |
| test       | <cmd>             | pass   |                      |
| security   | <cmd>             | pass   | cve-scan staged      |
| build      | <cmd>             | skip   | not applicable        |
```

### 6.3 Completion output

```
## Implementation Complete
- Branch:  <branch>
- Commits: <N>
- PR:      <url>
- Checks:  <pass count>/<total>
- Follow-up: archive via `/opsx-archive create-task-workflow` (optional)
```

## 7. Recovery paths

- **Wrong branch?** `git checkout <correct-branch>` — but only when worktree is clean.
- **Stash not restored?** `git stash list` to locate, then `git stash pop` or `git stash apply`.
- **Pull failed (non-ff):** `git fetch origin`, inspect diverged commits, ask user.
- **Push rejected:** read remote error (auth, protected branch, hook); do not force-push.
- **PR opened on wrong base:** close it, fix `--base`, reopen.
- **Resume after interruption:** rerun the skill; resume detection picks up at the first incomplete phase.

## 8. Guardrails

- Never auto-reset, force-push, or delete branches.
- Never bypass the security gate on CRITICAL findings; HIGH requires an explicit override.
- Never archive an OpenSpec change as part of this workflow.
- Never assume a package manager, test runner, or remote provider.
- Never open a PR on a failed push or failed check.
- Never stash existing commits; only stash working-tree changes.
