#!/usr/bin/env node
/**
 * status.mjs — Render openspec list --json as a structured table.
 *
 * Usage: node status.mjs [--change <name>]
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const changeName = process.argv.includes('--change')
  ? process.argv[process.argv.indexOf('--change') + 1]
  : null;

// Check openspec is available
const check = spawnSync('which', ['openspec'], { encoding: 'utf-8' });
if (!check.stdout.trim()) {
  console.error('Error: openspec CLI not found on PATH');
  process.exit(2);
}

// Check openspec list works
const listResult = spawnSync('openspec', ['list', '--json'], { encoding: 'utf-8' });
if (listResult.status !== 0) {
  console.error(`Error running openspec list: ${listResult.stderr}`);
  process.exit(2);
}

let data;
try {
  data = JSON.parse(listResult.stdout);
} catch {
  console.error('Error: openspec list --json did not return valid JSON');
  process.exit(2);
}

if (changeName) {
  // Detailed view for one change
  const change = (data.changes || []).find(c => c.name === changeName);
  if (!change) {
    console.error(`Error: No active change named '${changeName}'`);
    process.exit(1);
  }

  const artifacts = change.artifacts || [];
  const done = artifacts.filter(a => a.status === 'done').length;
  const total = artifacts.length;

  console.log(`Change: ${change.name}`);
  console.log(`Schema: ${change.schemaName || 'unknown'}`);
  console.log('');
  console.log('ARTIFACT    STATUS');
  console.log('─'.repeat(30));
  for (const a of artifacts) {
    const label = (a.id || a.outputPath || '?').padEnd(12);
    console.log(`${label} ${a.status === 'done' ? '✓ done' : a.status}`);
  }
  console.log('');
  console.log(`Apply ready: ${done === total ? 'true' : `false (${done}/${total} complete)`}`);
} else {
  // Summary table
  const changes = data.changes || [];
  if (changes.length === 0) {
    console.log('No active OpenSpec changes.');
    process.exit(0);
  }

  console.log('\nCHANGE                    SCHEMA         ARTIFACTS   STATUS');
  console.log('─'.repeat(72));
  for (const change of changes) {
    const name = (change.name || '?').padEnd(24);
    const schema = (change.schemaName || '?').padEnd(13);
    const artifacts = change.artifacts || [];
    const done = artifacts.filter(a => a.status === 'done').length;
    const total = artifacts.length;
    const artStr = `${done}/${total}`.padEnd(10);
    const status = done === total ? 'ready' : 'active';
    console.log(`${name} ${schema} ${artStr} ${status}`);
  }
  console.log('─'.repeat(72));
  console.log(`\n${changes.length} active change${changes.length === 1 ? '' : 's'}`);
}
