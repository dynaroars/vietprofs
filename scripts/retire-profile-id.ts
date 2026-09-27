// Retires one roster id in favor of another and rewrites every reference to it.
//
//   npm run retire-profile-id -- <retired-id> --into <kept-id> --reason "..." [--apply]
//
// Two situations, both about the same person holding two ids:
// - Restore: <kept-id> is an older id that was dropped (a duplicate was merged into a newer
//   entry, or the person was removed and later re-added). The newer entry is renamed back to
//   <kept-id>, keeping its current data.
// - Merge: both ids are still in the roster. Move any unique sourced fields onto <kept-id> and
//   delete the <retired-id> entry first; this script then only rewrites the references.
// Either way the retired id goes into maintenance/retired-ids.json, so it is never reassigned
// and its old public page redirects to the kept one. Keep the older (lower) id.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { RosterEntry } from '../src/data.ts';

type RetiredIds = Record<string, { replacedBy: string | null; retiredAt: string; name: string; university: string; reason: string }>;

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const option = (flag: string) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : undefined; };
const retiredArg = args.find((arg) => /^vp-\d{4,}$/.test(arg));
const keptArg = option('--into');
const reasonArg = option('--reason');
if (!retiredArg || !keptArg || !/^vp-\d{4,}$/.test(keptArg) || !reasonArg) {
  throw new Error('usage: npm run retire-profile-id -- <retired-id> --into <kept-id> --reason "..." [--apply]');
}
const retired: string = retiredArg;
const kept: string = keptArg;
const reason: string = reasonArg;
if (Number(kept.slice(3)) > Number(retired.slice(3))) {
  console.warn(`warning: keeping the newer id ${kept}; keep the older id unless it is itself retired.`);
}

const rosterFile = resolve('public/data.json');
const retiredFile = resolve('maintenance/retired-ids.json');
const roster: RosterEntry[] = JSON.parse(await readFile(rosterFile, 'utf8'));
const retiredIds: RetiredIds = JSON.parse(await readFile(retiredFile, 'utf8'));
const ledgersOnly = args.includes('--ledgers-only'); // replay reference rewrites after a manual roster edit
const retiredEntry = ledgersOnly ? undefined : roster.find((person) => person.id === retired);
const keptEntry = roster.find((person) => person.id === kept);
if (!ledgersOnly && retiredEntry && keptEntry) throw new Error(`${retired} and ${kept} are both in the roster: merge ${retired}'s unique sourced fields into ${kept}, delete ${retired}, then rerun.`);
const restoring = ledgersOnly ? args.includes('--restore') : Boolean(retiredEntry);
const person = (retiredEntry ?? keptEntry) as RosterEntry;
if (!person) throw new Error(`${kept} is not in the roster`);

// When a ledger already has records under both ids, one side is stale: in a restore the retired
// id holds the live records (the kept id's are from before it was dropped); in a merge the kept
// id's records win. Drop the stale side, then rename whatever the retired id still owns.
const stale = restoring ? kept : retired;
const byId = (a: string, b: string) => Number(a.slice(3)) - Number(b.slice(3));
const isId = (value: unknown): value is string => typeof value === 'string' && /^vp-\d{4,}$/.test(value);
const ownedBy = (value: unknown, id: string) => value === id
  || (Boolean(value) && typeof value === 'object' && !Array.isArray(value) && ['id', 'rosterId'].some((key) => (value as Record<string, unknown>)[key] === id));

function drop(value: unknown): unknown {
  if (Array.isArray(value)) return value.filter((item) => !ownedBy(item, stale)).map(drop);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([key]) => key !== stale).map(([key, child]) => [key, drop(child)]));
  }
  return value;
}

function rename(value: unknown): unknown {
  if (value === retired) return kept;
  if (Array.isArray(value)) {
    const items = value.map(rename);
    const wasSorted = items.length > 1 && value.every(isId) && value.every((item, index) => index === 0 || byId(value[index - 1], item) <= 0);
    return wasSorted ? (items as string[]).sort(byId) : items;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, child]) => [key === retired ? kept : key, rename(child)] as const);
    const original = Object.keys(value as Record<string, unknown>);
    const wasSorted = original.length > 1 && original.every(isId) && original.every((key, index) => index === 0 || byId(original[index - 1], key) <= 0);
    return Object.fromEntries(wasSorted ? [...entries].sort(([a], [b]) => byId(a, b)) : entries);
  }
  return value;
}

const files = [resolve('public/relationships.json'), ...(await readdir('maintenance'))
  .filter((file) => file.endsWith('.json') && file !== 'retired-ids.json')
  .map((file) => resolve('maintenance', file))];
const changed: string[] = [];
const writes: Array<[string, string]> = [];
for (const file of files) {
  const text = await readFile(file, 'utf8');
  if (!text.includes(`"${retired}"`)) continue;
  const data = JSON.parse(text);
  const both = text.includes(`"${kept}"`);
  writes.push([file, `${JSON.stringify(rename(both ? drop(data) : data), null, 2)}\n`]);
  changed.push(file);
}

if (restoring && !ledgersOnly) {
  const { id: _old, ...rest } = person;
  const index = roster.indexOf(person);
  roster.splice(index, 1);
  const renamed = { id: kept, ...rest } as RosterEntry;
  const at = roster.findIndex((entry) => byId(entry.id, kept) > 0);
  roster.splice(at < 0 ? roster.length : at, 0, renamed);
  writes.push([rosterFile, `${JSON.stringify(roster, null, 2)}\n`]);
}
delete retiredIds[kept];
retiredIds[retired] = { replacedBy: kept, retiredAt: new Date().toISOString().slice(0, 10), name: person.name, university: person.university, reason };
writes.push([retiredFile, `${JSON.stringify(Object.fromEntries(Object.entries(retiredIds).sort(([a], [b]) => byId(a, b))), null, 2)}\n`]);

console.log(`${restoring ? 'restore' : 'merge'}: ${retired} -> ${kept} (${person.name})`);
console.log(`references rewritten in: ${changed.map((file) => file.replace(`${process.cwd()}/`, '')).join(', ') || 'none'}`);
if (apply) {
  for (const [file, text] of writes) await writeFile(file, text);
  console.log('applied');
} else {
  console.log('dry run; pass --apply to write');
}
