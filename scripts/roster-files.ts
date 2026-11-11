// The roster lives in two files that share one vp-#### id namespace (ROSTER_MAINTENANCE.md
// "Two roster files, one ID namespace"). Any tool that dedups, retires, checks, or rewrites
// entries must see both, so load them through here instead of reading public/data.json alone.
import { readFile, writeFile } from 'node:fs/promises';
import type { RosterEntry } from '../src/data.ts';

export const ROSTER_FILES = ['public/data.json', 'public/industry.json'] as const;

export type RosterFile = { file: string; entries: RosterEntry[] };

export async function loadRosterFiles(): Promise<RosterFile[]> {
  return Promise.all(
    ROSTER_FILES.map(async (file) => ({
      file,
      entries: JSON.parse(await readFile(file, 'utf8').catch(() => '[]')) as RosterEntry[],
    })),
  );
}

export async function loadAllEntries(): Promise<RosterEntry[]> {
  return (await loadRosterFiles()).flatMap(({ entries }) => entries);
}

export async function saveRosterFile({ file, entries }: RosterFile): Promise<void> {
  await writeFile(file, `${JSON.stringify(entries, null, 2)}\n`);
}
