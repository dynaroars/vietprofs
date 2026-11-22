// One name per Vietnamese alma mater. Degree fields store the full official English name
// (`name`); spelling variants, former names and VNU constituent orderings recorded by different
// sources are rewritten to it (scripts/normalize-alma-maters.ts runs before every test). The
// interface shows `short` where Vietnamese students actually use an acronym, with the full name
// on hover and on the school's alumni page. Only unambiguous variants are mapped: a bare
// "Vietnam National University" could be Hanoi or Ho Chi Minh City and stays as recorded.

export interface AlmaMaterInfo {
  name: string;
  short?: string;
  vi?: string;
  variants?: string[];
}

export const ALMA_MATERS: AlmaMaterInfo[] = [
  {
    name: 'Ho Chi Minh City University of Technology',
    short: 'HCMUT',
    vi: 'Trường Đại học Bách khoa, ĐHQG-HCM',
    variants: [
      'ho chi minh university of technology',
      'ho chi minh university of technology, vietnam national university',
      'ho chi minh city university of technology, vietnam national university',
      'ho chi minh city university of technology, vietnam national university ho chi minh city',
      'vietnam national university, ho chi minh city university of technology',
    ],
  },
  {
    name: 'Hanoi University of Science and Technology',
    short: 'HUST',
    vi: 'Đại học Bách khoa Hà Nội',
    variants: [
      'hanoi university of technology',
      'hanoi university of science and technology hanoi',
    ],
  },
  {
    name: 'Vietnam National University, Hanoi',
    short: 'VNU Hanoi',
    vi: 'Đại học Quốc gia Hà Nội',
    variants: ['hanoi national university'],
  },
  {
    name: 'Vietnam National University, Ho Chi Minh City',
    short: 'VNU-HCM',
    vi: 'Đại học Quốc gia TP. Hồ Chí Minh',
    variants: [
      'vietnam national university ho chi minh city',
      'vietnam national university-hochiminh city',
      'national university, ho chi minh city',
    ],
  },
  {
    name: 'University of Science, Vietnam National University Ho Chi Minh City',
    short: 'HCMUS',
    vi: 'Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM',
    variants: [
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
  },
  {
    name: 'VNU University of Science, Hanoi',
    short: 'HUS',
    vi: 'Trường Đại học Khoa học Tự nhiên, ĐHQG Hà Nội',
    variants: [
      'vnu university of science',
      'hanoi university of science',
      'vnu hanoi university of science',
      'vnu hanoi university of science, hanoi',
    ],
  },
  {
    name: 'VNU University of Engineering and Technology',
    short: 'UET',
    vi: 'Trường Đại học Công nghệ, ĐHQG Hà Nội',
    variants: [
      'university of engineering and technology, vietnam national university, hanoi',
      'university of engineering and technology, vietnam national university hanoi',
    ],
  },
  {
    name: 'Foreign Trade University',
    short: 'FTU',
    vi: 'Trường Đại học Ngoại thương',
    variants: ['foreign trade university, ho chi minh city campus'],
  },
  {
    name: 'National Economics University',
    short: 'NEU',
    vi: 'Trường Đại học Kinh tế Quốc dân',
    variants: ['national economics university of vietnam'],
  },
  {
    name: 'Hanoi National University of Education',
    short: 'HNUE',
    vi: 'Trường Đại học Sư phạm Hà Nội',
  },
  {
    name: 'Ho Chi Minh City University of Education',
    short: 'HCMUE',
    vi: 'Trường Đại học Sư phạm TP. Hồ Chí Minh',
    variants: ['ho chi minh university of pedagogy', 'ho chi minh city university of pedagogy'],
  },
  {
    name: 'University of Economics Ho Chi Minh City',
    short: 'UEH',
    vi: 'Trường Đại học Kinh tế TP. Hồ Chí Minh',
    variants: [
      'university of economics - ho chi minh city',
      'ho chi minh city university of economics',
    ],
  },
  {
    name: 'University of Medicine and Pharmacy at Ho Chi Minh City',
    short: 'UMP HCMC',
    vi: 'Đại học Y Dược TP. Hồ Chí Minh',
    variants: [
      'ho chi minh city university of medicine and pharmacy',
      'university of medicine and pharmacy, ho chi minh city',
    ],
  },
  {
    name: 'Ho Chi Minh City University of Technology and Education',
    short: 'HCMUTE',
    vi: 'Trường Đại học Sư phạm Kỹ thuật TP. Hồ Chí Minh',
  },
  {
    name: 'Ho Chi Minh City University of Architecture',
    short: 'UAH',
    vi: 'Trường Đại học Kiến trúc TP. Hồ Chí Minh',
    variants: [
      'university of architecture, ho chi minh city',
      'university of architecture ho chi minh city',
    ],
  },
  {
    name: 'Hanoi University of Civil Engineering',
    short: 'HUCE',
    vi: 'Trường Đại học Xây dựng Hà Nội',
    variants: ['national university of civil engineering'],
  },
  {
    name: 'Danang University of Science and Technology',
    short: 'DUT',
    vi: 'Trường Đại học Bách khoa, Đại học Đà Nẵng',
    variants: [
      'danang university of technology',
      'university of science and technology, the university of danang',
      'the university of danang – university of science and technology',
      'university of danang - university of science and technology',
      'the university of danang - university of science and technology',
      'the university of danang, university of science and technology',
    ],
  },
  { name: 'Hanoi Medical University', short: 'HMU', vi: 'Trường Đại học Y Hà Nội' },
  { name: 'Hanoi University of Pharmacy', short: 'HUP', vi: 'Trường Đại học Dược Hà Nội' },
  { name: 'Hanoi Architectural University', short: 'HAU', vi: 'Trường Đại học Kiến trúc Hà Nội' },
  {
    name: 'Hanoi University',
    short: 'HANU',
    vi: 'Trường Đại học Hà Nội',
    variants: [
      'hanoi university, hanoi',
      'hanoi foreign studies university',
      'hanoi university of foreign studies',
    ],
  },
  { name: 'Diplomatic Academy of Vietnam', short: 'DAV', vi: 'Học viện Ngoại giao' },
  { name: 'Banking Academy of Vietnam', short: 'BAV', vi: 'Học viện Ngân hàng' },
  {
    name: 'Vietnam National University of Agriculture',
    short: 'VNUA',
    vi: 'Học viện Nông nghiệp Việt Nam',
  },
  {
    name: 'Thuyloi University',
    short: 'TLU',
    vi: 'Trường Đại học Thủy lợi',
    variants: ['water resources university'],
  },
  {
    name: 'University of Transport and Communications',
    short: 'UTC',
    vi: 'Trường Đại học Giao thông Vận tải',
  },
  {
    name: 'Nong Lam University - Ho Chi Minh City',
    short: 'NLU',
    vi: 'Trường Đại học Nông Lâm TP. Hồ Chí Minh',
  },
  {
    name: 'Thai Nguyen University of Technology',
    short: 'TNUT',
    vi: 'Trường Đại học Kỹ thuật Công nghiệp, Đại học Thái Nguyên',
  },
  {
    name: 'VNU University of Social Sciences and Humanities, Hanoi',
    short: 'USSH',
    vi: 'Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG Hà Nội',
    variants: ['university of social sciences and humanities, vietnam national university, hanoi'],
  },
  {
    name: 'University of Social Sciences and Humanities, Vietnam National University Ho Chi Minh City',
    short: 'HCMUSSH',
    vi: 'Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG-HCM',
    variants: [
      'ho chi minh city university of social sciences and humanities',
      'university of social sciences and humanities, ho chi minh city',
    ],
  },
  {
    name: 'University of Information Technology, Vietnam National University Ho Chi Minh City',
    short: 'UIT',
    vi: 'Trường Đại học Công nghệ Thông tin, ĐHQG-HCM',
    variants: [
      'vietnam national university ho chi minh city, university of information technology',
    ],
  },
  {
    name: 'International University, Vietnam National University Ho Chi Minh City',
    short: 'HCMIU',
    vi: 'Trường Đại học Quốc tế, ĐHQG-HCM',
  },
  {
    name: 'Banking University of Ho Chi Minh City',
    short: 'BUH',
    vi: 'Trường Đại học Ngân hàng TP. Hồ Chí Minh',
    variants: ['ho chi minh city university of banking'],
  },
  {
    name: 'Academy of Finance',
    short: 'AOF',
    vi: 'Học viện Tài chính',
    variants: ['hanoi academy of finance'],
  },
  {
    name: 'University of Science and Technology of Hanoi',
    short: 'USTH',
    vi: 'Trường Đại học Khoa học và Công nghệ Hà Nội',
  },
  { name: 'Vietnam Maritime University', short: 'VMU', vi: 'Trường Đại học Hàng hải Việt Nam' },
  {
    name: 'Hue University of Sciences',
    vi: 'Trường Đại học Khoa học, Đại học Huế',
    variants: ['university of sciences, hue university'],
  },
  { name: 'Can Tho University', vi: 'Trường Đại học Cần Thơ' },
  { name: 'Hue University', vi: 'Đại học Huế' },
  { name: 'University of Saigon', vi: 'Viện Đại học Sài Gòn' },
  {
    name: 'Quy Nhon University',
    vi: 'Trường Đại học Quy Nhơn',
    variants: ['university of quy nhon'],
  },
  { name: 'Nha Trang University', vi: 'Trường Đại học Nha Trang' },
  { name: 'Dalat University', vi: 'Trường Đại học Đà Lạt', variants: ['da lat university'] },
  {
    name: 'Vietnam Academy of Science and Technology',
    short: 'VAST',
    vi: 'Viện Hàn lâm Khoa học và Công nghệ Việt Nam',
  },
];

const VIETNAMESE_PLACE =
  /\b(viet ?nam|vnu|hanoi|ho chi minh|saigon|can tho|hue|da ?nang|quy nhon|da ?lat|thai nguyen|vinh|nha trang|hai phong)\b/i;

const LOOKUP = new Map<string, AlmaMaterInfo>();
const BY_SHORT = new Map<string, AlmaMaterInfo>();
for (const info of ALMA_MATERS) {
  LOOKUP.set(info.name.toLowerCase(), info);
  for (const variant of info.variants ?? []) LOOKUP.set(variant, info);
  if (info.short) BY_SHORT.set(info.short.toLowerCase(), info);
}

function aliasKey(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*viet ?nam$/i, '')
    .trim()
    .toLowerCase();
}

/** The canonical spelling of a degree institution; unmapped names come back trimmed. */
export function canonicalAlmaMater(name: string): string;
export function canonicalAlmaMater(name: string | undefined): string | undefined;
export function canonicalAlmaMater(name: string | undefined): string | undefined {
  if (!name?.trim()) return name;
  const mapped = LOOKUP.get(aliasKey(name));
  if (mapped) return mapped.name;
  const cleaned = name.trim().replace(/\s+/g, ' ');
  // "Can Tho University, Vietnam" and "Can Tho University" are one school; keep the country
  // only when the rest of the name would no longer say where it is.
  const stripped = cleaned.replace(/\s*,\s*viet ?nam$/i, '');
  return stripped !== cleaned && VIETNAMESE_PLACE.test(stripped) ? stripped : cleaned;
}

/** Metadata for a known Vietnamese alma mater, by any recorded spelling or its acronym. */
export function almaMaterInfo(name: string | undefined): AlmaMaterInfo | undefined {
  if (!name?.trim()) return undefined;
  return LOOKUP.get(aliasKey(name)) ?? BY_SHORT.get(name.trim().toLowerCase());
}

/** The label to show: the acronym students use when there is one, else the full name. */
export function almaMaterLabel(name: string): string {
  return almaMaterInfo(name)?.short ?? canonicalAlmaMater(name);
}

/** Extra search terms for a degree institution, so "Trained: HCMUS" finds every spelling. */
export function almaMaterSearchTerms(name: string | undefined): string[] {
  const info = almaMaterInfo(name);
  return info ? [info.name, info.short, info.vi].filter((v): v is string => Boolean(v)) : [];
}

/** Static alumni page path, keyed by acronym when the school has one. */
export function almaMaterPath(name: string): string {
  const info = almaMaterInfo(name);
  const base = (info?.short ?? canonicalAlmaMater(name))
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `alumni/${base}.html`;
}
