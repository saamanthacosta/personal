# Commit Style

Rule reference for commits in the `Personal/` workspace. The full rules live inline in `.agents/skills/commit/SKILL.md`; this file is the human-facing index that points to the verifier and shows concrete examples.

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