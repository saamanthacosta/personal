# skill-authoring Specification

## Purpose
TBD - created by archiving change add-create-skill. Update Purpose after archive.
## Requirements
### Requirement: Conversation-derived workflow extraction
The skill authoring workflow SHALL review the current conversation before drafting and SHALL extract any reusable sequence, decision points, branching logic, guardrails, and completion criteria it can reliably infer.

#### Scenario: Reusable methodology exists in conversation
- **WHEN** the conversation demonstrates a coherent multi-step methodology
- **THEN** the generated skill captures that methodology as reusable instructions rather than asking the user to restate it

#### Scenario: No coherent methodology exists
- **WHEN** the conversation does not establish a reliable reusable workflow
- **THEN** the workflow asks focused questions about the intended outcome and desired workflow depth before drafting

### Requirement: Personal repository destination
The skill authoring workflow MUST create skills only at `.agents/skills/<name>/SKILL.md`, where `<name>` is lowercase kebab-case and matches the skill frontmatter name.

#### Scenario: New skill is saved
- **WHEN** the user approves creation of a skill named `example-skill`
- **THEN** the workflow writes only `.agents/skills/example-skill/SKILL.md` and does not create a copy under `.opencode/` or a global configuration directory

### Requirement: Canonical OpenCode guidance
The workflow SHALL load and follow the built-in `customize-opencode` skill for skill format, frontmatter, naming, description, and trigger conventions.

#### Scenario: Structural guidance is needed
- **WHEN** the workflow prepares or validates a `SKILL.md`
- **THEN** it uses the current `customize-opencode` guidance instead of relying on a duplicated repository-local `skills.md`

### Requirement: Effective skill draft
The generated `SKILL.md` MUST include valid YAML frontmatter, a trigger-oriented description covering what the skill does and when to use it, and an actionable body describing inputs, workflow decisions, quality criteria, guardrails, and expected output where relevant.

#### Scenario: Draft validation
- **WHEN** an initial skill draft has been written
- **THEN** the workflow checks that its folder and frontmatter names match, its description is discoverable, and its instructions are sufficiently concrete to execute

### Requirement: Material ambiguity review
After drafting, the workflow SHALL identify weak or ambiguous behavior and SHALL ask the user about unresolved issues only when they materially affect the skill's operation.

#### Scenario: Material ambiguity remains
- **WHEN** the draft leaves an important outcome, branch, or safety boundary unresolved
- **THEN** the workflow presents the ambiguity clearly and requests the user's decision before finalizing

#### Scenario: Draft is already precise
- **WHEN** review finds no material ambiguity
- **THEN** the workflow finalizes without inventing a ceremonial clarification question

### Requirement: Context-appropriate completion guidance
After finalization, the workflow SHALL distinguish standalone invocation from use inside an active parent orchestrator. Standalone use SHALL summarize what the skill produces, provide representative prompts, suggest relevant follow-on customizations, and remind the user to restart OpenCode. Nested use SHALL report specialist-phase completion and return control without terminating the parent workflow.

#### Scenario: Standalone skill creation completes
- **WHEN** the `SKILL.md` is finalized and validated without an active parent orchestrator
- **THEN** the user receives a concise description of the output, example invocation prompts, optional related customization ideas, and the restart reminder

#### Scenario: Nested skill creation completes
- **WHEN** the `SKILL.md` is finalized and validated inside an active `create-task` workflow
- **THEN** the skill emits a specialist-phase boundary and returns control for verification, archive, security reporting, commit, push, and PR phases

### Requirement: Supported invocation boundary
The `create-skill` skill MUST express its standalone trigger and nested ownership boundary through its supported `description` field and body instructions. It MUST NOT rely on unknown frontmatter fields to control model invocation.

#### Scenario: Skill metadata is validated
- **WHEN** the `create-skill` frontmatter and instructions are reviewed
- **THEN** invocation behavior is described without `disable-model-invocation` or any other unsupported control field

#### Scenario: Adjacent customization request
- **WHEN** a user discusses customization without explicitly requesting standalone skill authoring
- **THEN** the description and body identify that `create-skill` is not the sole workflow owner unless directly invoked
