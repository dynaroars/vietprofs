import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rosterFile = resolve('public/data.json');
const redirectsFile = resolve('maintenance/profile-redirects.json');
const apply = process.argv.includes('--apply');
const roster = JSON.parse(await readFile(rosterFile, 'utf8'));
const redirects = JSON.parse(await readFile(redirectsFile, 'utf8'));
const ids = new Set([...roster.map((person) => person.id).filter(Boolean), ...Object.keys(redirects)]);
let next = 1;

function nextId() {
  while (ids.has(`vp-${String(next).padStart(4, '0')}`)) next += 1;
  const id = `vp-${String(next).padStart(4, '0')}`;
  ids.add(id);
  next += 1;
  return id;
}

const updated = roster.map((person) => person.id ? person : { id: nextId(), ...person });
const added = updated.filter((person, index) => !roster[index].id).length;
if (!apply) {
  console.log(`${added} roster entries need profile IDs. Re-run with --apply to assign them.`);
} else {
  await writeFile(rosterFile, `${JSON.stringify(updated, null, 2)}\n`);
  console.log(`Assigned immutable profile IDs to ${added} roster entries.`);
}
