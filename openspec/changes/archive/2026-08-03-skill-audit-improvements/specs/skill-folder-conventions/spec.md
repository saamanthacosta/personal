# skill-folder-conventions delta spec

## MODIFIED Requirements

### Requirement: Canonical three-folder layout

*The existing requirement is unchanged — see `openspec/specs/skill-folder-conventions/spec.md`.*

## ADDED Requirements

### Requirement: Extra-structure policy

A skill folder MAY introduce additional subfolders nested inside the three allowed top-level folders (`scripts/`, `references/`, `assets/`), provided the nested subfolder is specific to the parent folder's purpose and does not duplicate a top-level folder's function.

Nested subfolders that serve the same purpose as a top-level folder (e.g., a `scripts/` inside `scripts/` or a `references/` inside `references/`) are forbidden. Nested subfolders that serve a specific implementation need (e.g., `scripts/tests/` for skill-script test files) are allowed.

Rationale: `skill-sessions` uses `scripts/tests/` for its render and format script tests. The Agent Skills spec allowlist does not forbid nested subfolders inside `scripts/`, only non-allowlisted top-level folders. This requirement makes that implicit permission explicit.

#### Scenario: Skill has tests nested under scripts/

- **WHEN** `skill-sessions` places test files at `scripts/tests/format-sessions.test.mjs`
- **THEN** the structure is valid because `tests/` is nested inside `scripts/` (not a top-level `tests/`), serves a specific purpose (script testing), and does not duplicate any top-level folder function

#### Scenario: Skill attempts to duplicate a top-level folder

- **WHEN** a skill introduces `scripts/scripts/` or `references/references/`
- **THEN** the structure is invalid because it duplicates the top-level folder function

#### Scenario: Skill introduces an undocumented nested subfolder

- **WHEN** a skill introduces `scripts/fixtures/` for static test fixtures
- **THEN** this is valid because the fixtures serve a specific purpose (test data), are nested under `scripts/`, and do not duplicate any top-level folder function

### Requirement: Skill interdependency documentation

Every skill that references another skill by name SHALL document that relationship in a `## Interdependencies` section in its `SKILL.md` body. The section SHALL list each referenced skill, the nature of the relationship, and the coupling mechanism.

The relationship graph is bidirectional: if skill A mentions skill B, skill B's interdependency entry does not need to list A (unless B also references A).

#### Scenario: Skill invokes another skill by slash command

- **WHEN** `openspec-apply-change` invokes `openspec-vault-link` via `/opsx-link openspec-vault-link`
- **THEN** `openspec-apply-change/SKILL.md` contains an `## Interdependencies` section with `openspec-vault-link | invokes | by name (slash)`

#### Scenario: Skill is self-contained

- **WHEN** `apply-github-ruleset` has no references to other skills
- **THEN** `apply-github-ruleset/SKILL.md` contains `## Interdependencies` with the note "None — this skill is self-contained."

### Requirement: Extra-structure is justified in SKILL.md

When a skill introduces a subfolder that is not in the three-allowed list (`scripts/`, `references/`, `assets/`), the skill body SHALL include an explicit justification for that structure. The justification SHALL name the subfolder, the purpose it serves, and why it could not use an allowed top-level folder.

This requirement ensures that undocumented extra-structure (like the historical `skill-sessions/scripts/tests/` situation) is the exception, not the norm.

#### Scenario: Skill documents an extra subfolder

- **WHEN** `skill-sessions` has `scripts/tests/`
- **THEN** `skill-sessions/SKILL.md` contains a `## Extra Structure` or `## Tests` section explaining that test files for its scripts live under `scripts/tests/` and could not use a top-level `tests/` folder

#### Scenario: Skill uses only the three allowed folders

- **WHEN** `cve-scan` uses only `scripts/`, `references/`, and `assets/`
- **THEN** no extra-structure justification section is needed
