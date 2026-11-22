import {
  almaMaterLabel,
  almaMaterPath,
  almaMaterSearchTerms,
  canonicalAlmaMater,
} from '../src/alma-mater.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  almaMaterHtml,
  buildAlmaMaterIndex,
  buildUniversityPathways,
  defaultPathwayInstitution,
  isVietnameseInstitution,
  renderPathwayExplorer,
  renderPathwayResults,
} from '../src/pathways.ts';
import type { RosterEntry } from '../src/data.ts';

const sampleRoster: RosterEntry[] = [
  {
    id: 'vp-0001',
    name: 'Minh Nguyen',
    university: 'Stanford University',
    department: 'Computer Science',
    city: 'Stanford',
    state: 'California',
    country: 'United States',
    track: 'Tenure-line',
    rank: 'Professor',
    profileUrl: 'https://cs.stanford.edu/mnguyen',
    undergradInstitution: 'Hanoi University of Science and Technology',
    undergradYear: 2005,
    phdInstitution: 'Massachusetts Institute of Technology',
    phdYear: 2011,
  },
  {
    id: 'vp-0002',
    name: 'Linh Tran',
    university: 'Google DeepMind',
    institutionType: 'Corporate research lab',
    department: 'Research',
    city: 'London',
    country: 'United Kingdom',
    track: 'Industry Research',
    rank: 'Researcher',
    profileUrl: 'https://deepmind.google/ltran',
    undergradInstitution: 'Hanoi University of Science and Technology',
    undergradYear: 2014,
    phdInstitution: 'University of Oxford',
    phdYear: 2020,
  },
  {
    id: 'vp-0003',
    name: 'Hoa Le',
    university: 'University of Melbourne',
    department: 'Electrical Engineering',
    city: 'Melbourne',
    state: 'Victoria',
    country: 'Australia',
    track: 'Tenure-line',
    rank: 'Associate Professor',
    profileUrl: 'https://unimelb.edu.au/hle',
    undergradInstitution: 'Ho Chi Minh City University of Technology',
    undergradYear: 2009,
    msInstitution: 'Hanoi University of Science and Technology',
    phdInstitution: 'University of Melbourne',
    phdYear: 2015,
  },
];

test('isVietnameseInstitution identifies Vietnamese alma maters and excludes overseas schools', () => {
  assert.equal(isVietnameseInstitution('Hanoi University of Science and Technology'), true);
  assert.equal(isVietnameseInstitution('Ho Chi Minh City University of Technology'), true);
  assert.equal(isVietnameseInstitution('Foreign Trade University'), true);
  assert.equal(isVietnameseInstitution('National Economics University'), true);
  assert.equal(isVietnameseInstitution('Can Tho University'), true);
  assert.equal(isVietnameseInstitution('Stanford University'), false);
  assert.equal(isVietnameseInstitution('Massachusetts Institute of Technology'), false);
});

test('buildAlmaMaterIndex aggregates unique alumni across training stages', () => {
  const index = buildAlmaMaterIndex(sampleRoster);
  const hust = index.find((e) => e.institution === 'Hanoi University of Science and Technology');
  assert.ok(hust);
  assert.equal(hust.total, 3);
  assert.equal(hust.byStage.undergrad, 2);
  assert.equal(hust.byStage.ms, 1);
  assert.equal(hust.isVietnamese, true);
});

test('buildUniversityPathways summarizes sectors, PhD destinations, and trajectories', () => {
  const pathways = buildUniversityPathways(
    sampleRoster,
    'Hanoi University of Science and Technology',
    'undergrad',
  );
  assert.equal(pathways.total, 2);
  assert.equal(pathways.stage, 'undergrad');
  assert.equal(pathways.stageCounts.all, 3);
  assert.equal(pathways.sectors.academia, 1);
  assert.equal(pathways.sectors.industry, 1);
  assert.equal(pathways.hostCountries.length, 2);
  assert.equal(pathways.nextPhdInstitutions.length, 2);
  assert.equal(pathways.trajectories.length, 2);

  // Falls back to 'all' when requested stage has 0 matches
  const fallback = buildUniversityPathways(
    sampleRoster,
    'Hanoi University of Science and Technology',
    'postdoc',
  );
  assert.equal(fallback.stage, 'all');
  assert.equal(fallback.total, 3);
});

test('defaultPathwayInstitution prioritizes top Vietnamese undergrad alma mater', () => {
  const def = defaultPathwayInstitution(sampleRoster);
  assert.deepEqual(def, {
    institution: 'Hanoi University of Science and Technology',
    stage: 'undergrad',
  });
});

test('renderPathwayExplorer and renderPathwayResults render interactive HTML without nulls', () => {
  const html = renderPathwayExplorer(sampleRoster, undefined, undefined, './');
  assert.match(html, /id="pathway-explorer"/);
  assert.match(html, /START FROM MY UNIVERSITY/);
  assert.match(html, /Hanoi University of Science and Technology/);
  assert.match(html, /Massachusetts Institute of Technology/);
  assert.match(html, /people\/vp-0001\.html/);
  assert.doesNotMatch(html, /undefined|NaN/);

  const empty = renderPathwayResults(sampleRoster, 'Unknown University', 'undergrad', './');
  assert.match(empty, /No alumni with a recorded degree or postdoc/);
});

test('canonicalAlmaMater merges spelling variants and leaves ambiguous names alone', () => {
  assert.equal(
    canonicalAlmaMater('Hanoi University of Technology'),
    'Hanoi University of Science and Technology',
  );
  assert.equal(
    canonicalAlmaMater('University of Science, VNU-HCM'),
    'University of Science, Vietnam National University Ho Chi Minh City',
  );
  assert.equal(canonicalAlmaMater('Can Tho University, Vietnam'), 'Can Tho University');
  assert.equal(canonicalAlmaMater('Vietnam National University'), 'Vietnam National University');
  assert.equal(canonicalAlmaMater('  Stanford   University '), 'Stanford University');
});

test('isVietnameseInstitution skips foreign schools that share a keyword', () => {
  assert.equal(isVietnameseInstitution('Tokyo University of Agriculture and Technology'), false);
  assert.equal(isVietnameseInstitution('UiT The Arctic University of Norway'), false);
  assert.equal(
    isVietnameseInstitution('University of Transport and Communications in Žilina'),
    false,
  );
  assert.equal(isVietnameseInstitution('Vietnam-Tokyo Polytechniques University'), true);
  assert.equal(isVietnameseInstitution('University of Transport and Communications'), true);
});

test('alma mater acronyms, alumni paths and search terms resolve every spelling', () => {
  assert.equal(almaMaterPath('University of Science, VNU-HCM'), 'alumni/hcmus.html');
  assert.equal(almaMaterPath('Diplomatic Academy of Vietnam'), 'alumni/dav.html');
  assert.equal(almaMaterPath('Can Tho University'), 'alumni/can-tho-university.html');
  assert.equal(almaMaterLabel('Hanoi University of Technology'), 'HUST');
  assert.equal(almaMaterLabel('Can Tho University'), 'Can Tho University');
  assert.deepEqual(almaMaterSearchTerms('Ho Chi Minh City University of Science'), [
    'University of Science, Vietnam National University Ho Chi Minh City',
    'HCMUS',
    'Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM',
  ]);
  assert.match(
    almaMaterHtml('Hanoi University of Science and Technology'),
    /<abbr[^>]*title="Hanoi University of Science and Technology[^"]*">HUST<\/abbr>/,
  );
});
