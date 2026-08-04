## REMOVED Requirements

### Requirement: Skill-owned documentation
**Reason**: Replaced by the canonical three-folder layout defined in the `skill-folder-conventions` capability. The `references/` folder is the single home for skill-owned documentation.
**Migration**: Skill-owned docs are at `.agents/skills/<skill>/references/<name>.md` instead of `.agents/skills/<skill>/<name>.md` or `.agents/skills/<skill>/docs/<name>.md`.

### Requirement: Skill-owned helper scripts under bin/
**Reason**: Replaced by the canonical three-folder layout. Executable helpers now live under `scripts/` instead of `bin/`.
**Migration**: Skill-owned scripts are at `.agents/skills/<skill>/scripts/<file>` instead of `.agents/skills/<skill>/bin/<file>`. The repository still does not have a top-level `scripts/` directory; the layout moves one level deeper, not up.

## MODIFIED Requirements

### Requirement: Workspace-level docs stay in docs/
The repo-root `docs/` folder SHALL continue to host workspace-level docs that do not belong to a single skill. Skill-owned docs now live in `.agents/skills/<skill>/references/`; the `docs/README.md` index SHALL point to the skill-level references folder for skill-owned docs and to `docs/workspace.md` for workspace-level docs.

#### Scenario: workspace.md stays in docs/
- **WHEN** a user looks for the rules that govern `personal.code-workspace`
- **THEN** the doc is still at `docs/workspace.md`

#### Scenario: docs/README.md is an index
- **WHEN** `docs/README.md` is read
- **THEN** it points to `.agents/skills/<skill>/references/` for skill-owned docs and to `docs/workspace.md` for workspace-level docs, not to files that have moved into a skill folder

## ADDED Requirements

### Requirement: evals/evals.json moves to assets/evals.json
The triggering and expected-output evals for any skill that ships them SHALL live at `.agents/skills/<skill>/assets/evals.json`. The `evals/` subfolder SHALL NOT exist under any skill.

#### Scenario: create-task evals are under assets/
- **WHEN** the orchestrator references the eval fixtures
- **THEN** the path is `.agents/skills/create-task/assets/evals.json` and no `evals/` subfolder exists under `create-task/`

### Requirement: JSON schemas move to assets/
A skill that exposes a JSON Schema (for example, the `skill-sessions` event schema) SHALL place the schema at `.agents/skills/<skill>/assets/<name>.schema.json`. The `schema/` subfolder SHALL NOT exist under any skill.

#### Scenario: skill-sessions schema is in assets/
- **WHEN** tooling validates a session event against the schema
- **THEN** the schema path is `.agents/skills/skill-sessions/assets/skill-session-event.schema.json` and no `schema/` subfolder exists under `skill-sessions/`

### Requirement: Skill tests live under scripts/tests/
A skill that ships its own test files SHALL place them under `.agents/skills/<skill>/scripts/tests/`. The `tests/` subfolder SHALL NOT exist directly under a skill root.

#### Scenario: skill-sessions tests are under scripts/tests/
- **WHEN** the skill-sessions author runs the test suite
- **THEN** the test files are at `.agents/skills/skill-sessions/scripts/tests/*.mjs` and no `tests/` subfolder exists at the skill root

### Requirement: Canonical folder layout reference
The capability for the canonical three-folder model lives in the `skill-folder-conventions` spec. Any rule about the on-disk shape of a skill SHALL be sourced from that capability.

#### Scenario: New skill follows skill-folder-conventions
- **WHEN** a new skill is added to the library
- **THEN** its auxiliary files are placed under `scripts/`, `references/`, or `assets/`, per `skill-folder-conventions`
