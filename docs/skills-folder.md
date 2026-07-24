# Skills Folder

Rule for where skill definitions live across this workspace.

## Rule

Skill definitions (one folder per skill, each containing a `SKILL.md`) must be placed under `.agents/skills/` inside the project they belong to:

- `Personal/.agents/skills/<skill-name>/SKILL.md`
- `Personal/lazyFinances/.agents/skills/<skill-name>/SKILL.md`

Do **not** create new skill folders under `.opencode/skills/`. The `.opencode/` folder is reserved for tooling installs (e.g. `package.json`, `node_modules/`) and global commands under `.opencode/commands/`. Skills are user-defined agent capabilities and belong in `.agents/`.

## Why

- `.opencode/` mixes the opencode plugin install with project content. Anything inside it risks being ignored or overwritten by the plugin tooling.
- `.agents/skills/` is the dedicated location for agent skills, mirroring the `.agents/prompts/` convention already used in `lazyFinances`.
- Keeping a single canonical path makes skill discovery and documentation predictable.

## Current layout

```
Personal/.agents/skills/
  commit/
  create-pr/
  openspec-apply-change/
  openspec-archive-change/
  openspec-explore/
  openspec-propose/
  openspec-vault-link/

Personal/lazyFinances/.agents/skills/
  commit/
  create-pr/
  cve-scan/
  lazy-finance-add-tests/
  openspec-apply-change/
  openspec-archive-change/
  openspec-explore/
  openspec-propose/
  openspec-vault-link/
```

`.opencode/skills/` should not exist in either project. If you find it there, the contents are stale and must be moved into `.agents/skills/` and the empty directory removed.
