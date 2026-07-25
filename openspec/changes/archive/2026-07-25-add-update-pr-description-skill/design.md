## Context

The workspace ships PR-authoring and PR-review skills (`create-pr`, `pr-review-comments`, `fix-pr-review-comments`) but no skill to keep a PR's body in sync with the branch as it evolves. The body that `create-pr` writes is a rollup of the branch state at the moment of PR open; the moment a reviewer requests a change and the author pushes fixups (or additional commits, rebases, or amended commits), the body stops describing reality. Authors currently either edit the body by hand or close and reopen the PR — both options lose reviewer context.

The new `update-pr-description` skill closes that gap. It is the third leg of a PR lifecycle that already has open-time authoring (`create-pr`) and review-time inspection (`pr-review-comments`/`fix-pr-review-comments`).

## Goals / Non-Goals

**Goals:**
- Recompute the PR body from the current branch state (`merge-base..HEAD`) using exactly the template `create-pr` produces.
- Apply the new body with a single `gh pr edit --body` mutation, after a side-by-side preview and explicit user approval.
- Preserve reviewer-relevant `Notes` content if present in the current description; regenerate the four mechanical sections (`Summary`, `Changes`, `File tree`, `Commits`).
- Refuse to run on missing, merged, or closed PRs; warn (not block) on dirty working trees.

**Non-Goals:**
- Title regeneration. Title stays manual; the skill only touches the body.
- File content rewriting, conflict resolution, or interactive rebase. The skill does not touch the working tree at all — it reads git state and writes the GitHub PR.
- Force-push, autosquash, or any branch mutation. Out of scope; the skill is body-only.
- Operating on PRs authored by other users or in repositories other than the current one (`gh repo view` gates the scope).

## Decisions

- **Description template reused, not redefined.** The skill regenerates Summary / Changes / File tree / Commits using the same paragraphs and tree shape that `create-pr` writes (`docs/pr-style.md`). This guarantees a regenerated body is byte-identical in shape to one written at open time, and avoids a parallel style contract. Notes are preserved verbatim if the current description contains them; otherwise the section is dropped.
- **`gh pr edit --body` via temp file.** Writes the proposed body to `/tmp/pr-update-body-<pr>.md` and invokes `gh pr edit --body-file <path>` to avoid shell escaping of long markdown bodies (matches the `create-pr` pattern).
- **Title untouched.** Even though the title could in principle be re-derived from the branch/commits, mid-PR title churn is disruptive to subscribers and reviewers. The skill exposes a `--title` flag (off by default) so callers who want it can opt in.
- **Stop conditions are strict.** The skill exits non-zero and reports when no PR exists for the branch, the PR is `MERGED` or `CLOSED`, the working tree is dirty (warn, not block, when only untracked files exist), or the `gh`/`git` preconditions fail. This matches the gate philosophy used by `fix-pr-review-comments`.
- **Preview is mandatory.** The skill always prints the proposed body and the current body in fenced blocks and asks for `y/N` confirmation before issuing `gh pr edit`. There is no `--yes` flag.
- **No new dependencies.** The skill relies only on `git`, `gh`, and standard CLI utilities (`sed`, `awk`, `diff` for the preview). No new package manifests, no MCP, no new scripts under `.agents/skills/<name>/bin/`.

## Risks / Trade-offs

- [Risk] `gh pr edit` rewrites the body atomically; any reviewer-added comments or check annotations are preserved (GitHub keeps them as separate objects), but a body that contained bespoke reviewer-facing notes will be lost unless the skill preserves them. → [Mitigation] The skill parses the current description and copies a `## Notes` section verbatim into the regenerated body before applying.
- [Risk] An aggressive regeneration could be triggered between the PR open and the first review, surprising reviewers. → [Mitigation] The mandatory preview surfaces both the current body and the proposed body; the user must approve before any mutation.
- [Risk] The regenerated `Summary` paragraph is recomputed heuristically from the commit subjects; it may read awkwardly for PRs with many commits or many fixups. → [Mitigation] The skill emits a one-line summary derived from `git log <merge-base>..HEAD --pretty=format:'%s'` joined with `;` and explicitly notes that the user can edit the body after regeneration. We do not attempt full LLM summarisation inside the skill.
- [Risk] `gh` API rate limiting on large PRs. → [Mitigation] The skill uses a single `gh pr edit` call; no pagination.

## Migration Plan

- Authored under the `create-skill` workflow inside this chore.
- Registered in `docs/skills-folder.md` so the canonical layout stays accurate.
- Capability spec lands at `openspec/specs/pr-description-sync/spec.md` (new folder, no migration of existing capability).
- Rollback: delete `.agents/skills/update-pr-description/SKILL.md`, the capability spec, and revert `docs/skills-folder.md`. No persisted state outside the repo.

## Open Questions

- None. The four design decisions (template reuse, body-only, mandatory preview, strict stop conditions) were confirmed with the user during preflight.

## Security Considerations

- **Threat model summary.** The skill reads PR metadata and commit history from the local git repo and the GitHub API, and writes one PR body mutation. It does not introduce new dependencies, does not embed or transmit credentials, and does not touch the working tree.
- **Affected data and trust boundaries.** Crosses one boundary: local worktree → `api.github.com` over HTTPS via the existing `gh` CLI. Reads: PR metadata, commit subjects, file paths. Writes: PR body on GitHub. No data is persisted locally beyond the temp file at `/tmp/pr-update-body-<pr>.md`, which is deleted after the `gh pr edit` call returns.
- **Mitigations.**
  - Body content is computed from git state; no external user input is interpolated into shell commands. All `gh` invocations use either `--body-file <path>` (avoiding shell escaping) or arguments built from `gh api --jq` output, never from PR body content.
  - The skill refuses to run on closed/merged PRs, preventing accidental rewriting of historical PRs.
  - The skill inherits `gh`'s existing auth (no new credentials); the OAuth scope is whatever the user already granted (typically `repo`).
  - The temp file path is namespaced by PR number to avoid clobbering parallel runs.
- **Residual risk.** Low. The largest realistic risk is an over-eager regeneration that overwrites a hand-edited body; the mandatory preview addresses this. No CRITICAL or HIGH findings anticipated; no override required.