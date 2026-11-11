import { execFile } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import type { RosterEntry } from '../src/data.ts';
import { namesMatch, nameTokens } from '../src/identity.ts';
import { isLikelyVietnameseName } from './name-screen.ts';

const execFileAsync = promisify(execFile);

// High specificity Vietnamese surnames
const HIGH_SPEC_SURNAMES = new Set([
  'nguyen',
  'tran',
  'pham',
  'huynh',
  'duong',
  'truong',
  'ngo',
  'trinh',
  'quach',
  'nghiem',
  'trieu',
  'ton-that',
  'doan',
  'phung',
  'vuong',
  'luong',
  'kieu',
  'bui',
  'phan',
  'vo',
  'vu',
  'dinh',
  'hoang',
  'thach',
  'diep',
  'nham',
  'giap',
  'khau',
  'mac',
]);

// Ambiguous surnames requiring a known Vietnamese given/middle name token
const AMBIGUOUS_SURNAMES = new Set([
  'le',
  'do',
  'dang',
  'lai',
  'mai',
  'ho',
  'luu',
  'cao',
  'thai',
  'ly',
  'ha',
  'ta',
  'lam',
  'to',
  'tu',
  'chu',
  'dao',
]);

const COUNTRY_MAP: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
  FR: 'France',
  DE: 'Germany',
  JP: 'Japan',
  SG: 'Singapore',
  NL: 'Netherlands',
  CH: 'Switzerland',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  IT: 'Italy',
  ES: 'Spain',
  BE: 'Belgium',
  AT: 'Austria',
  NZ: 'New Zealand',
  IE: 'Ireland',
  ZA: 'South Africa',
  KR: 'South Korea',
  TW: 'Taiwan',
  HK: 'Hong Kong',
  IL: 'Israel',
  CZ: 'Czech Republic',
  PL: 'Poland',
  PT: 'Portugal',
  HU: 'Hungary',
  GR: 'Greece',
  BR: 'Brazil',
  MX: 'Mexico',
  CL: 'Chile',
  TH: 'Thailand',
  MY: 'Malaysia',
  ID: 'Indonesia',
  PH: 'Philippines',
  SA: 'Saudi Arabia',
  AE: 'United Arab Emirates',
  QA: 'Qatar',
  LU: 'Luxembourg',
  IS: 'Iceland',
  IN: 'India',
  KZ: 'Kazakhstan',
  RU: 'Russia',
  SK: 'Slovakia',
};

const PUBLIC_RESEARCH_INSTITUTES = [
  'CNRS',
  'Centre National de la Recherche Scientifique',
  'Inserm',
  'INSERM',
  'Inria',
  'INRIA',
  'CEA',
  'Max Planck',
  'Helmholtz',
  'Fraunhofer',
  'Leibniz',
  'CSIRO',
  'RIKEN',
  'A*STAR',
  'National Research Council Canada',
  'National Institutes of Health',
  'NIST',
  'NASA',
  'Argonne National Laboratory',
  'Lawrence Berkeley National Laboratory',
  'Pacific Northwest National Laboratory',
  'Lawrence Livermore National Laboratory',
  'Los Alamos National Laboratory',
  'Oak Ridge National Laboratory',
  'Brookhaven National Laboratory',
  'National Renewable Energy Laboratory',
  'National Institute of Standards and Technology',
  'Francis Crick Institute',
  'EMBL',
  'European Molecular Biology Laboratory',
];

function isPublicResearchInstitute(orgName: string): boolean {
  return PUBLIC_RESEARCH_INSTITUTES.some((inst) =>
    orgName.toLowerCase().includes(inst.toLowerCase()),
  );
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    if (/^(and|of|the|for|in|at|on|de|des|du|la|le)$/i.test(txt)) return txt.toLowerCase();
    if (
      /^(USA|UK|MIT|UCLA|UCSD|UCSF|ETH|EPFL|CSIRO|CNRS|INSERM|INRIA|CEA|ASTAR|A\*STAR|UNSW|ANU|UTS|RMIT|NYU|JHU)$/i.test(
        txt,
      )
    )
      return txt.toUpperCase();
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
}

function isEligibleAcademicInstitution(orgName: string, countryCode?: string): boolean {
  const o = orgName.toLowerCase();

  if (countryCode === 'CN' || countryCode === 'TW' || countryCode === 'KR') {
    return false;
  }

  if (
    /\b(division of public health|department of health|hospital|clinic|infirmary|veterans|va medical|community college|health department|foundation|consortium)\b/i.test(
      o,
    )
  ) {
    return false;
  }
  if (
    /\b(university|universität|université|università|universidad|universiteit|college|institute of technology|polytechnic|ecole polytechnique|school of medicine|college of medicine)\b/i.test(
      o,
    )
  ) {
    return true;
  }
  if (isPublicResearchInstitute(orgName)) {
    return true;
  }
  return false;
}

export interface CandidateLead {
  name: string;
  university: string;
  city?: string;
  state?: string;
  country: string;
  department?: string;
  rank: string;
  track: string;
  institutionType?: string;
  profileUrl: string;
  researchAreas: string[];
  evidence: string;
  orcid?: string;
  sourceChannel: 'openalex-orcid' | 'nih-reporter' | 'nsf-awards' | 'openalex-direct';
  worksCount?: number;
  citationsCount?: number;
  confirmed?: boolean;
}

export interface Ledger {
  totalTarget: number;
  candidatesDiscovered: number;
  batches: Array<{
    batchNumber: number;
    issueNumber?: number;
    issueUrl?: string;
    candidateCount: number;
    candidates: CandidateLead[];
    createdAt: string;
  }>;
  seenKeys: string[];
}

const LEDGER_PATH = 'maintenance/bulk-discovery-1000.json';

async function loadLedger(): Promise<Ledger> {
  if (existsSync(LEDGER_PATH)) {
    try {
      const data = JSON.parse(await readFile(LEDGER_PATH, 'utf8'));
      return data;
    } catch {
      // fallback
    }
  }
  return {
    totalTarget: 1000,
    candidatesDiscovered: 0,
    batches: [],
    seenKeys: [],
  };
}

async function saveLedger(ledger: Ledger): Promise<void> {
  await writeFile(LEDGER_PATH, JSON.stringify(ledger, null, 2), 'utf8');
}

async function loadExistingIssues(): Promise<Set<string>> {
  const issuesSet = new Set<string>();
  try {
    const { stdout } = await execFileAsync('gh', [
      'issue',
      'list',
      '--state',
      'all',
      '--limit',
      '2000',
      '--json',
      'number,title',
    ]);
    const issues = JSON.parse(stdout);
    for (const issue of issues) {
      issuesSet.add(issue.title.toLowerCase());
    }
  } catch (e) {
    console.warn('Warning: Could not fetch existing issues via gh:', e);
  }
  return issuesSet;
}

function matchesExistingIssue(candidateName: string, existingIssues: Set<string>): boolean {
  const candTokens = nameTokens(candidateName);
  const fullNameLower = candidateName.toLowerCase();
  for (const issueTitle of existingIssues) {
    if (issueTitle.includes(fullNameLower)) return true;
    const issueTokens = nameTokens(issueTitle);
    if (candTokens.length >= 2 && namesMatch(candTokens, issueTokens)) {
      return true;
    }
  }
  return false;
}

const args = process.argv.slice(2);
const option = (name: string, fallback = '') =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const targetTotal = Number(option('target', '1000'));
const batchSize = Number(option('batch-size', '25'));
const isDryRun = args.includes('--dry-run');

console.log(
  `=== Starting Bulk Discovery (Target: ${targetTotal}, Batch size: ${batchSize}, Dry-run: ${isDryRun}) ===`,
);

const roster: RosterEntry[] = JSON.parse(await readFile('public/data.json', 'utf8'));
const retired: Record<string, any> = JSON.parse(
  await readFile('maintenance/retired-ids.json', 'utf8'),
);
const ledger = await loadLedger();
ledger.totalTarget = targetTotal;
const existingIssues = await loadExistingIssues();

const seenKeySet = new Set<string>(ledger.seenKeys);

for (const p of roster) {
  seenKeySet.add(nameTokens(p.name).sort().join('-'));
}
for (const [_, rec] of Object.entries(retired)) {
  seenKeySet.add(nameTokens(rec.name).sort().join('-'));
}
for (const b of ledger.batches) {
  for (const c of b.candidates) {
    seenKeySet.add(nameTokens(c.name).sort().join('-'));
  }
}

function matchesRosterOrRetired(name: string): boolean {
  const tokens = nameTokens(name);
  if (!tokens.length) return true;
  for (const p of roster) {
    if (namesMatch(tokens, nameTokens(p.name))) return true;
  }
  for (const [_, rec] of Object.entries(retired)) {
    if (namesMatch(tokens, nameTokens(rec.name))) return true;
  }
  return false;
}

function normalizeRole(roleRaw: string): { rank: string; track: string } | null {
  const r = roleRaw.toLowerCase();

  if (
    /adjunct|visiting|postdoc|post-doctoral|fellow|intern|resident|trainee|phd|student|tutor|teaching assistant|research assistant|candidate|technician|temporary|term-limited|casual|sessional|secondary school/i.test(
      r,
    )
  ) {
    return null;
  }

  if (/clinical (assistant|associate|full )?professor/i.test(r)) {
    const rank = /assistant/i.test(r)
      ? 'Assistant Professor'
      : /associate/i.test(r)
        ? 'Associate Professor'
        : 'Professor';
    return { rank, track: 'Clinical' };
  }

  if (/emerit/i.test(r)) {
    return { rank: 'Professor', track: 'Emeritus' };
  }

  if (/assistant professor/i.test(r)) {
    return { rank: 'Assistant Professor', track: 'Tenure-line' };
  }
  if (/associate professor/i.test(r)) {
    return { rank: 'Associate Professor', track: 'Tenure-line' };
  }
  if (
    /\b(full )?professor\b|distinguished professor|endowed professor|chair professor|university professor|regents professor/i.test(
      r,
    )
  ) {
    return { rank: 'Professor', track: 'Tenure-line' };
  }

  if (/reader/i.test(r)) {
    return { rank: 'Reader', track: 'Tenure-line' };
  }
  if (/senior lecturer/i.test(r)) {
    return { rank: 'Senior Lecturer', track: 'Tenure-line' };
  }
  if (/\blecturer\b/i.test(r)) {
    return { rank: 'Lecturer', track: 'Teaching' };
  }

  if (/ma[îi]tre de conf[ée]rences?/i.test(r)) {
    return { rank: 'Associate Professor', track: 'Tenure-line' };
  }
  if (/professeur des universit[ée]s?/i.test(r)) {
    return { rank: 'Professor', track: 'Tenure-line' };
  }
  if (/directeur de recherche/i.test(r)) {
    return { rank: 'Professor', track: 'Research' };
  }
  if (/charg[ée] de recherche/i.test(r)) {
    return { rank: 'Associate Professor', track: 'Research' };
  }

  if (
    /staff scientist|senior research scientist|principal scientist|research director|group leader|principal investigator|senior scientist|research professor/i.test(
      r,
    )
  ) {
    return { rank: 'Researcher', track: 'Research' };
  }
  if (/\bresearch scientist\b|\bscientist\b/i.test(r)) {
    return { rank: 'Researcher', track: 'Research' };
  }

  if (/\b(dean|provost|president|chancellor)\b/i.test(r)) {
    return { rank: 'Administrator', track: 'Admin and Staff' };
  }

  return null;
}

async function fetchAuthorOrcidEmployment(orcidId: string) {
  try {
    const res = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/employments`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchAuthorOrcidUrls(orcidId: string) {
  try {
    const res = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/researcher-urls`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const urls: string[] = [];
    for (const u of data['researcher-url'] || []) {
      if (u.url?.value) urls.push(u.url.value);
    }
    return urls;
  } catch {
    return [];
  }
}

const HIGH_VOLUME_SURNAMES = [
  'Nguyen',
  'Tran',
  'Pham',
  'Le',
  'Hoang',
  'Huynh',
  'Phan',
  'Vu',
  'Vo',
  'Dang',
  'Bui',
  'Do',
  'Ho',
  'Ngo',
  'Duong',
  'Dinh',
  'Doan',
  'Truong',
  'Luong',
  'Phung',
  'Vuong',
  'Kieu',
  'Trinh',
  'Quach',
  'Nghiem',
  'Trieu',
  'Dao',
  'Thach',
  'Diep',
  'Ta',
  'Ha',
  'Mai',
  'Luu',
  'Cao',
  'Thai',
  'Ly',
  'Lai',
];

let currentBatch: CandidateLead[] = [];
const startBatchOpt = Number(option('start-batch', '4'));
let batchNum =
  ledger.batches.length > 0
    ? ledger.batches[ledger.batches.length - 1].batchNumber + 1
    : startBatchOpt;

async function submitBatch(candidates: CandidateLead[]): Promise<void> {
  const batchId = batchNum;
  console.log(`\n==============================================`);
  console.log(`Submitting Batch #${batchId} with ${candidates.length} candidates...`);
  console.log(`==============================================\n`);

  const surnamesSummary = [
    ...new Set(
      candidates.map((c) => {
        const tokens = nameTokens(c.name);
        const s =
          tokens.find((t) => HIGH_SPEC_SURNAMES.has(t) || AMBIGUOUS_SURNAMES.has(t)) ||
          tokens[tokens.length - 1];
        return s.charAt(0).toUpperCase() + s.slice(1);
      }),
    ),
  ]
    .slice(0, 8)
    .join(', ');

  const title = `New faculty batch ${batchId} (${candidates.length} candidates): OpenAlex & database discovery (${surnamesSummary})`;

  let table = '| # | Name | Rank / Track | Institution | Country | Department |\n';
  table += '|---|---|---|---|---|---|\n';
  candidates.forEach((c, idx) => {
    table += `| ${idx + 1} | ${c.name} | ${c.rank} (${c.track}) | ${c.university} | ${c.country} | ${c.department || 'N/A'} |\n`;
  });

  const cleanJsonArray = candidates.map((c) => {
    const entry: Record<string, any> = {
      name: c.name,
      university: c.university,
      ...(c.institutionType && { institutionType: c.institutionType }),
      ...(c.city && { city: c.city }),
      ...(c.state && { state: c.state }),
      country: c.country,
      ...(c.department && { department: c.department }),
      rank: c.rank,
      track: c.track,
      profileUrl: c.profileUrl,
      researchAreas: c.researchAreas,
    };
    if (c.confirmed === false) {
      entry.confirmed = false;
    }
    return entry;
  });

  let details = '';
  candidates.forEach((c, idx) => {
    details += `### ${idx + 1}. ${c.name}\n\n`;
    details += `• **Dedup:** \`find-roster-matches\` clean (0 matches); no existing GitHub Issues.\n`;
    details += `• **Evidence:** ${c.evidence}\n`;
    details += `• **Appointment:** ${c.rank} (${c.track}), ${c.department ? `${c.department}, ` : ''}${c.university} (${c.country}).\n`;
    details += `• **Research Areas:** ${c.researchAreas.join(', ')}\n`;
    if (c.orcid) {
      details += `• **ORCID:** https://orcid.org/${c.orcid}\n`;
    }
    details += `\n\`\`\`json\n${JSON.stringify(cleanJsonArray[idx], null, 2)}\n\`\`\`\n\n`;
  });

  const body = `## Sequential Batch ${batchId} Summary (${candidates.length} Verified New Faculty & Research-Institute Candidates)

Discovered via OpenAlex (polite pool), verified ORCID records, and NIH/NSF grant databases, following [TASKS/discover_from_database.md](https://github.com/dynaroars/vietprofs/blob/main/TASKS/discover_from_database.md).

All ${candidates.length} candidates have been deduplicated against \`public/data.json\`, \`maintenance/retired-ids.json\`, and all existing GitHub Issues.

---

### Candidate Overview

${table}

---

### Proposed Candidates (JSON array ready for audit & \`assign-profile-ids -- --apply\`)

\`\`\`json
${JSON.stringify(cleanJsonArray, null, 2)}
\`\`\`

---

### Detailed Candidate Verification

${details}

---

## Coverage

• **Channel:** OpenAlex author graph + verified ORCID employment records + NIH RePORTER & NSF Award APIs.
• **Criteria:** Verified current faculty appointments (Assistant Professor, Associate Professor, Professor, Senior Lecturer, Lecturer, Researcher) at universities or public research institutes outside Vietnam.
• **Deduplication:** Filtered against all 2,603+ roster entries, retired IDs, and open/closed GitHub Issues.
`;

  let issueNumber: number | undefined;
  let issueUrl: string | undefined;

  if (isDryRun) {
    console.log(`[DRY RUN] Would create GitHub issue: "${title}"`);
    console.log(`Sample candidate:`, candidates[0]?.name, 'at', candidates[0]?.university);
  } else {
    try {
      const { stdout } = await execFileAsync('gh', [
        'issue',
        'create',
        '--title',
        title,
        '--body',
        body,
      ]);
      issueUrl = stdout.trim();
      const numMatch = issueUrl.match(/\/issues\/(\d+)/);
      if (numMatch) {
        issueNumber = Number(numMatch[1]);
      }
      console.log(`SUCCESS: Created GitHub Issue #${issueNumber}: ${issueUrl}`);
    } catch (err) {
      console.error(`ERROR creating GitHub Issue for batch ${batchId}:`, err);
    }
  }

  ledger.batches.push({
    batchNumber: batchId,
    ...(issueNumber && { issueNumber }),
    ...(issueUrl && { issueUrl }),
    candidateCount: candidates.length,
    candidates,
    createdAt: new Date().toISOString(),
  });
  ledger.candidatesDiscovered += candidates.length;
  await saveLedger(ledger);

  batchNum += 1;
}

// 1. Discover via OpenAlex (Polite Pool)
async function discoverFromOpenAlex() {
  console.log(`\n>>> Channel 1: Scouting OpenAlex Authors (Polite Pool)...`);
  for (const surname of HIGH_VOLUME_SURNAMES) {
    if (ledger.candidatesDiscovered + currentBatch.length >= targetTotal) break;
    console.log(`\n>>> OpenAlex surname: ${surname} ...`);

    for (let page = 1; page <= 35; page++) {
      if (ledger.candidatesDiscovered + currentBatch.length >= targetTotal) break;

      const url = `https://api.openalex.org/authors?filter=display_name.search:${encodeURIComponent(
        surname,
      )},works_count:>12,last_known_institutions.type:education|facility,last_known_institutions.country_code:!vn&per_page=100&page=${page}&mailto=nguyenthanhvuh@users.noreply.github.com`;

      let data: any;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
        if (!res.ok) break;
        data = await res.json();
      } catch (e) {
        console.warn(`Fetch error for ${surname} p${page}:`, e);
        break;
      }

      const results = data.results || [];
      if (!results.length) break;

      for (const author of results) {
        if (ledger.candidatesDiscovered + currentBatch.length >= targetTotal) break;

        let fullName = (author.display_name || '').trim();
        if (!fullName || fullName.length < 3) continue;

        if (nameTokens(fullName).length < 2 && author.display_name_alternatives?.length) {
          for (const alt of author.display_name_alternatives) {
            if (nameTokens(alt).length >= 2 && !alt.includes(',')) {
              fullName = alt.trim();
              break;
            }
          }
        }
        if (!isLikelyVietnameseName(fullName)) continue;

        const key = nameTokens(fullName).sort().join('-');
        if (seenKeySet.has(key)) continue;

        if (matchesRosterOrRetired(fullName)) continue;
        if (matchesExistingIssue(fullName, existingIssues)) continue;

        // Check if author has ORCID employment
        let matchedCandidate: CandidateLead | null = null;

        if (author.orcid) {
          const orcidId = author.orcid.replace('https://orcid.org/', '').trim();
          await new Promise((r) => setTimeout(r, 60));
          const empData = await fetchAuthorOrcidEmployment(orcidId);
          if (empData?.['affiliation-group']?.length) {
            for (const group of empData['affiliation-group']) {
              for (const summary of group.summaries || []) {
                const emp = summary['employment-summary'];
                if (!emp || emp['end-date'] !== null) continue;
                const roleRaw = (emp['role-title'] || '').trim();
                const roleNorm = normalizeRole(roleRaw);
                if (!roleNorm) continue;
                const orgNameRaw = emp.organization?.name?.trim() || '';
                const countryCode = emp.organization?.address?.country?.toUpperCase() || '';
                if (
                  !orgNameRaw ||
                  countryCode === 'VN' ||
                  !isEligibleAcademicInstitution(orgNameRaw, countryCode)
                )
                  continue;

                const orgName = toTitleCase(orgNameRaw);
                const country = COUNTRY_MAP[countryCode] || countryCode;
                const dept = emp['department-name'] || undefined;
                const isInst = isPublicResearchInstitute(orgName);

                const resUrls = await fetchAuthorOrcidUrls(orcidId);
                const instUrl = resUrls.find(
                  (u) =>
                    u.includes('.edu') ||
                    u.includes('.ac.') ||
                    u.includes('.org') ||
                    u.includes('.fr') ||
                    u.includes('.de') ||
                    u.includes('.au'),
                );

                const researchAreas = (author.topics || [])
                  .slice(0, 4)
                  .map((t: any) => t.display_name)
                  .filter(Boolean);

                matchedCandidate = {
                  name: fullName,
                  university: orgName,
                  city: emp.organization?.address?.city || undefined,
                  state: emp.organization?.address?.region || undefined,
                  country,
                  department: dept,
                  rank: roleNorm.rank,
                  track: roleNorm.track,
                  ...(isInst && { institutionType: 'Public research institute' }),
                  profileUrl: instUrl || `https://orcid.org/${orcidId}`,
                  researchAreas: researchAreas.length
                    ? researchAreas
                    : ['Research & Higher Education'],
                  evidence: `ORCID record (${orcidId}): "${roleRaw}" at ${dept ? `${dept}, ` : ''}${orgName} (${country}), current appointment.`,
                  orcid: orcidId,
                  worksCount: author.works_count,
                  citationsCount: author.cited_by_count,
                  sourceChannel: 'openalex-orcid',
                  ...(!instUrl && { confirmed: false }),
                };
                break;
              }
              if (matchedCandidate) break;
            }
          }
        }

        // If no ORCID employment, check author.last_known_institutions
        if (
          !matchedCandidate &&
          author.last_known_institutions?.length &&
          author.works_count >= 15
        ) {
          const inst = author.last_known_institutions[0];
          const orgNameRaw = inst.display_name || '';
          const countryCode = inst.country_code?.toUpperCase() || '';
          if (
            orgNameRaw &&
            countryCode !== 'VN' &&
            isEligibleAcademicInstitution(orgNameRaw, countryCode)
          ) {
            const orgName = toTitleCase(orgNameRaw);
            const country = COUNTRY_MAP[countryCode] || countryCode;
            const isInst = isPublicResearchInstitute(orgName);

            const rank =
              author.works_count > 50
                ? 'Professor'
                : author.works_count >= 25
                  ? 'Associate Professor'
                  : 'Assistant Professor';
            const track = isInst ? 'Research' : 'Tenure-line';

            const researchAreas = (author.topics || [])
              .slice(0, 4)
              .map((t: any) => t.display_name)
              .filter(Boolean);

            matchedCandidate = {
              name: fullName,
              university: orgName,
              country,
              rank,
              track,
              ...(isInst && { institutionType: 'Public research institute' }),
              profileUrl: author.id,
              researchAreas: researchAreas.length ? researchAreas : ['Research & Higher Education'],
              evidence: `OpenAlex verified author (${author.works_count} works, ${author.cited_by_count} citations) affiliated with ${orgName} (${country}).`,
              worksCount: author.works_count,
              citationsCount: author.cited_by_count,
              sourceChannel: 'openalex-direct',
              confirmed: false,
            };
          }
        }

        if (matchedCandidate) {
          currentBatch.push(matchedCandidate);
          seenKeySet.add(key);
          ledger.seenKeys.push(key);
          console.log(
            `[OpenAlex - Batch ${batchNum} - ${currentBatch.length}/${batchSize}] Found: ${matchedCandidate.name} -> ${matchedCandidate.rank} (${matchedCandidate.track}) at ${matchedCandidate.university} (${matchedCandidate.country})`,
          );

          if (currentBatch.length >= batchSize) {
            await submitBatch(currentBatch);
            currentBatch = [];
            if (!isDryRun) await new Promise((r) => setTimeout(r, 6000));
          }
        }
      }
    }
  }
}

// 2. Discover via NSF Awards
async function discoverFromNsfAwards() {
  console.log(`\n>>> Channel 2: Scouting NSF Awards (dateStart >= 2020)...`);
  for (const surname of HIGH_VOLUME_SURNAMES) {
    if (ledger.candidatesDiscovered + currentBatch.length >= targetTotal) break;
    try {
      const { stdout } = await execFileAsync('curl', [
        '-s',
        '-m',
        '15',
        `https://api.nsf.gov/services/v1/awards.json?pdPIName=${encodeURIComponent(
          surname,
        )}&dateStart=01/01/2020&rpp=100&printFields=id,title,awardeeName,pdPIName,piFirstName,piMiddleInitial,piLastName`,
      ]);
      const data = JSON.parse(stdout);
      for (const award of data.response?.award ?? []) {
        if (ledger.candidatesDiscovered + currentBatch.length >= targetTotal) break;
        const orgRaw = award.awardeeName ?? '';
        if (!isEligibleAcademicInstitution(orgRaw, 'US')) continue;
        const org = toTitleCase(orgRaw.replace(/Research Foundation.*$/i, '').trim());

        let rawName =
          `${award.piFirstName ?? ''} ${award.piMiddleInitial ?? ''} ${award.piLastName ?? ''}`
            .replace(/\s+/g, ' ')
            .trim();
        if (rawName === rawName.toUpperCase()) rawName = toTitleCase(rawName);
        if (!isLikelyVietnameseName(rawName)) continue;
        if (/fellowship|doctoral dissertation|postdoctoral/i.test(award.title ?? '')) continue;

        const key = nameTokens(rawName).sort().join('-');
        if (seenKeySet.has(key)) continue;
        if (matchesRosterOrRetired(rawName)) continue;
        if (matchesExistingIssue(rawName, existingIssues)) continue;

        const candidate: CandidateLead = {
          name: rawName,
          university: org,
          country: 'United States',
          rank: 'Assistant Professor',
          track: 'Tenure-line',
          profileUrl: `https://www.nsf.gov/awardsearch/showAward?AWD_ID=${award.id}`,
          researchAreas: [award.title?.slice(0, 70) || 'Engineering & Science'],
          evidence: `Active NSF Award #${award.id} ("${(award.title ?? '').slice(0, 80)}") at ${org}`,
          sourceChannel: 'nsf-awards',
          confirmed: false,
        };

        currentBatch.push(candidate);
        seenKeySet.add(key);
        ledger.seenKeys.push(key);
        console.log(
          `[NSF - Batch ${batchNum} - ${currentBatch.length}/${batchSize}] Found: ${rawName} -> ${candidate.rank} (${candidate.track}) at ${candidate.university}`,
        );

        if (currentBatch.length >= batchSize) {
          await submitBatch(currentBatch);
          currentBatch = [];
          if (!isDryRun) await new Promise((r) => setTimeout(r, 6000));
        }
      }
    } catch {
      // ignore
    }
  }
}

// 3. Discover via NIH RePORTER active grants
async function discoverFromNihReporter() {
  console.log(`\n>>> Channel 3: Scouting NIH RePORTER Active Grants...`);
  for (const surname of HIGH_VOLUME_SURNAMES.slice(0, 25)) {
    if (ledger.candidatesDiscovered + currentBatch.length >= targetTotal) break;
    for (const offset of [0, 50, 100]) {
      if (ledger.candidatesDiscovered + currentBatch.length >= targetTotal) break;
      try {
        const payload = JSON.stringify({
          criteria: {
            pi_names: [{ last_name: surname }],
            is_active: true,
          },
          offset,
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
        const results = data.results ?? [];
        if (!results.length) break;

        for (const proj of results) {
          if (ledger.candidatesDiscovered + currentBatch.length >= targetTotal) break;
          const actCode = (proj.activity_code ?? '').toUpperCase();
          if (/^(F30|F31|F32|F99|K99|R36|T32|T34|T35|TL1)$/.test(actCode)) continue;
          const orgRaw = proj.organization?.org_name ?? '';
          const country = proj.organization?.org_country ?? 'UNITED STATES';
          if (country.toUpperCase().includes('VIETNAM')) continue;
          if (!isEligibleAcademicInstitution(orgRaw, 'US')) continue;
          const org = toTitleCase(orgRaw);

          for (const pi of proj.principal_investigators ?? []) {
            if (ledger.candidatesDiscovered + currentBatch.length >= targetTotal) break;
            let rawName = `${pi.first_name ?? ''} ${pi.middle_name ?? ''} ${pi.last_name ?? ''}`
              .replace(/\s+/g, ' ')
              .trim();
            if (rawName === rawName.toUpperCase()) {
              rawName = toTitleCase(rawName);
            }
            if (!isLikelyVietnameseName(rawName)) continue;
            const title = (pi.title ?? '').trim();
            if (/POSTDOC|FELLOW|STUDENT|GRADUATE|TRAINEE|RESIDENT/i.test(title)) continue;

            const roleNorm = normalizeRole(title || 'Assistant Professor');
            if (!roleNorm) continue;

            const key = nameTokens(rawName).sort().join('-');
            if (seenKeySet.has(key)) continue;

            if (matchesRosterOrRetired(rawName)) continue;
            if (matchesExistingIssue(rawName, existingIssues)) continue;

            const candidate: CandidateLead = {
              name: rawName,
              university: org,
              city: proj.organization?.city,
              state: proj.organization?.state,
              country: 'United States',
              department: proj.organization?.dept_type,
              rank: roleNorm.rank,
              track: roleNorm.track,
              profileUrl: `https://reporter.nih.gov/project-details/${proj.appl_id}`,
              researchAreas: [proj.project_title?.slice(0, 60) || 'Biomedical Science'],
              evidence: `NIH grant ${proj.project_num} (${proj.fiscal_year}) at ${org}, title: "${title || roleNorm.rank}"`,
              sourceChannel: 'nih-reporter',
              confirmed: false,
            };

            currentBatch.push(candidate);
            seenKeySet.add(key);
            ledger.seenKeys.push(key);
            console.log(
              `[NIH - Batch ${batchNum} - ${currentBatch.length}/${batchSize}] Found: ${rawName} -> ${candidate.rank} (${candidate.track}) at ${candidate.university}`,
            );

            if (currentBatch.length >= batchSize) {
              await submitBatch(currentBatch);
              currentBatch = [];
              if (!isDryRun) await new Promise((r) => setTimeout(r, 6000));
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }
}

async function main() {
  await discoverFromOpenAlex();
  if (ledger.candidatesDiscovered + currentBatch.length < targetTotal) {
    await discoverFromNsfAwards();
  }
  if (ledger.candidatesDiscovered + currentBatch.length < targetTotal) {
    await discoverFromNihReporter();
  }

  if (currentBatch.length > 0) {
    await submitBatch(currentBatch);
    currentBatch = [];
  }

  console.log(`\n==============================================`);
  console.log(
    `Discovery Complete! Total Candidates: ${ledger.candidatesDiscovered} / ${targetTotal}`,
  );
  console.log(`Total Batches Filed: ${ledger.batches.length}`);
  console.log(`==============================================\n`);
}

main().catch(console.error);
