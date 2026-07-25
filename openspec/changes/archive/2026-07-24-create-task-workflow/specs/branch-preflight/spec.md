---
tags:
  - change/create-task-workflow
  - status/archived
  - capability/branch-preflight
---

## ADDED Requirements

### Requirement: New tasks begin from an up-to-date main branch
Before exploration, proposal creation, application, or other task file changes, the workflow SHALL resolve the target Git repository, confirm the task type and slug, switch or checkout `main`, update it with fast-forward-only behavior, and create the type-appropriate task branch.

#### Scenario: Clean repository creates a feature branch
- **WHEN** a new feature is requested in a clean repository with a usable `main` and remote
- **THEN** the workflow updates `main` and creates `feat/<slug>` before entering exploration

#### Scenario: Main update cannot fast-forward
- **WHEN** updating `main` would require a merge, rebase, or conflict
- **THEN** the workflow stops and reports the divergence without changing history

#### Scenario: Branch already exists
- **WHEN** the intended local or remote branch name already exists
- **THEN** the workflow stops and asks whether to resume that branch or choose another name

### Requirement: Dirty worktrees are preserved explicitly
The workflow SHALL inspect modified, deleted, and untracked files before switching branches and SHALL require an explicit decision before stashing or proceeding.

#### Scenario: Approved task stash is restored
- **WHEN** the user approves preserving task changes with a uniquely labeled stash
- **THEN** the workflow includes untracked files, creates the new branch from updated `main`, restores the labeled stash, and verifies the worktree

#### Scenario: Stash restoration conflicts
- **WHEN** restoring the task stash produces conflicts
- **THEN** the workflow stops, preserves the stash for recovery, and does not begin proposal or implementation work

#### Scenario: Existing commits are ahead of main
- **WHEN** the current branch contains commits not present on `main`
- **THEN** the workflow does not treat those commits as stashable changes and asks whether to resume, branch from the current history, or abort

### Requirement: Preflight failures are fail-safe
The workflow SHALL refuse to proceed when the target repository, `main` branch, remote, or required branch state cannot be verified, and SHALL never use automatic reset, force-push, or silent conflict resolution.

#### Scenario: Target repository is the workspace container
- **WHEN** invocation from a multi-repository workspace resolves to a container repository rather than the intended project
- **THEN** the workflow asks the user to select or enter the target project before running Git mutations

## Related

- [[../../../../specs/branch-preflight/spec|branch-preflight (canonical)]]
- [[../../proposal|Proposal]]
- [[../../design|Design]]
- [[../../tasks|Tasks]]

