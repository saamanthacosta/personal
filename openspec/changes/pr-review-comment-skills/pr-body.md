## Summary

Add two new skills to `.agents/skills/` that produce and address per-commit PR review comments, with fixes emitted as `git commit --fixup=<sha>` so the original commit history stays aligned for a final `git rebase --autosquash` at merge time.

## Changes

Introduce the `pr-review-comments` skill that posts one inline PR review per commit anchored to that commit's SHA, with severity-tagged findings (`// security:`, `// issue:`, `// suggestion:`, `// nit:`).
Introduce the `fix-pr-review-comments` skill that reads the per-commit review comments, applies the minimum fix per comment, and stages the change as a `--fixup=<sha>` commit; the user runs autosquash and `--force-with-lease` explicitly.
Add the `pr-review-workflow` capability spec and update the `agent-skill-library` inventory to include both new skills.

## File tree

```
.agents/skills/
  A fix-pr-review-comments/SKILL.md
  A pr-review-comments/SKILL.md
docs/cve-reports/
  A 2026-07-25-apply-pr-review-comment-skills.md
  M INDEX.md
openspec/changes/pr-review-comment-skills/
  A .openspec.yaml
  A design.md
  A proposal.md
  A specs/agent-skill-library/spec.md
  A specs/pr-review-workflow/spec.md
  A tasks.md
```

## Commits

- f7153a9 Add per-commit review skills

## Notes

- cve-scan gates: proposal hygiene and full-audit both pass with 0 findings (HIGH `design.md` missing Security Considerations section was remediated before commit).
- No new dependencies, auth, sessions, or privilege surfaces — uses existing `gh` + `git`.
- Fix skill does not auto-squash or auto-push; user runs `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <merge-base>` and `git push --force-with-lease` explicitly.