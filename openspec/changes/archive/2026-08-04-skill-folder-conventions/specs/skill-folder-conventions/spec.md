## ADDED Requirements

### Requirement: Canonical three-folder layout
Every shared skill in `.agents/skills/<name>/` SHALL organise its auxiliary files into at most the three subfolders recognised by the Agent Skills specification: `scripts/`, `references/`, and `assets/`. A skill with no auxiliary files SHALL contain only `SKILL.md`. A skill SHALL NOT introduce any other subfolder.

#### Scenario: Skill has no auxiliary files
- **WHEN** a skill such as `apply-github-ruleset` carries only `SKILL.md`
- **THEN** no subfolders exist under `.agents/skills/apply-github-ruleset/`

#### Scenario: Skill uses the three subfolders
- **WHEN** a skill needs helpers, docs, and data
- **THEN** its folder contains `scripts/`, `references/`, and `assets/` and no other subfolder

#### Scenario: Skill does not introduce non-canonical subfolders
- **WHEN** validation enumerates a skill's subfolders
- **THEN** every subfolder is one of `scripts/`, `references/`, or `assets/`

### Requirement: scripts/ holds executable helpers
A skill's `scripts/` folder SHALL contain the executable code the skill body or an external workflow invokes at runtime, including any test files the skill author runs against those helpers. Executable code SHALL NOT live in any other folder.

#### Scenario: Helper script is in scripts/
- **WHEN** the commit skill exposes `verify-commit.py`
- **THEN** the file is at `.agents/skills/commit/scripts/verify-commit.py`

#### Scenario: Test files live under scripts/tests/
- **WHEN** a skill has its own tests, such as `skill-sessions`
- **THEN** the test files are at `.agents/skills/<skill>/scripts/tests/*.mjs` and no top-level `tests/` folder exists

#### Scenario: No bin/ folder remains
- **WHEN** the repository is enumerated after the migration
- **THEN** no `.agents/skills/<name>/bin/` directory exists

### Requirement: references/ holds skill-owned documentation
A skill's `references/` folder SHALL contain long-form Markdown the body links to for context, decision detail, or methodology. Skill-owned documentation SHALL NOT live in a `docs/`, `docs/`, or top-level folder next to the skill.

#### Scenario: Reference doc lives in references/
- **WHEN** `create-task` references `task-workflow.md`
- **THEN** the file is at `.agents/skills/create-task/references/task-workflow.md`

#### Scenario: Schema prose is in references/
- **WHEN** `skill-sessions` documents its event stream
- **THEN** the prose spec is at `.agents/skills/skill-sessions/references/skill-session-schema.md`

#### Scenario: No skill-owned doc in repo-root docs/
- **WHEN** the repo-root `docs/` folder is enumerated
- **THEN** it does not contain files that belong to a single skill (such as `commit-style.md`, `pr-style.md`, `cve-methodology.md`, `obsidian.md`, `task-workflow.md`, `BLOCKER-CHECKLIST.md`)

### Requirement: assets/ holds static data inputs
A skill's `assets/` folder SHALL contain static data files the body or scripts read but do not execute — JSON catalogs, JSON schemas, eval fixtures, and other machine-readable inputs. Data files SHALL NOT live in `scripts/`, `references/`, or any other subfolder.

#### Scenario: Pattern catalog lives in assets/
- **WHEN** a skill such as `code-hygiene` ships a JSON pattern catalog
- **THEN** the file is at `.agents/skills/<skill>/assets/patterns.json`

#### Scenario: JSON schema lives in assets/
- **WHEN** `skill-sessions` exposes its event-stream schema
- **THEN** the JSON schema is at `.agents/skills/skill-sessions/assets/skill-session-event.schema.json`

#### Scenario: Eval fixtures live in assets/
- **WHEN** `create-task` exposes triggering and expected-output evals
- **THEN** the file is at `.agents/skills/create-task/assets/evals.json`

### Requirement: SKILL.md references use the new paths
Every `SKILL.md` body SHALL reference a relocated file by its new path under the same skill's `scripts/`, `references/`, or `assets/` folder. Cross-skill references SHALL keep their original `bin/`, `docs/`, or other legacy paths only when that path still exists.

#### Scenario: Body references the new scripts/ path
- **WHEN** `create-task` invokes `node .agents/skills/cve-scan/scripts/full-audit.mjs`
- **THEN** the call site in `create-task/SKILL.md` matches the new path

#### Scenario: Body references the new references/ path
- **WHEN** `create-task` loads `references/task-workflow.md`
- **THEN** the call site does not use a `docs/` or top-level path

### Requirement: Legacy subfolders are removed after the migration
After the change lands, no `.agents/skills/<name>/` directory SHALL contain a `bin/`, `docs/`, `schema/`, `tests/`, or `evals/` subfolder, and no tracked file outside the change's archive SHALL reference the old paths `bin/<file>`, `docs/<file>`, `schema/<file>`, `tests/<file>`, or `evals/<file>`.

#### Scenario: No legacy subfolder under any skill
- **WHEN** the repository is enumerated for `.agents/skills/<name>/{bin,docs,schema,tests,evals}`
- **THEN** zero directories match

#### Scenario: Repo-wide grep finds no stale references
- **WHEN** the repository is searched for the legacy folder names outside the change's archive
- **THEN** zero matches appear in tracked files
