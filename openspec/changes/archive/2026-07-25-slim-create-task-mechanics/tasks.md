## 1. Create the workflow mechanics doc

- [x] 1.1 Create `docs/task-workflow.md` with the section structure: preflight, resume detection, apply, verify, archive, cve-report, pre-pr, commit/push/pr, output formats, recovery paths
- [x] 1.2 Move §2 (preflight) mechanics from create-task to the doc, including the refined three-bucket dirty-worktree check (staged / unstaged / untracked)
- [x] 1.3 Move §3.2 (resume detection) bash commands to the doc
- [x] 1.4 Move §3.4 sync mechanics (split from the policy that stays in the skill) to the doc under "Phase: archive"
- [x] 1.5 Move §4.3 verify scope details, §4.5 repo verification discovery, §4.6 result handling to the doc under "Phase: verify"
- [x] 1.6 Move §4.4 post-archive CVE report mechanics to the doc under "Phase: cve-report"
- [x] 1.7 Move §4.7 pre-PR readiness *commands* to the doc under "Phase: pre-pr" (the rule stays in the skill)
- [x] 1.8 Move §5.x phase mechanics (archive confirmations, CVE-report confirmations, commit preview, push verification, PR creation) to the doc under "Phase: commit/push/pr"
- [x] 1.9 Move §6 output format templates to the doc under "Output formats"
- [x] 1.10 Move §7 recovery paths to the doc under "Recovery"

## 2. Slim the create-task skill

- [x] 2.1 Add a preamble paragraph at the top of `create-task/SKILL.md` pointing the orchestrator to `docs/task-workflow.md` (read once at workflow start)
- [x] 2.2 Replace §4.1 with the 5-line pointer to `openspec-explore` (CVE threat-model prompts)
- [x] 2.3 Split §3.4: keep the gate policy in the skill, move sync mechanics to the doc
- [x] 2.4 Split §4.4: keep the orchestrator's interface commands in the skill, move post-archive recipe details to the doc
- [x] 2.5 Split §5.1-5.7: keep gating rules in the skill, move mechanics to the doc
- [x] 2.6 Verify the slim skill is ≤ 220 lines (`wc -l .agents/skills/create-task/SKILL.md`) — current: 180 lines
- [x] 2.7 Verify §4.1 is now ≤ 5 lines and contains no inline prompts — current: 5-line pointer, no inline prompts

## 3. Replace the task-orchestration Purpose line

- [x] 3.1 Edit `openspec/specs/task-orchestration/spec.md` to replace the `TBD - created by archiving change create-task-workflow. Update Purpose after archive.` line with the actual Purpose statement from the design
- [x] 3.2 Verify the spec now has a real Purpose line (no TBD) and no other lines were changed

## 4. Smoke test

- [x] 4.1 Static verification scope (per user direction): trace the workflow through the new files instead of a real trivial-task end-to-end run
- [x] 4.2 Verify each phase section exists in `docs/task-workflow.md` with the expected output format templates (Phase output, Verification/CVE-report output, Completion output)
- [x] 4.3 Verify each gate is preserved in the slim skill: preflight (clean/dirty handling), archive-before-commit (§2.3), staged-scan (§3.4 commit boundary), never-list (§5)
- [x] 4.4 Verify the doc is referenced once at workflow start (skill preamble) and per-section pointers are correct (e.g. §2.1 → "Phase: preflight", §3.4 → "Phase: cve-report")
- [x] 4.5 Verify the completion output template matches between the §3.3 (skill) and the doc's "Output formats / Completion output"
- [x] 4.6 Discovery: the original §4.1 prompts actually live in `docs/cve-methodology.md`, not `openspec-explore`. The new §3.1 correctly references the methodology doc plus the create-task-specific 6th prompt. Proposal and design updated to reflect this.

## 5. Verify line counts and content

- [x] 5.1 `wc -l .agents/skills/create-task/SKILL.md` shows 194 lines (≤ 220) ✓
- [x] 5.2 `wc -l docs/task-workflow.md` shows 315 lines (~310) ✓
- [x] 5.3 Each specialist skill's `SKILL.md` is unchanged — `git status --porcelain` shows only the four expected paths (create-task, docs/task-workflow, task-orchestration spec, openspec change) ✓
- [x] 5.4 `task-orchestration/spec.md` has no TBD Purpose line — replaced with the actual Purpose statement ✓

## 6. Commit, push, and open PR

- [x] 6.1 Stage only the intended files: `docs/task-workflow.md`, `.agents/skills/create-task/SKILL.md`, `openspec/specs/task-orchestration/spec.md`, `openspec/changes/slim-create-task-mechanics/*` ✓
- [x] 6.2 Run staged CVE scan (`node .agents/skills/cve-scan/bin/scan-staged.mjs`) — exit 0, no findings (gitleaks not installed, secret coverage reduced) ✓
- [x] 6.3 Commit with the title and body per the existing commit style (≤ 30 chars title, single-line body paragraphs) ✓
- [x] 6.4 Push to `origin/refactor/slim-create-task-mechanics` ✓
- [x] 6.5 Verify upstream is set (`git rev-parse --abbrev-ref --symbolic-full-name @{u}`) and `git ls-remote` shows the branch ✓
- [x] 6.6 Open PR via `create-pr` skill format — base: main, head: refactor/slim-create-task-mechanics, auto-assign to current GitHub user ✓
- [x] 6.7 Return the PR URL — https://github.com/saamanthacosta/personal/pull/9 ✓
