# pr-description-sync Specification

## Purpose
Define the rules the `update-pr-description` skill must obey when recomputing an open Pull Request's body from the branch's current commit range, including template parity with `create-pr`, strict stop conditions, mandatory preview and approval, and library inventory.
## Requirements

### Requirement: Branch-state-driven PR body regeneration
The `update-pr-description` skill SHALL recompute the body of an open Pull Request from the branch's current commit range (`git merge-base <default-branch> HEAD..HEAD`) and SHALL apply it via `gh pr edit --body-file` after the user has approved a side-by-side preview.

#### Scenario: Skill regenerates a stale PR body
- **WHEN** the current branch has a PR that is `OPEN` and the working tree contains no unstaged or uncommitted modifications to tracked files
- **THEN** the skill recomputes Summary, Changes, File tree, and Commits from the current branch state, prints the proposed body alongside the current body for review, and applies the change only after the user confirms

#### Scenario: Title is not modified
- **WHEN** the skill regenerates the body
- **THEN** the PR title is left untouched unless the user explicitly passes a `--title` flag

### Requirement: Template parity with `create-pr`
The regenerated body SHALL follow the same section structure and formatting rules that `create-pr` enforces, as documented in `.agents/skills/create-pr/pr-style.md`, so a regenerated body is byte-shape identical to one produced at PR open.

#### Scenario: Section ordering and headings match create-pr
- **WHEN** the skill writes the proposed body
- **THEN** it contains `## Summary`, `## Changes`, `## File tree`, `## Commits` in that order, each separated by a blank line, with paragraphs kept on single lines (no soft-wrap inside a phrase)

#### Scenario: Notes section is preserved when present
- **WHEN** the current PR body contains a `## Notes` section
- **THEN** the regenerated body carries that section forward verbatim below the four mechanical sections

### Requirement: Strict stop conditions
The skill SHALL refuse to run when any precondition fails, returning a non-zero exit status and a structured report describing the failure, and SHALL warn (without blocking) when the working tree contains untracked files.

#### Scenario: No PR exists for the branch
- **WHEN** `gh pr view --json number` returns no PR for the current branch
- **THEN** the skill stops and reports that no PR is associated with the branch

#### Scenario: PR is merged or closed
- **WHEN** the PR's `state` field is `MERGED` or `CLOSED`
- **THEN** the skill stops and reports that it only operates on open PRs

#### Scenario: Working tree is dirty
- **WHEN** `git status --porcelain` shows staged or unstaged modifications to tracked files
- **THEN** the skill stops and asks the user to commit, stash, or discard the changes before regenerating

#### Scenario: Untracked files only
- **WHEN** `git status --porcelain` shows only untracked files
- **THEN** the skill prints a warning and proceeds

### Requirement: Mandatory preview and explicit approval
The skill SHALL always print both the current body and the proposed body in fenced code blocks, SHALL compute and display a unified diff between them, and SHALL require the user to type `y` (or equivalent affirmative) before invoking `gh pr edit`. There SHALL be no `--yes` flag.

#### Scenario: Preview is always shown
- **WHEN** the skill reaches the regeneration step
- **THEN** it writes the current body and the proposed body to temp files and prints both, plus a `diff -u` between them, before requesting approval

#### Scenario: No approval means no mutation
- **WHEN** the user does not affirmatively approve the preview
- **THEN** the skill exits without invoking `gh pr edit` and reports that no changes were applied

### Requirement: No new dependencies or persistence
The skill SHALL rely only on `git`, `gh`, and POSIX utilities. It SHALL NOT add npm packages, MCP servers, scripts under `.agents/skills/<name>/bin/`, or persistent local state beyond a single temp file used for `--body-file` and a single temp file used for the preview.

#### Scenario: No manifest or MCP changes
- **WHEN** the skill is authored and validated
- **THEN** no changes are made to `package.json`, MCP configuration, or any CI workflow file

#### Scenario: Temp files are cleaned up
- **WHEN** the skill completes (success or user-cancelled)
- **THEN** the temp files under `/tmp/pr-update-body-<pr>.md` and `/tmp/pr-update-current-<pr>.md` are removed

### Requirement: Library inventory registration
The root `.agents/skills/` library SHALL contain `update-pr-description` with valid frontmatter and a unique name, and `.agents/skills/README.md` SHALL list it under the `Personal/.agents/skills/` block alongside the other PR-category skills.

#### Scenario: update-pr-description skill is present
- **WHEN** the library inventory enumerates `.agents/skills/`
- **THEN** `.agents/skills/update-pr-description/SKILL.md` exists with valid frontmatter and a unique name

#### Scenario: skills-folder layout lists the new skill
- **WHEN** `.agents/skills/README.md` is read
- **THEN** the `Personal/.agents/skills/` block includes `update-pr-description` in its listing

## History

- [[../changes/archive/2026-07-25-add-update-pr-description-skill/proposal|add-update-pr-description-skill (2026-07-25)]] — Adds `update-pr-description` to keep an open PR's body in sync with the branch without closing and reopening it.