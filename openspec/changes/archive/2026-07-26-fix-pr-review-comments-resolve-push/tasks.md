## 1. Reply-and-resolve step

- [x] 1.1 Add a "Reply with commit link and resolve" step in the `fix-pr-review-comments` SKILL.md between the existing fixup-commit step and the report step
- [x] 1.2 Document the reply body format: `Addressed in <short-sha> — <commit URL>` for one fixup; comma-joined short-shas + comma-joined URLs (oldest first) for multiple
- [x] 1.3 Document the `gh api POST /repos/{o}/{r}/pulls/{n}/comments/{comment_id}/replies` call with `--input` JSON payload containing `body` and `in_reply_to` (the parent review comment id)
- [x] 1.4 Document the deferred-resolve step: replies post first, resolve happens only after the user has approved the push plan
- [x] 1.5 Document the `gh api PATCH /repos/{o}/{r}/pulls/comments/{comment_id}` call with body `{"resolved": true}`; surface 403/non-2xx in the report without blocking the run

## 2. Push-with-confirmation step

- [x] 2.1 Add a "Push with confirmation" step before the existing report step
- [x] 2.2 Document the push plan print: branch name, upstream remote, ref, expected delta (count of new fixup commits)
- [x] 2.3 Document the explicit user prompt required before pushing
- [x] 2.4 Document the push command: `git push --set-upstream origin <branch>` if no upstream, else `git push`. No `--force` / `--force-with-lease`
- [x] 2.5 Document the rejection path: if user declines, replies still land, threads NOT resolved, branch NOT pushed; report this state

## 3. Anti-pattern + resume updates

- [x] 3.1 Update the existing anti-pattern list: remove "Replying to or resolving review threads. The human owns the conversation." (replaced by the new step) and modify the auto-squash item to forbid auto-squash but permit gated push
- [x] 3.2 Update the resume section to ensure already-resolved threads are skipped on re-runs (idempotency)
- [x] 3.3 Update the final report template to include replies-posted, threads-resolved, push-status

## 4. Mark skill change ready

- [x] 4.1 Verify `openspec status --change fix-pr-review-comments-resolve-push` lists all artifacts as done
- [x] 4.2 Run `node .agents/skills/cve-scan/bin/full-audit.mjs --change fix-pr-review-comments-resolve-push --phase=apply` and confirm no CRITICAL or unoverridden HIGH findings

## Related

- [[proposal|Proposal]]
- [[design|Design]]
- [[specs/pr-review-workflow/spec|pr-review-workflow]]
