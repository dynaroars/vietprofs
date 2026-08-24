import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const roster = JSON.parse(readFileSync(resolve(root, 'public/data.json'), 'utf8'));
const homepages = JSON.parse(readFileSync(resolve(root, 'scripts/homepage-results.json'), 'utf8'));
const cvResults = JSON.parse(readFileSync(resolve(root, 'scripts/cv-degree-results.json'), 'utf8'));
const education = [
  ['phd', 'phdInstitution', 'phdYear'],
  ['ms', 'msInstitution', 'msYear'],
  ['undergrad', 'undergradInstitution', 'undergradYear'],
];

const entries = roster
  .filter((person) => !person.websiteUrl && education.some(([, institution, year]) => !person[institution] || !person[year]))
  .map((person) => {
    const homepageCandidates = (homepages[person.name]?.candidates ?? [])
      .filter((candidate) => /homepage|personal|website|bio/i.test(`${candidate.label} ${candidate.url}`))
      .map(({ label, url }) => ({ label, url }));
    const cvCandidates = [...new Set([
      ...(homepages[person.name]?.candidates ?? []).filter((candidate) => /cv|curriculum|vitae|resume/i.test(`${candidate.label} ${candidate.url}`)).map((candidate) => candidate.url),
      ...(cvResults[person.name]?.sources ?? []).filter((url) => /cv|curriculum|vitae|resume|\.pdf/i.test(url)),
    ])];
    return {
      name: person.name,
      profileUrl: person.profileUrl,
      university: person.university,
      missingEducation: education.filter(([, institution, year]) => !person[institution] || !person[year]).map(([label]) => label),
      knownOtherDegrees: person.otherDegrees ?? [],
      homepageCandidates,
      cvCandidates,
    };
  });

const report = {
  generatedAt: new Date().toISOString().slice(0, 10),
  criteria: {
    missingHomepage: 'websiteUrl is absent; profileUrl is retained separately and is not counted as a distinct homepage',
    missingEducation: 'phd, ms, or undergraduate institution/year is incomplete; equivalent degrees are listed in knownOtherDegrees when already recorded',
  },
  count: entries.length,
  entries,
};
writeFileSync(resolve(root, 'scripts/missing-homepages-and-degrees.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Wrote ${entries.length} records.`);
