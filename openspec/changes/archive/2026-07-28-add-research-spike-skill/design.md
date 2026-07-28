## Context

The personal skills library at `Personal/.agents/skills/` currently has 16 skills organised around four concerns: OpenSpec lifecycle, commit/PR delivery, security/CVE, and Obsidian vault integration. None of them produces a "research note" deliverable — every existing skill either drives a code change (open/apply/archive), packages one (commit, create-pr, cve-scan), or wires one into the vault (openspec-vault-link).

`openspec-explore` is the closest analogue and is often reached for when the user wants to "think through X". But its output is a code/PR-shaped proposal: it expects a change to materialise and frames its deliverable around OpenSpec artifacts. A research investigation that ends in a synthesis note, a bibliography delta, and a recommendation — with no PR in sight — does not fit that mould.

`BACKLOG.md` Tier 1 already captures this gap as `[T1] Skill: research-spike (Personal)`. The corresponding T1 items in mestrado-uff (`latex-paper-draft`, `bibtex-curate`, `paper-citation-audit`) explicitly compose with this skill; path-based hand-off is the chosen coupling so neither side has to import the other's repo.

This change lands `research-spike` in Personal and wires the new skill into `agent-skill-library` so future audits of the shared library find it.

## Goals / Non-Goals

**Goals:**

- Ship `research-spike` as a standalone skill at `Personal/.agents/skills/research-spike/SKILL.md` following the existing frontmatter, name, and body conventions.
- Make the deliverable shape unambiguous: a synthesis note with a fixed section template, never a change proposal.
- Give the user an explicit depth knob (`quick scan` vs `deep read`) so the cost of running the skill matches the question's stakes.
- Make the bibliography delta portable: BibTeX block for downstream LaTeX tooling, Obsidian wikilinks for downstream note work.
- Land a hand-off contract with `latex-paper-draft` that does not require either side to import the other.

**Non-Goals:**

- Adding an arXiv, DOI, or SemanticScholar resolver. The skill trusts URLs the user provides and uses the existing OpenCode web fetch tool only when the user opts in per source.
- Auto-tagging or auto-linking existing vault notes beyond the user-cited wikilinks. No graph traversal, no backlink inference.
- A web UI, a CLI wrapper, or any persistent daemon. The skill is a prompt-shaped artifact consumed by OpenCode.
- A formal evaluation harness or test suite. Acceptance is by manual review against the acceptance criteria in `BACKLOG.md`.
- Coupling to `latex-paper-draft` at the implementation level. The contract is path-shaped and unidirectional.

## Decisions

### D1 — Synthesis note as the canonical artifact

The skill writes a single Markdown file with YAML frontmatter and a fixed section order: Question, What I looked at, What I found, Open questions, Recommended next step. No alternative output formats.

**Alternatives considered:**

- *Multiple files (one per section).* Rejected — splits context that the user reads as a unit; complicates the path hand-off.
- *Structured JSON for downstream tooling.* Rejected — locks the artifact into a schema and forces every consumer to parse it. Markdown is human-first; tooling can extract bib blocks with a regex.

### D2 — Two-level depth knob

`quick scan` produces 5–10 sources with paragraph-level synthesis. `deep read` produces 20–40 sources with claim-by-claim synthesis and explicit evidence trails. No intermediate level.

**Alternatives considered:**

- *Three levels (`quick scan` / `survey` / `deep read`).* Rejected — middle level has no clear behavioural differentiator and creates ambiguity in the depth knob's contract.
- *Continuous budget-based knob ("spend ~30 min on this").* Rejected — flexible in principle, opaque in practice; users do not calibrate their actual time budget well, and the resulting note's reliability becomes hard to judge.

### D3 — Hybrid interaction: structured interview + opt-in fetch

The skill always runs a structured interview about what the user already knows and has read. Web fetch is offered per source and only fires after explicit user confirmation. Fetched content is summarised, never quoted at length, never executed.

**Alternatives considered:**

- *Pure fetch.* Rejected — assumes the user has no prior context and makes the skill noisy on every invocation. Also expands the trust surface unnecessarily.
- *Pure interview.* Rejected — leaves the user doing the most valuable legwork (paper lookup) alone.

### D4 — Path-based hand-off to `latex-paper-draft`

The synthesis note lives at a user-specified filesystem path. `latex-paper-draft` (when implemented) will accept that path as input. No shared protocol, no schema, no remote call.

**Alternatives considered:**

- *Vault-mediated hand-off.* Rejected — forces `latex-paper-draft` to live near the vault and to know vault conventions. Path-based keeps the two skills decoupled and respects Decision 5 in `BACKLOG.md` (LaTeX skills live in mestrado-uff, not Personal).
- *Defer the hand-off contract.* Tempting, but the path-based contract is cheap to specify now and prevents the synthesis note's structure from drifting in a way that would surprise the consumer.

### D5 — Bibliography delta: BibTeX block + wikilinks, not either/or

Each cited source gets both a BibTeX entry in the note's `## Bibliography` block and a wikilink to the corresponding literature note (creating the note on demand if it does not exist). The duplication is intentional: BibTeX is the consumable shape for LaTeX; wikilinks are the consumable shape for the vault.

**Alternatives considered:**

- *BibTeX block only.* Rejected — loses the vault-side graph connection, which the user uses to navigate research.
- *Wikilinks only.* Rejected — forces `latex-paper-draft` to resolve wikilinks to bib entries, which is a separate skill's job (`bibtex-curate`).
- *Standalone `.bib` file append.* Rejected — requires the skill to know about a specific file path inside `mestrado-uff`. Violates D4.

### D6 — Default destination is the Obsidian vault

The default output path is `20-research/spikes/<YYYY-MM-DD>-<slug>.md` inside the vault, where `<slug>` is derived from the research question. The user can override the path; the override is remembered for the rest of the session.

**Alternatives considered:**

- *Plain filesystem only.* Rejected — misses the vault graph affordances and ignores the existing `.obsidian/` integration work.
- *Prompt at runtime: vault or filesystem?* Tempting but adds a question to every invocation. The vault is the overwhelmingly common case for this skill.

## Risks / Trade-offs

- **[Risk]** The synthesis note's section template may feel rigid for unusual research questions. → **Mitigation**: the skill explicitly invites the user to add or rename sections after the note is written; the template is a starting shape, not a straitjacket.
- **[Risk]** Web fetch may surface low-quality or hostile content that the skill summarises misleadingly. → **Mitigation**: fetch is opt-in per source, fetched content is treated as untrusted, and the skill surfaces a "Source quality: unknown" note on every fetched source so the user can audit.
- **[Risk]** The BibTeX block format may not match the user's preferred style (IEEE, ACM, ABNT). → **Mitigation**: the skill produces a baseline BibTeX entry per source with the standard fields; the user post-edits style. `bibtex-curate` (a separate T1 skill) handles style normalisation downstream.
- **[Risk]** Hand-off to `latex-paper-draft` may be over- or under-specified once that skill ships. → **Mitigation**: the contract is minimal (path only); both sides can evolve independently as long as the path carries a well-formed synthesis note.
- **[Risk]** Wikilinks to non-existent literature notes create dangling links. → **Mitigation**: the skill creates a stub literature note (frontmatter + title only) when a source is first cited, so the wikilink resolves. The user fills in the body later.

## Migration Plan

1. Land `Personal/.agents/skills/research-spike/SKILL.md` together with the two spec deltas in a single PR.
2. Run `openspec-archive-change` so `add-research-spike-skill` moves into `openspec/changes/archive/` and the `research-spike` capability lands at `openspec/specs/research-spike/spec.md`; the `agent-skill-library` requirement delta lands at `openspec/specs/agent-skill-library/spec.md`.
3. Update `BACKLOG.md` so the `[T1] Skill: research-spike (Personal)` item moves to the "done" treatment (archive reference, removed from the active list). This is a separate housekeeping PR — out of scope here.
4. No external consumer migration required: the skill is added; no existing skill changes shape.

## Open Questions

- **Vault folder convention**: `20-research/spikes/` is a PARA-style guess. The user's vault may use a different convention (e.g., `notes/research/`, `0-research/`). Decision deferred to first real-world run; the skill exposes the path as a configurable option so the user can override without code changes.
- **Lit-note stub shape**: the stub literature note created on first cite is currently frontmatter-only with a `title` property. Should it also carry `tags`, `status`, or `type` properties? Decision deferred to first real-world run.
- **BibTeX field defaults**: baseline fields are `author`, `title`, `year`, `url`, `note = {accessed YYYY-MM-DD}`. The `note` field convention is debated across styles; can be revisited if it conflicts with downstream tooling.

## Security Considerations

This design introduces one skill (no executable code) and one spec delta (no executable code). The threat model in `proposal.md` §Security applies; design adds no new surface.

- **Data touched**: synthesis notes (text), bib blocks (text), optional literature-note stubs (text). All user-readable.
- **Trust boundaries crossed**: optional web fetch only, on explicit user opt-in per source.
- **Third-party trust**: OpenCode's built-in web fetch tool. No new external service.
- **Persistence**: synthesis note + bib block + optional lit-note stubs written to user-specified path inside the vault. No secret material.
- **Privilege surfaces**: none.
- **Override requests**: none required.

Residual risk: low. The skill's user-facing surface is two-fold — interview questions and a delivered note — both of which the user reads and audits directly before any downstream use.
