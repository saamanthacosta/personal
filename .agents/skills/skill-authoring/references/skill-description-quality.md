---
title: Agent Skills — description quality
source: https://agentskills.io/skill-creation/optimizing-skill-descriptions.md
captured: 2026-08-03
purpose: Rules for the frontmatter `description` field — the part that decides whether a skill is ever loaded. Used by `skill-authoring` when authoring or retuning a skill.
---

# Agent Skills — description quality

A skill's `description` is the only signal most agents use to decide whether
to load it. A missing or weak description makes the skill effectively
invisible; an over-broad one causes false-positive matches on unrelated
prompts. The rules below are the contract the description has to satisfy.

## What the description must cover

- **What the skill does** — the artefact it produces or the operation it
  performs.
- **When to trigger it** — the prompts, filenames, or commands the user is
  likely to say.

A description that only covers *what* is fragile. One that only covers
*when* is vague. Both are required.

## Style

- **Third person.** "Use when the user wants to..." — not "I help with...".
- **Front-loaded triggers.** Filenames, command names, and concrete phrases
  the user is likely to type should appear early so matching is robust.
- **Scope gating.** When a skill is intentionally narrow, use "Use ONLY
  when..." to suppress false-positive matches on adjacent topics.
- **One description per skill.** A skill is loaded as a unit; multiple
  descriptions do not exist.

## Length

Keep the description to one or a few sentences. Long descriptions get
truncated by clients and dilute the trigger signal. Move deep "how" content
to the body and the spec details to `references/`.

## When to retune

Retune the description when:

- The skill is being added, removed, or renamed.
- The user reports the skill is firing on unrelated prompts (false
  positives) or never firing when it should (false negatives).
- The skill's scope has narrowed (add "Use ONLY when...") or widened
  (drop the gate).

## Related

- `skill-format-spec.md` — the recognised frontmatter fields.
- `skill-creation-practices.md` — body content and the eval-driven loop
  used to validate description changes.
