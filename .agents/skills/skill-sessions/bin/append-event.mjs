#!/usr/bin/env node
// Append a single JSONL event to a session file under docs/skill-sessions/.
//
// Usage:
//   echo '{"type":"phase_started",...}' | node .agents/skills/skill-sessions/bin/append-event.mjs --session <id> --event <path>
//
// Or pipe multiple events line-by-line. Finalizes the session file's
// `ended_at` and `status` frontmatter when a `phase_completed` event with
// status `complete` arrives for the last recorded phase.

import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const REPO_ROOT = process.cwd();
const SESSIONS_DIR = join(REPO_ROOT, 'docs', 'skill-sessions');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
    out[key] = value;
  }
  return out;
}

function escapeYaml(value) {
  return String(value ?? '').replace(/"/g, '\\"');
}

function ensureFrontmatter(text, meta) {
  if (text.startsWith('---\n')) {
    return text;
  }
  const lines = ['---'];
  for (const [key, value] of Object.entries(meta)) {
    lines.push(`${key}: "${escapeYaml(value)}"`);
  }
  lines.push('---\n');
  return `${lines.join('\n')}\n${text}`;
}

async function readSession(file) {
  try {
    return await readFile(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return '';
    throw err;
  }
}

function pickLastPhase(body) {
  const matches = [...body.matchAll(/^### Phase (.+)$/gm)];
  if (matches.length === 0) return null;
  return matches[matches.length - 1][1].trim();
}

async function appendEvent({ session, event, finalize = false }) {
  await mkdir(SESSIONS_DIR, { recursive: true });
  const file = join(SESSIONS_DIR, `${session}.md`);
  const block = `### ${event.type} · ${event.ts}\n\n\`\`\`json\n${JSON.stringify(event, null, 2)}\n\`\`\`\n\n`;
  let body = await readSession(file);
  if (!body) {
    body = ensureFrontmatter(body, {
      skill: event.skill ?? 'unknown',
      change: event.change ?? 'unknown',
      branch: event.branch ?? 'unknown',
      started_at: event.ts,
      ended_at: '',
      status: 'running',
    });
  }
  if (event.type === 'phase_completed' && event.status === 'complete') {
    body = body.replace(/^ended_at: ".*"$/m, '').replace(/^status: ".*"$/m, '');
    body = body.replace(/\n---\n/, `\nended_at: "${event.ts}"\nstatus: "complete"\n---\n`);
  }
  await writeFile(file, body + block, 'utf8');
  process.stdout.write(`appended ${event.type} → ${file}${finalize ? ' (finalize requested)' : ''}\n`);
}

const args = parseArgs(process.argv.slice(2));
if (!args.session) {
  process.stderr.write('append-event: --session <id> is required\n');
  process.exit(1);
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
});
process.stdin.on('end', async () => {
  const lines = buffer.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    let event;
    try {
      event = JSON.parse(line);
    } catch (err) {
      process.stderr.write(`append-event: skip invalid line: ${err.message}\n`);
      continue;
    }
    await appendEvent({ session: args.session, event, finalize: args.finalize === 'true' });
  }
});