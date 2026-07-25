## 1. Skill body updates

- [ ] 1.1 Update `.agents/skills/openspec-vault-link/SKILL.md`:
  - Drop the `change/<name>` and `status/<active|archived>` frontmatter tags from the frontmatter-tags step
  - Replace with `topic/<subject>` plus the existing `capability/<name>`
  - Add a "Naming convention" subsection that documents subject-prefixed filenames with examples (`why.md`, `how.md`, `<change-name>-why.md`)
  - Update the embedded `openspec/INDEX.md` template to reflect the new convention and to remove any references to the dropped tags
  - Add a "Forward-only" subsection making the grandfather clause explicit
  - Document every public flag (`--all`, `--skip-tags`, `--skip-bookmarks`, `--skip-moc`, `--dry-run`) with one-line descriptions

## 2. Spec sync

- [ ] 2.1 Land the new delta requirements at `openspec/specs/obsidian-vault-integration/spec.md` (already drafted under this change; archive will sync)

## 3. Touch-ups

- [ ] 3.1 If `.agents/skills/openspec-propose/SKILL.md` mentions `proposal.md`/`design.md`/`tasks.md` in its examples, update the wording to reflect the new convention (subject-prefixed preferred, flat role names allowed for tiny changes)

## 4. Validation

- [ ] 4.1 `openspec validate improve-vault-link` passes
- [ ] 4.2 Apply-boundary CVE audit clean (0 findings)