export const TRACKS = ['Tenure-line', 'Teaching', 'Research', 'Clinical', 'Admin and Staff', 'Emeritus', 'Deceased'] as const;

// Career level only; the track says what kind of appointment it is (a Clinical Assistant Professor
// is rank Assistant Professor on the Clinical track). The exact published title lives on the linked
// profile. Commonwealth Lecturer/Senior Lecturer stay separate instead of being equated with US
// ranks. Leave rank empty when the level isn't known (e.g. an emeritus title with no stated rank).
export const RANKS = ['Assistant Professor', 'Associate Professor', 'Professor', 'Lecturer', 'Senior Lecturer', 'Researcher', 'Librarian', 'Administrator'] as const;

export const INSTITUTION_TYPES = [
  'University',
  'Public research institute',
  'Independent nonprofit research institute',
] as const;

export const HONOR_CATEGORIES = [
  'academy',
  'fellow',
  'career_award',
  'major_award',
  'distinguished_professorship',
] as const;

export const REQUIRED_ROSTER_STRINGS = [
  'id',
  'name',
  'profileUrl',
  'university',
  'city',
  'department',
] as const;

export const ROSTER_FIELDS = [
  ...REQUIRED_ROSTER_STRINGS,
  'directFields',
  'institutionType',
  'websiteUrl',
  'scholarUrl',
  'linkedinUrl',
  'confirmed',
  'state',
  'country',
  'rank',
  'track',
  'vietnameseName',
  'researchAreas',
  'honors',
  'portrait',
  'portraitSource',
  'postdocInstitution',
  'phdInstitution',
  'phdYear',
  'mdInstitution',
  'msInstitution',
  'undergradInstitution',
  'undergradYear',
] as const;

// Only facts the web can't settle stay protected after an owner submission. Appointment facts,
// degrees, and links go stale when people move, so the current official page wins for those.
export const PROTECTABLE_FIELDS = new Set<string>(['name', 'vietnameseName', 'honors', 'portrait', 'portraitSource']);

export const HONOR_FIELDS = ['name', 'organization', 'category', 'year', 'source'] as const;

export const UTC_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export const LOCATIONS: string[] = [
  'US',
  'North America',
  'South America',
  'Africa',
  'Asia',
  'Australasia',
  'Europe',
  'World',
];

export const COUNTRY_TO_CONTINENT: Record<string, string> = {
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
  'Slovakia': 'Europe',
  'Portugal': 'Europe',
  'Greece': 'Europe',
  'Hungary': 'Europe',
  'Estonia': 'Europe',
  'Luxembourg': 'Europe',
  'Iceland': 'Europe',
  'Russia': 'Europe',
  'Russian Federation': 'Europe',

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
  'Brunei': 'Asia',
  'Brunei Darussalam': 'Asia',
  'Macau': 'Asia',

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

export const COUNTRY_FLAGS: Record<string, string> = {
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
  'Czech Republic': '🇨🇿',
  'Slovakia': '🇸🇰',
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
  'Hungary': '🇭🇺',
  'Luxembourg': '🇱🇺',
  'Russia': '🇷🇺',
  'Russian Federation': '🇷🇺',
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
  'Brunei': '🇧🇳',
  'Brunei Darussalam': '🇧🇳',
  'Macau': '🇲🇴',
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

export const LOCATION_LABELS: Record<string, string> = {
  'US': '🇺🇸 United States',
  'North America': '🌎 North America',
  'South America': '🌎 South America',
  'Europe': '🌍 Europe',
  'Australasia': '🌏 Australasia',
  'Asia': '🌏 Asia',
  'Africa': '🌍 Africa',
  'World': '🌐 World',
};
