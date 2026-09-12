#!/usr/bin/env -S npx --no-install tsx

/**
 * Audits roster entries for potential hallucinations, chronological inversions,
 * polluted institution strings, and suspicious external links.
 *
 * Usage:
 *   npx tsx scripts/audit-roster-evidence.ts               # Offline sanity audit
 *   npx tsx scripts/audit-roster-evidence.ts --id vp-0001 # Audit specific entry
 *   npx tsx scripts/audit-roster-evidence.ts --live       # Run live reachability & identity checks (slow)
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Roster, RosterEntry } from '../src/data.ts';
import {
  validateEducationChronology,
  validateInstitutionFormat,
  validateExternalUrl,
} from '../src/validation-rules.ts';

const rosterPath = resolve('public/data.json');
const roster = JSON.parse(await readFile(rosterPath, 'utf8')) as Roster;

const args = process.argv.slice(2);
const targetId = args.includes('--id') ? args[args.indexOf('--id') + 1] : null;
const liveCheck = args.includes('--live');

const candidates = targetId ? roster.filter((p) => p.id === targetId) : roster;

if (targetId && candidates.length === 0) {
  console.error(`Error: No entry found with id ${targetId}`);
  process.exit(1);
}

interface Issue {
  id: string;
  name: string;
  severity: 'ERROR' | 'WARNING';
  category: 'chronology' | 'institution' | 'external_url' | 'identity';
  detail: string;
}

const issues: Issue[] = [];

console.log(`Auditing ${candidates.length} roster entries...`);

for (const person of candidates) {
  // 1. Chronology
  const chronErrors = validateEducationChronology(person);
  for (const err of chronErrors) {
    issues.push({
      id: person.id,
      name: person.name,
      severity: 'ERROR',
      category: 'chronology',
      detail: err,
    });
  }

  // 2. Institution format
  for (const field of ['phdInstitution', 'undergradInstitution', 'msInstitution', 'postdocInstitution'] as const) {
    const val = person[field];
    if (val) {
      const err = validateInstitutionFormat(val, field);
      if (err) {
        issues.push({
          id: person.id,
          name: person.name,
          severity: 'ERROR',
          category: 'institution',
          detail: err,
        });
      }
    }
  }

  // 3. External profile URLs
  if (person.scholarUrl) {
    const err = validateExternalUrl(person.scholarUrl, 'scholarUrl');
    if (err) {
      issues.push({
        id: person.id,
        name: person.name,
        severity: 'ERROR',
        category: 'external_url',
        detail: err,
      });
    }
  }

  if (person.linkedinUrl) {
    const err = validateExternalUrl(person.linkedinUrl, 'linkedinUrl');
    if (err) {
      issues.push({
        id: person.id,
        name: person.name,
        severity: 'ERROR',
        category: 'external_url',
        detail: err,
      });
    }
  }

  // 4. Soft warnings / sanity heuristics
  if (person.undergradYear && person.phdYear && person.phdYear - person.undergradYear > 15) {
    issues.push({
      id: person.id,
      name: person.name,
      severity: 'WARNING',
      category: 'chronology',
      detail: `Large interval (${person.phdYear - person.undergradYear} years) between undergrad (${person.undergradYear}) and PhD (${person.phdYear})`,
    });
  }
}

// 5. Live identity & provenance checking (if --live flag passed)
if (liveCheck) {
  console.log('Running live identity and provenance verification...');
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

  for (const person of candidates) {
    if (person.profileUrl) {
      try {
        const res = await fetch(person.profileUrl, {
          headers: { 'User-Agent': USER_AGENT },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
          issues.push({
            id: person.id,
            name: person.name,
            severity: 'WARNING',
            category: 'identity',
            detail: `profileUrl returned HTTP ${res.status}: ${person.profileUrl}`,
          });
        } else {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('text/html')) {
            const html = await res.text();
            // Check if person's family name appears in page
            const nameTokens = person.name.split(' ');
            const lastName = nameTokens[nameTokens.length - 1];
            if (lastName && !html.toLowerCase().includes(lastName.toLowerCase())) {
              issues.push({
                id: person.id,
                name: person.name,
                severity: 'WARNING',
                category: 'identity',
                detail: `profileUrl does not contain last name "${lastName}" (possible redirect to department root)`,
              });
            }
          }
        }
      } catch (err) {
        issues.push({
          id: person.id,
          name: person.name,
          severity: 'WARNING',
          category: 'identity',
          detail: `Failed to fetch profileUrl: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }
  }
}

// Reporting
const errors = issues.filter((i) => i.severity === 'ERROR');
const warnings = issues.filter((i) => i.severity === 'WARNING');

console.log('\n--- Audit Summary ---');
console.log(`Total checked:  ${candidates.length}`);
console.log(`Errors:         ${errors.length}`);
console.log(`Warnings:       ${warnings.length}\n`);

if (issues.length > 0) {
  for (const issue of issues) {
    const tag = issue.severity === 'ERROR' ? '[ERROR]' : '[WARN] ';
    console.log(`${tag} ${issue.id} ${issue.name} (${issue.category}): ${issue.detail}`);
  }
} else {
  console.log('No issues detected! All entries satisfy chronology, format, and URL rules.');
}

if (errors.length > 0) {
  process.exitCode = 1;
}
