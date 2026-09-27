import type { ResearchOverview, RosterEntry } from './data.ts';

export const SAFE_WEB_URL = /^https?:\/\/[^\s<>"']+$/i;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export type EnrichmentError = string;

export interface EnrichmentLedgerEntry {
  id: string;
  overview: EnrichmentOutcome;
  work: EnrichmentOutcome;
  sourcesChecked: string[];
  evidence: EvidenceExcerpt[];
  errors: string[];
  nextAction?: string;
  updatedAt: string;
}

export type EnrichmentOutcome = 'pending' | 'verified' | 'no suitable evidence' | 'retry needed';

export interface EvidenceExcerpt {
  id: string;
  url: string;
  excerpt: string;
  retrievedAt: string;
  details?: string;
}

const SUSPICIOUS_OVERVIEW_PATTERNS: Array<{ message: string; pattern: RegExp }> = [
  { message: 'contains raw HTML entity or tag', pattern: /&[a-z0-9#]+;|<[a-z]/i },
  { message: 'contains template placeholder or comment', pattern: /{{|}}|<!--|-->/ },
  { message: 'contains scraped navigation or web boilerplate', pattern: /Skip to|All rights reserved|Page not found|404|Access Denied|Cloudflare|Cookie policy|Privacy Policy|Toggle navigation|Press escape key|Researchers Information|This researcher has already left|What are you looking for|You are using an outdated browser|Download .* contact card|Please do not fill this field/i },
  { message: 'contains raw unformatted URL outside markdown link', pattern: /(^|[^(\]])https?:\/\//i },
];

export function validateOverview(value: unknown): EnrichmentError[] {
  const errors: string[] = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['overview must be an object'];
  const overview = value as Partial<ResearchOverview>;
  if (typeof overview.text !== 'string' || !overview.text.trim()) errors.push('overview text is required');
  else {
    const textWithoutLinks = overview.text
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1')
      .replace(/\b[A-Z]\.\s+/g, (m) => `${m[0]} `);
    const sentences = textWithoutLinks.trim().split(/[.!?]+(?:\s+|$)/).filter(Boolean);
    if (sentences.length < 1) errors.push('overview must contain at least one sentence');
    if (sentences.length > 3) errors.push('overview may contain at most three sentences');
    if (overview.text.length > 500) errors.push('overview must be at most 500 characters');

    for (const { message, pattern } of SUSPICIOUS_OVERVIEW_PATTERNS) {
      if (pattern.test(overview.text)) {
        errors.push(`overview text ${message}`);
      }
    }

    const linkMatches = overview.text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
    for (const match of linkMatches) {
      const url = match[2];
      if (!SAFE_WEB_URL.test(url)) {
        errors.push(`embedded link "${url}" is unsafe`);
      }
    }
  }
  if (!Array.isArray(overview.sources) || overview.sources.length === 0) errors.push('overview needs source URLs');
  else overview.sources.forEach((url, i) => { if (typeof url !== 'string' || !SAFE_WEB_URL.test(url)) errors.push(`overview source ${i + 1} is unsafe`); });
  if (typeof overview.verifiedAt !== 'string' || !ISO_TIMESTAMP.test(overview.verifiedAt)) errors.push('overview verifiedAt must be a UTC timestamp');
  return errors;
}

export function validateEnrichment(person: Pick<RosterEntry, 'researchOverview'>): string[] {
  return person.researchOverview ? validateOverview(person.researchOverview) : [];
}
