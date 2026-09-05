import { filterRoster, uniqueCountries, type Roster, type SearchIndex } from './data.ts';

const CONTINENT_QUERIES = new Set([
  'africa',
  'asia',
  'australasia',
  'europe',
  'north america',
  'south america',
  'world',
]);

interface LocationForQueryOptions {
  query: string;
  currentLocation: string;
  searchScope?: string;
  state?: string;
  field?: string;
  track?: string;
  institutionType?: string;
}

export function locationForQuery(roster: Roster, searchIndex: Roster | SearchIndex, {
  query,
  currentLocation,
  searchScope = 'all',
  state = '',
  field = 'all',
  track = 'all',
  institutionType = 'all',
}: LocationForQueryOptions): string {
  const value = query.trim();
  if (!value) return currentLocation;
  const normalized = value.toLocaleLowerCase();
  const isCountryQuery = uniqueCountries(roster).some((country) =>
    country.toLocaleLowerCase() === normalized
    || (normalized === 'uk' && country === 'United Kingdom')
    || (normalized === 'usa' && country === 'United States')
  );
  const exactInternationalUniversity = roster.some((person) =>
    person.university?.toLocaleLowerCase() === normalized
    && (person.country || 'United States') !== 'United States'
  );
  if (isCountryQuery || CONTINENT_QUERIES.has(normalized) || exactInternationalUniversity) return 'World';

  const filters = { query: value, searchScope, state, field, track, institutionType };
  const matchesCurrent = filterRoster(searchIndex, { ...filters, location: currentLocation }).length;
  const matchesWorld = filterRoster(searchIndex, { ...filters, location: 'World' }).length;
  return matchesCurrent === 0 && matchesWorld > 0 ? 'World' : currentLocation;
}
