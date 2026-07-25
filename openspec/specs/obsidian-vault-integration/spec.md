# obsidian-vault-integration Specification

## Purpose
TBD - created by archiving change workspace-vault-migration. Update Purpose after archive.
## Requirements
### Requirement: Root Obsidian configuration is tracked
The root repository SHALL track the root `.obsidian/` configuration, including workspace state, bookmark state, and required plugin configuration, after paths are reconciled for the root vault.

#### Scenario: Vault opens with the shared workspace state
- **WHEN** Obsidian opens the `Personal/` directory
- **THEN** it loads the tracked root workspace configuration and exposes the configured vault views without relying on the child project's path layout

#### Scenario: Bookmark changes are durable
- **WHEN** `openspec-vault-link` registers or updates a bookmark
- **THEN** the change is written to the tracked root `.obsidian/workspace.json` and remains valid JSON

### Requirement: OpenSpec artifacts link into the root vault
The vault-linking skill SHALL resolve root `openspec/` artifacts, canonical specs, source references, tags, and the OpenSpec index relative to the root vault.

#### Scenario: Archived change is linked
- **WHEN** an archived OpenSpec change is processed
- **THEN** its artifacts receive the configured related links, tags, history entry, bookmark behavior, and MOC entry without self-links or duplicate entries

#### Scenario: Missing source path is handled safely
- **WHEN** a link candidate does not exist in an archived change
- **THEN** the skill leaves the original prose unchanged and reports the skipped path


## ADDED Requirements

### Requirement: Subject-based frontmatter tags replace path-redundant tags
The `openspec-vault-link` skill SHALL apply frontmatter tags based on subject, not on path-redundant metadata. The `change/<name>` and `status/<active|archived>` tags SHALL NOT be applied, because the change name is already encoded in the folder path (`openspec/changes/<name>/` or `openspec/changes/archive/YYYY-MM-DD-<name>/`).

#### Scenario: No change/<name> tag is applied
- **WHEN** the skill tags an artifact in a change folder
- **THEN** the frontmatter does not include `change/<name>`, regardless of whether the change is active or archived

#### Scenario: No status/<active|archived> tag is applied
- **WHEN** the skill tags an artifact
- **THEN** the frontmatter does not include `status/<active>` or `status/<archived>`; the path is the source of truth

#### Scenario: Subject tags describe the artifact
- **WHEN** the skill tags an artifact
- **THEN** it uses `topic/<subject>` (one or more) where the subject reflects the artifact's domain (e.g., `topic/cve`, `topic/pr-review`, `topic/skill-authoring`) and `capability/<name>` for any capability the artifact touches

### Requirement: Subject-prefixed artifact filenames
New OpenSpec changes SHALL use subject-prefixed filenames for their artifacts, where the prefix is the change name (or a clear abbreviation). The vault-link skill SHALL document the convention and SHALL reference subject-prefixed names in its examples and templates.

#### Scenario: New change uses subject-prefixed names
- **WHEN** a new OpenSpec change is created
- **THEN** its proposal is named `why.md` (or `<change-name>-why.md`), its design is `how.md` (or `<change-name>-how.md`), and `tasks.md` is unchanged
- **THEN** the change folder may use either flat role names (`proposal.md`, `design.md`) or subject-prefixed names, with the subject-prefixed form preferred for changes that have multiple proposals or designs

#### Scenario: Existing archives keep flat names
- **WHEN** an archived change from before this convention is processed
- **THEN** its `proposal.md`/`design.md`/`tasks.md` filenames are left untouched and the skill does not attempt to rename them

### Requirement: Common docs are linked from specs
Canonical specs SHALL link to the common docs they reference (e.g., `task-workflow.md`, `cve-methodology.md`, `pr-style.md`) at the bottom of the spec, when those common docs apply.

#### Scenario: Spec references its common doc
- **WHEN** a canonical spec describes a capability that depends on a common doc such as `task-workflow.md` or `cve-methodology.md`
- **THEN** the spec includes a `## See also` section with wikilinks to those common docs

### Requirement: MOC template uses the new style
The vault-link skill's embedded `openspec/INDEX.md` template SHALL describe the new naming convention and SHALL NOT instruct users to add `change/<name>` or `status/<active|archived>` tags.

#### Scenario: Skill template does not mention dropped tags
- **WHEN** a reader follows the skill's embedded INDEX template
- **THEN** the template does not mention `change/<name>` or `status/<active|archived>` tags

### Requirement: Forward-only grandfather clause
The skill SHALL NOT retroactively rename artifacts in `openspec/changes/archive/` or rewrite wikilinks inside archived notes. The new naming convention applies to new changes only.

#### Scenario: Archived artifacts are not renamed
- **WHEN** the vault-link skill runs against an archived change
- **THEN** it does not modify the artifact filenames in the archive folder

### Requirement: Vault-link skill documents its public CLI
The vault-link skill SHALL list every flag it accepts (`--all`, `--skip-tags`, `--skip-bookmarks`, `--skip-moc`, `--dry-run`) in its body, with a one-line description of each, so a reader does not need to re-derive the surface from the steps.

#### Scenario: Skill body documents all flags
- **WHEN** a reader opens the skill body
- **THEN** the input section lists every flag and its effect

## History

- [[../changes/archive/2026-07-25-improve-vault-link/proposal|improve-vault-link (2026-07-25)]] — Drop redundant change/<name> and status/<active|archived> tags; introduce subject-based topic/<subject> tags; document subject-prefixed artifact filenames with a forward-only grandfather clause.
