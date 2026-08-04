## 1. Fix frontmatter spec violations

- [ ] 1.1 Trim `research-spike/SKILL.md` frontmatter — remove `tags`, `title`, `status`, `date`, `sources` fields; keep only `name`, `description`, `license`, `compatibility`, `metadata`
- [ ] 1.2 Trim `openspec-vault-link/SKILL.md` frontmatter — remove `tags` field; keep only spec-allowlist fields
- [ ] 1.3 Add `compatibility` field to `skill-sessions/SKILL.md` — add `Local machine skill — requires Node.js and access to the skill's scripts directory`

## 2. Fix evals.json and schema references

- [ ] 2.1 Remove `$schema` URL from `create-task/assets/evals.json` — the field is decorative and the URL does not resolve offline; leave the evals fixtures intact

## 3. Update skill-format-spec.md with new conventions

- [ ] 3.1 Add `## Subfolder Conventions` section to `skill-authoring/references/skill-format-spec.md` — document when to use `scripts/`, `references/`, `assets/` based on skill complexity; include the extra-structure policy
- [ ] 3.2 Add `## Extra-Structure Policy` section — clarify that nested subfolders inside allowed top-level folders are permitted when they serve a specific purpose and do not duplicate a top-level folder's function; cite `skill-sessions/scripts/tests/` as the canonical example
- [ ] 3.3 Add `## Skill Interdependency Declaration` section — define the `## Interdependencies` table format (skill, nature, coupling) and when it is required

## 4. Update skill-authoring SKILL.md

- [ ] 4.1 Add `## Subfolder Conventions` subsection — reference the new section in `skill-format-spec.md`; guide authors to prefer flat when possible and to use `scripts/` for executable helpers, `references/` for long-form docs, `assets/` for static data
- [ ] 4.2 Add `## Interdependency Declaration` subsection — reference the new section in `skill-format-spec.md`; require that every skill that references another skill by name includes the table

## 5. Update canonical specs for new conventions

- [ ] 5.1 Sync delta spec `specs/skill-folder-conventions/spec.md` into `openspec/specs/skill-folder-conventions/spec.md` — apply the two ADDED requirements (extra-structure policy, interdependency documentation) to the canonical spec
- [ ] 5.2 Sync delta spec `specs/skill-authoring/spec.md` into `openspec/specs/skill-authoring/spec.md` — apply the two ADDED requirements (subfolder convention guidance, interdependency declaration)

## 6. Create `skills-audit` skill

- [ ] 6.1 Create `.agents/skills/skills-audit/SKILL.md` — skill that audits all skills in `.agents/skills/` for spec compliance; triggers on "review skills", "audit the skills", "check skill quality"; has `scripts/` and `references/` subfolders
- [ ] 6.2 Create `.agents/skills/skills-audit/references/audit-checklist.md` — the five-area audit criteria: (1) frontmatter allowlist, (2) subfolder names, (3) description trigger quality, (4) body section completeness, (5) interdependency declaration presence
- [ ] 6.3 Create `.agents/skills/skills-audit/scripts/validate-skill.mjs` — executable script that validates a single skill; exits 0 on pass, 1 on violations, 2 on error; checks frontmatter allowlist and subfolder names
- [ ] 6.4 Create `.agents/skills/skills-audit/scripts/audit-all.mjs` — runs `validate-skill.mjs` against every skill in `.agents/skills/`, aggregates results, prints a summary table

## 7. Create `openspec-status` skill

- [ ] 7.1 Create `.agents/skills/openspec-status/SKILL.md` — wraps `openspec list --json` into a skill; triggers on "what changes are active", "openspec status", "list changes"; outputs structured table of active changes with their schema and status

## 8. Create `skill-retirement` skill

- [ ] 8.1 Create `.agents/skills/skill-retirement/SKILL.md` — documents and executes the skill deprecation process: (1) remove from active skill list in README, (2) add `status: deprecated` to frontmatter, (3) optionally archive the folder, (4) update any skills that referenced it

## 9. Add interdependency sections to existing skills

- [ ] 9.1 Add `## Interdependencies` to `openspec-apply-change/SKILL.md` — table entry for `openspec-vault-link | invokes | by name (slash)`
- [ ] 9.2 Add `## Interdependencies` to `openspec-archive-change/SKILL.md` — table entry for `openspec-vault-link | invokes | by name (slash)`
- [ ] 9.3 Add `## Interdependencies` to `pr-review-comments/SKILL.md` — table entry for `fix-pr-review-comments | mentions | by name (bare)`, `cve-scan | mentions | by name (bare)`
- [ ] 9.4 Add `## Interdependencies` to `fix-pr-review-comments/SKILL.md` — table entry for `pr-review-comments | mentions | by name (bare)`
- [ ] 9.5 Add `## Interdependencies` to `research-spike/SKILL.md` — table entry for `skill-authoring | references | by name (bare)`, `openspec-explore | references | by name (bare)`, `openspec-vault-link | references | by name (bare)`
- [ ] 9.6 Add `## Interdependencies` to `skill-sessions/SKILL.md` — table entry for `create-task | invokes | by name (bare)`
- [ ] 9.7 Add `## Interdependencies` to `create-pr/SKILL.md` — table entry for `commit | mentions | by name (bare)`
- [ ] 9.8 Add `## Interdependencies` to `commit/SKILL.md` — table entry for `cve-scan | invokes | by path`
- [ ] 9.9 Add `## Interdependencies` to `skill-authoring/SKILL.md` — table entry for `customize-opencode | loads | by name (bare)` (the built-in skill)
- [ ] 9.10 Add `## Interdependencies` to all remaining flat skills with "None — this skill is self-contained." — `apply-github-ruleset`, `cve-scan`, `update-pr-description`, `openspec-explore`, `openspec-propose`

## 10. Update README.md

- [ ] 10.1 Rewrite `.agents/skills/README.md` — full 16-skill inventory, folder structure diagram, subfolder conventions summary, skill interdependency graph (as a table), and the new convention references

## 11. Add tests section to skill-sessions SKILL.md

- [ ] 11.1 Add `## Tests` section to `skill-sessions/SKILL.md` — explicit justification that test files live at `scripts/tests/` and could not use a top-level `tests/` folder; cite the extra-structure policy

## 12. Self-audit

- [ ] 12.1 Run `node .agents/skills/skills-audit/scripts/audit-all.mjs` to verify all skills pass the spec compliance check
- [ ] 12.2 Fix any violations surfaced by the audit that were missed in the preceding tasks
