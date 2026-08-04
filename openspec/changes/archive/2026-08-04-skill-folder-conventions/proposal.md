## Why

The shared skill library under `.agents/skills/` has drifted from the Agent Skills specification's canonical folder model. Helpers and config sit in ad-hoc top-level locations like `bin/`, `docs/`, `schema/`, `tests/`, `evals/`, and bare `.md`/`.json files; the spec only recognizes `references/`, `scripts/`, and `assets/` as allowed subfolders. We will normalize every skill to that three-folder shape so each skill is self-contained, the layout is auditable, and `create-skill` / `update-skill` can enforce the convention uniformly.

## What Changes

- Relocate every script under a skill's `bin/` into `scripts/`.
- Relocate every skill-owned documentation Markdown file (currently loose at the skill root) into `references/`.
- Relocate every static data input the body or scripts read but do not execute (JSON pattern catalogs, eval fixtures, JSON schemas) into `assets/`.
- Relocate skill-owned test files into `scripts/tests/` to keep executable code grouped under `scripts/`.
- Update each affected `SKILL.md` to reference the new relative paths.
- Add a new spec for the canonical folder conventions.
- Tighten `skill-doc-organization` by removing the `bin/`, `docs/`, and other ad-hoc subfolder allowances and replacing them with the three-folder model.

## Capabilities

### New Capabilities
- `skill-folder-conventions`: defines the canonical three-folder layout (`scripts/`, `references/`, `assets/`) that every skill in `.agents/skills/` must follow, and the rules for classifying a file into one of the three folders.

### Modified Capabilities
- `skill-doc-organization`: replace the existing `bin/`-based and loose-file allowances with the canonical three-folder model. The `references/`, `scripts/`, and `assets/` folders absorb the responsibilities previously assigned to `bin/`, `docs/`, `schema/`, `tests/`, and `evals/`.

## Impact

- **Affected skills (9):** `commit`, `create-pr`, `create-skill`, `create-task`, `cve-scan`, `openspec-vault-link`, `skill-sessions`, plus the in-flight `create-skill` and `update-skill` (already restructured in the working tree).
- **Affected files:** roughly 20 tracked files moved into new paths; every `SKILL.md` body that referenced the old paths is updated to the new relative paths.
- **Tooling:** the existing CVE scanner, code-hygiene scanner, and `phase-status`/`slug-check` helpers continue to work once their `--script` paths are updated; no scanner logic changes.
- **External consumers:** none — all changes are inside `.agents/skills/`.
- **No data, auth, or trust-boundary change.** The refactor is a structural relocation only.

## Security Considerations

- **Data touched:** none. The change is a file-path relocation inside `.agents/skills/`; no data is read, written, transmitted, or exposed by the refactor itself.
- **Trust boundaries crossed:** none. The files move within the same trust boundary (the local working tree); no boundary is crossed.
- **Third-party trust:** unchanged. No new dependencies, no new external services, no network calls added.
- **Persistence:** unchanged. No schema, no DB, no on-disk state added or modified.
- **Privilege escalation surface:** unchanged. No auth, session, token, permission, or RBAC code is touched. The relocated scripts continue to run with the same local-user privileges they had before.
- **Override requests:** none. Expected scanner output is 0 CRITICAL / 0 HIGH once the `scan-staged.mjs` patterns path is fixed and the proposal gets a `## Security Considerations` section to match the scanner's regex.
