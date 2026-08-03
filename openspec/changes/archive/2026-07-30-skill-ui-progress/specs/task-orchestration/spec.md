## MODIFIED Requirements

### Requirement: Workflow progress is resumable
The workflow SHALL inspect OpenSpec artifacts, task status, Git state, prior phase results, and any existing session log under `docs/skill-sessions/` before starting a phase, and SHALL resume from the earliest incomplete phase without repeating completed destructive actions.

#### Scenario: Apply resumes an existing change
- **WHEN** an active OpenSpec change has completed proposal artifacts and partially completed tasks
- **THEN** the workflow skips completed proposal work and resumes the remaining apply tasks after preflight validation, and continues writing to the existing session log

#### Scenario: Completed delivery is not repeated
- **WHEN** the current branch already has an upstream and an existing PR
- **THEN** the workflow reports the existing PR and does not create a duplicate