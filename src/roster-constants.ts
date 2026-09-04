export const TRACKS = ['Tenure-line', 'Teaching', 'Research', 'Clinical', 'Emeritus'] as const;

export const HONOR_CATEGORIES = [
  'academy',
  'fellow',
  'career_award',
  'major_award',
  'distinguished_professorship',
] as const;

export const REQUIRED_ROSTER_STRINGS = [
  'id',
  'name',
  'profileUrl',
  'lastUpdatedAt',
  'university',
  'city',
  'department',
] as const;

export const ROSTER_FIELDS = [
  ...REQUIRED_ROSTER_STRINGS,
  'websiteUrl',
  'scholarUrl',
  'linkedinUrl',
  'state',
  'country',
  'rank',
  'track',
  'vietnameseName',
  'researchAreas',
  'honors',
  'portrait',
  'portraitSource',
  'postdocInstitution',
  'postdocYear',
  'phdInstitution',
  'phdYear',
  'phdMajor',
  'mdInstitution',
  'mdYear',
  'msInstitution',
  'msYear',
  'msMajor',
  'undergradInstitution',
  'undergradYear',
  'undergradMajor',
  'otherDegrees',
] as const;

export const HONOR_FIELDS = ['name', 'organization', 'category', 'year', 'source'] as const;
export const OTHER_DEGREE_FIELDS = ['degree', 'institution', 'year', 'major', 'source'] as const;

export const UTC_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
