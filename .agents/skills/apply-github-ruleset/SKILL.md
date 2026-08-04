---
name: apply-github-ruleset
description: Apply the GitHub ruleset + CODEOWNERS defined in the github-rules-as-code runner to a target repo. Use when the user wants to onboard a new repo to the personal ruleset, or refresh existing rules/CODEOWNERS against the manifest.
---

# apply-github-ruleset

Run the `github-rules-as-code` runner against a target repo.

## When to use

- The user wants to add a new repo to the personal ruleset.
- The user wants to refresh rulesets + CODEOWNERS for an existing repo.
- The user wants to plan (dry-run) before applying.

## Where the runner lives

The runner is a sub-project at `Personal/github-rules-as-code/`. It is a separate git repo; the parent workspace `Personal/` does not track its contents.

## Inputs

- `repo` (required): the target repo, e.g. `saamanthacosta/portfolio`.
- `mode` (optional): `plan` (default) or `apply`.
- `prune` (optional): include deletions in the operation. Required for opt-out.

## Procedure

1. Verify the runner is present: `ls github-rules-as-code/package.json`. If not, stop and ask the user to clone it.
2. Verify `gh` is authenticated: `gh auth status`. If not, stop and ask the user to run `gh auth login`.
3. Verify the target repo has a manifest at `rules/manifests/<repo>.json`. If not, create one (see `github-rules-as-code/AGENTS.md`).
4. Run the plan:
   ```bash
   npm run plan -- --repo <owner>/<repo>
   ```
5. Show the user the diff. Wait for approval.
6. Run the apply:
   ```bash
   npm run apply -- --repo <owner>/<repo>
   ```
7. Optionally verify by re-running plan; the diff should be empty.

## For opt-out

1. Move the manifest out of `rules/manifests/` (or delete it).
2. Run `npm run apply -- --prune --repo <owner>/<repo>` to delete the remote ruleset.
3. Confirm with a final `npm run plan -- --repo <owner>/<repo>` that the diff is empty.

## Boundaries

- The skill does not edit the runner code itself. It only invokes it.
- The skill does not edit `Personal/.gitignore` or `personal.code-workspace`. Those are owned by the parent workspace.
- The skill does not push or PR to the runner repo. It edits local files; the user commits them.

## Outputs

- Mutated rulesets on the target repo.
- Updated `.github/CODEOWNERS` on the target repo.
- Log lines (pino JSON) to stdout.

## Interdependencies

None — this skill is self-contained.
