import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  HONOR_CATEGORIES,
  HONOR_FIELDS,
  INSTITUTION_TYPES,
  PROTECTABLE_FIELDS,
  RANKS,
  REQUIRED_ROSTER_STRINGS,
  ROSTER_FIELDS,
  TRACKS,
  UTC_TIMESTAMP_PATTERN,
} from '../src/roster-constants.ts';
import { canonicalState, looksSurnameFirst, type RosterEntry } from '../src/data.ts';
import { identityKey, namesMatch, nameTokens } from '../src/identity.ts';
import {
  validateEducationChronology,
  validateExternalUrl,
  validateInstitutionFormat,
} from '../src/validation-rules.ts';
import { validateRelationshipDatabase } from '../src/relationships.ts';

const rosterFile = resolve('public/data.json');
const relationshipsFile = resolve('public/relationships.json');
const allowedTracks = new Set<string>(TRACKS);
const allowedInstitutionTypes = new Set<string>(INSTITUTION_TYPES);
const allowedHonorCategories = new Set<string>(HONOR_CATEGORIES);
const allowedRosterFields = new Set<string>(ROSTER_FIELDS);
const allowedHonorFields = new Set<string>(HONOR_FIELDS);

// looksSurnameFirst() is a heuristic (see its definition), so it's a review flag, not an
// infallible rule. Names checked here and confirmed already correct (verified against DBLP,
// faculty pages, or an explicit maiden-name pattern) — see the git history for the check —
// are allowlisted so the test doesn't force a wrong "fix" on them.
const surnameFirstAllowlist = new Set<string>([
  'Mai Thi Thanh Thai', // HEC Montréal's faculty directory lists her as "Thai, Mai Thi Thanh"; Thai is her surname
  'Truong Nghiem', // published as "Truong X. Nghiem" across 83 DBLP entries; Nghiem is his surname
  'Dinh Phung', // published as "Dinh Q. Phung" / "Dinh Quoc Phung" across 552 DBLP entries; Phung is his surname
  'Tran Nguyen Templeton', // "Nguyen" is a preserved maiden name, not a misordered surname
  'Mai Tuyet Pho', // published as "Mai Tuyet Pho, MD" across her UChicago bio, MD/MPH listings, and
  // LinkedIn, and referred to as "Dr. Pho" in UChicago news articles — Pho is her surname.
  'Ha Phuong Luong', // published as "Dr Ha Phuong Luong" on her official Henley Business School
  // (University of Reading) staff profile and on ResearchGate/Google Scholar; Luong is her surname.
  'Doan Pham Minh', // published as "Doan Pham Minh" across official IMT Mines Albi directory and publications; Pham is his surname and Doan is his given name.
  'Vu Thuy Khanh Le-Trilling', // published as "Vu Thuy Khanh Le-Trilling" across University Hospital Essen directory and virology publications.
  'Tran Trung Luu', // published as "Tran Trung Luu" / "T. T. Luu" across Nature, HKU directory, and ORCID; Luu is his surname and Tran Trung is his given name.
  'Dinh Ho Tong Minh', // published as "Dinh Ho Tong Minh" across INRAE, IEEE, and Nature; Ho Tong Minh is his compound surname and Dinh is his given name.
  'Chau Trinh-Shevrin', // published as "Chau Trinh-Shevrin" across NYU directory and publications; Trinh-Shevrin is her surname and Chau is her given name.
  'Le Mai Tu', // published as "Dre Le Mai Tu" across Université de Sherbrooke directory; Tu is her surname and Le Mai is her given name.
  'Dinh Ha Duy Thuy', // published as "Dinh Ha Duy Thuy" across Kyoto University directory and Researchmap; Dinh is his surname and Thuy is his given name.
  'Ha Thanh Dong', // published as "Ha Thanh Dong" / "Dr. Ha Thanh Dong" on AIT faculty directory; Dong is his surname and Ha is his given name.
]);

const CURRENT_YEAR = new Date().getFullYear();

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

const [roster, relationships] = await Promise.all([
  readFile(rosterFile, 'utf8').then(JSON.parse),
  readFile(relationshipsFile, 'utf8').then(JSON.parse),
]);
if (!Array.isArray(roster) || roster.length === 0) fail(rosterFile, 'must contain a non-empty array');
const rosterIds = new Set((roster as Array<{ id: string }>).map((person) => person.id));

// Retired ids stay retired: a merged duplicate points at the entry that absorbed it, and a person
// who comes back gets the original id restored (npm run retire-profile-id), not a fresh one.
const retiredFile = resolve('maintenance/retired-ids.json');
const retiredIds = JSON.parse(await readFile(retiredFile, 'utf8')) as Record<string, { replacedBy: string | null; name: string; reason: string }>;
for (const [id, record] of Object.entries(retiredIds)) {
  if (!/^vp-\d{4,}$/.test(id)) fail(retiredFile, `invalid id ${id}`);
  if (rosterIds.has(id)) fail(retiredFile, `${id} is back in the roster; remove it from retired-ids.json when restoring an id`);
  if (record.replacedBy !== null && !rosterIds.has(record.replacedBy)) fail(retiredFile, `${id} points at ${record.replacedBy}, which is not in the roster`);
  if (typeof record.name !== 'string' || typeof record.reason !== 'string' || !record.reason.trim()) fail(retiredFile, `${id} needs a name and a reason`);
}

// updates.json holds each entry's lastUpdatedAt, keyed by id and written by stamp-updates.ts.
// Exactly one canonical timestamp per roster id, in id order, and nothing for ids not on the roster.
const updatesFile = resolve('public/updates.json');
const updates: Record<string, string> = JSON.parse(await readFile(updatesFile, 'utf8'));
const updateIds = Object.keys(updates);
if (updateIds.join() !== [...updateIds].sort().join()) fail(updatesFile, 'keys must be sorted by id; run npm run stamp-updates');
for (const id of updateIds) {
  if (!rosterIds.has(id)) fail(updatesFile, `${id} is not in the roster; run npm run stamp-updates`);
  validateTimestamp(updatesFile, updates[id], id, 'timestamp');
}
for (const id of rosterIds) if (!(id in updates)) fail(updatesFile, `${id} has no timestamp; run npm run stamp-updates`);

const names = new Set<string>();
const ids = new Set<string>();
const profileUrls = new Set();
const websiteUrls = new Map<string, string>();
const scholarUrls = new Set();
const linkedinUrls = new Set();
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
  // `id` leads every record so the raw view on a profile page and roster diffs stay consistent.
  // Cheap to satisfy: JSON.stringify preserves insertion order, so anything that parses the
  // roster and writes it back keeps this automatically.
  if (Object.keys(person)[0] !== 'id') fail(rosterFile, `${label} (${person.id}) must list id as its first field`);
  if (!/^https?:\/\//.test(person.profileUrl)) fail(rosterFile, `${label} profileUrl must use HTTP(S)`);
  // Confirmed is the default; only an unconfirmed record (no official current profile) says so.
  if (person.confirmed !== undefined && person.confirmed !== false) fail(rosterFile, `${label} confirmed may only be false; omit it for a confirmed record`);
  if (person.websiteUrl !== undefined) {
    if (!/^https?:\/\//.test(person.websiteUrl)) fail(rosterFile, `${label} websiteUrl must use HTTP(S)`);
    if (person.websiteUrl === person.profileUrl) fail(rosterFile, `${label} websiteUrl must differ from profileUrl`);
    if (websiteUrls.has(person.websiteUrl)) {
      fail(rosterFile, `${label} duplicates websiteUrl ${person.websiteUrl} with ${websiteUrls.get(person.websiteUrl)}`);
    }
    websiteUrls.set(person.websiteUrl, person.name);
  }
  if (person.scholarUrl !== undefined) {
    const scholarErr = validateExternalUrl(person.scholarUrl, 'scholarUrl');
    if (scholarErr) fail(rosterFile, `${label} ${scholarErr}`);
    if (scholarUrls.has(person.scholarUrl)) fail(rosterFile, `${label} duplicates scholarUrl ${person.scholarUrl} — a Google Scholar profile belongs to one person; this usually means a placeholder/wrong ID got copied across a batch`);
    scholarUrls.add(person.scholarUrl);
  }
  if (person.linkedinUrl !== undefined) {
    const linkedinErr = validateExternalUrl(person.linkedinUrl, 'linkedinUrl');
    if (linkedinErr) fail(rosterFile, `${label} ${linkedinErr}`);
    if (linkedinUrls.has(person.linkedinUrl)) fail(rosterFile, `${label} duplicates linkedinUrl ${person.linkedinUrl} — a LinkedIn profile belongs to one person; this usually means a placeholder/wrong ID got copied across a batch`);
    linkedinUrls.add(person.linkedinUrl);
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
      // Honors always carry a `year` key; `null` records an award whose year is unknown.
      if (!Object.hasOwn(honor, 'year')) fail(rosterFile, `${honorLabel} must set year (use null when unknown)`);
      if (honor.year !== null && (!Number.isInteger(honor.year) || honor.year < 1900 || honor.year > CURRENT_YEAR)) {
        fail(rosterFile, `${honorLabel} has invalid year (expected an integer 1900-${CURRENT_YEAR}, or null when unknown)`);
      }
      if (!/^https:\/\//.test(honor.source)) fail(rosterFile, `${honorLabel} source must use HTTPS`);
      const honorKey = `${honor.name}|${honor.year ?? 'unknown'}|${honor.organization}`;
      if (honorNames.has(honorKey)) fail(rosterFile, `${honorLabel} duplicates an honor for ${person.name}`);
      honorNames.add(honorKey);
    }
  }
  if (!allowedTracks.has(person.track)) fail(rosterFile, `${label} has unsupported track ${person.track}`);
  if (person.rank !== undefined && !(RANKS as readonly string[]).includes(person.rank)) {
    fail(rosterFile, `${label} has unsupported rank ${JSON.stringify(person.rank)}: use one of ${RANKS.join(', ')} (the track carries Clinical/Teaching/Research; the exact title stays on the profile)`);
  }
  if (person.institutionType !== undefined && !allowedInstitutionTypes.has(person.institutionType)) {
    fail(rosterFile, `${label} has unsupported institutionType ${person.institutionType}`);
  }
  if (person.institutionType !== undefined && person.institutionType !== 'University' && !['Research', 'Emeritus', 'Deceased'].includes(person.track)) {
    fail(rosterFile, `${label} non-university institutionType requires the Research, Emeritus, or Deceased track`);
  }
  if (!Array.isArray(person.researchAreas) || person.researchAreas.length === 0) fail(rosterFile, `${label} needs researchAreas`);
  if (person.state !== undefined && typeof person.state !== 'string') fail(rosterFile, `${label} state must be a string`);
  if (typeof person.state === 'string' && canonicalState(person.state, person.country) !== person.state) {
    fail(rosterFile, `${label} state must be the full U.S. state name (${canonicalState(person.state, person.country)}), not ${person.state}`);
  }
  if (person.country !== undefined && typeof person.country !== 'string') fail(rosterFile, `${label} country must be a string`);
  const institutionFields = ['phdInstitution', 'undergradInstitution', 'msInstitution', 'mdInstitution', 'postdocInstitution'];
  for (const field of institutionFields) {
    if (person[field] !== undefined) {
      if (typeof person[field] !== 'string' || !person[field].trim()) {
        fail(rosterFile, `${label} has invalid ${field}`);
      }
      const formatErr = validateInstitutionFormat(person[field], field);
      if (formatErr) fail(rosterFile, `${label} ${formatErr}`);
    }
  }
  const yearFields = ['phdYear', 'undergradYear'];
  for (const field of yearFields) {
    if (person[field] !== undefined && (!Number.isInteger(person[field]) || person[field] < 1900 || person[field] > CURRENT_YEAR)) {
      fail(rosterFile, `${label} has invalid ${field}`);
    }
  }
  const chronologyErrors = validateEducationChronology(person);
  if (chronologyErrors.length) {
    fail(rosterFile, `${label} education chronology: ${chronologyErrors.join('; ')}`);
  }
  if (person.directFields !== undefined) {
    if (!Array.isArray(person.directFields) || person.directFields.length === 0) {
      fail(rosterFile, `${label} directFields must be a non-empty array`);
    }
    const directFields = new Set<string>();
    for (const field of person.directFields) {
      if (typeof field !== 'string' || !PROTECTABLE_FIELDS.has(field)) {
        fail(rosterFile, `${label} has invalid direct field ${JSON.stringify(field)}: only ${[...PROTECTABLE_FIELDS].join(', ')} can be protected`);
      }
      if (person[field] === undefined || person[field] === null || (typeof person[field] === 'string' && !person[field].trim())) {
        fail(rosterFile, `${label} (${person.id}) lists "${field}" in directFields but the field value is missing or empty`);
      }
      if (directFields.has(field)) fail(rosterFile, `${label} duplicates direct field ${field}`);
      directFields.add(field);
    }
    if (!person.directFields.every((field: string, index: number, fields: string[]) => index === 0 || fields[index - 1].localeCompare(field) < 0)) {
      fail(rosterFile, `${label} directFields must be sorted`);
    }
  }
  if (names.has(person.name)) fail(rosterFile, `duplicate name: ${person.name}`);
  if (ids.has(person.id)) fail(rosterFile, `duplicate id: ${person.id}`);
  if (profileUrls.has(person.profileUrl)) fail(rosterFile, `duplicate profileUrl: ${person.profileUrl}`);
  names.add(person.name);
  ids.add(person.id);
  profileUrls.add(person.profileUrl);
}

// One person, one entry. The exact-string checks above miss the same Scholar profile, LinkedIn
// slug, or homepage written differently, and a person entered twice under reordered names at one
// institution (vp-0675/vp-1574, vp-0806/vp-1581, ... merged 2026-09-27). Pairs confirmed to be
// different people go in DISTINCT_PEOPLE with how that was confirmed.
const DISTINCT_PEOPLE = new Set<string>([
  'vp-0972 vp-0973', // Katherine Nguyen (Rheumatology) and Katherine Nguyen Williams (Psychiatry), UC San Diego: separate UCSD profiles
  'vp-0673 vp-1700', // Lan K. Nguyen (Biochemistry) and Lan Nguyen (Accounting), Monash: separate Monash research profiles (#223)
]);
const identityOwners = new Map<string, string>();
const rosterTokens = (roster as RosterEntry[]).map((person) => nameTokens(person.name));
for (const [index, person] of (roster as RosterEntry[]).entries()) {
  for (const field of ['websiteUrl', 'scholarUrl', 'linkedinUrl'] as const) {
    const value = person[field];
    if (!value) continue;
    const key = identityKey(value);
    const owner = identityOwners.get(key);
    if (owner && owner !== person.id && !DISTINCT_PEOPLE.has([owner, person.id].sort().join(' '))) {
      fail(rosterFile, `${person.id} and ${owner} share ${field} ${key}: probably one person entered twice; merge into the older id (npm run retire-profile-id)`);
    }
    identityOwners.set(key, person.id);
  }
  for (let other = 0; other < index; other += 1) {
    const earlier = (roster as RosterEntry[])[other];
    if (earlier.university !== person.university || !namesMatch(rosterTokens[index], rosterTokens[other])) continue;
    if (DISTINCT_PEOPLE.has([earlier.id, person.id].sort().join(' '))) continue;
    fail(rosterFile, `${earlier.id} "${earlier.name}" and ${person.id} "${person.name}" look like one person at ${person.university}: merge into the older id, or add the pair to DISTINCT_PEOPLE with how you confirmed they differ`);
  }
}

const relationshipErrors = validateRelationshipDatabase(relationships, roster);
if (relationshipErrors.length) fail(relationshipsFile, relationshipErrors.join('; '));
console.log(`Validated ${roster.length} roster entries and ${relationships.relationships.length} academic relationships.`);
