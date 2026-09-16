#!/usr/bin/env -S npx --no-install tsx

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
  institutionType?: string;
  undergradInstitution?: string;
  undergradYear?: number;
  undergradMajor?: string;
  msInstitution?: string;
  msYear?: number;
  phdInstitution?: string;
  phdYear?: number;
  phdMajor?: string;
  about?: string;
  directFields?: string[];
  [key: string]: unknown;
}

interface AuditIssue {
  severity: 'ERROR' | 'WARNING' | 'INFO';
  category: string;
  id: string;
  name: string;
  detail: string;
}

const CURRENT_YEAR = new Date().getFullYear();

// Scraper & boilerplate phrases to flag in `about` or text fields
const BOILERPLATE_PATTERNS = [
  /university'?s\s+(research|department|mission|focus|center|faculty|program|campus)/i,
  /college'?s\s+(research|department|mission|focus|center|faculty|program)/i,
  /department'?s\s+(research|mission|focus|center|faculty|program)/i,
  /menu\s+home/i,
  /skip\s+to\s+content/i,
  /all\s+rights\s+reserved/i,
  /copyright\s+\d{4}/i,
  /search\s+this\s+site/i,
  /toggle\s+navigation/i,
  /contact\s+us/i,
  /read\s+more/i,
  /click\s+here/i,
  /accessibility\s+statement/i,
  /privacy\s+policy/i,
  /terms\s+of\s+use/i,
];

// Gendered and 1st/2nd person pronouns prohibited in neutral 3rd-person overviews
const GENDERED_PRONOUNS = /\b(he|she|his|her|him|hers|himself|herself|I|we|our|my|us|me)\b/i;

async function runExhaustiveAudit() {
  const rosterPath = resolve('public/data.json');
  const roster: RosterEntry[] = JSON.parse(await readFile(rosterPath, 'utf8'));

  const issues: AuditIssue[] = [];

  console.log(`\n==================================================`);
  console.log(`🚀 RUNNING EXHAUSTIVE ROSTER AUDIT (${roster.length} entries)`);
  console.log(`==================================================\n`);

  // --- Map for uniqueness and suffix checks ---
  const nameCounts = new Map<string, number>();
  for (const entry of roster) {
    const baseName = entry.name.replace(/\s+-\s+.*$/, '').trim();
    nameCounts.set(baseName, (nameCounts.get(baseName) || 0) + 1);
  }

  const profileUrls = new Map<string, string>();
  const websiteUrls = new Map<string, string>();
  const scholarUrls = new Map<string, string>();

  for (const entry of roster) {
    const id = entry.id;
    const name = entry.name;

    // 1. Name & Disambiguation Discrepancies
    const baseName = entry.name.replace(/\s+-\s+.*$/, '').trim();
    const count = nameCounts.get(baseName) || 0;
    const hasSuffix = entry.name.includes(' - ');

    if (count > 1 && !hasSuffix) {
      issues.push({
        severity: 'ERROR',
        category: 'Disambiguation',
        id,
        name,
        detail: `Duplicate base name "${baseName}" across roster, but entry is missing " - <University>" disambiguation suffix.`,
      });
    } else if (count === 1 && hasSuffix) {
      issues.push({
        severity: 'WARNING',
        category: 'Disambiguation',
        id,
        name,
        detail: `Entry has disambiguation suffix " - <University>", but base name "${baseName}" is unique across the roster.`,
      });
    }

    // 2. URL Checks & Duplicates
    if (entry.profileUrl) {
      if (profileUrls.has(entry.profileUrl)) {
        issues.push({
          severity: 'ERROR',
          category: 'Duplicate URL',
          id,
          name,
          detail: `profileUrl is identical to ${profileUrls.get(entry.profileUrl)}: ${entry.profileUrl}`,
        });
      } else {
        profileUrls.set(entry.profileUrl, id);
      }
    } else {
      issues.push({
        severity: 'ERROR',
        category: 'Missing URL',
        id,
        name,
        detail: `Missing mandatory profileUrl.`,
      });
    }

    if (entry.websiteUrl) {
      if (websiteUrls.has(entry.websiteUrl)) {
        issues.push({
          severity: 'ERROR',
          category: 'Duplicate URL',
          id,
          name,
          detail: `websiteUrl is identical to ${websiteUrls.get(entry.websiteUrl)}: ${entry.websiteUrl}`,
        });
      } else {
        websiteUrls.set(entry.websiteUrl, id);
      }
    }

    if (entry.scholarUrl) {
      if (scholarUrls.has(entry.scholarUrl)) {
        issues.push({
          severity: 'ERROR',
          category: 'Duplicate URL',
          id,
          name,
          detail: `scholarUrl is identical to ${scholarUrls.get(entry.scholarUrl)}: ${entry.scholarUrl}`,
        });
      } else {
        scholarUrls.set(entry.scholarUrl, id);
      }
    }

    // 3. Portrait & Media Checks
    if (entry.portrait && !entry.portraitSource) {
      issues.push({
        severity: 'ERROR',
        category: 'Portrait Integrity',
        id,
        name,
        detail: `Has portrait "${entry.portrait}" but is missing portraitSource.`,
      });
    }
    if (!entry.portrait && entry.portraitSource) {
      issues.push({
        severity: 'ERROR',
        category: 'Portrait Integrity',
        id,
        name,
        detail: `Has portraitSource "${entry.portraitSource}" but is missing portrait property.`,
      });
    }
    if (entry.portrait) {
      const portraitFile = resolve('public', entry.portrait);
      if (!existsSync(portraitFile)) {
        issues.push({
          severity: 'ERROR',
          category: 'Missing File',
          id,
          name,
          detail: `Portrait file does not exist on disk: ${entry.portrait}`,
        });
      }
    }

    // 4. About Overview Quality & Scraper Residuals
    if (entry.about) {
      const aboutText = entry.about;

      if (aboutText.length > 500) {
        issues.push({
          severity: 'WARNING',
          category: 'About Length',
          id,
          name,
          detail: `Overview exceeds maximum recommended length of 500 characters (${aboutText.length} chars).`,
        });
      }

      // Check HTML markup or entities
      if (/<[a-z][\s\S]*>/i.test(aboutText) || /&[a-z0-9]+;/i.test(aboutText)) {
        issues.push({
          severity: 'ERROR',
          category: 'About HTML',
          id,
          name,
          detail: `Overview contains unescaped HTML tags or raw HTML entities: "${aboutText.slice(0, 80)}..."`,
        });
      }

      // Check pronoun neutrality
      const pronounMatch = aboutText.match(GENDERED_PRONOUNS);
      if (pronounMatch) {
        issues.push({
          severity: 'WARNING',
          category: 'Non-Neutral Overview',
          id,
          name,
          detail: `Overview contains gendered/1st-person pronoun "${pronounMatch[0]}": "${aboutText.slice(0, 100)}..."`,
        });
      }

      // Check scraper boilerplate
      for (const pattern of BOILERPLATE_PATTERNS) {
        if (pattern.test(aboutText)) {
          issues.push({
            severity: 'WARNING',
            category: 'Scraper Boilerplate',
            id,
            name,
            detail: `Overview contains web scraper boilerplate matching ${pattern}: "${aboutText.slice(0, 120)}..."`,
          });
          break;
        }
      }
    }

    // 5. Degree Chronology Checks
    const { undergradYear, msYear, phdYear } = entry;
    if (undergradYear && phdYear && undergradYear > phdYear) {
      issues.push({
        severity: 'ERROR',
        category: 'Chronology Inversion',
        id,
        name,
        detail: `Undergrad year (${undergradYear}) is later than PhD year (${phdYear}).`,
      });
    }

    if (undergradYear && msYear && undergradYear > msYear) {
      issues.push({
        severity: 'ERROR',
        category: 'Chronology Inversion',
        id,
        name,
        detail: `Undergrad year (${undergradYear}) is later than MS year (${msYear}).`,
      });
    }

    if (msYear && phdYear && msYear > phdYear) {
      issues.push({
        severity: 'ERROR',
        category: 'Chronology Inversion',
        id,
        name,
        detail: `MS year (${msYear}) is later than PhD year (${phdYear}).`,
      });
    }

    if (undergradYear && undergradYear > CURRENT_YEAR) {
      issues.push({
        severity: 'ERROR',
        category: 'Future Year',
        id,
        name,
        detail: `Undergrad year (${undergradYear}) is in the future.`,
      });
    }

    if (phdYear && phdYear > CURRENT_YEAR) {
      issues.push({
        severity: 'ERROR',
        category: 'Future Year',
        id,
        name,
        detail: `PhD year (${phdYear}) is in the future.`,
      });
    }

    // 6. Direct Fields Integrity
    if (entry.directFields) {
      for (const df of entry.directFields) {
        const val = entry[df];
        if (val === undefined || val === null || val === '') {
          issues.push({
            severity: 'ERROR',
            category: 'Direct Field Missing',
            id,
            name,
            detail: `Declared directField "${df}" is null or undefined on entry.`,
          });
        }
      }
    }
  }

  // Summary Report
  const errors = issues.filter((i) => i.severity === 'ERROR');
  const warnings = issues.filter((i) => i.severity === 'WARNING');
  const infos = issues.filter((i) => i.severity === 'INFO');

  console.log(`📊 Audit Results Summary:`);
  console.log(`   🚨 ERRORS:   ${errors.length}`);
  console.log(`   ⚠️  WARNINGS: ${warnings.length}`);
  console.log(`   ℹ️  INFOS:    ${infos.length}\n`);

  if (errors.length > 0) {
    console.log(`🚨 ERRORS (${errors.length}):`);
    for (const err of errors) {
      console.log(`  - [${err.category}] ${err.name} (${err.id}): ${err.detail}`);
    }
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length}):`);
    for (const w of warnings) {
      console.log(`  - [${w.category}] ${w.name} (${w.id}): ${w.detail}`);
    }
    console.log('');
  }

  return { errors, warnings, infos };
}

await runExhaustiveAudit();
