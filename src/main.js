import './style.css';
import { loadRoster, uniqueStates, uniqueDepartments, FIELDS, fieldOf, filterRoster, sortRoster, buildFunFacts } from './data.js';
import { escapeHtml } from './utils.js';

// Sentinel field-select value for the "show me something interesting" view. Distinct from any
// real FIELDS entry (all of which are "Word & Word"-style names) and from 'all'.
const INTERESTING = 'interesting';

// The dropdown drops the generic trailing "Sciences" from labels ("Health Sciences" -> "Health")
// to keep the list scannable; "Data Science" is an official field name in its own right and is
// deliberately untouched since \bSciences\b only matches the plural. The underlying FIELDS value
// (used for filtering/URLs/classification) is never altered — only what's displayed is shortened.
function fieldDropdownLabel(field) {
  return field.replace(/\bSciences\b/g, '').replace(/\s+/g, ' ').trim();
}

// Gregorian dates for Tết Nguyên Đán (Lunar New Year), sourced from published Vietnamese-calendar
// converters. Extend this table as years pass; if the current year (or its neighbors) is missing,
// the holiday banner simply doesn't show one for it.
const TET_DATES = {
  2024: '2024-02-10', 2025: '2025-01-29', 2026: '2026-02-17', 2027: '2027-02-06',
  2028: '2028-01-26', 2029: '2029-02-13', 2030: '2030-02-03', 2031: '2031-01-23',
  2032: '2032-02-11', 2033: '2033-01-31', 2034: '2034-02-19', 2035: '2035-02-08',
  2036: '2036-01-28',
};

// Gregorian dates for Tết Trung Thu (Mid-Autumn / Moon Festival).
const TRUNG_THU_DATES = {
  2024: '2024-09-17', 2025: '2025-10-06', 2026: '2026-09-25', 2027: '2027-09-15',
  2028: '2028-10-03', 2029: '2029-09-22',
};

function dateForYear(table, year) {
  const s = table[year];
  return s ? new Date(`${s}T00:00:00`) : null;
}

// Deliberately limited to non-political, widely-shared cultural/community observances — no
// government-designated national holidays. Returns the single nearest one that `today` falls
// within the display window of, or null if none currently apply.
function nearestVietnameseHoliday(today) {
  const occurrences = [];
  for (const year of [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1]) {
    const tet = dateForYear(TET_DATES, year);
    if (tet) {
      occurrences.push({
        date: tet,
        emoji: '🧧',
        before: 10,
        after: 15,
        greeting: 'Chúc Mừng Năm Mới — happy Tết (Lunar New Year) from VietProfs!',
      });
    }
    const trungThu = dateForYear(TRUNG_THU_DATES, year);
    if (trungThu) {
      occurrences.push({
        date: trungThu,
        emoji: '🥮',
        before: 7,
        after: 7,
        greeting: 'Chúc mừng Trung Thu — happy Mid-Autumn Festival!',
      });
    }
    // Ngày Nhà giáo Việt Nam (Vietnamese Teachers' Day) is a fixed date, not lunar.
    occurrences.push({
      date: new Date(`${year}-11-20T00:00:00`),
      emoji: '🍎',
      before: 3,
      after: 3,
      greeting: "Chúc mừng Ngày Nhà giáo Việt Nam — happy Vietnamese Teachers' Day, and thank you "
        + 'to every professor on this list.',
    });
  }

  let best = null;
  for (const occ of occurrences) {
    const diffDays = Math.round((today - occ.date) / 86400000);
    if (diffDays >= -occ.before && diffDays <= occ.after) {
      const distance = Math.abs(diffDays);
      if (!best || distance < best.distance) best = { ...occ, distance };
    }
  }
  return best;
}

// A schematic (not geographically precise) grid layout of the 50 states + DC, used only for the
// "show me something interesting" view's at-a-glance state map. Every state gets an equally
// visible, clickable tile — unlike a real map, where small states are hard to see or click.
const STATE_ABBR = {
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

// [row, column] on a 13-column grid. Not real geography — just a reasonable schematic
// approximation (AK/HI inset in their traditional corners) so every state is equally sized and
// clickable.
const STATE_GRID = {
  AK: [0, 0], ME: [0, 11],
  VT: [1, 10], NH: [1, 11],
  WA: [2, 1], MT: [2, 2], ND: [2, 3], MN: [2, 4], WI: [2, 6], MI: [2, 7], NY: [2, 9], MA: [2, 11],
  OR: [3, 1], ID: [3, 2], WY: [3, 3], SD: [3, 4], IA: [3, 5], IL: [3, 6], IN: [3, 7], OH: [3, 8],
  PA: [3, 9], NJ: [3, 10], CT: [3, 11], RI: [3, 12],
  CA: [4, 1], NV: [4, 2], UT: [4, 3], CO: [4, 4], NE: [4, 5], KS: [4, 6], MO: [4, 7], KY: [4, 8],
  WV: [4, 9], VA: [4, 10], MD: [4, 11], DE: [4, 12],
  AZ: [5, 2], NM: [5, 3], OK: [5, 5], AR: [5, 6], TN: [5, 7], NC: [5, 8], SC: [5, 9], DC: [5, 10],
  HI: [6, 0], TX: [6, 5], LA: [6, 6], MS: [6, 7], AL: [6, 8], GA: [6, 9],
  FL: [7, 9],
};

function heatTier(count, max) {
  if (count === 0 || max === 0) return 0;
  const ratio = count / max;
  if (ratio > 0.66) return 4;
  if (ratio > 0.33) return 3;
  if (ratio > 0.1) return 2;
  return 1;
}

const app = document.getElementById('app');

function pickRandomUnique(values, count) {
  const pool = [...new Set(values)];
  const result = [];
  while (result.length < count && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}

function debounce(fn, delayMs) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

function renderShell() {
  app.innerHTML = `
    <header>
      <div class="title-row">
        <h1><a class="home-link" href="${import.meta.env.BASE_URL}" id="home-link">Vietnamese Profs. in the US</a></h1>
        <a class="github-link" href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer" aria-label="View VietProfs on GitHub" title="View source on GitHub"></a>
        <a class="icon-link roars-link" href="https://roars.dev" target="_blank" rel="noopener noreferrer" aria-label="ROARS Lab" title="ROARS Lab"></a>
        <a class="icon-link" href="https://github.com/dynaroars/vietprofs/blob/main/FAQ.md" target="_blank" rel="noopener noreferrer" aria-label="Frequently asked questions" title="Frequently asked questions"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 2-2.8 2.4-2.8 4.2"/><circle cx="12" cy="17.6" r="1.1" fill="currentColor" stroke="none"/></svg></a>
      </div>
    </header>
    <div class="holiday-banner" id="holiday-banner" hidden></div>
    <div class="controls">
      <input id="search" class="search-input" type="search" list="search-suggestions" placeholder="Search name, university, department, location, or area…" aria-label="Search" />
      <datalist id="search-suggestions"></datalist>
      <select id="field-filter" class="field-select" aria-label="Filter by field">
        <option value="all">All fields</option>
      </select>
    </div>
    <div class="examples" id="examples"></div>
    <p class="result-count" id="result-count" aria-live="polite"></p>
    <div class="roster" id="roster"></div>
  `;
}

function renderRoster(roster) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  const universities = new Set(roster.map((p) => p.university)).size;
  const states = new Set(roster.map((p) => p.state)).size;
  countEl.innerHTML = `${roster.length} <span class="term" tabindex="0" data-tooltip="On the tenure track or already tenured — not adjunct, visiting, teaching-only, research-track, or emeritus.">tenure-line</span> professor${roster.length === 1 ? '' : 's'} across ${universities} universit${universities === 1 ? 'y' : 'ies'} in ${states} state${states === 1 ? '' : 's'}. <a class="submission-link" href="https://vietprofs.roars.dev/submit.html">Add or update info.</a>`;

  if (roster.length === 0) {
    rosterEl.innerHTML = '<p class="empty-state">No matches. Try a different search or filter.</p>';
    return;
  }

  rosterEl.innerHTML = roster
    .map((p) => {
      const tags = p.researchAreas
        .map((a) => `<button type="button" class="tag">${escapeHtml(a)}</button>`)
        .join('');
      return `
        <div class="entry">
          <div class="entry-line">
            <a class="entry-name" href="${escapeHtml(p.websiteUrl ?? p.profileUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.name)}</a>${p.scholarUrl ? ` <a class="scholar-link" href="${escapeHtml(p.scholarUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(p.name)} on Google Scholar" title="Google Scholar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Z"/><path d="M5 12.18V16c0 1.66 3.13 3 7 3s7-1.34 7-3v-3.82l-7 3.82-7-3.82Z"/></svg></a>` : ''}${p.secondaryAppointment ? ' <span class="dagger">†</span>' : ''}
            <span class="entry-meta">${escapeHtml(p.university)} · ${escapeHtml(p.department)} · ${escapeHtml(p.city)}, ${escapeHtml(p.state)}</span>
          </div>
          ${p.rank || p.phdYear || p.phdInstitution ? `<div class="entry-details">${[
            p.rank && escapeHtml(p.rank),
            p.phdYear && `PhD ${escapeHtml(String(p.phdYear))}${p.phdInstitution ? `, ${escapeHtml(p.phdInstitution)}` : ''}`,
            !p.phdYear && p.phdInstitution && `PhD, ${escapeHtml(p.phdInstitution)}`,
          ].filter(Boolean).join(' · ')}</div>` : ''}
          <div class="tags">${tags}</div>
        </div>
      `;
    })
    .join('');
}

const NGUYEN_TOOLTIP = 'Nguyễn was Vietnam’s last ruling dynasty (1802–1945); many people adopted '
  + 'or were assigned the name under it, which is why it’s estimated to be shared by nearly 40% '
  + 'of Vietnamese people today.';

function renderStateGrid(roster) {
  const counts = new Map();
  for (const p of roster) counts.set(p.state, (counts.get(p.state) ?? 0) + 1);
  const max = Math.max(0, ...counts.values());
  const tiles = Object.entries(STATE_GRID)
    .map(([abbr, [row, col]]) => {
      const fullName = Object.keys(STATE_ABBR).find((name) => STATE_ABBR[name] === abbr);
      const count = counts.get(fullName) ?? 0;
      const tier = heatTier(count, max);
      const label = `${fullName}: ${count} ${count === 1 ? 'person' : 'people'}`;
      return `<button type="button" class="state-tile heat-${tier}" style="grid-row:${row + 1};grid-column:${col + 1}" data-state="${escapeHtml(fullName)}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">${abbr}</button>`;
    })
    .join('');
  return `
    <p class="state-grid-caption">By state — darker means more people; click one to search it.</p>
    <div class="state-grid-wrap"><div class="state-grid">${tiles}</div></div>
  `;
}

function renderFunFacts(roster) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  countEl.textContent = 'A few interesting patterns in the roster:';
  const facts = buildFunFacts(roster);
  const items = facts
    .map((f) => {
      const escaped = escapeHtml(f);
      if (f.startsWith('Most common surnames')) {
        // Wrap just the first "Nguyen" occurrence with the existing .term tooltip mechanic.
        return `<li>${escaped.replace(
          'Nguyen (',
          `<span class="term" tabindex="0" data-tooltip="${escapeHtml(NGUYEN_TOOLTIP)}">Nguyen</span> (`,
        )}</li>`;
      }
      return `<li>${escaped}</li>`;
    })
    .join('');
  rosterEl.innerHTML = `${renderStateGrid(roster)}<ul class="fun-facts">${items}</ul>`;
}

async function init() {
  renderShell();

  let roster;
  try {
    roster = await loadRoster();
  } catch {
    document.getElementById('roster').innerHTML =
      '<p class="empty-state">Could not load the roster. Please refresh the page or try again later.</p>';
    return;
  }

  const suggestions = document.getElementById('search-suggestions');
  const suggestionValues = [...uniqueDepartments(roster), ...uniqueStates(roster)].sort();
  for (const value of suggestionValues) {
    suggestions.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(value)}"></option>`);
  }

  const searchInput = document.getElementById('search');
  const fieldSelect = document.getElementById('field-filter');
  const fieldCounts = new Map(
    FIELDS.map((field) => [
      field,
      roster.filter((person) => fieldOf(person.department, person.university) === field).length,
    ]),
  );
  fieldSelect.options[0].textContent = `All fields (${roster.length})`;
  for (const field of FIELDS) {
    fieldSelect.insertAdjacentHTML(
      'beforeend',
      `<option value="${escapeHtml(field)}">${escapeHtml(fieldDropdownLabel(field))} (${fieldCounts.get(field)})</option>`,
    );
  }
  fieldSelect.insertAdjacentHTML(
    'beforeend',
    `<option value="${INTERESTING}">✨ Show me something interesting</option>`,
  );

  const params = new URLSearchParams(window.location.search);
  if (params.has('q')) searchInput.value = params.get('q');
  if (params.has('field') && (FIELDS.includes(params.get('field')) || params.get('field') === INTERESTING)) {
    fieldSelect.value = params.get('field');
  }

  function syncUrl() {
    const next = new URLSearchParams();
    if (searchInput.value.trim()) next.set('q', searchInput.value.trim());
    if (fieldSelect.value !== 'all') next.set('field', fieldSelect.value);
    const query = next.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState(null, '', url);
  }

  function update() {
    if (fieldSelect.value === INTERESTING) {
      renderFunFacts(roster);
      syncUrl();
      return;
    }
    const filtered = filterRoster(roster, {
      query: searchInput.value,
      field: fieldSelect.value,
    });
    renderRoster(sortRoster(filtered));
    syncUrl();
  }

  searchInput.addEventListener('input', debounce(update, 150));
  fieldSelect.addEventListener('change', update);

  document.getElementById('home-link').addEventListener('click', (e) => {
    e.preventDefault(); // already on this page — reset in place instead of reloading
    searchInput.value = '';
    fieldSelect.value = 'all';
    update();
  });

  // Delegated on the roster container itself (attached once) rather than per-entry/per-tile,
  // since renderRoster()/renderFunFacts() both replace its innerHTML wholesale on every update().
  document.getElementById('roster').addEventListener('click', (e) => {
    const tag = e.target.closest('.tag');
    if (tag) {
      searchInput.value = tag.textContent;
      update();
      return;
    }
    const tile = e.target.closest('.state-tile');
    if (tile) {
      searchInput.value = tile.dataset.state;
      fieldSelect.value = 'all'; // leaving the facts view to show the filtered results
      update();
    }
  });

  const holiday = nearestVietnameseHoliday(new Date());
  if (holiday) {
    const bannerEl = document.getElementById('holiday-banner');
    bannerEl.hidden = false;
    bannerEl.innerHTML = `<span>${holiday.emoji} ${escapeHtml(holiday.greeting)}</span><button type="button" class="banner-close" aria-label="Dismiss">×</button>`;
    bannerEl.querySelector('.banner-close').addEventListener('click', () => {
      bannerEl.hidden = true;
    });
  }

  const facts = buildFunFacts(roster);
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  const examples = [
    ...pickRandomUnique(roster.map((p) => p.name), 2).map((value) => ({ type: 'search', value })),
    ...pickRandomUnique(uniqueDepartments(roster), 1).map((value) => ({ type: 'search', value })),
    ...pickRandomUnique(uniqueStates(roster), 1).map((value) => ({ type: 'search', value })),
    ...pickRandomUnique(roster.flatMap((p) => p.researchAreas), 1).map((value) => ({ type: 'search', value })),
    { type: 'fact', value: randomFact },
  ].sort(() => Math.random() - 0.5);
  const examplesEl = document.getElementById('examples');
  examplesEl.innerHTML =
    '<span class="examples-label">Try:</span>' +
    examples
      .map((ex) =>
        ex.type === 'fact'
          ? `<button type="button" class="example-chip fun-chip" data-fun="1">✨ ${escapeHtml(ex.value)}</button>`
          : `<button type="button" class="example-chip">${escapeHtml(ex.value)}</button>`,
      )
      .join('');
  examplesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.example-chip');
    if (!btn) return;
    if (btn.dataset.fun) {
      searchInput.value = '';
      fieldSelect.value = INTERESTING;
      update();
      return;
    }
    searchInput.value = btn.textContent;
    fieldSelect.value = 'all';
    update();
  });

  update();
}

init();
