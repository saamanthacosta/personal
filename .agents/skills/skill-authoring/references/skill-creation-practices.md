---
title: Agent Skills — creation practices
source: https://agentskills.io/skill-creation/best-practices.md
captured: 2026-08-03
purpose: Body-content conventions, scripts/assets usage, and the eval-driven validation loop recommended by the Agent Skills creator docs. Used by `skill-authoring` when shaping the body of a skill.
---

# Agent Skills — creation practices

The body of a skill is plain Markdown. This note captures the conventions
the upstream docs recommend for body structure, scripts, and validation.

## Recommended body sections

A well-shaped skill body covers:

- Workflow or phase steps
- Decision points and quality gates
- Inputs the skill expects
- Guardrails / anti-patterns
- Example invocations
- Validation or completion criteria

Long-form material that would bloat the body belongs in `references/` and
is linked from the body with relative paths. The recognised
subfolders — `references/`, `scripts/`, `assets/` — are the only
implementation surface; see `skill-format-spec.md` for the rules.

## When to use scripts

Scripts in `scripts/` are useful when the skill needs deterministic side
effects — format checks, file generation, validators, gh/glj wrappers. Per
the upstream guidance:

- Keep scripts small, single-purpose, and non-interactive.
- Surface their exit codes; never let them mask failures.
- Document the script's contract in the body, not only in comments.

## When to use assets

Assets in `assets/` are static files the body references but does not
execute — templates, schemas, sample data, starter configs. They ship with
the skill and are read by the body at authoring or runtime.

### Asset file naming

Asset files in `assets/` follow a small, deliberate naming pattern. Pick the suffix that matches the file's role, not its content:

- **`<plural-noun>.json`** — a catalog of structured records the body or scripts read at runtime. Examples in this workspace: `cve-scan/assets/patterns.json` (regex catalog), `create-task/assets/evals.json` (triggering + expected-output fixtures). Use a plural noun that names what the file contains; do not prefix with `data-` or suffix with `-data`.
- **`<name>.schema.json`** — a JSON Schema (Draft 2020-12 or later). The `.schema.json` suffix is the standard external convention from the JSON Schema project; keep it. Examples: `skill-sessions/assets/skill-session-event.schema.json`.
- **`<name>.<ext>`** (no suffix) — a one-off asset that does not fit either category: templates, starter configs, sample fixtures that are not catalogs, single-record blobs. Use a kebab-case stem and the file's natural extension (e.g. `assets/pr-template.md`, `assets/example-config.yaml`).

When in doubt: a file the body parses as a list of records is a catalog → plural noun. A file that validates records is a schema → `.schema.json`. Everything else is a one-off → bare name.

## Validation loop

The upstream docs recommend an **eval-driven** loop:

1. Write representative prompts the skill should handle.
2. Capture the model's output for each prompt.
3. Score against a rubric (correct artefact, correct path, correct tone,
   no regressions on adjacent topics).
4. Iterate on description and body until scores stabilise.

Skip the loop only for trivial skills. For anything that changes trigger
behaviour, run at least a small eval set before declaring the skill done.

## Workspace contract

`skill-authoring` is the only skill in this workspace
that should author or mutate other skills. Both read this note plus the
built-in `customize-opencode` skill for OpenCode-specific constraints
(frontmatter field allowlist, restart-required behaviour, loader paths).
