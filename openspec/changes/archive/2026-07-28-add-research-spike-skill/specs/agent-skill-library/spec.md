## ADDED Requirements

### Requirement: Research-spike is part of the approved library

The root `.agents/skills/` library SHALL include `research-spike` in the approved research-category inventory, with valid frontmatter, a unique name, and conformance to the conventions defined in the `skill-authoring` capability.

#### Scenario: Library lists research-spike

- **WHEN** the library inventory enumerates `.agents/skills/`
- **THEN** `research-spike/SKILL.md` exists with valid frontmatter, a unique name, and a description that follows the existing skill description conventions

#### Scenario: research-spike does not collide with other skills

- **WHEN** the library validates skill folder names
- **THEN** `research-spike` does not collide with any other skill folder name in `.agents/skills/`

#### Scenario: research-spike follows skill-authoring conventions

- **WHEN** `research-spike/SKILL.md` is reviewed against `skill-authoring`
- **THEN** the file lives at the canonical path, has a kebab-case folder name matching the frontmatter `name`, and uses an OpenCode-recognised frontmatter schema
