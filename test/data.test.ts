import { test } from 'node:test';
// Data behavior is tested against the canonical JSON roster.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FIELDS, LOCATIONS, HEALTH_SUBFIELDS, canonicalRank, displayName, displayUniversity, fieldOf, healthSubfieldOf, continentOf, locationMatches, buildFunFacts, buildAwardsFunFacts, buildInternationalObservations, buildLocationObservations, filterRoster, looksSurnameFirst, buildFieldCounts, buildTopCountries, buildTrackCounts, buildTopUndergradInstitutions, buildPhdToFacultyPairings, type Roster, type RosterEntry } from '../src/data.ts';
import { chooseWork, validateEnrichment } from '../src/enrichment.ts';
import { connectionsFor, relationshipId, validateRelationshipDatabase, type RelationshipDatabase } from '../src/relationships.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const roster: Roster = JSON.parse(readFileSync(join(__dirname, '../public/data.json'), 'utf8'));
const relationships: RelationshipDatabase = JSON.parse(readFileSync(join(__dirname, '../public/relationships.json'), 'utf8'));

test('public relationship database is valid and connects roster IDs only', () => {
  assert.deepEqual(validateRelationshipDatabase(relationships, roster), []);
  assert.ok(relationships.relationships.length > 0);
});

test('relationship database validates normalized roster-internal edges', () => {
  const sourceId = roster[0].id;
  const targetId = roster[1].id;
  const database: RelationshipDatabase = {
    version: 1,
    updatedAt: '2026-09-21T00:00:00.000Z',
    relationships: [{
      id: relationshipId('doctoral-advisor', sourceId, targetId),
      type: 'doctoral-advisor',
      sourceId,
      targetId,
      sources: ['https://example.edu/dissertation'],
      evidence: 'An official dissertation record names the advisor.',
      works: [],
      verifiedAt: '2026-09-21T00:00:00.000Z',
      direct: false,
      notes: '',
    }],
  };
  assert.deepEqual(validateRelationshipDatabase(database, roster), []);
  assert.equal(connectionsFor(sourceId, database)[0].label, 'Doctoral advisee');
  assert.equal(connectionsFor(targetId, database)[0].label, 'Doctoral advisor');
  database.relationships[0].type = 'coauthor';
  assert.ok(validateRelationshipDatabase(database, roster).some((error) => /require at least 2 works/.test(error)));
});

test('grant-collaborator and patent-coinventor relationships validate like coauthor but need only one shared item', () => {
  const sourceId = roster[0].id;
  const targetId = roster[1].id;
  const work = { identifier: 'nsf:1234567', title: 'Collaborative Research: Example', date: '2024', url: 'https://www.nsf.gov/awardsearch/showAward?AWD_ID=1234567' };
  const database: RelationshipDatabase = {
    version: 1,
    updatedAt: '2026-09-21T00:00:00.000Z',
    relationships: [{
      id: relationshipId('grant-collaborator', sourceId, targetId),
      type: 'grant-collaborator',
      sourceId,
      targetId,
      sources: ['https://www.nsf.gov/awardsearch/showAward?AWD_ID=1234567'],
      evidence: 'The official NSF award page lists both as PI/co-PI.',
      works: [work],
      verifiedAt: '2026-09-21T00:00:00.000Z',
      direct: false,
      notes: '',
    }],
  };
  assert.deepEqual(validateRelationshipDatabase(database, roster), []);
  assert.equal(connectionsFor(sourceId, database)[0].label, 'Grant collaborator · 1 shared award');

  database.relationships[0] = { ...database.relationships[0], works: [] };
  assert.ok(validateRelationshipDatabase(database, roster).some((error) => /require at least 1 work/.test(error)));

  const patentWork = { identifier: 'us:11223344', title: 'Example patent', date: '2023', url: 'https://patents.google.com/patent/US11223344' };
  database.relationships[0] = {
    ...database.relationships[0],
    id: relationshipId('patent-coinventor', sourceId, targetId),
    type: 'patent-coinventor',
    sources: ['https://patents.google.com/patent/US11223344'],
    works: [patentWork],
  };
  assert.deepEqual(validateRelationshipDatabase(database, roster), []);
  assert.equal(connectionsFor(sourceId, database)[0].label, 'Patent co-inventor · 1 shared patent');
});

test('enrichment validation rejects unsafe links, corrupted scrapes, and duplicate work', () => {
  assert.ok(validateEnrichment({ researchOverview: { text: 'Studies networks.', sources: ['javascript:alert(1)'], verifiedAt: '2026-01-01T00:00:00.000Z' } }).some((error) => /unsafe/.test(error)));
  assert.ok(validateEnrichment({ researchOverview: { text: 'Directs [Lab](javascript:alert(1)).', sources: ['https://example.org'], verifiedAt: '2026-01-01T00:00:00.000Z' } }).some((error) => /unsafe/.test(error)));
  assert.ok(validateEnrichment({ researchOverview: { text: 'Research on AI &amp; machine learning.', sources: ['https://example.org'], verifiedAt: '2026-01-01T00:00:00.000Z' } }).some((error) => /HTML entity/.test(error)));
  assert.ok(validateEnrichment({ researchOverview: { text: 'Research in bio&#039;engineering.', sources: ['https://example.org'], verifiedAt: '2026-01-01T00:00:00.000Z' } }).some((error) => /HTML entity/.test(error)));
  assert.ok(validateEnrichment({ researchOverview: { text: 'Toggle navigation Skip to main content. Studies AI.', sources: ['https://example.org'], verifiedAt: '2026-01-01T00:00:00.000Z' } }).some((error) => /boilerplate/.test(error)));
  assert.ok(validateEnrichment({ researchOverview: { text: 'Overview with {{placeholder}}.', sources: ['https://example.org'], verifiedAt: '2026-01-01T00:00:00.000Z' } }).some((error) => /placeholder/.test(error)));
  assert.ok(validateEnrichment({ researchOverview: { text: 'Directs lab at https://example.org/lab without markdown link.', sources: ['https://example.org'], verifiedAt: '2026-01-01T00:00:00.000Z' } }).some((error) => /unformatted URL/.test(error)));
  assert.equal(validateEnrichment({ researchOverview: { text: 'Directs the [Lab](https://roars.dev). Built [Tool](https://vietprofs.roars.dev).', sources: ['https://example.org'], verifiedAt: '2026-01-01T00:00:00.000Z' } }).length, 0);
  const work = { title: 'A', type: 'paper', url: 'https://example.org/a', selectionSource: 'https://example.org/list', selectionMode: 'recent' as const, verifiedAt: '2026-01-01T00:00:00.000Z', year: 2025 };
  assert.ok(validateEnrichment({ recentWork: [work, work] }).some((error) => /duplicates/.test(error)));
});

test('recent work selection deduplicates and sorts by documented date', () => {
  const base = (title: string, date: string) => ({ title, date, type: 'paper', url: `https://example.org/${title}`, selectionSource: 'https://example.org/list', selectionMode: 'recent' as const, verifiedAt: '2026-01-01T00:00:00.000Z' });
  assert.deepEqual(chooseWork([base('old', '2020-01-01'), base('new', '2025-01-01'), base('new', '2024-01-01')], 'recent').map((item) => item.title), ['new', 'old']);
});

test('reviewed portraits use local WebP files with source provenance', () => {
  const portraits = roster.filter((person): person is RosterEntry & { portrait: string; portraitSource: string } =>
    Boolean(person.portrait && person.portraitSource));
  assert.ok(portraits.length > 400, 'expected broad portrait coverage across the roster');
  for (const person of portraits) {
    assert.match(person.portrait, /^portraits\/[a-z0-9][a-z0-9.-]*\.webp$/);
    assert.match(person.portraitSource, /^https?:\/\//);
    assert.ok(readFileSync(join(__dirname, '../public', person.portrait)).length > 0);
  }
});

test('portrait audit fixture is reproducible and covers the required risk groups', () => {
  const fixture = JSON.parse(readFileSync(join(__dirname, '../maintenance/portrait-audit-sample.json'), 'utf8')) as {
    version: number;
    knownGood: string[];
    missing: string[];
    knownBad: string[];
    blocked: string[];
    commonNames: string[];
  };
  const ids = new Set(roster.map((person) => person.id));
  assert.equal(fixture.version, 1);
  assert.ok(fixture.knownGood.length >= 10);
  assert.ok(fixture.missing.length >= 10);
  assert.ok(fixture.knownBad.length >= 10);
  assert.ok(fixture.blocked.length > 0);
  assert.ok(fixture.commonNames.length > 0);
  for (const id of Object.values(fixture).flatMap((value) => Array.isArray(value) ? value : [])) assert.ok(ids.has(id), `fixture references unknown ID ${id}`);
  for (const id of fixture.missing) assert.equal(roster.find((person) => person.id === id)?.portrait, undefined, `${id} is not currently missing a portrait`);
});

test('portrait provenance is ID-keyed and records reproducible identity evidence', () => {
  const ledger = JSON.parse(readFileSync(join(__dirname, '../maintenance/portrait-provenance.json'), 'utf8')) as {
    version: number;
    entries: Record<string, { outcome: string; retrievedAt: string; identitySignals: string[]; pageUrl?: string; imageUrl?: string; sourceType?: string; confidence?: string }>;
  };
  const ids = new Set(roster.map((person) => person.id));
  assert.equal(ledger.version, 1);
  for (const [id, entry] of Object.entries(ledger.entries)) {
    assert.ok(ids.has(id), `provenance references unknown ID ${id}`);
    assert.ok(['found', 'not_found', 'protected', 'needs_review'].includes(entry.outcome));
    assert.ok(!Number.isNaN(Date.parse(entry.retrievedAt)), `${id} has invalid retrieval date`);
    assert.ok(Array.isArray(entry.identitySignals));
    if (entry.outcome === 'found' || entry.outcome === 'needs_review') {
      assert.match(entry.pageUrl ?? '', /^https?:\/\//);
      assert.match(entry.imageUrl ?? '', /^https?:\/\//);
      assert.ok(['official_faculty', 'personal_homepage', 'lab_site', 'university_news', 'authoritative_academic'].includes(entry.sourceType ?? ''));
      assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(entry.confidence ?? ''));
      assert.ok(entry.identitySignals.length >= 2);
    }
  }
});

test('roster is a non-empty array', () => {
  assert.ok(Array.isArray(roster));
  assert.ok(roster.length > 0);
});

test('generated stats-history.json is a non-decreasing-date time series ending at the current roster size', () => {
  const history: { date: string; count: number }[] = JSON.parse(readFileSync(join(__dirname, '../public/stats-history.json'), 'utf8'));
  assert.ok(history.length > 0);
  for (const point of history) {
    assert.match(point.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Number.isInteger(point.count) && point.count > 0);
  }
  for (let i = 1; i < history.length; i++) assert.ok(history[i].date > history[i - 1].date);
  assert.equal(history[history.length - 1].count, roster.length);
});

test('health subfields are the only derived field subdivisions', () => {
  for (const person of roster) {
    const subfield = healthSubfieldOf(person);
    if (subfield !== null) assert.ok(HEALTH_SUBFIELDS.includes(subfield));
  }
  assert.ok(roster.some((person) => healthSubfieldOf(person) === 'Clinical Medicine'));
});

test('maintenance-only verification timestamps are not exposed publicly', () => {
  for (const p of roster as unknown as Record<string, unknown>[]) {
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

test('Shizuoka Mathematical and Systems Engineering maps to Engineering', () => {
  assert.equal(
    fieldOf('Department of Mathematical and Systems Engineering', 'Shizuoka University'),
    'Engineering',
  );
  assert.equal(fieldOf('Department of Mathematical and Systems Engineering'), 'Mathematics');
});

test('JAIST Knowledge Science and Osaka SANKEN reasoning lab map to computing', () => {
  assert.equal(
    fieldOf('School of Knowledge Science', 'Japan Advanced Institute of Science and Technology'),
    'Computer & Information Sciences',
  );
  assert.equal(fieldOf('School of Knowledge Science'), 'Others');
  assert.equal(
    fieldOf('SANKEN, Department of Reasoning for Intelligence', 'Osaka University'),
    'Computer & Information Sciences',
  );
});

test('Information Studies defaults to computing but UCLA GSEIS stays Education', () => {
  assert.equal(fieldOf('Information Studies', 'University of California, Los Angeles'), 'Education');
  // Same bare department string elsewhere is genuinely ambiguous without knowing the school, so
  // it falls into the catch-all rather than being guessed.
  assert.equal(fieldOf('Information Studies'), 'Computer & Information Sciences');
  assert.equal(fieldOf('Information Science and Technology'), 'Computer & Information Sciences');
  assert.equal(fieldOf('IST'), 'Computer & Information Sciences');
});

test('university libraries map to Computer & Information Sciences', () => {
  assert.equal(fieldOf('University Libraries', 'Stony Brook University'), 'Computer & Information Sciences');
});

test('FIELDS is alphabetically ordered with the Others catch-all last', () => {
  const withoutOthers = FIELDS.slice(0, -1);
  assert.deepEqual(withoutOthers, [...withoutOthers].sort());
  assert.equal(FIELDS.at(-1), 'Others');
});

test('fieldOf tolerates a missing department instead of throwing', () => {
  assert.equal(fieldOf(undefined, 'Some University'), 'Others');
  assert.equal(fieldOf(), 'Others');
});

test('generic clinical-specialty department names classify as Health Sciences', () => {
  assert.equal(fieldOf('Anesthesiology'), 'Health Sciences');
  assert.equal(fieldOf('Orthopaedics'), 'Health Sciences');
  assert.equal(fieldOf('Division of Digestive Diseases'), 'Health Sciences');
  assert.equal(fieldOf('Gastroenterology and Hepatology'), 'Health Sciences');
  assert.equal(fieldOf('Diabetes, Endocrinology and Metabolism'), 'Health Sciences');
});

test('institution-specific overrides resolve department names that carry no field keyword', () => {
  assert.equal(fieldOf('Strategy', 'INSEAD'), 'Business & Economics');
  assert.equal(fieldOf('Strategy'), 'Others');
  assert.equal(
    fieldOf('Clinical Science', 'Kaiser Permanente Bernard J. Tyson School of Medicine'),
    'Health Sciences',
  );
  assert.equal(
    fieldOf('Clinical and Administrative Sciences', 'Xavier University of Louisiana'),
    'Health Sciences',
  );
});

test('the roster has no unmapped Others entries in the current snapshot', () => {
  const unmapped = roster.filter((p) => fieldOf(p.department, p.university) === 'Others');
  assert.deepEqual(
    unmapped.map((p) => `${p.name} (${p.department} | ${p.university})`),
    [],
  );
});

test('rank labels use the simplified public vocabulary', () => {
  assert.equal(canonicalRank({ track: 'Tenure-line', rank: 'Distinguished Professor' }), 'Professor');
  assert.equal(canonicalRank({ track: 'Tenure-line', rank: 'Associate Professor of Finance' }), 'Associate Professor');
  assert.equal(canonicalRank({ track: 'Tenure-line', rank: 'Assistant Professor of Practice' }), 'Assistant Professor');
  assert.equal(canonicalRank({ track: 'Tenure-line', rank: 'Lecturer' }), 'Assistant Professor');
  assert.equal(canonicalRank({ track: 'Tenure-line', rank: 'Senior Lecturer' }), 'Associate Professor');
  assert.equal(canonicalRank({ track: 'Tenure-line', rank: 'Reader' }), 'Associate Professor');
  assert.equal(canonicalRank({ track: 'Teaching', rank: 'Senior Lecturer II' }), 'Teaching');
  assert.equal(canonicalRank({ track: 'Research', rank: 'Assistant Research Professor' }), 'Research Scientist');
  assert.equal(canonicalRank({ track: 'Clinical', rank: 'Clinical Professor' }), 'Clinical Professor');
  assert.equal(canonicalRank({ track: 'Clinical', rank: 'Assistant Clinical Professor' }), 'Assistant Clinical Professor');
  assert.equal(canonicalRank({ track: 'Teaching', rank: 'Associate Professor of Teaching' }), 'Associate Teaching Professor');
  assert.equal(canonicalRank({ track: 'Teaching', rank: 'Professor of Practice' }), 'Teaching Professor');
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
  assert.ok(facts.some((f) => /largest international country groups/.test(f)));
});

test('field-balance observations name the fields computed from their input', () => {
  const sample = [
    ...Array.from({ length: 4 }, (_, index) => ({ id: `hist-${index}`, name: `Historian ${index}`, university: `U${index}`, department: 'History', country: 'France' })),
    ...Array.from({ length: 4 }, (_, index) => ({ id: `law-${index}`, name: `Lawyer ${index}`, university: `L${index}`, department: 'Law', country: 'France' })),
    ...Array.from({ length: 4 }, (_, index) => ({ id: `art-${index}`, name: `Artist ${index}`, university: `A${index}`, department: 'Music', country: 'France' })),
  ];
  // Equal counts are ordered alphabetically so the wording is stable across roster edits.
  const fact = buildInternationalObservations(sample).find((value) => value.includes('closely represented'));
  assert.ok(fact, 'expected a "closely represented" observation');
  assert.match(fact, /Arts & Design \(4\).*Humanities \(4\).*Law & Public Affairs \(4\)/);
});

test('location observations do not silently remove United States entries from a continent', () => {
  const sample = [
    { id: 'us-1', name: 'US Person', university: 'US University', department: 'History', country: 'United States' },
    { id: 'ca-1', name: 'Canada Person', university: 'Canada University', department: 'History', country: 'Canada' },
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

test('buildFieldCounts sums to the roster size and sorts descending', () => {
  const counts = buildFieldCounts(roster);
  assert.equal(counts.reduce((sum, [, c]) => sum + c, 0), roster.length);
  for (let i = 1; i < counts.length; i++) assert.ok(counts[i - 1][1] >= counts[i][1]);
  assert.ok(counts.every(([field]) => FIELDS.includes(field)));
});

test('buildTopCountries defaults a missing country to United States and respects the limit', () => {
  const withMissingCountry = [{ ...roster[0], country: undefined }, { ...roster[1], country: 'Elsewhere' }];
  const counts = buildTopCountries(withMissingCountry, 1);
  assert.equal(counts.length, 1);
  assert.ok(counts[0][0] === 'United States' || counts[0][0] === 'Elsewhere');
  const full = buildTopCountries(roster, 8);
  assert.ok(full.length <= 8);
  for (let i = 1; i < full.length; i++) assert.ok(full[i - 1][1] >= full[i][1]);
});

test('buildTrackCounts covers every track present and omits empty ones', () => {
  const counts = buildTrackCounts(roster);
  assert.equal(counts.reduce((sum, [, c]) => sum + c, 0), roster.length);
  assert.ok(counts.every(([, count]) => count > 0));
  const tracksSeen = new Set(roster.map((p) => p.track));
  assert.equal(counts.length, tracksSeen.size);
});

test('buildTopUndergradInstitutions and buildPhdToFacultyPairings aggregate properly', () => {
  const topUg = buildTopUndergradInstitutions(roster, 5);
  assert.ok(Array.isArray(topUg));
  assert.ok(topUg.length <= 5);
  for (let i = 1; i < topUg.length; i++) assert.ok(topUg[i - 1][1] >= topUg[i][1]);

  const pairings = buildPhdToFacultyPairings(roster, 5);
  assert.ok(Array.isArray(pairings));
  assert.ok(pairings.length <= 5);
  for (const [phd, country, count] of pairings) {
    assert.equal(typeof phd, 'string');
    assert.equal(typeof country, 'string');
    assert.ok(count > 0);
  }
});

test('search is diacritic-insensitive in both directions', () => {
  const plain = filterRoster(roster, { query: 'Nguyen', field: 'all' });
  const accented = filterRoster(roster, { query: 'Nguyễn', field: 'all' });
  assert.equal(plain.length, accented.length);
  assert.ok(plain.length > 0);
});

test('state filter matches the exact state, by full name or postal abbreviation', () => {
  const people = (entries: Partial<RosterEntry>[]) => entries.map((entry, index) => ({ id: `vp-${index}`, name: `P ${index}`, university: 'U', ...entry }) as RosterEntry);
  const sample = people([{ state: 'Virginia' }, { state: 'West Virginia' }, { state: 'Nevada' }, { state: 'Pennsylvania' }, { state: 'VA' }, { state: 'WA', country: 'Australia' }]);
  assert.deepEqual(filterRoster(sample, { state: 'Virginia' }).map((p) => p.id), ['vp-0', 'vp-4']);
  assert.deepEqual(filterRoster(sample, { state: 'VA' }).map((p) => p.id), ['vp-0', 'vp-4']);
  assert.deepEqual(filterRoster(sample, { state: 'Washington' }).map((p) => p.id), []);
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
  assert.ok(professors.every((person) => /professor/i.test(person.rank || '') || /professor/i.test(canonicalRank(person) ?? '')));

  const engineering = filterRoster(roster, { query: 'Engineering', searchScope: 'field', location: 'World' });
  assert.ok(engineering.length > 0);
  assert.ok(engineering.every((person) => fieldOf(person.department, person.university) === 'Engineering'));

  const research = filterRoster(roster, { query: 'Machine Learning', searchScope: 'research', location: 'World' });
  assert.ok(research.length > 0);
  assert.ok(research.every((person) => person.researchAreas?.some((area) => /machine learning/i.test(area))));

  const honors = filterRoster(roster, { query: 'NSF CAREER', searchScope: 'honors', location: 'World' });
  assert.ok(honors.length > 0);
  assert.ok(honors.every((person) => person.honors?.some((honor) => /NSF CAREER/i.test(honor.name))));

  const undergrads = filterRoster(roster, { query: 'Boise State University', searchScope: 'undergrad', location: 'World' });
  assert.ok(undergrads.length > 0);
  assert.ok(undergrads.every((person) => /Boise State University/i.test(person.undergradInstitution ?? '')));
});

test('searching an honor name lists professors who hold that honor', () => {
  const career = filterRoster(roster, { query: 'NSF CAREER', field: 'all' });
  assert.ok(career.length > 0);
  assert.ok(career.every((p) => p.honors?.some((honor) => honor.name === 'NSF CAREER Award')));

  const fellow = filterRoster(roster, { query: 'IEEE Fellow', field: 'all' });
  assert.ok(fellow.length > 0);
  assert.ok(fellow.every((p) => p.honors?.some((honor) => honor.name === 'IEEE Fellow')));
});

test('connection keyword search finds connected roster members by relationship type', () => {
  const connected = filterRoster(roster, { query: '', searchScope: 'connection', relationships });
  assert.deepEqual(
    new Set(connected.map((person) => person.id)),
    new Set([
      'vp-0004', 'vp-0015', 'vp-0018', 'vp-0026', 'vp-0029', 'vp-0032', 'vp-0036', 'vp-0040', 'vp-0044',
      'vp-0052', 'vp-0056', 'vp-0062', 'vp-0063', 'vp-0100', 'vp-0108', 'vp-0123', 'vp-0135', 'vp-0183', 'vp-0184',
      'vp-0193', 'vp-0209', 'vp-0267', 'vp-0275', 'vp-0294', 'vp-0302', 'vp-0500', 'vp-0539', 'vp-0540', 'vp-0585', 'vp-0711', 'vp-0808', 'vp-1031', 'vp-1038', 'vp-1006', 'vp-1007', 'vp-1010',
      'vp-0863', 'vp-0707', 'vp-1174', 'vp-1178', 'vp-1192', 'vp-1200', 'vp-1205', 'vp-1207', 'vp-1221', 'vp-1235', 'vp-1250', 'vp-1262', 'vp-1264', 'vp-1272', 'vp-1285', 'vp-1315', 'vp-1401', 'vp-1422',
      'vp-1423', 'vp-1444', 'vp-1465', 'vp-1501', 'vp-1532', 'vp-1538', 'vp-1544', 'vp-1568', 'vp-1579', 'vp-1602', 'vp-0534', 'vp-0594', 'vp-0748', 'vp-0752', 'vp-0537', 'vp-0745', 'vp-0704', 'vp-0705', 'vp-0504', 'vp-0682', 'vp-0672', 'vp-0676', 'vp-0686', 'vp-0687', 'vp-0591',
      'vp-1619', 'vp-1647', 'vp-1674', 'vp-0933', 'vp-0932', 'vp-0926', 'vp-0923', 'vp-0922', 'vp-0921', 'vp-0919', 'vp-0917', 'vp-0220', 'vp-1080', 'vp-0987', 'vp-0988', 'vp-0955', 'vp-0968', 'vp-0943', 'vp-0944', 'vp-0840', 'vp-0841', 'vp-0845', 'vp-0572', 'vp-0573',
    ]),
  );

  const coauthors = filterRoster(roster, { query: 'co-author', searchScope: 'connection', relationships });
  assert.deepEqual(
    new Set(coauthors.map((person) => person.id)),
    new Set([
      'vp-0015', 'vp-0018', 'vp-0032', 'vp-0056', 'vp-0063', 'vp-0108', 'vp-0123', 'vp-0135', 'vp-0209', 'vp-0275', 'vp-0707', 'vp-1178', 'vp-0220', 'vp-1080', 'vp-1031', 'vp-1038', 'vp-1006', 'vp-1007', 'vp-1010', 'vp-0534', 'vp-0594', 'vp-0748', 'vp-0752', 'vp-0537', 'vp-0745', 'vp-0504', 'vp-0682', 'vp-0672', 'vp-0676', 'vp-0591',
      'vp-0294', 'vp-0302', 'vp-0500', 'vp-0540', 'vp-0585', 'vp-0711', 'vp-0808', 'vp-0863', 'vp-1174', 'vp-1200', 'vp-1205', 'vp-1207', 'vp-1221', 'vp-1235', 'vp-1250', 'vp-1262',
      'vp-1264', 'vp-1272', 'vp-1285', 'vp-1315', 'vp-1401', 'vp-1422', 'vp-1423', 'vp-1444', 'vp-1465', 'vp-1501',
      'vp-1532', 'vp-1538', 'vp-1544', 'vp-1568', 'vp-1579', 'vp-1602', 'vp-1619', 'vp-1647', 'vp-1674', 'vp-0933', 'vp-0932', 'vp-0926', 'vp-0923', 'vp-0922', 'vp-0921', 'vp-0919', 'vp-0917', 'vp-0987', 'vp-0988', 'vp-0955', 'vp-0968', 'vp-0943', 'vp-0944', 'vp-0840', 'vp-0841', 'vp-0845', 'vp-0572', 'vp-0573',
    ]),
  );

  const mentors = filterRoster(roster, { query: 'mentor/advise', searchScope: 'connection', relationships });
  assert.deepEqual(
    new Set(mentors.map((person) => person.id)),
    new Set([
      'vp-0004', 'vp-0026', 'vp-0029', 'vp-0032', 'vp-0036', 'vp-0040', 'vp-0044', 'vp-0052', 'vp-0062',
      'vp-0100', 'vp-0108', 'vp-0123', 'vp-0183', 'vp-0184', 'vp-0193', 'vp-0209', 'vp-0267', 'vp-0275',
      'vp-0294', 'vp-0302', 'vp-0500', 'vp-0585', 'vp-0711', 'vp-0707', 'vp-1178', 'vp-1221', 'vp-1465', 'vp-1501', 'vp-1674', 'vp-0537', 'vp-0745', 'vp-0704', 'vp-0705',
    ]),
  );
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
    ].filter((value): value is string => Boolean(value)).map((value) => value.toLowerCase());
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

test('institution type is searchable and independently filterable', () => {
  const instituteEntry = {
    ...roster[0],
    id: 'vp-99999',
    name: 'Synthetic Institute Researcher',
    university: 'Example Research Institute',
    institutionType: 'Independent nonprofit research institute',
    track: 'Research',
  };
  const sample = [roster[0], instituteEntry];
  assert.deepEqual(filterRoster(sample, { institutionType: 'Independent nonprofit research institute' }), [instituteEntry]);
  assert.deepEqual(filterRoster(sample, { query: 'nonprofit research institute', searchScope: 'institution' }), [instituteEntry]);
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
  const { uniqueStates, uniqueCities, uniqueDepartments, uniqueCountries, uniqueResearchAreas, uniquePhdInstitutions, uniqueUndergradInstitutions, uniqueRanks } = await import('../src/data.ts');
  const states = uniqueStates(roster);
  const cities = uniqueCities(roster);
  const depts = uniqueDepartments(roster);
  const countries = uniqueCountries(roster);
  const areas = uniqueResearchAreas(roster);
  const phds = uniquePhdInstitutions(roster);
  const undergrads = uniqueUndergradInstitutions(roster);
  const ranks = uniqueRanks(roster);

  const allNonEmptyStrings = (values: string[]) => values.every((value) => typeof value === 'string' && value.length > 0);
  for (const [label, values] of Object.entries({ states, cities, depts, countries, areas, phds, undergrads, ranks })) {
    assert.ok(allNonEmptyStrings(values), `${label} contained a null, undefined, or empty entry`);
  }
});

test('looksSurnameFirst flags names stored in Vietnamese (surname-first) order', () => {
  // Bug this guards: several roster entries were once stored as "Tran Van Tho", "Dang Thuy Tram",
  // etc. instead of the roster's "First (Middle) Last" convention.
  assert.equal(looksSurnameFirst('Nguyen Van Test'), true);
  assert.equal(looksSurnameFirst('Tran Thi Hong'), true);
  assert.equal(looksSurnameFirst('Le Duc Anh'), true);
  // Already correct: given name first, recognized surname last.
  assert.equal(looksSurnameFirst('Thi Hong Tran'), false);
  assert.equal(looksSurnameFirst('ThanhVu H. Nguyen'), false);
  // A single token, or a name with a "- University" disambiguator, must not false-positive.
  assert.equal(looksSurnameFirst('Nguyen'), false);
  assert.equal(looksSurnameFirst('Thuan Nguyen - University of North Texas'), false);
  // Non-Vietnamese names are never flagged.
  assert.equal(looksSurnameFirst('John Smith'), false);
});

test('escapeHtml safely handles undefined, null, and special characters', async () => {
  const { escapeHtml } = await import('../src/utils.ts');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(''), '');
  assert.equal(escapeHtml('Hello & <World> "quotes"'), 'Hello &amp; &lt;World&gt; &quot;quotes&quot;');
});

test('roster data strictly satisfies roster.schema.json', async () => {
  const { readFileSync } = await import('node:fs');
  const schema = JSON.parse(readFileSync(new URL('../roster.schema.json', import.meta.url), 'utf8'));
  assert.equal(schema.type, 'array');
  assert.ok(schema.items.properties.id);
  assert.ok(schema.items.properties.name);
  assert.ok(schema.items.properties.university);

  for (const person of roster) {
    assert.match(person.id, /^vp-\d{4,}$/, `Invalid ID format for ${person.name}`);
    assert.ok(person.name && typeof person.name === 'string');
    assert.ok(person.university && typeof person.university === 'string');
    if (person.track) {
      assert.ok(schema.items.properties.track.enum.includes(person.track), `Unknown track ${person.track} for ${person.name}`);
    }
  }
});

test('landmark and marquee faculty maintain their verified major honors', () => {
  const expectedMarqueeHonors: Array<{ name: string; requiredHonors: string[] }> = [
    {
      name: 'Viet Thanh Nguyen',
      requiredHonors: ['Pulitzer Prize for Fiction', 'MacArthur Fellow'],
    },
    {
      name: 'Bao Chau Ngo',
      requiredHonors: ['Fields Medal', 'Clay Research Award'],
    },
    {
      name: 'Son Thanh Dam',
      requiredHonors: ['ICTP Dirac Medal', 'National Academy of Sciences Member'],
    },
    {
      name: 'Jane X. Luu',
      requiredHonors: ['Kavli Prize in Astrophysics', 'Shaw Prize in Astronomy'],
    },
    {
      name: 'Thuc-Quyen Nguyen',
      requiredHonors: ['National Academy of Engineering Member', 'Wilhelm Exner Medal'],
    },
    {
      name: 'Chi Van Dang',
      requiredHonors: ['National Academy of Medicine Member'],
    },
  ];

  for (const { name, requiredHonors } of expectedMarqueeHonors) {
    const person = roster.find((p) => p.name === name);
    assert.ok(person, `Expected landmark faculty member "${name}" in roster`);
    const honorNames = new Set((person.honors || []).map((h) => h.name));
    for (const req of requiredHonors) {
      assert.ok(
        honorNames.has(req),
        `Expected ${name} to have honor "${req}", but current honors are: [${Array.from(honorNames).join(', ')}]`,
      );
    }
  }
});
