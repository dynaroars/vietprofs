/**
 * Follow verified personal homepages and linked CVs, extracting education and image candidates.
 * Results are merged into education-results.json for the existing validation/apply pipeline.
 * Usage: node scripts/fetch-homepage-education.mjs --batch-file /tmp/homepage-batch.json
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i < 0 ? null : args[i + 1]; };
const batchFile = getArg('--batch-file');
if (!batchFile) throw new Error('Missing --batch-file');
const batch = JSON.parse(readFileSync(resolve(ROOT, batchFile), 'utf8'));
const homepageResults = JSON.parse(readFileSync(resolve(ROOT, 'scripts/homepage-results.json'), 'utf8'));
const homepageEducationFile = resolve(ROOT, 'scripts/homepage-education-results.json');
const homepageEducationResults = existsSync(homepageEducationFile) ? JSON.parse(readFileSync(homepageEducationFile, 'utf8')) : {};
const imageResultsFile = resolve(ROOT, 'scripts/homepage-image-results.json');
const imageResults = existsSync(imageResultsFile) ? JSON.parse(readFileSync(imageResultsFile, 'utf8')) : {};
const tempDir = mkdtempSync('/tmp/vietprofs-homepage-');

const ANCHOR = /\b(University|Institute|College|School|Polytechnic|Academy|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice|NUS\b|VNU\b|Penn State|State University|Technology)\b/i;
const YEAR = /\b(19[5-9]\d|20[0-2]\d)\b/g;

async function fetchResource(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)', Accept: '*/*' },
    });
    if (!response.ok) return null;
    const type = response.headers.get('content-type') || '';
    return { type, bytes: Buffer.from(await response.arrayBuffer()), url: response.url };
  } catch { return null; } finally { clearTimeout(timer); }
}

function cleanText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|li|div|td|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .split('\n').map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

function institutionFrom(text) {
  const normalized = text.replace(/\s+/g, ' ').trim().replace(/^[-•*\s]+/, '');
  const match = normalized.match(/((?:The\s+)?(?:University|Institute|College|School|Polytechnic|Academy|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice|Penn State|NUS|VNU|[A-Z][\w&.-]*\s+State University)[^.;|]{0,100})/i);
  if (!match) return null;
  const value = match[1]
    .replace(/\s*(?:,|-)?\s*(?:19|20)\d\d(?:\s*[-–]\s*(?:19|20)\d\d)?\s*$/, '')
    .replace(/[,:;|.)]+$/, '').trim();
  if (value.length < 6 || value.length > 110 || !ANCHOR.test(value)) return null;
  if (/^(?:School|College)\s+of\s+(?:Computer|Engineering|Medicine|Arts|Science)/i.test(value)) return null;
  return value;
}

function extractDegrees(lines) {
  const out = { phd: null, ms: null, ug: null };
  let inEducation = false;
  const stopSection = /^(?:experience|employment|professional experience|research experience|work experience|appointments|publications|awards|honors|service|teaching|skills|references|advising|selected publications|grants)\b/i;
  const definitions = [
    ['phd', /ph\.?\s*d\.?|doctor(?:ate|al)?(?:\s+of\s+philosophy)?|d\.?phil/i],
    ['ms', /m\.?\s*s\.?|m\.?\s*sc\.?|m\.?\s*eng\.?|master(?:'s)?/i],
    ['ug', /b\.?\s*s\.?|b\.?\s*sc\.?|b\.?\s*eng\.?|bachelor|undergraduate/i],
  ];
  for (let i = 0; i < lines.length; i++) {
    if (/^(?:education|academic background|educational background|degrees)\b/i.test(lines[i])) {
      inEducation = true;
      continue;
    }
    if (inEducation && stopSection.test(lines[i])) {
      inEducation = false;
      continue;
    }
    if (!inEducation) continue;
    for (const [type, signal] of definitions) {
      if (out[type] || !signal.test(lines[i])) continue;
      // Ignore awards, dissertation titles, and publication prose containing degree
      // abbreviations. Actual CV education entries put the institution on the same
      // line, immediately before the degree, or immediately after it.
      if (/award|dissertation|thesis|publication|advisor|student|fellowship/i.test(lines[i])) continue;
      const context = lines.slice(Math.max(0, i - 1), Math.min(i + 2, lines.length));
      const combined = context.join(' | ');
      const inst = context.map(institutionFrom).find((value) => value && !/^(?:Education|Education and Research|Department|School|College)\b/i.test(value));
      if (!inst) continue;
      const years = [...combined.matchAll(YEAR)].map((m) => Number(m[1]));
      const year = years.find((value) => value >= 1950 && value <= new Date().getFullYear()) ?? null;
      out[type] = { inst, year, sourceLine: lines[i] };
    }
  }
  return out;
}

function imageCandidates(html, sourceUrl) {
  const found = [];
  const re = /<img\b[^>]*>/gi;
  for (const tag of html.matchAll(re)) {
    const src = tag[0].match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (!src) continue;
    let url; try { url = new URL(src, sourceUrl).href; } catch { continue; }
    const alt = tag[0].match(/\balt=["']([^"']*)["']/i)?.[1] ?? '';
    if (/logo|icon|button|banner|social|map/i.test(`${alt} ${url}`)) continue;
    let score = /profile|portrait|headshot|avatar|author|photo|faculty/i.test(`${alt} ${url}`) ? 3 : 1;
    found.push({ url, alt, score });
  }
  return [...new Map(found.map((x) => [x.url, x])).values()].sort((a, b) => b.score - a.score).slice(0, 5);
}

function selectedSources(name) {
  const candidates = homepageResults[name]?.candidates ?? [];
  return candidates.filter((candidate) => {
    const label = candidate.label.trim();
    return /homepage|personal website|bio\/?personal|^home$|^website$|curriculum vitae|\bcv\b/i.test(label);
  }).slice(0, 4);
}

try {
  for (const entry of batch) {
    const sources = selectedSources(entry.name);
    const extracted = { phd: null, ms: null, ug: null };
    const images = [];
    for (const source of sources) {
      const resource = await fetchResource(source.url);
      if (!resource) continue;
      let lines = [];
      const isPdf = /pdf/i.test(resource.type) || /\.pdf(?:$|\?)/i.test(source.url);
      if (isPdf) {
        const file = resolve(tempDir, `${encodeURIComponent(entry.name)}.pdf`);
        writeFileSync(file, resource.bytes);
        try { lines = execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' }).split('\n').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean); } catch { /* not a readable PDF */ }
      } else {
        const html = resource.bytes.toString('utf8');
        lines = cleanText(html);
        images.push(...imageCandidates(html, resource.url));
      }
      // Restrict automatic degree merging to CV/PDF sources. Homepage prose often
      // mentions universities, awards, or students without describing the faculty
      // member's own degree history.
      const found = isPdf ? extractDegrees(lines) : { phd: null, ms: null, ug: null };
      if (found.phd && !extracted.phd) extracted.phd = found.phd;
      if (found.ms && !extracted.ms) extracted.ms = found.ms;
      if (found.ug && !extracted.ug) extracted.ug = found.ug;
    }
    const homepageFinding = { _homepageSource: true };
    for (const [type, key] of [['phd', 'phd'], ['ms', 'ms'], ['ug', 'undergrad']]) {
      if (!extracted[type]) continue;
      homepageFinding[`${key}Institution`] = extracted[type].inst;
      if (extracted[type].year) homepageFinding[`${key}Year`] = extracted[type].year;
    }
    homepageFinding.sources = sources.map((source) => source.url);
    homepageEducationResults[entry.name] = homepageFinding;
    imageResults[entry.name] = [...new Map(images.map((x) => [x.url, x])).values()].slice(0, 5);
    process.stdout.write(`${entry.name}: ${extracted.phd?.inst ?? '-'} | ${extracted.ms?.inst ?? '-'} | ${extracted.ug?.inst ?? '-'} | images=${imageResults[entry.name].length}\n`);
  }
  writeFileSync(homepageEducationFile, JSON.stringify(homepageEducationResults, null, 2) + '\n');
  writeFileSync(imageResultsFile, JSON.stringify(imageResults, null, 2) + '\n');
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
