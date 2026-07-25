---
name: create-skill
description: Create a reusable `SKILL.md` for the personal `.agents/skills/` directory, generalizing a methodology observed in the conversation or from an explicit user request. Use ONLY when the user explicitly asks to author or capture a new skill. When loaded inside an active `create-task` workflow, act as a bounded specialist phase, return control to the parent orchestrator after validation, and never terminate the parent lifecycle.
license: MIT
compatibility: Local machine skill — requires OpenCode and the built-in `customize-opencode` skill for structural guidance.
metadata:
  author: personal
  version: "1.1"
---

# Create Skill

You are an authoring assistant for reusable OpenCode skills. You help the user turn an observed methodology or explicit request into an effective `SKILL.md` that lives in this repository's personal `.agents/skills/` directory.

Before authoring, determine the execution context:

- **Standalone:** the user invoked `create-skill` directly; this skill owns completion.
- **Nested:** `create-task` loaded this skill as specialist guidance; `create-task` owns
  the lifecycle and this skill returns control after authoring and validation.

## 1. Extract from conversation

Before drafting anything, review the conversation history for a reusable methodology:

- A coherent sequence of steps or phases
- Decision points, branch logic, and quality gates
- Guardrails, anti-patterns, or completion criteria

If a clear workflow emerges, capture it. Do not reimplement rules that exist in canonical skills (for example, commit-message formatting or PR description structure); reference those skills instead.

## 2. Clarify only what is missing

When the conversation does not establish a reliable reusable workflow, ask focused questions about the outcome the user wants and the depth of workflow they expect. Skip clarification when the methodology is already clear from context.

## 3. Draft the skill

Write the file to `.agents/skills/<name>/SKILL.md` where `<name>` is the kebab-case skill name. Use the built-in `customize-opencode` skill as the canonical reference for frontmatter shape, naming, description quality, optional fields, and trigger conventions.

Frontmatter requirements:

- `name`: lowercase kebab-case, must match the folder name, max 64 chars
- `description`: third-person, front-loaded, covering both **what** the skill does and **when** to use it
- Optional: `license`, `compatibility`, `metadata`

OpenCode recognizes only those five frontmatter fields. Do not introduce or rely
on unknown fields to control invocation; unsupported fields are ignored.

Body requirements when applicable:

- Inputs the skill expects
- Workflow phases or decision points
- Quality criteria or completion checks
- Guardrails or anti-patterns
- Example outputs or invocations

## 4. Critique and resolve material ambiguity

After drafting, inspect the most ambiguous or weak sections. Ask the user about any ambiguity that materially changes behavior — outputs, branches, or safety boundaries. If no material ambiguity remains, finalize without inventing a question.

## 5. Validate before finishing

Confirm before closing:

- The folder path is `.agents/skills/<name>/SKILL.md` and no copy was written under `.opencode/`, `~/.config/opencode/`, or any global configuration location.
- The frontmatter `name` matches the folder name and the description is third-person and trigger-oriented.
- Frontmatter contains only `name`, `description`, `license`, `compatibility`, and `metadata`.
- The body defines concrete inputs, workflow, and completion criteria.
- Required structural rules are met per the loaded `customize-opencode` guidance.

## 6. Complete according to execution context

### Standalone

When the user invoked `create-skill` directly, report:

- What the skill produces (one paragraph)
- Representative invocation prompts they can use to trigger it
- Optional related customizations to consider next
- The reminder that OpenCode must be restarted before the new skill loads

Then stop; the user owns any follow-up work.

### Nested inside `create-task`

When `create-task` loaded this skill, do not emit the standalone summary, restart
reminder, or follow-on suggestions. If material clarification is required, ask the
focused question and do not emit a completed specialist boundary until authoring
and validation pass. After validation, emit only:

```
## Specialist Phase: create-skill — done
- Result: .agents/skills/<name>/SKILL.md
- Status: validated
- Next: verify (return control to create-task)
```

The parent workflow then continues with verification, archive, security reporting,
commit, push, and PR phases. Specialist completion is not task completion.

## Guardrails

- Write skills only under `.agents/skills/<name>/SKILL.md`. Reject any other output location.
- Do not produce application code, agents, commands, plugins, or MCP configuration.
- Do not depend on a separately maintained `skills.md`; use the built-in `customize-opencode` skill at runtime instead.
- Do not auto-create related customizations; surface them as suggestions only during standalone use.
- Standalone invocation requires an explicit user request to author or capture a skill.
- Do not claim that unknown frontmatter fields can prevent model invocation.
- When nested, never terminate or replace the active `create-task` workflow.
