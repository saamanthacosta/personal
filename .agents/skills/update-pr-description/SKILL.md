---
name: update-pr-description
description: Regenerate an open Pull Request's body (title left untouched) from the branch's current commit range against the default branch, using the same template that `create-pr` produces, and apply it via `gh pr edit --body` only after a mandatory preview and explicit user approval. Use when the user asks to refresh, update, regenerate, sync, or fix a PR description whose commits, file tree, or diff stats no longer match the body, and explicitly NOT when the user asks to close and reopen the PR, modify the PR title, rewrite commit history, or run a code review.
license: MIT
compatibility: Local machine skill — requires git, the gh CLI authenticated against the target repo, and an OPEN PR on the current branch.
metadata:
  author: personal
  version: "1.0"
---

# Update Pull Request Description

You are an expert git workflow assistant. The goal is to keep an open Pull Request's body consistent with the branch's current state — without closing and reopening the PR — by regenerating the body from `merge-base..HEAD` and applying it via `gh pr edit --body` only after the user has approved a side-by-side preview.

## 1. Detect context

Ground yourself before touching anything:

- Confirm you are inside a git repo: `git rev-parse --is-inside-work-tree`.
- Read the current branch: `git branch --show-current`.
- Identify the default branch: `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`.
- Read the PR for the current branch: `gh pr view --json number,url,state,title,body --jq '{n:.number,u:.url,s:.state,t:.title,b:.body}'`. If no PR exists, stop and tell the user to open one first with `/create-pr`.
- Read the current GitHub user (informational only): `gh api user --jq .login`.
- Read the repo slug: `gh repo view --json nameWithOwner --jq .nameWithOwner`.

Stop and report if the PR's `state` is anything other than `OPEN`. The skill only operates on open PRs.

## 2. Inspect the working tree

The skill does not modify the working tree, but it does depend on a clean `git status` to make sure the regenerated `Summary` and `File tree` accurately reflect what reviewers will see when they look at the PR:

- `git status --porcelain` — must be empty, or contain only untracked files.
- If staged or unstaged modifications exist on tracked files, stop and ask the user to commit, stash, or discard the changes before continuing.
- Untracked files produce a warning, not a block.

## 3. Gather the data for the regenerated body

Compute every section from the branch's current state. The merge base anchors the range:

```bash
BASE=$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)
MERGE_BASE=$(git merge-base "$BASE" HEAD)
```

### Commits

- List commits in chronological order (oldest first):
  `git log --reverse --pretty=format:"- %s" "$MERGE_BASE..HEAD"`.
- Capture full subjects with bodies for the description:
  `git log --reverse --pretty=format:"%h%n%s%n%b%n---" "$MERGE_BASE..HEAD"`.
- If the range is empty (the branch has no commits ahead of the base), stop and report — there is nothing meaningful to regenerate.

### File tree

- `git diff --name-status "$MERGE_BASE"...HEAD` — list of changed files with status markers (`A`, `M`, `D`, `R`, `C`).
- Render a compact tree grouped by top-level directory, identical in shape to the `create-pr` output.
- No raw diffs in the description; the PR diff view is the source of truth.

### Diff stats

- `git diff --shortstat "$MERGE_BASE"...HEAD` — line counts for the summary line.

### Existing `## Notes`

- If the current PR body contains a `## Notes` section, capture it verbatim and place it below the four mechanical sections in the regenerated body. If it is absent, omit the section.

## 4. Write the title (for the preview only)

The PR title is **not** modified by this skill. The title is recomputed only for the preview report so the user can see whether the title still matches the branch; the skill exits without touching the title unless the user explicitly passes `--title`.

- Maximum 30 characters total (per `docs/pr-style.md`).
- Present tense, imperative mood.
- No trailing period.

The recomputed title is shown in the preview alongside the existing title with a `[matches]` / `[differs]` marker. Do not call `gh pr edit --title` unless `--title` was passed.

## 5. Write the description

Use the structure below. Each section is a paragraph block; **paragraphs are single lines** — never soft-wrap a phrase (see the `commit` skill for the rule). Use blank lines to separate paragraphs.

```text
## Summary

<one paragraph: what this PR currently does and why, in present tense, written for a reviewer who has no context. Derive from the commit subjects and the shortstat.>

## Changes

<one paragraph per logical group of changes, mirroring the commit grouping. Each paragraph stays on a single line.>

## File tree

<the compact tree from step 3, fenced as a code block>

## Commits

<bullet list of commits from step 3, oldest first. Use the full subject line, no truncation.>

## Notes

<optional: preserved verbatim from the current PR body if present. Drop entirely if absent.>
```

Rules:

- No section may be empty. Drop `Notes` when there is nothing to preserve.
- Do not include diffs, code blocks of the changes themselves, or CI output. The PR diff view covers that.
- Keep the summary to one paragraph.

## 6. Mandatory preview and approval

Always show the user what will change before mutating the PR. Write both bodies to temp files and print them with a unified diff:

```bash
PR_NUMBER=$(gh pr view --json number --jq .number)
echo "$CURRENT_BODY"  > /tmp/pr-update-current-"$PR_NUMBER".md
echo "$PROPOSED_BODY" > /tmp/pr-update-body-"$PR_NUMBER".md

echo "## Current PR body"
cat /tmp/pr-update-current-"$PR_NUMBER".md
echo
echo "## Proposed PR body"
cat /tmp/pr-update-body-"$PR_NUMBER".md
echo
echo "## Unified diff (- current, + proposed)"
diff -u /tmp/pr-update-current-"$PR_NUMBER".md /tmp/pr-update-body-"$PR_NUMBER".md || true
```

Then ask the user to confirm with a free-text prompt. There is **no** `--yes` flag. Refusals and empty answers both abort without mutation.

If approved, apply the change with `--body-file` to avoid shell escaping:

```bash
gh pr edit --body-file /tmp/pr-update-body-"$PR_NUMBER".md
```

After `gh pr edit` returns, delete the temp files:

```bash
rm -f /tmp/pr-update-current-"$PR_NUMBER".md /tmp/pr-update-body-"$PR_NUMBER".md
```

If the user passed `--title`, also call `gh pr edit --title "<title>"` using the same approval gate. Title changes share the preview; do not apply them silently.

## 7. Optional `--title` flag

When the user passes `--title <text>`:

1. Validate the title against the 30-character rule from `docs/pr-style.md`. Reject longer titles with a non-zero exit and a clear message.
2. Add the proposed title to the preview report alongside the existing title.
3. Apply with `gh pr edit --title "<text>"` only after the same approval as the body.

When `--title` is **not** passed, the title is left untouched even if it would differ from a freshly-computed one. This is intentional: title churn mid-review disrupts reviewers and notification subscribers.

## 8. Confirm

After `gh pr edit` returns, print:

```text
## PR Description Updated
- PR:        <url>
- Branch:    <branch>
- Commits:   <count> in <merge-base>..HEAD
- Files:     <changed file count> (<added>/<modified>/<deleted>)
- Title:     <matches | differs | updated>
- Temp:      /tmp/pr-update-{current,body}-<pr>.md removed
- Next:      review the PR on GitHub to confirm the body matches the branch
```

## 9. Re-runs and resume

The skill is idempotent. Re-running it on a PR whose body already matches the branch state produces an empty diff and exits after the preview, applying no mutation. Re-runs are safe and encouraged whenever the branch gains commits, loses commits (rebase/reset), or rebases onto a newer base.

## 10. Anti-patterns

- Closing and reopening the PR to "refresh" the description. That destroys reviewer context, breaks notification threads, and re-runs every required CI check. This skill exists to avoid that.
- Modifying the PR title without an explicit `--title` flag.
- Calling `gh pr edit --body` without a preview. There is no `--yes`; the preview is mandatory.
- Interpolation of PR body content into shell commands. Always use `--body-file`.
- Editing the working tree, force-pushing, running `git rebase`, or staging any path. The skill is read-only on the worktree and write-only on the PR body.
- Operating on a PR whose `state` is `MERGED` or `CLOSED`. Stop and report.
- Inventing commits, file paths, or diff stats that are not present in `git log` / `git diff` output for the merge-base range. The regenerated body must reflect the branch's actual state.
- Reimplementing the PR description template. Reuse the exact structure from `create-pr` and `docs/pr-style.md`.
- Adding scripts under `.agents/skills/update-pr-description/bin/`. The skill is a single `SKILL.md`; no auxiliary scripts.