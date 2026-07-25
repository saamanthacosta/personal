## ADDED Requirements

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

### Requirement: Fix skill does not auto-squash or auto-push
The `fix-pr-review-comments` skill SHALL NOT run `git rebase --autosquash` or `git push`. The user runs autosquash and `git push --force-with-lease` explicitly.

#### Scenario: Fix skill stops after creating fixups
- **WHEN** the fix skill finishes producing fixup commits
- **THEN** the working tree contains the fixups but the branch is not rebased and not pushed

#### Scenario: Re-runs skip already-addressed commits
- **WHEN** the fix skill runs a second time and a commit already has a `fixup! <sha>` descendant
- **THEN** that commit is skipped and reported as already addressed

### Requirement: Library inventory includes the PR review skills
The root `.agents/skills/` library SHALL contain `pr-review-comments` and `fix-pr-review-comments` in the PR-category inventory, with valid frontmatter and unique names that do not collide with any other skill folder.

#### Scenario: pr-review-comments skill is present
- **WHEN** the library inventory enumerates `.agents/skills/`
- **THEN** `.agents/skills/pr-review-comments/SKILL.md` exists with valid frontmatter and a unique name

#### Scenario: fix-pr-review-comments skill is present
- **WHEN** the library inventory enumerates `.agents/skills/`
- **THEN** `.agents/skills/fix-pr-review-comments/SKILL.md` exists with valid frontmatter and a unique name