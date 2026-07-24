# PR Style

Rule summary for the `create-pr` skill. The skill enforces this when opening a Pull Request.

## Title

- Maximum 30 characters total (including any branch prefix).
- Present tense, imperative mood: `Add`, `Fix`, `Update`, `Remove`, `Refactor`.
- No trailing period.
- If the branch carries a ticket prefix (e.g. `DOS-1234`), keep it inside the 30-char budget.

## Description

Use the template below. Each block is a paragraph; **paragraphs are single lines** — never soft-wrap a phrase (see `commit-style.md`). Use a blank line to start a new paragraph.

```text
## Summary

<one paragraph: what this PR does and why, in present tense, written for a reviewer with no context>

## Changes

<one paragraph per logical group of changes, mirroring the commit grouping; each paragraph stays on a single line>

## File tree

<compact tree of changed files, grouped by top-level directory, with status markers: A added, M modified, D deleted, R renamed, C copied>

## Commits

<bullet list of commits included in the PR, with full subject lines>

## Notes

<optional: risks, follow-ups, screenshots, links>
```

- Drop `Notes` when there is nothing to say.
- No raw diffs here — the PR diff view is the source of truth.

## Assignee

- Always assign the PR to the current GitHub user (auto-detected via `gh api user`).
- Never hardcode another handle.

## Anti-patterns

- Title longer than 30 chars.
- Description that soft-wraps a paragraph.
- Reusing a single commit body as the whole description.
- Opening a PR with uncommitted local changes still in the working tree.
- Forgetting the assignee.
