import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

interface RosterEntry {
  id: string;
  name: string;
  vietnameseName?: string;
  profileUrl: string;
  websiteUrl?: string;
  labUrl?: string;
  scholarUrl?: string;
  linkedinUrl?: string;
  portrait?: string;
  portraitSource?: string;
  university: string;
  department?: string;
  city?: string;
  state?: string;
  country?: string;
  rank?: string;
  track?: string;
  undergradInstitution?: string;
  undergradYear?: number;
  undergradMajor?: string;
  msInstitution?: string;
  msYear?: number;
  phdInstitution?: string;
  phdYear?: number;
  phdMajor?: string;
  directFields?: string[];
  [key: string]: unknown;
}

interface Issue {
  severity: 'ERROR' | 'WARNING' | 'INFO';
  category: string;
  id?: string;
  name?: string;
  message: string;
}

const COMMON_SLUG_STOPWORDS = new Set([
  'people', 'faculty', 'person', 'profile', 'staff', 'about', 'index', 'html',
  'directory', 'users', 'home', 'default', 'view', 'sites', 'google', 'github',
  'com', 'org', 'edu', 'net', 'io', 'ca', 'vn', 'uk', 'au', 'fr', 'de', 'jp',
  'sg', 'pages', 'user', 'personal', 'lab', 'group', 'team', 'research'
]);

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

function tokenize(s: string): string[] {
  return normalize(s)
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

async function runAudit(): Promise<void> {
  const rosterPath = resolve('public/data.json');
  const roster: RosterEntry[] = JSON.parse(await readFile(rosterPath, 'utf8'));

  const issues: Issue[] = [];

  console.log(`\n🔍 Starting VietProfs Roster Integrity Audit (${roster.length} entries)...\n`);

  // --- 1. Unique Identifiers & URLs ---
  const profileUrls = new Map<string, RosterEntry>();
  const websiteUrls = new Map<string, RosterEntry>();
  const scholarUrls = new Map<string, RosterEntry>();
  const linkedinUrls = new Map<string, RosterEntry>();
  const labUrls = new Map<string, RosterEntry[]>();
  const portraitSources = new Map<string, RosterEntry[]>();
  const portraitHashes = new Map<string, RosterEntry[]>();

  for (const p of roster) {
    // Profile URL
    if (p.profileUrl) {
      if (profileUrls.has(p.profileUrl)) {
        const prev = profileUrls.get(p.profileUrl)!;
        issues.push({
          severity: 'ERROR',
          category: 'Duplicate URL',
          id: p.id,
          name: p.name,
          message: `Duplicates profileUrl with ${prev.name} (${prev.id}): ${p.profileUrl}`,
        });
      } else {
        profileUrls.set(p.profileUrl, p);
      }
    }

    // Website URL
    if (p.websiteUrl) {
      if (websiteUrls.has(p.websiteUrl)) {
        const prev = websiteUrls.get(p.websiteUrl)!;
        issues.push({
          severity: 'ERROR',
          category: 'Duplicate URL',
          id: p.id,
          name: p.name,
          message: `Duplicates websiteUrl with ${prev.name} (${prev.id}): ${p.websiteUrl}`,
        });
      } else {
        websiteUrls.set(p.websiteUrl, p);
      }
    }

    // Scholar URL
    if (p.scholarUrl) {
      if (scholarUrls.has(p.scholarUrl)) {
        const prev = scholarUrls.get(p.scholarUrl)!;
        issues.push({
          severity: 'ERROR',
          category: 'Duplicate URL',
          id: p.id,
          name: p.name,
          message: `Duplicates scholarUrl with ${prev.name} (${prev.id}): ${p.scholarUrl}`,
        });
      } else {
        scholarUrls.set(p.scholarUrl, p);
      }
    }

    // LinkedIn URL
    if (p.linkedinUrl) {
      if (linkedinUrls.has(p.linkedinUrl)) {
        const prev = linkedinUrls.get(p.linkedinUrl)!;
        issues.push({
          severity: 'ERROR',
          category: 'Duplicate URL',
          id: p.id,
          name: p.name,
          message: `Duplicates linkedinUrl with ${prev.name} (${prev.id}): ${p.linkedinUrl}`,
        });
      } else {
        linkedinUrls.set(p.linkedinUrl, p);
      }
    }

    // Lab URL (Multiple entries can co-direct a lab, so warn as INFO/WARNING)
    if (p.labUrl) {
      const existing = labUrls.get(p.labUrl) || [];
      existing.push(p);
      labUrls.set(p.labUrl, existing);
    }

    // Portrait Sources
    if (p.portraitSource) {
      const existing = portraitSources.get(p.portraitSource) || [];
      existing.push(p);
      portraitSources.set(p.portraitSource, existing);
    }

    // Image Hash Check
    if (p.portrait) {
      const portraitFile = resolve('public', p.portrait);
      if (existsSync(portraitFile)) {
        const buf = readFileSync(portraitFile);
        const hash = createHash('sha256').update(buf).digest('hex');
        const existing = portraitHashes.get(hash) || [];
        existing.push(p);
        portraitHashes.set(hash, existing);
      } else {
        issues.push({
          severity: 'ERROR',
          category: 'Missing File',
          id: p.id,
          name: p.name,
          message: `Portrait image file does not exist on disk: ${p.portrait}`,
        });
      }
    }
  }

  // Check duplicate lab URLs
  for (const [url, entries] of labUrls.entries()) {
    if (entries.length > 1) {
      issues.push({
        severity: 'INFO',
        category: 'Shared Lab URL',
        message: `Shared labUrl (${entries.length} faculty): ${url} -> ${entries.map((e) => `${e.name} (${e.id})`).join(', ')}`,
      });
    }
  }

  // Check duplicate portrait sources
  for (const [url, entries] of portraitSources.entries()) {
    if (entries.length > 1) {
      issues.push({
        severity: 'WARNING',
        category: 'Duplicate Portrait Source',
        message: `Shared portraitSource (${entries.length} entries): ${url} -> ${entries.map((e) => `${e.name} (${e.id})`).join(', ')}`,
      });
    }
  }

  // Check duplicate portrait image hashes (stock photos or duplicate files)
  for (const [hash, entries] of portraitHashes.entries()) {
    if (entries.length > 1) {
      issues.push({
        severity: 'WARNING',
        category: 'Identical Portrait Image',
        message: `Identical portrait image file (SHA256 ${hash.slice(0, 8)}...) used by ${entries.length} entries: ${entries.map((e) => `${e.name} (${e.id})`).join(', ')}`,
      });
    }
  }

  // --- 2. Duplicate / Near-Duplicate Faculty Profiles ---
  const simplifiedNameMap = new Map<string, RosterEntry>();
  for (const p of roster) {
    const tokens = tokenize(p.name);
    if (tokens.length >= 2) {
      const first = tokens[0];
      const last = tokens[tokens.length - 1];
      const univNorm = normalize(p.university);
      const key = `${first}_${last}@${univNorm}`;

      if (simplifiedNameMap.has(key)) {
        const prev = simplifiedNameMap.get(key)!;
        issues.push({
          severity: 'WARNING',
          category: 'Potential Duplicate Entry',
          id: p.id,
          name: p.name,
          message: `Possible duplicate record at ${p.university}: [${prev.id}] "${prev.name}" vs [${p.id}] "${p.name}"`,
        });
      } else {
        simplifiedNameMap.set(key, p);
      }
    }
  }

  // --- 3. URL Cross-Contamination / Slug vs. Name Check ---
  // Build a lookup of distinct person given/family name tokens (excluding disambiguation suffixes like "- University")
  const allNameTokens = new Map<string, RosterEntry>();
  for (const p of roster) {
    const rawName = p.name.replace(/\s*-\s*.*$/, '');
    const tokens = tokenize(rawName);
    if (p.vietnameseName) tokens.push(...tokenize(p.vietnameseName));
    for (const t of tokens) {
      if (t.length > 3 && !['nguyen', 'tran', 'le', 'pham', 'hoang', 'huynh', 'phan', 'vu', 'vo', 'dang', 'bui', 'do', 'ho', 'ngo', 'duong', 'ly'].includes(t)) {
        allNameTokens.set(t, p);
      }
    }
  }

  for (const p of roster) {
    const rawName = p.name.replace(/\s*-\s*.*$/, '');
    const personNameTokens = new Set([
      ...tokenize(rawName),
      ...(p.vietnameseName ? tokenize(p.vietnameseName) : []),
    ]);

    const urlsToCheck = [
      { field: 'websiteUrl', url: p.websiteUrl },
      { field: 'profileUrl', url: p.profileUrl },
    ].filter((u) => u.url) as Array<{ field: string; url: string }>;

    for (const { field, url } of urlsToCheck) {
      try {
        const parsed = new URL(url);
        const isPersonalUrl =
          parsed.pathname.includes('~') ||
          parsed.hostname.includes('github.io') ||
          parsed.hostname.includes('sites.google.com') ||
          parsed.hostname.includes('weebly.com') ||
          parsed.hostname.includes('wixsite.com');

        if (isPersonalUrl) {
          // Extract tokens only from the pathname or github/google subdomain (not the root university hostname)
          let slugStr = parsed.pathname;
          if (parsed.hostname.includes('github.io') || parsed.hostname.includes('sites.google.com')) {
            slugStr += ` ${parsed.hostname.split('.')[0]}`;
          }
          const slugTokens = normalize(slugStr)
            .split(/\s+/)
            .filter((t) => t.length > 2 && !COMMON_SLUG_STOPWORDS.has(t));

          if (slugTokens.length > 0) {
            // Check if any slug token overlaps with person's name tokens
            const hasOverlap = slugTokens.some((slug) => {
              for (const nameToken of personNameTokens) {
                if (slug.includes(nameToken) || nameToken.includes(slug)) return true;
              }
              return false;
            });

            // Check if slug token matches another person in the roster AND is not part of this person's own name
            let crossMatchedPerson: RosterEntry | null = null;
            for (const slug of slugTokens) {
              const matchesSelf = personNameTokens.has(slug) || Array.from(personNameTokens).some(t => slug.includes(t) || t.includes(slug));
              if (!matchesSelf && allNameTokens.has(slug) && allNameTokens.get(slug)!.id !== p.id) {
                crossMatchedPerson = allNameTokens.get(slug)!;
                break;
              }
            }

            if (crossMatchedPerson) {
              issues.push({
                severity: 'WARNING',
                category: 'Cross-Person URL Collision',
                id: p.id,
                name: p.name,
                message: `${field} "${url}" contains token matching another roster member: ${crossMatchedPerson.name} (${crossMatchedPerson.id})`,
              });
            } else if (!hasOverlap && slugTokens.length >= 1) {
              issues.push({
                severity: 'INFO',
                category: 'URL Slug Divergence',
                id: p.id,
                name: p.name,
                message: `${field} "${url}" slug tokens [${slugTokens.join(', ')}] have no obvious substring match with name "${p.name}"`,
              });
            }
          }
        }
      } catch {}
    }
  }

  // --- 4. Direct Fields & Honors Integrity ---
  for (const p of roster) {
    if (p.directFields) {
      for (const field of p.directFields) {
        if (p[field] === undefined || p[field] === null || (typeof p[field] === 'string' && !p[field].trim()) || (Array.isArray(p[field]) && (p[field] as unknown[]).length === 0)) {
          issues.push({
            severity: 'ERROR',
            category: 'Direct Fields Anomaly',
            id: p.id,
            name: p.name,
            message: `Declared directField "${field}" is missing or empty on the record`,
          });
        }
      }
    }
    if (p.honors && Array.isArray(p.honors)) {
      for (const h of p.honors as Array<{ name?: string; organization?: string; source?: string; category?: string }>) {
        if (!h.name || !h.organization || !h.source || !h.category) {
          issues.push({
            severity: 'ERROR',
            category: 'Honors Integrity',
            id: p.id,
            name: p.name,
            message: `Incomplete honor object on record: ${JSON.stringify(h)}`,
          });
        }
      }
    }
  }

  // --- 5. Education & Chronology Outliers ---
  const CURRENT_YEAR = new Date().getFullYear();
  for (const p of roster) {
    if (p.undergradYear && p.phdYear) {
      const span = p.phdYear - p.undergradYear;
      if (span < 2) {
        issues.push({
          severity: 'WARNING',
          category: 'Education Chronology',
          id: p.id,
          name: p.name,
          message: `PhD year (${p.phdYear}) is <= 1 year after Undergrad year (${p.undergradYear})`,
        });
      } else if (span > 25) {
        issues.push({
          severity: 'INFO',
          category: 'Education Chronology',
          id: p.id,
          name: p.name,
          message: `Unusually long interval (${span} yrs) between BS (${p.undergradYear}) and PhD (${p.phdYear})`,
        });
      }
    }
    if (p.phdYear && p.phdYear > CURRENT_YEAR) {
      issues.push({
        severity: 'ERROR',
        category: 'Education Chronology',
        id: p.id,
        name: p.name,
        message: `PhD year (${p.phdYear}) is in the future`,
      });
    }
  }

  // --- Output Results ---
  const errors = issues.filter((i) => i.severity === 'ERROR');
  const warnings = issues.filter((i) => i.severity === 'WARNING');
  const infos = issues.filter((i) => i.severity === 'INFO');

  console.log(`\n📊 Audit Summary:`);
  console.log(`   🚨 Errors:   ${errors.length}`);
  console.log(`   ⚠️  Warnings: ${warnings.length}`);
  console.log(`   ℹ️  Info:     ${infos.length}\n`);

  if (errors.length > 0) {
    console.log(`🚨 ERRORS (${errors.length}):`);
    for (const e of errors) {
      console.log(`  - [${e.category}] ${e.name ? `${e.name} (${e.id}): ` : ''}${e.message}`);
    }
    console.log();
  }

  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length}):`);
    for (const w of warnings) {
      console.log(`  - [${w.category}] ${w.name ? `${w.name} (${w.id}): ` : ''}${w.message}`);
    }
    console.log();
  }

  if (infos.length > 0) {
    console.log(`ℹ️  INFORMATIONAL (${infos.length}):`);
    for (const i of infos) {
      console.log(`  - [${i.category}] ${i.name ? `${i.name} (${i.id}): ` : ''}${i.message}`);
    }
    console.log();
  }
}

await runAudit();
