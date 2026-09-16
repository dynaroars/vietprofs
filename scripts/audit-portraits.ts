#!/usr/bin/env -S npx --no-install tsx

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';

interface RosterEntry {
  id: string;
  name: string;
  university: string;
  portrait?: string;
  portraitSource?: string;
  directFields?: string[];
  [key: string]: unknown;
}

async function auditPortraits() {
  const rosterPath = resolve('public/data.json');
  const roster: RosterEntry[] = JSON.parse(await readFile(rosterPath, 'utf8'));

  console.log(`🔍 Auditing portraits across ${roster.length} roster entries...\n`);

  const hashToEntries = new Map<string, RosterEntry[]>();
  const suspiciousSources: Array<{ entry: RosterEntry; reason: string }> = [];
  const missingFiles: RosterEntry[] = [];
  const smallFiles: Array<{ entry: RosterEntry; size: number }> = [];

  const SUSPICIOUS_KEYWORDS = [
    'facebook.png',
    'twitter.svg',
    'linkedin.png',
    'default',
    'placeholder',
    'avatar',
    'building',
    'logo',
    'icon',
    'no-photo',
    'noprofile',
    'stock',
    'generic',
    'social-footer',
  ];

  for (const entry of roster) {
    if (entry.portrait) {
      const localPath = resolve('public', entry.portrait);
      if (!existsSync(localPath)) {
        missingFiles.push(entry);
      } else {
        const stats = statSync(localPath);
        if (stats.size < 500) {
          smallFiles.push({ entry, size: stats.size });
        }

        const buf = readFileSync(localPath);
        const hash = createHash('sha256').update(buf).digest('hex');
        const list = hashToEntries.get(hash) || [];
        list.push(entry);
        hashToEntries.set(hash, list);
      }
    }

    if (entry.portraitSource) {
      const lower = entry.portraitSource.toLowerCase();
      for (const kw of SUSPICIOUS_KEYWORDS) {
        if (lower.includes(kw)) {
          suspiciousSources.push({ entry, reason: `portraitSource contains suspicious keyword "${kw}": ${entry.portraitSource}` });
          break;
        }
      }
    }
  }

  console.log(`📊 PORTRAIT AUDIT SUMMARY:`);
  console.log(`   Total Entries with Portrait: ${roster.filter((r) => r.portrait).length}`);
  console.log(`   Missing Portrait Files:      ${missingFiles.length}`);
  console.log(`   Unusually Small Files:       ${smallFiles.length}`);
  console.log(`   Shared Image Hashes:         ${Array.from(hashToEntries.values()).filter((l) => l.length > 1).length} hash groups`);
  console.log(`   Suspicious Sources:          ${suspiciousSources.length}\n`);

  if (missingFiles.length > 0) {
    console.log(`🚨 MISSING PORTRAIT FILES (${missingFiles.length}):`);
    for (const m of missingFiles) {
      console.log(`  - [${m.id}] ${m.name}: ${m.portrait}`);
    }
    console.log();
  }

  if (smallFiles.length > 0) {
    console.log(`⚠️ SMALL PORTRAIT FILES (<500B) (${smallFiles.length}):`);
    for (const s of smallFiles) {
      console.log(`  - [${s.entry.id}] ${s.entry.name}: ${s.entry.portrait} (${s.size} bytes)`);
    }
    console.log();
  }

  console.log(`⚠️ SHARED PORTRAIT IMAGE HASH GROUPS (Potential Stock/Placeholders):`);
  for (const [hash, entries] of hashToEntries.entries()) {
    if (entries.length > 1) {
      console.log(`\n  Hash ${hash.slice(0, 10)}... (used by ${entries.length} entries):`);
      for (const e of entries) {
        console.log(`    - [${e.id}] ${e.name} (${e.university}): ${e.portrait} | ${e.portraitSource}`);
      }
    }
  }

  if (suspiciousSources.length > 0) {
    console.log(`\n⚠️ SUSPICIOUS PORTRAIT SOURCES (${suspiciousSources.length}):`);
    for (const s of suspiciousSources) {
      console.log(`  - [${s.entry.id}] ${s.entry.name}: ${s.reason}`);
    }
  }
}

await auditPortraits();
