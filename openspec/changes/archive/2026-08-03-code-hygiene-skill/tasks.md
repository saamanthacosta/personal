## 1. Scaffold the skill folder

- [ ] 1.1 Create `.agents/skills/code-hygiene/SKILL.md` with valid frontmatter (name, description, license, compatibility, metadata.version), When-to-load / NOT-load sections, gate mechanics, gotchas, references
- [ ] 1.2 Create `.agents/skills/code-hygiene/bin/scan.mjs` — Node.js (stdlib only) runner with `--check` (default), `--apply`, `--report`, `--patterns`, `--severity`, `--exclude`, `--bootstrap`, `--json` flags; deterministic dedup via SHA-1 of `pattern || path:line || snippet_norm`
- [ ] 1.3 Create `.agents/skills/code-hygiene/patterns.json` — built-in pattern catalog covering debug leftovers (`console.log`, `debugger`, `binding.pry`, `dd(`, `var_dump(`, `pdb.set_trace`, `import pdb`), TODO/FIXME/HACK/XXX markers, empty catch blocks (`catch { }`, `catch (_) { }`, `catch(...) { }` with empty body), with severity per pattern
- [ ] 1.4 Create `.agents/skills/code-hygiene/evals/evals.json` — 12+ eval cases covering should-trigger (3), should-NOT-trigger (3), near-miss (3), expected-output (3+)
- [ ] 1.5 Create `.code-hygiene.json` (workspace config) — default `exclude` globs (`**/.app/**`, `**/dist/**`, `**/build/**`, `**/node_modules/**`, `**/.next/**`, `**/.turbo/**`, `**/coverage/**`) and example severity overrides
- [ ] 1.6 Smoke-test the runner: `node .agents/skills/code-hygiene/bin/scan.mjs --help`, `node .agents/skills/code-hygiene/bin/scan.mjs --check --json` (exit 1 expected — findings exist), `node .agents/skills/code-hygiene/bin/scan.mjs --apply` (mutates the report), then `--check` again (exit 0 expected — dedup hit)

## 2. Bootstrap the report file

- [ ] 2.1 Run `node .agents/skills/code-hygiene/bin/scan.mjs --apply` once to seed `docs/code-hygiene.md` with the current finding set
- [ ] 2.2 Verify the report contains YAML frontmatter (schema_version, generated_at, last_run_at, total_open, severity_counts), a `## Findings` section, and one fenced entry per finding with deterministic dedup key
- [ ] 2.3 Verify re-running `--check` after the bootstrap exits 0 (no new findings)
- [ ] 2.4 Spot-check 2-3 entries: dedup key format, file path, snippet truncation, severity mapping

## 3. Add the OpenSpec delta specs

- [ ] 3.1 Write `openspec/changes/code-hygiene-skill/specs/agent-skill-library/spec.md` — adds a Requirement covering `code-hygiene` frontmatter validation, unique naming, and inclusion in the approved library inventory, with 2+ Scenarios
- [ ] 3.2 Write `openspec/changes/code-hygiene-skill/specs/task-quality-gates/spec.md` — adds a Requirement covering the `Code hygiene gate` (invocation timing, exit-code semantics, idempotent report updates, skip-at-run-time), with 3+ Scenarios

## 4. Archive and sync

- [ ] 4.1 Validate the change: `openspec change validate code-hygiene-skill` (must report valid)
- [ ] 4.2 Archive the change via `openspec-archive-change` (syncs both delta specs into canonical `openspec/specs/agent-skill-library/spec.md` and `openspec/specs/task-quality-gates/spec.md`; moves change dir to `openspec/changes/archive/2026-08-03-code-hygiene-skill/`)
- [ ] 4.3 Verify the active change no longer appears in `openspec list --json`
- [ ] 4.4 Verify both canonical specs contain the new requirements
- [ ] 4.5 Run `openspec-vault-link` (best-effort) to enrich the Obsidian vault with wikilinks

## 5. Commit 1 (skill + OpenSpec archive + canonical syncs)

- [ ] 5.1 Stage intended files only: skill files, `.code-hygiene.json`, `docs/code-hygiene.md`, the archived change dir, both canonical spec syncs
- [ ] 5.2 Run staged-scan: `node .agents/skills/cve-scan/bin/scan-staged.mjs` (must pass; override anticipated HIGH findings per `design.md` § Security Considerations)
- [ ] 5.3 Preview commit message (≤ 30 char title, single-line body paragraphs)
- [ ] 5.4 Execute `git commit`; verify `git log -1 --stat` shows only intended files

## 6. Wire `code-hygiene` into `create-task` (commit 2)

- [ ] 6.1 Update `.agents/skills/create-task/SKILL.md` — add `code-hygiene` to the `## Workflow at a glance` diagram (between `pre-commit-review` and `cve-report`), to the 11-line progress checklist, and to the `## Available scripts` index
- [ ] 6.2 Update `.agents/skills/create-task/references/task-workflow.md` — add the `code-hygiene` gate mechanics to the `pre-commit-review` phase boundary (or a new gate phase if cleaner), documenting the `--check` invocation, exit-code handling, and skip-at-run-time flow consistent with `BLOCKER-CHECKLIST.md`
- [ ] 6.3 Verify `openspec validate task-quality-gates` passes (canonical spec was updated in commit 1; commit 2 only changes code, not spec)
- [ ] 6.4 Stage intended files only: the two updated create-task files
- [ ] 6.5 Run staged-scan: must pass
- [ ] 6.6 Preview and execute `git commit`; verify `git log -1 --stat`

## 7. Push and PR

- [ ] 7.1 `git push --set-upstream origin chore/code-hygiene`
- [ ] 7.2 Verify upstream is set: `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
- [ ] 7.3 Pre-PR readiness: clean status, latest commit on branch, pre-archive CVE report current, no blocking findings
- [ ] 7.4 Render PR preview via `create-pr` skill
- [ ] 7.5 `gh pr create --base main --head chore/code-hygiene --title "..." --body "..." --assignee "@me"`
- [ ] 7.6 Return PR URL
