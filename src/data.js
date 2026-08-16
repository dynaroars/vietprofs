let cached = null;

export async function loadRoster() {
  if (cached) return cached;
  const res = await fetch('/data.json');
  if (!res.ok) throw new Error(`Failed to load data.json: ${res.status}`);
  cached = await res.json();
  return cached;
}

export function uniqueStates(roster) {
  return [...new Set(roster.map((p) => p.state))].sort();
}

export function uniqueAreas(roster) {
  return [...new Set(roster.flatMap((p) => p.researchAreas))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function filterRoster(roster, { query, state, area }) {
  const q = query.trim().toLowerCase();
  return roster.filter((p) => {
    if (state && p.state !== state) return false;
    if (area && !p.researchAreas.includes(area)) return false;
    if (!q) return true;
    const haystack = [p.name, p.university, p.city, p.state, ...p.researchAreas]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function sortRoster(roster, sortBy) {
  const sorted = [...roster];
  sorted.sort((a, b) => {
    if (sortBy === 'university') return a.university.localeCompare(b.university);
    if (sortBy === 'state') return a.state.localeCompare(b.state);
    return a.name.localeCompare(b.name);
  });
  return sorted;
}
