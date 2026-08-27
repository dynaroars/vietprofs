import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rosterFile = resolve('public/data.json');
const verificationFile = resolve('maintenance/verification.json');
const allowedTracks = new Set(['Tenure-line', 'Teaching', 'Emeritus']);
const allowedHonorCategories = new Set(['academy', 'fellow', 'career_award', 'major_award', 'distinguished_professorship']);
const requiredStrings = ['name', 'profileUrl', 'lastUpdatedAt', 'university', 'city', 'department'];
const utcTimestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function fail(file, message) {
  throw new Error(`${file}: ${message}`);
}

function validateTimestamp(file, value, label, field) {
  const timestamp = new Date(value);
  if (!utcTimestampPattern.test(value) || Number.isNaN(timestamp.valueOf()) || timestamp.toISOString() !== value) {
    fail(file, `${label} ${field} must be a canonical UTC ISO timestamp`);
  }
  if (timestamp.valueOf() > Date.now()) fail(file, `${label} ${field} must not be in the future`);
}

const [roster, verification] = await Promise.all([
  readFile(rosterFile, 'utf8').then(JSON.parse),
  readFile(verificationFile, 'utf8').then(JSON.parse),
]);
if (!Array.isArray(roster) || roster.length === 0) fail(rosterFile, 'must contain a non-empty array');
if (!verification || typeof verification !== 'object' || Array.isArray(verification)) {
  fail(verificationFile, 'must contain an object keyed by canonical roster name');
}

const names = new Set();
const profileUrls = new Set();
const portraits = new Set();
for (const [index, person] of roster.entries()) {
  const label = `entry ${index + 1}`;
  if (!person || typeof person !== 'object') fail(rosterFile, `${label} must be an object`);
  for (const field of requiredStrings) {
    if (typeof person[field] !== 'string' || !person[field].trim()) fail(rosterFile, `${label} has invalid ${field}`);
  }
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
  if (typeof person.secondaryAppointment !== 'boolean') fail(rosterFile, `${label} secondaryAppointment must be boolean`);
  if (person.state !== undefined && typeof person.state !== 'string') fail(rosterFile, `${label} state must be a string`);
  if (person.country !== undefined && typeof person.country !== 'string') fail(rosterFile, `${label} country must be a string`);
  if (person.postdocInstitution !== undefined && (typeof person.postdocInstitution !== 'string' || !person.postdocInstitution.trim())) {
    fail(rosterFile, `${label} has invalid postdocInstitution`);
  }
  if (person.postdocYear !== undefined && (!Number.isInteger(person.postdocYear) || person.postdocYear < 1900 || person.postdocYear > new Date().getFullYear())) {
    fail(rosterFile, `${label} has invalid postdocYear`);
  }
  if (person.phdYear !== undefined && (!Number.isInteger(person.phdYear) || person.phdYear < 1900 || person.phdYear > new Date().getFullYear())) {
    fail(rosterFile, `${label} has invalid phdYear`);
  }
  if (names.has(person.name)) fail(rosterFile, `duplicate name: ${person.name}`);
  if (profileUrls.has(person.profileUrl)) fail(rosterFile, `duplicate profileUrl: ${person.profileUrl}`);
  names.add(person.name);
  profileUrls.add(person.profileUrl);
}

for (const name of names) {
  if (!Object.hasOwn(verification, name)) fail(verificationFile, `missing verification timestamp for ${name}`);
  validateTimestamp(verificationFile, verification[name], name, 'lastVerifiedAt');
}
for (const name of Object.keys(verification)) {
  if (!names.has(name)) fail(verificationFile, `contains stale entry for ${name}`);
}

console.log(`Validated ${roster.length} roster entries.`);
