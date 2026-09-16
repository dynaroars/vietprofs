#!/usr/bin/env -S npx --no-install tsx

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

interface UrlEntry {
  id: string;
  name: string;
  field: string;
  url: string;
}

interface BrokenResult extends UrlEntry {
  status: number | 'ERROR';
  errorDetail?: string;
  redirectUrl?: string;
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

async function fastAudit() {
  const rosterPath = resolve('public/data.json');
  const roster = JSON.parse(await readFile(rosterPath, 'utf8'));

  const entries: UrlEntry[] = [];
  for (const person of roster) {
    for (const field of ['profileUrl', 'websiteUrl', 'labUrl', 'scholarUrl', 'linkedinUrl', 'portraitSource']) {
      if (person[field] && typeof person[field] === 'string') {
        entries.push({ id: person.id, name: person.name, field, url: person[field] });
      }
    }
  }

  console.log(`🚀 Starting fast audit of ${entries.length} URLs (concurrency 64)...`);

  const broken: BrokenResult[] = [];
  let index = 0;
  let done = 0;

  async function checkOne(entry: UrlEntry): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      let res = await fetch(entry.url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT },
      });

      if (res.status === 405 || res.status === 403 || res.status === 400) {
        res = await fetch(entry.url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'User-Agent': USER_AGENT },
        });
      }

      // LinkedIn 999 or 403 is anti-bot, treat as ok
      if (entry.url.includes('linkedin.com') && (res.status === 999 || res.status === 403)) {
        return;
      }

      if (!res.ok) {
        broken.push({ ...entry, status: res.status, redirectUrl: res.url !== entry.url ? res.url : undefined });
      }
    } catch (err) {
      // Retry once with GET
      try {
        const res2 = await fetch(entry.url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'User-Agent': USER_AGENT },
        });
        if (entry.url.includes('linkedin.com') && (res2.status === 999 || res2.status === 403)) {
          return;
        }
        if (!res2.ok) {
          broken.push({ ...entry, status: res2.status, redirectUrl: res2.url !== entry.url ? res2.url : undefined });
        }
      } catch (err2: any) {
        broken.push({ ...entry, status: 'ERROR', errorDetail: err2.message || String(err2) });
      }
    } finally {
      clearTimeout(timer);
    }
  }

  async function worker() {
    while (index < entries.length) {
      const i = index++;
      await checkOne(entries[i]);
      done++;
      if (done % 200 === 0 || done === entries.length) {
        process.stdout.write(`\rProgress: ${done}/${entries.length} checked...`);
      }
    }
  }

  await Promise.all(Array.from({ length: 64 }, worker));
  console.log(`\n\n📊 Audit Complete. Checked: ${entries.length}, Broken Found: ${broken.length}`);

  const reportPath = resolve('maintenance/broken-links-fast.json');
  await writeFile(reportPath, JSON.stringify({ checkedAt: new Date().toISOString(), totalChecked: entries.length, broken }, null, 2));
  console.log(`Report written to ${reportPath}`);
}

await fastAudit();
