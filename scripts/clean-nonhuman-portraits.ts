#!/usr/bin/env -S npx --no-install tsx

import { readFile, writeFile, unlink } from 'node:fs/promises';
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
  [key: string]: unknown;
}

async function cleanNonHumanPortraits() {
  const dataPath = resolve('public/data.json');
  const roster: Person[] = JSON.parse(await readFile(dataPath, 'utf8'));

  console.log(`🧹 Cleaning non-human, stock, banner, and logo portraits across ${roster.length} entries...\n`);

  let removedCount = 0;
  const removedEntries: Array<{ id: string; name: string; reason: string }> = [];

  for (const p of roster) {
    if (!p.portrait) continue;

    // Do not alter protected directFields
    if (p.directFields?.includes('portrait') || p.directFields?.includes('portraitSource')) {
      console.log(`🛡️ Skipping protected directFields portrait on [${p.id}] ${p.name}`);
      continue;
    }

    const file = resolve('public', p.portrait);
    if (!existsSync(file)) {
      delete p.portrait;
      delete p.portraitSource;
      removedCount++;
      removedEntries.push({ id: p.id, name: p.name, reason: 'Missing file on disk' });
      continue;
    }

    let isNonHuman = false;
    let reason = '';

    // Check suspicious source URLs
    if (p.portraitSource) {
      const src = p.portraitSource.toLowerCase();
      if (/facebook|twitter|linkedin|social-footer|uhd-footer|ico-youtube|bgBanner|dfs_image|animal-protein-bacteria|HCT_and_Siemens|Livet\+som\+student|ZeitounCancer/i.test(src)) {
        isNonHuman = true;
        reason = `Non-human/stock URL pattern: ${p.portraitSource}`;
      }
    }

    // Check aspect ratio if not already flagged
    if (!isNonHuman) {
      try {
        const { stdout } = await execFileAsync('identify', ['-format', '%w %h', file]);
        const [w, h] = stdout.trim().split(/\s+/).map(Number);
        const ratio = w / h;
        if (ratio > 1.45 || ratio < 0.5) {
          isNonHuman = true;
          reason = `Extreme non-portrait aspect ratio (${w}x${h}, ratio ${ratio.toFixed(2)})`;
        }
      } catch {}
    }

    if (isNonHuman) {
      console.log(`❌ Removing non-human portrait on [${p.id}] ${p.name}: ${reason}`);
      delete p.portrait;
      delete p.portraitSource;
      removedCount++;
      removedEntries.push({ id: p.id, name: p.name, reason });

      // Unlink local file
      await unlink(file).catch(() => undefined);
    }
  }

  await writeFile(dataPath, JSON.stringify(roster, null, 2) + '\n');
  console.log(`\n✅ Cleaned ${removedCount} non-human/stock portraits.`);
}

await cleanNonHumanPortraits();
