## ADDED Requirements

### Requirement: PR review skills are part of the approved library
The root `.agents/skills/` library SHALL include `pr-review-comments` and `fix-pr-review-comments` in the approved PR-category inventory, with valid frontmatter and unique names following the same rules as the rest of the library.

#### Scenario: Library lists both PR review skills
- **WHEN** the library inventory enumerates `.agents/skills/`
- **THEN** both `pr-review-comments/SKILL.md` and `fix-pr-review-comments/SKILL.md` exist with valid frontmatter

#### Scenario: Skill names do not collide
- **WHEN** the library validates skill folder names
- **THEN** `pr-review-comments` and `fix-pr-review-comments` do not collide with any other skill folder name