// Vietnamese labels for the generated /vi/ pages. Proper names (people, universities,
// departments, honors) stay as published; only the site's own categories and wording are
// translated. Anything missing from a map falls back to the English value, so a new country
// or field never breaks the build.
import { displayUniversity, type RosterEntry } from './data.ts';

export type Lang = 'en' | 'vi';

export const FIELD_VI: Record<string, string> = {
  'Agricultural & Natural Resource Sciences': 'Nông nghiệp & Tài nguyên thiên nhiên',
  'Arts & Design': 'Nghệ thuật & Thiết kế',
  'Biological & Biomedical Sciences': 'Sinh học & Y sinh',
  'Business & Economics': 'Kinh doanh & Kinh tế',
  Chemistry: 'Hóa học',
  'Computer & Information Sciences': 'Khoa học máy tính & Thông tin',
  'Earth & Environmental Sciences': 'Khoa học Trái Đất & Môi trường',
  Education: 'Giáo dục',
  Engineering: 'Kỹ thuật',
  'Health Sciences': 'Khoa học sức khỏe',
  Humanities: 'Khoa học nhân văn',
  'Law & Public Affairs': 'Luật & Chính sách công',
  Mathematics: 'Toán học',
  'Physics & Astronomy': 'Vật lý & Thiên văn học',
  'Social & Behavioral Sciences': 'Khoa học xã hội & hành vi',
  'Statistics & Data Science': 'Thống kê & Khoa học dữ liệu',
  Others: 'Lĩnh vực khác',
};

export const PLACE_VI: Record<string, string> = {
  'North America': 'Bắc Mỹ',
  Europe: 'châu Âu',
  Australasia: 'Úc & châu Đại Dương',
  Asia: 'châu Á',
  'South America': 'Nam Mỹ',
  Africa: 'châu Phi',
  Australia: 'Úc',
  Austria: 'Áo',
  Belgium: 'Bỉ',
  Brazil: 'Brazil',
  Brunei: 'Brunei',
  Canada: 'Canada',
  Chile: 'Chile',
  China: 'Trung Quốc',
  'Czech Republic': 'Cộng hòa Séc',
  Denmark: 'Đan Mạch',
  Finland: 'Phần Lan',
  France: 'Pháp',
  Germany: 'Đức',
  'Hong Kong': 'Hồng Kông',
  Hungary: 'Hungary',
  Iceland: 'Iceland',
  India: 'Ấn Độ',
  Ireland: 'Ireland',
  Israel: 'Israel',
  Italy: 'Ý',
  Japan: 'Nhật Bản',
  Kazakhstan: 'Kazakhstan',
  Luxembourg: 'Luxembourg',
  Macau: 'Ma Cao',
  Malaysia: 'Malaysia',
  Mexico: 'Mexico',
  Netherlands: 'Hà Lan',
  'New Zealand': 'New Zealand',
  Norway: 'Na Uy',
  Philippines: 'Philippines',
  Poland: 'Ba Lan',
  Portugal: 'Bồ Đào Nha',
  Qatar: 'Qatar',
  Russia: 'Nga',
  'Saudi Arabia': 'Ả Rập Xê Út',
  Singapore: 'Singapore',
  Slovakia: 'Slovakia',
  'South Africa': 'Nam Phi',
  'South Korea': 'Hàn Quốc',
  Spain: 'Tây Ban Nha',
  Sweden: 'Thụy Điển',
  Switzerland: 'Thụy Sĩ',
  Taiwan: 'Đài Loan',
  Thailand: 'Thái Lan',
  'Trinidad and Tobago': 'Trinidad và Tobago',
  Turkey: 'Thổ Nhĩ Kỳ',
  'United Arab Emirates': 'Các Tiểu vương quốc Ả Rập Thống nhất',
  'United Kingdom': 'Vương quốc Anh',
  'United States': 'Mỹ',
};

export const TRACK_VI: Record<string, string> = {
  'Tenure-line': 'Biên chế (tenure)',
  Teaching: 'Giảng dạy',
  Research: 'Nghiên cứu',
  Clinical: 'Lâm sàng',
  'Admin and Staff': 'Quản lý & nhân viên',
  Emeritus: 'Danh dự (emeritus)',
  Deceased: 'Đã mất',
  'Industry Research': 'Nghiên cứu công nghiệp',
  'Policy & Think Tank': 'Chính sách & viện nghiên cứu',
  'Government & Defense': 'Chính phủ & quốc phòng',
};

export const INSTITUTION_TYPE_VI: Record<string, string> = {
  'Public research institute': 'Viện nghiên cứu công',
  'Independent nonprofit research institute': 'Viện nghiên cứu phi lợi nhuận',
  'Corporate research lab': 'Phòng nghiên cứu doanh nghiệp',
  'Policy & international organization': 'Tổ chức chính sách & quốc tế',
  'Think tank': 'Viện chính sách (think tank)',
  'Government & defense': 'Chính phủ & quốc phòng',
  'National laboratory': 'Phòng thí nghiệm quốc gia',
};

const RANK_VI: Record<string, string> = {
  'Assistant Professor': 'Trợ lý Giáo sư',
  'Associate Professor': 'Phó Giáo sư',
  Professor: 'Giáo sư',
  Lecturer: 'Giảng viên',
  'Senior Lecturer': 'Giảng viên cao cấp',
  Researcher: 'Nhà nghiên cứu',
  Librarian: 'Cán bộ thư viện',
  Administrator: 'Cán bộ quản lý',
};

const QUALIFIER_VI: Record<string, string> = {
  Teaching: 'giảng dạy',
  Clinical: 'lâm sàng',
  Research: 'nghiên cứu',
};

export const fieldVi = (field: string) => FIELD_VI[field] ?? field;
export const placeVi = (place: string) => PLACE_VI[place] ?? place;
export const trackVi = (track: string) => TRACK_VI[track] ?? track;
export const institutionTypeVi = (type: string) => INSTITUTION_TYPE_VI[type] ?? type;

// Mirrors canonicalRank in data.ts: the career level, qualified by a Teaching, Clinical, or
// Research track, or "danh dự" for Emeritus.
export function rankVi(person: Pick<RosterEntry, 'track' | 'rank'>): string | undefined {
  const { rank, track } = person;
  const base = rank ? (RANK_VI[rank] ?? rank) : undefined;
  if (track === 'Emeritus') return base ? `${base} danh dự` : trackVi('Emeritus');
  if (!base) return track ? trackVi(track) : undefined;
  const qualifier = track ? QUALIFIER_VI[track] : undefined;
  if (qualifier && /Professor$/.test(rank ?? '')) return `${base} ${qualifier}`;
  return base;
}

export function educationVi(person: RosterEntry) {
  const withYear = (institution: string, year?: number) =>
    [displayUniversity(institution), year].filter(Boolean).join(', ');
  return [
    person.postdocInstitution && `Sau tiến sĩ: ${displayUniversity(person.postdocInstitution)}`,
    person.phdInstitution && `Tiến sĩ: ${withYear(person.phdInstitution, person.phdYear)}`,
    person.msInstitution && `Thạc sĩ: ${displayUniversity(person.msInstitution)}`,
    person.mdInstitution && `Bác sĩ (MD): ${displayUniversity(person.mdInstitution)}`,
    person.undergradInstitution &&
      `Đại học: ${withYear(person.undergradInstitution, person.undergradYear)}`,
  ].filter(Boolean) as string[];
}

export const REQUESTABLE_FIELDS_VI: Record<string, string> = {
  vietnameseName: 'tên tiếng Việt',
  phdInstitution: 'nơi học tiến sĩ',
  phdYear: 'năm nhận bằng tiến sĩ',
  scholarUrl: 'Google Scholar',
  websiteUrl: 'trang web',
  linkedinUrl: 'LinkedIn',
};

// Translates connectionLabel() output from relationships.ts for display.
const CONNECTION_VI: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Doctoral advisor$/, () => 'Người hướng dẫn tiến sĩ'],
  [/^Doctoral advisee$/, () => 'Nghiên cứu sinh được hướng dẫn'],
  [/^Master's advisor$/, () => 'Người hướng dẫn thạc sĩ'],
  [/^Master's advisee$/, () => 'Học viên thạc sĩ được hướng dẫn'],
  [/^Undergraduate thesis advisor$/, () => 'Người hướng dẫn khóa luận đại học'],
  [/^Undergraduate advisee$/, () => 'Sinh viên được hướng dẫn'],
  [/^Postdoctoral mentor$/, () => 'Người hướng dẫn sau tiến sĩ'],
  [/^Postdoctoral mentee$/, () => 'Nghiên cứu viên sau tiến sĩ được hướng dẫn'],
  [
    /^Grant collaborator · (\d+) shared awards?$/,
    (m) => `Cộng sự dự án tài trợ · ${m[1]} dự án chung`,
  ],
  [
    /^Patent co-inventor · (\d+) shared patents?$/,
    (m) => `Đồng tác giả sáng chế · ${m[1]} bằng sáng chế chung`,
  ],
  [/^Coauthor · (\d+) shared works$/, (m) => `Đồng tác giả · ${m[1]} công trình chung`],
];

export function connectionLabelVi(label: string): string {
  for (const [pattern, render] of CONNECTION_VI) {
    const match = label.match(pattern);
    if (match) return render(match);
  }
  return label;
}
