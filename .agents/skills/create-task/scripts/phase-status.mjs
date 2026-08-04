#!/usr/bin/env node
// phase-status.mjs — snapshot the workflow's observable state to drive resume detection.
//
// Reads (non-interactive, idempotent):
//   - git: current branch, porcelain status, upstream tracking, divergence vs main
//   - openspec: active changes and per-change status (if openspec is on PATH)
//   - gh: open PRs for the current branch (if gh is on PATH)
//
// Emits structured JSON on stdout so the orchestrator can resume from the right
// phase instead of re-reading each command by hand. Progress and warnings go to
// stderr. Designed per the Agent Skills "using scripts" guidance: non-interactive,
// idempotent, structured output, meaningful exit codes, helpful errors.
//
// Usage:
//   node scripts/phase-status.mjs                  # snapshot, JSON to stdout
//   node scripts/phase-status.mjs --pretty         # pretty-printed JSON
//   node scripts/phase-status.mjs --phase <name>   # only include phase <name>
//
// Exit codes:
//   0   snapshot succeeded
//   2   usage error (bad flags)
//   3   not inside a git working tree
//   4   tool missing (e.g. openspec, gh) — partial snapshot still emitted

import { execFileSync } from "node:child_process";

const USAGE = `Usage: phase-status.mjs [--pretty] [--phase <name>]

Snapshot the create-task workflow's observable state for resume detection.

Options:
  --pretty          Pretty-print JSON output (default: compact)
  --phase <name>    Emit only the named phase section
                    (preflight | branch | openspec | pr | all)
  --help            Show this help and exit

Examples:
  node scripts/phase-status.mjs --pretty
  node scripts/phase-status.mjs --phase openspec
`;

function parseArgs(argv) {
  const out = { pretty: false, phase: "all", help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--pretty") out.pretty = true;
    else if (a === "--phase") {
      out.phase = argv[++i];
      if (!out.phase) {
        process.stderr.write("Error: --phase requires a value\n");
        process.exit(2);
      }
    } else if (a.startsWith("--phase=")) out.phase = a.slice("--phase=".length);
    else {
      process.stderr.write(`Error: unknown argument '${a}'\n`);
      process.stderr.write(USAGE);
      process.exit(2);
    }
  }
  return out;
}

function run(cmd, args, opts = {}) {
  try {
    return {
      ok: true,
      stdout: execFileSync(cmd, args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        ...opts,
      }).trim(),
    };
  } catch (e) {
    return { ok: false, code: e.status ?? 1, stderr: (e.stderr ?? "").toString() };
  }
}

function inGitWorkTree() {
  const r = run("git", ["rev-parse", "--show-toplevel"]);
  return r.ok ? r.stdout : null;
}

function gitState(root) {
  const branch = run("git", ["branch", "--show-current"], { cwd: root }).stdout || null;
  const porcelain = run("git", ["status", "--porcelain"], { cwd: root }).stdout || "";
  const upstreamRaw = run("git", ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], {
    cwd: root,
  });
  const upstream = upstreamRaw.ok ? upstreamRaw.stdout : null;
  let diverged = null;
  if (upstream) {
    const counts = run(
      "git",
      ["rev-list", "--left-right", "--count", `${upstream}...HEAD`],
      { cwd: root },
    );
    if (counts.ok) {
      const [behind, ahead] = counts.stdout.split(/\s+/).map(Number);
      diverged = { behind, ahead };
    }
  }
  return {
    branch,
    upstream,
    diverged,
    porcelain_lines: porcelain.split("\n").filter(Boolean),
    dirty: porcelain.length > 0,
    on_main: branch === "main" || branch === "master",
  };
}

function openspecState(root) {
  const which = run("which", ["openspec"]);
  if (!which.ok) {
    return { available: false, reason: "openspec CLI not on PATH" };
  }
  const list = run("openspec", ["list", "--json"], { cwd: root });
  if (!list.ok) {
    return {
      available: true,
      ok: false,
      reason: `openspec list --json failed (exit ${list.code})`,
      stderr: list.stderr,
    };
  }
  let parsed;
  try {
    parsed = JSON.parse(list.stdout);
  } catch (e) {
    return { available: true, ok: false, reason: "openspec list --json returned non-JSON" };
  }
  const changes = Array.isArray(parsed) ? parsed : parsed.changes ?? [];
  return {
    available: true,
    ok: true,
    changes: changes.map((c) => ({
      name: c.name ?? c.id ?? null,
      status: c.status ?? null,
      path: c.path ?? null,
    })),
    count: changes.length,
  };
}

function prState(root) {
  const which = run("which", ["gh"]);
  if (!which.ok) return { available: false, reason: "gh CLI not on PATH" };
  const branch = run("git", ["branch", "--show-current"], { cwd: root }).stdout;
  if (!branch) return { available: true, ok: false, reason: "no current branch" };
  const list = run(
    "gh",
    [
      "pr",
      "list",
      "--head",
      branch,
      "--state",
      "all",
      "--json",
      "url,state,number,title",
    ],
    { cwd: root },
  );
  if (!list.ok) {
    return {
      available: true,
      ok: false,
      reason: `gh pr list failed (exit ${list.code})`,
      stderr: list.stderr,
    };
  }
  let parsed;
  try {
    parsed = JSON.parse(list.stdout);
  } catch {
    return { available: true, ok: false, reason: "gh pr list returned non-JSON" };
  }
  return { available: true, ok: true, prs: parsed, count: parsed.length };
}

function buildSnapshot(root) {
  const exitCode = { git: 0, openspec: 0, pr: 0 };
  const git = gitState(root);
  const openspec = openspecState(root);
  const pr = prState(root);
  if (!git.branch) exitCode.git = 3;
  if (openspec.available && !openspec.ok) exitCode.openspec = 4;
  if (pr.available && !pr.ok) exitCode.pr = 4;
  return {
    generated_at: new Date().toISOString(),
    root,
    git,
    openspec,
    pr,
    _exit: exitCode,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(USAGE);
    process.exit(0);
  }
  const root = inGitWorkTree();
  if (!root) {
    process.stderr.write("Error: not inside a git working tree.\n");
    process.exit(3);
  }
  const snap = buildSnapshot(root);
  const includeAll = args.phase === "all";
  const payload = includeAll
    ? snap
    : { generated_at: snap.generated_at, root: snap.root, [args.phase]: snap[args.phase] };
  if (!includeAll && payload[args.phase] === undefined) {
    process.stderr.write(
      `Error: --phase '${args.phase}' is not a valid section. Use one of: preflight | branch | openspec | pr | all\n`,
    );
    process.exit(2);
  }
  const text = args.pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
  process.stdout.write(text + "\n");
  const { _exit } = snap;
  if (_exit.git || _exit.openspec || _exit.pr) process.exit(_exit.openspec || _exit.pr || _exit.git);
  process.exit(0);
}

main();