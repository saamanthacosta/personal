## 1. OpenSpec artifacts

- [ ] 1.1 Validate `openspec validate revert-pr-description-merge`.
- [ ] 1.2 Sync the canonical `skill-folder-conventions` and `pr-description-sync` specs after the apply phase.

## 2. Revert the merge

- [ ] 2.1 `git revert --no-edit 2204273` (Update cross-skill PR references).
- [ ] 2.2 `git revert --no-edit b67644f` (Add pr-description skill).
- [ ] 2.3 Verify the working tree: `create-pr/` and `update-pr-description/` are restored; `pr-description/` is gone; the merge archive is gone.

## 3. Verify

- [ ] 3.1 `openspec validate skill-folder-conventions` and `pr-description-sync` after the canonical sync.
- [ ] 3.2 Run `node .agents/skills/cve-scan/scripts/scan-staged.mjs` for the staged scan.
- [ ] 3.3 Confirm `find .agents/skills -maxdepth 2 -type d` does not list `pr-description/`.

## 4. Push and refresh

- [ ] 4.1 `git push` to the existing branch.
- [ ] 4.2 Regenerate PR #21's body via the restored `update-pr-description` skill (preview + approve + apply), dropping the pr-description bullet from `## Notes` and adding the two revert commits to the commit list.

## 5. Archive

- [ ] 5.1 `mv openspec/changes/revert-pr-description-merge openspec/changes/archive/2026-08-04-revert-pr-description-merge/`.
- [ ] 5.2 Confirm `openspec list --json` returns the expected empty state.
