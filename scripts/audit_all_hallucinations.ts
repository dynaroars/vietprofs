import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Roster, RosterEntry } from '../src/data.ts';

const rosterPath = resolve('public/data.json');
const roster = JSON.parse(await readFile(rosterPath, 'utf8')) as Roster;

interface Issue {
  id: string;
  name: string;
  category: string;
  detail: string;
  field?: string;
  value?: any;
}

const issues: Issue[] = [];

const htmlEntityRegex = /&(?:[a-z0-9]+|#[0-9]+|#x[0-9a-f]+);/i;
const genderedPronounRegex = /\b(he|she|his|her|him|hers)\b/i;
const boilerplateKeywords = [
  'toggle navigation',
  'skip to main content',
  'researchers information',
  'download contact card',
  'staff directory',
  'what are you looking for',
  'javascript must be enabled',
  'all rights reserved',
  'cookie policy',
  'department directory'
];

const degreePrefixRegex = /^(ph\.?d\.?|p\.?h\.?d\.?|b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?|m\.?d\.?|doctor of|bachelor of|master of|phd from|bs from|ms from|doctorate from)\b/i;

const currentYear = 2026;

// Track duplicate URLs
const scholarMap = new Map<string, string[]>();
const linkedinMap = new Map<string, string[]>();

for (const person of roster) {
  // 1. Check Chronology & Years
  if (person.phdYear) {
    if (person.phdYear > currentYear) {
      issues.push({ id: person.id, name: person.name, category: 'future_phd_year', detail: `phdYear is in future (${person.phdYear})`, field: 'phdYear', value: person.phdYear });
    }
    if (person.phdYear < 1920) {
      issues.push({ id: person.id, name: person.name, category: 'invalid_phd_year', detail: `phdYear is unrealistically old (${person.phdYear})`, field: 'phdYear', value: person.phdYear });
    }
  }

  if (person.undergradYear) {
    if (person.undergradYear > currentYear) {
      issues.push({ id: person.id, name: person.name, category: 'future_undergrad_year', detail: `undergradYear is in future (${person.undergradYear})`, field: 'undergradYear', value: person.undergradYear });
    }
    if (person.undergradYear < 1920) {
      issues.push({ id: person.id, name: person.name, category: 'invalid_undergrad_year', detail: `undergradYear is unrealistically old (${person.undergradYear})`, field: 'undergradYear', value: person.undergradYear });
    }
  }

  if (person.msYear) {
    if (person.msYear > currentYear) {
      issues.push({ id: person.id, name: person.name, category: 'future_ms_year', detail: `msYear is in future (${person.msYear})`, field: 'msYear', value: person.msYear });
    }
  }

  if (person.postdocYear) {
    if (person.postdocYear > currentYear) {
      issues.push({ id: person.id, name: person.name, category: 'future_postdoc_year', detail: `postdocYear is in future (${person.postdocYear})`, field: 'postdocYear', value: person.postdocYear });
    }
  }

  if (person.undergradYear && person.phdYear) {
    if (person.undergradYear > person.phdYear) {
      issues.push({ id: person.id, name: person.name, category: 'inverted_chronology', detail: `undergradYear (${person.undergradYear}) > phdYear (${person.phdYear})` });
    }
    const gap = person.phdYear - person.undergradYear;
    if (gap > 20) {
      issues.push({ id: person.id, name: person.name, category: 'suspicious_gap', detail: `Large gap (${gap} yrs) between undergrad (${person.undergradYear}) and PhD (${person.phdYear})` });
    }
  }

  if (person.undergradYear && person.msYear && person.undergradYear > person.msYear) {
    issues.push({ id: person.id, name: person.name, category: 'inverted_chronology', detail: `undergradYear (${person.undergradYear}) > msYear (${person.msYear})` });
  }

  if (person.msYear && person.phdYear && person.msYear > person.phdYear) {
    issues.push({ id: person.id, name: person.name, category: 'inverted_chronology', detail: `msYear (${person.msYear}) > phdYear (${person.phdYear})` });
  }

  // 2. Check Institution Strings for Degree Prefixes or HTML entities
  const instFields = ['phdInstitution', 'undergradInstitution', 'msInstitution', 'postdocInstitution'] as const;
  for (const field of instFields) {
    const val = person[field];
    if (typeof val === 'string') {
      if (degreePrefixRegex.test(val.trim())) {
        issues.push({ id: person.id, name: person.name, category: 'institution_prefix_pollution', detail: `${field} starts with degree prefix: "${val}"`, field, value: val });
      }
      if (htmlEntityRegex.test(val)) {
        issues.push({ id: person.id, name: person.name, category: 'html_entity', detail: `${field} contains unescaped HTML entity: "${val}"`, field, value: val });
      }
    }
  }

  // 3. Check Text Fields for HTML Entities & Placeholders
  const textFields = ['name', 'vietnameseName', 'department', 'rank', 'university', 'city', 'state', 'country'] as const;
  for (const field of textFields) {
    const val = person[field];
    if (typeof val === 'string') {
      if (htmlEntityRegex.test(val)) {
        issues.push({ id: person.id, name: person.name, category: 'html_entity', detail: `${field} contains unescaped HTML entity: "${val}"`, field, value: val });
      }
      if (val.includes('undefined') || val.includes('null') || val.includes('{{') || val.includes('N/A')) {
        issues.push({ id: person.id, name: person.name, category: 'placeholder_pollution', detail: `${field} contains placeholder text: "${val}"`, field, value: val });
      }
    }
  }

  // 4. Check Research Overview for Rules
  if (person.researchOverview?.text) {
    const text = person.researchOverview.text;
    if (htmlEntityRegex.test(text)) {
      issues.push({ id: person.id, name: person.name, category: 'overview_html_entity', detail: `researchOverview contains HTML entities`, field: 'researchOverview.text', value: text });
    }

    const lowerText = text.toLowerCase();
    for (const kw of boilerplateKeywords) {
      if (lowerText.includes(kw)) {
        issues.push({ id: person.id, name: person.name, category: 'overview_boilerplate', detail: `researchOverview contains boilerplate artifact: "${kw}"`, field: 'researchOverview.text', value: text });
      }
    }

    const genderMatch = text.match(genderedPronounRegex);
    if (genderMatch) {
      issues.push({ id: person.id, name: person.name, category: 'overview_gendered_pronoun', detail: `researchOverview contains gendered pronoun "${genderMatch[0]}"`, field: 'researchOverview.text', value: text });
    }

    if (/https?:\/\/[^\s\)]+/.test(text) && !/\[[^\]]+\]\(https?:\/\/[^\)]+\)/.test(text)) {
      issues.push({ id: person.id, name: person.name, category: 'overview_bare_url', detail: `researchOverview contains unformatted bare URL`, field: 'researchOverview.text' });
    }

    if (text.length > 500) {
      issues.push({ id: person.id, name: person.name, category: 'overview_length', detail: `researchOverview length exceeds 500 chars (${text.length} chars)` });
    }
  }

  // 5. Check External Profile URLs & Duplicate Tracking
  if (person.scholarUrl) {
    if (!person.scholarUrl.startsWith('https://scholar.google.com/citations?user=')) {
      issues.push({ id: person.id, name: person.name, category: 'invalid_scholar_url', detail: `scholarUrl is not canonical: ${person.scholarUrl}`, field: 'scholarUrl', value: person.scholarUrl });
    }
    // Extract user ID
    const match = person.scholarUrl.match(/user=([a-zA-Z0-9_-]+)/);
    if (match) {
      const uid = match[1];
      if (!scholarMap.has(uid)) scholarMap.set(uid, []);
      scholarMap.get(uid)!.push(person.id);
    }
  }

  if (person.linkedinUrl) {
    if (!person.linkedinUrl.startsWith('https://www.linkedin.com/in/') && !person.linkedinUrl.startsWith('https://linkedin.com/in/')) {
      issues.push({ id: person.id, name: person.name, category: 'invalid_linkedin_url', detail: `linkedinUrl is not canonical: ${person.linkedinUrl}`, field: 'linkedinUrl', value: person.linkedinUrl });
    }
    const cleanUrl = person.linkedinUrl.replace('https://www.', 'https://').replace(/\/$/, '');
    if (!linkedinMap.has(cleanUrl)) linkedinMap.set(cleanUrl, []);
    linkedinMap.get(cleanUrl)!.push(person.id);
  }

  // 6. Check Swapped URLs
  if (person.profileUrl && (person.profileUrl.includes('github.io') || person.profileUrl.includes('sites.google.com'))) {
    if (person.websiteUrl && person.websiteUrl.includes('.edu')) {
      issues.push({ id: person.id, name: person.name, category: 'swapped_urls', detail: `profileUrl (${person.profileUrl}) and websiteUrl (${person.websiteUrl}) appear swapped` });
    }
  }

  // 7. Check Honors for Future Years or Bad Format
  if (person.honors) {
    for (const h of person.honors) {
      if (h.year && h.year > currentYear) {
        issues.push({ id: person.id, name: person.name, category: 'future_honor_year', detail: `Honor "${h.name}" has future year ${h.year}` });
      }
    }
  }

  // 8. Check Selected Work for Future Years
  if (person.selectedWork) {
    for (const work of person.selectedWork) {
      if (work.year && work.year > currentYear) {
        issues.push({ id: person.id, name: person.name, category: 'future_work_year', detail: `Selected work "${work.title}" has future year ${work.year}` });
      }
    }
  }
}

// Duplicate Scholar URLs
for (const [uid, ids] of scholarMap.entries()) {
  if (ids.length > 1) {
    issues.push({ id: ids.join(','), name: 'Multiple', category: 'duplicate_scholar_url', detail: `Scholar user ID "${uid}" shared across entries: ${ids.join(', ')}` });
  }
}

// Duplicate LinkedIn URLs
for (const [url, ids] of linkedinMap.entries()) {
  if (ids.length > 1) {
    issues.push({ id: ids.join(','), name: 'Multiple', category: 'duplicate_linkedin_url', detail: `LinkedIn URL "${url}" shared across entries: ${ids.join(', ')}` });
  }
}

console.log(`\n=== COMPREHENSIVE AUDIT RESULTS (${issues.length} issues found) ===\n`);

const byCategory: Record<string, Issue[]> = {};
for (const issue of issues) {
  if (!byCategory[issue.category]) byCategory[issue.category] = [];
  byCategory[issue.category].push(issue);
}

for (const [cat, list] of Object.entries(byCategory)) {
  console.log(`--- ${cat.toUpperCase()} (${list.length} issues) ---`);
  for (const item of list) {
    console.log(`  [${item.id}] ${item.name}: ${item.detail}`);
  }
  console.log('');
}
