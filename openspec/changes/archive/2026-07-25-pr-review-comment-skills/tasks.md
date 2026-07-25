## 1. OpenSpec artifacts

- [x] 1.1 Draft proposal.md (Why, What Changes, Capabilities, Impact, Security Considerations)
- [x] 1.2 Draft design.md (Context, Goals/Non-Goals, Decisions, Risks, Migration, Open Questions)
- [x] 1.3 Draft specs/pr-review-workflow/spec.md (per-commit review, severity tags, fixup commits, no auto-squash)
- [x] 1.4 Draft specs/agent-skill-library/spec.md delta (PR review skills present in inventory)

## 2. Skill files

- [x] 2.1 Validate `.agents/skills/pr-review-comments/SKILL.md` against spec — confirm one-review-per-commit anchoring, severity tags, line-anchor validation, skip rules, anti-patterns
- [x] 2.2 Validate `.agents/skills/fix-pr-review-comments/SKILL.md` against spec — confirm `--fixup` per commit, no out-of-diff edits, no auto-squash/push, threaded-reply handling, re-run skip
- [x] 2.3 Confirm drafts on disk match final approved versions and frontmatter matches the rest of the library

## 3. Security gates

- [x] 3.1 Run `node .agents/skills/cve-scan/bin/scan-proposal.mjs openspec/changes/pr-review-comment-skills` — proposal hygiene
- [x] 3.2 Run `node .agents/skills/cve-scan/bin/full-audit.mjs --change pr-review-comment-skills --phase=apply` — full audit at apply boundary
- [x] 3.3 Address any CRITICAL or unoverridden HIGH findings, or document overrides in design.md `## Security Overrides` (added `## Security Considerations` to design.md)

## 4. Delivery

- [ ] 4.1 Commit via `commit` skill (title ≤ 30 chars, single-line paragraphs)
- [ ] 4.2 Push branch with `git push --set-upstream origin feat/pr-review-comment-skills`
- [ ] 4.3 Verify upstream and `gh ls-remote` show the branch
- [ ] 4.4 Open PR via `create-pr` skill (auto-assign to current GitHub user)
- [ ] 4.5 Report PR URL; archive is left as an optional follow-up