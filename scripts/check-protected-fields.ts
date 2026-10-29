// Fails when the working roster changes or drops a protected (`directFields`) value relative to a
// base ref. Only a direct update may replace one (AGENTS.md "Direct updates"), so CI runs this on
// producer PRs, where any such change is a mistake.
//
//   npx tsx scripts/check-protected-fields.ts [base-ref]   (default: origin/main)
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import type { RosterEntry } from '../src/data.ts';

const baseRef = process.argv[2] ?? 'origin/main';
const base = JSON.parse(execFileSync('git', ['show', `${baseRef}:public/data.json`], { encoding: 'utf8', maxBuffer: 100_000_000 })) as RosterEntry[];
const current = new Map((JSON.parse(readFileSync('public/data.json', 'utf8')) as RosterEntry[]).map((person) => [person.id, person]));

const problems: string[] = [];
for (const before of base) {
  if (!before.directFields?.length) continue;
  const after = current.get(before.id);
  if (!after) { problems.push(`${before.id} (${before.name}) has protected fields but was removed`); continue; }
  for (const field of before.directFields) {
    const key = field as keyof RosterEntry;
    if (!isDeepStrictEqual(before[key], after[key])) problems.push(`${before.id} (${before.name}) changed protected field ${field}`);
  }
}

if (problems.length) {
  console.error(`Protected directFields changed relative to ${baseRef}. Only a direct update may change them; file an Issue for the owner instead:`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
console.log(`No protected directFields changed relative to ${baseRef}.`);
