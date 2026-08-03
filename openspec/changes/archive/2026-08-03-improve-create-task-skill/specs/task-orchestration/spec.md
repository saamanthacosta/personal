# task-orchestration delta spec

## ADDED Requirements

### Requirement: Skill exposes a structured snapshot helper for resume detection
The `create-task` orchestrator SHALL provide a `bin/phase-status.mjs` helper that emits a JSON snapshot of the current git branch, porcelain status, upstream tracking, divergence from the upstream, openspec active changes, and any existing PR for the current branch. The orchestrator SHALL use this helper (or an equivalent direct invocation of the same commands) for resume detection before any phase that mutates repository state.

#### Scenario: phase-status emits JSON to stdout
- **WHEN** a user runs `node bin/phase-status.mjs` from the repository root inside a git working tree
- **THEN** it writes a single JSON object to stdout containing `git`, `openspec`, and `pr` sections
- **AND** the JSON is parseable by standard tools (`jq`, `JSON.parse`)

#### Scenario: phase-status supports --pretty and --phase filters
- **WHEN** a user runs `node bin/phase-status.mjs --pretty --phase openspec`
- **THEN** the output is pretty-printed JSON containing only the `openspec` section
- **AND** the helper exits 0 on success, 2 on usage errors, 3 when not in a git working tree, and 4 when openspec or gh is missing (with a partial snapshot still emitted)

#### Scenario: phase-status is non-interactive and idempotent
- **WHEN** a user runs `node bin/phase-status.mjs` twice in succession
- **THEN** both invocations emit the same JSON content (modulo `generated_at` timestamp)
- **AND** neither invocation writes any files, opens any network connections beyond what `git`/`openspec`/`gh` already do, or prompts the user

### Requirement: Skill validates type/slug/branch input before branch creation
The `create-task` orchestrator SHALL provide a `bin/slug-check.mjs` helper that validates a `(type, slug)` pair or a `--branch <name>` against the §1.1 type table and the §1.2 slug rules. The orchestrator SHALL run the helper (or an equivalent check) before any `git checkout -b` to catch malformed input before mutating repository state.

#### Scenario: slug-check accepts a valid type+slug
- **WHEN** a user runs `node bin/slug-check.mjs feature csv-export`
- **THEN** it writes a JSON object to stdout with `type: "feature"`, `slug: "csv-export"`, and `branch: "feat/csv-export"`
- **AND** it exits 0

#### Scenario: slug-check rejects a malformed slug
- **WHEN** a user runs `node bin/slug-check.mjs feature "CSV_Export"`
- **THEN** it writes an error to stderr explaining the rejected characters
- **AND** it exits 3

#### Scenario: slug-check maps short branch prefixes to long types
- **WHEN** a user runs `node bin/slug-check.mjs --branch feat/csv-export`
- **THEN** it writes a JSON object with `prefix: "feat"`, `type: "feature"`, and `slug: "csv-export"`
- **AND** it exits 0

### Requirement: Skill documents non-obvious facts in a Gotchas section
The `create-task` SKILL.md SHALL include a `## Gotchas` section enumerating non-obvious facts the orchestrator will get wrong without being told, including the full-audit phase label, the skip-on-blocker rule, the prefix/type mapping, and the rule that specialist completion does not constitute task completion.

#### Scenario: Gotchas section is present in SKILL.md
- **WHEN** a reader opens the create-task SKILL.md
- **THEN** it contains a section whose header text matches `## Gotchas` (case-insensitive, whitespace-insensitive)
- **AND** the section enumerates at least five distinct facts as bullet items

#### Scenario: Gotchas section names the full-audit phase label
- **WHEN** a reader scans the Gotchas section for the full-audit phase label
- **THEN** it appears verbatim as `pre-archive` (not `pre-commit`)