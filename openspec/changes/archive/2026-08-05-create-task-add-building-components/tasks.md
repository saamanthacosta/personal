## 1. Update create-task SKILL.md

- [ ] 1.1 Update frontmatter description to append the `building-components` trigger sentence (~140 chars; stays under 1024-char cap)
- [ ] 1.2 Add `### Specialist skill recognition` subsection under §1 with a table of specialists (`skill-authoring`, `building-components`) and their triggers
- [ ] 1.3 Update §1.3 cross-reference to point at the new recognition subsection
- [ ] 1.4 Add `building-components` row to the `## Interdependencies` table at the bottom of SKILL.md

## 2. Add task-orchestration delta spec

- [ ] 2.1 Create `openspec/changes/create-task-add-building-components/specs/task-orchestration/spec.md` with the new requirement and one scenario

## 3. Sync canonical task-orchestration spec

- [ ] 3.1 Append the new requirement to `openspec/specs/task-orchestration/spec.md` so the canonical spec matches the delta after archive

## 4. Verify

- [ ] 4.1 `git status --porcelain` shows only the intended files plus the OpenSpec change directory
- [ ] 4.2 Re-read the updated SKILL.md and confirm the new section + interdependencies entry are well-formed
- [ ] 4.3 Confirm the description length stays under the 1024-char cap

## 5. Pre-archive CVE audit

- [ ] 5.1 Run the pre-archive CVE audit per create-task §3.5
- [ ] 5.2 Loop back on any CRITICAL or unoverridden HIGH findings

## 6. Archive

- [ ] 6.1 Run `openspec-archive-change` to move the change under `openspec/changes/archive/2026-08-05-create-task-add-building-components/`
- [ ] 6.2 Confirm `openspec list --json` no longer contains the active change

## 7. Commit, push, PR

- [ ] 7.1 Stage only the intended files (SKILL.md, delta spec, canonical spec sync)
- [ ] 7.2 Run the staged-pattern scan and confirm no CRITICAL findings
- [ ] 7.3 Commit with a conventional title ≤ 30 chars
- [ ] 7.4 Push to `origin` and open a PR against `main`
