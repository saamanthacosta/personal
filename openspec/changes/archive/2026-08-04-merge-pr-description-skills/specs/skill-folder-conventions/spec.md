## ADDED Requirements

### Requirement: Skill MAY dispatch to mode-specific references
A `SKILL.md` MAY dispatch to one or more `references/` notes based on a runtime mode (e.g., open vs. regenerate). When the skill uses mode dispatch, each mode's workflow detail SHALL live in its own `references/<mode>.md` file rather than in a single multi-mode body. The shared content (description template, common context detection) MAY live in either the body or a `references/shared.md` file.

#### Scenario: Body points to mode-specific reference
- **WHEN** a skill such as `pr-description` detects the mode is `open`
- **THEN** the body instructs the model to load `references/pr-open.md` for the workflow and `references/pr-style.md` for the template, and not to load `references/pr-regenerate.md`

#### Scenario: Each mode has its own reference
- **WHEN** a skill dispatches between N modes
- **THEN** there are N mode-specific `references/<mode>.md` files plus any shared `references/shared.md` files; no mode-specific content lives in another mode's file

#### Scenario: Shared content stays shared
- **WHEN** two modes need the same template, schema, or boilerplate
- **THEN** that content lives in a single `references/<shared-name>.md` file referenced by both modes' bodies, not duplicated in each mode's file
