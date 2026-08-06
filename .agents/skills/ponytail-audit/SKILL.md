---
name: ponytail-audit
description: Use /ponytail-audit on a repo to rank what to delete, simplify, or replace with stdlib or native equivalents. Triggered by "audit this codebase" or "find bloat".
license: MIT
compatibility: Model-only skill — operates on the current repo.
metadata:
  author: personal
  version: "0.1"
---

# Ponytail Audit

Like `ponytail-review`, but scans the entire codebase instead of a diff. Output is a ranked list of what to delete, simplify, or replace with stdlib or native equivalents, biggest cut first.

## 1. Hunt

Walk the repo for these patterns:

- Dependencies the standard library or platform already ships.
- Single-implementation interfaces.
- Factories with one product.
- Wrappers that only delegate.
- Files exporting one thing.
- Dead flags and config.
- Hand-rolled stdlib.

## 2. Output format

One line per finding, ranked biggest cut first:

`<tag> <what to cut>. <replacement>. [path]`

End with `net: -<N> lines, -<M> deps possible.` if anything was cut. If nothing to cut, end with `Lean already. Ship.`

## 3. Tags

- `delete:` — dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` — hand-rolled thing the standard library ships. Name the function.
- `native:` — dependency or code doing what the platform already does. Name the feature.
- `yagni:` — abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` — same logic, fewer lines. Show the shorter form.

## Inputs

- `path` (optional): the directory to audit. When omitted, audit the current repo root.

## Guardrails

- Scope: over-engineering and complexity only. Correctness bugs, security holes, and performance are explicitly out of scope; route them to a normal review pass.
- Lists findings, applies nothing. One-shot.
- "stop ponytail-audit" or "normal mode" reverts to verbose review style.

## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `ponytail` | mentions | by name (slash) |
| `ponytail-review` | mentions | by name (slash) |
| `ponytail-debt` | mentions | by name (slash) |

None — this skill is self-contained.
