---
tags:
  - capability/task-orchestration
---

# task-orchestration Delta Spec

## ADDED Requirements

### Requirement: Ponytail phase gates the propose-to-apply transition

The `create-task` orchestrator SHALL run a `ponytail` phase between `explore` and `propose`. The phase SHALL apply the `ponytail` skill's lazy ladder over the explore output and produce a `## Lazy alignment` block. The orchestrator SHALL NOT initiate `propose` until the `## Phase: ponytail — done` block is present in the conversation. The phase is mandatory and SHALL NOT be skipped at run time; the user MAY override an individual alignment finding, documented in the block, but the phase itself SHALL run.

#### Scenario: Ponytail phase runs in the canonical sequence

- **WHEN** the orchestrator progresses from `explore` to `propose`
- **THEN** a `ponytail` phase has run between them
- **AND** the `## Phase: ponytail — done` block contains a `## Lazy alignment` block naming the existing helper, dropped YAGNI item, and one-line replacement
- **AND** the workflow does not start `propose` until that block is present

#### Scenario: Ponytail phase surfaces a missed pattern loops back to explore

- **WHEN** the lazy ladder surfaces a missed pattern (e.g., the explore notes name a new dependency but the codebase already covers the use case with an existing helper)
- **THEN** the orchestrator loops back to `explore` with the alignment summary
- **AND** the loop-back narration names the surface and the gap in one line

#### Scenario: Propose writes the lazy alignment into proposal.md

- **WHEN** `propose` starts after the ponytail phase
- **THEN** `proposal.md` opens with a `## Lazy alignment` section whose contents match the ponytail phase output
- **AND** the alignment text is terse (ponytail-style: short lines, no prose)

### Requirement: Exploration surfaces UI polish hooks when visible UI is in scope

The `openspec-explore` skill SHALL include a `## Polish awareness` section that, when the exploration touches visible UI (components, screens, animation, theming, copy, micro-interactions), surfaces the relevant `make-interfaces-feel-better` principles in the explore notes under a `## Polish hooks` heading. The skill SHALL skip the section entirely when the change is invisible to the user (backend service, build script, CLI internals, schema migration).

#### Scenario: Visible UI change gets a Polish hooks block

- **WHEN** the user asks to add, refactor, or fix a UI component
- **THEN** the explore notes contain a `## Polish hooks` block referencing at least one principle from `make-interfaces-feel-better`
- **AND** the principles named are relevant to the change (concentric radii for nested surfaces, tabular nums for live counters, animation restraint for hover states, etc.)

#### Scenario: Backend change omits the Polish hooks block

- **WHEN** the user asks to add a CLI flag, change a SQL migration, or wire a new endpoint
- **THEN** the explore notes do not contain a `## Polish hooks` block
- **AND** the change does not add visible UI surface

### Requirement: Ponytail mode does not trim UI polish

The `ponytail` skill SHALL treat UI polish principles from `make-interfaces-feel-better` as off-limits to the lazy ladder, even at `ultra` intensity. The principles named in `## When NOT to be lazy` SHALL include concentric radii, optical alignment, font smoothing, tabular numerals, minimum hit area, scale-on-press, motion restraint, one `currentColor` SVG per state, outline-as-default fill-on-active, `text-wrap: balance / pretty`, no `transition: all`, and no `will-change` on non-composite properties. The lazy move is to reach for the existing design tokens, not to skip the rule.

#### Scenario: Lazy alignment still respects polish

- **WHEN** the explore notes carry `## Polish hooks` and the ponytail phase runs the lazy ladder
- **THEN** the `## Lazy alignment` block reflects that the lazy path still honours the polish principles (points to the existing design token, does not drop the rule)
- **AND** the alignment does not propose cutting any of the principles named in `make-interfaces-feel-better`

#### Scenario: Polish rule survives ultra intensity

- **WHEN** the user activates `ponytail ultra` mode
- **THEN** the UI polish principles remain in the off-limits list
- **AND** the lazy ladder does not propose skipping them as a YAGNI cut

## MODIFIED Requirements

_No existing requirements are modified. The new requirements are additive and do not change the existing specialist-recognition, resumability, or gotchas requirements._
