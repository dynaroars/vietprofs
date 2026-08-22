import './style.css';
import { loadRoster, uniqueStates, uniqueCities, uniqueDepartments, uniqueRanks, uniqueResearchAreas, uniquePhdInstitutions, FIELDS, TRACKS, canonicalRank, displayName, fieldOf, filterRoster, sortRoster, buildFunFacts, buildDecadeCounts, buildTopPhdInstitutions, buildTopUniversities, STATE_ABBR } from './data.js';
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
      <input id="search" class="search-input" type="search" list="search-suggestions" placeholder="Search name, university, department, rank, location, or research area…" aria-label="Search" />
      <datalist id="search-suggestions"></datalist>
      <select id="field-filter" class="field-select" aria-label="Filter by field">
        <option value="all">All fields</option>
      </select>
      <select id="track-filter" class="field-select track-select" aria-label="Filter by faculty type">
        <option value="all">All faculty types</option>
      </select>
    </div>
    <div class="examples" id="examples"></div>
    <p class="result-count" id="result-count" aria-live="polite"></p>
    <div class="roster" id="roster"></div>
    <button type="button" id="back-to-top" class="back-to-top" aria-label="Back to top" title="Back to top" hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  `;
}

// Tooltip copy shown on the track qualifier word in the result count — only rendered when every
// entry currently displayed shares one track; a mixed set (the "all tracks" default) drops the
// qualifier entirely rather than mislabeling a mixed roster as one or the other.
const TRACK_INFO = {
  'Tenure-line': {
    label: 'tenure-line',
    tooltip: 'On the tenure track or already tenured — not adjunct, visiting, teaching-only, research-track, or emeritus.',
  },
  Teaching: {
    label: 'teaching-track',
    tooltip: 'A full-time, continuing/permanent non-tenure-track teaching appointment — not adjunct, visiting, postdoctoral, or affiliate.',
  },
  Emeritus: {
    label: 'emeritus',
    tooltip: 'A formally conferred emeritus title after a tenure-line career — not just retirement without the conferred title.',
  },
};

function trackQualifier(roster) {
  const tracks = new Set(roster.map((p) => p.track));
  if (tracks.size !== 1) return '';
  const info = TRACK_INFO[[...tracks][0]];
  return info ? ` <span class="term" tabindex="0" data-tooltip="${escapeHtml(info.tooltip)}">${info.label}</span>` : '';
}

function renderRoster(roster, { field } = {}) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  const universities = new Set(roster.map((p) => p.university)).size;
  const states = new Set(roster.map((p) => p.state)).size;
  const fieldPhrase = field && field !== 'all' ? ` in ${escapeHtml(field)}` : '';
  countEl.innerHTML = `${roster.length}${trackQualifier(roster)} professor${roster.length === 1 ? '' : 's'}${fieldPhrase} across ${universities} universit${universities === 1 ? 'y' : 'ies'} in ${states} state${states === 1 ? '' : 's'}. <a class="submission-link" href="submit.html">Add or update info.</a>`;

  if (roster.length === 0) {
    rosterEl.innerHTML = '<p class="empty-state">No matches. Try a different search or filter.</p>';
    return;
  }

  rosterEl.innerHTML = roster
    .map((p) => {
      const visibleName = displayName(p.name);
      const personField = fieldOf(p.department, p.university);
      const fieldTag = `<span class="tag tag-field">${escapeHtml(fieldDropdownLabel(personField))}</span>`;
      const trackTag = `<span class="tag tag-track">${escapeHtml(p.track)}</span>`;
      const topicTags = p.researchAreas
        .map((a) => `<span class="tag tag-topic">${escapeHtml(a)}</span>`)
        .join('');
      const tags = fieldTag + trackTag + topicTags;
      return `
        <div class="entry">
          <div class="entry-line">
            <a class="entry-name" href="${escapeHtml(p.websiteUrl ?? p.profileUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(visibleName)}</a>${p.scholarUrl ? ` <a class="scholar-link" href="${escapeHtml(p.scholarUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(visibleName)} on Google Scholar" title="Google Scholar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Z"/><path d="M5 12.18V16c0 1.66 3.13 3 7 3s7-1.34 7-3v-3.82l-7 3.82-7-3.82Z"/></svg></a>` : ''}${p.secondaryAppointment ? ' <span class="dagger">†</span>' : ''}
            <span class="entry-meta">${escapeHtml(p.university)} · ${escapeHtml(p.department)} · ${escapeHtml(p.city)}, ${escapeHtml(p.state)}</span>
          </div>
          ${p.rank || p.phdYear || p.phdInstitution ? `<div class="entry-details">${[
            canonicalRank(p) && escapeHtml(canonicalRank(p)),
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
      return `<button type="button" class="state-tile heat-${tier}" style="grid-row:${row + 1};grid-column:${col + 1}" data-state="state:${escapeHtml(fullName)}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">${abbr}</button>`;
    })
    .join('');
  return `
    <div class="insights-section">
      <h3 class="insights-heading">Geographic Distribution</h3>
      <p class="insights-caption">50 states + DC — darker means more people; click a tile to filter by state.</p>
      <div class="state-grid-wrap"><div class="state-grid">${tiles}</div></div>
    </div>
  `;
}

function renderDecadesChart(roster) {
  const decadeCounts = buildDecadeCounts(roster);
  const total = roster.filter((p) => p.phdYear).length;
  if (!decadeCounts.length) return '';
  const max = Math.max(...decadeCounts.map(([, c]) => c));
  const rows = decadeCounts
    .map(([decade, count]) => {
      const pct = Math.round((count / max) * 100);
      const share = Math.round((count / total) * 100);
      return `
        <div class="chart-row">
          <span class="chart-label">${escapeHtml(decade)}</span>
          <div class="chart-track">
            <div class="chart-bar" style="width: ${pct}%;"></div>
          </div>
          <span class="chart-value">${count} <span class="chart-share">(${share}%)</span></span>
        </div>
      `;
    })
    .join('');
  return `
    <div class="insights-section">
      <h3 class="insights-heading">PhD Graduation Cohorts</h3>
      <p class="insights-caption">Distribution by decade of PhD completion (${total} faculty on record).</p>
      <div class="chart-container">${rows}</div>
    </div>
  `;
}

function renderLeaderboards(roster) {
  const topUnis = buildTopUniversities(roster, 8);
  const topPhd = buildTopPhdInstitutions(roster, 8);
  const maxUni = topUnis[0] ? topUnis[0][1] : 1;
  const maxPhd = topPhd[0] ? topPhd[0][1] : 1;

  const uniRows = topUnis
    .map(([uni, count], idx) => {
      const pct = Math.round((count / maxUni) * 100);
      return `
        <button type="button" class="ranked-item" data-search="univ:${escapeHtml(uni)}" title="Filter by ${escapeHtml(uni)}">
          <div class="ranked-header">
            <span class="ranked-name"><span class="ranked-num">${idx + 1}.</span> ${escapeHtml(uni)}</span>
            <span class="ranked-count">${count}</span>
          </div>
          <div class="ranked-track"><div class="ranked-bar" style="width: ${pct}%;"></div></div>
        </button>
      `;
    })
    .join('');

  const phdRows = topPhd
    .map(([inst, count], idx) => {
      const pct = Math.round((count / maxPhd) * 100);
      return `
        <button type="button" class="ranked-item" data-search="phd:${escapeHtml(inst)}" title="Search faculty from ${escapeHtml(inst)}">
          <div class="ranked-header">
            <span class="ranked-name"><span class="ranked-num">${idx + 1}.</span> ${escapeHtml(inst)}</span>
            <span class="ranked-count">${count}</span>
          </div>
          <div class="ranked-track"><div class="ranked-bar" style="width: ${pct}%;"></div></div>
        </button>
      `;
    })
    .join('');

  return `
    <div class="insights-grid">
      <div class="insights-card">
        <h3 class="insights-heading">Top Faculty Hubs</h3>
        <p class="insights-caption">Universities with the most Vietnamese faculty; click to search.</p>
        <div class="ranked-list">${uniRows}</div>
      </div>
      <div class="insights-card">
        <h3 class="insights-heading">Top PhD Alma Maters</h3>
        <p class="insights-caption">Doctoral institutions that trained the most faculty; click to search.</p>
        <div class="ranked-list">${phdRows}</div>
      </div>
    </div>
  `;
}

function renderFunFacts(roster) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  countEl.textContent = 'Insights and patterns across the directory:';
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
  rosterEl.innerHTML = `
    <div class="insights-dashboard">
      ${renderStateGrid(roster)}
      ${renderDecadesChart(roster)}
      ${renderLeaderboards(roster)}
      <div class="insights-section">
        <h3 class="insights-heading">Community Insights & Highlights</h3>
        <ul class="fun-facts">${items}</ul>
      </div>
    </div>
  `;
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
  // Matches everything filterRoster actually searches over (name, university, city, state,
  // department, rank, research areas, PhD institution) so a suggestion always yields at least one result.
  const suggestionValues = [
    ...new Set([
      ...roster.map((p) => displayName(p.name)),
      ...roster.map((p) => p.university),
      ...uniqueDepartments(roster),
      ...uniqueRanks(roster),
      ...uniqueCities(roster),
      ...uniqueStates(roster),
      ...uniqueResearchAreas(roster),
      ...uniquePhdInstitutions(roster),
    ]),
  ].sort();
  for (const value of suggestionValues) {
    suggestions.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(value)}"></option>`);
  }

  const searchInput = document.getElementById('search');
  const fieldSelect = document.getElementById('field-filter');
  for (const field of FIELDS) {
    fieldSelect.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(field)}"></option>`);
  }
  fieldSelect.insertAdjacentHTML(
    'beforeend',
    `<option value="${INTERESTING}">✨ Show me something interesting</option>`,
  );

  const trackSelect = document.getElementById('track-filter');
  for (const track of TRACKS) {
    trackSelect.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(track)}"></option>`);
  }

  // Each dropdown's option counts reflect the OTHER dropdown's current selection, so picking
  // "Teaching" narrows every number shown in the field list (and vice versa) — kept in sync by
  // calling this at the top of update(), which already runs on every relevant state change.
  function syncDropdownCounts() {
    const fieldBase = trackSelect.value !== 'all' ? roster.filter((p) => p.track === trackSelect.value) : roster;
    fieldSelect.options[0].textContent = `All fields (${fieldBase.length})`;
    for (const option of fieldSelect.options) {
      if (!FIELDS.includes(option.value)) continue;
      const count = fieldBase.filter((p) => fieldOf(p.department, p.university) === option.value).length;
      option.textContent = `${fieldDropdownLabel(option.value)} (${count})`;
    }

    const fieldActive = fieldSelect.value !== 'all' && fieldSelect.value !== INTERESTING;
    const trackBase = fieldActive
      ? roster.filter((p) => fieldOf(p.department, p.university) === fieldSelect.value)
      : roster;
    trackSelect.options[0].textContent = `All faculty types (${trackBase.length})`;
    for (const option of trackSelect.options) {
      if (!TRACKS.includes(option.value)) continue;
      const count = trackBase.filter((p) => p.track === option.value).length;
      option.textContent = `${option.value} (${count})`;
    }
  }

  const params = new URLSearchParams(window.location.search);
  if (params.has('q')) searchInput.value = params.get('q');
  if (params.has('field') && (FIELDS.includes(params.get('field')) || params.get('field') === INTERESTING)) {
    fieldSelect.value = params.get('field');
  }
  if (params.has('track') && TRACKS.includes(params.get('track'))) {
    trackSelect.value = params.get('track');
  }

  function syncUrl() {
    const next = new URLSearchParams();
    if (searchInput.value.trim()) next.set('q', searchInput.value.trim());
    if (fieldSelect.value !== 'all') next.set('field', fieldSelect.value);
    if (trackSelect.value !== 'all') next.set('track', trackSelect.value);
    const query = next.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState(null, '', url);
  }

  function update() {
    syncDropdownCounts();
    if (fieldSelect.value === INTERESTING) {
      renderFunFacts(roster);
      syncUrl();
      return;
    }
    const filtered = filterRoster(roster, {
      query: searchInput.value,
      field: fieldSelect.value,
      track: trackSelect.value,
    });
    renderRoster(sortRoster(filtered), {
      field: fieldSelect.value,
    });
    syncUrl();
  }

  searchInput.addEventListener('input', debounce(update, 150));
  fieldSelect.addEventListener('change', update);
  trackSelect.addEventListener('change', update);

  document.getElementById('home-link').addEventListener('click', (e) => {
    e.preventDefault(); // already on this page — reset in place instead of reloading
    searchInput.value = '';
    fieldSelect.value = 'all';
    trackSelect.value = 'all';
    update();
  });

  // Delegated on the roster container itself (attached once) rather than per-entry/per-tile,
  // since renderRoster()/renderFunFacts() both replace its innerHTML wholesale on every update().
  document.getElementById('roster').addEventListener('click', (e) => {
    const tile = e.target.closest('.state-tile');
    if (tile) {
      searchInput.value = tile.dataset.state;
      fieldSelect.value = 'all'; // leaving the facts view to show the filtered results
      trackSelect.value = 'all';
      update();
      return;
    }
    const rankedItem = e.target.closest('.ranked-item');
    if (rankedItem && rankedItem.dataset.search) {
      searchInput.value = rankedItem.dataset.search;
      fieldSelect.value = 'all';
      trackSelect.value = 'all';
      update();
    }
  });

  const backToTopBtn = document.getElementById('back-to-top');
  window.addEventListener(
    'scroll',
    () => {
      backToTopBtn.hidden = window.scrollY <= 300;
    },
    { passive: true },
  );
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    ...pickRandomUnique(roster.map((p) => displayName(p.name)), 2).map((value) => ({ type: 'search', value })),
    ...pickRandomUnique(uniqueDepartments(roster), 1).map((value) => ({ type: 'search', value })),
    ...pickRandomUnique(uniqueStates(roster), 1).map((value) => ({ type: 'search', value })),
    ...pickRandomUnique(roster.flatMap((p) => p.researchAreas), 1).map((value) => ({ type: 'search', value })),
    ...pickRandomUnique(FIELDS, 2).map((field) => ({ type: 'field', value: field, label: fieldDropdownLabel(field) })),
    ...pickRandomUnique(TRACKS, 1).map((track) => ({ type: 'track', value: track })),
    { type: 'fact', value: randomFact },
  ].sort(() => Math.random() - 0.5);
  const examplesEl = document.getElementById('examples');
  examplesEl.innerHTML =
    '<span class="examples-label">Try:</span>' +
    examples
      .map((ex) => {
        if (ex.type === 'fact') {
          return `<button type="button" class="example-chip fun-chip" data-fun="1">✨ ${escapeHtml(ex.value)}</button>`;
        }
        if (ex.type === 'field') {
          return `<button type="button" class="example-chip" data-field="${escapeHtml(ex.value)}">${escapeHtml(ex.label ?? ex.value)}</button>`;
        }
        if (ex.type === 'track') {
          return `<button type="button" class="example-chip" data-track="${escapeHtml(ex.value)}">${escapeHtml(ex.value)}</button>`;
        }
        return `<button type="button" class="example-chip">${escapeHtml(ex.value)}</button>`;
      })
      .join('');
  examplesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.example-chip');
    if (!btn) return;
    if (btn.dataset.fun) {
      searchInput.value = '';
      fieldSelect.value = INTERESTING;
      trackSelect.value = 'all';
      update();
      return;
    }
    if (btn.dataset.field) {
      searchInput.value = '';
      fieldSelect.value = btn.dataset.field;
      trackSelect.value = 'all';
      update();
      return;
    }
    if (btn.dataset.track) {
      searchInput.value = '';
      fieldSelect.value = 'all';
      trackSelect.value = btn.dataset.track;
      update();
      return;
    }
    searchInput.value = btn.textContent;
    fieldSelect.value = 'all';
    trackSelect.value = 'all';
    update();
  });

  update();
}

init();
