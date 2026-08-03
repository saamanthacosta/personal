## ADDED Requirements

### Requirement: Skill-owned documentation
Each skill's backing documentation SHALL live in the same folder as the skill's `SKILL.md`, inside `.agents/skills/<skill-name>/`. A skill that references a doc SHALL reference it via a relative path inside its own folder; no `docs/` prefix is required for any skill-specific doc.

#### Scenario: Skill doc lives next to SKILL.md
- **WHEN** a skill such as `create-task` references a doc such as `task-workflow.md`
- **THEN** the doc is found at `.agents/skills/create-task/references/task-workflow.md`, not under `docs/`

#### Scenario: Skill doc reference is relative
- **WHEN** a skill `SKILL.md` mentions its backing doc
- **THEN** the reference is a path relative to the skill folder (e.g., `task-workflow.md`), not an absolute path like `docs/task-workflow.md`

### Requirement: Skill-owned helper scripts under bin/
Each skill's helper scripts SHALL live under `.agents/skills/<skill-name>/bin/`, matching the existing `cve-scan/bin/` layout. The repository root SHALL NOT carry a top-level `scripts/` directory.

#### Scenario: commit skill owns verify-commit.py
- **WHEN** a user looks for the commit-message verifier
- **THEN** the script is found at `.agents/skills/commit/bin/verify-commit.py`

#### Scenario: No top-level scripts directory
- **WHEN** the repository root is enumerated
- **THEN** there is no `scripts/` directory at the top level

### Requirement: Workspace-level docs stay in docs/
Workspace-level docs that do not belong to a single skill SHALL continue to live in `docs/` and SHALL appear in `docs/README.md` as the workspace-level index.

#### Scenario: workspace.md stays in docs/
- **WHEN** a user looks for the rules that govern `personal.code-workspace`
- **THEN** the doc is still at `docs/workspace.md`

#### Scenario: docs/README.md is an index
- **WHEN** `docs/README.md` is read
- **THEN** it points to the skill-level docs and to `docs/workspace.md`, not to files that have moved into a skill folder

### Requirement: Skills library entry-point README
The root `.agents/skills/` folder SHALL contain a `README.md` that explains the layout and naming rules for the skill library. The README SHALL replace the old `docs/skills-folder.md`.

#### Scenario: README is at the library root
- **WHEN** a user opens `.agents/skills/README.md`
- **THEN** it describes the rules that the workspace enforces for shared skill definitions

#### Scenario: Old skills-folder.md is gone
- **WHEN** the repository is searched for `docs/skills-folder.md`
- **THEN** no such path exists; the content lives at `.agents/skills/README.md`

### Requirement: No stale docs/ or scripts/ references outside this change
After the relocation, no tracked file in the repository outside this change's archive SHALL reference the old paths `docs/task-workflow.md`, `docs/pr-style.md`, `docs/commit-style.md`, `docs/cve-methodology.md`, `docs/obsidian.md`, `docs/skills-folder.md`, or `scripts/verify-commit.py`.

#### Scenario: Grep finds no stale path outside the archive
- **WHEN** the repository is searched for any of the seven old paths after the move, excluding this change's own archive folder
- **THEN** zero matches appear

## History

- [[../changes/archive/2026-07-25-relocate-skill-docs/proposal|relocate-skill-docs (2026-07-25)]] — Move skill-specific docs and scripts into their owning skill folders so each skill is self-contained.