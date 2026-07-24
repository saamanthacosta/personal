# Personal Workspace Docs

This folder stores notes, conventions, and rules for the `Personal/` workspace.

## Layout

- `workspace.md` — rules for the `personal.code-workspace` file and how new git projects are added.
- `commit-style.md` — convention for writing commit messages (mirrors the `commit` skill under `.agents/skills/commit/`).
- `pr-style.md` — convention for opening PRs (mirrors the `create-pr` skill under `.agents/skills/create-pr/`).
- `skills-folder.md` — rule for where skill definitions live (`.agents/skills/`, not `.opencode/skills/`).
- `cve-methodology.md` — shared security severity ladder, gate mapping, and credential-handling rules.
- `cve-reports/` — generated security scan reports and trend dashboard.
- `obsidian.md` — tracked vault state, community-plugin setup, and MCP credential handling.

## Conventions

- New top-level git projects added to `Personal/` must be registered in `personal.code-workspace` (see `workspace.md`).
- Commit messages follow the format documented in `commit-style.md` and enforced by the `commit` skill.
