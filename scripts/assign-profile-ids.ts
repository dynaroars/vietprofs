import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rosterFile = resolve('public/data.json');
const apply = process.argv.includes('--apply');
const roster = JSON.parse(await readFile(rosterFile, 'utf8'));
const ids = new Set<string>(roster.map((person) => person.id).filter(Boolean));
let next = Math.max(0, ...[...ids].map((id) => Number(id.slice(3))).filter(Number.isFinite)) + 1;

function nextId() {
  while (ids.has(`vp-${String(next).padStart(4, '0')}`)) next += 1;
  const id = `vp-${String(next).padStart(4, '0')}`;
  ids.add(id);
  next += 1;
  return id;
}

const updated = roster.map((person) => person.id ? person : { id: nextId(), ...person });
const added = updated.filter((_, index) => !roster[index].id).length;
if (!apply) {
  if (added > 0) {
    throw new Error(`${added} roster entries need profile IDs. Run npm run assign-profile-ids -- --apply, then commit the assigned IDs.`);
  }
  console.log('All roster entries have immutable profile IDs.');
} else {
  await writeFile(rosterFile, `${JSON.stringify(updated, null, 2)}\n`);
  console.log(`Assigned immutable profile IDs to ${added} roster entries.`);
}
