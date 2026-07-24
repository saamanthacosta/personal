# Commit Style

Rule summary for the `commit` skill. The skill enforces this when staging and committing changes.

## Title

- Maximum 30 characters.
- Use present tense, imperative mood: `Add`, `Fix`, `Update`, `Remove`, `Refactor`.
- No trailing period.
- No ticket prefix unless the current branch explicitly carries one (e.g. `DOS-1234`) — in that case the skill handles prefixing.

## Body

- Skip the body when the title is enough.
- When more context is needed, split the body into paragraphs. One paragraph = one continuous phrase.
- Never soft-wrap a paragraph. Each paragraph is a single line; do not break a phrase across lines for visual width.
- Use a blank line to separate paragraphs. A blank line is the only signal for a new paragraph.
- Prefer one paragraph per idea. Multiple paragraphs are fine when the change has distinct contexts.

## Examples

Not acceptable — title too long:

```
Add unit tests for all components in the Field directory with proper mocking
```

Not acceptable — body phrases broken across lines:

```
Description of the commit in here
We break the line and continue to a new paragraph, but then
we break the line again just to keep that previous phrase, and it
shouldn't because it's the same phrase yet.
We only break lines to create a new paragraph.
```

Acceptable — short title, paragraphs kept as single lines:

```
Add Field component tests

Cover the new validation rules and the disabled state.
Mock the network layer so the tests stay fast.
```

Acceptable — short title, no body needed:

```
Fix off-by-one in pagination
```

Acceptable — title with branch prefix when the branch carries one:

```
DOS-1234 Add Field component tests
```
