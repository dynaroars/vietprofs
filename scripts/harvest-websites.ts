// Finds personal/lab websites that official profile pages already link, for entries with no websiteUrl.
//
//   npm run harvest-websites                       # dry run over every entry without a websiteUrl
//   npm run harvest-websites -- --ids=vp-0101,vp-0102
//   npm run harvest-websites -- --limit=100        # first 100 targets (id order)
//   npm run harvest-websites -- --apply-high       # also store HIGH candidates as websiteUrl
//
// No model involved. For each target it fetches the stored profileUrl and keeps outbound links whose
// own text, or the label right before them ("Website:", "Lab:", "Homepage"), says website/lab/group.
// It then follows redirects to the final address and opens that page to look for identity evidence:
//   name      the page names the person (given and family name tokens)
//   email     the page shows the same email local part as the profile page
//   backlink  the page links back to the official profile
// HIGH  = labeled link, 200 OK, and at least one identity signal  (safe to store)
// MEDIUM = labeled link, 200 OK, no identity signal               (needs a look)
// Results land in maintenance/website-candidates.json. websiteUrl is not a protected field, so
// --apply-high may write it; everything else stays a candidate for the `links` routine or a human.
import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { RosterEntry } from '../src/data.ts';

const execFileAsync = promisify(execFile);

const args = process.argv.slice(2);
const option = (name: string) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const only = option('ids')?.split(',');
const limit = Number(option('limit') ?? 0);
const applyHigh = args.includes('--apply-high');
const debug = args.includes('--debug'); // log every labeled link and why it was kept or dropped
const validate = args.includes('--validate'); // run on entries that already have a websiteUrl and compare
const CONCURRENCY = 5; // more parallel lookups make DNS fail (curl exit 6) on ordinary home resolvers
const TRANSIENT = new Set([6, 7, 28, 35, 52, 56]); // DNS, connect, timeout, TLS handshake, empty/reset replies: retry
const TIMEOUT_MS = 15_000;
const MAX_BYTES = 2_000_000;
const AGENT = 'Mozilla/5.0 (compatible; VietProfs link maintenance; +https://vietprofs.roars.dev)';

const SOCIAL = /(^|\.)(scholar\.google|linkedin|twitter|x|facebook|instagram|youtube|youtu|tiktok|orcid|researchgate|academia|dblp|semanticscholar|pubmed|ncbi\.nlm\.nih|wikipedia|doi|apple|google|play\.google|github|mendeley|publons|webofscience|clarivate|scopus|zoom|mailto|tel)(\.|$)/i;
const STRONG_LABEL = /(web\s?site|home\s?page|web\s?page|personal\s+(site|page|web)|(lab|laboratory|research\s+group|group)\s+(site|web|page|website|homepage)|^\s*(our\s+)?(lab|laboratory|group|research\s+group)\s*$|visit\s+(my|the|our))/i;
const PRECEDING_LABEL = /(web\s?site|home\s?page|web\s?page|personal\s+(site|page)|lab(oratory)?|research\s+group|group)\s*:?\s*$/i;
// Site-wide footer and policy links also say 'website'; they are never a person's page.
const GENERIC_TEXT = /(a-z|listing|terms|privacy|policy|feedback|accessib|sitemap|site map|directory|contact us|report|log\s?in|sign\s?in|webmaster|copyright|cookie|cms|edit this|university websites|all websites|website (help|support|issue|problem))/i;
// Clinical, directory and expertise pages are official profiles, not a personal or lab website.
const PROFILE_PATH = /\/(doctors?|physicians?|providers?|clinics?|find-a-doctor|expertise|directory|profiles?|people|staff|faculty|bios?|bio_[a-z]+|admissions?|apply|news|stories|article)s?(\/|\.|$)/i;
const FILE_LINK = /\.(pdf|docx?|pptx?|zip|jpg|jpeg|png|gif)(\?|$)/i;

type Signals = { name: boolean; email: boolean; backlink: boolean };
type Candidate = { url: string; finalUrl: string; label: string; status: number; confidence: 'HIGH' | 'MEDIUM'; signals: Signals; foundOn: string };

const strip = (html: string) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const fold = (text: string) => text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();

// curl, not fetch: many university sites reset or stall Node's TLS client but answer curl.
async function get(url: string, attempt = 0): Promise<{ status: number; finalUrl: string; html: string } | null> {
  try {
    const { stdout } = await execFileAsync('curl', ['-sL', '--compressed', '-m', String(TIMEOUT_MS / 1000), '--max-filesize', String(MAX_BYTES), '-A', AGENT, '-H', 'Accept: text/html,application/xhtml+xml', '-w', '\n__CURL__%{http_code} %{content_type} %{url_effective}', url], { maxBuffer: MAX_BYTES + 10_000, encoding: 'buffer' });
    const text = stdout.toString('utf8');
    const split = text.lastIndexOf('\n__CURL__');
    const fields = text.slice(split + 9).trim().split(' '); // code, content-type (may contain a space), final url
    const code = fields[0];
    const finalUrl = fields[fields.length - 1];
    const type = fields.slice(1, -1).join(' ');
    const html = /html|text/.test(type ?? '') ? text.slice(0, split) : '';
    return { status: Number(code), finalUrl: finalUrl || url, html };
  } catch (error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'number' && TRANSIENT.has(code) && attempt < 2) { await new Promise((done) => setTimeout(done, 1500 * (attempt + 1))); return get(url, attempt + 1); }
    if (debug) console.error('   get failed', url.slice(0, 60), 'exit', (error as {code?: unknown}).code); return null; }
}

function hostOf(url: string): string { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } }
function registrable(host: string): string { return host.split('.').slice(-2).join('.'); }

function labeledLinks(html: string, base: string): Array<{ url: string; label: string; explicit: boolean }> {
  const found: Array<{ url: string; label: string; explicit: boolean }> = [];
  for (const match of html.matchAll(/<a\b[^>]*?href\s*=\s*["']([^"'#][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let url: string;
    try { url = new URL(match[1].replace(/&amp;/g, '&'), base).toString(); } catch { continue; }
    if (!/^https?:/.test(url) || FILE_LINK.test(url)) continue;
    const host = hostOf(url);
    if (!host || SOCIAL.test(host) && !/github\.io$/.test(host)) continue;
    const text = strip(match[2]);
    const before = strip(html.slice(Math.max(0, (match.index ?? 0) - 160), match.index ?? 0)).slice(-40);
    if (GENERIC_TEXT.test(text) || (match.index ?? 0) > html.length * 0.8) continue; // footer territory
    // 'Website: <link>' style field: the label sits right before the link and the link text is the URL or the label itself.
    const explicit = PRECEDING_LABEL.test(before) && (/^(https?:|www\.)/i.test(text) || PRECEDING_LABEL.test(text) || text.length === 0);
    const labeled = STRONG_LABEL.test(text) || PRECEDING_LABEL.test(before) || PRECEDING_LABEL.test(text);
    if (!labeled) continue;
    if (url.replace(/\/$/, '') === base.replace(/\/$/, '')) continue;
    found.push({ url, label: (STRONG_LABEL.test(text) ? text : `${before} ${text}`.trim()).slice(0, 80), explicit });
  }
  return found;
}

function nameTokens(name: string): { given: string[]; family: string[] } {
  const parts = fold(name.replace(/\s+-\s+.*$/, '').replace(/\(.*?\)/g, '')).split(/[^a-z]+/).filter((token) => token.length > 1);
  return { given: parts.slice(0, -1), family: parts.slice(-1) };
}

async function consider(person: RosterEntry): Promise<Candidate | null> {
  const profileUrl = person.profileUrl as string; // targets are filtered to entries that have one
  const profile = await get(profileUrl);
  if (!profile || profile.status >= 400 || !profile.html) return null;
  const email = profile.html.match(/mailto:([^"'?\s]+)@/i)?.[1]?.toLowerCase();
  const links = labeledLinks(profile.html, profile.finalUrl);
  if (debug) console.error(person.id, `${links.length} labeled links`, links.slice(0, 4).map((link) => `${link.explicit ? '*' : ''}${link.url.slice(0, 50)} [${link.label.replace(/\s+/g, ' ').slice(0, 25)}]`).join(' | '));
  for (const link of links.slice(0, 3)) {
    const page = await get(link.url);
    if (!page || page.status >= 400) { if (debug) console.error('   dead', link.url.slice(0, 60), page?.status); continue; }
    // Identity evidence must come from the top of the page (title, headings, intro), not from a
    // news article or footer that happens to mention the name.
    const title = page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
    const text = fold(`${title} ${strip(page.html).slice(0, 6000)}`);
    const { given, family } = nameTokens(person.name);
    const signals: Signals = {
      name: family.every((token) => text.includes(token)) && given.some((token) => text.includes(token)),
      email: Boolean(email && email.length > 2 && fold(page.html).includes(`${email}@`)),
      backlink: page.html.includes(profileUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')),
    };
    const final = page.finalUrl.split('#')[0];
    if (PROFILE_PATH.test(new URL(final).pathname)) continue;
    if (final.replace(/\/$/, '') === profile.finalUrl.replace(/\/$/, '')) continue;
    // Generic section pages on the university's own domain (/links, /people, /about) are not a person's site.
    if (registrable(hostOf(final)) === registrable(hostOf(profileUrl)) && /\/(links?|resources|about|people|faculty|staff|directory|research|labs?)\/?$/i.test(new URL(final).pathname)) continue;
    // A link that merely goes to another page of the same university site is not a personal site.
    if (registrable(hostOf(final)) === registrable(hostOf(profileUrl)) && hostOf(final) === hostOf(profileUrl)) continue;
    const confidence = signals.name ? 'HIGH' : link.explicit || signals.email || signals.backlink ? 'MEDIUM' : null;
    if (debug && !confidence) console.error('   no evidence', final.slice(0, 70));
    if (!confidence) continue; // an unlabeled-by-the-profile link with no identity evidence is noise
    return { url: link.url, finalUrl: final, label: link.label, status: page.status, confidence, signals, foundOn: profile.finalUrl };
  }
  return null;
}

const roster: RosterEntry[] = JSON.parse(await readFile('public/data.json', 'utf8'));
let targets = roster.filter((person) => (validate ? Boolean(person.websiteUrl) : !person.websiteUrl) && person.profileUrl && (!only || only.includes(person.id)));
if (limit) targets = targets.slice(0, limit);
const results: Record<string, Candidate> = {};
let done = 0;
let cursor = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (cursor < targets.length) {
    const person = targets[cursor++];
    const candidate = await consider(person);
    if (candidate) results[person.id] = candidate;
    done += 1;
    if (done % 50 === 0) console.error(`${done}/${targets.length} checked, ${Object.keys(results).length} candidates`);
  }
}));

if (validate) {
  const byId = new Map(roster.map((person) => [person.id, person]));
  const same = (a: string, b: string) => hostOf(a) === hostOf(b) || registrable(hostOf(a)) === registrable(hostOf(b)) && new URL(a).pathname.replace(/\/$/, '') === new URL(b).pathname.replace(/\/$/, '');
  const found = Object.entries(results);
  const agree = found.filter(([id, c]) => same(c.finalUrl, byId.get(id)?.websiteUrl ?? ''));
  console.log(JSON.stringify({ validated: targets.length, foundSomething: found.length, agreeWithStored: agree.length, high: found.filter(([, c]) => c.confidence === 'HIGH').length, highAgree: agree.filter(([, c]) => c.confidence === 'HIGH').length }));
  for (const [id, c] of found.filter(([id, c]) => !agree.includes([id, c] as never) && !same(c.finalUrl, byId.get(id)?.websiteUrl ?? '')).slice(0, 15)) console.log(id, c.confidence, 'harvest:', c.finalUrl, 'stored:', byId.get(id)?.websiteUrl);
  process.exit(0);
}
const sorted = Object.fromEntries(Object.entries(results).sort(([a], [b]) => a.localeCompare(b)));
const high = Object.values(sorted).filter((candidate) => candidate.confidence === 'HIGH').length;
await writeFile('maintenance/website-candidates.json', `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), checked: targets.length, high, medium: Object.keys(sorted).length - high, candidates: sorted }, null, 2)}\n`);
console.log(JSON.stringify({ checked: targets.length, candidates: Object.keys(sorted).length, high, medium: Object.keys(sorted).length - high }));

if (applyHigh) {
  let stored = 0;
  for (const person of roster) {
    const candidate = sorted[person.id];
    if (!candidate || candidate.confidence !== 'HIGH' || person.websiteUrl || person.directFields?.includes('websiteUrl')) continue;
    person.websiteUrl = candidate.finalUrl;
    stored += 1;
  }
  await writeFile('public/data.json', `${JSON.stringify(roster, null, 2)}\n`);
  console.log(`stored ${stored} HIGH-confidence websiteUrl values`);
}
