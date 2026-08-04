## Context

`create-pr` and `update-pr-description` are two skills that share the same purpose: manage a Pull Request's title and structured description using the same template (defined in `references/pr-style.md`). The two are different in mode — one creates a new PR, the other regenerates an existing one — but the underlying activity is "produce a PR description that follows the workspace style".

The split is a leftover from how the skills were introduced. The user has now consolidated similar splits twice before (`create-skill` + `update-skill` → `skill-authoring`), and the same logic applies here.

## Goals / Non-Goals

**Goals:**
- Replace `.agents/skills/create-pr/` and `.agents/skills/update-pr-description/` with a single `.agents/skills/pr-description/`.
- One description, one set of frontmatter rules, one validation pass.
- The merged skill dispatches on a runtime mode (open vs. regenerate) chosen from the user's prompt and the GitHub PR state.
- Each mode loads its own `references/` note (rather than the body cramming both workflows).

**Non-Goals:**
- Touching the `gh` commands or the readiness gates.
- Renaming the shared `pr-style.md` template or changing its content.
- Adding new PR management capabilities (e.g. closing, requesting reviewers, adding labels).

## Decisions

### Single skill folder, name = `pr-description`

The merged skill lives at `.agents/skills/pr-description/SKILL.md`. The two existing folders are deleted.

Rationale: `pr-description` is concise, matches the capability (`pr-style.md` already lives in a `pr-`-prefixed file), and aligns with the `skill-authoring` precedent.

### Mode detection by user prompt + PR state

The skill body starts with a one-line mode-detection check:

| User's prompt | PR state | Mode |
| --- | --- | --- |
| "open / create / send a PR" | no PR exists for the branch | **open** |
| "refresh / update / regenerate / sync / fix a PR description" | an OPEN PR exists for the branch | **regenerate** |
| ambiguous | — | ask one focused question |

The body calls `gh pr view` to determine the PR state when the prompt is ambiguous. If neither state matches the prompt, the skill asks before reading further.

### Mode-specific `references/` notes

The body holds only the shared context detection, the mode-dispatch logic, and the description template pointer. The mode-specific workflow details live in two separate notes:

- `references/pr-style.md` — the body template (Summary, Why, Changes, File tree, Commits, Notes). Moved unchanged from `create-pr/references/`. Both modes load this when constructing the body.
- `references/pr-open.md` — the create-mode workflow: readiness checks (clean tree, branch pushed, no existing PR), `gh pr create` command, title rules, assignee.
- `references/pr-regenerate.md` — the update-mode workflow: read current body, compute new body from `merge-base..HEAD`, side-by-side preview, approval gate, `gh pr edit --body-file`.

The body tells the model to load only the relevant note (e.g., "if mode is `open`, load `references/pr-open.md`; if mode is `regenerate`, load `references/pr-regenerate.md`; both modes also load `references/pr-style.md`"). This keeps the body short and lets the model's progressive disclosure pick up only what the current invocation needs.

### Description front-loads both trigger phrases

The frontmatter `description` includes the trigger phrases for both modes so the model's matching stays robust. The body resolves the mode before reading any reference.

## Risks / Trade-offs

- [Risk] The merged description is less trigger-specific than the two narrower ones. → [Mitigation] Front-load the trigger phrases for both modes; add a `## Detect mode` section that makes the branching explicit.
- [Risk] Cross-skill references that named `create-pr` or `update-pr-description` (e.g. `create-task/SKILL.md`, `openspec-archive-change/SKILL.md`) become stale. → [Mitigation] Run `rg -n 'create-pr|update-pr-description'` after the move; update every hit in the same change.
- [Risk] If the model misroutes the prompt (e.g. user says "open a PR" but the prompt is ambiguous about whether one already exists), the mode detection could pick the wrong branch. → [Mitigation] The body always calls `gh pr view` to confirm the state before dispatching; the readiness gates in `pr-open.md` and the OPEN-only check in `pr-regenerate.md` catch the mismatch.

## Security Considerations

- **Data touched:** none beyond PR title/description/body content the user already has access to.
- **Trust boundaries crossed:** none. The skill runs the same `gh` commands as the two predecessors.
- **New dependencies / external services:** none.
- **Persistence:** unchanged.
- **Auth / sessions / tokens / permissions:** unchanged. The skill relies on the same `gh` auth as `create-pr` and `update-pr-description`.

**Residual risk:** low. The merge is a structural consolidation; the underlying behavior is unchanged.

## Migration Plan

1. Create `.agents/skills/pr-description/SKILL.md` with the merged body (shared context detection + mode dispatch + description template pointer).
2. Move `pr-style.md` from `create-pr/references/` to `pr-description/references/`.
3. Create `.agents/skills/pr-description/references/pr-open.md` and `.agents/skills/pr-description/references/pr-regenerate.md` by splitting the body of the two predecessors.
4. Delete `.agents/skills/create-pr/` and `.agents/skills/update-pr-description/`.
5. Run `rg -n 'create-pr|update-pr-description'` and fix every cross-skill reference.
6. Sync the `skill-folder-conventions` canonical spec with the new "mode-specific references" requirement.
7. Commit as: `Add pr-description skill`, `Drop create-pr and update-pr-description`, `Update cross-skill references`.
8. Push the new commits to the existing branch; GitHub will update PR #21.

## Open Questions

None. The user has chosen to merge with mode-specific reference files.
