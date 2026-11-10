import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  externalConnectionsFor,
  type ExternalConnection,
  type RelationshipDatabase,
  validateRelationshipDatabase,
} from '../src/relationships.ts';

const roster = [{ id: 'vp-0001' }, { id: 'vp-0002' }];
const verifiedAt = '2026-11-09T00:00:00.000Z';
const advisor: ExternalConnection = {
  type: 'doctoral-advisor',
  personId: 'vp-0001',
  role: 'mentor',
  name: 'Jane Smith',
  affiliation: 'Stanford University',
  url: 'https://example.edu/jane-smith',
  sources: ['https://example.edu/vp-0001/cv.pdf'],
  evidence: 'The CV names Jane Smith as PhD advisor.',
  works: [],
  verifiedAt,
  notes: '',
};
const database = (external: unknown[]): RelationshipDatabase =>
  ({ version: 1, updatedAt: verifiedAt, relationships: [], external }) as RelationshipDatabase;
const now = Date.parse('2026-11-10T00:00:00.000Z');

test('external connections validate against the roster and their type', () => {
  assert.deepEqual(validateRelationshipDatabase(database([advisor]), roster, now), []);
  const errors = validateRelationshipDatabase(
    database([
      { ...advisor, personId: 'vp-9999' },
      { ...advisor, role: 'peer' },
      { ...advisor, type: 'coauthor', role: 'peer', works: [] },
      { ...advisor, url: 'http://insecure.example' },
      { ...advisor, name: ' ' },
      advisor,
      advisor,
    ]),
    roster,
    now,
  );
  assert.ok(errors.some((e) => e.includes('unknown personId vp-9999')));
  assert.ok(errors.some((e) => e.includes('role must be mentor or mentee')));
  assert.ok(errors.some((e) => e.includes('coauthor records require at least 2 works')));
  assert.ok(errors.some((e) => e.includes('url must be empty or HTTPS')));
  assert.ok(errors.some((e) => e.includes('must include a name')));
  assert.ok(errors.some((e) => e.includes('duplicates an existing external connection')));
});

test('a database without external connections stays valid', () => {
  const { external: _unused, ...withoutExternal } = database([]);
  assert.deepEqual(validateRelationshipDatabase(withoutExternal, roster, now), []);
});

test('external connections are labeled by the other person’s role', () => {
  const advisee = { ...advisor, role: 'mentee' as const, name: 'Sam Lee' };
  const labels = externalConnectionsFor('vp-0001', database([advisor, advisee])).map(
    (c) => c.label,
  );
  assert.deepEqual(labels, ['Doctoral advisor', 'Doctoral advisee']);
  assert.deepEqual(externalConnectionsFor('vp-0002', database([advisor])), []);
});
