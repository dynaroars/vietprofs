export interface StatsHistoryPoint {
  date: string;
  count: number;
  institutions?: number;
  countries?: number;
  portraits?: number;
  honors?: number;
  codeLines?: number;
}

export async function loadStatsHistory(): Promise<StatsHistoryPoint[]> {
  try {
    const cacheBuster =
      typeof __BUILD_COMMIT__ !== 'undefined' && __BUILD_COMMIT__ ? `?v=${__BUILD_COMMIT__}` : '';
    const res = await fetch(`${import.meta.env.BASE_URL}stats-history.json${cacheBuster}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
