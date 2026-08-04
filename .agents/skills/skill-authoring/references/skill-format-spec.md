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

## Subfolder Conventions

A skill SHOULD be flat (no subfolders) when its entire behaviour fits in
`SKILL.md`. Introduce a subfolder only when the body would be materially
bloated or when the skill needs executable side effects.

| Subfolder | Use when | Examples |
| --- | --- | --- |
| `references/` | Long-form reference docs, methodology notes, checklists, or schema prose that the body links to with relative paths | `task-workflow.md`, `BLOCKER-CHECKLIST.md`, `audit-checklist.md` |
| `scripts/` | Deterministic executable helpers invoked by the body or external workflows | `validate-skill.mjs`, `phase-status.mjs`, `full-audit.mjs` |
| `assets/` | Static data files the body or scripts read but do not execute — JSON catalogs, JSON schemas, eval fixtures | `patterns.json`, `evals.json`, `*.schema.json` |

**Asset naming** (from `skill-creation-practices.md`):
- Plural-noun `.json` files are catalogs: `patterns.json`, `evals.json`
- `*.schema.json` files are JSON Schema Draft 2020-12+
- Everything else: bare kebab-case name + extension

## Extra-Structure Policy

Nested subfolders inside the three allowed top-level folders are permitted
when they serve a specific purpose and do not duplicate a top-level folder's
function.

**Allowed**: `scripts/tests/` (script test files), `scripts/fixtures/` (test data for scripts)

**Forbidden**: any nested subfolder that mirrors a top-level folder's role
(e.g., `scripts/scripts/`, `references/references/`)

When a skill introduces a non-standard nested subfolder, the skill body MUST
include an explicit justification (e.g., a `## Tests` or `## Extra Structure`
section) naming the subfolder, its purpose, and why it could not use an
allowed top-level structure.

**Canonical example**: `skill-sessions/scripts/tests/` holds `.test.mjs` files
for its script helpers. This is valid because the tests are specific to the
scripts, are nested under `scripts/`, and a top-level `tests/` folder is not
part of the spec allowlist.

## Skill Interdependency Declaration

Every skill that references another skill by name (in the description, body, or
invocation) MUST document that relationship in a `## Interdependencies` section
in its `SKILL.md` body.

```markdown
## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `<skill-name>` | invokes / mentions / wraps / loads | by name (slash) / by name (bare) / by path |
```

**Nature** describes the relationship from this skill's perspective:
- `invokes` — the skill calls or spawns the other skill
- `mentions` — the skill references the other in prose only
- `wraps` — the skill provides a skill-level interface to the other's CLI/tooling
- `loads` — the skill explicitly loads the other as a dependency

**Coupling** describes how the reference is made:
- `by name (slash)` — invoked via a slash command (e.g., `/opsx-apply`)
- `by name (bare)` — referenced in prose without a slash command
- `by path` — invoked via a script path (e.g., `node .agents/skills/...`)

A self-contained skill with no inter-skill references MUST include the section
with the note: `None — this skill is self-contained.`
