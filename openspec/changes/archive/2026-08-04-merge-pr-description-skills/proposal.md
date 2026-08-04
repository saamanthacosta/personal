## Why

`create-pr` and `update-pr-description` are co-located in purpose — both manage a Pull Request's title and structured body using the same `references/pr-style.md` template. The split was an artifact of when each was introduced, not a real separation of concerns. The user action is the same activity (manage a PR description) with different starting states. We will replace both with a single `pr-description` skill that dispatches on a runtime mode (open vs. regenerate) and loads a mode-specific `references/` note for the workflow details.

## What Changes

- Introduce `.agents/skills/pr-description/SKILL.md` — a single skill that handles both PR management modes.
- Introduce `.agents/skills/pr-description/references/pr-style.md` — the shared body template (moved from `create-pr/references/pr-style.md`; identical content).
- Introduce `.agents/skills/pr-description/references/pr-open.md` — the create-mode workflow: readiness checks, `gh pr create` command, title/description construction, assignee.
- Introduce `.agents/skills/pr-description/references/pr-regenerate.md` — the update-mode workflow: read current body, compute new body, side-by-side preview, `gh pr edit --body-file` after approval.
- Delete `.agents/skills/create-pr/` and `.agents/skills/update-pr-description/`.
- Update any cross-skill references that named `create-pr` or `update-pr-description` (the `create-task` orchestrator body and `openspec-archive-change` body reference these names; verify with grep).
- Update the `skill-folder-conventions` canonical spec to allow a single `SKILL.md` to dispatch to mode-specific `references/` notes.

## Capabilities

### New Capabilities
- (none — the capability surface is already covered by `skill-folder-conventions` and `skill-authoring`.)

### Modified Capabilities
- `skill-folder-conventions`: add a requirement clarifying that a single `SKILL.md` MAY dispatch between mode-specific `references/` notes, and that each mode MUST load its own note rather than reading a multi-mode document.
- `skill-authoring`: no change. The merged `pr-description` skill follows the same authoring rules the `skill-authoring` capability already enforces.

## Impact

- **Affected files (≈8):** two `SKILL.md` bodies deleted, one new `SKILL.md` created, three new `references/` notes created (one shared `pr-style.md` plus two mode-specific), any cross-skill references updated.
- **Affected skills:** `create-task` (orchestrator body references `create-pr` and `update-pr-description`); `openspec-archive-change` (body references `update-pr-description`); `pr-review-comments` (no references — read-only).
- **No data, auth, or trust-boundary change.** The merged skill uses the same `gh` commands and gates as the two predecessors.
