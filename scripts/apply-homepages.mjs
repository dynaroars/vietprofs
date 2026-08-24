/** Apply only high-confidence personal homepage candidates for one batch. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i < 0 ? null : args[i + 1]; };
const batchFile = getArg('--batch-file');
if (!batchFile) throw new Error('Missing --batch-file');

const dataFile = resolve(ROOT, 'public/data.json');
const results = JSON.parse(readFileSync(resolve(ROOT, 'scripts/homepage-results.json'), 'utf8'));
const batch = JSON.parse(readFileSync(resolve(ROOT, batchFile), 'utf8'));
const roster = JSON.parse(readFileSync(dataFile, 'utf8'));
const byName = new Map(roster.map((person) => [person.name, person]));
const applied = [];

function highConfidence(candidate) {
  if (candidate.score < 5) return false;
  const label = candidate.label.trim();
  if (!/^(?:homepage|home|website|personal website|bio\/?personal)$/i.test(label)) return false;
  if (/\/people\/|\/faculty\/|\/directory\/|catalog|alumni|admissions|\/about(?:\/|$)|get-involved|request-info/i.test(candidate.url)) return false;
  if (/linkedin|scholar\.google|orcid|facebook|twitter|youtube|\.pdf(?:$|\?)/i.test(candidate.url)) return false;
  return true;
}

for (const entry of batch) {
  const person = byName.get(entry.name);
  const candidates = results[entry.name]?.candidates ?? [];
  const candidate = candidates.find(highConfidence);
  if (!person || !candidate || person.profileUrl === candidate.url) continue;
  const oldUrl = person.profileUrl;
  person.profileUrl = candidate.url;
  applied.push({ name: person.name, from: oldUrl, to: candidate.url, label: candidate.label });
}

if (applied.length) writeFileSync(dataFile, JSON.stringify(roster, null, 2) + '\n');
console.log(`Applied ${applied.length} homepage replacements.`);
for (const item of applied) console.log(`✓ ${item.name}: ${item.to}`);
