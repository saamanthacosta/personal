## Why

The personal repository has reusable skills but no canonical workflow for turning an observed methodology or user request into a valid, effective `SKILL.md`. Adding a dedicated skill makes skill creation consistent while enforcing the repository convention that personal skills live only under `.agents/skills/`.

## What Changes

- Add a reusable `create-skill` skill at `.agents/skills/create-skill/SKILL.md`.
- Extract reusable workflows, decision points, and quality checks from conversation context before drafting.
- Clarify the desired outcome, scope, and workflow depth only when conversation context is insufficient.
- Follow the built-in `customize-opencode` skill guidance for valid skill structure, naming, frontmatter, descriptions, and trigger quality.
- Restrict generated personal skills to `.agents/skills/<name>/SKILL.md`; never create skill copies under `.opencode/` or global configuration paths.
- Draft, inspect weak or ambiguous sections, iterate with the user when needed, and finish with example prompts and related customization ideas.

## Capabilities

### New Capabilities

- `skill-authoring`: Create and refine reusable personal OpenCode skills from conversation-derived workflows or explicit user requirements.

### Modified Capabilities

## Security Considerations

- Threat model summary: `create-skill` is a documentation-only prompt template. It reads conversation context, drafts Markdown, and writes files under `.agents/skills/`. It executes no code, makes no network calls, and handles no user data.
- Affected data and trust boundaries: the only external trust dependency is the OpenCode built-in `customize-opencode` skill, which is loaded for structural reference only; no other repositories or services are touched.
- Mitigations: scope-limited output destination (`.agents/skills/<name>/SKILL.md` only), explicit invocation via `disable-model-invocation: true`, and adherence to the frontmatter/discoverability rules from `customize-opencode` to keep generated skills well-formed.
- Residual risk: skill authored with a misleading description could load with low relevance; mitigated by the trigger-oriented description requirement and the post-draft validation step.

## Impact

- Adds `.agents/skills/create-skill/SKILL.md`.
- Establishes `.agents/skills/` as the exclusive output location for skills created through this workflow in the personal repository.
- Relies on the built-in `customize-opencode` guidance; no new runtime dependencies, application APIs, or configuration changes are required.
