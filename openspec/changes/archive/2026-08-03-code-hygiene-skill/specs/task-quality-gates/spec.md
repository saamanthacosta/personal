# task-quality-gates Specification — code-hygiene Delta

## ADDED Requirements

### Requirement: Code hygiene gate runs between pre-commit-review and the pre-archive cve-report

The workflow SHALL invoke `node .agents/skills/code-hygiene/bin/scan.mjs --check` as a pre-archive quality gate, after `pre-commit-review` produces no blocker and before the pre-archive `cve-report` runs. The gate SHALL be `info`-severity by default and SHALL NOT block the commit on `info`-severity findings; operators MAY escalate to `warn` or `blocker` via `.code-hygiene.json` or the `--severity` CLI flag.

#### Scenario: Gate runs after pre-commit-review passes

- **WHEN** the `pre-commit-review` phase classifies no blocker
- **THEN** the workflow invokes `node .agents/skills/code-hygiene/bin/scan.mjs --check` and prints the new-findings report to stdout

#### Scenario: Gate is skipped when pre-commit-review blocks

- **WHEN** the `pre-commit-review` phase classifies a blocker on this pass
- **THEN** the workflow loops back without invoking the code-hygiene gate, matching the existing skip-on-blocker semantics for the pre-archive `cve-report`

#### Scenario: Gate exit codes are interpreted

- **WHEN** the gate exits `0` (no new findings)
- **THEN** the workflow proceeds to the pre-archive `cve-report`

- **WHEN** the gate exits `1` (new findings exist, default severity)
- **THEN** the workflow prints the findings to stdout, records them in the verification notes, and proceeds to the pre-archive `cve-report` (the gate is non-blocking at default severity)

- **WHEN** the gate exits `2` (scanner error)
- **THEN** the workflow pauses and surfaces the scanner error to the operator before proceeding

#### Scenario: Operator can skip the gate at run-time

- **WHEN** the operator confirms `skip code-hygiene gate` at the run-time prompt and supplies a written reason
- **THEN** the workflow records `Code hygiene gate: skipped (reason)` in the PR body and proceeds to the pre-archive `cve-report`

### Requirement: code-hygiene report is append-only and idempotent

The workflow SHALL treat `docs/code-hygiene.md` as the single source of truth for code-hygiene findings. The runner SHALL be idempotent on re-invocation: re-runs SHALL NOT re-emit findings already present in the report (matched by deterministic dedup keys) and SHALL append only new findings when `--apply` is used.

#### Scenario: Re-run with no new findings exits 0

- **WHEN** the gate runs `node .agents/skills/code-hygiene/bin/scan.mjs --check` and the working tree has no new findings since the last `--apply` run
- **THEN** the gate exits `0` and `docs/code-hygiene.md` is not modified

#### Scenario: Re-run with new findings exits 1

- **WHEN** the gate runs `--check` and the working tree has new findings
- **THEN** the gate exits `1`, prints the new findings to stdout, and `docs/code-hygiene.md` is not modified (only `--apply` mutates)

#### Scenario: --apply appends to the report

- **WHEN** the operator runs `node .agents/skills/code-hygiene/bin/scan.mjs --apply` after reviewing the `--check` output
- **THEN** the runner appends a fenced entry per new finding to `docs/code-hygiene.md` and updates the YAML frontmatter (`last_run_at`, `total_open`, severity counts)

#### Scenario: Dedup keys are deterministic

- **WHEN** the same finding is scanned on multiple runs without code changes
- **THEN** the dedup key (`sha1(pattern || path:line || snippet_norm)`) matches across runs and the finding is not duplicated
