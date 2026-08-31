import './style.css';
import { loadRoster, buildSearchIndex, uniqueStates, uniqueCities, uniqueDepartments, uniqueRanks, uniqueResearchAreas, uniquePhdInstitutions, uniqueUndergradInstitutions, uniqueCountries, FIELDS, TRACKS, LOCATIONS, LOCATION_LABELS, countryFlag, canonicalRank, displayName, fieldOf, locationMatches, filterRoster, buildUsObservations, buildInternationalObservations, buildLocationObservations, buildQualifiedObservations, buildAwardsFunFacts, buildDecadeCounts, buildTopPhdInstitutions, buildTopUniversities, STATE_ABBR, type Roster } from './data.ts';
import { escapeHtml } from './utils.ts';
import { STATE_GRID } from './state-grid.ts';
import { fieldDropdownLabel, renderRosterEntry } from './render.ts';
import { loadFavorites, toggleFavorite } from './favorites-store.ts';
import { locationForQuery } from './filter-state.ts';

function heatTier(count, max) {
  if (count === 0 || max === 0) return 0;
  const ratio = count / max;
  if (ratio > 0.66) return 4;
  if (ratio > 0.33) return 3;
  if (ratio > 0.1) return 2;
  return 1;
}

const app = document.getElementById('app');

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function pickRandomUnique<T>(values: T[], count: number): T[] {
  return shuffle([...new Set(values)]).slice(0, count);
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
        <h1><a class="home-link" href="${import.meta.env.BASE_URL}" id="home-link">Vietnamese Academic Diaspora</a></h1>
        <a class="icon-link roars-link" href="https://roars.dev" target="_blank" rel="noopener noreferrer" aria-label="ROARS Lab" title="ROARS Lab"></a>
      </div>
      <div class="subtitle-row">
        <p class="site-subtitle">A directory of Vietnamese professors worldwide</p>
        <div class="header-actions">
          <a class="paper-link" href="${import.meta.env.BASE_URL}paper.pdf" target="_blank" rel="noopener noreferrer">Read the paper (PDF)</a>
          <a class="submission-link" href="submit.html">Add or update info</a>
        </div>
      </div>
    </header>
    <div class="controls">
      <div class="search-box">
        <select id="search-scope" class="search-scope" aria-label="Search in">
          <option value="all">Everything</option>
          <option value="name">Name</option>
          <option value="university">University</option>
          <option value="department">Department</option>
          <option value="rank">Rank</option>
          <option value="research">Research area</option>
          <option value="honors">Honors</option>
          <option value="phd">PhD institution</option>
          <option value="undergrad">Ugrad Inst.</option>
        </select>
        <input id="search" class="search-input" type="search" placeholder="Search the roster…" aria-label="Search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="search-suggestion-panel" />
        <div id="search-suggestion-panel" class="search-suggestion-panel" role="listbox" hidden></div>
      </div>
      <select id="location-filter" class="field-select location-select" aria-label="Filter by location">
      </select>
      <select id="field-filter" class="field-select" aria-label="Filter by field">
        <option value="all">All fields</option>
      </select>
      <select id="track-filter" class="field-select track-select" aria-label="Filter by faculty type">
        <option value="all">All faculty types</option>
      </select>
      <select id="sort-order" class="field-select sort-select" aria-label="Sort professors">
        <option value="random">Random order</option>
        <option value="last-name">Last name</option>
        <option value="first-name">First name</option>
        <option value="recent">Recently modified</option>
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
const TRACK_INFO: Record<string, { label: string; tooltip: string }> = {
  'Tenure-line': {
    label: 'tenure-line',
    tooltip: 'On the tenure track or already tenured — not adjunct, visiting, teaching-only, research-track, or emeritus.',
  },
  Teaching: {
    label: 'teaching-track',
    tooltip: 'A full-time, continuing/permanent non-tenure-track teaching appointment — not adjunct, visiting, postdoctoral, or affiliate.',
  },
  Research: {
    label: 'research-track',
    tooltip: 'A stable faculty or faculty-equivalent research appointment — not a postdoctoral, visiting, or other temporary research role.',
  },
  Clinical: {
    label: 'clinical-track',
    tooltip: 'A stable clinical faculty appointment — not adjunct, visiting, or other temporary clinical work.',
  },
  Emeritus: {
    label: 'emeritus',
    tooltip: 'A formally conferred emeritus title after a tenure-line career — not just retirement without the conferred title.',
  },
};

function trackQualifier(roster) {
  const tracks = new Set<string>(roster.map((p) => p.track).filter(Boolean));
  if (tracks.size !== 1) return '';
  const info = TRACK_INFO[[...tracks][0]];
  return info ? ` <span class="term" tabindex="0" data-tooltip="${escapeHtml(info.tooltip)}">${info.label}</span>` : '';
}

interface RenderOptions {
  field?: string;
  location?: string;
}

function namePart(person, part: 'first' | 'last') {
  const words = displayName(person.name).trim().split(/\s+/);
  return part === 'first' ? words[0] : words.at(-1);
}

function sortRoster(roster: Roster, order: string): Roster {
  const favorites = new Set(loadFavorites());
  const byName = (part: 'first' | 'last') => (a, b) =>
    namePart(a, part).localeCompare(namePart(b, part), 'en', { sensitivity: 'base' })
      || displayName(a.name).localeCompare(displayName(b.name), 'en', { sensitivity: 'base' });
  const bySelectedOrder = order === 'last-name'
    ? byName('last')
    : order === 'first-name'
      ? byName('first')
      : order === 'recent'
        ? (a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt)
        : () => 0;

  return [...roster].sort((a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id)) || bySelectedOrder(a, b));
}

function renderRoster(roster: Roster, { field, location }: RenderOptions = {}) {
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
  countEl.innerHTML = `${roster.length}${trackQualifier(roster)} professor${roster.length === 1 ? '' : 's'}${fieldPhrase} across ${universities} universit${universities === 1 ? 'y' : 'ies'}${locPhrase}.`;

  if (roster.length === 0) {
    rosterEl.innerHTML = '<p class="empty-state">No matches. Try a different search or filter.</p>';
    return;
  }

  rosterEl.innerHTML = roster.map((person) => renderRosterEntry(person, import.meta.env.BASE_URL)).join('');
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
        <button type="button" class="ranked-item" data-search="${escapeHtml(uni)}" data-scope="university" title="Filter by ${escapeHtml(uni)}">
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
        <button type="button" class="ranked-item" data-search="${escapeHtml(inst)}" data-scope="phd" title="Search faculty from ${escapeHtml(inst)}">
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

function renderFunFacts(visibleRoster, selectedLocationLabel, selectedLocation, fullRoster) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  countEl.textContent = 'Insights and patterns for the selected location and the worldwide diaspora:';

  const worldUsRoster = fullRoster.filter((p) => (p.country || 'United States') === 'United States');
  const worldInternationalRoster = fullRoster.filter((p) => (p.country || 'United States') !== 'United States');
  const selectedIsWorld = selectedLocation === 'World';
  const selectedRoster = selectedIsWorld ? fullRoster : visibleRoster;
  const selectedLabel = selectedLocationLabel;
  const selectedIsUs = selectedLocation === 'US';
  const selectedFacts = selectedIsUs
    ? buildUsObservations(selectedRoster)
    : buildLocationObservations(selectedRoster, selectedLocationLabel);
  const selectedAwardsFacts = buildAwardsFunFacts(selectedRoster);
  const worldFacts = [...buildUsObservations(worldUsRoster), ...buildInternationalObservations(fullRoster), ...buildQualifiedObservations(fullRoster)];
  const worldAwardsFacts = buildAwardsFunFacts(fullRoster);

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

  const selectedUniversities = new Set(selectedRoster.map((p) => p.university)).size;
  const worldCountriesCount = new Set(fullRoster.map((p) => p.country || 'United States')).size;

  const selectedSection = selectedIsWorld ? '' : `
      <!-- SECTION 1: SELECTED LOCATION -->
      <section class="insights-section-block">
        <div class="insights-section-header">
          <span class="insights-badge">${escapeHtml(selectedLabel)}</span>
          <h2 class="insights-main-heading">${escapeHtml(selectedIsUs ? 'United States Academic Landscape' : `${selectedLocationLabel} Academic Landscape`)}</h2>
          <p class="insights-main-desc">${selectedRoster.length} professor${selectedRoster.length === 1 ? '' : 's'} across ${selectedUniversities} universit${selectedUniversities === 1 ? 'y' : 'ies'} in the selected location.</p>
        </div>
        ${selectedIsUs && selectedRoster.length ? renderStateGrid(selectedRoster) : ''}
        ${selectedRoster.length ? renderDecadesChart(selectedRoster) : ''}
        ${selectedRoster.length ? renderLeaderboards(selectedRoster, { titleUni: selectedIsUs ? 'Top U.S. Faculty Hubs' : 'Top Faculty Hubs', descUni: 'Universities with the most Vietnamese faculty in the selected location; click to search.', titlePhd: selectedIsUs ? 'Top U.S. PhD Alma Maters' : 'Top PhD Alma Maters', descPhd: 'Doctoral institutions that trained faculty in the selected location; click to search.' }) : ''}
        <div class="insights-section">
          <h3 class="insights-heading">${escapeHtml(selectedLabel)} Highlights</h3>
          <ul class="fun-facts">${formatList([...selectedFacts, ...selectedAwardsFacts])}</ul>
        </div>
      </section>
  `;

  rosterEl.innerHTML = `
    <div class="insights-dashboard">
      ${selectedSection}

      <!-- WORLD -->
      <section class="insights-section-block">
        <div class="insights-section-header">
          <span class="insights-badge">🌐 World</span>
          <h2 class="insights-main-heading">Global &amp; Worldwide Diaspora Landscape</h2>
          <p class="insights-main-desc">${fullRoster.length} professors across ${worldCountriesCount} countries and regions worldwide.</p>
        </div>
        ${renderDecadesChart(fullRoster)}
        ${worldInternationalRoster.length ? renderLeaderboards(worldInternationalRoster, { titleUni: 'Top International Faculty Hubs', descUni: 'Global universities outside the U.S. with the most Vietnamese faculty; click to search.', titlePhd: 'Top International PhD Alma Maters', descPhd: 'Doctoral institutions that trained global faculty; click to search.' }) : ''}
        <div class="insights-section">
          <h3 class="insights-heading">World Highlights</h3>
          <ul class="fun-facts">${formatList([...worldFacts, ...worldAwardsFacts])}</ul>
        </div>
      </section>
    </div>
  `;
}

async function init() {
  renderShell();

  let roster;
  try {
    // Keep one randomized order for the session so the default directory view is less
    // predictable, without reshuffling every time a filter or search is changed.
    roster = shuffle(await loadRoster());
  } catch {
    document.getElementById('roster').innerHTML =
      '<p class="empty-state">Could not load the roster. Please refresh the page or try again later.</p>';
    return;
  }
  const searchIndex = buildSearchIndex(roster);

  // Matches everything filterRoster actually searches over (name, university, city, state, country,
  // department, rank, research areas, degree institutions, and honors) so a suggestion always yields at least one result.
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
      ...uniqueUndergradInstitutions(roster),
    ]),
  ].sort();
  const nameSuggestionValues = [...new Set(roster.flatMap((p) => {
    const name = displayName(p.name);
    const withoutInitials = name.replace(/\b[A-Z]\.\s*/g, '').replace(/\s+/g, ' ').trim();
    return [name, withoutInitials];
  }))].sort();
  const suggestionSources = new Map([
    ['name', nameSuggestionValues],
    ['rank', [...new Set([...uniqueRanks(roster), ...roster.map((p) => canonicalRank(p))])].sort()],
    ['field', FIELDS],
    ['track', [...TRACKS]],
    ['research', uniqueResearchAreas(roster)],
    ['honors', [...new Set(roster.flatMap((p) => (p.honors || []).flatMap((honor) => [honor.name, honor.organization]).filter(Boolean)))].sort()],
    ['university', [...new Set(roster.map((p) => p.university))].sort()],
    ['department', uniqueDepartments(roster)],
    ['phd', uniquePhdInstitutions(roster)],
    ['undergrad', uniqueUndergradInstitutions(roster)],
  ]);
  const searchInput = document.getElementById('search');
  const searchScopeSelect = document.getElementById('search-scope');
  const suggestionPanel = document.getElementById('search-suggestion-panel');
  const locationSelect = document.getElementById('location-filter');
  const fieldSelect = document.getElementById('field-filter');
  const trackSelect = document.getElementById('track-filter');
  const sortSelect = document.getElementById('sort-order');
  const filterState = { state: '', insights: false };

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
  // roster first, followed by the broader continent choices. World is the default.
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

  function filtersHaveResults(location, field, track) {
    return roster.some((person) =>
      locationMatches(person, location) &&
      (field === 'all' || fieldOf(person.department, person.university) === field) &&
      (track === 'all' || person.track === track)
    );
  }

  function countedOptions(values, subset, matches, labelFor) {
    return values.flatMap((value) => {
      const count = subset.filter((person) => matches(person, value)).length;
      return count > 0 ? [{ value, label: `${labelFor(value)} (${count})` }] : [];
    });
  }

  function initializeDropdowns() {
    const locationEntries = (values) => countedOptions(
      values,
      roster,
      locationMatches,
      locationLabel,
    );
    setLocationOptions(locationEntries(countryOptions), locationEntries(continentOptions), 'World');
    const fieldEntries = countedOptions(
      FIELDS,
      roster,
      (person, value) => fieldOf(person.department, person.university) === value,
      fieldDropdownLabel,
    );
    setOptions(
      fieldSelect,
      [
        { value: 'all', label: `All fields (${roster.length})` },
        ...fieldEntries,
      ],
      'all',
    );
    const trackEntries = countedOptions(
      TRACKS,
      roster,
      (person, value) => person.track === value,
      (value) => value,
    );
    setOptions(
      trackSelect,
      [
        { value: 'all', label: `All faculty types (${roster.length})` },
        ...trackEntries,
      ],
      'all',
    );
  }

  function setFilterValues({ location, field = 'all', track = 'all' }) {
    const safeLocation = locationOptions.includes(location) && roster.some((person) => locationMatches(person, location))
      ? location
      : 'World';
    const safeFilters = filtersHaveResults(safeLocation, field, track)
      ? { location: safeLocation, field, track }
      : { location: safeLocation, field: 'all', track: 'all' };
    locationSelect.value = safeFilters.location;
    fieldSelect.value = safeFilters.field;
    trackSelect.value = safeFilters.track;
  }

  initializeDropdowns();
  setFilterValues({ location: 'World' });

  function autoSelectLocationForQuery() {
    locationSelect.value = locationForQuery(roster, searchIndex, {
      query: searchInput.value,
      searchScope: searchScopeSelect.value,
      state: filterState.state,
      currentLocation: locationSelect.value,
      field: fieldSelect.value,
      track: trackSelect.value,
    });
  }

  const params = new URLSearchParams(window.location.search);
  const requestedScope = params.get('scope');
  if (requestedScope && [...searchScopeSelect.options].some((option) => option.value === requestedScope)) {
    searchScopeSelect.value = requestedScope;
  }
  if (params.has('q')) {
    searchInput.value = params.get('q');
  }
  const requestedLocation = params.get('loc') ?? params.get('location');
  filterState.state = params.get('state') ?? '';
  const requestedField = params.get('field');
  const requestedTrack = params.get('track');
  const requestedSort = params.get('sort');
  let initialLocation = 'World';
  if (requestedLocation && locationOptions.includes(requestedLocation) && roster.some((p) => locationMatches(p, requestedLocation))) {
    initialLocation = requestedLocation;
  } else if (params.has('q')) {
    autoSelectLocationForQuery();
    initialLocation = locationSelect.value;
  }
  let initialField = 'all';
  if (FIELDS.includes(requestedField) && roster.some((p) => fieldOf(p.department, p.university) === requestedField)) {
    initialField = requestedField;
  }
  filterState.insights = params.get('view') === 'insights' || requestedField === 'interesting';
  let initialTrack = 'all';
  if (TRACKS.some((track) => track === requestedTrack) && roster.some((p) => p.track === requestedTrack)) {
    initialTrack = requestedTrack;
  }
  setFilterValues({ location: initialLocation, field: initialField, track: initialTrack });
  if (['random', 'last-name', 'first-name', 'recent'].includes(requestedSort)) {
    sortSelect.value = requestedSort;
  }

  function syncUrl() {
    const next = new URLSearchParams();
    if (searchInput.value.trim()) next.set('q', searchInput.value.trim());
    if (filterState.state) next.set('state', filterState.state);
    if (searchScopeSelect.value !== 'all') next.set('scope', searchScopeSelect.value);
    if (locationSelect.value !== 'World') next.set('loc', locationSelect.value);
    if (fieldSelect.value !== 'all') next.set('field', fieldSelect.value);
    if (trackSelect.value !== 'all') next.set('track', trackSelect.value);
    if (sortSelect.value !== 'random') next.set('sort', sortSelect.value);
    if (filterState.insights) next.set('view', 'insights');
    const query = next.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState(null, '', url);
  }

  function update({ fromSearch = false } = {}) {
    if (fromSearch) {
      filterState.state = '';
      filterState.insights = false;
      autoSelectLocationForQuery();
    }
    const locRoster = roster.filter((p) => locationMatches(p, locationSelect.value));
    if (filterState.insights) {
      renderFunFacts(locRoster, locationLabel(locationSelect.value), locationSelect.value, roster);
      syncUrl();
      return;
    }
    const filtered = filterRoster(searchIndex, {
      query: searchInput.value,
      searchScope: searchScopeSelect.value,
      state: filterState.state,
      location: locationSelect.value,
      field: fieldSelect.value,
      track: trackSelect.value,
    });
    renderRoster(sortRoster(filtered, sortSelect.value), {
      field: fieldSelect.value,
      location: locationSelect.value,
    });
    syncUrl();
  }

  // Use an in-page listbox rather than a native <datalist>. Browser-owned datalist popups
  // can flicker or close while the debounced search results update, especially in Chromium.
  let activeSuggestion = -1;
  function hideSuggestions() {
    activeSuggestion = -1;
    suggestionPanel.hidden = true;
    suggestionPanel.replaceChildren();
    searchInput.setAttribute('aria-expanded', 'false');
  }
  function showSuggestions() {
    const rawQuery = searchInput.value.trim();
    const query = rawQuery.toLocaleLowerCase();
    const selectedScope = searchScopeSelect.value !== 'all' ? searchScopeSelect.value : undefined;
    const keywordValues = selectedScope ? suggestionSources.get(selectedScope) : undefined;
    if (!query && !(keywordValues && keywordValues.length <= 20)) {
      hideSuggestions();
      return;
    }
    const normalized = (value) => value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const source = keywordValues ?? suggestionValues;
    const sourceQuery = keywordValues ? normalized(rawQuery) : normalized(query);
    const matches = source
      .filter((value) => normalized(value).includes(sourceQuery))
      .sort((a, b) => {
        const aStarts = normalized(a).startsWith(sourceQuery);
        const bStarts = normalized(b).startsWith(sourceQuery);
        return Number(bStarts) - Number(aStarts) || a.localeCompare(b);
      })
      .slice(0, 8);
    suggestionPanel.replaceChildren(...matches.map((value, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'search-suggestion';
      option.role = 'option';
      option.textContent = value;
      option.dataset.index = String(index);
      option.addEventListener('click', () => {
        searchInput.value = value;
        hideSuggestions();
        update({ fromSearch: true });
      });
      return option;
    }));
    activeSuggestion = -1;
    suggestionPanel.hidden = matches.length === 0;
    searchInput.setAttribute('aria-expanded', String(matches.length > 0));
  }
  searchInput.addEventListener('focus', showSuggestions);
  searchInput.addEventListener('input', showSuggestions);
  searchScopeSelect.addEventListener('change', () => {
    showSuggestions();
    update({ fromSearch: true });
  });
  searchInput.addEventListener('keydown', (event) => {
      const options = [...suggestionPanel.querySelectorAll<HTMLButtonElement>('.search-suggestion')];
    if (event.key === 'Escape') {
      hideSuggestions();
      return;
    }
    if (!options.length || !['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
    if (event.key === 'Enter' && activeSuggestion >= 0) {
      event.preventDefault();
      options[activeSuggestion].click();
      return;
    }
    if (event.key === 'ArrowDown') activeSuggestion = (activeSuggestion + 1) % options.length;
    if (event.key === 'ArrowUp') activeSuggestion = (activeSuggestion - 1 + options.length) % options.length;
    options.forEach((option, index) => option.setAttribute('aria-selected', String(index === activeSuggestion)));
    event.preventDefault();
  });
  searchInput.addEventListener('blur', () => setTimeout(hideSuggestions, 150));

  searchInput.addEventListener('input', debounce(() => update({ fromSearch: true }), 150));
  locationSelect.addEventListener('change', () => {
    filterState.state = '';
    update();
  });
  fieldSelect.addEventListener('change', () => {
    filterState.insights = false;
    update();
  });
  trackSelect.addEventListener('change', () => update({ fromSearch: false }));
  sortSelect.addEventListener('change', () => update({ fromSearch: false }));

  document.getElementById('home-link').addEventListener('click', (e) => {
    e.preventDefault(); // already on this page — reset in place instead of reloading
    searchInput.value = '';
    searchScopeSelect.value = 'all';
    filterState.state = '';
    filterState.insights = false;
    setFilterValues({ location: 'World' });
    update();
  });

  // Delegated on the roster container itself (attached once) rather than per-entry/per-tile,
  // since renderRoster()/renderFunFacts() both replace its innerHTML wholesale on every update().
  document.getElementById('roster').addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const favorite = target.closest<HTMLButtonElement>('.favorite-toggle');
    if (favorite?.dataset.id) {
      toggleFavorite(favorite.dataset.id);
      update();
      return;
    }
    const tile = target.closest<HTMLButtonElement>('.state-tile');
    if (tile) {
      searchInput.value = '';
      filterState.state = tile.dataset.state || '';
      filterState.insights = false;
      setFilterValues({ location: 'US' }); // leaving the facts view to show filtered U.S. results
      update();
      return;
    }
    const rankedItem = target.closest<HTMLButtonElement>('.ranked-item');
    if (rankedItem && rankedItem.dataset.search) {
      searchInput.value = rankedItem.dataset.search;
      searchScopeSelect.value = rankedItem.dataset.scope || 'all';
      filterState.insights = false;
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

  const populatedFields = FIELDS.filter((field) => filtersHaveResults('World', field, 'all'));
  const populatedLocations = locationOptions.filter((location) =>
    !['US', 'World'].includes(location) && filtersHaveResults(location, 'all', 'all')
  );
  type Example = { type: 'search' | 'field' | 'track' | 'loc' | 'insights'; value: string; label?: string };
  const examples: Example[] = [
    ...pickRandomUnique(roster.map((person) => displayName(person.name)), 2).map((value) => ({ type: 'search' as const, value })),
    ...pickRandomUnique(uniqueDepartments(roster), 1).map((value) => ({ type: 'search' as const, value })),
    ...pickRandomUnique(uniqueStates(roster), 1).map((value) => ({ type: 'search' as const, value })),
    ...pickRandomUnique(roster.flatMap((person) => person.researchAreas), 1).map((value) => ({ type: 'search' as const, value })),
    ...pickRandomUnique(populatedFields, 2).map((value) => ({ type: 'field' as const, value, label: fieldDropdownLabel(value) })),
    ...pickRandomUnique(TRACKS, 1).map((value) => ({ type: 'track' as const, value })),
    ...pickRandomUnique(populatedLocations, 1).map((value) => ({ type: 'loc' as const, value })),
    { type: 'insights', value: 'Interesting facts' },
  ];
  const examplesEl = document.getElementById('examples');
  examplesEl.replaceChildren();
  const label = document.createElement('span');
  label.className = 'examples-label';
  label.textContent = 'Try:';
  examplesEl.append(label);
  for (const ex of examples) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'example-chip';
    button.textContent = `${ex.type === 'insights' ? '✨ ' : ''}${ex.label ?? ex.value}`;
    if (ex.type === 'insights') button.dataset.insights = '1';
    if (ex.type === 'field') button.dataset.field = ex.value;
    if (ex.type === 'track') button.dataset.track = ex.value;
    if (ex.type === 'loc') button.dataset.loc = ex.value;
    examplesEl.append(button);
  }
  examplesEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.example-chip');
    if (!btn) return;
    filterState.state = '';
    if (btn.dataset.insights) {
      searchInput.value = '';
      filterState.insights = true;
      setFilterValues({ location: locationSelect.value });
      update();
      return;
    }
    if (btn.dataset.field) {
      searchInput.value = '';
      filterState.insights = false;
      setFilterValues({ location: 'World', field: btn.dataset.field });
      update();
      return;
    }
    if (btn.dataset.track) {
      searchInput.value = '';
      filterState.insights = false;
      setFilterValues({ location: 'World', track: btn.dataset.track });
      update();
      return;
    }
    if (btn.dataset.loc) {
      searchInput.value = '';
      filterState.insights = false;
      setFilterValues({ location: btn.dataset.loc });
      update();
      return;
    }
    searchInput.value = btn.textContent;
    filterState.insights = false;
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
