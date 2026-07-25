## Why

Once a Pull Request is open, adding new commits (review fixups, follow-up edits, late-discovered corrections) leaves the PR description stale: the `Commits`, `File tree`, and `Changes` sections no longer match the branch. Today the only ways to fix that are to edit the body by hand or to close and reopen the PR — both of which lose reviewer context and break notification threads. The workspace needs a skill that regenerates the PR body from the current branch state without closing the PR.

## What Changes

- Add a new skill `update-pr-description` at `.agents/skills/update-pr-description/SKILL.md` that recomputes the PR body from the branch's current commit range against the default branch and applies it with `gh pr edit --body`.
- The skill reuses the exact description structure that `create-pr` produces (Summary, Changes, File tree, Commits, optional Notes) so the regenerated body is identical in shape to one written at PR open.
- The skill does not change the PR title (titles stay manual to avoid confusing reviewers and notification subscribers).
- The skill refuses to run on missing, merged, or closed PRs and warns (does not block) when the working tree is dirty.
- Update `docs/skills-folder.md` to register the new skill in the canonical layout listing.
- Register the new capability `pr-description-sync` under `openspec/specs/` covering the regeneration rules.

## Capabilities

### New Capabilities

- `pr-description-sync`: Regenerate an existing Pull Request's body (title left untouched) from the branch's current commit range against the default branch, using the same template that `create-pr` produces, with a mandatory diff preview and explicit user approval before `gh pr edit` is invoked.

### Modified Capabilities

None. The existing `pr-review-workflow` capability (per-commit review + fixup cycle) and `skill-authoring` capability are unchanged in their REQUIREMENTS; this change only adds a sibling capability.

## Impact

- New files:
  - `.agents/skills/update-pr-description/SKILL.md` — the new skill.
  - `openspec/specs/pr-description-sync/spec.md` — new capability specification.
- Documentation:
  - `docs/skills-folder.md` — append `update-pr-description` to the `Personal/.agents/skills/` listing.
- No production code, no package manifests, no CI workflows, no MCP, no dependency changes.
- No breaking changes: existing PR bodies are not touched unless the user explicitly approves the regeneration in the preview.

## Security Considerations

- **Threat model summary.** The skill reads PR metadata and commit history from the local git repo and the GitHub API, and writes one PR body mutation. It introduces no new dependencies, no embedded credentials, and does not touch the working tree.
- **Affected data and trust boundaries.** Crosses one boundary: local worktree → `api.github.com` over HTTPS via the existing `gh` CLI. Reads PR metadata, commit subjects, and file paths. Writes the PR body on GitHub. No data is persisted locally beyond the temp file at `/tmp/pr-update-body-<pr>.md`, which is deleted after the `gh pr edit` call returns.
- **Mitigations.** Body content is computed from git state; no external user input is interpolated into shell commands. All `gh` invocations use `--body-file <path>` or arguments built from `gh api --jq` output, never from PR body content. The skill refuses to run on closed/merged PRs and inherits the existing `gh` OAuth scope.
- **Residual risk.** Low. The mandatory preview-and-approval gate prevents silent overwrites of hand-edited bodies. No CRITICAL or HIGH findings anticipated; no override required.