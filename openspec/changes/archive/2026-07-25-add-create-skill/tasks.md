## 1. Skill Structure

- [x] 1.1 Create `.agents/skills/create-skill/SKILL.md` with valid YAML frontmatter using only OpenCode-recognized fields, a matching kebab-case name, and personal metadata.
- [x] 1.2 Add a trigger-oriented description that states when standalone skill authoring applies and that nested use returns control to `create-task`.
- [x] 1.3 State the hard output-location rule that generated skills belong only under `.agents/skills/<name>/SKILL.md`.

## 2. Authoring Workflow

- [x] 2.1 Instruct the workflow to load `customize-opencode` as the canonical source for skill template and platform conventions.
- [x] 2.2 Define conversation extraction for reusable steps, decision points, branches, guardrails, and completion criteria.
- [x] 2.3 Define focused clarification behavior for cases where no reliable workflow can be inferred.
- [x] 2.4 Define drafting and self-review behavior that identifies material ambiguities without forcing unnecessary questions.
- [x] 2.5 Define standalone completion output with a summary, representative prompts, related suggestions, and restart reminder, plus nested completion output that returns control to `create-task`.

## 3. Validation

- [x] 3.1 Verify the skill exists only at `.agents/skills/create-skill/SKILL.md` and no duplicate was created under `.opencode/` or global paths.
- [x] 3.2 Validate recognized frontmatter, folder/name consistency, description quality, standalone-versus-nested ownership, and actionable workflow coverage.
- [x] 3.3 Compare the completed skill against existing personal skill conventions and the corrected `skill-authoring` specification.
