import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Ajv2020, type ErrorObject } from 'ajv/dist/2020.js';
import {
  INSTITUTION_TYPES,
  RANKS,
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
const schemaFile = resolve('public/roster.schema.json');

// looksSurnameFirst() is a heuristic (see its definition), so it's a review flag, not an
// infallible rule. Names checked here and confirmed already correct (verified against DBLP,
// faculty pages, or an explicit maiden-name pattern) — see the git history for the check —
// are allowlisted so the test doesn't force a wrong "fix" on them.
const surnameFirstAllowlist = new Set<string>([
  'Phan Luu', // Neurosom/BEL leadership pages list "Phan Luu" (Chief Science Officer) and he publishes as "Luu, P." (EEG work with D. M. Tucker); Luu is his surname
  'Vuong N. Trieu', // Oncotelic leadership page lists "Vuong Trieu, Ph.D." (CEO/CSO) and he publishes as "Trieu, V. N."; Trieu is his surname
  'Hoang Dothe', // Johns Hopkins Winter 2020 in-memoriam notice names him "Hoang Dothe" (A&S 1987 MS/PhD) and he published under that spelling; Dothe is his surname
  'Do Sang Kim', // PKNU publishes "Do Sang Kim"; ORCID 0000-0003-4191-2295 explicitly gives "Do Sang" as given names and "Kim" as family name.
  'Mai Har Sham', // CUHK's current profile labels her "Professor SHAM Mai Har" and its English biography calls her "Professor Sham"; Sham is her surname.
  'Mai M. Khalaf', // ORCID 0000-0003-0599-9928 explicitly gives Mai as given name and Khalaf as family name; KFU publishes "Mai Mostafa Khalaf".
  'Nguyen-Thi Dang', // IMO Orsay member page lists Nguyen-Thi Dang (Maîtresse de conférences); she publishes as "Nguyen-Thi Dang" with Dang as surname
  'Hoang La', // his IUT Orsay page gives "Hoang La" and the address firstname.lastname@universite-paris-saclay.fr; La is his surname
  'Le Nguyen Hoang', // Télécom Paris profile publishes "Lê Nguyên Hoang" in Western order; Hoang is his surname (EPFL/Science4All)
  'Mai Nguyen-Chi', // LPHI Montpellier team page lists "Mai Nguyen-Chi" (CNRS DR2); Nguyen-Chi is her compound surname and Mai her given name
  'Tran Bao Locke', // BCM people-search lists "Tran Locke" (Otolaryngology); Locke is the surname and Tran the given name
  'Le Anh Nguyen Long', // University of Twente Pure profile lists "Le Anh Nguyen Long"; she publishes as "Nguyen Long, L. A." (surname Nguyen Long)
  'Mai Thi Thanh Thai', // HEC Montréal's faculty directory lists her as "Thai, Mai Thi Thanh"; Thai is her surname
  'Hoang Mai Luong', // Chulalongkorn EE profile gives Thai "ฮวาง มาย เลื่อง" (Hoang Mai Luong) and email hoang.l@chula.ac.th; Luong is his surname
  'Truong Nghiem', // published as "Truong X. Nghiem" across 83 DBLP entries; Nghiem is his surname
  'Dinh Phung', // published as "Dinh Q. Phung" / "Dinh Quoc Phung" across 552 DBLP entries; Phung is his surname
  'Truong Phung', // Federation University profile gives "Dr Truong H. Phung" with email t.phung@federation.edu.au; Phung is his surname
  'Tran Nguyen Templeton', // "Nguyen" is a preserved maiden name, not a misordered surname
  'Mai Tuyet Pho', // published as "Mai Tuyet Pho, MD" across her UChicago bio, MD/MPH listings, and
  // LinkedIn, and referred to as "Dr. Pho" in UChicago news articles — Pho is her surname.
  'Ha Phuong Luong', // published as "Dr Ha Phuong Luong" on her official Henley Business School
  // (University of Reading) staff profile and on ResearchGate/Google Scholar; Luong is her surname.
  'Doan Pham Minh', // published as "Doan Pham Minh" across official IMT Mines Albi directory and publications; Pham is his surname and Doan is his given name.
  'Vu Thuy Khanh Le-Trilling', // published as "Vu Thuy Khanh Le-Trilling" across University Hospital Essen directory and virology publications.
  'Nguyen Thai', // UOW Scholars lists him as "Nguyen (Beo) Thai" and Dr Thai; Thai is his surname, Nguyen his given name.
  'Tran Dinh-Le', // UTS profile (profiles.uts.edu.au/BaoTran.Dinh-Le) gives first name "Tran", last name "Dinh-Le"; Tran is her given name (Bao Tran)
  'Tran Trung Luu', // published as "Tran Trung Luu" / "T. T. Luu" across Nature, HKU directory, and ORCID; Luu is his surname and Tran Trung is his given name.
  'Dinh Ho Tong Minh', // published as "Dinh Ho Tong Minh" across INRAE, IEEE, and Nature; Ho Tong Minh is his compound surname and Dinh is his given name.
  'Chau Trinh-Shevrin', // published as "Chau Trinh-Shevrin" across NYU directory and publications; Trinh-Shevrin is her surname and Chau is her given name.
  'Le Mai Tu', // published as "Dre Le Mai Tu" across Université de Sherbrooke directory; Tu is her surname and Le Mai is her given name.
  'Dinh Ha Duy Thuy', // published as "Dinh Ha Duy Thuy" across Kyoto University directory and Researchmap; Dinh is his surname and Thuy is his given name.
  'Ha Thanh Dong', // published as "Ha Thanh Dong" / "Dr. Ha Thanh Dong" on AIT faculty directory; Dong is his surname and Ha is his given name.
  'Nguyen Bach', // published as "Nguyen Bach" on his homepage (nguyenbh.github.io), CMU dissertation, and Google Scholar; Bach is his surname and Nguyen is his given name.
]);

const CURRENT_YEAR = new Date().getFullYear();

function fail(file: string, message: string): never {
  throw new Error(`${file}: ${message}`);
}

function validateTimestamp(file: string, value: string, label: string, field: string): void {
  const timestamp = new Date(value);
  if (
    !UTC_TIMESTAMP_PATTERN.test(value) ||
    Number.isNaN(timestamp.valueOf()) ||
    timestamp.toISOString() !== value
  ) {
    fail(file, `${label} ${field} must be a canonical UTC ISO timestamp`);
  }
  if (timestamp.valueOf() > Date.now()) fail(file, `${label} ${field} must not be in the future`);
}

const [roster, relationships, rosterSchema] = await Promise.all([
  readFile(rosterFile, 'utf8').then(JSON.parse),
  readFile(relationshipsFile, 'utf8').then(JSON.parse),
  readFile(schemaFile, 'utf8').then(JSON.parse),
]);

// public/roster.schema.json owns the shape of an entry: allowed and required fields, types, URL and
// path patterns, enums, and honors. The checks after it are the ones a schema can't express. The
// site reads tracks, ranks, and institution types from src/roster-constants.ts, so those must agree.
const schemaFields = rosterSchema.items.properties;
for (const [field, values] of [
  ['track', TRACKS],
  ['rank', RANKS],
  ['institutionType', INSTITUTION_TYPES],
] as const) {
  if (JSON.stringify(schemaFields[field].enum) !== JSON.stringify(values))
    fail(schemaFile, `${field} enum must match src/roster-constants.ts`);
}
const validateRoster = new Ajv2020({ allErrors: true, verbose: true }).compile<any>(rosterSchema);
function describeSchemaError(error: ErrorObject, currentList: RosterEntry[]): string {
  const [, index, ...path] = error.instancePath.split('/');
  const id = currentList[Number(index)]?.id;
  const where = index
    ? `entry ${Number(index) + 1}${id ? ` (${id})` : ''}${path.length ? ` ${path.join('.')}` : ''}`
    : 'roster';
  if (error.keyword === 'additionalProperties')
    return `${where} has unsupported field ${error.params.additionalProperty}`;
  if (error.keyword === 'enum') {
    const hint =
      path.at(-1) === 'rank'
        ? ' (the track carries Clinical/Teaching/Research; the exact title stays on the profile)'
        : '';
    return `${where} has unsupported value ${JSON.stringify(error.data)}: use one of ${error.params.allowedValues.join(', ')}${hint}`;
  }
  return `${where} ${error.message}`;
}
if (!validateRoster(roster)) {
  const errors = validateRoster.errors ?? [];
  fail(
    rosterFile,
    `does not match roster.schema.json:\n  ${errors
      .slice(0, 20)
      .map((err) => describeSchemaError(err, roster))
      .join('\n  ')}${errors.length > 20 ? `\n  ...and ${errors.length - 20} more` : ''}`,
  );
}
const rosterIds = new Set((roster as Array<{ id: string }>).map((person) => person.id));
const allRosterIds = rosterIds;

// Retired ids stay retired: a merged duplicate points at the entry that absorbed it, and a person
// who comes back gets the original id restored (npm run retire-profile-id), not a fresh one.
const retiredFile = resolve('maintenance/retired-ids.json');
const retiredIds = JSON.parse(await readFile(retiredFile, 'utf8')) as Record<
  string,
  { replacedBy: string | null; name: string; reason: string }
>;
for (const [id, record] of Object.entries(retiredIds)) {
  if (!/^vp-\d{4,}$/.test(id)) fail(retiredFile, `invalid id ${id}`);
  if (allRosterIds.has(id))
    fail(
      retiredFile,
      `${id} is back in the roster; remove it from retired-ids.json when restoring an id`,
    );
  if (record.replacedBy !== null && !allRosterIds.has(record.replacedBy))
    fail(retiredFile, `${id} points at ${record.replacedBy}, which is not in the roster`);
  if (typeof record.name !== 'string' || typeof record.reason !== 'string' || !record.reason.trim())
    fail(retiredFile, `${id} needs a name and a reason`);
}

// updates.json holds each entry's lastUpdatedAt, keyed by id and written by stamp-updates.ts.
// Exactly one canonical timestamp per roster id, in id order, and nothing for ids not on the roster.
const updatesFile = resolve('public/updates.json');
const updates: Record<string, string> = JSON.parse(await readFile(updatesFile, 'utf8'));
const updateIds = Object.keys(updates);
if (updateIds.join() !== [...updateIds].sort().join())
  fail(updatesFile, 'keys must be sorted by id; run npm run stamp-updates');
for (const id of updateIds) {
  if (!allRosterIds.has(id))
    fail(updatesFile, `${id} is not in the roster; run npm run stamp-updates`);
  validateTimestamp(updatesFile, updates[id], id, 'timestamp');
}
for (const id of allRosterIds)
  if (!(id in updates)) fail(updatesFile, `${id} has no timestamp; run npm run stamp-updates`);

const names = new Set<string>();
const ids = new Set<string>();
const profileUrls = new Set();
const websiteUrls = new Map<string, string>();
const scholarUrls = new Set();
const linkedinUrls = new Set();
const portraits = new Set();

{
  const list = roster as RosterEntry[];
  const file = rosterFile;
  for (const [index, person] of list.entries()) {
    const label = `entry ${index + 1}`;
    const record = person as unknown as Record<string, any>;
    // `id` leads every record so the raw view on a profile page and roster diffs stay consistent.
    // Cheap to satisfy: JSON.stringify preserves insertion order, so anything that parses the
    // roster and writes it back keeps this automatically.
    if (Object.keys(person)[0] !== 'id')
      fail(file, `${label} (${person.id}) must list id as its first field`);
    if (person.websiteUrl !== undefined) {
      if (person.websiteUrl === person.profileUrl)
        fail(file, `${label} websiteUrl must differ from profileUrl`);
      if (websiteUrls.has(person.websiteUrl)) {
        fail(
          file,
          `${label} duplicates websiteUrl ${person.websiteUrl} with ${websiteUrls.get(person.websiteUrl)}`,
        );
      }
      websiteUrls.set(person.websiteUrl, person.name);
    }
    if (person.scholarUrl !== undefined) {
      const scholarErr = validateExternalUrl(person.scholarUrl, 'scholarUrl');
      if (scholarErr) fail(file, `${label} ${scholarErr}`);
      if (scholarUrls.has(person.scholarUrl))
        fail(
          file,
          `${label} duplicates scholarUrl ${person.scholarUrl} — a Google Scholar profile belongs to one person; this usually means a placeholder/wrong ID got copied across a batch`,
        );
      scholarUrls.add(person.scholarUrl);
    }
    if (person.linkedinUrl !== undefined) {
      const linkedinErr = validateExternalUrl(person.linkedinUrl, 'linkedinUrl');
      if (linkedinErr) fail(file, `${label} ${linkedinErr}`);
      if (linkedinUrls.has(person.linkedinUrl))
        fail(
          file,
          `${label} duplicates linkedinUrl ${person.linkedinUrl} — a LinkedIn profile belongs to one person; this usually means a placeholder/wrong ID got copied across a batch`,
        );
      linkedinUrls.add(person.linkedinUrl);
    }
    if (looksSurnameFirst(person.name) && !surnameFirstAllowlist.has(person.name)) {
      fail(
        file,
        `${label} name "${person.name}" looks stored surname-first (Vietnamese order) instead of "First (Middle) Last" — reorder it, or if the first token is genuinely this person's given name, add it to surnameFirstAllowlist in scripts/validate-data.ts with a note on how you confirmed it`,
      );
    }
    if (person.portrait !== undefined) {
      if (portraits.has(person.portrait))
        fail(file, `${label} duplicates portrait ${person.portrait}`);
      try {
        await access(resolve('public', person.portrait));
      } catch {
        fail(file, `${label} portrait file does not exist: ${person.portrait}`);
      }
      portraits.add(person.portrait);
    }
    if (person.honors !== undefined) {
      const honorNames = new Set();
      for (const [honorIndex, honor] of person.honors.entries()) {
        const honorLabel = `${label} honor ${honorIndex + 1}`;
        if (honor.year !== null && honor.year !== undefined && honor.year > CURRENT_YEAR)
          fail(file, `${honorLabel} year ${honor.year} is in the future`);
        const honorKey = `${honor.name}|${honor.year ?? 'unknown'}|${honor.organization}`;
        if (honorNames.has(honorKey))
          fail(file, `${honorLabel} duplicates an honor for ${person.name}`);
        honorNames.add(honorKey);
      }
    }
    if (
      person.institutionType !== undefined &&
      person.institutionType !== 'University' &&
      (!person.track ||
        ![
          'Research',
          'Emeritus',
          'Deceased',
          'Industry Research',
          'Policy & Think Tank',
          'Government & Defense',
        ].includes(person.track))
    ) {
      fail(
        file,
        `${label} non-university institutionType requires the Research, Emeritus, Deceased, Industry Research, Policy & Think Tank, or Government & Defense track`,
      );
    }
    if (
      typeof person.state === 'string' &&
      canonicalState(person.state, person.country) !== person.state
    ) {
      fail(
        file,
        `${label} state must be the full U.S. state name (${canonicalState(person.state, person.country)}), not ${person.state}`,
      );
    }
    const institutionFields = [
      'phdInstitution',
      'undergradInstitution',
      'msInstitution',
      'mdInstitution',
      'postdocInstitution',
    ];
    for (const field of institutionFields) {
      if (record[field] !== undefined) {
        const formatErr = validateInstitutionFormat(record[field], field);
        if (formatErr) fail(file, `${label} ${formatErr}`);
      }
    }
    const yearFields = ['phdYear', 'undergradYear'];
    for (const field of yearFields) {
      if (typeof record[field] === 'number' && record[field] > CURRENT_YEAR)
        fail(file, `${label} ${field} ${record[field]} is in the future`);
    }
    const chronologyErrors = validateEducationChronology(person);
    if (chronologyErrors.length) {
      fail(file, `${label} education chronology: ${chronologyErrors.join('; ')}`);
    }
    if (person.directFields !== undefined) {
      for (const field of person.directFields) {
        if (
          record[field] === undefined ||
          record[field] === null ||
          (typeof record[field] === 'string' && !record[field].trim())
        ) {
          fail(
            file,
            `${label} (${person.id}) lists "${field}" in directFields but the field value is missing or empty`,
          );
        }
      }
      if (
        !person.directFields.every(
          (field: string, index: number, fields: string[]) =>
            index === 0 || fields[index - 1].localeCompare(field) < 0,
        )
      ) {
        fail(file, `${label} directFields must be sorted`);
      }
    }
    if (names.has(person.name)) fail(file, `duplicate name: ${person.name}`);
    if (ids.has(person.id)) fail(file, `duplicate id: ${person.id}`);
    if (profileUrls.has(person.profileUrl))
      fail(file, `duplicate profileUrl: ${person.profileUrl}`);
    names.add(person.name);
    ids.add(person.id);
    profileUrls.add(person.profileUrl);
  }
}

// One person, one entry. The exact-string checks above miss the same Scholar profile, LinkedIn
// slug, or homepage written differently, and a person entered twice under reordered names at one
// institution (vp-0675/vp-1574, vp-0806/vp-1581, ... merged 2026-09-27). Pairs confirmed to be
// different people go in DISTINCT_PEOPLE with how that was confirmed.
const DISTINCT_PEOPLE = new Set<string>([
  'vp-0972 vp-0973', // Katherine Nguyen (Rheumatology) and Katherine Nguyen Williams (Psychiatry), UC San Diego: separate UCSD profiles
  'vp-0673 vp-1700', // Lan K. Nguyen (Biochemistry) and Lan Nguyen (Accounting), Monash: separate Monash research profiles (#223)
  'vp-1744 vp-1996', // Thanh Le (Business, Associate Professor) and Thanh Le Hoang (Computing, Lecturer in AI), Wollongong: separate UOW Scholars profiles
  'vp-2322 vp-2323', // David Quang-Nam Pham (Anesthesiology) and Nam Pham (Endocrinology, MD PhD), UT Southwestern: separate UTSW profiles 182203 and 94529
  'vp-0129 vp-2340', // Tran N. H. Nguyen (Biomedical Engineering, PhD) and Tran T. Nguyen (Hospital Medicine, MD), UT Southwestern: separate UTSW profiles
  'vp-2416 vp-2417', // Hong Loan Nguyen (General Internal Medicine) and Loan T. Nguyen (Pediatrics Hospital Medicine), Baylor College of Medicine: separate BCM profiles 27617 and 27539
  'vp-0020 vp-0414', // Truong X. Tran (Computer Science, Harrisburg; Alabama-Huntsville PhD) and Tran Truong (Linguistics, University Park; Chicago PhD): separate PSU profiles (#559)
  'vp-1135 vp-2974', // Tuan Minh Nguyen (Materials Science Division, UC Irvine PhD) and Tuan H. Nguyen (Global Security Directorate / CGSR, Iowa State PhD), Lawrence Livermore National Laboratory: separate LLNL profiles
]);
const allEntries = roster as RosterEntry[];
const identityOwners = new Map<string, string>();
const rosterTokens = allEntries.map((person) => nameTokens(person.name));
for (const [index, person] of allEntries.entries()) {
  for (const field of ['websiteUrl', 'scholarUrl', 'linkedinUrl'] as const) {
    const value = person[field];
    if (!value) continue;
    const key = identityKey(value);
    const owner = identityOwners.get(key);
    if (owner && owner !== person.id && !DISTINCT_PEOPLE.has([owner, person.id].sort().join(' '))) {
      fail(
        rosterFile,
        `${person.id} and ${owner} share ${field} ${key}: probably one person entered twice; merge into the older id (npm run retire-profile-id)`,
      );
    }
    identityOwners.set(key, person.id);
  }
  for (let other = 0; other < index; other += 1) {
    const earlier = allEntries[other];
    if (
      earlier.university !== person.university ||
      !namesMatch(rosterTokens[index], rosterTokens[other])
    )
      continue;
    if (DISTINCT_PEOPLE.has([earlier.id, person.id].sort().join(' '))) continue;
    fail(
      rosterFile,
      `${earlier.id} "${earlier.name}" and ${person.id} "${person.name}" look like one person at ${person.university}: merge into the older id, or add the pair to DISTINCT_PEOPLE with how you confirmed they differ`,
    );
  }
}

const relationshipErrors = validateRelationshipDatabase(relationships, roster);
if (relationshipErrors.length) fail(relationshipsFile, relationshipErrors.join('; '));
console.log(
  `Validated ${roster.length} roster entries and ${relationships.relationships.length} academic relationships.`,
);
