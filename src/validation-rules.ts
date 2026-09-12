/**
 * Reusable validation rules for roster data.
 * Prevents hallucinated chronology, parser pollution, and invalid external profile links.
 */

/**
 * Known exceptions where a scholar legitimately obtained a master's degree
 * after completing their doctorate (e.g. mid-career second master's, MPH, MBA).
 */
export const MID_CAREER_MS_ALLOWLIST = new Set<string>([
  'Huyen C. Nguyen', // Ph.D. INSA de Rennes 2014; M.Sc. Computational Neuroscience Université Paris-Saclay 2025
]);

export const VALID_SCHOLAR_URL_PATTERN = /^https:\/\/scholar\.google\.[a-z.]+\/citations\?.*user=[a-zA-Z0-9_-]{8,}/;
export const VALID_LINKEDIN_URL_PATTERN = /^https:\/\/(www\.)?linkedin\.com\/in\/[\p{L}\p{N}%_.-]+\/?$/u;

// Suspicious prefixes where a parser or LLM accidentally prepended the degree name into the institution field
const POLLUTED_INSTITUTION_PREFIX = /^(ph\.?d\.?|doctor(ate)?|b\.?[sa]\.?|bachelor('s)?|m\.?[sa]\.?|master('s)?)\s+(in|of|from)\s+/i;

/**
 * Validates the chronological sanity of education fields.
 * Returns an array of error messages (empty if valid).
 */
export function validateEducationChronology(person: {
  name?: string;
  undergradYear?: number;
  msYear?: number;
  phdYear?: number;
  postdocYear?: number;
}): string[] {
  const errors: string[] = [];
  const { name, undergradYear, msYear, phdYear, postdocYear } = person;

  // Undergrad vs PhD
  if (undergradYear !== undefined && phdYear !== undefined) {
    if (phdYear < undergradYear) {
      errors.push(`phdYear (${phdYear}) cannot precede undergradYear (${undergradYear})`);
    } else if (phdYear - undergradYear < 2) {
      errors.push(`interval between undergradYear (${undergradYear}) and phdYear (${phdYear}) is less than 2 years`);
    }
  }

  // Undergrad vs MS
  if (undergradYear !== undefined && msYear !== undefined) {
    if (msYear < undergradYear) {
      errors.push(`msYear (${msYear}) cannot precede undergradYear (${undergradYear})`);
    }
  }

  // MS vs PhD
  if (msYear !== undefined && phdYear !== undefined) {
    if (msYear > phdYear && (!name || !MID_CAREER_MS_ALLOWLIST.has(name))) {
      errors.push(`msYear (${msYear}) is after phdYear (${phdYear}); if this is a legitimate mid-career degree, add to MID_CAREER_MS_ALLOWLIST`);
    }
  }

  // PhD vs Postdoc
  if (phdYear !== undefined && postdocYear !== undefined) {
    if (postdocYear < phdYear) {
      errors.push(`postdocYear (${postdocYear}) cannot precede phdYear (${phdYear})`);
    }
  }

  return errors;
}

/**
 * Validates that an institution name does not have degree title pollution.
 */
export function validateInstitutionFormat(institution: string, fieldName: string): string | null {
  if (POLLUTED_INSTITUTION_PREFIX.test(institution.trim())) {
    return `${fieldName} "${institution}" appears to include a degree prefix`;
  }
  return null;
}

/**
 * Validates external profile links (Scholar, LinkedIn).
 */
export function validateExternalUrl(url: string, field: 'scholarUrl' | 'linkedinUrl'): string | null {
  if (field === 'scholarUrl') {
    if (!VALID_SCHOLAR_URL_PATTERN.test(url)) {
      return 'scholarUrl must be a Google Scholar citation profile URL (https://scholar.google.com/citations?user=...)';
    }
  } else if (field === 'linkedinUrl') {
    if (!VALID_LINKEDIN_URL_PATTERN.test(url)) {
      return 'linkedinUrl must be a direct LinkedIn personal profile URL (https://www.linkedin.com/in/...)';
    }
  }
  return null;
}
