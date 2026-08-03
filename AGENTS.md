# Agent instructions

Rules any compatible agent MUST follow when working in this workspace.

## Skill sessions

Whenever a phase-based skill runs (`create-task`, `create-skill`, `research-spike`, or any skill that emits `## Phase: <name> — done` boundaries), the agent MUST load `.agents/skills/skill-sessions/` and use its helpers:

- `bin/render.mjs` to print the `## Skill timeline` chat block at every phase boundary, with status icons paired with text (`complete`, `running`, `pending`, `failed`, `loop-back`).
- `bin/append-event.mjs` to append each event to `docs/skill-sessions/<id>.md` (one file per run).
- `bin/format-sessions.mjs` to regenerate `docs/skill-sessions/INDEX.md` after every finalized run.

This rule is authoritative — do not rely on the skill `description` to trigger the load. The format spec lives in [`.agents/skills/skill-sessions/SKILL.md`](.agents/skills/skill-sessions/SKILL.md).
