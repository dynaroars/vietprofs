import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCompleteness,
  computeRecentUpdates,
  deriveRosterStats,
} from '../src/derived-stats.ts';
import type { RosterEntry } from '../src/data.ts';

const mockRoster: RosterEntry[] = [
  {
    id: 'vp-0001',
    name: 'Thanh Nguyen',
    vietnameseName: 'Nguyễn Thành',
    university: 'Stanford University',
    department: 'Computer Science',
    country: 'United States',
    profileUrl: 'https://cs.stanford.edu/tnguyen',
    portrait: 'portraits/0001-thanh-nguyen.webp',
    phdInstitution: 'Stanford University',
    phdYear: 2015,
    undergradInstitution: 'Vietnam National University, Hanoi',
    undergradYear: 2010,
    researchAreas: ['Artificial Intelligence', 'Formal Methods'],
    scholarUrl: 'https://scholar.google.com/citations?user=test1',
    linkedinUrl: 'https://www.linkedin.com/in/test1',
    lastUpdatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'vp-0002',
    name: 'Hoa Tran',
    university: 'University of Cambridge',
    department: 'Economics',
    country: 'United Kingdom',
    profileUrl: 'https://cam.ac.uk/htran',
    phdInstitution: 'University of Oxford',
    phdYear: 2005,
    undergradInstitution: 'Foreign Trade University',
    undergradYear: 2000,
    scholarUrl: 'https://scholar.google.com/citations?user=test2',
    lastUpdatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'vp-0003',
    name: 'Duc Le',
    university: 'National University of Singapore',
    department: 'Mechanical Engineering',
    country: 'Singapore',
    phdInstitution: 'Stanford University',
    phdYear: 1995,
    lastUpdatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

describe('Derived Roster Stats', () => {
  it('computes completeness percentages accurately', () => {
    const completeness = computeCompleteness(mockRoster);
    assert.equal(completeness.length, 8);

    const profiles = completeness.find((c) => c.key === 'profileUrl');
    assert.ok(profiles);
    assert.equal(profiles.count, 2);
    assert.equal(profiles.percentage, 66.7);

    const portraits = completeness.find((c) => c.key === 'portrait');
    assert.ok(portraits);
    assert.equal(portraits.count, 1);
    assert.equal(portraits.percentage, 33.3);
  });

  it('computes recent updates across timeframes', () => {
    const updates = computeRecentUpdates(mockRoster);
    assert.equal(updates.last7Days, 1);
    assert.equal(updates.last30Days, 2);
    assert.equal(updates.last90Days, 2);
  });

  it('computes aggregate derived stats bundle', () => {
    const stats = deriveRosterStats(mockRoster);
    assert.equal(stats.total, 3);
    assert.ok(stats.completeness.length > 0);
  });
});
