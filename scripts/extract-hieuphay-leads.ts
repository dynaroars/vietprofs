#!/usr/bin/env -S npx --no-install tsx
// Extracts researcher leads from the interactive "Bản đồ nghiên cứu kinh tế Việt Nam"
// (Map of Vietnamese Economics Research) at https://hieuphay.com/ban-do-kinh-te-viet-nam/.
//
// The page has no API: it embeds a gzip+base64 blob (~20MB decompressed JSON) directly in a
// <script> tag, decoded and rendered client-side onto a <canvas>. This script fetches the page,
// pulls out that blob, decompresses it, and reads its `units.researchers.table` — a columnar
// table (parallel arrays, several base64-packed as typed arrays) covering ~21k researchers whom
// the site's own name classifier identified as Vietnamese, each tagged with a `loc` code:
//   0 = in Vietnam, 1 = diaspora abroad, 2 = foreign/Vietnam-linked, 3 = unknown location
// and an `econ` flag (1 = economics-focused). See the page's own methodology note: it says its
// name classifier was validated against Chinese, Korean, Indian, Thai, and Japanese name samples
// — the same practice ROSTER_MAINTENANCE.md's name-lexicon-safety section recommends.
//
// This gives free `loc==1 & econ==1` filtering that would otherwise require a manual
// surname/given-name web-search sweep (see ROSTER_MAINTENANCE.md's "Research workflow"). It is
// still only a source of unverified leads: each candidate still needs the full inclusion-standard
// verification (current university appointment, track, official source) before being added.
//
// Usage: ./scripts/extract-hieuphay-leads.ts
// Writes/updates maintenance/hieuphay-leads.json, preserving the status of any lead already
// present (pending/included/excluded/duplicate) and only appending genuinely new leads.

import { gunzipSync } from 'node:zlib';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SOURCE_URL = 'https://hieuphay.com/ban-do-kinh-te-viet-nam/';
const LEADS_FILE = resolve('maintenance/hieuphay-leads.json');
const ROSTER_FILE = resolve('public/data.json');

interface ResearcherTable {
  n: number;
  name: string; // newline-separated
  instDict: string[];
  inst: string; // base64 uint16 indices into instDict
  countryDict: string[];
  country: string; // base64 uint16 indices into countryDict
  loc: string; // base64 uint8: 0 domestic, 1 diaspora abroad, 2 foreign/VN-linked, 3 unknown
  econ: string; // base64 uint8: 1 = economics-focused
  npapers: string; // base64 uint16
  cited: string; // base64 uint32
}

function b64ToUint16(s: string): number[] {
  const buf = Buffer.from(s, 'base64');
  const out: number[] = [];
  for (let i = 0; i + 1 < buf.length; i += 2) out.push(buf.readUInt16LE(i));
  return out;
}

function b64ToUint8(s: string): number[] {
  return Array.from(Buffer.from(s, 'base64'));
}

function b64ToUint32(s: string): number[] {
  const buf = Buffer.from(s, 'base64');
  const out: number[] = [];
  for (let i = 0; i + 3 < buf.length; i += 4) out.push(buf.readUInt32LE(i));
  return out;
}

// Institution strings that indicate a non-university employer (hospitals, government agencies,
// central banks, NGOs, think tanks, companies). A university-track roster addition needs a
// current university appointment, so these are filtered out at the lead stage rather than left
// for every downstream verifier to re-notice.
const NON_UNI_HINTS = [
  'world bank', 'oecd', 'organisation de coop', 'united states', 'u.s.', 'federal reserve',
  'census bureau', 'food and drug', 'hospital', 'clinic', 'bank of', 'imf',
  'international monetary', 'ministry', 'national bureau of economic research',
  'centre national de la recherche', 'cnrs', 'institute of', 'ird', 'ihe', 'embassy',
  'consult', 'inc.', 'corp', 'company', 'llc', 'ltd', 'foundation', 'ngo ', 'ngo(',
  'unesco', 'unicef', 'who ', 'asian development bank', 'motu economic',
];

function looksLikeUniversity(inst: string): boolean {
  if (!inst) return false;
  const low = inst.toLowerCase();
  if (NON_UNI_HINTS.some((h) => low.includes(h))) return false;
  return (
    low.includes('university') ||
    low.includes('college') ||
    low.includes('school of') ||
    low.includes('institute of technology') ||
    low.includes('polytechnic')
  );
}

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function nameTokens(s: string): Set<string> {
  return new Set(
    stripDiacritics(s)
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1),
  );
}

async function main() {
  console.log(`Fetching ${SOURCE_URL} ...`);
  const res = await fetch(SOURCE_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const html = await res.text();

  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const dataScript = scripts.find((s) => s.trim().startsWith('H4sI'));
  if (!dataScript) throw new Error('could not find the embedded gzip+base64 data blob');

  const decompressed = gunzipSync(Buffer.from(dataScript.trim(), 'base64'));
  const payload = JSON.parse(decompressed.toString('utf8'));
  const table: ResearcherTable = payload.units.researchers.table;
  console.log(`Decoded ${table.n} researchers (dataset version ${payload.meta?.version}, built ${payload.meta?.built}).`);

  const names = table.name.split('\n');
  const instIdx = b64ToUint16(table.inst);
  const countryIdx = b64ToUint16(table.country);
  const loc = b64ToUint8(table.loc);
  const econ = b64ToUint8(table.econ);
  const npapers = b64ToUint16(table.npapers);
  const cited = b64ToUint32(table.cited);

  const roster: Array<{ name: string; vietnameseName?: string }> = JSON.parse(await readFile(ROSTER_FILE, 'utf8'));
  const rosterTokenSets = roster.flatMap((p) => [p.name, p.vietnameseName].filter((v): v is string => !!v).map(nameTokens));
  // A name match counts only when the smaller side has at least two tokens: a bare single-token
  // overlap (e.g. "Nguyen") is noise, but "Khuong Vu" vs. the roster's "Minh Khuong Vu" (or vice
  // versa, in either name order) is a real duplicate worth catching before it becomes a lead.
  const isSubset = (small: Set<string>, big: Set<string>) => small.size >= 2 && [...small].every((t) => big.has(t));
  const alreadyInRoster = (candidateTokens: Set<string>) =>
    rosterTokenSets.some((rt) => isSubset(candidateTokens, rt) || isSubset(rt, candidateTokens));

  let existingLeads: Array<Record<string, unknown>> = [];
  try {
    existingLeads = JSON.parse(await readFile(LEADS_FILE, 'utf8')).candidates ?? [];
  } catch {
    // First run: no existing leads file yet.
  }
  const existingByKey = new Map(existingLeads.map((l) => [`${l.name}|${l.inst}`, l]));

  const seenThisRun = new Set<string>();
  const candidates: Array<Record<string, unknown>> = [];
  for (let i = 0; i < table.n; i++) {
    if (loc[i] !== 1 || econ[i] !== 1) continue; // diaspora abroad, economics-focused only
    const inst = table.instDict[instIdx[i]] ?? '';
    if (!looksLikeUniversity(inst)) continue;
    const name = names[i];

    const key = `${name}|${inst}`;
    if (seenThisRun.has(key)) continue; // the site itself sometimes splits one person across OpenAlex IDs
    seenThisRun.add(key);

    const existing = existingByKey.get(key);
    // A previously recorded terminal status (a human verified this one way or the other) always
    // wins over the automatic roster-token-subset check below, which is a coarse heuristic (a
    // 2-token overlap can coincidentally match an unrelated person) meant only to keep obvious
    // re-additions out of the *pending* queue, not to overrule a real verification.
    let status = existing?.status ?? 'pending';
    if (status === 'pending' && alreadyInRoster(nameTokens(name))) status = 'duplicate';

    candidates.push({
      name,
      inst,
      country: table.countryDict[countryIdx[i]] ?? '',
      npapers: npapers[i],
      cited: cited[i],
      status,
      note: existing?.note,
      rosterId: existing?.rosterId,
    });
  }

  candidates.sort((a, b) => (b.cited as number) - (a.cited as number));

  const out = {
    source: SOURCE_URL,
    extractedAt: new Date().toISOString(),
    datasetVersion: payload.meta?.version,
    datasetBuilt: payload.meta?.built,
    method:
      'loc==1 (diaspora abroad) & econ==1 (economics-focused) from the site\'s own name/location ' +
      'classifier, filtered to institution strings that look like a university, deduplicated ' +
      'against public/data.json by order-independent name-token match. Sorted by citation count ' +
      'descending as a rough proxy for verification priority. See ROSTER_MAINTENANCE.md\'s ' +
      '"hieuphay.com lead queue" section for the resumable review workflow.',
    total: candidates.length,
    candidates,
  };

  await writeFile(LEADS_FILE, `${JSON.stringify(out, null, 2)}\n`);
  const statusCounts = candidates.reduce<Record<string, number>>((acc, c) => {
    const s = c.status as string;
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`Wrote ${candidates.length} leads to ${LEADS_FILE}`);
  console.log(statusCounts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
