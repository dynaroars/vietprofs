import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  FIELDS,
  TRACKS,
  LOCATIONS,
  COUNTRY_TO_CONTINENT,
  canonicalRank,
  displayName,
  fieldOf,
  continentOf,
  locationMatches,
  buildFunFacts,
  buildUsFunFacts,
  buildGlobalFunFacts,
  filterRoster,
  sortRoster,
  buildTopUniversities,
  buildTopPhdInstitutions,
  buildDecadeCounts,
  uniqueStates,
  uniqueCities,
  uniqueDepartments,
  uniqueCountries,
  uniqueResearchAreas,
  uniquePhdInstitutions,
  uniqueRanks,
  STATE_ABBR,
} from '../src/data.js';
import { escapeHtml } from '../src/utils.js';

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
  assert.ok(usFacts.some((f) => f.includes('U.S. universit')));
  assert.ok(usFacts.some((f) => f.includes('Vietnamese-American communities')));

  const globalFacts = buildGlobalFunFacts(roster);
  assert.ok(Array.isArray(globalFacts) && globalFacts.length > 3);
  assert.ok(globalFacts.some((f) => f.includes('international professor')));
  assert.ok(globalFacts.some((f) => f.includes('Continental distribution')));
});

test('suggestionValues array contains no undefined/null and all elements safely escape', () => {
  const suggestionValues = [
    ...new Set([
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
    const personField = fieldOf(p.department, p.university);
    const fieldTag = `<span class="tag tag-field">${escapeHtml(personField)}</span>`;
    const trackTag = `<span class="tag tag-track">${escapeHtml(p.track)}</span>`;
    const topicTags = p.researchAreas
      .map((a) => `<span class="tag tag-topic">${escapeHtml(a)}</span>`)
      .join('');
    const tags = fieldTag + trackTag + topicTags;
    const rankInfo = [
      canonicalRank(p) && escapeHtml(canonicalRank(p)),
      p.phdYear && `PhD ${escapeHtml(String(p.phdYear))}${p.phdInstitution ? `, ${escapeHtml(p.phdInstitution)}` : ''}`,
      !p.phdYear && p.phdInstitution && `PhD, ${escapeHtml(p.phdInstitution)}`,
    ].filter(Boolean).join(' · ');

    return `
      <div class="entry">
        <a class="entry-name" href="${escapeHtml(p.websiteUrl ?? p.profileUrl)}">${escapeHtml(visibleName)}</a>
        <span class="entry-meta">${escapeHtml(p.university)} · ${escapeHtml(p.department)} · ${escapeHtml(formatLocation(p))}</span>
        ${rankInfo ? `<div class="entry-details">${rankInfo}</div>` : ''}
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
      for (const track of ['all', 'Tenure-line', 'Teaching', 'Emeritus']) {
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

test('auto-select location logic widens to World when searching for international countries or faculty', async () => {
  const { parseSearchQuery } = await import('../src/data.js');

  function simulateLocationAutoSelect(initialLoc, query) {
    let loc = initialLoc;
    const q = query.trim();
    if (!q) return loc;

    const parsed = parseSearchQuery(q);
    if (['country', 'location'].includes(parsed.type)) {
      return 'World';
    }

    const countryNames = uniqueCountries(roster);
    const isCountryQuery = countryNames.some((c) =>
      c.toLowerCase() === q.toLowerCase() ||
      (q.toLowerCase() === 'uk' && c === 'United Kingdom') ||
      (q.toLowerCase() === 'usa' && c === 'United States')
    );
    if (isCountryQuery) return 'World';

    const continentNames = ['asia', 'europe', 'australasia', 'north america', 'south america', 'africa', 'world'];
    if (continentNames.includes(q.toLowerCase())) return 'World';

    const inCurrent = filterRoster(roster, { query: q, location: loc }).length;
    if (inCurrent === 0) {
      const inWorld = filterRoster(roster, { query: q, location: 'World' }).length;
      if (inWorld > 0) return 'World';
    }
    return loc;
  }

  assert.equal(simulateLocationAutoSelect('US', 'France'), 'World');
  assert.equal(simulateLocationAutoSelect('US', 'country:Australia'), 'World');
  assert.equal(simulateLocationAutoSelect('US', 'Japan'), 'World');
  assert.equal(simulateLocationAutoSelect('US', 'University of Melbourne'), 'World');
  assert.equal(simulateLocationAutoSelect('US', 'Xuan-Bach Le'), 'World');
  assert.equal(simulateLocationAutoSelect('US', 'Cambridge'), 'US'); // Harvard/MIT in Cambridge, MA matches US!
  assert.equal(simulateLocationAutoSelect('US', 'univ:"University of Cambridge"'), 'World');
});

