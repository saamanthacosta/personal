# Skills Folder

Skill definitions (one folder per skill, each containing a `SKILL.md`) live under `.agents/skills/` inside the project they belong to.

**Personal workspace**: `.agents/skills/<skill-name>/SKILL.md`

Do not create skill folders under `.opencode/` or `.github/`. The `.agents/skills/` path is the canonical location.

## Skills inventory

| Skill | What it does | Triggers |
| --- | --- | --- |
| `apply-github-ruleset` | Apply GitHub ruleset + CODEOWNERS to a target repo | "onboard a repo", "refresh rules" |
| `commit` | Create commits with ≤30-char titles and single-line body paragraphs | "commit", "write a commit message" |
| `create-pr` | Open a PR with structured description, file tree, and commit list | "open a PR", "create a pull request" |
| `create-task` | Orchestrate a full implementation task end-to-end | "add a feature", "fix this bug", "refactor X" |
| `cve-scan` | Run dependency, secret, and dangerous-pattern security checks | "run security audit", "CVE scan" |
| `fix-pr-review-comments` | Address per-commit PR review comments with fixup commits | "fix the review comments", "address PR feedback" |
| `openspec-apply-change` | Implement tasks from an OpenSpec change | "start implementing", "work through tasks" |
| `openspec-archive-change` | Archive a completed OpenSpec change | "archive this change", "finalize the change" |
| `openspec-explore` | Thinking partner for exploring ideas and clarifying requirements | "think through this", "explore X" |
| `openspec-propose` | Propose a new OpenSpec change with all artifacts | "propose a change", "I want to build X" |
| `openspec-status` | Show structured OpenSpec change status table | "what changes are active", "openspec status" |
| `openspec-vault-link` | Wire an OpenSpec change into the Obsidian vault | "link to vault", "wire the change" |
| `pr-review-comments` | Post per-commit PR review comments anchored to SHA | "review this PR commit-by-commit" |
| `research-spike` | Investigate a topic and produce a synthesis note | "investigate X", "research this topic" |
| `skill-authoring` | Create or update a reusable SKILL.md | "create a skill", "author a new skill" |
| `skill-retirement` | Deprecate, archive, or remove a skill | "retire this skill", "remove a skill" |
| `skill-sessions` | Emit structured chat timelines and per-session reports | (loaded by create-task internally) |
| `skills-audit` | Audit all skills for spec compliance | "audit skills", "review the skills" |
| `update-pr-description` | Regenerate an open PR body from current commits | "refresh PR description", "update the PR body" |

## Folder structure

```
.agents/skills/
├── README.md                         ← this file
├── apply-github-ruleset/
│   └── SKILL.md                      ← flat
├── commit/
│   ├── SKILL.md
│   ├── references/
│   │   └── commit-style.md
│   └── scripts/
│       └── verify-commit.py
├── create-pr/
│   ├── SKILL.md
│   └── references/
│       └── pr-style.md
├── create-task/
│   ├── SKILL.md
│   ├── assets/
│   │   └── evals.json
│   ├── references/
│   │   ├── BLOCKER-CHECKLIST.md
│   │   └── task-workflow.md
│   └── scripts/
│       ├── phase-status.mjs
│       └── slug-check.mjs
├── cve-scan/
│   ├── SKILL.md
│   ├── assets/
│   │   └── patterns.json
│   ├── references/
│   │   └── cve-methodology.md
│   └── scripts/
│       ├── format-report.mjs
│       ├── full-audit.mjs
│       ├── scan-deps.mjs
│       ├── scan-proposal.mjs
│       └── scan-staged.mjs
├── fix-pr-review-comments/
│   └── SKILL.md                      ← flat
├── openspec-apply-change/
│   └── SKILL.md                      ← flat
├── openspec-archive-change/
│   └── SKILL.md                      ← flat
├── openspec-explore/
│   └── SKILL.md                      ← flat
├── openspec-propose/
│   └── SKILL.md                      ← flat
├── openspec-status/
│   ├── SKILL.md
│   └── scripts/
│       └── status.mjs
├── openspec-vault-link/
│   ├── SKILL.md
│   └── references/
│       └── obsidian.md
├── pr-review-comments/
│   └── SKILL.md                      ← flat
├── research-spike/
│   └── SKILL.md                      ← flat
├── skill-authoring/
│   ├── SKILL.md
│   └── references/
│       ├── skill-creation-practices.md
│       ├── skill-description-quality.md
│       └── skill-format-spec.md
├── skill-retirement/
│   └── SKILL.md                      ← flat
├── skill-sessions/
│   ├── SKILL.md
│   ├── assets/
│   │   └── skill-session-event.schema.json
│   ├── references/
│   │   └── skill-session-schema.md
│   └── scripts/
│       ├── append-event.mjs
│       ├── format-sessions.mjs
│       ├── render.mjs
│       └── tests/
│           ├── format-sessions.test.mjs
│           └── render.test.mjs
└── skills-audit/
    ├── SKILL.md
    ├── references/
    │   └── audit-checklist.md
    └── scripts/
        ├── audit-all.mjs
        └── validate-skill.mjs
```

## Subfolder conventions

| Subfolder | Use when |
| --- | --- |
| `references/` | Long-form docs, methodology notes, checklists the body links to |
| `scripts/` | Executable helpers invoked by the body; test files MAY live under `scripts/tests/` |
| `assets/` | Static data files: JSON catalogs, JSON schemas, eval fixtures |

A skill SHOULD be flat when it fits entirely in `SKILL.md`. See `skill-authoring/references/skill-format-spec.md` → `## Subfolder Conventions` for the full decision table.

**Extra-structure policy**: Nested subfolders inside allowed top-level folders (e.g., `scripts/tests/`) are permitted when they serve a specific purpose and do not duplicate a top-level folder function. Document the justification in the skill body.

## Skill interdependency graph

```
create-task (orchestrator)
  ├── openspec-apply-change   (mentions, phases)
  ├── openspec-vault-link     (invokes by slash)
  ├── skill-authoring         (mentions for skill-only work)
  ├── cve-scan                (invokes by path)
  ├── skill-sessions          (mentions)
  └── customize-opencode      (loads — built-in)

openspec-apply-change
  └── openspec-vault-link     (invokes by slash)

openspec-archive-change
  └── openspec-vault-link     (invokes by slash)

pr-review-comments
  ├── fix-pr-review-comments  (mentions)
  └── cve-scan                (mentions)

fix-pr-review-comments
  └── pr-review-comments      (mentions)

commit
  └── cve-scan                (invokes by path)

skills-audit
  └── skill-authoring         (mentions)

skill-retirement
  ├── skill-authoring         (mentions)
  └── skills-audit           (mentions)

research-spike
  ├── skill-authoring         (references)
  ├── openspec-explore        (references)
  └── openspec-vault-link     (references)

create-pr
  └── commit                  (mentions)

All other skills are self-contained (no inter-skill references).
```

Every skill documents its interdependencies in a `## Interdependencies` section in its `SKILL.md` body.

## Conventions and references

- **Spec**: `skill-authoring/references/skill-format-spec.md` — on-disk layout, frontmatter fields, subfolder allowlist, extra-structure policy, interdependency declaration format
- **Description quality**: `skill-authoring/references/skill-description-quality.md` — trigger-oriented description rules
- **Body conventions**: `skill-authoring/references/skill-creation-practices.md` — recommended sections, script/asset usage, eval-driven validation
- **Spec compliance**: `skills-audit/scripts/audit-all.mjs` — run after authoring or modifying a skill

## `.opencode/skills/` policy

`.opencode/skills/` should not exist in this workspace. Skills belong in `.agents/skills/`. If a stale skill directory appears under `.opencode/`, move supported content into `.agents/skills/` and remove the stale copy.
