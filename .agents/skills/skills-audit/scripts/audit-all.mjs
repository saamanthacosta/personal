#!/usr/bin/env node
/**
 * audit-all.mjs — Run validate-skill.mjs against every skill in .agents/skills/.
 *
 * Usage: node audit-all.mjs [--path <root>]
 *
 * Exit codes:
 *   0 — all skills pass
 *   1 — one or more skills have FAIL violations
 *   2 — script error
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const root = process.argv.includes('--path')
  ? process.argv[process.argv.indexOf('--path') + 1]
  : join(import.meta.dirname, '..', '..');

const skillsDir = root;

if (!existsSync(skillsDir)) {
  console.error(`Error: ${skillsDir} does not exist`);
  process.exit(2);
}

let skills;
try {
  skills = readdirSync(skillsDir).filter(f => {
    try { return readdirSync(join(skillsDir, f)).includes('SKILL.md'); } catch { return false; }
  });
} catch (err) {
  console.error(`Error reading ${skillsDir}: ${err.message}`);
  process.exit(2);
}

if (skills.length === 0) {
  console.log('No skills found.');
  process.exit(0);
}

// Use the validate-skill script
const validateScript = join(import.meta.dirname, 'validate-skill.mjs');
const { spawnSync } = await import('node:child_process');

const results = [];

for (const skill of skills.sort()) {
  const skillPath = join(skillsDir, skill);
  const result = spawnSync('node', [validateScript, skillPath], { encoding: 'utf-8' });
  const output = result.stdout.trim() + (result.stderr ? '\n' + result.stderr.trim() : '');
  const code = result.status;

  const entry = { skill, code, output, fails: 0, warns: 0 };
  if (output.startsWith('PASS:')) {
    entry.status = 'PASS';
  } else if (output.startsWith('WARN:')) {
    entry.status = 'WARN';
    entry.warns = (output.match(/\[.*?\] !/g) || []).length;
  } else if (output.startsWith('FAIL:')) {
    entry.status = 'FAIL';
    entry.fails = (output.match(/\[.*?\] ✗/g) || []).length;
    entry.warns = (output.match(/\[.*?\] !/g) || []).length;
  } else {
    entry.status = 'ERROR';
  }
  results.push(entry);
}

// Print summary table
const col = (s, w) => s.toString().slice(0, w).padEnd(w);
const cellFor = (output, area) => {
  if (output.includes(`[${area}] ✗`)) return '✗';
  if (output.includes(`[${area}] !`)) return '!';
  return '✓';
};
console.log('\nSKILL                    FM   SUB   DESC  BODY  DEPS  STATUS');
console.log('─'.repeat(72));
for (const r of results) {
  const fm   = cellFor(r.output, 'FRONTMATTER');
  const sub  = cellFor(r.output, 'SUBFOLDERS');
  const desc = cellFor(r.output, 'DESCRIPTION');
  const body = cellFor(r.output, 'BODY');
  const deps = cellFor(r.output, 'INTERDEPS');
  const status = r.status === 'PASS' ? 'PASS' : r.status === 'WARN' ? 'WARN' : r.status === 'ERROR' ? 'ERROR' : 'FAIL';
  console.log(`${col(r.skill, 24)} ${fm}    ${sub}    ${desc}    ${body}    ${deps}    ${status}`);
}
console.log('─'.repeat(72));

const fails = results.filter(r => r.status === 'FAIL');
const errors = results.filter(r => r.status === 'ERROR');
console.log(`\nTotal: ${results.length} skills | ${fails.length} FAIL | ${errors.length} ERROR`);

if (fails.length > 0) {
  console.log('\nFailing skills:');
  for (const f of fails) {
    console.log(`  ${f.skill} (${f.fails} violations, ${f.warns} warnings)`);
  }
  process.exit(1);
}
if (errors.length > 0) {
  console.log('\nError skills:');
  for (const e of errors) {
    console.log(`  ${e.skill}: ${e.output.split('\n')[0]}`);
  }
  process.exit(2);
}
process.exit(0);
