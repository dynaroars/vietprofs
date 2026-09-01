import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  HONOR_CATEGORIES,
  HONOR_FIELDS,
  OTHER_DEGREE_FIELDS,
  REQUIRED_ROSTER_STRINGS,
  ROSTER_FIELDS,
  TRACKS,
  UTC_TIMESTAMP_PATTERN,
} from '../src/roster-constants.ts';
import { looksSurnameFirst } from '../src/data.ts';

const rosterFile = resolve('public/data.json');
const verificationFile = resolve('maintenance/verification.json');
const allowedTracks = new Set<string>(TRACKS);
const allowedHonorCategories = new Set<string>(HONOR_CATEGORIES);
const allowedRosterFields = new Set<string>(ROSTER_FIELDS);
const allowedHonorFields = new Set<string>(HONOR_FIELDS);
const allowedOtherDegreeFields = new Set<string>(OTHER_DEGREE_FIELDS);

// looksSurnameFirst() is a heuristic (see its definition), so it's a review flag, not an
// infallible rule. Names checked here and confirmed already correct (verified against DBLP,
// faculty pages, or an explicit maiden-name pattern) — see the git history for the check —
// are allowlisted so the test doesn't force a wrong "fix" on them.
const surnameFirstAllowlist = new Set<string>([
  'Truong Nghiem', // published as "Truong X. Nghiem" across 83 DBLP entries; Nghiem is his surname
  'Dinh Phung', // published as "Dinh Q. Phung" / "Dinh Quoc Phung" across 552 DBLP entries; Phung is his surname
  'Tran Nguyen Templeton', // "Nguyen" is a preserved maiden name, not a misordered surname
]);

function fail(file: string, message: string): never {
  throw new Error(`${file}: ${message}`);
}

function validateTimestamp(file: string, value: string, label: string, field: string): void {
  const timestamp = new Date(value);
  if (!UTC_TIMESTAMP_PATTERN.test(value) || Number.isNaN(timestamp.valueOf()) || timestamp.toISOString() !== value) {
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

const names = new Set<string>();
const ids = new Set<string>();
const profileUrls = new Set();
const scholarUrls = new Set();
const portraits = new Set();
for (const [index, person] of roster.entries()) {
  const label = `entry ${index + 1}`;
  if (!person || typeof person !== 'object') fail(rosterFile, `${label} must be an object`);
  for (const field of Object.keys(person)) {
    if (!allowedRosterFields.has(field)) fail(rosterFile, `${label} has unsupported field ${field}`);
  }
  for (const field of REQUIRED_ROSTER_STRINGS) {
    if (typeof person[field] !== 'string' || !person[field].trim()) fail(rosterFile, `${label} has invalid ${field}`);
  }
  if (!/^vp-\d{4,}$/.test(person.id)) fail(rosterFile, `${label} has invalid id ${person.id}`);
  validateTimestamp(rosterFile, person.lastUpdatedAt, label, 'lastUpdatedAt');
  if (!/^https?:\/\//.test(person.profileUrl)) fail(rosterFile, `${label} profileUrl must use HTTP(S)`);
  if (person.websiteUrl !== undefined && !/^https?:\/\//.test(person.websiteUrl)) fail(rosterFile, `${label} websiteUrl must use HTTP(S)`);
  if (person.websiteUrl !== undefined && person.websiteUrl === person.profileUrl) fail(rosterFile, `${label} websiteUrl must differ from profileUrl`);
  if (person.scholarUrl !== undefined && !/^https:\/\//.test(person.scholarUrl)) fail(rosterFile, `${label} scholarUrl must use HTTPS`);
  if (person.scholarUrl !== undefined) {
    if (scholarUrls.has(person.scholarUrl)) fail(rosterFile, `${label} duplicates scholarUrl ${person.scholarUrl} — a Google Scholar profile belongs to one person; this usually means a placeholder/wrong ID got copied across a batch`);
    scholarUrls.add(person.scholarUrl);
  }
  if (looksSurnameFirst(person.name) && !surnameFirstAllowlist.has(person.name)) {
    fail(rosterFile, `${label} name "${person.name}" looks stored surname-first (Vietnamese order) instead of "First (Middle) Last" — reorder it, or if the first token is genuinely this person's given name, add it to surnameFirstAllowlist in scripts/validate-data.ts with a note on how you confirmed it`);
  }
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
      for (const field of Object.keys(honor)) {
        if (!allowedHonorFields.has(field)) fail(rosterFile, `${honorLabel} has unsupported field ${field}`);
      }
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
      for (const field of Object.keys(degree)) {
        if (!allowedOtherDegreeFields.has(field)) fail(rosterFile, `${degreeLabel} has unsupported field ${field}`);
      }
      if (typeof degree.degree !== 'string' || !degree.degree.trim()) fail(rosterFile, `${degreeLabel} has invalid degree`);
      if (typeof degree.institution !== 'string' || !degree.institution.trim()) fail(rosterFile, `${degreeLabel} has invalid institution`);
      if (degree.year !== undefined && (!Number.isInteger(degree.year) || degree.year < 1900 || degree.year > new Date().getFullYear())) fail(rosterFile, `${degreeLabel} has invalid year`);
      if (degree.major !== undefined && (typeof degree.major !== 'string' || !degree.major.trim())) fail(rosterFile, `${degreeLabel} has invalid major`);
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
  for (const field of ['phdMajor', 'undergradMajor', 'msMajor']) {
    if (person[field] !== undefined && (typeof person[field] !== 'string' || !person[field].trim())) {
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
console.log(`Validated ${roster.length} roster entries.`);
