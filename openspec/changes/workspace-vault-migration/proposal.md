## Why

The `Personal/` workspace is becoming the shared home for agent skills, OpenSpec artifacts, workspace conventions, and an Obsidian vault, but those concerns are split across ignored `.opencode/`, `.github/`, and project-local copies. The workspace also needs Obsidian MCP access without ever placing its bearer credential in the GitHub repository.

## What Changes

- Establish `Personal/` as the tracked workspace and Obsidian-vault repository.
- Make `.agents/skills/` the canonical location for reusable workspace skills.
- Consolidate selected skills from `lazyFinances`, including OpenSpec lifecycle skills, commit/PR guidance, the generalized CVE-security skill, and Obsidian vault linking.
- Remove stale `.opencode/` and `.github/` skill/prompt copies after their supported content has been migrated.
- Track `personal.code-workspace`, `.obsidian/` configuration and workspace/plugin state, workspace documentation, and root OpenSpec artifacts.
- Ignore nested application repositories and their contents, including `lazyFinances/` and other standalone child projects according to the workspace policy.
- Keep the sanitized `.vscode/mcp.json` as a local ignored file that prompts for the Obsidian MCP bearer at runtime; do not track it.
- Remove `.mcp.example.json` rather than adding any MCP configuration template to the repository.
- Ignore local MCP/secret files and document credential rotation and setup requirements.
- Generalize the CVE methodology and scanner paths so they use `.agents/skills/` and can be applied by the universal task workflow without embedding lazyFinances-specific assumptions.

## Security Considerations

- **Data touched**: Workspace configuration, Obsidian state, MCP connection metadata, and the removal of a previously literal bearer credential.
- **Trust boundaries crossed**: VS Code and OpenCode clients connect to a local Obsidian MCP HTTP endpoint with user-supplied authentication.
- **Third-party trust**: The migration retains the Obsidian MCP Connector and optional gitleaks tooling; plugin files must be reviewed before tracking.
- **Persistence layer**: Obsidian workspace/plugin state is tracked in Git, while bearer values and local environment files remain outside version control.
- **Privilege escalation surface**: MCP credentials can authorize vault operations, so literal values must be removed, rotated, and supplied through secure client input.
- **Override requests**: None.

## Capabilities

### New Capabilities

- `workspace-governance`: Defines which workspace files are tracked, which nested repositories are ignored, and where shared skills and OpenSpec artifacts live.
- `agent-skill-library`: Provides a canonical `.agents/skills/` library containing reusable OpenSpec, Git, PR, security, and vault-linking skills.
- `obsidian-vault-integration`: Tracks the root Obsidian vault configuration and supports OpenSpec-to-vault linking, bookmarks, and workspace state.
- `secure-mcp-configuration`: Keeps Obsidian MCP configuration local-only while preventing bearer credentials from entering tracked files.

### Modified Capabilities

## Impact

- Root `.gitignore` and tracked workspace files.
- `.agents/skills/` contents and skill discovery behavior.
- Root `.obsidian/` settings, plugin configuration, workspace state, and bookmark state.
- Local `.vscode/mcp.json` configuration and a removed `.mcp.example.json`; the existing credential must be rotated before migration is considered secure.
- Root `docs/` and `openspec/` content, including the generalized CVE methodology and reports.
- No application source code inside ignored child repositories is changed by this workspace migration.
