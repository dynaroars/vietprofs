import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEducationChronology,
  validateInstitutionFormat,
  validateExternalUrl,
} from '../src/validation-rules.ts';

test('validateEducationChronology accepts standard academic progression', () => {
  const normal = {
    name: 'Normal Scholar',
    undergradYear: 2010,
    phdYear: 2016,
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
