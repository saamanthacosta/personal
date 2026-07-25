# secure-mcp-configuration Specification

## Purpose
TBD - created by archiving change workspace-vault-migration. Update Purpose after archive.
## Requirements
### Requirement: MCP configuration remains local-only
The workspace SHALL ignore `.vscode/mcp.json` and other local MCP configuration files, and SHALL NOT include any MCP configuration file in the tracked repository.

#### Scenario: Local VS Code configuration uses secure input
- **WHEN** a user configures the local Obsidian MCP server
- **THEN** `.vscode/mcp.json` may use a password-protected `${input:obsidian-mcp-token}` reference and remains ignored by Git

#### Scenario: MCP configuration is absent from the index
- **WHEN** the user checks normal or staged Git status
- **THEN** `.vscode/mcp.json`, `.mcp.json`, `.mcp.local.json`, and other ignored MCP files are absent from the tracked change set

### Requirement: Tracked workspace documentation contains no MCP secret
The tracked workspace documentation SHALL describe secure MCP setup and client-specific environment/input syntax without containing a bearer token, private key, or local credential file.

#### Scenario: Documentation explains local setup
- **WHEN** a new user reads the Obsidian setup documentation
- **THEN** it explains that the real MCP configuration is local-only and that credentials must be entered through the client or a secure environment mechanism

#### Scenario: Repository scan checks tracked files
- **WHEN** the staged-diff security scan examines the workspace migration
- **THEN** it finds no hardcoded bearer credential or private key in tracked files

### Requirement: Existing credentials are rotated
The migration SHALL require the previously exposed MCP bearer to be revoked and replaced before the workspace is considered secure.

#### Scenario: Existing credential is rotated
- **WHEN** migration validation runs before the first sanitized commit
- **THEN** the prior bearer is considered invalidated and the user is instructed to use a newly issued credential

