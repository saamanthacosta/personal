---
tags:
  - capability/agent-instructions
  - topic/agent-rules
---
## Context

Skills in this workspace are discovered by the agent at runtime through the `description` field on each `SKILL.md`. Discovery is best-effort: the agent matches the user's request against descriptions and may skip a skill that the workspace intends to invoke unconditionally. The `skill-sessions` helper is a concrete example — `create-task` and `openspec-apply-change` reference it, but nothing forces the agent to load it on every run.

A repo-level `AGENTS.md` is a common convention for agent-aware repos (Cursor, Claude Code, OpenCode via `customInstructions`, etc.). It gives the workspace an authoritative, deterministic rule that any compatible agent must follow.

## Goals / Non-Goals

**Goals:**
- Add `AGENTS.md` at the repository root with a single explicit rule: any phase-based skill MUST load `skill-sessions` to render the timeline and persist the session log.
- Reference `.agents/skills/skill-sessions/SKILL.md` so the format spec lives next to the implementation.
- Make the rule visible to every agent that reads `AGENTS.md`, not just OpenCode.

**Non-Goals:**
- Configuring agent-specific files (e.g. OpenCode `customInstructions`, Cursor rules, etc.).
- Adding new rules beyond the skill-sessions loader in this change.

## Decisions

- **Single `AGENTS.md` at the repo root** — universal convention; multiple agents already look for this filename.
- **One rule only** — keep the file focused on the deterministic loader. Other rules go in follow-up changes to avoid scope creep.
- **No agent-specific config in this change** — the repo already uses OpenCode, but writing `.opencode/*` or similar files locks the workspace to one runtime. `AGENTS.md` is the portable layer; agent-specific knobs are best-effort enrichment in a separate change.
- **Reference, don't duplicate** — the timeline format stays in `.agents/skills/skill-sessions/SKILL.md`. `AGENTS.md` points at it.

Alternatives considered:
- Editing `create-task/SKILL.md` and `openspec-apply-change/SKILL.md` to call `skill-sessions` — rejected: only helps agents that load those skills; doesn't generalize.
- Writing an OpenCode plugin — rejected: adds runtime dependency and conflicts with the "skills are markdown prompts" rule.
- Adding the rule to `.opencode/` — rejected: same lock-in problem.

## Risks / Trade-offs

- [Risk] Some agents ignore `AGENTS.md` → Mitigation: the rule is also encoded as a spec requirement (`agent-instructions`) so any agent that reads OpenSpec specs inherits it; plus the existing references in `create-task/SKILL.md` and `openspec-apply-change/SKILL.md` remain.
- [Risk] `AGENTS.md` may conflict with future rules → Mitigation: keep this change scoped to one rule; future rules go in follow-up changes.

## Migration Plan

None. New file. Rollback = delete `AGENTS.md` and revert the spec delta.

## Open Questions

- Should a future change also drop a copy of the rule into each skill that produces phases (e.g. `create-skill`, `research-spike`)? Recommended yes for redundancy; deferred.

## Security Considerations

- `AGENTS.md` is plain markdown, read by the agent; no execution path.
- The rule only affects what skill the agent loads; it does not change tool execution, network calls, or filesystem writes outside the existing `docs/skill-sessions/` boundary.
- No new trust boundaries, no new persistence, no new privilege surface.

## Security Overrides

The following HIGH findings from `docs/cve-reports/2026-08-03-pre-archive-add-agents-md.md` are inherited from the `skill-ui-progress` change and remain accepted:

| Finding | Rationale | Mitigation |
| --- | --- | --- |
| `tests/format-sessions.test.mjs:11` — `spawnSync` command-injection review | Test-only code; argv is a static module-level constant. No user input flows into the spawned process. | Argument array is hard-coded; test scope is local sandbox only. |
| `tests/render.test.mjs:8` — `spawnSync` command-injection review | Same rationale as above. | Same mitigation. |

No new code paths in this change. Both findings are recorded here so the audit trail captures the explicit override for this archive.
## Related
- [[proposal]]
- [[tasks]]
- [[specs/agent-instructions/spec]]
- [[specs/skill-session-observability/spec]]
