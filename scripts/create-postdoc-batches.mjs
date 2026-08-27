/** Create deterministic batches of roster members missing completed-postdoc data. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const args = process.argv.slice(2);
const getArg = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index < 0 ? fallback : args[index + 1];
};
const batchSize = Number(getArg('--batch-size', '40'));
const outputDir = resolve(ROOT, getArg('--output-dir', '/tmp/vietprofs-postdoc-batches'));
if (!Number.isInteger(batchSize) || batchSize < 1) throw new Error('Invalid --batch-size');

const roster = JSON.parse(readFileSync(resolve(ROOT, 'public/data.json'), 'utf8'));
const pending = roster.filter((person) => !person.postdocInstitution && !person.postdocYear);
mkdirSync(outputDir, { recursive: true });

const manifest = [];
for (let offset = 0; offset < pending.length; offset += batchSize) {
  const number = Math.floor(offset / batchSize) + 1;
  const members = pending.slice(offset, offset + batchSize).map(({ name, profileUrl, websiteUrl }) => ({
    name,
    profileUrl,
    ...(websiteUrl ? { websiteUrl } : {}),
  }));
  const file = `batch-${String(number).padStart(2, '0')}.json`;
  writeFileSync(resolve(outputDir, file), `${JSON.stringify(members, null, 2)}\n`);
  manifest.push({ batch: number, file, count: members.length, first: members[0].name, last: members.at(-1).name });
}
writeFileSync(resolve(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Created ${manifest.length} batches for ${pending.length} people in ${outputDir}`);
