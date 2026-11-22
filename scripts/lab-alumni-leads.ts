// Advisee leads from the advisor's side. Many faculty lab and personal sites list current and
// former PhD students, often with where they went ("now Assistant Professor at ..."). Reading
// those pages finds students whether or not the advisor has since moved, which the roster's
// current-affiliation data cannot. For each roster member with a websiteUrl, this fetches the
// site, follows its People/Students/Alumni/Team links, and records roster members named there.
// A match is "strong" when the text around the name also mentions that person's current
// employer. Everything it writes is a LEAD for discover_academic_relationships.md to verify:
// a lab page also lists collaborators, visitors and postdocs.
//
//   node scripts/lab-alumni-leads.ts [--ids=vp-0052] [--limit=200] [--offset=0]
//
// Output: maintenance/lab-alumni-leads.json, merged by advisor id (existing entries are kept).
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { displayName, type RosterEntry } from '../src/data.ts';

const arg = (name: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const roster: RosterEntry[] = JSON.parse(await readFile('public/data.json', 'utf8'));
const relationships = JSON.parse(await readFile('public/relationships.json', 'utf8'));
const outFile = resolve('maintenance/lab-alumni-leads.json');
const leads: Record<string, unknown> = JSON.parse(
  await readFile(outFile, 'utf8').catch(() => '{}'),
);
const recorded = new Set(
  relationships.relationships.map((r: { sourceId: string; targetId: string }) =>
    [r.sourceId, r.targetId].join(' '),
  ),
);

const wanted = arg('ids')?.split(',');
const offset = Number(arg('offset') ?? 0);
const advisors = roster
  .filter((p) => p.websiteUrl && (wanted ? wanted.includes(p.id) : true))
  .slice(offset, offset + Number(arg('limit') ?? 100000));

const fold = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
const STUDENT_WORDS =
  /\b(ph\.?d|doctoral|students?|alumni|alumnus|graduated|graduates?|advisees?|mentees?|now (an? |at )|currently|postdoc|thesis|dissertation)\b/i;
// Publication author lists ("A, B, C, D, Tam Vu") name coauthors, not students.
const looksLikeAuthorList = (context: string) => (context.match(/,/g) ?? []).length >= 5;
const LINK_WORDS =
  /\b(people|members?|team|students?|alumni|group|lab|former|graduates?|advisees?|mentees?|thanh vien)\b/i;

// Name forms to look for: "Anh Nguyen", "Nguyen Anh", and the name without middle initials.
const nameForms = roster.map((person) => {
  const base = fold(displayName(person.name).replace(/\(.*?\)/g, ' '))
    .replace(/[^a-z\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // Middle initials are dropped ("Thang N. Dinh" -> "thang dinh"); full middle names are kept, so
  // "Hoang Long Nguyen" never shrinks to a "Hoang Nguyen" that matches someone else.
  const parts = base.split(' ').filter((p) => p.length > 1);
  const forms = new Set([parts.join(' ')]);
  if (parts.length >= 2) forms.add([parts.at(-1), ...parts.slice(0, -1)].join(' '));
  return { person, forms: [...forms].filter((f) => f.split(' ').length >= 2) };
});

async function fetchText(url: string): Promise<{ html: string; text: string } | undefined> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; roster-link-check)' },
    });
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) return undefined;
    const html = (await res.text()).slice(0, 2_000_000);
    const text = html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ');
    return { html, text };
  } catch {
    return undefined;
  }
}

function peopleLinks(html: string, base: string): string[] {
  const links = new Set<string>();
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = m[2].replace(/<[^>]+>/g, ' ');
    if (!LINK_WORDS.test(label) && !LINK_WORDS.test(m[1])) continue;
    try {
      const url = new URL(m[1], base);
      if (url.host === new URL(base).host && /^https?:$/.test(url.protocol)) links.add(url.href);
    } catch {}
  }
  return [...links].slice(0, 6);
}

async function scan(advisor: RosterEntry) {
  const home = await fetchText(advisor.websiteUrl!);
  if (!home) return;
  const pages = [{ url: advisor.websiteUrl!, text: home.text, home: true }];
  for (const url of peopleLinks(home.html, advisor.websiteUrl!)) {
    const page = await fetchText(url);
    if (page) pages.push({ url, text: page.text, home: false });
  }
  const found = new Map<string, object>();
  for (const { url, text, home: isHome } of pages) {
    const folded = fold(text);
    for (const { person, forms } of nameForms) {
      if (person.id === advisor.id || found.has(person.id)) continue;
      for (const form of forms) {
        const at = folded.search(new RegExp(`\\b${form.replace(/[-]/g, '[- ]?')}\\b`));
        if (at < 0) continue;
        const context = text.slice(Math.max(0, at - 160), at + form.length + 200).trim();
        const near = text.slice(Math.max(0, at - 60), at + form.length + 60);
        if (looksLikeAuthorList(near)) continue;
        if (isHome && !STUDENT_WORDS.test(context)) continue;
        const employer = fold(person.university ?? '')
          .replace(/^the /, '')
          .replace(/\s*\(.*\)$/, '');
        const strong = employer.length > 5 && fold(context).includes(employer);
        // Two-word names ("Thinh Nguyen") collide with namesakes; keep them only when the
        // employer is mentioned nearby.
        if (!strong && form.split(' ').length < 3) continue;
        found.set(person.id, {
          id: person.id,
          name: person.name,
          now: person.university,
          page: url,
          strong,
          alreadyRecorded:
            recorded.has(`${advisor.id} ${person.id}`) ||
            recorded.has(`${person.id} ${advisor.id}`),
          context,
        });
        break;
      }
    }
  }
  if (!found.size) return;
  const matches = [...found.values()];
  leads[advisor.id] = { name: advisor.name, site: advisor.websiteUrl, matches, status: 'lead' };
  const strong = matches.filter((m: any) => m.strong && !m.alreadyRecorded);
  console.log(
    `${advisor.id} ${advisor.name}: ${matches.length} named${strong.length ? `, strong: ${strong.map((m: any) => `${m.id} ${m.name}`).join('; ')}` : ''}`,
  );
}

const queue = [...advisors];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    for (let advisor = queue.shift(); advisor; advisor = queue.shift()) await scan(advisor);
  }),
);
await writeFile(outFile, `${JSON.stringify(leads, null, 2)}\n`);
console.log(
  `Scanned ${advisors.length} sites; ${Object.keys(leads).length} with roster names in ${outFile}.`,
);
