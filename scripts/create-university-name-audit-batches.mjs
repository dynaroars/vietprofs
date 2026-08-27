/**
 * Create ten balanced, deterministic university batches for a same-university
 * name-collision audit. The report is intentionally derived from data.json so
 * it can be regenerated after roster changes.
 *
 * Usage: node scripts/create-university-name-audit-batches.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const roster = JSON.parse(readFileSync(resolve(root, 'public/data.json'), 'utf8'));
const outputFile = resolve(root, 'maintenance/university-name-audit-batches.json');
const batchCount = 10;

const normalizedName = name => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+-\s+.+$/, '')
  .toLowerCase()
  .replace(/[^a-z ]/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const nameTokens = name => normalizedName(name).split(' ').filter(Boolean);

const collisionCandidates = people => {
  const candidates = [];
  for (let left = 0; left < people.length; left += 1) {
    for (let right = left + 1; right < people.length; right += 1) {
      const first = nameTokens(people[left].name);
      const second = nameTokens(people[right].name);
      const sameFirstAndLast = first[0] === second[0] && first.at(-1) === second.at(-1);
      const sharedTokens = first.filter(token => second.includes(token));
      if (sameFirstAndLast || sharedTokens.length >= 2) {
        candidates.push({
          names: [people[left].name, people[right].name],
          reason: sameFirstAndLast ? 'same normalized first and last name' : `shared tokens: ${sharedTokens.join(', ')}`,
        });
      }
    }
  }
  return candidates;
};

const universities = [...Map.groupBy(roster, person => person.university)]
  .map(([university, people]) => ({ university, people: people.length, collisionCandidates: collisionCandidates(people) }))
  .sort((left, right) => left.university.localeCompare(right.university));

const batches = Array.from({ length: batchCount }, (_, index) => ({ batch: index + 1, people: 0, universities: [] }));
for (const university of [...universities].sort((left, right) => right.people - left.people || left.university.localeCompare(right.university))) {
  const batch = batches.reduce((least, candidate) => candidate.people < least.people ? candidate : least);
  batch.people += university.people;
  batch.universities.push(university);
}
for (const batch of batches) batch.universities.sort((left, right) => left.university.localeCompare(right.university));

const report = {
  purpose: 'Audit potentially duplicated roster members by comparing similar names at the same university.',
  rosterPeople: roster.length,
  universityCount: universities.length,
  batches,
};

writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${batchCount} batches covering ${report.rosterPeople} people at ${report.universityCount} universities to ${outputFile}`);
