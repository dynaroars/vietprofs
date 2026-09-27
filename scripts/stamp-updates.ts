// Records when each roster entry's content last changed, so nobody stamps it by hand. Runs before
// npm test. The dates live in public/updates.json ({ "vp-0001": "<ISO time>", ... }), not in
// public/data.json, so a roster edit's diff shows only the facts that changed. An entry is stamped
// once: if its date already differs from the committed one, it was stamped earlier (or
// deliberately set) and is left alone. directFields is metadata and doesn't count as a change
// (ROSTER_MAINTENANCE.md).
//
//   npm run stamp-updates            # compare with HEAD
//   npm run stamp-updates -- <ref>   # compare with another commit, e.g. origin/main
//
// A roster-wide schema or formatting migration (dropping a field, normalizing values) is not an
// update to anyone's record: run it with SCHEMA_MIGRATION=1 npm test so nothing is stamped.
//
// It also keeps updates.json in step with the roster: new ids get a date, retired ids lose
// theirs, and a lastUpdatedAt found in data.json (the old layout) is moved over.
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import type { RosterEntry, RosterUpdates } from '../src/data.ts';

const IGNORED = new Set(['lastUpdatedAt', 'directFields']);
const ref = process.argv[2] ?? 'HEAD';
const rosterFile = 'public/data.json';
const updatesFile = 'public/updates.json';

function committed<T>(file: string): T | null {
  try {
    return JSON.parse(execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch {
    return null; // no git history (e.g. a tarball build), or the file didn't exist at ref
  }
}

function content(person: RosterEntry): string {
  const record = person as unknown as Record<string, unknown>;
  const sorted = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sorted);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sorted((value as Record<string, unknown>)[key])]));
    }
    return value;
  };
  return JSON.stringify(sorted(Object.fromEntries(Object.entries(record).filter(([key]) => !IGNORED.has(key)))));
}

const rosterText = await readFile(rosterFile, 'utf8');
const roster: RosterEntry[] = JSON.parse(rosterText);
const updatesText = await readFile(updatesFile, 'utf8').catch(() => '{}\n');
const current: RosterUpdates = JSON.parse(updatesText);
const now = new Date().toISOString();

// Old layout: move any lastUpdatedAt still stored in data.json into updates.json.
let rosterChanged = false;
for (const person of roster) {
  if (person.lastUpdatedAt === undefined) continue;
  current[person.id] ??= person.lastUpdatedAt;
  delete person.lastUpdatedAt;
  rosterChanged = true;
}

const baseRoster = process.env.SCHEMA_MIGRATION ? null : committed<RosterEntry[]>(rosterFile);
const stamped: string[] = [];
if (baseRoster) {
  // Before updates.json existed, the committed dates were inside data.json.
  const baseUpdates: RosterUpdates = committed<RosterUpdates>(updatesFile)
    ?? Object.fromEntries(baseRoster.filter((person) => person.lastUpdatedAt).map((person) => [person.id, person.lastUpdatedAt as string]));
  const before = new Map(baseRoster.map((person) => [person.id, person]));
  for (const person of roster) {
    const old = before.get(person.id);
    const changed = !old ? !current[person.id] : content(old) !== content(person) && current[person.id] === baseUpdates[person.id];
    if (!changed) continue;
    current[person.id] = now;
    stamped.push(person.id);
  }
}

const updates: RosterUpdates = {};
for (const id of roster.map((person) => person.id).filter(Boolean).sort()) updates[id] = current[id] ?? now;
const updatesOut = `${JSON.stringify(updates, null, 2)}\n`;
if (updatesOut !== updatesText) await writeFile(updatesFile, updatesOut);
if (rosterChanged) await writeFile(rosterFile, `${JSON.stringify(roster, null, 2)}\n`);
if (stamped.length) {
  console.log(`stamp-updates: stamped ${stamped.length} changed ${stamped.length === 1 ? 'entry' : 'entries'} (${stamped.slice(0, 10).join(', ')}${stamped.length > 10 ? ', ...' : ''})`);
}
