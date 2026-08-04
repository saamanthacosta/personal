## Context

`create-skill` and `update-skill` are two skills that share the same purpose: author or modify a `SKILL.md` under `.agents/skills/<name>/`. They share the same `references/` notes (`skill-format-spec.md`, `skill-description-quality.md`, `skill-creation-practices.md`), the same built-in `customize-opencode` dependency, and the same hard refusal to touch anything outside `.agents/skills/`. The only difference between them is whether the target skill exists yet.

The split is a leftover from how the two skills were introduced (update was a follow-up to create), not a real separation of concerns. A user who says "create a new skill called X" and a user who says "update the X skill to add Y" are doing the same activity with different starting states.

## Goals / Non-Goals

**Goals:**
- Replace `.agents/skills/create-skill/` and `.agents/skills/update-skill/` with a single `.agents/skills/skill-authoring/`.
- One description, one set of frontmatter rules, one validation pass.
- The merged skill dispatches on a runtime mode (`create` or `update`) chosen from the user's prompt or a single clarifying question.

**Non-Goals:**
- Adding new authoring capabilities (script generation, asset scaffolding, etc.). The merge changes packaging, not behavior.
- Renaming the canonical `skill-authoring` spec — the spec already exists and the new skill keeps that name.
- Touching the `skill-folder-conventions` spec — the merged skill obeys the same three-folder model.

## Decisions

### Single skill folder, name = `skill-authoring`

The merged skill lives at `.agents/skills/skill-authoring/SKILL.md` and the `references/` notes move to `.agents/skills/skill-authoring/references/`. The two existing folders are deleted.

Rationale: `skill-authoring` is the canonical capability name in `openspec/specs/skill-authoring/`. Aligning the skill folder with the spec name keeps one mental concept per name.

### Mode detection by first-line question

The skill body starts with a one-line mode-detection question:

```
First: are you creating a new skill or updating an existing one?
  - create → the target skill does not exist yet
  - update → the target skill already exists at .agents/skills/<name>/SKILL.md
```

If the user's prompt already names the mode ("create a new skill", "update the X skill"), the skill uses that. If the prompt is ambiguous, the skill asks before reading the target file.

Alternative considered: a `--create` / `--update` flag in the body. Rejected because the skill is invoked by the model, not via CLI; flags are not the model's idiom.

Alternative considered: a frontmatter `mode` field on the skill itself. Rejected because a skill is a single entity — it cannot have two modes encoded statically. The mode is per-invocation.

### One description, mode-aware trigger language

The frontmatter `description` says the skill handles both creating and updating skills under `.agents/skills/`. The description is front-loaded with the trigger phrases for both modes so the model's matching stays robust.

The body retains a §"Detect mode" section that reads the user's prompt and the presence of `.agents/skills/<name>/SKILL.md` to choose the branch.

### References directory is the single source of truth

The three `references/` notes (`skill-format-spec.md`, `skill-description-quality.md`, `skill-creation-practices.md`) move to `skill-authoring/references/`. The notes themselves are unchanged — they already apply to both modes.

## Risks / Trade-offs

- [Risk] OpenCode needs to reload the skill library after the rename; until restart, the model may still see the old `create-skill` / `update-skill` entries. → [Mitigation] PR body and any user-facing note call out the restart. The `create-task` orchestrator's grep gate catches stale references in the change.
- [Risk] The merged description is less trigger-specific than the two narrower ones. → [Mitigation] Front-load the trigger phrases for both modes; add a `## Detect mode` section that makes the branching explicit in the body.
- [Risk] Cross-skill references that named `create-skill` or `update-skill` (e.g. `docs/skill-sessions/INDEX.md`) become stale. → [Mitigation] Run `rg -n 'create-skill|update-skill'` after the move; update every hit in the same change.

## Security Considerations

- **Data touched:** none.
- **Trust boundaries crossed:** none.
- **New dependencies / external services:** none.
- **Persistence:** unchanged.
- **Auth / sessions / tokens / permissions:** unchanged.
- **Specialist handoff:** none. The merge is mechanical; the resulting skill is loaded the same way both predecessors were.

**Residual risk:** low. The change is a folder rename plus a body consolidation.

## Migration Plan

1. Write `.agents/skills/skill-authoring/SKILL.md` with the merged body.
2. Move the three `references/` notes from `create-skill/references/` to `skill-authoring/references/`. (Or copy from `update-skill/references/`, which has the same content.)
3. Delete `.agents/skills/create-skill/` and `.agents/skills/update-skill/`.
4. Run `rg -n 'create-skill|update-skill'` and fix any cross-skill references.
5. Sync the `skill-authoring` canonical spec with the new dispatch requirement.
6. Update this PR's `## Summary` and `## File tree` to mention the merged skill.
7. Commit as: `Add skill-authoring skill`, `Drop create-skill and update-skill`, `Update cross-skill references`.
8. Push the new commits to the existing branch and let GitHub update PR #21.

## Open Questions

None. The user has chosen to fold the consolidation into PR #21 and asked for the same per-commit grouping discipline used in the rest of the PR.
