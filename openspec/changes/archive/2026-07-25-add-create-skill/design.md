## Context

The repository stores personal reusable skills under `.agents/skills/<name>/SKILL.md`. Existing skills use valid YAML frontmatter with a lowercase kebab-case name, a trigger-oriented description, optional compatibility and metadata fields, and a Markdown body containing operational guidance. The built-in `customize-opencode` skill provides the authoritative local guidance for skill structure, but the requested workflow additionally needs conversation extraction, iterative refinement, and an exclusive personal-repository destination.

## Goals / Non-Goals

**Goals:**

- Provide a reusable workflow for creating effective `SKILL.md` files.
- Prefer extracting an existing methodology from conversation history over asking the user to restate it.
- Ask focused questions when outcome, scope, or workflow depth remains unclear.
- Produce skills only under `.agents/skills/<name>/SKILL.md` in this repository.
- Validate structure, triggers, decisions, guardrails, and completion checks before finishing.

**Non-Goals:**

- Creating application code, agents, commands, plugins, or MCP configuration.
- Writing skills under `.opencode/`, `~/.config/opencode/`, or other global locations.
- Introducing a separate `skills.md` file whose guidance could drift from the built-in `customize-opencode` skill.
- Automatically creating related customizations without user approval.

## Decisions

### Use `customize-opencode` as the canonical structural reference

The workflow will load and follow the built-in `customize-opencode` skill instead of depending on a repository-local `skills.md` that does not exist. This keeps validation aligned with OpenCode's current skill-loader rules and avoids maintaining duplicate guidance.

Alternative: add `.agents/skills/create-skill/skills.md`. Rejected because it would duplicate platform conventions and could become stale.

### Restrict output to the personal `.agents` directory

Every generated skill will use `.agents/skills/<name>/SKILL.md`, with the folder name matching the frontmatter name. The workflow will not offer project `.opencode` or global destinations because the repository convention is explicit.

Alternative: preserve a workspace-versus-personal scope question from the source draft. Rejected because scope is predetermined in this repository; asking would create an invalid branch of the workflow.

### Extract before clarifying

The workflow first reviews the conversation for a repeatable process, decision points, and quality gates. It asks concise questions only when those elements cannot be inferred reliably. This reduces needless interrogation while preventing vague skills.

### Draft, critique, then finalize

The workflow writes an initial draft, reviews the most ambiguous or weak portions, and asks the user only about issues that materially affect behavior. When no material ambiguity remains, it may finalize without manufacturing a question. Completion includes structural validation, a concise outcome summary, example invocation prompts, and optional related customization ideas.

### Encode invocation boundaries with supported mechanisms

The new `create-skill` skill will express its standalone trigger through the supported `description` field and body instructions. It will not rely on unknown frontmatter fields, because OpenCode ignores fields other than `name`, `description`, `license`, `compatibility`, and `metadata`.

### Return control when nested in `create-task`

When `create-skill` is loaded during an active `create-task` workflow, authoring completion is a specialist phase boundary rather than task completion. The skill emits a nested completion block and returns control to `create-task`; standalone invocation retains the summary, examples, suggestions, and restart reminder.

## Risks / Trade-offs

- **Built-in guidance changes over time** → Load `customize-opencode` during each invocation rather than copying its complete contents into this skill.
- **Conversation extraction overgeneralizes a one-off action** → Require a coherent sequence, branch logic, and quality criteria; clarify when these are absent.
- **Iterative questions become ceremonial** → Ask only about material ambiguity and permit immediate finalization when the draft is already precise.
- **Output escapes the repository convention** → State the exclusive `.agents/skills/<name>/SKILL.md` path as a hard guardrail and validate it before writing.
- **A generated description does not trigger reliably** → Require third-person, front-loaded trigger language covering both what the skill does and when it applies.
- **Description-based routing remains probabilistic** → State standalone and nested ownership boundaries in both the description and body, and return control explicitly when `create-task` owns the lifecycle.

## Security Considerations

- Threat model summary: `create-skill` is a documentation-only prompt template that reads conversation context, drafts Markdown, and writes files under `.agents/skills/`. It executes no code, makes no network calls, and handles no user data.
- Affected data and trust boundaries: the only upstream trust is the OpenCode built-in `customize-opencode` skill, loaded for structural guidance only. No repositories, services, or runtime processes outside the current shell are touched.
- Third-party trust: `customize-opencode` is the single third-party reference; the workflow loads it but never executes any commands from it. The personal `.agents/` directory is the only write target, so misrouting is contained.
- Persistence: only Markdown files under `.agents/skills/<name>/SKILL.md`. No database, cache, or log writes. Existing skills are never modified.
- Privilege escalation surface: none. The skill is invoked by user intent and inherits OpenCode's normal permissions; it does not request `bash` or expanded edit scopes.
- Residual risk: a generated description may misclassify adjacency and trigger the skill on unrelated topics. Mitigated by redundant trigger wording and explicit nested return-control instructions, not by an unsupported frontmatter guarantee.
