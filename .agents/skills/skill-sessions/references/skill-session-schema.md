# Skill Session Event Schema

Version: `0.1.0`

The JSONL stream consumed by both the chat renderer (`scripts/render.mjs`) and the durable writer (`scripts/append-event.mjs`). One JSON object per line; UTF-8; trailing newline required.

## Common fields

Every event MUST include:

| Field | Type | Notes |
| --- | --- | --- |
| `type` | string | One of the event names below. |
| `ts` | string | UTC ISO-8601 timestamp with millisecond precision. |
| `session` | string | Session id (`<UTC-ISO-timestamp>-<change-or-scope>`). |

## Events

### `phase_started`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `phase` | string | yes | Phase name (`preflight`, `explore`, …). |
| `index` | integer | yes | 1-based. |
| `total` | integer | yes | Total phases in this run. |

### `phase_completed`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `phase` | string | yes | Must match the prior `phase_started`. |
| `duration_ms` | integer | yes | Wall clock. |
| `status` | string | yes | `complete` \| `failed` \| `skipped`. |

### `step_started`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `phase` | string | yes | Parent phase. |
| `step` | integer | yes | 1-based within the phase. |
| `total` | integer | yes | Total steps in the phase. |
| `description` | string | yes | Human-readable. |

### `step_completed`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `phase` | string | yes | Parent phase. |
| `step` | integer | yes | Matches the prior `step_started`. |
| `status` | string | yes | `complete` \| `failed`. |

### `evidence`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `source` | string | yes | File path or `SKILL.md §<anchor>`. |
| `result` | string | yes | Outcome. Truncated at 1 KiB in render; full text linked. |

### `specialist_loaded`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `skill` | string | yes | Specialist skill name. |
| `reason` | string | yes | Why this skill was loaded. |

### `loop_back`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `from_phase` | string | yes | |
| `to_phase` | string | yes | |
| `reason` | string | yes | One-line reason. |

### `note`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `level` | string | yes | `info` \| `warn` \| `error`. |
| `text` | string | yes | |

## Session end

A run is closed by a `phase_completed` for the final phase with `status: complete` (or `failed`). The durable writer then finalizes `ended_at` and `status` in the session file's YAML frontmatter.

## Example

```jsonl
{"type":"phase_started","ts":"2026-07-30T12:00:00.000Z","session":"2026-07-30T12-00-00Z-skill-ui-progress","phase":"preflight","index":1,"total":11}
{"type":"phase_completed","ts":"2026-07-30T12:00:00.420Z","session":"2026-07-30T12-00-00Z-skill-ui-progress","phase":"preflight","duration_ms":420,"status":"complete"}
```