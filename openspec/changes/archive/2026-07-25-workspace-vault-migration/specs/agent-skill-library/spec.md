## ADDED Requirements

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
