import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderHealthPanel, relativeHeatTier, calculationBasis } from '../src/insights.ts';
import type { RosterEntry } from '../src/data.ts';

const sampleRoster: RosterEntry[] = [
  {
    id: 'vp-0001',
    name: 'Thanh Nguyen',
    university: 'Stanford University',
    department: 'Computer Science',
    country: 'United States',
    profileUrl: 'https://cs.stanford.edu/tnguyen',
    portrait: 'portraits/0001-thanh-nguyen.webp',
    phdInstitution: 'Stanford University',
    phdYear: 2015,
  },
  {
    id: 'vp-0002',
    name: 'Hoa Tran',
    university: 'University of Cambridge',
    department: 'Economics',
    country: 'United Kingdom',
    profileUrl: 'https://cam.ac.uk/htran',
  },
];

test('relativeHeatTier assigns correct shading buckets relative to max', () => {
  assert.equal(relativeHeatTier(0, 100), 0);
  assert.equal(relativeHeatTier(5, 100), 1);
  assert.equal(relativeHeatTier(20, 100), 2);
  assert.equal(relativeHeatTier(50, 100), 3);
  assert.equal(relativeHeatTier(80, 100), 4);
});

test('calculationBasis outputs structured HTML details block', () => {
  const html = calculationBasis(sampleRoster, 'World');
  assert.match(html, /class="calculation-details"/);
  assert.match(html, /scope=World/);
  assert.match(html, /records=2/);
  assert.match(html, /universities=2/);
});

test('renderHealthPanel renders complete health dashboard HTML without undefined or null', () => {
  const gitInfo = {
    branch: 'main',
    latestHash: 'abc1234',
    latestDate: '2026-09-12T12:00:00.000Z',
    latestMessage: 'feat: updates',
    totalCommits: 1100,
    repoUrl: 'https://github.com/dynaroars/vietprofs',
  };

  const html = renderHealthPanel(sampleRoster, '/', gitInfo, true, [], 'count');
  assert.ok(html.includes('health-panel-dashboard'));
  assert.ok(html.includes('System Health, Verification &amp; Codebase Status'));
  assert.ok(html.includes('dynaroars/vietprofs'));
  assert.ok(html.includes('abc1234'));

  assert.ok(!html.includes('undefined'), 'health panel contains undefined');
  assert.ok(!html.includes('null'), 'health panel contains null');
  assert.ok(!html.includes('NaN'), 'health panel contains NaN');
});
