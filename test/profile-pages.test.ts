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
