## Why

The `fix-pr-review-comments` skill currently produces fixup commits and stops, expecting the user to run `git rebase --autosquash && git push --force-with-lease` and to manually reply-and-resolve each addressed review thread. After every fixup run the user has to walk the PR, mark each fixed thread, and write a tracking reply — repetitive work that the skill already knows how to compute (which commit(s) addressed which comment). Close the loop in the skill itself: reply with the fixup commit link(s), resolve the thread, and push with explicit confirmation.

## What Changes

- Modify the `fix-pr-review-comments` skill so that, after creating fixup commits, it iterates the addressed comments and for each one:
  - Posts a reply via `gh api POST /repos/{o}/{r}/pulls/{n}/comments/{comment_id}/replies` with the body `Addressed in <short-sha> — <commit URL>` (all short-shas listed if the same comment was addressed by more than one fixup commit, oldest first).
  - Resolves the thread via `gh api PATCH /repos/{o}/{r}/pulls/comments/{comment_id}` with body `{"resolved": true}` — deferred until the user explicitly approves the push, so the reply lands together with the pushed fixups.
- Add a `git push` step gated by a mandatory user confirmation prompt. The push is a regular push of the fixup commits on top of the existing branch; force-push is still the user's call when they run autosquash later.
- Add a new requirement `## Reply-with-commit-link and resolve` to the `pr-review-workflow` spec; modify the existing `Fix skill does not auto-squash or auto-push` requirement to permit push-with-confirmation while still forbidding autosquash.
- Add a new requirement `## Push with confirmation` describing the gate.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `pr-review-workflow`: add a `Reply-with-commit-link and resolve` requirement that covers the reply body format (single short-sha, or comma-joined list of short-shas + URLs oldest first) and the resolve-after-push sequence; modify the existing `Fix skill does not auto-squash or auto-push` requirement to permit push-with-confirmation while retaining the autosquash prohibition.

## Impact

- One skill file modified: `.agents/skills/fix-pr-review-comments/SKILL.md`.
- One spec file modified: `openspec/specs/pr-review-workflow/spec.md` (delta added under the change).
- No new dependencies; uses the existing `gh` CLI (authenticated) and `git`.
- No new auth, sessions, tokens, or privilege surfaces — operates within the user's existing `gh` and `git` permissions.

## Security Considerations

- **Data touched**: PR review comments (text), local git history (commit SHAs), local worktree files. The reply text is short-SHA + commit URL only — no code, secrets, PII, or credentials. The commit URL is a public PR URL the reviewers already have access to.
- **Trust boundaries crossed**: local process → `gh` CLI → GitHub REST API (`POST .../comments/{id}/replies` and `PATCH /pulls/comments/{id}` to resolve); local worktree → `git push`. Same boundaries already crossed by `pr-review-comments` and `update-pr-description`.
- **Third-party trust**: `gh` CLI (already trusted by the workspace) and the GitHub REST API. No new packages, no new APIs, no model calls, no supply-chain additions.
- **Persistence**: PR review replies and thread resolution state on GitHub (visible to PR reviewers); `--fixup` git commits in the worktree; the push itself. No new DB, cache, or log files.
- **Privilege expansion**: two new actions vs. the current skill:
  1. **Resolving threads** — previously the skill explicitly forbids replying to or resolving threads ("the human owns the conversation"). The change expands the skill to resolve threads. Mitigations: only the user's authenticated `gh` session acts; the action is idempotent and reversible; the resolve step is deferred until the user approves the push, so reply + resolve land together.
  2. **Pushing the branch** — the existing spec forbids auto-push. The change permits push-with-explicit-confirmation. Mitigations: mandatory user prompt before push; the push is a regular push of the fixup commits on top of the existing branch (no `--force`); the user still runs `git rebase --autosquash && git push --force-with-lease` themselves after reviewing the fixups.
- **Audit trail**: every reply and resolve is attributed to the authenticated user via the `gh` CLI; the PR timeline records both events. The skill surfaces the list of reply/resolve actions in the final report so the user can audit.

## Related

- [[design|Design]]
- [[tasks|Tasks]]
- [[specs/pr-review-workflow/spec|pr-review-workflow]]
