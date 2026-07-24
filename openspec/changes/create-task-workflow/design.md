## Context

The workspace has separate skills for exploration, OpenSpec proposal/apply, commits, pull requests, and CVE scanning. Those skills define useful phase behavior but do not provide one reliable entry point for a new feature, fix, refactor, or other implementation task. The workflow also spans multiple Git repositories and must establish a branch from an up-to-date `main` before any task exploration or file edits.

The orchestrator is instruction-driven rather than a shell macro: OpenCode skills and slash commands are prompts, so the workflow must explicitly apply the existing phase rules and persist progress through OpenSpec artifacts and Git state. Destructive Git and GitHub actions require user approval and must fail safely.

## Goals / Non-Goals

**Goals:**

- Provide one `create-task` skill for all implementation task types.
- Classify the request and confirm a slug before changing repository state.
- Establish a safe branch from `main` before exploration, proposal, or implementation.
- Handle dirty worktrees, unpushed commits, stash restoration, branch collisions, missing remotes, and resume scenarios explicitly.
- Run OpenSpec, CVE, project verification, commit, push, and PR phases in a resumable order.
- Require approval at destructive boundaries and stop on conflicts or failed gates.

**Non-Goals:**

- Replacing the existing phase skills or duplicating their detailed artifact rules unnecessarily.
- Automatically archiving an OpenSpec change after opening a PR.
- Force-pushing, resetting, deleting branches, or resolving conflicts autonomously.
- Assuming a particular language, package manager, test runner, remote provider, or repository layout.
- Treating a natural-language skill as an atomic transaction across Git and GitHub.

## Decisions

### A single orchestrator skill, with typed branch mapping

`create-task` is the canonical entry point. It classifies requests into types such as `feature`, `fix`, `refactor`, `chore`, `docs`, `test`, and `perf`; type controls branch prefix and workflow metadata, not separate implementations. The default feature branch is `feat/<slug>`, with equivalents such as `fix/<slug>`.

Alternative: separate `add-feature`, `fix-issue`, and `refactor` skills. Rejected because lifecycle and safety behavior would drift across near-identical workflows.

### Preflight precedes all task work

For a new task, the workflow confirms the target repository and slug, then performs repository preflight before entering explore mode. It reads branch/status/history, asks how to preserve dirty work, switches to `main`, pulls with `--ff-only`, and creates the new branch. If the request is ambiguous, clarification happens before any repository mutation.

Alternative: explore first and branch after apply. Rejected because proposals and implementation edits then require late stash migration and can accidentally include unrelated changes.

### Resume is explicit and separate from new-task flow

If an active OpenSpec change or matching task branch already exists, the workflow detects it and offers resume rather than forcing a switch to `main`. A new task always follows the main-branch preflight. Existing commits ahead of `main` are never hidden by a stash operation.

Alternative: always create a fresh branch. Rejected because it can strand legitimate in-progress work and make dependencies unclear.

### Stash is opt-in and recoverable

When uncommitted changes must be preserved, the workflow shows the status and asks for approval before using a unique, task-labeled stash including untracked files. It restores the exact stash after branch creation, verifies conflicts, and stops without dropping the stash if restoration is not clean. Unrelated dirty changes require the user to clean or explicitly classify them.

Alternative: run `git stash` silently. Rejected because it can capture secrets or unrelated work and makes recovery ambiguous.

### Phase state is resumable

The workflow maps to checkpoints: `preflight`, `explore`, `propose`, `apply`, `verify`, `commit`, `push`, and `pr`. OpenSpec status, task checkboxes, branch state, and clean-worktree checks determine where a rerun resumes. Each phase ends with a visible result and a pause point when approval or clarification is needed.

### Quality gates are additive and repository-aware

The workflow applies the CVE methodology at explore, proposal, apply, staged commit, and pre-PR checkpoints. It also discovers the repository's documented lint, typecheck, test, build, and security commands, runs applicable checks, and reports unavailable checks instead of inventing commands. CRITICAL and unoverridden HIGH security findings block progression.

### Delivery uses explicit Git and GitHub operations

The commit and PR skills remain the source of formatting and description rules. The workflow uses an explicit successful `git push --set-upstream origin <branch>` rather than relying on an optional `gpsup` alias, verifies the upstream and clean state, previews commit/PR metadata, and asks before committing, pushing, or creating the PR.

Alternative: invoke `gpsup` unconditionally or mask push failures. Rejected because the alias is not portable and a failed push must never be followed by a misleading PR attempt.

### Archive remains separate

Opening a PR does not archive the OpenSpec change. Vault linking may run when the existing apply/archive policy requires it, but archive is a deliberate lifecycle action outside the shipping pipeline.

## Risks / Trade-offs

- **Preflight interrupts work on a dirty branch** → Show a complete status summary, offer explicit stash/continue/abort choices, and never auto-reset.
- **Pull from `main` fails or diverges** → Use `--ff-only`, stop with recovery guidance, and do not merge or rebase automatically.
- **Branch slug changes after exploration** → Confirm the type and slug before preflight; allow an explicit rename only before implementation starts.
- **Project checks differ across repositories** → Read project docs and package manifests, use declared scripts, and record skipped checks.
- **CVE tooling is unavailable** → Apply methodology fallback behavior, distinguish warnings from blocking findings, and surface missing coverage before delivery.
- **A rerun repeats a destructive action** → Inspect Git/OpenSpec state before each phase and make completed phases idempotent.
- **PR creation succeeds but archive is forgotten** → Report archive as a separate follow-up without performing it implicitly.

## Migration Plan

1. Add the `create-task` skill under `.agents/skills/` and document task-type-to-branch mappings.
2. Encode the preflight decision tree and approval gates using the existing Git conventions.
3. Integrate existing OpenSpec, CVE, commit, and PR skills without duplicating their canonical rules.
4. Add repository-aware verification discovery and a resumable phase/status display.
5. Test the workflow in a clean repository, a dirty repository with untracked files, a branch with unpushed commits, a failed pull, a stash conflict, and a missing remote.
6. Test a representative feature and fix flow through branch creation, OpenSpec, security checks, commit, push, and PR preview.
7. Roll back by removing the orchestrator skill and returning to the existing phase-by-phase commands; no application data migration is required.

## Open Questions

- When invoked from the `Personal/` workspace root, should the workflow require the user to select a child repository or require invocation from the target repository root?
- Should trivial documentation-only changes bypass OpenSpec while retaining branch and verification gates?
- Should a global command alias be added later, or is natural-language loading of the `.agents/skills/create-task/` skill sufficient?
