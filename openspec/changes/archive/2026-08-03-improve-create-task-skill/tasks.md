## 1. Reorganize companion docs into references/

- [x] 1.1 Move `.agents/skills/create-task/task-workflow.md` to `.agents/skills/create-task/references/task-workflow.md`
- [x] 1.2 Move `.agents/skills/create-task/BLOCKER-CHECKLIST.md` to `.agents/skills/create-task/references/BLOCKER-CHECKLIST.md`
- [x] 1.3 Update internal path references in `SKILL.md` to point to `references/`
- [x] 1.4 Update the BLOCKER-CHECKLIST.md header reference to point to the new SKILL.md location

## 2. Add bin/ helper scripts

- [x] 2.1 Create `.agents/skills/create-task/bin/phase-status.mjs` — snapshot git + openspec + gh state as JSON (per agentskills.io "using scripts" patterns: --help, structured output, non-interactive, idempotent, meaningful exit codes)
- [x] 2.2 Create `.agents/skills/create-task/bin/slug-check.mjs` — validate `(type, slug)` and `--branch <name>` against §1.1–§1.2 rules
- [x] 2.3 Smoke-test both scripts: `node bin/slug-check.mjs --help`, `node bin/phase-status.mjs --help`, `node bin/slug-check.mjs feature csv-export`, `node bin/phase-status.mjs --phase openspec`

## 3. Scaffold evals/

- [x] 3.1 Create `.agents/skills/create-task/evals/evals.json` with 18 eval cases covering should-trigger (5), should-trigger near-miss (4), should-not-trigger (5), and expected-output (4) per agentskills.io "evaluating-skills" schema
- [x] 3.2 Verify `evals.json` is valid JSON and each case has `id`, `category`, `prompt`, and (where applicable) `expected_output` + `assertions`

## 4. Rewrite SKILL.md

- [x] 4.1 Tighten frontmatter description to 796 chars (front-loaded what+when, pushy about scope, named near-misses, nested-skill ownership)
- [x] 4.2 Add `compatibility` field declaring git, openspec CLI, gh CLI, Node.js 18+
- [x] 4.3 Bump `metadata.version` from 1.4 to 2.0
- [x] 4.4 Add `## When to load this skill` section with type-mapping table
- [x] 4.5 Add `## When NOT to load this skill` section naming the four near-misses
- [x] 4.6 Add `## What this skill produces` section
- [x] 4.7 Add `## How this skill is structured` progressive-disclosure index table
- [x] 4.8 Add `## Workflow at a glance` with the 11-phase pipeline diagram and progress checklist
- [x] 4.9 Add `## Gotchas` section with 11 enumerated non-obvious facts
- [x] 4.10 Add `## Available scripts` index table with exit-code conventions
- [x] 4.11 Add `## References` index pointing to `references/`, `evals/`

## 5. Verify

- [x] 5.1 Confirm `git status --porcelain` shows only the intended create-task files (plus the OpenSpec change in openspec/changes/)
- [x] 5.2 Confirm `node bin/phase-status.mjs --help` and `node bin/slug-check.mjs --help` both exit 0 with usage text
- [x] 5.3 Confirm `node bin/slug-check.mjs feature csv-export` exits 0 with valid JSON
- [x] 5.4 Confirm `node bin/slug-check.mjs --branch feat/csv-export` exits 0 with valid JSON
- [x] 5.5 Confirm `node bin/phase-status.mjs --phase git` exits 0 with a JSON snapshot of git state
- [x] 5.6 Confirm `python3 -c "import json; json.load(open('.agents/skills/create-task/evals/evals.json'))"` exits 0
- [x] 5.7 Confirm `openspec change validate improve-create-task-skill` reports `Change ... is valid`