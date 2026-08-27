/**
 * Fetch profile, homepage, and linked CV sources and preserve postdoc-related
 * snippets for human verification. This script intentionally does not edit the roster.
 * Usage: node scripts/fetch-postdocs.mjs --batch-file FILE --output-file FILE
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const args = process.argv.slice(2);
const getArg = (flag) => { const index = args.indexOf(flag); return index < 0 ? null : args[index + 1]; };
const batchFile = getArg('--batch-file');
const outputFile = getArg('--output-file');
if (!batchFile || !outputFile) throw new Error('Both --batch-file and --output-file are required');

const batch = JSON.parse(readFileSync(resolve(ROOT, batchFile), 'utf8'));
const homepageFile = resolve(ROOT, 'scripts/homepage-results.json');
const homepage = JSON.parse(readFileSync(homepageFile, 'utf8'));
const tempDir = mkdtempSync('/tmp/vietprofs-postdoc-');
const SIGNAL = /post[ -]?doc(?:toral|torate)?|research fellow|research associate/i;

async function fetchResource(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VietProfs roster research)', Accept: '*/*' },
    });
    if (!response.ok) return null;
    return {
      url: response.url,
      type: response.headers.get('content-type') || '',
      bytes: Buffer.from(await response.arrayBuffer()),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '\n')
    .replace(/<br\s*\/?>|<\/(?:p|li|div|td|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&ndash;|&mdash;/g, '–')
    .replace(/&#(?:x2013|8211);/gi, '–');
}

function linkedSources(html, base) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!/(cv|curriculum|vitae|resume|bio|about)/i.test(`${label} ${match[1]}`)) continue;
    try { links.push(new URL(match[1], base).href); } catch { /* malformed link */ }
  }
  return [...new Set(links)].slice(0, 5);
}

function snippets(text) {
  const lines = text.split('\n').map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const found = [];
  for (let index = 0; index < lines.length; index++) {
    if (!SIGNAL.test(lines[index])) continue;
    found.push(lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join(' | '));
  }
  return [...new Set(found)].slice(0, 12);
}

function initialSources(entry) {
  const cached = homepage[entry.name]?.candidates || [];
  const useful = cached
    .filter((candidate) => /(cv|curriculum|vitae|resume|homepage|personal|website|bio|about)/i.test(`${candidate.label} ${candidate.url}`))
    .map((candidate) => candidate.url);
  return [...new Set([entry.profileUrl, entry.websiteUrl, ...useful].filter(Boolean))].slice(0, 5);
}

async function inspectUrl(name, url, sequence) {
  const resource = await fetchResource(url);
  if (!resource) return { source: url, fetched: false, snippets: [], links: [] };
  const isPdf = /pdf/i.test(resource.type) || /\.pdf(?:$|\?)/i.test(resource.url);
  if (isPdf && resource.bytes.subarray(0, 4).toString() === '%PDF') {
    const file = resolve(tempDir, `${encodeURIComponent(name)}-${sequence}.pdf`);
    writeFileSync(file, resource.bytes);
    try {
      const text = execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
      return { source: resource.url, fetched: true, snippets: snippets(text), links: [] };
    } catch {
      return { source: resource.url, fetched: true, snippets: [], links: [] };
    }
  }
  const html = resource.bytes.toString('utf8');
  return { source: resource.url, fetched: true, snippets: snippets(htmlToText(html)), links: linkedSources(html, resource.url) };
}

async function inspectPerson(entry) {
  const inspected = [];
  const queued = initialSources(entry);
  const seen = new Set();
  while (queued.length && inspected.length < 6) {
    const url = queued.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    const result = await inspectUrl(entry.name, url, inspected.length);
    inspected.push({ source: result.source, fetched: result.fetched, snippets: result.snippets });
    for (const link of result.links) if (!seen.has(link)) queued.push(link);
  }
  const hits = inspected.filter((item) => item.snippets.length);
  return { name: entry.name, sourcesChecked: inspected.length, hits };
}

try {
  const output = [];
  for (let index = 0; index < batch.length; index += 4) {
    const chunk = batch.slice(index, index + 4);
    const results = await Promise.all(chunk.map(inspectPerson));
    for (const result of results) {
      output.push(result);
      console.log(`${result.name}: ${result.hits.length} source hit(s)`);
    }
  }
  writeFileSync(resolve(ROOT, outputFile), `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Saved ${output.length} results to ${resolve(ROOT, outputFile)}`);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
