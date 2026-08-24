/**
 * fetch-education.mjs
 *
 * Fetches each professor's profile page and tries to extract:
 *   - phdInstitution, phdYear, phdMajor
 *   - msInstitution, msYear, msMajor
 *   - undergradInstitution, undergradYear, undergradMajor
 *
 * Usage:
 *   node scripts/fetch-education.mjs [--offset N] [--limit N] [--missing-only] [--force-refetch]
 *
 * Results are saved incrementally to scripts/education-results.json.
 * Run apply-education.mjs afterwards to merge into data.json.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_FILE  = resolve(ROOT, 'public/data.json');
const RESULTS_FILE = resolve(ROOT, 'scripts/education-results.json');

// ─── CLI args ─────────────────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const getArg    = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const OFFSET    = parseInt(getArg('--offset') ?? '0',     10);
const LIMIT     = parseInt(getArg('--limit')  ?? '99999', 10);
const MISSING_ONLY   = args.includes('--missing-only');
const FORCE_REFETCH  = args.includes('--force-refetch');

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchPage(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)', Accept: 'text/html' },
      redirect: 'follow',
    });
    clearTimeout(t);
    return r.ok ? await r.text() : null;
  } catch { clearTimeout(t); return null; }
}

// ─── HTML → clean lines ───────────────────────────────────────────────────────
function toLines(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|li|div|td|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g,  ' ')
    .replace(/&amp;/g,   '&')
    .replace(/&lt;/g,    '<')
    .replace(/&gt;/g,    '>')
    .replace(/&#\d+;/g,  '')
    .replace(/&[a-z]+;/g,' ')
    .split('\n')
    .map(l => l.replace(/\s{2,}/g, ' ').trim())
    .filter(l => l.length > 0);
}

// ─── Plausibility checks ──────────────────────────────────────────────────────
const JUNK_RE = /YouTube|Facebook|Twitter|Instagram|LinkedIn|Subscribe|Cookie|Privacy|Copyright|©|\bFollow\b|\bContact Us\b|\bCampus Map\b|\bJobs @|\bTechAlert\b|\bsitemap\b|404|login|sign in|\bClose\b|\bMenu\b|\bSearch\b|\bSkip to\b|Accessibility/i;

function stripLeadingJunk(s) {
  return s
    .replace(/^\s*(?:at\s+the\s+|at\s+|from\s+the\s+|from\s+|in\s+the\s+|in\s+)\s*/i, '')
    .replace(/[.!?,;]+$/, '')
    .trim();
}
function okInst(s) {
  if (!s || typeof s !== 'string') return false;
  const t = s.trim();
  if (t.length < 4 || t.length > 100) return false;
  if (t.split(/\s+/).length > 10) return false;
  if (JUNK_RE.test(t)) return false;
  if (!/[A-Z]/.test(t)) return false;  // must have at least one capital
  // Reject sentence fragments: ". In", ". He", etc.
  if (/\.\s+[A-Z][a-z]/.test(t)) return false;
  return true;
}
function okMajor(s) {
  if (!s || typeof s !== 'string') return false;
  const t = s.trim();
  if (t.length < 2 || t.length > 80) return false;
  if (t.split(/\s+/).length > 7) return false;
  if (JUNK_RE.test(t)) return false;
  return true;
}
function okYear(y) {
  return Number.isInteger(y) && y >= 1950 && y <= new Date().getFullYear();
}

function clean(s) {
  return s?.replace(/[,;.]+$/, '').replace(/\s{2,}/g, ' ').trim() || '';
}

// ─── Extraction ───────────────────────────────────────────────────────────────
// Institution anchor – we require one of these keywords for a match to count
const INST_ANCHOR = /\b(University|Institute|Universit[eé]|Institut|College|School|Polytechnic|Academy|Académie|Technolog|Facult|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice|Tulane|Northwestern|Dartmouth|Brown|Vanderbilt|EPFL|ETH |NUS\b|KAIST|Kyoto|Tokyo|HUST\b|VNU\b)/i;
const YEAR_RE = /\b(19[5-9]\d|20[0-2]\d)\b/;

/**
 * Given a line of text, try to extract education info for a specific degree type.
 * Returns { inst, year, major } or null.
 *
 * Supported formats (examples):
 *   Ph.D. in Computer Science, Stanford University, 2020
 *   Ph.D., Stanford University, 2020
 *   Ph.D., University of Chicago, Computer Science
 *   Ph.D. in Mathematics (2000) - Advisor: ... Queen's University
 *   Ph.D, Computer Engineering University of Florida, USA 2008 - 2013
 *   Doctor of Philosophy in X from Y (Year)
 *   Stanford University, Ph.D. 2020
 *   B.S. in Computer Science, Vietnam National University, 2010
 *   B.Sc. (Hons) in Mathematics (1996) - ... Curtin University of Technology
 *   Bachelor of Science, MIT, 2005
 *   B.S., MIT, 2005
 *   Undergraduate: Vietnam National University
 */
function parseLine(line, degreeType) {
  // degreeType: 'phd' | 'ms' | 'ug'

  const PHD_SIGNAL = /Ph\.?D\.?|Doctor(?:al|ate)?(?:\s+of\s+Philosophy)?|D\.?Phil\.?/i;
  const MS_SIGNAL  = /M\.?S\.?|M\.?Sc\.?|Master(?:'s)?(?:\s+of\s+\w+)?/i;
  const UG_SIGNAL  = /\bB\.?[SA]c?\.?\b|\bBachelor|undergraduate\b/i;

  const signal = degreeType === 'phd' ? PHD_SIGNAL : degreeType === 'ms' ? MS_SIGNAL : UG_SIGNAL;
  if (!signal.test(line)) return null;
  if (!INST_ANCHOR.test(line)) {
    // Maybe institution is on a separate nearby line — caller will handle that
    return { partial: true, hasSignal: true };
  }

  let inst = null, year = null, major = null;

  // Extract year(s) — take the first plausible year
  const years = [...line.matchAll(/\b(19[5-9]\d|20[0-2]\d)\b/g)].map(m => parseInt(m[1]));
  year = years.find(okYear) ?? null;

  // Try various structural patterns ─────────────────────────────────────────

  // Pattern 1: "Ph.D. in MAJOR, INSTITUTION, YEAR" or "B.S. in MAJOR, INSTITUTION, YEAR"
  let m = line.match(/(?:Ph\.?D\.?|M\.?S\.?|M\.?Sc\.?|B\.?[SA]c?\.?|Bachelor(?:'s)?(?:\s+of\s+\w+)?|Master(?:'s)?(?:\s+of\s+\w+)?)\s+in\s+([\w\s\/&()-]{2,40}?)\s*,\s*([\w\s,'-]{4,80}?)\s*(?:,\s*(?:19|20)\d\d)?$/i);
  if (m && INST_ANCHOR.test(m[2])) {
    major = clean(m[1]);
    inst  = stripLeadingJunk(clean(m[2]));
    if (okInst(inst)) return { inst, year, major: okMajor(major) ? major : null };
  }

  // Pattern 2: "Ph.D./B.S., INSTITUTION, YEAR" (no major)
  m = line.match(/(?:Ph\.?D\.?|D\.?Phil\.?|M\.?S\.?|M\.?Sc\.?|Master|B\.?[SA]c?\.?|Bachelor)\s*[,. ]+\s*([\w\s,'-]{4,80}?)\s*(?:[,. ]+(?:19|20)\d\d|$)/i);
  if (m && INST_ANCHOR.test(m[1])) {
    inst = stripLeadingJunk(clean(m[1]));
    if (okInst(inst)) return { inst, year, major: null };
  }

  // Pattern 3: "Ph.D., INSTITUTION, MAJOR" (institution before major)
  // e.g. "Ph.D., University of Chicago, Computer Science"
  m = line.match(/(?:Ph\.?D\.?|D\.?Phil\.?|M\.?S\.?|M\.?Sc\.?|Master)\s*[,. ]+\s*([\w\s,'-]{4,80}?)\s*[,. ]+\s*([\w\s\/&()-]{2,40}?)\s*$/i);
  if (m && INST_ANCHOR.test(m[1])) {
    inst  = stripLeadingJunk(clean(m[1]));
    major = clean(m[2]);
    if (okInst(inst)) return { inst, year, major: okMajor(major) ? major : null };
  }

  // Pattern 4: "Ph.D. in MAJOR (YEAR) ... INSTITUTION"
  // e.g. "Ph.D. in Mathematics (2000) - Advisor: A.V. Geramita Queen's University , Canada"
  m = line.match(/(?:Ph\.?D\.?|M\.?S\.?|M\.?Sc\.?|Master|B\.?[SA]c?\.?|Bachelor)\s+in\s+([\w\s\/&()-]{2,40}?)\s*\((\d{4})\).*?((?:University|College|Institute|Polytechnic|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice)[^,\n]{0,60})/i);
  if (m) {
    major = clean(m[1]);
    year  = okYear(parseInt(m[2])) ? parseInt(m[2]) : year;
    inst  = stripLeadingJunk(clean(m[3]));
    if (okInst(inst)) return { inst, year, major: okMajor(major) ? major : null };
  }

  // Pattern 5: Reversed — INSTITUTION, Ph.D. YEAR
  // e.g. "Stanford University, Ph.D. 2020"
  m = line.match(/([\w\s,'-]{4,80}?)\s*,\s*(?:Ph\.?D\.?|M\.?S\.?|M\.?Sc\.?|Master|B\.?[SA]c?\.?)\s*,?\s*(\d{4})?/i);
  if (m && INST_ANCHOR.test(m[1])) {
    inst = stripLeadingJunk(clean(m[1]));
    if (m[2] && okYear(parseInt(m[2]))) year = parseInt(m[2]);
    if (okInst(inst)) return { inst, year, major: null };
  }

  // Pattern 6: MAJOR INSTITUTION YEAR (no comma between major and institution)
  // e.g. "Ph.D, Computer Engineering University of Florida, USA 2008 - 2013"
  m = line.match(/(?:Ph\.?D\.?|M\.?S\.?|M\.?Sc\.?|Master|B\.?[SA]c?\.?)\s*[,.]?\s*([\w\s\/&()-]{2,30}?)\s+((?:University|Institute|College|School|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice|Hanoi|Vietnam|Ho Chi Minh)[^,\n]{0,60}?)(?:[,. ]+(?:19|20)\d\d|$)/i);
  if (m) {
    const candMajor = clean(m[1]);
    const candInst  = stripLeadingJunk(clean(m[2]));
    if (okInst(candInst) && !INST_ANCHOR.test(candMajor)) {
      inst  = candInst;
      major = okMajor(candMajor) ? candMajor : null;
      if (okInst(inst)) return { inst, year, major };
    }
  }

  return null;
}

/**
 * Find education section, then parse line-by-line.
 * Returns { phd, ms, ug }, where each value is {inst,year,major}|null.
 */
function extractEducation(lines) {
  // Find education section boundary
  const EDU_HEADER = /^(Education|Academic\s+Background|Training|Degrees?|Qualifications?|Academic\s+Credentials?)\s*:?\s*$/i;
  const NEXT_SECTION = /^(Experience|Employment|Positions?|Research|Awards?|Honors?|Publications?|Interests?|Activities|Service|Teaching|Professional|Appointments?|Grants?|Projects?|Skills?|About\s+Me|News|Bio|Courses?)\s*:?\s*$/i;

  let sectionStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (EDU_HEADER.test(lines[i])) { sectionStart = i + 1; break; }
  }
  let sectionEnd = lines.length;
  if (sectionStart >= 0) {
    for (let i = sectionStart; i < lines.length; i++) {
      if (NEXT_SECTION.test(lines[i]) && i > sectionStart + 2) { sectionEnd = i; break; }
    }
  }

  // Priority search order: education section first, then full page
  const searchRanges = sectionStart >= 0
    ? [[sectionStart, sectionEnd], [0, lines.length]]
    : [[0, lines.length]];

  let phd = null, ms = null, ug = null;

  for (const [lo, hi] of searchRanges) {
    const slice = lines.slice(lo, hi);

    for (let i = 0; i < slice.length; i++) {
      const line = slice[i];

      // Try PhD on this line
      if (!phd) {
        const r = parseLine(line, 'phd');
        if (r && !r.partial) {
          phd = r;
        } else if (r?.partial) {
          // Institution might be on an adjacent line
          for (let j = i + 1; j <= Math.min(i + 3, slice.length - 1); j++) {
            const next = slice[j];
            if (INST_ANCHOR.test(next) && next.length < 150) {
              const instMatch = next.match(/^((?:[\w'-]+\s*){0,4}(?:University|Institute|College|Polytechnic|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice|Northwestern|Dartmouth|Brown|Vanderbilt|Hanoi|Vietnam)[^,\n]{0,60})/i);
              if (instMatch) {
                const inst = stripLeadingJunk(clean(instMatch[1]));
                const yearM = [...next.matchAll(/\b(19[5-9]\d|20[0-2]\d)\b/g)].map(m => parseInt(m[1]));
                const year  = yearM.find(okYear) ?? null;
                if (okInst(inst)) { phd = { inst, year, major: null }; break; }
              }
            }
          }
        }
      }

      // Try undergrad on this line
      if (!ug) {
        const r = parseLine(line, 'ug');
        if (r && !r.partial) {
          ug = r;
        } else if (r?.partial) {
          for (let j = i + 1; j <= Math.min(i + 3, slice.length - 1); j++) {
            const next = slice[j];
            if (INST_ANCHOR.test(next) && next.length < 150) {
              const instMatch = next.match(/^((?:[\w'-]+\s*){0,4}(?:University|Institute|College|Polytechnic|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice|Northwestern|Dartmouth|Brown|Vanderbilt|Hanoi|Vietnam)[^,\n]{0,60})/i);
              if (instMatch) {
                const inst = stripLeadingJunk(clean(instMatch[1]));
                const yearM = [...next.matchAll(/\b(19[5-9]\d|20[0-2]\d)\b/g)].map(m => parseInt(m[1]));
                const year  = yearM.find(okYear) ?? null;
                if (okInst(inst)) { ug = { inst, year, major: null }; break; }
              }
            }
          }
        }
      }

      // Try master's degree on this line
      if (!ms) {
        const r = parseLine(line, 'ms');
        if (r && !r.partial) {
          ms = r;
        } else if (r?.partial) {
          for (let j = i + 1; j <= Math.min(i + 3, slice.length - 1); j++) {
            const next = slice[j];
            if (INST_ANCHOR.test(next) && next.length < 150) {
              const instMatch = next.match(/^((?:[\w'-]+\s*){0,4}(?:University|Institute|College|Polytechnic|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice|Northwestern|Dartmouth|Brown|Vanderbilt|Hanoi|Vietnam)[^,\n]{0,60})/i);
              if (instMatch) {
                const inst = stripLeadingJunk(clean(instMatch[1]));
                const yearM = [...next.matchAll(/\b(19[5-9]\d|20[0-2]\d)\b/g)].map(m => parseInt(m[1]));
                const year = yearM.find(okYear) ?? null;
                if (okInst(inst)) { ms = { inst, year, major: null }; break; }
              }
            }
          }
        }
      }

      if (phd && ms && ug) break;
    }
    if (phd && ms && ug) break;
  }

  return { phd, ms, ug };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const roster = JSON.parse(readFileSync(DATA_FILE, 'utf8'));

let existing = {};
if (existsSync(RESULTS_FILE)) {
  try { existing = JSON.parse(readFileSync(RESULTS_FILE, 'utf8')); } catch { /**/ }
}

let entries = roster;
if (MISSING_ONLY) entries = roster.filter(p => !p.phdInstitution || !p.msInstitution || !p.undergradInstitution);
entries = entries.slice(OFFSET, OFFSET + LIMIT);

console.log(`Processing ${entries.length} entries  (offset=${OFFSET} limit=${LIMIT} missing-only=${MISSING_ONLY})`);

const results = { ...existing };
let found = 0, errors = 0;

for (let i = 0; i < entries.length; i++) {
  const prof = entries[i];
  const key  = prof.name;

  if (!FORCE_REFETCH && results[key]?._processed) {
    process.stdout.write(`[${String(i+1).padStart(4)}/${entries.length}] ${key} — cached\n`);
    continue;
  }

  process.stdout.write(`[${String(i+1).padStart(4)}/${entries.length}] ${key} ... `);

  const html  = await fetchPage(prof.profileUrl);
  let phd = null, ms = null, ug = null;

  if (html) {
    const lines = toLines(html);
    ({ phd, ms, ug } = extractEducation(lines));
  } else {
    errors++;
    process.stdout.write('FETCH ERROR\n');
    results[key] = { _processed: true, _profileFetched: false,
      phdInstitution: null, phdYear: null, phdMajor: null,
      msInstitution: null, msYear: null, msMajor: null,
      undergradInstitution: null, undergradYear: null, undergradMajor: null };
    continue;
  }

  if (phd || ms || ug) {
    found++;
    const pStr = phd ? `phd=${phd.inst}(${phd.year ?? '?'})${phd.major ? ' ['+phd.major+']' : ''}` : '';
    const mStr = ms  ? ` ms=${ms.inst}(${ms.year ?? '?'})${ms.major ? ' ['+ms.major+']' : ''}` : '';
    const uStr = ug  ? ` ug=${ug.inst}(${ug.year ?? '?'})${ug.major  ? ' ['+ug.major +']' : ''}` : '';
    process.stdout.write(`✓ ${pStr}${mStr}${uStr}\n`);
  } else {
    process.stdout.write('—\n');
  }

  results[key] = {
    _processed:          true,
    _profileFetched:     true,
    phdInstitution:      phd?.inst  ?? null,
    phdYear:             phd?.year  ?? null,
    phdMajor:            phd?.major ?? null,
    msInstitution:       ms?.inst   ?? null,
    msYear:              ms?.year   ?? null,
    msMajor:             ms?.major  ?? null,
    undergradInstitution: ug?.inst  ?? null,
    undergradYear:        ug?.year  ?? null,
    undergradMajor:       ug?.major ?? null,
  };

  if (i % 20 === 0 || i === entries.length - 1) {
    writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  }

  await new Promise(r => setTimeout(r, 600));
}

writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
console.log(`\nDone. New data for ${found} entries, ${errors} fetch errors.`);
console.log(`Results saved → ${RESULTS_FILE}`);
console.log('Next: node scripts/apply-education.mjs --dry-run');
