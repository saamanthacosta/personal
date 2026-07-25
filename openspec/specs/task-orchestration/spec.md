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
The workflow SHALL inspect OpenSpec artifacts, task status, Git state, and prior phase results before starting a phase, and SHALL resume from the earliest incomplete phase without repeating completed destructive actions.

#### Scenario: Apply resumes an existing change
- **WHEN** an active OpenSpec change has completed proposal artifacts and partially completed tasks
- **THEN** the workflow skips completed proposal work and resumes the remaining apply tasks after preflight validation

#### Scenario: Completed delivery is not repeated
- **WHEN** the current branch already has an upstream and an existing PR
- **THEN** the workflow reports the existing PR and does not create a duplicate

### Requirement: Specialist guidance returns control to the orchestrator
When `create-task` uses another skill's methodology, the specialist phase MUST return control to the next incomplete `create-task` phase and MUST NOT redefine specialist completion as completion of the full task.

#### Scenario: Skill authoring phase completes
- **WHEN** `create-skill` finishes drafting and validating a `SKILL.md` within an active `create-task` workflow
- **THEN** the workflow continues with task verification, archive, security reporting, commit, push, and PR phases as applicable

#### Scenario: Specialist phase requires clarification
- **WHEN** a specialist methodology reaches a material ambiguity inside an active `create-task` workflow
- **THEN** the workflow pauses for that clarification while preserving `create-task` as the owner and resumes from the same phase afterward

## History

- [[../../changes/archive/2026-07-24-create-task-workflow/proposal|create-task-workflow (2026-07-24)]] — Implementation work currently depends on manually remembering several separate OpenSpec, Git, security, and PR steps.

