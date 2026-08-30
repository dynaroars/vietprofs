import { test } from 'node:test';
// Data behavior is tested against the canonical JSON roster.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FIELDS, LOCATIONS, HEALTH_SUBFIELDS, canonicalRank, displayName, displayUniversity, fieldOf, healthSubfieldOf, continentOf, locationMatches, buildFunFacts, buildAwardsFunFacts, buildInternationalObservations, buildLocationObservations, filterRoster } from '../src/data.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const roster = JSON.parse(readFileSync(join(__dirname, '../public/data.json'), 'utf8'));

test('reviewed portraits use local WebP files with source provenance', () => {
  const portraits = roster.filter((person) => person.portrait);
  assert.ok(portraits.length > 400, 'expected broad portrait coverage across the roster');
  for (const person of portraits) {
    assert.match(person.portrait, /^portraits\/[a-z0-9][a-z0-9.-]*\.webp$/);
    assert.match(person.portraitSource, /^https?:\/\//);
    assert.ok(readFileSync(join(__dirname, '../public', person.portrait)).length > 0);
  }
});

test('roster is a non-empty array', () => {
  assert.ok(Array.isArray(roster));
  assert.ok(roster.length > 0);
});

test('health subfields are the only derived field subdivisions', () => {
  for (const person of roster) {
    const subfield = healthSubfieldOf(person);
    if (subfield !== null) assert.ok(HEALTH_SUBFIELDS.includes(subfield));
  }
  assert.ok(roster.some((person) => healthSubfieldOf(person) === 'Clinical Medicine'));
});

test('maintenance-only verification timestamps are not exposed publicly', () => {
  for (const p of roster) {
    assert.equal(p.lastVerifiedAt, undefined);
  }
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

test('Information Studies defaults to computing but UCLA GSEIS stays Education', () => {
  assert.equal(fieldOf('Information Studies', 'University of California, Los Angeles'), 'Education');
  // Same bare department string elsewhere is genuinely ambiguous without knowing the school, so
  // it falls into the catch-all rather than being guessed.
  assert.equal(fieldOf('Information Studies'), 'Computer & Information Sciences');
  assert.equal(fieldOf('Information Science and Technology'), 'Computer & Information Sciences');
  assert.equal(fieldOf('IST'), 'Computer & Information Sciences');
});

test('rank labels use the simplified public vocabulary', () => {
  assert.equal(canonicalRank({ track: 'Tenure-line', rank: 'Distinguished Professor' }), 'Professor');
  assert.equal(canonicalRank({ track: 'Tenure-line', rank: 'Associate Professor of Finance' }), 'Associate Professor');
  assert.equal(canonicalRank({ track: 'Tenure-line', rank: 'Assistant Professor of Practice' }), 'Assistant Professor');
  assert.equal(canonicalRank({ track: 'Teaching', rank: 'Senior Lecturer II' }), 'Teaching');
  assert.equal(canonicalRank({ track: 'Research', rank: 'Assistant Research Professor' }), 'Research');
  assert.equal(canonicalRank({ track: 'Clinical', rank: 'Clinical Professor' }), 'Clinical');
  assert.equal(canonicalRank({ track: 'Teaching', rank: 'Professor of Practice' }), 'Teaching');
  assert.equal(canonicalRank({ track: 'Emeritus', rank: 'Professor Emerita' }), 'Emeritus');
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

test('buildFunFacts reports structural roster observations rather than name-based trivia', () => {
  const facts = buildFunFacts(roster);
  assert.ok(facts.some((f) => /distinct departments/.test(f)));
  assert.ok(facts.some((f) => /same-institution, same-field cluster/.test(f)));
  assert.ok(facts.some((f) => /largest broad fields are closely represented internationally/.test(f)));
});

test('field-balance observations name the fields computed from their input', () => {
  const sample = [
    ...Array.from({ length: 4 }, (_, index) => ({ name: `Historian ${index}`, university: `U${index}`, department: 'History', country: 'France' })),
    ...Array.from({ length: 4 }, (_, index) => ({ name: `Lawyer ${index}`, university: `L${index}`, department: 'Law', country: 'France' })),
    ...Array.from({ length: 4 }, (_, index) => ({ name: `Artist ${index}`, university: `A${index}`, department: 'Music', country: 'France' })),
  ];
  const fact = buildInternationalObservations(sample).find((value) => value.includes('closely represented'));
  assert.match(fact, /Humanities \(4\).*Law & Public Affairs \(4\).*Arts & Design \(4\)/);
});

test('location observations do not silently remove United States entries from a continent', () => {
  const sample = [
    { name: 'US Person', university: 'US University', department: 'History', country: 'United States' },
    { name: 'Canada Person', university: 'Canada University', department: 'History', country: 'Canada' },
  ];
  assert.match(buildLocationObservations(sample, 'North America')[0], /^2 entries/);
});

test('buildFunFacts includes only observations computed from roster fields', () => {
  const facts = buildFunFacts(roster);
  assert.ok(facts.some((f) => /California and Texas together contain/.test(f)));
  assert.ok(facts.some((f) => /international city clusters/.test(f)));
  assert.ok(facts.some((f) => /roster suggests a different .* balance/.test(f)));
  assert.ok(!facts.some((f) => /Vietnamese-American communities|Census|population hubs/.test(f)));
});

test('buildAwardsFunFacts reports major award categories and NSF CAREER holders', () => {
  const facts = buildAwardsFunFacts(roster);
  assert.ok(facts.some((f) => /NSF CAREER Award holders: \d+ across the database/.test(f)));
  assert.ok(facts.some((f) => /PECASE recipients: \d+ across the database/.test(f)));
  assert.ok(facts.some((f) => /MacArthur Fellows: \d+; Fields Medalists: \d+/.test(f)));
  assert.ok(facts.some((f) => /Marquee honors represented: .*Fields Medal \(\d+\).*MacArthur Fellow \(\d+\)/.test(f)));
  assert.ok(facts.some((f) => /national-academy/.test(f)));
});

test('search is diacritic-insensitive in both directions', () => {
  const plain = filterRoster(roster, { query: 'Nguyen', field: 'all' });
  const accented = filterRoster(roster, { query: 'Nguyễn', field: 'all' });
  assert.equal(plain.length, accented.length);
  assert.ok(plain.length > 0);
});

test('search matches on simplified rank, not just name/university/location/area', () => {
  const result = filterRoster(roster, { query: 'Teaching', field: 'all' });
  assert.ok(result.length > 0);
  assert.ok(result.some((p) => canonicalRank(p) === 'Teaching'));
});

test('scoped search restricts results to the requested roster attribute', () => {
  const tai = filterRoster(roster, { query: 'Tai Tan Mai', searchScope: 'name', location: 'World' });
  assert.equal(tai.length, 1);
  assert.equal(tai[0].name, 'Tai Tan Mai');

  const professors = filterRoster(roster, { query: 'Professor', searchScope: 'rank', location: 'World' });
  assert.ok(professors.length > 0);
  assert.ok(professors.every((person) => /professor/i.test(person.rank || '') || /professor/i.test(canonicalRank(person))));

  const engineering = filterRoster(roster, { query: 'Engineering', searchScope: 'field', location: 'World' });
  assert.ok(engineering.length > 0);
  assert.ok(engineering.every((person) => fieldOf(person.department, person.university) === 'Engineering'));

  const research = filterRoster(roster, { query: 'Machine Learning', searchScope: 'research', location: 'World' });
  assert.ok(research.length > 0);
  assert.ok(research.every((person) => person.researchAreas?.some((area) => /machine learning/i.test(area))));

  const honors = filterRoster(roster, { query: 'NSF CAREER', searchScope: 'honors', location: 'World' });
  assert.ok(honors.length > 0);
  assert.ok(honors.every((person) => person.honors?.some((honor) => /NSF CAREER/i.test(honor.name))));
});

test('searching an honor name lists professors who hold that honor', () => {
  const career = filterRoster(roster, { query: 'NSF CAREER', field: 'all' });
  assert.ok(career.length > 0);
  assert.ok(career.every((p) => p.honors?.some((honor) => honor.name === 'NSF CAREER Award')));

  const fellow = filterRoster(roster, { query: 'IEEE Fellow', field: 'all' });
  assert.ok(fellow.length > 0);
  assert.ok(fellow.every((p) => p.honors?.some((honor) => honor.name === 'IEEE Fellow')));
});

test('searching a name without middle initials still finds the professor', () => {
  const result = filterRoster(roster, { query: 'van vu', field: 'all', location: 'World' });
  assert.ok(result.some((person) => person.name === 'Van H. Vu'));
});

test('a two-word name search does not match terms scattered across unrelated fields', () => {
  const result = filterRoster(roster, { query: 'Quan Nguyen', field: 'all', location: 'World' });
  assert.ok(result.some((person) => person.name === 'Quan Nguyen'));
  // Every hit must contain both terms within one field (e.g. the name itself), not "nguyen" in
  // the name plus an unrelated "quan" substring incidental to some other field such as a
  // "Quantum ..." research area.
  for (const person of result) {
    const fields = [
      displayName(person.name),
      person.university,
      person.department,
      ...(person.researchAreas ?? []),
    ].filter(Boolean).map((value) => value.toLowerCase());
    assert.ok(fields.some((field) => field.includes('quan') && field.includes('nguyen')), `${person.name} matched without both terms in one field`);
  }
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

test('duplicate-name university suffixes are hidden from display', () => {
  assert.equal(displayName('Chi Nguyen - University of Arizona'), 'Chi Nguyen');
  assert.equal(displayName('Chi L. Nguyen'), 'Chi L. Nguyen');
});

test('university display names use aliases and abbreviate a terminal University', () => {
  assert.equal(displayUniversity('Pennsylvania State University'), 'Penn State');
  assert.equal(displayUniversity('Penn State University'), 'Penn State');
  assert.equal(displayUniversity('Stanford University'), 'Stanford');
  assert.equal(displayUniversity('Princeton University'), 'Princeton');
  assert.equal(displayUniversity('Harvard University'), 'Harvard');
  assert.equal(displayUniversity('Massachusetts Institute of Technology'), 'MIT');
  assert.equal(displayUniversity('Penn State Harrisburg'), 'Penn State Harrisburg');
  assert.equal(displayUniversity('George Mason University'), 'George Mason Univ.');
  assert.equal(displayUniversity('Boston University'), 'Boston Univ.');
  assert.equal(displayUniversity('University of New Mexico'), 'University of New Mexico');
});

test('university suffixes are reserved for otherwise identical names', () => {
  const visibleCounts = new Map();
  for (const person of roster) {
    const visible = displayName(person.name);
    visibleCounts.set(visible, (visibleCounts.get(visible) ?? 0) + 1);
  }
  for (const person of roster.filter((entry) => entry.name.includes(' - '))) {
    assert.ok(visibleCounts.get(displayName(person.name)) > 1, person.name);
  }
});

test('LOCATIONS includes US, continents, and World', () => {
  assert.deepEqual(LOCATIONS, [
    'US',
    'North America',
    'South America',
    'Africa',
    'Asia',
    'Australasia',
    'Europe',
    'World',
  ]);
});

test('continentOf maps international countries correctly', () => {
  assert.equal(continentOf('United States'), 'North America');
  assert.equal(continentOf('Canada'), 'North America');
  assert.equal(continentOf('France'), 'Europe');
  assert.equal(continentOf('United Kingdom'), 'Europe');
  assert.equal(continentOf('Singapore'), 'Asia');
  assert.equal(continentOf('Japan'), 'Asia');
  assert.equal(continentOf('Australia'), 'Australasia');
  assert.equal(continentOf('New Zealand'), 'Australasia');
});

test('locationMatches filters by US, continent, and World', () => {
  const sampleUS = { name: 'Test US', country: 'United States' };
  const sampleCA = { name: 'Test CA', country: 'Canada' };
  const sampleFR = { name: 'Test FR', country: 'France' };
  const sampleSG = { name: 'Test SG', country: 'Singapore' };
  const sampleAU = { name: 'Test AU', country: 'Australia' };

  assert.ok(locationMatches(sampleUS, 'US'));
  assert.ok(!locationMatches(sampleCA, 'US'));
  assert.ok(locationMatches(sampleUS, 'North America'));
  assert.ok(locationMatches(sampleCA, 'North America'));
  assert.ok(locationMatches(sampleFR, 'Europe'));
  assert.ok(!locationMatches(sampleFR, 'Asia'));
  assert.ok(locationMatches(sampleSG, 'Asia'));
  assert.ok(locationMatches(sampleAU, 'Australasia'));
  assert.ok(locationMatches(sampleUS, 'World'));
  assert.ok(locationMatches(sampleFR, 'World'));
});

test('locationMatches filters by an exact country for the country dropdown', () => {
  const sampleUS = { country: 'United States' };
  const sampleFR = { country: 'France' };
  const sampleSG = { country: 'Singapore' };

  assert.ok(locationMatches(sampleFR, 'France'));
  assert.ok(!locationMatches(sampleSG, 'France'));
  assert.ok(locationMatches(sampleUS, 'United States'));
  assert.ok(!locationMatches(sampleFR, 'United States'));
});

test('unique helpers never contain undefined or null values', async () => {
  const { uniqueStates, uniqueCities, uniqueDepartments, uniqueCountries, uniqueResearchAreas, uniquePhdInstitutions, uniqueRanks } = await import('../src/data.ts');
  const states = uniqueStates(roster);
  const cities = uniqueCities(roster);
  const depts = uniqueDepartments(roster);
  const countries = uniqueCountries(roster);
  const areas = uniqueResearchAreas(roster);
  const phds = uniquePhdInstitutions(roster);
  const ranks = uniqueRanks(roster);

  assert.ok(!states.includes(undefined) && !states.includes(null));
  assert.ok(!cities.includes(undefined) && !cities.includes(null));
  assert.ok(!depts.includes(undefined) && !depts.includes(null));
  assert.ok(!countries.includes(undefined) && !countries.includes(null));
  assert.ok(!areas.includes(undefined) && !areas.includes(null));
  assert.ok(!phds.includes(undefined) && !phds.includes(null));
  assert.ok(!ranks.includes(undefined) && !ranks.includes(null));
});

test('escapeHtml safely handles undefined, null, and special characters', async () => {
  const { escapeHtml } = await import('../src/utils.ts');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(''), '');
  assert.equal(escapeHtml('Hello & <World> "quotes"'), 'Hello &amp; &lt;World&gt; &quot;quotes&quot;');
});
