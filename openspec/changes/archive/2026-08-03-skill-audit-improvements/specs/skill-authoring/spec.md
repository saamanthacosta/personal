# skill-authoring delta spec

## MODIFIED Requirements

### Requirement: Conversation-derived workflow extraction

*The existing requirement is unchanged — see `openspec/specs/skill-authoring/spec.md`.*

## ADDED Requirements

### Requirement: Subfolder convention guidance

When authoring a skill that needs auxiliary files, the `skill-authoring` workflow SHALL guide the author to use the three-allowed subfolders according to the skill's complexity:

- **`references/`** — when the skill body would be bloated by long-form reference material. Use for methodology docs, checklists, or schema prose the body links to with relative paths.
- **`scripts/`** — when the skill needs deterministic executable side effects (validators, formatters, data processors). Test files for scripts MAY live under `scripts/tests/`; no top-level `tests/` folder is allowed.
- **`assets/`** — when the skill ships static data inputs (JSON catalogs, JSON schemas, eval fixtures). Asset naming follows: plural-noun catalogs (`patterns.json`), `*.schema.json` for JSON Schema Draft 2020-12+, and bare names for one-off templates.

A skill that is simple enough to fit entirely in `SKILL.md` with no auxiliary files SHOULD NOT introduce any subfolder.

#### Scenario: Author creates a complex skill needing helpers

- **WHEN** the conversation establishes that the target skill needs executable helpers and long-form reference docs
- **THEN** the generated skill folder contains `scripts/` and `references/` but NOT `assets/` unless static data inputs are needed

#### Scenario: Author creates a simple skill

- **WHEN** the target skill is a single-file workflow with no auxiliary files
- **THEN** the generated skill folder contains only `SKILL.md` and no subfolders

#### Scenario: Author wants to add tests for scripts

- **WHEN** the skill has an executable helper in `scripts/` and the author wants to test it
- **THEN** the tests live at `scripts/tests/*.mjs` and no top-level `tests/` folder is created

### Requirement: Interdependency declaration

When authoring a skill that references another skill by name (in the description, body, or invocation), the `skill-authoring` workflow SHALL ensure the skill body includes an explicit `## Interdependencies` section that lists every skill it references, the nature of the reference, and the coupling mechanism.

The section format is:

```markdown
## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `<skill-name>` | invokes / mentions / wraps | by name: `/<slash-command>` / path / bare name |
```

Coupling mechanisms:
- **by name (slash)**: the skill is invoked via a slash command (e.g., `/opsx-apply`)
- **by name (bare)**: the skill is referenced in prose without a slash command
- **by path**: the skill is invoked via a script path (e.g., `node .agents/skills/...`)

#### Scenario: Skill invokes another skill by slash command

- **WHEN** the generated skill body invokes `openspec-vault-link` via `/opsx-link openspec-vault-link`
- **THEN** the `## Interdependencies` table includes `openspec-vault-link | invokes | by name (slash)`

#### Scenario: Skill mentions another skill in prose

- **WHEN** the generated skill body mentions `create-task` as context without invoking it
- **THEN** the table includes `create-task | mentions | by name (bare)`

#### Scenario: Skill has no inter-skill references

- **WHEN** the generated skill is self-contained with no references to other skills
- **THEN** the `## Interdependencies` section states "None — this skill is self-contained."
