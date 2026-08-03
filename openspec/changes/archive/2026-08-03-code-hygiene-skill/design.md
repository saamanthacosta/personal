## Context

The `cve-scan` skill covers security hygiene: secrets, dangerous patterns, dependency vulnerabilities. There is no equivalent for low-cost code cleanup: debug leftovers (`console.log`, `debugger`, `binding.pry`), TODO/FIXME/HACK markers, empty catch blocks, and similar patterns that accumulate during development. The user evaluated Fallow for this purpose but found its scope too aggressive for the workspace — false-positives on `.app` bundles, generated code, and mixed-language monorepos outweighed its signal.

This change introduces a focused alternative: greppable, high-signal patterns only; single tracked report file; append-only with deterministic dedup keys; git history as audit trail. The runner is intentionally simple — no AST, no language-aware analysis, no transitive dependency analysis — so it stays fast, predictable, and easy to extend by adding entries to `patterns.json`.

The runner is also wired into the `create-task` orchestrator as a pre-archive quality gate. The wiring lands in a separate commit within this PR so reviewers can see (a) the contract change documented in `task-quality-gates/spec.md` and (b) the orchestrator code change that satisfies it, as distinct units of work.

**Conformance findings during explore:**

- The workspace's `skill-doc-organization/spec.md` Requirement 2 mandates that helper scripts live under `.agents/skills/<skill-name>/bin/`. The runner conforms.
- The workspace's `skill-authoring/spec.md` requires valid YAML frontmatter, kebab-case folder name, and trigger-oriented description. The skill conforms.
- The workspace's `task-quality-gates/spec.md` does not currently mention `code-hygiene`. The change adds a new Requirement covering the gate contract; delta spec under `specs/task-quality-gates/spec.md`.

## Goals / Non-Goals

**Goals:**

- Make mechanical hygiene checks first-class artifacts in the repo, persisted in `docs/code-hygiene.md` with deterministic dedup so re-runs are idempotent.
- Give operators a single command (`node .agents/skills/code-hygiene/bin/scan.mjs --check`) that surfaces new findings to stdout without mutating state, plus `--apply` for committing them to the report.
- Wire `code-hygiene` into `create-task` as a pre-archive gate between `pre-commit-review` and the pre-archive `cve-report`, with skip-at-run-time support and exit-code semantics consistent with `cve-scan` (0 = clean, 1 = new findings, 2 = scanner error).
- Document the gate contract in `task-quality-gates/spec.md` so the orchestrator's behaviour is observable from the spec, not just from code.

**Non-Goals:**

- AST-based analysis (unused exports, dead code, dead branches). Deferred — the user explicitly noted Fallow's AST coverage false-positives badly on the workspace's mixed-language and `.app` structures.
- Dependency-graph analysis (unused deps, duplicate deps). Covered by `cve-scan`'s `scan-deps.mjs` already.
- Duplication detection. Most dedup tools false-positive on generated code; manual review remains the right path.
- Auto-fixing findings. The runner reports only; the operator decides whether to commit, ignore, or fix.
- Cross-repo aggregation. The runner operates on the current working tree only.
- Replacing `cve-scan`. The two skills are complementary; `cve-scan` owns security and dependency hygiene, `code-hygiene` owns cleanup hygiene.

## Decisions

### Decision 1: Greppable patterns only in v1

**Choice:** All patterns are regex-on-source-text. No AST, no language servers, no LSP.

**Rationale:** Greppable patterns run in seconds on large repos, produce stable dedup keys (path:line + matched-text hash), and never false-positive on syntactically-invalid input. AST tooling buys deeper coverage at the cost of brittleness and slow runs — both wrong for a "scan before commit" gate.

**Alternatives considered:**
- Tree-sitter-based AST scanner — rejected, adds a native dependency and false-positives on generated code.
- Language-server integration — rejected, requires per-language setup and is overkill for cleanup hygiene.
- ESLint/Clippy/etc. — rejected, language-specific and inconsistent across the workspace's mixed-language repo set.

### Decision 2: Single tracked report file (`docs/code-hygiene.md`)

**Choice:** All findings live in one markdown file with YAML frontmatter, fenced entry blocks, and stable dedup keys. Git diff on the report is the audit trail.

**Rationale:** A single file is grep-friendly, review-friendly in PRs, and append-only without a DB. The user explicitly preferred this over "one report per PR" because the git history of the file is already a chronological log — no extra index or aggregation layer needed.

**Alternatives considered:**
- One report per PR — rejected, the user noted this would produce report sprawl.
- JSON file with a separate index — rejected, harder to review in a PR; markdown is more diff-friendly.
- Per-pattern separate files — rejected, splits the audit trail and forces the operator to read N files.

### Decision 3: Deterministic dedup keys (`sha1(pattern | path:line | snippet_norm)`)

**Choice:** Each finding's dedup key is the SHA-1 of `pattern-id || path:line || normalised-snippet`. Snippets are normalised by trimming whitespace and collapsing internal whitespace runs.

**Rationale:** Deterministic keys make re-runs idempotent. Reformatting a file changes `path:line` but not the snippet norm, so a moved finding still dedups correctly. Renaming a file breaks dedup (line numbers change); that's acceptable — the old entry stays in the report marked `stale`, the new entry appears under the new path. Operators can prune stale entries with a future `--prune-stale` flag (deferred).

**Alternatives considered:**
- Path-only keys — rejected, two findings in the same file would collapse.
- Snippet-only keys — rejected, identical snippets in different files would collapse.
- UUIDs assigned at first-seen — rejected, defeats idempotency on re-runs.

### Decision 4: `--check` is the default; `--apply` mutates

**Choice:** `node bin/scan.mjs` (no flags) runs in `--check` mode: prints new findings to stdout, exits 1 if any, never writes to the report. `--apply` runs the same scan and appends new findings to the report, exiting 1 if any new (so the operator must `git add docs/code-hygiene.md` and commit themselves).

**Rationale:** Defaulting to read-only prevents accidental report corruption. The orchestrator invokes `--check`; the operator invokes `--apply` after reviewing stdout. Both modes exit non-zero on new findings so they can gate commits in either interactive or automated contexts.

**Alternatives considered:**
- `--apply` as default — rejected, defaulting to a write is dangerous for a scanner.
- Separate `update` script — rejected, two scripts is more surface area than one with two modes.

### Decision 5: Severity tiers (info | warn | blocker)

**Choice:** Each pattern declares a severity. `info` exits 0, `warn` exits 1, `blocker` exits 2. The orchestrator only treats `blocker` as a hard gate (matching `cve-scan` exit-code semantics).

**Rationale:** Most findings are informational. Letting the operator choose which severities gate their commit (via `--severity <tier>` or `.code-hygiene.json` overrides) avoids the all-or-nothing trap that made Fallow too noisy. The default `warn` tier catches the common cases (`console.log`, `TODO`, etc.) without blocking.

### Decision 6: `.code-hygiene.json` workspace config (optional)

**Choice:** Operators can drop a `.code-hygiene.json` at the repo root with `exclude` globs and per-pattern severity overrides. No config = built-in defaults (severity from `patterns.json`, excludes from `git ls-files` standard ignore set).

**Rationale:** Matches the `cve-scan` pattern (`cve-scan.config.json`). The workspace already has many `.app/`, `dist/`, `build/` directories that should never be scanned; an opt-in exclude list keeps the runner quiet by default but allows per-repo tuning without code changes.

### Decision 7: Gate placement — between `pre-commit-review` and pre-archive `cve-report`

**Choice:** The `create-task` orchestrator invokes `code-hygiene` after `pre-commit-review` passes (no blockers) and before the pre-archive `cve-report`. The gate is `info`-severity by default in the orchestrator's invocation (operator can override via `--severity=warn` per-run).

**Rationale:** Placing the gate after `pre-commit-review` means the operator has already accepted the design and is past the loop-back point. Placing it before the pre-archive `cve-report` means hygiene findings are visible in the same context as CVE findings — and can be fixed in the same pass without a separate loop-back. The orchestrator's existing `pre-commit-review` skip-on-blocker logic (§3.4) handles the case where `pre-commit-review` already produced a blocker — the code-hygiene gate does not run on that pass, matching the existing pattern.

### Decision 8: Two-commit structure within this PR

**Choice:** Commit 1 introduces the skill, the report, the OpenSpec change, both delta specs, the archive move, and both canonical spec syncs. Commit 2 wires `create-task` to call the new gate.

**Rationale:** Contract-first landing. Commit 1 documents the new gate contract in `task-quality-gates/spec.md`; commit 2 implements the orchestrator code that satisfies it. Reviewers can see the spec change and the implementation change as separate units. The intermediate state between commits has the spec ahead of the implementation, which is acceptable for contract-first development and visible only on `git log` between commits (the merged PR state satisfies both).

## Risks / Trade-offs

- **Risk:** Greppable patterns miss real issues that AST tooling would catch (e.g., dead code, unused exports). → **Mitigation:** Documented as out-of-scope in proposal.md; v2 may add AST layers behind a feature flag without changing the report format.
- **Risk:** The report file grows unboundedly over time. → **Mitigation:** Each entry has a `status` (`open | ignored | fixed`). Operators can prune `fixed` entries via a future `--prune-fixed` flag (deferred). The file is plain markdown; manual editing is supported but discouraged.
- **Risk:** False positives on generated code (e.g., a `console.log` inside a snapshot test). → **Mitigation:** `.code-hygiene.json` supports path excludes; the runner respects `.gitignore` automatically.
- **Risk:** The orchestrator gate produces noise that operators ignore. → **Mitigation:** Default severity is `warn` (advisory, not blocking); operators can escalate per-pattern via config.
- **Risk:** Commit 2 changes the orchestrator behaviour — if it breaks, the next `create-task` run fails. → **Mitigation:** The change is additive (a new invocation in the workflow); no existing phase is removed or reordered. The pre-archive `cve-report` still runs the same way. CI catches orchestrator regressions via the existing test suite.
- **Risk:** `docs/code-hygiene.md` accumulates secrets if a `console.log` includes one. → **Mitigation:** Snippet truncation (200 chars), explicit SKILL.md warning, and the pre-archive `cve-scan` `gitleaks` pass remains authoritative.

## Migration Plan

- The runner is purely additive — no migration of existing findings, no breaking change to existing scanners.
- Existing repos that don't have `docs/code-hygiene.md` get one created on the first run (with a `--bootstrap` flag, default off; manual first run recommended).
- The orchestrator's gate is non-blocking by default (severity = `info`); operators can opt into a blocking gate via `.code-hygiene.json` overrides.
- The two-commit structure is internal to this PR; the merged state has both commits and the spec satisfied.

## Open Questions

- Should `--bootstrap` create the report with a `## Bootstrap` section that lists "0 findings at first run" so operators see the file exists? **Resolved:** Yes, included in v1.
- Should the orchestrator invoke the gate with `--severity=warn` (advisory) by default, or `--severity=blocker` (hard gate)? **Resolved:** `--severity=warn`, matching the user's preference for non-blocking cleanup signals.
- Should the gate have a `--severity=<tier>` CLI flag and/or read it from `.code-hygiene.json`? **Resolved:** Both. CLI overrides config; config overrides built-in defaults.

## Security Considerations

### Threat model

- **Data classes:** Source-text only (file paths + matched snippets). No secrets expected; no PII expected. Tracked output in `docs/code-hygiene.md`.
- **Trust boundaries:** Local FS only. No network egress. No external CLIs beyond `git ls-files`.
- **Third parties:** None new. Node.js built-ins only.
- **Persistence:** `docs/code-hygiene.md` (tracked markdown file). Git history = audit trail. Idempotent append-only.
- **Privilege surfaces:** None added. Inherits the user's git context.

### Pre-archive scanner findings and overrides

The pre-archive audit will be run in the `cve-report` phase of this workflow. Anticipated findings and mitigations:

- **`bin/scan.mjs` imports `node:child_process`** — The runner uses `spawnSync` with array arguments (no shell interpolation) and invokes only `git ls-files` with hardcoded args. Matches the `cve-scan` pattern. Mitigation documented in `code-hygiene/SKILL.md` § Gotchas.
- **`docs/code-hygiene.md` may contain secret-looking snippets** — Mitigated by snippet truncation (200 chars), explicit SKILL.md warning, and the pre-archive `cve-scan` `gitleaks` pass. Override acceptable because secrets are not the runner's responsibility.
- **`proposal.md` and `design.md` lack `## Security Considerations`** — Sections present in both files (this section in `design.md`; equivalent in `proposal.md`).

### Summary

- 1 anticipated HIGH finding (process-spawning review) handled by `execFile`-style API choice + hardcoded args + SKILL.md documentation. Override requested.
- 1 anticipated HIGH finding (secret-in-report) handled by truncation + warning + existing CVE scan. Override requested.
- 0 anticipated CRITICAL findings.

No residual risk requiring new mitigations.

### Pre-archive scanner findings — actual run on 2026-08-03

The pre-archive audit (`docs/cve-reports/2026-08-03-pre-archive-code-hygiene-skill.md`) reported 4 HIGH findings, all from the `pattern:child-process` rule. Each is addressed below.

**Finding 1 — `.agents/skills/code-hygiene/bin/scan.mjs:14` (introduced by this change)**

- **Mitigation:** The script imports `node:child_process` and uses `spawnSync('git', ['ls-files', '-z', '--exclude-standard'], { cwd, encoding, maxBuffer })` exclusively. The arguments are a hardcoded array; no argument is derived from user input, environment variables, or external files. `cwd` is the repository root, not user-controlled. `shell: false` is the default for `spawnSync`, so no shell interpolation occurs. The pattern matches the safe `cve-scan/bin/full-audit.mjs` precedent.
- **Override rationale:** The scanner flags any `node:child_process` import as a precaution. In this case, the precaution is satisfied by (a) `spawnSync` API choice (no shell), (b) hardcoded argument arrays, (c) no external inputs reaching the spawned process. Override applied per cve-methodology.md "HIGH findings may be accepted only when design.md identifies the exact finding and provides mitigation and rationale."
- **Residual risk:** None.

**Finding 2 — `.agents/skills/create-task/bin/phase-status.mjs:25` (pre-existing)**

- **Status:** Out of scope for this change. This file was introduced by an earlier archived change (`2026-08-03-improve-create-task-skill`). The pre-archive scanner audits the complete working tree, so it surfaces pre-existing findings alongside change-specific ones.
- **Mitigation / override:** No action required for this change. If the finding warrants attention, it should be addressed in a separate change scoped to `create-task/`.

**Finding 3 — `.agents/skills/skill-sessions/tests/format-sessions.test.mjs:11` (pre-existing)**

- **Status:** Out of scope for this change. Pre-existing test file, not modified here.
- **Mitigation / override:** No action required. Future change may address.

**Finding 4 — `.agents/skills/skill-sessions/tests/render.test.mjs:8` (pre-existing)**

- **Status:** Out of scope for this change. Pre-existing test file, not modified here.
- **Mitigation / override:** No action required. Future change may address.

### Summary (final)

- 1 finding (Finding 1, this change's `scan.mjs`) overridden with documented mitigation.
- 3 findings (Findings 2-4) pre-existing, out of scope.
- 0 CRITICAL findings.
- 0 unoverridden HIGH findings (after override).

No residual risk requiring new mitigations.
