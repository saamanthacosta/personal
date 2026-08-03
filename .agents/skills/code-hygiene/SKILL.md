---
name: code-hygiene
description: Greppable, high-signal code-hygiene scanner for debug leftovers, TODO markers, and silently-swallowed errors. Produces a single append-only report at docs/code-hygiene.md and integrates into create-task as a pre-archive quality gate. Use when reviewing code for low-cost cleanup, when adding a hygiene pre-commit hook, or when running create-task in a repo that wants hygiene findings persisted.
license: MIT
compatibility: Requires Node.js 18+ and Git on PATH; supports any repo with tracked text files; respects .gitignore and an optional .code-hygiene.json config.
metadata:
  author: personal-workspace
  version: "0.1"
---

# Code Hygiene

Greppable, high-signal code-hygiene scanner. Detects debug leftovers, TODO/FIXME markers, silently-swallowed errors, and similar low-cost cleanup patterns. Persists findings in a single append-only report (`docs/code-hygiene.md`) whose git history is the audit trail.

## When to load

- An operator wants to surface debug leftovers, TODO markers, or empty catch blocks in the working tree.
- `create-task` is running in a repo that wants hygiene findings persisted as a pre-archive gate.
- A pre-commit hook needs a fast, deterministic, exit-code-friendly scanner.
- A reviewer wants the diff of new hygiene findings since the last scan.

## When NOT to load

- The user wants deep semantic analysis (unused exports, dead code, AST-level checks) — defer to a dedicated AST tool, document the gap in design.
- The user wants duplication detection — false-positives badly on generated code; manual review remains the right path.
- The user wants security scanning (secrets, dangerous patterns) — that's `cve-scan`'s job, not this skill's.
- The repo has no tracked text files to scan (empty repo, no source).

## Gate behavior

| Invocation | Action |
| --- | --- |
| `--check` (default) | Read tracked files, diff against `docs/code-hygiene.md`, print new findings to stdout, exit 1 if any. Does not mutate the report. |
| `--apply` | Same as `--check`, then append new findings to the report and update YAML frontmatter. Exits 1 if any new. |
| `--bootstrap` | Create `docs/code-hygiene.md` with an empty Findings section if missing. Use once per repo. |
| `--json` | Emit machine-readable JSON `{ "new": [...], "stale": [...], "report_path": "..." }` instead of human-readable text. |
| `--severity <tier>` | Override gate severity: `info` (default), `warn`, `blocker`. Blocker exits 2. |
| `--patterns <name>` | Run only patterns matching `<name>` (substring match against pattern `id`). Repeatable. |
| `--exclude <glob>` | Exclude paths matching `<glob>` (added to the config-driven exclude list). Repeatable. |
| `--report <path>` | Override the report path (default `docs/code-hygiene.md`). |

Exit codes follow the `cve-scan` contract:

- `0` — no new findings (or all patterns matched at `info` severity with no other action requested)
- `1` — new findings exist (default severity is non-blocking; orchestrator records and proceeds)
- `2` — scanner error (malformed report, missing git, unparseable config)

## Patterns

Built-in patterns live in `patterns.json` next to this file. Each entry declares `id`, `regex` (ECMAScript source-regex form), `glob` (path filter, optional), `severity` (`info | warn | blocker`), and `message`. Default severity for new patterns is `warn`.

Default patterns (v1):

- `debug.console-log` — `console\.log\s*\(`
- `debug.console-warn-error` — `console\.(warn|error)\s*\(` (severity: `info`)
- `debug.breakpoint` — `\bdebugger\b`
- `debug.python-pdb` — `\b(pdb\.set_trace|binding\.pry|import\s+pdb|breakpoint\(\))`
- `debug.php-dd` — `\b(dd\(|var_dump\(|print_r\(|error_log\()\s*[^)]`
- `todo.marker` — `\b(TODO|FIXME|HACK|XXX)\b` (severity: `info`)
- `catch.empty` — `catch\s*(\([^)]*\))?\s*\{\s*\}`
- `catch.silent` — `catch\s*(\([^)]*\))?\s*\{\s*//\s*silently\s+swallow`

## Configuration

An optional `.code-hygiene.json` at the repo root declares:

```json
{
  "report": "docs/code-hygiene.md",
  "exclude": ["**/.app/**", "**/dist/**", "**/build/**", "**/node_modules/**", "**/.next/**", "**/.turbo/**", "**/coverage/**"],
  "patterns": {
    "debug.console-log": { "severity": "info" },
    "todo.marker": { "severity": "warn" }
  }
}
```

CLI flags (`--severity`, `--exclude`) override config; config overrides built-in defaults.

## Runner mechanics

The runner enumerates tracked files via `git ls-files -z --exclude-standard`, reads each as text, applies each pattern's regex, and computes a dedup key:

```
key = sha1(pattern.id || path:line || snippet_norm)
```

`snippet_norm` is the matched line with leading/trailing whitespace trimmed and internal whitespace runs collapsed to single spaces. Snippets in the report are truncated at 200 chars.

The report file is parsed once per run. The runner reads `## Findings` fenced entry blocks, extracts each entry's `key:` field, and builds a set of seen keys. New findings are those whose computed key is not in the set. Stale findings are report entries whose key no longer matches any current scan (file deleted, line moved, pattern changed). Stale entries are NOT auto-pruned; they remain in the report marked `stale: true` and the runner prints them when `--json` is set.

## Security considerations block

- **Data touched:** Source-text only. No secrets expected; no PII. Snippets truncated at 200 chars.
- **Trust boundaries crossed:** Local FS only. No network egress. Invokes `git ls-files` (hardcoded args).
- **Third-party trust:** None added. Node.js built-ins only (`node:fs`, `node:path`, `node:readline`, `node:child_process`).
- **Persistence layer:** `docs/code-hygiene.md` (tracked markdown file). Git history = audit trail. Idempotent append-only.
- **Privilege escalation surface:** None added. Inherits the user's git context.

Operators MUST review new findings before committing `docs/code-hygiene.md` and MUST redact any secret-looking strings (the pre-archive `cve-scan` `gitleaks` pass remains the authoritative secret detector; this skill does not duplicate that responsibility).

## Guardrails

- Never print matched secret values in clear form (snippet truncation enforces this).
- Never execute matched code; only echo truncated snippets into the report.
- Never auto-prune stale entries; operators decide.
- Never bypass `--check` as the default; `--apply` is explicit opt-in.
- Never hand-edit `docs/code-hygiene.md` in ways that break dedup keys (renaming fenced entry headers, removing `key:` fields). Re-run the runner with `--apply` instead.

## Gotchas

- **First run is noisy.** A mature repo may surface dozens of `console.log` findings. Operators can bootstrap the report (`--apply` once) to seed the seen-set, then re-run `--check` to confirm quiet state.
- **Greppable only.** No AST. Patterns match syntax, not semantics. A `console.log` inside a snapshot test or a generated file is still flagged — use `.code-hygiene.json` `exclude` globs to suppress.
- **Reformatting breaks dedup.** Moving a `console.log` to a different line changes its `path:line` and re-emits it as a new finding. The old entry stays in the report marked `stale`. Re-run with `--apply` to surface the move cleanly.
- **The runner does not see uncommitted work.** `git ls-files` only enumerates tracked files. Untracked scratch files (`git status` shows them) are not scanned. Use `git add` first if you want them included.
- **Severity overrides are per-pattern, not per-finding.** A specific `console.log` cannot be silenced without silencing all `console.log` matches. Use `.code-hygiene.json` exclude globs for path-based silencing.

## References

- `patterns.json` — built-in pattern catalog
- `evals/evals.json` — eval cases (description triggering + expected-output)
- `bin/scan.mjs` — runner implementation
- `docs/code-hygiene.md` — the single report file (created on first `--apply` or `--bootstrap`)
- `openspec/specs/task-quality-gates/spec.md` — gate contract
- `openspec/specs/agent-skill-library/spec.md` — library inventory
