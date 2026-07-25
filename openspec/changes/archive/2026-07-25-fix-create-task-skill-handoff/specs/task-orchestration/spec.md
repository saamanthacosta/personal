## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Specialist guidance returns control to the orchestrator
When `create-task` uses another skill's methodology, the specialist phase MUST return control to the next incomplete `create-task` phase and MUST NOT redefine specialist completion as completion of the full task.

#### Scenario: Skill authoring phase completes
- **WHEN** `create-skill` finishes drafting and validating a `SKILL.md` within an active `create-task` workflow
- **THEN** the workflow continues with task verification, archive, security reporting, commit, push, and PR phases as applicable

#### Scenario: Specialist phase requires clarification
- **WHEN** a specialist methodology reaches a material ambiguity inside an active `create-task` workflow
- **THEN** the workflow pauses for that clarification while preserving `create-task` as the owner and resumes from the same phase afterward
