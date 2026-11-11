// Fails when the working roster changes or drops a protected (`directFields`) value relative to a
// base ref. Only a direct update may replace one (AGENTS.md "Direct updates"), so CI runs this on
// producer PRs, where any such change is a mistake.
//
//   node scripts/check-protected-fields.ts [base-ref]   (default: origin/main)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import type { RosterEntry } from '../src/data.ts';
import { ROSTER_FILES } from './roster-files.ts';

const baseRef = process.argv[2] ?? 'origin/main';
// A base ref from before a roster file existed simply has no protected values in that file.
const base = ROSTER_FILES.flatMap((file) => {
  try {
    return JSON.parse(
      execFileSync('git', ['show', `${baseRef}:${file}`], {
        encoding: 'utf8',
        maxBuffer: 100_000_000,
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    ) as RosterEntry[];
  } catch {
    if (file === ROSTER_FILES[0]) throw new Error(`cannot read ${file} at ${baseRef}`);
    return [];
  }
});
// Looked up across both files: moving an entry between them keeps its protected values.
const current = new Map(
  ROSTER_FILES.flatMap((file) =>
    existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as RosterEntry[]) : [],
  ).map((person) => [person.id, person]),
);

const problems: string[] = [];
for (const before of base) {
  if (!before.directFields?.length) continue;
  const after = current.get(before.id);
  if (!after) {
    problems.push(`${before.id} (${before.name}) has protected fields but was removed`);
    continue;
  }
  for (const field of before.directFields) {
    const key = field as keyof RosterEntry;
    if (!isDeepStrictEqual(before[key], after[key]))
      problems.push(`${before.id} (${before.name}) changed protected field ${field}`);
  }
}

if (problems.length) {
  console.error(
    `Protected directFields changed relative to ${baseRef}. Only a direct update may change them; file an Issue for the owner instead:`,
  );
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
console.log(`No protected directFields changed relative to ${baseRef}.`);
