## Why

Invoking `create-task` with a request to create a skill can cause `create-skill` to take over and terminate after authoring, skipping the branch, OpenSpec, verification, archive, security, commit, push, and PR phases the user explicitly selected. The problem is amplified by `create-skill` relying on `disable-model-invocation`, a frontmatter field OpenCode ignores.

## What Changes

- Make explicit `create-task` invocation authoritative for the full task lifecycle, even when the request also matches a specialist skill.
- Define specialist skills such as `create-skill` as bounded phase guidance that must return control to `create-task` rather than replace its workflow.
- Remove unsupported `disable-model-invocation` claims and encode invocation boundaries in supported descriptions and operational instructions.
- Reconcile the active `add-create-skill` artifacts with OpenCode's recognized skill frontmatter and the corrected orchestration contract.
- Add validation scenarios covering `/create-task` requests whose implementation target is another skill.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `task-orchestration`: Preserve `create-task` lifecycle ownership across nested specialist-skill handoffs.
- `agent-skill-library`: Require shared skills to use recognized OpenCode frontmatter and avoid unsupported invocation-control claims.

## Impact

- Affects `.agents/skills/create-task/SKILL.md` and `.agents/skills/create-skill/SKILL.md`.
- Affects the active `openspec/changes/add-create-skill/` artifacts so the original capability no longer specifies unsupported behavior.
- Adds delta requirements for `task-orchestration` and `agent-skill-library`.
- Does not change application code, dependencies, external APIs, or runtime infrastructure.

## Security Considerations

- Threat model summary: the change edits Markdown instructions and OpenSpec artifacts only. The relevant failure mode is workflow-control loss, not code execution or data exposure.
- Affected data and trust boundaries: no PII, credentials, secrets, or customer content are touched. The sole trust boundary is OpenCode's model-driven selection and loading of local skills.
- Mitigations: explicit orchestrator ownership, bounded specialist handoffs, supported frontmatter only, and scenario-based validation of dispatch behavior.
- Residual risk: model-driven routing remains probabilistic, but redundant ownership and return-control instructions reduce ambiguity without claiming an unsupported hard runtime guarantee.
