# github-rules-as-code-runner Specification

## Purpose

The `github-rules-as-code-runner` is a Node.js CLI that applies GitHub rulesets + CODEOWNERS to opt-in repos from JSON manifests. It enforces the user's house style across `Personal/`, `portfolio/`, `mestrado-uff/`, and `github-rules-as-code/` itself, with `lazyFinances/` deliberately excluded. The runner is idempotent (diff-based), uses the `gh` CLI for auth, and runs locally or in GitHub Actions.

## Requirements

### Requirement: Manifest-driven opt-in

The runner SHALL list governed repos from `rules/manifests/<name>.json` files. A repo is governed iff its filename appears in that directory. The default ruleset SHALL be `rules/defaults/personal-default.json` and SHALL be referenced by name from each manifest.

#### Scenario: New repo is governed
- **WHEN** a user adds `rules/manifests/portfolio.json` with `{"repo": "saamanthacosta/portfolio", "default": "personal-default", "codeowners": ["@saamanthacosta"]}`
- **THEN** the next `npm run plan` includes `saamanthacosta/portfolio` in the diff

#### Scenario: Repo is excluded by absence
- **WHEN** a user runs `npm run plan` and `rules/manifests/lazyFinances.json` does not exist
- **THEN** the runner does not include `lazyFinances/` in the diff

### Requirement: Idempotent plan and apply

The runner SHALL compute a structural diff between the desired state (manifest + default) and the current state (fetched from GitHub) and SHALL apply only the diff. Re-running `plan` or `apply` with no manifest changes SHALL produce an empty diff.

#### Scenario: Empty diff on second run
- **WHEN** the runner has applied a manifest and the user runs `npm run plan` again
- **THEN** the diff is empty (no `create_ruleset`, no `write_codeowners`)

#### Scenario: Diff computed on first run
- **WHEN** a fresh repo has no rulesets and no `.github/CODEOWNERS`
- **THEN** the plan emits exactly two operations: `create_ruleset` and `write_codeowners`

### Requirement: Explicit deletion via --prune

The runner SHALL NOT delete remote rulesets when a manifest is removed unless the user passes `--prune`. This is the safety guarantee against accidental opt-out.

#### Scenario: Removal without --prune is a no-op
- **WHEN** the user removes `rules/manifests/X.json` and runs `npm run apply`
- **THEN** the runner does not delete `X`'s remote ruleset

#### Scenario: Removal with --prune deletes
- **WHEN** the user removes `rules/manifests/X.json` and runs `npm run apply --prune`
- **THEN** the runner deletes `X`'s remote ruleset

### Requirement: CODEOWNERS generated alongside rulesets

The runner SHALL write `.github/CODEOWNERS` in the same `apply` pass as the ruleset so that required-reviewer rules have data to enforce. The file SHALL be `* <owner-handles>` with one entry per manifest `codeowners` element.

#### Scenario: CODEOWNERS applied
- **WHEN** a manifest has `"codeowners": ["@saamanthacosta"]`
- **THEN** the runner writes `* @saamanthacosta\n` to the repo's `.github/CODEOWNERS`

### Requirement: gh CLI for auth

The runner SHALL use `gh api` for all REST calls so that authentication is handled by the `gh` CLI. The runner SHALL NOT embed tokens, read `.env` files, or call `curl` directly.

#### Scenario: Local use reuses gh auth
- **WHEN** the user runs `npm run apply` locally with `gh auth status` showing an authenticated session
- **THEN** the runner makes authenticated requests without prompting for a token

#### Scenario: CI uses GITHUB_TOKEN
- **WHEN** the runner executes in a GitHub Actions workflow
- **THEN** it uses the workflow's `GITHUB_TOKEN` automatically via `gh api`

### Requirement: Schema validation

The runner SHALL validate every manifest and default against a zod schema at load time. Invalid payloads SHALL fail the runner with a non-zero exit before any REST call.

#### Scenario: Malformed manifest fails fast
- **WHEN** a manifest is missing the `codeowners` field
- **THEN** the loader throws a zod error and the runner exits non-zero

### Requirement: CI plan and apply

The repository SHALL include three GitHub Actions workflows: `plan.yml` runs on PRs and posts a diff, `apply.yml` runs on push to main and mutates state, `lint.yml` runs on push and PR.

#### Scenario: PR triggers plan
- **WHEN** a PR is opened against `main`
- **THEN** the `plan` workflow runs and exits 0 (no mutations)

#### Scenario: Push to main triggers apply
- **WHEN** commits are pushed to `main`
- **THEN** the `apply` workflow runs and may mutate downstream repos

#### Scenario: Apply permissions are scoped
- **WHEN** the `apply` workflow runs
- **THEN** the workflow-level permissions are `contents: read` and the apply job upgrades to `contents: write` only on the apply step

### Requirement: Skill available from any project

The repository SHALL expose an `apply-github-ruleset` skill at `Personal/.agents/skills/apply-github-ruleset/SKILL.md` (shared) and mirror it at `github-rules-as-code/.agents/skills/apply-github-ruleset/SKILL.md` (repo-local). The mirror SHALL be regenerable via `npm run sync-skills`.

#### Scenario: Shared skill is canonical
- **WHEN** an AI agent searches the workspace for `apply-github-ruleset`
- **THEN** the canonical definition is found under `Personal/.agents/skills/apply-github-ruleset/SKILL.md`

#### Scenario: Mirror is regenerable
- **WHEN** the user runs `npm run sync-skills` in the runner repo
- **THEN** the repo-local mirror is overwritten with the canonical content
