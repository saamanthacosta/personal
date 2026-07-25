## Context

Today, six skill-defining docs (`task-workflow.md`, `pr-style.md`, `commit-style.md`, `cve-methodology.md`, `obsidian.md`, `skills-folder.md`) live in `docs/`, plus one Python script (`scripts/verify-commit.py`) and a stale `scripts/` directory. Each of the docs except `workspace.md` is referenced by exactly one skill. The current layout works but breaks the principle that a skill should be self-contained: a reader following `create-task/SKILL.md` into `docs/task-workflow.md` has to leave the skill folder to find the mechanics, and there is no convention telling future skill authors where a new doc should go.

## Goals / Non-Goals

**Goals:**
- Make every skill self-contained: SKILL.md plus any docs and scripts it depends on live in the same folder.
- Establish the convention `bin/` for skill-specific scripts (mirrors the existing `cve-scan/bin/`).
- Update all cross-references so no path still points at the old `docs/` or `scripts/` location.
- Slim `docs/README.md` to a workspace-level index.

**Non-Goals:**
- Rewriting the content of any doc. Light copy-edits only to update cross-references and to drop the redundant rule recap in `commit-style.md` (the rules are inlined in `commit/SKILL.md`).
- Refactoring the vault-link skill or renaming any artifact (separate change: `improve-vault-link`).
- Touching `docs/workspace.md`, `docs/README.md` content beyond turning it into an index, or any docs that are not skill-specific.
- Modifying `verify-commit.py`; the script moves byte-identical.

## Decisions

- **Move paths chosen for skill ownership.** Each doc moves to the skill that references it most. `skills-folder.md` is special: it describes `.agents/skills/` itself, so it becomes `.agents/skills/README.md` (the entry-point README of the skill library).
- **`bin/` for the script.** `scripts/verify-commit.py` becomes `.agents/skills/commit/bin/verify-commit.py`. The `bin/` name matches `cve-scan/bin/` and the customize-opencode convention that scripts live next to the skill that owns them.
- **Light edits only.** No content rewrites; only the path references and the `commit-style.md` dedup.
- **Delete the empty `scripts/` directory.** After the move there is nothing left.
- **`docs/README.md` becomes a real index.** Replace the current hand-written bullet list with a workspace-level index that points to skill docs, `docs/workspace.md`, and `docs/cve-reports/`.

## Risks / Trade-offs

- [Risk] A cross-reference is missed in a SKILL.md or doc, leaving a broken `docs/...` link. → [Mitigation] After the moves, grep for the old paths (`docs/task-workflow.md`, `docs/pr-style.md`, `docs/commit-style.md`, `docs/cve-methodology.md`, `docs/obsidian.md`, `docs/skills-folder.md`, `scripts/`) across the whole repo. Any hit is a bug.
- [Risk] `commit-style.md` after the dedup is too thin to be worth keeping. → [Mitigation] Keep the file. The `verify-commit.py` pointer and any external linkbacks justify its existence; thinness is acceptable for a pointer doc.
- [Risk] `docs/README.md` becoming too thin (just an index) loses the "Personal Workspace Docs" intro. → [Mitigation] Keep the first paragraph of the current `docs/README.md` (the "This folder stores notes…" intro) and replace the bullet list with the new index.

## Migration Plan

1. `git mv` each file to its new location; if `git mv` is unavailable, use plain `mv` and let git detect the rename.
2. Update SKILL.md cross-references (12 total across 5 skills).
3. Slim `docs/commit-style.md` and update `docs/README.md`.
4. `grep` for old paths; fix any hits.
5. `rmdir scripts/` (should be empty after the move).
6. Run the apply-boundary CVE audit, archive, post-archive CVE audit, commit, push.

Rollback: `git revert` of the commit, or restore the old paths via `git mv`. Both are easy because the change is file moves plus reference edits.

## Open Questions

None. The relocate plan is mechanical and the user-confirmed design decisions are:
- Skills own their docs.
- Skills own their scripts under `bin/`.
- Meta-doc (`skills-folder.md`) becomes `.agents/skills/README.md`.
- Workspace-level index stays in `docs/README.md` and `workspace.md` stays in `docs/`.

## Security Considerations

- **Threat model summary.** File moves plus reference rewrites. No new code paths, no new dependencies, no credentials.
- **Affected data and trust boundaries.** No new boundaries crossed. The Python script moves byte-identical.
- **Mitigations.** Grep verification catches missed cross-references before commit. The script is unchanged at the new path.
- **Residual risk.** Low. No CRITICAL or HIGH findings anticipated; no override required.