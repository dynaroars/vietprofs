import { test } from 'node:test';
// UI rendering tests exercise pure rendering and filter behavior without a browser.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  FIELDS,
  TRACKS,
  LOCATIONS,
  COUNTRY_TO_CONTINENT,
  COUNTRY_FLAGS,
  countryFlag,
  canonicalRank,
  displayName,
  displayUniversity,
  vietnameseName,
  fieldOf,
  continentOf,
  locationMatches,
  buildFunFacts,
  buildUsFunFacts,
  buildGlobalFunFacts,
  filterRoster,
  sortRoster,
  buildDecadeCounts,
  uniqueStates,
  uniqueCities,
  uniqueDepartments,
  uniqueCountries,
  uniqueResearchAreas,
  uniquePhdInstitutions,
  uniqueRanks,
  STATE_ABBR,
} from '../src/data.ts';
import { escapeHtml, formatRosterDate, formatRosterShortDate } from '../src/utils.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const roster = JSON.parse(readFileSync(join(__dirname, '../public/data.json'), 'utf8'));

function formatLocation(p) {
  const parts = [];
  if (p.city) parts.push(p.city);
  if (p.state && p.state !== p.city) parts.push(p.state);
  if (p.country && p.country !== 'United States' && p.country !== 'US' && p.country !== 'USA' && p.country !== p.city) {
    parts.push(p.country);
  }
  return parts.join(', ');
}

test('all countries in roster map to recognized continents', () => {
  for (const p of roster) {
    const country = p.country || 'United States';
    const continent = continentOf(country);
    assert.ok(
      ['North America', 'South America', 'Asia', 'Australasia', 'Europe', 'Africa'].includes(continent),
      `Country "${country}" for "${p.name}" mapped to invalid continent "${continent}"`,
    );
  }
});

test('honors have escaped names and source links available to the roster renderer', () => {
  const honored = roster.find((person) => person.honors?.length);
  assert.ok(honored, 'fixture roster should contain an honored professor');
  for (const honor of honored.honors) {
    const html = `<a class="honor-link" href="${escapeHtml(honor.source)}">${escapeHtml(honor.name)}</a>`;
    assert.match(html, /class="honor-link"/);
    assert.match(html, new RegExp(escapeHtml(honor.name)));
    assert.match(html, new RegExp(escapeHtml(honor.source)));
  }
});

test('roster update timestamps have compact, stable display dates', () => {
  assert.equal(formatRosterDate('2026-08-26T23:30:00.000Z'), 'Aug 26, 2026');
  assert.equal(formatRosterShortDate('2026-08-26T23:30:00.000Z'), '8/26/26');
  assert.equal(formatRosterDate('not-a-date'), '');
  assert.equal(formatRosterShortDate('not-a-date'), '');
});

test('formatLocation never produces undefined, null, consecutive commas, or duplicate city/country', () => {
  for (const p of roster) {
    const loc = formatLocation(p);
    assert.ok(typeof loc === 'string' && loc.length > 0, `Empty location for ${p.name}`);
    assert.ok(!loc.includes('undefined'), `Location contains undefined for ${p.name}: "${loc}"`);
    assert.ok(!loc.includes('null'), `Location contains null for ${p.name}: "${loc}"`);
    assert.ok(!loc.includes(', ,'), `Location contains double comma for ${p.name}: "${loc}"`);
    assert.ok(!loc.startsWith(', '), `Location starts with comma for ${p.name}: "${loc}"`);
    assert.ok(!loc.endsWith(', '), `Location ends with comma for ${p.name}: "${loc}"`);

    // Check no duplicate tokens like "Singapore, Singapore" or "Hong Kong, Hong Kong"
    const parts = loc.split(', ').map((s) => s.trim());
    const uniqueParts = new Set(parts);
    assert.equal(uniqueParts.size, parts.length, `Location contains duplicate parts for ${p.name}: "${loc}"`);
  }
});

test('buildFunFacts produces valid strings across every continent and empty rosters without crashing', () => {
  for (const loc of [...LOCATIONS, 'all', 'unknown']) {
    const subset = roster.filter((p) => locationMatches(p, loc));
    const facts = buildFunFacts(subset);
    assert.ok(Array.isArray(facts));
    assert.ok(facts.length > 0);
    for (const f of facts) {
      assert.equal(typeof f, 'string');
      assert.ok(f.length > 0);
      assert.ok(!f.includes('undefined'), `Fact contains undefined for location "${loc}": "${f}"`);
      assert.ok(!f.includes('null'), `Fact contains null for location "${loc}": "${f}"`);
      assert.ok(!f.includes('NaN'), `Fact contains NaN for location "${loc}": "${f}"`);
      assert.ok(!f.includes('Infinity'), `Fact contains Infinity for location "${loc}": "${f}"`);
      assert.ok(!f.includes('[object Object]'), `Fact contains [object Object] for location "${loc}": "${f}"`);
    }
  }

  // Also test strictly empty roster []
  const emptyFacts = buildFunFacts([]);
  assert.ok(Array.isArray(emptyFacts) && emptyFacts.length > 0);
  assert.ok(!emptyFacts[0].includes('NaN'));

  const usFacts = buildUsFunFacts(roster);
  assert.ok(Array.isArray(usFacts) && usFacts.length > 3);
  assert.ok(usFacts.some((f) => f.includes('U.S. entries across')));
  assert.ok(usFacts.some((f) => f.includes('distinct departments')));

  const globalFacts = buildGlobalFunFacts(roster);
  assert.ok(Array.isArray(globalFacts) && globalFacts.length > 3);
  assert.ok(globalFacts.some((f) => f.includes('international entries')));
  assert.ok(globalFacts.some((f) => f.includes('international city clusters')));
});

test('suggestionValues array contains no undefined/null and all elements safely escape', () => {
  const suggestionValues = [
    ...new Set([
      'honors',
      'awards',
      ...roster.map((p) => displayName(p.name)).filter(Boolean),
      ...roster.map((p) => p.university).filter(Boolean),
      ...uniqueDepartments(roster),
      ...uniqueRanks(roster),
      ...uniqueCities(roster),
      ...uniqueStates(roster),
      ...uniqueCountries(roster),
      ...uniqueResearchAreas(roster),
      ...uniquePhdInstitutions(roster),
    ]),
  ].sort();

  assert.ok(suggestionValues.length > 100);
  for (const v of suggestionValues) {
    assert.ok(typeof v === 'string', `Non-string suggestion value found: ${v}`);
    assert.ok(v.trim().length > 0, 'Empty suggestion string found');
    const escaped = escapeHtml(v);
    assert.ok(typeof escaped === 'string');
    assert.ok(!escaped.includes('undefined'));
    assert.ok(!escaped.includes('null'));
  }
});

test('full HTML roster rendering produces clean HTML with no undefined/null/NaN for every filter combination', () => {
  function renderEntry(p) {
    const visibleName = displayName(p.name);
    const nativeName = vietnameseName(p);
    const personField = fieldOf(p.department, p.university);
    const fieldTag = `<span class="tag tag-field">${escapeHtml(personField)}</span>`;
    const trackTag = `<span class="tag tag-track">${escapeHtml(p.track)}</span>`;
    const topicTags = p.researchAreas
      .map((a) => `<span class="tag tag-topic">${escapeHtml(a)}</span>`)
      .join('');
    const tags = fieldTag + trackTag + topicTags;
    const updatedDate = formatRosterShortDate(p.lastUpdatedAt);
    const educationDetails = [
      (p.postdocYear || p.postdocInstitution) && `Postdoc: ${[displayUniversity(p.postdocInstitution), p.postdocYear].filter(Boolean).join(', ')}`,
      (p.phdYear || p.phdInstitution) && `PhD: ${[displayUniversity(p.phdInstitution), p.phdYear].filter(Boolean).join(', ')}`,
      (p.msYear || p.msInstitution) && `MS: ${[displayUniversity(p.msInstitution), p.msYear].filter(Boolean).join(', ')}`,
      (p.undergradYear || p.undergradInstitution) && `Undergrad: ${[displayUniversity(p.undergradInstitution), p.undergradYear].filter(Boolean).join(', ')}`,
      (p.mdYear || p.mdInstitution) && `MD: ${[displayUniversity(p.mdInstitution), p.mdYear].filter(Boolean).join(', ')}`,
      ...(p.otherDegrees ?? []).map((degree) => `${degree.degree}: ${[displayUniversity(degree.institution), degree.year].filter(Boolean).join(', ')}`),
    ].filter(Boolean);
    const rankInfo = [
      canonicalRank(p) && escapeHtml(canonicalRank(p)),
      p.phdYear && `PhD ${escapeHtml(String(p.phdYear))}${p.phdInstitution ? `, ${escapeHtml(p.phdInstitution)}` : ''}`,
      !p.phdYear && p.phdInstitution && `PhD, ${escapeHtml(p.phdInstitution)}`,
    ].filter(Boolean).join(' · ');

    return `
      <div class="entry">
        <div class="entry-name-row">
          <a class="entry-name" href="${escapeHtml(p.websiteUrl ?? p.profileUrl)}">${escapeHtml(visibleName)}</a>
          <span class="entry-vietnamese-name">(${escapeHtml(nativeName)})</span>
        </div>
        <div class="entry-meta">${escapeHtml(canonicalRank(p) || '')} · ${escapeHtml(p.department)} · ${escapeHtml(displayUniversity(p.university))} · ${escapeHtml(formatLocation(p))}</div>
        ${educationDetails.length ? `<div class="entry-details">${educationDetails.map((value) => escapeHtml(value)).join('; ')}</div>` : ''}
        <time class="entry-updated" datetime="${escapeHtml(p.lastUpdatedAt)}">Updated ${escapeHtml(updatedDate)}</time>
        <div class="tags">${tags}</div>
      </div>
    `;
  }

  // Render every person individually
  for (const p of roster) {
    const html = renderEntry(p);
    assert.ok(!html.includes('undefined'), `Rendered HTML contains undefined for ${p.name}`);
    assert.ok(!html.includes('null'), `Rendered HTML contains null for ${p.name}`);
    assert.ok(!html.includes('NaN'), `Rendered HTML contains NaN for ${p.name}`);
    assert.ok(!html.includes('[object Object]'), `Rendered HTML contains [object Object] for ${p.name}`);
  }

  // Test across every combination of location, field, and track
  for (const loc of ['US', 'World', 'Asia', 'Europe']) {
    for (const field of ['all', 'Computer & Information Sciences', 'Engineering', 'Mathematics']) {
      for (const track of ['all', 'Tenure-line', 'Teaching', 'Research', 'Clinical', 'Emeritus']) {
        const filtered = filterRoster(roster, { location: loc, field, track });
        const sorted = sortRoster(filtered);
        const fullHtml = sorted.map(renderEntry).join('');
        assert.ok(!fullHtml.includes('undefined'));
        assert.ok(!fullHtml.includes('null'));
        assert.ok(!fullHtml.includes('NaN'));
      }
    }
  }
});

test('multiple education credentials share one semicolon-separated row', () => {
  const person = roster.find((entry) => [
    entry.postdocInstitution || entry.postdocYear,
    entry.phdInstitution || entry.phdYear,
    entry.msInstitution || entry.msYear,
    entry.undergradInstitution || entry.undergradYear,
    entry.mdInstitution || entry.mdYear,
    entry.otherDegrees?.length,
  ].filter(Boolean).length > 1);
  assert.ok(person, 'expected a roster entry with multiple education credentials');
  const credentials = [
    (person.postdocInstitution || person.postdocYear) && 'Postdoc',
    (person.phdInstitution || person.phdYear) && 'PhD',
    (person.msInstitution || person.msYear) && 'MS',
    (person.undergradInstitution || person.undergradYear) && 'Undergrad',
    (person.mdInstitution || person.mdYear) && 'MD',
    ...(person.otherDegrees ?? []).map((degree) => degree.degree),
  ].filter(Boolean);
  const html = `<div class="entry-details">${credentials.map((credential) => escapeHtml(credential)).join('; ')}</div>`;
  assert.equal((html.match(/class="entry-details"/g) ?? []).length, 1);
  assert.equal((html.match(/; /g) ?? []).length, credentials.length - 1);
});

test('every roster entry has a safe Vietnamese display-name variant and the requested card rows', () => {
  for (const p of roster) {
    const nativeName = vietnameseName(p);
    assert.ok(nativeName.trim(), `Missing Vietnamese display name for ${p.name}`);
    assert.match(nativeName, /^[^<>]+$/);
    assert.notEqual(nativeName, 'undefined');
    assert.notEqual(nativeName, 'null');
  }
  const sample = roster.find((p) => p.name === 'ThanhVu H. Nguyen') ?? roster[0];
  const html = `<div class="entry-name-row"><a class="entry-name">${escapeHtml(displayName(sample.name))}</a><span class="entry-vietnamese-name">(${escapeHtml(vietnameseName(sample))})</span></div><div class="entry-meta">${escapeHtml(canonicalRank(sample) || '')} · ${escapeHtml(sample.department)} · ${escapeHtml(displayUniversity(sample.university))} · ${escapeHtml(formatLocation(sample))}</div>`;
  assert.match(html, /entry-name-row/);
  assert.match(html, /entry-meta/);
  assert.match(html, /entry-vietnamese-name/);
});

test('authoritative full Vietnamese name overrides preserve accent marks and Vietnamese order', () => {
  const thanhVu = roster.find((p) => p.name === 'ThanhVu H. Nguyen');
  assert.equal(vietnameseName(thanhVu), 'Nguyễn Huy Thanh Vũ');
  assert.equal(vietnameseName(roster.find((p) => p.name === 'Nghiem V. Nguyen')), 'Nguyễn V. Nghiêm');
  assert.equal(vietnameseName(roster.find((p) => p.name === 'Bao Chau Ngo')), 'Ngô Bảo Châu');
  assert.equal(vietnameseName(roster.find((p) => p.name === 'Cac Nguyen')), 'Nguyễn Cac');
  assert.equal(vietnameseName(roster.find((p) => p.name === 'Tien Zung Nguyen')), 'Nguyễn Tiến Zung');
  assert.equal(vietnameseName(roster.find((p) => p.name === 'Hung Minh Tan Nguyen')), 'Nguyễn Tân Minh Hung');
  assert.equal(vietnameseName(roster.find((p) => p.name === 'Ha Ta')), 'Tạ Hà');
  assert.equal(vietnameseName(roster.find((p) => p.name === 'Hai-Dang Nguyen')), 'Nguyễn Hải-Đăng');
  assert.equal(vietnameseName(roster.find((p) => p.name === 'Lien-Hang T. Nguyen')), 'Nguyễn T. Liên-Hằng');
  assert.equal(vietnameseName(roster.find((p) => p.name === 'Thanh Thai Nguyen')), 'Nguyễn Thái Thanh');
  assert.equal(vietnameseName(roster.find((p) => p.name === 'Son Thanh Dam')), 'Đàm Thanh Sơn');
  assert.equal(vietnameseName(roster.find((p) => p.name === 'Thai Luan Vu')), 'Vũ Thái Luân');
  assert.equal(vietnameseName(roster.find((p) => p.name === 'Hoang Long Nguyen')), 'Nguyễn Long Hoàng');
  const daoNguyen = roster.find((p) => p.name === 'Nguyen-Truc-Dao Nguyen');
  assert.equal(vietnameseName(daoNguyen), 'Nguyễn Nguyễn Trúc Đào');
  assert.equal(daoNguyen.university, 'San Diego State University');
  assert.equal(daoNguyen.state, 'California');
});

test('auto-select location logic widens to World when searching for international countries or faculty', async () => {
  function simulateLocationAutoSelect(initialLoc, query) {
    let loc = initialLoc;
    const q = query.trim();
    if (!q) return loc;

    const countryNames = uniqueCountries(roster);
    const isCountryQuery = countryNames.some((c) =>
      c.toLowerCase() === q.toLowerCase() ||
      (q.toLowerCase() === 'uk' && c === 'United Kingdom') ||
      (q.toLowerCase() === 'usa' && c === 'United States')
    );
    if (isCountryQuery) return 'World';

    const continentNames = ['asia', 'europe', 'australasia', 'north america', 'south america', 'africa', 'world'];
    if (continentNames.includes(q.toLowerCase())) return 'World';

    const exactUniversityMatch = roster.some((p) =>
      p.university?.toLowerCase() === q.toLowerCase() &&
      (p.country || 'United States') !== 'United States'
    );
    if (exactUniversityMatch) return 'World';

    const inCurrent = filterRoster(roster, { query: q, location: loc }).length;
    if (inCurrent === 0) {
      const inWorld = filterRoster(roster, { query: q, location: 'World' }).length;
      if (inWorld > 0) return 'World';
    }
    return loc;
  }

  assert.equal(simulateLocationAutoSelect('US', 'France'), 'World');
  assert.equal(simulateLocationAutoSelect('US', 'Australia'), 'World');
  assert.equal(simulateLocationAutoSelect('US', 'Japan'), 'World');
  assert.equal(simulateLocationAutoSelect('US', 'University of Melbourne'), 'World');
  assert.equal(simulateLocationAutoSelect('US', 'Xuan-Bach Le'), 'World');
  assert.equal(simulateLocationAutoSelect('US', 'Cambridge'), 'US'); // Harvard/MIT in Cambridge, MA matches US!
  assert.equal(simulateLocationAutoSelect('US', 'University of Cambridge'), 'World');
});

test('countryFlag maps every country in roster to a non-empty flag emoji', () => {
  const countries = uniqueCountries(roster);
  assert.ok(countries.length > 5);
  for (const c of countries) {
    const flag = countryFlag(c);
    assert.equal(typeof flag, 'string');
    assert.ok(flag.length > 0);
    assert.notEqual(flag, 'undefined');
    assert.notEqual(flag, 'null');
    assert.notEqual(flag, 'NaN');
    assert.notEqual(flag, '🌐', `Missing specific country flag for country "${c}"`);
  }
  assert.equal(countryFlag(null), '🇺🇸');
  assert.equal(countryFlag(undefined), '🇺🇸');
  assert.equal(countryFlag(''), '🇺🇸');
  assert.equal(countryFlag('Unknown Country'), '🌐');
});

test('static import integrity: all data.ts and utils.ts symbols used in main.ts and submit.ts are explicitly imported', () => {
  const mainCode = readFileSync(join(__dirname, '../src/main.ts'), 'utf8');
  const submitCode = readFileSync(join(__dirname, '../src/submit.ts'), 'utf8');
  const dataCode = readFileSync(join(__dirname, '../src/data.ts'), 'utf8');
  const utilsCode = readFileSync(join(__dirname, '../src/utils.ts'), 'utf8');

  const dataExports = [...dataCode.matchAll(/export\s+(?:const|function)\s+([a-zA-Z0-9_]+)/g)].map((m) => m[1]);
  const utilsExports = [...utilsCode.matchAll(/export\s+(?:const|function)\s+([a-zA-Z0-9_]+)/g)].map((m) => m[1]);

  const checkImports = (code, file, sourceCode, sourceExports, sourceName) => {
    const importRegex = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*['\"]\\./${sourceName}['\"]`);
    const match = code.match(importRegex);
    const imported = match ? match[1].split(',').map((s) => s.trim()).filter(Boolean) : [];
    for (const exp of sourceExports) {
      const isUsed = new RegExp(`\\b${exp}\\b`).test(code);
      if (isUsed) {
        assert.ok(
          imported.includes(exp),
          `Symbol "${exp}" from ${sourceName} is used in ${file} but is NOT imported!`,
        );
      }
    }
  };

  checkImports(mainCode, 'main.ts', dataCode, dataExports, 'data.ts');
  checkImports(mainCode, 'main.ts', utilsCode, utilsExports, 'utils.ts');
  checkImports(submitCode, 'submit.ts', dataCode, dataExports, 'data.ts');
  checkImports(submitCode, 'submit.ts', utilsCode, utilsExports, 'utils.ts');
});

test('search query execution: typing diverse terms across all fields returns valid results without errors', () => {
  const sampleQueries = [
    'Nguyen',
    'Tran',
    'Le',
    'Harvard',
    'Stanford',
    'Oxford',
    'Melbourne',
    'Toronto',
    'Computer Science',
    'Economics',
    'Mathematics',
    'Biochemistry',
    'Artificial Intelligence',
    'Machine Learning',
    'Robotics',
    'Cancer',
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Emeritus',
    'California',
    'Texas',
    'Victoria',
    'Ontario',
    'Australia',
    'Canada',
    'France',
    'Germany',
    'Singapore',
    'United Kingdom',
    'Oxford',
    'MIT',
    'Australia',
    'Europe',
  ];

  for (const q of sampleQueries) {
    const results = filterRoster(roster, { query: q, location: 'World' });
    assert.ok(Array.isArray(results), `Query "${q}" did not return an array`);
    assert.ok(results.length > 0, `Expected at least one result for benchmark query "${q}"`);
    for (const p of results) {
      assert.ok(p.name, `Result missing name for query "${q}"`);
      assert.ok(p.university, `Result missing university for query "${q}"`);
    }
  }
});
