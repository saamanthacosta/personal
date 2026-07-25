#!/usr/bin/env python3
"""Verify that HEAD's commit message matches the Personal/ workspace commit style.

Rules:
- Title: maximum 30 characters, present tense imperative, no trailing period.
- Body: optional; paragraphs are single lines, separated by blank lines only.
"""

from __future__ import annotations

import re
import subprocess
import sys
from typing import List, Tuple

MAX_TITLE_LENGTH = 30
IMPERATIVE_VERBS = {
    "add", "allow", "archive", "bump", "change", "clean", "clear", "close", "commit",
    "consolidate", "convert", "create", "deprecate", "disable", "disallow", "document",
    "drop", "enable", "exclude", "extract", "fix", "ignore", "implement", "improve",
    "include", "introduce", "keep", "limit", "mark", "merge", "migrate", "move",
    "note", "prepare", "publish", "rebuild", "reconcile", "reduce", "refactor",
    "remove", "rename", "reopen", "replace", "reset", "resolve", "restore", "retry",
    "revert", "rewrite", "sanitize", "scope", "set", "share", "split", "stage",
    "stop", "support", "switch", "sync", "test", "track", "trim", "unify", "untrack",
    "update", "upgrade", "use", "verify", "wire",
}


def parse_commit(raw: str) -> Tuple[str, List[str]]:
    raw = raw.replace("\r\n", "\n")
    lines = raw.split("\n")
    title = lines[0] if lines else ""
    body_lines: List[str] = []
    for line in lines[1:]:
        if line.strip():
            body_lines.append(line)
    return title, body_lines


def validate_title(title: str) -> List[str]:
    errors: List[str] = []
    if not title:
        errors.append("title is missing")
        return errors
    if len(title) > MAX_TITLE_LENGTH:
        errors.append(f"title exceeds {MAX_TITLE_LENGTH} characters ({len(title)}): '{title}'")
    if title.endswith((".", "!", "?")):
        errors.append("title must not end with punctuation")
    first_word = title.split(maxsplit=1)[0].lower() if title else ""
    first_word = re.sub(r"[^a-z]", "", first_word)
    if first_word and first_word not in IMPERATIVE_VERBS:
        if first_word.isupper():
            errors.append(
                "title is in all-caps; use sentence case with an imperative verb (e.g. 'Add workspace tooling')"
            )
        else:
            errors.append(
                f"title should start with a present-tense imperative verb (got '{first_word}')"
            )
    return errors


def validate_body(body_lines: List[str]) -> List[str]:
    errors: List[str] = []
    for index, line in enumerate(body_lines, start=1):
        if "\t" in line:
            errors.append(f"body paragraph {index} contains a tab; reformat as a single line")
    paragraphs = "\n".join(body_lines)
    if "\n\n" in paragraphs:
        errors.append("body contains blank lines between paragraphs; remove the soft-wraps")
    return errors


def main() -> int:
    result = subprocess.run(
        ["git", "log", "-1", "--pretty=%B"],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        print("[verify-commit] unable to read HEAD commit message", file=sys.stderr)
        return 2
    title, body = parse_commit(result.stdout)
    errors: List[str] = []
    errors.extend(validate_title(title))
    errors.extend(validate_body(body))
    if errors:
        print("[verify-commit] HEAD commit violates the Personal/ workspace commit style:", file=sys.stderr)
        for issue in errors:
            print(f"  - {issue}", file=sys.stderr)
        return 1
    print(f"[verify-commit] HEAD commit OK (title {len(title)}/{MAX_TITLE_LENGTH} chars)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
