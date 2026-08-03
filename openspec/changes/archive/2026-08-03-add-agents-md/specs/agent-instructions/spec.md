---
tags:
  - capability/agent-instructions
  - topic/agent-rules
---
## ADDED Requirements

### Requirement: Repo exposes an AGENTS.md with workspace rules
The workspace SHALL provide an `AGENTS.md` at the repository root that any compatible agent MUST read and apply.

#### Scenario: Agent reads AGENTS.md at conversation start
- **WHEN** an agent starts a new conversation in the workspace
- **THEN** the agent applies every rule listed in `AGENTS.md` before producing output

### Requirement: AGENTS.md declares the skill-sessions loader rule
The workspace's `AGENTS.md` SHALL contain an explicit rule stating that any phase-based skill MUST load `.agents/skills/skill-sessions/` to render the chat timeline and append events to `docs/skill-sessions/<id>.md`.

#### Scenario: create-task run emits the timeline
- **WHEN** the user invokes `create-task`
- **THEN** the agent loads `.agents/skills/skill-sessions/SKILL.md` and renders the `## Skill timeline` block at every phase boundary, regardless of whether the skill `description` matches the user's request

#### Scenario: Specialist phase run emits the timeline
- **WHEN** a specialist skill loaded inside `create-task` produces a phase boundary
- **THEN** the agent also loads `skill-sessions` for that nested run and emits the same block
## Related
- [[../../proposal|proposal]]
- [[../../design|design]]
- [[../../tasks|tasks]]
