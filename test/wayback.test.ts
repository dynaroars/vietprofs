import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAvailability, waybackEligible } from '../scripts/wayback.ts';

const page = 'https://example.edu/people/an-nguyen';

test('parseAvailability builds view and raw snapshot URLs', () => {
  const snapshot = parseAvailability(page, {
    archived_snapshots: {
      closest: {
        available: true,
        status: '200',
        timestamp: '20250314092653',
        url: 'x',
      },
    },
  });
  assert.deepEqual(snapshot, {
    url: page,
    viewUrl: `https://web.archive.org/web/20250314092653/${page}`,
    rawUrl: `https://web.archive.org/web/20250314092653id_/${page}`,
    timestamp: '20250314092653',
    date: '2025-03-14',
  });
});

test('parseAvailability rejects missing, failed, or malformed snapshots', () => {
  assert.equal(parseAvailability(page, { archived_snapshots: {} }), null);
  assert.equal(parseAvailability(page, null), null);
  for (const closest of [
    { available: true, status: '404', timestamp: '20250314092653' },
    { available: false, status: '200', timestamp: '20250314092653' },
    { available: true, status: '200', timestamp: '2025' },
  ])
    assert.equal(parseAvailability(page, { archived_snapshots: { closest } }), null);
});

test('waybackEligible skips LinkedIn, Scholar, and non-web URLs', () => {
  assert.equal(waybackEligible(page), true);
  assert.equal(waybackEligible('https://www.linkedin.com/in/someone'), false);
  assert.equal(waybackEligible('https://scholar.google.com/citations?user=abc'), false);
  assert.equal(waybackEligible('https://scholar.google.co.uk/citations?user=abc'), false);
  assert.equal(waybackEligible('mailto:a@example.edu'), false);
  assert.equal(waybackEligible('not a url'), false);
});
