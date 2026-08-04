# skill-doc-organization Specification

## Purpose
Skill-owned docs, scripts, tests, and data inputs live in the same folder as the skill's `SKILL.md`, organised by the canonical three-folder model in the `skill-folder-conventions` capability.
## Requirements
### Requirement: Workspace-level docs stay in docs/
The repo-root `docs/` folder SHALL continue to host workspace-level docs that do not belong to a single skill. Skill-owned docs now live in `.agents/skills/<skill>/references/`; the `docs/README.md` index SHALL point to the skill-level references folder for skill-owned docs and to `docs/workspace.md` for workspace-level docs.

#### Scenario: workspace.md stays in docs/
- **WHEN** a user looks for the rules that govern `personal.code-workspace`
- **THEN** the doc is still at `docs/workspace.md`

#### Scenario: docs/README.md is an index
- **WHEN** `docs/README.md` is read
- **THEN** it points to `.agents/skills/<skill>/references/` for skill-owned docs and to `docs/workspace.md` for workspace-level docs, not to files that have moved into a skill folder

### Requirement: Skills library entry-point README
The root `.agents/skills/` folder SHALL contain a `README.md` that explains the layout and naming rules for the skill library. The README SHALL replace the old `docs/skills-folder.md`.

#### Scenario: README is at the library root
- **WHEN** a user opens `.agents/skills/README.md`
- **THEN** it describes the rules that the workspace enforces for shared skill definitions

#### Scenario: Old skills-folder.md is gone
- **WHEN** the repository is searched for `docs/skills-folder.md`
- **THEN** no such path exists; the content lives at `.agents/skills/README.md`

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

### Requirement: No stale legacy-path references outside this change's archive
After the relocation, no tracked file in the repository outside this change's archive SHALL reference the legacy paths `.agents/skills/<name>/bin/`, `.agents/skills/<name>/docs/`, `.agents/skills/<name>/schema/`, `.agents/skills/<name>/tests/`, or `.agents/skills/<name>/evals/`. (The canonical three-folder model is defined in the `skill-folder-conventions` capability; this requirement is the grep gate that enforces it.)

#### Scenario: Grep finds no stale legacy path outside the archive
- **WHEN** the repository is searched for any of the five legacy subfolder names under `.agents/skills/`, excluding this change's own archive folder
- **THEN** zero matches appear

## History

- [[../changes/archive/2026-08-04-skill-folder-conventions/proposal|skill-folder-conventions (2026-08-04)]] — Replace the `bin/` + loose-file allowances with the canonical three-folder model (`scripts/`, `references/`, `assets/`).
- [[../changes/archive/2026-07-25-relocate-skill-docs/proposal|relocate-skill-docs (2026-07-25)]] — Move skill-specific docs and scripts into their owning skill folders so each skill is self-contained.
