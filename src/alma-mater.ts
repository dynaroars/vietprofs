// Canonical names for Vietnamese alma maters, so spelling variants recorded in degree fields
// (former names, VNU constituent orderings, a trailing ", Vietnam") count as one school in
// the pathway explorer, snapshot and undergraduate-origin rankings. Only unambiguous variants
// are mapped: a bare "Vietnam National University" could be Hanoi or Ho Chi Minh City and
// stays as recorded.

const ALIASES: Record<string, string[]> = {
  'Ho Chi Minh City University of Technology': [
    'ho chi minh university of technology',
    'ho chi minh university of technology, vietnam national university',
    'ho chi minh city university of technology, vietnam national university',
    'ho chi minh city university of technology, vietnam national university ho chi minh city',
    'vietnam national university, ho chi minh city university of technology',
  ],
  'Hanoi University of Science and Technology': [
    'hanoi university of technology',
    'hanoi university of science and technology hanoi',
  ],
  'Vietnam National University, Hanoi': ['hanoi national university'],
  'Vietnam National University, Ho Chi Minh City': [
    'vietnam national university ho chi minh city',
    'vietnam national university-hochiminh city',
    'national university, ho chi minh city',
  ],
  'University of Science, Vietnam National University Ho Chi Minh City': [
    'university of science, vnu-hcm',
    'vnu-hcm university of science',
    'vnu ho chi minh city university of science',
    'vnu university of science ho chi minh city',
    'ho chi minh city university of science',
    'ho chi minh university of science (hcmus)',
    'university of science, ho chi minh city',
    'university of science, vietnam national university, ho chi minh city',
    'vietnam national university, ho chi minh city (university of science)',
    'vietnam national university ho chi minh city, university of science',
    'vietnam national university, ho chi minh city, university of science',
    'vietnam national university - ho chi minh city university of science',
    'university of natural sciences, ho chi minh city',
  ],
  'VNU University of Science, Hanoi': [
    'vnu university of science',
    'hanoi university of science',
    'vnu hanoi university of science',
    'vnu hanoi university of science, hanoi',
  ],
  'VNU University of Engineering and Technology': [
    'university of engineering and technology, vietnam national university, hanoi',
  ],
  'University of Medicine and Pharmacy at Ho Chi Minh City': [
    'ho chi minh city university of medicine and pharmacy',
  ],
  'University of Economics Ho Chi Minh City': [
    'university of economics - ho chi minh city',
    'ho chi minh city university of economics',
  ],
  'Ho Chi Minh City University of Education': [
    'ho chi minh university of pedagogy',
    'ho chi minh city university of pedagogy',
  ],
  'Ho Chi Minh City University of Architecture': ['university of architecture, ho chi minh city'],
  'Hanoi University of Civil Engineering': ['national university of civil engineering'],
  'Danang University of Science and Technology': [
    'danang university of technology',
    'university of science and technology, the university of danang',
  ],
  'National Economics University': ['national economics university of vietnam'],
  'Foreign Trade University': ['foreign trade university, ho chi minh city campus'],
  'Hanoi University': ['hanoi university, hanoi'],
  'Quy Nhon University': ['university of quy nhon'],
  'Dalat University': ['da lat university'],
};

const VIETNAMESE_PLACE =
  /\b(viet ?nam|vnu|hanoi|ho chi minh|saigon|can tho|hue|da ?nang|quy nhon|da ?lat|thai nguyen|vinh|nha trang|hai phong)\b/i;

const LOOKUP = new Map<string, string>();
for (const [canonical, variants] of Object.entries(ALIASES)) {
  LOOKUP.set(canonical.toLowerCase(), canonical);
  for (const variant of variants) LOOKUP.set(variant, canonical);
}

function aliasKey(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*,?\s*viet ?nam$/i, '')
    .trim()
    .toLowerCase();
}

/** The canonical spelling of a degree institution; unmapped names come back trimmed. */
export function canonicalAlmaMater(name: string): string;
export function canonicalAlmaMater(name: string | undefined): string | undefined;
export function canonicalAlmaMater(name: string | undefined): string | undefined {
  if (!name?.trim()) return name;
  const mapped = LOOKUP.get(aliasKey(name));
  if (mapped) return mapped;
  const cleaned = name.trim().replace(/\s+/g, ' ');
  // "Can Tho University, Vietnam" and "Can Tho University" are one school; keep the country
  // only when the rest of the name would no longer say where it is.
  const stripped = cleaned.replace(/\s*,\s*viet ?nam$/i, '');
  return stripped !== cleaned && VIETNAMESE_PLACE.test(stripped) ? stripped : cleaned;
}
