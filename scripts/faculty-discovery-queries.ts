#!/usr/bin/env -S npx --no-install tsx

const args: string[] = process.argv.slice(2);

function value(flag: string): string {
  const index = args.indexOf(flag);
  return index === -1 ? '' : (args[index + 1] ?? '').trim();
}

const university = value('--university');
const field = value('--field');
const domain = value('--domain');

if (!university || !field) {
  console.error('Usage: ./scripts/faculty-discovery-queries.ts --university "..." --field "..." [--domain example.edu]');
  process.exit(1);
}

const site = domain ? `site:${domain}` : '';
const names = ['Nguyen', 'Tran', 'Le', 'Pham', 'Vo', 'Vu', 'Bui', 'Do', 'Phan', 'Lai'];
const queries = [
  `${site} "${university}" "${field}" faculty`,
  `${site} "${university}" "${field}" professor`,
  `${site} "${university}" people "${field}"`,
  `${site} "${university}" directory "${field}"`,
  `${site} "${university}" news "${field}" professor`,
  `${site} "${university}" research center "${field}" faculty`,
  ...names.map((name) => `${site} "${university}" "${name}" "${field}"`),
  ...names.map((name) => `"${university}" "${name}" "${field}" professor`),
  `site:sites.google.com "${field}" "${university}" professor`,
  `"${university}" professor moved from`,
];

console.log(`# Faculty discovery queries: ${university} / ${field}`);
for (const query of queries) console.log(query.replace(/\s+/g, ' ').trim());
