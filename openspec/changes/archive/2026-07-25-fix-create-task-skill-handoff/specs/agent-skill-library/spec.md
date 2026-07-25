## ADDED Requirements

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
