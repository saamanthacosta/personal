---
tags:
  - change/create-task-workflow
  - status/archived
  - capability/branch-preflight
  - capability/task-delivery
  - capability/task-orchestration
  - capability/task-quality-gates
---

## Why

Implementation work currently depends on manually remembering several separate OpenSpec, Git, security, and PR steps. That makes it easy to begin on a stale or incorrect branch, skip the CVE methodology, or create a PR before the worktree and verification state are safe. A single resumable `create-task` workflow will make the agreed process the normal path for features, fixes, refactors, and other implemented work.

## What Changes

- Add a reusable `create-task` skill under `.agents/skills/` as the canonical task-to-PR orchestrator.
- Classify each request as feature, fix, refactor, chore, docs, test, performance, or another explicit task type and derive a kebab-case slug.
- Require a new-task preflight before exploration or file changes: resolve the target Git repository, inspect the worktree, protect existing changes, switch/checkout `main`, pull with fast-forward-only behavior, and create a type-appropriate branch such as `feat/<slug>`.
- Preserve dirty worktrees and existing branches through explicit user decisions; never silently discard commits or changes.
- Sequence the task through exploration, proposal, application, project verification, commit, upstream push, and PR creation with resumable checkpoints.
- Thread the CVE methodology through exploration, proposal, apply, staged-commit, and pre-PR checks.
- Detect and run the repository’s available lint, typecheck, test, build, and security commands rather than assuming one package manager or framework.
- Reuse the existing commit and PR conventions, including short titles, structured descriptions, clean-worktree checks, and explicit upstream verification.
- Stop and ask for approval before branch switching with stashes, committing, pushing, or opening a PR.
- Keep archive and vault-link lifecycle actions separate unless the user explicitly requests them.

## Capabilities

### New Capabilities

- `task-orchestration`: Classifies a request and drives a resumable explore-to-PR lifecycle.
- `branch-preflight`: Establishes a safe, up-to-date task branch from `main` before work begins.
- `task-quality-gates`: Runs project verification and the CVE methodology at each required workflow gate.
- `task-delivery`: Groups, commits, pushes, and opens a PR using the workspace Git conventions.

### Modified Capabilities

## Impact

- New `.agents/skills/create-task/SKILL.md` and associated workspace documentation.
- Integration with `openspec-explore`, `openspec-propose`, `openspec-apply-change`, `commit`, `create-pr`, and `cve-scan` skills.
- Git worktree state, branches, stashes, remotes, commits, and GitHub pull requests.
- No automatic changes to application code beyond the tasks explicitly selected by the user.
- Requires a target repository with a usable `main` branch and remote for the full push/PR path; gracefully stops or offers a commit-only path when those prerequisites are absent.

## Related

- [[design|Design]]
- [[tasks|Tasks]]
- [[specs/branch-preflight/spec|branch-preflight]]
- [[specs/task-delivery/spec|task-delivery]]
- [[specs/task-orchestration/spec|task-orchestration]]
- [[specs/task-quality-gates/spec|task-quality-gates]]

