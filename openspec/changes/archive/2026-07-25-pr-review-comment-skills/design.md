## Context

The personal workspace opens Pull Requests with the `create-pr` skill, but there is no canonical way to review or address review comments. Today a reviewer (human or AI) tends to drop a single batch of comments at the PR head, and any fix loop re-commits on top of the branch without preserving the original commit boundaries. The result is a noisy diff on `main` after merge and no traceable per-commit reasoning in the PR history.

This change introduces two skills that operate as a pair: `pr-review-comments` produces findings anchored to each original commit in the PR, and `fix-pr-review-comments` consumes those findings and emits `git commit --fixup=<sha>` commits so a final `git rebase --autosquash` collapses the fixes back into the commits they belong to.

## Goals / Non-Goals

**Goals:**
- One inline PR review per commit, anchored to that commit's SHA, so findings and fixes stay per-commit.
- A severity taxonomy (`// security:`, `// issue:`, `// suggestion:`, `// nit:`) the fix skill can prioritize.
- Fixes emitted as `git commit --fixup=<sha>` for one original commit each, with no amend of the original.
- Explicit user control over `git rebase --autosquash` and `git push --force-with-lease` — the skills never run them.

**Non-Goals:**
- Auto-resolving review threads or auto-replying to reviewer comments.
- Auto-squashing, auto-pushing, or any form of unattended force-push.
- Cross-PR aggregation, dashboards, or notifications.
- Generic PR comment classification (the taxonomy is skill-internal; comments from human reviewers outside the skill are not interpreted).

## Decisions

- **Posting mechanism**: `gh api POST /repos/{o}/{r}/pulls/{n}/reviews` with a JSON payload written to `/tmp/pr-review-<sha>.json`, rather than `gh pr review` shell flags. This lets each review carry multiple inline comments with explicit `path`, `line`, and `side`, and lets the skill use `--input` to avoid shell-escaping the comment bodies.
  - *Alternatives considered*: `gh pr review --comments-json <file>` — rejected because the comments array shape and `commit_id` anchoring are easier to control with a direct API call. The `pull-request-review-create` GraphQL mutation — rejected to keep dependencies on `gh` REST only.
- **Anchoring each review by original commit SHA**: the review payload sets `commit_id` to the full SHA of the commit being reviewed, not the PR head. This is the contract the fix skill relies on to group findings by commit.
  - *Alternatives considered*: posting all comments under a single PR-head review — rejected because it collapses findings across commits and breaks the fixup mapping.
- **Severity tags as parseable prefixes**: the leading `// <tag>:` lets the fix skill classify without re-running the review. Tags are chosen to match what `code-reviewer` style agents already emit and to be easy to grep.
  - *Alternatives considered*: structured frontmatter on each comment — rejected because GitHub review comment bodies are markdown, not structured. A separate response file — rejected because it would split state across GitHub and the local repo.
- **Minimum-diff fixes**: the fix skill edits only paths present in the original commit's `git show <sha>` and avoids refactors beyond the comment's request. Extra edits break the autosquash mapping.
  - *Alternatives considered*: free refactors — rejected because the original commits are the contract. `git commit --amend` on the original — rejected because it rewrites history in a way autosquash cannot reconcile cleanly with later fixups.
- **No auto-squash, no auto-push**: the skill produces fixup commits and stops. The user runs `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <merge-base>` and `git push --force-with-lease` explicitly.
  - *Alternatives considered*: run autosquash and force-push inside the skill — rejected because force-push on a PR branch is a destructive operation the user must approve each time.

## Risks / Trade-offs

- **[422 from misaligned line numbers]** → Mitigation: only post inline comments whose `path` and `line` exist in `git show <sha>`; surface unanchorable findings in the review body, not as inline comments.
- **[Threaded replies mistaken for findings]** → Mitigation: fix skill filters to top-level comments (`in_reply_to_id == null`) and surfaces reply counts in the report without acting on them.
- **[Re-running the fix skill produces duplicate fixups]** → Mitigation: detect existing `fixup! <sha>` commits and skip already-addressed commits on subsequent runs; new comments after the last run produce new fixups against the same `<sha>`.
- **[Reviewer amends a commit mid-loop]** → Mitigation: the fix skill runs against the working tree and produces fixups against the original `<sha>`; if the original was rewritten, autosquash will fail loud and the user resolves.
- **[Per-commit reviews are noisy on large PRs]** → Accepted trade-off: the per-commit structure is the point. The skill skips merge commits and empty diffs; everything else gets reviewed.

## Migration Plan

No migration. The change is purely additive: two new skill files and a spec update. Existing skills (`create-pr`, `commit`, etc.) are untouched.

## Open Questions

None. All design choices are settled by the per-commit anchoring contract that the two skills must satisfy together.

## Security Considerations

- **Data touched**: PR commits and diffs (code), PR review comments (text), and local worktree files. No PII, secrets, credentials, tokens, or customer content handled by the skills themselves; they only read what `git show` and `gh api` already expose to the authenticated user.
- **Trust boundaries crossed**: local process → `gh` CLI → GitHub REST API (`POST/GET /repos/{o}/{r}/pulls/{n}/reviews[comments]`); local worktree → git history. No new boundaries beyond what `create-pr` already crosses.
- **Third-party trust**: `gh` CLI (already trusted by the workspace for `create-pr`) and the GitHub REST API. No new packages, no new APIs, no model calls, no supply-chain additions.
- **Persistence**: skill files under `.agents/skills/`; `--fixup` git commits in the worktree; PR review comments persisted on GitHub by the platform; transient `/tmp/pr-review-<sha>.json` payload written during review posting and deleted after success. No DB, cache, or log files.
- **Privilege escalation surface**: none. Operates within the authenticated user's existing `gh` and local `git` permissions; `gh` enforces write access to the target repo, and the fix skill requires the user to run `git push --force-with-lease` explicitly rather than auto-pushing.
- **Override requests**: none.