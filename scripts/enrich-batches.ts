#!/usr/bin/env -S npx --no-install tsx

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { RosterEntry } from '../src/data.ts';
import { validateOverview } from '../src/enrichment.ts';

const rosterPath = resolve('public/data.json');
const batchesPath = resolve('maintenance/personal-lab-batches.json');

async function loadRoster(): Promise<RosterEntry[]> {
  return JSON.parse(await readFile(rosterPath, 'utf8'));
}

async function saveRoster(roster: RosterEntry[]): Promise<void> {
  await writeFile(rosterPath, `${JSON.stringify(roster, null, 2)}\n`);
}

async function loadBatches(): Promise<any[]> {
  return JSON.parse(await readFile(batchesPath, 'utf8'));
}

async function listBatches() {
  const batches = await loadBatches();
  const roster = await loadRoster();
  const rosterMap = new Map(roster.map((p) => [p.id, p]));

  console.log(`\n=== 30 PERSONAL & LAB PAGE ENRICHMENT BATCHES ===\n`);
  for (const b of batches) {
    let enrichedCount = 0;
    for (const p of b.people) {
      const entry = rosterMap.get(p.id);
      if (entry?.researchOverview && entry.researchOverview.text.length >= 200) {
        enrichedCount++;
      }
    }
    const statusTag = enrichedCount === b.people.length ? '✅ COMPLETE' : enrichedCount > 0 ? `⚡ ${enrichedCount}/${b.people.length}` : '⏳ PENDING';
    console.log(`Batch ${String(b.batch).padStart(2, ' ')} [${statusTag}]: ${b.people.map((p: any) => p.name).join(', ')}`);
  }
}

async function inspectBatch(batchNum: number) {
  const batches = await loadBatches();
  const roster = await loadRoster();
  const rosterMap = new Map(roster.map((p) => [p.id, p]));

  const b = batches.find((item) => item.batch === batchNum);
  if (!b) throw new Error(`Batch ${batchNum} not found`);

  console.log(`\n=== INSPECTING BATCH ${batchNum} (${b.count} people) ===\n`);
  for (const p of b.people) {
    const entry = rosterMap.get(p.id);
    if (!entry) continue;
    console.log(`------------------------------------------------------------`);
    console.log(`ID: ${entry.id} | Name: ${entry.name} (${entry.vietnameseName || 'no vn name'})`);
    console.log(`Institution: ${entry.university} | Track: ${entry.track} | Rank: ${entry.rank || 'N/A'}`);
    console.log(`Department: ${entry.department || 'N/A'}`);
    console.log(`Profile URL: ${entry.profileUrl}`);
    if (entry.websiteUrl) console.log(`Personal Website: ${entry.websiteUrl}`);
    if (entry.labUrl) console.log(`Lab Website: ${entry.labUrl}`);
    if (entry.scholarUrl) console.log(`Scholar: ${entry.scholarUrl}`);
    if (entry.researchAreas?.length) console.log(`Areas: ${entry.researchAreas.join(', ')}`);
    if (entry.honors?.length) console.log(`Honors: ${entry.honors.map((h) => `${h.name} (${h.year || 'year unknown'})`).join('; ')}`);
    if (entry.phdInstitution) console.log(`PhD: ${entry.phdInstitution} (${entry.phdYear || ''} ${entry.phdMajor || ''})`);
    if (entry.researchOverview) {
      console.log(`Current Overview (${entry.researchOverview.text.length} chars): ${entry.researchOverview.text}`);
      console.log(`Sources: ${entry.researchOverview.sources.join(', ')}`);
    } else {
      console.log(`Current Overview: NONE`);
    }
  }
}

async function applyProposals(proposalsPath: string) {
  const proposals = JSON.parse(await readFile(resolve(proposalsPath), 'utf8')) as Record<string, { text: string; sources: string[]; isDirect?: boolean }>;
  const roster = await loadRoster();
  const now = new Date().toISOString();
  let updated = 0;

  for (const [id, prop] of Object.entries(proposals)) {
    const entry = roster.find((p) => p.id === id);
    if (!entry) throw new Error(`Roster entry not found: ${id}`);
    const overviewObj = {
      text: prop.text,
      sources: prop.sources,
      verifiedAt: now,
    };
    const errors = validateOverview(overviewObj);
    if (errors.length) throw new Error(`Validation error for ${id} (${entry.name}): ${errors.join('; ')}`);

    entry.researchOverview = overviewObj;
    entry.lastUpdatedAt = now;
    if (prop.isDirect) {
      const fields = new Set(entry.directFields ?? []);
      fields.add('researchOverview');
      entry.directFields = Array.from(fields).sort();
    }
    updated++;
  }

  await saveRoster(roster);
  console.log(`Successfully applied ${updated} validated research overviews to public/data.json.`);
}

async function main() {
  const [cmd = 'list', arg] = process.argv.slice(2);
  if (cmd === 'list') {
    await listBatches();
  } else if (cmd === 'inspect' && arg) {
    await inspectBatch(Number(arg));
  } else if (cmd === 'apply' && arg) {
    await applyProposals(arg);
  } else {
    console.log('Usage: scripts/enrich-batches.ts list | inspect <N> | apply <file.json>');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
