# task-orchestration Delta — Specialist Skill Recognition

## ADDED Requirements

### Requirement: Specialist skill recognition

The `create-task` orchestrator SHALL recognise named specialist skills and load each as a bounded phase during `apply` per its trigger condition. The current named specialists are:

- `skill-authoring` — load when the task creates, modifies, or restructures a reusable skill (per §5 gotcha and the existing `Skill authoring phase completes` scenario in `### Requirement: Specialist guidance returns control to the orchestrator`).
- `building-components` — load when the task builds, modifies, or reviews UI components (accessibility, composition, design tokens, component primitives, or any component-level decision where a11y, composability, or theming methodology applies).

Recognition is documented in the orchestrator's `SKILL.md` and is the source of truth for which specialists the orchestrator knows about. The orchestrator does not auto-discover specialists from the `.agents/skills/` folder — it loads only the specialists explicitly listed in its SKILL.md. New specialists are added by extending the recognition table, not by scanning the folder.

#### Scenario: Building a new UI component loads building-components

- **WHEN** the user asks to add, refactor, or fix a UI component (button, input, dropdown, modal, accordion, or any domain component where accessibility or composition patterns apply) and explicitly invokes `create-task` (or the orchestrator loads per its description triggers)
- **THEN** the orchestrator's `apply` phase loads `building-components` as bounded methodology guidance
- **AND** the orchestrator continues to own the lifecycle; specialist completion is not task completion

#### Scenario: Modifying an existing skill loads skill-authoring

- **WHEN** the user asks to create, modify, fix, or restructure a reusable skill and the orchestrator classifies the task as `chore`, `fix`, `refactor`, or `docs` (per §1.1 task-type classification)
- **THEN** the orchestrator's `apply` phase loads `skill-authoring` as bounded methodology guidance
- **AND** the orchestrator continues to own the lifecycle; specialist completion is not task completion
