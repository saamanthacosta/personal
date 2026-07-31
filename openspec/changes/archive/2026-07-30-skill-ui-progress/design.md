---
ttags:
  - capability/skill-session-observability
  - topic/skill-ui
---
## Context

Skills today are markdown prompts; the agent emits free-form chat blocks between tool calls. There is no shared contract for "what a skill is doing right now" or "what happened in this session", so users must scroll or grep transcripts to reconstruct context. The repo already uses durable per-run reports (`docs/cve-reports/`) and a regenerated dashboard (`INDEX.md`), but no equivalent exists for skill sessions.

This change introduces a chat-side timeline renderer and a disk-side session log, both fed by the same structured event stream so chat and history stay in sync.

## Goals / Non-Goals

**Goals:**
- Provide a consistent timeline block in chat (status icons, nested steps, durations, sources, evidence) every time `create-task` or a specialist skill runs.
- Persist a per-session markdown report and a regenerated `INDEX.md` so users can audit previous sessions.
- Define a stable event schema so future skills can produce compatible output without re-deriving the format.

**Non-Goals:**
- Building a custom terminal UI, TUI, or external dashboard.
- Replacing any existing phase-output format; the timeline extends, not replaces.
- Adding new dependencies.

## Decisions

- **Markdown-only output** — chat clients vary in color support; status emojis plus text always render. Color is opt-in via raw ANSI inside fenced code blocks only when the renderer supports it.
- **One canonical location** — `docs/skill-sessions/` mirrors `docs/cve-reports/`. Each file uses YAML frontmatter (`skill`, `change`, `branch`, `started_at`, `ended_at`, `status`) plus the verbatim timeline emitted in chat.
- **Event schema in JSONL** — `phase_started`, `phase_completed`, `step_started`, `step_completed`, `evidence`, `specialist_loaded`, `loop_back`, `note`. The chat renderer and the durable writer both consume the same stream.
- **Single helper skill** — new `.agents/skills/skill-sessions/` with `SKILL.md` policy and `bin/format-sessions.mjs` that scans `docs/skill-sessions/` and regenerates `INDEX.md`, mirroring `cve-scan/bin/format-report.mjs`.
- **Wire into `create-task` only via `task-workflow.md`** — keeps the orchestrator contract narrow per `create-task/SKILL.md §1.1`.

Alternatives considered:
- A dedicated TUI dashboard — rejected: breaks the repo's no-UI-rule; adds a dependency; chat already covers the live case.
- Storing raw chat transcripts instead of structured events — rejected: couples storage to the renderer; harder to query; risks leaking secrets.
- A new terminal CLI invoked per phase — rejected: splits truth between the agent and a CLI; the agent is the source of truth.

## Risks / Trade-offs

- [Risk] Status emoji may render inconsistently across clients → Mitigation: status text always accompanies the emoji; the durable log strips emojis so grep works.
- [Risk] Long sessions may produce oversized `docs/skill-sessions/*.md` → Mitigation: cap embedded tool output to 1 KiB per event and link to the source file.
- [Risk] Specialists that bypass the event schema will produce inconsistent history → Mitigation: schema is referenced from every `SKILL.md` that emits a timeline; specialists emit `Specialist Phase: <name> — done` per existing convention.
- [Risk] Drift between chat timeline and durable log → Mitigation: both are produced from the same JSONL stream in the same phase boundary.

## Migration Plan

No data migration. New directory `docs/skill-sessions/` starts empty; the first run creates the seed report. Rollback = delete the directory and revert the orchestrator delta spec.

## Open Questions

- Should `cve-scan` reports cross-link from `docs/skill-sessions/INDEX.md` (a session row links to its `docs/cve-reports/<file>.md`)? Recommended yes; deferred to follow-up change if scope grows.
- Should the timeline auto-truncate after N events in chat? Default 50 inline, then "…see `docs/skill-sessions/<file>.md`" pointer.

## Security Considerations

- **Threat model:** scripts run locally under the user's existing shell privileges, with no network calls and no new dependencies. Attack surface is limited to the JSONL stream consumed by `bin/render.mjs` and `bin/append-event.mjs`; both validate against `.agents/skills/skill-sessions/schema/skill-session-event.schema.json`.
- **Data handled:** chat artifacts (text only) and per-session markdown reports. Reports may include file paths and short evidence snippets; raw command output and secrets must never be embedded.
- **Trust boundaries:** the agent emits events; the renderer and writer consume the same stream. A malformed event line is skipped with a stderr warning and does not crash the run.
- **Process spawning:** only the test fixtures call `spawnSync`, and only with static arguments resolved at module load. No runtime script spawns child processes.
- **HIGH findings accepted (this change):** the two `spawnSync` invocations in test fixtures and the absence of `## Security Considerations` in earlier revisions of this proposal/design. Both are addressed: arguments are static, and the Security Considerations section now appears in both `proposal.md` and `design.md`.
- **Residual risk:** schema validation is currently advisory (the renderer logs a warning for unknown event types). If a future integration needs hard validation, the JSON Schema at `schema/skill-session-event.schema.json` can be enforced with an `ajv`-free hand-written validator to keep the zero-dependency property.

## Security Overrides

The following HIGH findings from `docs/cve-reports/2026-07-31-pre-archive-skill-ui-progress.md` are accepted for this change:

| Finding | Rationale | Mitigation |
| --- | --- | --- |
| `tests/format-sessions.test.mjs:11` — `spawnSync` command-injection review | Test-only code; argv is a static module-level constant. No user input flows into the spawned process. | Argument array is hard-coded; test scope is local sandbox only. |
| `tests/render.test.mjs:8` — `spawnSync` command-injection review | Same rationale as above. | Same mitigation. |

No runtime script spawns child processes. Both findings are recorded here so the audit trail captures the explicit override.
## Related

- [[proposal]]
- [[tasks]]
- [[specs/skill-session-observability/spec]]
