const TET_DATES = {
  2024: '2024-02-10', 2025: '2025-01-29', 2026: '2026-02-17', 2027: '2027-02-06',
  2028: '2028-01-26', 2029: '2029-02-13', 2030: '2030-02-03', 2031: '2031-01-23',
  2032: '2032-02-11', 2033: '2033-01-31', 2034: '2034-02-19', 2035: '2035-02-08',
  2036: '2036-01-28',
};

const TRUNG_THU_DATES = {
  2024: '2024-09-17', 2025: '2025-10-06', 2026: '2026-09-25', 2027: '2027-09-15',
  2028: '2028-10-03', 2029: '2029-09-22', 2030: '2030-09-12', 2031: '2031-10-01',
  2032: '2032-09-19', 2033: '2033-09-08', 2034: '2034-09-27', 2035: '2035-09-16',
  2036: '2036-10-04',
};

// Lunar 1/15 — first full moon of the lunar year, closing out Tết celebrations.
const NGUYEN_TIEU_DATES = {
  2024: '2024-02-24', 2025: '2025-02-12', 2026: '2026-03-03', 2027: '2027-02-20',
  2028: '2028-02-09', 2029: '2029-02-27', 2030: '2030-02-17', 2031: '2031-02-06',
  2032: '2032-02-25', 2033: '2033-02-14', 2034: '2034-03-05', 2035: '2035-02-22',
  2036: '2036-02-11',
};

// Lunar 5/5 — Tết Đoan Ngọ ("Double Fifth"), a folk mid-year observance.
const DOAN_NGO_DATES = {
  2024: '2024-06-10', 2025: '2025-05-31', 2026: '2026-06-19', 2027: '2027-06-09',
  2028: '2028-05-28', 2029: '2029-06-16', 2030: '2030-06-05', 2031: '2031-06-24',
  2032: '2032-06-12', 2033: '2033-06-01', 2034: '2034-06-20', 2035: '2035-06-10',
  2036: '2036-05-30',
};

// Lunar 7/15 — Vu Lan (Wandering Souls'/filial-piety festival).
const VU_LAN_DATES = {
  2024: '2024-08-18', 2025: '2025-09-06', 2026: '2026-08-27', 2027: '2027-08-16',
  2028: '2028-09-03', 2029: '2029-08-24', 2030: '2030-08-13', 2031: '2031-09-01',
  2032: '2032-08-20', 2033: '2033-08-09', 2034: '2034-08-28', 2035: '2035-08-18',
  2036: '2036-09-05',
};

// Lunar 12/23 — Ông Táo (Kitchen Gods' Day), which always falls in the Gregorian
// year before the Tết it precedes, so this table is keyed by that later year.
const ONG_TAO_DATES = {
  2024: '2024-02-02', 2025: '2025-01-22', 2026: '2026-02-10', 2027: '2027-01-30',
  2028: '2028-01-19', 2029: '2029-02-06', 2030: '2030-01-26', 2031: '2031-01-16',
  2032: '2032-02-04', 2033: '2033-01-23', 2034: '2034-02-11', 2035: '2035-01-31',
  2036: '2036-01-20',
};

function dateForYear(table, year) {
  const value = table[year];
  return value ? new Date(`${value}T00:00:00`) : null;
}

// Limited to widely shared, non-political cultural/community observances.
export function nearestVietnameseHoliday(today) {
  const occurrences = [];
  for (const year of [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1]) {
    const tet = dateForYear(TET_DATES, year);
    if (tet) {
      occurrences.push({ date: tet, emoji: '🧧', before: 10, after: 15, greeting: 'Chúc Mừng Năm Mới — happy Tết (Lunar New Year) from VietProfs!' });
      // Giao Thừa is the New Year's Eve transition itself — the night before Tết day.
      const giaoThua = new Date(tet.getTime() - 86400000);
      occurrences.push({ date: giaoThua, emoji: '🎇', before: 0, after: 0, greeting: 'Chúc mừng Giao Thừa — happy Lunar New Year’s Eve!' });
      // Tất Niên is the year-end family reunion meal, traditionally a day or two
      // before Giao Thừa — placed here at Tết minus 2 days to stay distinct from it.
      const tatNien = new Date(tet.getTime() - 2 * 86400000);
      occurrences.push({ date: tatNien, emoji: '🍲', before: 0, after: 0, greeting: 'Chúc mừng Tất Niên — happy year-end family reunion, closing out the old year together!' });
    }
    const trungThu = dateForYear(TRUNG_THU_DATES, year);
    if (trungThu) occurrences.push({ date: trungThu, emoji: '🥮', before: 7, after: 7, greeting: 'Chúc mừng Trung Thu — happy Mid-Autumn Festival!' });
    const nguyenTieu = dateForYear(NGUYEN_TIEU_DATES, year);
    if (nguyenTieu) occurrences.push({ date: nguyenTieu, emoji: '🏮', before: 2, after: 2, greeting: 'Chúc mừng Tết Nguyên Tiêu — happy Lantern Festival, the first full moon of the lunar year!' });
    const doanNgo = dateForYear(DOAN_NGO_DATES, year);
    if (doanNgo) occurrences.push({ date: doanNgo, emoji: '🐉', before: 2, after: 2, greeting: 'Chúc mừng Tết Đoan Ngọ — happy Double Fifth Festival!' });
    const vuLan = dateForYear(VU_LAN_DATES, year);
    if (vuLan) occurrences.push({ date: vuLan, emoji: '🙏', before: 5, after: 5, greeting: 'Mùa Vu Lan hiếu hạnh — happy Vu Lan, a day of gratitude to parents and ancestors.' });
    const ongTao = dateForYear(ONG_TAO_DATES, year);
    if (ongTao) occurrences.push({ date: ongTao, emoji: '🐠', before: 2, after: 1, greeting: 'Ông Táo về trời — happy Kitchen Gods’ Day, marking the start of Tết preparations!' });
    occurrences.push({
      date: new Date(`${year}-11-20T00:00:00`),
      emoji: '🍎',
      before: 3,
      after: 3,
      greeting: 'Chúc mừng Ngày Nhà giáo Việt Nam — happy Vietnamese Teachers’ Day, and thank you to every professor on this list.',
    });
    occurrences.push({
      date: new Date(`${year}-06-28T00:00:00`),
      emoji: '👨‍👩‍👧‍👦',
      before: 2,
      after: 2,
      greeting: 'Chúc mừng Ngày Gia đình Việt Nam — happy Vietnamese Family Day!',
    });
    occurrences.push({
      date: new Date(`${year}-10-20T00:00:00`),
      emoji: '💐',
      before: 3,
      after: 3,
      greeting: 'Chúc mừng Ngày Phụ nữ Việt Nam — happy Vietnamese Women’s Day!',
    });
  }

  let best = null;
  for (const occurrence of occurrences) {
    const diffDays = Math.round((today - occurrence.date) / 86400000);
    if (diffDays >= -occurrence.before && diffDays <= occurrence.after) {
      const distance = Math.abs(diffDays);
      if (!best || distance < best.distance) best = { ...occurrence, distance };
    }
  }
  return best;
}
