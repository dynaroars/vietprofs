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

// High-frequency primary and secondary Vietnamese surnames
const surnames = [
  'Nguyen', 'Tran', 'Le', 'Pham', 'Vo', 'Vu', 'Bui', 'Do', 'Phan', 'Lai', 'Huynh', 'Duong', 'Truong', 'Dang', 'Ngo', 'Mai', 'Dao',
  'Dinh', 'Trinh', 'Cao', 'Doan', 'Vuong', 'Nghiem', 'Luu', 'Phung', 'Ta', 'To', 'Ho', 'Lam', 'Ly', 'Chau', 'Bach', 'Ha', 'Diep', 'Quach', 'Kieu', 'Mac', 'Khuong', 'La', 'Ton That'
];

// High-specificity Vietnamese given names to find scholars with hyphenated/Western surnames
const givenNames = [
  'Quoc', 'Duy', 'Khang', 'Hieu', 'Kien', 'Tung', 'Triet', 'Bao', 'Phuong', 'Thao', 'Giang', 'Trang', 'Viet', 'Thanh', 'Tuan', 'Hung', 'Cuong', 'Xuan', 'Thuan', 'Nhat', 'Quyen', 'Linh', 'Huyen', 'Manh', 'Duc'
];

const allSurnamesSet = new Set(surnames.map((s) => s.toLowerCase().replace(/[^a-z]/g, '')));

// A surname alone is much too broad internationally (especially Le, Do, Mai, and Dang). This is
// deliberately a discovery lexicon, not an identity determination: a candidate still needs
// identity-resolved appointment evidence before inclusion.
const vietnameseNameTokens = new Set([
  'anh', 'bach', 'bao', 'binh', 'cam', 'cao', 'chau', 'chinh', 'cuong', 'diep', 'dinh', 'doan', 'duc', 'duy',
  'giang', 'ha', 'hai', 'han', 'hanh', 'hau', 'hien', 'hiep', 'hieu', 'ho', 'hoa', 'hoai', 'hoang', 'hong',
  'hung', 'huong', 'huu', 'huy', 'huyen', 'khai', 'khanh', 'khang', 'khiem', 'khoa', 'khuong', 'kieu', 'kien',
  'kim', 'la', 'lam', 'lan', 'lap', 'le', 'lien', 'liem', 'linh', 'loc', 'loi', 'long', 'luan', 'luu', 'ly',
  'mac', 'mai', 'manh', 'minh', 'my', 'nam', 'ngan', 'nghia', 'nghiem', 'ngoc', 'nhat', 'nhu', 'nhung', 'phat',
  'phu', 'phuc', 'phung', 'phuoc', 'phuong', 'quach', 'quang', 'quan', 'quoc', 'quyen', 'quynh', 'sang', 'son',
  'ta', 'tai', 'tam', 'tan', 'thang', 'thanh', 'thai', 'thao', 'thi', 'thien', 'thinh', 'thuan', 'thuy', 'to',
  'toan', 'ton', 'trang', 'tri', 'triet', 'trinh', 'truc', 'trung', 'tu', 'tuan', 'tung', 'tuyet', 'van',
  'viet', 'vinh', 'vuong', 'xuan', 'yen'
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

const diacriticSurnames = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Võ', 'Vũ', 'Bùi', 'Đỗ', 'Phan', 'Huỳnh', 'Dương', 'Trương', 'Đặng', 'Ngô', 'Đào',
  'Đinh', 'Trịnh', 'Cao', 'Đoàn', 'Vương', 'Nghiêm', 'Lưu', 'Phùng', 'Tạ', 'Tô', 'Hồ', 'Lâm', 'Lý', 'Châu', 'Bạch', 'Hà', 'Diệp'
];

const args = process.argv.slice(2);
const pagesArg = args.indexOf('--pages');
const pages = Math.max(1, Math.min(10, Number(pagesArg === -1 ? 1 : args[pagesArg + 1]) || 1));
const apiKeyArg = args.indexOf('--api-key');
const apiKey = process.env.OPENALEX_API_KEY || (apiKeyArg !== -1 ? args[apiKeyArg + 1] : '');
const includeEconomics = args.includes('--include-economics');
const surnamesOnly = args.includes('--surnames-only');
const givenNamesOnly = args.includes('--given-names-only');
const diacriticsOnly = args.includes('--diacritics-only');
const includeDiacritics = diacriticsOnly || args.includes('--include-diacritics');
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
let globalQuotaExhausted = false;

async function fetchQuery(query: string, maxPages: number): Promise<Author[]> {
  const authors: Author[] = [];
  let cursor = '*';
  const apiKeyParam = apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : '';
  for (let page = 0; page < maxPages && cursor && !globalQuotaExhausted; page++) {
    const url = `${API_URL}?search=${encodeURIComponent(query)}&per-page=200&cursor=${encodeURIComponent(cursor)}&mailto=vietprofs@roars.dev${apiKeyParam}`;
    let response: Response | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const headers: Record<string, string> = { 'User-Agent': 'VietProfs-Discovery/1.0 (mailto:vietprofs@roars.dev)' };
        if (apiKey) {
          headers['api_key'] = apiKey;
        }
        response = await fetch(url, { headers });
        if (response.status === 429) {
          const retryAfter = Number(response.headers.get('retry-after')) || 0;
          if (retryAfter > 120) {
            console.warn(`  [OpenAlex daily quota limit reached] Reset in ${Math.round(retryAfter / 60)} minutes (${retryAfter}s). Halting API querying.`);
            globalQuotaExhausted = true;
            break;
          }
          const delay = (attempt + 1) * 3000;
          console.warn(`  [429 rate limit] query "${query}" page ${page + 1}, waiting ${delay}ms before retry ${attempt + 1}/5...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        if (!response.ok) {
          console.warn(`  [status ${response.status}] query "${query}" page ${page + 1}, waiting 2000ms...`);
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        break;
      } catch (err) {
        console.warn(`  [network error] query "${query}": ${err}, waiting 2000ms...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    if (globalQuotaExhausted || !response || !response.ok) {
      if (!globalQuotaExhausted) {
        console.warn(`Warning: OpenAlex query "${query}" page ${page + 1} failed with status ${response?.status}`);
      }
      break;
    }
    const payload = await response.json() as { results?: Author[]; meta?: { next_cursor?: string } };
    authors.push(...(payload.results ?? []));
    cursor = payload.meta?.next_cursor ?? '';
    await new Promise((r) => setTimeout(r, 500)); // polite delay
  }
  return authors;
}

async function main() {
  const roster: Array<{ name: string; vietnameseName?: string }> = JSON.parse(await readFile(ROSTER_FILE, 'utf8'));
  let previous: Record<string, Queue> = {};
  try {
    const existing = JSON.parse(await readFile(LEADS_FILE, 'utf8')) as { pipelineVersion?: number; batches?: Record<string, Queue> };
    previous = existing.pipelineVersion && existing.pipelineVersion >= 3 ? existing.batches ?? {} : {};
  } catch { /* first run */ }
  const previousById = new Map(Object.values(previous).flatMap((queue) => queue.candidates).map((lead) => [lead.openAlexId, lead]));
  const batches: Record<string, Queue> = Object.fromEntries(
    broadFields.map((field) => [
      field,
      { candidates: [...(previous[field]?.candidates ?? [])] }
    ])
  );
  const seen = new Set<string>(
    Object.values(batches).flatMap((queue) => queue.candidates).map((lead) => lead.openAlexId)
  );

  function processAuthor(author: Author, sourceLabel: string) {
    const authorTokens = tokens(author.display_name);
    // Find Vietnamese token matches in the author's name
    const matchingTokens = [...authorTokens].filter((token) => vietnameseNameTokens.has(token));
    if (matchingTokens.length < 2) return; // Require at least 2 Vietnamese name tokens to minimize false positives

    if (seen.has(author.id) || !author.display_name || (author.works_count ?? 0) < 3) return;
    seen.add(author.id);
    const affiliation = recentEligibleAffiliation(author);
    if (!affiliation) return;
    const topic = [...(author.topics ?? [])].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))[0];
    const openAlexField = topic?.field?.display_name ?? topic?.domain?.display_name ?? 'Unknown';
    const broadField = classify(openAlexField, topic?.domain?.display_name ?? '');
    if (!includeEconomics && broadField === 'Business & Economics') return;
    const prior = previousById.get(author.id);
    const rosterMatch = roster.find((person) => samePerson(tokens(author.display_name), tokens(person.name)) ||
      (person.vietnameseName ? samePerson(tokens(author.display_name), tokens(person.vietnameseName)) : false));
    const lead: Lead = {
      openAlexId: author.id, name: author.display_name, aliases: author.raw_author_names ?? [], sourceSurname: sourceLabel,
      nameSignal: matchingTokens.join(' + '),
      institution: affiliation.institution.display_name ?? 'Unknown', country: affiliation.institution.country_code ?? '',
      institutionType: affiliation.institution.type ?? '', affiliationYears: affiliation.years,
      broadField, openAlexField, primaryTopic: topic?.display_name ?? 'Unknown', works: author.works_count ?? 0,
      cited: author.cited_by_count ?? 0, status: prior?.status ?? (rosterMatch ? 'duplicate' : 'pending'),
      note: prior?.note ?? (rosterMatch ? `Possible roster match: ${rosterMatch.name}. Verify identity before treating as duplicate.` : undefined),
      rosterId: prior?.rosterId,
    };
    batches[broadField].candidates.push(lead);
  }

  // 1. Search by primary and secondary surnames
  if (!givenNamesOnly && !diacriticsOnly) {
    for (const surname of surnames) {
      if (globalQuotaExhausted) break;
      console.log(`Fetching OpenAlex authors matching surname: ${surname}...`);
      for (const author of await fetchQuery(surname, pages)) {
        processAuthor(author, surname);
      }
    }
  }

  // 2. Search by distinct Vietnamese given names
  if (!surnamesOnly && !diacriticsOnly) {
    for (const given of givenNames) {
      if (globalQuotaExhausted) break;
      console.log(`Fetching OpenAlex authors matching given name: ${given}...`);
      for (const author of await fetchQuery(given, 1)) {
        processAuthor(author, given);
      }
    }
  }

  // 3. Search with full diacritic strings
  if (includeDiacritics) {
    for (const diacritic of diacriticSurnames) {
      if (globalQuotaExhausted) break;
      console.log(`Fetching OpenAlex authors matching diacritics: ${diacritic}...`);
      for (const author of await fetchQuery(diacritic, 1)) {
        processAuthor(author, diacritic);
      }
    }
  }

  for (const queue of Object.values(batches)) queue.candidates.sort((a, b) => b.cited - a.cited);
  const output = {
    pipelineVersion: 4, source: API_URL, extractedAt: new Date().toISOString(), query: { surnames, givenNames, pagesPerSurname: pages, includeEconomics },
    method: 'OpenAlex author text-search by expanded Vietnamese surnames, high-specificity given names, and diacritics; minimum 2 Vietnamese name tokens co-occurrence; at least three works; recent non-Vietnam affiliation at higher education, government, nonprofit, or research facility; topic classification; conservative roster deduplication.',
    reviewInstructions: 'For each pending lead, resolve identity and independently verify a current eligible appointment, track, institution type, and reliable evidence before adding. OpenAlex affiliations can be stale and do not establish faculty status. Preserve included/excluded/duplicate/unresolved statuses and notes on reruns.',
    batches,
  };
  await writeFile(LEADS_FILE, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${seen.size} unique searched authors into ${LEADS_FILE}`);
  for (const field of broadFields) console.log(`${field}: ${batches[field].candidates.length} total`);
}
main().catch((error: unknown) => { console.error(error); process.exit(1); });
