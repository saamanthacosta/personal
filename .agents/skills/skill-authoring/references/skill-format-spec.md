---
title: Agent Skills — format spec
source: https://agentskills.io/specification.md
captured: 2026-08-03
purpose: Authoritative on-disk layout, frontmatter fields, and allowed subfolders per the Agent Skills spec. Used by `skill-authoring` to validate structural decisions.
---

# Agent Skills — format spec

The structural rules every skill must follow. The Agent Skills spec defines
the on-disk shape, the recognised frontmatter fields, and the subfolders
skill authors are allowed to introduce. This note is the source of truth for
those rules; treat it as more authoritative than prose in any single skill
body.

## On-disk layout

A skill is a single Markdown file named `SKILL.md` inside its own folder.
The folder is named after the skill (kebab-case, lowercase, hyphens).

```
.opencode/skills/my-skill/SKILL.md
```

## Allowed subfolders

Per the spec, skill authors may introduce exactly these subfolders:

- `references/` — long-form reference material the body links to.
- `scripts/` — executable helpers invoked from the body.
- `assets/` — static files (templates, schemas, sample data) the body
  references.

No other subfolders are part of the public layout. Anything beyond
`references/`, `scripts/`, and `assets/` is implementation-specific to a
single skill and must be justified in the skill body. This workspace enforces
that rule: `skill-authoring` refuses other subfolders.

## Frontmatter

Required:

- `name` — kebab-case, lowercase, hyphens, must match the folder name, max
  64 chars.
- `description` — see `skill-description-quality.md` for the rules.

Optional:

- `license`
- `compatibility` (e.g. runtime notes, dependencies)
- `metadata` (free-form key/value pairs)

OpenCode recognises exactly those five fields. Unknown fields are ignored and
must not be used to control invocation. (See the built-in `customize-opencode`
skill for the OpenCode-specific surface.)

## Body

The body is plain Markdown. See `skill-creation-practices.md` for the
recommended sections and the eval-driven validation pattern.
