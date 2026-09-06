import type { ResearchOverview, RosterEntry, WorkItem } from './data.ts';

export const SAFE_WEB_URL = /^https?:\/\/[^\s<>"']+$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
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

export function validateOverview(value: unknown): EnrichmentError[] {
  const errors: string[] = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['overview must be an object'];
  const overview = value as Partial<ResearchOverview>;
  if (typeof overview.text !== 'string' || !overview.text.trim()) errors.push('overview text is required');
  else {
    const sentences = overview.text.trim().split(/[.!?]+\s*/).filter(Boolean);
    if (sentences.length !== 1) errors.push('overview must contain one sentence');
    if (overview.text.length > 320) errors.push('overview must be at most 320 characters');
  }
  if (!Array.isArray(overview.sources) || overview.sources.length === 0) errors.push('overview needs source URLs');
  else overview.sources.forEach((url, i) => { if (typeof url !== 'string' || !SAFE_WEB_URL.test(url)) errors.push(`overview source ${i + 1} is unsafe`); });
  if (typeof overview.verifiedAt !== 'string' || !ISO_TIMESTAMP.test(overview.verifiedAt)) errors.push('overview verifiedAt must be a UTC timestamp');
  return errors;
}

function validateWork(work: unknown, label: string): string[] {
  if (!Array.isArray(work)) return [`${label} must be an array`];
  if (work.length > 3) return [`${label} may contain at most three items`];
  const errors: string[] = [];
  const titles = new Set<string>();
  work.forEach((raw, i) => {
    const item = raw as Partial<WorkItem>;
    const prefix = `${label} item ${i + 1}`;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { errors.push(`${prefix} must be an object`); return; }
    for (const field of ['title', 'type', 'url', 'selectionSource', 'verifiedAt']) {
      if (typeof item[field as keyof WorkItem] !== 'string' || !(item[field as keyof WorkItem] as string).trim()) errors.push(`${prefix} needs ${field}`);
    }
    if (typeof item.url === 'string' && !SAFE_WEB_URL.test(item.url)) errors.push(`${prefix} has unsafe URL`);
    if (item.selectionMode !== 'selected' && item.selectionMode !== 'recent') errors.push(`${prefix} has invalid selectionMode`);
    if (item.year !== undefined && (!Number.isInteger(item.year) || item.year < 1000 || item.year > new Date().getFullYear())) errors.push(`${prefix} has invalid year`);
    if (item.date !== undefined && (typeof item.date !== 'string' || !ISO_DATE.test(item.date))) errors.push(`${prefix} has invalid date`);
    if (titles.has(item.title ?? '')) errors.push(`${prefix} duplicates a title`);
    titles.add(item.title ?? '');
  });
  return errors;
}

export function validateEnrichment(person: Pick<RosterEntry, 'researchOverview' | 'selectedWork' | 'recentWork'>): string[] {
  return [
    ...(person.researchOverview ? validateOverview(person.researchOverview) : []),
    ...(person.selectedWork ? validateWork(person.selectedWork, 'selectedWork') : []),
    ...(person.recentWork ? validateWork(person.recentWork, 'recentWork') : []),
    ...(person.selectedWork && person.recentWork ? ['selectedWork and recentWork cannot both be present'] : []),
  ];
}

export function chooseWork(items: WorkItem[], mode: 'selected' | 'recent'): WorkItem[] {
  const unique = new Map<string, WorkItem>();
  for (const item of items) {
    const key = item.title.trim().toLocaleLowerCase();
    if (!unique.has(key)) unique.set(key, item);
  }
  if (mode === 'selected') return [...unique.values()].slice(0, 3);
  return [...unique.values()].sort((a, b) => (b.date ?? `${b.year ?? 0}-00-00`).localeCompare(a.date ?? `${a.year ?? 0}-00-00`)).slice(0, 3);
}
