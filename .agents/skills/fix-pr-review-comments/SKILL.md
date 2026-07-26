---
name: fix-pr-review-comments
description: Address inline PR review comments produced by the `pr-review-comments` skill by grouping them per commit, producing `git commit --fixup=<sha>` commits, replying with the fixup commit link, resolving the addressed thread, and pushing the branch with explicit confirmation. Use after a per-commit review has been posted and the user asks to apply, address, or fix the review comments.
license: MIT
compatibility: Local machine skill — requires git, gh CLI authenticated against the target repo, and a per-commit review on the PR produced by the `pr-review-comments` skill.
metadata:
  author: personal
  version: "1.1"
---

# Fix Per-Commit PR Review Comments

You are an expert code fixer. The goal is to read the per-commit inline review comments produced by the `pr-review-comments` skill, group them by the commit SHA they were anchored to, apply the fixes to the working tree, produce one `git commit --fixup=<sha>` per original commit so the history stays aligned for a final `git rebase --autosquash` before merge, reply to each addressed thread with the commit link, resolve the thread, and push the branch with explicit confirmation.

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

## 5. Reply with commit link

For every actionable top-level comment addressed in this run, post a thread reply that names the fixup commit(s) so reviewers can find the diff without leaving the thread. The reply lands on the PR immediately, even if the push below is rejected — it still informs the reviewer that a fixup commit exists locally.

### 5.1 Resolve the comment-to-commit mapping

For each actionable comment, the set of `<short-sha>`s that addressed it is the union of `<short-sha>`s of the fixup commits in the same `commit_id` group (a single fixup commit per original commit, but the same comment can be re-touched across multiple fixups if the user re-runs the skill). Build a map:

```
<comment_id> → [<short-sha-1>, <short-sha-2>, …]   (oldest first)
```

### 5.2 Compose the reply body

- One fixup commit: `Addressed in <short-sha> — <commit URL>`
- Multiple fixup commits: `Addressed in <short-sha-1>, <short-sha-2> — <commit URL-1>, <commit URL-2>`

The commit URL is the GitHub permalink for the commit, computed as:

```bash
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
echo "https://github.com/${REPO}/commit/<full-sha>"
```

Keep the reply on a single line. No subject lines, no code-block fences, no extra narrative — the scanner-friendly single-SHA identity is the contract.

### 5.3 Post the reply

For each `comment_id` in the mapping, write the JSON payload to a temp file and use `gh api --input`:

```bash
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/<owner>/<repo>/pulls/<pr-number>/comments/<comment_id>/replies \
  --input /tmp/fix-pr-reply-<comment_id>.json
```

The JSON payload is:

```json
{ "body": "Addressed in <short-sha> — <commit URL>" }
```

On a non-2xx response, record the failure in the report and continue with the remaining comments. Do not retry blindly — GitHub rejects duplicate replies with 422. Delete the temp file after each successful post.

## 6. Push with confirmation

After all replies are posted, surface a push plan and require explicit user approval before pushing. **No `--force`, no `--force-with-lease`.** The fixup commits sit on top of the existing branch, so a regular push is sufficient.

### 6.1 Build the push plan

```bash
BRANCH=$(git branch --show-current)
UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
REMOTE="${UPSTREAM%%/*}"
FIXUP_COUNT=$(git log --merges --first-parent --pretty=format:'%H' "$MERGE_BASE..HEAD" \
  | xargs -I{} git log --pretty=format:'%H %s' -1 {} \
  | grep -c '^fixup! ' || echo 0)
```

Print the plan verbatim:

```text
## Push Plan
- Branch:   <branch>
- Remote:   <remote> (set upstream if absent)
- New:      <count> fixup commit(s) since <merge-base>
- Mode:     regular push (no --force; --force-with-lease is reserved for the autosquash step)
- Push URL: https://github.com/<owner>/<repo>/compare/<merge-base>...<branch>
```

### 6.2 Require explicit confirmation

There is **no** `--yes` flag. Surface the plan and ask the user to confirm with a free-text prompt. An empty answer or a refusal aborts the push — the skill continues to step 7 with `push_rejected=true`, the replies posted in step 5 still land, and the threads stay unresolved.

### 6.3 Push

On approval, run one of:

```bash
# upstream already set
git push

# no upstream
git push --set-upstream origin <branch>
```

Verify the push succeeded:

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u}        # upstream exists
git ls-remote --heads origin <branch> | grep <new-head-sha>  # remote knows the new head
```

If the push fails (non-fast-forward, auth error, protected branch), stop and report the upstream error. **Never** retry with `--force` or `--force-with-lease` — instruct the user to run `git push --force-with-lease` themselves if autosquash is the cause.

## 7. Resolve threads

Once the push has succeeded, resolve each addressed thread so the reviewer sees the thread as closed. If the push was rejected, skip this step entirely.

### 7.1 Map comment IDs to thread IDs

The REST API path-based reply endpoint accepts a `comment_id`, but resolving a thread is a GraphQL operation that requires the thread's `id`. Fetch the mapping once:

```bash
gh api graphql \
  -F owner="$OWNER" -F name="$REPO" -F pr=<pr-number> \
  -f query='
{
  repository(owner: $owner, name: $name) {
    pullRequest(number: $pr) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          comments(first: 100) {
            nodes { databaseId }
          }
        }
      }
    }
  }
}' \
  --jq '.data.repository.pullRequest.reviewThreads.nodes
        | map({id, isResolved, ids: (.comments.nodes | map(.databaseId))})
        | map(select(.ids | length > 0))'
```

Build a map: `comment_id → {thread_id, already_resolved}`.

### 7.2 Resolve each thread

For every `comment_id` in the reply map from step 5, look up the `thread_id` and skip threads where `already_resolved == true`. Then resolve:

```bash
gh api graphql \
  -F threadId="$THREAD_ID" \
  -f query='
mutation {
  resolveReviewThread(input: {threadId: $threadId}) {
    thread { isResolved }
  }
}'
```

Surface non-2xx responses (e.g., 403 if the user cannot resolve a thread) in the report and continue with the remaining threads. The reply still lands; only the resolve is skipped.

## 8. Leave the squashing for the user

This skill does **not** run `git rebase --autosquash`. The fixup commits are already pushed at this point; the user runs autosquash and the force-push when ready:

```bash
# review the autosquash plan, then either accept or abort
GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash "$MERGE_BASE"

# then push (force-push is expected on a PR branch being actively reviewed)
git push --force-with-lease
```

Surface these two commands verbatim in the final report. The `--force-with-lease` instead of `--force` is deliberate — it refuses to clobber a remote that has moved.

## 9. Report unresolved items

After the run, print a structured report:

```text
## PR Review Fix Pass
- PR:         <url>
- Branch:     <branch>
- Commits:    <fixed>/<total with comments>
- Fixups:     <count> created (one per original commit)
- Replies:    <posted>/<total addressed> (skipped: <list of comment_ids — reason>)
- Resolved:   <resolved>/<total replied> (skipped: <list of comment_ids — reason>)
- Pushed:     <yes | rejected | no upstream | failed: <error>>
- Skipped:    <list of comments: short-sha:path:line — reason>
- Security:   <count of // security: findings addressed>
- Threads:    <count of unreviewed threaded replies, surfaced not addressed>
- Next:       review autosquash plan, then run:
                GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <merge-base>
                git push --force-with-lease
```

Skipped reasons should be one of: `nit: out of diff scope`, `suggestion: ambiguous`, `user-deferred`, `conflict with later fixup`, `reply: API error`, `resolve: API error or 403`, `resolve: push rejected`.

## 10. Anti-patterns

- Running `git rebase --autosquash` inside this skill. The create-task and git-github-expert contracts require explicit user approval for history rewrites on PR branches.
- Force-pushing inside this skill. The push in step 6 is a regular push; force-push is reserved for the user's autosquash step.
- Pushing without an explicit user confirmation. The push plan must be printed and the user must approve before `git push` runs.
- Mixing multiple commits' fixes into a single fixup commit. Each fixup must target exactly one original `<sha>`.
- Editing files outside the diff of the commit you are fixing. The autosquash relies on a clean per-commit mapping.
- Stashing the dirty working tree mid-skill to "make room". Stop and ask.
- Replying with a body that does not reference the fixup commit(s). The single-SHA + URL contract is what makes the reply scanner-friendly.
- Resolving threads when the push was rejected. The reply still lands; the resolve is held back so the reviewer can re-open if the local commits never made it to the remote.
- Using `git commit --amend` on the original commit. That rewrites history in a way autosquash cannot reconcile cleanly.
- Retrying a failed push with `--force` or `--force-with-lease`. The user owns that call.

## 11. Resume / re-run

If the skill is run a second time on the same PR:

- Comments addressed in the previous run will still appear in the API. Detect this by checking whether a `fixup! <sha>` commit already exists; if so, skip that commit (its findings are already addressed in the fixup).
- New comments posted after the previous run will be picked up and produce new fixups against the same original `<sha>`. The final autosquash collapses them all.
- Threads already resolved in a previous run are skipped in step 7.2 (`already_resolved == true`); the reply is still posted if it has not been posted before, idempotent against the GitHub reply thread.
- Never try to "unfix" or revert an existing fixup — that is the user's call, with `git rebase -i`.