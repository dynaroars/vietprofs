import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const file = resolve('public/data.json');
const allowedTracks = new Set(['Tenure-line', 'Teaching', 'Emeritus']);
const allowedHonorCategories = new Set(['academy', 'fellow', 'career_award', 'major_award', 'distinguished_professorship']);
const requiredStrings = ['name', 'profileUrl', 'university', 'city', 'department'];

function fail(message) {
  throw new Error(`${file}: ${message}`);
}

const roster = JSON.parse(await readFile(file, 'utf8'));
if (!Array.isArray(roster) || roster.length === 0) fail('must contain a non-empty array');

const names = new Set();
const profileUrls = new Set();
for (const [index, person] of roster.entries()) {
  const label = `entry ${index + 1}`;
  if (!person || typeof person !== 'object') fail(`${label} must be an object`);
  for (const field of requiredStrings) {
    if (typeof person[field] !== 'string' || !person[field].trim()) fail(`${label} has invalid ${field}`);
  }
  if (!/^https:\/\//.test(person.profileUrl)) fail(`${label} profileUrl must use HTTPS`);
  if (person.websiteUrl !== undefined && !/^https:\/\//.test(person.websiteUrl)) fail(`${label} websiteUrl must use HTTPS`);
  if (person.websiteUrl !== undefined && person.websiteUrl === person.profileUrl) fail(`${label} websiteUrl must differ from profileUrl`);
  if (person.scholarUrl !== undefined && !/^https:\/\//.test(person.scholarUrl)) fail(`${label} scholarUrl must use HTTPS`);
  if (person.honors !== undefined) {
    if (!Array.isArray(person.honors)) fail(`${label} honors must be an array`);
    const honorNames = new Set();
    for (const [honorIndex, honor] of person.honors.entries()) {
      const honorLabel = `${label} honor ${honorIndex + 1}`;
      if (!honor || typeof honor !== 'object') fail(`${honorLabel} must be an object`);
      for (const field of ['name', 'organization', 'source']) {
        if (typeof honor[field] !== 'string' || !honor[field].trim()) fail(`${honorLabel} has invalid ${field}`);
      }
      if (!allowedHonorCategories.has(honor.category)) fail(`${honorLabel} has unsupported category ${honor.category}`);
      if (honor.year !== null && (!Number.isInteger(honor.year) || honor.year < 1900 || honor.year > new Date().getFullYear())) {
        fail(`${honorLabel} has invalid year`);
      }
      if (!/^https:\/\//.test(honor.source)) fail(`${honorLabel} source must use HTTPS`);
      const honorKey = `${honor.name}|${honor.year ?? 'unknown'}|${honor.organization}`;
      if (honorNames.has(honorKey)) fail(`${honorLabel} duplicates an honor for ${person.name}`);
      honorNames.add(honorKey);
    }
  }
  if (!allowedTracks.has(person.track)) fail(`${label} has unsupported track ${person.track}`);
  if (!Array.isArray(person.researchAreas) || person.researchAreas.length === 0) fail(`${label} needs researchAreas`);
  if (typeof person.secondaryAppointment !== 'boolean') fail(`${label} secondaryAppointment must be boolean`);
  if (person.state !== undefined && typeof person.state !== 'string') fail(`${label} state must be a string`);
  if (person.country !== undefined && typeof person.country !== 'string') fail(`${label} country must be a string`);
  if (person.phdYear !== undefined && (!Number.isInteger(person.phdYear) || person.phdYear < 1900 || person.phdYear > new Date().getFullYear())) {
    fail(`${label} has invalid phdYear`);
  }
  if (names.has(person.name)) fail(`duplicate name: ${person.name}`);
  if (profileUrls.has(person.profileUrl)) fail(`duplicate profileUrl: ${person.profileUrl}`);
  names.add(person.name);
  profileUrls.add(person.profileUrl);
}

console.log(`Validated ${roster.length} roster entries.`);
