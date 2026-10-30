import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Roster } from '../src/data.ts';

// The deployed copies of the roster JSON drop bookkeeping the site never shows and are minified.
// public/ keeps the full source of truth; only dist/ (what visitors download) is slimmed.
const UNSHIPPED_FIELDS = ['directFields', 'portraitSource'] as const;

const dist = resolve(import.meta.dirname, '..', 'dist');

async function rewrite(file: string, transform: (value: unknown) => unknown) {
  const path = resolve(dist, file);
  const before = await readFile(path, 'utf8');
  const after = JSON.stringify(transform(JSON.parse(before)));
  await writeFile(path, after);
  console.log(
    `Slimmed dist/${file}: ${Math.round(before.length / 1024)} KB -> ${Math.round(after.length / 1024)} KB`,
  );
}

await rewrite('data.json', (roster) =>
  (roster as Roster).map((person) => {
    const shipped: Record<string, unknown> = { ...person };
    for (const field of UNSHIPPED_FIELDS) delete shipped[field];
    return shipped;
  }),
);
await rewrite('relationships.json', (database) => database);
