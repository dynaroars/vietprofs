import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { RosterEntry } from '../src/data.ts';

const root = resolve('.');
const dataPath = `${root}/public/data.json`;
const missingAboutPath = `${root}/maintenance/missing-about.json`;
const todoPath = `${root}/maintenance/ai-about-todo.md`;

interface MissingAboutItem {
  id: string;
  name: string;
  university: string;
  profileUrl?: string;
  scholarUrl?: string;
  status: 'pending' | 'enriched' | 'no_evidence';
  note?: string;
}

async function main() {
  const roster: RosterEntry[] = JSON.parse(await readFile(dataPath, 'utf8'));
  const batchSize = 10;
  const total = roster.length;
  const totalBatches = Math.ceil(total / batchSize);

  const missingItems: MissingAboutItem[] = [];
  let totalWithAbout = 0;

  for (const person of roster) {
    const hasAbout = Boolean(person.researchOverview?.text && person.researchOverview.text.trim());
    if (hasAbout) {
      totalWithAbout += 1;
    } else {
      missingItems.push({
        id: person.id,
        name: person.name,
        university: person.university,
        profileUrl: person.profileUrl,
        scholarUrl: person.scholarUrl,
        status: 'pending',
      });
    }
  }

  await writeFile(missingAboutPath, JSON.stringify(missingItems, null, 2) + '\n', 'utf8');

  let md = `# AI Web-Scouting About / Bio Enrichment TODO\n\n`;
  md += `This is the cross-outable batch checklist for AI-driven web scouting of scholarly About summaries (research highlights, key projects, and what each faculty member is known for).\n`;
  md += `The machine-readable source of truth is [\`public/data.json\`](../public/data.json) and [\`maintenance/missing-about.json\`](./missing-about.json).\n\n`;
  md += `## Status Summary\n`;
  md += `- **Total Roster Profiles**: ${total}\n`;
  md += `- **Profiles with About Summary**: ${totalWithAbout} (${((totalWithAbout / total) * 100).toFixed(1)}%)\n`;
  md += `- **Profiles Needing About Summary**: ${missingItems.length}\n`;
  md += `- **Batch Size**: ${batchSize} profiles per batch\n`;
  md += `- **Total Batches**: ${totalBatches}\n\n`;
  md += `## Guidelines for About Summaries\n`;
  md += `1. **Interesting & Specific**: Highlight their main research focus, key questions, notable projects, or scholarly contributions (what they are known for).\n`;
  md += `2. **Strictly Evidence-Backed**: Avoid generic fluff or demographic assumptions; summarize only verified claims from official faculty pages, Google Scholar, personal lab sites, or publications.\n`;
  md += `3. **Full Citation Ledger**: Record all source URLs in \`sources: [...]\` (official profile, Scholar, Wikipedia, personal lab site) so every claim is directly verifiable.\n\n`;
  md += `## Checklist\n\n`;

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, total);
    const slice = roster.slice(start, end);
    const enrichedCount = slice.filter((p) => Boolean(p.researchOverview?.text?.trim())).length;
    const isComplete = enrichedCount === slice.length;

    let check = '[ ]';
    if (isComplete) {
      check = '[x]';
    } else if (enrichedCount > 0) {
      check = '[/]';
    }

    const ids = `${slice[0].id} to ${slice[slice.length - 1].id}`;
    md += `- ${check} **Batch ${String(i + 1).padStart(3, '0')}** (Items ${start + 1}–${end}: ${ids}) — ${enrichedCount}/${slice.length} enriched\n`;
  }

  await writeFile(todoPath, md, 'utf8');
  console.log(`Synced ${todoPath} and ${missingAboutPath} (${totalBatches} batches, ${totalWithAbout}/${total} enriched).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
