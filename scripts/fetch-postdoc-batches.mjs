/** Run the conservative postdoc-source fetcher across generated batch files. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = resolve(new URL('..', import.meta.url).pathname);
const args = process.argv.slice(2);
const getArg = (flag, fallback) => { const index = args.indexOf(flag); return index < 0 ? fallback : args[index + 1]; };
const batchDir = resolve(ROOT, getArg('--batch-dir', '/tmp/vietprofs-postdoc-batches'));
const outputDir = resolve(ROOT, getArg('--output-dir', '/tmp'));
const start = Number(getArg('--start', '1'));
const end = Number(getArg('--end', '999'));
const concurrency = Number(getArg('--concurrency', '3'));
const manifest = JSON.parse(readFileSync(resolve(batchDir, 'manifest.json'), 'utf8'))
  .filter((item) => item.batch >= start && item.batch <= end);

async function processBatch(item) {
  const batchFile = resolve(batchDir, item.file);
  const outputFile = resolve(outputDir, `vietprofs-postdoc-batch-${String(item.batch).padStart(2, '0')}-results.json`);
  const { stdout } = await run(process.execPath, [
    resolve(ROOT, 'scripts/fetch-postdocs.mjs'),
    '--batch-file', batchFile,
    '--output-file', outputFile,
  ], { cwd: ROOT, maxBuffer: 20 * 1024 * 1024 });
  const hitCount = stdout.split('\n').filter((line) => /[1-9]\d* source hit/.test(line)).length;
  console.log(`Batch ${item.batch}: ${item.count} people, ${hitCount} with source hits`);
}

for (let index = 0; index < manifest.length; index += concurrency) {
  await Promise.all(manifest.slice(index, index + concurrency).map(processBatch));
}
