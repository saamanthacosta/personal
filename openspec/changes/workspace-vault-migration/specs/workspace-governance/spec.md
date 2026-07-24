## ADDED Requirements

### Requirement: Workspace repository tracks shared control-plane files
The root workspace repository SHALL track shared documentation, `.agents/skills/`, `personal.code-workspace`, intended root OpenSpec artifacts, and the root Obsidian configuration while excluding nested application repository contents.

#### Scenario: Workspace file is tracked
- **WHEN** a user adds or updates `personal.code-workspace`
- **THEN** the root repository reports the file as trackable and the file can be committed independently of child repositories

#### Scenario: Nested project contents remain isolated
- **WHEN** a user changes a file below an ignored child repository such as `lazyFinances/`
- **THEN** the root repository does not include that application file in its change set

### Requirement: Stale configuration copies are removed
The workspace SHALL have no project-local `.opencode/skills/` or `.github/skills/` copies after migration, and supported reusable skill definitions SHALL exist under `.agents/skills/`.

#### Scenario: Canonical skill path is used
- **WHEN** OpenCode or another compatible agent searches the workspace for a shared skill
- **THEN** the supported definition is found under `.agents/skills/<skill-name>/SKILL.md`

#### Scenario: Old skill directory is absent
- **WHEN** migration validation scans `.opencode/` and `.github/`
- **THEN** it finds no stale duplicate skill definition that could override or drift from `.agents/skills/`
