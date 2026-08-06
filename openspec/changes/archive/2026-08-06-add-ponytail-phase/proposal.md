## Why

The `create-task` orchestrator runs `explore → propose → apply → verify → pre-commit-review → cve-report → archive → commit → push → pr`. Today the explore phase thinks freely and the propose phase writes a contract, but nothing in between forces the lazy/lean pass over the proposed approach. Propose can draft a design that names a new dependency, ignores an existing helper, or invents a wrapper for a one-liner — and the lazy review only happens later, during `pre-commit-review` or `ponytail-review`, after the proposal is already on disk. The result is proposal friction: drafts that look reasonable but are over-built, and a review pass that asks the agent to rewrite the proposal mid-stream.

A second gap: the `make-interfaces-feel-better` skill holds the agent's UI polish principles (concentric radii, motion restraint, tabular nums, hit-area, currentColor icons, etc.), but the `building-components` skill and the `openspec-explore` / `ponytail` modes do not reference it. Ponytail mode can trim polish as a "lazy" cut, and explore does not surface polish principles as a visible input to proposal.

## What Changes

- **Add a `ponytail` phase** between `explore` and `propose` in `create-task`. The phase enters ponytail mode, runs the lazy ladder against the explore output, and writes a `## Lazy alignment` block. `propose` cannot start until the block is present.
- **Wire `ponytail` into the orchestrator's pipeline** — 12 phases, not 11 — with mechanics in `references/task-workflow.md`. The phase is the gate before `propose`; it cannot be skipped.
- **Add a `## Polish awareness` section to `openspec-explore`** — when exploration touches visible UI, surface the relevant `make-interfaces-feel-better` principles as a `## Polish hooks` block in the explore notes. Skip for invisible changes.
- **Add a `## Pre-conditions` section to `openspec-propose`** — confirm the `## Lazy alignment` block from the ponytail phase exists before drafting; write the alignment into `proposal.md` as the first content section so the contract survives session boundaries.
- **Add a UI polish rule to `ponytail`** — UI polish principles from `make-interfaces-feel-better` are off-limits to the lazy ladder, even at `ultra` intensity. The lazy move is to reach for the existing design tokens, not to skip the rule.
- **Add a `polish.mdx` reference to `building-components`** — a consolidated checklist of the 19 polish principles, linkable from the SKILL.md. The canonical source is still `make-interfaces-feel-better`; `polish.mdx` is the in-context summary.
- **Add `## Interdependencies` tables** to `openspec-explore`, `openspec-propose`, `ponytail`, `building-components`, and `make-interfaces-feel-better` so the new process is self-describing. Update `create-task` accordingly.

**Non-breaking:** The pipeline gain is one new phase. The existing 11 phases, gates, and approval checkpoints are unchanged. The change is additive documentation and SKILL.md prose.

## Lazy alignment

The `ponytail` phase applied to this change:

- **Reuse** — every existing `## Interdependencies` table convention, `## Phase: <name> — done` output block, threat-model question, and `make-interfaces-feel-better` principle.
- **Drop** — nothing; the change is purely additive.
- **Replace** — nothing; the new SKILL.md sections follow the same shape as the existing ones.
- **Polish** — `polish.mdx` is the in-context checklist; `make-interfaces-feel-better` stays the canonical source.

## Capabilities

### New Capabilities

- `task-orchestration`: add a `ponytail` phase between `explore` and `propose` that runs the lazy ladder over the explore output and writes a `## Lazy alignment` block. Add a polish-awareness hook to `explore` and a polish-must-not-be-cut rule to `ponytail`. Surface `make-interfaces-feel-better` as a referenced skill from the cross-skill Interdependencies table.

### Modified Capabilities

- `task-orchestration`: add new requirements covering (a) the `ponytail` phase as a mandatory gate before `propose`, (b) the explore-phase polish hook, and (c) the ponytail polish-must-not-be-cut rule. Existing requirements (specialist recognition, resumability, etc.) are unchanged.

## Impact

**Affected files:**

- `.agents/skills/create-task/SKILL.md` — pipeline is now 12 phases; `## Interdependencies` table adds `make-interfaces-feel-better`.
- `.agents/skills/create-task/references/task-workflow.md` — new `## Phase: ponytail` mechanics.
- `.agents/skills/openspec-explore/SKILL.md` — new `## Polish awareness` section + `## Interdependencies`.
- `.agents/skills/openspec-propose/SKILL.md` — new `## Pre-conditions` section + `## Interdependencies`.
- `.agents/skills/ponytail/SKILL.md` — new UI polish rule in `## When NOT to be lazy`; new `## As a phase` section; `## Interdependencies`.
- `.agents/skills/building-components/SKILL.md` — new `## Polish is part of the work` section; `polish.mdx` added to References; `## Interdependencies`.
- `.agents/skills/building-components/references/polish.mdx` — new consolidated checklist.
- `.agents/skills/make-interfaces-feel-better/SKILL.md` — new `## Interdependencies`.

**Affected systems / callers:**

- The `create-task` orchestrator (one new phase, additive).
- `openspec-explore`, `openspec-propose`, `ponytail`, `building-components`, `make-interfaces-feel-better` — additive documentation only.

**Dependencies:** None added. The change references existing skills.

**Compatibility:**

- The 11 existing phases keep their names, gates, and approval checkpoints.
- The new `ponytail` phase is mandatory; users who run the orchestrator `lite`-style still get the phase.
- Stand-alone invocations of `openspec-propose` (without the orchestrator) surface the missing-alignment gap rather than silently proceeding.

## Security Considerations

- **Threat model summary:** Documentation and SKILL.md prose. No new code paths, no new dependencies, no new attack surface.
- **Affected data and trust boundaries:** None new.
- **Third parties:** None new. The change references existing skill folders.
- **Persistence:** None new. Git-tracked markdown only.
- **Privilege surfaces:** None added. The orchestrator continues to inherit the user's existing git/gh auth context.
- **Requested overrides:** None at the proposal level. Pre-archive scanner findings are addressed in `design.md` per §3.2.

## History

- This change. Created 2026-08-06.
