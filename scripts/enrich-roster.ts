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

interface Batch { number: number; ids: string[]; status: 'pending' | 'complete'; publishedAt?: string; commit?: string; }
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
else if (command === 'apply' && argument) await apply(argument);
else throw new Error('Usage: enrich-roster.ts snapshot|status|apply proposals.json');
