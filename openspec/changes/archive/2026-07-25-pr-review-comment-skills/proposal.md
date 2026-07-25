## Why

The personal workspace can open Pull Requests with `create-pr`, but reviewing them is ad-hoc. A per-commit review workflow produces findings anchored to the exact lines of each commit, and a paired fix workflow that emits `git commit --fixup=<sha>` commits keeps every fix aligned to the original commit so `git rebase --autosquash` collapses them cleanly at merge time.

## What Changes

- Add `pr-review-comments` skill at `.agents/skills/pr-review-comments/SKILL.md` that posts one inline PR review per commit, anchored to that commit's SHA, with severity-tagged findings.
- Add `fix-pr-review-comments` skill at `.agents/skills/fix-pr-review-comments/SKILL.md` that reads the per-commit review comments, applies the minimum fix per comment, and stages the change as a `--fixup=<sha>` commit; the user runs autosquash and `--force-with-lease` explicitly.
- Define a new `pr-review-workflow` capability describing the review/fix pairing and the per-commit anchoring contract that downstream fixes rely on.
- Update the `agent-skill-library` spec to include `pr-review-comments` and `fix-pr-review-comments` in the approved PR-category inventory.

## Capabilities

### New Capabilities

- `pr-review-workflow`: Per-commit PR review (one review per commit anchored to that commit's SHA) and per-commit fixup-based addressing, where each `git commit --fixup=<sha>` targets exactly one original commit so the history stays autosquash-ready.

### Modified Capabilities

- `agent-skill-library`: Add a scenario that the approved PR-category inventory includes the new `pr-review-comments` and `fix-pr-review-comments` skills, with the same frontmatter and unique-name rules as the rest of the library.

## Impact

- Two new skill files: `.agents/skills/pr-review-comments/SKILL.md`, `.agents/skills/fix-pr-review-comments/SKILL.md`.
- One new spec file: `openspec/changes/pr-review-comment-skills/specs/pr-review-workflow/spec.md`.
- One modified existing spec: `openspec/specs/agent-skill-library/spec.md` (delta added under the change).
- No new dependencies; uses the existing `gh` CLI (authenticated) and `git`.
- No new auth, sessions, tokens, or privilege surfaces — operates within the user's existing `gh` and `git` permissions.

## Security Considerations

- **Data touched**: PR commits and diffs (code), PR review comments (text), local worktree files. No PII, secrets, credentials, tokens, or customer content handled by the skills themselves; they only read what `git show` and `gh api` already expose to the authenticated user.
- **Trust boundaries crossed**: local process → `gh` CLI → GitHub REST API (`POST/GET /repos/{o}/{r}/pulls/{n}/reviews[comments]`); local worktree → git history. No new boundaries beyond what `create-pr` already crosses.
- **Third-party trust**: `gh` CLI (already trusted by the workspace for `create-pr`) and the GitHub REST API. No new packages, no new APIs, no model calls, no supply-chain additions.
- **Persistence**: skill files under `.agents/skills/`; `--fixup` git commits in the worktree; PR review comments persisted on GitHub by the platform; transient `/tmp/pr-review-<sha>.json` payload written during review posting and deleted after success. No DB, cache, or log files.
- **Privilege escalation surface**: none. Operates within the authenticated user's existing `gh` and local `git` permissions; `gh` enforces write access to the target repo, and the fix skill requires the user to run `git push --force-with-lease` explicitly rather than auto-pushing.