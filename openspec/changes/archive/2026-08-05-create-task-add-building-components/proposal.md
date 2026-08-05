## Why

The `create-task` orchestrator currently has no enumerated list of the specialist skills it should load as bounded phase guidance during `apply`. The only specialist explicitly named in `SKILL.md` is `skill-authoring` (in a §5 gotcha), but the agent skills library now includes `building-components` for UI component work — accessible, composable primitives with proper ARIA, keyboard nav, and design tokens. When a task involves building or modifying UI components, the orchestrator should automatically load `building-components` the same way it loads `skill-authoring` for skill-modification work. Without that recognition, the orchestrator either misses the methodology entirely or reinvents it inline.

## What Changes

- **Enumerate specialist skills in the orchestrator** — Add a focused subsection that names the specialists the orchestrator recognises today (`skill-authoring` for skill-modification work, `building-components` for UI component work) and the trigger condition for each. Keep it small — the goal is recognition, not a registry.
- **Update the frontmatter description** — Surface the `building-components` trigger condition in the description so the agent does not skip loading the orchestrator when the user asks for component work.
- **Add `building-components` to the interdependencies table** — Record the relationship between `create-task` (orchestrator) and `building-components` (specialist).
- **Add a `## Specialist skill recognition` cross-reference from §1.3** — Keep the existing specialist-handoff language but point it at the new enumerated list.
- **New `task-orchestration` delta requirement** — Capture the recognition rule as a SHALL so future drift is caught by spec validation.

**Non-breaking changes:** The orchestrator's contract and existing workflow are unchanged. The new requirement is additive documentation plus a small SKILL.md section.

## Capabilities

### Modified Capabilities

- `task-orchestration`: add one requirement (`Specialist skill recognition`) that names `building-components` as a bounded specialist the orchestrator loads when the task involves UI component work. Add one scenario covering the trigger condition.

## Impact

**Affected files:**

- `.agents/skills/create-task/SKILL.md` — frontmatter description updated; new `### Specialist skill recognition` subsection under §1; `## Interdependencies` table extended; small cross-reference pointer in §1.3
- `openspec/specs/task-orchestration/spec.md` — new requirement + scenario appended to the `## Requirements` section
- `openspec/changes/create-task-add-building-components/specs/task-orchestration/spec.md` — delta spec for the new requirement

**Affected systems / callers:**

- The `create-task` orchestrator itself (loaded by agents handling implementation requests).
- The `building-components` skill is unchanged.

**Dependencies:** None added. The change is documentation + a small SKILL.md section.

**Compatibility:**

- Existing callers see the same 11-phase workflow and gate ordering.
- The orchestrator already loads `skill-authoring` via §5; this change formalises the recognition and adds `building-components` to the same pattern.

## Security Considerations

- **Threat model summary:** The change is documentation and SKILL.md prose. No code paths change. No new dependencies. No new attack surface.
- **Affected data and trust boundaries:** None new. The orchestrator continues to load `building-components` as a bounded methodology reference; it does not execute new code or transmit data.
- **Third parties:** None new. The change references an existing skill folder that is already present in `.agents/skills/`.
- **Persistence:** None. No schema, DB, or on-disk state added or modified.
- **Privilege surfaces:** None added. The orchestrator continues to inherit the user's existing git/gh auth context.
- **Requested overrides:** None at the proposal level. Pre-archive scanner findings will be addressed in `design.md` per §3.2.

## History

- This change. Created 2026-08-05.
