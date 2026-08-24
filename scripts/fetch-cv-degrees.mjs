/**
 * CV-first education pass. For a batch of incomplete records, follow official
 * profile/homepage links, discover linked CVs/resumes, and extract explicit
 * degree credentials, institutions, and years.
 *
 * Usage: node scripts/fetch-cv-degrees.mjs --batch-file FILE
 */
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (flag) => { const i = args.indexOf(flag); return i < 0 ? null : args[i + 1]; };
const batchFile = arg('--batch-file');
if (!batchFile) throw new Error('Missing --batch-file');
const batch = JSON.parse(readFileSync(resolve(ROOT, batchFile), 'utf8'));
const roster = JSON.parse(readFileSync(resolve(ROOT, 'public/data.json'), 'utf8'));
const homepage = JSON.parse(readFileSync(resolve(ROOT, 'scripts/homepage-results.json'), 'utf8'));
const outputFile = resolve(ROOT, 'scripts/cv-degree-results.json');
const output = existsSync(outputFile) ? JSON.parse(readFileSync(outputFile, 'utf8')) : {};
const tempDir = mkdtempSync('/tmp/vietprofs-cv-');
const YEAR = /\b(19[5-9]\d|20[0-2]\d)\b/g;
const DEGREE = [
  ['md', /(?:M\.?D\.?|Doctor of Medicine)\b/i],
  ['jd', /(?:J\.?D\.?|Juris Doctor|LL\.?B\.?)\b/i],
  ['mba', /(?:M\.?B\.?A\.?|Master of Business Administration)\b/i],
  ['edd', /(?:Ed\.?D\.?|Doctor of Education)\b/i],
  ['do', /(?:D\.\s*O\.|Doctor of Osteopathic Medicine)\b/i],
  ['dds', /(?:D\.?D\.?S\.?|Doctor of Dental Surgery)\b/i],
  ['pharmd', /(?:Pharm\.?D\.?|Doctor of Pharmacy)\b/i],
  ['phd', /(?:Ph\.?D\.?|D\.?Phil\.?|Doctor of Philosophy)\b/i],
  ['ms', /(?:M\.?S\.?|M\.?Sc\.?|M\.?Eng\.?|Master of Science|Master of Engineering)\b/i],
  ['undergrad', /(?:B\.?S\.?|B\.?Sc\.?|B\.?A\.?|B\.?Eng\.?|B\.?B\.?A\.?|Bachelor of)\b/i],
];
const INST = /\b(?:University|Institute|College|Polytechnic|Academy|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice|NUS|VNU|KAIST|HUST|State University)\b/i;
const BAD = /award|honor|dissertation|thesis|publication|advisor|student|postdoc|fellowship|department of|phone|email|curriculum vitae|university press|engineers?\b|program|research center|journal|review|magazine|transfer/i;

async function fetchResource(url) {
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const r = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)', Accept: '*/*' } });
    if (!r.ok) return null;
    return { url: r.url, type: r.headers.get('content-type') || '', bytes: Buffer.from(await r.arrayBuffer()) };
  } catch { return null; } finally { clearTimeout(timer); }
}

function linesFromHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '\n')
    .replace(/<br\s*\/?>(?!\n)/gi, '\n').replace(/<\/(?:p|li|div|td|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .split('\n').map(x => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

function linksFromHtml(html, base) {
  const links = [];
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!/(cv|curriculum|vitae|resume|academic|bio)/i.test(`${label} ${m[1]}`)) continue;
    try { links.push(new URL(m[1], base).href); } catch { /* ignore malformed links */ }
  }
  return [...new Set(links)].slice(0, 5);
}

function institution(line) {
  const s = line.replace(/^[-•*\s]+/, '').replace(/\s+/g, ' ').trim();
  if (!INST.test(s) || BAD.test(s) || s.length < 6 || s.length > 120) return null;
  // Keep a clean institution prefix and discard dates/locations after it where possible.
  const match = s.match(/((?:The\s+)?(?:[A-Z][\w&.'-]*\s+){0,8}(?:University|Institute|College|School|Polytechnic|Academy|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice|NUS|VNU|KAIST|HUST)(?:\s+[A-Z][\w&.'-]*){0,5})/i);
  const value = (match?.[1] || s).replace(/^(?:B\.[AS]\.?|Bachelor(?: of [A-Za-z]+)?)\s+/i, '').replace(/[,:;|.)]+$/, '').trim();
  return value.length >= 6 && value.length <= 100 && !BAD.test(value) ? value : null;
}

function extract(text) {
  const lines = text.split('\n').map(x => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
  let active = false; const found = [];
  const stop = /\b(?:experience|employment|appointments|positions|publications|awards|honors|service|teaching|research interests|skills|references|work experience|presentations|selected works)\b/i;
  for (let i = 0; i < lines.length; i++) {
    if (/^(?:education|academic background|degrees|qualifications|academic credentials)\b/i.test(lines[i])) { active = true; continue; }
    if (active && stop.test(lines[i])) { active = false; continue; }
    if (!active) continue;
    for (const [kind, signal] of DEGREE) {
      if (!signal.test(lines[i]) || BAD.test(lines[i])) continue;
      const context = [lines[i - 1], lines[i], lines[i + 1]].filter(Boolean);
      const inst = context.map(institution).find(Boolean);
      if (!inst) continue;
      const years = context.join(' ').match(YEAR)?.map(Number) || [];
      const year = years.at(-1) || null;
      const label = kind === 'undergrad' ? (/(B\.?A\.?|Bachelor of Arts)/i.test(lines[i]) ? 'BA' : 'Bachelor') : kind.toUpperCase();
      found.push({ kind, degree: label, institution: inst, year, sourceLine: lines[i] });
      break;
    }
  }
  return [...new Map(found.map(x => [`${x.kind}|${x.institution}|${x.year}`, x])).values()];
}

function sourcesFor(name) {
  const person = roster.find(x => x.name === name);
  const candidates = (homepage[name]?.candidates || []).filter(x => /(cv|curriculum|vitae|resume|homepage|personal|website|bio)/i.test(`${x.label} ${x.url}`)).map(x => x.url);
  if (person?.profileUrl) candidates.push(person.profileUrl);
  if (person?.websiteUrl) candidates.push(person.websiteUrl);
  return [...new Set(candidates)].slice(0, 3);
}

try {
  for (const entry of batch) {
    const name = typeof entry === 'string' ? entry : entry.name;
    const sources = sourcesFor(name); const degrees = []; const used = [];
    for (const url of sources) {
      const resource = await fetchResource(url); if (!resource) continue;
      const isPdf = /pdf/i.test(resource.type) || /\.pdf(?:$|\?)/i.test(resource.url);
      let text = ''; let linked = [];
      if (isPdf && resource.bytes.subarray(0, 4).toString() === '%PDF') {
        const file = resolve(tempDir, `${encodeURIComponent(name)}-${used.length}.pdf`);
        writeFileSync(file, resource.bytes);
        try { text = execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' }); } catch { text = ''; }
      } else {
        linked = linksFromHtml(resource.bytes.toString('utf8'), resource.url);
      }
      if (text) degrees.push(...extract(text)); used.push(resource.url);
      for (const link of linked) {
        const cv = await fetchResource(link); if (!cv) continue;
        if (!cv.bytes.subarray(0, 4).toString().startsWith('%PDF')) continue;
        const file = resolve(tempDir, `${encodeURIComponent(name)}-${used.length}.pdf`); writeFileSync(file, cv.bytes);
        try { degrees.push(...extract(execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' }))); used.push(cv.url); } catch { /* unreadable */ }
      }
    }
    output[name] = { _cvSource: true, sources: [...new Set(used)], degrees: [...new Map(degrees.map(x => [`${x.kind}|${x.institution}|${x.year}`, x])).values()] };
    console.log(`${name}: ${output[name].degrees.map(x => `${x.degree} ${x.institution}${x.year ? ` (${x.year})` : ''}`).join('; ') || 'none'}`);
  }
  writeFileSync(outputFile, JSON.stringify(output, null, 2) + '\n');
} finally { rmSync(tempDir, { recursive: true, force: true }); }
