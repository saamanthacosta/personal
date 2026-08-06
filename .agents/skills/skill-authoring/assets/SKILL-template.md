---
title: Agent Skills — canonical template
source: derived from .agents/skills/commit, .agents/skills/skill-retirement, .agents/skills/skills-audit
captured: 2026-08-06
purpose: Authoritative on-disk template for any new or rewritten skill in this workspace. Copy the file, replace the placeholders, and the resulting SKILL.md will satisfy the structural rules the skills-audit enforces.
---

# Agent Skills — canonical template

Use this file as the starting point for every new skill. Copy the
`SKILL.md` skeleton below into `.agents/skills/<your-skill>/SKILL.md`,
replace the placeholders, and the resulting file will match the pattern
the rest of the workspace already follows.

The placeholders are wrapped in `<angle-brackets>` so they are easy to
search and replace. Do not leave any `<...>` token in the published
skill.

## The skeleton

```markdown
---
name: <kebab-case-skill-name>
description: <Single-line, third-person, trigger-oriented description covering what the skill does and when to load it. Use when the user... or Trigger: ...>
license: MIT
compatibility: <One-line runtime note — what the skill needs to function. e.g. "Local machine skill — requires git and gh.">
metadata:
  author: personal
  version: "0.1"
---

# <Skill Title in Title Case>

<One sentence stating the role of the skill. Start with "You are a..." or
with an imperative verb. This is the first paragraph the loader sees;
keep it dense and specific.>

## 1. <Phase name>

<First phase. Numbered headings (`## 1.`, `## 2.`, ...) are the canonical
way to express the workflow. Each phase is a discrete, coherent step.>

- <Step or sub-action, prefixed with a dash or sub-numbered.>
- <Avoid prose paragraphs inside a phase; use bullets.>

## 2. <Phase name>

<Second phase.>

## 3. <Phase name>

<Third phase. Add or remove phases as needed; the numbering is the
contract.>

## Inputs

- `<name>` (required): <description, default value, accepted format>
- `<name>` (optional): <description>

## Guardrails

- <Never do X. State the failure mode the rule prevents.>
- <Always do Y first. State the assumption the rule protects.>
- <If the user is in mode M, pause and confirm before Z.>

## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `<other-skill>` | invokes / mentions / wraps / loads | by name (slash) / by name (bare) / by path |

None — this skill is self-contained.
```

## Field-by-field rules

Each placeholder above has a hard rule. Replace the value, not the
shape.

### Frontmatter

| Field | Required | Rule |
| --- | --- | --- |
| `name` | yes | kebab-case, lowercase, hyphens; must match the folder name; max 64 chars |
| `description` | yes | **single line** (no block scalar `>`), third-person, front-loaded with triggers, ≤ 200 chars |
| `license` | yes | `MIT` for this workspace |
| `compatibility` | yes | one-line runtime note; describe what the skill needs (git, gh, network, etc.) |
| `metadata` | yes | at minimum `author: personal` and `version: "0.1"`; bump version on semantic changes |

### Body

| Element | Required | Rule |
| --- | --- | --- |
| `# <Title>` H1 | yes | first non-frontmatter line; Title Case; matches the spirit of the `name` |
| Role sentence | yes | the first paragraph after the H1; states who the skill is and what it does |
| Numbered phases | yes | `## 1.`, `## 2.`, ... — the canonical workflow pattern |
| `## Inputs` | yes | bulleted list of inputs the skill expects; mark required vs optional |
| `## Guardrails` | yes | section named `Guardrails` or `Anti-patterns`; bulleted rules with the failure mode named |
| `## Interdependencies` | yes | either a table of referenced skills or `None — this skill is self-contained.` |

### Optional subfolders

Add one of these only when the body would otherwise bloat, never by default.

| Subfolder | Use when |
| --- | --- |
| `references/` | long-form docs, methodology notes, checklists linked from the body |
| `scripts/` | deterministic executable helpers; the body must call them by relative path |
| `assets/` | static templates, schemas, or example files the body or scripts read |

## Worked example

The skeleton above is generic on purpose. The real `commit` skill in
this workspace is a concrete instance of the same shape:

```markdown
---
name: commit
description: Create commits with a 30-char max title and a body whose paragraphs are kept as single lines (no soft-wrapping inside a phrase). Load when the user asks to commit, write a commit, or produce a commit message.
license: MIT
compatibility: Local machine skill — requires git.
metadata:
  author: personal
  version: "1.0"
---

# Commit Style

You are an expert git workflow assistant. Before staging or committing, detect the current project context and the current branch, then produce commits that follow the rules below.

## 1. Detect context

- Run `pwd` (or trust the working directory) to know which project you are in.
- Run `git branch --show-current` to grab the branch name and check for a ticket prefix.

## 2. Group changes

- Cluster file changes into logical commits.
- A single commit per logical change.

## 7. Anti-patterns

- Title longer than 30 characters.
- Body with a phrase broken across lines.

## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `cve-scan` | invokes | by path |

None — this skill is self-contained.
```

The numbered phases (`## 1.`, `## 2.`, `## 7.`) are intentional: the
canonical skill does not renumber when phases are added in the middle,
so existing inter-phase references stay stable. Use the same pattern.

## Validation

After copying the template and filling the placeholders, run:

```bash
node .agents/skills/skills-audit/scripts/validate-skill.mjs \
  .agents/skills/<your-skill>
```

The audit will FAIL on any blocking spec violation (unknown frontmatter
fields, non-allowlist subfolders, missing `## Interdependencies`). It
will WARN on body-completeness gaps (missing H1, no numbered phases, no
`## Inputs`, no `## Guardrails`). Resolve the FAILs before committing;
resolve the WARNs before declaring the skill done.
