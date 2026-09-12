import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEducationChronology,
  validateInstitutionFormat,
  validateExternalUrl,
  MID_CAREER_MS_ALLOWLIST,
} from '../src/validation-rules.ts';
import { proposalValidationError } from '../scripts/maintain-roster.ts';

test('validateEducationChronology accepts standard academic progression', () => {
  const normal = {
    name: 'Normal Scholar',
    undergradYear: 2010,
    msYear: 2012,
    phdYear: 2016,
    postdocYear: 2018,
  };
  assert.deepEqual(validateEducationChronology(normal), []);

  const partial = {
    name: 'Partial Scholar',
    phdYear: 2016,
  };
  assert.deepEqual(validateEducationChronology(partial), []);

  const undergradAndPhd = {
    name: 'Direct Scholar',
    undergradYear: 2012,
    phdYear: 2017,
  };
  assert.deepEqual(validateEducationChronology(undergradAndPhd), []);
});

test('validateEducationChronology rejects inverted degrees and impossible intervals', () => {
  // PhD before undergrad
  const phdBeforeUndergrad = {
    name: 'Time Traveler',
    undergradYear: 2018,
    phdYear: 2014,
  };
  assert.match(
    validateEducationChronology(phdBeforeUndergrad)[0],
    /phdYear \(2014\) cannot precede undergradYear \(2018\)/,
  );

  // Interval less than 2 years between undergrad and PhD
  const sameYear = {
    name: 'Fast Scholar',
    undergradYear: 2015,
    phdYear: 2015,
  };
  assert.match(
    validateEducationChronology(sameYear)[0],
    /interval between undergradYear \(2015\) and phdYear \(2015\) is less than 2 years/,
  );

  // Postdoc before PhD
  const postdocBeforePhd = {
    name: 'Early Postdoc',
    phdYear: 2020,
    postdocYear: 2018,
  };
  assert.match(
    validateEducationChronology(postdocBeforePhd)[0],
    /postdocYear \(2018\) cannot precede phdYear \(2020\)/,
  );

  // MS before undergrad
  const msBeforeUndergrad = {
    name: 'Early MS',
    undergradYear: 2015,
    msYear: 2012,
  };
  assert.match(
    validateEducationChronology(msBeforeUndergrad)[0],
    /msYear \(2012\) cannot precede undergradYear \(2015\)/,
  );
});

test('validateEducationChronology handles mid-career master degrees correctly', () => {
  // Non-allowlisted MS after PhD
  const unallowlisted = {
    name: 'Unknown Scholar',
    phdYear: 2014,
    msYear: 2025,
  };
  assert.match(
    validateEducationChronology(unallowlisted)[0],
    /msYear \(2025\) is after phdYear \(2014\)/,
  );

  // Allowlisted mid-career MS (e.g. Huyen C. Nguyen)
  const allowlisted = {
    name: 'Huyen C. Nguyen',
    phdYear: 2014,
    msYear: 2025,
  };
  assert.deepEqual(validateEducationChronology(allowlisted), []);
});

test('validateInstitutionFormat flags degree prefixes prepended to institutions', () => {
  assert.equal(validateInstitutionFormat('Stanford University', 'phdInstitution'), null);
  assert.equal(validateInstitutionFormat('Massachusetts Institute of Technology', 'phdInstitution'), null);

  assert.match(
    validateInstitutionFormat('Ph.D. in Mathematics Indiana University', 'msInstitution') ?? '',
    /appears to include a degree prefix/,
  );
  assert.match(
    validateInstitutionFormat('B.S. in Physics MIT', 'undergradInstitution') ?? '',
    /appears to include a degree prefix/,
  );
  assert.match(
    validateInstitutionFormat('Master of Science University of Texas', 'msInstitution') ?? '',
    /appears to include a degree prefix/,
  );
});

test('validateExternalUrl validates Google Scholar citation profiles', () => {
  assert.equal(validateExternalUrl('https://scholar.google.com/citations?user=NKqpSVkAAAAJ', 'scholarUrl'), null);
  assert.equal(validateExternalUrl('https://scholar.google.com.vn/citations?hl=en&user=NKqpSVkAAAAJ', 'scholarUrl'), null);

  // Search queries instead of profile
  assert.match(
    validateExternalUrl('https://scholar.google.com/scholar?q=Duy+Le', 'scholarUrl') ?? '',
    /must be a Google Scholar citation profile URL/,
  );
  // Non-https
  assert.match(
    validateExternalUrl('http://scholar.google.com/citations?user=NKqpSVkAAAAJ', 'scholarUrl') ?? '',
    /must be a Google Scholar citation profile URL/,
  );
});

test('validateExternalUrl validates LinkedIn personal profiles', () => {
  assert.equal(validateExternalUrl('https://www.linkedin.com/in/duy-le-98695551/', 'linkedinUrl'), null);
  assert.equal(validateExternalUrl('https://linkedin.com/in/tatranvhn', 'linkedinUrl'), null);
  assert.equal(validateExternalUrl('https://www.linkedin.com/in/thái-sơn-hoàng-3b330294/', 'linkedinUrl'), null);

  // Company page
  assert.match(
    validateExternalUrl('https://www.linkedin.com/company/google', 'linkedinUrl') ?? '',
    /must be a direct LinkedIn personal profile URL/,
  );
  // Search URL
  assert.match(
    validateExternalUrl('https://www.linkedin.com/search/results/all/?keywords=test', 'linkedinUrl') ?? '',
    /must be a direct LinkedIn personal profile URL/,
  );
});

test('proposalValidationError rejects proposals with chronological errors or invalid links', () => {
  const baseProposal = {
    name: 'Sample Person',
    profileUrl: 'https://example.edu/sample',
    lastUpdatedAt: '2026-01-01T00:00:00.000Z',
    university: 'Example University',
    city: 'Sample City',
    department: 'Computer Science',
    track: 'Tenure-line',
    researchAreas: ['Computer Science'],
  };

  // Chronology rejection
  const invalidChronology = {
    ...baseProposal,
    undergradYear: 2020,
    phdYear: 2015,
  };
  assert.match(proposalValidationError(invalidChronology) ?? '', /education chronology/);

  // Polluted institution rejection
  const invalidInstitution = {
    ...baseProposal,
    phdInstitution: 'Ph.D. in Computer Science Stanford University',
  };
  assert.match(proposalValidationError(invalidInstitution) ?? '', /appears to include a degree prefix/);

  // Invalid Scholar URL rejection
  const invalidScholar = {
    ...baseProposal,
    scholarUrl: 'https://scholar.google.com/scholar?q=Sample+Person',
  };
  assert.match(proposalValidationError(invalidScholar) ?? '', /Google Scholar citation profile URL/);

  // Invalid LinkedIn URL rejection
  const invalidLinkedin = {
    ...baseProposal,
    linkedinUrl: 'https://www.linkedin.com/company/sample',
  };
  assert.match(proposalValidationError(invalidLinkedin) ?? '', /LinkedIn personal profile URL/);
});

import { createEmptyEvidenceLedger, recordFieldEvidence, isQuotePresentInText } from '../src/evidence.ts';

test('evidence ledger records field evidence and validates quote presence', () => {
  const ledger = createEmptyEvidenceLedger();
  recordFieldEvidence(
    ledger,
    'vp-0001',
    'Sample Person',
    'phdInstitution',
    'Stanford University',
    'https://stanford.edu/profile',
    'Sample Person earned his Ph.D. from Stanford University in 2012.',
  );

  const entry = ledger.entries['vp-0001'];
  assert.ok(entry, 'expected person entry in ledger');
  assert.equal(entry.name, 'Sample Person');
  assert.equal(entry.sources.length, 1);
  assert.equal(entry.fields.phdInstitution.value, 'Stanford University');
  assert.equal(entry.fields.phdInstitution.source, 'https://stanford.edu/profile');
  assert.equal(
    entry.fields.phdInstitution.quote,
    'Sample Person earned his Ph.D. from Stanford University in 2012.',
  );

  const sampleHtml = '<html><body>Sample Person earned his Ph.D. from Stanford University in 2012.</body></html>';
  assert.equal(isQuotePresentInText(entry.fields.phdInstitution.quote!, sampleHtml), true);
  assert.equal(isQuotePresentInText('MIT degree', sampleHtml), false);
});

