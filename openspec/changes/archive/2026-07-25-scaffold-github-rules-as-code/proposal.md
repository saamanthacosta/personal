## Why

Today, repository rules (branch protection, required reviewers, CODEOWNERS, tag protection) are configured manually on each repo through Settings UI. This drifts — `lazyFinances`, `portfolio`, `mestrado-uff`, and the root `Personal/` repo already have inconsistent protection, and adding a new repo means remembering the rules again. As a personal operator with several repos, we want a single source of truth that applies our house style with one command, and that we can extend to future repos via a shared skill.

## What Changes

- Scaffold a new sub-project `Personal/github-rules-as-code/` that manages GitHub rulesets + CODEOWNERS for opt-in repos via Node.js + the `gh` CLI.
- Ship a house-default ruleset encoding the user's required reviewer (`saamanthacosta`), tag protection, conversation resolution, linear history, and stale-approval dismissal.
- Generate `.github/CODEOWNERS` for each opt-in repo from the same manifest so the required-reviewer rule has data to enforce against.
- Add manifest-driven opt-in/opt-out: a repo is governed only if its manifest appears under `rules/manifests/`. `lazyFinances/` is intentionally not listed.
- Wire a GitHub Actions workflow for `plan` (PR) and `apply` (main) using the ephemeral `GITHUB_TOKEN` only.
- Register the new sub-project in `personal.code-workspace` and add it to the root `.gitignore` so it stays a separate git repo while remaining visible to the workspace.
- Add a reusable AI skill `apply-github-ruleset` under both `Personal/.agents/skills/` and inside the new repo, so any future project can invoke the runner.

## Capabilities

### New Capabilities
- `github-rules-as-code-runner`: Manifest-driven GitHub ruleset + CODEOWNERS application for opt-in repos, with plan/apply commands, idempotent diff, and CI integration.

## Impact

Affected areas: the new sub-project directory (own git repo), root `.gitignore`, root `personal.code-workspace`, root `openspec/changes/` (this change), root `openspec/specs/` (delta spec), `Personal/.agents/skills/apply-github-ruleset/` (new shared skill). No existing repository workflow changes. No new third-party dependencies in the root repo; the new sub-project adds `zod`, `commander`, `pino` (pinning allowed via `package.json`).
