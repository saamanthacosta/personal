---
name: skill-retirement
description: Deprecate, archive, or remove a skill from `.agents/skills/`. Use when the user wants to retire a skill, remove it from active use, or clean up an abandoned skill.
license: MIT
compatibility: Local machine skill — requires git.
metadata:
  author: personal
  version: "0.1"
---

# Skill Retirement

Deprecate or remove a skill from `.agents/skills/`. The process has three tiers based on whether the skill is still referenced, still functional, and whether its removal would break callers.

## Tiers

### Tier 1 — Soft deprecate (skill still referenced)

When other skills or documentation reference the target skill by name:

1. Add `status: deprecated` to the skill's frontmatter `metadata`.
2. Add a `## Deprecation notice` section to the skill body stating the replacement path and removal date (leave `## Deprecation notice` absent; add it as a new section if it does not exist).
3. Update every `## Interdependencies` table that references this skill to note `(deprecated)`.
4. Update `README.md` to mark the skill as deprecated in the skills inventory.
5. Do NOT delete the skill folder.

**Do this when**: the skill may still be invoked, or when its name is mentioned in other skill bodies, or when it ships in a released version of the workspace.

### Tier 2 — Archive (skill not referenced, still functional)

When no other skill or documentation references the target skill:

1. Confirm no `## Interdependencies` tables anywhere in `.agents/skills/` list this skill.
2. Confirm no `README.md` entry references the skill.
3. Run a grep for the skill name in all tracked files outside `.agents/skills/`.
4. Move the skill folder to `.agents/skills/archive/<name>/`.
5. Remove the skill from `README.md`.
6. Commit as `chore: archive skill <name>`.

**Do this when**: the skill is self-contained and has no callers.

### Tier 3 — Hard remove (never used, completely broken)

When the skill was never shipped, is completely broken, or was created in error:

1. Confirm no referenced skills list this skill in their `## Interdependencies`.
2. Delete the skill folder.
3. Commit as `chore: remove broken skill <name>`.

**Do this when**: the skill was created by accident, never invoked, and has no interdependency footprint.

## Inputs

- `name` (required): the skill folder name (kebab-case)
- `tier` (optional): `soft`, `archive`, or `hard`; inferred if not provided

## Guardrails

- Never delete a skill that is referenced in another skill's `## Interdependencies` table without updating the caller first.
- Never hard-remove a skill that ships in a released workspace version without a deprecation period.
- Always commit the retirement action; never leave the retirement change uncommitted.
- If the skill has `scripts/` or `references/`, confirm no external workflow depends on those paths before archival.

## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `skill-authoring` | mentions | by name (bare) |
| `skills-audit` | mentions | by name (bare) |

None — this skill is self-contained.
