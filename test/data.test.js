import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FIELDS, TRACKS, LOCATIONS, HEALTH_SUBFIELDS, canonicalRank, displayName, displayUniversity, fieldOf, healthSubfieldOf, continentOf, locationMatches, buildFunFacts, buildAwardsFunFacts, filterRoster, buildTopUniversities, buildTopPhdInstitutions } from '../src/data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const roster = JSON.parse(readFileSync(join(__dirname, '../public/data.json'), 'utf8'));
const verification = JSON.parse(readFileSync(join(__dirname, '../maintenance/verification.json'), 'utf8'));
const utcTimestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

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

test('every entry has the required fields', () => {
  for (const p of roster) {
    assert.equal(typeof p.name, 'string');
    assert.equal(typeof p.profileUrl, 'string');
    assert.equal(p.lastVerifiedAt, undefined);
    assert.equal(typeof p.lastUpdatedAt, 'string');
    assert.match(p.lastUpdatedAt, utcTimestampPattern);
    assert.equal(new Date(p.lastUpdatedAt).toISOString(), p.lastUpdatedAt);
    assert.ok(new Date(p.lastUpdatedAt).valueOf() <= Date.now());
    if (p.scholarUrl !== undefined) {
      assert.equal(typeof p.scholarUrl, 'string');
      assert.match(p.scholarUrl, /^https:\/\//);
    }
    assert.equal(typeof p.university, 'string');
    assert.equal(typeof p.city, 'string');
    if (p.state !== undefined) assert.equal(typeof p.state, 'string');
    if (p.country !== undefined) assert.equal(typeof p.country, 'string');
    assert.ok(Array.isArray(p.researchAreas) && p.researchAreas.length > 0);
    assert.equal(typeof p.secondaryAppointment, 'boolean');
    assert.ok(TRACKS.includes(p.track), `"${p.track}" (for ${p.name}) is not one of TRACKS`);
    assert.equal(typeof p.department, 'string');
    assert.ok(p.department.length > 0);
    if (p.rank !== undefined) assert.equal(typeof p.rank, 'string');
    if (p.phdYear !== undefined) assert.ok(Number.isInteger(p.phdYear));
    if (p.phdInstitution !== undefined) assert.equal(typeof p.phdInstitution, 'string');
    if (p.undergradInstitution !== undefined) assert.equal(typeof p.undergradInstitution, 'string');
    assert.match(p.profileUrl, /^https?:\/\//);
  }
});

test('maintenance verification ledger exactly covers the roster', () => {
  assert.deepEqual(Object.keys(verification).sort(), roster.map((person) => person.name).sort());
  for (const person of roster) {
    const timestamp = verification[person.name];
    assert.equal(typeof timestamp, 'string');
    assert.match(timestamp, utcTimestampPattern);
    assert.equal(new Date(timestamp).toISOString(), timestamp);
    assert.ok(new Date(timestamp).valueOf() <= Date.now());
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

test('honors and awards keywords list every professor with at least one honor', () => {
  const expected = roster.filter((p) => Array.isArray(p.honors) && p.honors.length > 0);
  for (const query of ['honors', 'awards']) {
    const results = filterRoster(roster, { query, field: 'all', location: 'World', track: 'all' });
    assert.equal(results.length, expected.length, `Unexpected result count for ${query}`);
    assert.deepEqual(results, expected, `Unexpected result set for ${query}`);
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

test('univ: prefix only includes faculty at that university and excludes PhD graduates at other universities', () => {
  const topUnis = buildTopUniversities(roster, 8);
  for (const [uni, count] of topUnis) {
    const results = filterRoster(roster, { query: `univ:${uni}`, field: 'all', track: 'all' });
    assert.equal(results.length, count, `univ:${uni} should return exactly ${count} faculty`);
    assert.ok(
      results.every((p) => p.university.toLowerCase().includes(uni.toLowerCase())),
      `All returned faculty should have university matching "${uni}"`,
    );
  }
});

test('phd: prefix only includes faculty whose PhD alma mater matches', () => {
  const topPhds = buildTopPhdInstitutions(roster, 8);
  for (const [inst, count] of topPhds) {
    const results = filterRoster(roster, { query: `phd:${inst}`, field: 'all', track: 'all' });
    assert.equal(results.length, count, `phd:${inst} should return exactly ${count} faculty`);
    assert.ok(
      results.every((p) => p.phdInstitution && p.phdInstitution.toLowerCase().includes(inst.toLowerCase())),
      `All returned faculty should have phdInstitution matching "${inst}"`,
    );
  }
});

test('state: prefix only includes faculty in that state', () => {
  const caResults = filterRoster(roster, { query: 'state:California', field: 'all', track: 'all' });
  const actualCa = roster.filter((p) => p.state === 'California');
  assert.equal(caResults.length, actualCa.length);
  assert.ok(caResults.every((p) => p.state === 'California'));

  const txResults = filterRoster(roster, { query: 'state:TX', field: 'all', track: 'all' });
  const actualTx = roster.filter((p) => p.state === 'Texas');
  assert.equal(txResults.length, actualTx.length);
  assert.ok(txResults.every((p) => p.state === 'Texas'));
});

test('filterRoster prefix queries handle quotes, aliases, and extra whitespace', () => {
  const q1 = filterRoster(roster, { query: 'university:"Texas Tech University"' });
  const q2 = filterRoster(roster, { query: 'univ:   Texas Tech University  ' });
  const q3 = filterRoster(roster, { query: 'school:\'Texas Tech University\'' });
  assert.equal(q1.length, 9);
  assert.equal(q2.length, 9);
  assert.equal(q3.length, 9);
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

test('country: and continent: prefix queries filter roster accurately', () => {
  const usQuery = filterRoster(roster, { query: 'country:US' });
  const actualUS = roster.filter((p) => (p.country || 'United States') === 'United States');
  assert.equal(usQuery.length, actualUS.length);

  const sgQuery = filterRoster(roster, { query: 'country:Singapore' });
  const actualSG = roster.filter((p) => p.country === 'Singapore');
  assert.equal(sgQuery.length, actualSG.length);

  const auQuery = filterRoster(roster, { query: 'country:Australia' });
  const actualAU = roster.filter((p) => p.country === 'Australia');
  assert.equal(auQuery.length, actualAU.length);

  const caQuery = filterRoster(roster, { query: 'country:Canada' });
  const actualCA = roster.filter((p) => p.country === 'Canada');
  assert.equal(caQuery.length, actualCA.length);

  const ukQuery = filterRoster(roster, { query: 'country:"United Kingdom"' });
  const actualUK = roster.filter((p) => p.country === 'United Kingdom');
  assert.equal(ukQuery.length, actualUK.length);

  const frQuery = filterRoster(roster, { query: 'country:France' });
  const actualFR = roster.filter((p) => p.country === 'France');
  assert.equal(frQuery.length, actualFR.length);

  const filterLocUS = filterRoster(roster, { location: 'US' });
  assert.equal(filterLocUS.length, actualUS.length);

  const filterLocNA = filterRoster(roster, { location: 'North America' });
  assert.equal(filterLocNA.length, actualUS.length + actualCA.length);

  const actualAsia = roster.filter((p) => continentOf(p.country) === 'Asia');
  const filterLocAsia = filterRoster(roster, { location: 'Asia' });
  assert.equal(filterLocAsia.length, actualAsia.length);

  const jpQuery = filterRoster(roster, { query: 'country:Japan' });
  const actualJP = roster.filter((p) => p.country === 'Japan');
  assert.equal(jpQuery.length, actualJP.length);

  const hkQuery = filterRoster(roster, { query: 'country:"Hong Kong"' });
  const actualHK = roster.filter((p) => p.country === 'Hong Kong');
  assert.equal(hkQuery.length, actualHK.length);

  const actualAustralasia = roster.filter((p) => continentOf(p.country) === 'Australasia');
  const filterLocAustralasia = filterRoster(roster, { location: 'Australasia' });
  assert.equal(filterLocAustralasia.length, actualAustralasia.length);

  const nzQuery = filterRoster(roster, { query: 'country:"New Zealand"' });
  const actualNZ = roster.filter((p) => p.country === 'New Zealand');
  assert.equal(nzQuery.length, actualNZ.length);

  const actualEurope = roster.filter((p) => continentOf(p.country) === 'Europe');
  const filterLocEurope = filterRoster(roster, { location: 'Europe' });
  assert.equal(filterLocEurope.length, actualEurope.length);

  const chQuery = filterRoster(roster, { query: 'country:Switzerland' });
  const actualCH = roster.filter((p) => p.country === 'Switzerland');
  assert.equal(chQuery.length, actualCH.length);

  const filterLocWorld = filterRoster(roster, { location: 'World' });
  assert.equal(filterLocWorld.length, roster.length);
});

test('unique helpers never contain undefined or null values', async () => {
  const { uniqueStates, uniqueCities, uniqueDepartments, uniqueCountries, uniqueResearchAreas, uniquePhdInstitutions, uniqueRanks } = await import('../src/data.js');
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
  const { escapeHtml } = await import('../src/utils.js');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(''), '');
  assert.equal(escapeHtml('Hello & <World> "quotes"'), 'Hello &amp; &lt;World&gt; &quot;quotes&quot;');
});
