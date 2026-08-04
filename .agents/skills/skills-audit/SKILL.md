---
name: skills-audit
description: Run a spec-compliance audit against all skills in `.agents/skills/`, producing a structured report of frontmatter violations, subfolder issues, description quality problems, body completeness gaps, and interdependency gaps. Use when the user wants to review, audit, check quality, or find problems in the skills folder — or when the user asks to "run an audit" or "check the skills".
license: MIT
compatibility: Local machine skill — requires Node.js.
metadata:
  author: personal
  version: "0.1"
---

# Skills Audit

Run a spec-compliance audit against all skills in `.agents/skills/`. Reports violations across five audit areas, aggregates findings, and exits with a non-zero code if any blocking violation is found.

## When to use

- After authoring or modifying a skill — catch violations before they accumulate
- As part of a pre-PR check — ensure no new violations in changed skills
- On demand — `review skills`, `audit the skills`, `check skill quality`

## Audit areas

The five audit areas are defined in `references/audit-checklist.md` and executed by `scripts/validate-skill.mjs` (per-skill) and `scripts/audit-all.mjs` (all skills).

| Area | What is checked |
| --- | --- |
| Frontmatter | Only spec-allowlist fields present (`name`, `description`, `license`, `compatibility`, `metadata`) |
| Subfolders | Only allowlisted names at top level (`scripts/`, `references/`, `assets/`) |
| Description | Trigger-oriented, third-person, front-loaded |
| Body completeness | Has inputs, workflow, guardrails, completion criteria |
| Interdependencies | Has `## Interdependencies` section (or `None — this skill is self-contained.`) |

## Scripts

| Script | Purpose |
| --- | --- |
| `scripts/validate-skill.mjs` | Validate a single skill by path. Exits 0 on pass, 1 on violations, 2 on error. |
| `scripts/audit-all.mjs` | Run `validate-skill.mjs` against every skill in `.agents/skills/`. Prints a summary table and exits non-zero if any skill has blocking violations. |

## Usage

Audit all skills:

```bash
node .agents/skills/skills-audit/scripts/audit-all.mjs
```

Audit a single skill:

```bash
node .agents/skills/skills-audit/scripts/validate-skill.mjs .agents/skills/research-spike
```

## Output format

The summary table format:

```
SKILL                    FM   SUB   DESC  BODY  DEPS  STATUS
─────────────────────────────────────────────────────────────
apply-github-ruleset     ✓    ✓     ✓     —     ✓     PASS
commit                   ✓    ✓     ✓     ✓     ✓     PASS
research-spike           ✓    ✓     !     ✓     ✓     FAIL (DESC)
...
```

- ✓ = pass, ! = warning, ✗ = fail, — = not applicable
- Exit 0: all skills PASS
- Exit 1: one or more skills FAIL
- Exit 2: script error (file not found, parse error)

## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `skill-authoring` | mentions | by name (bare) |

None — this skill is self-contained.
