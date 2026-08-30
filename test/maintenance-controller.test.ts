import { test } from 'node:test';
// Controller tests cover the maintenance workflow without invoking external agents.
import assert from 'node:assert/strict';
import {
  analyzeRosterProposal,
  batchCommitStatus,
  canReviseProposal,
  describeRosterChanges,
  failureKind,
  parseOptions,
  parseRateLimitReset,
  proposalValidationError,
  parseChangedPaths,
  needsAnotherBatch,
  remainingBatchSize,
  researchIsComplete,
  resolveTargetLocally,
  selectDueEntries,
  selectTargetEntries,
} from '../scripts/maintain-roster.ts';

const people: Array<Record<string, any>> = [
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

test('maintenance defaults to Claude and supports Codex as agent', () => {
  assert.equal(parseOptions(['run']).agent, null);
  assert.equal(parseOptions(['--agent', 'codex']).agent, 'codex');
  assert.equal(parseOptions(['run', '--total', '1000', '--limit', '40']).total, 1000);
  assert.throws(
    () => parseOptions(['run', '--all', '--total', '1000']),
    /cannot be used together/,
  );
});

test('older checkpoints with no total continue using the batch limit', () => {
  assert.equal(remainingBatchSize({ limit: 50 }, 40), 50);
  assert.equal(remainingBatchSize({ limit: 40, total: null }, 40), 40);
  assert.equal(remainingBatchSize({ limit: 40, total: 100 }, 40), 40);
});

test('only complete research can advance to review or application', () => {
  assert.equal(researchIsComplete({ status: 'complete', action: 'keep' }), true);
  assert.equal(researchIsComplete({ status: 'incomplete', action: 'keep' }), false);
  assert.equal(researchIsComplete(null), false);
});

test('field, all, and capped runs continue across batches', () => {
  assert.equal(needsAnotherBatch({ all: false, total: null, target: { kind: 'person' } }), false);
  assert.equal(needsAnotherBatch({ all: false, total: null, target: { kind: 'field' } }), true);
  assert.equal(needsAnotherBatch({ all: true, total: null, target: null }), true);
  assert.equal(needsAnotherBatch({ all: false, total: 100, target: null }), true);
});

test('an interrupted batch commit is recognized and remains pushable', () => {
  assert.equal(batchCommitStatus('Maintenance-Batch: run-123', 'run-123', false), 'existing');
  assert.equal(batchCommitStatus('another commit', 'run-123', true), 'created');
  assert.equal(batchCommitStatus('another commit', 'run-123', false), 'none');
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

test('maintenance selection excludes names already processed in an earlier batch', () => {
  const verification = Object.fromEntries(people.map((person) => [person.name, '2026-08-01T00:00:00.000Z']));
  assert.deepEqual(selectDueEntries(people, verification, {
    all: true,
    limit: 3,
    excludeNames: ['Recent Person'],
  }), ['Old Person', 'Never Person']);
});

test('maintenance target matching handles an omitted middle initial and a field alias', () => {
  const roster = [
    { name: 'ThanhVu H. Nguyen', department: 'Computer Science', university: 'George Mason University' },
    { name: 'Another Computer Scientist', department: 'Computer Science', university: 'Example University' },
    { name: 'History Person', department: 'History', university: 'Example University' },
  ];
  const personTarget = resolveTargetLocally('Thanhvu Nguyen', roster);
  assert.deepEqual(personTarget, { kind: 'person', canonicalValue: 'ThanhVu H. Nguyen' });
  assert.deepEqual(selectTargetEntries(roster, personTarget), ['ThanhVu H. Nguyen']);

  const fieldTarget = resolveTargetLocally('Computer Science', roster);
  assert.deepEqual(fieldTarget, { kind: 'field', canonicalValue: 'Computer & Information Sciences' });
  assert.deepEqual(selectTargetEntries(roster, fieldTarget), [
    'ThanhVu H. Nguyen',
    'Another Computer Scientist',
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

test('proposal validation rejects honors missing required provenance', () => {
  const error = proposalValidationError({
    name: 'Old Person', profileUrl: 'https://example.edu/old', lastUpdatedAt: '2026-01-01T00:00:00.000Z',
    university: 'Old University', city: 'Old City', department: 'History', track: 'Tenure-line', researchAreas: ['History'],
    honors: [{ name: 'Incomplete award', year: 2025, category: 'career_award' }],
  });
  assert.match(error, /honor has invalid organization/);
});

test('proposal validation rejects a website duplicated from the profile', () => {
  const error = proposalValidationError({
    name: 'Old Person', profileUrl: 'https://example.edu/old', lastUpdatedAt: '2026-01-01T00:00:00.000Z',
    university: 'Old University', city: 'Old City', department: 'History', track: 'Tenure-line', researchAreas: ['History'],
    websiteUrl: 'https://example.edu/old',
  });
  assert.match(error, /websiteUrl must differ/);
});

test('proposal validation rejects unsupported tracks and malformed research areas', () => {
  const proposal = {
    name: 'Old Person', profileUrl: 'https://example.edu/old', lastUpdatedAt: '2026-01-01T00:00:00.000Z',
    university: 'Old University', city: 'Old City', department: 'History', track: 'Visiting', researchAreas: ['History'],
  };
  assert.match(proposalValidationError(proposal), /unsupported track/);
  proposal.track = 'Tenure-line';
  proposal.researchAreas = [''];
  assert.match(proposalValidationError(proposal), /valid researchAreas/);
});

test('proposal analysis preserves completed postdoctoral training fields', () => {
  const after = structuredClone(people);
  after[1].postdocInstitution = 'Carnegie Mellon University';
  after[1].postdocYear = 2022;
  const result = analyzeRosterProposal(people, after, 'Old Person');
  assert.equal(result.ok, true);
  assert.equal(result.substantiveChange, true);
  assert.equal(result.proposal.postdocInstitution, 'Carnegie Mellon University');
  assert.equal(result.proposal.postdocYear, 2022);
});

test('proposal analysis allows a completed postdoc institution without a completion year', () => {
  const after = structuredClone(people);
  after[1].postdocInstitution = 'Carnegie Mellon University';
  const result = analyzeRosterProposal(people, after, 'Old Person');
  assert.equal(result.ok, true);
  assert.equal(result.substantiveChange, true);
  assert.equal(result.proposal.postdocInstitution, 'Carnegie Mellon University');
  assert.equal(result.proposal.postdocYear, undefined);
});

test('rejected proposals receive bounded revision attempts', () => {
  assert.equal(canReviseProposal({ verdict: 'reject' }, 0), true);
  assert.equal(canReviseProposal({ verdict: 'reject' }, 1), true);
  assert.equal(canReviseProposal({ verdict: 'reject' }, 2), false);
  assert.equal(canReviseProposal({ verdict: 'uncertain' }, 0), false);
  assert.equal(canReviseProposal({ verdict: 'approve' }, 0), false);
});

test('maintenance classifies Claude session-limit responses as rate limits', () => {
  assert.equal(failureKind({
    stderr: '',
    stdout: `{"api_error_status":429,"result":"You've hit your session limit · resets 6:10pm"}`,
  }), 'rate');
});

test('maintenance recognizes broad quota-limit wording', () => {
  assert.equal(failureKind({ stderr: 'Account capacity exhausted', stdout: '' }), 'rate');
  assert.equal(failureKind({ stderr: 'HTTP 429', stdout: '' }), 'rate');
});

test('a rate-limit message wins over an incidental auth keyword elsewhere in the transcript', () => {
  assert.equal(failureKind({
    stderr: '',
    stdout: 'dumped file content mentions a professional credential in passing. '
      + "You've hit your usage limit. Upgrade to Pro or try again at 3:51 AM.",
  }), 'rate');
});

test('maintenance parses a future provider reset time', () => {
  const now = Date.parse('2026-08-28T20:00:00.000Z');
  const reset = parseRateLimitReset("You've hit your session limit · resets 6:10pm (America/New_York)", now);
  assert.equal(new Date(reset).toISOString(), '2026-08-28T22:10:00.000Z');
});

test('changed-path parsing preserves the first porcelain path and handles renames', () => {
  assert.deepEqual(parseChangedPaths([
    ' M maintenance/verification.json',
    'M  public/data.json',
    'R  old-name.txt -> new-name.txt',
    '',
  ].join('\n')), [
    'maintenance/verification.json',
    'public/data.json',
    'new-name.txt',
  ]);
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

test('roster change descriptions list modified fields and ignore update timestamps', () => {
  const before = {
    name: 'Old Person',
    university: 'Old University',
    researchAreas: ['History'],
    lastUpdatedAt: '2024-01-01T00:00:00.000Z',
  };
  const after = {
    name: 'Old Person',
    university: 'New University',
    researchAreas: ['History', 'Archives'],
    lastUpdatedAt: '2026-08-29T00:00:00.000Z',
  };
  assert.deepEqual(describeRosterChanges(before, after), [
    'researchAreas: ["History"] -> ["History","Archives"]',
    'university: "Old University" -> "New University"',
  ]);
});
