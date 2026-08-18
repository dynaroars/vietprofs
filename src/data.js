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

// The ten broad fields used by the roster, shown even before each field has entries.
export const STEM_FIELDS = [
  'Computer & Information Sciences',
  'Engineering',
  'Mathematics',
  'Statistics & Data Science',
  'Physics & Astronomy',
  'Chemistry',
  'Biological & Biomedical Sciences',
  'Earth & Environmental Sciences',
  'Agricultural & Natural Resource Sciences',
  'Health Sciences',
];

// Buckets granular `department` values into the broad fields above. Keep the
// engineering rule ahead of chemistry so Chemical Engineering is not misclassified.
const FIELD_RULES = [
  { field: 'Computer & Information Sciences', match: /computer science|informatics|information science/i },
  { field: 'Mathematics', match: /mathematics/i },
  { field: 'Statistics & Data Science', match: /statistics|biostatistics|operations research|data science/i },
  { field: 'Engineering', match: /engineering/i },
  { field: 'Physics & Astronomy', match: /physics|astronomy/i },
  { field: 'Chemistry', match: /chemistry/i },
  {
    field: 'Biological & Biomedical Sciences',
    match: /biology|biological sciences|neuroscience|plant pathology|genetics|oncology|microbiology|immunology|molecular|cell biology|ecology|entomology/i,
  },
  { field: 'Earth & Environmental Sciences', match: /environmental|earth|geology|oceanography|atmospheric/i },
  { field: 'Agricultural & Natural Resource Sciences', match: /agriculture|agronomy|food science|natural resources/i },
  { field: 'Health Sciences', match: /health|medicine|nursing|public health|epidemiology/i },
];

export function fieldOf(department) {
  return FIELD_RULES.find((rule) => rule.match.test(department))?.field ?? department;
}

export function uniqueFields(roster) {
  return STEM_FIELDS.filter((field) => roster.some((p) => fieldOf(p.department) === field));
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
