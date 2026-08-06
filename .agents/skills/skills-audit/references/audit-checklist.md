# Skills Audit — Checklist

The five areas checked by the `skills-audit` validator. Each area has a pass / warn / fail criterion and a description of what "good" looks like. The end-to-end canonical shape lives in `skill-authoring/assets/SKILL-template.md` — copy that file when authoring a new skill.

## Area 1 — Frontmatter

**Spec allowlist**: `name`, `description`, `license`, `compatibility`, `metadata`

**Required fields**:

- `name` — kebab-case, lowercase, hyphens, must match the folder name, max 64 chars.
- `description` — single-line, third-person, front-loaded with triggers, ≤ 200 chars.
- `license` — workspace convention `MIT`.
- `compatibility` — one-line runtime note (e.g. `Local machine skill — requires git and gh.`).
- `metadata` — `author: personal` and `version: "0.1"` at minimum.

**Check**: Parse the YAML frontmatter (between the `---` delimiters). Extract all top-level keys. Flag any key not in the allowlist. Verify the five required fields are present.

**Good**: Frontmatter contains only the five spec-allowlist fields, all five are present.
**Bad**: `tags`, `title`, `status`, `date`, `sources`, or any other non-allowlist key present in frontmatter. Missing `license`, `compatibility`, or `metadata`. Multi-line `description: >` block scalar.

**Severity**:
- FAIL — non-spec frontmatter fields have undefined runtime behaviour.
- WARN — missing `license`, `compatibility`, or `metadata` is a workspace convention gap, not a spec gap.

## Area 2 — Subfolders

**Spec allowlist**: `scripts/`, `references/`, `assets/`

**Check**: Enumerate direct subdirectories of the skill folder. Flag any subdirectory not in the allowlist.

**Good**: Skill folder contains only `SKILL.md` and optionally zero or more of `scripts/`, `references/`, `assets/`.
**Bad**: `bin/`, `docs/`, `tests/`, `evals/`, `schema/`, or any other non-allowlist subdirectory at the top level.

**Note**: Nested subfolders inside an allowlisted folder (e.g., `scripts/tests/`) are checked by the extra-structure policy in `skill-format-spec.md`, not by this top-level check. They are flagged as a warning, not a failure, unless they duplicate a top-level folder function.

**Severity**: WARN — non-allowlist top-level subfolders violate the spec but are not strictly blocking.

## Area 3 — Description

**Spec rules** (from `skill-description-quality.md`):
- Third-person (Use when...)
- Front-loaded with triggers (filenames, command names, concrete phrases)
- Covers both what the skill does and when to use it
- One or a few sentences; no truncation risk
- **Single line** (no `>` block scalar in YAML)

**Check**: Read the `description` frontmatter field. Evaluate against the five rules above.

**Good**: Description is third-person, single-line, front-loaded with triggers, covers what+when, and is concise.
**Bad**: First-person description, generic "helps with...", missing trigger context, multi-line block scalar, or excessively long (> 200 chars).

**Severity**: WARN — description quality affects triggering accuracy but does not break the skill.

## Area 4 — Body completeness

**Required sections** (from `skill-creation-practices.md` and the canonical template):

- `# <Title>` H1 heading as the first non-frontmatter line.
- Role/identity sentence — the first paragraph after the H1. State who the skill is and what it does.
- Workflow phases — either numbered headings (`## 1.`, `## 2.`, ...) or a named section (`## Procedure`, `## Steps`, `## Phases`, `## Workflow`, `## Tiers`) with a numbered or bulleted list inside.
- `## Inputs` — bulleted list of inputs the skill expects; mark required vs optional.
- `## Guardrails` or `## Anti-patterns` — bulleted rules with the failure mode named.

**Check**: Scan the SKILL.md body for presence of each required element.

**Good**: Body has H1, role sentence, workflow, Inputs, and Guardrails.
**Bad**: Body is a wall of prose with no discernible structure, or missing all four section types.

**Reference**: `skill-authoring/assets/SKILL-template.md` is the canonical shape.

**Severity**: WARN — body completeness affects maintainability; a sparse body may still function, but the workspace convention is the bar.

## Area 5 — Interdependencies

**Spec requirement** (from `skill-format-spec.md` → `## Skill Interdependency Declaration`):

Every skill that references another skill by name SHALL include a `## Interdependencies` section in its `SKILL.md` body. A self-contained skill SHALL include the section with `None — this skill is self-contained.`

**Check**: Search the SKILL.md body for a `## Interdependencies` heading at the start of a line (case-insensitive). If found, verify it contains either a table or the `None` note. If not found, flag as missing.

**Good**: `## Interdependencies` section present with a table or `None` note.
**Bad**: No `## Interdependencies` section, or section exists but is empty.

**Severity**: FAIL — missing interdependency documentation breaks the ability to reason about skill relationships.
