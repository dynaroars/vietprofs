/**
 * Find personal homepage candidates linked from official faculty profiles.
 * This deliberately records candidates for review; it does not rewrite data.json.
 *
 * Usage: node scripts/find-homepages.mjs --batch-file /tmp/homepage-batch.json
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RESULTS_FILE = resolve(ROOT, 'scripts/homepage-results.json');
const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i < 0 ? null : args[i + 1]; };
const batchFile = getArg('--batch-file');
if (!batchFile) throw new Error('Missing --batch-file');

const entries = JSON.parse(readFileSync(resolve(ROOT, batchFile), 'utf8'));
let results = existsSync(RESULTS_FILE) ? JSON.parse(readFileSync(RESULTS_FILE, 'utf8')) : {};

async function fetchPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)', Accept: 'text/html' },
    });
    return response.ok ? await response.text() : null;
  } catch { return null; } finally { clearTimeout(timer); }
}

function decode(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function candidates(html, sourceUrl) {
  const found = [];
  const anchorRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchorRe)) {
    const href = decode(match[1].trim());
    const text = decode(match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    if (!href || /^(mailto:|javascript:|#)/i.test(href)) continue;
    let absolute;
    try { absolute = new URL(href, sourceUrl).href; } catch { continue; }
    if (!/^https?:\/\//i.test(absolute)) continue;
    const label = `${text} ${absolute}`;
    let score = 0;
    if (/personal|home ?page|homepage|my website|web ?site|research website|academic website/i.test(label)) score += 5;
    if (/\b(cv|curriculum vitae|vitae)\b/i.test(text)) score += 2;
    if (/github\.io|pages\.github|\.me(?:\/|$)|\.dev(?:\/|$)/i.test(absolute)) score += 2;
    if (/linkedin|scholar\.google|orcid|facebook|twitter|youtube|mailto:/i.test(absolute)) score -= 5;
    if (absolute === sourceUrl || absolute.split('#')[0] === sourceUrl.split('#')[0]) score -= 4;
    if (score > 0) found.push({ url: absolute, label: text, score });
  }
  return [...new Map(found.map((item) => [item.url, item])).values()]
    .sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));
}

for (const entry of entries) {
  process.stdout.write(`${entry.name} ... `);
  const html = await fetchPage(entry.profileUrl);
  results[entry.name] = {
    profileUrl: entry.profileUrl,
    _profileFetched: Boolean(html),
    candidates: html ? candidates(html, entry.profileUrl).slice(0, 8) : [],
  };
  process.stdout.write(`${html ? results[entry.name].candidates.length : 'FETCH ERROR'}\n`);
}

writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2) + '\n');
