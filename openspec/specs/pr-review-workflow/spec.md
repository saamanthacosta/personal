# pr-review-workflow Specification
## Purpose
The workspace provides a per-commit PR review workflow and a paired fixup-based addressing workflow that keeps every fix aligned to the original commit so `git rebase --autosquash` collapses them cleanly at merge time.
## Requirements
### Requirement: Per-commit PR review anchoring
The `pr-review-comments` skill SHALL post exactly one review per commit in the merge-base..HEAD range of the PR, with each review's `commit_id` set to that commit's full SHA so downstream fixes can group findings by commit.

#### Scenario: One review per commit
- **WHEN** the review skill runs against a PR with N commits in the merge-base..HEAD range
- **THEN** it posts exactly N reviews, each anchored to one of the N commit SHAs

#### Scenario: Empty inline findings still post a review
- **WHEN** a commit's diff produces no inline findings
- **THEN** the skill still posts a review anchored to that commit, with an empty `comments` array and a body summarising the commit

#### Scenario: Unanchorable findings move to the review body
- **WHEN** a finding cannot be tied to a line that exists in `git show <sha>`
- **THEN** the finding is included in the review body, not as an inline comment

### Requirement: Severity-tagged inline findings
Each inline review comment SHALL begin with one of the severity tags `// security:`, `// issue:`, `// suggestion:`, or `// nit:` so the fix skill can prioritise without re-running the review.

#### Scenario: Every inline comment carries a recognised tag
- **WHEN** the review skill posts an inline comment
- **THEN** the comment body begins with exactly one of the four tags

### Requirement: Per-commit fixup commits
The `fix-pr-review-comments` skill SHALL produce exactly one `git commit --fixup=<sha>` per original commit that has actionable review comments, and SHALL NOT stage paths outside that original commit's diff.

#### Scenario: One fixup per commented commit
- **WHEN** the fix skill runs and M original commits have actionable top-level review comments
- **THEN** exactly M fixup commits are created, each with subject `fixup! <original subject>`

#### Scenario: No out-of-diff edits
- **WHEN** the fix skill applies a change to address a comment
- **THEN** only paths present in the original commit's `git show <sha>` are modified and staged

#### Scenario: Threaded replies are surfaced, not actioned
- **WHEN** a review comment has a non-null `in_reply_to_id`
- **THEN** the fix skill reports it in the run summary but does not create a fixup for it

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

### Requirement: Library inventory includes the PR review skills
The root `.agents/skills/` library SHALL contain `pr-review-comments` and `fix-pr-review-comments` in the PR-category inventory, with valid frontmatter and unique names that do not collide with any other skill folder.

#### Scenario: pr-review-comments skill is present
- **WHEN** the library inventory enumerates `.agents/skills/`
- **THEN** `.agents/skills/pr-review-comments/SKILL.md` exists with valid frontmatter and a unique name

#### Scenario: fix-pr-review-comments skill is present
- **WHEN** the library inventory enumerates `.agents/skills/`
- **THEN** `.agents/skills/fix-pr-review-comments/SKILL.md` exists with valid frontmatter and a unique name

## History

- [[../changes/archive/2026-07-26-fix-pr-review-comments-resolve-push/proposal|fix-pr-review-comments-resolve-push (2026-07-26)]] — Add reply-with-commit-link + resolve + push-with-confirmation to the fix skill.
- [[../changes/archive/2026-07-25-pr-review-comment-skills/proposal|pr-review-comment-skills (2026-07-25)]] — Initial per-commit review + fixup-based addressing workflow.
