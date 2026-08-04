## Context

The `merge-pr-description-skills` change (commits `b67644f` and `2204273` on the `chore/skill-folder-conventions` branch) replaced `create-pr` and `update-pr-description` with a single `pr-description` skill that dispatched between open and regenerate modes. The merge was approved by the user in the moment but on reflection the two activities are not a true consolidation — the descriptions are trigger-distinct, the readiness gates differ, and the safety model is different (open mode is a single shot; regenerate mode is a read-then-preview-then-apply pipeline).

This change reverts the merge. The `skill-folder-conventions` capability also reverts the "mode-specific references" requirement that was introduced solely for `pr-description`, since no remaining skill uses it after the revert.

## Goals / Non-Goals

**Goals:**
- Restore `.agents/skills/create-pr/` and `.agents/skills/update-pr-description/` exactly as they were before the merge.
- Delete the merged `pr-description/` folder and its three `references/` notes.
- Revert the canonical `pr-description-sync` spec to its pre-merge state.
- Revert the "mode-specific references" requirement in the canonical `skill-folder-conventions` spec.
- Archive the `revert-pr-description-merge` change after the apply phase.

**Non-Goals:**
- Touching any other skill. The folder conventions refactor and the `skill-authoring` consolidation are not in scope.
- Reopening the question of whether `create-pr` and `update-pr-description` should ever be merged. The user has decided they should stay separate.

## Decisions

### Use `git revert` to undo the merge commits

`git revert` produces a new commit that inverts the changes from a specific prior commit. This preserves the rest of the branch's history (the folder conventions refactor, the `skill-authoring` consolidation, the asset-naming documentation) and gives the revert its own auditable commit.

Revert the two merge commits in reverse chronological order:
- `git revert --no-edit 2204273` (Update cross-skill PR references)
- `git revert --no-edit b67644f` (Add pr-description skill)

This order matters: reverting the later commit first avoids merge-conflict ambiguity on the spec files. The archive folder deletion in the merge is naturally undone because the archive was created by the merge and the revert removes the creation.

After the reverts, the branch will contain:
- All folder-conventions and skill-authoring work.
- A new revert commit pair that undoes the pr-description merge.
- A working tree that has `create-pr` and `update-pr-description` restored, and no `pr-description/` folder.

### Drop the "mode-specific references" requirement

After the revert, no remaining skill uses mode-specific `references/` notes. `skill-authoring` keeps its three references at the top level of `references/`, not split per mode. The requirement was added specifically to support `pr-description`, so dropping it keeps the spec clean.

If a future skill ever needs mode dispatch, the requirement can be re-added with a concrete example — a requirement without a consumer is a forward-looking spec without a contract.

### Restore the pre-merge PR #21 body

The PR body currently has a `## Notes` paragraph about the pr-description consolidation. After the revert, that paragraph is stale. Regenerate the body (using the restored `update-pr-description` skill, run via the user-approved preview-and-apply flow) to drop the paragraph and update the commit list to include the two revert commits.

## Risks / Trade-offs

- [Risk] The revert conflicts with future skill work that might want mode-specific references. → [Mitigation] The requirement is small and easy to re-add when a concrete need arises. Keeping a forward-looking spec without a consumer creates spec debt.
- [Risk] `git revert` could produce conflicts if the merge's spec changes overlap with later edits to the same spec. → [Mitigation] The merge's spec edits touched `pr-description-sync` and `skill-folder-conventions`; nothing else in the branch edits those files after the merge. `git revert --no-edit` should apply cleanly.

## Security Considerations

- **Data touched:** none.
- **Trust boundaries crossed:** none.
- **New dependencies / external services:** none.
- **Persistence:** unchanged.
- **Auth / sessions / tokens / permissions:** unchanged.

**Residual risk:** low. The revert is the inverse of the merge; same kind of operation, opposite direction.

## Migration Plan

1. `git revert --no-edit 2204273` (undo "Update cross-skill PR references").
2. `git revert --no-edit b67644f` (undo "Add pr-description skill").
3. Verify the working tree: `create-pr/`, `update-pr-description/`, and the `pr-description-sync` spec are back to their pre-merge state. `pr-description/` is gone. The merge archive is gone.
4. Run `node .agents/skills/cve-scan/scripts/scan-staged.mjs` to confirm a clean staged scan.
5. Push the new revert commits to the existing branch.
6. Regenerate PR #21's body via the restored `update-pr-description` skill (preview + approve + apply).
7. Archive the `revert-pr-description-merge` change.

## Open Questions

None. The user has chosen a full rollback of the pr-description merge.
