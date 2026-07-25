---
name: fix-pr-review-comments
description: Address inline PR review comments produced by the `pr-review-comments` skill by grouping them per commit and producing `git commit --fixup=<sha>` commits, so the original commit history stays aligned and can be autosquashed at merge time. Use after a per-commit review has been posted and the user asks to apply, address, or fix the review comments.
license: MIT
compatibility: Local machine skill — requires git, gh CLI authenticated against the target repo, and a per-commit review on the PR produced by the `pr-review-comments` skill.
metadata:
  author: personal
  version: "1.0"
---

# Fix Per-Commit PR Review Comments

You are an expert code fixer. The goal is to read the per-commit inline review comments produced by the `pr-review-comments` skill, group them by the commit SHA they were anchored to, apply the fixes to the working tree, and produce one `git commit --fixup=<sha>` per original commit so the history stays aligned for a final `git rebase --autosquash` before merge.

## 1. Detect context

Ground yourself before touching the worktree:

- Confirm you are inside a git repo: `git rev-parse --is-inside-work-tree`.
- Read the current branch: `git branch --show-current`.
- Identify the PR for the branch: `gh pr view --json number,url,headRefOid,baseRefOid --jq '{n:.number,u:.url,h:.headRefOid,b:.baseRefOid}'`. If no PR exists, stop.
- Read the default branch and the merge base:

  ```bash
  BASE=$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)
  MERGE_BASE=$(git merge-base "$BASE" HEAD)
  ```

- List the commits under review: `git log --reverse --pretty=format:'%H %h %s' "$MERGE_BASE..HEAD"`.

Stop and report if the working tree has uncommitted changes — the skill will refuse to mix fixup commits with dirty state.

## 2. Fetch and group review comments

Pull every review comment on the PR:

```bash
gh api --paginate /repos/<owner>/<repo>/pulls/<pr-number>/comments \
  --jq '.[] | {id, commit_id, path, line, original_line, side, body, in_reply_to_id, pull_request_review_id}'
```

Then pull the review metadata so each comment is joined to its parent review:

```bash
gh api --paginate /repos/<owner>/<repo>/pulls/<pr-number>/reviews \
  --jq '.[] | {id, commit_id, state, body}'
```

Keep only comments that:

1. Belong to a review whose `commit_id` is in `$MERGE_BASE..HEAD`.
2. Are top-level comments (`in_reply_to_id == null`). Threaded replies are discussion, not a fix request — surface them in the report, do not act on them.
3. Have a non-empty `body`.

Group the survivors by `commit_id`. The result is a map: `<full-sha> → [comment, comment, …]`. Order commits oldest first (the order from step 1), and within a commit, order comments by `path` then `line`.

If a commit has zero actionable comments, skip it.

## 3. Read the comment intent

For each comment, classify it into one bucket based on the leading tag in the body (these are the tags the `pr-review-comments` skill emits):

| Tag                  | Action                                                |
| -------------------- | ----------------------------------------------------- |
| `// security:`       | Fix. Blocking — must address before proceeding.       |
| `// issue:`          | Fix.                                                   |
| `// suggestion:`     | Fix when cheap and clearly correct; otherwise surface as a note in the report. |
| `// nit:`            | Fix only if the diff already touches that line. Leave a body-only note otherwise. |

Anything without a recognized tag is treated as `// issue:`. If the body is ambiguous, ask the user before committing the fixup.

## 4. Apply fixes per commit

For each `<sha>` with comments, in oldest-to-newest order:

1. Inspect the diff: `git show <sha> -- <paths>` for every path touched by the comments.
2. Make the minimum change that addresses every actionable comment in the group. Do not refactor beyond what the comment asked for — extra changes break the fixup mapping.
3. Stage exactly the paths you changed for that commit: `git add <paths>`. Never `git add -A` / `git add .`.
4. Create a fixup commit:

   ```bash
   git commit --fixup=<full-sha>
   ```

   Git will generate a subject of the form `fixup! <original subject>`. The body should stay empty — the fixup mechanism does not use it, and any body content will appear in the autosquashed commit if you forget to clean it up later.

5. Verify the fixup landed: `git log --oneline -1` should show the `fixup!` subject, and `git log --pretty=format:'%H %s' | grep '^<sha> '` should still resolve.

After all commits are processed, the history should look like:

```text
<fixup for commit N>   fixup! <subject of N>
<commit N>             <original subject of N>
<fixup for commit N-1> fixup! <subject of N-1>
<commit N-1>           <original subject of N-1>
…
```

If a fixup cannot be cleanly staged (merge conflict in a later fixup that re-touches the same lines), stop and report the conflicting commits. Do not try to be clever with `git rebase` mid-loop.

## 5. Leave the squashing for the user

This skill does **not** run `git rebase --autosquash` and does **not** force-push. The user runs them when ready:

```bash
# review the autosquash plan, then either accept or abort
GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash "$MERGE_BASE"

# then push (force-push is expected on a PR branch being actively reviewed)
git push --force-with-lease
```

Surface these two commands verbatim in the final report. The `--force-with-lease` instead of `--force` is deliberate — it refuses to clobber a remote that has moved.

## 6. Report unresolved items

After the run, print a structured report:

```text
## PR Review Fix Pass
- PR:        <url>
- Branch:    <branch>
- Commits:   <fixed>/<total with comments>
- Fixups:    <count> created (one per original commit)
- Skipped:   <list of comments: short-sha:path:line — reason>
- Security:  <count of // security: findings addressed>
- Threads:   <count of unreviewed threaded replies, surfaced not addressed>
- Next:      review autosquash plan, then run:
              GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <merge-base>
              git push --force-with-lease
```

Skipped reasons should be one of: `nit: out of diff scope`, `suggestion: ambiguous`, `user-deferred`, `conflict with later fixup`.

## 7. Anti-patterns

- Squashing automatically and force-pushing inside this skill. The create-task and git-github-expert contracts require explicit user approval for force-pushes on PR branches.
- Mixing multiple commits' fixes into a single fixup commit. Each fixup must target exactly one original `<sha>`.
- Editing files outside the diff of the commit you are fixing. The autosquash relies on a clean per-commit mapping.
- Stashing the dirty working tree mid-skill to "make room". Stop and ask.
- Replying to or resolving review threads. The human owns the conversation.
- Using `git commit --amend` on the original commit. That rewrites history in a way autosquash cannot reconcile cleanly.
- Pushing without `--force-with-lease`. A bare `--force` can clobber concurrent reviewer pushes.

## 8. Resume / re-run

If the skill is run a second time on the same PR:

- Comments addressed in the previous run will still appear in the API. Detect this by checking whether a `fixup! <sha>` commit already exists; if so, skip that commit (its findings are already addressed in the fixup).
- New comments posted after the previous run will be picked up and produce new fixups against the same original `<sha>`. The final autosquash collapses them all.
- Never try to "unfix" or revert an existing fixup — that is the user's call, with `git rebase -i`.