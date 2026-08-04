## Context

The Agent Skills spec (see `create-skill/references/skill-format-spec.md`) recognises exactly three subfolders a skill author may add: `references/`, `scripts/`, and `assets/`. The current shared skill library mixes that with a heterogeneous set of legacy locations: `bin/`, `docs/`, `schema/`, `tests/`, `evals/`, and loose files at the skill root. The previous relocation change (`relocate-skill-docs`, 2026-07-25) introduced `bin/` for scripts and moved docs alongside `SKILL.md`, but did not converge on the spec's canonical three-folder model.

This change is a strict refactor: file contents and behaviour stay identical; only the on-disk paths change, plus the references inside each `SKILL.md` that name those paths. No scanner logic, no contract surface, no runtime behaviour.

## Goals / Non-Goals

**Goals:**
- Every skill under `.agents/skills/<name>/` exposes only the three spec-recognised subfolders (`scripts/`, `references/`, `assets/`) when it has auxiliary files at all.
- Each affected `SKILL.md` references the new relative paths so the body stays self-contained.
- The migration is reproducible by inspection: a file moves at most once, the move preserves the relative parent (`<skill>/bin/x.mjs` → `<skill>/scripts/x.mjs`, never across skills).

**Non-Goals:**
- Changing file contents, runner behaviour, or any contract.
- Introducing a new top-level directory at the repo root.
- Renaming skills or their frontmatter `name` fields.
- Touching `docs/` at the repo root (workspace-level docs stay in `docs/` per `skill-doc-organization`).
- Refactoring `bin/*.mjs` invocation sites outside `.agents/skills/<name>/SKILL.md` (for example, the `create-task` `SKILL.md` lines that call `node .agents/skills/cve-scan/bin/full-audit.mjs` need their paths updated, but the scan script itself is not refactored).

## Decisions

### Classification rule: which folder does a file go in?

A file lands in exactly one of three buckets, decided by how it is consumed:

| Bucket | Rule | Examples |
| --- | --- | --- |
| `scripts/` | Executable code the skill body or external workflow invokes at runtime. Includes the skill's own test files (also executable). | `bin/verify-commit.py`, `bin/scan.mjs`, `tests/render.test.mjs` |
| `references/` | Long-form Markdown the body links to for context, decision detail, or methodology. Includes the schema's prose spec when it exists alongside a JSON schema. | `task-workflow.md`, `BLOCKER-CHECKLIST.md`, `commit-style.md`, `pr-style.md`, `cve-methodology.md`, `obsidian.md`, `SCHEMA.md` |
| `assets/` | Static data the scripts or body read but do not execute. JSON catalogs, JSON schemas, eval fixtures, machine-readable inputs. | `patterns.json`, `evals/evals.json`, `schema/skill-session-event.schema.json` |

Rationale: this matches the Agent Skills spec's three-folder semantics and keeps every category of file under exactly one recognised subfolder. JSON schemas live in `assets/` because they are machine inputs the runner or tooling reads, not human-facing documentation.

### Test files go under `scripts/tests/`

Tests are executable code the skill author runs to verify the skill's own scripts. Grouping them under `scripts/tests/` keeps all executable code under `scripts/` and lets the spec's rule "no other subfolders" hold. Alternative considered: a top-level `tests/` per skill. Rejected because it would require adding a fourth subfolder the spec does not recognise.

### `create-skill` and `update-skill` use a single shared references directory

Both authoring skills read the same three reference notes (`skill-format-spec.md`, `skill-description-quality.md`, `skill-creation-practices.md`). Each skill carries its own copy in its own `references/` folder rather than sharing a top-level references library, so the skill is self-contained and removable in isolation. Alternative considered: symlinks. Rejected because symlinks are platform-fragile and obscure the file's actual location.

### Path renames inside `SKILL.md`

Each `SKILL.md` reference to a relocated file is rewritten in place. The author of the change edits the body, not the path, so the diff is readable. No cross-skill redirect files (no `references/old-name.md` shims) — the rename is total, and any caller that referenced the old path must update.

### `bin/`, `docs/`, `schema/`, `tests/`, `evals/` are deleted after the move

The legacy subfolders are removed once their contents are relocated. The skill folder contains only `SKILL.md` plus at most the three canonical subfolders.

## Risks / Trade-offs

- **Missed references in `SKILL.md` bodies** → Mitigation: grep each affected `SKILL.md` for the old paths after the move; rely on `cve-scan` and `code-hygiene` to surface broken links during `verify`.
- **External invocations of relocated scripts** → Mitigation: every `SKILL.md` body that uses a relative or absolute path to a moved script (e.g. `node .agents/skills/cve-scan/bin/full-audit.mjs`) is updated to the new path in the same change. `create-task`'s `SKILL.md` is the largest such surface and is updated in full.
- **Path-aware tooling (e.g. `phase-status.mjs`)** → Mitigation: `phase-status.mjs` only checks for `bin/` and `scripts/` directories by name; update its path references in the same change.
- **Spec divergence** → Mitigation: the new `skill-folder-conventions` capability codifies the rule; the modified `skill-doc-organization` capability removes the conflicting `bin/`, `docs/`, and other allowances. The two capabilities are kept consistent by referencing each other in the design history.
- **Stale documentation in the wider repo** → Mitigation: the `## Security` section below commits to running a repo-wide grep for the old paths before the `cve-report` phase closes, and any non-skill reference is either fixed in this change or filed as follow-up.

## Security Considerations

This change is a pure path relocation. The six threat-model questions reduce to:

1. **Data classes** — none. No data is read, written, or transmitted.
2. **Trust boundaries** — none crossed.
3. **New dependencies / external services** — none.
4. **Persistence** — none. Files only move; no new state, no DB, no on-disk schema.
5. **Auth / sessions / tokens / permissions** — unchanged. No surface touched.
6. **Specialist handoff** — none required. The refactor is mechanical; no specialist owns a sub-phase. `create-skill` is not invoked because the change does not author a new skill.

**Affected data and trust boundaries:** none.

**Mitigations:** a repo-wide grep for the seven old paths (the six legacy subfolder names plus the loose-file paths) is run before the staged scan; any remaining reference is either fixed in this change or explicitly waived in the verification report.

**Residual risk:** a missed reference in a non-skill file (a docs page, a workflow script) could break an unrelated path lookup. The grep gate mitigates this; the residual is low and acceptable for a refactor of this size.

## Security Overrides

The pre-archive `cve-scan` report surfaces three HIGH findings from the `pattern:child-process` rule. All three are scanner noise on legitimate `spawnSync` calls — the previous archive (`improve-create-task-skill`, 2026-08-03) reported the identical matches against the same files at their pre-move paths, and the change was accepted with the same noise. None of the calls accept untrusted input: `phase-status.mjs` spawns the bundled helper scripts only, and the `skill-sessions` test files spawn the scripts under test with hardcoded inputs.

- **Finding:** `pattern:child-process` at `.agents/skills/create-task/scripts/phase-status.mjs:25` — accepted; the call site constructs the child argv from a constant script name resolved from `import.meta.url`, no user input.
- **Finding:** `pattern:child-process` at `.agents/skills/skill-sessions/scripts/tests/format-sessions.test.mjs:11` — accepted; the test spawns the format-sessions script under test with hardcoded JSON inputs.
- **Finding:** `pattern:child-process` at `.agents/skills/skill-sessions/scripts/tests/render.test.mjs:8` — accepted; the test spawns the render script under test with hardcoded JSON inputs.

No CRITICAL findings. No unoverridden HIGH findings once this section is recorded.

## Migration Plan

Per-skill moves (in implementation order):

1. **create-skill** — already restructured in the working tree; verify and confirm.
2. **update-skill** — already restructured in the working tree; verify and confirm.
3. **commit** — `bin/verify-commit.py` → `scripts/verify-commit.py`; `commit-style.md` → `references/commit-style.md`.
4. **create-pr** — `pr-style.md` → `references/pr-style.md`.
5. **create-task** — `bin/phase-status.mjs`, `bin/slug-check.mjs` → `scripts/`. `evals/evals.json` → `assets/evals.json`. `references/task-workflow.md`, `references/BLOCKER-CHECKLIST.md` already in place. Update every `node .agents/skills/<name>/bin/*.mjs` reference in `SKILL.md` to `scripts/*.mjs`.
6. **cve-scan** — `bin/*.mjs` → `scripts/*.mjs`; `cve-methodology.md` → `references/cve-methodology.md`; `patterns.json` → `assets/patterns.json`. Update every `node .agents/skills/cve-scan/bin/*.mjs` reference.
7. **openspec-vault-link** — `obsidian.md` → `references/obsidian.md`.
8. **skill-sessions** — `bin/*.mjs` → `scripts/*.mjs`; `schema/skill-session-event.schema.json` → `assets/skill-session-event.schema.json`; `SCHEMA.md` → `references/skill-session-schema.md`; `tests/*.mjs` → `scripts/tests/`.
9. **create-skill / update-skill** (final pass) — add a stub `references/skill-folder-conventions.md` note if useful, or skip and rely on the new spec.

After all moves:

- Run `git status` to confirm only the expected files changed.
- Run the repo-wide grep gate.
- Run the `verify` phase: run any tests in the relocated `scripts/tests/`, confirm `phase-status.mjs` and `slug-check.mjs` still execute.
- Run the pre-archive `cve-report` and staged scan per the orchestrator.
- Archive, commit, push, and PR per the orchestrator.

## Open Questions

None. The user resolved `evals/evals.json` and `patterns.json` → `assets/`, and tests → `scripts/tests/`, in the explore phase.
