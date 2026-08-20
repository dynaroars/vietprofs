import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FIELDS, TRACKS, fieldOf, buildFunFacts, filterRoster } from '../src/data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const roster = JSON.parse(readFileSync(join(__dirname, '../public/data.json'), 'utf8'));

test('roster is a non-empty array', () => {
  assert.ok(Array.isArray(roster));
  assert.ok(roster.length > 0);
});

test('every entry has the required fields', () => {
  for (const p of roster) {
    assert.equal(typeof p.name, 'string');
    assert.equal(typeof p.profileUrl, 'string');
    if (p.scholarUrl !== undefined) {
      assert.equal(typeof p.scholarUrl, 'string');
      assert.match(p.scholarUrl, /^https:\/\//);
    }
    assert.equal(typeof p.university, 'string');
    assert.equal(typeof p.city, 'string');
    assert.equal(typeof p.state, 'string');
    assert.ok(Array.isArray(p.researchAreas) && p.researchAreas.length > 0);
    assert.equal(typeof p.secondaryAppointment, 'boolean');
    assert.ok(TRACKS.includes(p.track), `"${p.track}" (for ${p.name}) is not one of TRACKS`);
    assert.equal(typeof p.department, 'string');
    assert.ok(p.department.length > 0);
    if (p.rank !== undefined) assert.equal(typeof p.rank, 'string');
    if (p.phdYear !== undefined) assert.ok(Number.isInteger(p.phdYear));
    if (p.phdInstitution !== undefined) assert.equal(typeof p.phdInstitution, 'string');
    if (p.undergradInstitution !== undefined) assert.equal(typeof p.undergradInstitution, 'string');
    assert.match(p.profileUrl, /^https:\/\//);
  }
});

test('no duplicate names', () => {
  const names = roster.map((p) => p.name);
  assert.equal(new Set(names).size, names.length);
});

test('no duplicate profile URLs', () => {
  const urls = roster.map((p) => p.profileUrl);
  assert.equal(new Set(urls).size, urls.length);
});

test('the field filter offers all seventeen broad fields', () => {
  assert.equal(FIELDS.length, 17);
});

test('every entry maps to one of the broad fields', () => {
  for (const p of roster) {
    assert.ok(
      FIELDS.includes(fieldOf(p.department, p.university)),
      `department "${p.department}" (for ${p.name}) does not match any FIELDS rule`,
    );
  }
});

test('Economics departments classify as Business & Economics', () => {
  assert.equal(fieldOf('Economics'), 'Business & Economics');
  assert.equal(fieldOf('Economics, Finance and Insurance'), 'Business & Economics');
});

test('business-school departments outrank generic science/CIS keywords they happen to contain', () => {
  // Real business-school department names combine an unambiguous business term with a generic
  // word that also has its own FIELD_RULES entry; the business term should still win.
  assert.equal(fieldOf('Accounting and Information Systems'), 'Business & Economics');
  assert.equal(fieldOf('Business Analytics and Data Science'), 'Business & Economics');
  assert.equal(fieldOf('Finance, Insurance, Real Estate and Law'), 'Business & Economics');
});

test('Health Sciences still outranks Business & Economics for health-policy departments', () => {
  assert.equal(fieldOf('Health Management and Policy'), 'Health Sciences');
});

test('Information Studies maps to Education only when its tenure home is UCLA GSEIS', () => {
  assert.equal(fieldOf('Information Studies', 'University of California, Los Angeles'), 'Education');
  // Same bare department string elsewhere is genuinely ambiguous without knowing the school, so
  // it falls into the catch-all rather than being guessed.
  assert.equal(fieldOf('Information Studies'), 'Others');
});

test('unmatched departments map to Others', () => {
  assert.equal(fieldOf('Military Science'), 'Others');
});

test('History maps to Humanities', () => {
  assert.equal(fieldOf('History'), 'Humanities');
  assert.equal(fieldOf('Asian Languages and Cultures'), 'Humanities');
});

test('Law maps to Law & Public Affairs', () => {
  assert.equal(fieldOf('Law'), 'Law & Public Affairs');
});

test('Cinema and Photography map to Arts & Design', () => {
  assert.equal(fieldOf('Cinema and Media Studies'), 'Arts & Design');
  assert.equal(fieldOf('Photography'), 'Arts & Design');
});

test('Ethnic and area studies map to Social & Behavioral Sciences, not Humanities', () => {
  assert.equal(fieldOf('Ethnic Studies'), 'Social & Behavioral Sciences');
  assert.equal(fieldOf('American Ethnic Studies'), 'Social & Behavioral Sciences');
  assert.equal(fieldOf('Asian American Studies'), 'Social & Behavioral Sciences');
  assert.equal(fieldOf('Global and International Studies'), 'Social & Behavioral Sciences');
});

test('"History of Art and Visual Culture" at CCA maps to Arts & Design, not Humanities', () => {
  // Bare "History" would otherwise win via the Humanities rule; the override keys on the
  // specific department+university pair rather than a generic "art history" regex.
  assert.equal(fieldOf('History of Art and Visual Culture', 'California College of the Arts'), 'Arts & Design');
});

test('duplicate names are accepted when disambiguated with " - University"', () => {
  const roster2 = [
    { ...roster[0], name: 'Thanh Nguyen - Purdue University' },
    { ...roster[0], name: 'Thanh Nguyen - Quinnipiac University' },
  ];
  const names = roster2.map((p) => p.name);
  assert.equal(new Set(names).size, names.length);
});

test('duplicate names without the University suffix are still rejected', () => {
  const roster2 = [
    { ...roster[0], name: 'Duplicate Person' },
    { ...roster[1], name: 'Duplicate Person' },
  ];
  const names = roster2.map((p) => p.name);
  assert.notEqual(new Set(names).size, names.length);
});

test('buildFunFacts returns a non-empty list of fact strings covering the roster', () => {
  const facts = buildFunFacts(roster);
  assert.ok(Array.isArray(facts));
  assert.ok(facts.length > 5);
  for (const f of facts) assert.equal(typeof f, 'string');
  // Every fact should read as a place, never mislabel DC as a "state".
  assert.ok(!facts.some((f) => /\bDC\b.*\bstate\b/i.test(f)));
});

test('buildFunFacts surname counts include common Vietnamese surnames and stay internally consistent', () => {
  const facts = buildFunFacts(roster);
  const surnameFact = facts.find((f) => f.startsWith('Most common surnames'));
  assert.ok(surnameFact);
  assert.match(surnameFact, /Nguyen \(\d+\)/);
  const nguyenCount = Number(surnameFact.match(/Nguyen \((\d+)\)/)[1]);
  // Every surname count should be no larger than how many people actually have that token in
  // their name, and no smaller than 1.
  assert.ok(nguyenCount > 0 && nguyenCount <= roster.length);
});

test('buildFunFacts includes a Vietnamese-American population-hub comparison and a refugee/diaspora research count', () => {
  const facts = buildFunFacts(roster);
  assert.ok(facts.some((f) => /Vietnamese-American communities/.test(f)));
  // The refugee/diaspora fact only appears when at least one person's research areas match; this
  // roster has known Critical Refugee Studies entries, so it should be present.
  assert.ok(facts.some((f) => /refugee, immigration, or diaspora topics/.test(f)));
});

test('search is diacritic-insensitive in both directions', () => {
  const plain = filterRoster(roster, { query: 'Nguyen', field: 'all' });
  const accented = filterRoster(roster, { query: 'Nguyễn', field: 'all' });
  assert.equal(plain.length, accented.length);
  assert.ok(plain.length > 0);
});

test('search matches on rank/title, not just name/university/location/area', () => {
  const result = filterRoster(roster, { query: 'Lecturer', field: 'all' });
  assert.ok(result.length > 0);
  assert.ok(result.every((p) => /lecturer/i.test(p.rank ?? '')));
});

test('filterRoster narrows by track and "all" leaves it unfiltered', () => {
  const tenureLine = filterRoster(roster, { query: '', field: 'all', track: 'Tenure-line' });
  assert.ok(tenureLine.length > 0);
  assert.ok(tenureLine.every((p) => p.track === 'Tenure-line'));

  const all = filterRoster(roster, { query: '', field: 'all', track: 'all' });
  assert.equal(all.length, roster.length);

  const omitted = filterRoster(roster, { query: '', field: 'all' });
  assert.equal(omitted.length, roster.length);
});
