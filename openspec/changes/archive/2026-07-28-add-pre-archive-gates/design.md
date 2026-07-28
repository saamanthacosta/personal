## Context

The `create-task` skill orchestrates the end-to-end workflow from natural-language description to merged PR. Its current spine is `preflight → explore → propose → apply → verify → archive → cve-report → commit → push → pr`. Two gaps are known:

1. **No shippable-as-a-unit gate between `apply` and `archive`.** Mechanical checks live in `verify`, but the *judgment* checks (scope containment, contract drift vs spec, missing migrations, swallow-and-continue patterns, design.md alignment) are remembered ad-hoc by the implementer.
2. **CVE audit runs after `archive`.** The single full audit happens *after* the OpenSpec change has been moved to `archive/`. A regression caught at that point requires un-archive-and-fix awkwardness, or following up with a brand-new change.

A `BACKLOG.md` entry captured both gaps as `[POLICY]` items during the design conversation that produced this change. Decision 6 in that doc records the verdict to combine both into one OpenSpec change.

## Goals / Non-Goals

**Goals:**

- Introduce `pre-commit-review` as a phase between `verify` and `cve-report`.
- Move the single full CVE audit from post-archive to pre-archive.
- Both gates honor a loop-back contract: blockers return to `apply` (or `propose` if design-level) with a one-line narrated reason.
- Preserve the existing staged-commit and pre-PR scans.
- Keep the user-facing surface small: one run-time prompt (skip) and one extra PR-body field.

**Non-Goals:**

- Creating a new top-level OpenSpec capability — the gate belongs inside `task-quality-gates`, which already owns gate ordering.
- Adding a `pre-commit-review` skill folder — the gate is intrinsic to `create-task`, not user-invoked.
- Changing the staged-commit or pre-PR scan mechanics.
- Changing any external API or tool surface beyond the audit phase label.
- Resolving the diff-coverage tolerance threshold in this change (TBD-in-impl; captured in `BLOCKER-CHECKLIST.md`).

## Decisions

### D1 — Phase ordering

`apply → verify → pre-commit-review → cve-report → archive → commit → push → pr`. Both new gates share the pre-archive region. Either failing loops back to `apply` (or `propose`), keeping the spine linear on the happy path.

Alternatives considered:

- *Run pre-commit-review after cve-report.* Rejected — CVE is more about security than shippability; running it first when a blocker is likely means wasted scan cost.
- *Run pre-commit-review inside `verify`.* Rejected — `verify` is mechanical; mixing in judgment confuses the two roles and makes coverage-report ownership ambiguous.

### D2 — Verify emits coverage; gate interprets

Coverage tools run inside `verify` (a mechanical phase) when they exist. The gate reads the report — it does not run coverage itself. This keeps `verify` source-agnostic across repos and prevents the gate from duplicating CI work.

Alternatives considered:

- *Gate runs its own coverage tool.* Rejected — duplicates CI cost.
- *No coverage involvement in the gate.* Rejected — leaves the "did we cover the new failure path?" question to memory.

### D3 — Loop-back target decided by *which artifact* needs to change

Propose-loop when `design.md` or `specs/<cap>/spec.md` needs editing; apply-loop otherwise. Heuristic, not hard rule, because most blockers are unambiguous and the ambiguous middle is surfaced via `question`.

### D4 — Single OpenSpec change covers both POLICY items

`pre-commit-review` and `cve-before-archive` are tightly coupled (same files, same spine region, same loop-back contract). Splitting would mean two PRs that touch identical lines. Decision 4 in `BACKLOG.md` notes this as an explicit exception.

### D5 — `BLOCKER-CHECKLIST.md` lives next to `create-task`, not as a skill

The classification is decision-support, not a user-invoked workflow. Inlining it as a checklist keeps it close to where it's used. Promote to skill only if specialist sub-agents become useful.

### D6 — Run-time prompt for skip, not a flag

Flags get set and forgotten; prompts stay close to the decision. The prompt fires at the gate execution (pre-archive), not at commit time — commit hasn't happened yet. The reason lands in the PR body as `Review gate: skipped (reason)`.

### D7 — Skip cve-report when pre-commit-review already found a blocker (fail fast)

The blocker loops back to `apply`, where the diff is about to be invalidated. Scanning an about-to-change tree wastes scan cost. The next pass through the gate after the fix still hits both gates in order.

## Risks / Trade-offs

- **Risk**: the gate may produce noisy blockers and slow down iteration.
  → **Mitigation**: the `BLOCKER-CHECKLIST.md` is a strict three-class list; ambiguous findings default to "polish" (note + continue) rather than "blocker". The run-time skip remains available.
- **Risk**: any external automation watching for the post-archive report breaks.
  → **Mitigation**: report file location and naming unchanged; the report appears earlier in the lifecycle, but downstream consumers expecting the file by commit time still find it. Documented in `cve-scan/SKILL.md` as a `phase` label change; the report delivery contract is the same.
- **Risk**: dismissals and skips create audit holes.
  → **Mitigation**: every skip or dismissal is a required-reason field that lands in the PR body — non-bypassable audit trail.
- **Risk**: gate UX friction in personal/experimental work.
  → **Mitigation**: the run-time prompt is a confirmation, not a hard requirement; the escape hatch is one keystroke + a reason.
- **Trade-off**: the loop-back narration string is a contract — diversifying the format per blocker class is tempting but rejected for the v1 of this gate. One canonical format keeps the audit grep-friendly.

## Migration Plan

1. Land `create-task/SKILL.md` and `task-workflow.md` changes together with the new `BLOCKER-CHECKLIST.md` in one PR.
2. Update `cve-scan/SKILL.md` phase label from `phase=post-archive` to `phase=pre-archive` in the same PR.
3. Archive `add-pre-archive-gates` so the new ordering becomes the canonical contract inside `task-quality-gates/spec.md`.
4. No external consumer migration is required — report files exist at the same path with the same naming; only the calling phase differs.

## Open Questions

- **Diff-coverage tolerance**: what counts as "coverage dropped on this diff" — 1%, 5%, 10%? Decide during impl; capture in `BLOCKER-CHECKLIST.md`. Not blocking this proposal.
- **Skip UX on first run**: do we ask for skip confirmation on every gate run, or only when a task type is `chore` / `docs`? Decide during impl.
- **Dismiss UX**: should the dismissal reason support a list of common reasons as quick-pick? Decide during impl.

## Security Considerations

This design is a documentation-only refactor of the `create-task` orchestrator. No new data, trust boundaries, dependencies, persistence layers, or privilege surfaces are introduced.

- **Data touched**: none.
- **Trust boundaries crossed**: none.
- **Third-party trust**: none beyond the existing `cve-scan` invocation. The `--phase=` flag value is renamed from `pre-commit` to `pre-archive`. The label change does not modify the underlying scan behaviour — `full-audit.mjs` accepts arbitrary phase values (verified at `bin/full-audit.mjs:84`).
- **Persistence layer**: unchanged. CVE reports continue to write under `docs/cve-reports/`.
- **Privilege surfaces**: unchanged.
- **Override requests**: none.

Residual risk: zero. The orchestrator's existing security posture is preserved; only the timing and label of one audit move within the workflow.
