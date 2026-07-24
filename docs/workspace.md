# Workspace Folders

The `Personal/` workspace contains a mix of standalone git projects and plain folders. VS Code is configured to open them all together via `personal.code-workspace`.

## Rule: Register every new git project

When a new folder is added inside `Personal/` and that folder is its own git project, it must be registered in `personal.code-workspace`.

Why:
- The root `Personal/` repo treats each sub-project as an ignored directory (see root `.gitignore`). Changes inside the sub-project are tracked by its own git history, not the root.
- Adding the folder to the workspace gives VS Code a separate root for search, file watching, and source control UI scoped to that project.
- Without the entry, the project is invisible to the multi-root workspace and edits there bypass the expected tooling.

## How to add a new entry

1. Confirm the folder is a git project (`ls <folder>/.git` exists).
2. Open `personal.code-workspace`.
3. Add a new entry under `folders`, keeping the existing alphabetical/order convention:

```json
{
  "name": "<display name>",
  "path": "<folder>"
}
```

- `name`: human-readable label shown in the VS Code explorer.
- `path`: folder name relative to the `Personal/` root (no leading `./`, no trailing slash).

4. Also add the folder to the root `.gitignore` so the root repo does not track its inner files.

## Current entries

The current list of registered folders lives in `personal.code-workspace` next to this `docs/` folder. Keep that file in sync with whatever folders exist under `Personal/`.
