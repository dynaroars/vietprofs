import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { RosterEntry } from '../src/data.ts';

const rosterFile = resolve('public/data.json');
const industryFile = resolve('public/industry.json');
const apply = process.argv.includes('--apply');
const roster: RosterEntry[] = JSON.parse(await readFile(rosterFile, 'utf8'));
const industryRoster: RosterEntry[] = await readFile(industryFile, 'utf8')
  .then((text) => JSON.parse(text))
  .catch(() => []);
// Retired ids (merged duplicates, removed people) are never handed out again: their old public
// pages redirect to the kept entry, and a returning person gets their original id back.
const retired = Object.keys(
  JSON.parse(await readFile(resolve('maintenance/retired-ids.json'), 'utf8')),
);
const ids = new Set<string>([
  ...roster.map((person) => person.id).filter(Boolean),
  ...industryRoster.map((person) => person.id).filter(Boolean),
  ...retired,
]);
let next = Math.max(0, ...[...ids].map((id) => Number(id.slice(3))).filter(Number.isFinite)) + 1;

function nextId(): string {
  while (ids.has(`vp-${String(next).padStart(4, '0')}`)) next += 1;
  const id = `vp-${String(next).padStart(4, '0')}`;
  ids.add(id);
  next += 1;
  return id;
}

// New records lead with `id`, matching the rest of public/data.json. Written as an explicit
// destructure rather than `{ id: nextId(), ...person }`, which relied on the spread *not*
// overwriting the id it had just set. Entries that already have an id are passed through
// untouched so their existing key order is preserved byte for byte.
function withAssignedId(person: RosterEntry): RosterEntry {
  const { id: _unset, ...rest } = person;
  return { id: nextId(), ...rest };
}

const updatedRoster: RosterEntry[] = roster.map((person) =>
  person.id ? person : withAssignedId(person),
);
const addedRoster = updatedRoster.filter((_, index: number) => !roster[index]?.id).length;

const updatedIndustry: RosterEntry[] = industryRoster.map((person) =>
  person.id ? person : withAssignedId(person),
);
const addedIndustry = updatedIndustry.filter(
  (_, index: number) => !industryRoster[index]?.id,
).length;

const added = addedRoster + addedIndustry;
if (!apply) {
  if (added > 0) {
    throw new Error(
      `${added} roster entries need profile IDs. Run npm run assign-profile-ids -- --apply, then commit the assigned IDs.`,
    );
  }
  console.log('All roster entries have immutable profile IDs.');
} else {
  if (addedRoster > 0) {
    await writeFile(rosterFile, `${JSON.stringify(updatedRoster, null, 2)}\n`);
  }
  if (addedIndustry > 0) {
    await writeFile(industryFile, `${JSON.stringify(updatedIndustry, null, 2)}\n`);
  }
  console.log(`Assigned immutable profile IDs to ${added} roster entries.`);
}
