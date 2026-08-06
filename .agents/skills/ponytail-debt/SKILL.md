---
name: ponytail-debt
description: Use /ponytail-debt to harvest every `ponytail:` comment into a debt ledger. Triggered by "ponytail debt" or "what did ponytail defer".
license: MIT
compatibility: Local machine skill — uses grep on the current repo.
metadata:
  author: personal
  version: "0.1"
---

# Ponytail Debt

Every deliberate ponytail shortcut is marked with a `ponytail:` comment naming its ceiling and upgrade path. This skill collects them into a debt ledger so a deferral can't quietly become permanent.

## 1. Scan

Grep the repo for the comment marker, skipping `node_modules`, `.git`, and build output:

`grep -rnE '(#|//) ?ponytail:' .`

Each hit is one ledger row. The comment prefix keeps prose that merely mentions the convention out of the ledger.

## 2. Output format

One row per marker, grouped by file:

`<file>:<line>, <what was simplified>. ceiling: <the limit named>. upgrade: <the trigger to revisit>.`

The convention is `ponytail: <ceiling>, <upgrade path>`, so pull the ceiling and the trigger straight from the comment. Add `git blame -L<line>,<line>` per row when an owner is wanted.

Flag the rot risk: any `ponytail:` comment that names no upgrade path or trigger gets a `no-trigger` tag — those are the ones that silently rot.

End with `<N> markers, <M> with no trigger.` If nothing was found: `No ponytail debt. Clean ledger.`

## Inputs

- `path` (optional): the directory to scan. When omitted, scan the current repo root.
- `output` (optional): a file path to write the ledger to. When omitted, print to stdout.

## Guardrails

- Reads and reports only, changes nothing.
- To persist the ledger, write it to a file only when the user explicitly asks.
- One-shot. "stop ponytail-debt" or "normal mode" reverts.

## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `ponytail` | mentions | by name (slash) |
| `ponytail-audit` | mentions | by name (slash) |

None — this skill is self-contained.
