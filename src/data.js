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

export function uniqueCities(roster) {
  return [...new Set(roster.map((p) => p.city))].sort();
}

export function uniqueRanks(roster) {
  return [...new Set(roster.map(canonicalRank).filter(Boolean))].sort();
}

// Keep the public rank vocabulary intentionally small. Institution-specific honorifics and
// appointment wording belong on the linked profile; the directory only needs the career stage.
export function canonicalRank(person) {
  if (person.track === 'Emeritus') return 'Emeritus';
  if (person.track === 'Teaching') return 'Teaching';
  if (person.track !== 'Tenure-line') return person.rank;
  if (/assistant/i.test(person.rank ?? '')) return 'Assistant Professor';
  if (/associate/i.test(person.rank ?? '')) return 'Associate Professor';
  return 'Professor';
}

export function uniqueResearchAreas(roster) {
  return [...new Set(roster.flatMap((p) => p.researchAreas))].sort();
}

// The three employment tracks a roster entry can carry. Tenure-line means tenure-track or already
// tenured. Teaching means a full-time, continuing/permanent non-tenure-track teaching appointment
// (e.g. Teaching Professor, Senior/Principal/Distinguished Lecturer). Emeritus means a formally
// conferred emeritus title after a tenure-line career — plain retirement
// without the conferred title doesn't qualify. None of the three ever includes adjunct, visiting,
// postdoctoral, affiliate, or any other term-limited or part-time position; those stay excluded
// from the roster entirely regardless of track. See README.md's "Roster maintenance handoff".
export const TRACKS = ['Tenure-line', 'Teaching', 'Emeritus'];

// Geographic locations and continents available in the location dropdown.
export const LOCATIONS = [
  'US',
  'North America',
  'South America',
  'Africa',
  'Asia',
  'Australasia',
  'Europe',
  'World',
];

export const COUNTRY_TO_CONTINENT = {
  // North America
  'United States': 'North America',
  'US': 'North America',
  'USA': 'North America',
  'Canada': 'North America',
  'Mexico': 'North America',

  // South America
  'Brazil': 'South America',
  'Argentina': 'South America',
  'Chile': 'South America',
  'Colombia': 'South America',
  'Peru': 'South America',

  // Europe
  'United Kingdom': 'Europe',
  'UK': 'Europe',
  'Great Britain': 'Europe',
  'France': 'Europe',
  'Germany': 'Europe',
  'Switzerland': 'Europe',
  'Netherlands': 'Europe',
  'Belgium': 'Europe',
  'Sweden': 'Europe',
  'Norway': 'Europe',
  'Denmark': 'Europe',
  'Finland': 'Europe',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'Austria': 'Europe',
  'Ireland': 'Europe',
  'Poland': 'Europe',
  'Czech Republic': 'Europe',
  'Portugal': 'Europe',
  'Greece': 'Europe',
  'Hungary': 'Europe',
  'Estonia': 'Europe',
  'Luxembourg': 'Europe',
  'Iceland': 'Europe',

  // Asia
  'Singapore': 'Asia',
  'Hong Kong': 'Asia',
  'Japan': 'Asia',
  'South Korea': 'Asia',
  'Korea': 'Asia',
  'Taiwan': 'Asia',
  'China': 'Asia',
  'India': 'Asia',
  'Israel': 'Asia',
  'Saudi Arabia': 'Asia',
  'United Arab Emirates': 'Asia',
  'UAE': 'Asia',
  'Qatar': 'Asia',
  'Thailand': 'Asia',
  'Malaysia': 'Asia',
  'Philippines': 'Asia',
  'Indonesia': 'Asia',

  // Australasia
  'Australia': 'Australasia',
  'New Zealand': 'Australasia',

  // Africa
  'South Africa': 'Africa',
  'Egypt': 'Africa',
  'Nigeria': 'Africa',
  'Kenya': 'Africa',
  'Morocco': 'Africa',
};

export function continentOf(country) {
  if (!country) return 'North America';
  return COUNTRY_TO_CONTINENT[country] || 'Other';
}

export function locationMatches(person, location) {
  if (!location || location === 'World' || location === 'all') return true;
  const country = person.country || 'United States';
  if (location === 'US') {
    return country === 'United States' || country === 'US' || country === 'USA';
  }
  const cont = continentOf(country);
  return cont.toLowerCase() === location.toLowerCase();
}

export function uniqueCountries(roster) {
  return [...new Set(roster.map((p) => p.country || 'United States'))].sort();
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
  'Others',
];

// Some department names are structurally ambiguous — the string alone doesn't say which broad
// field they belong to, only the school/unit that actually houses the position does (e.g. a
// department called "Information Studies" is normally Computer & Information Sciences but
// Education at UCLA, whose faculty sit in the School of Education & Information Studies).
// Rather than stretch a regex to guess that exception, it is keyed exactly by
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
  // Contains "linguistics", which the Humanities rule below would otherwise catch — but this
  // program trains language teachers inside Teachers College, a graduate school of education,
  // not an arts-and-sciences linguistics department. School/unit context wins over the string.
  ['Applied Linguistics and TESOL|Columbia University', 'Education'],
  // Cornell's own description leads with "the home for instruction in the languages, literatures,
  // religions, cultures, and intellectual histories of Asian societies" — humanities-flavored
  // language/literature instruction, even though the department also has social-science range.
  // Doesn't match any FIELD_RULES keyword on its own ("Asian Studies" isn't "languages" or
  // "literature" verbatim), so needs an explicit override rather than a stretched regex.
  ['Asian Studies|Cornell University', 'Humanities'],
  // Yale's Vietnamese-language lector position is administratively housed in this area-studies
  // council (Vietnamese has no dedicated department at Yale), but the role itself is language and
  // literature instruction — Humanities by function, not by the council's own name.
  ['Council on Southeast Asia Studies|Yale University', 'Humanities'],
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
  // Kinesiology/exercise-and-sport-science, veterinary, nutrition, dentistry, and
  // audiology/speech-language programs are typically housed in health-sciences colleges, so
  // they're bucketed here rather than getting their own field. "Communication sciences and
  // disorders" is checked here — ahead of Social & Behavioral Sciences' bare "communication"
  // keyword below — so it doesn't get caught by that instead.
  {
    field: 'Health Sciences',
    match: /health|medicine|surgery|nursing|public health|epidemiology|pharma|psychiatry|pathology|dermatology|biomedical sciences|kinesiology|exercise science|sport science|veterinary|nutrition|dietetics|audiology|speech-language pathology|communication sciences and disorders|anatom|toxicology|dent|orthodont/i,
  },
  // Business terms are specific enough (accounting, marketing, entrepreneurship, ...) that
  // false-positive risk is low; "management" is the one generic-sounding term here, which is
  // why Health Sciences above and Agricultural & Natural Resource Sciences' "natural resources"
  // rule are checked first for the science-flavored "X Management" department names that exist.
  {
    field: 'Business & Economics',
    match: /business|economic|\bfinance\b|accounting|marketing|management|entrepreneurship|\binsurance\b|real estate|human resource|industrial relations|organizational behavior|supply chain|\blogistics\b/i,
  },
  { field: 'Computer & Information Sciences', match: /computer science|computing|informatics|information science|information studies|information systems|information technology|\bIST\b|\bCIS\b|library/i },
  // Stem match (not just "mathematics") so "Mathematical Sciences" — UT Dallas's actual
  // department name — lands here too, without fabricating a different department string.
  { field: 'Mathematics', match: /mathematic/i },
  { field: 'Statistics & Data Science', match: /statistics|biostatistics|operations research|data science/i },
  // "materials science" alone (no "engineering" in the name) still lands here — combined
  // "Materials Science and Engineering" departments already match the bare "engineering" term.
  { field: 'Engineering', match: /engineering|materials science|aviation science/i },
  { field: 'Physics & Astronomy', match: /physics|astronomy/i },
  { field: 'Chemistry', match: /chemistry/i },
  {
    field: 'Biological & Biomedical Sciences',
    match: /biology|biological sciences|neuroscience|plant pathology|genetics|genomic|oncology|microbiology|immunology|molecular|cell biology|ecology|entomology|physiolog/i,
  },
  // Agricultural & Natural Resource Sciences precedes Earth & Environmental Sciences so a combined
  // department name like "Agricultural and Environmental Sciences" (Doc Lap Tran, Tennessee State)
  // lands with agriculture rather than being caught by the bare "environmental" keyword below.
  {
    field: 'Agricultural & Natural Resource Sciences',
    match: /agricultur|agronomy|food science|natural resources|plant science|horticulture|animal science|soil science|forestry|wildlife|fisheries/i,
  },
  { field: 'Earth & Environmental Sciences', match: /environmental|earth|geology|geoscience|geography|oceanography|atmospheric/i },
  // Non-business/non-science fields are matched after the rules above, so departments that read
  // as both (e.g. "Geography and Environmental Studies") keep the science bucket they already
  // had. Education precedes Social & Behavioral Sciences so "Educational Psychology" lands in
  // Education.
  // "curriculum (and|&) instruction" so a department that spells it with an ampersand (Texas
  // Tech's "Curriculum & Instruction") matches too, not just the spelled-out "and" form.
  { field: 'Education', match: /education|curriculum (and|&) instruction|teaching and learning/i },
  { field: 'Law & Public Affairs', match: /\blaw\b|legal studies|public policy|public affairs|public administration|criminal justice|criminology|urban (studies and )?planning|regional planning|city planning/i },
  {
    field: 'Social & Behavioral Sciences',
    match: /sociology|psycholog(?:y|ical)|anthropology|political science|\bpolitics\b|social work|communication|international relations|ethnic studies|american studies|ethnicity,? race|asian studies|asian american studies|asian-pacific studies|asian pacific studies|global and international studies|global studies|international studies|gender,? and sexuality studies|women's,? gender|women's studies|social and cultural analysis|journalism|human development|family studies|gerontology/i,
  },
  { field: 'Humanities', match: /history|philosophy|english|literature|linguistics|languages|classics|great books|religio|theolog|divinity/i },
  { field: 'Arts & Design', match: /\barts?\b|design|music|theat|dance|film|cinema|photograph|architecture/i },
  // A department that matches none of the established broad disciplines is grouped under Others.
];

export function fieldOf(department, university) {
  const override = university && FIELD_OVERRIDES.get(`${department}|${university}`);
  if (override) return override;
  return FIELD_RULES.find((rule) => rule.match.test(department))?.field ?? 'Others';
}

export function uniqueFields(roster) {
  return FIELDS.filter((field) => roster.some((p) => fieldOf(p.department, p.university) === field));
}

export function uniquePhdInstitutions(roster) {
  return [...new Set(roster.map((p) => p.phdInstitution).filter(Boolean))].sort();
}

export function buildDecadeCounts(roster) {
  const counts = new Map();
  for (const p of roster) {
    if (!p.phdYear) continue;
    const decade = Math.floor(p.phdYear / 10) * 10;
    counts.set(`${decade}s`, (counts.get(`${decade}s`) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10));
}

export function buildTopPhdInstitutions(roster, limit = 8) {
  const counts = new Map();
  for (const p of roster) {
    if (!p.phdInstitution) continue;
    counts.set(p.phdInstitution, (counts.get(p.phdInstitution) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export function buildTopUniversities(roster, limit = 8) {
  const counts = new Map();
  for (const p of roster) {
    counts.set(p.university, (counts.get(p.university) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export function stripDiacritics(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export const STATE_ABBR = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO',
  Connecticut: 'CT', DC: 'DC', Delaware: 'DE', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI',
  Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY',
  Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI',
  Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE',
  Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR',
  Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD',
  Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA',
  'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
};

export function parseSearchQuery(query) {
  if (!query) return { type: 'all', text: '' };
  const trimmed = query.trim();
  const prefixMatch = trimmed.match(
    /^(univ(?:ersity)?|school|phd(?:institution)?|alma|state|country|nation|continent|loc(?:ation)?|city|dept|department|name):\s*(?:"([^"]*)"|'([^']*)'|(.+))$/i,
  );
  if (!prefixMatch) {
    return { type: 'text', text: trimmed };
  }
  const prefix = prefixMatch[1].toLowerCase();
  const value = (prefixMatch[2] ?? prefixMatch[3] ?? prefixMatch[4] ?? '').trim();
  if (['univ', 'university', 'school'].includes(prefix)) {
    return { type: 'university', text: value };
  }
  if (['phd', 'phdinstitution', 'alma'].includes(prefix)) {
    return { type: 'phdInstitution', text: value };
  }
  if (prefix === 'state') {
    return { type: 'state', text: value };
  }
  if (['country', 'nation'].includes(prefix)) {
    return { type: 'country', text: value };
  }
  if (['continent', 'loc', 'location'].includes(prefix)) {
    return { type: 'location', text: value };
  }
  if (prefix === 'city') {
    return { type: 'city', text: value };
  }
  if (['dept', 'department'].includes(prefix)) {
    return { type: 'department', text: value };
  }
  if (prefix === 'name') {
    return { type: 'name', text: value };
  }
  return { type: 'text', text: trimmed };
}

export function filterRoster(roster, { query = '', location, field, track, university, phdInstitution, state, country } = {}) {
  let result = roster;
  if (location && location !== 'World' && location !== 'all') {
    result = result.filter((p) => locationMatches(p, location));
  }
  if (field && field !== 'all') {
    result = result.filter((p) => fieldOf(p.department, p.university) === field);
  }
  if (track && track !== 'all') {
    result = result.filter((p) => p.track === track);
  }
  if (country) {
    const norm = stripDiacritics(country.trim().toLowerCase());
    result = result.filter((p) => {
      const c = stripDiacritics((p.country || 'United States').toLowerCase());
      if (norm === 'us' || norm === 'usa') {
        return c === 'united states' || c === 'us' || c === 'usa';
      }
      if (norm.length <= 3) {
        return c === norm;
      }
      return c === norm || c.includes(norm);
    });
  }
  if (university) {
    const norm = stripDiacritics(university.trim().toLowerCase());
    result = result.filter((p) => p.university && stripDiacritics(p.university.toLowerCase()).includes(norm));
  }
  if (phdInstitution) {
    const norm = stripDiacritics(phdInstitution.trim().toLowerCase());
    result = result.filter((p) => p.phdInstitution && stripDiacritics(p.phdInstitution.toLowerCase()).includes(norm));
  }
  if (state) {
    const norm = stripDiacritics(state.trim().toLowerCase());
    result = result.filter((p) => {
      if (!p.state) return false;
      const s = stripDiacritics(p.state.toLowerCase());
      return s === norm || s.includes(norm) || (STATE_ABBR[p.state] && STATE_ABBR[p.state].toLowerCase() === norm);
    });
  }

  const parsed = parseSearchQuery(query);
  if (!parsed.text) return result;

  const target = stripDiacritics(parsed.text.toLowerCase());
  if (parsed.type === 'university') {
    return result.filter((p) => p.university && stripDiacritics(p.university.toLowerCase()).includes(target));
  }
  if (parsed.type === 'phdInstitution') {
    return result.filter((p) => p.phdInstitution && stripDiacritics(p.phdInstitution.toLowerCase()).includes(target));
  }
  if (parsed.type === 'state') {
    return result.filter((p) => {
      if (!p.state) return false;
      const s = stripDiacritics(p.state.toLowerCase());
      return s === target || s.includes(target) || (STATE_ABBR[p.state] && STATE_ABBR[p.state].toLowerCase() === target);
    });
  }
  if (parsed.type === 'country') {
    return result.filter((p) => {
      const c = stripDiacritics((p.country || 'United States').toLowerCase());
      if (target === 'us' || target === 'usa') {
        return c === 'united states' || c === 'us' || c === 'usa';
      }
      if (target.length <= 3) {
        return c === target;
      }
      return c === target || c.includes(target);
    });
  }
  if (parsed.type === 'location') {
    return result.filter((p) => locationMatches(p, parsed.text));
  }
  if (parsed.type === 'city') {
    return result.filter((p) => p.city && stripDiacritics(p.city.toLowerCase()).includes(target));
  }
  if (parsed.type === 'department') {
    return result.filter((p) => p.department && stripDiacritics(p.department.toLowerCase()).includes(target));
  }
  if (parsed.type === 'name') {
    return result.filter((p) => {
      const n = stripDiacritics(displayName(p.name).toLowerCase());
      return n.includes(target);
    });
  }

  return result.filter((p) => {
    const haystack = stripDiacritics(
      [
        p.name,
        p.university,
        p.city,
        p.state,
        p.country || 'United States',
        p.department,
        canonicalRank(p),
        p.phdInstitution,
        p.phdYear && String(p.phdYear),
        ...p.researchAreas,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    );
    return haystack.includes(target);
  });
}

export function sortRoster(roster) {
  return [...roster].sort((a, b) => a.name.localeCompare(b.name));
}

// Duplicate roster keys may carry a " - University" suffix so the JSON name remains unique.
// That suffix is an internal disambiguator only; the public UI always shows the person's name.
export function displayName(name) {
  return name.split(' - ')[0];
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

function surnameCounts(roster) {
  const counts = new Map();
  for (const p of roster) {
    const namePart = displayName(p.name);
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

  const rankEntries = countBy(roster, (p) => canonicalRank(p) || 'rank not listed');
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
