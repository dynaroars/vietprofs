import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type MissingItem = {
  id: string;
  name: string;
  university: string;
  profileUrl: string;
  status: 'pending' | 'fetched' | 'unresolved';
  portraitSource?: string;
  note?: string;
};

const root = resolve('.');

async function syncPortraitTodo() {
  const missingPath = `${root}/maintenance/missing-portraits.json`;
  const todoPath = `${root}/maintenance/ai-portrait-todo.md`;
  const items: MissingItem[] = JSON.parse(await readFile(missingPath, 'utf8'));
  const batchSize = 10;
  const total = items.length;
  const totalBatches = Math.ceil(total / batchSize);

  let md = `# AI Web-Scouting Portrait Recovery TODO\n\n`;
  md += `This is the cross-outable batch checklist for AI-driven web scouting of missing faculty portraits.\n`;
  md += `The machine-readable source of truth is [\`maintenance/missing-portraits.json\`](./missing-portraits.json).\n\n`;
  md += `## Status Summary\n`;
  md += `- **Total Tracked Entries**: ${total}\n`;
  md += `- **Batch Size**: ${batchSize} profiles per batch\n`;
  md += `- **Total Batches**: ${totalBatches}\n\n`;
  md += `## Checklist\n\n`;

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, total);
    const slice = items.slice(start, end);
    const fetchedCount = slice.filter((x) => x.status === 'fetched').length;
    const isComplete = slice.every((x) => x.status === 'fetched');

    let check = '[ ]';
    if (isComplete) {
      check = '[x]';
    } else if (fetchedCount > 0) {
      check = '[/]';
    }

    const ids = `${slice[0].id} to ${slice[slice.length - 1].id}`;
    md += `- ${check} **Batch ${String(i + 1).padStart(2, '0')}** (Items ${start + 1}–${end}: ${ids}) — ${fetchedCount}/${slice.length} fetched\n`;
  }

  await writeFile(todoPath, md, 'utf8');
  console.log(`Synced ${todoPath} (${totalBatches} batches).`);
}

async function syncAboutTodo() {
  const missingPath = `${root}/maintenance/missing-about.json`;
  const todoPath = `${root}/maintenance/ai-about-todo.md`;
  const items: MissingItem[] = JSON.parse(await readFile(missingPath, 'utf8'));
  const batchSize = 20;
  const total = items.length;
  const totalBatches = Math.ceil(total / batchSize);

  let md = `# AI Research Overview Enrichment TODO\n\n`;
  md += `This is the checklist for AI-driven research overview (1-sentence summary) enrichment.\n`;
  md += `The machine-readable source of truth is [\`maintenance/missing-about.json\`](./missing-about.json).\n\n`;
  md += `## Status Summary\n`;
  md += `- **Total Tracked Entries**: ${total}\n`;
  md += `- **Batch Size**: ${batchSize} profiles per batch\n`;
  md += `- **Total Batches**: ${totalBatches}\n\n`;
  md += `## Checklist\n\n`;

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, total);
    const slice = items.slice(start, end);
    const fetchedCount = slice.filter((x) => x.status === 'fetched').length;
    const isComplete = slice.every((x) => x.status === 'fetched');

    let check = '[ ]';
    if (isComplete) {
      check = '[x]';
    } else if (fetchedCount > 0) {
      check = '[/]';
    }

    const ids = `${slice[0].id} to ${slice[slice.length - 1].id}`;
    md += `- ${check} **Batch ${String(i + 1).padStart(2, '0')}** (Items ${start + 1}–${end}: ${ids}) — ${fetchedCount}/${slice.length} fetched\n`;
  }

  await writeFile(todoPath, md, 'utf8');
  console.log(`Synced ${todoPath} (${totalBatches} batches).`);
}

async function main() {
  await syncPortraitTodo();
  await syncAboutTodo();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
