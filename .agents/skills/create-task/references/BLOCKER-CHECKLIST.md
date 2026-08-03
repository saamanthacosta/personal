# Pre-Commit-Review Blocker Checklist

> Decision-support artifact for the `pre-commit-review` gate in `create-task`. Source of truth for the three-class taxonomy, the loop-back routing heuristic, and the skip / dismissal reason templates. The orchestrator (`SKILL.md` §3.4 and `task-workflow.md` / `Phase: pre-commit-review` — both in the same directory as this file) owns the contract; this file owns the decision detail.

## How to use this checklist

Walk it once per category against the current working tree. Apply only after `verify` has passed. Default uncertain findings to **polish** (note + continue) rather than **blocker** — preferring noise to missing signals.

## Implementation defaults (v1)

These numbers and behaviors start the gate; review after the first sprint and tune.

| Setting | Default | Notes |
| --- | --- | --- |
| Diff-coverage drop threshold | **5%** | Coverage drop on this diff ≥ 5% counts as a **blocker**. Below that, note as polish in the PR body. Tunable per-repo over time. |
| Skip-confirmation UX | Always-ask | The prompt fires every time the gate runs. The user must type `y` plus a reason to skip. No automatic skip on any task type (`feature`, `fix`, `chore`, `docs`, etc.). |
| Dismiss reason form | Quick-pick with escape | The user picks from a small list of common reasons, or chooses `Other (free text)` for anything else. |

Common dismiss reasons in the quick-pick list (v1):

- `finding is non-blocking in context`
- `addressed in a follow-up change`
- `intentional and risk-accepted`
- `Other (free text)`

## Three-class taxonomy

### Blocker — loops back

A finding is a **blocker** if any of the following is true:

| Class | Example | Action |
| --- | --- | --- |
| Untested failure path | New endpoint or branch with no error-path test | **Loop back** to apply |
| Silent error swallow | `try { ... } catch {}` or `.catch(() => {})` without a log / rethrow / counter | **Loop back** to apply |
| Security regression | New dependency introduces XSS, SSRF, injection, or unsafe deserialization | **Loop back** to apply |
| Contract drift vs spec | Implementation diverges from `specs/<cap>/spec.md` `SHALL`/`MUST` | **Loop back** to apply (or `propose` if the spec needs editing) |
| Missing migration | Schema change ships without a migration / backfill | **Loop back** to apply |
| Broken build | Typecheck, lint, or build error in the diff | **Loop back** to apply |
| Scope creep | Implementation landed something not in the proposal | **Loop back** to apply |
| Implemented contradicts design.md | Code does the opposite of what `design.md` says | **Loop back** to `propose` (design fixed first) |

### Polish — note and continue

A finding is **polish** if it is real but non-blocking:

| Class | Example | Action |
| --- | --- | --- |
| Naming nit | Function name doesn't match codebase convention | Note in PR body, continue |
| Missing docstring | Public function without a doc | Note in PR body, continue |
| Cosmetic lint | Indent, trailing whitespace, unused import | Note in PR body, continue |
| TODO without owner | A `// TODO` with no ticket or follow-up | Note in PR body, continue |
| Documentation drift | Comment no longer matches code, but code is correct | Note in PR body, continue |

### Out-of-scope — new change

A finding is **out-of-scope** if it does not belong in the current change:

| Class | Example | Action |
| --- | --- | --- |
| Feature creep | Adjacent feature that wasn't in the proposal | Stop; user proposes a new change |
| Unrelated refactor | Cleaning up a neighbour file | Stop; user proposes a new change |
| New dependency without justification | Importing a library the proposal didn't authorize | Stop; user proposes a new change |

## Loop-back routing heuristic

When a finding is a **blocker**, decide where to loop back to. The decisive question is *which artifact needs to change*.

### Loop to `propose` when any of these is true:

- `design.md` needs a new or rewritten section (Security, Trade-offs, Open questions, etc.).
- A `specs/<cap>/spec.md` `SHALL`/`MUST` is being changed, added, or removed.
- A previously-unwritten requirement surfaced mid-implementation.
- The implementation contradicts what `design.md` already said (the design is wrong; fix it first, then the code).

### Loop to `apply` when:

- Only the code needs to change, no proposal-level artifact does.
- The finding is mechanical (untested path, build break, missing migration).

### Neither — propose a new change entirely:

- The blocker is genuinely a new requirement that didn't appear in the original proposal.
- Cosmetic, non-blocking — handled via polish note, no loop-back.

When the target is ambiguous, surface a `question` instead of guessing.

## Skip and dismissal mechanics

Both opt-outs require a written reason. The reason is recorded in the PR body so the audit trail stays honest.

### Skip the gate (no findings produced)

Used when the implementer consciously chooses not to run the gate for this change. Run-time prompt:

```
skip pre-commit-review for this change? [y/N] — reason: ____
```

The reason is recorded in the PR body as:

```
Review gate: skipped (reason)
```

Reasons commonly used: `personal/experimental change`, `documentation-only commit`, `follow-up to a passing change`.

### Dismiss a loop-back (override a finding)

Used after the gate has narrated a loop-back and the user explicitly disagrees. Run-time prompt (only fires after the narration is shown):

```
proceed anyway — reason: ____
```

The reason is recorded in the PR body as:

```
Review gate: dismissed by user (reason)
```

Reasons commonly used: `finding is non-blocking in context`, `addressed in a follow-up change`, `intentional and risk-accepted`.

### Reason template the agent fills in

When the agent itself triggers a loop-back, the narration format is:

```
looping back to <phase> — <one-line reason citing the blocker class and concrete finding>
```

Examples:

```
looping back to apply — untested failure path in src/foo.ts:42
looping back to propose — design.md Security section is missing
looping back to apply — silent error swallow in src/bar.ts:108 (try/catch without log)
```

The narration lives in the phase output block, not as a separate prompt — the user reads it where they're already looking.

## Companion references

- `SKILL.md` §3.4 — gate contract
- `references/task-workflow.md` / `Phase: pre-commit-review` — phasing and output mechanics
- `BACKLOG.md` (Personal) — Decision 3 records the loop-back heuristic rationale
