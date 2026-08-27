/** Merge per-batch postdoc evidence into the durable research-results file. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const args = process.argv.slice(2);
const getArg = (flag, fallback) => { const index = args.indexOf(flag); return index < 0 ? fallback : args[index + 1]; };
const inputDir = resolve(ROOT, getArg('--input-dir', '/tmp'));
const outputFile = resolve(ROOT, getArg('--output-file', 'scripts/postdoc-results.json'));
const batchCount = Number(getArg('--batch-count', '20'));
const output = {};

for (let batch = 1; batch <= batchCount; batch++) {
  const suffix = String(batch).padStart(2, '0');
  const results = JSON.parse(readFileSync(resolve(inputDir, `vietprofs-postdoc-batch-${suffix}-results.json`), 'utf8'));
  for (const result of results) {
    output[result.name] = {
      _processed: true,
      batch,
      sourcesChecked: result.sourcesChecked,
      hits: result.hits,
    };
  }
}

writeFileSync(outputFile, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Merged ${Object.keys(output).length} people into ${outputFile}`);
