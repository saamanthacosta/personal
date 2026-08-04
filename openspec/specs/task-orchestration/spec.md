---
tags:
  - capability/task-orchestration
---

# task-orchestration Specification

## Purpose
The workspace provides a `create-task` skill that orchestrates end-to-end delivery of feature, fix, refactor, chore, docs, test, and perf changes from natural-language description to merged pull request. The orchestrator retains lifecycle ownership across specialist phases, resumes from the earliest incomplete phase, and never surrenders authority to a specialist.
## Requirements
### Requirement: A single skill orchestrates implementation tasks
The workspace SHALL provide a `create-task` skill that accepts a natural-language task, classifies its type, derives a kebab-case slug, and drives a resumable workflow for features, fixes, refactors, chores, documentation, tests, and performance work. When the user explicitly invokes `create-task`, it SHALL retain ownership of the lifecycle until completion or an explicit pause, even when the task subject matches a specialist skill.

#### Scenario: Feature request is classified
- **WHEN** the user requests a new feature without an explicit branch name
- **THEN** the workflow identifies the task as a feature, proposes a slug, and maps it to a `feat/<slug>` branch after confirmation

#### Scenario: Fix request is classified
- **WHEN** the user describes a bug or corrective change
- **THEN** the workflow identifies the task as a fix and maps it to a `fix/<slug>` branch after confirmation

#### Scenario: Ambiguous task pauses
- **WHEN** the task type, target repository, or slug cannot be determined safely
- **THEN** the workflow asks for clarification before changing repository state

#### Scenario: Task subject matches a specialist skill
- **WHEN** the user explicitly invokes `create-task` to create or modify a reusable skill
- **THEN** `create-task` retains lifecycle ownership and treats skill-authoring guidance as a bounded phase rather than ending the task after authoring

### Requirement: Workflow progress is resumable
The workflow SHALL inspect OpenSpec artifacts, task status, Git state, prior phase results, and any existing session log under `docs/skill-sessions/` before starting a phase, and SHALL resume from the earliest incomplete phase without repeating completed destructive actions.

#### Scenario: Apply resumes an existing change
- **WHEN** an active OpenSpec change has completed proposal artifacts and partially completed tasks
- **THEN** the workflow skips completed proposal work and resumes the remaining apply tasks after preflight validation, and continues writing to the existing session log

#### Scenario: Completed delivery is not repeated
- **WHEN** the current branch already has an upstream and an existing PR
- **THEN** the workflow reports the existing PR and does not create a duplicate

### Requirement: Specialist guidance returns control to the orchestrator
When `create-task` uses another skill's methodology, the specialist phase MUST return control to the next incomplete `create-task` phase and MUST NOT redefine specialist completion as completion of the full task.

#### Scenario: Skill authoring phase completes
- **WHEN** `skill-authoring` finishes drafting or updating and validating a `SKILL.md` within an active `create-task` workflow
- **THEN** the workflow continues with task verification, archive, security reporting, commit, push, and PR phases as applicable

#### Scenario: Specialist phase requires clarification
- **WHEN** a specialist methodology reaches a material ambiguity inside an active `create-task` workflow
- **THEN** the workflow pauses for that clarification while preserving `create-task` as the owner and resumes from the same phase afterward

### Requirement: Workflow describes the lifecycle span
The `create-task` skill's documented Purpose SHALL describe the full lifecycle span from natural-language description to merged pull request, covering feature, fix, refactor, chore, docs, test, and perf changes.

#### Scenario: Purpose specifies the full lifecycle span
- **WHEN** a reader reaches the `task-orchestration` spec's `## Purpose` section
- **THEN** the Purpose text names the lifecycle span from natural-language description to merged pull request

#### Scenario: Purpose names the orchestrator ownership rule
- **WHEN** a reader reaches the `task-orchestration` spec's `## Purpose` section
- **THEN** the Purpose text states that the orchestrator retains lifecycle ownership and never surrenders authority to a specialist

### Requirement: Skill exposes a structured snapshot helper for resume detection
The `create-task` orchestrator SHALL provide a `scripts/phase-status.mjs` helper that emits a JSON snapshot of the current git branch, porcelain status, upstream tracking, divergence from the upstream, openspec active changes, and any existing PR for the current branch. The orchestrator SHALL use this helper (or an equivalent direct invocation of the same commands) for resume detection before any phase that mutates repository state.

#### Scenario: phase-status emits JSON to stdout
- **WHEN** a user runs `node scripts/phase-status.mjs` from the repository root inside a git working tree
- **THEN** it writes a single JSON object to stdout containing `git`, `openspec`, and `pr` sections
- **AND** the JSON is parseable by standard tools (`jq`, `JSON.parse`)

#### Scenario: phase-status supports --pretty and --phase filters
- **WHEN** a user runs `node scripts/phase-status.mjs --pretty --phase openspec`
- **THEN** the output is pretty-printed JSON containing only the `openspec` section
- **AND** the helper exits 0 on success, 2 on usage errors, 3 when not in a git working tree, and 4 when openspec or gh is missing (with a partial snapshot still emitted)

#### Scenario: phase-status is non-interactive and idempotent
- **WHEN** a user runs `node scripts/phase-status.mjs` twice in succession
- **THEN** both invocations emit the same JSON content (modulo `generated_at` timestamp)
- **AND** neither invocation writes any files, opens any network connections beyond what `git`/`openspec`/`gh` already do, or prompts the user

### Requirement: Skill validates type/slug/branch input before branch creation
The `create-task` orchestrator SHALL provide a `scripts/slug-check.mjs` helper that validates a `(type, slug)` pair or a `--branch <name>` against the §1.1 type table and the §1.2 slug rules. The orchestrator SHALL run the helper (or an equivalent check) before any `git checkout -b` to catch malformed input before mutating repository state.

#### Scenario: slug-check accepts a valid type+slug
- **WHEN** a user runs `node scripts/slug-check.mjs feature csv-export`
- **THEN** it writes a JSON object to stdout with `type: "feature"`, `slug: "csv-export"`, and `branch: "feat/csv-export"`
- **AND** it exits 0

#### Scenario: slug-check rejects a malformed slug
- **WHEN** a user runs `node scripts/slug-check.mjs feature "CSV_Export"`
- **THEN** it writes an error to stderr explaining the rejected characters
- **AND** it exits 3

#### Scenario: slug-check maps short branch prefixes to long types
- **WHEN** a user runs `node scripts/slug-check.mjs --branch feat/csv-export`
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

## History

- [[../../changes/archive/2026-08-03-improve-create-task-skill/proposal|improve-create-task-skill (2026-08-03)]] — Adopt agentskills.io patterns: reorganize docs into references/, add bin/phase-status.mjs + bin/slug-check.mjs helpers, scaffold evals/, tighten description, add Gotchas section and progressive-disclosure indexes.
- [[../../changes/archive/2026-07-24-create-task-workflow/proposal|create-task-workflow (2026-07-24)]] — Implementation work currently depends on manually remembering several separate OpenSpec, Git, security, and PR steps.
- [[../../changes/archive/2026-07-25-slim-create-task-mechanics/proposal|slim-create-task-mechanics (2026-07-25)]] — Extract per-phase mechanics from create-task to docs/task-workflow.md; replace §4.1 inline CVE prompts with a pointer to docs/cve-methodology.md.

