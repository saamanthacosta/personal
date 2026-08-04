---
name: pr-description
description: Open a new Pull Request (title, structured body, file tree, commits, assignee) or regenerate an existing one with mandatory preview and approval — both modes follow the same `references/pr-style.md` template. Load when the user asks to open, create, send, refresh, update, regenerate, sync, or fix a PR description. Do NOT use for closing or reopening PRs, modifying the PR title without explicit `--title`, rewriting commit history, or running a code review.
license: MIT
compatibility: Local machine skill — requires git and the gh CLI authenticated against the target repo. Regenerate mode also requires an OPEN PR on the current branch.
metadata:
  author: personal
  version: "2.0"
---

# PR Description

You are an expert git workflow assistant for managing a Pull Request's title and structured description. The skill handles two modes — **open** (create a new PR) and **regenerate** (refresh the body of an existing OPEN PR) — dispatched automatically from the user's prompt and the GitHub PR state. Both modes follow the same body template defined in `references/pr-style.md`.

## 1. Detect mode

Before reading further, decide which mode applies:

| User's prompt | PR state | Mode |
| --- | --- | --- |
| "open / create / send a PR" | no PR exists for the branch (`gh pr view` returns nothing) | **open** |
| "refresh / update / regenerate / sync / fix a PR description" | an OPEN PR exists for the branch | **regenerate** |
| ambiguous (no mode, no clear signal) | — | ask one focused question before reading |

If the prompt names the mode, use that. If the prompt is ambiguous, call `gh pr view` to determine the state and pick the matching mode. Never guess silently when both axes (mode and state) are unclear.

## 2. Load the right references

Each mode loads its own `references/` note. The body does not duplicate the per-mode workflow — it points the model at the right file.

- **open mode** → load `references/pr-open.md` (workflow + `gh pr create`) plus `references/pr-style.md` (template).
- **regenerate mode** → load `references/pr-regenerate.md` (workflow + `gh pr edit --body-file`) plus `references/pr-style.md` (template).

Do not load a mode's reference when that mode is not active. The body stays small; the model picks up the workflow details on demand.

## 3. Shared context

Both modes need the same initial context detection. Before reading the mode-specific reference, gather:

- The current branch: `git branch --show-current`.
- The default branch: `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`.
- The current GitHub user (assignee): `gh api user --jq .login`.
- The repo slug: `gh repo view --json nameWithOwner --jq .nameWithOwner`.
- The PR state for the branch (regenerate mode only): `gh pr view --json number,url,state,title,body`.

The mode-specific references assume these are already in context. Reuse this section's commands rather than duplicating them in the per-mode notes.

## 4. Common body rules (apply to both modes)

- Title ≤ 30 characters, present tense, imperative mood, no trailing period. See `references/pr-style.md` §"Title" for the full rule.
- Body uses the Summary / Why / Changes / File tree / Commits / Notes template. See `references/pr-style.md` for the template and `references/pr-style.md` §"Assignee" for the assignee rule.
- **Paragraphs are single lines** — never soft-wrap a phrase (see the `commit` skill for the rule). Use blank lines to separate paragraphs.
- No raw diffs in the body. The PR diff view is the source of truth.

## 5. Guardrails

- Never open a PR on a dirty working tree, an unpushed branch, or a branch that already has a PR. `references/pr-open.md` §2 lists the readiness checks.
- Never call `gh pr edit --body` without showing the user the side-by-side diff and getting explicit approval. `references/pr-regenerate.md` §6 documents the mandatory preview.
- Never modify the PR title in regenerate mode unless the user passed `--title` explicitly. Title churn disrupts reviewers.
- Never close and reopen a PR to "refresh" the description. Use the regenerate mode instead.
- Never edit the working tree, force-push, or rewrite commit history from this skill. The skill is read-only on the worktree.
- Always assign the PR to the current GitHub user; never hardcode another handle.
- Never add scripts under `.agents/skills/pr-description/scripts/`. The skill is a `SKILL.md` with mode-specific `references/` notes; no auxiliary code.

## 6. Anti-patterns (both modes)

- Title longer than 30 characters.
- Description that soft-wraps a paragraph across lines.
- Reusing the body of a single commit as the whole description — the description is a rollup.
- Interpolating the body into a shell command. Always use `--body-file`.
- Inventing commits, file paths, or diff stats. Every claim in the body must come from `git log` / `git diff` output for the merge-base range.
