# Obsidian and MCP Setup

`Personal/` is the tracked Obsidian vault. The shared vault state lives under `.obsidian/`, including workspace layout, bookmarks, core-plugin settings, community-plugin identifiers, and non-secret plugin configuration.

## Community plugins

The vault configuration names the MCP Connector and VSCode Editor plugins. Install or update those plugins through Obsidian's community-plugin settings; plugin executables are not vendored in this repository.

## MCP authentication

`.vscode/mcp.json` is a local ignored file that uses a password-protected VS Code input variable named `obsidian-mcp-token`. The token is entered by the local user when the server starts and is never written to Git. There is intentionally no tracked MCP example or configuration file.

If OpenCode is configured separately, use its `opencode.json` or `opencode.jsonc` `mcp` section and `{env:OBSIDIAN_MCP_TOKEN}` substitution. Keep the environment file or secret store outside version control.

If a credential ever appears in a tracked file, remove it, revoke it at the MCP Connector, issue a replacement, and run the staged security scan before committing.

## Vault linking

`openspec-vault-link` treats the repository root as the vault root. It updates OpenSpec artifact links, tags, bookmarks, and the `openspec/INDEX.md` MOC while preserving backups and validating workspace JSON.
