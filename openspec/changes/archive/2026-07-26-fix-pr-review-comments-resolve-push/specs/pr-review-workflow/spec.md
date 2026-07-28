## ADDED Requirements

### Requirement: Reply-with-commit-link and resolve
The `fix-pr-review-comments` skill SHALL post a per-comment reply and resolve the thread for every actionable top-level review comment whose fixup commits landed on the local branch.

#### Scenario: One fixup commit → one reply with that commit's short-SHA and URL
- **WHEN** an actionable top-level comment is addressed by exactly one fixup commit
- **THEN** the skill posts a thread reply of the form `Addressed in <short-sha> — <commit URL>` and resolves the thread only after the user has approved the push

#### Scenario: Multiple fixup commits → reply lists all short-SHAs oldest-first
- **WHEN** an actionable top-level comment is addressed by more than one fixup commit
- **THEN** the skill posts a single thread reply listing every short-SHA and its URL, oldest first, separated by `, ` within each list, and resolves the thread only after the user has approved the push

#### Scenario: Reply posts even when the user rejects the push
- **WHEN** the user declines the push prompt
- **THEN** the thread replies still land on the PR but the threads are NOT resolved and the branch is NOT pushed

#### Scenario: Resolve failure surfaces without blocking
- **WHEN** the resolve API call returns a non-2xx status (for example 403 on a comment the user cannot resolve)
- **THEN** the skill records the failure in the final report and continues with the remaining comments

## MODIFIED Requirements

### Requirement: Fix skill does not auto-squash; push requires confirmation
The `fix-pr-review-comments` skill SHALL NOT run `git rebase --autosquash` or `git push` without explicit user confirmation. The user runs autosquash and `git push --force-with-lease` explicitly; the only push the skill may perform is a regular (non-force) `git push` of the fixup commits after the user has approved a printed push plan.

#### Scenario: Fix skill stops after creating fixups and surfacing the push plan
- **WHEN** the fix skill finishes producing fixup commits
- **THEN** the working tree contains the fixups, the branch is not rebased, and the skill prints a push plan and waits for explicit user approval before pushing

#### Scenario: Push is a regular push on the existing branch
- **WHEN** the user approves the push plan
- **THEN** the skill runs `git push` (or `git push --set-upstream origin <branch>` if there is no upstream) without `--force` or `--force-with-lease`, and reports the upstream URL plus the new head SHA

#### Scenario: Push rejection is reported and not retried
- **WHEN** the push fails (for example non-fast-forward because the user has already run autosquash on another clone)
- **THEN** the skill reports the failure and instructs the user to run `git push --force-with-lease` themselves; the skill does NOT retry with force

#### Scenario: Re-runs skip already-addressed commits
- **WHEN** the fix skill runs a second time and a commit already has a `fixup! <sha>` descendant
- **THEN** that commit is skipped and reported as already addressed

## Related

- [[../../proposal|Proposal]]
- [[../../design|Design]]
- [[../../tasks|Tasks]]
