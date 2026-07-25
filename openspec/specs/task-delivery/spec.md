---
tags:
  - capability/task-delivery
---

# task-delivery Specification

## Purpose
TBD - created by archiving change create-task-workflow. Update Purpose after archive.
## Requirements
### Requirement: Commits follow workspace conventions
The workflow SHALL use the commit skill's grouping and message rules, stage only intended files, and require a clean, security-checked staged diff before committing.

#### Scenario: Commit is ready
- **WHEN** verification passes and the user approves the proposed commit grouping and message
- **THEN** the workflow stages only intended files and creates a commit with a title within the workspace limit and correctly formatted body

#### Scenario: Staged security scan blocks
- **WHEN** the staged diff contains a blocking security finding
- **THEN** the workflow does not create the commit and reports the finding

### Requirement: Push uses a verified upstream operation
The workflow SHALL push the task branch with an explicit upstream command, verify success and branch tracking, and SHALL NOT depend on a local `gpsup` alias.

#### Scenario: First push succeeds
- **WHEN** the user approves delivery and the branch has no upstream
- **THEN** the workflow runs `git push --set-upstream origin <branch>`, verifies the upstream, and proceeds to PR preparation

#### Scenario: Push fails
- **WHEN** the remote rejects or cannot receive the branch
- **THEN** the workflow stops without attempting to create a PR and reports the remote error

### Requirement: Pull requests require clean readiness and approval
The workflow SHALL preview the PR title, structured description, changed-file tree, and commit list, verify the worktree is clean and the branch is pushed, and ask for approval before opening the PR.

#### Scenario: PR is created
- **WHEN** the branch is pushed, the worktree is clean, checks pass, and the user approves the preview
- **THEN** the workflow opens one PR against the repository default branch and reports its URL

#### Scenario: Existing PR is found
- **WHEN** the current branch already has a PR
- **THEN** the workflow returns the existing PR URL and does not create another PR

### Requirement: Archive is not implicit
Opening a PR SHALL NOT archive the associated OpenSpec change unless the user explicitly requests the archive action.

#### Scenario: Implementation reaches PR state
- **WHEN** the PR is successfully opened
- **THEN** the workflow reports archive as a separate optional follow-up and leaves the OpenSpec change active

## History

- [[../../changes/archive/2026-07-24-create-task-workflow/proposal|create-task-workflow (2026-07-24)]] — Implementation work currently depends on manually remembering several separate OpenSpec, Git, security, and PR steps.


