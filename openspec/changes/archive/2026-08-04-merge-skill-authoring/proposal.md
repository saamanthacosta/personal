## Why

`create-skill` and `update-skill` are co-located in behavior — they share the same `references/` notes, the same `customize-opencode` frontmatter rules, and the same refusal to touch anything outside `.agents/skills/`. The split was an artifact of how the two skills were introduced, not a real separation of concerns. We will replace both with a single `skill-authoring` skill that dispatches on a runtime mode (create vs. update), eliminating the duplicated `references/` folder and shrinking the description surface the model has to match against.

## What Changes

- Introduce `.agents/skills/skill-authoring/SKILL.md` — a single skill that handles both authoring modes.
- Delete `.agents/skills/create-skill/` and `.agents/skills/update-skill/` (including their `references/` folders).
- Update the `skill-authoring` canonical spec to describe the merged skill and its mode dispatch.
- Update any cross-skill references that named `create-skill` or `update-skill` (none in tracked files today beyond the skill bodies themselves; verify with grep).
- Update the `create-skill` reference in `docs/skill-sessions/INDEX.md` and the in-flight PR description if it named either skill.

## Capabilities

### New Capabilities
- (none — the capability surface already exists under `skill-folder-conventions` and `skill-authoring`. The merge is an implementation change inside an existing capability, not a new one.)

### Modified Capabilities
- `skill-authoring`: update the "Personal repository destination" requirement to say "skill lives at `.agents/skills/<name>/SKILL.md`" without distinguishing create vs. update. Add a new requirement describing the merged skill's mode-dispatch behavior.

## Impact

- **Affected files (≈10):** two `SKILL.md` bodies deleted, one new `SKILL.md` created, three shared `references/` notes kept (now under `skill-authoring/references/`), any cross-skill references updated.
- **Affected skills:** none — `skill-authoring` is the only skill that authors other skills; no other skill names `create-skill` or `update-skill` in its body.
- **No data, auth, or trust-boundary change.** Pure refactor; the underlying behavior (one skill writes/edits another skill's `SKILL.md`) is unchanged.
