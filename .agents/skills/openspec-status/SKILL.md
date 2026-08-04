---
name: openspec-status
description: Show the current OpenSpec change status. Wraps `openspec list --json` into a structured table. Use when the user wants to know what changes are active, what the status of a specific change is, or which change they are currently on.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: personal
  version: "0.1"
---

# OpenSpec Status

Run `openspec list --json` and render the output as a structured table showing all active changes, their schema, and their artifact completion state.

## When to use

- `openspec status` — check what's active
- `what changes are active` — list active changes
- `which change am I on` — detect current change from conversation context
- After `openspec list --json` fails — the skill surfaces the error cleanly

## Usage

```bash
node .agents/skills/openspec-status/scripts/status.mjs
node .agents/skills/openspec-status/scripts/status.mjs --change <name>  # detailed view
```

## Output

### Summary table (default)

```
CHANGE                    SCHEMA         ARTIFACTS   STATUS
─────────────────────────────────────────────────────────────
add-user-auth             spec-driven    3/4         active
fix-login-redirect        spec-driven    4/4         active
```

### Per-change detail (`--change <name>`)

```
Change: add-user-auth
Schema: spec-driven

ARTIFACT    STATUS
proposal    done
design      done
specs       done
tasks       in_progress

Apply ready: false (tasks not complete)
```

## Interdependencies

None — this skill is self-contained.
