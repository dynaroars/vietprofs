// Dedup check for a candidate before anyone files or adds them, and a roster-wide duplicate scan.
//
//   npm run find-roster-matches -- "Tin Nguyen" --url https://tinnguyen-lab.com/home/ --url <linkedin> ...
//   npm run find-roster-matches -- --roster        # possible duplicate pairs already in the roster
//
// A person often reappears under a new institution after a move, with a reordered or shortened
// name, or after being removed. So this matches order-independent name tokens (diacritics and
// initials ignored), every identity URL against every identity field of every entry (a candidate's
// lab site can be someone's stored websiteUrl), Scholar user ids, LinkedIn slugs, and the retired-id
// ledger. A hit means "same person until ruled out", not "namesake": check the entry's former
// affiliation, PhD, lab, and Scholar before calling it a different person. When it is the same
// person, update that entry in place; never file or add them under a new id.
import { readFile } from 'node:fs/promises';
import type { RosterEntry } from '../src/data.ts';
import { identityKey, namesMatch, nameTokens } from '../src/identity.ts';

type Retired = Record<string, { replacedBy: string | null; name: string; university: string; reason: string }>;

const URL_FIELDS = ['profileUrl', 'websiteUrl', 'labUrl', 'scholarUrl', 'linkedinUrl', 'portraitSource'] as const;

function urlsOf(person: Partial<RosterEntry>): Map<string, string> {
  const keys = new Map<string, string>();
  for (const field of URL_FIELDS) {
    const value = person[field];
    if (typeof value === 'string' && value) keys.set(identityKey(value), field);
  }
  return keys;
}

const args = process.argv.slice(2);
const roster: RosterEntry[] = JSON.parse(await readFile('public/data.json', 'utf8'));
const retired: Retired = JSON.parse(await readFile('maintenance/retired-ids.json', 'utf8'));

if (args.includes('--roster')) {
  const pairs: string[] = [];
  const byUrl = new Map<string, string>();
  const tokens = roster.map((person) => nameTokens(person.name));
  for (const [index, person] of roster.entries()) {
    for (const [key, field] of urlsOf(person)) {
      // Department pages, group labs, and placeholder images are legitimately shared.
      if (field === 'profileUrl' || field === 'labUrl' || field === 'portraitSource') continue;
      const other = byUrl.get(key);
      if (other && other !== person.id) pairs.push(`${other} & ${person.id} (${person.name}) share ${field} ${key}`);
      else byUrl.set(key, person.id);
    }
    for (let j = 0; j < index; j += 1) {
      const other = roster[j];
      if (!namesMatch(tokens[index], tokens[j])) continue;
      const sameInstitution = other.university === person.university;
      const samePhd = person.phdInstitution && other.phdInstitution === person.phdInstitution && (!person.phdYear || !other.phdYear || person.phdYear === other.phdYear);
      if (sameInstitution || samePhd) pairs.push(`${other.id} (${other.name} @ ${other.university}) & ${person.id} (${person.name} @ ${person.university}): same name and ${sameInstitution ? 'institution' : 'PhD'}`);
    }
  }
  console.log(pairs.length ? pairs.join('\n') : 'no likely duplicate pairs');
  process.exit(0);
}

const name = args.find((arg, index) => !arg.startsWith('--') && args[index - 1] !== '--url');
const candidateUrls = args.flatMap((arg, index) => (args[index - 1] === '--url' ? [identityKey(arg)] : []));
if (!name && !candidateUrls.length) throw new Error('usage: npm run find-roster-matches -- "<name>" [--url <url> ...] | --roster');
const wanted = name ? nameTokens(name) : [];

const hits: string[] = [];
for (const person of roster) {
  const reasons: string[] = [];
  if (wanted.length && namesMatch(wanted, nameTokens(person.name))) reasons.push('name');
  const stored = urlsOf(person);
  for (const key of candidateUrls) if (stored.has(key)) reasons.push(`${stored.get(key)} ${key}`);
  if (reasons.length) hits.push(`${person.id} ${person.name} | ${person.rank ?? ''}, ${person.department ?? ''}, ${person.university} | matched on ${reasons.join('; ')}`);
}
for (const [id, record] of Object.entries(retired)) {
  if (wanted.length && namesMatch(wanted, nameTokens(record.name))) {
    hits.push(`${id} (retired) ${record.name} | ${record.university} | ${record.replacedBy ? `merged into ${record.replacedBy}` : 'removed'}: ${record.reason}`);
  }
}
if (!hits.length) {
  console.log('no roster or retired-id matches');
} else {
  console.log(hits.join('\n'));
  console.log('\nTreat each hit as the same person until ruled out (compare former affiliations, PhD, lab, Scholar, LinkedIn).');
  console.log('Same person: update that entry in place, or restore a retired id (npm run retire-profile-id). Never add a new id.');
}
