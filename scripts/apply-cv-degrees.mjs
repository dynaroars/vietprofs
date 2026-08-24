/** Apply explicitly extracted CV degrees without overwriting existing facts. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i < 0 ? null : args[i + 1]; };
const dry = args.includes('--dry-run');
const resetOther = args.includes('--reset-other-degrees');
const namesFile = get('--names-file');
const dataFile = resolve(ROOT, 'public/data.json');
const results = JSON.parse(readFileSync(resolve(ROOT, 'scripts/cv-degree-results.json'), 'utf8'));
const roster = JSON.parse(readFileSync(dataFile, 'utf8'));
const names = namesFile ? new Set(JSON.parse(readFileSync(resolve(ROOT, namesFile), 'utf8')).map(x => typeof x === 'string' ? x : x.name)) : null;
const YEAR_MIN = 1950; const YEAR_MAX = new Date().getFullYear();
const STANDARD = { phd: ['phdInstitution', 'phdYear'], ms: ['msInstitution', 'msYear'], undergrad: ['undergradInstitution', 'undergradYear'], md: ['mdInstitution', 'mdYear'] };
const BAD = /award|honor|dissertation|thesis|publication|advisor|student|postdoc|fellowship|department of|phone|email|university press/i;
const validInst = (x) => typeof x === 'string' && x.length >= 6 && x.length <= 100 && !BAD.test(x) && !/^(?:University|University of California|College|Institute)$/i.test(x) && /\b(University|Institute|College|School|Polytechnic|Academy|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice|NUS|VNU|KAIST|HUST)\b/i.test(x);
const validYear = (x) => Number.isInteger(x) && x >= YEAR_MIN && x <= YEAR_MAX;
let count = 0;
if (resetOther) {
  for (const person of roster) {
    if (names && !names.has(person.name)) continue;
    if (person.otherDegrees) { delete person.otherDegrees; count++; }
  }
  if (!dry && count) writeFileSync(dataFile, JSON.stringify(roster, null, 2) + '\n');
  console.log(`${dry ? '[DRY RUN] Would reset' : 'Reset'} otherDegrees for ${count} entries.`);
  process.exit(0);
}
for (const person of roster) {
  if (names && !names.has(person.name)) continue;
  const result = results[person.name]; if (!result?._cvSource || !result.sources?.length) continue;
  const changes = [];
  for (const degree of result.degrees || []) {
    if (!validInst(degree.institution)) continue;
    const pair = STANDARD[degree.kind];
    if (pair) {
      if (!person[pair[0]]) { changes.push(`${pair[0]}: ${degree.institution}`); if (!dry) person[pair[0]] = degree.institution; }
      if (validYear(degree.year) && !person[pair[1]]) { changes.push(`${pair[1]}: ${degree.year}`); if (!dry) person[pair[1]] = degree.year; }
      continue;
    }
    const item = { degree: degree.degree || degree.kind.toUpperCase(), institution: degree.institution };
    if (validYear(degree.year)) item.year = degree.year;
    item.source = result.sources.find(x => /\.pdf(?:$|\?)/i.test(x) || /cv|resume|vitae/i.test(x)) ?? result.sources[0];
    const existing = Array.isArray(person.otherDegrees) ? person.otherDegrees : [];
    const duplicate = existing.some(x => x.degree === item.degree && x.institution === item.institution && x.year === item.year);
    if (!duplicate) { changes.push(`${item.degree}: ${item.institution}${item.year ? ` (${item.year})` : ''}`); if (!dry) person.otherDegrees = [...existing, item]; }
  }
  if (changes.length) { count++; console.log(`✓ ${person.name}: ${changes.join(', ')}`); }
}
if (!dry && count) writeFileSync(dataFile, JSON.stringify(roster, null, 2) + '\n');
console.log(`${dry ? '[DRY RUN] Would update' : 'Updated'} ${count} entries.`);
