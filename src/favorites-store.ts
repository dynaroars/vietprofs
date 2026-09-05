const STORAGE_KEY = 'vietprofs:favorites';
const RECENT_STORAGE_KEY = 'vietprofs:recent-profiles';
const PINNED_STORAGE_KEY = 'vietprofs:pinned-searches';
const PROFILE_ID = /^vp-\d{4}$/;
const MAX_SAVED_ITEMS = 8;
const PINNABLE_QUERY_KEYS = ['q', 'state', 'loc', 'field', 'track', 'institutionType', 'sort', 'view'];

function storage() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function loadFavorites(): string[] {
  const local = storage();
  if (!local) return [];
  try {
    const parsed = JSON.parse(local.getItem(STORAGE_KEY) ?? '');
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((id) => typeof id === 'string' && PROFILE_ID.test(id)))];
  } catch {
    return [];
  }
}

export function saveFavorites(ids: string[]): string[] {
  const unique = [...new Set(ids.filter((id) => typeof id === 'string' && PROFILE_ID.test(id)))];
  storage()?.setItem(STORAGE_KEY, JSON.stringify(unique));
  return unique;
}

export function isFavorite(id: string): boolean {
  return loadFavorites().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const current = loadFavorites();
  const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
  saveFavorites(next);
  return next.includes(id);
}

function savedProfileIds(key: string): string[] {
  const local = storage();
  if (!local) return [];
  try {
    const parsed = JSON.parse(local.getItem(key) ?? '');
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((id) => typeof id === 'string' && PROFILE_ID.test(id)))].slice(0, MAX_SAVED_ITEMS)
      : [];
  } catch {
    return [];
  }
}

export function loadRecentProfiles(): string[] {
  return savedProfileIds(RECENT_STORAGE_KEY);
}

export function recordRecentProfile(id: string): string[] {
  if (!PROFILE_ID.test(id)) return loadRecentProfiles();
  const next = [id, ...loadRecentProfiles().filter((value) => value !== id)].slice(0, MAX_SAVED_ITEMS);
  storage()?.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  return next;
}

function normalizedPinnedQuery(query: string): string {
  const params = new URLSearchParams(query);
  const normalized = new URLSearchParams();
  for (const key of PINNABLE_QUERY_KEYS) {
    const value = params.get(key);
    if (value) normalized.set(key, value);
  }
  return normalized.toString();
}

export function loadPinnedSearches(): string[] {
  const local = storage();
  if (!local) return [];
  try {
    const parsed = JSON.parse(local.getItem(PINNED_STORAGE_KEY) ?? '');
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((query) => typeof query === 'string').map(normalizedPinnedQuery).filter(Boolean))].slice(0, MAX_SAVED_ITEMS)
      : [];
  } catch {
    return [];
  }
}

export function togglePinnedSearch(query: string): boolean {
  const normalized = normalizedPinnedQuery(query);
  if (!normalized) return false;
  const current = loadPinnedSearches();
  const pinned = !current.includes(normalized);
  const next = pinned ? [normalized, ...current].slice(0, MAX_SAVED_ITEMS) : current.filter((value) => value !== normalized);
  storage()?.setItem(PINNED_STORAGE_KEY, JSON.stringify(next));
  return pinned;
}
