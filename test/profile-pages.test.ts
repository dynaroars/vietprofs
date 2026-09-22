import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fieldPath, fieldRegionPath, fieldSlug, hasEnoughPeopleForRosterHub, personPath, regionPath, regionSlug, type Roster } from '../src/data.ts';

const roster = JSON.parse(await readFile(new URL('../public/data.json', import.meta.url), 'utf8')) as Roster;

test('every roster entry has a unique, immutable static profile path', () => {
  const ids = roster.map((person) => person.id);
  assert.equal(new Set(ids).size, roster.length);
  for (const person of roster) {
    assert.match(person.id, /^vp-\d{4,}$/);
    assert.equal(personPath(person.id), `people/${person.id}.html`);
  }
});

test('discipline and region hub paths generate clean canonical filenames', () => {
  assert.equal(fieldSlug('Computer & Information Sciences'), 'computer-and-information-sciences');
  assert.equal(fieldPath('Computer & Information Sciences'), 'fields/computer-and-information-sciences.html');
  assert.equal(regionSlug('North America'), 'north-america');
  assert.equal(regionPath('North America'), 'regions/north-america.html');
  assert.equal(regionSlug('United States'), 'united-states');
  assert.equal(regionPath('United States'), 'regions/united-states.html');
  assert.equal(
    fieldRegionPath('Health Sciences', 'Japan'),
    'regions/japan/health-sciences.html',
  );
  assert.equal(hasEnoughPeopleForRosterHub(2), false);
  assert.equal(hasEnoughPeopleForRosterHub(3), true);
});

test('generated profile pages use the same stylesheet source as the directory', async () => {
  const generator = await readFile(new URL('../scripts/generate-profile-pages.ts', import.meta.url), 'utf8');
  const stylesheet = await readFile(new URL('../public/profile.css', import.meta.url), 'utf8');
  const sourceStylesheet = await readFile(new URL('../src/style.css', import.meta.url), 'utf8');
  assert.match(generator, /<link rel="stylesheet" href="\.\.\/profile\.css">/);
  assert.doesNotMatch(generator, /<style>/);
  assert.equal(stylesheet, sourceStylesheet);
  assert.match(generator, /class="submission-link"/);
  assert.match(generator, />Add or update info</);
  assert.match(generator, /class="brand-logo" src="\.\.\/vietprofs-bamboo-v\.svg"/);
  assert.match(generator, /rel="icon" type="image\/svg\+xml" href="\.\.\/vietprofs-bamboo-v\.svg"/);
  assert.match(sourceStylesheet, /:root\s*{[^}]*--bamboo-green: #2e9e64;[^}]*--bamboo-green-hover: #1d7a4c;/s);
  assert.match(sourceStylesheet, /\.submission-link\s*{[^}]*background: var\(--bamboo-green\);[^}]*color: #ffffff;/s);
  assert.match(sourceStylesheet, /\.submit-btn\s*{[^}]*background: var\(--bamboo-green\);[^}]*color: #ffffff;/s);
  assert.match(generator, /countryFlag/);
  assert.match(generator, /class="loc-badge"/);
  assert.match(generator, /class="country-flag"/);
  assert.match(generator, /class="man-page"/);
  assert.match(generator, /PROFILE_ICON/);
  assert.match(generator, /PERSONAL_SITE_ICON/);
  assert.match(generator, /LAB_SITE_ICON/);
  assert.match(generator, /SCHOLAR_ICON/);
  assert.match(generator, /LINKEDIN_ICON/);
  assert.match(generator, /<svg viewBox="0 0 24 24" aria-hidden="true">\$\{icon\}<\/svg>/);
  assert.match(generator, />SYNOPSIS</);
  assert.match(generator, />ROSTER METADATA</);
  assert.match(generator, />SEE ALSO</);
  assert.match(generator, />CONNECTIONS</);
  assert.match(generator, /connectionsFor/);
  assert.match(generator, /public\/relationships\.json/);
  assert.match(generator, /class="links" aria-label="Other VietProfs destinations"/);
  assert.doesNotMatch(generator, /class="man-footer"/);
  assert.match(generator, />ABOUT</);
  assert.match(generator, /view raw record/);
  assert.match(generator, /class="section-note research-overview-note"/);
  assert.match(generator, /Automatically summarized/);
  assert.doesNotMatch(generator, /Automatically summarized from/);
  assert.doesNotMatch(generator, /Report stale record/);
  assert.match(generator, /<span>\$\{sectionLabel\}<\/span>/);
  assert.doesNotMatch(generator, /<span><a href="\.\.\/index\.html">\$\{sectionLabel\}<\/a><\/span>/);
  assert.doesNotMatch(generator, /SELECTED WORK/);
  assert.doesNotMatch(generator, /RECENT WORK/);
  assert.doesNotMatch(generator, /<footer>/);
  assert.doesNotMatch(generator, /man-footer-line/);
  assert.ok(
    generator.indexOf('class="profile-actions"') < generator.indexOf('class="native"'),
    'profile actions should appear alongside the person\'s name',
  );
  assert.match(generator, /class="name-title"><h1>\$\{escapeHtml\(name\)\}<\/h1>\$\{favoriteToggle\}<\/div>/);
});
