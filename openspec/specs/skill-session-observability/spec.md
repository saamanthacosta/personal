---
tags:
  - capability/skill-session-observability
---

# skill-session-observability Specification

## Purpose
The workspace provides a `skill-session-observability` capability that emits a structured chat timeline and persists a durable session log for every `create-task` run, fed by a shared JSONL event stream so chat and history never diverge.

## Requirements

### Requirement: Skill execution emits a structured timeline in chat
The workspace SHALL provide a `skill-session-observability` capability that every `create-task` run emits as a chat timeline block.

The timeline SHALL include:
- A header naming the active skill and the change or scope.
- One row per phase with status icon, name, and elapsed time.
- Nested rows for specialist phases and apply sub-tasks.
- A `Sources` row referencing the SKILL.md file path and section anchor that drove each step.
- A final summary row with counts (completed, active, pending, failed) and the session log path.

#### Scenario: create-task run starts
- **WHEN** `create-task` finishes `preflight` and begins `explore`
- **THEN** the chat response contains a `## Skill timeline` block with the header, one row per completed phase, and the `Sources` row referencing `.agents/skills/create-task/SKILL.md`

#### Scenario: Specialist phase runs inside apply
- **WHEN** `create-task` invokes a specialist skill during `apply`
- **THEN** the timeline shows the nested `Specialist: <name>` row with its own start/end times before the parent `apply` row completes

#### Scenario: Session ends
- **WHEN** `create-task` reaches the `## Implementation Complete` block
- **THEN** the timeline ends with the summary row linking to the persisted `docs/skill-sessions/<id>.md` file

### Requirement: Skill execution persists a session log
The workspace SHALL persist one markdown file per `create-task` run under `docs/skill-sessions/`.

The file SHALL include:
- YAML frontmatter: `skill`, `change`, `branch`, `started_at`, `ended_at`, `status`.
- A `## Timeline` section reproducing the chat block verbatim (status icons preserved).
- A `## Sources` section listing every `SKILL.md` reference consulted during the run with `file:section`.
- A `## Evidence` section listing test, lint, typecheck, build, CVE report, and PR URL evidence.

The file SHALL be created when the timeline starts and finalized when the run ends.

#### Scenario: Session file is created
- **WHEN** `create-task` emits the first `phase_started` event
- **THEN** a file `docs/skill-sessions/<UTC-ISO-timestamp>-<change-or-scope>.md` exists with the YAML frontmatter populated

#### Scenario: Session file is finalized
- **WHEN** `create-task` emits `phase_completed` for the final phase
- **THEN** the file's `ended_at` and `status` frontmatter fields are populated and the `## Evidence` section is closed

#### Scenario: Session index is regenerated
- **WHEN** a session file is added or finalized
- **THEN** `node .agents/skills/skill-sessions/bin/format-sessions.mjs` regenerates `docs/skill-sessions/INDEX.md` with one row per session

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

#### Scenario: Loop-back is recorded in both surfaces
- **WHEN** `pre-commit-review` emits a blocker
- **THEN** the chat timeline shows `↩️ loop back: <reason>` and the session file records a `loop_back` event with the same reason

### Requirement: Timeline stays readable without color
The workspace SHALL ensure that every status icon is paired with text so the timeline is readable when emojis or color are stripped.

#### Scenario: Emoji-stripped renderer
- **WHEN** the chat client strips emojis
- **THEN** the status column still reads `complete`, `running`, `pending`, `failed`, or `loop-back`

#### Scenario: Evidence row survives truncation
- **WHEN** an evidence entry exceeds 1 KiB
- **THEN** the entry is truncated and the full text is linked via source file path

## History

- [[../../changes/archive/2026-07-30-skill-ui-progress/proposal|skill-ui-progress (2026-07-30)]] — Emits a chat timeline and persists session logs fed by a shared JSONL event stream so chat and history never diverge.