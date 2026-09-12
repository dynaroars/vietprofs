import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

type Person = {
  id: string;
  name: string;
  university: string;
  profileUrl: string;
  portrait?: string;
  portraitSource?: string;
  directFields?: string[];
  lastUpdatedAt: string;
};

type QueueItem = {
  id: string;
  name: string;
  university: string;
  profileUrl: string;
  batch: number;
  recoveryBatch?: number;
  status: 'pending' | 'fetched' | 'unresolved';
  portraitSource?: string;
  note?: string;
};

const execFileAsync = promisify(execFile);
const root = resolve('.');
const dataPath = join(root, 'public/data.json');
const queuePath = join(root, 'maintenance/portrait-queue.json');
const missingPath = join(root, 'maintenance/missing-portraits.json');
const todoPath = join(root, 'maintenance/portrait-todo.md');
const portraitsDir = join(root, 'public/portraits');
const userAgent = 'VietProfs portrait maintenance (https://vietroars.roars.dev)';

async function curl(url: string, maxTime: number): Promise<Buffer> {
  const { stdout } = await execFileAsync('curl', [
    '-L', '--fail', '--silent', '--show-error', '--max-time', String(maxTime),
    '-A', userAgent, url,
  ], { encoding: 'buffer', maxBuffer: 20_000_000 });
  return stdout as Buffer;
}

function absoluteUrl(value: string, base: string): string {
  try { return new URL(value, base).href; } catch { return ''; }
}

function cleanUrl(value: string): string {
  return value.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
}

function normalizedWords(value: string): string[] {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .split(/[^a-z0-9]+/).filter(Boolean);
}

function hasStrongNameEvidence(name: string, value: string): boolean {
  const nameWords = normalizedWords(name);
  const haystack = normalizedWords(value);
  if (nameWords.length < 2) return false;
  const matched = new Set(haystack.filter((word) => nameWords.includes(word)));
  return matched.size >= Math.min(2, nameWords.length);
}

function imageCandidates(html: string, pageUrl: string, name: string): string[] {
  const candidates: Array<{ url: string; score: number }> = [];
  const add = (raw: string, context: string) => {
    const url = absoluteUrl(cleanUrl(raw), pageUrl);
    if (!url || !/^https?:\/\//i.test(url)) return;
    const low = `${url} ${context}`.toLowerCase();
    if (/no[-_ ]?(portrait|photo|image)|placeholder|logo|header|favicon|icon|sprite|gravatar|qr|wordmark|monogram|banner|hero|background|nav|menu|search|arrow|no_photo|nophoto|profile_no_photo|blank|blank_profile|default_profile|profile_placeholder|silhouette/i.test(low)) return;
    if (!hasStrongNameEvidence(name, `${url} ${context}`)) return;
    let score = 0;
    if (/portrait|headshot|profile|photo|avatar|faculty|people|person|staff|image/.test(low)) score += 4;
    if (/\.(?:jpe?g|png|webp)(?:[/?#]|$)/i.test(url)) score += 5;
    score += 10;
    if (/class=["'][^"']*\b(image|portrait|photo)[^"']*["']/.test(context)) score += 5;
    candidates.push({ url, score });
  };
  for (const match of html.matchAll(/<meta\b[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) add(match[1], match[0]);
  for (const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) add(match[1], match[0]);
  for (const match of html.matchAll(/\b(?:src|data-src|data-image|imageUrl)=["']([^"']+)["']/gi)) add(match[1], match[0]);
  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(',').map((value) => value.trim().split(/\s+/)[0]).filter(Boolean)) add(candidate, match[0]);
  }
  for (const match of html.matchAll(/"image"\s*:\s*"([^"]+)"/gi)) add(match[1], match[0]);
  const unique = [...new Map(candidates.sort((a, b) => b.score - a.score).map((entry) => [entry.url, entry])).values()];
  return unique.map((entry) => entry.url);
}

async function alternatePageUrls(person: QueueItem): Promise<string[]> {
  const query = new URLSearchParams({ q: `"${person.name}" "${person.university}" faculty portrait OR photo` });
  let html: string;
  try { html = (await curl(`https://html.duckduckgo.com/html/?${query}`, 10)).toString('utf8'); } catch { return []; }
  const urls: string[] = [];
  for (const match of html.matchAll(/result__a" href="\/\/duckduckgo\.com\/l\/\?uddg=([^&"]+)/gi)) {
    try { urls.push(decodeURIComponent(match[1]).replace(/&amp;/g, '&')); } catch { /* ignore malformed result */ }
  }
  const profileHost = new URL(person.profileUrl).hostname;
  return [...new Set(urls)].filter((url) => {
    try {
      const host = new URL(url).hostname;
      return host === profileHost || (!/linkedin|facebook|instagram|scholar\.google|wikipedia/i.test(host) && /https?:\/\//.test(url));
    } catch { return false; }
  }).slice(0, 3);
}

function slug(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
}

async function fetchImage(url: string): Promise<Buffer | null> {
  let bytes: Buffer;
  try { bytes = await curl(url, 20); } catch { return null; }
  if (bytes.length < 1000 || bytes.length > 15_000_000) return null;
  return bytes;
}

async function archiveImage(bytes: Buffer, output: string): Promise<void> {
  const input = `${output}.source${extname(output) || '.bin'}`;
  await writeFile(input, bytes);
  try {
    await execFileAsync('magick', [input, '-auto-orient', '-strip', '-resize', '1200x1200>', '-quality', '86', output]);
  } finally {
    await unlink(input).catch((): undefined => undefined);
  }
}

async function isPortraitLike(output: string): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync('identify', ['-format', '%w %h', output]);
    const [width, height] = stdout.trim().split(/\s+/).map(Number);
    return width >= 120 && height >= 120 && width / height <= 1.55;
  } catch { return false; }
}

async function loadQueue(people: Person[]): Promise<QueueItem[]> {
  try { return JSON.parse(await readFile(queuePath, 'utf8')) as QueueItem[]; } catch { /* initialize below */ }
  const missing = people.filter((person) => !person.portrait);
  const queue = missing.map((person, index) => ({
    id: person.id,
    name: person.name,
    university: person.university,
    profileUrl: person.profileUrl,
    batch: Math.floor(index / 20) + 1,
    status: 'pending' as const,
  }));
  await writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`);
  return queue;
}

const args = new Set(process.argv.slice(2));
const requestedBatch = Number(process.argv.find((arg) => /^\d+$/.test(arg)) ?? '1');
const people = JSON.parse(await readFile(dataPath, 'utf8')) as Person[];
const queue = await loadQueue(people);
const retry = args.has('--retry');
const recovery = args.has('--recovery');
let recoveryIndex = 0;
for (const item of queue) {
  if (item.status === 'unresolved' && item.recoveryBatch === undefined) {
    item.recoveryBatch = Math.floor(recoveryIndex / 20) + 1;
    recoveryIndex += 1;
  }
}
await writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`);
const batch = recovery
  ? queue.filter((item) => item.status === 'unresolved' && item.recoveryBatch === requestedBatch)
  : queue.filter((item) => item.batch === requestedBatch && (retry || item.status === 'pending'));
await mkdir(portraitsDir, { recursive: true });

await Promise.all(batch.map(async (item) => {
  process.stdout.write(`batch ${requestedBatch}: ${item.name} ... `);
  const person = people.find((entry) => entry.id === item.id)!;
  const portraitProtected = person.directFields?.includes('portrait') || person.directFields?.includes('portraitSource');
  if (retry && portraitProtected) {
    item.status = 'fetched';
    item.note = 'portrait protected by direct update';
    console.log('protected');
    return;
  }
  try {
    const pageUrls = [item.profileUrl, ...(await alternatePageUrls(item))];
    const candidateGroups = await Promise.all([...new Set(pageUrls)].map(async (pageUrl) => {
      try {
        return imageCandidates((await curl(pageUrl, 20)).toString('utf8'), pageUrl, item.name);
      } catch { return []; /* try the next alternate page */ }
    }));
    const candidates = [...new Set(candidateGroups.flat())];
    let found = false;
    for (const source of candidates.slice(0, 8)) {
      try {
        const bytes = await fetchImage(source);
        if (!bytes) continue;
        const output = join('portraits', `${item.id}-${slug(item.name)}.webp`);
        const outputFile = join(root, 'public', output);
        const candidateFile = `${outputFile}.candidate.webp`;
        await archiveImage(bytes, candidateFile);
        if (!(await isPortraitLike(candidateFile))) {
          await unlink(candidateFile).catch((): undefined => undefined);
          continue;
        }
        await rename(candidateFile, outputFile);
        person.portrait = output;
        person.portraitSource = source;
        person.lastUpdatedAt = new Date().toISOString();
        item.status = 'fetched';
        item.portraitSource = source;
        found = true;
        break;
      } catch { /* try the next candidate */ }
    }
    if (!found) {
      item.status = person.portrait ? 'fetched' : 'unresolved';
      item.note = candidates.length
        ? (person.portrait ? 'no verified replacement; existing portrait preserved' : 'candidates failed portrait validation')
        : 'profile page exposed no verified person-specific portrait candidate';
    }
    console.log(item.status === 'fetched' ? 'fetched' : 'unresolved');
  } catch (error) {
    item.status = 'unresolved';
    item.note = error instanceof Error ? error.message : String(error);
    console.log(`unresolved (${item.note})`);
  }
}));

await writeFile(dataPath, `${JSON.stringify(people, null, 2)}\n`);
await writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`);

if (args.has('--repair-paths')) {
  for (const person of people) {
    if (person.portrait?.startsWith('public/')) person.portrait = person.portrait.slice('public/'.length);
  }
  await writeFile(dataPath, `${JSON.stringify(people, null, 2)}\n`);
}

await writeFile(missingPath, `${JSON.stringify(queue.filter((item) => item.status === 'unresolved'), null, 2)}\n`);

if (recovery && batch.length) {
  const todo = await readFile(todoPath, 'utf8').catch(() => '');
  const marker = `Batch ${String(requestedBatch).padStart(2, '0')} —`;
  const updatedTodo = todo.split('\n').map((line) => line.includes(marker) && line.startsWith('- [ ]')
    ? line.replace('- [ ]', '- [x]') + ' (alternate-source pass attempted)'
    : line).join('\n');
  await writeFile(todoPath, updatedTodo);
}

if (args.has('--status')) {
  const counts = queue.reduce<Record<string, number>>((result, item) => { result[item.status] = (result[item.status] ?? 0) + 1; return result; }, {});
  console.log(JSON.stringify(counts));
}
