import './style.css';
import { loadRoster, buildSearchIndex, uniqueStates, uniqueCities, uniqueDepartments, uniqueRanks, uniqueResearchAreas, uniquePhdInstitutions, uniqueCountries, FIELDS, TRACKS, LOCATIONS, LOCATION_LABELS, countryFlag, canonicalRank, displayName, vietnameseName, fieldOf, healthSubfieldOf, locationMatches, filterRoster, sortRoster, buildFunFacts, buildUsFunFacts, buildGlobalFunFacts, buildAwardsFunFacts, buildDecadeCounts, buildTopPhdInstitutions, buildTopUniversities, STATE_ABBR, parseSearchQuery } from './data.js';
import { escapeHtml } from './utils.js';
import { nearestVietnameseHoliday } from './holidays.js';
import { STATE_GRID } from './state-grid.js';

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
        <h1><a class="home-link" href="${import.meta.env.BASE_URL}" id="home-link">Vietnamese and Vietnamese Diaspora Professors Worldwide</a></h1>
        <a class="github-link" href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer" aria-label="View VietProfs on GitHub" title="View source on GitHub"></a>
        <a class="icon-link roars-link" href="https://roars.dev" target="_blank" rel="noopener noreferrer" aria-label="ROARS Lab" title="ROARS Lab"></a>
      </div>
    </header>
    <div class="holiday-banner" id="holiday-banner" hidden></div>
    <div class="controls">
      <input id="search" class="search-input" type="search" list="search-suggestions" placeholder="Search name, university, department, rank, honors, or research area…" aria-label="Search" />
      <datalist id="search-suggestions"></datalist>
      <select id="location-filter" class="field-select location-select" aria-label="Filter by location">
      </select>
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

function formatLocation(p) {
  const parts = [];
  if (p.city) parts.push(p.city);
  if (p.state && p.state !== p.city) parts.push(p.state);
  if (p.country && p.country !== 'United States' && p.country !== 'US' && p.country !== 'USA' && p.country !== p.city) {
    parts.push(p.country);
  }
  return parts.join(', ');
}

function renderRoster(roster, { field, location } = {}) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  const universities = new Set(roster.map((p) => p.university)).size;
  const states = new Set(roster.map((p) => p.state).filter(Boolean)).size;
  const countries = new Set(roster.map((p) => p.country || 'United States')).size;
  const fieldPhrase = field && field !== 'all' ? ` in ${escapeHtml(field)}` : '';

  let locPhrase = '';
  if (countries <= 1 && (location === 'US' || roster.every((p) => (p.country || 'United States') === 'United States'))) {
    locPhrase = ` in ${states} state${states === 1 ? '' : 's'}`;
  } else {
    locPhrase = ` in ${countries} countr${countries === 1 ? 'y' : 'ies'}`;
  }
  countEl.innerHTML = `${roster.length}${trackQualifier(roster)} professor${roster.length === 1 ? '' : 's'}${fieldPhrase} across ${universities} universit${universities === 1 ? 'y' : 'ies'}${locPhrase}. <a class="submission-link" href="submit.html">Add or update info.</a>`;

  if (roster.length === 0) {
    rosterEl.innerHTML = '<p class="empty-state">No matches. Try a different search or filter.</p>';
    return;
  }

  rosterEl.innerHTML = roster
    .map((p) => {
      const visibleName = displayName(p.name);
      const nativeName = vietnameseName(p);
      const entryMeta = [canonicalRank(p), p.department, p.university, formatLocation(p)].filter(Boolean).join(' · ');
      const personField = fieldOf(p.department, p.university);
      const healthSubfield = healthSubfieldOf(p);
      const fieldLabel = `${fieldDropdownLabel(personField)}${healthSubfield ? ` (${healthSubfield})` : ''}`;
      const fieldTag = `<span class="tag tag-field">${escapeHtml(fieldLabel)}</span>`;
      const trackTag = `<span class="tag tag-track">${escapeHtml(p.track)}</span>`;
      const topicTags = p.researchAreas
        .map((a) => `<span class="tag tag-topic">${escapeHtml(a)}</span>`)
        .join('');
      const tags = fieldTag + trackTag + topicTags;
      const honors = (p.honors ?? [])
        .map((honor) => `<a class="honor-link" href="${escapeHtml(honor.source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(honor.name)}${honor.year ? ` (${escapeHtml(String(honor.year))})` : ''}</a>`)
        .join(' · ');
      const portrait = p.portrait
        ? `<img class="entry-portrait" src="${escapeHtml(`${import.meta.env.BASE_URL}${p.portrait}`)}" alt="" width="64" height="64" loading="lazy" decoding="async">`
        : '';
      return `
        <div class="entry${portrait ? ' entry-with-portrait' : ''}">
          ${portrait}
          <div class="entry-content">
              <div class="entry-name-row">
                <a class="entry-name" href="${escapeHtml(p.websiteUrl ?? p.profileUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(visibleName)}</a>
                <span class="entry-vietnamese-name">(${escapeHtml(nativeName)})</span>${p.scholarUrl ? ` <a class="scholar-link" href="${escapeHtml(p.scholarUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(visibleName)} on Google Scholar" title="Google Scholar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Z"/><path d="M5 12.18V16c0 1.66 3.13 3 7 3s7-1.34 7-3v-3.82l-7 3.82-7-3.82Z"/></svg></a>` : ''}${p.secondaryAppointment ? ' <span class="dagger">†</span>' : ''}
              </div>
              <div class="entry-meta">${escapeHtml(entryMeta)} <span class="loc-badge" title="${escapeHtml(p.country || 'United States')}"><span class="country-flag" aria-hidden="true">${countryFlag(p.country)}</span></span></div>
              ${p.phdYear || p.phdInstitution ? `<div class="entry-details">PhD (${[p.phdInstitution, p.phdYear].filter(Boolean).map((value) => escapeHtml(String(value))).join(', ')})</div>` : ''}
            ${honors ? `<div class="entry-honors"><span class="honors-label">Honors:</span> ${honors}</div>` : ''}
            <div class="tags">${tags}</div>
          </div>
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

function renderLeaderboards(subRoster, { titleUni = 'Top Faculty Hubs', descUni = 'Universities with the most Vietnamese faculty; click to search.', titlePhd = 'Top PhD Alma Maters', descPhd = 'Doctoral institutions that trained the most faculty; click to search.' } = {}) {
  const topUnis = buildTopUniversities(subRoster, 6);
  const topPhd = buildTopPhdInstitutions(subRoster, 6);
  if (topUnis.length === 0 && topPhd.length === 0) return '';
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
        <h3 class="insights-heading">${escapeHtml(titleUni)}</h3>
        <p class="insights-caption">${escapeHtml(descUni)}</p>
        <div class="ranked-list">${uniRows}</div>
      </div>
      <div class="insights-card">
        <h3 class="insights-heading">${escapeHtml(titlePhd)}</h3>
        <p class="insights-caption">${escapeHtml(descPhd)}</p>
        <div class="ranked-list">${phdRows}</div>
      </div>
    </div>
  `;
}

function renderFunFacts(roster) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  countEl.textContent = 'Insights and patterns across the United States and the worldwide diaspora:';

  const usRoster = roster.filter((p) => (p.country || 'United States') === 'United States');
  const globalRoster = roster.filter((p) => (p.country || 'United States') !== 'United States');

  const usFacts = buildUsFunFacts(roster);
  const globalFacts = buildGlobalFunFacts(roster);
  const awardsFacts = buildAwardsFunFacts(roster);

  const formatList = (facts) =>
    facts
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

  const countriesCount = new Set(globalRoster.map((p) => p.country)).size;

  rosterEl.innerHTML = `
    <div class="insights-dashboard">
      <!-- SECTION 1: UNITED STATES -->
      <section class="insights-section-block">
        <div class="insights-section-header">
          <span class="insights-badge">🇺🇸 United States</span>
          <h2 class="insights-main-heading">United States Academic Landscape</h2>
          <p class="insights-main-desc">${usRoster.length} professors across 200+ universities in all 50 states and territories.</p>
        </div>
        ${usRoster.length ? renderStateGrid(usRoster) : ''}
        ${usRoster.length ? renderLeaderboards(usRoster, { titleUni: 'Top U.S. Faculty Hubs', descUni: 'U.S. universities with the most Vietnamese faculty; click to search.', titlePhd: 'Top U.S. PhD Alma Maters', descPhd: 'U.S. doctoral institutions that trained the most faculty; click to search.' }) : ''}
        <div class="insights-section">
          <h3 class="insights-heading">U.S. Community Highlights</h3>
          <ul class="fun-facts">${formatList(usFacts)}</ul>
        </div>
      </section>

      <!-- SECTION 2: ENTIRE WORLD & GLOBAL DIASPORA -->
      <section class="insights-section-block">
        <div class="insights-section-header">
          <span class="insights-badge">🌐 Worldwide Diaspora</span>
          <h2 class="insights-main-heading">Global & Worldwide Diaspora Landscape</h2>
          <p class="insights-main-desc">${globalRoster.length} international professors across ${countriesCount} countries on 5 continents outside the U.S.</p>
        </div>
        ${renderDecadesChart(roster)}
        ${globalRoster.length ? renderLeaderboards(globalRoster, { titleUni: 'Top International Faculty Hubs', descUni: 'Global universities outside the U.S. with the most Vietnamese faculty; click to search.', titlePhd: 'Top International PhD Alma Maters', descPhd: 'Doctoral institutions that trained global faculty; click to search.' }) : ''}
        <div class="insights-section">
          <h3 class="insights-heading">Global Diaspora Highlights</h3>
          <ul class="fun-facts">${formatList(globalFacts)}</ul>
        </div>
      </section>

      <!-- SECTION 3: MAJOR AWARDS & HONORS -->
      <section class="insights-section-block">
        <div class="insights-section-header">
          <span class="insights-badge">🏅 Major honors</span>
          <h2 class="insights-main-heading">Awards &amp; Honors</h2>
          <p class="insights-main-desc">Selective, internationally recognized distinctions recorded in the faculty database.</p>
        </div>
        <div class="insights-section">
          <h3 class="insights-heading">Awards &amp; Honors Highlights</h3>
          <ul class="fun-facts">${formatList(awardsFacts)}</ul>
        </div>
      </section>
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
  const searchIndex = buildSearchIndex(roster);

  const suggestions = document.getElementById('search-suggestions');
  // Matches everything filterRoster actually searches over (name, university, city, state, country,
  // department, rank, research areas, PhD institution, and honors) so a suggestion always yields at least one result.
  const suggestionValues = [
    ...new Set([
      'honors',
      'awards',
      ...roster.flatMap((p) => {
        const name = displayName(p.name);
        const withoutInitials = name.replace(/\b[A-Z]\.\s*/g, '').replace(/\s+/g, ' ').trim();
        return [name, withoutInitials];
      }),
      ...roster.map((p) => p.university),
      ...uniqueDepartments(roster),
      ...uniqueRanks(roster),
      ...uniqueCities(roster),
      ...uniqueStates(roster),
      ...uniqueCountries(roster),
      ...uniqueResearchAreas(roster),
      ...uniquePhdInstitutions(roster),
    ]),
  ].sort();
  for (const value of suggestionValues) {
    suggestions.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(value)}"></option>`);
  }

  const searchInput = document.getElementById('search');
  const locationSelect = document.getElementById('location-filter');
  const fieldSelect = document.getElementById('field-filter');
  const trackSelect = document.getElementById('track-filter');

  function optionElement(value, label) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    return option;
  }

  function setOptions(select, entries, selectedValue) {
    select.replaceChildren(...entries.map(({ value, label }) => optionElement(value, label)));
    select.value = selectedValue;
    if (select.selectedIndex < 0) select.selectedIndex = 0;
  }

  function setLocationOptions(countryEntries, continentEntries, selectedValue) {
    const groups = [
      ['By country/region', countryEntries],
      ['By continent', continentEntries],
    ];
    const groupElements = groups
      .filter(([, entries]) => entries.length > 0)
      .map(([label, entries]) => {
        const group = document.createElement('optgroup');
        group.label = label;
        group.append(...entries.map(({ value, label: optionLabel }) => optionElement(value, optionLabel)));
        return group;
      });
    locationSelect.replaceChildren(...groupElements);
    locationSelect.value = selectedValue;
    if (locationSelect.selectedIndex < 0) locationSelect.selectedIndex = 0;
  }

  // Mirror CSRankings' two location sections: countries/regions represented in the
  // roster first, followed by the broader continent choices. US remains the default.
  const countryLocations = uniqueCountries(roster);
  const countryOptions = [
    'US',
    ...countryLocations.filter((country) => !['United States', 'US', 'USA'].includes(country)),
  ];
  const countryCounts = new Map(
    countryOptions.map((country) => [country, roster.filter((person) => locationMatches(person, country)).length]),
  );
  countryOptions.sort((a, b) => countryCounts.get(b) - countryCounts.get(a) || a.localeCompare(b));
  const continentOptions = LOCATIONS.filter((loc) => loc !== 'US');
  const locationOptions = [...countryOptions, ...continentOptions];
  const locationLabel = (loc) => LOCATION_LABELS[loc] || `${countryFlag(loc)} ${loc}`;

  // Each dropdown's option counts reflect the OTHER dropdowns' current selection, so picking
  // a location, field, or track narrows the options shown in the other dropdowns. Rebuilding
  // options omits zero-count choices without relying on non-portable CSS for native controls.
  function filtersHaveResults(location, field, track) {
    return roster.some((person) =>
      locationMatches(person, location) &&
      (field === 'all' || field === INTERESTING || fieldOf(person.department, person.university) === field) &&
      (track === 'all' || person.track === track)
    );
  }

  function countedOptions(values, subset, matches, labelFor) {
    return values.flatMap((value) => {
      const count = subset.filter((person) => matches(person, value)).length;
      return count > 0 ? [{ value, label: `${labelFor(value)} (${count})` }] : [];
    });
  }

  function syncDropdownCounts({
    location = locationSelect.value || 'US',
    field = fieldSelect.value || 'all',
    track = trackSelect.value || 'all',
  } = {}) {
    const locVal = location;
    const fieldVal = field;
    const trackVal = track;

    // Location dropdown counts (filtered by active field & track)
    let locBase = roster;
    if (fieldVal !== 'all' && fieldVal !== INTERESTING) {
      locBase = locBase.filter((p) => fieldOf(p.department, p.university) === fieldVal);
    }
    if (trackVal !== 'all') {
      locBase = locBase.filter((p) => p.track === trackVal);
    }
    const locationEntries = (values) => countedOptions(
      values,
      locBase,
      locationMatches,
      locationLabel,
    );
    setLocationOptions(locationEntries(countryOptions), locationEntries(continentOptions), locVal);

    // Field dropdown counts (filtered by active location & track)
    let fieldBase = roster.filter((p) => locationMatches(p, locVal));
    if (trackVal !== 'all') {
      fieldBase = fieldBase.filter((p) => p.track === trackVal);
    }
    const fieldEntries = countedOptions(
      FIELDS,
      fieldBase,
      (person, value) => fieldOf(person.department, person.university) === value,
      fieldDropdownLabel,
    );
    setOptions(
      fieldSelect,
      [
        { value: 'all', label: `All fields (${fieldBase.length})` },
        ...fieldEntries,
        { value: INTERESTING, label: '✨ Show me something interesting' },
      ],
      fieldVal,
    );

    // Track dropdown counts (filtered by active location & field)
    let trackBase = roster.filter((p) => locationMatches(p, locVal));
    if (fieldVal !== 'all' && fieldVal !== INTERESTING) {
      trackBase = trackBase.filter((p) => fieldOf(p.department, p.university) === fieldVal);
    }
    const trackEntries = countedOptions(
      TRACKS,
      trackBase,
      (person, value) => person.track === value,
      (value) => value,
    );
    setOptions(
      trackSelect,
      [
        { value: 'all', label: `All faculty types (${trackBase.length})` },
        ...trackEntries,
      ],
      trackVal,
    );
  }

  function setFilterValues({ location, field = 'all', track = 'all' }) {
    const safeLocation = locationOptions.includes(location) && roster.some((person) => locationMatches(person, location))
      ? location
      : 'US';
    const safeFilters = filtersHaveResults(safeLocation, field, track)
      ? { location: safeLocation, field, track }
      : { location: safeLocation, field: 'all', track: 'all' };
    syncDropdownCounts(safeFilters);
  }

  setFilterValues({ location: 'US' });

  function autoSelectLocationForQuery() {
    const q = searchInput.value.trim();
    if (!q) return;

    const parsed = parseSearchQuery(q);
    if (['country', 'location', 'honors'].includes(parsed.type)) {
      locationSelect.value = 'World';
      return;
    }

    const countryNames = uniqueCountries(roster);
    const isCountryQuery = countryNames.some((c) =>
      c.toLowerCase() === q.toLowerCase() ||
      (q.toLowerCase() === 'uk' && c === 'United Kingdom') ||
      (q.toLowerCase() === 'usa' && c === 'United States')
    );
    if (isCountryQuery) {
      locationSelect.value = 'World';
      return;
    }

    const continentNames = ['asia', 'europe', 'australasia', 'north america', 'south america', 'africa', 'world'];
    if (continentNames.includes(q.toLowerCase())) {
      locationSelect.value = 'World';
      return;
    }

    // A university-name query can also match a same-named city in the current country
    // (for example, University of Melbourne and Melbourne, Florida). Prefer the explicit
    // current-university match when deciding whether to widen the location.
    const exactUniversityMatch = roster.some((p) =>
      p.university?.toLowerCase() === q.toLowerCase() &&
      (p.country || 'United States') !== 'United States'
    );
    if (exactUniversityMatch) {
      locationSelect.value = 'World';
      return;
    }

    const matchesInCurrent = filterRoster(searchIndex, {
      query: q,
      location: locationSelect.value,
      field: fieldSelect.value,
      track: trackSelect.value,
    }).length;

    if (matchesInCurrent === 0) {
      const matchesGlobally = filterRoster(searchIndex, {
        query: q,
        location: 'World',
        field: fieldSelect.value,
        track: trackSelect.value,
      }).length;
      if (matchesGlobally > 0) {
        locationSelect.value = 'World';
      }
    }
  }

  const params = new URLSearchParams(window.location.search);
  if (params.has('q')) {
    searchInput.value = params.get('q');
  }
  const requestedLocation = params.get('loc') ?? params.get('location');
  const requestedField = params.get('field');
  const requestedTrack = params.get('track');
  let initialLocation = 'US';
  if (requestedLocation && locationOptions.includes(requestedLocation) && roster.some((p) => locationMatches(p, requestedLocation))) {
    initialLocation = requestedLocation;
  } else if (params.has('q')) {
    autoSelectLocationForQuery();
    initialLocation = locationSelect.value;
  }
  let initialField = 'all';
  if (requestedField === INTERESTING || (FIELDS.includes(requestedField) && roster.some((p) => fieldOf(p.department, p.university) === requestedField))) {
    initialField = requestedField;
  }
  let initialTrack = 'all';
  if (TRACKS.includes(requestedTrack) && roster.some((p) => p.track === requestedTrack)) {
    initialTrack = requestedTrack;
  }
  setFilterValues({ location: initialLocation, field: initialField, track: initialTrack });

  function syncUrl() {
    const next = new URLSearchParams();
    if (searchInput.value.trim()) next.set('q', searchInput.value.trim());
    if (locationSelect.value !== 'US') next.set('loc', locationSelect.value);
    if (fieldSelect.value !== 'all') next.set('field', fieldSelect.value);
    if (trackSelect.value !== 'all') next.set('track', trackSelect.value);
    const query = next.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState(null, '', url);
  }

  function update({ fromSearch = false } = {}) {
    if (fromSearch) {
      if (searchInput.value.trim() && fieldSelect.value === INTERESTING) {
        fieldSelect.value = 'all';
      }
      autoSelectLocationForQuery();
    }
    const locRoster = roster.filter((p) => locationMatches(p, locationSelect.value));
    if (fieldSelect.value === INTERESTING) {
      renderFunFacts(locRoster);
      syncUrl();
      syncDropdownCounts();
      return;
    }
    const filtered = filterRoster(searchIndex, {
      query: searchInput.value,
      location: locationSelect.value,
      field: fieldSelect.value,
      track: trackSelect.value,
    });
    renderRoster(sortRoster(filtered), {
      field: fieldSelect.value,
      location: locationSelect.value,
    });
    syncUrl();
    // Refresh auxiliary count labels only after the primary roster and URL are complete.
    syncDropdownCounts();
  }

  searchInput.addEventListener('input', debounce(() => update({ fromSearch: true }), 150));
  locationSelect.addEventListener('change', () => update({ fromSearch: false }));
  fieldSelect.addEventListener('change', () => update({ fromSearch: false }));
  trackSelect.addEventListener('change', () => update({ fromSearch: false }));

  document.getElementById('home-link').addEventListener('click', (e) => {
    e.preventDefault(); // already on this page — reset in place instead of reloading
    searchInput.value = '';
    setFilterValues({ location: 'US' });
    update();
  });

  // Delegated on the roster container itself (attached once) rather than per-entry/per-tile,
  // since renderRoster()/renderFunFacts() both replace its innerHTML wholesale on every update().
  document.getElementById('roster').addEventListener('click', (e) => {
    const tile = e.target.closest('.state-tile');
    if (tile) {
      searchInput.value = tile.dataset.state;
      setFilterValues({ location: 'US' }); // leaving the facts view to show filtered U.S. results
      update();
      return;
    }
    const rankedItem = e.target.closest('.ranked-item');
    if (rankedItem && rankedItem.dataset.search) {
      searchInput.value = rankedItem.dataset.search;
      fieldSelect.value = 'all';
      trackSelect.value = 'all';
      update({ fromSearch: true });
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
  const populatedFields = FIELDS.filter((field) => filtersHaveResults('World', field, 'all'));
  const populatedLocations = locationOptions.filter((location) =>
    !['US', 'World'].includes(location) && filtersHaveResults(location, 'all', 'all')
  );
  const examples = [
    ...pickRandomUnique(roster.map((p) => displayName(p.name)), 2).map((value) => ({ type: 'search', value })),
    ...pickRandomUnique(uniqueDepartments(roster), 1).map((value) => ({ type: 'search', value })),
    ...pickRandomUnique(uniqueStates(roster), 1).map((value) => ({ type: 'search', value })),
    ...pickRandomUnique(roster.flatMap((p) => p.researchAreas), 1).map((value) => ({ type: 'search', value })),
    ...pickRandomUnique(populatedFields, 2).map((field) => ({ type: 'field', value: field, label: fieldDropdownLabel(field) })),
    ...pickRandomUnique(TRACKS, 1).map((track) => ({ type: 'track', value: track })),
    ...pickRandomUnique(populatedLocations, 1).map((loc) => ({ type: 'loc', value: loc })),
    { type: 'fact', value: randomFact },
  ].sort(() => Math.random() - 0.5);
  const examplesEl = document.getElementById('examples');
  examplesEl.replaceChildren();
  const label = document.createElement('span');
  label.className = 'examples-label';
  label.textContent = 'Try:';
  examplesEl.append(label);
  for (const ex of examples) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `example-chip${ex.type === 'fact' ? ' fun-chip' : ''}`;
    button.textContent = `${ex.type === 'fact' ? '✨ ' : ''}${ex.label ?? ex.value}`;
    if (ex.type === 'fact') button.dataset.fun = '1';
    if (ex.type === 'field') button.dataset.field = ex.value;
    if (ex.type === 'track') button.dataset.track = ex.value;
    if (ex.type === 'loc') button.dataset.loc = ex.value;
    examplesEl.append(button);
  }
  examplesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.example-chip');
    if (!btn) return;
    if (btn.dataset.fun) {
      searchInput.value = '';
      setFilterValues({ location: locationSelect.value, field: INTERESTING });
      update();
      return;
    }
    if (btn.dataset.field) {
      searchInput.value = '';
      setFilterValues({ location: 'World', field: btn.dataset.field });
      update();
      return;
    }
    if (btn.dataset.track) {
      searchInput.value = '';
      setFilterValues({ location: 'World', track: btn.dataset.track });
      update();
      return;
    }
    if (btn.dataset.loc) {
      searchInput.value = '';
      setFilterValues({ location: btn.dataset.loc });
      update();
      return;
    }
    searchInput.value = btn.textContent;
    // If the selected search term is not found within the current location filter, widen to 'World'
    const matchesCurrent = roster.some(
      (p) => locationMatches(p, locationSelect.value) && filterRoster([p], { query: btn.textContent }).length > 0,
    );
    if (!matchesCurrent) {
      locationSelect.value = 'World';
    }
    fieldSelect.value = 'all';
    trackSelect.value = 'all';
    update();
  });

  update();
}

init();
