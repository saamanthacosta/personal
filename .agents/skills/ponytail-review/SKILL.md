---
name: ponytail-review
description: Use /ponytail-review on a diff to surface over-engineering. One line per finding: location, what to cut, replacement. Triggered by "review for over-engineering" or "simplify review".
license: MIT
compatibility: Model-only skill — operates on the diff the model is already executing.
metadata:
  author: personal
  version: "0.1"
---

# Ponytail Review

Review diffs for over-engineering. One line per finding: location, what to cut, what replaces it. The diff's best outcome is getting shorter.

## 1. Output format

One line per finding, shaped as:

- `L<line>: <tag> <what>. <replacement>.` — single-file diffs
- `<file>:L<line>: ...` — multi-file diffs

End with `net: -<N> lines possible.` if anything was cut. If nothing to cut, end with `Lean already. Ship.` and stop.

## 2. Tags

- `delete:` — dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` — hand-rolled thing the standard library ships. Name the function.
- `native:` — dependency or code doing what the platform already does. Name the feature.
- `yagni:` — abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` — same logic, fewer lines. Show the shorter form.

## 3. Examples

❌ "This EmailValidator class might be more complex than necessary, have you considered whether all these validation rules are needed at this stage?"

✅ `L12-38: stdlib: 27-line validator class. "@" in email, 1 line, real validation is the confirmation mail.`

✅ `L4: native: moment.js imported for one format call. Intl.DateTimeFormat, 0 deps.`

✅ `repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.`

✅ `L52-71: delete: retry wrapper around an idempotent local call. Nothing replaces it.`

✅ `L30-44: shrink: manual loop builds dict. dict(zip(keys, values)), 1 line.`

## Inputs

- `diff` (optional): the diff to review. When omitted, run `git diff` (staged + unstaged) for the current branch.

## Guardrails

- Scope: over-engineering and complexity only. Correctness bugs, security holes, and performance are explicitly out of scope; route them to a normal review pass.
- A single smoke test or `assert`-based self-check is the ponytail minimum — never flag it for deletion.
- Does not apply the fixes, only lists them.
- "stop ponytail-review" or "normal mode" reverts to verbose review style.

## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `ponytail` | mentions | by name (slash) |

None — this skill is self-contained.
