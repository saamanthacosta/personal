## Context

`Personal/` is a multi-root workspace containing independent Git projects, shared documentation, OpenSpec artifacts, and agent configuration. The root repository now has a canonical `.agents/skills/` directory, but stale `.opencode/` and `.github/` copies remain, root workspace files are only partially tracked, and the Obsidian vault configuration still lives in a child project. The migration must preserve child-repository isolation while making the root repository a reliable control plane.

## Goals / Non-Goals

**Goals:**

- Track shared workspace policy, the VS Code workspace file, root OpenSpec artifacts, documentation, and Obsidian configuration in the root repository.
- Keep child application repositories outside the root repository's tracked content.
- Establish `.agents/skills/` as the only canonical project-local skill location.
- Make the CVE methodology and scanner portable to the canonical skill path.
- Provide a credential-free, shareable MCP configuration.

**Non-Goals:**

- Changing application source code inside `lazyFinances`, `portfolio`, `uff`, or other child repositories.
- Automatically synchronizing every project-specific skill into the root library.
- Replacing client-specific MCP authentication mechanisms with a custom token service.
- Automating Git branch, commit, push, or PR operations; those belong to the universal task workflow change.

## Decisions

### Root repository is the workspace control plane

The root repository tracks shared configuration and documentation. Nested project directories remain ignored recursively and retain their own Git histories. The workspace file is tracked even though it references ignored directories.

Alternative: make the root repository track each child project. Rejected because it duplicates histories and makes unrelated application changes appear in the workspace repository.

### `.agents/skills/` is canonical

Reusable skills are copied or generalized into `.agents/skills/<name>/SKILL.md`. OpenSpec lifecycle, commit, PR, CVE, and vault-linking skills are workspace candidates. The lazyFinances-specific testing skill remains in that project unless a separate generalization is approved.

Alternative: retain `.opencode/skills/` and `.github/skills/` as aliases. Rejected because duplicate definitions drift and the workspace convention already establishes `.agents/skills/` as canonical.

### Obsidian becomes a root-vault concern

The root `.obsidian/` directory is tracked, including workspace and plugin state as requested. The child vault workspace file is used as migration input, but paths and recent-file state are reconciled against the root vault rather than copied blindly. Bookmark updates remain compatible with `openspec-vault-link`.

Alternative: track only stable Obsidian settings. Rejected for this personal workspace because shared workspace, bookmark, and plugin state are intentional artifacts.

### MCP configuration remains local-only

The local `.vscode/mcp.json` uses a password-protected VS Code input variable for the bearer value, but `.vscode/mcp.json` is ignored and is never added to the repository. `.mcp.example.json` is removed; setup instructions live in `docs/obsidian.md`. OpenCode uses a separate `{env:NAME}` syntax in `opencode.json[c]`. The existing bearer is rotated before migration is considered secure.

Alternative: track a sanitized MCP configuration or example. Rejected because the requirement is to keep MCP configuration out of GitHub entirely.

Alternative: interpolate a `.env` value directly into VS Code HTTP headers. Rejected because the documented secure mechanism for this client is an input variable.

### CVE tooling is path- and project-aware

The CVE skill and scripts stop assuming `.opencode/`, lazyFinances, or a fixed `src/` tree. Tool paths resolve from the skill location or an explicit project configuration, while the methodology remains the source of truth for severity and gate behavior. Project-specific package-manager and dependency commands are detected or declared rather than assumed.

Alternative: copy the existing lazyFinances scanner unchanged. Rejected because its scripts and package commands hard-code the old path and project assumptions.

## Security Considerations

- **Data touched**: Agent instructions, OpenSpec artifacts, Obsidian workspace/plugin state, MCP endpoint configuration, and security reports.
- **Trust boundaries crossed**: Local clients invoke an authenticated Obsidian MCP server that can read and modify vault content.
- **Third-party trust**: Obsidian community plugins and gitleaks execute locally and require explicit inventory and version review.
- **Persistence layer**: Stable Obsidian state is committed; temporary backups, environment files, and local MCP credential files are ignored.
- **Privilege escalation surface**: A leaked MCP bearer could permit unauthorized vault actions; the migration removes literal values and requires token rotation.
- **Override requests**: None.

## Risks / Trade-offs

- **Obsidian workspace state contains machine-specific paths or stale files** → Reconcile paths against the root vault and validate the resulting JSON before tracking it.
- **Plugin files or data contain local-only state** → Review each plugin directory, preserve required manifests/configuration, and exclude credentials or caches.
- **A stale skill remains discoverable from an ignored directory** → Remove duplicate skill definitions after verifying the `.agents/skills/` copies and update all path references.
- **MCP credentials leak through history** → Rotate the existing token before the migration commit and scan the staged diff with the CVE security gate.
- **Root and child OpenSpec trees diverge** → Define the root vault as the canonical workspace documentation location and keep project-specific OpenSpec changes in their owning repository unless explicitly linked.
- **The generic CVE scanner misses project-specific source roots** → Support explicit project configuration and require the workflow to report the scope it scanned.

## Migration Plan

1. Inventory and classify existing root and child skills, OpenSpec artifacts, Obsidian settings, and MCP files.
2. Copy selected reusable skills into root `.agents/skills/`, generalizing CVE paths and descriptions.
3. Move or reconcile root documentation and OpenSpec artifacts, then update ignore rules to track the intended control-plane files.
4. Build and validate root `.obsidian/` state, including workspace and plugin configuration.
5. Replace the literal bearer with a local VS Code input-variable reference, remove the example file, ignore all local MCP configuration, and rotate the old token.
6. Verify skill discovery, JSON validity, link targets, and security scans before removing stale `.opencode/` and `.github/` copies.
7. Keep a rollback copy of migrated Obsidian/MCP configuration until validation completes; rollback means restoring the prior local configuration and reverting the migration commit.

## Open Questions

- Which child repositories beyond `lazyFinances`, `portfolio`, and `uff` should be included in the ignore policy?
- Which Obsidian community-plugin binaries are safe and necessary to track in the root vault?
- Should an OpenCode `opencode.jsonc` be added alongside the VS Code configuration, or should OpenCode use only global MCP configuration?
