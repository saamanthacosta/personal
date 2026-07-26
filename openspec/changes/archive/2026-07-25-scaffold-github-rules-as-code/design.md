## Context

This is a greenfield sub-project under `Personal/`. The sub-project will live as its own git repo (root `.gitignore` will exclude it). The apply workflow is invoked locally via `gh` CLI (`plan`/`apply`) and in CI via GitHub Actions using `GITHUB_TOKEN`. The runner is diff-based: it reads the current rulesets and CODEOWNERS from the GitHub API, compares to the desired state derived from the manifest + defaults, and applies only the delta. There is no remote state file; GitHub itself is the source of truth.

## Decisions

### D1. Node.js + `gh` CLI over Terraform

Originally considered Terraform 1.13+, but the user wants no paid infrastructure. The `gh` CLI is already installed, supports `gh api` for arbitrary REST calls, and authenticates locally via `gh auth status` and automatically in CI via `GITHUB_TOKEN`. This keeps the dep tree to zod/commander/pino and avoids any SaaS lock-in.

### D2. JSON manifests + zod schema

Plain JSON is the lowest-friction config format. A zod schema provides typed validation at load time, so a malformed manifest fails fast with a useful error instead of producing a half-applied state. The schema lives next to each manifest as `*.schema.json` so editors can validate inline.

### D3. Opt-in via manifest list

A repo is governed iff its filename appears under `rules/manifests/`. This is the simplest opt-in model — drop a file, you're in; delete it, you're out (subject to explicit `--prune`). `lazyFinances/` is intentionally absent because it is not the user's repo.

### D4. Two locations for the apply skill

The skill lives at `Personal/.agents/skills/apply-github-ruleset/` (shared, usable from any project that loads the workspace's skill library) and is mirrored at `github-rules-as-code/.agents/skills/apply-github-ruleset/` so the repo is self-contained for someone who clones it without the parent workspace. The two definitions stay in sync via an OpenSpec apply-change task that runs the sync script.

### D5. Idempotent diff-based apply

The runner queries GitHub for current rulesets and CODEOWNERS, builds the desired state from the manifest, computes a structural diff, and applies only the changes. This removes the need for a remote state file and makes the runner safe to re-run. Deletion requires an explicit `--prune` flag to prevent accidental removal when a manifest is moved.

### D6. Default ruleset: standard + tag protection + owner

The default ruleset is encoded in `rules/defaults/personal-default.json` and includes: PR review with `saamanthacosta` as required reviewer, CODEOWNERS auto-assignment, stale approval dismissal on push, required status checks, conversation resolution required, force-push blocked, branch deletion blocked, linear history required, and tag protection on `v*` tags. The defaults name a single owner/reviewer so the ruleset is concrete and reviewable.

### D7. CODEOWNERS generation alongside rulesets

GitHub's required-reviewer rule only fires when a `CODEOWNERS` file exists. The runner therefore generates `.github/CODEOWNERS` in the same `apply` pass, with `* @saamanthacosta` for each governed repo. This keeps the ruleset enforceable end-to-end.

### D8. CI permissions lock-down

The apply workflow declares `permissions: contents: read` at the top level and upgrades only the `apply` job to `permissions: contents: write, pull-requests: read` (we need write to create the CODEOWNERS file and to update rulesets via the API). Running `gh api` requests with the default `GITHUB_TOKEN` ensures audit-trailed access.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  github-rules-as-code/                                       │
│                                                              │
│  rules/                                                      │
│   ├─ defaults/personal-default.json   ← house style         │
│   └─ manifests/<repo>.json            ← opt-in list          │
│                                                              │
│  src/                                                        │
│   ├─ index.mjs                CLI: plan | apply             │
│   ├─ config/                                                 │
│   │   ├─ loader.mjs           merge manifests + defaults    │
│   │   └─ schema.mjs           zod schemas                   │
│   ├─ github/                                                 │
│   │   ├─ client.mjs           gh api wrapper                │
│   │   ├─ rulesets.mjs         ruleset CRUD                  │
│   │   └─ codeowners.mjs       CODEOWNERS PUT via Contents   │
│   ├─ commands/                                               │
│   │   ├─ plan.mjs             dry-run diff                  │
│   │   └─ apply.mjs            apply diff                    │
│   └─ utils/logger.mjs                                        │
│                                                              │
│  .github/workflows/                                          │
│   ├─ plan.yml                 on PR: node src plan          │
│   └─ apply.yml                on main: node src apply       │
│                                                              │
│  AGENTS.md                  AI rules & patterns             │
│  docs/                      docs/architecture.md, etc.      │
│  .agents/skills/apply-github-ruleset/  (mirrored copy)       │
└──────────────────────────────────────────────────────────────┘
```

## Security Considerations

- **Data classes**: only public repo metadata and locally-stored JSON manifests. No PII, no secrets, no proprietary data.
- **Trust boundaries**: local machine → `api.github.com` (HTTPS), CI runner → `api.github.com` (HTTPS), local script → user's filesystem. No external SaaS.
- **Dependencies**: `gh` CLI (official, already installed), `zod`, `commander`, `pino` (mature, well-known). All pinned via `package.json`.
- **Persistence**: configs are in the repo and version-controlled. No remote state file. GitHub itself is the source of truth. No secrets persisted in the repo (`GITHUB_TOKEN` is ephemeral and auto-scoped).
- **Auth/permissions**: the runner mutates branch protection, required reviewers, and CODEOWNERS — a clear privilege surface. Mitigations: diff-based apply (never blind PUT), `--prune` explicit flag for deletes, plan-only default in CI on PRs, `permissions:` block in workflow (`contents: read` global, `contents: write` only on `apply` job), CODEOWNERS rule on the runner repo itself so a malicious manifest requires review by `saamanthacosta`.
- **Specialist handoff**: `openspec-apply-change` drives the apply phase; `openspec-archive-change` handles archival; `openspec-vault-link` wires MOC; `cve-scan` runs at all gates; `commit` and `create-pr` deliver the final PR. Each is loaded as a bounded phase and returns control.

## Overrides

None requested.
