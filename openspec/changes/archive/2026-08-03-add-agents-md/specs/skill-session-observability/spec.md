---
tags:
  - capability/agent-instructions
  - topic/agent-rules
---
## MODIFIED Requirements

### Requirement: Skill execution uses a stable event schema
The workspace SHALL define a JSONL event schema that drives both the chat timeline and the durable session log.

The workspace SHALL additionally publish `AGENTS.md` at the repository root declaring that any compatible agent MUST load `.agents/skills/skill-sessions/` whenever a phase-based skill runs, so the renderer and writer fire deterministically rather than by `description` matching.

Events SHALL include at minimum:
- `phase_started` (`phase`, `index`, `total`).
- `phase_completed` (`phase`, `duration_ms`, `status`).
- `step_started` (`phase`, `step`, `total`, `description`).
- `step_completed` (`phase`, `step`, `status`).
- `evidence` (`source`, `result`).
- `specialist_loaded` (`skill`, `reason`).
- `loop_back` (`from_phase`, `to_phase`, `reason`).
- `note` (`level`, `text`).

The renderer and the durable writer SHALL consume the same stream so chat and log never diverge.

#### Scenario: Renderer and durable writer share the stream
- **WHEN** `create-task` appends an event to the JSONL stream
- **THEN** both the next chat block and the next session-file append are derived from that event

#### Scenario: AGENTS.md forces the load
- **WHEN** the user invokes a phase-based skill in the workspace
- **THEN** the agent loads `.agents/skills/skill-sessions/SKILL.md` because `AGENTS.md` says so, not because the skill description matched the request
## Related
- [[../../proposal|proposal]]
- [[../../design|design]]
- [[../../tasks|tasks]]
