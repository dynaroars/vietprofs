// Checks every URL stored in the roster (profile/website/scholar/portrait sources and honor
// sources) for reachability. Network-dependent and slow (~2,500+ requests), so it's a separate,
// manually-run script rather than part of `npm test` — run it periodically or after a batch
// import, not on every commit.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rosterFile = resolve('public/data.json');
const roster = JSON.parse(await readFile(rosterFile, 'utf8'));

interface UrlEntry {
  id: string;
  name: string;
  field: string;
  url: string;
}

const entries: UrlEntry[] = [];
for (const person of roster) {
  for (const field of ['profileUrl', 'websiteUrl', 'scholarUrl', 'linkedinUrl', 'portraitSource']) {
    if (person[field]) entries.push({ id: person.id, name: person.name, field, url: person[field] });
  }
  for (const honor of person.honors ?? []) {
    if (honor.source) entries.push({ id: person.id, name: person.name, field: `honor "${honor.name}"`, url: honor.source });
  }
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const TIMEOUT_MS = 15000;
const CONCURRENCY = 12;

async function checkOne(entry: UrlEntry): Promise<UrlEntry & { status: number | 'ERROR'; ok: boolean }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res: Response;
    try {
      res = await fetch(entry.url, { method: 'HEAD', redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': USER_AGENT } });
      // Some servers reject HEAD (405) or bot-check it differently (403); retry with GET.
      if (res.status === 405 || res.status === 403) {
        res = await fetch(entry.url, { method: 'GET', redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': USER_AGENT } });
      }
    } catch {
      res = await fetch(entry.url, { method: 'GET', redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': USER_AGENT } });
    }
    return { ...entry, status: res.status, ok: res.ok };
  } catch (err) {
    return { ...entry, status: 'ERROR', ok: false };
  } finally {
    clearTimeout(timeout);
  }
}

async function runPool<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  let done = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
      done++;
      if (done % 200 === 0) console.error(`  ${done}/${items.length} checked...`);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

console.error(`Checking ${entries.length} URLs (concurrency ${CONCURRENCY})...`);
const results = await runPool(entries, CONCURRENCY, checkOne);
const broken = results.filter((r) => !r.ok);

if (broken.length === 0) {
  console.log(`All ${results.length} URLs are reachable.`);
} else {
  console.log(`${broken.length}/${results.length} URLs are broken:\n`);
  for (const r of broken) {
    console.log(`  ${r.id}\t${r.name}\t${r.field}\t${r.status}\t${r.url}`);
  }
  process.exitCode = 1;
}
