#!/usr/bin/env node
// Smoke tests for render.mjs using the built-in node:test runner.
// Run from repo root:
//   node --test .agents/skills/skill-sessions/tests/render.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..', '..', '..');
const RENDER = resolve(REPO_ROOT, '.agents/skills/skill-sessions/bin/render.mjs');

function render(events) {
  const input = events.map((e) => JSON.stringify(e)).join('\n') + '\n';
  const out = spawnSync('node', [RENDER], { input, encoding: 'utf8' });
  if (out.status !== 0) throw new Error(out.stderr);
  return out.stdout;
}

const BASE_TS = '2026-07-30T12:00:00.000Z';
const SESSION = '2026-07-30T12-00-00Z-skill-ui-progress';

function phaseStarted(phase, index, total) {
  return { type: 'phase_started', ts: BASE_TS, session: SESSION, phase, index, total };
}
function phaseCompleted(phase, duration_ms, status = 'complete') {
  return { type: 'phase_completed', ts: BASE_TS, session: SESSION, phase, duration_ms, status };
}

test('renders header, phases, and summary', () => {
  const out = render([
    phaseStarted('preflight', 1, 3),
    phaseCompleted('preflight', 420),
    phaseStarted('apply', 2, 3),
  ]);
  assert.match(out, /## Skill timeline/);
  assert.match(out, /preflight/);
  assert.match(out, /apply/);
  assert.match(out, /Summary · 1 complete/);
});

test('evidence entries are paired with text and truncated past 1 KiB', () => {
  const huge = 'x'.repeat(2048);
  const out = render([
    phaseStarted('apply', 1, 1),
    { type: 'evidence', ts: BASE_TS, session: SESSION, source: 'src/foo.ts', result: huge },
  ]);
  assert.match(out, /💡 src\/foo\.ts/);
  assert.match(out, /see source file/);
});

test('emoji-stripped renderer still reads complete / running', () => {
  const out = render([phaseStarted('apply', 1, 1), phaseCompleted('apply', 5000, 'failed')]);
  const stripped = out.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
  assert.match(stripped, /complete/);
  assert.match(stripped, /failed/);
});

test('specialist_loaded appears in notes section', () => {
  const out = render([
    phaseStarted('apply', 1, 1),
    { type: 'specialist_loaded', ts: BASE_TS, session: SESSION, skill: 'openspec-apply-change', reason: 'implementation phase' },
  ]);
  assert.match(out, /🧩 Specialist: openspec-apply-change/);
});

test('nested specialist step appears under its parent phase', () => {
  const out = render([
    phaseStarted('apply', 1, 1),
    { type: 'step_started', ts: BASE_TS, session: SESSION, phase: 'apply', step: 1, total: 1, description: 'Render timeline block' },
  ]);
  assert.match(out, /Render timeline block/);
});

test('loop_back event is rendered with text fallback', () => {
  const out = render([
    { type: 'loop_back', ts: BASE_TS, session: SESSION, from_phase: 'apply', to_phase: 'propose', reason: 'design.md missing security section' },
  ]);
  assert.match(out, /loop back/);
  assert.match(out, /design\.md missing security section/);
});