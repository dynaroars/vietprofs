import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderHealthPanel,
  renderGrowthChart,
  relativeHeatTier,
  calculationBasis,
} from '../src/insights.ts';
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

test('renderHealthPanel renders the roster health dashboard without undefined or null', () => {
  const html = renderHealthPanel(sampleRoster, '/', true);
  assert.ok(html.includes('health-panel-dashboard'));
  assert.ok(html.includes('System Health &amp; Verification'));
  assert.ok(html.includes('Generated HTML Inventory'));
  assert.ok(html.includes('6 pages'));
  assert.doesNotMatch(html, /Project Complexity|LoC|github-status-card|growth-chart/);
  assert.match(html, /href="\/connections\.html"/);
  assert.match(html, /href="\/submit\.html"/);
  assert.match(html, /href="\/404\.html"/);

  assert.ok(!html.includes('undefined'), 'health panel contains undefined');
  assert.ok(!html.includes('null'), 'health panel contains null');
  assert.ok(!html.includes('NaN'), 'health panel contains NaN');
});

test('growth history switches metrics, handles declining code size, and spaces points by date', () => {
  const history = [
    { date: '2026-10-01', count: 10, codeLines: 1000 },
    { date: '2026-10-02', count: 12, codeLines: 900 },
    { date: '2026-10-11', count: 20, codeLines: 500 },
  ];
  const html = renderHealthPanel(sampleRoster, '/', true, history, 'codeLines');
  assert.match(html, /Project &amp; Archive Growth History/);
  assert.match(html, /data-metric="codeLines"/);
  assert.match(html, /-50%/);
  assert.doesNotMatch(html, /\+-|NaN|undefined|complexity-card/);
  assert.match(html, /cx="70.4"/);
  assert.equal((html.match(/class="growth-metric-btn/g) ?? []).length, 6);
  assert.match(renderGrowthChart(history), /data-metric="count"/);
  assert.equal(renderGrowthChart([]), '');
  assert.equal(renderGrowthChart(history.slice(0, 1)), '');
});
