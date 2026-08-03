## Context

The `create-task` orchestrator skill (v1.4) has grown to 210 lines in `SKILL.md` with two companion docs (`task-workflow.md`, `BLOCKER-CHECKLIST.md`) sitting at the skill root alongside `SKILL.md`. The orchestrator describes resume detection in prose but does not tool it, and slug/branch validation is documented but not enforced. The current description does not pushy enough about when the skill applies vs when a specialist (research-spike, openspec-explore, create-skill) is the right choice.

This change adopts patterns from the [agentskills.io](https://agentskills.io) specification — progressive disclosure, bundled helpers, eval scaffolding, explicit gotchas, pushy descriptions — without changing the orchestrator's contract or breaking any existing workflow.

**Conformance finding during explore:** The workspace's `openspec/specs/skill-doc-organization/spec.md` Requirement 2 mandates that helper scripts live under `.agents/skills/<skill-name>/bin/` (matching `cve-scan/bin/`), NOT under `scripts/`. The agentskills.io reference uses `scripts/`. The workspace spec wins. The change places scripts under `bin/`.

## Goals / Non-Goals

**Goals:**

- Make the orchestrator's existing resume-detection policy toolable (a single command produces the state snapshot).
- Make the existing slug/type/branch validation policy enforceable (a single command catches malformed input before branch creation).
- Reduce in-context overhead by moving per-phase mechanics into `references/`.
- Tighten the description so the skill does not trigger on research, spike, or skill-only-creation requests.
- Capture non-obvious facts the orchestrator routinely gets wrong (specialist-completion ≠ task-completion, full-audit phase label, skip-on-blocker, etc.) in a single searchable section.
- Scaffold eval cases so description drift can be caught by future eval-driven iteration.

**Non-Goals:**

- Changing the orchestrator's contract (the 11-phase pipeline, the gate ordering, the approval checkpoints).
- Changing any existing requirement in `task-orchestration`, `task-delivery`, or `task-quality-gates`.
- Adding new dependencies, new build steps, or new CLI invocations beyond `node bin/*.mjs`.
- Rewriting the orchestrator's body content beyond adding the new sections (When to load / NOT load, How structured, Workflow at a glance, Gotchas, Available scripts, References).
- Replacing prose with code in the orchestrator's body — the orchestrator stays instruction-driven.

## Decisions

### Decision 1: Helper scripts under `bin/` (not `scripts/`)

**Choice:** Place new scripts at `.agents/skills/create-task/bin/`.

**Rationale:** The workspace's `skill-doc-organization/spec.md` Requirement 2 explicitly mandates `bin/`, matching the existing `cve-scan/bin/` layout. Conforming to the workspace spec is non-negotiable; deviating would require a spec delta and a precedent for breaking the workspace convention.

**Alternatives considered:**
- `scripts/` (agentskills.io default) — rejected, violates `skill-doc-organization` requirement.
- `bin/` symlink to `scripts/` — rejected, unnecessary indirection.
- Inline in `SKILL.md` — rejected, agentskills.io recommends bundling reusable code.

### Decision 2: `bin/phase-status.mjs` is JSON-only, idempotent, no side effects

**Choice:** The helper reads git/openspec/gh state and emits a JSON snapshot to stdout. No files written, no commits, no network egress.

**Rationale:** Resume detection is read-only. A side-effecting helper would re-introduce the risk the orchestrator's policy already mitigates (running destructive ops before checking state). Non-interactive + idempotent + structured output + meaningful exit codes follow the agentskills.io "using scripts" guide.

**Exit-code conventions:** `0` success, `2` usage error, `3` not in git, `4` tool missing (partial snapshot still emitted so the orchestrator can degrade gracefully when openspec or gh is absent).

### Decision 3: `bin/slug-check.mjs` validates both `(type, slug)` and `--branch <name>`

**Choice:** Two modes share one binary. `(type, slug)` produces the canonical branch name; `--branch <name>` validates an existing branch.

**Rationale:** The orchestrator's policy requires both deriving a slug and validating a branch. One binary reduces surface area. The branch-prefix table uses short forms (`feat`, `fix`) while task types are long (`feature`, `fix`) — `bin/slug-check.mjs` maps between them so callers don't have to.

### Decision 4: `evals/evals.json` is data, not code

**Choice:** Eval cases are static JSON evaluated out-of-band (e.g., by the `skill-creator` skill or by a future automated harness). The orchestrator does NOT read `evals/evals.json` at runtime.

**Rationale:** The agentskills.io guide says evals are for "test cases, assertions, and grading" — they are inputs to an eval driver, not orchestration logic. Coupling the orchestrator to eval data would create a confusing runtime dependency. Future eval runs can iterate without touching the orchestrator.

### Decision 5: Progressive-disclosure index in SKILL.md

**Choice:** Add a `## How this skill is structured` table that lists every file under the skill folder with "when to load" guidance. Update the existing inline references to point to `references/` and `bin/`.

**Rationale:** The agentskills.io "best practices" guide says: "telling the agent when to load each file is more useful than a generic 'see references/ for details.' This lets the agent load context on demand rather than up front."

### Decision 6: `## Gotchas` section

**Choice:** Add a numbered list of 11 non-obvious facts at the end of the policy section. Format: bold lead-in, then a one-sentence rule, then the rationale when useful.

**Rationale:** The agentskills.io guide calls gotchas "the highest-value content in many skills — concrete corrections to mistakes the agent will make without being told otherwise." Every fact here was a real failure mode in earlier workflow runs.

### Decision 7: Description tightened, no requirement to call out new behavior

**Choice:** Description is rewritten for front-loaded what+when + pushy scope + named near-misses + nested-skill ownership. Length: 796 / 1024 chars.

**Rationale:** The agentskills.io "optimizing-descriptions" guide says push about scope, name near-misses, focus on user intent. The new description explicitly tells the agent when NOT to load (pure research, spike, skill-only creation, read-only summary), which suppresses false triggers.

## Risks / Trade-offs

- **Risk:** Slight description drift may suppress some triggers that previously loaded the skill. → **Mitigation:** The 18 cases in `evals/evals.json` cover should-trigger / should-not-trigger / near-miss scenarios. A future eval run can verify the new description does not regress.
- **Risk:** Helpers rely on git/openspec/gh being on PATH. → **Mitigation:** `bin/phase-status.mjs` emits partial snapshots when tools are missing (exit code 4). The orchestrator's §5 gotcha documents this.
- **Risk:** Adding `bin/` scripts could conflict with future skills that expect `scripts/`. → **Mitigation:** The workspace spec mandates `bin/`. Conflicting expectations reflect a workspace spec drift, which this change does not introduce.
- **Risk:** Reviewers may flag the Gotchas list as opinion / over-prescriptive. → **Mitigation:** Each gotcha is a concrete rule tied to a real failure mode. The orchestrator's existing guardrails (§8) include "Never treat specialist completion as task completion" — the Gotchas section makes that visible without changing the guardrail itself.

## Migration Plan

- This is a backward-compatible change. Existing callers see the same 11-phase workflow, the same gate ordering, and the same PR delivery contract.
- The two companion docs (`task-workflow.md`, `BLOCKER-CHECKLIST.md`) move from the skill root into `references/`. Any external link that pointed at them via `.agents/skills/create-task/<file>.md` will break; the orchestrator already updates its own references. No external links known to exist.
- Helpers are additive. Agents that ignore them continue to work via the same prose.
- `evals/evals.json` is non-load-bearing at runtime. No migration needed.
- Version bump from 1.4 → 2.0 signals the structural change. The frontmatter `version` field is documentation only.

## Open Questions

- Should `bin/phase-status.mjs` eventually also read `docs/skill-sessions/` per the resume-detection requirement? Out of scope for this change; could be added later.
- Should `evals/evals.json` be split into `evals/trigger-evals.json` and `evals/output-evals.json`? Out of scope; current single-file shape matches the agentskills.io example.

## Security Considerations

### Threat model

- **Data classes:** No user data, secrets, or PII is processed. Scripts read only git/openspec/gh state which is already visible to the user in their dev environment.
- **Trust boundaries:** None new. Scripts run locally and invoke existing CLIs (git, openspec, gh). No network egress beyond what those CLIs already do.
- **Third parties:** None new. Scripts use Node.js built-ins only.
- **Persistence:** None. Scripts emit JSON to stdout; nothing written to disk or DB by the scripts themselves.
- **Privilege surfaces:** None added. Scripts inherit the user's existing git/gh auth context.

### Pre-archive scanner findings and overrides

The pre-archive audit (`docs/cve-reports/2026-08-03-pre-archive-improve-create-task-skill.md`) surfaced 5 HIGH findings. Each is addressed below.

**Finding 1 — `bin/phase-status.mjs:25` (Process spawning requires command-injection review)**

- **Mitigation:** The script uses `execFileSync(cmd, args, { ... })` exclusively, which invokes a child process with an array of arguments — not a shell string. Shell command injection requires shell-string interpolation, which the API does not use. Additionally, all commands invoked (`git`, `openspec`, `which`, `gh`) are hardcoded string literals; no argument is derived from user input, environment variables, or external files. The script is therefore not vulnerable to command injection.
- **Rationale for override:** The scanner flags any file that imports `node:child_process` as a precaution. In this case, the precaution is satisfied by the API choice (`execFileSync` with array args vs. `exec`/`execSync` with shell strings) and by the input discipline (no external inputs reach the spawned process). Override applied per cve-methodology.md "HIGH findings may be accepted only when design.md identifies the exact finding and provides mitigation and rationale."
- **Residual risk:** None.

**Finding 2 — `.agents/skills/skill-sessions/tests/format-sessions.test.mjs:11` (Process spawning requires command-injection review)**

- **Status:** Out of scope for this change. This is a pre-existing file (introduced by an earlier archived change, not modified here). The pre-archive scanner audits the complete working tree, so it surfaces pre-existing findings alongside change-specific ones.
- **Mitigation / override:** No action required for this change. If the finding warrants attention, it should be addressed in a separate change scoped to `skill-sessions/`.

**Finding 3 — `.agents/skills/skill-sessions/tests/render.test.mjs:8` (Process spawning requires command-injection review)**

- **Status:** Out of scope for this change. Same rationale as Finding 2.

**Finding 4 — `proposal.md` lacks `## Security Considerations` section**

- **Mitigation:** Section added with threat-model summary, data/trust-boundary/third-party/persistence/privilege-surface analysis, and requested overrides pointer. See proposal.md.

**Finding 5 — `design.md` lacks `## Security Considerations` section**

- **Mitigation:** This section. Threat model and per-finding overrides documented above.

### Summary

- 1 finding (Finding 1) requires an explicit override per cve-methodology.md — granted above with mitigation and rationale.
- 2 findings (Findings 2, 3) are pre-existing and out of scope — surfaced by the full working-tree audit, not introduced by this change.
- 2 findings (Findings 4, 5) are addressed by adding `## Security Considerations` sections to proposal.md and design.md.

No CRITICAL findings. No residual risk requiring new mitigations.