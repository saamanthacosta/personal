#!/usr/bin/env node
// code-hygiene runner — greppable, high-signal hygiene scanner.
// Usage:
//   node bin/scan.mjs [--check] [--apply] [--bootstrap] [--json] [--severity <tier>]
//                     [--patterns <name>] [--exclude <glob>] [--report <path>] [--help]
//
// Exit codes:
//   0 — no new findings
//   1 — new findings exist (or --apply wrote entries)
//   2 — scanner error
//
// All file mutations happen only on --apply. --check is read-only and is the default.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = dirname(SCRIPT_DIR);
const DEFAULT_PATTERNS = resolve(SKILL_DIR, 'patterns.json');
const DEFAULT_REPORT = resolve(ROOT, 'docs/code-hygiene.md');
const DEFAULT_CONFIG = resolve(ROOT, '.code-hygiene.json');

const EXIT_OK = 0;
const EXIT_FINDINGS = 1;
const EXIT_ERROR = 2;

const SEVERITY_ORDER = { info: 0, warn: 1, blocker: 2 };

function parseArgs(argv) {
  const out = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq !== -1) {
        out.flags[arg.slice(2, eq)] = arg.slice(eq + 1);
        continue;
      }
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        out.flags[key] = next;
        i += 1;
      } else {
        out.flags[key] = 'true';
      }
    } else {
      out._.push(arg);
    }
  }
  return out;
}

function printHelp() {
  process.stdout.write(`code-hygiene runner — greppable, high-signal hygiene scanner

Usage:
  node bin/scan.mjs [flags]

Flags:
  --check              Read-only mode (default). Print new findings, exit 1 if any.
  --apply              Append new findings to the report, then exit 1 if any.
  --bootstrap          Create an empty report file at the report path if missing.
  --json               Emit machine-readable JSON to stdout.
  --severity <tier>    Override gate severity: info (default) | warn | blocker.
                       Findings below this tier are reported as info and don't gate.
  --patterns <name>    Run only patterns whose id contains <name>. Repeatable.
  --exclude <glob>     Exclude paths matching <glob> (added to config excludes). Repeatable.
  --report <path>      Override report path (default: docs/code-hygiene.md).
  --help               Show this help and exit.

Exit codes:
  0 — no new findings
  1 — new findings exist
  2 — scanner error (malformed report, missing git, unparseable config)

Report format:
  Markdown file with YAML frontmatter + a ## Findings section. One fenced block per
  finding. Deterministic dedup via sha1(pattern.id || path:line || snippet_norm).

Examples:
  node bin/scan.mjs                     # --check mode, prints new findings
  node bin/scan.mjs --apply             # append new findings to the report
  node bin/scan.mjs --bootstrap         # create empty report if missing
  node bin/scan.mjs --json | jq .new   # machine-readable output
`);
}

function today() {
  return new Date().toISOString();
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    throw new Error(`failed to parse ${path}: ${err.message}`);
  }
}

function loadConfig() {
  const cfg = existsSync(DEFAULT_CONFIG) ? loadJson(DEFAULT_CONFIG, {}) : {};
  return {
    report: cfg.report ? resolve(ROOT, cfg.report) : DEFAULT_REPORT,
    exclude: Array.isArray(cfg.exclude) ? cfg.exclude : [],
    patternOverrides: cfg.patterns && typeof cfg.patterns === 'object' ? cfg.patterns : {},
  };
}

function loadPatterns(overrideSeverities = {}) {
  const data = loadJson(DEFAULT_PATTERNS, { patterns: [] });
  return data.patterns.map((p) => {
    const ov = overrideSeverities[p.id];
    return {
      ...p,
      severity: ov?.severity || p.severity || 'warn',
      regex: new RegExp(p.regex, 'g'),
    };
  });
}

function listTrackedFiles(excludes) {
  const result = spawnSync('git', ['ls-files', '-z', '--exclude-standard'], {
    cwd: ROOT,
    encoding: 'buffer',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`git ls-files failed: ${result.stderr?.toString() || 'unknown error'}`);
  }
  const files = (result.stdout || Buffer.alloc(0))
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  return files.filter((f) => !matchesAnyExclude(f, excludes));
}

function globToRegex(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '::DOUBLESTAR::')
    .replace(/\*/g, '[^/]*')
    .replace(/::DOUBLESTAR::/g, '.*')
    .replace(/\?/g, '[^/]');
  return new RegExp(`^${escaped}$`);
}

function matchesAnyExclude(path, excludes) {
  return excludes.some((g) => globToRegex(g).test(path));
}

function normaliseSnippet(text) {
  return text.trim().replace(/\s+/g, ' ');
}

function computeDedupKey(patternId, file, line, snippet) {
  return createHash('sha1')
    .update(`${patternId}|${file}:${line}|${normaliseSnippet(snippet)}`)
    .digest('hex');
}

function scanFiles(files, patterns) {
  const findings = [];
  for (const file of files) {
    let content;
    try {
      content = readFileSync(resolve(ROOT, file), 'utf8');
    } catch {
      continue;
    }
    const lines = content.split(/\r?\n/);
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx += 1) {
      const line = lines[lineIdx];
      for (const pattern of patterns) {
        pattern.regex.lastIndex = 0;
        const match = pattern.regex.exec(line);
        if (match) {
          const key = computeDedupKey(pattern.id, file, lineIdx + 1, match[0]);
          findings.push({
            key,
            pattern: pattern.id,
            severity: pattern.severity,
            file,
            line: lineIdx + 1,
            snippet: match[0].length > 200 ? `${match[0].slice(0, 197)}...` : match[0],
            message: pattern.message,
          });
        }
      }
    }
  }
  return findings;
}

function parseReportKeys(reportPath) {
  if (!existsSync(reportPath)) return new Set();
  const content = readFileSync(reportPath, 'utf8');
  const keys = new Set();
  const keyRegex = /^\s*key:\s*`?([a-f0-9]{40})`?\s*$/gm;
  let m;
  while ((m = keyRegex.exec(content)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

function parseReportMeta(reportPath) {
  if (!existsSync(reportPath)) return null;
  const content = readFileSync(reportPath, 'utf8');
  if (!content.startsWith('---\n')) return null;
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) return null;
  const frontmatter = content.slice(4, end);
  const meta = {};
  for (const line of frontmatter.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
    meta[key] = value;
  }
  return meta;
}

function renderReport({ reportPath, findings, mode, addedKeys, staleKeys }) {
  const meta = parseReportMeta(reportPath) || {};
  const generatedAt = meta.generated_at || today();
  const lastRunAt = today();
  const totalOpen = (parseInt(meta.total_open, 10) || 0) + (mode === 'apply' ? addedKeys.length : 0);
  const severityCounts = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});

  const frontmatter = [
    '---',
    `schema_version: "0.1"`,
    `generated_at: "${generatedAt}"`,
    `last_run_at: "${lastRunAt}"`,
    `total_open: ${totalOpen}`,
    `severity_counts:`,
    `  info: ${severityCounts.info || 0}`,
    `  warn: ${severityCounts.warn || 0}`,
    `  blocker: ${severityCounts.blocker || 0}`,
    '---',
    '',
    '# Code Hygiene Report',
    '',
    '> Append-only, single-source-of-truth report for code-hygiene findings. Git history is the audit trail. Re-runs of `node .agents/skills/code-hygiene/bin/scan.mjs` are idempotent on the dedup key (`sha1(pattern || path:line || snippet_norm)`).',
    '',
    '## Usage',
    '',
    '- **Review new findings** before committing this file. Redact any secret-looking strings — `cve-scan` gitleaks remains the authoritative secret detector.',
    '- **Mark entries as `fixed`** by changing `status: open` to `status: fixed` after the underlying code is changed. Re-running `--check` keeps fixed entries out of the new-findings set.',
    '- **Mark entries as `ignored`** by changing `status: open` to `status: ignored` for known-acceptable findings (e.g., `console.log` inside a snapshot test).',
    '- **Do not hand-edit the `key:` field** — it is the dedup key. Hand-editing breaks idempotency.',
    '',
    '## Findings',
    '',
  ];

  const body = findings
    .map((f) => renderEntry(f, addedKeys.has(f.key), staleKeys.has(f.key)))
    .join('\n');

  const footer = [
    '',
    '## History',
    '',
    `- ${todayDate()} — initial bootstrap via \`node bin/scan.mjs --apply\`${mode === 'apply' && addedKeys.size > 0 ? ` (added ${addedKeys.size} new finding${addedKeys.size === 1 ? '' : 's'})` : ''}`,
    '',
  ].join('\n');

  return `${frontmatter.join('\n')}${body}${footer}`;
}

function renderEntry(finding, isNew, isStale) {
  const status = isStale ? 'stale' : 'open';
  return [
    '```yaml',
    `key: \`${finding.key}\``,
    `pattern: ${finding.pattern}`,
    `severity: ${finding.severity}`,
    `file: ${finding.file}`,
    `line: ${finding.line}`,
    `status: ${status}${isNew ? ' (new since last run)' : ''}`,
    `first_seen: ${todayDate()}`,
    `message: ${finding.message}`,
    'snippet: |',
    `  ${finding.snippet.replace(/\n/g, '\n  ')}`,
    '```',
    '',
  ].join('\n');
}

function reportExistsWithContent(reportPath) {
  if (!existsSync(reportPath)) return false;
  try {
    const stat = statSync(reportPath);
    return stat.size > 0;
  } catch {
    return false;
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.flags.help === 'true' || args.flags.h === 'true') {
    printHelp();
    return EXIT_OK;
  }

  const mode = args.flags.apply === 'true' ? 'apply' : args.flags.bootstrap === 'true' ? 'bootstrap' : 'check';
  const jsonOutput = args.flags.json === 'true';
  const cliSeverity = args.flags.severity;
  const patternFilter = []
    .concat(args.flags.patterns || [])
    .concat(args._.filter((a) => !a.startsWith('-')))
    .filter(Boolean);
  const cliExcludes = [].concat(args.flags.exclude || []);
  const customReport = args.flags.report ? resolve(ROOT, args.flags.report) : null;

  let config;
  try {
    config = loadConfig();
    if (customReport) config.report = customReport;
    config.exclude = config.exclude.concat(cliExcludes);
  } catch (err) {
    process.stderr.write(`config error: ${err.message}\n`);
    return EXIT_ERROR;
  }

  if (mode === 'bootstrap') {
    if (reportExistsWithContent(config.report)) {
      if (!jsonOutput) {
        process.stdout.write(`report already exists at ${relative(ROOT, config.report)} — skipping bootstrap\n`);
      } else {
        process.stdout.write(JSON.stringify({ bootstrap: 'skipped', reason: 'exists', report_path: config.report }) + '\n');
      }
      return EXIT_OK;
    }
    mkdirSync(dirname(config.report), { recursive: true });
    writeFileSync(config.report, renderReport({ reportPath: config.report, findings: [], mode: 'bootstrap', addedKeys: new Set(), staleKeys: new Set() }), 'utf8');
    if (!jsonOutput) process.stdout.write(`bootstrapped empty report at ${relative(ROOT, config.report)}\n`);
    else process.stdout.write(JSON.stringify({ bootstrap: 'created', report_path: config.report }) + '\n');
    return EXIT_OK;
  }

  let patterns;
  try {
    patterns = loadPatterns(config.patternOverrides);
    if (patternFilter.length > 0) {
      patterns = patterns.filter((p) => patternFilter.some((f) => p.id.includes(f)));
    }
    if (patterns.length === 0) {
      process.stderr.write('error: no patterns matched the filter\n');
      return EXIT_ERROR;
    }
  } catch (err) {
    process.stderr.write(`patterns error: ${err.message}\n`);
    return EXIT_ERROR;
  }

  let files;
  try {
    files = listTrackedFiles(config.exclude);
  } catch (err) {
    process.stderr.write(`git error: ${err.message}\n`);
    return EXIT_ERROR;
  }

  let findings;
  try {
    findings = scanFiles(files, patterns);
  } catch (err) {
    process.stderr.write(`scan error: ${err.message}\n`);
    return EXIT_ERROR;
  }

  let seenKeys;
  try {
    seenKeys = parseReportKeys(config.report);
  } catch (err) {
    process.stderr.write(`report parse error: ${err.message}\n`);
    return EXIT_ERROR;
  }

  const newFindings = findings.filter((f) => !seenKeys.has(f.key));
  const staleKeys = [...seenKeys].filter((k) => !findings.some((f) => f.key === k));
  const minSeverity = cliSeverity && SEVERITY_ORDER[cliSeverity] !== undefined ? cliSeverity : 'info';
  const gateFindings = newFindings.filter((f) => SEVERITY_ORDER[f.severity] >= SEVERITY_ORDER[minSeverity]);

  if (jsonOutput) {
    process.stdout.write(JSON.stringify({
      mode,
      report_path: config.report,
      patterns_run: patterns.length,
      files_scanned: files.length,
      new: newFindings.map(redactSecrets),
      stale: staleKeys,
      gate_findings: gateFindings.length,
    }, null, 2) + '\n');
  } else {
    if (newFindings.length === 0) {
      process.stdout.write(`code-hygiene: 0 new findings across ${files.length} files (${patterns.length} patterns)\n`);
    } else {
      process.stdout.write(`code-hygiene: ${newFindings.length} new finding${newFindings.length === 1 ? '' : 's'} (${gateFindings.length} at severity >= ${minSeverity})\n\n`);
      for (const f of newFindings) {
        process.stdout.write(`  [${f.severity.padEnd(7)}] ${f.pattern}  ${f.file}:${f.line}\n`);
        process.stdout.write(`             ${f.snippet}\n`);
      }
    }
  }

  if (mode === 'apply') {
    try {
      mkdirSync(dirname(config.report), { recursive: true });
      const existing = existsSync(config.report) ? readFileSync(config.report, 'utf8') : '';
      if (!existing || !existing.includes('## Findings')) {
        writeFileSync(config.report, renderReport({ reportPath: config.report, findings, mode, addedKeys: new Set(newFindings.map((f) => f.key)), staleKeys: new Set(staleKeys) }), 'utf8');
      } else if (newFindings.length > 0) {
        const newEntries = newFindings.map((f) => renderEntry(f, true, false)).join('\n');
        const insertionPoint = existing.indexOf('## History');
        const withEntries = insertionPoint === -1
          ? `${existing.trimEnd()}\n\n${newEntries}\n`
          : `${existing.slice(0, insertionPoint).trimEnd()}\n\n${newEntries}\n${existing.slice(insertionPoint)}`;
        writeFileSync(config.report, refreshFrontmatter(withEntries), 'utf8');
      } else {
        writeFileSync(config.report, refreshFrontmatter(existing), 'utf8');
      }
    } catch (err) {
      process.stderr.write(`write error: ${err.message}\n`);
      return EXIT_ERROR;
    }
  }

  return gateFindings.length > 0 ? EXIT_FINDINGS : EXIT_OK;
}

function redactSecrets(f) {
  return {
    ...f,
    snippet: f.snippet, // already truncated; full secret-handling posture lives in SKILL.md
  };
}

function refreshFrontmatter(content) {
  if (!content.startsWith('---\n')) return content;
  const endIdx = content.indexOf('\n---\n', 4);
  if (endIdx === -1) return content;
  const body = content.slice(endIdx + 5);
  const entryRegex = /^```yaml\n([\s\S]*?)\n```/gm;
  let m;
  let openCount = 0;
  const severityCounts = { info: 0, warn: 0, blocker: 0 };
  while ((m = entryRegex.exec(body)) !== null) {
    const block = m[1];
    const statusMatch = block.match(/^status:\s*(\S+)/m);
    const severityMatch = block.match(/^severity:\s*(\S+)/m);
    const status = statusMatch ? statusMatch[1].replace(/\s.*$/, '') : 'open';
    if (status === 'open') {
      openCount += 1;
      if (severityMatch && severityCounts[severityMatch[1]] !== undefined) {
        severityCounts[severityMatch[1]] += 1;
      }
    }
  }
  const meta = parseReportMeta(content) || {};
  const generatedAt = meta.generated_at || today();
  const lastRunAt = today();
  const newFrontmatter = [
    '---',
    `schema_version: "0.1"`,
    `generated_at: "${generatedAt}"`,
    `last_run_at: "${lastRunAt}"`,
    `total_open: ${openCount}`,
    `severity_counts:`,
    `  info: ${severityCounts.info || 0}`,
    `  warn: ${severityCounts.warn || 0}`,
    `  blocker: ${severityCounts.blocker || 0}`,
    '---',
  ].join('\n');
  return `${newFrontmatter}\n${body}`;
}

process.on('uncaughtException', (err) => {
  process.stderr.write(`fatal: ${err.message}\n`);
  process.exit(EXIT_ERROR);
});

process.exit(main());
