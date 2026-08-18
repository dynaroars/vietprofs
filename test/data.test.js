import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { STEM_FIELDS, fieldOf } from '../src/data.js';

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
    assert.equal(typeof p.university, 'string');
    assert.equal(typeof p.city, 'string');
    assert.equal(typeof p.state, 'string');
    assert.ok(Array.isArray(p.researchAreas) && p.researchAreas.length > 0);
    assert.equal(typeof p.secondaryAppointment, 'boolean');
    assert.equal(typeof p.department, 'string');
    assert.ok(p.department.length > 0);
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

test('the field filter offers all eleven broad fields', () => {
  assert.equal(STEM_FIELDS.length, 11);
});

test('every entry maps to one of the eleven broad fields', () => {
  for (const p of roster) {
    assert.ok(
      STEM_FIELDS.includes(fieldOf(p.department)),
      `department "${p.department}" (for ${p.name}) does not match any STEM_FIELDS rule`,
    );
  }
});
