# Skills Folder

Rule for where skill definitions live across this workspace. Workspace-level rules that any compatible agent MUST follow live in `AGENTS.md` at the repository root.

## Rule

Skill definitions (one folder per skill, each containing a `SKILL.md`) must be placed under `.agents/skills/` inside the project they belong to:

- `Personal/.agents/skills/<skill-name>/SKILL.md`
- `Personal/lazyFinances/.agents/skills/<skill-name>/SKILL.md`

Do not create skill folders under `.opencode/` or `.github/`. Shared and workspace skills belong in `.agents/skills/`.

## Why

- `.opencode/` mixes the opencode plugin install with project content. Anything inside it risks being ignored or overwritten by the plugin tooling.
- `.agents/skills/` is the dedicated location for agent skills, mirroring the `.agents/prompts/` convention already used in `lazyFinances`.
- Keeping a single canonical path makes skill discovery and documentation predictable.

## Current layout

```
Personal/.agents/skills/
  commit/
  create-pr/
  cve-scan/
  openspec-apply-change/
  openspec-archive-change/
  openspec-explore/
  openspec-propose/
  openspec-vault-link/
  skill-sessions/
  update-pr-description/

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

`.opencode/skills/` should not exist in either project. If a stale skill directory appears, move supported content into `.agents/skills/` and remove the stale copy.
