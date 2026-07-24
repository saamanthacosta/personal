## 1. Inventory and migration safety

- [x] 1.1 Inventory root and child skill definitions, identify duplicates, and classify reusable versus lazyFinances-specific skills.
- [x] 1.2 Inventory root and child OpenSpec, documentation, Obsidian, and MCP files and record the intended source for each migrated artifact.
- [ ] 1.3 Revoke the existing Obsidian MCP bearer and obtain a replacement before staging any MCP configuration.

## 2. Root workspace repository policy

- [x] 2.1 Update the root `.gitignore` to track `personal.code-workspace`, `.agents/`, intended root `docs/`, `openspec/`, `.obsidian/`, and the sanitized VS Code MCP configuration.
- [x] 2.2 Ignore `lazyFinances/` and each other selected child Git repository recursively without hiding the workspace file that references them.
- [x] 2.3 Add ignore rules for local MCP credentials, environment files, temporary Obsidian backups, caches, and other secret-bearing artifacts.
- [x] 2.4 Validate root Git status and confirm child-repository changes do not appear in the root change set.

## 3. Canonical agent skill library

- [x] 3.1 Reconcile the root `.agents/skills/` copies of OpenSpec, commit, PR, and vault-linking skills against the selected project versions.
- [x] 3.2 Generalize `cve-scan` into `.agents/skills/cve-scan/` and update descriptions, script paths, source-root handling, and project assumptions.
- [x] 3.3 Copy the CVE methodology, report templates, and pattern rules into the root documentation and skill structure without carrying over credentials or project-only paths.
- [x] 3.4 Update all package scripts, hooks, and skill references that still point to `.opencode/skills/`.
- [x] 3.5 Validate skill frontmatter, unique names, discovery from the root workspace, and absence of stale duplicate skill definitions.

## 4. Obsidian vault migration

- [x] 4.1 Create the root `.obsidian/` configuration from the child vault settings while reconciling root-relative paths and recent-file state.
- [x] 4.2 Migrate required community-plugin manifests and configuration, excluding credentials, caches, and unneeded machine-specific data.
- [x] 4.3 Track root `.obsidian/workspace.json` and validate bookmark, graph, search, and OpenSpec views against the root vault.
- [x] 4.4 Update `openspec-vault-link` paths and verify dry-run linking for active and archived changes.

## 5. Secure MCP configuration

- [x] 5.1 Replace the literal bearer in the local `.vscode/mcp.json` with a password-protected `${input:obsidian-mcp-token}` reference and keep the file ignored.
- [x] 5.2 Remove `.mcp.example.json` and document local-only MCP setup in `docs/obsidian.md`.
- [x] 5.3 Verify ignored MCP files are absent from the Git index and tracked files contain no bearer, API key, or private key.
- [x] 5.4 Document the separate `{env:VARIABLE_NAME}` form required if an OpenCode `opencode.json[c]` configuration is added.

## 6. Cleanup and verification

- [x] 6.1 Remove stale root `.opencode/` and `.github/` skill and prompt copies after all supported content has been migrated.
- [x] 6.2 Run JSON/YAML/frontmatter validation for workspace, Obsidian, MCP, skill, and OpenSpec files.
- [x] 6.3 Run the generalized CVE checks against the migration changes and confirm no CRITICAL or unoverridden HIGH findings.
- [ ] 6.4 Verify OpenSpec status, skill discovery, Obsidian vault loading, MCP prompt behavior, and root Git ignore boundaries.
- [x] 6.5 Record rollback instructions and confirm the migrated configuration can be restored from the pre-migration backup.
