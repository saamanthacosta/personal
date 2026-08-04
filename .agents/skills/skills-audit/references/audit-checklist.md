# Skills Audit — Checklist

The five areas checked by the `skills-audit` validator. Each area has a pass/fail criterion and a description of what "good" looks like.

## Area 1 — Frontmatter

**Spec allowlist**: `name`, `description`, `license`, `compatibility`, `metadata`

**Check**: Parse the YAML frontmatter (between the `---` delimiters). Extract all top-level keys. Flag any key not in the allowlist.

**Good**: Frontmatter contains only the five spec-allowlist fields.
**Bad**: `tags`, `title`, `status`, `date`, `sources`, or any other non-allowlist key present in frontmatter.

**Severity**: FAIL — non-spec frontmatter fields have undefined runtime behaviour.

## Area 2 — Subfolders

**Spec allowlist**: `scripts/`, `references/`, `assets/`

**Check**: Enumerate direct subdirectories of the skill folder. Flag any subdirectory not in the allowlist.

**Good**: Skill folder contains only `SKILL.md` and optionally zero or more of `scripts/`, `references/`, `assets/`.
**Bad**: `bin/`, `docs/`, `tests/`, `evals/`, `schema/`, or any other non-allowlist subdirectory at the top level.

**Note**: Nested subfolders inside an allowlisted folder (e.g., `scripts/tests/`) are checked by the extra-structure policy in `skill-format-spec.md`, not by this top-level check. They are flagged as a warning, not a failure, unless they duplicate a top-level folder function.

**Severity**: FAIL — non-allowlist top-level subfolders violate the spec.

## Area 3 — Description

**Spec rules** (from `skill-description-quality.md`):
- Third-person (Use when...)
- Front-loaded with triggers (filenames, command names, concrete phrases)
- Covers both what the skill does and when to use it
- One or a few sentences; no truncation risk

**Check**: Read the `description` frontmatter field. Evaluate against the four rules above.

**Good**: Description is third-person, front-loaded with triggers, covers what+when, and is concise.
**Bad**: First-person description, generic "helps with...", missing trigger context, or excessively long (> 200 chars).

**Severity**: WARNING — description quality affects triggering accuracy but does not break the skill.

## Area 4 — Body completeness

**Required sections** (from `skill-creation-practices.md`):
- Inputs the skill expects
- Workflow phases or decision points
- Guardrails or anti-patterns
- Completion criteria or quality criteria

**Check**: Scan the SKILL.md body for presence of each required section. At minimum, the body must have some workflow guidance and at least one guardrail.

**Good**: Body defines inputs, has a discernible workflow, names guardrails, and has completion criteria.
**Bad**: Body is a wall of prose with no discernible structure, or missing all four section types.

**Severity**: WARNING — body completeness affects maintainability; a sparse body may still function.

## Area 5 — Interdependencies

**Spec requirement** (from `skill-format-spec.md` → `## Skill Interdependency Declaration`):

Every skill that references another skill by name SHALL include a `## Interdependencies` section in its `SKILL.md` body. A self-contained skill SHALL include the section with `None — this skill is self-contained.`

**Check**: Search the SKILL.md body for a `## Interdependencies` heading (case-insensitive). If found, verify it contains either a table or the `None` note. If not found, flag as missing.

**Good**: `## Interdependencies` section present with a table or `None` note.
**Bad**: No `## Interdependencies` section, or section exists but is empty.

**Severity**: FAIL — missing interdependency documentation breaks the ability to reason about skill relationships.
