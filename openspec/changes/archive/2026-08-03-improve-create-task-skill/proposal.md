## Why

The `create-task` orchestrator skill has accumulated documentation inline in `SKILL.md` (329 lines) with two companion docs sitting at the skill root (`task-workflow.md`, `BLOCKER-CHECKLIST.md`). Resume detection is described in prose but not tooled, slug/branch validation is documented but not enforced, and the description does not pushy enough about when the skill applies vs when to use a specialist. This change adopts the patterns from [agentskills.io](https://agentskills.io) — progressive disclosure, explicit gotchas, bundled helpers, eval scaffolding — without changing the orchestrator's contract or breaking any existing workflow.

## What Changes

- **Reorganize companion docs** — Move `task-workflow.md` and `BLOCKER-CHECKLIST.md` from the skill root into `references/` to match the agentskills.io spec and signal that they load on demand rather than every run. Update every internal path reference.
- **Add `bin/` helpers** — Two Node.js scripts (no new dependencies, built-ins only) that codify what the orchestrator's policy already requires:
  - `bin/phase-status.mjs` — Snapshot git + openspec + gh state as structured JSON. Replaces the ad-hoc `git rev-parse` / `openspec list --json` / `gh pr list` triplet with a single command, with `--pretty` and `--phase <name>` filters. Exit codes 0/2/3/4 distinguish success, usage errors, not-in-git, and missing-tool.
  - `bin/slug-check.mjs` — Validate a `(type, slug)` pair or a `<prefix>/<slug>` branch name against the §1.1 type table and the §1.2 slug rules. Catches bad slugs, bad types, bad prefixes, and mismatches before any branch creation.
  - **Note**: scripts live in `bin/` (not `scripts/`) to conform with the workspace's `skill-doc-organization/spec.md` requirement: "Each skill's helper scripts SHALL live under `.agents/skills/<skill-name>/bin/`." The agentskills.io reference uses `scripts/`, but the workspace spec wins.
- **Scaffold `evals/evals.json`** — 18 eval cases covering should-trigger, should-not-trigger, near-misses, and expected-output assertions. The orchestrator does not currently read this file at runtime; it exists for future eval-driven iteration per the agentskills.io guide.
- **Tighten `SKILL.md` description** — Front-load what + when, push about scope ("even if they do not name branches, OpenSpec, or PRs"), name near-misses ("Do NOT use for pure research, spike investigations, skill-only creation"), and clarify nested-skill ownership. 796 chars / 1024 max.
- **Add `## When to load` and `## When NOT to load`** — Explicit trigger / near-miss lists at the top of the body so the agent does not load the skill for research requests, skill-only creation, or read-only summaries.
- **Add `## How this skill is structured`** — Progressive-disclosure index listing every file under the skill folder with "when to load" guidance, so the agent does not pull in references until needed.
- **Add `## Workflow at a glance` with checklist** — A 11-line progress checklist mirroring the 11-phase pipeline, satisfying the agentskills.io "checklists for multi-step workflows" pattern.
- **Add `## Gotchas`** — 11 facts the orchestrator will get wrong without being told (e.g., "Specialist completion is NOT task completion", "The full-audit phase is `pre-archive`, not `pre-commit`", "Never use `git add -A`"). This is the highest-value section per the agentskills.io guide.
- **Add `## Available scripts`** — Table index for `bin/phase-status.mjs` and `bin/slug-check.mjs` with usage and exit-code conventions.
- **Bump version** — `metadata.version: 1.4 → 2.0`. Add `compatibility` field declaring git, openspec CLI, gh CLI, Node.js 18+.
- **Add `task-workflow.md` cross-reference notes** — Update references that pointed to `task-workflow.md` (now in `references/`).
- **Add `BLOCKER-CHECKLIST.md` cross-reference notes** — Update the header reference to point to the new location.

**Breaking changes:** None. The orchestrator's behavior is unchanged for callers; the new helpers are additive. The description rewrite changes triggering semantics slightly (pushier about scope), which may suppress false triggers that previously loaded the skill.

## Capabilities

### New Capabilities

- `skill-authoring-conventions`: Optional, **not added**. The eval scaffolding and gotchas are documentation/data, not enforceable requirements. Adding a new spec for thin documentation patterns would create governance overhead without changing behavior. The agentskills.io patterns are documented in the gotchas section instead.

### Modified Capabilities

- `skill-doc-organization`: No requirement change. This change conforms to the existing requirement "Each skill's helper scripts SHALL live under `.agents/skills/<skill-name>/bin/`" by placing the new scripts under `bin/` (not `scripts/` as the agentskills.io reference would suggest). No delta spec needed.
- `task-orchestration`: No requirement change. The change adds helper tooling that supports the existing "Workflow progress is resumable" requirement but does not change the requirement itself.

No spec-level delta is needed.

## Impact

**Affected files:**
- `.agents/skills/create-task/SKILL.md` — rewritten (329 lines, +147/-28 vs v1.4)
- `.agents/skills/create-task/task-workflow.md` → moved to `.agents/skills/create-task/references/task-workflow.md`
- `.agents/skills/create-task/BLOCKER-CHECKLIST.md` → moved to `.agents/skills/create-task/references/BLOCKER-CHECKLIST.md`
- `.agents/skills/create-task/bin/phase-status.mjs` — new file (230 lines)
- `.agents/skills/create-task/bin/slug-check.mjs` — new file (188 lines)
- `.agents/skills/create-task/evals/evals.json` — new file (148 lines)

**Affected systems / callers:**
- The `create-task` orchestrator itself (loaded by agents that handle implementation requests)
- Any external doc that links to `task-workflow.md` or `BLOCKER-CHECKLIST.md` from outside the skill folder — none known; both files were always accessed via paths relative to the skill folder
- The Obsidian vault (if it links to these files directly) — addressed by best-effort `openspec-vault-link` during archive

**Dependencies:** None added. The new scripts use only Node.js built-ins (`node:child_process`, `node:fs`, `node:path`). `package.json` and `node_modules` are not modified.

**Compatibility:**
- Skill folder structure now matches the agentskills.io spec (SKILL.md + scripts/bin/ + references/ + evals/).
- Helper scripts require Node.js 18+ (uses `node:` import prefix).
- The orchestrator requires git, openspec CLI, and gh CLI as before; these are unchanged.

**Security (per §3.2 — required for `proposal.md`/`design.md`):**

- **Threat model summary:** The change adds two helper scripts that read git/openspec/gh state and emit JSON to stdout. They do not transmit data off-host, do not store credentials, and do not introduce new dependencies. No new attack surface.
- **Affected data and trust boundaries:** None new. Scripts run locally and invoke the user's existing CLIs (git, openspec, gh). The only data they expose is what those CLIs already expose to the user in their dev environment.
- **Mitigations:** None required beyond the standard pre-commit-review blocker taxonomy and the pre-archive CVE scan (which the orchestrator already runs).
- **Residual risk:** None identified. The change is documentation restructuring plus tool wrapping.

## Security Considerations

- **Threat model summary:** See "Security (per §3.2 — ...)" section above.
- **Affected data and trust boundaries:** None new. Scripts run locally and invoke the user's existing CLIs (git, openspec, gh). No network egress beyond what those CLIs already do. No persistence.
- **Third parties:** None new. Scripts use Node.js built-ins only (`node:child_process`, `node:fs`, `node:path`). No new packages, no transitive dependencies.
- **Persistence:** None. Scripts emit JSON to stdout; nothing written to disk or DB.
- **Privilege surfaces:** None added. Scripts inherit the user's existing git/gh auth context. They do not request, store, or transmit credentials.
- **Requested overrides:** None at the proposal level. Overrides for individual HIGH findings identified by the pre-archive scanner are documented in `design.md` under `## Security Considerations`.

## History

- This change. Created 2026-08-03.