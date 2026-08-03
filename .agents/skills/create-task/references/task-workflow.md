# Task Workflow Mechanics

Operational recipes for the `create-task` skill. The orchestrator reads this file once at the start of the workflow. The skill body holds policy and contracts; this doc holds the commands, formats, and recovery procedures for each phase.

## Phase: preflight

Preflight runs **before** any exploration, proposal, or file change.

### Resolve the target Git worktree

Detect the current repository root via `git rev-parse --show-toplevel`. If the working directory is a multi-repo workspace container (no `.git` at root, multiple child repos visible), list candidates and ask the user to pick before any Git operation. Reject ambiguous invocations.

### Inspect worktree state

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

### Three-bucket dirty-worktree check

Check each bucket independently. This catches the case where a user has staged one change and unstaged another.

```bash
git diff --cached --stat        # staged
git diff --stat                  # unstaged (working tree vs staged)
git ls-files --others --exclude-standard   # untracked
```

If any bucket is non-empty, the worktree needs cleanup before switching branches. The cleanest path is to stash but the right action depends on what the user wants to do with the work.

### Clean-worktree path

When `git status --porcelain` is empty and the branch is `main`:

1. Confirm with the user: type, slug, branch name.
2. `git checkout main`
3. `git pull --ff-only` (stop on non-ff; never merge/rebase)
4. `git checkout -b <prefix>/<slug>`

### Dirty-worktree path

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
7. If conflicts appear: **stop**, leave the stash intact (`git stash list` should still show it), report the conflict, and do not begin proposal or implementation work.

### Fail-safe handling

- **Missing remote:** stop after preflight. Offer commit-only path; do not attempt push/PR.
- **Missing `main`:** stop. Ask the user to specify the base branch.
- **Diverged history:** stop. Do not merge, rebase, or force-push. Report the divergence and ask the user how to proceed.
- **Existing commits ahead of `main`:** those are not stashable; ask to resume the current branch, branch from current history, or abort.
- **Pull failure:** stop. Show the upstream error. Never fall back to merge or rebase.
- **Stash conflict:** stop. Keep the stash. Report files and ask for guidance.
- **User cancellation:** revert to the previous branch when safe, otherwise report current branch state and exit.

## Resume detection

Before any phase, run:

```bash
openspec list --json
openspec status --change "<name>" --json   # when an active change matches
```

If an active change already exists with completed proposal/design artifacts and partially completed tasks, skip proposal and resume at the first incomplete task in `tasks.md`. Never recreate completed artifacts. Never re-run destructive Git operations that already succeeded.

## Phase: apply

No mechanics here. The orchestrator delegates to `openspec-apply-change`. The plan lives in the change's `tasks.md`; the orchestrator checks off tasks as they complete and never lets a specialist completion summary replace verification, archive, security, commit, push, or PR delivery.

## Phase: verify

The `verify` phase runs before archive and covers non-CVE correctness checks.

### Verify scope

- Confirm all OpenSpec artifacts are complete and every required task is checked.
- Review `git diff` and `git status` for intended scope, accidental files, and unresolved conflicts.
- Run discovered lint, typecheck, test, and build commands when applicable.
- Validate task-specific acceptance criteria and regression coverage.
- Record every command, exit status, output summary, and blocking result.

Verification does not produce the final CVE reports because archive and spec sync change the working tree. Final security reporting therefore runs in the mandatory pre-archive `cve-report` phase (see "Phase: cve-report" below).

### Repository verification discovery

Inspect (in this order) for available commands:

1. `package.json` `scripts` → `lint`, `typecheck`, `test`, `build`, `security`
2. `Makefile` / `Justfile` targets with the same names
3. `pyproject.toml`, `Cargo.toml`, `go.mod`, etc. for equivalent tasks
4. `docs/` README sections declaring verification commands
5. CI configs (`.github/workflows/*`) for the canonical command list

Record each discovered command and its applicability. Do not invent commands.

### Result handling

For each check, record:

- Command (or "none — skipped")
- Exit status
- Output summary (truncated)
- Blocking? yes/no

Required pre-archive checks: lint, typecheck, and test; build when applicable. Non-zero exits block delivery. A missing repository command may proceed only after explicit user acknowledgement. Post-archive CVE reporting and the staged scan are mandatory and cannot be skipped or replaced by acknowledgement.

## Phase: pre-commit-review

The `pre-commit-review` phase runs after `verify` and before the pre-archive `cve-report`. It applies the three-class taxonomy in `BLOCKER-CHECKLIST.md` (same directory). Apply only after `verify` has passed.

### Phasing

1. Re-read the active change's `proposal.md` and `design.md` against the current working tree.
2. Walk `BLOCKER-CHECKLIST.md` once per category:
   - **Blocker** candidates: scope creep, contract drift vs spec, swallow-and-continue, missing migration, broken build, untested failure path.
   - **Polish** candidates: lint nits, docstrings, cosmetic TODOs.
   - **Out-of-scope** candidates: feature creep beyond proposal, unrelated refactor, new dependency with no justification.
3. For each finding, label and decide.

### Output and narration

- **Blocker** → narrate `looping back to <phase> — <one-line reason citing the blocker class and concrete finding>` inside the phase output block. The narration must name the artifact (file:line where relevant).
- **Polish** → note in the phase output block (`polish: <one-line>`) for inclusion in the PR body later.
- **Out-of-scope** → stop and ask the user to propose a new OpenSpec change for the finding before continuing.

### Loop-back routing

- Propose-loop when the finding requires editing `design.md` or `specs/<cap>/spec.md` (heuristic from `BLOCKER-CHECKLIST.md` in the same directory).
- Apply-loop otherwise.
- Surface a `question` if the target is ambiguous.

### Skip and dismiss

- Skip at run time: prompt `"skip pre-commit-review for this change? [y/N] — reason: ____"`.
- Override a loop-back: `"proceed anyway — reason: ____"` after the narration is shown.
- Both options require a reason; the reason is recorded in the PR body as `Review gate: skipped (reason)` or `Review gate: dismissed by user (reason)`.

### Skip-on-blocker for cve-report

If the gate classifies a blocker in this pass, the workflow does NOT run the pre-archive `cve-report` — the loop-back invalidates the diff anyway. The post-fix pass runs both gates in order.

### What the gate does NOT do

- Re-run tests, lint, typecheck, build (those are `verify`'s job).
- Re-run coverage tools (verify emits the coverage report when tooling exists; the gate reads it).
- Re-check security/dependency hygiene (that's `cve-report`'s job).

## Phase: archive

After implementation and all repository verification checks pass:

1. Resolve the active change name from the current workflow state. If ambiguous, list active changes and ask the user to select; never guess.
2. Apply the `openspec-archive-change` completion checks. If delta specs exist, synchronize them into the canonical specs; do not offer an archive-without-sync path. Show the combined sync-and-archive plan and request one approval.
3. After approval, sync all delta specs, verify the canonical specs were updated, then move the change to `openspec/changes/archive/YYYY-MM-DD-<name>/` and run the `openspec-vault-link` integration as best-effort enrichment.
4. Verify the active change no longer appears in `openspec list --json`, the archive path exists, and any synchronized canonical specs contain the expected updates. Rerun any verification command whose scope includes files changed by archival, synchronization, or vault linking.
5. Include the archived artifacts, canonical spec updates, vault links, and index changes among the intended files in the commit preview.

An archive or synchronization failure blocks the CVE-report and commit phases. Vault-link failure does not undo a successful archive, but it must be reported in verification notes. Proceed next to `cve-report`, never directly to commit.

## Phase: cve-report

The pre-archive `cve-report` runs after `pre-commit-review` and before archive. It runs ONLY if `pre-commit-review` did not produce a blocker on this pass — otherwise the workflow loops back first (see `Phase: pre-commit-review` / Skip-on-blocker).

1. Generate the pre-archive full-audit report and trend index:
   ```bash
   node .agents/skills/cve-scan/bin/full-audit.mjs --change <change-path> --phase=pre-archive --scope=<name>
   node .agents/skills/cve-scan/bin/format-report.mjs
   ```
   Notes:
   - `--phase=pre-archive` replaces the previous `--phase=pre-commit`. The flag value is descriptive of when in the lifecycle the audit runs.
   - `--change=<change-path>` references the active OpenSpec change directory before archive. After archive, the path is `openspec/changes/archive/YYYY-MM-DD-<name>/`.
2. Verify the report names the change scope, covers the active change directory plus the complete working tree, and has no blocking findings. The report must write under `docs/cve-reports/`.
3. If the report surfaces a CRITICAL or unoverridden HIGH finding, loop back to `apply` (or `propose` if the finding requires design or spec edits). Do not proceed to archive.
4. Add all generated report and index paths to the intended commit file list.
5. Stop on missing, stale, malformed, or blocking reports.

The staged scan runs after approval and staging but before the `git commit` command:

```bash
node .agents/skills/cve-scan/bin/scan-staged.mjs
```

CRITICAL or unoverridden HIGH findings block the commit. If a staged report file is generated, stage it and rerun the staged scan before executing `git commit`.

A missing final report, stale trend index, scanner error, CRITICAL finding, or unoverridden HIGH finding blocks the commit. When the cve-scan tooling is unavailable, apply the methodology fallback in `.agents/skills/cve-scan/SKILL.md` and surface missing coverage in the verification report.

## Phase: pre-pr

Immediately before opening a PR:

1. `git status --porcelain` must be empty.
2. The branch must have an upstream (`git rev-parse --abbrev-ref --symbolic-full-name @{u}`).
3. The latest commit must be the task's intended commit (`git log -1 --stat`).
4. All required checks must be green; CRITICAL/HIGH findings must be resolved or explicitly overridden.
5. The archived OpenSpec path must be present in the intended commit and the corresponding active change must be absent.
6. The final pre-archive CVE report, trend index, and staged scan must be current, included in the intended commit where applicable, and free of blockers.

Stop and report if any of these fail.

## Phase: commit / push / pr

### Commit grouping and message rules

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

### Approval and verification

Show the preview and ask the user to approve. After approval:

1. Stage only the approved intended files.
2. Run the staged CVE scan and block on failure.
3. Stage any generated CVE report/index updates and rerun the staged scan.
4. Execute `git commit` only after the final staged scan passes.

After commit, verify:

```bash
git log -1 --stat
git diff HEAD~1 -- <expected paths>
```

If the diff does not match the intended change, stop and report.

### Push with verified upstream

```bash
git push --set-upstream origin <branch>
```

Then verify:

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u}
git ls-remote --heads origin <branch>
```

On any failure, stop. Never silently fall back, never open a PR on a failed push.

### PR preview

Use the `create-pr` skill format for the preview:

- Short title (≤ ~70 chars)
- Structured description: Summary, Why, Changes, File tree, Commits, Notes
- File tree of the branch diff vs base
- List of commits (`git log <base>..HEAD --oneline`)
- Any caveats, including skipped checks

### PR creation

1. `gh pr list --head <branch> --state all --json url` — if a PR exists, return its URL and stop.
2. Show the preview, request approval.
3. `gh pr create --base main --head <branch> --title "..." --body "..." --assignee "@me"`
4. Return the PR URL.

The PR must include the archived OpenSpec change; if archive completion cannot be verified, stop before PR creation.

## Output formats

### Phase output

```
## Phase: preflight — done
- Repository: <repo path>
- Branch: <from> → <to>
- Slug: <slug>
- Type: <type>
- Stash: <none | label>
- Next: explore
```

### Skill timeline (chat block)

Every phase output SHALL be preceded by a `## Skill timeline` block produced by `.agents/skills/skill-sessions/bin/render.mjs`. The block is fed by the shared JSONL event stream and is the same source that populates `docs/skill-sessions/<id>.md`.

```
## Skill timeline
🚀 Skill session · <session-id>

- ✅ complete    1/11 preflight (0.4s)
- 🔄 running    3/11 apply
- 🧩 Specialist: openspec-apply-change (implementation phase)
- 💡 src/foo.ts — passed

### Summary · 2 complete · 1 active · 8 pending · 0 failed
```

Status icons are paired with text (`complete`, `running`, `pending`, `failed`, `loop-back`) so the block stays readable when emojis are stripped. Evidence rows larger than 1 KiB are truncated and point to the source file.

### Specialist phase and verification output

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

## CVE Reports — Pre-Archive
| Check       | Report/Command    | Status | Notes                |
| ----------- | ----------------- | ------ | -------------------- |
| full audit  | <report path>     | pass   | archived scope       |
| trend index | <index path>      | pass   | regenerated          |
| staged scan | <cmd>             | pass   | before commit        |
```

### Completion output

```
## Implementation Complete
- Branch:  <branch>
- Archive: openspec/changes/archive/YYYY-MM-DD-<name>/
- CVE:     docs/cve-reports/<report>.md
- Commits: <N>
- PR:      <url>
- Checks:  <pass count>/<total>
```

## Recovery paths

- **Wrong branch?** `git checkout <correct-branch>` — but only when worktree is clean.
- **Stash not restored?** `git stash list` to locate, then `git stash pop` or `git stash apply`.
- **Pull failed (non-ff):** `git fetch origin`, inspect diverged commits, ask user.
- **Push rejected:** read remote error (auth, protected branch, hook); do not force-push.
- **PR opened on wrong base:** close it, fix `--base`, reopen.
- **Archive failed:** keep the active change in place, report the failure, and do not prepare or stage a commit.
- **Resume after interruption:** rerun the skill; resume detection picks up at the first incomplete phase.
