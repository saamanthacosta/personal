---
name: commit
description: Create commits with a 30-char max title and a body whose paragraphs are kept as single lines (no soft-wrapping inside a phrase). Load when the user asks to commit, write a commit, or produce a commit message.
license: MIT
compatibility: Local machine skill — requires git.
metadata:
  author: personal
  version: "1.0"
---

# Commit Style

You are an expert git workflow assistant. Before staging or committing, detect the current project context and the current branch, then produce commits that follow the rules below.

## 1. Detect context

- Run `pwd` (or trust the working directory) to know which project you are in.
- Run `git branch --show-current` to grab the branch name and check for a ticket prefix (e.g. `DOS-1234`, `JIRA-42`).
- Run `git status` to see modified, deleted, untracked files. Run `git diff` and `git diff --cached` to read the actual changes.

## 2. Group changes

- Cluster file changes into logical commits (e.g. "rename feature X", "update schema for Y").
- A single commit per logical change. Multiple commits when the changes are unrelated.

## 3. Title rules

- **Maximum 30 characters** total (including any ticket prefix).
- Present tense, imperative mood: `Add`, `Fix`, `Update`, `Remove`, `Refactor`.
- No trailing period.
- If the branch name starts with a clear ticket prefix (e.g. `DOS-1234-...`), include it at the start of the title and count it against the 30-char limit:

```
DOS-1234 Add Field tests
DOS-1234 Fix pagination off-by-one
```

- If no prefix can be derived, ask the user for one or commit without a prefix.

## 4. Body rules

- Skip the body when the title is enough.
- When more context is needed, write the body as **paragraphs**.
- **A paragraph is a single continuous line.** Never break a phrase across lines for visual width. Do not soft-wrap.
- Use a blank line to start a new paragraph.
- Prefer one paragraph per distinct idea. Multiple paragraphs are fine when the change has several contexts.

```text
Add Field component tests

Cover the new validation rules and the disabled state.
Mock the network layer so the tests stay fast.
```

In the example above, the body is two paragraphs. Each paragraph is a single line. The blank line between them is the only separator.

## 5. Final format

```text
<title up to 30 chars>

<paragraph 1, single line>

<paragraph 2, single line>
```

- Blank line between title and body.
- Blank line between body paragraphs.
- No blank line at the end.

## 6. Execution

- Stage only the files that belong to the current commit: `git add <files>`.
- Commit with `git commit -m "<title>"` plus `-m "<paragraph>"` for each body paragraph, or use a heredoc when preferred.
- Do not push unless explicitly asked.

## 7. Anti-patterns

These are not acceptable.

- Title longer than 30 characters:

```text
Add unit tests for all components in the Field directory with proper mocking
```

- Body with a phrase broken across lines (this is the same paragraph, but the lines were split for width):

```text
Description of the commit in here
We break the line and continue to a new paragraph, but then
we break the line again just to keep that previous phrase, and it
shouldn't because it's the same phrase yet.
We only break lines to create a new paragraph.
```

The body above should be rewritten as one paragraph per line:

```text
Description of the commit in here
We break the line and continue to a new paragraph, but then we break the line again just to keep that previous phrase, and it shouldn't because it's the same phrase yet.
We only break lines to create a new paragraph.
```

## 8. Summary

Report back to the user with:
- Each commit created (hash + title).
- The grouping logic when several commits were produced.

## 9. Grouping large changes into multiple commits

When a change touches more than ~15 files or spans multiple subjects, **do not produce a single monolithic commit**. Split the diff into 2–N commits, each one a logical unit that leaves the working tree in a coherent state on its own. A "coherent state" means every commit either (a) introduces the new structure with all internal references updated, or (b) leaves the old structure intact and unchanged. Never land a half-migrated state where a moved file is referenced by a path that only exists in a later commit.

### When to split

Split when any of the following is true:

- The change touches more than one skill, package, or capability.
- The diff is large enough that `git log -1 --stat` would print more than ~20 lines.
- The change covers both a new capability (OpenSpec) and its implementation (file moves, code edits).
- The reviewer would benefit from reading the capability contract separately from the code that satisfies it.

### Grouping heuristics

Prefer this ordering (each step builds on the prior):

1. **OpenSpec artifacts** — `proposal.md`, `design.md`, `tasks.md`, `specs/<cap>/spec.md` delta files, the change's `.openspec.yaml`. Land these first so the reviewer has the contract in hand before the code lands.
2. **Canonical spec syncs** — the updated canonical specs at `openspec/specs/<cap>/spec.md`. Land in the same commit as the proposal when they are short; split out when the canonical edits are non-trivial.
3. **Per-skill migrations** — one commit per skill when the change is a folder or path convention refactor across many skills. Each commit moves the skill's files and updates its `SKILL.md` in the same commit.
4. **Cross-skill callers and shared indexes** — `docs/README.md`, `openspec/INDEX.md`, root `README.md`, anything that points at multiple skills at once. Land in the last commit so the references are valid against the new structure.
5. **Reports and side artefacts** — `docs/cve-reports/`, `docs/skill-sessions/`, anything generated by the run. Land in the final commit.

For a non-OpenSpec change (pure code refactor across services, a multi-package bump), apply the same per-unit grouping: one commit per logical group (per service, per package, per layer).

### Commit title conventions for grouped commits

- Same ≤ 30-character rule, imperative mood, no trailing period.
- For per-skill migrations, prefix the subject so the reviewer can scan the log: `commit: move to scripts/`, `cve-scan: move to scripts/`, `skill-sessions: move to scripts/`. When the convention is already encoded in the branch name (e.g. `chore/skill-folder-conventions`), drop the prefix and use a flat subject: `Move commit skill folders`, `Move cve-scan skill folders`.
- For OpenSpec changes, the proposal/specs commit uses the capability name: `Add skill-folder-conventions spec` or `Standardize skill folders` when the branch already names the change.
- Never use `WIP`, `partial`, or `step 1/N` in titles — each commit must stand on its own.

### Preview and approval

- **Always** show the grouping plan and the per-commit preview list before staging the first file. Wait for approval.
- Between commits, run the staged CVE scan (`node .agents/skills/cve-scan/scripts/scan-staged.mjs` or its equivalent) and the project's verification commands when they apply. A broken intermediate state fails the next commit's staged scan; catch it before it lands.
- If a per-commit staged scan surfaces a CRITICAL or unoverridden HIGH finding, stop and surface the finding before staging the next batch.

### Anti-patterns

- One commit per file (too granular; the history becomes unreadable).
- A single commit per skill that mixes the path moves with unrelated code changes (muddles `git blame` and review).
- A commit that renames a file and updates its callers in different commits (the intermediate commit's references are broken).
- A commit titled `WIP` or `part 1` — every commit must be reviewable on its own.

## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `cve-scan` | invokes | by path |

None — this skill is self-contained.
