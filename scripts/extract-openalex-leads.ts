#!/usr/bin/env -S npx --no-install tsx
// Builds broad-discipline discovery queues from OpenAlex author search results. OpenAlex does
// not identify ethnicity or faculty status, so Vietnamese-name matches and overseas
// university/research-institute affiliations are only leads. Every pending record still needs
// the roster's normal identity and appointment verification before it can be included.
//
// Usage: ./scripts/extract-openalex-leads.ts [--pages N] [--include-economics]
// The default is one 200-result page for each Vietnamese surname. Increase --pages on later,
// resumable runs rather than mistaking this bounded discovery pass for a complete census.

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const API_URL = 'https://api.openalex.org/authors';
const LEADS_FILE = resolve('maintenance/openalex-leads.json');
const ROSTER_FILE = resolve('public/data.json');
const surnames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Vo', 'Vu', 'Bui', 'Do', 'Phan', 'Lai', 'Huynh', 'Duong', 'Truong', 'Dang', 'Ngo', 'Mai', 'Dao'];
// A surname alone is much too broad internationally (especially Le, Do, Mai, and Dang). This is
// deliberately a discovery lexicon, not an identity determination: a candidate still needs
// identity-resolved appointment evidence before inclusion.
const vietnameseNameTokens = new Set([
  'anh', 'bach', 'bao', 'binh', 'cam', 'chau', 'chinh', 'cuong', 'dinh', 'duy', 'giang', 'hai',
  'hanh', 'hieu', 'hoai', 'hoang', 'hong', 'huong', 'huy', 'khanh', 'kien', 'kim', 'lam', 'lan',
  'lien', 'linh', 'loc', 'long', 'minh', 'my', 'nam', 'ngan', 'ngoc', 'nhat', 'phuc', 'phuong',
  'quang', 'quan', 'quoc', 'quyen', 'son', 'tan', 'thanh', 'thang', 'thai', 'thao', 'thi', 'thien',
  'thuan', 'thuy', 'toan', 'trang', 'trinh', 'truc', 'tuan', 'tuyet', 'van', 'viet', 'vinh', 'xuan', 'yen',
]);
const broadFields = [
  'Computer Science', 'Engineering', 'Mathematics & Statistics', 'Physical Sciences',
  'Life Sciences', 'Medicine & Health', 'Agriculture & Environment', 'Business & Economics',
  'Social Sciences', 'Humanities & Arts', 'Education', 'Law', 'Other',
] as const;

type BroadField = typeof broadFields[number];
type Status = 'pending' | 'included' | 'excluded' | 'duplicate' | 'unresolved';
interface Institution { display_name?: string; country_code?: string; type?: string; }
interface Affiliation { institution?: Institution; years?: number[]; }
interface Topic { display_name?: string; count?: number; field?: { display_name?: string }; domain?: { display_name?: string }; }
interface Author {
  id: string; display_name: string; raw_author_names?: string[]; works_count?: number;
  cited_by_count?: number; affiliations?: Affiliation[]; last_known_institutions?: Institution[];
  topics?: Topic[];
}
interface Lead {
  openAlexId: string; name: string; aliases: string[]; sourceSurname: string;
  nameSignal: string;
  institution: string; country: string; institutionType: string; affiliationYears: number[];
  broadField: BroadField; openAlexField: string; primaryTopic: string;
  works: number; cited: number; status: Status; note?: string; rosterId?: string;
}
interface Queue { candidates: Lead[]; }

const args = process.argv.slice(2);
const pagesArg = args.indexOf('--pages');
const pages = Math.max(1, Math.min(10, Number(pagesArg === -1 ? 1 : args[pagesArg + 1]) || 1));
const includeEconomics = args.includes('--include-economics');
const currentYear = new Date().getUTCFullYear();

function tokens(value: string): Set<string> {
  return new Set(value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((token) => token.length > 1));
}
function samePerson(left: Set<string>, right: Set<string>): boolean {
  const [small, large] = left.size <= right.size ? [left, right] : [right, left];
  // Two-token Vietnamese-looking names collide too often (for example, Quoc Le and a longer
  // Vietnamese name containing both tokens). Exact two-token matches are safe; abbreviated or
  // reordered matches need at least three tokens before the queue calls them duplicates.
  const identical = left.size === right.size && [...left].every((token) => right.has(token));
  return identical || (small.size >= 3 && [...small].every((token) => large.has(token)));
}
function classify(field: string, domain: string): BroadField {
  const text = `${field} ${domain}`.toLowerCase();
  if (text.includes('computer')) return 'Computer Science';
  if (text.includes('engineering')) return 'Engineering';
  if (text.includes('mathematics') || text.includes('statistics')) return 'Mathematics & Statistics';
  if (text.includes('physics') || text.includes('chemistry') || text.includes('earth') || text.includes('astronomy')) return 'Physical Sciences';
  if (text.includes('medicine') || text.includes('nursing') || text.includes('health') || text.includes('dentistry') || text.includes('pharmac')) return 'Medicine & Health';
  if (text.includes('agricultur') || text.includes('environment')) return 'Agriculture & Environment';
  if (text.includes('business') || text.includes('econom')) return 'Business & Economics';
  if (text.includes('psychology') || text.includes('social') || text.includes('political') || text.includes('geography')) return 'Social Sciences';
  if (text.includes('education')) return 'Education';
  if (text.includes('law')) return 'Law';
  if (text.includes('arts') || text.includes('humanities') || text.includes('history') || text.includes('language')) return 'Humanities & Arts';
  if (text.includes('biological') || text.includes('neuroscience') || text.includes('immunology') || text.includes('genetics')) return 'Life Sciences';
  return 'Other';
}
function recentEligibleAffiliation(author: Author): { institution: Institution; years: number[] } | undefined {
  const affiliations = author.affiliations ?? [];
  return affiliations.map((affiliation) => ({ institution: affiliation.institution ?? {}, years: affiliation.years ?? [] }))
    .filter(({ institution, years }) => institution.country_code && institution.country_code !== 'VN' &&
      ['education', 'government', 'nonprofit', 'facility'].includes(institution.type ?? '') &&
      years.some((year) => year >= currentYear - 2))
    .sort((a, b) => Math.max(...b.years) - Math.max(...a.years))[0];
}
async function fetchSurname(surname: string): Promise<Author[]> {
  const authors: Author[] = [];
  let cursor = '*';
  for (let page = 0; page < pages && cursor; page++) {
    const url = `${API_URL}?search=${encodeURIComponent(surname)}&per-page=200&cursor=${encodeURIComponent(cursor)}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'VietProfs discovery (https://vietprofs.roars.dev)' } });
    if (!response.ok) throw new Error(`OpenAlex ${surname} page ${page + 1}: ${response.status}`);
    const payload = await response.json() as { results?: Author[]; meta?: { next_cursor?: string } };
    authors.push(...(payload.results ?? []));
    cursor = payload.meta?.next_cursor ?? '';
  }
  return authors;
}

async function main() {
  const roster: Array<{ name: string; vietnameseName?: string }> = JSON.parse(await readFile(ROSTER_FILE, 'utf8'));
  const rosterNames = roster.flatMap((person) => [person.name, person.vietnameseName].filter((name): name is string => !!name));
  let previous: Record<string, Queue> = {};
  try {
    const existing = JSON.parse(await readFile(LEADS_FILE, 'utf8')) as { pipelineVersion?: number; batches?: Record<string, Queue> };
    // Earlier versions were generated before the stricter name signal existed. Do not retain
    // their automated statuses; later versions preserve human-reviewed outcomes by author ID.
    previous = existing.pipelineVersion === 3 ? existing.batches ?? {} : {};
  } catch { /* first run */ }
  const previousById = new Map(Object.values(previous).flatMap((queue) => queue.candidates).map((lead) => [lead.openAlexId, lead]));
  const batches: Record<string, Queue> = Object.fromEntries(broadFields.map((field) => [field, { candidates: [] as Lead[] }]));
  const seen = new Set<string>();

  for (const surname of surnames) {
    console.log(`Fetching OpenAlex authors matching ${surname} (${pages} page${pages === 1 ? '' : 's'})...`);
    for (const author of await fetchSurname(surname)) {
      const authorTokens = tokens(author.display_name);
      const hasSurname = authorTokens.has(surname.toLowerCase());
      const signal = [...authorTokens].find((token) => token !== surname.toLowerCase() && vietnameseNameTokens.has(token));
      if (seen.has(author.id) || !author.display_name || !hasSurname || !signal || (author.works_count ?? 0) < 3) continue;
      seen.add(author.id);
      const affiliation = recentEligibleAffiliation(author);
      if (!affiliation) continue;
      const topic = [...(author.topics ?? [])].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))[0];
      const openAlexField = topic?.field?.display_name ?? topic?.domain?.display_name ?? 'Unknown';
      const broadField = classify(openAlexField, topic?.domain?.display_name ?? '');
      if (!includeEconomics && broadField === 'Business & Economics') continue;
      const prior = previousById.get(author.id);
      const rosterMatch = roster.find((person) => samePerson(tokens(author.display_name), tokens(person.name)) ||
        (person.vietnameseName ? samePerson(tokens(author.display_name), tokens(person.vietnameseName)) : false));
      const lead: Lead = {
        openAlexId: author.id, name: author.display_name, aliases: author.raw_author_names ?? [], sourceSurname: surname,
        nameSignal: `${surname} + ${signal}`,
        institution: affiliation.institution.display_name ?? 'Unknown', country: affiliation.institution.country_code ?? '',
        institutionType: affiliation.institution.type ?? '', affiliationYears: affiliation.years,
        broadField, openAlexField, primaryTopic: topic?.display_name ?? 'Unknown', works: author.works_count ?? 0,
        cited: author.cited_by_count ?? 0, status: prior?.status ?? (rosterMatch ? 'duplicate' : 'pending'),
        note: prior?.note ?? (rosterMatch ? `Possible roster match: ${rosterMatch.name}. Verify identity before treating as duplicate.` : undefined),
        rosterId: prior?.rosterId,
      };
      batches[broadField].candidates.push(lead);
    }
  }
  for (const queue of Object.values(batches)) queue.candidates.sort((a, b) => b.cited - a.cited);
  const output = {
    pipelineVersion: 3, source: API_URL, extractedAt: new Date().toISOString(), query: { surnames, pagesPerSurname: pages, includeEconomics },
    method: 'OpenAlex author text-search by Vietnamese surname plus a Vietnamese given/middle-name token; at least three works; a 2024-or-later non-Vietnam education, government, nonprofit, or facility affiliation; field from highest-count OpenAlex topic; conservative roster-token deduplication. These are unverified discovery leads, not appointment evidence.',
    reviewInstructions: 'For each pending lead, resolve identity and independently verify a current eligible appointment, track, institution type, and reliable evidence before adding. OpenAlex affiliations can be stale and do not establish faculty status. Preserve included/excluded/duplicate/unresolved statuses and notes on reruns.',
    batches,
  };
  await writeFile(LEADS_FILE, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${seen.size} unique searched authors into ${LEADS_FILE}`);
  for (const field of broadFields) console.log(`${field}: ${batches[field].candidates.length}`);
}
main().catch((error: unknown) => { console.error(error); process.exit(1); });
