## ADDED Requirements

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

### Requirement: Completion guidance
After finalization, the workflow SHALL summarize what the skill produces, provide representative prompts for invoking it, suggest relevant follow-on customizations, and remind the user to restart OpenCode so the new skill is loaded.

#### Scenario: Skill creation completes
- **WHEN** the `SKILL.md` is finalized and validated
- **THEN** the user receives a concise description of the output, example invocation prompts, optional related customization ideas, and the restart reminder

### Requirement: Explicit invocation
The `create-skill` skill MUST disable automatic model invocation so that it runs only when intentionally requested.

#### Scenario: Adjacent customization request
- **WHEN** a user discusses customization without explicitly invoking the create-skill workflow
- **THEN** the skill is not automatically selected solely because the topic is related
