#!/usr/bin/env node

/**
 * Unattended VietProfs roster maintenance.
 *
 * RUN WEEKLY
 *   ./scripts/maintain-roster.mjs run
 *   ./scripts/maintain-roster.mjs run --name "ThanhVu H. Nguyen"
 *
 * INITIAL FULL-ROSTER SWEEP
 *   ./scripts/maintain-roster.mjs run --all --limit 1000
 *
 * STOP, THEN RESUME LATER
 *   Press Ctrl-C, or run `./scripts/maintain-roster.mjs stop` in another terminal.
 *   Days later, run `./scripts/maintain-roster.mjs run` again. It resumes automatically.
 *
 * INSPECT OR TRY WITHOUT AGENTS
 *   ./scripts/maintain-roster.mjs status
 *   ./scripts/maintain-roster.mjs run --dry-run
 *   ./scripts/maintain-roster.mjs run --all --limit 1 --dry-run
 *
 * Requirements: Linux, Node.js, npm, Git push access, and authenticated `claude` and `codex`
 * CLIs. The checkout must be clean when a new run starts and should not be edited while the
 * controller is active. Neither agent receives file-editing tools: Claude returns a structured
 * proposal, Codex independently returns a structured verdict, and this controller alone applies
 * approved JSON. State and logs live in ~/.local/state/vietprofs-maintenance by default.
 */

import { createWriteStream } from 'node:fs';
import {
  access,
  appendFile,
  mkdir,
  open,
  readFile,
  rename,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { homedir, hostname } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(SCRIPT_PATH), '..');
const STATE_HOME = process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state');
const STATE_DIR = process.env.VIETPROFS_MAINTENANCE_STATE_DIR
  || join(STATE_HOME, 'vietprofs-maintenance');
const STATE_FILE = join(STATE_DIR, 'state.json');
const LOCK_FILE = join(STATE_DIR, 'controller.json');
const STOP_FILE = join(STATE_DIR, 'stop-requested');
const RESEARCH_SCHEMA_FILE = join(STATE_DIR, 'research-schema.json');
const REVIEW_SCHEMA_FILE = join(STATE_DIR, 'review-schema.json');
const DEFAULT_LIMIT = 40;
const DEFAULT_STALE_DAYS = 365;
const DEFAULT_DEFER_DAYS = 30;
const DEFAULT_AGENT_TIMEOUT_MINUTES = 90;
const DEFAULT_RATE_LIMIT_WAIT_MINUTES = 30;
const MAX_CAPTURE_CHARS = 2_000_000;
const MAINTAINED_PATHS = new Set(['public/data.json', 'maintenance/verification.json']);

let state = null;
let activeChild = null;
let stopRequested = false;
let lockOwned = false;
let runLogFile = null;

class StopRequestedError extends Error {}
class BlockedError extends Error {}

function nowIso() {
  return new Date().toISOString();
}

function compact(value, limit = 30_000) {
  const text = String(value ?? '');
  return text.length <= limit ? text : `${text.slice(0, limit)}\n[truncated]`;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
  const body = typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`;
  await writeFile(temporary, body, 'utf8');
  await rename(temporary, path);
}

async function log(message) {
  const line = `[${nowIso()}] ${message}`;
  console.log(line);
  if (runLogFile) await appendFile(runLogFile, `${line}\n`).catch(() => {});
}

async function saveState() {
  if (!state) return;
  state.updatedAt = nowIso();
  await writeAtomic(STATE_FILE, state);
}

function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

async function processIsAgent(pid) {
  if (process.platform !== 'linux' || !processIsAlive(pid)) return false;
  try {
    const commandLine = (await readFile(`/proc/${pid}/cmdline`, 'utf8')).replaceAll('\0', ' ');
    return /(^|\/|\s)(claude|codex)(\s|$)/.test(commandLine);
  } catch {
    return false;
  }
}

function terminateGroup(pid, signal = 'SIGTERM') {
  if (!pid) return;
  try {
    process.kill(-pid, signal);
  } catch {
    try {
      process.kill(pid, signal);
    } catch {
      // It already exited.
    }
  }
}

function requestStop(signal) {
  if (stopRequested) {
    if (activeChild?.pid) terminateGroup(activeChild.pid, 'SIGKILL');
    return;
  }
  stopRequested = true;
  void writeFile(STOP_FILE, `${signal}\n`, 'utf8').catch(() => {});
  if (state) {
    state.status = 'pausing';
    void saveState().catch(() => {});
  }
  if (activeChild?.pid) terminateGroup(activeChild.pid, 'SIGTERM');
}

async function acquireLock() {
  await mkdir(STATE_DIR, { recursive: true });
  const prior = await readJson(LOCK_FILE, null);
  if (prior?.host === hostname() && processIsAlive(prior.pid)) {
    throw new Error(`maintenance is already running as PID ${prior.pid}`);
  }
  if (prior) {
    const priorState = await readJson(STATE_FILE, null);
    if (prior.host === hostname() && await processIsAgent(priorState?.activeChild?.pid)) {
      terminateGroup(priorState.activeChild.pid);
    }
    await unlink(LOCK_FILE).catch(() => {});
  }
  const handle = await open(LOCK_FILE, 'wx');
  await handle.writeFile(`${JSON.stringify({ pid: process.pid, host: hostname(), startedAt: nowIso() }, null, 2)}\n`);
  await handle.close();
  lockOwned = true;
}

async function releaseLock() {
  if (lockOwned) await unlink(LOCK_FILE).catch(() => {});
  lockOwned = false;
}

function capture(previous, chunk) {
  const next = previous + chunk;
  return next.length <= MAX_CAPTURE_CHARS ? next : next.slice(-MAX_CAPTURE_CHARS);
}

async function runProcess(command, args, {
  label = command,
  logFile = null,
  timeoutMinutes = 0,
  allowFailure = false,
  onStdoutLine = null,
} = {}) {
  if (stopRequested) throw new StopRequestedError('stop requested');
  await log(`Starting ${label}.`);
  const child = spawn(command, args, {
    cwd: REPO_ROOT,
    detached: true,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  activeChild = { pid: child.pid, label };
  if (state) {
    state.activeChild = activeChild;
    await saveState();
  }

  const outputStream = logFile ? createWriteStream(logFile, { flags: 'a' }) : null;
  let stdout = '';
  let stderr = '';
  let lineBuffer = '';
  let timedOut = false;
  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    stdout = capture(stdout, text);
    outputStream?.write(text);
    if (onStdoutLine) {
      lineBuffer += text;
      const lines = lineBuffer.split('\n');
      lineBuffer = lines.pop() ?? '';
      for (const line of lines) onStdoutLine(line);
    }
  });
  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    stderr = capture(stderr, text);
    outputStream?.write(text);
  });

  let timeout;
  if (timeoutMinutes > 0) {
    timeout = setTimeout(() => {
      timedOut = true;
      terminateGroup(child.pid);
      setTimeout(() => terminateGroup(child.pid, 'SIGKILL'), 10_000).unref();
    }, timeoutMinutes * 60_000);
    timeout.unref();
  }

  const result = await new Promise((resolveResult, rejectResult) => {
    child.once('error', rejectResult);
    child.once('close', (code, signal) => resolveResult({
      code: code ?? 1,
      signal,
      stdout,
      stderr,
      timedOut,
    }));
  });
  if (timeout) clearTimeout(timeout);
  if (lineBuffer && onStdoutLine) onStdoutLine(lineBuffer);
  outputStream?.end();
  activeChild = null;
  if (state) {
    state.activeChild = null;
    await saveState();
  }
  if (stopRequested) throw new StopRequestedError('stop requested');
  if (!allowFailure && result.code !== 0) {
    throw new Error(`${label} failed: ${compact(result.stderr || result.stdout, 4_000)}`);
  }
  return result;
}

async function git(args, options = {}) {
  return runProcess('git', args, { ...options, label: options.label || `git ${args[0]}` });
}

async function gitText(args, options = {}) {
  return (await git(args, options)).stdout.trim();
}

function parseOptions(argv) {
  const options = {
    command: 'run',
    limit: DEFAULT_LIMIT,
    staleDays: DEFAULT_STALE_DAYS,
    all: false,
    dryRun: false,
    name: null,
  };
  const values = [...argv];
  if (values[0] && !values[0].startsWith('-')) options.command = values.shift();
  while (values.length) {
    const value = values.shift();
    if (value === '--all') options.all = true;
    else if (value === '--dry-run') options.dryRun = true;
    else if (value === '--name') options.name = values.shift();
    else if (value === '--limit') options.limit = Number(values.shift());
    else if (value === '--stale-days') options.staleDays = Number(values.shift());
    else if (value === '--help' || value === '-h') options.command = 'help';
    else throw new Error(`unknown option: ${value}`);
  }
  if (!Number.isInteger(options.limit) || options.limit < 1) throw new Error('--limit must be a positive integer');
  if (!Number.isFinite(options.staleDays) || options.staleDays < 0) throw new Error('--stale-days must be zero or greater');
  if (options.name !== null && (typeof options.name !== 'string' || !options.name.trim())) throw new Error('--name requires an exact roster name');
  return options;
}

function helpText() {
  return `VietProfs unattended roster maintenance

Usage:
  ./scripts/maintain-roster.mjs run [--limit N] [--stale-days N] [--all] [--name NAME] [--dry-run]
  ./scripts/maintain-roster.mjs stop
  ./scripts/maintain-roster.mjs status

  run       Start a new run or resume the saved run automatically.
  stop      Stop the controller and its current Claude/Codex child.
  status    Show checkpoint progress.

  --limit N       Entries in a new run (default: ${DEFAULT_LIMIT}).
  --stale-days N  Minimum age of last full verification (default: ${DEFAULT_STALE_DAYS}).
  --all           Ignore age and select the oldest entries.
  --name NAME     Verify only the exact canonical roster name, regardless of age.
  --dry-run       Show the selection without agents, Git writes, commits, or pushes.

State: ${STATE_DIR}
`;
}

export function selectDueEntries(roster, verification, {
  limit = DEFAULT_LIMIT,
  staleDays = DEFAULT_STALE_DAYS,
  all = false,
  now = Date.now(),
  deferredUntil = {},
  name = null,
} = {}) {
  if (name !== null) return roster.some((person) => person.name === name) ? [name] : [];
  const cutoff = now - staleDays * 86_400_000;
  return roster
    .map((person, index) => {
      const timestamp = Date.parse(verification[person.name]);
      return { name: person.name, index, timestamp: Number.isNaN(timestamp) ? -Infinity : timestamp };
    })
    .filter((entry) => (all || entry.timestamp <= cutoff)
      && !(Date.parse(deferredUntil[entry.name]) > now))
    .sort((left, right) => left.timestamp - right.timestamp || left.index - right.index)
    .slice(0, limit)
    .map((entry) => entry.name);
}

function withoutUpdateTimestamp(person) {
  if (!person) return person;
  const { lastUpdatedAt: _ignored, ...rest } = person;
  return rest;
}

function jsonEqual(left, right) {
  return isDeepStrictEqual(left, right);
}

export function analyzeRosterProposal(beforeRoster, afterRoster, targetName) {
  if (!Array.isArray(beforeRoster) || !Array.isArray(afterRoster)) {
    return { ok: false, reason: 'roster must remain a JSON array' };
  }
  const before = new Map(beforeRoster.map((person) => [person.name, person]));
  const after = new Map(afterRoster.map((person) => [person.name, person]));
  if (before.size !== beforeRoster.length || after.size !== afterRoster.length) {
    return { ok: false, reason: 'roster names must remain unique' };
  }
  const changed = [...before.keys()].filter((name) => after.has(name) && !jsonEqual(before.get(name), after.get(name)));
  const removed = [...before.keys()].filter((name) => !after.has(name));
  const added = [...after.keys()].filter((name) => !before.has(name));
  if (changed.some((name) => name !== targetName)
      || removed.some((name) => name !== targetName)
      || added.length > 1
      || (added.length && !removed.includes(targetName))) {
    return { ok: false, reason: `proposal changed entries outside ${targetName}` };
  }
  let proposal = after.get(targetName) ?? null;
  if (removed.includes(targetName) && added.length === 1) proposal = after.get(added[0]);
  const expectedNames = beforeRoster.map((person) => person.name);
  const index = expectedNames.indexOf(targetName);
  if (proposal?.name !== targetName) {
    if (proposal) expectedNames[index] = proposal.name;
    else expectedNames.splice(index, 1);
  }
  if (!jsonEqual(expectedNames, afterRoster.map((person) => person.name))) {
    return { ok: false, reason: 'proposal reordered the roster or inserted another person' };
  }
  const baseline = before.get(targetName);
  if (proposal) proposal = { ...proposal, lastUpdatedAt: baseline.lastUpdatedAt };
  return {
    ok: true,
    baseline,
    proposal,
    finalName: proposal?.name ?? null,
    substantiveChange: !jsonEqual(withoutUpdateTimestamp(baseline), withoutUpdateTimestamp(proposal)),
  };
}

function parseJsonOutput(text) {
  const value = String(text ?? '').trim();
  try {
    return JSON.parse(value);
  } catch {
    for (const line of value.split('\n').reverse()) {
      try {
        return JSON.parse(line);
      } catch {
        // Continue to the preceding line.
      }
    }
    return null;
  }
}

function failureKind(result) {
  const text = `${result.stderr}\n${result.stdout}`.toLowerCase();
  if (/not logged in|authentication|unauthorized|credential|login required|sign in/.test(text)) return 'auth';
  if (/rate.?limit|usage limit|too many requests|overloaded|capacity|resets? at|hit your limit/.test(text)) return 'rate';
  if (result.timedOut) return 'timeout';
  return 'other';
}

async function waitMinutes(minutes, reason) {
  await log(`${reason}; waiting ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  const end = Date.now() + minutes * 60_000;
  while (Date.now() < end) {
    if (stopRequested) throw new StopRequestedError('stop requested');
    await new Promise((resolveWait) => setTimeout(resolveWait, Math.min(30_000, end - Date.now())));
  }
}

async function runAgentWithRetries(label, invoke) {
  let ordinaryFailures = 0;
  let rateWait = Number(process.env.VIETPROFS_RATE_LIMIT_WAIT_MINUTES || DEFAULT_RATE_LIMIT_WAIT_MINUTES);
  while (true) {
    const result = await invoke();
    if (result.ok) return result.value;
    const kind = failureKind(result.process);
    if (kind === 'auth') throw new BlockedError(`${label} authentication failed; sign in and rerun the controller`);
    if (kind === 'rate') {
      await waitMinutes(rateWait, `${label} rate/usage limit reached`);
      rateWait = Math.min(rateWait * 2, 240);
      continue;
    }
    if (kind === 'timeout') {
      await waitMinutes(5, `${label} timed out`);
      continue;
    }
    ordinaryFailures += 1;
    if (ordinaryFailures >= 3) throw new Error(`${label} failed three times: ${compact(result.process.stderr || result.process.stdout, 3_000)}`);
    await waitMinutes(5, `${label} failed`);
  }
}

async function ensureSchemas() {
  const researchSchema = {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['complete', 'incomplete'] },
      action: { type: 'string', enum: ['keep', 'update', 'remove'] },
      proposedEntryJson: { type: 'string' },
      report: { type: 'string' },
      sources: { type: 'array', items: { type: 'string' } },
    },
    required: ['status', 'action', 'proposedEntryJson', 'report', 'sources'],
    additionalProperties: false,
  };
  const reviewSchema = {
    type: 'object',
    properties: {
      verdict: { type: 'string', enum: ['approve', 'reject', 'uncertain'] },
      summary: { type: 'string' },
      reasons: { type: 'array', items: { type: 'string' } },
      verifiedSources: { type: 'array', items: { type: 'string' } },
    },
    required: ['verdict', 'summary', 'reasons', 'verifiedSources'],
    additionalProperties: false,
  };
  await writeAtomic(RESEARCH_SCHEMA_FILE, researchSchema);
  await writeAtomic(REVIEW_SCHEMA_FILE, reviewSchema);
  return { researchSchema, reviewSchema };
}

async function assertPreflight() {
  const checks = [
    ['git', ['--version'], 'Git'],
    ['node', ['--version'], 'Node.js'],
    ['npm', ['--version'], 'npm'],
    ['claude', ['auth', 'status'], 'Claude'],
    ['codex', ['login', 'status'], 'Codex'],
  ];
  for (const [command, args, label] of checks) {
    const result = await runProcess(command, args, { label: `${label} preflight`, allowFailure: true });
    if (result.code !== 0) throw new BlockedError(`${label} preflight failed: ${compact(result.stderr || result.stdout, 2_000)}`);
  }
  if (await gitText(['branch', '--show-current']) !== 'main') throw new BlockedError('maintenance must run on the main branch');
}

async function changedPaths() {
  return (await gitText(['status', '--porcelain'])).split('\n').filter(Boolean).map((line) => {
    const path = line.slice(3).trim();
    return path.includes(' -> ') ? path.split(' -> ').at(-1) : path;
  });
}

async function requireCleanCheckout() {
  const paths = await changedPaths();
  if (paths.length) throw new BlockedError(`checkout is not clean: ${paths.join(', ')}`);
}

async function requireOnlyMaintainedChanges() {
  const unexpected = (await changedPaths()).filter((path) => !MAINTAINED_PATHS.has(path));
  if (unexpected.length) throw new BlockedError(`unexpected changes while maintenance is active: ${unexpected.join(', ')}`);
}

function researchPrompt(name, baseline) {
  return `You are the primary researcher for one VietProfs roster entry.

Target: ${name}
Current entry:
${JSON.stringify(baseline, null, 2)}

Read AGENTS.md, README.md, and ROSTER_MAINTENANCE.md completely. Use live authoritative sources
to perform the entire periodic verification: identity and Vietnamese-diaspora eligibility,
current primary university appointment, department, rank/track, official profile URL,
personal/lab website, Google Scholar URL, portrait and portrait source, secondary appointment,
and continued inclusion eligibility. Check all explicitly documented education: PhD, master's,
undergraduate, professional or equivalent degrees, majors and graduation years, plus completed
postdoctoral institution and end/completion year. Check every honor under the documented honors
eligibility rules. Do not treat a reachable URL as a complete review.

You cannot edit files. Return structured output. Use action "keep" if no roster fact should change,
"update" for a corrected full entry (also use it for a canonical-name correction), or "remove" if
the person is no longer eligible. For update, proposedEntryJson must be the complete JSON object;
for keep/remove, use an empty string. Never choose lastUpdatedAt—the controller owns timestamps.
Set status incomplete whenever material evidence is blocked, conflicting, or unresolved. Include
every source URL and explain every checked field and proposed change.`;
}

function reviewPrompt(current) {
  return `You are the independent second reviewer for unattended VietProfs maintenance.

Target: ${current.name}
Baseline:
${JSON.stringify(current.baseline, null, 2)}

Claude result:
${JSON.stringify(current.research, null, 2)}

Normalized proposal (null means removal):
${JSON.stringify(current.proposal, null, 2)}

Read ROSTER_MAINTENANCE.md and independently browse live authoritative sources. Distrust the first
review until you confirm identity, eligibility, current primary appointment, department,
rank/track, official profile, personal/lab and Google Scholar URLs, portrait and source, secondary
appointment, every documented degree/major/graduation year, completed postdoctoral institution
and end/completion year, honors eligibility, and every proposed change. Approve only when the
complete verification standard is satisfied and the normalized proposal is correct.
Return uncertain for incomplete/inaccessible evidence and reject demonstrably incorrect work.
Do not edit files. Return only the required structured verdict.`;
}

async function runResearch(current, schemas) {
  const timeout = Number(process.env.VIETPROFS_AGENT_TIMEOUT_MINUTES || DEFAULT_AGENT_TIMEOUT_MINUTES);
  return runAgentWithRetries('Claude', async () => {
    const output = join(STATE_DIR, `research-${current.jobId}.json`);
    await unlink(output).catch(() => {});
    const result = await runProcess('claude', [
      '-p',
      '--output-format', 'json',
      '--permission-mode', 'dontAsk',
      '--allowedTools', 'Read,Glob,Grep,WebSearch,WebFetch',
      '--json-schema', JSON.stringify(schemas.researchSchema),
      '--session-id', randomUUID(),
      researchPrompt(current.name, current.baseline),
    ], {
      label: `Claude research for ${current.name}`,
      logFile: join(STATE_DIR, 'logs', `${current.jobId}-claude.log`),
      timeoutMinutes: timeout,
      allowFailure: true,
    });
    const outer = parseJsonOutput(result.stdout);
    const structured = outer?.structured_output
      || (typeof outer?.result === 'string' ? parseJsonOutput(outer.result) : outer?.result);
    return { ok: result.code === 0 && structured, value: structured, process: result };
  });
}

async function runReview(current) {
  const timeout = Number(process.env.VIETPROFS_AGENT_TIMEOUT_MINUTES || DEFAULT_AGENT_TIMEOUT_MINUTES);
  return runAgentWithRetries('Codex', async () => {
    const output = join(STATE_DIR, `review-${current.jobId}.json`);
    await unlink(output).catch(() => {});
    const result = await runProcess('codex', [
      '--search',
      '--sandbox', 'read-only',
      '--ask-for-approval', 'never',
      'exec',
      '--json',
      '--output-schema', REVIEW_SCHEMA_FILE,
      '--output-last-message', output,
      reviewPrompt(current),
    ], {
      label: `Codex review for ${current.name}`,
      logFile: join(STATE_DIR, 'logs', `${current.jobId}-codex.log`),
      timeoutMinutes: timeout,
      allowFailure: true,
    });
    const review = await readJson(output, null);
    return {
      ok: result.code === 0 && review && ['approve', 'reject', 'uncertain'].includes(review.verdict),
      value: review,
      process: result,
    };
  });
}

function normalizeResearchProposal(roster, current, research) {
  let proposed;
  if (research.action === 'keep') proposed = current.baseline;
  else if (research.action === 'remove') proposed = null;
  else {
    proposed = parseJsonOutput(research.proposedEntryJson);
    if (!proposed || typeof proposed !== 'object' || Array.isArray(proposed)) {
      throw new Error('Claude update did not contain a valid complete entry JSON object');
    }
  }
  const after = structuredClone(roster);
  const index = after.findIndex((person) => person.name === current.name);
  if (proposed) after[index] = proposed;
  else after.splice(index, 1);
  return analyzeRosterProposal(roster, after, current.name);
}

async function startPerson(name) {
  await requireCleanCheckout();
  await git(['pull', '--ff-only', 'origin', 'main'], { label: 'update main before next person' });
  const roster = await readJson(join(REPO_ROOT, 'public/data.json'));
  const baseline = roster.find((person) => person.name === name);
  if (!baseline) throw new Error(`queued entry no longer exists: ${name}`);
  state.current = {
    jobId: randomUUID(),
    name,
    stage: 'researching',
    baseCommit: await gitText(['rev-parse', 'HEAD']),
    baseline,
    proposal: null,
    research: null,
    review: null,
    substantiveChange: false,
  };
  await saveState();
}

async function skipPerson(reason, details = null) {
  await requireCleanCheckout();
  state.skipped.push({ name: state.current.name, reason, details: compact(JSON.stringify(details), 5_000), at: nowIso() });
  state.deferredUntil[state.current.name] = new Date(Date.now() + DEFAULT_DEFER_DAYS * 86_400_000).toISOString();
  state.index += 1;
  state.current = null;
  await saveState();
}

async function applyProposal(current) {
  const rosterPath = join(REPO_ROOT, 'public/data.json');
  const verificationPath = join(REPO_ROOT, 'maintenance/verification.json');
  const roster = await readJson(rosterPath);
  const verification = await readJson(verificationPath);
  const finalName = current.proposal?.name ?? null;
  let index = roster.findIndex((person) => person.name === current.name);
  if (index < 0 && finalName) index = roster.findIndex((person) => person.name === finalName);

  if (current.proposal === null) {
    if (index >= 0) roster.splice(index, 1);
    delete verification[current.name];
  } else {
    if (index < 0) throw new Error(`cannot apply proposal because ${current.name} is missing`);
    const next = { ...current.proposal };
    next.lastUpdatedAt = current.substantiveChange ? current.approvedAt : current.baseline.lastUpdatedAt;
    roster[index] = next;
    if (finalName !== current.name) delete verification[current.name];
    verification[finalName] = current.approvedAt;
  }
  await writeAtomic(rosterPath, roster);
  await writeAtomic(verificationPath, verification);
  await runProcess('npm', ['run', 'validate-data'], { label: `validate ${current.name}` });
}

async function runFullChecks() {
  await runProcess('npm', ['test'], { label: 'npm test' });
  await runProcess('npm', ['run', 'build'], { label: 'npm run build' });
  await git(['diff', '--check'], { label: 'git diff --check' });
  await git(['diff', '--cached', '--check'], { label: 'git diff --cached --check' });
}

async function commitPerson(current) {
  const lastMessage = await gitText(['log', '-1', '--format=%B']);
  if (lastMessage.includes(`Maintenance-Job: ${current.jobId}`)) return;
  await requireOnlyMaintainedChanges();
  if ((await changedPaths()).length === 0) throw new Error('approved verification produced no ledger or roster change');
  await git(['add', 'public/data.json', 'maintenance/verification.json']);
  await git([
    'commit',
    '-m', `Automated roster maintenance: verify ${current.name}`,
    '-m', `Maintenance-Job: ${current.jobId}`,
  ], { label: `commit ${current.name}` });
}

async function pushPerson(current) {
  const pull = await git(['pull', '--rebase', 'origin', 'main'], {
    label: 'rebase before push',
    allowFailure: true,
  });
  if (pull.code !== 0) {
    await git(['rebase', '--abort'], { allowFailure: true });
    throw new BlockedError(`could not rebase ${current.name} onto origin/main`);
  }
  await runFullChecks();
  await git(['push', 'origin', 'main'], { label: `push ${current.name}` });
}

async function processCurrent(schemas) {
  const current = state.current;
  if (current.stage === 'researching' || current.stage === 'reviewing') {
    await requireCleanCheckout();
    if (await gitText(['rev-parse', 'HEAD']) !== current.baseCommit) {
      throw new BlockedError(`main changed locally while ${current.name} was being reviewed`);
    }
  }
  if (current.stage === 'researching') {
    try {
      current.research = await runResearch(current, schemas);
      const roster = await readJson(join(REPO_ROOT, 'public/data.json'));
      const analysis = normalizeResearchProposal(roster, current, current.research);
      if (!analysis.ok) return skipPerson('unsafe research proposal', analysis.reason);
      current.proposal = analysis.proposal;
      current.substantiveChange = analysis.substantiveChange;
      current.stage = 'reviewing';
      await saveState();
    } catch (error) {
      if (error instanceof StopRequestedError || error instanceof BlockedError) throw error;
      return skipPerson('research failed repeatedly', error.message);
    }
  }

  if (current.stage === 'reviewing') {
    try {
      current.review = await runReview(current);
      if (current.review.verdict !== 'approve') {
        return skipPerson(`Codex verdict: ${current.review.verdict}`, current.review);
      }
      current.approvedAt = nowIso();
      current.stage = 'applying';
      await saveState();
    } catch (error) {
      if (error instanceof StopRequestedError || error instanceof BlockedError) throw error;
      return skipPerson('review failed repeatedly', error.message);
    }
  }

  if (current.stage === 'applying') {
    if (await gitText(['rev-parse', 'HEAD']) !== current.baseCommit) {
      throw new BlockedError(`main changed locally while ${current.name} was being reviewed`);
    }
    await requireOnlyMaintainedChanges();
    await applyProposal(current);
    current.stage = 'committing';
    await saveState();
  }

  if (current.stage === 'committing') {
    await runFullChecks();
    await commitPerson(current);
    current.stage = 'pushing';
    await saveState();
  }

  if (current.stage === 'pushing') {
    await pushPerson(current);
    state.completed.push({
      name: current.name,
      finalName: current.proposal?.name ?? null,
      changed: current.substantiveChange,
      verifiedAt: current.approvedAt,
      commit: await gitText(['rev-parse', 'HEAD']),
    });
    delete state.deferredUntil[current.name];
    state.index += 1;
    state.current = null;
    await saveState();
  }
}

async function createRun(options) {
  await requireCleanCheckout();
  await git(['pull', '--ff-only', 'origin', 'main'], { label: 'update origin/main' });
  const roster = await readJson(join(REPO_ROOT, 'public/data.json'));
  const verification = await readJson(join(REPO_ROOT, 'maintenance/verification.json'));
  const deferredUntil = state?.deferredUntil || {};
  state = {
    version: 1,
    runId: randomUUID(),
    status: 'running',
    startedAt: nowIso(),
    options: { limit: options.limit, staleDays: options.staleDays, all: options.all, name: options.name },
    queue: selectDueEntries(roster, verification, { ...options, deferredUntil }),
    index: 0,
    current: null,
    completed: [],
    skipped: [],
    deferredUntil,
    activeChild: null,
  };
  runLogFile = join(STATE_DIR, 'logs', `${state.runId}-controller.log`);
  await mkdir(dirname(runLogFile), { recursive: true });
  await saveState();
}

async function dryRun(options) {
  const roster = await readJson(join(REPO_ROOT, 'public/data.json'));
  const verification = await readJson(join(REPO_ROOT, 'maintenance/verification.json'));
  const previous = await readJson(STATE_FILE, null);
  const queue = selectDueEntries(roster, verification, {
    ...options,
    deferredUntil: previous?.deferredUntil || {},
  });
  console.log(`Would select ${queue.length} roster entr${queue.length === 1 ? 'y' : 'ies'}:`);
  for (const name of queue) console.log(`- ${name} (${verification[name] || 'never verified'})`);
}

async function runController(options) {
  if (options.dryRun) return dryRun(options);
  await acquireLock();
  await unlink(STOP_FILE).catch(() => {});
  state = await readJson(STATE_FILE, null);
  const resumable = state && state.status !== 'complete' && Array.isArray(state.queue);
  if (resumable) {
    runLogFile = join(STATE_DIR, 'logs', `${state.runId}-controller.log`);
    state.status = 'running';
    await saveState();
    await log(`Resuming ${state.runId} at ${state.index + 1}/${state.queue.length}.`);
  }

  await assertPreflight();
  const schemas = await ensureSchemas();
  if (!resumable) await createRun(options);
  if (state.queue.length === 0) {
    state.status = 'complete';
    state.completedAt = nowIso();
    await saveState();
    await log('No entries are due for verification.');
    return;
  }

  while (state.index < state.queue.length) {
    if (stopRequested || await exists(STOP_FILE)) throw new StopRequestedError('stop requested');
    if (!state.current) await startPerson(state.queue[state.index]);
    await log(`Processing ${state.current.name} (${state.index + 1}/${state.queue.length}), stage ${state.current.stage}.`);
    await processCurrent(schemas);
  }
  state.status = 'complete';
  state.completedAt = nowIso();
  await saveState();
  await log(`Run complete: ${state.completed.length} approved, ${state.skipped.length} skipped.`);
}

async function stopController() {
  await mkdir(STATE_DIR, { recursive: true });
  await writeFile(STOP_FILE, `${nowIso()}\n`, 'utf8');
  const lock = await readJson(LOCK_FILE, null);
  const saved = await readJson(STATE_FILE, null);
  if (!lock || lock.host !== hostname() || !processIsAlive(lock.pid)) {
    console.log('No running controller was found. The stop request is recorded.');
    return;
  }
  if (saved?.activeChild?.pid) terminateGroup(saved.activeChild.pid);
  process.kill(lock.pid, 'SIGTERM');
  console.log(`Stop requested for PID ${lock.pid}.`);
  const deadline = Date.now() + 30_000;
  while (processIsAlive(lock.pid) && Date.now() < deadline) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  if (processIsAlive(lock.pid)) {
    if (saved?.activeChild?.pid) terminateGroup(saved.activeChild.pid, 'SIGKILL');
    process.kill(lock.pid, 'SIGKILL');
    console.log('Force-stopped after the 30-second grace period.');
  } else {
    console.log('Stopped. The next run resumes automatically.');
  }
}

async function showStatus() {
  const saved = await readJson(STATE_FILE, null);
  const lock = await readJson(LOCK_FILE, null);
  if (!saved) {
    console.log(`No run recorded in ${STATE_DIR}.`);
    return;
  }
  const running = lock?.host === hostname() && processIsAlive(lock.pid);
  console.log(`Status: ${saved.status}${running ? ` (PID ${lock.pid})` : ''}`);
  console.log(`Progress: ${saved.index}/${saved.queue?.length ?? 0}`);
  if (saved.current) console.log(`Current: ${saved.current.name} — ${saved.current.stage}`);
  console.log(`Approved: ${saved.completed?.length ?? 0}; skipped: ${saved.skipped?.length ?? 0}`);
  console.log(`Updated: ${saved.updatedAt}`);
  console.log(`State: ${STATE_DIR}`);
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  if (options.command === 'help') return console.log(helpText());
  if (options.command === 'stop') return stopController();
  if (options.command === 'status') return showStatus();
  if (options.command !== 'run') throw new Error(`unknown command: ${options.command}`);
  process.on('SIGINT', () => requestStop('SIGINT'));
  process.on('SIGTERM', () => requestStop('SIGTERM'));

  try {
    await runController(options);
  } catch (error) {
    if (error instanceof StopRequestedError) {
      if (state) {
        state.status = 'paused';
        await saveState();
      }
      await log('Paused. Run the script again to resume automatically.');
      process.exitCode = 130;
      return;
    }
    if (state) {
      state.status = error instanceof BlockedError ? 'blocked' : 'failed';
      state.error = compact(error.stack || error.message, 10_000);
      await saveState();
    }
    throw error;
  } finally {
    await releaseLock();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
