---
name: skill-sessions
description: Emit structured chat timelines for skill runs and persist per-session reports under docs/skill-sessions/. Use when a `create-task` (or specialist skill) run needs to show live progress, source citations, and a final summary in chat, and to keep a durable history of what happened, which skills were loaded, and which sources were consulted.
license: MIT
metadata:
  author: saamanthacosta
  version: "0.1"
---

# skill-sessions

Companion helper for `create-task` and any specialist skill. Produces:

- A chat timeline block (status icons + text, no color dependency) at each phase boundary.
- A durable per-session markdown report under `docs/skill-sessions/`.
- A regenerated `docs/skill-sessions/INDEX.md` after every session.

Both surfaces consume the same JSONL event stream defined in `SCHEMA.md` (and validated by `schema/skill-session-event.schema.json`), so chat and history cannot diverge.

## When to load

- Whenever a phase-based skill runs (`create-task`, `create-skill`, `research-spike`, or any skill that emits `## Phase: <name> — done` boundaries). The repo-level `AGENTS.md` declares this loader authoritative; do not rely on the skill `description` to trigger the load.
- Inside `create-task/SKILL.md` "Phase output" boundaries (`preflight`, `explore`, `apply`, `verify`, `pre-commit-review`, `cve-report`, `archive`, `commit`, `push`, `pr`).
- Inside any `## Specialist Phase: <name> — done` boundary.
- Inside `openspec-apply-change/SKILL.md` per-task live progress lines.

## Scripts

| Script | Purpose |
| --- | --- |
| `bin/format-sessions.mjs` | Regenerate `docs/skill-sessions/INDEX.md` from per-run files. |
| `bin/render.mjs` | Render a JSONL event stream to the chat timeline block. |
| `bin/append-event.mjs` | Append an event to a session file and finalize frontmatter on session end. |

## Conventions

- Status icon set is fixed: `✅ complete`, `🔄 running`, `⏳ waiting`, `○ pending`, `❌ failed`, `↩️ loop-back`, `💡 source`, `📄 changed`. Each is paired with text so emoji stripping is safe.
- Evidence entries larger than 1 KiB are truncated; full content is linked via source file path.
- Session file naming: `docs/skill-sessions/<UTC-ISO-timestamp>-<change-or-scope>.md`.
- Single canonical directory; never write session data anywhere else.

## Boundaries

- This skill provides a methodology and helpers. It does not own the orchestrator lifecycle.
- A `create-task` run owns the JSONL stream; specialists append events but never start a new stream mid-run.