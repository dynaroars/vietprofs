import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { HONOR_CATEGORIES, REQUIRED_ROSTER_STRINGS, TRACKS, UTC_TIMESTAMP_PATTERN } from '../src/roster-constants.ts';

type JsonRecord = Record<string, any>;

const rosterFile = resolve('public/data.json');
const verificationFile = resolve('maintenance/verification.json');
const redirectsFile = resolve('maintenance/profile-redirects.json');
const allowedTracks = new Set<string>(TRACKS);
const allowedHonorCategories = new Set<string>(HONOR_CATEGORIES);

function fail(file, message) {
  throw new Error(`${file}: ${message}`);
}

function validateTimestamp(file, value, label, field) {
  const timestamp = new Date(value);
  if (!UTC_TIMESTAMP_PATTERN.test(value) || Number.isNaN(timestamp.valueOf()) || timestamp.toISOString() !== value) {
    fail(file, `${label} ${field} must be a canonical UTC ISO timestamp`);
  }
  if (timestamp.valueOf() > Date.now()) fail(file, `${label} ${field} must not be in the future`);
}

const [roster, verification, redirects] = await Promise.all([
  readFile(rosterFile, 'utf8').then(JSON.parse),
  readFile(verificationFile, 'utf8').then(JSON.parse),
  readFile(redirectsFile, 'utf8').then(JSON.parse),
]);
if (!Array.isArray(roster) || roster.length === 0) fail(rosterFile, 'must contain a non-empty array');
if (!verification || typeof verification !== 'object' || Array.isArray(verification)) {
  fail(verificationFile, 'must contain an object keyed by canonical roster name');
}
if (!redirects || typeof redirects !== 'object' || Array.isArray(redirects)) {
  fail(redirectsFile, 'must contain an object keyed by retired profile ID');
}

const names = new Set<string>();
const ids = new Set<string>();
const profileUrls = new Set();
const portraits = new Set();
for (const [index, person] of roster.entries()) {
  const label = `entry ${index + 1}`;
  if (!person || typeof person !== 'object') fail(rosterFile, `${label} must be an object`);
  for (const field of REQUIRED_ROSTER_STRINGS) {
    if (typeof person[field] !== 'string' || !person[field].trim()) fail(rosterFile, `${label} has invalid ${field}`);
  }
  if (!/^vp-\d{4,}$/.test(person.id)) fail(rosterFile, `${label} has invalid id ${person.id}`);
  validateTimestamp(rosterFile, person.lastUpdatedAt, label, 'lastUpdatedAt');
  if (!/^https?:\/\//.test(person.profileUrl)) fail(rosterFile, `${label} profileUrl must use HTTP(S)`);
  if (person.websiteUrl !== undefined && !/^https?:\/\//.test(person.websiteUrl)) fail(rosterFile, `${label} websiteUrl must use HTTP(S)`);
  if (person.websiteUrl !== undefined && person.websiteUrl === person.profileUrl) fail(rosterFile, `${label} websiteUrl must differ from profileUrl`);
  if (person.scholarUrl !== undefined && !/^https:\/\//.test(person.scholarUrl)) fail(rosterFile, `${label} scholarUrl must use HTTPS`);
  if ((person.portrait === undefined) !== (person.portraitSource === undefined)) {
    fail(rosterFile, `${label} portrait and portraitSource must be provided together`);
  }
  if (person.portrait !== undefined) {
    if (!/^portraits\/[a-z0-9][a-z0-9.-]*\.webp$/.test(person.portrait)) fail(rosterFile, `${label} has invalid portrait path`);
    if (!/^https?:\/\//.test(person.portraitSource)) fail(rosterFile, `${label} portraitSource must be an HTTP(S) URL`);
    if (portraits.has(person.portrait)) fail(rosterFile, `${label} duplicates portrait ${person.portrait}`);
    try {
      await access(resolve('public', person.portrait));
    } catch {
      fail(rosterFile, `${label} portrait file does not exist: ${person.portrait}`);
    }
    portraits.add(person.portrait);
  }
  if (person.honors !== undefined) {
    if (!Array.isArray(person.honors)) fail(rosterFile, `${label} honors must be an array`);
    const honorNames = new Set();
    for (const [honorIndex, honor] of person.honors.entries()) {
      const honorLabel = `${label} honor ${honorIndex + 1}`;
      if (!honor || typeof honor !== 'object') fail(rosterFile, `${honorLabel} must be an object`);
      for (const field of ['name', 'organization', 'source']) {
        if (typeof honor[field] !== 'string' || !honor[field].trim()) fail(rosterFile, `${honorLabel} has invalid ${field}`);
      }
      if (!allowedHonorCategories.has(honor.category)) fail(rosterFile, `${honorLabel} has unsupported category ${honor.category}`);
      if (honor.year !== null && (!Number.isInteger(honor.year) || honor.year < 1900 || honor.year > new Date().getFullYear())) {
        fail(rosterFile, `${honorLabel} has invalid year`);
      }
      if (!/^https:\/\//.test(honor.source)) fail(rosterFile, `${honorLabel} source must use HTTPS`);
      const honorKey = `${honor.name}|${honor.year ?? 'unknown'}|${honor.organization}`;
      if (honorNames.has(honorKey)) fail(rosterFile, `${honorLabel} duplicates an honor for ${person.name}`);
      honorNames.add(honorKey);
    }
  }
  if (person.otherDegrees !== undefined) {
    if (!Array.isArray(person.otherDegrees)) fail(rosterFile, `${label} otherDegrees must be an array`);
    for (const [degreeIndex, degree] of person.otherDegrees.entries()) {
      const degreeLabel = `${label} degree ${degreeIndex + 1}`;
      if (!degree || typeof degree !== 'object') fail(rosterFile, `${degreeLabel} must be an object`);
      if (typeof degree.degree !== 'string' || !degree.degree.trim()) fail(rosterFile, `${degreeLabel} has invalid degree`);
      if (typeof degree.institution !== 'string' || !degree.institution.trim()) fail(rosterFile, `${degreeLabel} has invalid institution`);
      if (degree.year !== undefined && (!Number.isInteger(degree.year) || degree.year < 1900 || degree.year > new Date().getFullYear())) fail(rosterFile, `${degreeLabel} has invalid year`);
      if (degree.source !== undefined && !/^https?:\/\//.test(degree.source)) fail(rosterFile, `${degreeLabel} source must use HTTP(S)`);
    }
  }
  if (!allowedTracks.has(person.track)) fail(rosterFile, `${label} has unsupported track ${person.track}`);
  if (!Array.isArray(person.researchAreas) || person.researchAreas.length === 0) fail(rosterFile, `${label} needs researchAreas`);
  if (person.state !== undefined && typeof person.state !== 'string') fail(rosterFile, `${label} state must be a string`);
  if (person.country !== undefined && typeof person.country !== 'string') fail(rosterFile, `${label} country must be a string`);
  const institutionFields = ['phdInstitution', 'undergradInstitution', 'msInstitution', 'mdInstitution', 'postdocInstitution'];
  for (const field of institutionFields) {
    if (person[field] !== undefined && (typeof person[field] !== 'string' || !person[field].trim())) {
      fail(rosterFile, `${label} has invalid ${field}`);
    }
  }
  const yearFields = ['phdYear', 'undergradYear', 'msYear', 'mdYear', 'postdocYear'];
  for (const field of yearFields) {
    if (person[field] !== undefined && (!Number.isInteger(person[field]) || person[field] < 1900 || person[field] > new Date().getFullYear())) {
      fail(rosterFile, `${label} has invalid ${field}`);
    }
  }
  if (names.has(person.name)) fail(rosterFile, `duplicate name: ${person.name}`);
  if (ids.has(person.id)) fail(rosterFile, `duplicate id: ${person.id}`);
  if (profileUrls.has(person.profileUrl)) fail(rosterFile, `duplicate profileUrl: ${person.profileUrl}`);
  names.add(person.name);
  ids.add(person.id);
  profileUrls.add(person.profileUrl);
}

for (const name of names) {
  if (!Object.hasOwn(verification, name)) fail(verificationFile, `missing verification timestamp for ${name}`);
  validateTimestamp(verificationFile, verification[name], name, 'lastVerifiedAt');
}
for (const name of Object.keys(verification)) {
  if (!names.has(name)) fail(verificationFile, `contains stale entry for ${name}`);
}
for (const [id, rawRedirect] of Object.entries(redirects)) {
  const redirect = rawRedirect as JsonRecord;
  if (!/^vp-\d{4,}$/.test(id)) fail(redirectsFile, `has invalid retired ID ${id}`);
  if (ids.has(id)) fail(redirectsFile, `redirect ID is still active: ${id}`);
  if (!redirect || typeof redirect !== 'object' || Array.isArray(redirect)) fail(redirectsFile, `redirect ${id} must be an object`);
  if (!['merged', 'removed'].includes(redirect.reason)) fail(redirectsFile, `redirect ${id} has invalid reason`);
  if (redirect.reason === 'merged') {
    if (typeof redirect.redirectTo !== 'string' || !ids.has(redirect.redirectTo)) fail(redirectsFile, `merged redirect ${id} must target an active profile ID`);
  } else if (redirect.redirectTo !== null) {
    fail(redirectsFile, `removed redirect ${id} must use a null target`);
  }
}

console.log(`Validated ${roster.length} roster entries.`);
