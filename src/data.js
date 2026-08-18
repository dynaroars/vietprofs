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

export function uniqueDepartments(roster) {
  return [...new Set(roster.map((p) => p.department))].sort();
}

export function filterRoster(roster, { query }) {
  const q = query.trim().toLowerCase();
  if (!q) return roster;
  return roster.filter((p) => {
    const haystack = [p.name, p.university, p.city, p.state, p.department, ...p.researchAreas]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function sortRoster(roster) {
  return [...roster].sort((a, b) => a.name.localeCompare(b.name));
}
