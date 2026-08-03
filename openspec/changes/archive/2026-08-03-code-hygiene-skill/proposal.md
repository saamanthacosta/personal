## Why

The `cve-scan` skill owns security hygiene (secrets, dangerous patterns, dependencies) and runs as a pre-archive gate inside `create-task`. There is no equivalent for code hygiene — debug leftovers, TODO/FIXME markers, silently-swallowed errors. The user tried adopting Fallow but found its coverage too aggressive for monorepos with `.app` bundles. This change introduces a smaller, greppable, high-signal hygiene scanner that surfaces the easy wins without false-positive noise, persists findings in a single append-only report (`docs/code-hygiene.md`), and integrates into `create-task` as a pre-archive quality gate alongside CVE scanning.

The runner is greppable-only in v1 (no AST), operates entirely against the local working tree, and stores findings in a single tracked report file. Re-runs are idempotent via stable dedup keys. The git history of the report file is the audit trail — every commit that adds findings is a reviewable, attributable diff.

The change also wires the new skill into the `create-task` orchestrator as a quality gate between `pre-commit-review` and the pre-archive `cve-report`, formalising the contract in `task-quality-gates/spec.md` and adding the new skill to the approved `agent-skill-library/spec.md` inventory. The wiring lands in a second commit within this PR so reviewers can see the contract change and the implementation change separately.

## What Changes

**Commit 1 — scaffold the skill and archive the change:**

- Add `.agents/skills/code-hygiene/SKILL.md` — describes the runner, when to load, when NOT to load, gate semantics, gotchas, references.
- Add `.agents/skills/code-hygiene/bin/scan.mjs` — Node.js (stdlib only) runner with `--check` (default; prints new findings to stdout, exits 1 if any), `--apply` (appends new findings to the report, exits 1), `--report <path>` (override report path, default `docs/code-hygiene.md`), `--patterns <name>` (run subset), `--json` (machine-readable output), and `--exclude <glob>` (path exclusions, repeatable).
- Add `.agents/skills/code-hygiene/patterns.json` — built-in pattern catalog: debug leftovers, TODO/FIXME/HACK/XXX, empty catch blocks, debugger statements. Each entry declares `id`, `regex` (source-regex form), `glob` (path filter), `severity` (info|warn|blocker), `message`.
- Add `.agents/skills/code-hygiene/evals/evals.json` — eval cases for description triggering, near-miss triggers, and expected-output assertions.
- Add `.code-hygiene.json` (workspace config) — declares `exclude` globs (e.g., `**/.app/**`, `**/dist/**`, `**/build/**`, `**/node_modules/**`) and per-pattern severity overrides.
- Add `docs/code-hygiene.md` (seeded by the initial scan) — single tracked report with YAML frontmatter (schema version, generated_at, last_run_at, total_open), `## Findings` section containing one fenced block per finding (dedup key, pattern, file:line, snippet, first_seen, status).
- Add `openspec/changes/code-hygiene-skill/proposal.md`, `design.md`, `tasks.md`.
- Add `openspec/changes/code-hygiene-skill/specs/agent-skill-library/spec.md` — delta spec adding `code-hygiene` to the approved library inventory.
- Add `openspec/changes/code-hygiene-skill/specs/task-quality-gates/spec.md` — delta spec adding the `Code hygiene gate` requirement.
- Archive the change to `openspec/changes/archive/2026-08-03-code-hygiene-skill/` and synchronise both delta specs into their canonical `openspec/specs/<cap>/spec.md` counterparts.

**Commit 2 — wire `code-hygiene` into `create-task`:**

- Update `.agents/skills/create-task/SKILL.md` — add a `code-hygiene` quality gate to the workflow at a glance diagram and progress checklist, and reference the new skill in the Available scripts section.
- Update `.agents/skills/create-task/references/task-workflow.md` — add the `code-hygiene` gate mechanics to the `pre-commit-review` phase (or its successor phase once wired) so the orchestrator knows when to invoke `bin/scan.mjs --check` and how to interpret the exit code.

**Breaking changes:** None. The orchestrator's contract gains one new gate; existing callers see the same 11-phase pipeline plus the optional hygiene check (default behaviour: report-only, no commit block).

## Capabilities

### New Capabilities

None. The change extends existing capabilities only.

### Modified Capabilities

- `agent-skill-library`: Adds a `code-hygiene` requirement covering frontmatter validation, unique naming, and inclusion in the approved inventory. Delta spec required.
- `task-quality-gates`: Adds a `Code hygiene gate` requirement covering invocation timing, exit-code semantics, idempotent report updates, and skip-at-run-time behaviour. Delta spec required.

## Impact

**Affected files (commit 1):**

- `.agents/skills/code-hygiene/SKILL.md` — new (~140 lines)
- `.agents/skills/code-hygiene/bin/scan.mjs` — new (~220 lines)
- `.agents/skills/code-hygiene/patterns.json` — new (~80 lines)
- `.agents/skills/code-hygiene/evals/evals.json` — new (~80 lines)
- `.code-hygiene.json` — new (~30 lines)
- `docs/code-hygiene.md` — new (seeded with initial scan output)
- `openspec/changes/code-hygiene-skill/proposal.md`, `design.md`, `tasks.md` — new
- `openspec/changes/code-hygiene-skill/specs/agent-skill-library/spec.md` — delta
- `openspec/changes/code-hygiene-skill/specs/task-quality-gates/spec.md` — delta
- `openspec/changes/archive/2026-08-03-code-hygiene-skill/` — archive move of the change dir
- `openspec/specs/agent-skill-library/spec.md` — canonical sync (adds code-hygiene requirement)
- `openspec/specs/task-quality-gates/spec.md` — canonical sync (adds Code hygiene gate requirement)

**Affected files (commit 2):**

- `.agents/skills/create-task/SKILL.md` — updated (adds gate to workflow diagram + checklist + scripts index)
- `.agents/skills/create-task/references/task-workflow.md` — updated (adds code-hygiene gate mechanics to the appropriate phase)

**Affected systems / callers:**

- The `create-task` orchestrator — gains one quality-gate invocation after `pre-commit-review` and before the pre-archive `cve-report`.
- The OpenSpec archive workflow — both delta specs must sync at archive time; the change's archive move is standard.
- The Obsidian vault — best-effort `openspec-vault-link` enrichment during archive.

**Dependencies:** None added. The runner uses Node.js built-ins only (`node:fs`, `node:path`, `node:readline`, `node:child_process` for `git ls-files`).

**Compatibility:**

- Skill folder structure matches the workspace's `skill-doc-organization/spec.md` (scripts under `bin/`, references co-located, evals scaffolded).
- Runner requires Node.js 18+ (uses `node:` import prefix and `Array.flatMap`). Verified against the local `node` binary which is v24.6.0.
- The orchestrator requires git on PATH (used to enumerate tracked files); same dependency as existing skills.
- `docs/code-hygiene.md` is a new tracked file. Its frontmatter uses standard keys documented in `design.md`.

**Security (per §3.2 — required for `proposal.md`/`design.md`):**

- **Threat model summary:** The runner reads tracked text files from the local working tree and appends new findings to a single tracked markdown report. It does not transmit data off-host, does not store credentials, does not introduce new dependencies, and does not require elevated privileges. The orchestrator integration runs the same scanner as a read-only pre-archive check.
- **Affected data and trust boundaries:** Source-file text only. No network egress beyond what the existing pre-archive CVE scan already performs (`gitleaks` is optional). No new attack surface.
- **Mitigations:** The runner reads only `git ls-files` output (no symlink traversal, no path injection from user input — paths come from git). The runner does not execute matched code, only echoes truncated snippets into the report.
- **Residual risk:** A matched snippet may incidentally contain a secret value (e.g., a `console.log` that includes an API key). Mitigated by (a) snippet truncation (≤ 200 chars), (b) the SKILL.md warning "review new findings before commit; redact any secret-looking strings", and (c) the pre-archive CVE scan that already runs `gitleaks` over the working tree.

## Security Considerations

- **Threat model summary:** See "Security (per §3.2 — ...)" section above.
- **Affected data and trust boundaries:** None new. The runner is local-only; matched file paths and snippets live in `docs/code-hygiene.md` (a tracked file under the same git audit trail as every other tracked file in the repo).
- **Third parties:** None new. Node.js built-ins only.
- **Persistence:** Tracked markdown report (`docs/code-hygiene.md`) plus git history. Idempotent append-only; no DB, no remote storage, no caching layer.
- **Privilege surfaces:** None added. The runner inherits the user's git context (same as every other git-aware skill).
- **Requested overrides:** None at the proposal level. Overrides for individual HIGH findings identified by the pre-archive scanner are documented in `design.md` under `## Security Considerations`.
- **Secret-handling posture:** Matched snippets are truncated at 200 chars and echoed verbatim. Operators are warned in `SKILL.md` to redact secret-looking strings before committing the report. The pre-archive `cve-scan` `gitleaks` pass remains the authoritative secret detector; this skill does not duplicate that responsibility.

## History

- This change. Created 2026-08-03.
