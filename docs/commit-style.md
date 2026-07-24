# Commit Style

Rule for commits and pull-request titles in the `Personal/` workspace. The `commit` skill under `.agents/skills/commit/` enforces the same rules interactively, and `scripts/verify-commit.py` re-checks HEAD programmatically.

## Title

- Maximum 30 characters including any prefix.
- Present tense, imperative mood: `Add`, `Fix`, `Update`, `Remove`, `Refactor`.
- No trailing period.
- If the branch name begins with a ticket prefix, include it inside the 30-character budget.

## Body

- Skip the body when the title is enough.
- One paragraph per idea. A paragraph is a single continuous line.
- Never soft-wrap a paragraph. Do not break a phrase across lines.
- Use a blank line to separate paragraphs. The blank line is the only paragraph separator.

## Format

```
<title up to 30 chars>

<paragraph 1, single line>

<paragraph 2, single line>
```

## Verifier

`scripts/verify-commit.py` reads the latest commit from HEAD and exits with status `0` when it follows the rules, `1` otherwise. Wire it into `pre-commit` or a CI step to enforce the rule.

```text
python3 scripts/verify-commit.py
```

## Examples

```text
Add Field component tests

Cover the new validation rules and the disabled state.
Mock the network layer so the tests stay fast.
```

```text
Fix off-by-one in pagination
```

```text
DOS-1234 Add Field component tests
```
