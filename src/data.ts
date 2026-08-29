export interface Honor {
  name: string;
  organization?: string;
  category?: string;
  year?: number;
  source?: string;
}

export interface RosterEntry {
  [key: string]: any;
  name: string;
  university: string;
  city?: string;
  state?: string;
  country?: string;
  department?: string;
  rank?: string;
  track?: string;
  vietnameseName?: string;
  researchAreas?: string[];
  honors?: Honor[];
  postdocInstitution?: string;
  postdocYear?: number;
  phdInstitution?: string;
  phdYear?: number;
  mdInstitution?: string;
  mdYear?: number;
  undergradInstitution?: string;
  undergradYear?: number;
  msInstitution?: string;
  msYear?: number;
  profileUrl?: string;
  websiteUrl?: string;
  scholarUrl?: string;
}

export type Roster = RosterEntry[];

let cached: Roster | null = null;

const searchIndexCache = new WeakMap();

function searchableFields(person) {
  return [
    displayName(person.name),
    vietnameseName(person),
    person.university,
    person.city,
    person.state,
    person.country,
    person.department,
    person.rank,
    canonicalRank(person),
    healthSubfieldOf(person),
    person.postdocInstitution,
    person.phdInstitution,
    person.mdInstitution,
    person.undergradInstitution,
    person.msInstitution,
    ...(person.researchAreas ?? []),
    ...(person.honors ?? []).flatMap((honor) => [honor.name, honor.organization]),
  ];
}

function normalizeSearchText(value) {
  return stripDiacritics(String(value).toLowerCase());
}

export function buildSearchIndex(roster) {
  if (!Array.isArray(roster)) return roster;
  const cachedIndex = searchIndexCache.get(roster);
  if (cachedIndex) return cachedIndex;
  const index = {
    roster,
    textByPerson: new WeakMap(
      roster.map((person) => [
        person,
        searchableFields(person).filter(Boolean).map(normalizeSearchText),
      ]),
    ),
  };
  searchIndexCache.set(roster, index);
  return index;
}

export async function loadRoster(): Promise<Roster> {
  if (cached) return cached;
  const res = await fetch(`${import.meta.env.BASE_URL}data.json`);
  if (!res.ok) throw new Error(`Failed to load data.json: ${res.status}`);
  cached = await res.json();
  return cached;
}

export function uniqueStates(roster) {
  return [...new Set(roster.map((p) => p.state).filter(Boolean))].sort();
}

export function uniqueDepartments(roster) {
  return [...new Set(roster.map((p) => p.department).filter(Boolean))].sort();
}

export function uniqueCities(roster) {
  return [...new Set(roster.map((p) => p.city).filter(Boolean))].sort();
}

export function uniqueRanks(roster) {
  return [...new Set(roster.map(canonicalRank).filter(Boolean))].sort();
}

// Keep official university names in the roster and search index. Established aliases take
// precedence; otherwise a terminal " University" is abbreviated in the compact card display.
const UNIVERSITY_DISPLAY_NAMES = new Map([
  ['Pennsylvania State University', 'Penn State'],
  ['Penn State University', 'Penn State'],
  ['Brown University', 'Brown'],
  ['Carnegie Mellon University', 'Carnegie Mellon'],
  ['Columbia University', 'Columbia'],
  ['Cornell University', 'Cornell'],
  ['Duke University', 'Duke'],
  ['Harvard University', 'Harvard'],
  ['Johns Hopkins University', 'Johns Hopkins'],
  ['Massachusetts Institute of Technology', 'MIT'],
  ['New York University', 'NYU'],
  ['Northwestern University', 'Northwestern'],
  ['Princeton University', 'Princeton'],
  ['Rice University', 'Rice'],
  ['Stanford University', 'Stanford'],
  ['Yale University', 'Yale'],
]);

export function displayUniversity(university) {
  return UNIVERSITY_DISPLAY_NAMES.get(university) ?? university?.replace(/ University$/, ' Univ.');
}

// Keep the public rank vocabulary intentionally small. Institution-specific honorifics and
// appointment wording belong on the linked profile; the directory only needs the career stage.
export function canonicalRank(person) {
  if (person.track === 'Emeritus') return 'Emeritus';
  if (person.track === 'Teaching') return 'Teaching';
  if (person.track === 'Research') return 'Research';
  if (person.track === 'Clinical') return 'Clinical';
  if (person.track !== 'Tenure-line') return person.rank;
  if (/assistant/i.test(person.rank ?? '')) return 'Assistant Professor';
  if (/associate/i.test(person.rank ?? '')) return 'Associate Professor';
  return 'Professor';
}

// The roster's canonical `name` stays in the form used by the institution. This companion
// display form puts a recognizable Vietnamese family name first and adds only high-confidence
// surname diacritics. A record may provide `vietnameseName` when an authoritative source gives
// the person's complete Vietnamese name; otherwise initials are deliberately preserved.
const VIETNAMESE_SURNAMES = new Map([
  ['Bui', 'Bùi'], ['Cao', 'Cao'], ['Chau', 'Châu'], ['Dang', 'Đặng'], ['Dao', 'Đào'],
  ['Dinh', 'Đinh'], ['Do', 'Đỗ'], ['Doan', 'Đoàn'], ['Duong', 'Dương'], ['Ha', 'Hà'],
  ['Ho', 'Hồ'], ['Hoang', 'Hoàng'], ['Huynh', 'Huỳnh'], ['Lam', 'Lâm'], ['Le', 'Lê'],
  ['Ly', 'Lý'], ['Mai', 'Mai'], ['Ngo', 'Ngô'], ['Nguyen', 'Nguyễn'], ['Pham', 'Phạm'],
  ['Phan', 'Phan'], ['Ta', 'Tạ'], ['To', 'Tô'], ['Tran', 'Trần'], ['Trinh', 'Trịnh'], ['Truong', 'Trương'],
  ['Vo', 'Võ'], ['Vu', 'Vũ'], ['Vuong', 'Vương'],
]);

const VIETNAMESE_NAME_OVERRIDES = new Map([
  ['Bao Chau Ngo', 'Ngô Bảo Châu'],
  ['Cac Nguyen', 'Nguyễn Cac'],
  ['Hai-Dang Nguyen', 'Nguyễn Hải-Đăng'],
  ['Nghiem V. Nguyen', 'Nguyễn V. Nghiêm'],
  ['Son Thanh Dam', 'Đàm Thanh Sơn'],
  ['Thai Luan Vu', 'Vũ Thái Luân'],
  ['Tien Zung Nguyen', 'Nguyễn Tiến Zung'],
  ['Thuan Nguyen', 'Nguyễn Thuần'],
  ['XuanLong Nguyen', 'Nguyễn Xuân Long'],
  // The CV expands the middle initial as Huy; the display order follows Vietnamese naming.
  ['ThanhVu H. Nguyen', 'Nguyễn Huy Thanh Vũ'],
]);

function vietnameseGivenNames(value) {
  const marks = new Map([
    ['Anh', 'Anh'], ['Bach', 'Bạch'], ['Bao', 'Bảo'], ['Bich', 'Bích'], ['Binh', 'Bình'],
    ['Chinh', 'Chính'], ['Chung', 'Chung'], ['Cuong', 'Cường'], ['Dat', 'Đạt'], ['Danh', 'Danh'],
    ['Dam', 'Đàm'], ['Dau', 'Đậu'], ['Diep', 'Diệp'], ['Diem', 'Diễm'], ['Dien', 'Điền'],
    ['Dinh', 'Đình'], ['Doan', 'Đoàn'], ['Duc', 'Đức'], ['Duy', 'Duy'], ['Giao', 'Giao'],
    ['Giang', 'Giang'], ['Hai', 'Hải'], ['Han', 'Hân'], ['Hanh', 'Hạnh'], ['Hang', 'Hằng'], ['Hau', 'Hậu'], ['Ha', 'Hà'],
    ['Hieu', 'Hiếu'], ['Hiep', 'Hiệp'], ['Hien', 'Hiền'], ['Hoai', 'Hoài'], ['Hoa', 'Hoa'],
    ['Hong', 'Hồng'], ['Hoang', 'Hoàng'], ['Hop', 'Hợp'], ['Huong', 'Hương'], ['Huyen', 'Huyền'], ['Huu', 'Hữu'],
    ['Khai', 'Khải'], ['Khanh', 'Khánh'], ['Khang', 'Khang'], ['Khiem', 'Khiêm'], ['Khoa', 'Khoa'],
    ['Khuong', 'Khương'], ['Kieu', 'Kiều'], ['Lan', 'Lan'], ['Lap', 'Lập'], ['Lien', 'Liên'],
    ['Liem', 'Liêm'], ['Linh', 'Linh'], ['Loan', 'Loan'], ['Loi', 'Lợi'], ['Long', 'Long'],
    ['Luan', 'Luân'], ['Mai', 'Mai'], ['Manh', 'Mạnh'], ['Minh', 'Minh'], ['Ngan', 'Ngân'],
    ['Nghia', 'Nghĩa'], ['Nghiem', 'Nghiêm'], ['Ngoc', 'Ngọc'], ['Nhung', 'Nhung'], ['Nhu', 'Như'],
    ['Nhat', 'Nhật'], ['Nghia', 'Nghĩa'], ['Phat', 'Phát'], ['Phu', 'Phú'], ['Phuc', 'Phúc'],
    ['Phuong', 'Phương'], ['Phuoc', 'Phước'], ['Phong', 'Phong'], ['Quang', 'Quang'], ['Quan', 'Quân'],
    ['Quoc', 'Quốc'], ['Quyen', 'Quyền'], ['Quynh', 'Quỳnh'], ['Sang', 'Sáng'], ['Son', 'Sơn'],
    ['Tai', 'Tài'], ['Tam', 'Tâm'], ['Tan', 'Tân'], ['Thang', 'Thắng'], ['Thao', 'Thảo'],
    ['Thien', 'Thiện'], ['Thinh', 'Thịnh'], ['Tho', 'Thọ'], ['Thai', 'Thái'], ['Thuan', 'Thuận'], ['Thuc', 'Thức'],
    ['Tien', 'Tiến'], ['Toan', 'Toàn'], ['Tram', 'Trâm'], ['Trieu', 'Triều'], ['Trong', 'Trọng'],
    ['Trung', 'Trung'], ['Truong', 'Trường'], ['Tuan', 'Tuấn'], ['Tung', 'Tùng'], ['Tuyen', 'Tuyền'],
    ['Uyen', 'Uyên'], ['Vi', 'Vi'], ['Viet', 'Việt'], ['Vinh', 'Vinh'], ['Vu', 'Vũ'],
    ['Xuan', 'Xuân'], ['Yen', 'Yến'],
  ]);
  return value.replace(/\b[A-Za-z]+\b/g, (token) => marks.get(token) ?? token);
}

function surnameKey(token) {
  return stripDiacritics(token.replace(/[.,]/g, ''));
}

export function vietnameseName(person) {
  if (person.vietnameseName?.trim()) return vietnameseGivenNames(person.vietnameseName.trim());
  const current = displayName(person.name).trim();
  if (VIETNAMESE_NAME_OVERRIDES.has(current)) return vietnameseGivenNames(VIETNAMESE_NAME_OVERRIDES.get(current));
  const tokens = current.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return vietnameseGivenNames(current);
  const firstKey = surnameKey(tokens[0]);
  const lastKey = surnameKey(tokens.at(-1));
  // Some Vietnamese sources publish family name first. For the roster's readable
  // parenthetical form, move an initial Nguyễn to the final family-name position.
  if (firstKey === 'Nguyen' && lastKey !== 'Nguyen') {
    return vietnameseGivenNames(`${tokens.slice(1).join(' ')} ${VIETNAMESE_SURNAMES.get('Nguyen')}`);
  }
  if (VIETNAMESE_SURNAMES.has(firstKey) && !VIETNAMESE_SURNAMES.has(lastKey)) {
    return vietnameseGivenNames(`${VIETNAMESE_SURNAMES.get(firstKey)} ${tokens.slice(1).join(' ')}`);
  }
  if (VIETNAMESE_SURNAMES.has(lastKey)) {
    return vietnameseGivenNames(`${VIETNAMESE_SURNAMES.get(lastKey)} ${tokens.slice(0, -1).reverse().join(' ')}`);
  }
  return vietnameseGivenNames(current);
}

export function uniqueResearchAreas(roster) {
  return [...new Set(roster.flatMap((p) => p.researchAreas).filter(Boolean))].sort();
}

// Employment tracks a roster entry can carry. Tenure-line means tenure-track or already tenured.
// Teaching means a full-time, continuing/permanent non-tenure-track teaching appointment, including
// stable Professor of Practice and equivalent appointments. Research and Clinical are stable faculty
// or faculty-equivalent appointments in their respective institutional tracks; their exact title
// remains in `rank`. Emeritus means a formally conferred
// emeritus title after a tenure-line career — plain retirement without the conferred title doesn't
// qualify. None includes adjunct, visiting, postdoctoral, affiliate, or other term-limited or
// part-time positions; those stay excluded from the roster. See ROSTER_MAINTENANCE.md.
export const TRACKS = ['Tenure-line', 'Teaching', 'Research', 'Clinical', 'Emeritus'];

// Continent/region values supported by structured location queries and the second
// ("by continent") section of the visible location dropdown.
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
  'Vietnam': 'Asia',
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

export const COUNTRY_FLAGS = {
  'United States': '🇺🇸',
  'US': '🇺🇸',
  'USA': '🇺🇸',
  'Canada': '🇨🇦',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'Australia': '🇦🇺',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Netherlands': '🇳🇱',
  'Switzerland': '🇨🇭',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Belgium': '🇧🇪',
  'Poland': '🇵🇱',
  'Ireland': '🇮🇪',
  'Singapore': '🇸🇬',
  'Vietnam': '🇻🇳',
  'Japan': '🇯🇵',
  'Hong Kong': '🇭🇰',
  'New Zealand': '🇳🇿',
  'South Korea': '🇰🇷',
  'Korea': '🇰🇷',
  'Taiwan': '🇹🇼',
  'China': '🇨🇳',
  'Denmark': '🇩🇰',
  'Finland': '🇫🇮',
  'Austria': '🇦🇹',
  'Italy': '🇮🇹',
  'Spain': '🇪🇸',
  'Portugal': '🇵🇹',
  'Israel': '🇮🇱',
  'Saudi Arabia': '🇸🇦',
  'United Arab Emirates': '🇦🇪',
  'UAE': '🇦🇪',
  'Qatar': '🇶🇦',
  'India': '🇮🇳',
  'Thailand': '🇹🇭',
  'Malaysia': '🇲🇾',
  'Philippines': '🇵🇭',
  'Indonesia': '🇮🇩',
  'South Africa': '🇿🇦',
  'Egypt': '🇪🇬',
  'Nigeria': '🇳🇬',
  'Kenya': '🇰🇪',
  'Morocco': '🇲🇦',
  'Brazil': '🇧🇷',
  'Mexico': '🇲🇽',
  'Argentina': '🇦🇷',
  'Chile': '🇨🇱',
  'Colombia': '🇨🇴',
};

export function countryFlag(country) {
  if (!country) return '🇺🇸';
  return COUNTRY_FLAGS[country] || '🌐';
}

export const LOCATION_LABELS = {
  'US': '🇺🇸 United States',
  'North America': '🌎 North America',
  'South America': '🌎 South America',
  'Europe': '🌍 Europe',
  'Australasia': '🌏 Australasia',
  'Asia': '🌏 Asia',
  'Africa': '🌍 Africa',
  'World': '🌐 World',
};

export function continentOf(country) {
  if (!country) return 'North America';
  return COUNTRY_TO_CONTINENT[country] || 'Other';
}

export function locationMatches(person, location) {
  if (!location || location === 'World' || location === 'all') return true;
  const country = person.country || 'United States';
  if (location.toLowerCase() === 'us' || location.toLowerCase() === 'united states' || location.toLowerCase() === 'usa') {
    return country === 'United States' || country === 'US' || country === 'USA';
  }
  // Country names are also valid location values for the country-based dropdown. Keep
  // this check before the continent fallback so a country is never treated as an unknown
  // continent and filtered to zero results.
  if (country.toLowerCase() === location.toLowerCase()) return true;
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

// Health Sciences remains one broad filter, with these derived subfields available for
// identifying medical specialties without fragmenting the main taxonomy.
export const HEALTH_SUBFIELDS = [
  'Clinical Medicine',
  'Public Health',
  'Nursing',
  'Pharmacy',
  'Dentistry',
  'Biomedical Research',
  'Medical Education',
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
  // The Vietnam Center and Sam Johnson Vietnam Archive is an interdisciplinary research center;
  // this historian's appointment and research focus belong with the Humanities bucket.
  ['Vietnam Center and Sam Johnson Vietnam Archive|Texas Tech University', 'Humanities'],
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
    match: /health|medicine|surgery|nursing|public health|epidemiology|pharma|psychiatry|pathology|dermatology|biomedical sciences|cardiovascular|pediatric|neurology|ophthalmology|family practice|physician assistant|kinesiology|exercise science|sport science|veterinary|nutrition|dietetics|audiology|speech-language pathology|communication sciences and disorders|anatom|toxicology|dentistry|dental|orthodont|dentisterie|radiology|radiolog|optometry|vision science/i,
  },
  // Business terms are specific enough (accounting, marketing, entrepreneurship, ...) that
  // false-positive risk is low; "management" is the one generic-sounding term here, which is
  // why Health Sciences above and Agricultural & Natural Resource Sciences' "natural resources"
  // rule are checked first for the science-flavored "X Management" department names that exist.
  {
    field: 'Business & Economics',
    match: /business|economic|\bfinanc(?:e|ial|es)\b|accounting|marketing|management|entrepreneurship|\binsurance\b|real estate|human resource|industrial relations|organi[zs]ation|work and organi[zs]ation|supply chain|\blogistics\b/i,
  },
  { field: 'Computer & Information Sciences', match: /computer science|computing|informati(?:cs?|que)|information science|information studies|information systems|information technology|cybersecurity|\bIST\b|\bCIS\b|library|machine learning|artificial intelligence|natural language processing|multimedia/i },
  // Stem match (not just "mathematics") so "Mathematical Sciences" — UT Dallas's actual
  // department name — lands here too, without fabricating a different department string.
  { field: 'Mathematics', match: /mathematic|mathématiq|géométrie/i },
  { field: 'Statistics & Data Science', match: /statistics|biostatistics|operations research|decision sciences|data science/i },
  // "materials science" alone (no "engineering" in the name) still lands here — combined
  // "Materials Science and Engineering" departments already match the bare "engineering" term.
  { field: 'Engineering', match: /engineering|materials(?: science)?|aviation science|aeronautic|astronautic|aerospace|electrical communication|mechatronic|nanotechnology|nanotechnologie/i },
  { field: 'Physics & Astronomy', match: /physics|astronomy/i },
  { field: 'Chemistry', match: /chemistry|chimie/i },
  {
    field: 'Biological & Biomedical Sciences',
    match: /biology|biologie|biological sciences|neuroscience|plant pathology|genetics|genomic|oncology|microbiology|immunology|molecular|cell biology|ecology|entomology|physiolog/i,
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
    match: /sociology|psycholog(?:y|ical)|anthropology|political science|\bpolitics\b|social work|human services|child and adolescent development|communication|international relations|ethnic studies|american studies|ethnicity,? race|asian studies|asian american studies|asian-pacific studies|asian pacific studies|global and international studies|global studies|international studies|gender,? and sexuality studies|women's,? gender|women's studies|social and cultural analysis|journalism|human development|family studies|gerontology|media and culture|media and communication|southeast asia/i,
  },
  { field: 'Humanities', match: /history|philosophy|english|literature|linguistics|languages|letters and cultures|classics|great books|religio|theolog|divinity/i },
  { field: 'Arts & Design', match: /\barts?\b|design|music|theat|dance|film|cinema|photograph|architecture/i },
  // A department that matches none of the established broad disciplines is grouped under Others.
];

export function fieldOf(department, university) {
  const override = university && FIELD_OVERRIDES.get(`${department}|${university}`);
  if (override) return override;
  return FIELD_RULES.find((rule) => rule.match.test(department))?.field ?? 'Others';
}

export function healthSubfieldOf(person) {
  if (fieldOf(person.department, person.university) !== 'Health Sciences') return null;
  const text = `${person.department} ${(person.researchAreas ?? []).join(' ')}`;
  if (/nursing/i.test(text)) return 'Nursing';
  if (/pharma|pharmac/i.test(text)) return 'Pharmacy';
  if (/dentist|dental|orthodont|oral health/i.test(text)) return 'Dentistry';
  if (/public health|epidemiolog|health management|health policy/i.test(text)) return 'Public Health';
  if (/medical education|nursing education|teaching medicine/i.test(text)) return 'Medical Education';
  if (/biomedical|pathology|immunology|molecular|genomic|oncology|cell biology/i.test(text)) return 'Biomedical Research';
  return 'Clinical Medicine';
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

function stripDiacritics(s) {
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

export function parseSearchQuery(query: string): any {
  if (!query) return { type: 'all', text: '' };
  const trimmed = query.trim();
  if (/^(honors|awards)$/i.test(trimmed)) {
    return { type: 'honors', text: '' };
  }
  const credential = trimmed.toLowerCase();
  if (['phd', 'postdoc', 'ms', 'undergrad', 'md'].includes(credential)) {
    return { type: 'credential', credential, text: '' };
  }
  const prefixMatch = trimmed.match(
    /^(univ(?:ersity)?|school|phd(?:institution)?|alma|postdoc|postdoctoral|ms|md|undergrad(?:uate)?|state|country|nation|continent|loc(?:ation)?|city|dept|department|name):\s*(?:"([^"]*)"|'([^']*)'|(.*))$/i,
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
    return { type: 'credential', credential: 'phd', text: value };
  }
  if (['postdoc', 'postdoctoral'].includes(prefix)) {
    return { type: 'credential', credential: 'postdoc', text: value };
  }
  if (prefix === 'ms') {
    return { type: 'credential', credential: 'ms', text: value };
  }
  if (prefix === 'md') {
    return { type: 'credential', credential: 'md', text: value };
  }
  if (['undergrad', 'undergraduate'].includes(prefix)) {
    return { type: 'credential', credential: 'undergrad', text: value };
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

interface FilterOptions {
  query?: string;
  location?: string;
  field?: string;
  track?: string;
  university?: string;
  phdInstitution?: string;
  state?: string;
  country?: string;
}

export function filterRoster(roster: Roster | ReturnType<typeof buildSearchIndex>, { query = '', location, field, track, university, phdInstitution, state, country }: FilterOptions = {}) {
  const index = Array.isArray(roster) ? buildSearchIndex(roster) : roster;
  let result = index.roster;
  const parsed = parseSearchQuery(query);
  const hasExplicitLocationQuery = ['country', 'location'].includes(parsed.type);

  if (location && location !== 'World' && location !== 'all' && !hasExplicitLocationQuery) {
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

  if (parsed.type === 'honors') {
    return result.filter((p) => Array.isArray(p.honors) && p.honors.length > 0);
  }

  if (parsed.type === 'credential') {
    const fields = {
      phd: ['phdInstitution', 'phdYear'],
      postdoc: ['postdocInstitution', 'postdocYear'],
      ms: ['msInstitution', 'msYear'],
      md: ['mdInstitution', 'mdYear'],
      undergrad: ['undergradInstitution', 'undergradYear'],
    }[parsed.credential];
    const target = stripDiacritics(parsed.text.toLowerCase());
    return result.filter((p) => {
      const [institutionField, yearField] = fields;
      if (!p[institutionField] && !p[yearField]) return false;
      return !target || (p[institutionField] && stripDiacritics(p[institutionField].toLowerCase()).includes(target));
    });
  }

  if (!parsed.text) return result;

  const target = stripDiacritics(parsed.text.toLowerCase());
  if (parsed.type === 'university') {
    return result.filter((p) => p.university && stripDiacritics(p.university.toLowerCase()).includes(target));
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
    return result.filter((p) => stripDiacritics(displayName(p.name).toLowerCase()).includes(target));
  }

  // Full-text search across all fields, including award names and organizations.
  // When a query matches one or more honor names, prefer those exact honor matches over
  // incidental words in source URLs or biographies (e.g. "IEEE Fellow" should not match a
  // Gordon Bell source merely because that source mentions IEEE).
  const honorMatches = result.filter((p) => (p.honors || []).some((honor) => {
    const honorName = stripDiacritics((honor.name || '').toLowerCase());
    const awardQuery = /award|fellow|prize|grant|medal|academy|fellowship|career|professorship|honor|honour/.test(target);
    return honorName === target || (awardQuery && honorName.includes(target));
  }));
  if (honorMatches.length > 0) return honorMatches;

  return result.filter((p) => {
    const searchableText = index.textByPerson.get(p).join(' ');
    if (searchableText.includes(target)) return true;
    // Also accept multi-word searches whose terms are separated by initials or
    // punctuation, e.g. "van vu" should match the name "Van H. Vu".
    const terms = target.split(/\s+/).filter(Boolean);
    return terms.length > 1 && terms.every((term) => searchableText.includes(term));
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
  'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Huynh', 'Phan', 'Vu', 'Vo', 'Dang',
  'Bui', 'Do', 'Ho', 'Ngo', 'Duong', 'Dinh', 'Ly', 'Luong', 'Mai', 'Dao', 'Trinh', 'Ta',
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
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function buildUsFunFacts(roster) {
  const usRoster = (roster || []).filter((p) => (p.country || 'United States') === 'United States');
  if (usRoster.length === 0) {
    return ['No United States faculty currently listed under the active filter selection.'];
  }
  const facts = [];
  const total = usRoster.length;
  const universities = new Set(usRoster.map((p) => p.university));

  facts.push(
    `${total} professor${total === 1 ? '' : 's'} across ${universities.size} U.S. universit${universities.size === 1 ? 'y' : 'ies'}.`,
  );

  const surnames = surnameCounts(usRoster).slice(0, 6);
  if (surnames.length) {
    facts.push(
      `Most common surnames in the U.S. roster: ${surnames.map(([s, c]) => `${s} (${c})`).join(', ')}.`,
    );
  }

  const placeEntries = countBy(usRoster, (p) => p.state);
  if (placeEntries.length > 0) {
    const topPlaces = placeEntries.slice(0, 4);
    facts.push(
      `Most-represented U.S. states: ${topPlaces.map(([s, c]) => `${s} (${c})`).join(', ')}.`,
    );

    const minCount = Math.min(...placeEntries.map(([, c]) => c));
    const leastPlaces = placeEntries.filter(([, c]) => c === minCount).map(([s]) => s);
    if (leastPlaces.length && leastPlaces.length <= 15) {
      facts.push(
        `Places with the fewest — just ${minCount} each: ${leastPlaces.join(', ')}.`,
      );
    }

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
  }

  const uniEntries = countBy(usRoster, (p) => p.university);
  const topUnis = uniEntries.slice(0, 5);
  if (topUnis.length) {
    facts.push(
      `Top U.S. faculty institutions: ${topUnis.map(([u, c]) => `${u} (${c})`).join(', ')}.`,
    );
  }

  const rankEntries = countBy(usRoster, (p) => canonicalRank(p) || 'rank not listed');
  if (rankEntries.length) {
    facts.push(
      `U.S. rank breakdown: ${rankEntries.map(([r, c]) => `${c} ${['Emeritus', 'Teaching', 'Research', 'Clinical'].includes(r) ? r : r + (c === 1 ? '' : 's')}`).join(', ')}.`,
    );
  }

  const years = usRoster.filter((p) => p.phdYear).map((p) => p.phdYear);
  if (years.length) {
    facts.push(`PhD graduation years on record span from ${Math.min(...years)} to ${Math.max(...years)}.`);
  }

  return facts;
}

export function buildGlobalFunFacts(roster) {
  const globalRoster = (roster || []).filter((p) => (p.country || 'United States') !== 'United States');
  if (globalRoster.length === 0) {
    return ['No international diaspora faculty currently listed under the active filter selection.'];
  }
  const facts = [];
  const total = globalRoster.length;
  const universities = new Set(globalRoster.map((p) => p.university));
  const countries = countBy(globalRoster, (p) => p.country);
  const continents = countBy(globalRoster, (p) => continentOf(p.country));

  facts.push(
    `${total} international professor${total === 1 ? '' : 's'} across ${universities.size} universities in ${countries.length} countries outside the U.S.`,
  );

  if (continents.length) {
    facts.push(
      `Continental distribution: ${continents.map(([cont, c]) => `${cont} (${c})`).join(', ')}.`,
    );
  }

  if (countries.length) {
    facts.push(
      `Top international diaspora hubs: ${countries.slice(0, 6).map(([c, count]) => `${c} (${count})`).join(', ')}.`,
    );
  }

  const uniEntries = countBy(globalRoster, (p) => p.university);
  const topUnis = uniEntries.slice(0, 5);
  if (topUnis.length) {
    facts.push(
      `Top international universities by Vietnamese faculty: ${topUnis.map(([u, c]) => `${u} (${c})`).join(', ')}.`,
    );
  }

  const refugeeResearchers = (roster || []).filter((p) =>
    p.researchAreas && p.researchAreas.some((a) => /refugee|diaspora|immigra/i.test(a)),
  ).length;
  if (refugeeResearchers) {
    facts.push(
      `${refugeeResearchers} ${refugeeResearchers === 1 ? 'scholar studies' : 'scholars study'} `
        + 'refugee, immigration, or diaspora topics — research that traces directly back to the '
        + "global Vietnamese community's postwar history.",
    );
  }

  const withScholar = globalRoster.filter((p) => p.scholarUrl).length;
  facts.push(
    `${withScholar} of ${total} international entries (${Math.round((withScholar / total) * 100)}%) link out to Google Scholar.`,
  );

  const years = globalRoster.filter((p) => p.phdYear).map((p) => p.phdYear);
  if (years.length) {
    facts.push(`Worldwide PhD graduation years span from ${Math.min(...years)} to ${Math.max(...years)}.`);
  }

  return facts;
}

function honorHolderCount(roster, honorName) {
  return new Set((roster || [])
    .filter((p) => (p.honors || []).some((honor) => honor.name === honorName))
    .map((p) => p.name)).size;
}

const MARQUEE_HONORS = [
  'Nobel Prize',
  'Fields Medal',
  'MacArthur Fellow',
  'Kavli Prize in Astrophysics',
  'Shaw Prize in Astronomy',
  'Pulitzer Prize for Fiction',
  'Gordon Bell Prize',
  'ICTP Dirac Medal',
  'Clay Research Award',
];

export function buildAwardsFunFacts(roster) {
  const allRoster = roster || [];
  if (allRoster.length === 0) {
    return ['No faculty currently listed, so no awards or honors can be counted.'];
  }

  const honored = allRoster.filter((p) => (p.honors || []).length > 0).length;
  const usRoster = allRoster.filter((p) => (p.country || 'United States') === 'United States');
  const academyHolders = new Set(allRoster
    .filter((p) => (p.honors || []).some((honor) => honor.category === 'academy'))
    .map((p) => p.name)).size;
  const fellowHolders = new Set(allRoster
    .filter((p) => (p.honors || []).some((honor) => honor.category === 'fellow'))
    .map((p) => p.name)).size;

  const honorCounts = countBy(allRoster.flatMap((p) => (p.honors || []).map((honor) => honor.name)), (name) => name);
  const commonHonors = honorCounts.slice(0, 5);
  const marqueeHonors = MARQUEE_HONORS
    .map((name): [string, number] => [name, honorHolderCount(allRoster, name)])
    .filter(([, count]) => count > 0);
  const facts = [];
  const nsfHolders = honorHolderCount(allRoster, 'NSF CAREER Award');
  const usNsfHolders = honorHolderCount(usRoster, 'NSF CAREER Award');
  const pecaseHolders = honorHolderCount(allRoster, 'PECASE');
  const usPecaseHolders = honorHolderCount(usRoster, 'PECASE');
  const signatureHonors: [string, number][] = [
    ['MacArthur Fellows', honorHolderCount(allRoster, 'MacArthur Fellow')] as [string, number],
    ['Fields Medalists', honorHolderCount(allRoster, 'Fields Medal')] as [string, number],
    ['Nobel Prize winners', honorHolderCount(allRoster, 'Nobel Prize')] as [string, number],
  ].filter(([, count]) => count > 0);

  if (honored > 0) facts.push(`${honored} of ${allRoster.length} professors have at least one recorded major honor or award.`);
  if (nsfHolders > 0) {
    facts.push(`NSF CAREER Award holders: ${nsfHolders} across the database (${usNsfHolders} currently in the U.S. roster).`);
  }
  if (pecaseHolders > 0) {
    facts.push(`PECASE recipients: ${pecaseHolders} across the database (${usPecaseHolders} currently in the U.S. roster).`);
  }
  if (signatureHonors.length) {
    facts.push(`${signatureHonors.map(([name, count]) => `${name}: ${count}`).join('; ')}.`);
  }
  if (marqueeHonors.length) {
    facts.push(`Marquee honors represented: ${marqueeHonors.map(([name, count]) => `${name} (${count})`).join(', ')}.`);
  }

  const academyFacts = [];
  if (academyHolders > 0) academyFacts.push(`${academyHolders} national-academy or equivalent academy distinction${academyHolders === 1 ? '' : 's'}`);
  if (fellowHolders > 0) academyFacts.push(`${fellowHolders} major-society fellowship${fellowHolders === 1 ? '' : 's'}`);
  if (academyFacts.length) facts.push(`${academyFacts.join(' and ')} recorded in the roster.`);
  if (commonHonors.length) facts.push(`Most frequently recorded honors: ${commonHonors.map(([name, count]) => `${name} (${count})`).join(', ')}.`);

  return facts;
}

// Computed fresh from the live roster every time (not a snapshot), so these stay accurate as the
// roster grows. Returned as plain fact strings — the "show me something interesting" view just
// renders them as a list.
export function buildFunFacts(roster) {
  if (!roster || roster.length === 0) {
    return ['No faculty currently listed for this location or filter selection.'];
  }
  const usFacts = buildUsFunFacts(roster);
  const globalFacts = buildGlobalFunFacts(roster);
  return [...usFacts, ...globalFacts];
}
