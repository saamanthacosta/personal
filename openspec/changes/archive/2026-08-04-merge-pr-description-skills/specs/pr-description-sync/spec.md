## MODIFIED Requirements

### Requirement: Branch-state-driven PR body regeneration
The `pr-description` skill in regenerate mode SHALL recompute the body of an open Pull Request from the branch's current commit range (`git merge-base <default-branch> HEAD..HEAD`) and SHALL apply it via `gh pr edit --body-file` after the user has approved a side-by-side preview.

#### Scenario: Skill regenerates a stale PR body
- **WHEN** the current branch has a PR that is `OPEN` and the working tree contains no unstaged or uncommitted modifications to tracked files
- **THEN** the skill recomputes Summary, Changes, File tree, and Commits from the current branch state, prints the proposed body alongside the current body for review, and applies the change only after the user confirms

#### Scenario: Title is not modified
- **WHEN** the skill regenerates the body
- **THEN** the PR title is left untouched unless the user explicitly passes a `--title` flag

### Requirement: Template parity with `pr-description` open mode
The regenerated body SHALL follow the same section structure and formatting rules that `pr-description` in open mode enforces, as documented in `.agents/skills/pr-description/references/pr-style.md`, so a regenerated body is byte-shape identical to one produced at PR open.

#### Scenario: Section ordering and headings match open mode
- **WHEN** the skill writes the proposed body
- **THEN** it contains `## Summary`, `## Changes`, `## File tree`, `## Commits` in that order, each separated by a blank line, with paragraphs kept on single lines (no soft-wrap inside a phrase)

#### Scenario: Notes section is preserved when present
- **WHEN** the current PR body contains a `## Notes` section
- **THEN** the regenerated body carries that section forward verbatim below the four mechanical sections

### Requirement: Library inventory registration
The root `.agents/skills/` library SHALL contain `pr-description` with valid frontmatter and a unique name, and `.agents/skills/README.md` SHALL list it under the `Personal/.agents/skills/` block alongside the other PR-category skills. The library SHALL NOT contain separate `create-pr` or `update-pr-description` folders.

#### Scenario: pr-description skill is present
- **WHEN** the library inventory enumerates `.agents/skills/`
- **THEN** `.agents/skills/pr-description/SKILL.md` exists with valid frontmatter and a unique name

#### Scenario: No separate create-pr or update-pr-description
- **WHEN** the library enumerates `.agents/skills/`
- **THEN** no folder named `create-pr` or `update-pr-description` is present

#### Scenario: skills-folder layout lists the new skill
- **WHEN** `.agents/skills/README.md` is read
- **THEN** the `Personal/.agents/skills/` block includes `pr-description` in its listing

## REMOVED Requirements

### Requirement: Strict stop conditions
**Reason**: Strict stop conditions are now enforced by the regenerate-mode reference note (`references/pr-regenerate.md` §1, §2, §10), which the merged skill loads on demand. The capability surface no longer needs to encode the same conditions in a standalone spec; the mode-dispatch rule in the new `skill-folder-conventions` requirement ensures the workflow detail lives in the mode-specific reference.
**Migration**: Stop conditions are documented in `.agents/skills/pr-description/references/pr-regenerate.md` (no PR on branch, MERGED/CLOSED state, dirty working tree, untracked-only warning).

### Requirement: Mandatory preview and explicit approval
**Reason**: The preview-and-approval flow is now part of the regenerate-mode reference note and does not need to be a separate capability-level requirement.
**Migration**: Preview and approval rules are documented in `.agents/skills/pr-description/references/pr-regenerate.md` §6 and §7.

### Requirement: No new dependencies or persistence
**Reason**: The dependency and persistence rules for PR management are now documented in the merged skill's body §5 (Guardrails) and in the regenerate-mode reference. Codifying them as a separate capability-level requirement is redundant once both modes live in one skill.
**Migration**: Rules live in `.agents/skills/pr-description/SKILL.md` §5 (Guardrails) and the mode-specific references.
