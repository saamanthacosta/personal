## 1. Skill Structure

- [ ] 1.1 Create `.agents/skills/create-skill/SKILL.md` with valid YAML frontmatter, matching kebab-case name, personal metadata, and `disable-model-invocation: true`.
- [ ] 1.2 Add a trigger-oriented description that states the skill creates reusable `SKILL.md` workflows and is used only when explicitly requested.
- [ ] 1.3 State the hard output-location rule that generated skills belong only under `.agents/skills/<name>/SKILL.md`.

## 2. Authoring Workflow

- [ ] 2.1 Instruct the workflow to load `customize-opencode` as the canonical source for skill template and platform conventions.
- [ ] 2.2 Define conversation extraction for reusable steps, decision points, branches, guardrails, and completion criteria.
- [ ] 2.3 Define focused clarification behavior for cases where no reliable workflow can be inferred.
- [ ] 2.4 Define drafting and self-review behavior that identifies material ambiguities without forcing unnecessary questions.
- [ ] 2.5 Define finalization output with a concise result summary, representative invocation prompts, related customization suggestions, and an OpenCode restart reminder.

## 3. Validation

- [ ] 3.1 Verify the skill exists only at `.agents/skills/create-skill/SKILL.md` and no duplicate was created under `.opencode/` or global paths.
- [ ] 3.2 Validate frontmatter syntax, folder/name consistency, description quality, explicit invocation behavior, and actionable workflow coverage.
- [ ] 3.3 Compare the completed skill against existing personal skill conventions and the `skill-authoring` specification.
