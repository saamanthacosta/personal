#!/usr/bin/env node
// slug-check.mjs — validate a task slug and the derived branch name.
//
// Enforces the slug rules from SKILL.md §1.2 and the branch-prefix table from
// §1.1. Designed per the Agent Skills "using scripts" guidance: non-interactive,
// idempotent, structured output, meaningful exit codes, helpful errors.
//
// Usage:
//   node scripts/slug-check.mjs <type> <slug>           # validate both
//   node scripts/slug-check.mjs <type> --slug <slug>    # same, with explicit flag
//   node scripts/slug-check.mjs --branch <name>         # validate an existing branch name
//   node scripts/slug-check.mjs --help
//
// Exit codes:
//   0   valid
//   2   usage error (bad flags, missing args)
//   3   slug invalid (length, chars, leading/trailing hyphen)
//   4   type invalid (not in the canonical set)
//   5   branch name invalid (prefix/slug mismatch)
//
// Examples:
//   node scripts/slug-check.mjs feature csv-export
//   node scripts/slug-check.mjs fix login-redirect-loop
//   node scripts/slug-check.mjs --branch feat/csv-export

const VALID_TYPES = new Set([
  "feature",
  "fix",
  "refactor",
  "chore",
  "docs",
  "test",
  "perf",
]);

const PREFIX_TO_TYPE = new Map([
  ["feat", "feature"],
  ["fix", "fix"],
  ["refactor", "refactor"],
  ["chore", "chore"],
  ["docs", "docs"],
  ["test", "test"],
  ["perf", "perf"],
]);

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
const MAX_LEN = 50;

const USAGE = `Usage: slug-check.mjs <type> <slug>
       slug-check.mjs --branch <name>
       slug-check.mjs --help

Validate a task slug and derived branch name.

Arguments:
  <type>   One of: feature | fix | refactor | chore | docs | test | perf
  <slug>   Kebab-case slug, 1-50 chars, lowercase alnum + hyphens,
           no leading or trailing hyphen, no consecutive hyphens.

Options:
  --branch <name>   Validate an existing <type>/<slug> branch name instead.
  --help            Show this help and exit

Examples:
  node scripts/slug-check.mjs feature csv-export
  node scripts/slug-check.mjs fix login-redirect-loop
  node scripts/slug-check.mjs --branch feat/csv-export
`;

function die(msg, code) {
  process.stderr.write(`Error: ${msg}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const out = { type: null, slug: null, branch: null, help: false };
  let i = 0;
  while (i < argv.length) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--branch") {
      out.branch = argv[++i];
      if (!out.branch) die("--branch requires a value", 2);
    } else if (a.startsWith("--branch=")) out.branch = a.slice("--branch=".length);
    else if (a.startsWith("--")) die(`unknown flag '${a}'`, 2);
    else {
      if (out.type == null) out.type = a;
      else if (out.slug == null) out.slug = a;
      else die(`unexpected positional argument '${a}'`, 2);
    }
    i++;
  }
  return out;
}

function validateType(type) {
  if (!VALID_TYPES.has(type)) {
    die(
      `type '${type}' is not canonical. Allowed: ${[...VALID_TYPES].join(", ")}`,
      4,
    );
  }
}

function validateSlug(slug) {
  if (!slug) die("slug is required", 2);
  if (slug.length > MAX_LEN) {
    die(`slug is ${slug.length} chars; max is ${MAX_LEN}`, 3);
  }
  if (slug.startsWith("-") || slug.endsWith("-")) {
    die("slug must not start or end with a hyphen", 3);
  }
  if (slug.includes("--")) die("slug must not contain consecutive hyphens", 3);
  if (!SLUG_RE.test(slug)) {
    die(
      `slug '${slug}' contains invalid characters. Use lowercase a-z, 0-9, and single hyphens.`,
      3,
    );
  }
}

function validateBranch(branch) {
  const slash = branch.indexOf("/");
  if (slash <= 0 || slash === branch.length - 1) {
    die(
      `branch '${branch}' must match '<prefix>/<slug>'. Prefix must be one of: ${[...PREFIX_TO_TYPE.keys()].join(", ")}.`,
      5,
    );
  }
  const prefix = branch.slice(0, slash);
  const slug = branch.slice(slash + 1);
  const type = PREFIX_TO_TYPE.get(prefix);
  if (!type) {
    die(
      `branch prefix '${prefix}' is not canonical. Allowed: ${[...PREFIX_TO_TYPE.keys()].join(", ")}.`,
      5,
    );
  }
  validateSlug(slug);
  return { type, prefix, slug };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(USAGE);
    process.exit(0);
  }
  if (args.branch) {
    const { type, prefix, slug } = validateBranch(args.branch);
    process.stdout.write(
      JSON.stringify({ ok: true, kind: "branch", branch: args.branch, type, prefix, slug }) + "\n",
    );
    process.exit(0);
  }
  if (!args.type) die("type is required (or pass --branch <name>)", 2);
  if (!args.slug) die("slug is required (or pass --branch <name>)", 2);
  validateType(args.type);
  validateSlug(args.slug);
  const branch = `${typePrefix(args.type)}/${args.slug}`;
  process.stdout.write(
    JSON.stringify({ ok: true, kind: "type+slug", type: args.type, slug: args.slug, branch }) +
      "\n",
  );
  process.exit(0);
}

function typePrefix(type) {
  switch (type) {
    case "feature":
      return "feat";
    case "fix":
      return "fix";
    case "refactor":
      return "refactor";
    case "chore":
      return "chore";
    case "docs":
      return "docs";
    case "test":
      return "test";
    case "perf":
      return "perf";
    default:
      return type;
  }
}

main();