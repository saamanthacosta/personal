## Context

`create-task` and `create-skill` are both prompt-based skills exposed to the model. When the user explicitly invokes `create-task` with a request whose subject is skill authoring, the request also matches the narrower `create-skill` description. The current contracts do not state which skill owns the session, so the specialist can replace the orchestrator and end after writing `SKILL.md`.

The attempted isolation mechanism, `disable-model-invocation: true`, is not recognized by OpenCode. OpenCode recognizes only `name`, `description`, `license`, `compatibility`, and `metadata` in skill frontmatter; unknown fields are ignored. The interrupted `add-create-skill` change therefore remains complete according to its task list while its explicit-invocation requirement is not actually enforced.

## Goals / Non-Goals

**Goals:**

- Preserve `create-task` as the authoritative owner whenever the user explicitly starts that workflow.
- Allow `create-task` to use specialist skill guidance without surrendering later lifecycle phases.
- Remove unsupported invocation-control claims from the shared skill library.
- Reconcile and finish the interrupted `add-create-skill` change with truthful OpenCode behavior.
- Make the ownership and return-control rules testable through representative scenarios.

**Non-Goals:**

- Adding a plugin, command dispatcher, or hard runtime routing mechanism.
- Preventing standalone use of `create-skill` when the user invokes it outside `create-task`.
- Changing OpenCode itself or introducing new dependencies.
- Generalizing orchestration across unrelated external agent frameworks.

## Decisions

### Explicit orchestrator invocation owns the lifecycle

When `create-task` is explicitly selected, its workflow state remains authoritative from preflight through PR. A nested task subject such as skill authoring changes the implementation guidance used during the apply phase, not the workflow owner.

Alternative: let the most specific skill replace the broad orchestrator. Rejected because it silently discards the lifecycle the user explicitly requested and caused the current regression.

### Specialist skills provide bounded inline guidance

`create-task` may load and apply `create-skill` guidance during the relevant phase, but the specialist's completion means “specialist phase complete,” not “task complete.” Control returns to the next `create-task` phase. Both skills will state this boundary so routing does not depend on one description alone.

Alternative: duplicate all skill-authoring instructions inside `create-task`. Rejected because duplicated methodology would drift and undermine the specialist skill library.

### Invocation boundaries use supported mechanisms only

The unsupported `disable-model-invocation` field and all claims that it enforces opt-in behavior will be removed. Standalone trigger boundaries will instead be expressed in the supported skill description and body instructions, while `create-task` explicitly handles overlapping triggers.

Alternative: retain the field as harmless documentation. Rejected because it falsely communicates a runtime guarantee and already masked the dispatch bug.

### Recover the interrupted skill-authoring change before final delivery

The active `add-create-skill` proposal, design, specification, tasks, and resulting `SKILL.md` will be reconciled with supported frontmatter and subordinate-handoff behavior. Verification and archival will preserve its intended `skill-authoring` capability without the invalid explicit-invocation guarantee. The fix change can then archive its orchestration and shared-library deltas with both contracts aligned.

Alternative: leave `add-create-skill` untouched and fix only `create-task`. Rejected because later archival would reintroduce the unsupported requirement into canonical specifications.

## Risks / Trade-offs

- **Model routing remains probabilistic** → State ownership and return-control rules redundantly in the orchestrator, specialist description, specialist body, and acceptance scenarios.
- **Two active changes overlap during recovery** → Reconcile and validate `add-create-skill` first, archive it before the fix, and verify canonical specs after each synchronization.
- **Negative trigger wording may reduce standalone discoverability** → Keep the positive explicit authoring trigger first, then add the narrow exception for an active `create-task` workflow.
- **Unrelated dirty workspace files could enter delivery** → Continue using path-specific diffs and staging; exclude `.obsidian/` changes and `mestrado-uff/` from every task artifact, scan scope where configurable, and commit preview.

## Migration Plan

1. Update the active `add-create-skill` artifacts to replace the unsupported explicit-invocation contract with supported standalone and subordinate-handoff behavior.
2. Update `create-task` to claim lifecycle ownership across specialist phases and classify personal skill authoring consistently.
3. Update `create-skill` frontmatter and body to remove unsupported fields and return control when loaded within `create-task`.
4. Validate representative standalone and orchestrated invocation scenarios plus OpenCode-recognized frontmatter.
5. Verify and archive `add-create-skill`, synchronizing the corrected `skill-authoring` capability.
6. Verify and archive `fix-create-task-skill-handoff`, synchronizing the orchestration and shared-library deltas.
7. Roll back by restoring the previous Markdown artifacts and skills; no data or runtime migration is required.

## Validation Matrix

| Scenario | Expected owner | Expected result |
| --- | --- | --- |
| Direct request to create a reusable skill | `create-skill` | Standalone summary, examples, suggestions, and restart reminder |
| Explicit `create-task` request to create a skill | `create-task` | Bounded `create-skill` phase, then verification and delivery continue |
| Nested skill authoring needs clarification | `create-task` | Apply phase pauses for the specialist question and resumes under the same owner |
| Nested skill authoring completes | `create-task` | Specialist boundary is emitted; specialist completion is not task completion |
| Interrupted task resumes after specialist completion | `create-task` | Resume detection selects the next incomplete lifecycle phase |
| Unsupported invocation field appears in a skill | none | Validation fails until the field and guarantee claim are removed |

## Security Considerations

- Threat model summary: all changes are local Markdown instructions and specifications. The security-relevant concern is unintended workflow control transfer that could skip verification or security gates.
- Affected data and trust boundaries: no PII, secrets, credentials, customer content, network calls, or privilege boundaries are introduced. The only trust boundary is model-directed selection of local OpenCode skills.
- Mitigations: explicit ownership, bounded handoffs, supported metadata only, path-specific staging, and validation that security phases remain reachable after specialist completion.
- Residual risk: prompt interpretation cannot provide a hard dispatcher guarantee; a future plugin or command-level orchestrator could provide stronger enforcement if prompt redundancy proves insufficient.

## Open Questions

None. The correction is intentionally prompt-based and remains within the current workspace architecture.
