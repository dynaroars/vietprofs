let cached = null;

export async function loadRoster() {
  if (cached) return cached;
  const res = await fetch(`${import.meta.env.BASE_URL}data.json`);
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

// Buckets the granular `department` values into the broader STEM fields tracked in
// ROSTER_EXPANSION.md. Add a rule here whenever a new field's departments land in the roster,
// or its entries will fall through to their raw department name instead of the field bucket.
const FIELD_RULES = [
  { field: 'Computer Science', match: /computer science/i },
  { field: 'Mathematics', match: /mathematics/i },
  { field: 'Electrical and Computer Engineering', match: /electrical.*computer engineering/i },
  { field: 'Physics', match: /^physics$/i },
  { field: 'Chemistry', match: /chemistry/i },
  { field: 'Statistics', match: /statistics|biostatistics|operations research/i },
  {
    field: 'Biology / Life Sciences',
    match: /biological sciences|neuroscience|plant pathology|genetics|oncology|microbiology|immunology|molecular|cell biology|ecology|entomology/i,
  },
];

export function fieldOf(department) {
  return FIELD_RULES.find((rule) => rule.match.test(department))?.field ?? department;
}

export function uniqueFields(roster) {
  return [...new Set(roster.map((p) => fieldOf(p.department)))].sort();
}

export function filterRoster(roster, { query, field }) {
  let result = roster;
  if (field && field !== 'all') {
    result = result.filter((p) => fieldOf(p.department) === field);
  }
  const q = query.trim().toLowerCase();
  if (!q) return result;
  return result.filter((p) => {
    const haystack = [p.name, p.university, p.city, p.state, p.department, ...p.researchAreas]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function sortRoster(roster) {
  return [...roster].sort((a, b) => a.name.localeCompare(b.name));
}
