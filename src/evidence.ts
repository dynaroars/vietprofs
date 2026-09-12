import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface FieldEvidence {
  value: unknown;
  source: string;
  quote?: string;
  verifiedAt: string;
}

export interface PersonEvidence {
  id: string;
  name: string;
  lastAuditedAt: string;
  sources: string[];
  report?: string;
  fields: Record<string, FieldEvidence>;
}

export interface EvidenceLedger {
  version: 1;
  updatedAt: string;
  entries: Record<string, PersonEvidence>;
}

const DEFAULT_EVIDENCE_PATH = resolve('maintenance/evidence.json');

/**
 * Creates a fresh, empty evidence ledger structure.
 */
export function createEmptyEvidenceLedger(): EvidenceLedger {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    entries: {},
  };
}

/**
 * Loads the evidence ledger from disk, returning a default empty ledger if missing.
 */
export async function loadEvidenceLedger(path = DEFAULT_EVIDENCE_PATH): Promise<EvidenceLedger> {
  try {
    const raw = await readFile(path, 'utf8');
    const ledger = JSON.parse(raw) as EvidenceLedger;
    if (ledger && ledger.version === 1 && typeof ledger.entries === 'object') {
      return ledger;
    }
  } catch {
    // Return fresh ledger if file does not exist or fails to parse
  }
  return createEmptyEvidenceLedger();
}

/**
 * Atomically writes the evidence ledger to disk.
 */
export async function saveEvidenceLedger(ledger: EvidenceLedger, path = DEFAULT_EVIDENCE_PATH): Promise<void> {
  ledger.updatedAt = new Date().toISOString();
  await writeFile(path, `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
}

/**
 * Records evidence for a specific person's field into the ledger.
 */
export function recordFieldEvidence(
  ledger: EvidenceLedger,
  personId: string,
  personName: string,
  field: string,
  value: unknown,
  sourceUrl: string,
  quote?: string,
  timestamp = new Date().toISOString(),
): void {
  const entry = (ledger.entries[personId] ??= {
    id: personId,
    name: personName,
    lastAuditedAt: timestamp,
    sources: [],
    fields: {},
  });

  entry.name = personName;
  entry.lastAuditedAt = timestamp;
  if (sourceUrl && !entry.sources.includes(sourceUrl)) {
    entry.sources.push(sourceUrl);
  }

  if (value !== undefined) {
    entry.fields[field] = {
      value,
      source: sourceUrl,
      ...(quote ? { quote: quote.trim() } : {}),
      verifiedAt: timestamp,
    };
  } else {
    delete entry.fields[field];
  }
}

/**
 * Checks if a verbatim quote or snippet is present in the source HTML/text.
 */
export function isQuotePresentInText(quote: string, text: string): boolean {
  if (!quote || !text) return false;
  const normalizedQuote = quote.toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim();
  return normalizedText.includes(normalizedQuote);
}
