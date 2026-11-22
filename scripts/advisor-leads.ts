// Advisor leads that current affiliations miss. The roster stores only where people work now,
// so an advisor who has since moved (Tam Vu: CU Boulder, then Dartmouth) never lines up with
// students who list that school as their PhD institution. This looks at each person's own
// papers from the years before their PhD, finds roster coauthors who were then affiliated with
// the person's PhD institution, and writes them as LEADS for discover_academic_relationships.md
// to verify. Coauthorship is never proof: a lab collaborator can look exactly like an advisor.
//
//   node scripts/advisor-leads.ts [--ids=vp-0039,vp-1653] [--limit=200] [--offset=0] [--min=3]
//
// Needs an OpenAlex key ($OPENALEX_API_KEY or ~/.config/cspicks/openalex-api.key). Output:
// maintenance/advisor-leads.json, merged by advisee id (existing leads are kept).
import { readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import type { RosterEntry } from '../src/data.ts';
import { namesMatch, nameTokens } from '../src/identity.ts';

const arg = (name: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const key =
  process.env.OPENALEX_API_KEY ??
  (
    await readFile(resolve(homedir(), '.config/cspicks/openalex-api.key'), 'utf8').catch(() => '')
  ).trim();
if (!key) throw new Error('Set OPENALEX_API_KEY (or ~/.config/cspicks/openalex-api.key).');

const roster: RosterEntry[] = JSON.parse(await readFile('public/data.json', 'utf8'));
const relationships = JSON.parse(await readFile('public/relationships.json', 'utf8'));
const outFile = resolve('maintenance/advisor-leads.json');
const existing: Record<string, unknown> = JSON.parse(
  await readFile(outFile, 'utf8').catch(() => '{}'),
);
const minShared = Number(arg('min') ?? 3);
const known = new Set(
  relationships.relationships
    .filter((r: { type: string }) => r.type.endsWith('-advisor'))
    .map((r: { targetId: string }) => r.targetId),
);

const wanted = arg('ids')?.split(',');
const candidates = roster
  .filter((p) => (wanted ? wanted.includes(p.id) : p.phdInstitution && !known.has(p.id)))
  .slice(Number(arg('offset') ?? 0), Number(arg('offset') ?? 0) + Number(arg('limit') ?? 100000));
const rosterTokens = roster.map((p) => [p, nameTokens(p.name)] as const);

const words = (s: string) =>
  new Set(
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .split(/[^a-z]+/)
      .filter(
        (w) =>
          w.length > 2 && !['university', 'the', 'and', 'college', 'institute', 'of'].includes(w),
      ),
  );
// "University of Colorado Boulder" vs OpenAlex "University of Colorado Boulder"/"CU Boulder" etc.
function sameInstitution(a: string, b: string): boolean {
  const wa = words(a);
  const wb = words(b);
  const shared = [...wa].filter((w) => wb.has(w)).length;
  return shared > 0 && shared >= Math.min(wa.size, wb.size) * 0.67;
}

async function get(url: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}api_key=${key}`);
    if (res.ok) return res.json();
    if (res.status !== 429) throw new Error(`${res.status} ${url}`);
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
  }
  throw new Error(`429 ${url}`);
}

const leads: Record<string, unknown> = { ...existing };
let checked = 0;
for (const person of candidates) {
  checked += 1;
  const phdYear = person.phdYear ? Number(person.phdYear) : undefined;
  const phdInst = person.phdInstitution!;
  const search = encodeURIComponent(person.name.split(' - ')[0].replace(/\(.*?\)/g, ' '));
  const authors = (await get(`https://api.openalex.org/authors?search=${search}&per_page=10`))
    .results;
  // The advisee's author record: name match plus an affiliation at the PhD institution.
  const self = authors.find(
    (a: any) =>
      namesMatch(nameTokens(a.display_name), nameTokens(person.name)) &&
      (a.affiliations ?? []).some((af: any) =>
        sameInstitution(af.institution.display_name, phdInst),
      ),
  );
  if (!self) continue;
  const works = (
    await get(
      `https://api.openalex.org/works?filter=author.id:${self.id.split('/').pop()}${phdYear ? `,publication_year:${phdYear - 7}-${phdYear + 1}` : ''}&per_page=200&select=id,publication_year,authorships`,
    )
  ).results;
  // Tally coauthors by OpenAlex author id: shared works at the PhD institution, and how often
  // they were last author (where an advisor usually sits).
  const tally = new Map<string, { name: string; works: Set<string>; last: number }>();
  for (const work of works)
    for (const a of work.authorships) {
      if (!a.author?.id || a.author.id === self.id) continue;
      if (!a.institutions?.some((i: any) => sameInstitution(i.display_name ?? '', phdInst)))
        continue;
      const entry = tally.get(a.author.id) ?? {
        name: a.author.display_name,
        works: new Set(),
        last: 0,
      };
      if (!entry.works.has(work.id)) {
        entry.works.add(work.id);
        if (a.author_position === 'last') entry.last += 1;
      }
      tally.set(a.author.id, entry);
    }
  const found: { person: RosterEntry; works: string[]; last: number }[] = [];
  for (const [authorId, entry] of tally) {
    if (entry.works.size < minShared || entry.last * 2 < entry.works.size) continue;
    const tokens = nameTokens(entry.name);
    const named = rosterTokens.filter(
      ([other, otherTokens]) =>
        other.id !== person.id &&
        namesMatch(tokens, otherTokens) &&
        // An advisor finished their own PhD first.
        !(phdYear && other.phdYear && Number(other.phdYear) >= phdYear),
    );
    if (!named.length) continue;
    // Identity: the OpenAlex author must have been affiliated with the roster entry's employer.
    const author = await get(`https://api.openalex.org/authors/${authorId.split('/').pop()}`);
    const places = [
      ...(author.affiliations ?? []).map((af: any) => af.institution.display_name),
      ...(author.last_known_institutions ?? []).map((i: any) => i.display_name),
    ];
    for (const [other] of named)
      if (places.some((place: string) => sameInstitution(place, other.university)))
        found.push({ person: other, works: [...entry.works], last: entry.last });
  }
  found.sort((a, b) => b.works.length - a.works.length);
  if (!found.length) continue;
  leads[person.id] = {
    name: person.name,
    phdInstitution: phdInst,
    phdYear: phdYear ?? null,
    openalexAuthor: self.id,
    candidates: found.map((t) => ({
      id: t.person.id,
      name: t.person.name,
      now: t.person.university,
      sharedWorksAtPhdInstitution: t.works.length,
      lastAuthorOn: t.last,
      works: t.works.slice(0, 5),
    })),
    status: 'lead',
  };
  console.log(
    `${person.id} ${person.name} (${phdInst} ${phdYear}): ${found.map((t) => `${t.person.id} ${t.person.name} x${t.works.length}`).join('; ')}`,
  );
}
await writeFile(outFile, `${JSON.stringify(leads, null, 2)}\n`);
console.log(`Checked ${checked}; ${Object.keys(leads).length} advisees with leads in ${outFile}.`);
