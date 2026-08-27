import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeRosterProposal,
  selectDueEntries,
} from '../scripts/maintain-roster.mjs';

const people = [
  { name: 'Recent Person', lastUpdatedAt: '2025-01-01T00:00:00.000Z', university: 'Recent University' },
  { name: 'Old Person', lastUpdatedAt: '2024-01-01T00:00:00.000Z', university: 'Old University' },
  { name: 'Never Person', lastUpdatedAt: '2023-01-01T00:00:00.000Z', university: 'Never University' },
];

test('maintenance selection prioritizes missing and oldest verification timestamps', () => {
  const verification = {
    'Recent Person': '2026-08-01T00:00:00.000Z',
    'Old Person': '2024-08-01T00:00:00.000Z',
  };
  assert.deepEqual(selectDueEntries(people, verification, {
    limit: 2,
    staleDays: 365,
    now: Date.parse('2026-08-27T00:00:00.000Z'),
  }), ['Never Person', 'Old Person']);
});

test('maintenance selection can explicitly include recently verified entries', () => {
  const verification = Object.fromEntries(people.map((person, index) => [
    person.name,
    `2026-08-0${index + 1}T00:00:00.000Z`,
  ]));
  assert.deepEqual(selectDueEntries(people, verification, { all: true, limit: 2 }), [
    'Recent Person',
    'Old Person',
  ]);
});

test('maintenance selection temporarily defers unresolved entries', () => {
  assert.deepEqual(selectDueEntries(people, {}, {
    all: true,
    limit: 3,
    now: Date.parse('2026-08-27T00:00:00.000Z'),
    deferredUntil: {
      'Recent Person': '2026-09-26T00:00:00.000Z',
    },
  }), ['Old Person', 'Never Person']);
});

test('proposal analysis accepts one targeted edit and ignores model-chosen timestamps', () => {
  const after = structuredClone(people);
  after[1].university = 'New University';
  after[1].lastUpdatedAt = '2099-01-01T00:00:00.000Z';
  const result = analyzeRosterProposal(people, after, 'Old Person');
  assert.equal(result.ok, true);
  assert.equal(result.substantiveChange, true);
  assert.equal(result.proposal.university, 'New University');
  assert.equal(result.proposal.lastUpdatedAt, people[1].lastUpdatedAt);
});

test('proposal analysis does not treat object key order as a roster update', () => {
  const after = structuredClone(people);
  after[1] = {
    university: after[1].university,
    lastUpdatedAt: after[1].lastUpdatedAt,
    name: after[1].name,
  };
  const result = analyzeRosterProposal(people, after, 'Old Person');
  assert.equal(result.ok, true);
  assert.equal(result.substantiveChange, false);
});

test('proposal analysis accepts an in-place canonical rename', () => {
  const after = structuredClone(people);
  after[1].name = 'Renamed Person';
  const result = analyzeRosterProposal(people, after, 'Old Person');
  assert.equal(result.ok, true);
  assert.equal(result.finalName, 'Renamed Person');
  assert.equal(result.substantiveChange, true);
});

test('proposal analysis rejects edits to another roster entry', () => {
  const after = structuredClone(people);
  after[0].university = 'Unrelated Change';
  const result = analyzeRosterProposal(people, after, 'Old Person');
  assert.equal(result.ok, false);
  assert.match(result.reason, /outside Old Person/);
});
