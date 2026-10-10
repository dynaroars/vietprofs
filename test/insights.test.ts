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
    contributors: 3,
    firstCommitDate: '2026-08-15T12:00:00.000Z',
    codebase: {
      trackedFiles: 1500,
      codeFiles: 70,
      codeLines: 20000,
      languages: [{ language: 'TypeScript', files: 60, lines: 15000 }],
      testFiles: 14,
      npmScripts: 25,
      devDependencies: 8,
      workflows: 4,
    },
    github: {
      pulls: { open: 1, closed: 137, merged: 82, latest: { number: 332, title: 'Triage leads', url: 'https://github.com/dynaroars/vietprofs/pull/332', state: 'open', createdAt: '2026-10-10T11:03:27Z' } },
      issues: { open: 11, closed: 185, latest: null },
      fetchedAt: '2026-10-10T15:00:00.000Z',
    },
  };

  const html = renderHealthPanel(sampleRoster, '/', gitInfo, true, [], 'count');
  assert.ok(html.includes('health-panel-dashboard'));
  assert.ok(html.includes('System Health, Verification &amp; Codebase Status'));
  assert.ok(html.includes('dynaroars/vietprofs'));
  assert.ok(html.includes('abc1234'));
  assert.ok(html.includes('Generated HTML Inventory'));
  assert.ok(html.includes('7 pages'));
  assert.ok(html.includes('Project Complexity'));
  assert.ok(html.includes('20,000 LoC'));
  assert.ok(html.includes('TypeScript: 15,000 lines in 60 files'));
  assert.ok(html.includes('1 / 82 / 137'));
  assert.ok(html.includes('11 / 185'));
  assert.match(html, /href="https:\/\/github\.com\/dynaroars\/vietprofs\/pull\/332"/);
  assert.match(html, /href="\/stats\.html"/);
  assert.match(html, /href="\/connections\.html"/);
  assert.match(html, /href="\/submit\.html"/);
  assert.match(html, /href="\/404\.html"/);

  assert.ok(!html.includes('undefined'), 'health panel contains undefined');
  assert.ok(!html.includes('null'), 'health panel contains null');
  assert.ok(!html.includes('NaN'), 'health panel contains NaN');
});
