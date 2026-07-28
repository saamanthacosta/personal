## Why

The current `create-task` workflow leaves two blind spots before archive: a self-review for shippable-as-a-unit quality, and security validation of the working tree. Today `pre-commit-review` doesn't exist, and `cve-report` runs *after* archive — meaning a known-broken delta can land in an archived OpenSpec change.

This change adds two gates in the pre-archive region of the workflow: a `pre-commit-review` blocker scan, and a `pre-archive` cve-report. Both block archive; both loop back to `apply` (or `propose` if the finding requires design/spec editing) on failure.

## What Changes

- Add a `pre-commit-review` phase to `create-task` between `apply → verify → pre-commit-review → cve-report → archive → commit → push → pr`.
- The phase classifies findings into **blocker** (loops back), **polish** (notes + continue), or **out-of-scope** (new change).
- Blockers loop back to `apply` by default, or `propose` if `design.md` / `specs/<cap>/spec.md` requires editing (heuristic). Loop-back narration appears inside the phase output: `looping back to <phase> — <one-line reason>`.
- The gate can be skipped at run-time via prompt with a written reason; the skip and any in-flight dismissal both land in the PR body.
- Move `cve-report` (full audit) from post-archive to pre-archive. Staged-commit and pre-PR scans stay where they are.
- If `pre-commit-review` finds a blocker, skip the cve-report (fail fast — the loop invalidates the diff anyway).
- If the pre-archive cve-report finds critical / unoverridden-high findings, loop back to `apply`.
- Extend `verify` to emit a coverage report when coverage tooling exists. `pre-commit-review` reads it but does not re-run coverage.
- Introduce `Personal/.agents/skills/create-task/BLOCKER-CHECKLIST.md` as the decision-support artifact for the gate (three-class taxonomy + loop-back heuristic + skip/dismiss template).

## Capabilities

### New Capabilities
None. The blocker-checklist artifact is a doc attached to the existing gate behavior, not a separate capability.

### Modified Capabilities
- `task-quality-gates`:
  - New requirement: a `pre-commit-review` phase runs after `verify` and before `cve-report`. It classifies findings into blocker / polish / out-of-scope; blockers loop back to the appropriate phase per the documented heuristic. Skip and dismissal are allowed at run time but both must record a reason in the PR body.
  - Modify existing requirement: the single full CVE audit moves from a post-archive gate to a pre-archive gate. The orchestrator only runs the audit if `pre-commit-review` did not already produce a blocker.
  - Modify existing requirement: `verify` is the mechanical evidence producer (tests, build, lint, types, and a coverage report when tooling exists). `pre-commit-review` interprets that evidence and applies judgment — the gate SHALL NOT re-check what `verify` already passed.

## Impact

- `Personal/.agents/skills/create-task/SKILL.md` — phase ordering diagram updated; §2.3 and §3.4 reworked; new §3.6 covering the gate.
- `Personal/.agents/skills/create-task/task-workflow.md` — new `Phase: pre-commit-review` section; updated `Phase: cve-report` description; updated pre-PR check to look for a pre-archive report.
- New file `Personal/.agents/skills/create-task/BLOCKER-CHECKLIST.md` — three-class taxonomy, loop-back heuristic, dismissal/skip template.
- `Personal/.agents/skills/cve-scan/SKILL.md` — audit phase label changes from `phase=post-archive` to `phase=pre-archive` (the report filename / location is unchanged to avoid churning external references; only the calling phase semantics shift).
- Any external automation that watched for the post-archive report to appear before commit must instead wait for the pre-archive report — net behaviour is the same, only the timing changes.
- No external API change. No new dependency. The user-facing surface gains one run-time prompt (gate skip) and one extra PR-body field (`Review gate: skipped|dismissed (reason)`).
- Behaviour change for callers of `task-quality-gates` who are not themselves using `create-task`: their audit no longer runs after archive. They should call the audit explicitly at the pre-archive point in their own pipeline.

## Security Considerations

This change is a documentation-only refactor of the `create-task` orchestrator. It introduces no new code, dependencies, or data flows.

- **Data touched**: none.
- **Trust boundaries crossed**: none — no new integrations; the only tool touched is `cve-scan`, and the `--phase=` flag value rename is purely a label (`pre-commit` → `pre-archive`). The underlying `full-audit.mjs` accepts arbitrary phase values (verified at `bin/full-audit.mjs:84`).
- **Third-party trust**: none beyond the existing `cve-scan` invocation.
- **Persistence layer**: unchanged. CVE reports continue to write under `docs/cve-reports/`.
- **Privilege surfaces**: none new.
- **Override requests**: none.

Residual risk: zero. The orchestrator's existing security posture is preserved; only the timing and label of one audit move.
