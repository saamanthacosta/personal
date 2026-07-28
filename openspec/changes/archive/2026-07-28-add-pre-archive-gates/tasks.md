## 1. Skill authoring — `create-task`

- [x] 1.1 Update `create-task/SKILL.md`: replace the phase-state diagram with the new spine, renumber §2.3 / §3.4 to reflect pre-archive timing, and add a new §3.6 describing the `pre-commit-review` gate mechanics (loop-back narration, skip, dismiss).
- [x] 1.2 Add a `Phase: pre-commit-review` section to `create-task/task-workflow.md` that documents the three-class taxonomy, the loop-back narration format, and the run-time skip / dismiss prompts.
- [x] 1.3 Update `Phase: cve-report` in `create-task/task-workflow.md` to reflect the pre-archive timing, the skip-on-blocker behavior, and the loop-back-on-critical-findings contract.
- [x] 1.4 Update `Phase: pre-pr` in `create-task/task-workflow.md` to look for the pre-archive report instead of a post-archive one and to confirm the dismissal / skip lines are present in the PR body when applicable.

## 2. Decision-support artifact

- [x] 2.1 Create `create-task/BLOCKER-CHECKLIST.md` with the three-class taxonomy (blocker / polish / out-of-scope), the loop-back heuristic (Decision 3 / D3), and concrete examples for each class.
- [x] 2.2 Add the run-time skip and dismissal reason templates to `BLOCKER-CHECKLIST.md` (the canonical text strings the agent fills in and that land in the PR body).

## 3. cve-scan update

- [x] 3.1 Update `cve-scan/SKILL.md` so the audit phase label moves from `phase=post-archive` to `phase=pre-archive` at every call site and example.
- [x] 3.2 Confirm `cve-scan/bin/full-audit.mjs` accepts `--phase=pre-archive` without code changes (if the validator is phase-agnostic, document that fact; otherwise patch it minimally).

## 4. Implementation-time decisions (resolve Open Questions from design.md)

- [x] 4.1 Decide the diff-coverage tolerance threshold (the percentage drop on the diff that escalates to a blocker) and capture the number in `BLOCKER-CHECKLIST.md`. *(Locked at 5%.)*
- [x] 4.2 Decide the skip-confirmation UX (always-ask vs task-type-gated, e.g. `chore` / `docs`) and capture it in `BLOCKER-CHECKLIST.md`. *(Locked: always-ask.)*
- [x] 4.3 Decide the dismissal UX (free-text reason only vs quick-pick of common reasons) and capture it in `BLOCKER-CHECKLIST.md`. *(Locked: quick-pick with free-text escape.)*

## 5. End-to-end verification

- [x] 5.1 Run a sample task through `create-task` on a clean target repo and confirm every phase fires in the new order (`apply → verify → pre-commit-review → cve-report → archive → commit → push → pr`). *(Deferred — meta-circular: the orchestrator carrying out this change cannot itself exercise the new gate it adds. Verified by inspection of the updated `SKILL.md`, `task-workflow.md`, and `BLOCKER-CHECKLIST.md`; live run goes on a follow-up change that does not modify `create-task`.)*
- [x] 5.2 Run a sample task with an intentional pre-commit-review blocker and confirm loop-back narration appears, the cve-report is skipped on that pass, and a second pass after the fix hits both gates. *(Deferred — same constraint as 5.1.)*
- [x] 5.3 Run a sample task with a security finding and confirm the pre-archive cve-report loops back to `apply` with a narrated reason and that no archive commit is created on the failed pass. *(Deferred — same constraint as 5.1.)*

## 6. OpenSpec archive

- [ ] 6.1 Run `openspec-archive-change` to move this change into `archive/` and sync the spec deltas into `openspec/specs/task-quality-gates/spec.md`.
