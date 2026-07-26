# Tasks for scaffold-github-rules-as-code

## 1. Bootstrap the new sub-project

- [ ] Create `github-rules-as-code/` directory under `Personal/`.
- [ ] Add `github-rules-as-code/` to root `.gitignore`.
- [ ] Add `github-rules-as-code` entry to `personal.code-workspace`.
- [ ] Write `AGENTS.md` capturing the AI rules and patterns for this repo.
- [ ] Write `README.md` describing the runner, manifests, and quick start.

## 2. Initialize the Node.js project

- [ ] Create `package.json` with ESM, scripts (`plan`, `apply`, `lint`), and pinned `zod`, `commander`, `pino` dependencies.
- [ ] Add `.nvmrc` pinning Node 20.
- [ ] Add `.gitignore` for the new repo (node_modules, .env, dist, .terraform.tfstate.lock.info).
- [ ] Add `.eslintrc.cjs` and `.prettierrc`.

## 3. Build the runner

- [ ] `src/config/schema.mjs` — zod schemas for manifests and defaults.
- [ ] `src/config/loader.mjs` — merge defaults + manifests, validate, return typed config.
- [ ] `src/github/client.mjs` — wrapper around `gh api` for ergonomic REST calls.
- [ ] `src/github/rulesets.mjs` — list, get, create, update, delete rulesets.
- [ ] `src/github/codeowners.mjs` — read and write `.github/CODEOWNERS` via Contents API.
- [ ] `src/github/diff.mjs` — compute desired vs current diff (rulesets + CODEOWNERS).
- [ ] `src/commands/plan.mjs` — log diff only, exit 0.
- [ ] `src/commands/apply.mjs` — apply diff; require `--prune` for deletes.
- [ ] `src/index.mjs` — `commander` CLI: `plan` and `apply`.
- [ ] `src/utils/logger.mjs` — `pino` structured logger.

## 4. Author the default ruleset

- [ ] `rules/defaults/personal-default.json` — default ruleset payload (review, required reviewer `saamanthacosta`, conversation resolution, linear history, stale approvals, force-push blocked, deletion blocked, tag protection on `v*`).
- [ ] `rules/defaults/personal-default.schema.json` — matching zod-derived JSON Schema.

## 5. Author the manifests

- [ ] `rules/manifests/personal.json` — applies to `Personal/`.
- [ ] `rules/manifests/portfolio.json` — applies to `portfolio/`.
- [ ] `rules/manifests/mestrado-uff.json` — applies to `mestrado-uff/`.
- [ ] `rules/manifests/github-rules-as-code.json` — applies to `github-rules-as-code/` (dogfooding).
- [ ] Each manifest references the default ruleset by name and may override per-repo fields.

## 6. Add CI workflows

- [ ] `.github/workflows/plan.yml` — on PR, runs `node src/index.mjs plan` and posts the diff as a PR comment.
- [ ] `.github/workflows/apply.yml` — on push to main, runs `node src/index.mjs apply` with `permissions: contents: write` only on the apply job.
- [ ] `.github/workflows/lint.yml` — on push, runs `eslint` and `prettier --check`.

## 7. Mirror the shared skill

- [ ] `Personal/.agents/skills/apply-github-ruleset/SKILL.md` — describes how to invoke the runner from any project that loads the workspace skill library.
- [ ] `github-rules-as-code/.agents/skills/apply-github-ruleset/SKILL.md` — same content, plus a sync script note.
- [ ] `github-rules-as-code/scripts/sync-skills.mjs` — copies the shared skill from the parent workspace into the repo-local copy.

## 8. Author docs (Obsidian-friendly)

- [ ] `docs/architecture.md` — system diagram, request flow, components.
- [ ] `docs/patterns.md` — manifest patterns, override conventions, prereq/release patterns.
- [ ] `docs/references.md` — links to GitHub docs, `gh` docs, zod docs.

## 9. Wire Obsidian MOC

- [ ] Add `[[github-rules-as-code/README]]` to `docs/INDEX.md` (or appropriate MOC) once the repo is published.
- [ ] Tag notes with `#integration/github-rules-as-code`.

## 10. Verification

- [ ] `npm run lint` passes.
- [ ] `node src/index.mjs plan --dry-run` exits 0 with empty diff (clean baseline).
- [ ] Plan output is human-readable and includes per-repo delta.

## 11. Archive

- [ ] Sync delta specs (`github-rules-as-code-runner`) into `openspec/specs/`.
- [ ] Move change to `openspec/changes/archive/2026-07-25-scaffold-github-rules-as-code/`.
- [ ] Run `openspec-vault-link` best-effort.

## 12. Security + delivery

- [ ] Run full-audit (`node .agents/skills/cve-scan/bin/full-audit.mjs`) — must be clean.
- [ ] Run staged scan — must be clean.
- [ ] Commit (per `commit` skill format).
- [ ] Push.
- [ ] Open PR (per `create-pr` skill format).
