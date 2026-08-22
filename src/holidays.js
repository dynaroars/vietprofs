const TET_DATES = {
  2024: '2024-02-10', 2025: '2025-01-29', 2026: '2026-02-17', 2027: '2027-02-06',
  2028: '2028-01-26', 2029: '2029-02-13', 2030: '2030-02-03', 2031: '2031-01-23',
  2032: '2032-02-11', 2033: '2033-01-31', 2034: '2034-02-19', 2035: '2035-02-08',
  2036: '2036-01-28',
};

const TRUNG_THU_DATES = {
  2024: '2024-09-17', 2025: '2025-10-06', 2026: '2026-09-25', 2027: '2027-09-15',
  2028: '2028-10-03', 2029: '2029-09-22',
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
    if (tet) occurrences.push({ date: tet, emoji: '🧧', before: 10, after: 15, greeting: 'Chúc Mừng Năm Mới — happy Tết (Lunar New Year) from VietProfs!' });
    const trungThu = dateForYear(TRUNG_THU_DATES, year);
    if (trungThu) occurrences.push({ date: trungThu, emoji: '🥮', before: 7, after: 7, greeting: 'Chúc mừng Trung Thu — happy Mid-Autumn Festival!' });
    occurrences.push({
      date: new Date(`${year}-11-20T00:00:00`),
      emoji: '🍎',
      before: 3,
      after: 3,
      greeting: 'Chúc mừng Ngày Nhà giáo Việt Nam — happy Vietnamese Teachers’ Day, and thank you to every professor on this list.',
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
