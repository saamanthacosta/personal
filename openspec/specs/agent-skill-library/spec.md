# agent-skill-library Specification

## Purpose
TBD - created by archiving change workspace-vault-migration. Update Purpose after archive.
## Requirements
### Requirement: Shared skill library contains approved reusable capabilities
The root `.agents/skills/` library SHALL contain the approved reusable OpenSpec lifecycle, commit, PR, CVE-security, and Obsidian vault-linking skills with valid frontmatter and unique names.

#### Scenario: Skill inventory is complete
- **WHEN** migration validation enumerates `.agents/skills/`
- **THEN** each approved capability has exactly one `SKILL.md` at its canonical path

#### Scenario: Project-specific skill remains scoped
- **WHEN** a skill contains lazyFinances-specific test setup or source assumptions
- **THEN** it remains project-local or is explicitly generalized before being added to the root library

### Requirement: CVE methodology is available to the shared workflow
The shared skill library SHALL expose the CVE severity ladder, threat-model questions, proposal hygiene check, working-tree audit, staged-diff scan, and override rules to the universal task workflow.

#### Scenario: CVE gates can resolve their tooling
- **WHEN** the workflow invokes a CVE gate from a supported project
- **THEN** the skill resolves scanner scripts and project paths without requiring `.opencode/skills/` or a lazyFinances-specific directory

#### Scenario: Severity behavior remains consistent
- **WHEN** a scan reports CRITICAL, HIGH, MEDIUM, or LOW findings
- **THEN** the workflow applies the severity and override behavior defined by the shared methodology document

### Requirement: PR review skills are part of the approved library
The root `.agents/skills/` library SHALL include `pr-review-comments` and `fix-pr-review-comments` in the approved PR-category inventory, with valid frontmatter and unique names following the same rules as the rest of the library.

#### Scenario: Library lists both PR review skills
- **WHEN** the library inventory enumerates `.agents/skills/`
- **THEN** both `pr-review-comments/SKILL.md` and `fix-pr-review-comments/SKILL.md` exist with valid frontmatter

#### Scenario: Skill names do not collide
- **WHEN** the library validates skill folder names
- **THEN** `pr-review-comments` and `fix-pr-review-comments` do not collide with any other skill folder name

### Requirement: Shared skills use supported OpenCode metadata
Every shared skill SHALL limit behavioral claims to mechanisms OpenCode recognizes and MUST NOT rely on ignored frontmatter fields to control whether the model may load or select the skill.

#### Scenario: Skill frontmatter is validated
- **WHEN** a shared `SKILL.md` is created or modified
- **THEN** its behavioral frontmatter uses only OpenCode-recognized fields and unknown fields are not treated as enforceable controls

#### Scenario: Invocation boundary is required
- **WHEN** a skill must distinguish standalone use from use inside an orchestrated workflow
- **THEN** the supported description and operational instructions state the ownership boundary without claiming an unsupported runtime guarantee

#### Scenario: Unsupported invocation field is discovered
- **WHEN** validation finds `disable-model-invocation` or another unrecognized invocation-control field in a shared skill
- **THEN** the field and its guarantee claims are removed or replaced before the skill is considered complete

