## Why

Skill-defining docs and helper scripts in `docs/` and `scripts/` are referenced only by a single skill, but they live at the workspace root and force every skill author to learn a separate top-level layout. As more skills are added, the `docs/` folder becomes a dumping ground for files that have nothing to do with each other. Each skill should own the docs and scripts that back it; readers following a skill into its references should never have to leave the skill's folder to find them.

## What Changes

- Move skill-specific docs from `docs/` into the corresponding `.agents/skills/<skill>/` folder, alongside `SKILL.md`:
  - `docs/task-workflow.md` → `.agents/skills/create-task/task-workflow.md`
  - `docs/pr-style.md` → `.agents/skills/create-pr/pr-style.md`
  - `docs/commit-style.md` → `.agents/skills/commit/commit-style.md`
  - `docs/cve-methodology.md` → `.agents/skills/cve-scan/cve-methodology.md`
  - `docs/obsidian.md` → `.agents/skills/openspec-vault-link/obsidian.md`
  - `docs/skills-folder.md` → `.agents/skills/README.md` (this doc describes where skills live, so it belongs inside `.agents/skills/` as the entry-point README)
- Move the only skill-specific script: `scripts/verify-commit.py` → `.agents/skills/commit/bin/verify-commit.py` (matches the existing `cve-scan/bin/` layout).
- Slim `docs/commit-style.md` on the move: drop the rule recap that already lives inline in `.agents/skills/commit/SKILL.md`; keep only the `verify-commit.py` pointer.
- Update every cross-reference in `SKILL.md` files and in `docs/README.md` to point at the new paths.
- Slim `docs/README.md` into a workspace-level index that points to skill docs, `workspace.md`, and the `cve-reports/` folder. `docs/workspace.md` stays where it is — it covers `personal.code-workspace`, not a single skill.
- Delete `scripts/` from the repo root after the move (it has no remaining contents).

## Capabilities

### New Capabilities

- `skill-doc-organization`: Each skill owns the documentation and helper scripts it depends on; skill-specific docs live next to `SKILL.md` inside `.agents/skills/<skill>/`, and skill-specific scripts live under `.agents/skills/<skill>/bin/`. Workspace-level docs that don't belong to a single skill stay in `docs/`.

### Modified Capabilities

None. Existing capabilities (`agent-skill-library`, `workspace-governance`) cover *which* skills exist and *where* skills live; this change adds the missing rule about *where the docs and scripts behind a skill live*.

## Impact

- Files moved:
  - `docs/task-workflow.md` → `.agents/skills/create-task/task-workflow.md`
  - `docs/pr-style.md` → `.agents/skills/create-pr/pr-style.md`
  - `docs/commit-style.md` → `.agents/skills/commit/commit-style.md`
  - `docs/cve-methodology.md` → `.agents/skills/cve-scan/cve-methodology.md`
  - `docs/obsidian.md` → `.agents/skills/openspec-vault-link/obsidian.md`
  - `docs/skills-folder.md` → `.agents/skills/README.md`
  - `scripts/verify-commit.py` → `.agents/skills/commit/bin/verify-commit.py`
- Files modified:
  - `.agents/skills/create-task/SKILL.md` (replace 11 `docs/task-workflow.md` references)
  - `.agents/skills/create-pr/SKILL.md` (replace `docs/pr-style.md` reference)
  - `.agents/skills/update-pr-description/SKILL.md` (replace 3 `docs/pr-style.md` references)
  - `.agents/skills/cve-scan/SKILL.md` (replace `docs/cve-methodology.md` reference)
  - `.agents/skills/openspec-vault-link/SKILL.md` (replace 2 `docs/obsidian.md` references + `docs/README` references in the INDEX template)
  - `docs/README.md` (slim to an index)
- Files deleted after move: `scripts/` (the empty directory).
- No code runtime change, no dependency change, no CI change. No breaking change for any external consumer (no published artifact references these paths).

## Security Considerations

- **Threat model summary.** This change is purely a file relocation plus reference rewrites. No new code, no new dependencies, no credential handling, no new network or filesystem surface.
- **Affected data and trust boundaries.** No new trust boundaries crossed. The moved docs are referenced by the same SKILL.md files that referenced them before; the path changes are local to the repository.
- **Mitigations.** Every cross-reference rewrite is verified by grep before commit; no path is left pointing at the old `docs/` or `scripts/` location. The `verify-commit.py` script is moved unchanged; its behavior is byte-identical at the new path.
- **Residual risk.** Low. No CRITICAL or HIGH findings anticipated; no override required.