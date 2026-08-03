---
tags:
  - capability/agent-instructions
  - topic/agent-rules
---
## Why

Skills today are loaded only when the agent matches the request against the skill `description`. This is implicit and brittle: a workflow like `create-task` that should always emit the chat timeline and persist a session log may skip the `skill-sessions` helper entirely. A repo-level `AGENTS.md` makes the rule explicit so every agent (OpenCode or compatible) loads `skill-sessions` deterministically when running a phase-based skill.

## What Changes

- Add `AGENTS.md` at the repository root with a single, explicit rule: any skill that produces phase boundaries MUST load `skill-sessions` to render the timeline block in chat and append events to `docs/skill-sessions/<id>.md`.
- Reference `.agents/skills/skill-sessions/SKILL.md` from `AGENTS.md` so the format spec lives next to the implementation.
- Update `.agents/skills/skill-sessions/SKILL.md` "When to load" section to note that `AGENTS.md` is the authoritative loader.

## Capabilities

### New Capabilities
- `agent-instructions`: define the repo-level `AGENTS.md` contract that any compatible agent MUST follow.

### Modified Capabilities
- `skill-session-observability`: extend the "Skill execution uses a stable event schema" requirement to declare `AGENTS.md` as the authoritative loader for the renderer and writer.

## Impact

- Affected files: `AGENTS.md` (new), `.agents/skills/skill-sessions/SKILL.md`, `openspec/specs/skill-session-observability/spec.md` (delta), `openspec/specs/agent-instructions/spec.md` (new).
- No new dependencies; no code changes.

## Security Considerations

- `AGENTS.md` is plain markdown; the agent reads but does not execute it. No data leaves the machine.
- Trust boundary is the agent runtime, identical to other repo instructions.
- No persistence beyond the repo file itself.
- No privilege surface; the rule only changes agent behavior, not tool execution.
## Related
- [[design]]
- [[tasks]]
- [[specs/agent-instructions/spec]]
- [[specs/skill-session-observability/spec]]
