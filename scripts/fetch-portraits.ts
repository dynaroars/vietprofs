import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

type Person = {
  id: string;
  name: string;
  university: string;
  department?: string;
  rank?: string;
  profileUrl: string;
  websiteUrl?: string;
  portrait?: string;
  portraitSource?: string;
  directFields?: string[];
};
type QueueItem = Pick<Person, 'id' | 'name' | 'university' | 'profileUrl'> & {
  batch: number;
  status: 'pending' | 'fetched' | 'unresolved';
  portraitSource?: string;
  note?: string;
};
type SourceType = 'official_faculty' | 'personal_homepage' | 'lab_site' | 'authoritative_academic';
type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
type Outcome = 'found' | 'not_found' | 'protected' | 'needs_review';
type ProvenanceEntry = {
  name: string;
  outcome: Outcome;
  pageUrl?: string;
  imageUrl?: string;
  sourceType?: SourceType;
  confidence?: Confidence;
  identitySignals: string[];
  retrievedAt: string;
  note?: string;
};
type ProvenanceLedger = { version: 1; entries: Record<string, ProvenanceEntry> };
type AuditFixture = {
  version: 1;
  knownGood: string[];
  missing: string[];
  knownBad: string[];
  blocked: string[];
  commonNames: string[];
};
type Page = { url: string; sourceType: SourceType; stored: boolean };
type Candidate = {
  imageUrl: string;
  page: Page;
  identitySignals: string[];
  urlHasNameEvidence: boolean;
  score: number;
};

const execFileAsync = promisify(execFile);
const root = resolve('.');
const dataPath = join(root, 'public/data.json');
const queuePath = join(root, 'maintenance/portrait-queue.json');
const provenancePath = join(root, 'maintenance/portrait-provenance.json');
const fixturePath = join(root, 'maintenance/portrait-audit-sample.json');
const portraitsDir = join(root, 'public/portraits');
const userAgent = 'VietProfs portrait maintenance (https://vietprofs.roars.dev)';
const browserUserAgent = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36 ${userAgent}`;
const args = new Set(process.argv.slice(2));
const requestedBatch = Number(process.argv.find((arg) => /^\d+$/.test(arg)) ?? '1');
const applying = args.has('--apply');
const replaceExisting = args.has('--replace');
const retry = args.has('--retry');
const nextArgument = process.argv.find((arg) => arg.startsWith('--next='));
const nextCount = nextArgument ? Number(nextArgument.slice('--next='.length)) : 0;
const explicitIdsArgument = process.argv.find((arg) => arg.startsWith('--ids='));
const explicitIds = explicitIdsArgument
  ? new Set(
      explicitIdsArgument
        .slice('--ids='.length)
        .split(',')
        .filter((id) => /^vp-\d{4}$/.test(id)),
    )
  : null;

async function curl(url: string, maxTime: number): Promise<Buffer> {
  const { stdout } = await execFileAsync(
    'curl',
    [
      '-L',
      '--fail',
      '--silent',
      '--show-error',
      '--max-time',
      String(maxTime),
      '-A',
      userAgent,
      url,
    ],
    { encoding: 'buffer', maxBuffer: 20_000_000 },
  );
  return stdout as Buffer;
}
function absoluteUrl(value: string, base: string): string {
  try {
    return new URL(value, base).href;
  } catch {
    return '';
  }
}
function cleanUrl(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"');
}
// Split camelCase and letter/digit runs so filenames like "12136_LocBui_400x425" yield "loc" and "bui".
function normalizedWords(value: string): string[] {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[a-z](?=[A-Z])|[A-Za-z](?=\d)|\d(?=[A-Za-z])/g, '$& ')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}
function hasWordEvidence(value: string, context: string, minimum = 2): boolean {
  const words = normalizedWords(value).filter((word) => word.length > 1);
  const found = new Set(normalizedWords(context));
  return new Set(words.filter((word) => found.has(word))).size >= Math.min(minimum, words.length);
}
// Also accept the whole name run together, as in researchmap.jp/nguyenchinghia/avatar.jpg.
function compact(value: string): string {
  return normalizedWords(value).join('');
}
function hasNameEvidence(name: string, context: string): boolean {
  const words = normalizedWords(name);
  const runTogether = [words.join(''), [...words.slice(-1), ...words.slice(0, -1)].join('')]; // given-first or surname-first
  const text = compact(context);
  return (
    hasWordEvidence(name, context, 2) ||
    runTogether.some((whole) => whole.length >= 10 && text.includes(whole))
  );
}

function sourcePages(person: Person): Page[] {
  const sources: Array<[string | undefined, SourceType]> = [
    [person.profileUrl, 'official_faculty'],
    [person.websiteUrl, 'personal_homepage'],
  ];
  const seen = new Set<string>();
  return sources.flatMap(([url, sourceType]) => {
    if (!url || seen.has(url)) return [];
    seen.add(url);
    return [{ url, sourceType, stored: true }];
  });
}
function identitySignals(
  person: Person,
  imageUrl: string,
  context: string,
  page: Page,
  pageHtml: string,
): string[] {
  const evidence = `${imageUrl} ${context} ${pageHtml.slice(0, 200_000)}`;
  const signals: string[] = [];
  if (hasNameEvidence(person.name, `${imageUrl} ${context}`)) signals.push('name');
  if (hasWordEvidence(person.university, evidence, 2)) signals.push('institution');
  if (person.department && hasWordEvidence(person.department, evidence, 2))
    signals.push('department');
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
    // Frames and scripts (cookie banners, chat widgets) also match the generic src= pattern.
    if (/\.(?:html?|php|aspx?|js|css)$/i.test(new URL(imageUrl).pathname)) return;
    // Ad and analytics pixels often carry the page URL (and so the name) in their query string.
    if (
      /doubleclick\.net|googleadservices|google-analytics|googletagmanager|googlesyndication|facebook\.com\/tr|bat\.bing\.com|px\.ads\.linkedin|adsrvr\.org|analytics|[/.]pixel/i.test(
        new URL(imageUrl).hostname + new URL(imageUrl).pathname,
      )
    )
      return;
    // Test the path and markup, not the hostname, and match short words whole: "search" used to
    // reject every image on researchmap.jp, research.monash.edu, researchers.mq.edu.au, and so on.
    // Drop event handlers first: Pure portals put a "no-portrait" fallback in every photo's onerror.
    const screened =
      `${new URL(imageUrl).pathname} ${context.replace(/\son[a-z]+=(["'])[\s\S]*?\1/gi, '')}`.toLowerCase();
    if (
      /no[-_ ]?(portrait|photo|image)|place[-_ ]?holder|logo|favicon|sprite|gravatar|wordmark|monogram|banner|silhouette|blank|default[-_ ]?(profile|avatar|image|photo)/i.test(
        screened,
      )
    )
      return;
    if (
      /(?<![a-z])(?:header|icons?|qr|hero|background|nav|menu|search|arrow)(?![a-z])/i.test(
        screened,
      )
    )
      return;
    const identity = identitySignals(person, imageUrl, context, page, html);
    if (!identity.includes('name') || identity.length < 2) return;
    let score = 10 + identity.length * 5;
    if (/portrait|headshot|profile|photo|avatar|faculty|people|person|staff/.test(low)) score += 4;
    if (/\.(?:jpe?g|png|webp)(?:[/?#]|$)/i.test(imageUrl)) score += 5;
    candidates.push({
      imageUrl,
      page,
      identitySignals: identity,
      urlHasNameEvidence: hasNameEvidence(person.name, imageUrl),
      score,
    });
  };
  for (const match of html.matchAll(
    /<meta\b[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
  ))
    add(match[1], match[0]);
  for (const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi))
    add(match[1], match[0]);
  for (const match of html.matchAll(/\b(?:src|data-src|data-image|imageUrl)=["']([^"']+)["']/gi))
    add(match[1], match[0]);
  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi))
    for (const value of match[1].split(/,\s+/)) add(value.trim().split(/\s+/)[0], match[0]);
  // JSON values are only usable as absolute or root-relative URLs: a bare filename such as Pure's
  // "image" : "u1147545.jpg" isn't relative to the page and resolves to a path that doesn't exist.
  for (const match of html.matchAll(/"image"\s*:\s*"([^"]+)"/gi))
    if (/^(?:https?:)?\//i.test(match[1])) add(match[1], match[0]);
  for (const match of html.matchAll(
    /background-image\s*:\s*url\((?:["']?)([^)'"\s]+)(?:["']?)\)/gi,
  ))
    add(match[1], match[0]);
  return [
    ...new Map(
      candidates
        .sort((a, b) => b.score - a.score)
        .map((candidate) => [candidate.imageUrl, candidate]),
    ).values(),
  ];
}
async function discoveryPages(person: Person): Promise<Page[]> {
  const query = new URLSearchParams({
    q: `"${person.name}" "${person.university}" faculty portrait OR photo`,
  });
  let html: string;
  try {
    html = (await curl(`https://html.duckduckgo.com/html/?${query}`, 10)).toString('utf8');
  } catch {
    return [];
  }
  const urls = [
    ...html.matchAll(/result__a" href="\/\/duckduckgo\.com\/l\/\?uddg=([^&"]+)/gi),
  ].flatMap((match) => {
    try {
      return [decodeURIComponent(match[1]).replace(/&amp;/g, '&')];
    } catch {
      return [];
    }
  });
  return [...new Set(urls)]
    .filter(
      (url) =>
        /^https?:\/\//.test(url) &&
        !/linkedin|facebook|instagram|scholar\.google|wikipedia/i.test(new URL(url).hostname),
    )
    .slice(0, 5)
    .map((url) => ({ url, sourceType: 'authoritative_academic' as const, stored: false }));
}
function confidence(candidate: Candidate): Confidence {
  const directSource = candidate.page.sourceType !== 'authoritative_academic';
  const corroborated = candidate.identitySignals.some((signal) =>
    ['institution', 'department', 'rank'].includes(signal),
  );
  // Opaque image APIs and pages with only an alt-text association are useful leads, but are
  // review-only: a direct URL bearing the scholar's name is a cheap, reproducible extra guard
  // against a neighboring card or a page-wide hero image being selected automatically.
  return directSource &&
    corroborated &&
    candidate.identitySignals.includes('stored_roster_url') &&
    candidate.urlHasNameEvidence
    ? 'HIGH'
    : 'MEDIUM';
}
// Many official profile pages build the photo with JavaScript, so curl sees no <img>. When a stored
// page exposes no candidate, render it in headless Chromium (Playwright, already a dev dependency)
// and parse the rendered HTML. One browser is reused for the run; if Chromium isn't installed
// (`npx playwright install chromium`), the fallback is skipped and the run continues without it.
type RenderBrowser = {
  newPage: (options: { userAgent: string }) => Promise<{
    goto: (url: string, options: object) => Promise<unknown>;
    waitForTimeout: (ms: number) => Promise<void>;
    content: () => Promise<string>;
    close: () => Promise<void>;
  }>;
  close: () => Promise<void>;
};
let renderBrowser: RenderBrowser | null | undefined;
let renderedPages = 0;
async function startBrowser(): Promise<boolean> {
  if (args.has('--no-render')) return false;
  if (renderBrowser === undefined) {
    try {
      const { chromium } = await import('playwright');
      renderBrowser = (await chromium.launch()) as unknown as RenderBrowser;
    } catch (error) {
      console.error(`headless fallback unavailable: ${String(error).split('\n')[0]}`);
      renderBrowser = null;
    }
  }
  return renderBrowser !== null;
}
async function renderedHtml(url: string): Promise<string | null> {
  if (!(await startBrowser())) return null;
  const page = await (renderBrowser as RenderBrowser).newPage({ userAgent: browserUserAgent });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(4_000);
    renderedPages += 1;
    return await page.content();
  } catch {
    return null;
  } finally {
    await page.close().catch(() => undefined);
  }
}
async function renderedImage(url: string): Promise<Buffer | null> {
  if (!(await startBrowser())) return null;
  const page = await (renderBrowser as RenderBrowser).newPage({ userAgent: browserUserAgent });
  try {
    const response = (await page.goto(url, { waitUntil: 'load', timeout: 30_000 })) as {
      ok: () => boolean;
      headers: () => Record<string, string>;
      body: () => Promise<Buffer>;
    } | null;
    return response?.ok() && /^image\//.test(response.headers()['content-type'] ?? '')
      ? await response.body()
      : null;
  } catch {
    return null;
  } finally {
    await page.close().catch(() => undefined);
  }
}
function slug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}
async function fetchImage(url: string): Promise<Buffer | null> {
  const usable = (bytes: Buffer | null) =>
    bytes && bytes.length >= 1000 && bytes.length <= 15_000_000 ? bytes : null;
  try {
    const bytes = usable(await curl(url, 20));
    if (bytes) return bytes;
  } catch {
    /* CDNs that block curl often serve a browser */
  }
  return usable(await renderedImage(url));
}
async function archiveImage(bytes: Buffer, output: string): Promise<void> {
  const input = `${output}.source${extname(output) || '.bin'}`;
  await writeFile(input, bytes);
  const args = [input, '-auto-orient', '-strip', '-resize', '1200x1200>', '-quality', '86', output];
  // ImageMagick 6 (cloud sandbox) has `convert` but no `magick`.
  try {
    await execFileAsync('magick', args).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
      return execFileAsync('convert', args);
    });
  } finally {
    await unlink(input).catch(() => undefined);
  }
}
// Exactly one dominant face (scripts/portrait_faces.py). Aspect and skin-tone checks cannot tell a
// headshot from a lab group photo, a building, or a logo; this can. Needs opencv-python-headless.
const faceCheckPython = process.env.PORTRAIT_PYTHON ?? 'python3';
async function faceCheckAvailable(): Promise<boolean> {
  try {
    await execFileAsync(faceCheckPython, ['-c', 'import cv2, numpy, PIL']);
    return true;
  } catch {
    return false;
  }
}
async function faceVerdict(
  file: string,
): Promise<{ verdict: string; faces: number; error?: string }> {
  try {
    const { stdout } = await execFileAsync(faceCheckPython, [
      join(root, 'scripts/portrait_faces.py'),
      file,
    ]);
    return JSON.parse(stdout.trim().split('\n')[0]);
  } catch (error) {
    return { verdict: 'error', faces: 0, error: String(error).slice(0, 120) };
  }
}
async function isPortraitLike(output: string): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync('identify', ['-format', '%w %h', output]);
    const [width, height] = stdout.trim().split(/\s+/).map(Number);
    return width >= 120 && height >= 120 && width / height >= 0.7 && width / height <= 1.55;
  } catch {
    return false;
  }
}
async function loadLedger(): Promise<ProvenanceLedger> {
  try {
    return JSON.parse(await readFile(provenancePath, 'utf8')) as ProvenanceLedger;
  } catch {
    return { version: 1, entries: {} };
  }
}
async function loadQueue(people: Person[]): Promise<QueueItem[]> {
  try {
    return JSON.parse(await readFile(queuePath, 'utf8')) as QueueItem[];
  } catch {
    return people
      .filter((person) => !person.portrait)
      .map((person, index) => ({
        id: person.id,
        name: person.name,
        university: person.university,
        profileUrl: person.profileUrl,
        batch: Math.floor(index / 20) + 1,
        status: 'pending',
      }));
  }
}
// Keep the queue aligned with the roster: entries added after the queue was built are enqueued
// as pending, entries that gained a portrait elsewhere are marked fetched, entries whose portrait
// was removed are re-queued, and entries no longer in the roster are dropped.
function syncQueue(queue: QueueItem[], people: Person[]): QueueItem[] {
  const byId = new Map(people.map((person) => [person.id, person]));
  const synced = queue.filter((item) => byId.has(item.id));
  for (const item of synced) {
    const person = byId.get(item.id) as Person;
    if (person.portrait && item.status !== 'fetched') {
      item.status = 'fetched';
      item.portraitSource = person.portraitSource;
      item.note = 'portrait present in roster';
    } else if (!person.portrait && item.status === 'fetched') {
      item.status = 'pending';
      item.note = 'portrait no longer in roster';
    }
  }
  const queued = new Set(synced.map((item) => item.id));
  const added = people
    .filter((person) => !person.portrait && !queued.has(person.id))
    .sort((a, b) => b.id.localeCompare(a.id));
  const nextBatch = Math.max(0, ...synced.map((item) => item.batch)) + 1;
  added.forEach((person, index) =>
    synced.push({
      id: person.id,
      name: person.name,
      university: person.university,
      profileUrl: person.profileUrl,
      batch: nextBatch + Math.floor(index / 10),
      status: 'pending',
    }),
  );
  return synced;
}
// --next=N: never-attempted entries first, newest roster id first (fresh profile URLs, just
// verified). Only when none remain, and with --retry, unresolved entries least recently attempted.
function nextIds(queue: QueueItem[], ledger: ProvenanceLedger, count: number): Set<string> {
  const pending = queue
    .filter((item) => item.status === 'pending')
    .sort((a, b) => b.id.localeCompare(a.id));
  if (pending.length || !retry) return new Set(pending.slice(0, count).map((item) => item.id));
  const attempted = (item: QueueItem) => ledger.entries[item.id]?.retrievedAt ?? '';
  const unresolved = queue
    .filter((item) => item.status === 'unresolved')
    .sort((a, b) => attempted(a).localeCompare(attempted(b)) || b.id.localeCompare(a.id));
  return new Set(unresolved.slice(0, count).map((item) => item.id));
}
async function auditIds(): Promise<Set<string>> {
  const fixture = JSON.parse(await readFile(fixturePath, 'utf8')) as AuditFixture;
  return new Set([
    ...fixture.knownGood,
    ...fixture.missing,
    ...fixture.knownBad,
    ...fixture.blocked,
    ...fixture.commonNames,
  ]);
}

const people = JSON.parse(await readFile(dataPath, 'utf8')) as Person[];
const queue = syncQueue(await loadQueue(people), people);
const ledger = await loadLedger();
async function writeQueue() {
  await writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`);
}
if (args.has('--status')) {
  if (args.has('--sync')) await writeQueue();
  const newestPending = queue
    .filter((item) => item.status === 'pending')
    .map((item) => item.id)
    .sort()
    .reverse()
    .slice(0, 10);
  console.log(
    JSON.stringify(
      {
        queue: queue.reduce<Record<string, number>>((counts, item) => {
          counts[item.status] = (counts[item.status] ?? 0) + 1;
          return counts;
        }, {}),
        provenance: Object.keys(ledger.entries).length,
        newestPending,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}
// --store=vp-0001,vp-0002: store each entry's ledger candidate (a `needs_review` imageUrl) after a
// person has looked at it next to the page. The size, aspect, and face checks still apply.
const storeArgument = process.argv.find((arg) => arg.startsWith('--store='));
if (storeArgument) {
  if (!(await faceCheckAvailable()))
    throw new Error(
      `face check unavailable: run 'pip install opencv-python-headless pillow numpy' (or set PORTRAIT_PYTHON)`,
    );
  const results: Array<Record<string, unknown>> = [];
  for (const id of storeArgument
    .slice('--store='.length)
    .split(',')
    .filter((value) => /^vp-\d{4}$/.test(value))) {
    const person = people.find((candidate) => candidate.id === id);
    const entry = ledger.entries[id];
    if (!person || !entry?.imageUrl) {
      results.push({ id, result: 'skipped: no ledger candidate' });
      continue;
    }
    if (
      person.portrait ||
      person.directFields?.includes('portrait') ||
      person.directFields?.includes('portraitSource')
    ) {
      results.push({ id, result: 'skipped: has or protects a portrait' });
      continue;
    }
    const bytes = await fetchImage(entry.imageUrl);
    if (!bytes) {
      results.push({ id, result: 'failed: image could not be downloaded' });
      continue;
    }
    const portrait = join('portraits', `${person.id}-${slug(person.name)}.webp`);
    const output = join(root, 'public', portrait);
    const temporary = `${output}.candidate.webp`;
    try {
      await archiveImage(bytes, temporary);
    } catch {
      results.push({ id, result: 'failed: could not convert' });
      continue;
    }
    if (!(await isPortraitLike(temporary))) {
      await unlink(temporary).catch(() => undefined);
      results.push({ id, result: 'failed: 120x120 or portrait-aspect validation' });
      continue;
    }
    const face = await faceVerdict(temporary);
    if (face.verdict !== 'ok') {
      await unlink(temporary).catch(() => undefined);
      results.push({ id, result: `failed: face check ${face.verdict} (${face.faces} faces)` });
      continue;
    }
    await rename(temporary, output);
    person.portrait = portrait;
    person.portraitSource = entry.imageUrl;
    ledger.entries[id] = {
      ...entry,
      outcome: 'found',
      retrievedAt: new Date().toISOString(),
      note: 'MEDIUM candidate stored after visual review',
    };
    const item = queue.find((queued) => queued.id === id);
    if (item) {
      item.status = 'fetched';
      item.portraitSource = entry.imageUrl;
      item.note = 'visually reviewed candidate';
    }
    results.push({ id, result: 'stored', portrait });
  }
  await writeFile(provenancePath, `${JSON.stringify(ledger, null, 2)}\n`);
  await writeFile(dataPath, `${JSON.stringify(people, null, 2)}\n`);
  await writeQueue();
  console.log(JSON.stringify({ mode: 'store', results }, null, 2));
  process.exit(0);
}
// --review: list `needs_review` candidates for entries still missing a portrait, oldest first.
if (args.has('--review')) {
  const missing = new Set(people.filter((person) => !person.portrait).map((person) => person.id));
  const pending = Object.entries(ledger.entries)
    .filter(([id, entry]) => missing.has(id) && entry.outcome === 'needs_review' && entry.imageUrl)
    .sort(([, a], [, b]) => a.retrievedAt.localeCompare(b.retrievedAt));
  console.log(
    JSON.stringify(
      pending.map(([id, entry]) => ({
        id,
        name: entry.name,
        pageUrl: entry.pageUrl,
        imageUrl: entry.imageUrl,
      })),
      null,
      2,
    ),
  );
  process.exit(0);
}
const audit = args.has('--sample');
if (explicitIds) {
  for (const person of people.filter((candidate) => explicitIds.has(candidate.id))) {
    if (!queue.some((item) => item.id === person.id))
      queue.push({
        id: person.id,
        name: person.name,
        university: person.university,
        profileUrl: person.profileUrl,
        batch: requestedBatch,
        status: 'pending',
      });
  }
}
const selectedIds = audit
  ? await auditIds()
  : (explicitIds ??
    (nextCount > 0 ? nextIds(queue, ledger, nextCount) : null) ??
    new Set(
      queue
        .filter(
          (item) =>
            item.batch === requestedBatch &&
            (item.status === 'pending' || (retry && item.status === 'unresolved')),
        )
        .map((item) => item.id),
    ));
const selected = people.filter(
  (person) => selectedIds.has(person.id) && (!person.portrait || replaceExisting || audit),
);
await mkdir(portraitsDir, { recursive: true });
if (applying && !(await faceCheckAvailable()))
  throw new Error(
    `face check unavailable: run 'pip install opencv-python-headless pillow numpy' (or set PORTRAIT_PYTHON to a Python that has them); refusing to store portraits unchecked`,
  );
const report: Array<Record<string, unknown>> = [];
for (const person of selected) {
  const protectedPortrait =
    person.directFields?.includes('portrait') || person.directFields?.includes('portraitSource');
  const now = new Date().toISOString();
  if (protectedPortrait) {
    ledger.entries[person.id] = {
      name: person.name,
      outcome: 'protected',
      identitySignals: [],
      retrievedAt: now,
      note: 'portrait or portraitSource is protected by directFields',
    };
    report.push({ id: person.id, name: person.name, result: 'protected' });
    continue;
  }
  const candidates: Candidate[] = [];
  for (const page of sourcePages(person)) {
    let found: Candidate[] = [];
    try {
      found = imageCandidates((await curl(page.url, 20)).toString('utf8'), page, person);
    } catch {
      /* blocked or a challenge page: try rendering */
    }
    if (found.length === 0) {
      const html = await renderedHtml(page.url);
      if (html) found = imageCandidates(html, page, person);
    }
    candidates.push(...found);
  }
  // Search is a fallback discovery route, never an image source on its own. Avoid it when a
  // stored page already exposed an identity-resolved candidate.
  if (candidates.length === 0)
    for (const page of await discoveryPages(person))
      try {
        candidates.push(
          ...imageCandidates((await curl(page.url, 20)).toString('utf8'), page, person),
        );
      } catch {
        /* use another discovery route */
      }
  const candidate = [
    ...new Map(
      candidates.sort((a, b) => b.score - a.score).map((item) => [item.imageUrl, item]),
    ).values(),
  ][0];
  if (!candidate) {
    ledger.entries[person.id] = {
      name: person.name,
      outcome: 'not_found',
      identitySignals: [],
      retrievedAt: now,
      note: 'no identity-verified candidate exposed by inspected pages',
    };
    const item = queue.find((queued) => queued.id === person.id);
    if (item) item.status = 'unresolved';
    report.push({ id: person.id, name: person.name, result: 'not_found' });
    continue;
  }
  const level = confidence(candidate);
  const entry: ProvenanceEntry = {
    name: person.name,
    outcome: level === 'HIGH' ? 'found' : 'needs_review',
    pageUrl: candidate.page.url,
    imageUrl: candidate.imageUrl,
    sourceType: candidate.page.sourceType,
    confidence: level,
    identitySignals: candidate.identitySignals,
    retrievedAt: now,
  };
  if (!applying || level !== 'HIGH' || (person.portrait && !replaceExisting)) {
    ledger.entries[person.id] = {
      ...entry,
      outcome: level === 'HIGH' ? 'needs_review' : entry.outcome,
      note: applying
        ? 'candidate requires visual review before acceptance'
        : 'dry run; rerun with --apply after review',
    };
    if (applying) {
      const item = queue.find((queued) => queued.id === person.id);
      if (item) item.status = 'unresolved';
    }
    report.push({
      id: person.id,
      name: person.name,
      result: ledger.entries[person.id].outcome,
      source: candidate.page.sourceType,
      confidence: level,
    });
    continue;
  }
  const bytes = await fetchImage(candidate.imageUrl);
  // Every not_found outcome marks the queue item attempted, so --next moves on to other entries.
  const markUnresolved = () => {
    const queued = queue.find((item) => item.id === person.id);
    if (queued) queued.status = 'unresolved';
  };
  if (!bytes) {
    ledger.entries[person.id] = {
      ...entry,
      outcome: 'not_found',
      note: 'candidate image could not be downloaded',
    };
    markUnresolved();
    report.push({
      id: person.id,
      name: person.name,
      result: 'not_found',
      source: candidate.page.sourceType,
      confidence: level,
    });
    continue;
  }
  const portrait = join('portraits', `${person.id}-${slug(person.name)}.webp`);
  const output = join(root, 'public', portrait);
  const temporary = `${output}.candidate.webp`;
  try {
    await archiveImage(bytes, temporary);
  } catch {
    ledger.entries[person.id] = {
      ...entry,
      outcome: 'not_found',
      note: 'candidate could not be converted to a local image',
    };
    markUnresolved();
    report.push({
      id: person.id,
      name: person.name,
      result: 'not_found',
      source: candidate.page.sourceType,
      confidence: level,
    });
    continue;
  }
  if (!(await isPortraitLike(temporary))) {
    await unlink(temporary).catch(() => undefined);
    ledger.entries[person.id] = {
      ...entry,
      outcome: 'not_found',
      note: 'candidate failed 120x120 or portrait-aspect validation',
    };
    markUnresolved();
    report.push({
      id: person.id,
      name: person.name,
      result: 'not_found',
      source: candidate.page.sourceType,
      confidence: level,
    });
    continue;
  }
  const face = await faceVerdict(temporary);
  if (face.verdict !== 'ok') {
    await unlink(temporary).catch(() => undefined);
    ledger.entries[person.id] = {
      ...entry,
      outcome: 'not_found',
      note: `candidate failed face check: ${face.verdict} (${face.faces} faces)${face.error ? ` ${face.error}` : ''}`,
    };
    markUnresolved();
    report.push({
      id: person.id,
      name: person.name,
      result: 'not_found',
      source: candidate.page.sourceType,
      confidence: level,
      faceCheck: face.verdict,
    });
    continue;
  }
  await rename(temporary, output);
  person.portrait = portrait;
  person.portraitSource = candidate.imageUrl;
  ledger.entries[person.id] = entry;
  const item = queue.find((queued) => queued.id === person.id);
  if (item) {
    item.status = 'fetched';
    item.portraitSource = candidate.imageUrl;
    item.note = `HIGH-confidence ${candidate.page.sourceType}`;
  }
  report.push({
    id: person.id,
    name: person.name,
    result: 'correct portrait found',
    source: candidate.page.sourceType,
    confidence: level,
  });
}
await renderBrowser?.close().catch(() => undefined);
if (renderedPages) console.error(`rendered ${renderedPages} page(s) in headless Chromium`);
await writeFile(provenancePath, `${JSON.stringify(ledger, null, 2)}\n`);
if (applying) {
  await writeFile(dataPath, `${JSON.stringify(people, null, 2)}\n`);
  await writeQueue();
}
console.log(
  JSON.stringify(
    {
      mode: audit
        ? 'sample'
        : explicitIds
          ? `explicit-${explicitIds.size}`
          : nextCount > 0
            ? `next-${nextCount}`
            : `batch-${requestedBatch}`,
      applying,
      results: report,
    },
    null,
    2,
  ),
);
