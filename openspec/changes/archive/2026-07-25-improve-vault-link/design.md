## Context

The `openspec-vault-link` skill currently tags every change artifact with `change/<name>` and `status/<active|archived>`. Those tags duplicate information that the folder path already carries: `openspec/changes/<name>/...` says which change, and `openspec/changes/archive/YYYY-MM-DD-<name>/...` says it's archived. Artifact filenames are also flat (`proposal.md`, `design.md`, `tasks.md`) — these names tell the reader nothing about the change, and inside Obsidian the filename becomes the note title.

## Goals / Non-Goals

**Goals:**
- Drop the redundant `change/<name>` and `status/<active|archived>` tags.
- Introduce a subject-based tag scheme: `topic/<subject>` and the existing `capability/<name>`.
- Document a subject-prefixed artifact naming convention so notes read meaningfully in Obsidian.
- Keep the change forward-only: existing archived changes are NOT renamed.

**Non-Goals:**
- Renaming any existing artifact in `openspec/changes/archive/`.
- Rewriting wikilinks inside existing archived notes.
- Touching the bookmark registration logic (it works as-is).

## Decisions

- **Tag scheme.** Canonical tags are now `topic/<subject>` (one or more, depending on what the artifact covers) and `capability/<name>` (unchanged). `change/<name>` and `status/<active|archived>` are removed from the skill body.
- **Naming convention.** Each change folder's artifacts are named after their purpose inside the change, with the change name (or an abbreviation) as a prefix when useful. Examples:
  - `<change-name>/why.md` — the proposal.
  - `<change-name>/how.md` — the design.
  - `<change-name>/tasks.md` — unchanged.
  - `<change-name>/specs/<capability>/spec.md` — delta spec (unchanged path).
  - For very small changes, an author may keep `proposal.md`/`design.md` if the file count is one or two; the convention is preferred but not mandatory for tiny changes.
- **Forward-only.** The new naming applies to new changes from this point forward. The skill documents the rule and does not retroactively rewrite archived notes.
- **MOC template updated.** The `openspec/INDEX.md` template inside the skill body shows the new style; the actual `openspec/INDEX.md` file's existing entries are not touched in this change.

## Risks / Trade-offs

- [Risk] Authors of new changes use the old `proposal.md` name out of habit. → [Mitigation] The skill body now describes the new convention with examples. Future updates can add validation if drift appears.
- [Risk] The renamed `INDEX.md` template text inside the skill drifts from the real `openspec/INDEX.md` entries. → [Mitigation] The template text describes the *shape* (sections, ordering) rather than the exact entries. A separate MOC-refresh step (already in the skill) keeps the real file in sync.

## Migration Plan

1. Update `.agents/skills/openspec-vault-link/SKILL.md`: tag scheme, naming convention, INDEX template wording.
2. Update `openspec/specs/obsidian-vault-integration/spec.md` (sync from delta) to reflect the new tag and naming rules.
3. Update `.agents/skills/openspec-propose/SKILL.md` (light wording change if it shows example filenames).
4. Apply-boundary CVE audit, archive, post-archive CVE audit, commit, push.

Rollback: revert the commit. No rename happened to existing archives.

## Open Questions

None. The four design decisions (drop redundant tags, subject-based tags, subject-prefixed filenames, forward-only) were confirmed with the user during the preflight discussion.

## Security Considerations

- **Threat model summary.** Documentation and skill refactor only. No new dependencies, no credentials, no network surface change.
- **Affected data and trust boundaries.** Same trust boundary as before. The vault-link skill body is the only thing that changes.
- **Mitigations.** Forward-only grandfather clause prevents retroactive mass rewrites of archive notes (which would invalidate wikilinks and bookmarks).
- **Residual risk.** Low. No CRITICAL or HIGH findings anticipated; no override required.