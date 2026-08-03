---
schema_version: "0.1"
generated_at: "2026-08-03T23:30:32.357Z"
last_run_at: "2026-08-03T23:30:32.358Z"
total_open: 7
severity_counts:
  info: 1
  warn: 6
  blocker: 0
---

# Code Hygiene Report

> Append-only, single-source-of-truth report for code-hygiene findings. Git history is the audit trail. Re-runs of `node .agents/skills/code-hygiene/bin/scan.mjs` are idempotent on the dedup key (`sha1(pattern || path:line || snippet_norm)`).

## Usage

- **Review new findings** before committing this file. Redact any secret-looking strings — `cve-scan` gitleaks remains the authoritative secret detector.
- **Mark entries as `fixed`** by changing `status: open` to `status: fixed` after the underlying code is changed. Re-running `--check` keeps fixed entries out of the new-findings set.
- **Mark entries as `ignored`** by changing `status: open` to `status: ignored` for known-acceptable findings (e.g., `console.log` inside a snapshot test).
- **Do not hand-edit the `key:` field** — it is the dedup key. Hand-editing breaks idempotency.

## Findings

```yaml
key: `352a627bcba650edc7412b405ec9651637effc8d`
pattern: catch.empty
severity: warn
file: .agents/skills/create-task/references/BLOCKER-CHECKLIST.md
line: 35
status: open (new since last run)
first_seen: 2026-08-03
message: empty catch block — error silently swallowed
snippet: |
  catch {}
```

```yaml
key: `3d12d5d519d76f542c2d5fd5860443d5ae937cc8`
pattern: todo.marker
severity: info
file: .agents/skills/create-task/references/BLOCKER-CHECKLIST.md
line: 52
status: open (new since last run)
first_seen: 2026-08-03
message: TODO/FIXME/HACK/XXX marker in source
snippet: |
  TODO
```

```yaml
key: `1fcc8a8935338296f42f8854da5b3681be4ed988`
pattern: catch.empty
severity: warn
file: .agents/skills/cve-scan/bin/full-audit.mjs
line: 29
status: open (new since last run)
first_seen: 2026-08-03
message: empty catch block — error silently swallowed
snippet: |
  catch {}
```

```yaml
key: `deabc219b96ddfaa90fa602e719544d1552f8faf`
pattern: catch.empty
severity: warn
file: .agents/skills/cve-scan/bin/scan-deps.mjs
line: 26
status: open (new since last run)
first_seen: 2026-08-03
message: empty catch block — error silently swallowed
snippet: |
  catch {}
```

```yaml
key: `4422aa315cd82b00855b07e4cf61d968c36a1c31`
pattern: catch.empty
severity: warn
file: .agents/skills/cve-scan/bin/scan-deps.mjs
line: 50
status: open (new since last run)
first_seen: 2026-08-03
message: empty catch block — error silently swallowed
snippet: |
  catch {}
```

```yaml
key: `e8dac03d40620a652cf8655333c1c853791feb2c`
pattern: catch.empty
severity: warn
file: .agents/skills/cve-scan/bin/scan-deps.mjs
line: 55
status: open (new since last run)
first_seen: 2026-08-03
message: empty catch block — error silently swallowed
snippet: |
  catch {}
```

```yaml
key: `b2f9df9ac62792b8df8faf074fe6cefb399fa116`
pattern: catch.empty
severity: warn
file: .agents/skills/cve-scan/bin/scan-staged.mjs
line: 69
status: open (new since last run)
first_seen: 2026-08-03
message: empty catch block — error silently swallowed
snippet: |
  catch {}
```

```yaml
key: `eb7a03ce7f014260106a142fc13014c87f5ca05b`
pattern: todo.marker
severity: info
file: .agents/skills/create-task/SKILL.md
line: 239
status: ignored
first_seen: 2026-08-03
message: TODO/FIXME/HACK/XXX marker in source — false positive: word "TODO" appears in documentation describing the gate's pattern catalog ("debug leftovers, TODO markers, empty catch blocks"), not as an actual TODO comment
snippet: |
  TODO
```

```yaml
key: `7339ea3b895416f793d826e006a60b616e9e9389`
pattern: todo.marker
severity: info
file: .agents/skills/create-task/references/task-workflow.md
line: 190
status: ignored
first_seen: 2026-08-03
message: TODO/FIXME/HACK/XXX marker in source — false positive: word "TODO" appears in documentation describing the gate's pattern catalog ("debug leftovers, TODO markers, empty catch blocks"), not as an actual TODO comment
snippet: |
  TODO
```

## History

- 2026-08-03 — initial bootstrap via `node bin/scan.mjs --apply`
