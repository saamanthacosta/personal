## 1. OpenSpec artifacts

- [ ] 1.1 Validate `openspec validate merge-pr-description-skills`.
- [ ] 1.2 Sync the `skill-folder-conventions` canonical spec with the new "mode-specific references" requirement after the apply phase.

## 2. Build the merged skill

- [ ] 2.1 Create `.agents/skills/pr-description/SKILL.md` with the merged body (frontmatter describing both open and regenerate triggers; §"Detect mode"; shared context detection; pointer to the three references).
- [ ] 2.2 Move `.agents/skills/create-pr/references/pr-style.md` to `.agents/skills/pr-description/references/pr-style.md` (content unchanged).
- [ ] 2.3 Create `.agents/skills/pr-description/references/pr-open.md` by extracting the open-mode workflow from the old `create-pr/SKILL.md` (readiness checks, `gh pr create`, title rules, assignee, anti-patterns).
- [ ] 2.4 Create `.agents/skills/pr-description/references/pr-regenerate.md` by extracting the regenerate-mode workflow from the old `update-pr-description/SKILL.md` (read current body, compute new body, side-by-side preview, approval gate, `gh pr edit --body-file`).

## 3. Drop the predecessor skills

- [ ] 3.1 `git rm -r .agents/skills/create-pr/`.
- [ ] 3.2 `git rm -r .agents/skills/update-pr-description/`.

## 4. Cross-skill reference sweep

- [ ] 4.1 `rg -n 'create-pr|update-pr-description' .` and fix every hit in the same change (likely in `create-task/SKILL.md` and `openspec-archive-change/SKILL.md`).
- [ ] 4.2 Update PR #21 description to mention the merged skill (via `update-pr-description` once the new skill is in place, or `gh pr edit --body` directly).

## 5. Verify

- [ ] 5.1 `openspec validate skill-folder-conventions` after the canonical sync.
- [ ] 5.2 Confirm `find .agents/skills -maxdepth 2 -type d` lists only the three spec-recognised subfolders (or none) plus the new `pr-description` folder.
- [ ] 5.3 Confirm the staged CVE scan still passes for the new files.

## 6. Commits (per the §9 grouping rule)

- [ ] 6.1 `Add pr-description skill` — proposal, design, new `SKILL.md` + the three `references/`.
- [ ] 6.2 `Drop create-pr and update-pr-description` — `git rm` the two predecessor folders.
- [ ] 6.3 `Update cross-skill references` — fix any `rg` hits in `create-task`, `openspec-archive-change`, and the PR body.

## 7. Archive

- [ ] 7.1 `mv openspec/changes/merge-pr-description-skills openspec/changes/archive/2026-08-04-merge-pr-description-skills/`.
- [ ] 7.2 Confirm `openspec list --json` returns the expected empty state after the move.

## 8. Push and refresh

- [ ] 8.1 `git push` to the existing branch.
- [ ] 8.2 Regenerate PR #21's body via the new `pr-description` skill in `regenerate` mode.
