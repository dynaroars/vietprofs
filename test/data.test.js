import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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
