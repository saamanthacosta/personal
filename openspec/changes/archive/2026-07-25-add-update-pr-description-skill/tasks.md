## 1. Skill authoring

- [x] 1.1 Author `.agents/skills/update-pr-description/SKILL.md` with valid frontmatter, a trigger-oriented description, and a body covering inputs, workflow, quality criteria, and guardrails
- [x] 1.2 Match the description template parity requirement from `openspec/specs/pr-description-sync/spec.md` so the regenerated body uses the same headings and single-line paragraph rule as `create-pr`

## 2. Capability registration

- [ ] 2.1 Land the new capability spec at `openspec/specs/pr-description-sync/spec.md` (already drafted under the change; will be moved during archive)
- [x] 2.2 Update `docs/skills-folder.md` so the `Personal/.agents/skills/` block lists `update-pr-description`

## 3. Validation

- [x] 3.1 Validate frontmatter (name/folder match, third-person trigger-oriented description, only supported fields)
- [x] 3.2 Confirm the body defines concrete inputs, workflow phases, stop conditions, and completion criteria
- [x] 3.3 Confirm no `bin/`, `references/`, or other auxiliary directories are introduced under the new skill folder