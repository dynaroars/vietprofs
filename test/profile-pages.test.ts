import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { personPath, type Roster } from '../src/data.ts';

const roster = JSON.parse(await readFile(new URL('../public/data.json', import.meta.url), 'utf8')) as Roster;

test('every roster entry has a unique, immutable static profile path', () => {
  const ids = roster.map((person) => person.id);
  assert.equal(new Set(ids).size, roster.length);
  for (const person of roster) {
    assert.match(person.id, /^vp-\d{4,}$/);
    assert.equal(personPath(person.id), `people/${person.id}.html`);
  }
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
  assert.match(sourceStylesheet, /\.submission-link\s*{[^}]*background: #7dd3fc;[^}]*color: #15181c;/s);
});
