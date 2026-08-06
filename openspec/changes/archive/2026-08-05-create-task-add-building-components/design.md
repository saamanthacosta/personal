## Context

The workspace's `.agents/skills/building-components/` skill was added recently and already carries the `interdependencies: customize-opencode` field expected of meta-skills. It provides reference docs for accessibility, composition, as-child, polymorphism, state, data-attributes, design tokens, styling, registry, npm, marketplaces, and component docs — exactly the methodology the `create-task` orchestrator needs as bounded guidance when the task involves UI component work.

Today, the orchestrator's `SKILL.md` mentions specialist skills in three places:

1. §1.3 (general statement about bounded specialist phases)
2. §2.1 (apply phase rule: "When the task subject matches a specialist skill, load and apply that skill as bounded phase guidance")
3. §5 gotchas (explicit `skill-authoring` reference for skill-modification tasks)

But no place enumerates which specialists exist today or what triggers them. The first run that needs `building-components` either skips it or reinvents it inline. This change closes the gap with a small recognition section plus a delta spec requirement so future drift is caught.

## Goals / Non-Goals

**Goals:**

- Name the two specialists the orchestrator recognises today: `skill-authoring` and `building-components`.
- State the trigger condition for each in one or two lines.
- Surface the recognition in the frontmatter description so the agent loads `create-task` for component work (instead of bypassing it).
- Capture the rule as a `task-orchestration` SHALL requirement so spec validation catches regressions.

**Non-Goals:**

- Building a registry of specialists beyond the two that exist today.
- Changing the orchestrator's contract, gate ordering, or approval checkpoints.
- Modifying `building-components` itself — the change only references it from the orchestrator.
- Introducing new gate rules (CVE, pre-commit-review) for component work beyond the existing pre-archive and pre-commit-review gates.

## Decisions

### Decision 1: Enumerated list, not a registry

**Choice:** A small `### Specialist skill recognition` subsection under §1 of `SKILL.md` with a table of specialists and their triggers.

**Rationale:** The orchestrator's surface area is the SKILL.md body, not a registry file. Two specialists today; listing them inline is cheaper than introducing a new artifact and keeps the orchestrator's policy co-located with its reference. A future move to a registry is straightforward if the list grows past ~5 entries.

**Alternatives considered:**

- Auto-discover specialists from `.agents/skills/*/SKILL.md` — rejected; couples the orchestrator to the skills folder layout and makes the trigger rules opaque.
- Defer the recognition to a separate `specialists.md` reference — rejected; the rule is short and a separate file adds a load hop for what is a one-screen table.

### Decision 2: Trigger wording — what + when, not how

**Choice:** Each row in the table says what the specialist covers and when to load it, not the internals of how the orchestrator wires it in.

**Rationale:** The existing §2.1 + §1.3 prose already describes the wiring (bounded phase, specialist completion ≠ task completion). The recognition section just adds names and triggers. Duplicating the wiring would drift from §2.1.

### Decision 3: Frontmatter description points at component work

**Choice:** Append a sentence to the existing description: "When the task involves building, modifying, or reviewing UI components (accessibility, composition, design tokens, component primitives), the apply phase loads `building-components` as bounded specialist guidance per §1."

**Rationale:** Without that sentence, the agent may interpret "create-task does not apply" for component work and skip loading the orchestrator entirely. The description already names near-misses (pure research, skill-only creation, read-only summary); the new sentence covers the parallel case where a specialist exists and the orchestrator should still load to retain lifecycle ownership.

### Decision 4: One new SHALL requirement on `task-orchestration`

**Choice:** Add a `### Requirement: Specialist skill recognition` section to `task-orchestration/spec.md` that says the orchestrator SHALL recognise named specialists and load them as bounded phases per their trigger conditions.

**Rationale:** The existing `task-orchestration` spec already covers specialist handoff (§1.3 of SKILL.md, see `### Requirement: Specialist guidance returns control to the orchestrator`). The new requirement closes the gap on the recognition side. One requirement + one scenario keeps the delta small.

## Risks / Trade-offs

- **Risk:** The recognition list becomes stale as new specialists are added. → **Mitigation:** The §5 gotchas pattern is to add a note when a new specialist lands; the table is small enough to update inline.
- **Risk:** The `building-components` skill is loaded during every component task and bloats context. → **Mitigation:** The skill uses progressive disclosure (its own `references/` folder). Loading the SKILL.md does not pull every reference; only the ones the agent actively needs.
- **Risk:** The new description sentence makes the description too long (>1024 chars). → **Mitigation:** The current description is ~798 chars; the new sentence adds ~140, leaving room under the 1024 cap.

## Migration Plan

- Pure documentation change. No callers to migrate.
- The new `task-orchestration` requirement becomes enforceable once the change is archived and the spec is synced.
- The orchestrator's behavior is unchanged for tasks that do not involve components.

## Open Questions

- None. The recognition is bounded to two existing specialists. Future specialists (e.g., a `cve-scan` deep-dive specialist if one is split out) can extend the table in a follow-up change.

## Security Considerations

### Threat model

- **Data classes:** No user data, secrets, or PII is processed. The change is documentation and SKILL.md prose.
- **Trust boundaries:** None new. The orchestrator continues to load `building-components` as a methodology reference.
- **Third parties:** None new. The change references an existing skill folder under `.agents/skills/`.
- **Persistence:** None. No schema, DB, or on-disk state added or modified.
- **Privilege surfaces:** None added. The orchestrator continues to inherit the user's existing git/gh auth context.

### Pre-archive scanner findings and overrides

The pre-archive audit (`docs/cve-reports/2026-08-05-pre-archive-create-task-add-building-components.md`) surfaced 5 HIGH findings and 0 CRITICAL. None of the findings are introduced by this change — all are pre-existing in files that this change does not modify.

**Finding 1 — `.agents/skills/create-task/scripts/phase-status.mjs:25` (Process spawning requires command-injection review)**

- **Status:** Pre-existing. This file was introduced by the archived `2026-08-03-improve-create-task-skill` change and is unmodified here. The pre-archive scanner audits the complete working tree, so it surfaces pre-existing findings alongside change-specific ones.
- **Mitigation per the prior archive's design.md:** The script uses `execFileSync(cmd, args, { ... })` exclusively, which invokes a child process with an array of arguments — not a shell string. Shell command injection requires shell-string interpolation, which the API does not use. Additionally, all commands invoked (`git`, `openspec`, `which`, `gh`) are hardcoded string literals; no argument is derived from user input, environment variables, or external files. Override applied per cve-methodology.md "HIGH findings may be accepted only when design.md identifies the exact finding and provides mitigation and rationale."

**Finding 2 — `.agents/skills/openspec-status/scripts/status.mjs:8` (Process spawning requires command-injection review)**

- **Status:** Pre-existing. Same rationale as Finding 1. The script uses `spawnSync` with array arguments.
- **Mitigation / override:** Out of scope for this change. Override inherited from the `improve-create-task-skill` precedent.

**Finding 3 — `.agents/skills/skill-sessions/scripts/tests/format-sessions.test.mjs:11` (Process spawning requires command-injection review)**

- **Status:** Pre-existing. Out of scope for this change.
- **Mitigation / override:** No action required. If the finding warrants attention, it should be addressed in a separate change scoped to `skill-sessions/`.

**Finding 4 — `.agents/skills/skill-sessions/scripts/tests/render.test.mjs:8` (Process spawning requires command-injection review)**

- **Status:** Pre-existing. Out of scope for this change. Same rationale as Finding 3.

**Finding 5 — `.agents/skills/skills-audit/scripts/audit-all.mjs:44` (Process spawning requires command-injection review)**

- **Status:** Pre-existing. Out of scope for this change. Same rationale as Finding 3.

### Summary

- 0 CRITICAL findings.
- 5 HIGH findings, all pre-existing and out of scope for this change. Mitigations follow the precedent established by the archived `2026-08-03-improve-create-task-skill` change: scripts use array-argument APIs (`execFileSync`/`spawnSync`) without shell-string interpolation, and no user input flows into the spawned processes.
- No findings introduced by this change. The SKILL.md prose edits and the new task-orchestration requirement are documentation, not code paths.
- Both `proposal.md` and `design.md` carry the required `## Security Considerations` sections.
