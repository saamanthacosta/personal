# task-orchestration delta spec

## ADDED Requirements

### Requirement: Workflow describes the lifecycle span
The `create-task` skill's documented Purpose SHALL describe the full lifecycle span from natural-language description to merged pull request, covering feature, fix, refactor, chore, docs, test, and perf changes.

#### Scenario: Purpose specifies the full lifecycle span
- **WHEN** a reader reaches the `task-orchestration` spec's `## Purpose` section
- **THEN** the Purpose text names the lifecycle span from natural-language description to merged pull request

#### Scenario: Purpose names the orchestrator ownership rule
- **WHEN** a reader reaches the `task-orchestration` spec's `## Purpose` section
- **THEN** the Purpose text states that the orchestrator retains lifecycle ownership and never surrenders authority to a specialist
