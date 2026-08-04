## MODIFIED Requirements

### Requirement: Personal repository destination
The skill authoring workflow MUST author skills only at `.agents/skills/<name>/SKILL.md`, where `<name>` is lowercase kebab-case and matches the skill frontmatter name. The workflow applies equally to creating a new skill and updating an existing one.

#### Scenario: New skill is saved
- **WHEN** the user approves creation of a skill named `example-skill`
- **THEN** the workflow writes only `.agents/skills/example-skill/SKILL.md` and does not create a copy under `.opencode/` or a global configuration directory

#### Scenario: Existing skill is updated in place
- **WHEN** the user approves an edit to a skill named `example-skill` that already exists at `.agents/skills/example-skill/SKILL.md`
- **THEN** the workflow edits that file in place and does not duplicate it under another path

### Requirement: Supported invocation boundary
The `skill-authoring` skill MUST express its standalone trigger and nested ownership boundary through its supported `description` field and body instructions. It MUST NOT rely on unknown frontmatter fields to control model invocation.

#### Scenario: Skill metadata is validated
- **WHEN** the `skill-authoring` frontmatter and instructions are reviewed
- **THEN** invocation behavior is described without `disable-model-invocation` or any other unsupported control field

#### Scenario: Adjacent customization request
- **WHEN** a user discusses customization without explicitly requesting standalone skill authoring
- **THEN** the description and body identify that `skill-authoring` is not the sole workflow owner unless directly invoked

## ADDED Requirements

### Requirement: Mode dispatch by presence of the target skill
The `skill-authoring` skill SHALL detect the authoring mode (create vs. update) from the user's prompt and from the presence of `.agents/skills/<name>/SKILL.md` on disk. The skill SHALL NOT require an explicit flag or frontmatter switch to choose the mode.

#### Scenario: User names a new skill in the prompt
- **WHEN** the user says "create a new skill called X" or "add a skill for X"
- **THEN** the skill dispatches to the create branch and writes `.agents/skills/x/SKILL.md` afresh

#### Scenario: User names an existing skill in the prompt
- **WHEN** the user says "update the X skill" or "fix the X skill" and `.agents/skills/x/SKILL.md` exists
- **THEN** the skill dispatches to the update branch and edits the file in place

#### Scenario: Ambiguous prompt is clarified before reading
- **WHEN** the user does not name a mode (create vs. update) and the skill name is not obviously new or existing
- **THEN** the skill asks one focused question to choose the mode before reading the target file

### Requirement: Single skill folder
The library SHALL contain exactly one skill that authors other skills, named `skill-authoring` and located at `.agents/skills/skill-authoring/`. No separate `create-skill` or `update-skill` skill folder SHALL exist.

#### Scenario: Library lists one authoring skill
- **WHEN** the library enumerates `.agents/skills/`
- **THEN** exactly one folder named `skill-authoring` exists and no folder named `create-skill` or `update-skill` is present

#### Scenario: Cross-skill references resolve
- **WHEN** any tracked file outside the change's archive references `create-skill` or `update-skill`
- **THEN** the reference is updated to `skill-authoring` or removed
