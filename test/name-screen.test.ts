import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { screenVietnameseName } from '../scripts/name-screen.ts';

// Rejected after the 2026-11-09 audit of bulk batches #1042, #1043 and #1048-#1059.
const NON_VIETNAMESE: [string, string?][] = [
  ['Dao‐Xin Yao'],
  ['Dao‐Fu Dai'],
  ['Liang Dao Zhou'],
  ['Dao Zhou'],
  ['Chong‐Dao Lee'],
  ['Dao‐Yuan Tan'],
  ['Wai‐Meng Quach'],
  ['Vera Ling Hui Phung'],
  ['Do‐Hwan Nam', 'United States'],
  ['Ho Kyung Ha', 'South Korea'],
  ['Gwang Ha Kim', 'South Korea'],
  ['Chin‐Hung Lai', 'Taiwan'],
  ['Yiu‐Wing Mai', 'Hong Kong'],
  ['Gerald Ngo Teke', 'Cameroon'],
  // Owner ruling 2026-11-10 (#1047): Gaelic Mac surnames and Mac given names/nicknames.
  ['Ralph Mac Nally', 'Australia'],
  ['Ciarán Mac an Bhaird', 'Ireland'],
  ['Naoíse Mac Sweeney'],
  ['James Mac Hyman'],
  ['J. Mac McCullough'],
  ['Mac H. Alford'],
  ['Mac Gaunaa', 'Denmark'],
  // Owner rulings 2026-11-10: retired from the Codex audit of #1044-#1048.
  ['Chong-Wah Ngo', 'Singapore'],
  ['Jacky Chi-Ki Ngo', 'Hong Kong'],
  ['Chia-Wei Phan', 'Malaysia'],
  ['Gavin Bui', 'Hong Kong'],
  ['Cristy Grace Ngo', 'Philippines'],
  ['Sang-Do Ha', 'South Korea'],
  ['Do Sang Kim', 'South Korea'],
  ['Liqiang Mai', 'China'],
  ['Gengchen Mai', 'United States'],
  ['Mai Har Sham', 'Hong Kong'],
  ['Volker Mai', 'United States'],
  ['Juliane Mai', 'Canada'],
  ['Mai M. Khalaf', 'Saudi Arabia'],
  ['Ken Mai', 'United States'],
  ['Rosa Schiano-Phan', 'United Kingdom'],
  ['Kaylon L. Bruner-Tran'],
  ['Erin (Misty) Paig-Tran'],
  ['Sophie Selby-Pham', 'Australia'],
];

// Real roster members and accepted candidates, including the shapes the screen must not reject:
// Western given names with shared surnames, hyphenated Vietnamese given names, and Vietnamese
// faculty in East Asia.
const VIETNAMESE: [string, string?][] = [
  ['Ryan Doan'],
  ['Wendy Quach'],
  ['Kevin Le'],
  ['Mai-Linh Doan'],
  ['Hai-Dang Nguyen'],
  ['Thuy-Duong Vuong'],
  ['Nu-Anh Tran'],
  ['Thanh Le-Cong'],
  ['Howard Cam Luong', 'Hong Kong'],
  ['Trang Dang', 'Taiwan'],
  ['Yen Do', 'Taiwan'],
  ['Son Tung Ha', 'Singapore'],
  ['Tat Dat Bui', 'Taiwan'],
  ['Thi Kim Tuoi Truong', 'Japan'],
  ['Mac Van Nam'],
  ['Mac Thi Hoa'],
  ['Kevin Mac'],
  ['Hoa Thi Mac'],
  ['Mai Anh Nguyen'],
  ['Thi Mai Pham'],
  ['Viann N. Nguyen-Feng'],
  ['Johannes Tran-Gia'],
  ['Hoa Briscoe-Tran'],
  ['Felice Le-Scherban'],
  ['Thanh Le-Cong'],
  ['Que-Lam Huynh'],
  ['Van Schepler-Luu', 'Philippines'],
];

test('the name screen rejects high-confidence non-Vietnamese names', () => {
  for (const [name, country] of NON_VIETNAMESE) {
    assert.equal(screenVietnameseName(name, country).likely, false, name);
  }
});

test('the name screen keeps Vietnamese and ambiguous-but-plausible names', () => {
  for (const [name, country] of VIETNAMESE) {
    assert.equal(screenVietnameseName(name, country).likely, true, name);
  }
});

test('the name screen keeps at least 99.5% of current roster names', () => {
  const roster = JSON.parse(readFileSync(new URL('../public/data.json', import.meta.url), 'utf8'));
  const rejected = roster.filter(
    (entry: { name: string; country?: string }) =>
      !screenVietnameseName(entry.name, entry.country).likely,
  );
  assert.ok(
    rejected.length / roster.length <= 0.005,
    `${rejected.length} roster names rejected: ${rejected.map((e: { name: string }) => e.name).join(', ')}`,
  );
});
