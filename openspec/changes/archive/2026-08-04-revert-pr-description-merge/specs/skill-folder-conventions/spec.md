## REMOVED Requirements

### Requirement: Skill MAY dispatch to mode-specific references
**Reason**: The requirement was added to support the now-reverted `pr-description` merge. After the revert, no skill in the library uses mode-specific `references/` notes — `skill-authoring` keeps its three references at the top level of `references/`, not split per mode. The requirement had no other consumer.
**Migration**: If a future skill ever needs mode dispatch, the requirement can be re-added with a concrete example. Until then, the canonical spec stays minimal.

## MODIFIED Requirements

(none — the existing requirements in `skill-folder-conventions` are unaffected by the revert.)

## History

- [[../changes/archive/2026-08-04-revert-pr-description-merge/proposal|revert-pr-description-merge (2026-08-04)]] — Revert the `merge-pr-description-skills` change. Restore `create-pr` and `update-pr-description` as separate skills; drop the "mode-specific references" requirement that was added for the merge.
- [[../changes/archive/2026-08-04-merge-pr-description-skills/proposal|merge-pr-description-skills (2026-08-04)]] — (Superseded by the revert above.) Added the "mode-specific references" requirement to support the merged `pr-description` skill.
- [[../changes/archive/2026-08-04-skill-folder-conventions/proposal|skill-folder-conventions (2026-08-04)]] — Introduce the canonical three-folder model and replace the legacy `bin/` + loose-file allowances.
