## 1. Update create-task SKILL.md and references

- [ ] 1.1 Update the workflow-at-a-glance pipeline from 11 phases to 12 phases, inserting `ponytail` between `explore` and `propose`
- [ ] 1.2 Update the `## Phase integration` (§2.1) to add the `ponytail` bullet and update the `explore` and `propose` bullets
- [ ] 1.3 Add `openspec-explore`, `openspec-propose`, `ponytail`, and `make-interfaces-feel-better` to the `## Interdependencies` table at the bottom of SKILL.md
- [ ] 1.4 Add `## Phase: ponytail` mechanics to `references/task-workflow.md` covering inputs, mechanics, gate, loop-back, and output format

## 2. Update openspec-explore SKILL.md

- [ ] 2.1 Add `## Polish awareness` section that surfaces `make-interfaces-feel-better` principles in the explore notes as a `## Polish hooks` block
- [ ] 2.2 Add `## Interdependencies` table referencing `make-interfaces-feel-better` and `openspec-propose`

## 3. Update openspec-propose SKILL.md

- [ ] 3.1 Add `## Pre-conditions` section explaining the ponytail alignment contract and instructing propose to write the alignment into `proposal.md` as the first content section
- [ ] 3.2 Add `## Interdependencies` table referencing `openspec-explore` and `ponytail`

## 4. Update ponytail SKILL.md

- [ ] 4.1 Add the UI polish rule to `## When NOT to be lazy` naming the principles from `make-interfaces-feel-better` that are off-limits
- [ ] 4.2 Add `## As a phase` section explaining the bounded phase invocation from `create-task`
- [ ] 4.3 Add `## Interdependencies` table referencing `make-interfaces-feel-better` and `create-task`

## 5. Update building-components

- [ ] 5.1 Add `## Polish is part of the work` section to SKILL.md pointing at `polish.mdx` and `make-interfaces-feel-better`
- [ ] 5.2 Add `polish.mdx` to the References list in SKILL.md
- [ ] 5.3 Create `references/polish.mdx` with the consolidated checklist grouped by category (surfaces, typography, animation, icons, process)
- [ ] 5.4 Add `## Interdependencies` table referencing `make-interfaces-feel-better` and `ponytail`

## 6. Update make-interfaces-feel-better SKILL.md

- [ ] 6.1 Add `## Interdependencies` table referencing `building-components`, `openspec-explore`, and `ponytail`

## 7. Sync canonical task-orchestration spec

- [ ] 7.1 Append the three new requirements (Ponytail phase gates, Polish hooks, Polish must not be cut) to `openspec/specs/task-orchestration/spec.md`
- [ ] 7.2 Add a History entry pointing at this change

## 8. Verify

- [ ] 8.1 `git status --porcelain` shows only the intended files plus the OpenSpec change directory
- [ ] 8.2 Re-read every touched SKILL.md and confirm the new sections, interdependencies, and renumbering are well-formed
- [ ] 8.3 Re-read `polish.mdx` and confirm every principle is sourced from `make-interfaces-feel-better`
- [ ] 8.4 Confirm the create-task pipeline number is 12 in SKILL.md and the references/task-workflow.md phase mechanics match

## 9. Pre-archive CVE audit

- [ ] 9.1 Run the pre-archive CVE audit per create-task §3.5
- [ ] 9.2 Loop back on any CRITICAL or unoverridden HIGH findings

## 10. Archive

- [ ] 10.1 Run `openspec-archive-change` to move the change under `openspec/changes/archive/2026-08-06-add-ponytail-phase/`
- [ ] 10.2 Confirm `openspec list --json` no longer contains the active change
- [ ] 10.3 Confirm the canonical task-orchestration spec was synced

## 11. Commit, push, PR

- [ ] 11.1 Stage only the intended files (the four tracked SKILL.md edits, the new polish.mdx, the new openspec change directory, the synced canonical spec)
- [ ] 11.2 Run the staged-pattern scan and confirm no CRITICAL findings
- [ ] 11.3 Commit with a conventional title ≤ 30 chars
- [ ] 11.4 Push to `origin` and open a PR against `main`
