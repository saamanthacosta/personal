## Why

The `openspec-vault-link` skill tags every change artifact with `change/<name>` and `status/<active|archived>`. That tagging is redundant: the folder path already encodes the change name (`openspec/changes/<name>/...`) and the archive status (`.../archive/2026-MM-DD-<name>/...`). The current artifact filenames are also flat (`proposal.md`, `design.md`, `tasks.md`) — easy to confuse across changes and hard to read inside Obsidian, where the file *is* the note title. The skill should tag by subject and name artifacts by their purpose in the change, not by their generic role.

## What Changes

- Update `.agents/skills/openspec-vault-link/SKILL.md`:
  - Drop the `change/<name>` and `status/<active|archived>` frontmatter tags. The folder path is the source of truth for those.
  - Replace them with subject-based tags where useful: `topic/<subject>` (e.g., `topic/cve`, `topic/pr-review`) and the existing `capability/<name>` tag.
  - Document the new artifact naming convention: each change folder uses subject-prefixed filenames that describe the artifact's purpose inside the change (e.g., `add-update-pr-description-skill/why.md`, `add-update-pr-description-skill/how.md`, `add-update-pr-description-skill/tasks.md`).
  - Update the MOC template in `openspec/INDEX.md` and any wikilink examples to match the new convention.
  - Add a forward-only rule: the new naming applies to *new* changes going forward. Existing archived changes keep their flat `proposal.md`/`design.md`/`tasks.md` filenames (no rename, no broken wikilinks).
- Update the new artifact naming convention in any skill that generates artifacts (the `openspec-propose` template is already generic — only the example wording needs to shift).
- Update the canonical `openspec/specs/obsidian-vault-integration/spec.md` to reflect the new tagging and naming rules.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `obsidian-vault-integration`: Remove the implicit `change/<name>` and `status/<active|archived>` tag rule (it was never explicitly stated, only enforced by the skill); add explicit rules for subject-based tags and subject-prefixed artifact filenames, with a forward-only grandfather clause for existing archived changes.

## Impact

- Files modified:
  - `.agents/skills/openspec-vault-link/SKILL.md` (tag scheme, naming convention, examples, INDEX template)
  - `openspec/specs/obsidian-vault-integration/spec.md` (sync from delta)
  - `.agents/skills/openspec-propose/SKILL.md` (example wording for the new naming convention, if it embeds any)
  - `openspec/INDEX.md` (MOC template inside the skill body — only the textual example, not the actual file's existing entries)
- Files added: none.
- Files renamed: none in this change. Forward-only means existing archives are left as-is.
- Files retroactively affected: existing archived changes keep their old `proposal.md`/`design.md`/`tasks.md` names. The grandfathe clause prevents mass rename and broken wikilinks.
- No production code change, no package manifests, no CI workflows, no MCP changes.

## Security Considerations

- **Threat model summary.** Pure documentation/skill refactor. No new dependencies, no credentials, no new network surface.
- **Affected data and trust boundaries.** Same trust boundary as before (local worktree → `api.github.com` for vault linking). The skill body itself is the only thing that changes; runtime behavior is unchanged for already-archived changes.
- **Mitigations.** Forward-only rule prevents retroactive mass rewrites of archive notes (which would invalidate wikilinks inside those notes and inside the MOC). New changes will use the convention from day one.
- **Residual risk.** Low. No CRITICAL or HIGH findings anticipated; no override required.