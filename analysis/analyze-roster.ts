// Roster snapshot statistics for METRICS.md, INTERESTING-FACTS.md, and paper.tex.
// Field counts come from the canonical `fieldOf` in src/data.ts, so this report and the
// live site always agree on the broad-field taxonomy.
import fs from 'node:fs';
import { FIELDS, countBy, fieldOf, type Roster, type RosterEntry } from '../src/data.ts';

const roster: Roster = JSON.parse(fs.readFileSync(new URL('../public/data.json', import.meta.url), 'utf8'));

const countryOf = (p: RosterEntry) => p.country ?? 'United States';
const fieldsOf = (people: Roster) => countBy(people, (p) => fieldOf(p.department ?? '', p.university));
const withShares = (people: Roster) =>
  fieldsOf(people).map(([field, n]) => [field, n, Math.round((100 * n) / people.length)]);

const us = roster.filter((p) => countryOf(p) === 'United States');
const intl = roster.filter((p) => countryOf(p) !== 'United States');
const universities = countBy(roster, (p) => p.university);
const phdYears = roster.map((p) => p.phdYear).filter(Boolean) as number[];

// Distinct department strings per university: how cross-disciplinary each institutional group is.
const departmentSpread = countBy(
  [...new Map(roster.filter((p) => p.department).map((p) => [`${p.university} ${p.department}`, p])).values()],
  (p) => p.university,
);
const sameInstitutionFieldClusters = countBy(
  roster.filter((p) => p.department),
  (p) => `${p.university} | ${fieldOf(p.department, p.university)}`,
).filter(([, n]) => n >= 3);

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  records: roster.length,
  universities: universities.length,
  countries: countBy(roster, countryOf).length,
  usRecords: us.length,
  internationalRecords: intl.length,
  broadFields: FIELDS.length,
  tracks: countBy(roster, (p) => p.track ?? 'missing'),
  urls: {
    profile: roster.filter((p) => p.profileUrl).length,
    scholar: roster.filter((p) => p.scholarUrl).length,
    website: roster.filter((p) => p.websiteUrl).length,
    phd: roster.filter((p) => p.phdInstitution).length,
    phdYear: phdYears.length,
  },
  phdYearRange: phdYears.length ? [Math.min(...phdYears), Math.max(...phdYears)] : [],
  honorsRecords: roster.filter((p) => (p.honors ?? []).length > 0).length,
  topUniversities: universities.slice(0, 20),
  topCountries: countBy(roster, countryOf),
  fields: fieldsOf(roster),
  states: countBy(us, (p) => p.state ?? 'missing').slice(0, 20),
  departmentSpread: departmentSpread.slice(0, 20),
  sameInstitutionFieldClusters: sameInstitutionFieldClusters.slice(0, 20),
  usFieldShares: withShares(us),
  internationalFieldShares: withShares(intl),
}, null, 2));
