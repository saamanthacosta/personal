#!/usr/bin/env node
// Render a JSONL skill-session event stream to the chat timeline block.
//
// Usage:
//   node .agents/skills/skill-sessions/bin/render.mjs < events.jsonl
//
// Emits a single markdown block beginning with `## Skill timeline`.
// Status icons are paired with text so the output stays readable when
// the renderer strips emojis. Evidence entries larger than 1 KiB are
// truncated and replaced with a pointer to the source file.

import { createInterface } from 'node:readline';

const STATUS_ICON = {
  complete: '✅',
  running: '🔄',
  waiting: '⏳',
  pending: '○',
  failed: '❌',
  skipped: '⏭',
  'loop-back': '↩️',
  source: '💡',
  changed: '📄',
};

const PHASES = new Map();
let header = '';
let activeSpecialist = null;
const notes = [];
let completed = 0;
let failed = 0;
let pending = 0;
let active = 0;

function pad(label, width) {
  return label + ' '.repeat(Math.max(0, width - label.length));
}

function formatDuration(ms) {
  if (typeof ms !== 'number' || Number.isNaN(ms)) return '';
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const r = Math.round(s - m * 60);
  return `${m}m ${r.toString().padStart(2, '0')}s`;
}

function summarize(text, limit = 80) {
  if (!text) return '';
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

function truncateEvidence(value, limit = 1024) {
  if (!value) return '';
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}… (see source file)`;
}

function updateCounts(phase, status) {
  if (status === 'complete') completed += 1;
  else if (status === 'failed') failed += 1;
  else if (status === 'running') active += 1;
  else pending += 1;
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

for await (const line of rl) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  let event;
  try {
    event = JSON.parse(trimmed);
  } catch (err) {
    process.stderr.write(`render: skip invalid line: ${err.message}\n`);
    continue;
  }
  switch (event.type) {
    case 'phase_started':
      PHASES.set(event.phase, { index: event.index, total: event.total, status: 'running', duration_ms: null });
      active += 1;
      if (!header) header = `🚀 Skill session · ${event.session ?? 'unknown'}`;
      break;
    case 'phase_completed':
      PHASES.set(event.phase, { ...(PHASES.get(event.phase) ?? {}), status: event.status, duration_ms: event.duration_ms });
      active = Math.max(0, active - 1);
      updateCounts(event.phase, event.status);
      break;
    case 'step_started':
      activeSpecialist = { phase: event.phase, step: event.step, total: event.total, description: event.description };
      break;
    case 'step_completed':
      activeSpecialist = null;
      break;
    case 'evidence':
      notes.push(`💡 ${truncateEvidence(event.source)} — ${truncateEvidence(event.result)}`);
      break;
    case 'specialist_loaded':
      notes.push(`🧩 Specialist: ${event.skill} (${event.reason})`);
      break;
    case 'loop_back':
      notes.push(`↩️ loop back: ${event.from_phase} → ${event.to_phase} — ${event.reason}`);
      break;
    case 'note':
      notes.push(`${event.level === 'error' ? '❌' : event.level === 'warn' ? '⚠️' : 'ℹ️'} ${event.text}`);
      break;
    default:
      process.stderr.write(`render: unknown event ${event.type}\n`);
  }
}

const out = [];
out.push('## Skill timeline');
out.push(header);
out.push('');
for (const [phase, info] of PHASES) {
  const icon = STATUS_ICON[info.status] ?? STATUS_ICON.pending;
  const status = `${icon} ${info.status}`;
  const duration = info.duration_ms != null ? ` (${formatDuration(info.duration_ms)})` : '';
  out.push(`- ${pad(status, 14)} ${info.index ?? '-'}/${info.total ?? '-'} ${phase}${duration}`);
  if (activeSpecialist && activeSpecialist.phase === phase) {
    out.push(`    - 🧩 ${activeSpecialist.description}`);
  }
}
if (notes.length > 0) {
  out.push('');
  out.push('### Notes');
  for (const note of notes) out.push(`- ${note}`);
}
out.push('');
out.push(`### Summary · ${completed} complete · ${active} active · ${pending} pending · ${failed} failed`);
out.push('');
process.stdout.write(`${out.join('\n')}\n`);