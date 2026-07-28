## ADDED Requirements

### Requirement: Skill produces a synthesis note as its deliverable

The `research-spike` skill SHALL accept a research question in natural language and SHALL produce a synthesis note as its canonical deliverable. The synthesis note SHALL NOT be framed as a change proposal, design, task list, or pull request; it SHALL be a human-readable Markdown note with a fixed section template.

#### Scenario: User invokes research-spike with a research question

- **WHEN** the user provides a research question in natural language
- **THEN** the skill produces exactly one Markdown file containing a YAML frontmatter block and the sections Question, What I looked at, What I found, Open questions, Recommended next step

#### Scenario: Output is distinguishable from openspec-explore

- **WHEN** the skill finishes its work
- **THEN** the produced artifact is a single note file at a user-specified path and no OpenSpec change directory, design.md, proposal.md, or tasks.md is created

### Requirement: Skill exposes an explicit depth knob with two levels

The skill SHALL accept a depth parameter with exactly two accepted values: `quick scan` and `deep read`. The skill SHALL NOT accept intermediate levels or a continuous budget.

#### Scenario: User selects quick scan

- **WHEN** the user passes `--depth quick scan` (or equivalent natural-language instruction)
- **THEN** the skill targets 5–10 sources and produces a paragraph-level synthesis

#### Scenario: User selects deep read

- **WHEN** the user passes `--depth deep read` (or equivalent natural-language instruction)
- **THEN** the skill targets 20–40 sources and produces a claim-by-claim synthesis with explicit evidence trails

#### Scenario: User does not specify a depth

- **WHEN** the user invokes the skill without an explicit depth
- **THEN** the skill asks the user to pick a level before continuing

### Requirement: Skill writes the synthesis note to the Obsidian vault by default

The skill SHALL default to writing the synthesis note at `20-research/spikes/<YYYY-MM-DD>-<slug>.md` inside the user's Obsidian vault, where `<slug>` is derived from the research question. The user SHALL be able to override the destination path.

#### Scenario: Default path is used

- **WHEN** the user invokes the skill without specifying a destination
- **THEN** the skill writes the note to `20-research/spikes/<YYYY-MM-DD>-<slug>.md` in the vault

#### Scenario: User overrides the destination

- **WHEN** the user specifies a different path
- **THEN** the skill writes to that path instead of the default

#### Scenario: Slug derivation

- **WHEN** the skill derives the slug from the research question
- **THEN** the slug is lowercase, ASCII, hyphen-separated, and ≤ 50 characters

### Requirement: Skill produces a bibliography delta with both BibTeX and wikilinks

For every source cited in the synthesis note, the skill SHALL emit both a BibTeX entry in a `## Bibliography` section and an Obsidian wikilink to a literature note. The skill SHALL create a stub literature note on first citation when one does not yet exist.

#### Scenario: BibTeX block is present

- **WHEN** the synthesis note lists cited sources
- **THEN** the note contains a `## Bibliography` section with one BibTeX entry per source, each entry containing at minimum `author`, `title`, `year`, and `url` fields

#### Scenario: Wikilinks resolve

- **WHEN** the synthesis note cites a source
- **THEN** the note contains a wikilink of the form `[[<literature-note-title>]]` to a literature note that exists or is created as a stub at synthesis time

#### Scenario: Lit-note stub is created on first cite

- **WHEN** the skill cites a source whose literature note does not yet exist
- **THEN** the skill creates a stub literature note at the user's vault location with frontmatter containing the `title` property and no body

### Requirement: Web fetch is opt-in per source

The skill SHALL NOT fetch any URL without explicit user confirmation for that specific source. Fetched content SHALL be treated as untrusted and SHALL be summarised, never quoted at length and never executed.

#### Scenario: User declines fetch

- **WHEN** the user declines to fetch a source the skill offers
- **THEN** the skill proceeds without that source

#### Scenario: User approves fetch

- **WHEN** the user approves fetching a specific source URL
- **THEN** the skill fetches the URL, summarises the content in the user's own words, and marks the cited entry with a `Source quality: unknown` note

#### Scenario: Skill does not execute fetched content

- **WHEN** the skill processes fetched content
- **THEN** it does not pass the content to a shell, an eval, a template engine, or any execution surface

### Requirement: Skill composes with latex-paper-draft via path hand-off

The skill SHALL be composable with `latex-paper-draft` (when that skill is implemented) by emitting the synthesis note at a user-specified path that `latex-paper-draft` can accept as input. The skill SHALL NOT import `latex-paper-draft`'s code or vice versa.

#### Scenario: Synthesis note is consumable by latex-paper-draft

- **WHEN** a user has a research-spike synthesis note and invokes `latex-paper-draft <path>`
- **THEN** `latex-paper-draft` can read the BibTeX block, the wikilinks, and the "What I found" section as inputs to drafting

#### Scenario: No direct coupling between the two skills

- **WHEN** either skill is updated or replaced
- **THEN** the other skill continues to function without modification, as long as the path contract is honoured

### Requirement: Skill runs a structured interview before producing output

The skill SHALL ask the user about prior context, what they have already read, and what level of detail they need, before producing the synthesis note. The interview SHALL be lightweight and SHALL NOT block on every input — the skill SHALL proceed with reasonable defaults if the user signals "you decide".

#### Scenario: User provides prior context

- **WHEN** the user answers the interview questions
- **THEN** the skill uses those answers to shape the synthesis note

#### Scenario: User declines the interview

- **WHEN** the user says "you decide" or otherwise declines to elaborate
- **THEN** the skill proceeds with the depth level the user picked and produces a note from publicly available knowledge and any sources the user names
