// Discovers new Vietnamese-diaspora faculty candidates and existing-roster rank/institution updates
// by mining multiple internal and external channels against the current roster:
//
//   node scripts/discover-leads.ts --mode=grants      # NSF Award Search & NIH RePORTER PIs/co-PIs
//   node scripts/discover-leads.ts --mode=coauthors   # Crossref co-authors of rostered scholars
//   node scripts/discover-leads.ts --mode=labs        # Alumni/people/collaborator pages on stored websiteUrl
//   node scripts/discover-leads.ts --mode=logs        # Out-of-roster leads in maintenance/relationship-research.json
//   node scripts/discover-leads.ts --mode=gaps        # Feeder-vs-faculty institution & research-institute gap report
//   node scripts/discover-leads.ts --mode=all         # Run all modes and write maintenance/discovery-leads.json
//
// Results are written to maintenance/discovery-leads.json (gitignored) and printed as a summary.
// Every candidate still requires live official-profile verification and `npm run find-roster-matches`
// before filing a `New candidate:` GitHub Issue or adding to public/data.json.
import { execFile } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import type { RosterEntry } from '../src/data.ts';
import { namesMatch, nameTokens } from '../src/identity.ts';
import { isLikelyVietnameseName as screenName } from './name-screen.ts';
import { loadAllEntries } from './roster-files.ts';

const execFileAsync = promisify(execFile);

const args = process.argv.slice(2);
const option = (name: string, fallback = '') =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const mode = option('mode', 'all');
const limit = Number(option('limit', '40'));

function resolveOpenAlexApiKey(): string {
  const flagKey = option('api-key');
  if (flagKey) return flagKey.trim();
  if (process.env.OPENALEX_API_KEY) return process.env.OPENALEX_API_KEY.trim();
  for (const rel of [
    '.config/cspicks/openalex-api.key',
    '.config/cspicks/openalex-api-key',
    '.config/vietprofs/openalex-api.key',
    '.config/vietprofs/openalex-api-key',
  ]) {
    const p = join(homedir(), rel);
    if (existsSync(p)) {
      const k = readFileSync(p, 'utf8').trim();
      if (k) return k;
    }
  }
  return '';
}

const openAlexApiKey = resolveOpenAlexApiKey();

// The shared screen (scripts/name-screen.ts) rejects only high-confidence non-Vietnamese names.
export function isLikelyVietnameseName(fullName: string, country?: string): boolean {
  return screenName(fullName, country);
}

type Lead = {
  name: string;
  institution?: string;
  department?: string;
  title?: string;
  channel: string;
  sourceUrl?: string;
  evidence: string;
  rosterMatch?: string;
  promotionOrMoveHint?: string;
};

async function loadRosterContext() {
  const roster: RosterEntry[] = await loadAllEntries();
  const retired: Record<string, { name: string; university: string; replacedBy: string | null }> =
    JSON.parse(await readFile('maintenance/retired-ids.json', 'utf8'));
  const rosterTokenList = roster.map((person) => ({
    person,
    tokens: nameTokens(person.name),
  }));
  const retiredTokenList = Object.entries(retired).map(([id, rec]) => ({
    id,
    rec,
    tokens: nameTokens(rec.name),
  }));

  function matchRoster(candidateName: string): {
    matchedEntries: RosterEntry[];
    retiredMatches: string[];
  } {
    const wanted = nameTokens(candidateName);
    if (wanted.length < 2) return { matchedEntries: [], retiredMatches: [] };
    const matchedEntries = rosterTokenList
      .filter(({ tokens }) => namesMatch(wanted, tokens))
      .map(({ person }) => person);
    const retiredMatches = retiredTokenList
      .filter(({ tokens }) => namesMatch(wanted, tokens))
      .map(({ id, rec }) => `${id} (${rec.name} @ ${rec.university})`);
    return { matchedEntries, retiredMatches };
  }

  return { roster, matchRoster };
}

async function discoverFromGrants(
  matchRoster: Awaited<ReturnType<typeof loadRosterContext>>['matchRoster'],
): Promise<Lead[]> {
  const leads: Lead[] = [];
  const seen = new Set<string>();
  const querySurnames = [
    'Doan',
    'Phung',
    'Vuong',
    'Luong',
    'Kieu',
    'Trinh',
    'Quach',
    'Nghiem',
    'Trieu',
    'Huynh',
    'Duong',
    'Truong',
    'Pham',
    'Bui',
    'Phan',
    'Vo',
    'Vu',
    'Dao',
    'Ngo',
    'Dinh',
    'Hoang',
  ];

  // 1. NIH RePORTER active R01/R21/R35/U01/K99/K08/K23 grants
  for (const surname of querySurnames.slice(0, limit)) {
    try {
      const payload = JSON.stringify({
        criteria: {
          pi_names: [{ last_name: surname }],
          is_active: true,
        },
        limit: 50,
      });
      const { stdout } = await execFileAsync('curl', [
        '-s',
        '-m',
        '15',
        '-X',
        'POST',
        'https://api.reporter.nih.gov/v2/projects/search',
        '-H',
        'Content-Type: application/json',
        '-d',
        payload,
      ]);
      const data = JSON.parse(stdout);
      for (const proj of data.results ?? []) {
        const actCode = (proj.activity_code ?? '').toUpperCase();
        // Exclude predoctoral/postdoctoral fellowships (F30, F31, F32, F99, K99, R36, T32, TL1)
        if (/^(F30|F31|F32|F99|K99|R36|T32|T34|T35|TL1)$/.test(actCode)) continue;
        const org = proj.organization?.org_name ?? '';
        const country = proj.organization?.org_country ?? 'UNITED STATES';
        if (country.toUpperCase().includes('VIETNAM')) continue;
        // Skip corporate SBIR/STTR orgs (LLC, INC, CORP, THERAPEUTICS, BIOSCIENCES, PHARMA)
        if (
          /\b(LLC|INC\.?|CORP\.?|CORPORATION|THERAPEUTICS|PHARMA|BIOSCIENCES|BIOTECH|LTD)\b/i.test(
            org,
          )
        )
          continue;
        for (const pi of proj.principal_investigators ?? []) {
          const rawName = `${pi.first_name ?? ''} ${pi.middle_name ?? ''} ${pi.last_name ?? ''}`
            .replace(/\s+/g, ' ')
            .trim();
          if (!isLikelyVietnameseName(rawName)) continue;
          const title = (pi.title ?? '').trim();
          if (
            /POSTDOC|POST-DOC|FELLOW|STUDENT|GRADUATE|TRAINEE|RESIDENT|RESEARCH ASSOCIATE/i.test(
              title,
            )
          )
            continue;
          const key = `${nameTokens(rawName).join('-')}|${org.toLowerCase()}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const { matchedEntries, retiredMatches } = matchRoster(rawName);
          let rosterMatch: string | undefined;
          let promotionOrMoveHint: string | undefined;
          if (matchedEntries.length > 0) {
            rosterMatch = matchedEntries
              .map((e) => `${e.id} (${e.name}, ${e.rank ?? ''} @ ${e.university})`)
              .join('; ');
            // Check if NIH title shows full PROFESSOR while roster shows Associate/Assistant Professor at same org
            for (const e of matchedEntries) {
              if (
                title === 'PROFESSOR' &&
                e.rank &&
                e.rank !== 'Professor' &&
                org.toLowerCase().includes(e.university.split(',')[0].toLowerCase().slice(0, 12))
              ) {
                promotionOrMoveHint = `NIH RePORTER lists title "${title}" at ${org}, whereas ${e.id} is stored as "${e.rank}" at ${e.university}`;
              }
            }
          } else if (retiredMatches.length > 0) {
            rosterMatch = `Retired: ${retiredMatches.join('; ')}`;
          }

          if (!rosterMatch || promotionOrMoveHint) {
            leads.push({
              name: rawName,
              institution: org,
              department: proj.organization?.dept_type ?? undefined,
              title: title || 'PI / Project Leader',
              channel: 'nih-reporter',
              sourceUrl: `https://reporter.nih.gov/project-details/${proj.appl_id}`,
              evidence: `NIH grant ${proj.project_num} (${proj.fiscal_year}) at ${org}${title ? `, title: ${title}` : ''}`,
              ...(rosterMatch && { rosterMatch }),
              ...(promotionOrMoveHint && { promotionOrMoveHint }),
            });
          }
        }
      }
    } catch {
      // continue on transient network error
    }
  }

  // 2. NSF Award Search API
  for (const surname of querySurnames.slice(0, Math.min(limit, 21))) {
    try {
      const { stdout } = await execFileAsync('curl', [
        '-s',
        '-m',
        '15',
        `https://api.nsf.gov/services/v1/awards.json?pdPIName=${encodeURIComponent(surname)}&dateStart=01/01/2023&printFields=id,title,awardeeName,pdPIName,piFirstName,piMiddleInitial,piLastName`,
      ]);
      const data = JSON.parse(stdout);
      for (const award of data.response?.award ?? []) {
        const org = award.awardeeName ?? '';
        if (/\b(LLC|INC\.?|CORP\.?|CORPORATION|TECHNOLOGIES|SYSTEMS|LABS INC)\b/i.test(org))
          continue;
        const rawName =
          `${award.piFirstName ?? ''} ${award.piMiddleInitial ?? ''} ${award.piLastName ?? ''}`
            .replace(/\s+/g, ' ')
            .trim();
        if (!isLikelyVietnameseName(rawName)) continue;
        if (/fellowship|doctoral dissertation|postdoctoral/i.test(award.title ?? '')) continue;
        const key = `${nameTokens(rawName).join('-')}|${org.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const { matchedEntries, retiredMatches } = matchRoster(rawName);
        if (matchedEntries.length === 0 && retiredMatches.length === 0) {
          leads.push({
            name: rawName,
            institution: org,
            title: 'NSF Principal Investigator',
            channel: 'nsf-awards',
            sourceUrl: `https://www.nsf.gov/awardsearch/showAward?AWD_ID=${award.id}`,
            evidence: `Active NSF Award #${award.id} ("${(award.title ?? '').slice(0, 80)}") at ${org}`,
          });
        }
      }
    } catch {
      // continue
    }
  }

  return leads;
}

async function discoverFromLogs(
  matchRoster: Awaited<ReturnType<typeof loadRosterContext>>['matchRoster'],
): Promise<Lead[]> {
  const leads: Lead[] = [];
  const relRes = JSON.parse(await readFile('maintenance/relationship-research.json', 'utf8'));
  let oldRel: any = { batches: [] };
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['show', '0f45755:maintenance/relationship-research.json'],
      { maxBuffer: 25 * 1024 * 1024 },
    );
    oldRel = JSON.parse(stdout);
  } catch {
    // ignore if commit not present
  }

  const notesByRosterId = new Map<string, string>();
  for (const [id, p] of Object.entries<any>(relRes.people ?? {})) {
    const text = [p.notes, p.nextAction].filter(Boolean).join(' ');
    if (text) notesByRosterId.set(id, text);
  }
  for (const b of oldRel.batches ?? []) {
    for (const o of b.outcomes ?? []) {
      const text = [o.notes, o.nextAction].filter(Boolean).join(' ');
      if (text && !notesByRosterId.has(o.rosterId)) notesByRosterId.set(o.rosterId, text);
    }
  }

  const seenNames = new Set<string>();
  // Extract capitalized multi-word names from relationship notes that mention out-of-roster / not in roster
  const namePattern =
    /\b([A-Z][a-z]+(?:-[A-Z][a-z]+)?(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+(?:-[A-Z][a-z]+)?){1,3})\b/g;
  const stopWords = new Set([
    'University',
    'Professor',
    'Assistant',
    'Associate',
    'Department',
    'Institute',
    'College',
    'School',
    'Center',
    'Centre',
    'Research',
    'National',
    'Science',
    'Sciences',
    'Engineering',
    'Technology',
    'Medicine',
    'Medical',
    'Health',
    'Hospital',
    'Journal',
    'Review',
    'Physical',
    'American',
    'European',
    'International',
    'Australian',
    'Canadian',
    'French',
    'German',
    'British',
    'Vietnamese',
    'Vietnam',
    'Hanoi',
    'Ho',
    'Chi',
    'Minh',
    'City',
    'Hue',
    'Danang',
    'Dalat',
    'Can',
    'Tho',
    'OpenAlex',
    'Crossref',
    'Google',
    'Scholar',
    'Patents',
    'PubMed',
    'Mathematics',
    'Genealogy',
    'Project',
    'Official',
    'Profile',
    'Checked',
    'Reviewed',
    'Excluded',
    'Completed',
    'Bounded',
    'VietProfs',
    'Team',
    'Faculty',
    'Postdoctoral',
    'Researcher',
    'Student',
    'Students',
    'Trainee',
    'Trainees',
    'Graduate',
    'Graduates',
    'Undergraduate',
    'Senior',
    'Scientist',
    'Director',
    'Member',
    'Members',
    'Former',
    'Current',
    'Alumni',
    'Master',
    'Bioinformatics',
    'Software',
    'Engineer',
    'Lecturer',
  ]);

  for (const [id, text] of notesByRosterId.entries()) {
    if (
      !/not in (the |current )?roster|out-of-roster|out of scope|neither counterparty|no matching roster/i.test(
        text,
      )
    )
      continue;
    for (const m of text.matchAll(namePattern)) {
      const candidate = m[1].trim();
      const parts = candidate.split(/\s+/);
      if (parts.some((p) => stopWords.has(p.replace(/\./g, '')))) continue;
      if (!isLikelyVietnameseName(candidate)) continue;
      const key = nameTokens(candidate).join('-');
      if (seenNames.has(key)) continue;
      seenNames.add(key);

      const { matchedEntries, retiredMatches } = matchRoster(candidate);
      if (matchedEntries.length === 0 && retiredMatches.length === 0) {
        leads.push({
          name: candidate,
          channel: 'relationship-research-log',
          evidence: `Surfaced in ${id} relationship research: "${text.slice(0, 220)}..."`,
        });
      }
    }
  }
  return leads;
}

async function discoverFromCoauthors(
  roster: RosterEntry[],
  matchRoster: Awaited<ReturnType<typeof loadRosterContext>>['matchRoster'],
): Promise<Lead[]> {
  const leads: Lead[] = [];
  const seen = new Set<string>();
  // Pick a sample of rostered scholars and query Crossref for their recent works (2023-2026) with affiliation metadata
  const sample = roster.slice(0, Math.min(limit, 30));
  for (const member of sample) {
    const cleanName = member.name.split(' - ')[0].trim();
    try {
      const { stdout } = await execFileAsync('curl', [
        '-s',
        '-m',
        '15',
        `https://api.crossref.org/works?query.author=${encodeURIComponent(cleanName)}&filter=from-pub-date:2023-01-01&rows=8&mailto=vietprofs@roars.dev`,
      ]);
      const data = JSON.parse(stdout);
      for (const item of data.message?.items ?? []) {
        const authors: any[] = item.author ?? [];
        // Verify this paper likely belongs to our roster member (one author matches cleanName)
        const hasMember = authors.some((a) =>
          namesMatch(nameTokens(`${a.given ?? ''} ${a.family ?? ''}`), nameTokens(cleanName)),
        );
        if (!hasMember) continue;

        for (const a of authors) {
          const fullName = `${a.given ?? ''} ${a.family ?? ''}`.replace(/\s+/g, ' ').trim();
          if (!isLikelyVietnameseName(fullName)) continue;
          if (namesMatch(nameTokens(fullName), nameTokens(cleanName))) continue;
          const affil = (a.affiliation ?? [])
            .map((x: any) => x.name)
            .filter(Boolean)
            .join('; ');
          if (!affil) continue;
          if (
            /Vietnam|Viet Nam|Hanoi|Ho Chi Minh|Hue|Danang|Can Tho|Ton Duc Thang|Phenikaa|VinUni|Duy Tan|Bach Khoa/i.test(
              affil,
            )
          )
            continue;
          if (
            !/University|Universit|Institut|College|School of|National Lab|CNRS|INRIA|INRAE|Inserm|CSIRO|RIKEN|Max Planck|Hospital|Medical Center/i.test(
              affil,
            )
          )
            continue;

          const key = nameTokens(fullName).join('-');
          if (seen.has(key)) continue;
          seen.add(key);

          const { matchedEntries, retiredMatches } = matchRoster(fullName);
          if (matchedEntries.length === 0 && retiredMatches.length === 0) {
            leads.push({
              name: fullName,
              institution: affil,
              channel: 'crossref-coauthor',
              sourceUrl: item.DOI ? `https://doi.org/${item.DOI}` : undefined,
              evidence: `Coauthor of ${member.id} (${cleanName}) on DOI ${item.DOI ?? 'unknown'} with affiliation: ${affil}`,
            });
          }
        }
      }
    } catch {
      // continue
    }
  }

  // If an OpenAlex API key is configured (via --api-key, OPENALEX_API_KEY, or ~/.config/cspicks/openalex-api.key),
  // also query OpenAlex authors with works_count:>30 at non-Vietnam education/facility institutions.
  if (openAlexApiKey) {
    const oaSurnames = [
      'Truong',
      'Doan',
      'Vuong',
      'Phung',
      'Nghiem',
      'Duong',
      'Huynh',
      'Trinh',
      'Luong',
      'Kieu',
      'Quach',
      'Trieu',
      'Ton-That',
      'Hoang',
      'Dinh',
      'Dao',
      'Ngo',
      'Bui',
      'Phan',
      'Vo',
      'Vu',
      'Pham',
      'Tran',
      'Nguyen',
    ];
    for (const surname of oaSurnames.slice(0, Math.max(1, Math.floor(limit / 3)))) {
      try {
        const url = `https://api.openalex.org/authors?search=${encodeURIComponent(surname)}&filter=works_count:>30,last_known_institutions.type:education|facility,last_known_institutions.country_code:!vn&select=id,display_name,works_count,cited_by_count,last_known_institutions&per_page=100&api_key=${encodeURIComponent(openAlexApiKey)}`;
        const { stdout } = await execFileAsync('curl', ['-s', '-m', '15', url]);
        const data = JSON.parse(stdout);
        for (const author of data.results ?? []) {
          const fullName = (author.display_name ?? '').trim();
          if (!isLikelyVietnameseName(fullName)) continue;
          const inst = author.last_known_institutions?.[0]?.display_name ?? '';
          const countryCode = author.last_known_institutions?.[0]?.country_code ?? '';
          if (!inst || countryCode === 'VN') continue;
          const key = nameTokens(fullName).join('-');
          if (seen.has(key)) continue;
          seen.add(key);
          const { matchedEntries, retiredMatches } = matchRoster(fullName);
          if (matchedEntries.length === 0 && retiredMatches.length === 0) {
            leads.push({
              name: fullName,
              institution: `${inst} (${countryCode})`,
              channel: 'crossref-coauthor',
              sourceUrl: author.id,
              evidence: `OpenAlex author (${author.works_count} works, cited by ${author.cited_by_count}) at ${inst}`,
            });
          }
        }
      } catch {
        // continue
      }
    }
  }

  return leads;
}

async function discoverFromLabs(
  roster: RosterEntry[],
  matchRoster: Awaited<ReturnType<typeof loadRosterContext>>['matchRoster'],
): Promise<Lead[]> {
  const leads: Lead[] = [];
  const seen = new Set<string>();
  const netDisc = JSON.parse(await readFile('maintenance/network-discovery.json', 'utf8'));
  const doneSeeds = new Set<string>(netDisc.sources.map((s: any) => s.seedMember));
  const candidates = roster
    .filter(
      (p) =>
        p.websiteUrl &&
        !doneSeeds.has(p.name) &&
        /github\.io|lab|group|people|team|sites\.google/i.test(p.websiteUrl),
    )
    .slice(0, Math.min(limit, 30));

  const nameRegex =
    /\b([A-Z][a-z]+(?:-[A-Z][a-z]+)?(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+(?:-[A-Z][a-z]+)?){1,2})\b/g;
  const labStopWords = new Set([
    'University',
    'Professor',
    'Assistant',
    'Associate',
    'Department',
    'Institute',
    'College',
    'School',
    'Center',
    'Centre',
    'Research',
    'National',
    'Science',
    'Sciences',
    'Engineering',
    'Technology',
    'Team',
    'Faculty',
    'Postdoctoral',
    'Researcher',
    'Student',
    'Students',
    'Trainee',
    'Trainees',
    'Graduate',
    'Graduates',
    'Undergraduate',
    'Senior',
    'Scientist',
    'Director',
    'Member',
    'Members',
    'Former',
    'Current',
    'Alumni',
    'Master',
    'Bioinformatics',
    'Software',
    'Engineer',
    'Lecturer',
    'Lab',
    'Group',
    'Home',
    'News',
    'People',
    'Contact',
  ]);

  for (const seed of candidates) {
    const baseUrl = seed.websiteUrl as string;
    const urlsToTry = [baseUrl];
    if (!/\/(people|team|alumni|members|group)/i.test(baseUrl)) {
      const cleanBase = baseUrl.replace(/\/$/, '');
      urlsToTry.push(`${cleanBase}/people`, `${cleanBase}/team`, `${cleanBase}/alumni`);
    }
    for (const u of urlsToTry.slice(0, 2)) {
      try {
        const { stdout } = await execFileAsync('curl', ['-sL', '-m', '10', u], {
          maxBuffer: 4 * 1024 * 1024,
        });
        if (!stdout || stdout.length < 200 || /404 Not Found/i.test(stdout.slice(0, 400))) continue;
        const text = stdout
          .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' | ')
          .replace(/\s+/g, ' ');
        // Look for occurrences of "Assistant Professor", "Associate Professor", "Professor", "Lecturer", "Staff Scientist"
        for (const match of text.matchAll(
          /.{0,100}\b(Assistant Professor|Associate Professor|Staff Scientist|Senior Lecturer|Lecturer)\b.{0,100}/gi,
        )) {
          const snippet = match[0];
          for (const nm of snippet.matchAll(nameRegex)) {
            const rawName = nm[1].trim();
            if (rawName.split(/\s+/).some((w) => labStopWords.has(w.replace(/\./g, '')))) continue;
            if (!isLikelyVietnameseName(rawName)) continue;
            if (namesMatch(nameTokens(rawName), nameTokens(seed.name))) continue;
            const key = nameTokens(rawName).join('-');
            if (seen.has(key)) continue;
            seen.add(key);
            const { matchedEntries, retiredMatches } = matchRoster(rawName);
            if (matchedEntries.length === 0 && retiredMatches.length === 0) {
              leads.push({
                name: rawName,
                title: match[1],
                channel: 'lab-alumni-network',
                sourceUrl: u,
                evidence: `Found on ${seed.id} (${seed.name}) site ${u}: "${snippet.trim()}"`,
              });
            }
          }
        }
      } catch {
        // ignore fetch error
      }
    }
  }
  return leads;
}

async function analyzeGaps(roster: RosterEntry[]) {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/^the\s+/, '')
      .replace(/\s+at\s+/g, ' ')
      .replace(/,/g, '')
      .trim();

  const currentByNorm = new Map<string, number>();
  for (const p of roster) {
    const k = norm(p.university);
    currentByNorm.set(k, (currentByNorm.get(k) ?? 0) + 1);
  }

  const degByNorm = new Map<string, number>();
  const origName = new Map<string, string>();
  const vietInstRegex =
    /Vietnam|Hanoi|Ho Chi Minh|Hue|Danang|Can Tho|Dalat|VNU|HCM|Foreign Trade|National Economics|Ton Duc Thang|Phenikaa|VinUni|Duy Tan|Bach Khoa|Civil Engineering|Pedagogical|Water Resources|Transport|Banking|Commerce|Agriculture|Polytechnic/i;

  for (const p of roster) {
    for (const f of [
      'phdInstitution',
      'msInstitution',
      'undergradInstitution',
      'mdInstitution',
      'postdocInstitution',
    ] as const) {
      const val = p[f];
      if (val && !vietInstRegex.test(val)) {
        const k = norm(val);
        degByNorm.set(k, (degByNorm.get(k) ?? 0) + 1);
        if (!origName.has(k)) origName.set(k, val);
      }
    }
  }

  const feederGaps = [...degByNorm.entries()]
    .map(([k, trainedCount]) => ({
      institution: origName.get(k) ?? k,
      trainedCount,
      currentFacultyCount: currentByNorm.get(k) ?? 0,
    }))
    .filter((x) => x.trainedCount >= 5 && x.currentFacultyCount <= 2)
    .sort((a, b) => b.trainedCount - a.trainedCount);

  return { feederGaps };
}

const { roster, matchRoster } = await loadRosterContext();
const allLeads: Lead[] = [];

if (mode === 'all' || mode === 'logs') {
  console.error('Scanning relationship-research logs for out-of-roster Vietnamese leads...');
  const logLeads = await discoverFromLogs(matchRoster);
  console.error(`  Found ${logLeads.length} leads from relationship-research logs.`);
  allLeads.push(...logLeads);
}

if (mode === 'all' || mode === 'grants') {
  console.error('Scanning NIH RePORTER & NSF Award Search APIs for active PIs...');
  const grantLeads = await discoverFromGrants(matchRoster);
  console.error(`  Found ${grantLeads.length} leads/updates from NIH/NSF grant APIs.`);
  allLeads.push(...grantLeads);
}

if (mode === 'all' || mode === 'coauthors') {
  console.error('Scanning Crossref recent works of rostered scholars for co-author leads...');
  const coauthorLeads = await discoverFromCoauthors(roster, matchRoster);
  console.error(`  Found ${coauthorLeads.length} leads from Crossref co-authors.`);
  allLeads.push(...coauthorLeads);
}

if (mode === 'all' || mode === 'labs') {
  console.error('Scanning stored lab/personal websiteUrls for alumni & collaborator leads...');
  const labLeads = await discoverFromLabs(roster, matchRoster);
  console.error(`  Found ${labLeads.length} leads from lab/personal websites.`);
  allLeads.push(...labLeads);
}

const gaps = mode === 'all' || mode === 'gaps' ? await analyzeGaps(roster) : { feederGaps: [] };

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalLeads: allLeads.length,
    byChannel: allLeads.reduce<Record<string, number>>((acc, l) => {
      acc[l.channel] = (acc[l.channel] ?? 0) + 1;
      return acc;
    }, {}),
    promotionsOrMoves: allLeads.filter((l) => l.promotionOrMoveHint).length,
    feederGapsCount: gaps.feederGaps.length,
  },
  promotionsOrMoves: allLeads.filter((l) => l.promotionOrMoveHint),
  newCandidateLeads: allLeads.filter((l) => !l.promotionOrMoveHint),
  feederGaps: gaps.feederGaps.slice(0, 35),
};

await writeFile('maintenance/discovery-leads.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));
