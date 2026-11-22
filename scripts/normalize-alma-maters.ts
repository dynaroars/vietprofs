// Rewrites spelling variants of Vietnamese alma maters in degree fields to their one canonical
// name (src/alma-mater.ts), so counts, alumni pages and search agree. Runs before every test;
// it normalizes instead of failing, so producers never get blocked on a spelling.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { canonicalAlmaMater } from '../src/alma-mater.ts';
import type { RosterEntry } from '../src/data.ts';

const FIELDS = [
  'undergradInstitution',
  'msInstitution',
  'phdInstitution',
  'postdocInstitution',
] as const;
const rosterFile = resolve('public/data.json');
const roster: RosterEntry[] = JSON.parse(await readFile(rosterFile, 'utf8'));
let changed = 0;
for (const person of roster) {
  for (const field of FIELDS) {
    const value = person[field];
    if (typeof value !== 'string') continue;
    const canonical = canonicalAlmaMater(value);
    if (canonical !== value) {
      person[field] = canonical;
      changed += 1;
    }
  }
}
if (changed > 0) {
  await writeFile(rosterFile, `${JSON.stringify(roster, null, 2)}\n`);
  console.log(`Normalized ${changed} alma mater spellings.`);
}
