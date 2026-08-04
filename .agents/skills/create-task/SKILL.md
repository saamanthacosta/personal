---
name: create-task
description: Orchestrate a full implementation task end-to-end: classify the type, branch safely, drive OpenSpec (explore → propose → apply → archive → vault-link), enforce security gates (CVE threat model + pre-archive audit + staged scan) and review gates (pre-commit-review with blocker taxonomy), then commit, push, and open the PR. Use when the user asks to add a feature, fix a bug, refactor code, write docs, add tests, improve performance, or create/modify a skill — even if they do not name branches, OpenSpec, or PRs. Remains authoritative when a specialist skill matches the task; a specialist completion summary never replaces verify/archive/security/commit/push/pr phases. Do NOT use for pure research, spike investigations, skill-only creation (use skill-authoring instead), or read-only summaries.
license: MIT
compatibility: Requires git, openspec CLI, gh CLI, and Node.js 18+ for the bundled scripts.
metadata:
  author: saamanthacosta
  version: "2.0"
---

# create-task

Single entry point for implementation tasks. Classifies the request, prepares a safe
branch, drives OpenSpec phases, applies security and review gates, and delivers a
clean PR using the workspace's existing conventions.

This skill is instruction-driven. Slash commands and skill files are prompts, not
subroutines. The phases below apply the canonical rules of the existing skills
(`openspec-explore`, `openspec-propose`, `openspec-apply-change`,
`openspec-archive-change`, `openspec-vault-link`, `commit`, `create-pr`,
`cve-scan`) rather than reimplementing them.

## When to load this skill

Load this skill when the user asks for an implementation change they expect to ship as a PR — even if they don't name branches, OpenSpec, or PRs. Loading signals:

- "add X", "implement X", "build X" → `feature`
- "fix X", "this is broken", "X regressed" → `fix`
- "rename / restructure / reorganize X" → `refactor`
- "upgrade X", "bump dependency", "clean up tooling" → `chore`
- "document X", "write docs for X" → `docs`
- "add tests for X", "cover X with tests" → `test`
- "speed up X", "X is slow", "optimize X" → `perf`
- "create/modify/fix a skill" → reuse an existing type (no `skill` type — see §1.1)

If the request is ambiguous between *ship* and *investigate*, ask before loading.

## When NOT to load this skill

Do not load if the request is any of:

- **Pure research / spike** — "investigate X — don't change anything yet" → use `openspec-explore` or `research-spike`.
- **Skill-only creation** — "create a new skill called X" with no associated implementation change → use `skill-authoring` directly.
- **Read-only summary** — "summarize what changed", "what does skill Y do" → no skill needed.
- **Explicit opt-out from delivery** — "draft X, no PR" → use a different workflow; this orchestrator always ends in a PR.

If unsure between this and a specialist, ask. The user can override.

## What this skill produces

A merged (or PR-ready) change that includes:

- A clean branch derived from `main` via `git checkout -b <prefix>/<slug>` (or the detected existing branch when resuming).
- OpenSpec artifacts in `openspec/changes/<name>/`, archived to `openspec/changes/archive/YYYY-MM-DD-<name>/`.
- Synchronized canonical specs under `openspec/specs/<cap>/spec.md`.
- Pre-archive CVE report and trend index under `docs/cve-reports/`.
- A conventional commit and a `gh pr create` against `main`.
- Optional vault links into the Obsidian MOC (best-effort).

## How this skill is structured

This skill uses progressive disclosure. Load files only when you need them:

| File                              | When to load                                               |
| --------------------------------- | ---------------------------------------------------------- |
| `SKILL.md` (this file)            | Always — contracts, phase policy, gotchas, indexes          |
| `references/task-workflow.md`     | Once at the start of every workflow run (phase mechanics)  |
| `references/BLOCKER-CHECKLIST.md` | Only when entering `pre-commit-review` (decision detail)   |
| `scripts/phase-status.mjs`        | Before resume detection; before any destructive git op     |
| `scripts/slug-check.mjs`          | After deriving a slug; before creating the branch          |
| `assets/evals.json`                | When evaluating the description or expected outputs        |

Do not invent a separate state file. The orchestrator reads observable signals (git, openspec, gh) — `scripts/phase-status.mjs` is the canonical snapshot helper.

## Workflow at a glance

The workflow is an 11-phase pipeline. Each phase emits a `## Phase: <name> — done` block before the next begins. Resume detection runs before any phase to skip completed work.

```
preflight → explore → propose → apply → verify → pre-commit-review → cve-report → archive → commit → push → pr
```

```
Progress:
- [ ] 1/11  preflight           (worktree, branch, stash)
- [ ] 2/11  explore             (OpenSpec + CVE threat model)
- [ ] 3/11  propose             (proposal + design with ## Security)
- [ ] 4/11  apply               (implement tasks.md, may load specialist)
- [ ] 5/11  verify              (lint, typecheck, test, build)
- [ ] 6/11  pre-commit-review   (blocker taxonomy)
- [ ] 7/11  cve-report          (pre-archive audit + staged scan)
- [ ] 8/11  archive             (sync delta specs → archive + vault-link)
- [ ] 9/11  commit              (preview + staged scan + git commit)
- [ ] 10/11 push                (set upstream + verify)
- [ ] 11/11 pr                  (create-pr preview + gh pr create)
```

## 1. Orchestrator contract

### 1.1 Task-type classification

Read the user's natural-language request and classify it into exactly one type. Mapping is fixed; do not invent types without confirmation.

| Type        | Branch prefix       | Use when                                              |
| ----------- | ------------------- | ----------------------------------------------------- |
| `feature`   | `feat/<slug>`       | New user-facing capability or non-trivial enhancement |
| `fix`       | `fix/<slug>`        | Bug, regression, or corrective change                 |
| `refactor`  | `refactor/<slug>`   | Internal restructuring with no behavior change         |
| `chore`     | `chore/<slug>`      | Tooling, deps, repo hygiene without behavior change   |
| `docs`      | `docs/<slug>`       | Documentation-only edits                              |
| `test`      | `test/<slug>`       | Adding or restructuring tests only                    |
| `perf`      | `perf/<slug>`       | Performance work with no behavior change              |

Validate type and slug with:

```bash
node scripts/slug-check.mjs feature csv-export
node scripts/slug-check.mjs --branch feat/csv-export
```

Personal skill work uses these existing types rather than introducing a `skill` type. Creating a new reusable skill is a `chore`; correcting broken skill behavior is a `fix`; restructuring without behavior change is a `refactor`; documentation work or test-only work keeps the corresponding type. Confirm the selected type and branch before repository mutation.

### 1.2 Slug derivation

Derive a kebab-case slug from the user's words: lowercase, ASCII letters/digits, hyphens only, no leading/trailing hyphens, max ~50 chars. `scripts/slug-check.mjs` enforces all of these. If uncertain, propose a slug and ask for confirmation **before** any repository mutation.

Examples:

- "add CSV export to reports" → `csv-export`
- "fix login redirect loop" → `login-redirect-loop`
- "rename UserService methods" → `user-service-methods` (the type already says it's a refactor)

### 1.3 Phase-state model

Workflow state lives in observable places; do not invent a separate state file. To take a snapshot before resuming:

```bash
node scripts/phase-status.mjs --pretty
```

The snapshot emits JSON covering git (branch, porcelain, upstream, divergence), openspec (active changes), and gh (existing PRs). Use it to decide which phases to skip.

**Orchestrator ownership:** once the user explicitly invokes `create-task`, this workflow remains authoritative from preflight through PR. A specialist skill loaded during `apply` provides bounded methodology for that phase and returns control afterward. Specialist completion is not task completion, and clarification inside a specialist pauses and resumes the same `create-task` phase.

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

## 2. OpenSpec phase integration

OpenSpec phases are prompts, not executable subroutines. Apply their rules inline rather than reimplementing them. Per-phase mechanics live in `references/task-workflow.md`.

### 2.1 Phase integration

- **explore** → apply `openspec-explore` rules, including the CVE threat-model prompts from §3.1.
- **propose** → apply `openspec-propose` rules, including proposal/design security validation from §3.2.
- **apply** → apply `openspec-apply-change` rules. When the task subject matches a specialist skill, load and apply that skill as bounded phase guidance. Require a visible `## Specialist Phase: <name> — done` boundary, then continue with the next incomplete `create-task` phase. Never let a specialist completion summary replace verify, archive, security, commit, push, or PR delivery. (The full CVE audit does NOT run in the apply phase; §3.4 invokes it exactly once, at the post-archive gate.)
- **verify** → run the repository and implementation checks defined in `references/task-workflow.md` under "Phase: verify".
- **archive** → after `verify`, `pre-commit-review`, and the pre-archive `cve-report` have all passed, synchronously apply all delta specs and archive with `openspec-archive-change`, then perform best-effort `openspec-vault-link` wiring. Sync and archive must complete before commit preparation. Mechanics in `references/task-workflow.md` under "Phase: archive".
- **cve-report** → runs *pre-archive*, after `pre-commit-review` and before archive. Generates the final full-audit report and trend index defined in §3.5 mechanics. The staged scan runs after staging but before `git commit`; all security gates must pass before the commit executes.

### 2.2 Visible checkpoints

After each phase, print the format in `references/task-workflow.md` under "Output formats / Phase output". Pause phases: clarification, proposal approval, blocker during apply, completion of a destructive step. Use the `question` tool for clarification when ambiguous type/slug/repo arises; otherwise surface the pause in plain text and wait.

### 2.3 Archive before commit (gate)

The sync-then-archive sequence must complete before any commit preparation. Mechanics for the sync steps, archive move, and verification live in `references/task-workflow.md` under "Phase: archive". This gate is the policy: do not prepare or stage a commit until the archive phase reports success and the active change is gone from `openspec list --json`. Archive only runs after `pre-commit-review` and the pre-archive `cve-report` have both passed.

An archive or synchronization failure blocks the CVE-report and commit phases. Vault-link failure does not undo a successful archive, but it must be reported in verification notes. Proceed next to `cve-report`, never directly to commit.

## 3. Quality and security gates

### 3.1 Explore — CVE threat-model gate

Apply the five threat-model questions from `../cve-scan/references/cve-methodology.md` (the "Threat-Model Questions" section) before exiting explore, plus the create-task-specific "Specialist handoff" prompt below. The methodology document owns the five threat-model questions; this orchestrator owns the sixth.

The five (from `../cve-scan/references/cve-methodology.md`):

1. What data classes does the change read, write, transmit, or expose?
2. Which trust boundaries does it cross?
3. Does it add a dependency or external service, and what is its trust posture?
4. What is persisted, where, and how is it protected?
5. Does it touch authentication, sessions, tokens, permissions, or privilege boundaries?

The sixth (orchestrator-specific):

- Specialist handoff: does the task match another skill, and if so, how will that phase return control without skipping verification or delivery?

This orchestrator gate-checks that the explore phase surfaced and answered (or explicitly waived) all six, and that the answers are recorded in the explore notes. If `../cve-scan/references/cve-methodology.md` is not in context, read it to confirm the canonical wording.

### 3.2 Proposal/design — security-section validation

Before apply begins, confirm the proposal/design contain a `## Security` (or equivalent) section addressing:

- Threat model summary
- Affected data and trust boundaries
- Mitigations
- Residual risk

Missing section → blocking finding; pause and ask for the section or an explicit methodology override.

### 3.3 Verify phase scope (rule)

The `verify` phase runs before archive and covers non-CVE correctness checks. Mechanics for scope, repository verification discovery, and result handling live in `references/task-workflow.md` under "Phase: verify". This rule is the policy: do not advance to archive until every required check is recorded with exit status and blocking decision.

Verification does not produce the final CVE reports because archive and spec sync change the working tree. Final security reporting therefore runs in the mandatory pre-archive `cve-report` phase (see §3.5).

### 3.4 Pre-commit-review gate (interface)

The orchestrator's interface to the blocker-classification gate:

- **Pre-commit-review phase:** runs after `verify` and before the pre-archive `cve-report`. The phase applies the three-class taxonomy in `references/BLOCKER-CHECKLIST.md` and routes findings:
  - **Blocker** → loop back to `apply` by default; loop back to `propose` if the finding requires editing `design.md` or `specs/<cap>/spec.md` (heuristic).
  - **Polish** → record for the PR body and continue to `cve-report`.
  - **Out-of-scope** → stop and ask the user to propose a new change.
  - **Skip / dismiss** → the user can opt out at run time; the reason lands in the PR body as `Review gate: skipped (reason)` or `Review gate: dismissed by user (reason)`.
- **Narrated loop-back format:** `looping back to <phase> — <one-line reason citing the blocker class and concrete finding>`. The narration lives in the phase output block, not as a separate prompt — keeps the context local to where the reader is.
- **Skip-on-blocker for cve-report:** if the gate classifies a blocker in the same pass, the workflow does NOT run the pre-archive `cve-report`; the loop-back runs first (fail fast). The next pass through the gate after the loop-back resolves the blocker still hits both gates in order.
- **Source of truth for the taxonomy and heuristic:** `references/BLOCKER-CHECKLIST.md` (decision-support artifact). This section owns the contract; the checklist owns the decision detail. Promote to a skill only if specialist sub-agents become useful.
- **Verify is mechanical, the gate is judgment:** `verify` runs the tests/build/lint/types and emits a coverage report when tooling exists (§3.3). The gate reads those artifacts but SHALL NOT re-run coverage or other mechanical checks.

### 3.5 Pre-archive CVE report (interface)

The orchestrator's interface to the cve-scan skill:

- **Pre-archive report:** after `verify` and `pre-commit-review`, and before archive, run:
  `node .agents/skills/cve-scan/scripts/full-audit.mjs --change <change-path> --phase=pre-archive --scope=<name>`.
  This is the **only** full-audit invocation per change. The previous post-archive scan has been relocated to this pre-archive position; the apply-boundary scan was already removed by `dedupe-cve-audit`. The orchestrator's own §3.5 names this gate as the final, authoritative CVE gate. The report must cover the complete working tree plus the active change directory.
- **Skip-on-blocker:** if `pre-commit-review` produces a blocker on this pass, this gate is skipped (§3.4) — the loop-back invalidates the diff anyway. The post-fix pass runs both gates in order.
- **Loop-back on findings:** if the pre-archive report surfaces a CRITICAL or unoverridden HIGH finding, the workflow loops back to `apply` (or `propose` if the finding requires design or spec edits) and does not proceed to archive.
- Run `node .agents/skills/cve-scan/scripts/format-report.mjs` to regenerate the CVE trend index after the final report is written.
- **Commit boundary:** after commit approval, stage only intended files, including the archived change directory, synchronized specs, CVE reports, and trend index. Run `node .agents/skills/cve-scan/scripts/scan-staged.mjs`. CRITICAL or unoverridden HIGH findings block the commit. If a staged report file is generated, stage it and rerun the staged scan before executing `git commit`.

A missing final report, stale trend index, scanner error, CRITICAL finding, or unoverridden HIGH finding blocks the commit. When the cve-scan tooling is unavailable, apply the methodology fallback in `.agents/skills/cve-scan/SKILL.md` and surface missing coverage in the verification report.

### 3.6 Pre-PR readiness rule

Immediately before opening a PR, the readiness checks must all pass. Mechanics (the specific commands and verification order) live in `references/task-workflow.md` under "Phase: pre-pr". This rule is the policy: any failure of a readiness check stops the workflow before PR creation.

The pre-PR gate confirms the **pre-archive** report (not a post-archive one) exists, names the change scope, is current, has no blocking findings, and is included in the intended commit. The CVEs the report covers are the same; only the timing and the `--phase=` label moved.

## 4. Commit, push, and PR delivery gates

### 4.1 Archive gate

Do not prepare or stage a commit until §2.3 is complete. Mechanics for the archive confirmations live in `references/task-workflow.md`.

### 4.2 Staged-scan gate

The pre-archive CVE report (§3.5) is produced before archive. Once the change is archived and intended commit files are staged, the staged-pattern scan is the commit-boundary gate: run `node .agents/skills/cve-scan/scripts/scan-staged.mjs`. CRITICAL or unoverridden HIGH findings block the commit. If a staged report file is generated, stage it and rerun the staged scan before executing `git commit`. Mechanics in `references/task-workflow.md` under "Phase: cve-report". No commit may execute until the staged scan passes.

### 4.3 Commit grouping and message rules

Use the `commit` skill for message format:

- Title ≤ 30 chars, imperative mood, no trailing period.
- Body paragraphs are single lines (no soft-wrap inside a phrase).
- Stage only intended files; never `git add -A` or `git add .`.

The commit preview format and approval flow live in `references/task-workflow.md`. The orchestrator gate is: never execute `git commit` without an approved preview and a passing staged scan.

### 4.4 PR preview and creation

Use the `create-pr` skill for both the preview format and the PR creation command sequence. The orchestrator gate is: do not open a PR on a failed push or failed check. The PR must include the archived OpenSpec change; if archive completion cannot be verified, stop before PR creation.

## 5. Gotchas

These are facts the orchestrator will get wrong without being told. Highest-value section to keep current. When the agent makes a mistake you correct, add it here.

- **Resume detection is mandatory.** Before any phase, run `scripts/phase-status.mjs` and read openspec/git/gh state. Never recreate completed artifacts; never re-run destructive git ops that already succeeded.
- **The full-audit phase is `pre-archive`, not `pre-commit`.** The flag `--phase=pre-archive` replaced `--phase=pre-commit` during the `dedupe-cve-audit` cleanup. There is exactly one full-audit invocation per change; the apply-boundary scan was removed.
- **Specialist completion is NOT task completion.** A `## Specialist Phase: <name> — done` block is the specialist's exit signal to the orchestrator. The orchestrator must still run verify, pre-commit-review, cve-report, archive, commit, push, and pr.
- **CVE tooling lives at `.agents/skills/cve-scan/scripts/*.mjs`.** Don't search for it elsewhere; if a script is missing, fall back to the methodology in `.agents/skills/cve-scan/SKILL.md` and surface the gap in the verification report.
- **`openspec list --json` after archive must NOT contain the change.** That is the gate that says archive succeeded. If the change is still listed, archive failed and you must not commit.
- **Skip-on-blocker for cve-report.** If pre-commit-review classifies a blocker, the pre-archive cve-report does NOT run on that pass — the loop-back invalidates the diff. The post-fix pass runs both gates in order.
- **The branch-prefix table uses short forms** (`feat`, `fix`, `refactor`, ...) but task types are long (`feature`, `fix`, `refactor`, ...). `scripts/slug-check.mjs` maps between them.
- **PR must include the archived OpenSpec change.** If archive completion cannot be verified, stop before PR creation.
- **Never use `git add -A` or `git add .`.** Stage only the intended files. The staged scan (§4.2) inspects the same files.
- **`scripts/phase-status.mjs` exits with code 4** when openspec or gh is missing. Partial snapshots are still emitted; the orchestrator treats that as degraded but not blocking for the phases that don't depend on the missing tool.
- **Skill-modification tasks reuse an existing type** (typically `docs` or `chore`). There is no `skill` type. The orchestrator still loads `skill-authoring` as a bounded specialist phase per §1.3, but the branch prefix and PR classification follow the chosen type.

## 6. Available scripts

Run from the repository root. Each script supports `--help` for full usage.

| Script                       | Purpose                                            | When to run                                              |
| ---------------------------- | -------------------------------------------------- | -------------------------------------------------------- |
| `scripts/phase-status.mjs`   | Snapshot git + openspec + gh state as JSON         | Before resume detection; before any destructive git op   |
| `scripts/slug-check.mjs`     | Validate type/slug/branch against §1.1–§1.2 rules  | After deriving a slug; before creating the branch        |

Exit-code conventions:

- `0` success
- `2` usage error (bad flags)
- `3` invalid input (e.g. bad slug)
- `4` tool missing (e.g. openspec or gh not on PATH) — partial snapshot still useful
- `5` invalid branch name (prefix/slug mismatch)

## 7. References

Load on demand, not all at once. Update this index when paths move rather than chasing broken links.

  - `references/task-workflow.md` — Load once at the start of every workflow run. Holds phase mechanics (commands, formats, recovery procedures) that this policy file summarizes.
  - `references/BLOCKER-CHECKLIST.md` — Load only when entering `pre-commit-review`. Holds the three-class taxonomy, loop-back routing heuristic, and skip/dismissal reason templates.
  - `assets/evals.json` — Triggering and expected-output evals for the description and the orchestrator contract. Iterate when triggering accuracy or contract fidelity drifts.

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