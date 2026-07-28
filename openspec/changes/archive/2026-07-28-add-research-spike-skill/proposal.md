## Why

Academic and technical investigations currently have no bounded skill in the personal library. `openspec-explore` produces PR-shaped artifacts and `openspec-propose` formalizes a code change; neither fits "investigate X and report" work that ends in a synthesis note rather than a change proposal. This change introduces `research-spike` for that gap, with a deliberate hand-off contract to `latex-paper-draft` (mestrado-uff) once a user decides to write up the findings.

## What Changes

- Add a new skill `research-spike` at `Personal/.agents/skills/research-spike/SKILL.md`.
- The skill accepts a research question in natural language and produces a synthesis note (YAML frontmatter + structured sections) plus a bibliography delta (BibTeX block + Obsidian wikilinks).
- Two depth levels: `quick scan` (5–10 sources, ~10 min effort) and `deep read` (20–40 sources, claim-by-claim synthesis).
- Default note destination: Obsidian vault at `20-research/spikes/`; path is configurable.
- Interaction model: structured interview core; web fetch is opt-in per source.
- Hand-off contract: path-based — `latex-paper-draft` (when implemented) consumes the synthesis path as input.
- `agent-skill-library` capability gains one requirement acknowledging `research-spike` as an approved library member.

## Capabilities

### New Capabilities

- `research-spike`: bounded investigate-and-report skill producing a synthesis note + bibliography delta in an Obsidian vault. Composes with `latex-paper-draft` via path-based hand-off.

### Modified Capabilities

- `agent-skill-library`: add `research-spike` to the approved shared-library inventory, asserting valid frontmatter, unique name, and conformance to `skill-authoring` conventions.

## Impact

- New file `Personal/.agents/skills/research-spike/SKILL.md` — skill body and frontmatter.
- New file `Personal/openspec/changes/add-research-spike-skill/specs/research-spike/spec.md` — behavioral contract.
- New file `Personal/openspec/changes/add-research-spike-skill/specs/agent-skill-library/spec.md` — delta adding `research-spike` to the approved inventory.
- New file `Personal/openspec/changes/add-research-spike-skill/tasks.md` — implementation steps.
- No external API change, no new dependency, no new trust surface beyond the optional web fetch already supported by OpenCode tools.
- No coupling to `latex-paper-draft` at the implementation level — the contract is path-shaped and unidirectional (research-spike writes; latex-paper-draft will read).

## Security Considerations

- **Threat model summary**: the skill is local-only by default; it reads user prompts and writes synthesis notes to a user-specified path inside the Obsidian vault. The only trust boundary is the optional web fetch, which fires per source on user opt-in. Fetched content is treated as untrusted and the skill summarizes, never executes or quotes at length.
- **Affected data and trust boundaries**: (1) user research prompt (trusted, user-authored); (2) optionally fetched URLs (untrusted, public web); (3) Obsidian vault contents already under user control (trusted, local). No PII is collected or transmitted unless the user supplies it in the prompt.
- **Dependencies**: no new dependency. Optional web fetch uses the existing OpenCode tool; no arXiv/DOI resolver is introduced (deferred to a future change if added).
- **Persistence**: synthesis notes + bib blocks are written to the user-specified path. Default is `20-research/spikes/` inside the vault. No secret material is read or written.
- **Auth, sessions, privileges**: none. The skill does not authenticate, store sessions, or touch privilege boundaries.
- **Mitigations**: web fetch is opt-in per source, never automatic. The skill does not execute fetched content (no shell, no eval, no template expansion). The skill surfaces a clearly-labelled bibliography block so the user can audit citations before any downstream use.
- **Residual risk**: low. The skill inherits the user's filesystem trust posture (a malicious synthesis note written to a sensitive path is the user's own action). The skill explicitly disclaims responsibility for the truth of cited sources — that judgement stays with the user.
- **Override requests**: none required.
