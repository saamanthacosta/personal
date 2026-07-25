## 1. Reconcile Interrupted Skill-Authoring Change

- [x] 1.1 Update `openspec/changes/add-create-skill/` proposal, design, and `skill-authoring` delta spec to remove unsupported `disable-model-invocation` guarantees and define standalone versus orchestrated ownership truthfully.
- [x] 1.2 Update the affected `add-create-skill` task wording and reopen any validation checkbox whose previous completion depended on unsupported frontmatter behavior.

## 2. Preserve Task Orchestration Ownership

- [x] 2.1 Update `.agents/skills/create-task/SKILL.md` so explicit invocation owns the full lifecycle and specialist skills provide bounded phase guidance that returns control to the orchestrator.
- [x] 2.2 Define personal skill creation as a consistently classified implementation task while preserving explicit type confirmation and branch rules.
- [x] 2.3 Update `.agents/skills/create-skill/SKILL.md` to remove unsupported frontmatter and runtime claims, retain a precise standalone trigger, and return control when loaded within `create-task`.
- [x] 2.4 Distinguish standalone skill-authoring completion output from nested completion so restart and follow-on suggestions do not terminate an active task workflow.

## 3. Validate Dispatch and Metadata Contracts

- [x] 3.1 Validate both skill files against OpenCode-recognized frontmatter fields, matching names, descriptions, and canonical workspace paths.
- [x] 3.2 Review a prompt matrix covering standalone `create-skill`, explicit `create-task` skill authoring, specialist clarification, and specialist completion; confirm lifecycle ownership and resume behavior in every scenario.
- [x] 3.3 Verify the reconciled `add-create-skill` artifacts and implementation agree, then complete its reopened validation tasks only after the corrected checks pass.
- [x] 3.4 Run the apply-phase CVE full audit for both `add-create-skill` and `fix-create-task-skill-handoff`, resolving any blocking findings.

## 4. Delivery Readiness

- [x] 4.1 Review path-specific diffs and confirm unrelated `.obsidian/` changes and `mestrado-uff/` are excluded from the intended task scope.
- [x] 4.2 Verify both OpenSpec changes are internally consistent and ready for ordered archival: corrected `add-create-skill` first, then `fix-create-task-skill-handoff`.
