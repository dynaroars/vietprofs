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

export const UTC_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
