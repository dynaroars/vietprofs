import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

type Person = { id: string; name: string; university: string; department?: string; rank?: string; profileUrl: string; websiteUrl?: string; labUrl?: string; portrait?: string; portraitSource?: string; directFields?: string[]; lastUpdatedAt: string };
type QueueItem = Pick<Person, 'id' | 'name' | 'university' | 'profileUrl'> & { batch: number; status: 'pending' | 'fetched' | 'unresolved'; portraitSource?: string; note?: string };
type SourceType = 'official_faculty' | 'personal_homepage' | 'lab_site' | 'authoritative_academic';
type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
type Outcome = 'found' | 'not_found' | 'protected' | 'needs_review';
type ProvenanceEntry = { name: string; outcome: Outcome; pageUrl?: string; imageUrl?: string; sourceType?: SourceType; confidence?: Confidence; identitySignals: string[]; retrievedAt: string; note?: string };
type ProvenanceLedger = { version: 1; entries: Record<string, ProvenanceEntry> };
type AuditFixture = { version: 1; knownGood: string[]; missing: string[]; knownBad: string[]; blocked: string[]; commonNames: string[] };
type Page = { url: string; sourceType: SourceType; stored: boolean };
type Candidate = { imageUrl: string; page: Page; identitySignals: string[]; urlHasNameEvidence: boolean; score: number };

const execFileAsync = promisify(execFile);
const root = resolve('.');
const dataPath = join(root, 'public/data.json');
const queuePath = join(root, 'maintenance/portrait-queue.json');
const missingPath = join(root, 'maintenance/missing-portraits.json');
const provenancePath = join(root, 'maintenance/portrait-provenance.json');
const fixturePath = join(root, 'maintenance/portrait-audit-sample.json');
const portraitsDir = join(root, 'public/portraits');
const userAgent = 'VietProfs portrait maintenance (https://vietprofs.roars.dev)';
const args = new Set(process.argv.slice(2));
const requestedBatch = Number(process.argv.find((arg) => /^\d+$/.test(arg)) ?? '1');
const applying = args.has('--apply');
const replaceExisting = args.has('--replace');
const retry = args.has('--retry');
const explicitIdsArgument = process.argv.find((arg) => arg.startsWith('--ids='));
const explicitIds = explicitIdsArgument
  ? new Set(explicitIdsArgument.slice('--ids='.length).split(',').filter((id) => /^vp-\d{4}$/.test(id)))
  : null;

async function curl(url: string, maxTime: number): Promise<Buffer> {
  const { stdout } = await execFileAsync('curl', ['-L', '--fail', '--silent', '--show-error', '--max-time', String(maxTime), '-A', userAgent, url], { encoding: 'buffer', maxBuffer: 20_000_000 });
  return stdout as Buffer;
}
function absoluteUrl(value: string, base: string): string { try { return new URL(value, base).href; } catch { return ''; } }
function cleanUrl(value: string): string { return value.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"'); }
function normalizedWords(value: string): string[] { return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean); }
function hasWordEvidence(value: string, context: string, minimum = 2): boolean {
  const words = normalizedWords(value).filter((word) => word.length > 1);
  const found = new Set(normalizedWords(context));
  return new Set(words.filter((word) => found.has(word))).size >= Math.min(minimum, words.length);
}
function hasNameEvidence(name: string, context: string): boolean { return hasWordEvidence(name, context, 2); }

function sourcePages(person: Person): Page[] {
  const sources: Array<[string | undefined, SourceType]> = [[person.profileUrl, 'official_faculty'], [person.websiteUrl, 'personal_homepage'], [person.labUrl, 'lab_site']];
  const seen = new Set<string>();
  return sources.flatMap(([url, sourceType]) => {
    if (!url || seen.has(url)) return [];
    seen.add(url);
    return [{ url, sourceType, stored: true }];
  });
}
function identitySignals(person: Person, imageUrl: string, context: string, page: Page, pageHtml: string): string[] {
  const evidence = `${imageUrl} ${context} ${pageHtml.slice(0, 200_000)}`;
  const signals: string[] = [];
  if (hasNameEvidence(person.name, `${imageUrl} ${context}`)) signals.push('name');
  if (hasWordEvidence(person.university, evidence, 2)) signals.push('institution');
  if (person.department && hasWordEvidence(person.department, evidence, 2)) signals.push('department');
  if (person.rank && hasWordEvidence(person.rank, evidence, 1)) signals.push('rank');
  if (page.stored) signals.push('stored_roster_url');
  return signals;
}
function imageCandidates(html: string, page: Page, person: Person): Candidate[] {
  const candidates: Candidate[] = [];
  const add = (raw: string, context: string) => {
    const imageUrl = absoluteUrl(cleanUrl(raw), page.url);
    if (!/^https?:\/\//i.test(imageUrl)) return;
    const low = `${imageUrl} ${context}`.toLowerCase();
    if (/no[-_ ]?(portrait|photo|image)|place[-_ ]?holder|logo|header|favicon|icon|sprite|gravatar|qr|wordmark|monogram|banner|hero|background|nav|menu|search|arrow|no_photo|nophoto|profile_no_photo|blank|blank_profile|default_profile|profile_placeholder|silhouette/i.test(low)) return;
    const identity = identitySignals(person, imageUrl, context, page, html);
    if (!identity.includes('name') || identity.length < 2) return;
    let score = 10 + identity.length * 5;
    if (/portrait|headshot|profile|photo|avatar|faculty|people|person|staff/.test(low)) score += 4;
    if (/\.(?:jpe?g|png|webp)(?:[/?#]|$)/i.test(imageUrl)) score += 5;
    candidates.push({ imageUrl, page, identitySignals: identity, urlHasNameEvidence: hasNameEvidence(person.name, imageUrl), score });
  };
  for (const match of html.matchAll(/<meta\b[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) add(match[1], match[0]);
  for (const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) add(match[1], match[0]);
  for (const match of html.matchAll(/\b(?:src|data-src|data-image|imageUrl)=["']([^"']+)["']/gi)) add(match[1], match[0]);
  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) for (const value of match[1].split(',')) add(value.trim().split(/\s+/)[0], match[0]);
  for (const match of html.matchAll(/"image"\s*:\s*"([^"]+)"/gi)) add(match[1], match[0]);
  for (const match of html.matchAll(/background-image\s*:\s*url\((?:["']?)([^)'"\s]+)(?:["']?)\)/gi)) add(match[1], match[0]);
  return [...new Map(candidates.sort((a, b) => b.score - a.score).map((candidate) => [candidate.imageUrl, candidate])).values()];
}
async function discoveryPages(person: Person): Promise<Page[]> {
  const query = new URLSearchParams({ q: `"${person.name}" "${person.university}" faculty portrait OR photo` });
  let html: string;
  try { html = (await curl(`https://html.duckduckgo.com/html/?${query}`, 10)).toString('utf8'); } catch { return []; }
  const urls = [...html.matchAll(/result__a" href="\/\/duckduckgo\.com\/l\/\?uddg=([^&"]+)/gi)].flatMap((match) => { try { return [decodeURIComponent(match[1]).replace(/&amp;/g, '&')]; } catch { return []; } });
  return [...new Set(urls)].filter((url) => /^https?:\/\//.test(url) && !/linkedin|facebook|instagram|scholar\.google|wikipedia/i.test(new URL(url).hostname)).slice(0, 5).map((url) => ({ url, sourceType: 'authoritative_academic' as const, stored: false }));
}
function confidence(candidate: Candidate): Confidence {
  const directSource = candidate.page.sourceType !== 'authoritative_academic';
  const corroborated = candidate.identitySignals.some((signal) => ['institution', 'department', 'rank'].includes(signal));
  // Opaque image APIs and pages with only an alt-text association are useful leads, but are
  // review-only: a direct URL bearing the scholar's name is a cheap, reproducible extra guard
  // against a neighboring card or a page-wide hero image being selected automatically.
  return directSource && corroborated && candidate.identitySignals.includes('stored_roster_url') && candidate.urlHasNameEvidence ? 'HIGH' : 'MEDIUM';
}
function slug(value: string): string { return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100); }
async function fetchImage(url: string): Promise<Buffer | null> { try { const bytes = await curl(url, 20); return bytes.length >= 1000 && bytes.length <= 15_000_000 ? bytes : null; } catch { return null; } }
async function archiveImage(bytes: Buffer, output: string): Promise<void> {
  const input = `${output}.source${extname(output) || '.bin'}`;
  await writeFile(input, bytes);
  try { await execFileAsync('magick', [input, '-auto-orient', '-strip', '-resize', '1200x1200>', '-quality', '86', output]); } finally { await unlink(input).catch(() => undefined); }
}
async function isPortraitLike(output: string): Promise<boolean> {
  try { const { stdout } = await execFileAsync('identify', ['-format', '%w %h', output]); const [width, height] = stdout.trim().split(/\s+/).map(Number); return width >= 120 && height >= 120 && width / height >= 0.7 && width / height <= 1.55; } catch { return false; }
}
async function loadLedger(): Promise<ProvenanceLedger> { try { return JSON.parse(await readFile(provenancePath, 'utf8')) as ProvenanceLedger; } catch { return { version: 1, entries: {} }; } }
async function loadQueue(people: Person[]): Promise<QueueItem[]> {
  try { return JSON.parse(await readFile(queuePath, 'utf8')) as QueueItem[]; } catch { return people.filter((person) => !person.portrait).map((person, index) => ({ id: person.id, name: person.name, university: person.university, profileUrl: person.profileUrl, batch: Math.floor(index / 20) + 1, status: 'pending' })); }
}
async function auditIds(): Promise<Set<string>> { const fixture = JSON.parse(await readFile(fixturePath, 'utf8')) as AuditFixture; return new Set([...fixture.knownGood, ...fixture.missing, ...fixture.knownBad, ...fixture.blocked, ...fixture.commonNames]); }

const people = JSON.parse(await readFile(dataPath, 'utf8')) as Person[];
const queue = await loadQueue(people);
const ledger = await loadLedger();
if (args.has('--status')) { console.log(JSON.stringify({ queue: queue.reduce<Record<string, number>>((counts, item) => { counts[item.status] = (counts[item.status] ?? 0) + 1; return counts; }, {}), provenance: Object.keys(ledger.entries).length }, null, 2)); process.exit(0); }
const audit = args.has('--sample');
if (explicitIds) {
  for (const person of people.filter((candidate) => explicitIds.has(candidate.id))) {
    if (!queue.some((item) => item.id === person.id)) queue.push({ id: person.id, name: person.name, university: person.university, profileUrl: person.profileUrl, batch: requestedBatch, status: 'pending' });
  }
}
const selectedIds = audit
  ? await auditIds()
  : explicitIds ?? new Set(queue.filter((item) => item.batch === requestedBatch && (item.status === 'pending' || (retry && item.status === 'unresolved'))).map((item) => item.id));
const selected = people.filter((person) => selectedIds.has(person.id) && (!person.portrait || replaceExisting || audit));
await mkdir(portraitsDir, { recursive: true });
const report: Array<Record<string, unknown>> = [];
for (const person of selected) {
  const protectedPortrait = person.directFields?.includes('portrait') || person.directFields?.includes('portraitSource');
  const now = new Date().toISOString();
  if (protectedPortrait) { ledger.entries[person.id] = { name: person.name, outcome: 'protected', identitySignals: [], retrievedAt: now, note: 'portrait or portraitSource is protected by directFields' }; report.push({ id: person.id, name: person.name, result: 'protected' }); continue; }
  const candidates: Candidate[] = [];
  for (const page of sourcePages(person)) try { candidates.push(...imageCandidates((await curl(page.url, 20)).toString('utf8'), page, person)); } catch { /* use another stored page */ }
  // Search is a fallback discovery route, never an image source on its own. Avoid it when a
  // stored page already exposed an identity-resolved candidate.
  if (candidates.length === 0) for (const page of await discoveryPages(person)) try { candidates.push(...imageCandidates((await curl(page.url, 20)).toString('utf8'), page, person)); } catch { /* use another discovery route */ }
  const candidate = [...new Map(candidates.sort((a, b) => b.score - a.score).map((item) => [item.imageUrl, item])).values()][0];
  if (!candidate) { ledger.entries[person.id] = { name: person.name, outcome: 'not_found', identitySignals: [], retrievedAt: now, note: 'no identity-verified candidate exposed by inspected pages' }; const item = queue.find((queued) => queued.id === person.id); if (item) item.status = 'unresolved'; report.push({ id: person.id, name: person.name, result: 'not_found' }); continue; }
  const level = confidence(candidate);
  const entry: ProvenanceEntry = { name: person.name, outcome: level === 'HIGH' ? 'found' : 'needs_review', pageUrl: candidate.page.url, imageUrl: candidate.imageUrl, sourceType: candidate.page.sourceType, confidence: level, identitySignals: candidate.identitySignals, retrievedAt: now };
  if (!applying || level !== 'HIGH' || (person.portrait && !replaceExisting)) { ledger.entries[person.id] = { ...entry, outcome: level === 'HIGH' ? 'needs_review' : entry.outcome, note: applying ? 'candidate requires visual review before acceptance' : 'dry run; rerun with --apply after review' }; if (applying) { const item = queue.find((queued) => queued.id === person.id); if (item) item.status = 'unresolved'; } report.push({ id: person.id, name: person.name, result: ledger.entries[person.id].outcome, source: candidate.page.sourceType, confidence: level }); continue; }
  const bytes = await fetchImage(candidate.imageUrl);
  if (!bytes) { ledger.entries[person.id] = { ...entry, outcome: 'not_found', note: 'candidate image could not be downloaded' }; report.push({ id: person.id, name: person.name, result: 'not_found', source: candidate.page.sourceType, confidence: level }); continue; }
  const portrait = join('portraits', `${person.id}-${slug(person.name)}.webp`);
  const output = join(root, 'public', portrait);
  const temporary = `${output}.candidate.webp`;
  try { await archiveImage(bytes, temporary); } catch {
    ledger.entries[person.id] = { ...entry, outcome: 'not_found', note: 'candidate could not be converted to a local image' };
    report.push({ id: person.id, name: person.name, result: 'not_found', source: candidate.page.sourceType, confidence: level });
    continue;
  }
  if (!(await isPortraitLike(temporary))) { await unlink(temporary).catch(() => undefined); ledger.entries[person.id] = { ...entry, outcome: 'not_found', note: 'candidate failed 120x120 or portrait-aspect validation' }; report.push({ id: person.id, name: person.name, result: 'not_found', source: candidate.page.sourceType, confidence: level }); continue; }
  await rename(temporary, output);
  person.portrait = portrait; person.portraitSource = candidate.imageUrl; person.lastUpdatedAt = now; ledger.entries[person.id] = entry;
  const item = queue.find((queued) => queued.id === person.id);
  if (item) { item.status = 'fetched'; item.portraitSource = candidate.imageUrl; item.note = `HIGH-confidence ${candidate.page.sourceType}`; }
  report.push({ id: person.id, name: person.name, result: 'correct portrait found', source: candidate.page.sourceType, confidence: level });
}
await writeFile(provenancePath, `${JSON.stringify(ledger, null, 2)}\n`);
if (applying) {
  await writeFile(dataPath, `${JSON.stringify(people, null, 2)}\n`);
  await writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`);
  await writeFile(missingPath, `${JSON.stringify(queue.filter((item) => item.status === 'unresolved' || item.status === 'pending'), null, 2)}\n`);
}
console.log(JSON.stringify({ mode: audit ? 'sample' : explicitIds ? `explicit-${explicitIds.size}` : `batch-${requestedBatch}`, applying, results: report }, null, 2));
