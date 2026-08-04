## Why

The skills folder (`.agents/skills/`) has accumulated structural debt: stale documentation, frontmatter fields that violate the Agent Skills spec allowlist, inconsistent use of subfolders, no validation that skills conform to their own spec, and gaps in the skill coverage (no audit, no status wrapper). This change audits and fixes all of it, and introduces a new `skills-audit` skill so the system can self-maintain.

## What Changes

1. **Update `README.md`** — lists all 16 skills, documents the folder structure and subfolder conventions, and maps skill interdependencies.
2. **Fix `research-spike` frontmatter** — remove non-spec fields `tags`, `title`, `status`, `date`, `sources`; keep only the spec-allowlist fields.
3. **Fix `openspec-vault-link` frontmatter** — remove non-spec `tags` field.
4. **Add missing `compatibility` to `skill-sessions`** — bring it in line with the other skills.
5. **Document `skill-sessions/scripts/tests/`** — add a `## Tests` section to `SKILL.md` that explicitly justifies the `tests/` subfolder as an implementation-specific structure, and add a note in `skill-format-spec.md` clarifying the extra-structure policy.
6. **Create `skills-audit` skill** — a new skill that audits all skills for spec compliance, description quality, frontmatter correctness, body completeness, and staleness. Has refs + scripts subfolders.
7. **Create `openspec-status` skill** — wraps `openspec list --json` with a structured skill interface, replacing the bare bash invocation in `openspec-explore`.
8. **Create `skill-retirement` skill** — documents how to deprecate, archive, or remove a skill.
9. **Fix `create-task/assets/evals.json`** — remove the unresolvable external schema URL.
10. **Establish subfolder usage convention** — add a `## Subfolder Conventions` section to `skill-format-spec.md` that defines when to use `scripts/`, `references/`, and `assets/` based on skill complexity.
11. **Establish skill interdependency documentation convention** — add an `## Interdependencies` section to `skill-format-spec.md` and update every skill that references another by name to include an explicit interdependency declaration.
12. **Add validation script** — `skills-audit/scripts/validate-skill.mjs` that checks frontmatter allowlist, subfolder names, description quality, and body sections. Fails with non-zero exit on violations.

## Capabilities

### New Capabilities

- `skills-audit`: A skill that runs a spec-compliance audit against all skills in `.agents/skills/`, producing a structured report of violations, quality issues, and recommendations.
- `openspec-status`: A skill that wraps `openspec list --json` into a skill interface, providing structured output and change selection.
- `skill-retirement`: A skill that documents and executes the process for deprecating or archiving a skill.

### Modified Capabilities

- `skill-authoring` (existing): Add a "## Subfolder Conventions" subsection and an "## Interdependency Declaration" subsection to the skill body, so the authoring guidance is self-contained.
- `skill-folder-conventions` (existing): The canonical spec for the folder structure is already in `openspec/specs/skill-folder-conventions/spec.md`; this change updates it to document the new conventions (subfolder usage, interdependency graph, extra-structure policy).

## Impact

- `.agents/skills/README.md` — rewritten
- `.agents/skills/research-spike/SKILL.md` — frontmatter trimmed
- `.agents/skills/openspec-vault-link/SKILL.md` — frontmatter trimmed
- `.agents/skills/skill-sessions/SKILL.md` — `compatibility` field added
- `.agents/skills/create-task/assets/evals.json` — schema URL removed
- `.agents/skills/skill-authoring/references/skill-format-spec.md` — two new sections
- `openspec/specs/skill-folder-conventions/spec.md` — updated for new conventions
- `openspec/specs/skill-authoring/spec.md` — updated for new guidance
- New: `.agents/skills/skills-audit/SKILL.md` + `references/` + `scripts/`
- New: `.agents/skills/openspec-status/SKILL.md`
- New: `.agents/skills/skill-retirement/SKILL.md`
