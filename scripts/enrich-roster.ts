#!/usr/bin/env -S npx --no-install tsx

/**
 * Resumable enrichment queue. Source collection and model generation are deliberately kept
 * separate: this command records the immutable batch snapshot and accepts only validated,
 * source-backed JSON proposals from an external collector.
 *
 *   npm run enrich -- snapshot
 *   npm run enrich -- status
 *   npm run enrich -- apply proposals.json
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Roster, RosterEntry } from '../src/data.ts';
import { validateEnrichment } from '../src/enrichment.ts';

const rosterPath = resolve('public/data.json');
const ledgerPath = resolve('maintenance/enrichment.json');
const BATCH_SIZE = 20;

interface Batch { number: number; ids: string[]; status: 'pending' | 'in_progress' | 'complete'; startedAt?: string; publishedAt?: string; commit?: string; }
interface Ledger { version: 1; snapshotAt: string; ids: string[]; batches: Batch[]; entries: Record<string, {
  overview: 'pending' | 'verified' | 'no suitable evidence' | 'retry needed';
  work: 'pending' | 'verified' | 'no suitable evidence' | 'retry needed';
  sourcesChecked: string[]; evidence: unknown[]; errors: string[]; nextAction?: string; updatedAt: string;
}>; }

async function load(): Promise<{ roster: Roster; ledger: Ledger | null }> {
  const roster = JSON.parse(await readFile(rosterPath, 'utf8')) as Roster;
  let ledger: Ledger | null = null;
  try { ledger = JSON.parse(await readFile(ledgerPath, 'utf8')) as Ledger; } catch { /* snapshot not created */ }
  return { roster, ledger };
}

function makeLedger(roster: Roster): Ledger {
  const ids = roster.map((person) => person.id);
  const now = new Date().toISOString();
  const batches: Batch[] = [];
  for (let index = 0; index < ids.length; index += BATCH_SIZE) batches.push({ number: batches.length + 1, ids: ids.slice(index, index + BATCH_SIZE), status: 'pending' });
  return { version: 1, snapshotAt: now, ids, batches, entries: Object.fromEntries(roster.map((person) => [person.id, {
    overview: 'pending', work: 'pending', sourcesChecked: [person.profileUrl, ...(person.websiteUrl ? [person.websiteUrl] : [])], evidence: [] as unknown[], errors: [] as string[], updatedAt: now,
  }])) };
}

async function save(ledger: Ledger) { await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`); }

async function snapshot() {
  const { roster } = await load();
  await save(makeLedger(roster));
  console.log(`Snapshotted ${roster.length} people in ${Math.ceil(roster.length / BATCH_SIZE)} batches.`);
}

async function status() {
  const { ledger } = await load();
  if (!ledger) throw new Error('No enrichment snapshot exists; run snapshot first.');
  const counts = (key: 'overview' | 'work') => Object.values(ledger.entries).reduce<Record<string, number>>((all, entry) => { all[entry[key]] = (all[entry[key]] ?? 0) + 1; return all; }, {});
  console.log(JSON.stringify({ snapshotAt: ledger.snapshotAt, people: ledger.ids.length, batches: ledger.batches, overview: counts('overview'), work: counts('work') }, null, 2));
}

async function startBatch(number: number) {
  const { ledger } = await load();
  if (!ledger) throw new Error('No enrichment snapshot exists; run snapshot first.');
  const batch = ledger.batches.find((candidate) => candidate.number === number);
  if (!batch) throw new Error(`Unknown batch: ${number}`);
  if (batch.status === 'complete') throw new Error(`Batch ${number} is already complete.`);
  batch.status = 'in_progress';
  batch.startedAt ??= new Date().toISOString();
  await save(ledger);
  console.log(`Started batch ${number}: ${batch.ids.length} people.`);
}

function extractEvidence(html: string): string[] {
  const text = html
    .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return [...text.matchAll(/[^.!?]{80,600}[.!?]/g)].slice(0, 8).map((match) => match[0].trim());
}

async function collectBatch(number: number) {
  const { roster, ledger } = await load();
  if (!ledger) throw new Error('No enrichment snapshot exists; run snapshot first.');
  const batch = ledger.batches.find((candidate) => candidate.number === number);
  if (!batch) throw new Error(`Unknown batch: ${number}`);
  batch.status = 'in_progress';
  batch.startedAt ??= new Date().toISOString();
  for (const id of batch.ids) {
    const person = roster.find((candidate) => candidate.id === id);
    const entry = ledger.entries[id];
    if (!person || !entry) continue;
    if (entry.evidence.length || entry.errors.length) continue;
    entry.errors = [];
    entry.evidence = [];
    for (const url of [person.profileUrl, ...(person.websiteUrl ? [person.websiteUrl] : [])]) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const excerpts = extractEvidence(await response.text());
        entry.evidence.push(...excerpts.map((excerpt, index) => ({ id: `${id}-${entry.evidence.length + index + 1}`, url, excerpt, retrievedAt: new Date().toISOString(), details: 'Automatically extracted paragraph candidate; requires identity and clause verification.' })));
      } catch (error) {
        entry.errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    entry.overview = entry.evidence.length ? 'pending' : 'retry needed';
    entry.work = entry.evidence.length ? 'pending' : 'retry needed';
    entry.nextAction = entry.evidence.length ? 'Generate and independently verify overview/work proposal.' : 'Retry inaccessible source fetch.';
    entry.updatedAt = new Date().toISOString();
    await save(ledger);
    console.log(`${id}: ${entry.evidence.length ? 'evidence collected' : 'retry needed'}`);
  }
  await save(ledger);
}

async function apply(inputPath: string) {
  const { roster, ledger } = await load();
  if (!ledger) throw new Error('No enrichment snapshot exists; run snapshot first.');
  const proposals = JSON.parse(await readFile(resolve(inputPath), 'utf8')) as Record<string, Partial<RosterEntry>>;
  let changed = 0;
  for (const [id, proposal] of Object.entries(proposals)) {
    const person = roster.find((candidate) => candidate.id === id);
    if (!person) throw new Error(`Unknown roster ID: ${id}`);
    const errors = validateEnrichment(proposal);
    if (errors.length) throw new Error(`${id}: ${errors.join('; ')}`);
    if (proposal.selectedWork && proposal.recentWork) throw new Error(`${id}: choose selectedWork or recentWork`);
    Object.assign(person, proposal);
    const entry = ledger.entries[id];
    if (proposal.researchOverview) entry.overview = 'verified';
    if (proposal.selectedWork || proposal.recentWork) entry.work = 'verified';
    entry.updatedAt = new Date().toISOString();
    changed += 1;
  }
  await writeFile(rosterPath, `${JSON.stringify(roster, null, 2)}\n`);
  await save(ledger);
  console.log(`Applied validated enrichment for ${changed} people.`);
}

const [command = 'status', argument] = process.argv.slice(2);
if (command === 'snapshot') await snapshot();
else if (command === 'status') await status();
else if (command === 'start' && argument && /^\d+$/.test(argument)) await startBatch(Number(argument));
else if (command === 'collect' && argument && /^\d+$/.test(argument)) await collectBatch(Number(argument));
else if (command === 'apply' && argument) await apply(argument);
else throw new Error('Usage: enrich-roster.ts snapshot|status|start N|collect N|apply proposals.json');
