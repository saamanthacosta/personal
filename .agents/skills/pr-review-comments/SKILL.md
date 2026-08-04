---
name: pr-review-comments
description: Review a Pull Request commit-by-commit and post inline PR review comments per commit, with one review per commit anchored to that commit's SHA. Use after a PR is opened in the personal workspace when the user asks for a per-commit review, a commit-by-commit review, or wants review comments grouped by commit rather than per file.
license: MIT
compatibility: Local machine skill — requires git, gh CLI authenticated against the target repo, and the PR to already exist on origin.
metadata:
  author: personal
  version: "1.0"
---

# Per-Commit PR Review

You are an expert code reviewer. The goal is to review a Pull Request one commit at a time and post the findings as inline review comments, with **one review per commit** anchored to that commit's SHA. This keeps the review traceable: each review on the PR maps 1-to-1 to a commit, and each comment points at the exact line in that commit's diff.

## 1. Detect context

Ground yourself in the project before doing anything:

- Confirm you are inside a git repo: `git rev-parse --is-inside-work-tree`.
- Read the current branch: `git branch --show-current`.
- Identify the default branch: `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`.
- Identify the current PR for the branch: `gh pr view --json number,url,headRefOid,baseRefOid --jq '{n:.number,u:.url,h:.headRefOid,b:.baseRefOid}'`. If no PR exists, stop and tell the user to open one first.
- Read the repo slug: `gh repo view --json nameWithOwner --jq .nameWithOwner`.

Stop and report if the PR is missing, merged, or closed.

## 2. List the commits in the PR

Pull every commit between the merge base and the PR head, oldest first:

```bash
gh repo view --json defaultBranchRef --jq .defaultBranchRef.name   # base, e.g. main
MERGE_BASE=$(git merge-base <base> HEAD)
git log --reverse --pretty=format:'%H%x09%s' "$MERGE_BASE..HEAD"
```

For each commit in this list you will produce exactly one review. Capture, per commit:

- Full SHA (`%H`).
- Short SHA (`%h`) for display.
- Subject line (`%s`).
- The commit's diff against its parent: `git show --no-color --pretty=format: <sha>`.
- The list of files touched and their line counts: `git show --no-color --pretty=format: --stat <sha>`.

## 3. Review criteria per commit

Treat every commit as a standalone change. Even if the overall PR is large, review each commit in isolation:

- **Correctness** — does the change do what the subject claims? Are there off-by-one, race, null-handling, or boundary bugs?
- **Security** — input handling, secrets, authn/authz, injection, unsafe deserialization, path traversal. Apply the same threat-model lenses the `cve-scan` skill uses.
- **Style** — repo conventions; if there is no clear convention, flag it once, do not nitpick every line.
- **Design** — naming, coupling, public API surface, error handling. Surface tradeoffs; do not bikeshed.
- **Tests** — was the change tested? Does the test actually exercise the new behavior, or is it theatre?
- **Cross-commit integrity** — note (as a top-of-review summary, not a per-line comment) if the commit only makes sense in the context of later commits. Do not flag in-file code for "fixes that come later".

Skip findings that are not actionable in this commit. Group them under a single review, not across commits.

## 4. Map findings to inline comments

For each finding, resolve:

- **File path** as it appears in `git show <sha>` (relative to repo root, no leading `./`).
- **Line number** in the **right-hand (new) side** of the diff when possible. Use `git show <sha> -- <path>` to confirm the line exists in that commit.
- **Severity tag** in the comment body: `// nit:`, `// suggestion:`, `// issue:`, `// security:`. Pick the most severe applicable tag.
- **One-sentence rationale**, then optionally a one-line fix suggestion.

If a finding cannot be anchored to a line in the commit (architectural concern, missing test, naming), put it in the review body, not as an inline comment.

## 5. Post one review per commit

Use `gh api` to create a review anchored to the commit SHA. Inline comments are passed as a JSON array — write to a temp file, do not inline in the shell.

For each commit `<sha>`:

1. Build a JSON payload at `/tmp/pr-review-<short-sha>.json`:

   ```json
   {
     "commit_id": "<sha>",
     "body": "Review of <short-sha> — <subject>\n\n<summary paragraph, one line per idea>",
     "event": "COMMENT",
     "comments": [
       {
         "path": "src/foo.ts",
         "line": 42,
         "side": "RIGHT",
         "body": "// issue: <one sentence>\n<optional one-line fix>"
       }
     ]
   }
   ```

   Rules for the JSON:
   - `comments` is an array (use `[]` when there are no inline findings; the body still posts).
   - `line` is the 1-based line number on the new side; `side: "RIGHT"` for additions/right context, `"LEFT"` for deletions only.
   - If a finding is on a hunk header, anchor it to the first content line of that hunk.
   - Skip findings whose file or line does not exist in this commit — promote them to the review body instead.

2. Post the review:

   ```bash
   gh api \
     --method POST \
     -H "Accept: application/vnd.github+json" \
     /repos/<owner>/<repo>/pulls/<pr-number>/reviews \
     --input /tmp/pr-review-<short-sha>.json
   ```

3. On non-2xx, stop, print the error, and report which commit failed. Do not retry blindly — GitHub rejects duplicate reviews with 422.

4. Delete the temp file after a successful post.

Do not post the review as a single PR-level comment. Do not split a commit across multiple reviews. Do not comment on lines from later commits.

## 6. Skip rules

Skip a commit entirely (no review) when:

- The commit is a merge commit from the base branch (`git log --merges --pretty=format:%H $MERGE_BASE..HEAD | grep -q <sha>`).
- The commit's diff against its parent is empty (e.g. an empty `fixup!` already in the branch).
- The commit subject matches a documented ignore pattern (e.g. `chore: bump deps`, `docs:`) **and** the user opts into skipping such commits in advance. Otherwise review it.

When you skip, surface it in the final report so the user knows.

## 7. Anti-patterns

- Posting one review for the whole PR — defeats the per-commit structure.
- Anchoring inline comments to lines that do not exist in the commit being reviewed (GitHub returns 422 and the whole review fails).
- Quoting large diff chunks in the review body. The PR diff view covers that.
- Mixing findings from multiple commits in a single review body.
- Using `gh pr review --comment` without `commit_id` — that posts an unanchored review, which breaks the per-commit mapping the fix skill relies on.
- Auto-resolving review threads; the human reviewer owns that.

## 8. Report

After all reviews are posted, print:

```text
## PR Review Complete
- PR:       <url>
- Branch:   <branch>
- Commits:  <reviewed>/<total> (skipped: <list of short SHAs and reasons>)
- Reviews:  <count> posted (one per commit, anchored to <sha>)
- Findings: <inline count> inline + <body-only count> body-only
- Next:     address findings with `/fix-pr-review-comments` for this PR
```

If any commit failed to post, list the commit and the API error verbatim and stop.
## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `fix-pr-review-comments` | mentions | by name (bare) |
| `cve-scan` | mentions | by name (bare) |

None — this skill is self-contained.
