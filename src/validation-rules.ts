/**
 * Reusable validation rules for roster data.
 * Prevents hallucinated chronology, parser pollution, and invalid external profile links.
 */

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
  phdYear?: number;
}): string[] {
  const errors: string[] = [];
  const { undergradYear, phdYear } = person;
  if (undergradYear !== undefined && phdYear !== undefined) {
    if (phdYear < undergradYear) {
      errors.push(`phdYear (${phdYear}) cannot precede undergradYear (${undergradYear})`);
    } else if (phdYear - undergradYear < 2) {
      errors.push(`interval between undergradYear (${undergradYear}) and phdYear (${phdYear}) is less than 2 years`);
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
