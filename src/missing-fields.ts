import type { RosterEntry } from './data.ts';

// Fields a visitor can usually supply for an existing entry. Profile pages list the ones an entry
// lacks and link to the submit form with them highlighted. Honors and portraits stay out: a gap
// there usually means there is nothing to add, not that the record is incomplete.
export const REQUESTABLE_FIELDS = {
  vietnameseName: 'Vietnamese name',
  phdInstitution: 'PhD institution',
  phdYear: 'PhD year',
  scholarUrl: 'Google Scholar',
  websiteUrl: 'Website',
  linkedinUrl: 'LinkedIn',
} as const satisfies Partial<Record<keyof RosterEntry, string>>;

export type RequestableField = keyof typeof REQUESTABLE_FIELDS;

export function isRequestableField(value: string): value is RequestableField {
  return Object.hasOwn(REQUESTABLE_FIELDS, value);
}

export function missingFields(person: RosterEntry): RequestableField[] {
  // A physician with an MD on record and no PhD likely has no PhD to add, and a LinkedIn page is
  // not something to ask for on behalf of someone who has died.
  const skip = new Set<RequestableField>();
  if (person.mdInstitution && !person.phdInstitution) skip.add('phdInstitution').add('phdYear');
  if (person.track === 'Deceased') skip.add('linkedinUrl');
  return (Object.keys(REQUESTABLE_FIELDS) as RequestableField[])
    .filter((field) => !skip.has(field) && !person[field]);
}
