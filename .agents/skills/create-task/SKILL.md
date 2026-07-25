---
name: create-task
description: Orchestrate an explicitly requested implementation task from classification through PR, including work that creates or modifies reusable skills. Use when the user wants a feature, fix, refactor, chore, docs, test, or performance task with a branch, OpenSpec artifacts, quality gates, spec archival, commit, push, and pull request. Once invoked, this workflow remains authoritative when the task also matches a specialist skill.
license: MIT
metadata:
  author: saamanthacosta
  version: "1.4"
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

**Read `task-workflow.md` once at the start of any workflow run.** This
skill holds the orchestrator's policy and contracts; the doc holds the per-phase
mechanics (commands, formats, recovery recipes).

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

Personal skill work uses these existing types rather than introducing a `skill` type. Creating a new reusable skill is a `chore`; correcting broken skill behavior is a `fix`; restructuring without behavior change is a `refactor`; documentation work or test-only work keeps the corresponding type. Confirm the selected type and branch before repository mutation.

### 1.2 Slug derivation

Derive a kebab-case slug from the user's words: lowercase, ASCII letters/digits, hyphens only, no leading/trailing hyphens, max ~50 chars. If uncertain, propose a slug and ask for confirmation **before** any repository mutation.

Examples:

- "add CSV export to reports" → `csv-export`
- "fix login redirect loop" → `login-redirect-loop`
- "rename UserService methods" → `refactor-user-service-methods`

### 1.3 Phase-state model

Workflow state lives in observable places; do not invent a separate state file.

```
preflight → explore → propose → apply → verify → archive → cve-report → commit → push → pr
```

Resume detection: read OpenSpec status, task checkboxes, current branch, `git status`, upstream tracking, and existing PRs before deciding what to skip.

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

OpenSpec phases are prompts, not executable subroutines. Apply their rules inline rather than reimplementing them. Per-phase mechanics live in `task-workflow.md`.

### 2.1 Phase integration

- **explore** → apply `openspec-explore` rules, including the CVE threat-model prompts from §3.1.
- **propose** → apply `openspec-propose` rules, including proposal/design security validation from §3.2.
- **apply** → apply `openspec-apply-change` rules, including the full audit from §3.4. When the task subject matches a specialist skill, load and apply that skill as bounded phase guidance. Require a visible `## Specialist Phase: <name> — done` boundary, then continue with the next incomplete `create-task` phase. Never let a specialist completion summary replace verify, archive, security, commit, push, or PR delivery.
- **verify** → run the repository and implementation checks defined in `task-workflow.md` under "Phase: verify".
- **archive** → after verification passes, synchronously apply all delta specs and archive with `openspec-archive-change`, then perform best-effort `openspec-vault-link` wiring. Sync and archive must complete before CVE reports. Mechanics in `task-workflow.md` under "Phase: archive".
- **cve-report** → after archive, generate the final full-audit report and trend index defined in §3.4 mechanics. The staged scan runs after staging but before `git commit`; all security gates must pass before the commit executes.

### 2.2 Visible checkpoints

After each phase, print the format in `task-workflow.md` under "Output formats / Phase output". Pause phases: clarification, proposal approval, blocker during apply, completion of a destructive step. Use the `question` tool for clarification when ambiguous type/slug/repo arises; otherwise surface the pause in plain text and wait.

### 2.3 Archive before commit (gate)

The sync-then-archive sequence must complete before any commit preparation. Mechanics for the sync steps, archive move, and verification live in `task-workflow.md` under "Phase: archive". This gate is the policy: do not prepare or stage a commit until the archive phase reports success and the active change is gone from `openspec list --json`.

An archive or synchronization failure blocks the CVE-report and commit phases. Vault-link failure does not undo a successful archive, but it must be reported in verification notes. Proceed next to `cve-report`, never directly to commit.

## 3. Quality and security gates

### 3.1 Explore — CVE threat-model gate

Apply the five threat-model questions from `../cve-scan/cve-methodology.md` (the "Threat-Model Questions" section) before exiting explore, plus the create-task-specific "Specialist handoff" prompt below. The methodology document owns the five threat-model questions; this orchestrator owns the sixth.

The five (from `../cve-scan/cve-methodology.md`):

1. What data classes does the change read, write, transmit, or expose?
2. Which trust boundaries does it cross?
3. Does it add a dependency or external service, and what is its trust posture?
4. What is persisted, where, and how is it protected?
5. Does it touch authentication, sessions, tokens, permissions, or privilege boundaries?

The sixth (orchestrator-specific):

- Specialist handoff: does the task match another skill, and if so, how will that phase return control without skipping verification or delivery?

This orchestrator gate-checks that the explore phase surfaced and answered (or explicitly waived) all six, and that the answers are recorded in the explore notes. If `../cve-scan/cve-methodology.md` is not in context, read it to confirm the canonical wording.

### 3.2 Proposal/design — security-section validation

Before apply begins, confirm the proposal/design contain a `## Security` (or equivalent) section addressing:

- Threat model summary
- Affected data and trust boundaries
- Mitigations
- Residual risk

Missing section → blocking finding; pause and ask for the section or an explicit methodology override.

### 3.3 Verify phase scope (rule)

The `verify` phase runs before archive and covers non-CVE correctness checks. Mechanics for scope, repository verification discovery, and result handling live in `task-workflow.md` under "Phase: verify". This rule is the policy: do not advance to archive until every required check is recorded with exit status and blocking decision.

Verification does not produce the final CVE reports because archive and spec sync change the working tree. Final security reporting therefore runs in the mandatory post-archive `cve-report` phase.

### 3.4 Apply + post-archive CVE reports (interface)

The orchestrator's interface to the cve-scan skill:

- **Apply boundary:** run the generalized full audit:
  `node .agents/skills/cve-scan/bin/full-audit.mjs --change <name> --phase=apply`. CRITICAL or unoverridden HIGH findings block the affected task.
- **Post-archive report:** after sync and archive, run:
  `node .agents/skills/cve-scan/bin/full-audit.mjs --change <archive-path> --phase=pre-commit --scope=<name>`.
  This must write the final report under `docs/cve-reports/` and cover the archived proposal plus the complete working tree.
- Run `node .agents/skills/cve-scan/bin/format-report.mjs` to regenerate the CVE trend index after the final report is written.
- **Commit boundary:** after commit approval, stage only intended files, including the archive, synchronized specs, CVE reports, and trend index. Run `node .agents/skills/cve-scan/bin/scan-staged.mjs`. CRITICAL or unoverridden HIGH findings block the commit. If a staged report file is generated, stage it and rerun the staged scan before executing `git commit`.

A missing final report, stale trend index, scanner error, CRITICAL finding, or unoverridden HIGH finding blocks the commit. When the cve-scan tooling is unavailable, apply the methodology fallback in `.agents/skills/cve-scan/SKILL.md` and surface missing coverage in the verification report.

### 3.5 Pre-PR readiness rule

Immediately before opening a PR, the readiness checks must all pass. Mechanics (the specific commands and verification order) live in `task-workflow.md` under "Phase: pre-pr". This rule is the policy: any failure of a readiness check stops the workflow before PR creation.

## 4. Commit, push, and PR delivery gates

### 4.1 Archive gate

Do not prepare or stage a commit until §2.3 is complete. Mechanics for the archive confirmations live in `task-workflow.md`.

### 4.2 CVE-report gate

After archive and before commit preparation, the post-archive CVE report and trend index must be generated, validated, and added to the intended commit file list. Mechanics in `task-workflow.md` under "Phase: cve-report". The staged scan runs after approval and staging but before the `git commit` command. No commit may execute until both the post-archive report and staged scan pass.

### 4.3 Commit grouping and message rules

Use the `commit` skill for message format:

- Title ≤ 30 chars, imperative mood, no trailing period.
- Body paragraphs are single lines (no soft-wrap inside a phrase).
- Stage only intended files; never `git add -A` or `git add .`.

The commit preview format and approval flow live in `task-workflow.md`. The orchestrator gate is: never execute `git commit` without an approved preview and a passing staged scan.

### 4.4 PR preview and creation

Use the `create-pr` skill for both the preview format and the PR creation command sequence. The orchestrator gate is: do not open a PR on a failed push or failed check. The PR must include the archived OpenSpec change; if archive completion cannot be verified, stop before PR creation.

## 5. Guardrails

- Never auto-reset, force-push, or delete branches.
- Never bypass the security gate on CRITICAL findings; HIGH requires an explicit override.
- Never archive without synchronizing all delta specs into canonical specs.
- Never commit before the OpenSpec change has been archived and post-archive CVE reports pass.
- Never assume a package manager, test runner, or remote provider.
- Never surrender lifecycle ownership to a specialist skill after `create-task` has been explicitly invoked.
- Never treat specialist completion as permission to skip verification, archive, security, commit, push, or PR phases.
- Never open a PR on a failed push or failed check.
- Never stash existing commits; only stash working-tree changes.
