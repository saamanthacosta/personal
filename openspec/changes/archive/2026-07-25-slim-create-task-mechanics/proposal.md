## Why

`create-task` has grown to 514 lines, ~4.7× the median skill in this workspace. The bulk is **mechanics** — bash recipes, output format templates, recovery procedures — that the orchestrator only needs at specific phases. This makes the skill hard to maintain and visually heavy.

The design is intentional and correct: create-task is a self-contained lifecycle owner, with bounded specialist phases. The bloat is not the design — it is that mechanics live inline when they should be on-demand. Plus one real duplication: §4.1 inlines the CVE threat-model prompts that already live in `docs/cve-methodology.md` (the "Threat-Model Questions" section). The §4.1 prompts are a mixture of the five methodology questions and one orchestrator-specific "Specialist handoff" prompt. The §4.1 inline block is replaced by a pointer to the methodology doc plus the explicit orchestration-specific prompt.

## What Changes

- `.agents/skills/create-task/SKILL.md` shrinks from 514 → ~210 lines. Mechanics extracted; §4.1 becomes a pointer to `docs/cve-methodology.md` with the orchestrator-specific sixth prompt kept inline.
- `docs/task-workflow.md` (NEW) holds ~310 lines of per-phase mechanics, organized by phase. The skill's preamble instructs the orchestrator to read it once at workflow start.
- `openspec/specs/task-orchestration/spec.md` — the TBD Purpose line is replaced with a real statement. No requirement changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The `task-orchestration` Purpose line replacement is metadata normalization, not a requirement change. Captured as a separate apply task rather than a spec delta.

## Impact

- Internal restructure only. No new user-facing capability.
- The orchestrator's interface contracts with `openspec-*`, `commit`, `create-pr`, and `cve-scan` stay inline — only the deep recipes move.
- All specialist skills remain authoritative for their full methodology.
- Behavior preservation is verified by smoke test (dry-run on a trivial task).
- The doc location (`docs/task-workflow.md`) sets a precedent: workflow docs live alongside skills in `docs/`. The `docs/skills-folder.md` precedent doc is deferred to a future refactor.
- CVE scan: staged scan on the refactor's commit must remain clean (no new code, but rule kept for safety).
