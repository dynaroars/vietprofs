// Vietnamese-name screen for discovery leads (ROSTER_MAINTENANCE.md "Using a Vietnamese-name
// lexicon safely"). It is a noise filter for bulk name sweeps, not a conclusion about anyone's
// heritage: a screened-out lead with other evidence (a Vietnamese bio, a Vietnamese degree) can
// still be proposed by hand. Tuned on the audited bulk batches #1042/#1043 (2026-11-09), where
// surname-only matches on Doan, Phung, Quach and Dao were mostly Irish, Hakka, Thai, Macanese or
// Chinese names.
import { nameTokens } from '../src/identity.ts';

// Surnames that are rarely anything but Vietnamese in romanized form.
const STRONG_SURNAMES = new Set([
  'nguyen',
  'tran',
  'pham',
  'huynh',
  'truong',
  'ngo',
  'trinh',
  'nghiem',
  'trieu',
  'vuong',
  'bui',
  'phan',
  'vo',
  'vu',
  'dinh',
  'hoang',
  'duong',
  'luong',
  'kieu',
]);

// Vietnamese surnames shared with other naming traditions (Irish Doan, Hakka/Thai Phung,
// Cantonese Quach/Lam/Ho, Chinese given-name Dao, Korean Do, French Le, ...). They need a
// Vietnamese given or middle name before a lead counts.
const WEAK_SURNAMES = new Set([
  'doan',
  'phung',
  'quach',
  'dao',
  'mai',
  'le',
  'do',
  'dang',
  'ho',
  'lam',
  'ha',
  'ta',
  'to',
  'tu',
  'chu',
  'cao',
  'thai',
  'ly',
  'lai',
  'luu',
  'mac',
  'khau',
  'giap',
  'diep',
  'thach',
  'nham',
  'la',
  'lu',
  'au',
  'ton',
  'that',
]);

const VIET_GIVEN_TOKENS = new Set([
  'an',
  'anh',
  'bach',
  'bao',
  'bich',
  'binh',
  'cam',
  'canh',
  'chau',
  'chi',
  'chinh',
  'cuong',
  'danh',
  'dat',
  'diem',
  'dien',
  'diep',
  'dinh',
  'duc',
  'dung',
  'duong',
  'duy',
  'dzung',
  'giang',
  'ha',
  'hai',
  'han',
  'hang',
  'hanh',
  'hao',
  'hau',
  'hien',
  'hiep',
  'hieu',
  'hoa',
  'hoai',
  'hoan',
  'hoang',
  'hong',
  'hue',
  'hung',
  'huong',
  'huu',
  'huy',
  'huyen',
  'kha',
  'khai',
  'khang',
  'khanh',
  'khiem',
  'khoa',
  'khoi',
  'khue',
  'khuong',
  'kien',
  'kiet',
  'kim',
  'lan',
  'lien',
  'linh',
  'loan',
  'loc',
  'long',
  'luan',
  'mai',
  'manh',
  'minh',
  'my',
  'nam',
  'nga',
  'ngan',
  'nghia',
  'ngoc',
  'nguyet',
  'nhan',
  'nhat',
  'nhu',
  'nhung',
  'oanh',
  'phat',
  'phi',
  'phong',
  'phu',
  'phuc',
  'phung',
  'phuoc',
  'phuong',
  'quan',
  'quang',
  'quoc',
  'quy',
  'quyen',
  'quynh',
  'sang',
  'son',
  'tai',
  'tam',
  'tan',
  'tat',
  'thai',
  'thang',
  'thanh',
  'thao',
  'thi',
  'thoa',
  'thien',
  'thinh',
  'tho',
  'thu',
  'thuan',
  'thuc',
  'thuong',
  'thuy',
  'tien',
  'tin',
  'toan',
  'trang',
  'tri',
  'triet',
  'trinh',
  'trong',
  'trung',
  'truc',
  'tu',
  'tuan',
  'tung',
  'tuoi',
  'tuong',
  'tuyen',
  'tuyet',
  'uyen',
  'van',
  'viet',
  'vinh',
  'vy',
  'xuan',
  'yen',
]);

// Chinese and Korean family names; a lead ending in one of these is not a Vietnamese name unless
// it also starts with a Vietnamese surname (surname-first order).
const CHINESE_KOREAN_SURNAMES = new Set([
  'zhang',
  'wang',
  'li',
  'liu',
  'chen',
  'yang',
  'huang',
  'wu',
  'zhou',
  'xu',
  'sun',
  'ma',
  'zhu',
  'hu',
  'guo',
  'he',
  'gao',
  'lin',
  'zheng',
  'xie',
  'song',
  'tang',
  'yao',
  'jin',
  'qin',
  'dai',
  'zhao',
  'qian',
  'kong',
  'pan',
  'cai',
  'feng',
  'dong',
  'cheng',
  'yuan',
  'zeng',
  'lee',
  'park',
  'choi',
  'jung',
  'kang',
  'cho',
  'yoon',
  'jang',
  'lim',
  'oh',
  'seo',
  'shin',
  'kwon',
  'hwang',
  'ahn',
  'moon',
  'bae',
  'baek',
  'ko',
  'yoo',
  'lau',
  'yim',
  'chua',
  'goh',
  'teo',
  'ng',
  'leung',
  'wong',
  'chan',
  'cheung',
  'tsang',
  'yeung',
  'kwok',
  'fung',
  'chow',
  'tan',
]);

export type NameScreen = { likely: boolean; reason: string };

// Chinese (pinyin) and Korean (Revised Romanization) syllable shapes, plus common Wade-Giles,
// Cantonese and Malaysian spellings. Vietnamese written without diacritics overlaps with these
// ("mai", "lan", "ha", "do", "son"), so a token only counts as Chinese/Korean when it is not
// also a Vietnamese name token.
const PINYIN =
  /^(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?(?:a|o|e|i|u|v|ai|ei|ao|ou|an|en|ang|eng|ong|er|ia|ie|iao|iu|ian|in|iang|ing|iong|ua|uo|uai|ui|uan|un|uang|ue)$/;
const KOREAN =
  /^(?:kk|tt|pp|ss|jj|ch|[gknbdrlmsjhtpy])?(?:a|ae|ya|yae|eo|e|yeo|ye|o|wa|wae|oe|yo|u|wo|we|wi|yu|eu|ui|i|oo|ee|ou|oo)(?:k|n|t|l|m|p|ng)?$/;
const OTHER_CJK_SYLLABLES = new Set([
  'jiunn',
  'chiun',
  'wai',
  'wah',
  'kam',
  'wing',
  'yiu',
  'fai',
  'hoi',
  'chee',
  'keong',
  'siew',
  'hock',
  'boon',
  'kok',
  'yew',
  'choon',
  'kwok',
  'hsin',
  'hsiao',
  'tzu',
  'tsung',
  'chih',
  'chung',
  'hsu',
  'shiee',
  'shan',
  'sik',
  'hee',
  'hyun',
  'kyung',
  'seung',
  'byeong',
  'yeon',
  'jae',
]);
const ALL_SURNAMES = new Set([...STRONG_SURNAMES, ...WEAK_SURNAMES]);
const isVietToken = (t: string) => VIET_GIVEN_TOKENS.has(t) || ALL_SURNAMES.has(t);
const cjkShaped = (t: string) => PINYIN.test(t) || KOREAN.test(t) || OTHER_CJK_SYLLABLES.has(t);
// A Vietnamese name token that pinyin and Korean romanization cannot spell (Thanh, Nguyen,
// Phuong, Linh, Anh): strong evidence even at an East Asian institution.
const vietOnly = (t: string) => isVietToken(t) && !cjkShaped(t);
const cjkNotViet = (t: string) => !isVietToken(t) && cjkShaped(t);

// Countries where shared surnames (Ha, Do, Lai, Mai, Ngo, Ly, ...) usually belong to Korean,
// Chinese, Taiwanese or Cameroonian names.
const EAST_ASIA = new Set([
  'south korea',
  'korea',
  'republic of korea',
  'china',
  'taiwan',
  'hong kong',
  'macau',
  'macao',
  'singapore',
  'malaysia',
  'kr',
  'cn',
  'tw',
  'hk',
  'mo',
  'sg',
  'my',
]);
const AFRICA = new Set(['cameroon', 'nigeria', 'ghana', 'gabon', 'cm', 'ng', 'gh', 'ga']);

function normalizedParts(name: string): string[] {
  return name
    .split(' - ')[0]
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[‐-―−]/g, '-')
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z-]/g, ''))
    .filter(Boolean);
}

// Rejects only high-confidence non-Vietnamese patterns. A Western given name with a shared
// surname (Ryan Doan, Wendy Quach, Kevin Le) passes: the roster has many such members, so those
// leads need the usual appointment check, not a name rejection. `country` is the candidate's
// institution country, when known.
export function screenVietnameseName(name: string, country?: string): NameScreen {
  const tokens = nameTokens(name.replace(/[‐-―−]/g, '-'));
  if (tokens.length < 2) return { likely: true, reason: 'single-token name (not screened)' };
  const parts = normalizedParts(name);
  const strong = tokens.find((t) => STRONG_SURNAMES.has(t));
  const shared = tokens.find((t) => WEAK_SURNAMES.has(t));
  const given = tokens.filter((t) => t !== strong && t !== shared);
  const givenVietOnly = given.some(vietOnly);
  const givenViet = given.filter((t) => VIET_GIVEN_TOKENS.has(t));
  const givenCjk = given.filter(cjkNotViet);
  const last = tokens[tokens.length - 1];
  const where = (country ?? '').trim().toLowerCase();

  // A hyphenated given name made only of Chinese/Korean syllables ("Dao-Xin", "Wai-Meng",
  // "Sang-Do"), in a name with no Vietnamese-only token elsewhere. Vietnamese hyphenated names
  // ("Thuy-Duong", "Hai-Dang") never contain a Chinese/Korean-shaped syllable that is not also
  // Vietnamese.
  for (const part of parts.filter((p) => p.includes('-'))) {
    const pieces = part.split('-').filter(Boolean);
    if (pieces.length < 2 || pieces.some((p) => p.length > 7)) continue;
    if (tokens.some((t) => !pieces.includes(t) && vietOnly(t))) continue;
    if (
      pieces.every((p) => isVietToken(p) || cjkShaped(p)) &&
      pieces.some(cjkNotViet) &&
      !pieces.some(vietOnly)
    ) {
      return { likely: false, reason: `Chinese/Korean-style hyphenated given name "${part}"` };
    }
  }

  if (CHINESE_KOREAN_SURNAMES.has(last) && !strong && !givenVietOnly) {
    return { likely: false, reason: `Chinese/Korean surname "${last}"` };
  }
  if (!strong && !givenVietOnly && givenCjk.length >= 2) {
    return { likely: false, reason: 'Chinese/Korean-style given names' };
  }
  if (EAST_ASIA.has(where) && !strong && !givenVietOnly && givenCjk.length > 0) {
    return {
      likely: false,
      reason: `Chinese/Korean-style given name "${givenCjk[0]}" at an institution in ${country}`,
    };
  }
  // "Ngo" is also a Cameroonian name element ("Valentina Josiane Ngo Bitoungui").
  if (AFRICA.has(where) && givenViet.length === 0) {
    return { likely: false, reason: `no Vietnamese given name at an institution in ${country}` };
  }

  if (strong) return { likely: true, reason: `Vietnamese surname "${strong}"` };
  if (shared && givenViet.length > 0) {
    return {
      likely: true,
      reason: `surname "${shared}" with Vietnamese given name "${givenViet[0]}"`,
    };
  }
  if (shared) return { likely: true, reason: `shared surname "${shared}"; heritage unverified` };
  if (givenViet.length > 0)
    return { likely: true, reason: `Vietnamese given name "${givenViet[0]}"` };
  return { likely: false, reason: 'no Vietnamese name token' };
}

export function isLikelyVietnameseName(name: string, country?: string): boolean {
  return screenVietnameseName(name, country).likely;
}
