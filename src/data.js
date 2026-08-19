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

// The broad fields used by the roster, shown even before each field has entries.
export const FIELDS = [
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
  'Business & Economics',
  'Social & Behavioral Sciences',
  'Education',
  'Humanities',
  'Law & Public Affairs',
  'Arts & Design',
];

// Some department names are structurally ambiguous — the string alone doesn't say which broad
// field they belong to, only the school/unit that actually houses the position does (e.g. a
// department called "Information Studies" is Computer & Information Sciences at an iSchool but
// Education at UCLA, whose "Information Studies" faculty sit in the School of Education &
// Information Studies). Rather than stretch a regex to guess, these are keyed exactly by
// `department|university` and checked before any regex rule. Add a new row here — instead of a
// generic keyword to FIELD_RULES below — whenever a department's correct field depends on which
// institution it's at, not just the department string.
const FIELD_OVERRIDES = new Map([
  ['Information Studies|University of California, Los Angeles', 'Education'],
  // Generic Speech-Language-Hearing-style department name, but this specific appointment's
  // primary focus (per its own official listing) is multilingual/English education.
  ['Linguistics and Communication Disorders|Queens College, City University of New York', 'Education'],
  // Contains "History", which would otherwise be caught by the Humanities rule below before ever
  // reaching Arts & Design's own keywords.
  ['History of Art and Visual Culture|California College of the Arts', 'Arts & Design'],
  // Combined department, but her own title ("Assistant Professor of Statistics") and research
  // (optimization, statistical learning) are statistics, not mathematics — the generic
  // Mathematics rule would otherwise win since it's checked first.
  ['Mathematics and Statistics|South Dakota State University', 'Statistics & Data Science'],
  // "Great Texts Program" is Baylor Honors College's great-books curriculum — the department
  // string alone gives no field signal, but Jonathan Tran's own title ("Associate Professor of
  // Theology in the Great Texts Program") and George W. Baines Chair of Religion put him
  // squarely in Humanities.
  ['Great Texts Program|Baylor University', 'Humanities'],
]);

// Buckets granular `department` values into the broad fields above. Order matters, and is not
// simply alphabetical or "science before non-science": each rule is placed to win a specific
// ambiguous overlap with the rules below it.
//
// - Health Sciences (incl. pharmacy) precedes Business & Economics and Engineering so
//   "Health Management and Policy" and "Pharmacoengineering ..." aren't misclassified just
//   because they contain "management" / "engineering".
// - Business & Economics precedes Statistics & Data Science and Computer & Information Sciences
//   so a business-school department that happens to mention "data science", "statistics", or
//   "information systems" alongside a business term — e.g. "Business Analytics and Data
//   Science", "Accounting and Information Systems" — is still classified as business. A *bare*
//   generic term with no business qualifier (plain "Information Systems", "Data Science",
//   "Quantitative Methods") deliberately has no rule of its own here: which broad field it
//   belongs to depends on which school/college houses it, not the string alone, so it falls
//   through unclassified for a human to resolve from the person's actual appointment rather
//   than guessed from a keyword (or gets an explicit FIELD_OVERRIDES entry above).
// - Engineering is still ahead of Chemistry so Chemical Engineering is not misclassified.
// - Social & Behavioral Sciences precedes Humanities so area/ethnic/gender-studies departments
//   (Ethnic Studies, Asian American Studies, American Ethnic Studies, Asian-Pacific Studies,
//   Global and International Studies, Women's/Gender/Sexuality Studies, Social and Cultural
//   Analysis) land in Social & Behavioral Sciences even though some of their methods are
//   humanistic — this taxonomy classifies by disciplinary home, not by method. Only "History"
//   itself (bare, or "History of ...") is reserved for Humanities.
const FIELD_RULES = [
  { field: 'Computer & Information Sciences', match: /computer science|informatics|information science|library/i },
  { field: 'Mathematics', match: /mathematics/i },
  // Kinesiology/exercise-and-sport-science, veterinary, nutrition, and audiology/speech-language
  // programs are typically housed in health-sciences colleges, so they're bucketed here rather
  // than getting their own field. "Communication sciences and disorders" is checked here — ahead
  // of Social & Behavioral Sciences' bare "communication" keyword below — so it doesn't get
  // caught by that instead.
  {
    field: 'Health Sciences',
    match: /health|medicine|nursing|public health|epidemiology|pharma|kinesiology|exercise science|sport science|veterinary|nutrition|dietetics|audiology|speech-language pathology|communication sciences and disorders|anatom|toxicology/i,
  },
  // Business terms are specific enough (accounting, marketing, entrepreneurship, ...) that
  // false-positive risk is low; "management" is the one generic-sounding term here, which is
  // why Health Sciences above and Agricultural & Natural Resource Sciences' "natural resources"
  // rule are checked first for the science-flavored "X Management" department names that exist.
  {
    field: 'Business & Economics',
    match: /business|economics|\bfinance\b|accounting|marketing|management|entrepreneurship|\binsurance\b|real estate|human resource|industrial relations|organizational behavior|supply chain|\blogistics\b/i,
  },
  { field: 'Statistics & Data Science', match: /statistics|biostatistics|operations research|data science/i },
  // "materials science" alone (no "engineering" in the name) still lands here — combined
  // "Materials Science and Engineering" departments already match the bare "engineering" term.
  { field: 'Engineering', match: /engineering|materials science/i },
  { field: 'Physics & Astronomy', match: /physics|astronomy/i },
  { field: 'Chemistry', match: /chemistry/i },
  {
    field: 'Biological & Biomedical Sciences',
    match: /biology|biological sciences|neuroscience|plant pathology|genetics|genomic|oncology|microbiology|immunology|molecular|cell biology|ecology|entomology/i,
  },
  // Agricultural & Natural Resource Sciences precedes Earth & Environmental Sciences so a combined
  // department name like "Agricultural and Environmental Sciences" (Doc Lap Tran, Tennessee State)
  // lands with agriculture rather than being caught by the bare "environmental" keyword below.
  {
    field: 'Agricultural & Natural Resource Sciences',
    match: /agricultur|agronomy|food science|natural resources|plant science|horticulture|animal science|soil science|forestry|wildlife|fisheries/i,
  },
  { field: 'Earth & Environmental Sciences', match: /environmental|earth|geology|geography|oceanography|atmospheric/i },
  // Non-business/non-science fields are matched after the rules above, so departments that read
  // as both (e.g. "Geography and Environmental Studies") keep the science bucket they already
  // had. Education precedes Social & Behavioral Sciences so "Educational Psychology" lands in
  // Education.
  { field: 'Education', match: /education|curriculum and instruction|teaching and learning/i },
  { field: 'Law & Public Affairs', match: /\blaw\b|legal studies|public policy|public affairs|public administration|criminal justice|criminology|urban planning|regional planning|city planning/i },
  {
    field: 'Social & Behavioral Sciences',
    match: /sociology|psychology|anthropology|political science|social work|communication|international relations|ethnic studies|asian american studies|asian-pacific studies|asian pacific studies|global and international studies|global studies|international studies|gender,? and sexuality studies|women's,? gender|women's studies|social and cultural analysis|journalism|human development|family studies|gerontology/i,
  },
  { field: 'Humanities', match: /history|philosophy|english|literature|linguistics|languages|classics|religio|theolog|divinity/i },
  { field: 'Arts & Design', match: /\barts?\b|design|music|theat|dance|film|cinema|photograph|architecture/i },
  // A department that matches nothing here falls through to its own raw name, which the data
  // test reports so a maintainer can add an explicit rule (or FIELD_OVERRIDES entry) for it.
];

export function fieldOf(department, university) {
  const override = university && FIELD_OVERRIDES.get(`${department}|${university}`);
  if (override) return override;
  return FIELD_RULES.find((rule) => rule.match.test(department))?.field ?? department;
}

export function uniqueFields(roster) {
  return FIELDS.filter((field) => roster.some((p) => fieldOf(p.department, p.university) === field));
}

export function filterRoster(roster, { query, field }) {
  let result = roster;
  if (field && field !== 'all') {
    result = result.filter((p) => fieldOf(p.department, p.university) === field);
  }
  // Diacritic-insensitive: every name on the roster is stored without Vietnamese diacritics
  // (e.g. "Nguyen", not "Nguyễn") for display consistency, but a visitor may well type the
  // accented form. Stripping combining marks from both sides means either spelling finds a match.
  const q = stripDiacritics(query.trim().toLowerCase());
  if (!q) return result;
  return result.filter((p) => {
    const haystack = stripDiacritics(
      [p.name, p.university, p.city, p.state, p.department, ...p.researchAreas]
        .join(' ')
        .toLowerCase(),
    );
    return haystack.includes(q);
  });
}

export function sortRoster(roster) {
  return [...roster].sort((a, b) => a.name.localeCompare(b.name));
}

// The 50 states plus DC (DC isn't a state, hence "places" rather than "states" in the fact text
// below), spelled to match this roster's `state` values (which use "DC", not "District of
// Columbia") so a plain Set lookup works without normalizing anything.
const US_PLACES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'DC',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
  'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

// States commonly cited (Census/ACS Asian-American-subgroup data, and general reporting on
// Vietnamese-American communities) as home to the largest Vietnamese-American populations —
// California and Texas by a wide margin, then Washington, Virginia (Eden Center/Northern
// Virginia), Georgia, Florida, Massachusetts, Pennsylvania, Louisiana (post-1975 Gulf Coast
// resettlement), and Oklahoma. Used only for a rough overlap check against where this roster's
// people are, not as a precise ranked source.
const VIETNAMESE_POPULATION_HUB_STATES = [
  'California', 'Texas', 'Washington', 'Virginia', 'Georgia', 'Florida', 'Massachusetts',
  'Pennsylvania', 'Louisiana', 'Oklahoma',
];

// A curated list of common Vietnamese surnames, matched as whole name-tokens (not substrings) so
// e.g. "Hoang" doesn't get credited to "Ho". Counts are for fun, not genealogy — a name is
// counted at most once per surname even if a token repeats.
const COMMON_SURNAMES = [
  'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Huynh', 'Phan', 'Vu', 'Vo', 'Dang', 'Bui', 'Do', 'Ho',
  'Ngo', 'Duong', 'Ly', 'Cao', 'Doan', 'Trinh', 'Dinh', 'Ta', 'Lam', 'Luu', 'Ton', 'Ha',
];

function stripDiacritics(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function surnameCounts(roster) {
  const counts = new Map();
  for (const p of roster) {
    const namePart = p.name.split(' - ')[0]; // drop a " - University" duplicate-name suffix, if any
    const tokens = stripDiacritics(namePart)
      .replace(/[()]/g, ' ')
      .split(/[\s-]+/)
      .map((t) => t.replace(/[^A-Za-z]/g, '').toLowerCase())
      .filter(Boolean);
    const matched = new Set(
      COMMON_SURNAMES.filter((surname) => tokens.includes(surname.toLowerCase())),
    );
    for (const surname of matched) counts.set(surname, (counts.get(surname) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function countBy(roster, getKey) {
  const counts = new Map();
  for (const p of roster) {
    const key = getKey(p);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

// Computed fresh from the live roster every time (not a snapshot), so these stay accurate as the
// roster grows. Returned as plain fact strings — the "show me something interesting" view just
// renders them as a list.
export function buildFunFacts(roster) {
  const facts = [];
  const total = roster.length;
  const universities = new Set(roster.map((p) => p.university));

  facts.push(`${total} professors listed across ${universities.size} universities.`);

  const surnames = surnameCounts(roster).slice(0, 6);
  facts.push(
    `Most common surnames in the roster: ${surnames.map(([s, c]) => `${s} (${c})`).join(', ')}.`,
  );

  const placeEntries = countBy(roster, (p) => p.state);
  const topPlaces = placeEntries.slice(0, 3);
  facts.push(
    `Most-represented places: ${topPlaces.map(([s, c]) => `${s} (${c})`).join(', ')}.`,
  );
  const minCount = Math.min(...placeEntries.map(([, c]) => c));
  const leastPlaces = placeEntries.filter(([, c]) => c === minCount).map(([s]) => s);
  facts.push(
    `Places with the fewest — just ${minCount} each: ${leastPlaces.join(', ')}.`,
  );
  const represented = new Set(placeEntries.map(([s]) => s));
  const missingPlaces = US_PLACES.filter((s) => !represented.has(s));
  facts.push(
    missingPlaces.length
      ? `Locations with no one on the roster yet: ${missingPlaces.join(', ')}.`
      : 'Every U.S. location has at least one person on the roster.',
  );

  const hubOverlap = VIETNAMESE_POPULATION_HUB_STATES.filter((s) => represented.has(s));
  facts.push(
    `${hubOverlap.length} of the ${VIETNAMESE_POPULATION_HUB_STATES.length} states commonly `
      + `cited as home to the largest Vietnamese-American communities (${VIETNAMESE_POPULATION_HUB_STATES.join(', ')}) `
      + 'already have someone on the roster — the academic map broadly tracks the diaspora map.',
  );

  const uniEntries = countBy(roster, (p) => p.university);
  const topUnis = uniEntries.slice(0, 5);
  facts.push(
    `Universities with the most people on the roster: ${topUnis.map(([u, c]) => `${u} (${c})`).join(', ')}.`,
  );
  const soloUnis = uniEntries.filter(([, c]) => c === 1).length;
  facts.push(`${soloUnis} of the ${universities.size} universities have exactly one person listed.`);

  const rankEntries = countBy(roster, (p) => p.rank || 'rank not listed');
  facts.push(
    `Rank breakdown: ${rankEntries.map(([r, c]) => `${c} ${r}${c === 1 ? '' : 's'}`).join(', ')}.`,
  );

  const withScholar = roster.filter((p) => p.scholarUrl).length;
  facts.push(
    `${withScholar} of ${total} entries (${Math.round((withScholar / total) * 100)}%) link out `
      + 'to a Google Scholar profile.',
  );

  const years = roster.filter((p) => p.phdYear).map((p) => p.phdYear);
  if (years.length) {
    facts.push(`PhD years on record span ${Math.min(...years)} to ${Math.max(...years)}.`);
  }

  const secondary = roster.filter((p) => p.secondaryAppointment).length;
  if (secondary) {
    facts.push(
      `${secondary} ${secondary === 1 ? 'person holds' : 'people hold'} a marked secondary/joint `
        + 'appointment (†).',
    );
  }

  const raEntries = countBy(
    roster.flatMap((p) => p.researchAreas.map((a) => ({ a }))),
    (x) => x.a,
  );
  if (raEntries.length) {
    const [topArea, topAreaCount] = raEntries[0];
    facts.push(`Most common listed research area: "${topArea}" (${topAreaCount} people).`);
  }

  const refugeeResearchers = roster.filter((p) =>
    p.researchAreas.some((a) => /refugee|diaspora|immigra/i.test(a)),
  ).length;
  if (refugeeResearchers) {
    facts.push(
      `${refugeeResearchers} ${refugeeResearchers === 1 ? 'person studies' : 'people study'} `
        + 'refugee, immigration, or diaspora topics — research that traces directly back to the '
        + "community's own postwar history.",
    );
  }

  // Dormant until an `undergradInstitution` field exists on entries (not collected yet — many
  // bios mention a Vietnamese undergrad alma mater, but this hasn't had a dedicated research
  // pass). Once populated, this lights up on its own with no further code changes needed.
  const undergradEntries = countBy(
    roster.filter((p) => p.undergradInstitution).map((p) => ({ i: p.undergradInstitution })),
    (x) => x.i,
  );
  if (undergradEntries.length) {
    const [topSchool, topSchoolCount] = undergradEntries[0];
    facts.push(
      `Most common undergraduate alma mater on record: ${topSchool} (${topSchoolCount} people).`,
    );
  }

  return facts;
}
