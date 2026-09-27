// Sets lastUpdatedAt on roster entries whose content changed since the last commit, so nobody
// stamps it by hand. Runs before npm test. An entry is stamped once: if its lastUpdatedAt already
// differs from the committed one, it was stamped earlier (or deliberately set) and is left alone.
// directFields is metadata and doesn't count as a change (ROSTER_MAINTENANCE.md).
//
//   npm run stamp-updates            # compare with HEAD
//   npm run stamp-updates -- <ref>   # compare with another commit, e.g. origin/main
//
// A roster-wide schema or formatting migration (dropping a field, normalizing values) is not an
// update to anyone's record: run it with SCHEMA_MIGRATION=1 npm test so nothing is stamped.
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import type { RosterEntry } from '../src/data.ts';

const IGNORED = new Set(['lastUpdatedAt', 'directFields']);
const ref = process.argv[2] ?? 'HEAD';
const rosterFile = 'public/data.json';

function committedRoster(): RosterEntry[] | null {
  try {
    return JSON.parse(execFileSync('git', ['show', `${ref}:${rosterFile}`], { encoding: 'utf8', maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch {
    return null; // no git history (e.g. a tarball build): nothing to compare against
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

const text = await readFile(rosterFile, 'utf8');
const roster: RosterEntry[] = JSON.parse(text);
const base = process.env.SCHEMA_MIGRATION ? null : committedRoster();
if (base) {
  const before = new Map(base.map((person) => [person.id, person]));
  const now = new Date().toISOString();
  const stamped: string[] = [];
  for (const person of roster) {
    const old = before.get(person.id);
    const changed = !old ? !person.lastUpdatedAt : content(old) !== content(person) && person.lastUpdatedAt === old.lastUpdatedAt;
    if (!changed) continue;
    person.lastUpdatedAt = now;
    stamped.push(person.id);
  }
  if (stamped.length) {
    await writeFile(rosterFile, `${JSON.stringify(roster, null, 2)}\n`);
    console.log(`stamp-updates: set lastUpdatedAt on ${stamped.length} changed ${stamped.length === 1 ? 'entry' : 'entries'} (${stamped.slice(0, 10).join(', ')}${stamped.length > 10 ? ', ...' : ''})`);
  }
}
