#!/usr/bin/env node
/**
 * validate-skill.mjs — Validate a single skill for spec compliance.
 *
 * Usage: node validate-skill.mjs <skill-path>
 *
 * Exit codes:
 *   0 — skill passes all checks
 *   1 — one or more violations found
 *   2 — script error (file not found, parse error)
 */

import { readFileSync } from 'node:fs';
import { extname, basename } from 'node:path';
import { existsSync } from 'node:fs';

const SPEC_FRONTMATTER_FIELDS = new Set(['name', 'description', 'license', 'compatibility', 'metadata']);
const SPEC_SUBFOLDERS = new Set(['scripts', 'references', 'assets']);

const skillPath = process.argv[2];

if (!skillPath) {
  console.error('Usage: node validate-skill.mjs <skill-path>');
  process.exit(2);
}

const skillDir = skillPath.endsWith('/SKILL.md') ? skillPath.slice(0, -9) : skillPath;
const skillFile = `${skillDir}/SKILL.md`;

if (!existsSync(skillFile)) {
  console.error(`Error: ${skillFile} does not exist`);
  process.exit(2);
}

let frontmatter;
try {
  const raw = readFileSync(skillFile, 'utf-8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    console.error('Error: No frontmatter found in SKILL.md');
    process.exit(2);
  }
  frontmatter = parseFrontmatter(fmMatch[1]);
} catch (err) {
  console.error(`Error reading ${skillFile}: ${err.message}`);
  process.exit(2);
}

const findings = [];

function fail(area, msg) {
  findings.push({ severity: 'FAIL', area, message: msg });
}
function warn(area, msg) {
  findings.push({ severity: 'WARN', area, message: msg });
}

// Area 1 — Frontmatter
{
  const keys = Object.keys(frontmatter);
  const extra = keys.filter(k => !SPEC_FRONTMATTER_FIELDS.has(k));
  if (extra.length > 0) {
    fail('FRONTMATTER', `Non-spec fields: ${extra.join(', ')}`);
  }
  if (!frontmatter.name) fail('FRONTMATTER', 'Missing required field: name');
  if (!frontmatter.description) fail('FRONTMATTER', 'Missing required field: description');
  if (!frontmatter.license) warn('FRONTMATTER', 'Missing `license` field (workspace convention: MIT)');
  if (!frontmatter.compatibility) warn('FRONTMATTER', 'Missing `compatibility` field (one-line runtime note)');
  if (!frontmatter.metadata) warn('FRONTMATTER', 'Missing `metadata` field (workspace convention: author + version)');
}

// Area 2 — Subfolders
{
  const { readdirSync, statSync } = await import('node:fs');
  let subs;
  try {
    subs = readdirSync(skillDir).filter(f => f !== 'SKILL.md');
  } catch {
    // no subdirectories
    subs = [];
  }
  const dirs = subs.filter(f => {
    try { return statSync(`${skillDir}/${f}`).isDirectory(); } catch { return false; }
  });
  const extra = dirs.filter(d => !SPEC_SUBFOLDERS.has(d));
  for (const d of extra) {
    warn('SUBFOLDERS', `Non-standard subfolder: ${d}/ (allowed: scripts/, references/, assets/)`);
  }
}

// Area 3 — Description quality
{
  const desc = frontmatter.description || '';
  const isFirstPerson = /^(I |I'm |I am )/i.test(desc);
  const isTooLong = desc.length > 200;
  const hasTrigger = /[`'"]/.test(desc.slice(0, 80)); // rough heuristic for front-loaded triggers
  const isMultiline = desc.includes('\n');
  if (isFirstPerson) warn('DESCRIPTION', 'Description uses first-person voice');
  if (isTooLong) warn('DESCRIPTION', `Description is ${desc.length} chars (may be truncated)`);
  if (isMultiline) warn('DESCRIPTION', 'Description is a multi-line block scalar (use a single-line description)');
  if (!hasTrigger && desc.length > 0) warn('DESCRIPTION', 'Description lacks trigger signal in first 80 chars');
}

// Area 4 — Body completeness
{
  const raw = readFileSync(skillFile, 'utf-8');
  const body = raw.replace(/^---[\s\S]*?---\n/, '').replace(/^\s+/, '');
  const hasH1 = /^# [^\n]+/m.test(body);
  const bodyAfterH1 = body.replace(/^#[^\n]*\n+/, '');
  const firstParagraph = bodyAfterH1.trim().split(/\n{2,}/)[0] || '';
  const hasRoleSentence = firstParagraph.length > 0 && !firstParagraph.startsWith('#');
  const hasNumberedPhases = /^## \d+\.\s/m.test(body);
  const hasWorkflowHeading = /#{1,3}\s+(Workflow|Phases|Steps|Procedure|Tiers?)\b/i.test(body);
  const hasWorkflow = hasNumberedPhases || hasWorkflowHeading;
  const hasInputs = /^##\s+Inputs\b/im.test(body);
  const hasGuardrails = /#{1,3}\s+(Guardrails|Anti-patterns|Rules)\b/i.test(body);
  if (!hasH1) warn('BODY', 'No H1 title (`# <Title>`) — workspace convention requires one');
  if (!hasRoleSentence) warn('BODY', 'No role/identity sentence after the H1');
  if (!hasNumberedPhases && !hasWorkflowHeading) warn('BODY', 'No numbered phases (`## 1.`, `## 2.`, ...) or `## Procedure`/`## Steps` style — workspace convention');
  if (!hasWorkflow) warn('BODY', 'No workflow section detected');
  if (!hasInputs) warn('BODY', 'No `## Inputs` section — workspace convention');
  if (!hasGuardrails) warn('BODY', 'No `## Guardrails` / `## Anti-patterns` section');
}

// Area 5 — Interdependencies
{
  const raw = readFileSync(skillFile, 'utf-8');
  // Strip fenced code blocks so headings inside ``` blocks don't confuse the matcher.
  const stripped = raw.replace(/```[\s\S]*?```/g, '');
  const body = stripped.replace(/^---[\s\S]*?---\n/, '').replace(/^\s+/, '');
  const hasInterdep = /^#{1,3}\s+Interdependenc/im.test(body);
  if (!hasInterdep) {
    fail('INTERDEPS', 'Missing ## Interdependencies section');
  } else {
    const interdepSection = body.match(/^#{1,3}\s+Interdependenc[\s\S]*?(?=\n#{1,3}\s+\w|(?![\s\S]))/m)?.[0] || '';
    const isEmpty = interdepSection.replace(/^#{1,3}\s+Interdependenc.*\n/i, '').trim().length === 0;
    const hasNone = /None\s*[—–-]\s*this skill is self-contained/i.test(interdepSection);
    const hasTable = /\| Skill\s+\|/.test(interdepSection);
    if (!isEmpty && !hasNone && !hasTable) {
      warn('INTERDEPS', '## Interdependencies section present but empty or malformed');
    }
  }
}

// Print findings
if (findings.length === 0) {
  console.log(`PASS: ${basename(skillDir)}`);
  process.exit(0);
}

const fails = findings.filter(f => f.severity === 'FAIL');
const warns = findings.filter(f => f.severity === 'WARN');

if (fails.length > 0) {
  console.log(`FAIL: ${basename(skillDir)}`);
  for (const f of fails) console.log(`  [${f.area}] ✗ ${f.message}`);
  for (const f of warns) console.log(`  [${f.area}] ! ${f.message}`);
  process.exit(1);
}

console.log(`WARN: ${basename(skillDir)}`);
for (const f of warns) console.log(`  [${f.area}] ! ${f.message}`);
process.exit(0);

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseFrontmatter(text) {
  const result = {};
  const lines = text.split('\n');
  let currentKey = null;
  let blockStyle = null; // 'literal' (|) or 'folded' (>) or null
  let blockIndent = 0;
  let blockLines = [];

  const flushBlock = () => {
    if (currentKey && blockLines.length > 0) {
      const joined = blockStyle === 'folded'
        ? blockLines.filter(l => l.length > 0).join(' ')
        : blockLines.join('\n');
      result[currentKey] = joined.replace(/\n+$/, '');
    }
    currentKey = null;
    blockStyle = null;
    blockIndent = 0;
    blockLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (currentKey !== null) {
      // We are inside a block scalar; collect indented continuation lines.
      const indent = line.match(/^(\s*)/)[1].length;
      if (indent >= blockIndent && trimmed.length > 0) {
        blockLines.push(trimmed);
        continue;
      } else if (indent === 0 && trimmed.length === 0) {
        // blank line inside the block — keep it
        blockLines.push('');
        continue;
      } else {
        flushBlock();
      }
    }

    if (!trimmed || trimmed.startsWith('#')) continue;

    const kvMatch = trimmed.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      const blockIndicator = value.trim().match(/^([|>][-+]?)$/);
      if (blockIndicator) {
        currentKey = key;
        blockStyle = blockIndicator[1].startsWith('>') ? 'folded' : 'literal';
        blockIndent = line.match(/^(\s*)/)[1].length + 2;
        blockLines = [];
      } else if (value.trim() === '') {
        currentKey = key;
        blockStyle = 'literal';
        blockIndent = line.match(/^(\s*)/)[1].length + 2;
        blockLines = [];
      } else {
        result[key] = value.trim();
      }
    }
  }
  flushBlock();

  return result;
}
