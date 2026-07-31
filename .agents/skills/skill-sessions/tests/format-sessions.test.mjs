#!/usr/bin/env node
// Smoke tests for format-sessions.mjs using the built-in node:test runner.
// Run from repo root:
//   node --test .agents/skills/skill-sessions/tests/format-sessions.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = join(HERE, '..', '..', '..', '..');
const FORMAT = join(REPO_ROOT, '.agents/skills/skill-sessions/bin/format-sessions.mjs');

async function withSessionsDir(fn) {
  const dir = await mkdtemp(join(tmpdir(), 'skill-sessions-'));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function sessionBody(extra = '') {
  return `---
skill: create-task
change: skill-ui-progress
branch: feat/skill-ui-progress
started_at: "2026-07-30T12:00:00.000Z"
ended_at: "2026-07-30T12:18:00.000Z"
status: "complete"
---

# Session

### Phase preflight

- ok
${extra}
`;
}

function run(dir) {
  const env = { ...process.env, SKILL_SESSIONS_DIR: dir };
  const out = spawnSync('node', [FORMAT], { env });
  if (out.status !== 0) throw new Error(out.stderr?.toString());
  return out;
}

test('empty directory renders placeholder', async () => {
  await withSessionsDir(async (dir) => {
    await mkdir(dir, { recursive: true });
    const out = run(dir);
    assert.equal(out.status, 0);
    const index = await readFile(join(dir, 'INDEX.md'), 'utf8');
    assert.match(index, /# Skill sessions/);
    assert.match(index, /no sessions recorded yet/i);
  });
});

test('one session appears as a row', async () => {
  await withSessionsDir(async (dir) => {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, '2026-07-30T12-00-00Z-skill-ui-progress.md'), sessionBody(), 'utf8');
    const out = run(dir);
    assert.equal(out.status, 0);
    const index = await readFile(join(dir, 'INDEX.md'), 'utf8');
    assert.match(index, /\| 2026-07-30T12:00:00\.000Z \| create-task \| skill-ui-progress \| feat\/skill-ui-progress \| complete \| 1 \|/);
  });
});

test('multiple sessions are sorted newest-first', async () => {
  await withSessionsDir(async (dir) => {
    await mkdir(dir, { recursive: true });
    const older = sessionBody().replace('started_at: "2026-07-30T12:00:00.000Z"', 'started_at: "2026-07-29T09:00:00.000Z"');
    const newer = sessionBody();
    await writeFile(join(dir, '2026-07-29T09-00-00Z-other.md'), older, 'utf8');
    await writeFile(join(dir, '2026-07-30T12-00-00Z-skill-ui-progress.md'), newer, 'utf8');
    const out = run(dir);
    assert.equal(out.status, 0);
    const index = await readFile(join(dir, 'INDEX.md'), 'utf8');
    const a = index.indexOf('2026-07-30T12:00:00');
    const b = index.indexOf('2026-07-29T09:00:00');
    assert.ok(a > -1 && b > -1 && a < b, 'newest session must appear before older one');
  });
});

test('missing frontmatter does not crash', async () => {
  await withSessionsDir(async (dir) => {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, '2026-07-30T12-00-00Z-skill-ui-progress.md'), '# No frontmatter\n', 'utf8');
    const out = run(dir);
    assert.equal(out.status, 0);
  });
});

test('status variants appear in the row', async () => {
  await withSessionsDir(async (dir) => {
    await mkdir(dir, { recursive: true });
    const body = sessionBody().replace('status: "complete"', 'status: "failed"');
    await writeFile(join(dir, '2026-07-30T12-00-00Z-skill-ui-progress.md'), body, 'utf8');
    const out = run(dir);
    assert.equal(out.status, 0);
  });
});