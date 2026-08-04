## REMOVED Requirements

### Requirement: Library inventory registration
**Reason**: Reverted to the pre-merge state where the library contains `create-pr` and `update-pr-description` as separate skills. The merged `pr-description` skill is no longer in the library.
**Migration**: Library inventory is governed by the pre-merge `agent-skill-library` and `pr-description-sync` specs, which already require `create-pr` and `update-pr-description` as separate entries.

## MODIFIED Requirements

### Requirement: Branch-state-driven PR body regeneration
The `update-pr-description` skill SHALL recompute the body of an open Pull Request from the branch's current commit range (`git merge-base <default-branch> HEAD..HEAD`) and SHALL apply it via `gh pr edit --body-file` after the user has approved a side-by-side preview.

#### Scenario: Skill regenerates a stale PR body
- **WHEN** the current branch has a PR that is `OPEN` and the working tree contains no unstaged or uncommitted modifications to tracked files
- **THEN** the skill recomputes Summary, Changes, File tree, and Commits from the current branch state, prints the proposed body alongside the current body for review, and applies the change only after the user confirms

#### Scenario: Title is not modified
- **WHEN** the skill regenerates the body
- **THEN** the PR title is left untouched unless the user explicitly passes a `--title` flag

### Requirement: Template parity with `create-pr`
The regenerated body SHALL follow the same section structure and formatting rules that `create-pr` enforces, as documented in `.agents/skills/create-pr/references/pr-style.md`, so a regenerated body is byte-shape identical to one produced at PR open.

#### Scenario: Section ordering and headings match create-pr
- **WHEN** the skill writes the proposed body
- **THEN** it contains `## Summary`, `## Changes`, `## File tree`, `## Commits` in that order, each separated by a blank line, with paragraphs kept on single lines (no soft-wrap inside a phrase)

#### Scenario: Notes section is preserved when present
- **WHEN** the current PR body contains a `## Notes` section
- **THEN** the regenerated body carries that section forward verbatim below the four mechanical sections

## History

- [[../changes/archive/2026-08-04-revert-pr-description-merge/proposal|revert-pr-description-merge (2026-08-04)]] — Revert the `merge-pr-description-skills` change. The library contains `create-pr` and `update-pr-description` as separate skills, not a merged `pr-description`.
- [[../changes/archive/2026-08-04-merge-pr-description-skills/proposal|merge-pr-description-skills (2026-08-04)]] — (Superseded by the revert above.) Added the mode-specific references rule and updated the library inventory for the merged `pr-description` skill.
- [[../changes/archive/2026-07-25-add-update-pr-description-skill/proposal|add-update-pr-description-skill (2026-07-25)]] — Adds `update-pr-description` to keep an open PR's body in sync with the branch without closing and reopening it.
