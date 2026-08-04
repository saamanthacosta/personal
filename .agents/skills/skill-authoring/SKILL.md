---
name: skill-authoring
description: Create or update a reusable `SKILL.md` for the personal `.agents/skills/` directory, generalizing a methodology observed in the conversation or from an explicit user request. Use when the user asks to author, capture, create, or update a skill — including fixing a broken skill, tightening a description, adding a quality gate, or restructuring body sections. Load the built-in `customize-opencode` skill and the local `references/` notes (`skill-format-spec.md`, `skill-description-quality.md`, `skill-creation-practices.md`) for frontmatter and layout rules. Do NOT use for editing other opencode config such as `opencode.json` or agents. When loaded inside an active `create-task` workflow, act as a bounded specialist phase, return control to the parent orchestrator after validation, and never terminate the parent lifecycle.
license: MIT
compatibility: Local machine skill — requires OpenCode and the built-in `customize-opencode` skill for structural guidance.
metadata:
  author: personal
  version: "2.0"
---

# Skill Authoring

You are an authoring assistant for reusable OpenCode skills. You help the user turn an observed methodology or explicit request into an effective `SKILL.md` that lives in this repository's personal `.agents/skills/` directory. The skill handles two modes — **create** (target skill does not exist yet) and **update** (target skill already exists at `.agents/skills/<name>/SKILL.md`) — dispatched automatically from the user's prompt and the file system.

Before authoring, determine the execution context:

- **Standalone:** the user invoked `skill-authoring` directly (or said "create a new skill" / "update the X skill"); this skill owns completion.
- **Nested:** `create-task` loaded this skill as specialist guidance; `create-task` owns the lifecycle and this skill returns control after authoring and validation.

## 1. Detect mode

Before reading the target file, decide which mode applies:

| User's prompt | Target file present? | Mode |
| --- | --- | --- |
| "create a new skill called X" or "add a skill for X" | not present (or no `X` named yet) | **create** |
| "update the X skill" or "fix the X skill" | present at `.agents/skills/x/SKILL.md` | **update** |
| ambiguous (no mode, no name) | — | ask one focused question before reading |

If the prompt names the target skill but does not name the mode, infer from the file system: present → update; absent → create. Never guess silently when the prompt is ambiguous on both axes.

## 2. Extract from conversation

Before drafting anything, review the conversation history for a reusable methodology:

- A coherent sequence of steps or phases
- Decision points, branch logic, and quality gates
- Guardrails, anti-patterns, or completion criteria

If a clear workflow emerges, capture it. Do not reimplement rules that exist in canonical skills (for example, commit-message formatting or PR description structure); reference those skills instead.

## 3. Clarify only what is missing

When the conversation does not establish a reliable reusable workflow, ask focused questions about the outcome the user wants and the depth of workflow they expect. Skip clarification when the methodology is already clear from context.

## 4. Author the skill (create mode)

Write the file to `.agents/skills/<name>/SKILL.md` where `<name>` is the kebab-case skill name. Use the built-in `customize-opencode` skill and the local `references/` notes — `skill-format-spec.md` for layout and frontmatter, `skill-description-quality.md` for the description rules, and `skill-creation-practices.md` for body conventions and validation — as the canonical references.

Frontmatter requirements:

- `name`: lowercase kebab-case, must match the folder name, max 64 chars
- `description`: third-person, front-loaded, covering both **what** the skill does and **when** to use it
- Optional: `license`, `compatibility`, `metadata`

OpenCode recognizes only those five frontmatter fields. Do not introduce or rely on unknown fields to control invocation; unsupported fields are ignored.

Body requirements when applicable:

- Inputs the skill expects
- Workflow phases or decision points
- Quality criteria or completion checks
- Guardrails or anti-patterns
- Example outputs or invocations

## 5. Author the skill (update mode)

Edit the target file in place. Apply the minimal diff that satisfies the request — preserve existing wording unless the user asked for a rewrite, match the surrounding style (heading levels, list punctuation, code-block fences), and keep one task per edit. Match the file's current `name` and folder name; do not rename without explicit user approval.

After each edit, re-validate the same structural rules the create branch enforces (frontmatter, description, body shape). If the change is structural (move a section, add a subfolder, rename), update the matching `references/` note if one exists for the workspace contract.

## 6. Critique and resolve material ambiguity

After drafting or editing, inspect the most ambiguous or weak sections. Ask the user about any ambiguity that materially changes behavior — outputs, branches, or safety boundaries. If no material ambiguity remains, finalize without inventing a question.

## 7. Validate before finishing

Confirm before closing:

- The folder path is `.agents/skills/<name>/SKILL.md` and no copy was written under `.opencode/`, `~/.config/opencode/`, or any global configuration location.
- The frontmatter `name` matches the folder name and the description is third-person and trigger-oriented.
- Frontmatter contains only `name`, `description`, `license`, `compatibility`, and `metadata`.
- The body defines concrete inputs, workflow, and completion criteria.
- Required structural rules are met per the loaded `customize-opencode` guidance and the three `references/` notes.

## 8. Complete according to execution context

### Standalone

When the user invoked `skill-authoring` directly (or asked to create or update a skill without an active `create-task` run), report:

- What the skill produces (one paragraph)
- Representative invocation prompts they can use to trigger it
- Optional related customizations to consider next
- The reminder that OpenCode must be restarted before the new or updated skill loads

Then stop; the user owns any follow-up work.

### Nested inside `create-task`

When `create-task` loaded this skill, do not emit the standalone summary, restart reminder, or follow-on suggestions. If material clarification is required, ask the focused question and do not emit a completed specialist boundary until authoring and validation pass. After validation, emit only:

```
## Specialist Phase: skill-authoring — done
- Result: .agents/skills/<name>/SKILL.md
- Status: validated
- Next: verify (return control to create-task)
```

The parent workflow then continues with verification, archive, security reporting, commit, push, and PR phases. Specialist completion is not task completion.

## Guardrails

- Write or edit skills only under `.agents/skills/<name>/SKILL.md`. Reject any other output location.
- Do not produce application code, agents, commands, plugins, or MCP configuration.
- Do not depend on a separately maintained `skills.md`; use the built-in `customize-opencode` skill at runtime instead.
- Do not auto-create related customizations; surface them as suggestions only during standalone use.
- Standalone invocation requires an explicit user request to author or update a skill. When nested, never terminate or replace the active `create-task` workflow.
- Do not claim that unknown frontmatter fields can prevent model invocation.
- In update mode, do not delete the target skill unless the user explicitly asked; deletion requires confirmation.
