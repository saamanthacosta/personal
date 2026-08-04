## Why

The `merge-pr-description-skills` change combined `create-pr` and `update-pr-description` into a single `pr-description` skill, but on reflection the two activities are distinct enough to warrant separate descriptions: one creates a new PR, the other regenerates an existing one's body with mandatory preview and approval. The merge was structural convenience, not a true consolidation. We will revert it: restore `create-pr` and `update-pr-description` as standalone skills, drop the `pr-description` folder, and revert the canonical spec changes that the merge introduced. The `skill-folder-conventions` capability's "mode-specific references" rule stays, since the rule is independently useful and not tied to the merge.

## What Changes

- Restore `.agents/skills/create-pr/SKILL.md` and `.agents/skills/create-pr/references/pr-style.md` from git history.
- Restore `.agents/skills/update-pr-description/SKILL.md` from git history.
- Delete `.agents/skills/pr-description/`.
- Delete `openspec/changes/archive/2026-08-04-merge-pr-description-skills/`.
- Revert the canonical `pr-description-sync` spec to its pre-merge state (the spec is about `update-pr-description` and `create-pr` separately, not a merged `pr-description`).
- Revert the addition of the "Skill MAY dispatch to mode-specific references" requirement in the canonical `skill-folder-conventions` spec, but keep the requirement code-level if it is still useful for `skill-authoring`. (Decision to be confirmed in design.)
- Drop the "merge-pr-description-skills" History entry from any spec that referenced it.
- Drop the "pr-description skill" entry from `## Notes` in PR #21's body.

## Capabilities

### New Capabilities
- (none — this is a pure revert.)

### Modified Capabilities
- `pr-description-sync`: revert to the pre-merge state where it governs `create-pr` and `update-pr-description` as separate skills.
- `skill-folder-conventions`: drop the "Skill MAY dispatch to mode-specific references" requirement. (Confirmed in design — the requirement is not used by any skill after the revert, since `skill-authoring` does not use mode-specific references.)

## Impact

- **Affected files (≈10):** restored `create-pr/` and `update-pr-description/`; deleted `pr-description/`; deleted the merge archive; reverted `pr-description-sync` and `skill-folder-conventions` specs.
- **No behavior change** in any of the kept skills. The two restored skills behave exactly as they did before the merge.
- **PR #21**: the body will be regenerated to remove the pr-description bullet from `## Notes`.
