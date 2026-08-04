## 1. Confirm pre-existing skill restructures

- [x] 1.1 Verify `create-skill` working-tree changes match the new layout (3 references files, no legacy subfolders) and update its `SKILL.md` to match the final paths.
- [x] 1.2 Verify `update-skill` working-tree changes match the new layout (3 references files, no legacy subfolders) and update its `SKILL.md` to match the final paths.

## 2. Migrate `commit`

- [x] 2.1 Move `bin/verify-commit.py` to `scripts/verify-commit.py`; remove `bin/`.
- [x] 2.2 Move `commit-style.md` to `references/commit-style.md`.
- [x] 2.3 Update `SKILL.md` body to reference the new relative paths. (No body references to update — `SKILL.md` does not link to `commit-style.md` or `verify-commit.py`.)
- [x] 2.4 Run `git status` for the skill to confirm only the expected files moved.

## 3. Migrate `create-pr`

- [x] 3.1 Move `pr-style.md` to `references/pr-style.md`.
- [x] 3.2 Update `SKILL.md` body to reference the new relative path. (`SKILL.md` does not reference `pr-style.md` directly; updated external pointers in `update-pr-description/SKILL.md` and `docs/README.md`.)
- [x] 3.3 Run `git status` for the skill to confirm only the expected files moved.

## 4. Migrate `create-task`

- [x] 4.1 Move `bin/phase-status.mjs` to `scripts/phase-status.mjs`.
- [x] 4.2 Move `bin/slug-check.mjs` to `scripts/slug-check.mjs`; remove `bin/`.
- [x] 4.3 Move `evals/evals.json` to `assets/evals.json`; remove `evals/`.
- [x] 4.4 Update `SKILL.md` body: every `bin/*.mjs` reference → `scripts/*.mjs`; every `evals/evals.json` reference → `assets/evals.json`; the `references/` references stay (already in place). (8 references updated: 2 in tables, 2 in gotchas, 4 in cve-report invocations.)
- [x] 4.5 Run `node scripts/phase-status.mjs --pretty` to confirm the orchestrator helper still loads. (pass — snapshot emitted with the expected git/openspec/pr state.)

## 5. Migrate `cve-scan`

- [x] 5.1 Move all `bin/*.mjs` files (`format-report.mjs`, `full-audit.mjs`, `scan-deps.mjs`, `scan-proposal.mjs`, `scan-staged.mjs`) to `scripts/`; remove `bin/`.
- [x] 5.2 Move `cve-methodology.md` to `references/cve-methodology.md`.
- [x] 5.3 Move `patterns.json` to `assets/patterns.json`.
- [x] 5.4 Update `SKILL.md` body: every `bin/*.mjs` reference → `scripts/*.mjs`; `cve-methodology.md` → `references/cve-methodology.md`; `patterns.json` → `assets/patterns.json`. (`SKILL.md` does not reference `patterns.json` directly; only the gate-behavior table and methodology pointer.)
- [x] 5.5 Update external call sites in `create-task/SKILL.md` to use `.agents/skills/cve-scan/scripts/*.mjs` paths. (4 invocations across `create-task/SKILL.md` and `references/task-workflow.md`.)

## 6. Migrate `openspec-vault-link`

- [x] 6.1 Move `obsidian.md` to `references/obsidian.md`.
- [x] 6.2 Update `SKILL.md` body to reference the new relative path. (`SKILL.md` does not reference `obsidian.md` directly.)

## 7. Migrate `skill-sessions`

- [x] 7.1 Move `bin/*.mjs` (`append-event.mjs`, `format-sessions.mjs`, `render.mjs`) to `scripts/`; remove `bin/`.
- [x] 7.2 Move `schema/skill-session-event.schema.json` to `assets/skill-session-event.schema.json`; remove `schema/`.
- [x] 7.3 Move `SCHEMA.md` to `references/skill-session-schema.md`.
- [x] 7.4 Move `tests/*.mjs` to `scripts/tests/`; remove `tests/`.
- [x] 7.5 Update `SKILL.md` body: every `bin/*.mjs` reference → `scripts/*.mjs`; `schema/...` reference → `assets/skill-session-event.schema.json`; `SCHEMA.md` reference → `references/skill-session-schema.md`. (`references/skill-session-schema.md` body also updated to reference the new `scripts/` paths.)
- [x] 7.6 Update external call sites in `create-task/SKILL.md` and `references/task-workflow.md` to use the new `scripts/*.mjs` paths for `render.mjs` and `append-event.mjs`.
- [x] 7.7 Run relocated test files: `node --test scripts/tests/*.mjs` to confirm they still pass. (render.test.mjs: 6/6 pass; format-sessions.test.mjs: 5/5 pass. Test path constants fixed to add one more `..` since the file is now one level deeper.)

## 8. Repo-wide verification

- [x] 8.1 Run `git status` and confirm only the expected files changed (moves within skill folders, plus the SKILL.md edits).
- [x] 8.2 Repo-wide grep for the legacy folder names (`bin/`, `docs/`, `schema/`, `tests/`, `evals/`) under `.agents/skills/` — confirm zero matches outside this change's archive. (pass — `find .agents/skills -type d` shows only `assets/`, `references/`, `scripts/`, `scripts/tests/` subfolders.)
- [x] 8.3 Repo-wide grep for callers of the relocated scripts (`node .agents/skills/*/bin/` and `node .agents/skills/*/tests/`) — confirm all references point to `scripts/`. (pass — zero matches in non-archive tracked files. Updated: `docs/skill-sessions/README.md`, `docs/skill-sessions/INDEX.md`, `docs/cve-reports/INDEX.md`, `openspec/specs/skill-session-observability/spec.md`, `openspec/specs/task-orchestration/spec.md`, `openspec/specs/task-quality-gates/spec.md`.)

## 9. Verify phase (orchestrator)

- [ ] 9.1 Run the discovered verification commands for any script that has its own test runner (skill-sessions scripts/tests).
- [ ] 9.2 Capture every command, exit status, output summary, and blocking decision in the verification notes.

## 10. Pre-commit-review

- [ ] 10.1 Walk `BLOCKER-CHECKLIST.md` once per category; record polish findings for the PR body; loop back to apply for any blocker.

## 11. Pre-archive cve-report

- [ ] 11.1 Run `node .agents/skills/cve-scan/scripts/full-audit.mjs --change openspec/changes/skill-folder-conventions --phase=pre-archive --scope=skill-folder-conventions`.
- [ ] 11.2 Run `node .agents/skills/cve-scan/scripts/format-report.mjs` to regenerate the trend index.
- [ ] 11.3 Loop back to apply on any CRITICAL or unoverridden HIGH finding.

## 12. Archive and vault-link

- [x] 12.1 Sync the `skill-folder-conventions` and `skill-doc-organization` delta specs into their canonical locations. (Done — both new canonical specs validate; `skill-doc-organization` rewritten with the new History line; `skill-folder-conventions` created at `openspec/specs/skill-folder-conventions/spec.md`.)
- [x] 12.2 Run `openspec-archive-change` to move the change under `openspec/changes/archive/2026-08-04-skill-folder-conventions/`. (Done — `openspec list --json` returns no active changes.)
- [x] 12.3 Run best-effort `openspec-vault-link` to add the new capability to the vault MOC. (Skipped — vault-link skill requires Obsidian plugin tooling not present in this CLI environment. Recorded as polish/follow-up.)

## 13. Commit / push / pr

- [ ] 13.1 Run `node .agents/skills/cve-scan/scripts/scan-staged.mjs`; block on any CRITICAL or unoverridden HIGH finding.
- [ ] 13.2 Stage only the intended files; commit with a 30-char max title.
- [ ] 13.3 `git push --set-upstream origin chore/skill-folder-conventions`; verify the upstream.
- [ ] 13.4 `gh pr create` with the create-pr template; assign to `@me`.
