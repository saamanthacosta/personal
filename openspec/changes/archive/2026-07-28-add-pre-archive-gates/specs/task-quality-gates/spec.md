## ADDED Requirements

### Requirement: Pre-commit-review runs as a pre-archive gate

The workflow SHALL run a `pre-commit-review` phase after `verify` and before the pre-archive `cve-report` phase. This phase SHALL classify every finding into one of three categories: **blocker**, **polish**, or **out-of-scope**.

#### Scenario: Blocker loops back with a narrated reason

- **WHEN** the gate classifies a finding as a blocker
- **THEN** the workflow records the loop-back target (`apply` by default; `propose` if `design.md` or `specs/<cap>/spec.md` requires editing), narrates `looping back to <phase> — <one-line reason citing the blocker class and concrete finding>` inside the phase output, and routes to the chosen target

#### Scenario: Polish is noted and the workflow continues

- **WHEN** the gate classifies a finding as polish
- **THEN** the workflow records the finding for inclusion in the PR body and proceeds to the pre-archive `cve-report` without looping back

#### Scenario: Out-of-scope becomes a new change

- **WHEN** the gate classifies a finding as out-of-scope
- **THEN** the workflow stops and asks the user to propose a new OpenSpec change for the finding before continuing

#### Scenario: User skips the gate at run-time

- **WHEN** the user confirms `skip pre-commit-review` at the run-time prompt and supplies a written reason
- **THEN** the workflow records `Review gate: skipped (reason)` in the PR body and proceeds to the pre-archive `cve-report`

#### Scenario: User dismisses a loop-back

- **WHEN** the gate has produced a loop-back narration and the user confirms `proceed anyway` with a written reason
- **THEN** the workflow records `Review gate: dismissed by user (reason)` in the PR body and proceeds to the pre-archive `cve-report`

### Requirement: Verify emits a coverage report for the gate to read

The verify phase SHALL emit a coverage report when coverage tooling is available for the target repository. The `pre-commit-review` phase SHALL read but SHALL NOT re-run coverage.

#### Scenario: Coverage tooling is declared

- **WHEN** the target repository declares coverage tooling (for example, an `npm` script, a `Makefile` target, or a `.nycrc` / `coverage.py` / equivalent config)
- **THEN** the verify phase runs coverage tooling in addition to the existing correctness checks and the resulting report is available to the gate

#### Scenario: No coverage tooling exists

- **WHEN** the target repository has no declared coverage tooling
- **THEN** the verify phase records the check as unavailable and the gate proceeds without coverage evidence

### Requirement: A pre-commit-review blocker skips the pre-archive cve-report

The workflow SHALL NOT run the pre-archive `cve-report` when `pre-commit-review` has produced a blocker in the same pass.

#### Scenario: Blocker found this pass

- **WHEN** the `pre-commit-review` phase classifies a finding as a blocker
- **THEN** the workflow routes the loop-back to `apply` (or `propose`) and skips the `cve-report` for this pass; the next pass through the gate after the loop-back resolves the blocker still hits both gates in order

## MODIFIED Requirements

### Requirement: OpenSpec and security gates run in order

The workflow SHALL apply the OpenSpec `explore`, `propose`, `apply`, `verify`, `pre-commit-review`, and `archive` phases, and SHALL invoke the CVE methodology at `explore`, `pre-archive`, `staged-commit`, and `pre-PR` checkpoints. The full CVE audit runs exactly once per change, at the pre-archive gate; the staged-commit gate runs the staged-pattern scan; the pre-PR gate confirms the pre-archive report is current.

#### Scenario: Explore records security context

- **WHEN** a new task enters exploration
- **THEN** the workflow prompts for data touched, trust boundaries, third-party trust, persistence, and privilege-escalation surface

#### Scenario: Proposal lacks security considerations

- **WHEN** the proposal or design is missing the required security section
- **THEN** the proposal gate reports a blocking finding and prevents application until corrected or explicitly handled by the methodology

#### Scenario: Pre-archive scan is the single full audit

- **WHEN** the workflow reaches the `pre-commit-review` phase after `apply` and `verify`, and `pre-commit-review` did not produce a blocker
- **THEN** the workflow runs `node .agents/skills/cve-scan/bin/full-audit.mjs --change <change-path> --phase=pre-archive --scope=<name>` exactly once and produces the only full-audit report for the change under `docs/cve-reports/`

#### Scenario: Apply has no full audit call site

- **WHEN** the orchestrator reaches the `apply` phase
- **THEN** the workflow does NOT call `full-audit.mjs --phase=apply`; the next CVE checkpoint is the pre-archive gate

#### Scenario: Staged-commit scan blocks

- **WHEN** the staged diff contains a CRITICAL or unoverridden HIGH finding from the staged-pattern scan
- **THEN** the workflow does not create the commit and reports the finding

#### Scenario: Pre-PR readiness checks the pre-archive report

- **WHEN** the workflow reaches the pre-PR gate
- **THEN** the workflow confirms the pre-archive report exists, names the change scope, is current, has no blocking findings, and is included in the intended commit

#### Scenario: Pre-archive cve-report loops back on critical findings

- **WHEN** the pre-archive `cve-report` produces a CRITICAL or unoverridden HIGH finding
- **THEN** the workflow loops back to `apply` (or `propose` if the finding requires design or spec edits) and does not proceed to archive
