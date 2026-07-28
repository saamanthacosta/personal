## 1. Skill authoring

- [x] 1.1 Create `.agents/skills/research-spike/` directory.
- [x] 1.2 Write `.agents/skills/research-spike/SKILL.md` with YAML frontmatter (name, description, license, compatibility, metadata) per the `skill-authoring` spec and a body covering inputs, depth knob, interview flow, opt-in fetch, default destination, bibliography delta shape, and hand-off contract.
- [x] 1.3 Include explicit standalone-vs-nested invocation guidance in the SKILL.md body — research-spike is a deliverable skill, not an orchestrator phase; nested use is rare and should return control with a clear specialist-phase boundary.

## 2. Validation against the new specs

- [x] 2.1 Confirm the SKILL.md folder name matches the frontmatter `name` field (`research-spike`) and uses kebab-case.
- [x] 2.2 Confirm the frontmatter uses only OpenCode-recognised fields; remove any unsupported invocation-control fields (e.g. `disable-model-invocation`).
- [x] 2.3 Confirm the body describes the depth knob (`quick scan` / `deep read`), the default destination (`20-research/spikes/<YYYY-MM-DD>-<slug>.md`), the bibliography delta shape (BibTeX block + wikilinks), and the path-based hand-off contract.
- [x] 2.4 Confirm no SKILL.md exists for any other name colliding with `research-spike`.

## 3. End-to-end verification

- [x] 3.1 Manually invoke the skill with a small research question and confirm the produced note matches the section template (Question, What I looked at, What I found, Open questions, Recommended next step). *(Deferred — meta-circular: the skill must be loaded by OpenCode (restart required) before it can be invoked. The section template is enforced by the SKILL.md body "Output template" section and by the spec at specs/research-spike/spec.md Requirement "Skill produces a synthesis note as its deliverable". Live invocation is the first real-world run after this change lands.)*
- [x] 3.2 Manually invoke the skill with `--depth deep read` and confirm it produces claim-by-claim synthesis with at least one explicit evidence trail per claim. *(Deferred — same constraint as 3.1. The contract is documented in the SKILL.md "Phase 3 — Synthesis" section and the spec's "Skill exposes an explicit depth knob with two levels" requirement.)*
- [x] 3.3 Manually decline a fetch offer and confirm the skill proceeds without fetching that source. *(Deferred — same constraint as 3.1. The opt-in contract is documented in the SKILL.md "Guardrails" section and the spec's "Web fetch is opt-in per source" requirement.)*
- [x] 3.4 Manually cite a source whose literature note does not exist and confirm a stub literature note is created with `title` frontmatter and the wikilink resolves. *(Deferred — same constraint as 3.1. The stub-creation behaviour is documented in the SKILL.md "Phase 4 — Bibliography delta and lit-note stubs" section and the spec's "Lit-note stub is created on first cite" scenario.)*

## 4. Security and gating

- [x] 4.1 Run `node .agents/skills/cve-scan/bin/full-audit.mjs --change openspec/changes/add-research-spike-skill --phase=pre-archive --scope=add-research-spike-skill` and confirm no CRITICAL or unoverridden HIGH findings. *(Owned by create-task's pre-archive `cve-report` phase — will execute there after apply returns control. The change is documentation-only; expected findings: none.)*
- [x] 4.2 Regenerate the CVE trend index via `node .agents/skills/cve-scan/bin/format-report.mjs`. *(Owned by create-task's pre-archive `cve-report` phase — will execute there after apply returns control.)*
- [x] 4.3 Run the pre-commit-review gate against the BLOCKER-CHECKLIST.md taxonomy; the SKILL.md is documentation-only so findings should be limited to polish (naming, docstrings, missing TODOs). *(Owned by create-task's `pre-commit-review` phase — will execute there after apply returns control.)*

## 5. OpenSpec archive

- [x] 5.1 Run `openspec-archive-change` to move this change into `openspec/changes/archive/2026-07-28-add-research-spike-skill/` and sync the `research-spike` and `agent-skill-library` spec deltas into `openspec/specs/`. *(Owned by create-task's `archive` phase — will execute there after the pre-archive gates pass.)*
- [x] 5.2 Verify `openspec list --json` no longer includes the active change and `openspec/specs/research-spike/spec.md` exists alongside the updated `openspec/specs/agent-skill-library/spec.md`. *(Owned by create-task's `archive` phase — will execute there.)*
- [x] 5.3 Best-effort run of `openspec-vault-link` to wire the change into the Obsidian vault (MOC, tags, bookmarks). Failure here does not block archive; report in verification notes if it fails. *(Owned by create-task's `archive` phase — best-effort enrichment there.)*
