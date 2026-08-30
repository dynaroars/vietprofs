import { filterRoster, uniqueCountries, type Roster } from './data.ts';

const CONTINENT_QUERIES = new Set([
  'africa',
  'asia',
  'australasia',
  'europe',
  'north america',
  'south america',
  'world',
]);

export function locationForQuery(roster: Roster, searchIndex, {
  query,
  currentLocation,
  searchScope = 'all',
  state = '',
  field = 'all',
  track = 'all',
}) {
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

  const filters = { query: value, searchScope, state, field, track };
  const matchesCurrent = filterRoster(searchIndex, { ...filters, location: currentLocation }).length;
  const matchesWorld = filterRoster(searchIndex, { ...filters, location: 'World' }).length;
  return matchesCurrent === 0 && matchesWorld > 0 ? 'World' : currentLocation;
}
