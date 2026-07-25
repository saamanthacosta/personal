## 1. File moves

- [ ] 1.1 `git mv docs/task-workflow.md .agents/skills/create-task/task-workflow.md`
- [ ] 1.2 `git mv docs/pr-style.md .agents/skills/create-pr/pr-style.md`
- [ ] 1.3 `git mv docs/commit-style.md .agents/skills/commit/commit-style.md`
- [ ] 1.4 `git mv docs/cve-methodology.md .agents/skills/cve-scan/cve-methodology.md`
- [ ] 1.5 `git mv docs/obsidian.md .agents/skills/openspec-vault-link/obsidian.md`
- [ ] 1.6 `git mv docs/skills-folder.md .agents/skills/README.md`
- [ ] 1.7 `git mv scripts/verify-commit.py .agents/skills/commit/bin/verify-commit.py`

## 2. Cross-reference rewrites

- [ ] 2.1 `.agents/skills/create-task/SKILL.md` — replace 11 occurrences of `docs/task-workflow.md` with `task-workflow.md`
- [ ] 2.2 `.agents/skills/create-pr/SKILL.md` — replace `docs/pr-style.md` with `pr-style.md`
- [ ] 2.3 `.agents/skills/update-pr-description/SKILL.md` — replace 3 occurrences of `docs/pr-style.md` with `pr-style.md`
- [ ] 2.4 `.agents/skills/cve-scan/SKILL.md` — replace `docs/cve-methodology.md` with `cve-methodology.md`
- [ ] 2.5 `.agents/skills/openspec-vault-link/SKILL.md` — replace `docs/obsidian.md` with `obsidian.md` and update the `docs/README` reference in the INDEX template
- [ ] 2.6 `.agents/skills/commit/SKILL.md` — note that `scripts/verify-commit.py` is referenced from the moved `commit-style.md`, not from `SKILL.md` (no change to `SKILL.md`)

## 3. Light doc edits

- [ ] 3.1 Slim `.agents/skills/commit/commit-style.md` — keep only the `verify-commit.py` pointer and any external linkbacks; drop the rule recap that already lives inline in `.agents/skills/commit/SKILL.md`
- [ ] 3.2 Rewrite `docs/README.md` as a workspace-level index pointing to skill-level docs, `docs/workspace.md`, and `docs/cve-reports/`

## 4. Cleanup

- [ ] 4.1 `rmdir scripts/` (empty after the move)
- [ ] 4.2 Grep the repo for `docs/task-workflow.md`, `docs/pr-style.md`, `docs/commit-style.md`, `docs/cve-methodology.md`, `docs/obsidian.md`, `docs/skills-folder.md`, `scripts/verify-commit.py`, and `scripts/` — zero hits outside this change's archive

## 5. Validation

- [ ] 5.1 `openspec validate relocate-skill-docs` passes
- [ ] 5.2 Apply-boundary CVE audit clean (0 findings)
- [ ] 5.3 Confirm `verify-commit.py` runs unchanged from the new path (`python3 .agents/skills/commit/bin/verify-commit.py` exits 0 against the most recent commit)