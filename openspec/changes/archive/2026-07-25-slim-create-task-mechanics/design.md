## Context

The `create-task` skill is the workspace's primary orchestrator for implementation tasks. It owns a workflow lifecycle (`preflight → explore → propose → apply → verify → archive → cve-report → commit → push → pr`) and delegates bounded phases to specialist skills (`openspec-*`, `commit`, `create-pr`, `cve-scan`).

The skill has grown to 514 lines, ~4.7× the median personal skill. The bulk is mechanics — bash recipes, output format templates, recovery procedures — that the orchestrator only needs at specific phases. Mechanics bloat every load; policy should be in-head but recipes shouldn't.

The current design is intentional and correct: create-task is self-contained for policy and contracts, with specialist skills authoritative for their own methodology. The bloat is not the design — it is that mechanics live inline when they should be on-demand.

One true duplication exists: §4.1 inlines the CVE threat-model prompts that already live in `openspec-explore`. This becomes a pointer.

## Goals / Non-Goals

**Goals:**
- Reduce `create-task` SKILL.md from 514 to ≤ 220 lines.
- Extract per-phase mechanics to `docs/task-workflow.md` (single file, organized by phase).
- Preserve every orchestration gate, contract, and never-list rule.
- Keep the orchestrator's interface contracts with specialists inline (the partial view the orchestrator needs to invoke them).
- De-duplicate the CVE threat-model prompts via a pointer to `openspec-explore`.
- Replace the TBD Purpose line in `task-orchestration/spec.md` with a real statement.
- Verify behavior preservation via smoke test.

**Non-Goals:**
- Convert `create-task` to an agent (workflow is sequential + stateful; skill is the right mechanism).
- Slim the other 9 personal skills (each is already 70–290 lines; this refactor is `create-task`-specific).
- Touch the documentation precedent for `docs/skills-folder.md` (deferred to a separate chore).
- Modify any requirement in `task-orchestration` (the Purpose line replacement is metadata, not a requirement change).
- Restructure the OpenSpec archive workflow or vault-link workflow.

## Decisions

### 1. The line between policy and mechanics

The skill body holds what the orchestrator must remember throughout the workflow: types, slugs, phase model, approval gates, gate logic, visible checkpoint format, and the never-list.

The doc holds what the orchestrator needs at a specific phase: bash recipes, scan commands, format templates, recovery recipes.

**Mixed sections (e.g. §3.4 archive gate, §4.4 CVE interface, §5.x phase mechanics) are split** — the policy half stays in the skill, the mechanics half moves to the doc. Wholesale section moves are rejected because they drop gates the orchestrator needs in-context.

### 2. Doc organization: by phase, single file

A single file at `docs/task-workflow.md`, organized by the workflow phase the model is currently in. The skill's preamble points to it and the model reads it once at workflow start.

**Single file over per-phase split** because the model navigates a single ~310-line document more cheaply than a directory of files. Trivial navigation gain does not justify per-file overhead.

### 3. §4.1 becomes a pointer, not a removal

The current §4.1 inlines the CVE threat-model prompts. The fix is not removal — it is replacement with a pointer that names the authoritative source (`docs/cve-methodology.md`) and reminds the orchestrator to gate-check completion. The prompts stay in the methodology doc; `create-task` remains the gate.

A discovery during implementation: the prompts in the original §4.1 are actually a mixture of:
- The five threat-model questions canonically owned by `docs/cve-methodology.md` (data, trust boundaries, third-party trust, persistence, privilege escalation).
- One orchestrator-specific prompt (Specialist handoff) that is not a CVE question.

The new §3.1 references the five methodology questions by number and keeps the orchestrator-specific sixth prompt inline. This keeps the duplication surface to zero for the methodology questions while preserving the create-task-specific gate item.

### 4. Preflight refinement: split dirty-worktree buckets

The current `create-task` §2.4 treats dirty worktree as a single bucket. The preflight refines this into three buckets each checked independently:

- **Staged** (`git diff --cached --stat`) — if non-empty, stash before branch switch.
- **Unstaged** (`git diff --stat`) — if non-empty, stash before branch switch.
- **Untracked** (`git ls-files --others --exclude-standard`) — if non-empty, stash with `--include-untracked`, or commit on the current branch first.

This catches the case where a user has staged one change and unstaged another — the current skill would either refuse or stash the whole lot, but the refined version checks each bucket.

This refinement is captured in `docs/task-workflow.md` under "Phase: preflight".

### 5. `task-orchestration` Purpose line replacement is metadata, not a spec change

The TBD Purpose line is document metadata, not a `### Requirement`. The proposal's `Modified Capabilities` is therefore empty. The Purpose update is captured as a separate apply task and the modification is a direct edit to the canonical spec, not a delta-spec sync.

## Risks / Trade-offs

- **Drift between skill policy and doc mechanics** → The skill's preamble explicitly references the doc. The smoke test runs through both files in a single workflow, surfacing any drift immediately.
- **Extra file read at workflow start** → One additional `Read` tool call amortized across the entire workflow. Negligible cost.
- **Mixed sections might be split incorrectly** → The split is verified by the smoke test: each phase must produce the same output format as before, with the same gates firing.
- **Vault-link hygiene degrades** → This refactor moves the workflow doc to `docs/`, not under `openspec/`. The doc is not part of the OpenSpec MOC. Acceptable for now; can be revisited if retrieval patterns suffer.
- **Skill discovery might re-pick the wrong file** → The skill loader resolves by folder name, not content. As long as `create-task/SKILL.md` exists, the loader finds it. The doc is a read-by-path, not a skill.

## Migration Plan

This is a single-PR refactor with no external surface change. Migration is implicit:

1. Land `refactor/slim-create-task-mechanics` with the slim skill + new doc.
2. The next `create-task` invocation naturally reads both files.
3. No config changes, no environment changes, no documentation link rot.

**Rollback**: revert the merge commit. The skill returns to its previous self-contained form. No data migration is involved.

## Open Questions

- None. The four key decisions (line, doc organization, §4.1 pointer, preflight refinement) are all settled. The Purpose line replacement is a separate cosmetic task.
