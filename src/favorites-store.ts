const STORAGE_KEY = 'vietprofs:favorites';
const PROFILE_ID = /^vp-\d{4}$/;

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
