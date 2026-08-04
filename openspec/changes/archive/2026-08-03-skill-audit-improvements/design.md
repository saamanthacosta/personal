## Context

The `.agents/skills/` directory contains 16 skills of varying complexity. Structural debt has accumulated:
- Two skills have frontmatter fields outside the spec allowlist (`research-spike`, `openspec-vault-link`).
- One skill is missing a required field (`skill-sessions` missing `compatibility`).
- Subfolder usage (`scripts/`, `references/`, `assets/`) is inconsistent with no documented convention.
- Skill interdependencies are implicit, not documented.
- No automated validation exists that skills conform to their own spec.
- Three gaps in skill coverage: no audit skill, no openspec-status wrapper, no retirement mechanism.

Existing canonical specs: `openspec/specs/skill-folder-conventions/spec.md` defines the base folder structure; `openspec/specs/skill-authoring/spec.md` defines the authoring methodology.

## Goals / Non-Goals

**Goals:**
- Bring all 16 skills into full spec compliance.
- Establish a documented, enforceable convention for when skills use `scripts/`, `references/`, and `assets/`.
- Create a `skills-audit` skill that can self-detect spec violations.
- Create an `openspec-status` skill that wraps the `openspec list` CLI.
- Create a `skill-retirement` skill that documents the deprecation process.
- Document the skill interdependency graph.
- Fix the `evals.json` schema URL.

**Non-Goals:**
- Rewriting any skill body for style — only structural fixes.
- Changing skill behavior — all changes are spec-compliance and documentation.
- Sharing skills across workspaces — Personal-only.
- Creating evals for new skills — that would be a separate task.

## Decisions

### 1. `skills-audit` skill structure

**Decision:** The audit skill uses `references/` for the audit checklist (the criteria) and `scripts/` for the validator script (the enforcement). It does not use `assets/`.

**Rationale:** The audit checklist is a living document that the skill body links to — it belongs in `references/`. The validator script is executable and produces side effects — it belongs in `scripts/`. A catalog of findings is not a catalog in the `assets/` sense, so no `assets/` folder.

**Alternatives considered:**
- Putting the checklist inline in `SKILL.md` — rejected because it would bloat the body beyond the single-file ideal.
- Putting the validator in `assets/` — rejected because `.mjs` files are not static assets.

### 2. Extra-structure policy for `skill-sessions/scripts/tests/`

**Decision:** Keep the `tests/` folder as an undocumented subfolder of `scripts/`, but add an explicit justification section to `SKILL.md` and a clarifying note to `skill-format-spec.md`.

**Rationale:** The `tests/` folder exists and has real test files. Deleting it would lose test coverage. The spec allowlist (`references/`, `scripts/`, `assets/`) does not forbid nested subfolders inside `scripts/`, only forbids non-allowlisted top-level skill subfolders. The clarification in `skill-format-spec.md` makes this explicit so future authors don't add arbitrary subfolders.

**Alternative:** Move tests to a top-level `tests/` folder — rejected because the spec does not define a `tests/` top-level folder, and the tests are specific to the scripts in `scripts/`, not to the skill as a whole.

### 3. `skills-audit` validation scope

**Decision:** The validator script checks exactly five things: frontmatter allowlist, subfolder names, description trigger quality, body section completeness, and stale/no-referenced skills.

**Rationale:** These five checks cover the spec violations found in the audit. More checks (e.g., script correctness, asset naming) require deep knowledge of each skill's internals and belong to evals, not a structural validator.

### 4. Frontmatter fix strategy for `research-spike`

**Decision:** Remove `tags`, `title`, `status`, `date`, `sources` from the frontmatter. These fields are appropriate for the *output note's* frontmatter (the synthesis note produced by the skill), not the skill definition's own frontmatter.

**Rationale:** The skill's frontmatter is read by OpenCode's loader. `title`, `status`, `date`, `sources` are meaningless to OpenCode. `tags` could be misinterpreted as OpenCode invocation tags. The output note's frontmatter template is already defined in the body (Phase 4 output); the skill definition frontmatter should only contain spec-allowlisted fields.

### 5. `openspec-status` vs bare bash

**Decision:** Create a dedicated `openspec-status` skill rather than teaching `openspec-explore` to use a skill invocation.

**Rationale:** `openspec-explore` is stance-based, not workflow-based. Adding a skill call inside it would mix paradigms. A separate `openspec-status` skill is composable: `openspec-explore` can reference it, other skills can reference it, and the user can invoke it directly.

## Risks / Trade-offs

[Risk] Removing `tags` from `openspec-vault-link` frontmatter → Mitigation: `tags` is not read by OpenCode (it only reads `name`, `description`, `license`, `compatibility`, `metadata`). No runtime behavior changes. The vault wiring behavior is unchanged; it was not controlled by the frontmatter `tags` field.

[Risk] `skills-audit` validator script may need updating as the spec evolves → Mitigation: The validator checks only the current spec. When the spec changes, the validator is updated in the same change.

[Risk] New skills (`skills-audit`, `openspec-status`, `skill-retirement`) may themselves accumulate violations → Mitigation: The `skills-audit` skill includes a self-audit step. Run it after authoring any new skill.

## Migration Plan

All changes are additive or corrective. No rollback needed — frontmatter corrections are non-breaking, new skills are additive, documentation updates supersede the stale README.

**Order of operations:**
1. Fix frontmatter violations in `research-spike` and `openspec-vault-link`.
2. Add `compatibility` to `skill-sessions`.
3. Fix `evals.json` schema URL.
4. Update `skill-format-spec.md` with new conventions (subfolder, interdependency, extra-structure).
5. Update `skill-authoring` body with references to new convention sections.
6. Update `openspec/specs/skill-folder-conventions/spec.md` for new conventions.
7. Create `skills-audit` skill (SKILL.md + references/ + scripts/).
8. Create `openspec-status` skill.
9. Create `skill-retirement` skill.
10. Update `README.md` with the full skills inventory and interdependency map.
11. Run `skills-audit` validator to confirm all skills pass.

## Open Questions

1. Should `skills-audit` be run automatically on every `create-task` commit? The current design makes it manual. Automated would require integrating it into the commit skill or the pre-PR gate.
2. Should `openspec-status` also wrap `openspec list --json` with a `--change <name>` flag for quick status checks, or should it only do the multi-change selection flow?
3. The `skill-retirement` skill — should it physically delete the skill folder, or just mark it as deprecated in the README?
