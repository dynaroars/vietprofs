// Keeps the routines' work logs in maintenance/ small. Runs before npm test, so a routine that
// writes either file in an older or expanded layout is normalized rather than failed.
//
// portrait-queue.json holds only the work left: pending and unresolved entries as
// { id, batch, status, note? }. Name, university, and profile URL come from public/data.json, and an
// entry drops off once it has a portrait (fetch-portraits.ts re-queues it if the portrait goes).
//
// relationship-research.json keeps one outcome per roster id under `people`. A completed outcome is
// just { batch, status }: its relationships and their evidence are in public/relationships.json.
// Unresolved and excluded outcomes keep the sources checked and the next action, so a later run
// knows what was tried. Older layouts (a `batches` array with per-batch `outcomes`) are folded in.
//
// Both files are written one record per line so a batch's diff stays a few lines.
//
//   npm run normalize-maintenance
import { readFile, writeFile } from 'node:fs/promises';

export const PORTRAIT_QUEUE_FILE = 'maintenance/portrait-queue.json';
export const RELATIONSHIP_RESEARCH_FILE = 'maintenance/relationship-research.json';

export type PortraitQueueItem = {
  id: string;
  batch: number;
  status: 'pending' | 'fetched' | 'unresolved';
  note?: string;
};

type ResearchStatus = 'completed' | 'unresolved' | 'excluded';
type ResearchOutcome = {
  batch: number;
  status: ResearchStatus;
  sources?: string[];
  nextAction?: string;
  notes?: string;
};
type ResearchBatch = {
  status: string;
  startedAt?: string;
  completedAt?: string;
  rosterIds?: string[];
  notes?: string;
};
export type RelationshipResearch = {
  version: 2;
  updatedAt?: string;
  batches: Record<string, ResearchBatch>;
  people: Record<string, ResearchOutcome>;
};

const DONE_STATUSES = new Set(['completed', 'verified', 'already-covered']);
const byKey = <T>(record: Record<string, T>, compare: (a: string, b: string) => number) =>
  Object.fromEntries(Object.entries(record).sort(([a], [b]) => compare(a, b)));

function lines(record: Record<string, unknown>, indent: string): string {
  const rows = Object.entries(record).map(
    ([key, value]) => `${indent}  ${JSON.stringify(key)}: ${JSON.stringify(value)}`,
  );
  return rows.length ? `{\n${rows.join(',\n')}\n${indent}}` : '{}';
}

export function formatPortraitQueue(queue: PortraitQueueItem[]): string {
  const rows = queue
    .filter((item) => item.status !== 'fetched')
    .map(({ id, batch, status, note }) => ({ id, batch, status, ...(note && { note }) }))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((item) => `  ${JSON.stringify(item)}`);
  return `[\n${rows.join(',\n')}\n]\n`;
}

function outcome(raw: any, batch: number): ResearchOutcome {
  if (DONE_STATUSES.has(raw.status)) return { batch, status: 'completed' };
  const notes = [raw.notes, raw.note].filter(Boolean).join(' ');
  return {
    batch,
    status: raw.status,
    ...(raw.sources?.length && { sources: raw.sources }),
    ...(raw.nextAction && { nextAction: raw.nextAction }),
    ...(notes && { notes }),
  };
}

export function normalizeRelationshipResearch(raw: any): RelationshipResearch {
  const people: Record<string, ResearchOutcome> = {};
  for (const [id, value] of Object.entries<any>(raw.people ?? {}))
    people[id] = outcome(value, value.batch);
  const batches: Record<string, ResearchBatch> = {};
  const rawBatches: [string, any][] = Array.isArray(raw.batches)
    ? raw.batches.map((batch: any) => [String(batch.batchNumber), batch])
    : Object.entries(raw.batches ?? {});
  for (const [number, batch] of rawBatches) {
    for (const result of batch.outcomes ?? [])
      people[result.rosterId] = outcome(result, Number(number));
    const complete = batch.status === 'complete';
    batches[number] = {
      status: batch.status,
      ...(batch.startedAt && { startedAt: batch.startedAt }),
      ...(batch.completedAt && { completedAt: batch.completedAt }),
      ...(!complete && batch.rosterIds && { rosterIds: batch.rosterIds }),
      ...(batch.notes && { notes: batch.notes }),
    };
  }
  // Outcomes recorded ahead of their batch (the v1 `earlyOutcomes` list) count once that batch ran.
  for (const result of raw.earlyOutcomes ?? []) people[result.rosterId] ??= outcome(result, 0);
  return {
    version: 2,
    ...(raw.updatedAt && { updatedAt: raw.updatedAt }),
    batches: byKey(batches, (a, b) => Number(a) - Number(b)),
    people: byKey(people, (a, b) => a.localeCompare(b)),
  };
}

export function formatRelationshipResearch(research: RelationshipResearch): string {
  const head = research.updatedAt ? `  "updatedAt": ${JSON.stringify(research.updatedAt)},\n` : '';
  return `{\n  "version": 2,\n${head}  "batches": ${lines(research.batches, '  ')},\n  "people": ${lines(research.people, '  ')}\n}\n`;
}

async function rewrite(file: string, format: (raw: any) => string): Promise<void> {
  const before = await readFile(file, 'utf8');
  const after = format(JSON.parse(before));
  if (after !== before) {
    await writeFile(file, after);
    console.log(`normalized ${file}`);
  }
}

if (import.meta.main) {
  await rewrite(PORTRAIT_QUEUE_FILE, formatPortraitQueue);
  await rewrite(RELATIONSHIP_RESEARCH_FILE, (raw) =>
    formatRelationshipResearch(normalizeRelationshipResearch(raw)),
  );
}
