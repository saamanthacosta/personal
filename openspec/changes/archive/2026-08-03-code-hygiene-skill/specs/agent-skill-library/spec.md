# agent-skill-library Specification — code-hygiene Delta

## ADDED Requirements

### Requirement: code-hygiene is part of the approved library

The root `.agents/skills/` library SHALL include `code-hygiene` in the approved hygiene-category inventory, with valid YAML frontmatter, a kebab-case folder name matching the frontmatter `name`, a trigger-oriented description following the conventions defined in `skill-authoring`, and conformance to `skill-doc-organization` (scripts under `bin/`, references co-located, evals scaffolded).

#### Scenario: Library lists code-hygiene

- **WHEN** the library inventory enumerates `.agents/skills/`
- **THEN** `code-hygiene/SKILL.md` exists with valid frontmatter, a kebab-case folder name matching the frontmatter `name`, and a description that follows the existing skill description conventions

#### Scenario: code-hygiene does not collide with other skills

- **WHEN** the library validates skill folder names
- **THEN** `code-hygiene` does not collide with any other skill folder name in `.agents/skills/`

#### Scenario: code-hygiene follows skill-authoring conventions

- **WHEN** `code-hygiene/SKILL.md` is reviewed against `skill-authoring`
- **THEN** the file lives at the canonical path, has a kebab-case folder name matching the frontmatter `name`, uses an OpenCode-recognised frontmatter schema, and includes a `## When to load` and `## When NOT to load` section

#### Scenario: code-hygiene follows skill-doc-organization conventions

- **WHEN** `code-hygiene/` is reviewed against `skill-doc-organization`
- **THEN** the helper script lives at `.agents/skills/code-hygiene/bin/scan.mjs` (not under `scripts/`), any reference docs live inside the skill folder, and an `evals/evals.json` file exists

#### Scenario: code-hygiene runner exits with documented codes

- **WHEN** the runner `node .agents/skills/code-hygiene/bin/scan.mjs` is invoked
- **THEN** it exits `0` when no new findings, `1` when new findings exist, and `2` on scanner error, matching the `cve-scan` exit-code contract
