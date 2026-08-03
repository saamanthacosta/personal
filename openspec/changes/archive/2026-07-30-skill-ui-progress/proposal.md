---
ttags:
  - capability/skill-session-observability
  - topic/skill-ui
---
## Why

Skill execution today produces chat output but no observable timeline, so users cannot tell at a glance what a skill is doing or review later what happened during a session, which skills were loaded, and which sources were consulted.

## What Changes

- Add a `skill-session-observability` capability that emits a structured, color-friendly timeline in chat, including phase progress, nested steps, statuses, sources, and durations.
- Persist a session report per run under `docs/skill-sessions/`, regenerated into `docs/skill-sessions/INDEX.md`, so past sessions are auditable.
- Standardize an event schema (JSONL) shared by `create-task` and any specialist phase so future skills can plug into the same renderer.

## Capabilities

### New Capabilities
- `skill-session-observability`: define the chat timeline output, durable session log, and event schema that all skill executions must emit.

### Modified Capabilities
- `task-orchestration`: extend the orchestrator's `Phase output` block to include the timeline and persist session events through the new capability.

## Impact

- Affected files: `.agents/skills/create-task/SKILL.md`, `.agents/skills/create-task/task-workflow.md`, `.agents/skills/openspec-apply-change/SKILL.md`, plus new helpers under `.agents/skills/skill-sessions/`.
- Affected artifacts: `docs/skill-sessions/` (new), `openspec/specs/skill-session-observability/spec.md`, delta specs under `openspec/changes/skill-ui-progress/specs/`.
- No new dependencies; output remains plain markdown so it renders in any chat client (OpenCode, GitHub, terminals).

## Security Considerations

- **Data classes:** chat artifacts (no PII, no credentials) and durable per-session markdown reports under `docs/skill-sessions/`. Reports may include file paths and short evidence snippets; never include raw command output or secrets.
- **Trust boundaries:** agent chat ↔ repo filesystem. Scripts execute inside Node.js with no network access and no new dependencies.
- **Third parties:** none. Output is plain markdown and renders in any chat client.
- **Persistence:** per-session files written under `docs/skill-sessions/`; nothing is uploaded or transmitted off-machine.
- **Privilege surfaces:** scripts run with the user's existing shell privileges. No new auth flows, no tokens handled, no network calls.
- **HIGH findings accepted (this change):** `spawnSync` invocations in `.agents/skills/skill-sessions/tests/*.test.mjs` always pass static command + argument arrays (no user-controlled input flows into argv), so command-injection risk is theoretical only. No runtime script spawns child processes.
## Related

- [[design]]
- [[tasks]]
- [[specs/skill-session-observability/spec]]
