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

