import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type Entry = { id: string; name: string; field: string; url: string };
type Result = Entry & { status: number | 'ERROR'; ok: boolean };

const roster = JSON.parse(await readFile(resolve('public/data.json'), 'utf8')) as Array<Record<string, unknown>>;
const entries: Entry[] = [];
const seen = new Set<string>();
for (const person of roster) {
  for (const field of ['profileUrl', 'scholarUrl', 'portraitSource']) {
    if (typeof person[field] === 'string') {
      const url = person[field] as string;
      const key = `${field}\u0000${url}`;
      if (!seen.has(key)) {
        seen.add(key);
        entries.push({ id: person.id as string, name: person.name as string, field, url });
      }
    }
  }
}

async function check(entry: Entry): Promise<Result> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    let response = await fetch(entry.url, { method: 'HEAD', redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'Mozilla/5.0' } });
    if (response.status === 403 || response.status === 405) {
      response = await fetch(entry.url, { method: 'GET', redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'Mozilla/5.0' } });
    }
    return { ...entry, status: response.status, ok: response.ok };
  } catch {
    return { ...entry, status: 'ERROR', ok: false };
  } finally {
    clearTimeout(timer);
  }
}

const results: Result[] = [];
let next = 0;
async function worker(): Promise<void> {
  while (next < entries.length) {
    const index = next++;
    results[index] = await check(entries[index]);
  }
}
await Promise.all(Array.from({ length: 24 }, worker));
await writeFile(resolve('maintenance/link-repair-sweep.json'), `${JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2)}\n`);
const broken = results.filter((result) => !result.ok);
const counts = broken.reduce<Record<string, number>>((all, result) => { all[String(result.status)] = (all[String(result.status)] ?? 0) + 1; return all; }, {});
console.log(JSON.stringify({ checked: results.length, broken: broken.length, counts }, null, 2));
