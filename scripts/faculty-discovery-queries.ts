#!/usr/bin/env -S npx --no-install tsx

const args: string[] = process.argv.slice(2);

function value(flag: string): string {
  const index = args.indexOf(flag);
  return index === -1 ? '' : (args[index + 1] ?? '').trim();
}

const university = value('--university');
const field = value('--field');
const domain = value('--domain');
const includeGivenNames = args.includes('--given-names');

if (!university || !field) {
  console.error('Usage: ./scripts/faculty-discovery-queries.ts --university "..." --field "..." [--domain example.edu] [--given-names]');
  process.exit(1);
}

const site = domain ? `site:${domain}` : '';
// Surnames only by default. Huynh, Duong, Truong, Dang, Ngo, Mai, and Dao were added after a
// roster token-frequency scan showed they are common Vietnamese surnames missing from the
// original ten-name list, not just given-name components.
const surnames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Vo', 'Vu', 'Bui', 'Do', 'Phan', 'Lai', 'Huynh', 'Duong', 'Truong', 'Dang', 'Ngo', 'Mai', 'Dao'];
// Common Vietnamese given/middle-name tokens. These produce more false positives than a surname
// search (they match any person with that token anywhere in their name, not just as a family
// name), so they are opt-in via --given-names and always carry the exclusion terms below.
// "Liem" is intentionally excluded: it is also a common Chinese-Indonesian surname (e.g. Liem
// Sioe Liong), and an unrestricted search for it returned a plausible-looking but non-Vietnamese
// false positive before this list was even institution-restricted.
const givenNames = ['Thanh', 'Quang', 'Minh', 'Hoang', 'Anh', 'Tuan', 'Van', 'Hung', 'Quan', 'Quoc', 'Ngoc', 'Viet', 'Phuong', 'Huy', 'Kim', 'Nam', 'Long', 'Linh', 'Toan', 'Hieu', 'Chinh', 'Thai', 'Hai', 'Dinh', 'Quynh'];
const names = includeGivenNames ? [...surnames, ...givenNames] : surnames;
const givenNameExclusions = includeGivenNames ? ' -Vietnam -student -postdoctoral' : '';
const queries = [
  `${site} "${university}" "${field}" faculty`,
  `${site} "${university}" "${field}" professor`,
  `${site} "${university}" people "${field}"`,
  `${site} "${university}" directory "${field}"`,
  `${site} "${university}" news "${field}" professor`,
  `${site} "${university}" research center "${field}" faculty`,
  ...names.map((name) => `${site} "${university}" "${name}" "${field}"${givenNameExclusions}`),
  ...names.map((name) => `"${university}" "${name}" "${field}" professor${givenNameExclusions}`),
  `site:sites.google.com "${field}" "${university}" professor`,
  `"${university}" professor moved from`,
];

console.log(`# Faculty discovery queries: ${university} / ${field}`);
for (const query of queries) console.log(query.replace(/\s+/g, ' ').trim());
