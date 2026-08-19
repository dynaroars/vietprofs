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
  'Misc',
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
//   through to Misc for a human to classify from the person's actual appointment rather than
//   guessed from a keyword (or gets an explicit FIELD_OVERRIDES entry above).
// - Engineering is still ahead of Chemistry so Chemical Engineering is not misclassified.
// - Social & Behavioral Sciences precedes Humanities so area/ethnic/gender-studies departments
//   (Ethnic Studies, Asian American Studies, American Ethnic Studies, Asian-Pacific Studies,
//   Global and International Studies, Women's/Gender/Sexuality Studies, Social and Cultural
//   Analysis) land in Social & Behavioral Sciences even though some of their methods are
//   humanistic — this taxonomy classifies by disciplinary home, not by method. Only "History"
//   itself (bare, or "History of ...") is reserved for Humanities.
const FIELD_RULES = [
  { field: 'Computer & Information Sciences', match: /computer science|informatics|information science/i },
  { field: 'Mathematics', match: /mathematics/i },
  { field: 'Health Sciences', match: /health|medicine|nursing|public health|epidemiology|pharma/i },
  // Business terms are specific enough (accounting, marketing, entrepreneurship, ...) that
  // false-positive risk is low; "management" is the one generic-sounding term here, which is
  // why Health Sciences above and Agricultural & Natural Resource Sciences' "natural resources"
  // rule are checked first for the science-flavored "X Management" department names that exist.
  {
    field: 'Business & Economics',
    match: /business|economics|\bfinance\b|accounting|marketing|management|entrepreneurship|\binsurance\b|real estate|human resource|industrial relations|organizational behavior|supply chain|\blogistics\b/i,
  },
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
  // Non-business/non-science fields are matched after the rules above, so departments that read
  // as both (e.g. "Geography and Environmental Studies") keep the science bucket they already
  // had. Education precedes Social & Behavioral Sciences so "Educational Psychology" lands in
  // Education.
  { field: 'Education', match: /education|curriculum and instruction|teaching and learning/i },
  { field: 'Law & Public Affairs', match: /\blaw\b|legal studies|public policy|public affairs|public administration|criminal justice|criminology/i },
  {
    field: 'Social & Behavioral Sciences',
    match: /sociology|psychology|anthropology|political science|social work|communication|international relations|ethnic studies|asian american studies|asian-pacific studies|asian pacific studies|global and international studies|global studies|international studies|gender,? and sexuality studies|women's,? gender|women's studies|social and cultural analysis/i,
  },
  { field: 'Humanities', match: /history|philosophy|english|literature|linguistics|languages|classics|religio/i },
  { field: 'Arts & Design', match: /\barts?\b|design|music|theat|dance|film|cinema|photograph|architecture/i },
  // 'Misc' has no rule: a department that matches nothing falls through to its own name, which
  // the data test reports so a maintainer can add an explicit rule here.
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
