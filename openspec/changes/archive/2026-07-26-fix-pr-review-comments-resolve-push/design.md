## Context

The `fix-pr-review-comments` skill currently produces fixup commits and stops, expecting the user to run `git rebase --autosquash && git push --force-with-lease` and to manually reply-and-resolve each addressed review thread. The user runs the skill precisely to do this work, and the skill already knows which fixup commit(s) addressed each comment — so the manual reply-and-resolve loop is reduplication.

Two concrete changes are requested:

1. **Reply-with-commit-link + resolve** — for each addressed comment, post a reply of the form `Addressed in <short-sha> — <commit URL>` (and list all short-shas if more than one commit fixed the same comment), then mark the thread resolved.
2. **Always push when fixing** — `git push` the branch after the fixes are made and the threads are resolved, with a mandatory user confirmation prompt before the push.

The skill body is a single `SKILL.md` at `.agents/skills/fix-pr-review-comments/SKILL.md`. The companion spec `openspec/specs/pr-review-workflow/spec.md` currently requires the skill to NOT push; that requirement is modified. The existing `pr-review-comments` skill (which produces the comments we address) is unchanged.

## Goals / Non-Goals

**Goals:**
- Add a reply-and-resolve step to the `fix-pr-review-comments` skill that runs after fixup commits are created.
- Reply body must reference the fixup commit(s) that addressed the comment, full PR URL, and short-SHA for scanner compatibility.
- Resolve the thread only after the user has approved the push, so reply + resolve land together with the pushed fixups.
- Permit `git push` inside the skill, gated by an explicit user prompt.
- Update the `pr-review-workflow` spec to reflect the new behavior.

**Non-Goals:**
- Auto-running `git rebase --autosquash` or `git push --force-with-lease`. The force-push is still the user's call after they review the autosquash plan.
- Modifying the `pr-review-comments` skill. Only the fix skill's outbound behavior changes.
- Adding a new dependency or package. The `gh` CLI already authenticated by the workspace is the only new outbound surface.
- Editing the PR description, labels, or any other PR metadata. The skill only touches review threads and (with confirmation) the branch HEAD.

## Decisions

### Decision 1: Reply format — short-SHA + full commit URL

Format: `Addressed in <short-sha> — <full-commit-URL>` for a single fixup, or `Addressed in <short-1>, <short-2> — <full-1>, <full-2>` (oldest first) when more than one commit fixed the same comment.

Rationale: short-SHA is the minimum scanner-friendly identifier; the full URL is what reviewers click to see the diff. Listing all short-shas (with their URLs) makes the reply self-contained when one comment was re-touched by multiple fixups (rare but possible if the same line needed multiple iterations).

Alternatives considered:
- Single plain-text short-SHA only — rejected because reviewers have to leave the comment to find the diff.
- Multiple paragraphs per sha — rejected because a single one-line reply is the scan-friendly norm.

### Decision 2: Resolve deferred until push is approved

The reply is posted immediately, but the resolve step is deferred until after the user approves the push. If the user rejects the push, the replies still land (so reviewers see the fixup commit landed) but the threads stay open (so the reviewer can re-open if needed).

Rationale: let the reviewer see the fixup commit hash in the thread before the human marks it resolved; the auto-resolve is the final "this is done" signal. If the user declines the push, resolving would misrepresent that the fix is on the remote.

Alternatives considered:
- Resolve immediately after the reply — rejected because the fixup commits are not yet on the remote, so resolving would be premature.
- Resolve only after the push succeeds — would require an extra round-trip on push failure; deferred-until-prompt keeps the code simple.

### Decision 3: `git push` is gated by an explicit prompt; no `--force`

The skill prints a "push plan" (push `<branch>` to `<remote>`, expected delta: N fixup commit(s)) and asks for confirmation. On approval, it runs `git push --set-upstream origin <branch>` (or `git push` if upstream is already set). It does NOT use `--force` or `--force-with-lease`; the fixups are added on top of the existing branch, so a regular push is sufficient.

Rationale: the spec's existing anti-autosquash rule is preserved. Force-push is reserved for the user's explicit `git rebase --autosquash && git push --force-with-lease` cycle after they review the squashed history.

Alternatives considered:
- Always push without confirmation — rejected because push is a privilege expansion that warrants explicit consent.
- Push then auto-resolve threads — rejected because the push is the boundary the user might want to gate.

### Decision 4: Use `gh api` directly, not `gh pr review --request-changes` or `gh pr comment`

`gh api POST /repos/{o}/{r}/pulls/{n}/comments/{comment_id}/replies` and `gh api PATCH /repos/{o}/{r}/pulls/comments/{comment_id}` give the precise control needed (per-comment reply, per-comment resolve). The `gh pr review` subcommand cannot resolve individual threads and `gh pr comment` posts a PR-level comment, not a thread reply.

Rationale: per-thread reply and per-thread resolve are the canonical GitHub REST API primitives; mirroring them in `gh` calls is the most direct path.

## Risks / Trade-offs

- **Risk: Reply storm.** A PR with many comments creates many reply + resolve API calls. → Mitigation: surface the count in the preview report; the user can decide to skip replies by aborting before the reply step.
- **Risk: Mis-attribution.** A reply appears with the user's identity (since `gh` runs as the authenticated user). → Mitigation: the user already runs `gh` authenticated against their own account; the skill does not impersonate anyone. Same posture as `pr-review-comments` and `update-pr-description`.
- **Risk: Resolve API permission.** Resolving a thread requires write access; some repos restrict this to maintainers. → Mitigation: surface a 403 in the report and continue without blocking; the reply still lands.
- **Risk: Wrong remote / branch on push.** The skill must compute the upstream from `git rev-parse --abbrev-ref --symbolic-full-name @{u}` and not assume `origin`. → Mitigation: same detection logic as the existing `Detect context` step; print the push plan and require confirmation before pushing.
- **Risk: Push rejected (non-ff).** A force-required push (e.g., the user has already run autosquash on another clone) would fail with a regular push. → Mitigation: print the failure and instruct the user to run `git push --force-with-lease` themselves; the skill does not retry with force.

## Migration Plan

1. Land the change behind the normal PR review cycle.
2. Existing fix-skill runs in flight are unaffected — the new reply-and-resolve step is additive after the fixup-commits step.
3. Rollback: revert the change on `main`. The skill is a single `SKILL.md`; reverting removes the reply-and-resolve and push steps without affecting fixup-commit production.

## Open Questions

- None at design time. The reply format, deferral, push semantics, and `gh` API surface are decided above.

## Security Considerations

- **Data touched**: PR review comments (read for grouping), local git history (commit SHAs, branch metadata), local worktree files (no code changes beyond existing fixup commits in this change). The reply text is short-SHA + commit URL only — no code, secrets, PII, or credentials. The commit URL is a public PR URL the reviewers already have access to.
- **Trust boundaries**: local process → `gh` CLI → GitHub REST API (`POST .../comments/{id}/replies` and `PATCH /pulls/comments/{id}` to resolve); local worktree → `git push`. Same boundaries already crossed by `pr-review-comments` and `update-pr-description`. No new network egress beyond the existing `gh` host.
- **Third-party trust**: `gh` CLI (already trusted by the workspace) and the GitHub REST API. No new packages, no new APIs, no model calls, no supply-chain additions.
- **Persistence**: PR review replies and thread resolution state on GitHub (visible to PR reviewers); `--fixup` git commits in the worktree (already produced by the existing skill); the push itself. No new DB, cache, or log files. The skill does not write to a config file, an environment file, or a credential store.
- **Privilege surfaces**: two new actions vs. the current skill:
  1. **Resolving threads** — previously the skill explicitly forbids replying to or resolving threads. The change expands the skill to resolve threads. Mitigations: only the user's authenticated `gh` session acts; the action is idempotent and reversible; the resolve step is deferred until after the user approves the push, so reply + resolve land together with the pushed fixups.
  2. **Pushing the branch** — the existing spec forbids auto-push. The change permits push-with-explicit-confirmation. Mitigations: mandatory user prompt before push; the push is a regular push of the fixup commits on top of the existing branch (no `--force`); the user still runs `git rebase --autosquash && git push --force-with-lease` themselves after reviewing the fixups.
- **Audit trail**: every reply and resolve is attributed to the authenticated user via the `gh` CLI; the PR timeline records both events. The skill surfaces the list of reply/resolve actions in the final report so the user can audit.
- **Requested overrides**: none. No CRITICAL or HIGH findings remain after this section is added.

## Related

- [[proposal|Proposal]]
- [[tasks|Tasks]]
- [[specs/pr-review-workflow/spec|pr-review-workflow]]
