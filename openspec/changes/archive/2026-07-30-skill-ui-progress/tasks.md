---
ttags:
  - capability/skill-session-observability
  - topic/skill-ui
---
## 1. Skill helper

- [x] 1.1 Create `.agents/skills/skill-sessions/SKILL.md` with the policy and event schema reference.
- [x] 1.2 Add `.agents/skills/skill-sessions/bin/format-sessions.mjs` that scans `docs/skill-sessions/` and regenerates `INDEX.md`.

## 2. Event schema

- [x] 2.1 Document the JSONL event schema in `.agents/skills/skill-sessions/SCHEMA.md` (event names, required fields, examples).
- [x] 2.2 Add a JSON Schema draft at `.agents/skills/skill-sessions/schema/skill-session-event.schema.json`.

## 3. Phase output updates

- [x] 3.1 Extend `.agents/skills/create-task/task-workflow.md` "Phase output" with the `## Skill timeline` block format and reference the new helper.
- [x] 3.2 Extend `.agents/skills/openspec-apply-change/SKILL.md` "Per-task live progress" section to emit `step_started`/`step_completed` events on the shared JSONL stream.

## 4. Chat renderer

- [x] 4.1 Add `.agents/skills/skill-sessions/bin/render.mjs` that reads a JSONL stream and prints the chat timeline block, respecting emoji-only fallback.

## 5. Durable writer

- [x] 5.1 Add `.agents/skills/skill-sessions/bin/append-event.mjs` that appends events to a session file and finalizes frontmatter on session end.

## 6. Documentation

- [x] 6.1 Update `.agents/skills/README.md` library layout note to include the new helper skill location.
- [x] 6.2 Add a `docs/skill-sessions/README.md` explaining the directory convention and INDEX regeneration.

## 7. Tests

- [x] 7.1 Add fixture-based tests for `format-sessions.mjs` covering: empty directory, single run, multiple runs, missing frontmatter, status variants.
- [x] 7.2 Add fixture-based tests for `render.mjs` covering: emoji-stripped renderer, evidence truncation, nested specialist rows.

## 8. Vault and OpenSpec wiring

- [ ] 8.1 Sync the new `skill-session-observability` spec and the modified `task-orchestration` spec into `openspec/specs/`.
- [ ] 8.2 Add `openspec/changes/skill-ui-progress/specs/skill-session-observability/spec.md` to the vault MOC.
## Related

- [[proposal]]
- [[design]]
- [[specs/skill-session-observability/spec]]
