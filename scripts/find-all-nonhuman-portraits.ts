#!/usr/bin/env -S npx --no-install tsx

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';

const execFileAsync = promisify(execFile);

interface Person {
  id: string;
  name: string;
  university: string;
  portrait?: string;
  portraitSource?: string;
  directFields?: string[];
}

async function scanNonHumanPortraits() {
  const dataPath = resolve('public/data.json');
  const roster: Person[] = JSON.parse(await readFile(dataPath, 'utf8'));

  console.log(`🔍 Scanning all ${roster.length} roster entries for non-human or improper portraits...\n`);

  const nonHumanEntries: Array<{ id: string; name: string; university: string; reason: string; portrait?: string; portraitSource?: string }> = [];

  for (const p of roster) {
    if (!p.portrait) continue;

    const file = resolve('public', p.portrait);
    if (!existsSync(file)) continue;

    // Check dimensions using `identify`
    try {
      const { stdout } = await execFileAsync('identify', ['-format', '%w %h', file]);
      const [w, h] = stdout.trim().split(/\s+/).map(Number);
      const ratio = w / h;

      // Same 0.70–1.55 portrait band as fetch-portraits.ts and TASKS/fetch_portraits.md.
      if (ratio > 1.55 || ratio < 0.7) {
        nonHumanEntries.push({
          id: p.id,
          name: p.name,
          university: p.university,
          reason: `Non-portrait aspect ratio (${w}x${h}, ratio ${ratio.toFixed(2)})`,
          portrait: p.portrait,
          portraitSource: p.portraitSource,
        });
        continue;
      }
    } catch {}

    // Check suspicious source URLs
    if (p.portraitSource) {
      const src = p.portraitSource.toLowerCase();
      if (/facebook|twitter|linkedin|social-footer|uhd-footer|building|logo|banner|header|icon|placeholder|default.*avatar/i.test(src)) {
        nonHumanEntries.push({
          id: p.id,
          name: p.name,
          university: p.university,
          reason: `Suspicious source URL pattern: ${p.portraitSource}`,
          portrait: p.portrait,
          portraitSource: p.portraitSource,
        });
      }
    }
  }

  console.log(`📊 Found ${nonHumanEntries.length} entries with non-human / banner / stock / placeholder portraits:\n`);
  for (const item of nonHumanEntries) {
    console.log(`- [${item.id}] ${item.name} (${item.university}):`);
    console.log(`    Reason: ${item.reason}`);
    console.log(`    Portrait: ${item.portrait}`);
    console.log(`    Source:   ${item.portraitSource}\n`);
  }
}

await scanNonHumanPortraits();
