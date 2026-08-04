# Personal Workspace Docs

Workspace-level notes, conventions, and rules for the `Personal/` repository. Skill-specific documentation lives next to each skill under `.agents/skills/<skill>/`.

## Layout

- `workspace.md` — rules for `personal.code-workspace` and how new git projects are added at the root.
- `cve-reports/` — generated security scan reports and the trend dashboard.
- Skill-level docs and helper scripts (see `.agents/skills/README.md` for the library layout and naming rules):
  - `../.agents/skills/create-task/references/task-workflow.md`
  - `../.agents/skills/pr-description/references/pr-style.md`
  - `../.agents/skills/commit/references/commit-style.md`
  - `../.agents/skills/cve-scan/references/cve-methodology.md`
  - `../.agents/skills/openspec-vault-link/references/obsidian.md`

## Conventions

- New top-level git projects added to `Personal/` must be registered in `personal.code-workspace` (see `workspace.md`).
- Commit messages follow the format documented in `../.agents/skills/commit/references/commit-style.md` and enforced by the `commit` skill.