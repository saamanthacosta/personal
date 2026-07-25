---
tags:
  - change/create-task-workflow
  - status/archived
  - capability/branch-preflight
  - capability/task-delivery
  - capability/task-orchestration
  - capability/task-quality-gates
---

## 1. Orchestrator contract

- [x] 1.1 Create `.agents/skills/create-task/SKILL.md` with valid frontmatter, task-type classification, slug confirmation, and phase-state model.
- [x] 1.2 Define branch-prefix mappings for feature, fix, refactor, chore, docs, test, and performance tasks with `feat/<slug>` as the feature default.
- [x] 1.3 Define new-task versus resume behavior and the user approval checkpoints for repository mutations and delivery actions.

## 2. Repository preflight

- [x] 2.1 Resolve the target Git worktree and reject ambiguous multi-repository invocations until the user selects a project.
- [x] 2.2 Inspect current branch, status, untracked files, upstream state, commits ahead of main, remotes, and local/remote branch collisions.
- [x] 2.3 Implement the clean-worktree path: switch/checkout `main`, update with `git pull --ff-only`, and create the confirmed type-prefixed branch.
- [x] 2.4 Implement the approved dirty-worktree path with a unique `git stash push --include-untracked` label, branch creation from updated `main`, exact stash restoration, and conflict detection.
- [x] 2.5 Define fail-safe handling for missing remotes, missing `main`, diverged history, existing commits, pull failures, stash conflicts, and user cancellation.

## 3. OpenSpec phase integration

- [x] 3.1 Integrate the existing explore, proposal, and apply skill rules without invoking slash commands as if they were executable subroutines.
- [x] 3.2 Detect active changes and OpenSpec task progress so reruns resume rather than recreate artifacts or repeat completed work.
- [x] 3.3 Add visible checkpoints and pause messages for clarification, proposal approval, implementation blockers, and phase completion.
- [x] 3.4 Keep archive and optional vault-link actions separate from the default PR delivery path.

## 4. Quality and security gates

- [x] 4.1 Add the CVE threat-model prompts to the explore checkpoint.
- [x] 4.2 Run proposal/design security-section validation before apply begins.
- [x] 4.3 Run the generalized full CVE audit before marking apply tasks complete and run the staged scan before commit.
- [x] 4.4 Discover applicable lint, typecheck, test, build, and project security commands from repository documentation and manifests.
- [x] 4.5 Record check results, skipped checks, warnings, and blocking findings and prevent delivery on failed required gates.
- [x] 4.6 Add a final clean-worktree and security/readiness check before PR creation.

## 5. Commit, push, and PR delivery

- [x] 5.1 Integrate commit grouping and message rules, stage only intended files, and preview the proposed commit metadata.
- [x] 5.2 Require explicit approval before committing and verify the commit contains the intended change.
- [x] 5.3 Push with `git push --set-upstream origin <branch>`, verify the upstream and remote branch, and stop on any push failure.
- [x] 5.4 Build the structured PR preview with title, summary, changes, file tree, commits, and notes using the existing PR conventions.
- [x] 5.5 Detect an existing PR, request approval for a new PR, create it with the current GitHub user assigned, and return its URL.

## 6. Verification and documentation

- [x] 6.1 Document the workflow, state transitions, branch naming, approval gates, and recovery paths.
- [x] 6.2 Test a clean new feature task from `main` through PR preview.
- [x] 6.3 Test a fix task and confirm `fix/<slug>` classification and branch naming.
- [x] 6.4 Test dirty worktrees with modified and untracked files, stash restoration, and a simulated stash conflict.
- [x] 6.5 Test existing unpushed commits, missing remotes, failed fast-forward pulls, branch collisions, and resume behavior.
- [x] 6.6 Validate skill discovery and run the repository's lint, typecheck, and available tests for the workflow artifacts.

## Related

- [[proposal|Proposal]]
- [[design|Design]]
- [[specs/branch-preflight/spec|branch-preflight]]
- [[specs/task-delivery/spec|task-delivery]]
- [[specs/task-orchestration/spec|task-orchestration]]
- [[specs/task-quality-gates/spec|task-quality-gates]]

