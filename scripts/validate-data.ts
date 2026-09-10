import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  HONOR_CATEGORIES,
  HONOR_FIELDS,
  INSTITUTION_TYPES,
  OTHER_DEGREE_FIELDS,
  DIRECT_FIELD_EXCLUSIONS,
  REQUIRED_ROSTER_STRINGS,
  ROSTER_FIELDS,
  TRACKS,
  UTC_TIMESTAMP_PATTERN,
} from '../src/roster-constants.ts';
import { looksSurnameFirst } from '../src/data.ts';
import { validateEnrichment } from '../src/enrichment.ts';

const rosterFile = resolve('public/data.json');
const verificationFile = resolve('maintenance/verification.json');
const enrichmentFile = resolve('maintenance/enrichment.json');
const allowedTracks = new Set<string>(TRACKS);
const allowedInstitutionTypes = new Set<string>(INSTITUTION_TYPES);
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

const [roster, verification, enrichment] = await Promise.all([
  readFile(rosterFile, 'utf8').then(JSON.parse),
  readFile(verificationFile, 'utf8').then(JSON.parse),
  readFile(enrichmentFile, 'utf8').then(JSON.parse),
]);
if (!Array.isArray(roster) || roster.length === 0) fail(rosterFile, 'must contain a non-empty array');
if (!verification || typeof verification !== 'object' || Array.isArray(verification)) {
  fail(verificationFile, 'must contain an object keyed by canonical roster name');
}
if (!enrichment || enrichment.version !== 1 || !Array.isArray(enrichment.ids) || !Array.isArray(enrichment.batches) || !enrichment.entries || typeof enrichment.entries !== 'object') {
  fail(enrichmentFile, 'must contain a versioned ID-keyed enrichment ledger');
}
const rosterIds = new Set((roster as Array<{ id: string }>).map((person) => person.id));
if (enrichment.ids.length !== rosterIds.size || enrichment.ids.some((id: unknown) => typeof id !== 'string' || !rosterIds.has(id as string))) {
  fail(enrichmentFile, 'IDs must exactly match the current roster');
}
const batchedIds = enrichment.batches.flatMap((batch: { ids?: unknown[] }) => batch.ids ?? []);
if (batchedIds.length !== rosterIds.size || new Set(batchedIds).size !== rosterIds.size || batchedIds.some((id: unknown) => !rosterIds.has(id as string))) {
  fail(enrichmentFile, 'batches must cover every roster ID exactly once');
}
for (const [id, entry] of Object.entries(enrichment.entries as Record<string, { overview?: string; work?: string }>)) {
  if (!rosterIds.has(id)) fail(enrichmentFile, `contains stale entry for ${id}`);
  if (!['pending', 'verified', 'no suitable evidence', 'retry needed'].includes(entry.overview ?? '') || !['pending', 'verified', 'no suitable evidence', 'retry needed'].includes(entry.work ?? '')) fail(enrichmentFile, `invalid outcome for ${id}`);
}
if (Object.keys(enrichment.entries).length !== rosterIds.size) fail(enrichmentFile, 'must contain one ledger entry per roster ID');

const names = new Set<string>();
const ids = new Set<string>();
const profileUrls = new Set();
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
  validateTimestamp(rosterFile, person.lastUpdatedAt, label, 'lastUpdatedAt');
  if (!/^https?:\/\//.test(person.profileUrl)) fail(rosterFile, `${label} profileUrl must use HTTP(S)`);
  if (person.confirmed !== undefined && typeof person.confirmed !== 'boolean') fail(rosterFile, `${label} confirmed must be a boolean`);
  if (person.websiteUrl !== undefined && !/^https?:\/\//.test(person.websiteUrl)) fail(rosterFile, `${label} websiteUrl must use HTTP(S)`);
  if (person.websiteUrl !== undefined && person.websiteUrl === person.profileUrl) fail(rosterFile, `${label} websiteUrl must differ from profileUrl`);
  if (person.scholarUrl !== undefined && !/^https:\/\//.test(person.scholarUrl)) fail(rosterFile, `${label} scholarUrl must use HTTPS`);
  if (person.scholarUrl !== undefined) {
    if (scholarUrls.has(person.scholarUrl)) fail(rosterFile, `${label} duplicates scholarUrl ${person.scholarUrl} — a Google Scholar profile belongs to one person; this usually means a placeholder/wrong ID got copied across a batch`);
    scholarUrls.add(person.scholarUrl);
  }
  if (person.linkedinUrl !== undefined && !/^https:\/\/(www\.)?linkedin\.com\//.test(person.linkedinUrl)) {
    fail(rosterFile, `${label} linkedinUrl must be an https://linkedin.com/ URL`);
  }
  if (person.linkedinUrl !== undefined) {
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
      // Honors always carry a `year` key; `null` records an award whose year is unknown. That is
      // deliberately stricter than `otherDegrees` below, where the key may be omitted entirely.
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
      if (degree.year !== undefined && (!Number.isInteger(degree.year) || degree.year < 1900 || degree.year > CURRENT_YEAR)) fail(rosterFile, `${degreeLabel} has invalid year`);
      if (degree.major !== undefined && (typeof degree.major !== 'string' || !degree.major.trim())) fail(rosterFile, `${degreeLabel} has invalid major`);
      if (degree.source !== undefined && !/^https?:\/\//.test(degree.source)) fail(rosterFile, `${degreeLabel} source must use HTTP(S)`);
    }
  }
  if (!allowedTracks.has(person.track)) fail(rosterFile, `${label} has unsupported track ${person.track}`);
  if (person.institutionType !== undefined && !allowedInstitutionTypes.has(person.institutionType)) {
    fail(rosterFile, `${label} has unsupported institutionType ${person.institutionType}`);
  }
  if (person.institutionType !== undefined && person.institutionType !== 'University' && !['Research', 'Emeritus', 'Deceased'].includes(person.track)) {
    fail(rosterFile, `${label} non-university institutionType requires the Research, Emeritus, or Deceased track`);
  }
  if (!Array.isArray(person.researchAreas) || person.researchAreas.length === 0) fail(rosterFile, `${label} needs researchAreas`);
  const enrichmentErrors = validateEnrichment(person);
  if (enrichmentErrors.length) fail(rosterFile, `${label} enrichment: ${enrichmentErrors.join('; ')}`);
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
    if (person[field] !== undefined && (!Number.isInteger(person[field]) || person[field] < 1900 || person[field] > CURRENT_YEAR)) {
      fail(rosterFile, `${label} has invalid ${field}`);
    }
  }
  for (const field of ['phdMajor', 'undergradMajor', 'msMajor']) {
    if (person[field] !== undefined && (typeof person[field] !== 'string' || !person[field].trim())) {
      fail(rosterFile, `${label} has invalid ${field}`);
    }
  }
  if (person.directFields !== undefined) {
    if (!Array.isArray(person.directFields) || person.directFields.length === 0) {
      fail(rosterFile, `${label} directFields must be a non-empty array`);
    }
    const directFields = new Set<string>();
    for (const field of person.directFields) {
      if (typeof field !== 'string' || !allowedRosterFields.has(field) || DIRECT_FIELD_EXCLUSIONS.has(field)) {
        fail(rosterFile, `${label} has invalid direct field ${JSON.stringify(field)}`);
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

for (const name of names) {
  if (!Object.hasOwn(verification, name)) fail(verificationFile, `missing verification timestamp for ${name}`);
  validateTimestamp(verificationFile, verification[name], name, 'lastVerifiedAt');
}
for (const name of Object.keys(verification)) {
  if (!names.has(name)) fail(verificationFile, `contains stale entry for ${name}`);
}
console.log(`Validated ${roster.length} roster entries.`);
