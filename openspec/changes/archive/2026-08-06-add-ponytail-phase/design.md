## Context

`create-task` orchestrates 11 phases today. The orchestrator's `apply` phase already wires `skill-authoring` and `building-components` as bounded specialists (per the merged `create-task-add-building-components` change). The gap is between `explore` (which thinks freely) and `propose` (which writes a contract): there is no forced lazy/lean pass over the proposed approach, so `propose` can draft an over-built design that the agent then has to rewrite later.

A second gap: `make-interfaces-feel-better` holds the UI polish principles, but `openspec-explore`, `ponytail`, and `building-components` do not reference it. Ponytail can trim polish as a "lazy" cut, and explore does not surface polish principles as a visible input to proposal.

The change tightens the bridge between explore and propose and weaves polish awareness into the explorer's notes plus the lazy ladder's off-limits list.

## Goals / Non-Goals

**Goals:**

- Add a `ponytail` phase between `explore` and `propose` that runs the lazy ladder over the explore output and writes a `## Lazy alignment` block. `propose` cannot start until the block is present.
- Document the phase mechanics in `create-task/references/task-workflow.md` so the orchestrator runs the same shape every time.
- Add `## Polish hooks` to `openspec-explore` so the explorer surfaces relevant `make-interfaces-feel-better` principles when visible UI is in scope.
- Add the UI polish rule to `ponytail`'s `## When NOT to be lazy` so the lazy ladder does not trim polish.
- Add `polish.mdx` to `building-components` as a consolidated in-context checklist and link the canonical source (`make-interfaces-feel-better`).
- Make the cross-skill wiring self-describing with `## Interdependencies` tables on every touched skill.

**Non-Goals:**

- Building a registry of phases, specialists, or polish principles. The list is inline in the SKILL.md.
- Changing the 11 existing phases. The pipeline gain is one new phase.
- Modifying `make-interfaces-feel-better` itself beyond the new `## Interdependencies` table.
- Changing the existing `pre-commit-review` or `cve-report` gates.

## Decisions

### Decision 1: Inline phase, not a registry

**Choice:** Add the `ponytail` phase inline in `create-task/SKILL.md` (12-phase pipeline) and put the mechanics in `references/task-workflow.md`.

**Rationale:** The orchestrator's surface area is the SKILL.md body. A registry adds load hops and a new artifact for one new phase. The existing pattern (specialist recognition table in §1.5) is inline.

**Alternatives considered:**

- Move the phase machinery into a new `references/ponytail-phase.md` — rejected; the mechanics live alongside the other phase mechanics in `references/task-workflow.md`.
- Auto-discover phases from the codebase — rejected; the orchestrator's policy is co-located with its contract.

### Decision 2: Phase output is the gate, not a file

**Choice:** The `ponytail` phase writes the `## Lazy alignment` block into its `## Phase: ponytail — done` output. `propose` reads it from the conversation and writes it into `proposal.md` as the first content section.

**Rationale:** At the time ponytail runs, `proposal.md` does not yet exist (it is created by `propose`). The phase output is the durable contract that `propose` reads, and writing it into `proposal.md` makes the contract survive session boundaries.

**Alternatives considered:**

- Write the alignment to `openspec/changes/<name>/lazy-alignment.md` — rejected; introduces a new artifact and the alignment is naturally part of the proposal anyway.
- Write the alignment to `tasks.md` — rejected; `tasks.md` is part of the proposal artifacts and does not exist yet.

### Decision 3: Phase cannot be skipped, but alignment findings can be overridden

**Choice:** The phase itself is mandatory (no opt-out at run time). The user can override a specific alignment finding, recorded in the block, but the phase still runs.

**Rationale:** The phase is the gate before `propose`. Letting the user skip it would let `propose` draft unaligned designs, which is the gap the phase closes. Overriding a finding is the cheap escape hatch for the rare case where the lazy ladder and the user disagree.

### Decision 4: Polish rule lives in `ponytail`, not in `make-interfaces-feel-better`

**Choice:** The "polish must not be cut" rule is added to `ponytail`'s `## When NOT to be lazy` section. `make-interfaces-feel-better` is the canonical source of the principles but stays out of the lazy-mode rules.

**Rationale:** `make-interfaces-feel-better` is a UI craft skill, not a code-craft skill. Cross-pollinating it with the lazy-ladder rules would dirty its scope. The reverse direction — `ponytail` references `make-interfaces-feel-better` — keeps the layering clean.

### Decision 5: Consolidated `polish.mdx` reference, not a wholesale copy

**Choice:** `building-components/references/polish.mdx` is a checklist (~80 lines) that consolidates the 19 principles from `make-interfaces-feel-better` with category grouping. The canonical source remains `make-interfaces-feel-better`.

**Rationale:** Component authors want a short, in-context checklist while they write components; loading `make-interfaces-feel-better` for the rationale is one step further. The `polish.mdx` is the bridge that points at the canonical source.

### Decision 6: `## Interdependencies` on every touched skill

**Choice:** Add the `## Interdependencies` table required by the workspace's skill spec (`references/skill-format-spec.md`) to every skill the change touches. The table is the source of truth for cross-skill references.

**Rationale:** The orchestrator and the consumers can read the interdependencies table to know which skills expect which; this is the single point of cross-reference.

## Risks / Trade-offs

- **Risk:** The new phase slows the workflow by one pass. → **Mitigation:** The phase is a bounded ladder application, not a research project; cost is a few minutes.
- **Risk:** The `## Lazy alignment` block becomes boilerplate if every change writes the same shape. → **Mitigation:** The block is short (3-5 lines); the format is dogmatic on purpose so the agent doesn't pad it.
- **Risk:** The 12-phase pipeline misleads readers used to the 11-phase shape. → **Mitigation:** The pipeline visualization in §1 is updated; the `progress` checklist shows the new numbering.
- **Risk:** The `polish.mdx` reference drifts from `make-interfaces-feel-better` as the canonical source evolves. → **Mitigation:** `polish.mdx` explicitly names `make-interfaces-feel-better` as the canonical source and links to it; future polish additions in `make-interfaces-feel-better` should be folded into `polish.mdx` in a follow-up.
- **Risk:** The new `## Interdependencies` tables drift if a referenced skill is renamed or removed. → **Mitigation:** The tables are checked at next skill audit; no automated enforcement today.

## Migration Plan

- Pure documentation change. No callers to migrate.
- The new `task-orchestration` requirements become enforceable once the change is archived and the spec is synced.
- The orchestrator's behavior is unchanged for tasks that do not flow through explore → ponytail → propose (e.g., stand-alone `openspec-propose` calls).
- No data migration. No schema changes.

## Open Questions

- None. The recognition is bounded to the five existing skills. Future specialists (e.g., a `cve-scan` deep-dive specialist if one is split out) can extend the table in a follow-up change.

## Security Considerations

### Threat model

- **Data classes:** None. The change is documentation and SKILL.md prose; no user data, secrets, or PII is processed.
- **Trust boundaries:** None new. The orchestrator continues to load `make-interfaces-feel-better`, `ponytail`, `openspec-explore`, and `openspec-propose` as bounded methodology references; no new code paths execute.
- **Dependencies:** None added. The change references existing skills.
- **Persistence:** Git-tracked markdown only. No schema, DB, or filesystem state added.
- **Privilege surfaces:** None added. The orchestrator continues to inherit the user's existing git/gh auth context.

### Mitigations

- Stand-alone `openspec-propose` invocations surface the missing-alignment gap rather than silently proceeding — this prevents an unaligned design from being drafted without operator awareness.
- The phased gate prevents the lazy ladder from trimming UI polish that the user explicitly requested.

### Residual risk

- Minimal. The change is documentation-only and the new phase is bounded by the existing pre-commit-review and CVE-report gates.

## Security Overrides

The pre-archive `cve-scan` report (`docs/cve-reports/2026-08-06-pre-archive-add-ponytail-phase.md`) surfaces five HIGH findings from the `pattern:child-process` rule. All five are scanner noise on pre-existing `execFileSync` calls — the previous archive (`2026-08-05-create-task-add-building-components`) reported the identical matches against the same files. None of the calls accept untrusted input: each spawns a Node script with a hardcoded argv array, no user input, and no shell interpretation.

- **Finding:** `pattern:child-process` at `.agents/skills/create-task/scripts/phase-status.mjs:25` — accepted; the script bundles the argv from a fixed command name (`git`, `openspec`, `gh`) and a constant args list parsed from flags. No interpolation.
- **Finding:** `pattern:child-process` at `.agents/skills/openspec-status/scripts/status.mjs:8` — accepted; same pattern, fixed argv.
- **Finding:** `pattern:child-process` at `.agents/skills/skill-sessions/scripts/tests/format-sessions.test.mjs:11` — accepted; the test spawns the format-sessions script under test with hardcoded JSON inputs.
- **Finding:** `pattern:child-process` at `.agents/skills/skill-sessions/scripts/tests/render.test.mjs:8` — accepted; the test spawns the render script under test with hardcoded JSON inputs.
- **Finding:** `pattern:child-process` at `.agents/skills/skills-audit/scripts/audit-all.mjs:44` — accepted; the script spawns helpers with fixed argv.

No CRITICAL findings. No unoverridden HIGH findings once this section is recorded. The change itself does not modify any script that spawns a child process.
