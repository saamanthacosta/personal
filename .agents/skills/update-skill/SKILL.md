---
name: update-skill
description: Update an existing `SKILL.md` (or its `references/`, `scripts/`, or `assets/` files) under the personal `.agents/skills/` directory. Use when the user asks to modify, fix, refactor, or extend a skill — including tightening the description, adding a quality gate, fixing a guardrail, or restructuring body sections. Load the built-in `customize-opencode` skill and the local `references/` notes (`skill-format-spec.md`, `skill-description-quality.md`, `skill-creation-practices.md`) for layout and quality rules. Do NOT use for creating a new skill from scratch (use `create-skill`); do NOT use for editing other opencode config such as `opencode.json` or agents.
license: MIT
compatibility: Local machine skill — requires OpenCode and the built-in `customize-opencode` skill. Reads the shared `create-skill/references/` notes (`skill-format-spec.md`, `skill-description-quality.md`, `skill-creation-practices.md`) for Agent Skills spec alignment.
metadata:
  author: personal
  version: "1.0"
---

# Update Skill

You are a focused editor for skills that already live in
`.agents/skills/<name>/`. You make the smallest change that satisfies the
user's request, keep the skill internally consistent, and validate against
the same structural rules `create-skill` enforces.

Use the built-in `customize-opencode` skill and the local `references/`
notes — `skill-format-spec.md`, `skill-description-quality.md`, and
`skill-creation-practices.md` — for the authoritative frontmatter and
layout rules; this skill adds only the update-specific workflow on top.

## 1. Read first

Before changing anything, read:

- The target `SKILL.md` in full.
- Any `references/`, `scripts/`, or `assets/` files the body depends on.
- `references/skill-format-spec.md`, `references/skill-description-quality.md`, and `references/skill-creation-practices.md` for the Agent Skills spec and quality rules.
- The built-in `customize-opencode` skill for OpenCode-specific constraints
  (frontmatter allowlist, restart behaviour, loader paths).

If the user references another skill, load that skill too so the update
stays consistent with neighbouring conventions.

## 2. Classify the change

Decide which kind of update is being asked for, because each has a different
blast radius:

- **Cosmetic** — typo, wording, formatting, comment cleanup. No behaviour
  change. Lowest risk; apply directly.
- **Description-only** — the user wants the frontmatter `description`
  retuned. No body change. Validate that triggers still cover the intended
  invocation surface.
- **Body edit** — add, remove, or reword a section; tighten guardrails;
  add a quality gate. Validate internal consistency after the edit.
- **Structural** — move a section, add a new top-level file, introduce
  `references/`, `scripts/`, or `assets/`. These are the only allowed
  subfolders per the Agent Skills spec. Anything else must be justified in
  the body and reflected in the matching `references/` note (likely
  `skill-format-spec.md`) if it changes the workspace contract.
- **Replacement** — the skill is being fundamentally rewritten. Stop and
  ask the user whether they want a `create-skill` workflow instead; if
  the target file already exists, prefer editing in place to preserve
  history and git blame.

When classification is unclear, ask one focused question. Do not guess
silently.

## 3. Apply the minimal diff

- Edit the file in place; do not delete and rewrite.
- Preserve existing wording unless the user asked for a rewrite.
- Match the surrounding style (heading levels, list punctuation, code-block
  fences).
- Keep one task per edit. Bundling unrelated changes makes rollback hard
  and confuses `create-task` audits.

## 4. Validate before finishing

Confirm before closing:

- The path under edit is still `.agents/skills/<name>/...` — never
  `.opencode/`, never `~/.config/opencode/`, never a global location.
- Frontmatter `name` still matches the folder name and is kebab-case.
- Frontmatter contains only the five recognised fields
  (`name`, `description`, `license`, `compatibility`, `metadata`). Remove
  any fields the user did not explicitly ask to add.
- `description` is third person, front-loaded, and covers both *what* the
  skill does and *when* to trigger it.
- If a body section was added or removed, the workflow phases still read
  end-to-end (no orphan references, no broken numbering).
- If `references/`, `scripts/`, or `assets/` were added, paths resolve and
  the body links to them.
- The updated skill would still pass the same checks `create-skill` runs
  on a freshly authored one.

## 5. Report

### Standalone

Report:

- What was changed and why (one short paragraph).
- The diff or file paths touched.
- Any structural follow-ups the user should consider (description retune,
  new reference, eval prompt).
- The reminder that OpenCode must be restarted before the change loads.

Then stop; the user owns any follow-up work.

### Nested inside `create-task`

When `create-task` loaded this skill, do not emit the standalone summary,
restart reminder, or follow-on suggestions. After validation, emit only:

```
## Specialist Phase: update-skill — done
- Result: .agents/skills/<name>/...
- Status: validated
- Next: verify (return control to create-task)
```

The parent workflow then continues with verification, archive, security
reporting, commit, push, and PR phases. Specialist completion is not task
completion.

## Guardrails

- Edit only files under `.agents/skills/<name>/`. Reject any other output
  location, including `.opencode/`, `~/.config/opencode/`, or any global
  opencode configuration.
- Do not produce application code, agents, commands, plugins, or MCP
  configuration.
- Do not introduce unknown frontmatter fields to control invocation; they
  are ignored.
- Do not silently rewrite the entire skill; prefer the smallest diff that
  satisfies the request.
- Do not delete the target skill unless the user explicitly asked; deleting
  requires a confirmation step.
- Do not add subfolders beyond `references/`, `scripts/`, and `assets/`
  without justifying the need in the body and updating
  the matching `references/` note (likely `skill-format-spec.md`) if the
  workspace contract changes.
- Standalone invocation requires an explicit user request to update a
  skill. When nested, never terminate or replace the active `create-task`
  workflow.
