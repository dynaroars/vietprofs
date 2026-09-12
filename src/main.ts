import './style.css';
import { ACADEMIC_FORTUNES } from './roster-constants.ts';
import {
  FIELDS,
  INSTITUTION_TYPES,
  LOCATION_LABELS,
  LOCATIONS,
  TRACKS,
  buildFunFacts,
  buildSearchIndex,
  canonicalRank,
  countryFlag,
  displayName,
  fieldOf,
  filterRoster,
  institutionTypeOf,
  loadRoster,
  loadStatsHistory,
  locationMatches,
  personPath,
  uniqueCities,
  uniqueCountries,
  uniqueDepartments,
  uniquePhdInstitutions,
  uniqueRanks,
  uniqueResearchAreas,
  uniqueStates,
  uniqueUndergradInstitutions,
  type Roster,
  type RosterEntry,
  type SearchIndex,
  type StatsHistoryPoint,
} from './data.ts';
import { abbreviateInsightText, escapeHtml, formatRosterDate, showToast } from './utils.ts';
import { applyFavoriteToggle, fieldDropdownLabel, renderRosterEntry } from './render.ts';
import { clearPinnedSearches, clearRecentProfiles, loadFavorites, loadPinnedSearches, loadRecentProfiles, toggleFavorite, togglePinnedSearch } from './favorites-store.ts';
import { openRosterShell } from './roster-shell.ts';
import { locationForQuery } from './filter-state.ts';
import { renderFunFacts, renderGrowthChart, type GrowthMetricKey } from './insights.ts';
import { renderHealthPanel } from './health-panel.ts';
import { deriveRosterStats } from './derived-stats.ts';
import { normalizeText, parseKeywordQuery as parseKeywordQueryShared } from './search-kit.ts';

const app = document.getElementById('app');

function shuffle<T>(values: readonly T[]): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function pickRandomUnique<T>(values: readonly T[], count: number): T[] {
  return shuffle([...new Set(values)]).slice(0, count);
}

function debounce<Args extends unknown[]>(fn: (...args: Args) => void, delayMs: number): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

// Keyword prefixes let the single search box target one field directly (e.g. "Name: Nguyen"),
// without needing the scope dropdown. Aliases map several spellings to the same scope value the
// dropdown already uses, so both paths produce identical results.
const KEYWORD_LABELS: Record<string, string> = {
  name: 'Name',
  university: 'University',
  institution: 'Institution',
  department: 'Department',
  rank: 'Rank',
  research: 'Research',
  honors: 'Honors',
  phd: 'PhD',
  undergrad: 'Ugrad',
};

const KEYWORD_ICONS: Record<string, string> = {
  name: '👤',
  university: '🏛️',
  institution: '🏛️',
  department: '🏢',
  rank: '🎓',
  research: '🔬',
  honors: '🏅',
  phd: '🎓',
  undergrad: '📚',
};

const KEYWORD_EXAMPLES: Record<string, string> = {
  name: 'ThanhVu Nguyen',
  university: 'George Mason University',
  institution: 'Public research institute',
  department: 'Computer Science',
  rank: 'Associate Professor',
  research: 'Software Engineering',
  honors: 'NSF CAREER Award',
  phd: 'University of New Mexico',
  undergrad: 'Pennsylvania State University',
};

const KEYWORD_ALIASES: Record<string, string> = {
  name: 'name',
  university: 'university',
  uni: 'university',
  institution: 'institution',
  institutiontype: 'institution',
  department: 'department',
  dept: 'department',
  rank: 'rank',
  research: 'research',
  researcharea: 'research',
  honors: 'honors',
  honor: 'honors',
  award: 'honors',
  awards: 'honors',
  phd: 'phd',
  phdinstitution: 'phd',
  undergrad: 'undergrad',
  ugrad: 'undergrad',
  ugradinst: 'undergrad',
};

function parseKeywordQuery(raw: string): { scope: string; query: string } | null {
  const parsed = parseKeywordQueryShared(raw, (key) => KEYWORD_ALIASES[key]);
  return parsed ? { scope: parsed.key, query: parsed.query } : null;
}

function renderShell() {
  app.innerHTML = `
    <header>
      <div class="title-row">
        <h1><a class="home-link brand-link" href="${import.meta.env.BASE_URL}" id="home-link"><img class="brand-logo" src="${import.meta.env.BASE_URL}vietprofs-bamboo-v.svg" alt="" width="56" height="56"><span>Vietnamese Academic Diaspora</span></a></h1>
        <div class="header-icons">
          <a class="icon-link roars-link" href="https://roars.dev" target="_blank" rel="noopener noreferrer" aria-label="ROARS Lab website" title="ROARS Lab website"></a>
          <a class="icon-link github-link" href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" title="GitHub repository and source code">
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
          </a>
        </div>
      </div>
      <div class="subtitle-row">
        <p class="site-subtitle"><span>vietprofs@world</span>:~$ A Public Directory of the Vietnamese Academic and Research Diaspora</p>
      </div>
    </header>
    <div class="controls">
      <div class="search-box">
        <div class="search-fields">
          <div class="search-input-shell">
            <button id="search-scope-chip" class="search-scope-chip" type="button" aria-label="Remove search scope" hidden>
              <span id="search-scope-chip-label"></span>
              <span class="search-scope-chip-remove" aria-hidden="true">×</span>
            </button>
            <input id="search" class="search-input" type="search" autocomplete="off" placeholder="Roster last updated ${escapeHtml(__BUILD_LABEL__)}" aria-label="Search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="search-suggestion-panel" />
          </div>
          <div id="search-suggestion-panel" class="search-suggestion-panel" role="listbox" hidden></div>
        </div>
        <button type="button" id="pin-search-btn" class="pin-search-btn" aria-pressed="false" title="Pin current search">Pin search</button>
        <button type="button" id="search-help-btn" class="search-help-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="search-help-panel" aria-label="Search syntax and keyboard help" title="Search syntax and keyboard help">?</button>
        <div id="search-help-panel" class="search-help-panel" role="dialog" aria-label="Search syntax help" hidden>
          <p><strong>QUERY SYNTAX</strong></p>
          <p>Type a keyword prefix to search one field directly:</p>
          <ul>
            ${Object.entries(KEYWORD_LABELS).map(([scope, label]) => `<li><code>${escapeHtml(label)}:</code> ${escapeHtml(KEYWORD_EXAMPLES[scope] ?? '')}</li>`).join('')}
          </ul>
          <p><strong>KEYBOARD</strong></p>
          <p><code>/</code> search · <code>j</code>/<code>k</code> move · <code>Enter</code> open · <code>f</code> favorite · <code>r</code> random · <code>Esc</code> clear</p>
          <p><strong>COMMANDS</strong></p>
          <p><code>help</code> · <code>recent</code> · <code>visitor stats</code> · <code>query plan</code> · <code>whoami</code> · <code>uname -a</code> · <code>fortune</code> · <code>/dev/random</code> · <code>theme crt</code></p>
        </div>
      </div>
      <select id="location-filter" class="field-select location-select" aria-label="Filter by location">
      </select>
      <select id="field-filter" class="field-select" aria-label="Filter by field">
        <option value="all">All fields</option>
      </select>
      <select id="track-filter" class="field-select track-select" aria-label="Filter by faculty type">
        <option value="all">All Faculty</option>
      </select>
      <select id="institution-type-filter" class="field-select" aria-label="Filter by institution type">
        <option value="all">All institution</option>
      </select>
      <select id="sort-order" class="field-select sort-select" aria-label="Sort academics">
        <option value="random">Random order</option>
        <option value="last-name">Last name</option>
        <option value="first-name">First name</option>
        <option value="recent">Recently modified</option>
        <option value="vp-newest">Newest VP ID</option>
      </select>
    </div>
    <div class="browser-shelf" id="browser-shelf" aria-label="Saved browser data" hidden></div>
    <output class="command-output" id="command-output" aria-live="polite" hidden></output>
    <div class="examples" id="examples"></div>
    <div class="result-row">
      <p class="result-count" id="result-count" aria-live="polite"></p>
      <div class="header-links">
        <span class="paper-reference"><a class="paper-link" href="${import.meta.env.BASE_URL}vietprofs.pdf" target="_blank" rel="noopener noreferrer">Read the paper</a> (<a class="paper-link" href="https://arxiv.org/abs/2609.06091" target="_blank" rel="noopener noreferrer">arXiv</a>)</span>
        <a class="submission-link" href="submit.html">Add or update info</a>
      </div>
    </div>
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
  'Academic staff': {
    label: 'academic-staff',
    tooltip: 'A faculty-status or senior permanent academic librarian or archivist — not an ordinary staff or temporary role.',
  },
  Emeritus: {
    label: 'emeritus',
    tooltip: 'A formally conferred emeritus title after a tenure-line career — not just retirement without the conferred title.',
  },
  Deceased: {
    label: 'deceased',
    tooltip: 'Deceased or historical scholars who held a qualifying university faculty or eligible research-institute appointment outside Vietnam.',
  },
};

function trackQualifier(roster: Roster): string {
  const tracks = new Set(roster.map((p) => p.track).filter((track): track is string => Boolean(track)));
  if (tracks.size !== 1) return '';
  const info = TRACK_INFO[[...tracks][0] ?? ''];
  return info ? ` <span class="term" tabindex="0" data-tooltip="${escapeHtml(info.tooltip)}">${info.label}</span>` : '';
}

interface RenderOptions {
  field?: string;
  location?: string;
}

interface OptionEntry {
  value: string;
  label: string;
}

function namePart(person: RosterEntry, part: 'first' | 'last'): string {
  const words = displayName(person.name).trim().split(/\s+/);
  return (part === 'first' ? words[0] : words.at(-1)) ?? '';
}

function sortRoster(roster: Roster, order: string): Roster {
  const favorites = new Set(loadFavorites());
  const byName = (part: 'first' | 'last') => (a: RosterEntry, b: RosterEntry) =>
    namePart(a, part).localeCompare(namePart(b, part), 'en', { sensitivity: 'base' })
      || displayName(a.name).localeCompare(displayName(b.name), 'en', { sensitivity: 'base' });
  const bySelectedOrder = order === 'last-name'
    ? byName('last')
    : order === 'first-name'
      ? byName('first')
      : order === 'recent'
        ? (a: RosterEntry, b: RosterEntry) => (b.lastUpdatedAt ?? '').localeCompare(a.lastUpdatedAt ?? '')
        : order === 'vp-newest'
          ? (a: RosterEntry, b: RosterEntry) => Number.parseInt(b.id.slice(3), 10) - Number.parseInt(a.id.slice(3), 10)
        : () => 0;

  return [...roster].sort((a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id)) || bySelectedOrder(a, b));
}

let currentRoster: Roster = [];

function renderRoster(roster: Roster, { field, location }: RenderOptions = {}) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  const institutions = new Set(roster.map((p) => p.university)).size;
  const fieldPhrase = field && field !== 'all' ? ` in ${escapeHtml(field)}` : '';
  const locationName = location === 'US' ? 'the United States' : location === 'World' || !location ? 'the World' : location;
  const peopleLabel = roster.length === 1 ? 'person' : 'people';
  countEl.innerHTML = `${roster.length}${trackQualifier(roster)} ${peopleLabel}${fieldPhrase} across ${institutions} institution${institutions === 1 ? '' : 's'} in ${escapeHtml(locationName)}.`;

  currentRoster = roster;

  if (roster.length === 0) {
    rosterEl.innerHTML = '<p class="empty-state">No matches. Try a different search or filter.</p>';
    return;
  }

  rosterEl.innerHTML = roster.map((person) => renderRosterEntry(person, import.meta.env.BASE_URL)).join('');
}

async function init() {
  renderShell();

  let roster: Roster;
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
  const statsHistory = await loadStatsHistory();
  const allFacts = buildFunFacts(roster);

  // Matches everything filterRoster actually searches over (name, university, city, state, country,
  // department, rank, research areas, degree institutions, and honors) so a suggestion always yields at least one result.
  const suggestionValues = [
    ...new Set([
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
  const suggestionSources = new Map<string, string[]>([
    ['name', nameSuggestionValues],
    ['rank', [...new Set([...uniqueRanks(roster), ...roster.map((p) => canonicalRank(p) ?? '')].filter(Boolean))].sort()],
    ['field', FIELDS.filter((field) => roster.some((p) => fieldOf(p.department, p.university) === field))],
    ['track', TRACKS.filter((track) => roster.some((p) => p.track === track))],
    ['research', uniqueResearchAreas(roster)],
    ['honors', [...new Set(roster.flatMap((p) => (p.honors ?? []).flatMap((honor) => [honor.name, honor.organization ?? ''])).filter(Boolean))].sort()],
    ['university', [...new Set(roster.map((p) => p.university))].sort()],
    ['institution', INSTITUTION_TYPES.filter((type) => roster.some((p) => institutionTypeOf(p) === type))],
    ['department', uniqueDepartments(roster)],
    ['phd', uniquePhdInstitutions(roster)],
    ['undergrad', uniqueUndergradInstitutions(roster)],
  ]);
  const searchInput = document.getElementById('search') as HTMLInputElement;
  const searchScopeChip = document.getElementById('search-scope-chip') as HTMLButtonElement;
  const searchScopeChipLabel = document.getElementById('search-scope-chip-label') as HTMLElement;
  const suggestionPanel = document.getElementById('search-suggestion-panel') as HTMLElement;
  const pinSearchBtn = document.getElementById('pin-search-btn') as HTMLButtonElement;
  const healthLink = document.getElementById('health-link') as HTMLAnchorElement | null;
  const browserShelf = document.getElementById('browser-shelf') as HTMLElement;
  const locationSelect = document.getElementById('location-filter') as HTMLSelectElement;
  const fieldSelect = document.getElementById('field-filter') as HTMLSelectElement;
  const trackSelect = document.getElementById('track-filter') as HTMLSelectElement;
  const institutionTypeSelect = document.getElementById('institution-type-filter') as HTMLSelectElement;
  const sortSelect = document.getElementById('sort-order') as HTMLSelectElement;
  const filterState = { state: '', insights: false, health: false };
  const commandOutput = document.getElementById('command-output') as HTMLOutputElement;
  let queryPlan = '';
  let keyboardSelectedIndex = -1;
  let currentGrowthMetric: GrowthMetricKey = 'count';

  function showCommandOutput(message: string) {
    commandOutput.textContent = message;
    commandOutput.hidden = false;
  }

  function hideCommandOutput() {
    commandOutput.hidden = true;
    commandOutput.textContent = '';
  }

  function renderQueryPlan(matches: number, mode = 'roster') {
    const { scope, query } = effectiveSearch();
    queryPlan = [
      `mode=${mode}`,
      `scope=${scope}`,
      `query=${query.trim() ? JSON.stringify(query.trim()) : '*'}`,
      `location=${JSON.stringify(locationSelect.value)}`,
      `field=${JSON.stringify(fieldSelect.value)}`,
      `track=${JSON.stringify(trackSelect.value)}`,
      `institutionType=${JSON.stringify(institutionTypeSelect.value)}`,
      filterState.state ? `state=${JSON.stringify(filterState.state)}` : '',
      `sort=${sortSelect.value}`,
      `matches=${matches}`,
    ].filter(Boolean).join('  ');
  }

  function completeCommand(message: string) {
    clearSearch();
    showCommandOutput(message);
    update({ fromSearch: true });
  }

  function optionElement(value: string, label: string): HTMLOptionElement {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    return option;
  }

  function setOptions(select: HTMLSelectElement, entries: OptionEntry[], selectedValue: string): void {
    select.replaceChildren(...entries.map(({ value, label }) => optionElement(value, label)));
    select.value = selectedValue;
    if (select.selectedIndex < 0) select.selectedIndex = 0;
  }

  function setLocationOptions(countryEntries: OptionEntry[], continentEntries: OptionEntry[], selectedValue: string): void {
    const groups: [string, OptionEntry[]][] = [
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
  ].filter((country) => roster.some((person) => locationMatches(person, country)));
  const countryCounts = new Map(
    countryOptions.map((country) => [country, roster.filter((person) => locationMatches(person, country)).length]),
  );
  countryOptions.sort((a, b) => (countryCounts.get(b) ?? 0) - (countryCounts.get(a) ?? 0) || a.localeCompare(b));
  const continentOptions = LOCATIONS.filter((loc) => loc !== 'US' && (loc === 'World' || roster.some((person) => locationMatches(person, loc))));
  const locationOptions = [...countryOptions, ...continentOptions];
  const locationLabel = (loc: string): string => LOCATION_LABELS[loc] || `${countryFlag(loc)} ${loc}`;

  function filtersHaveResults(location: string, field: string, track: string, institutionType = 'all'): boolean {
    return roster.some((person) =>
      locationMatches(person, location) &&
      (field === 'all' || fieldOf(person.department, person.university) === field) &&
      (track === 'all' || person.track === track) &&
      (institutionType === 'all' || institutionTypeOf(person) === institutionType)
    );
  }

  function countedOptions<T>(values: readonly T[], subset: Roster, matches: (person: RosterEntry, value: T) => boolean, labelFor: (value: T) => string): OptionEntry[] {
    return values.flatMap((value) => {
      const count = subset.filter((person) => matches(person, value)).length;
      return count > 0 ? [{ value: String(value), label: `${labelFor(value)} (${count})` }] : [];
    });
  }

  function initializeDropdowns() {
    const countryEntries = countryOptions.map((country) => ({
      value: country,
      label: `${locationLabel(country)} (${countryCounts.get(country) ?? 0})`,
    }));
    const continentEntries = continentOptions.map((continent) => {
      const count = continent === 'World' ? roster.length : roster.filter((person) => locationMatches(person, continent)).length;
      return {
        value: continent,
        label: `${locationLabel(continent)} (${count})`,
      };
    });
    setLocationOptions(countryEntries, continentEntries, 'World');
    const fieldEntries = countedOptions(
      FIELDS,
      roster,
      (person, value) => fieldOf(person.department, person.university) === value,
      (value) => fieldDropdownLabel(value),
    );
    setOptions(
      fieldSelect,
      [
        { value: 'all', label: `All fields (${roster.length})` },
        ...fieldEntries,
      ],
      'all',
    );
    setOptions(
      trackSelect,
      [
        { value: 'all', label: `All Faculty (${roster.length})` },
        ...countedOptions(TRACKS, roster, (person, value) => person.track === value, (value) => value),
      ],
      'all',
    );
    setOptions(
      institutionTypeSelect,
      [
        { value: 'all', label: `All institution (${roster.length})` },
        ...countedOptions(INSTITUTION_TYPES, roster, (person, value) => institutionTypeOf(person) === value, (value) => value),
      ],
      'all',
    );
  }

  function updateDropdownHighlights() {
    locationSelect.classList.toggle('is-active', locationSelect.value !== 'World');
    fieldSelect.classList.toggle('is-active', fieldSelect.value !== 'all');
    trackSelect.classList.toggle('is-active', trackSelect.value !== 'all');
    institutionTypeSelect.classList.toggle('is-active', institutionTypeSelect.value !== 'all');
    sortSelect.classList.toggle('is-active', sortSelect.value !== 'random');
  }

  function setFilterValues({ location, field = 'all', track = 'all', institutionType = 'all' }: { location: string; field?: string; track?: string; institutionType?: string }) {
    const safeLocation = locationOptions.includes(location) && roster.some((person) => locationMatches(person, location))
      ? location
      : 'World';
    const safeFilters = filtersHaveResults(safeLocation, field, track, institutionType)
      ? { location: safeLocation, field, track, institutionType }
      : { location: safeLocation, field: 'all', track: 'all', institutionType: 'all' };
    locationSelect.value = safeFilters.location;
    fieldSelect.value = safeFilters.field;
    trackSelect.value = safeFilters.track;
    institutionTypeSelect.value = safeFilters.institutionType;
    updateDropdownHighlights();
  }

  initializeDropdowns();
  setFilterValues({ location: 'World' });

  let activeSearchScope: string | null = null;

  function renderSearchScopeChip() {
    searchScopeChip.hidden = !activeSearchScope;
    if (!activeSearchScope) {
      searchScopeChipLabel.textContent = '';
      return;
    }
    const label = KEYWORD_LABELS[activeSearchScope];
    searchScopeChipLabel.textContent = `${KEYWORD_ICONS[activeSearchScope]} ${label}`;
    searchScopeChip.setAttribute('aria-label', `Remove ${label} search scope`);
  }

  function setSearchValue(raw: string) {
    const parsed = parseKeywordQuery(raw);
    activeSearchScope = parsed?.scope ?? null;
    searchInput.value = parsed?.query ?? raw;
    renderSearchScopeChip();
  }

  function clearSearch() {
    setSearchValue('');
  }

  function searchQueryValue() {
    const query = searchInput.value.trim();
    return activeSearchScope
      ? `${KEYWORD_LABELS[activeSearchScope]}:${query ? ` ${query}` : ''}`
      : query;
  }

  // A "Keyword: value" prefix typed or pasted into the free-text box becomes a visible scope
  // chip. The chip remains the source of truth until the user removes it.
  function effectiveSearch() {
    if (activeSearchScope) {
      return { scope: activeSearchScope, query: searchInput.value, isKeyword: true };
    }
    const parsed = parseKeywordQuery(searchInput.value);
    return parsed
      ? { scope: parsed.scope, query: parsed.query, isKeyword: true }
      : { scope: 'all', query: searchInput.value, isKeyword: false };
  }

  function autoSelectLocationForQuery() {
    const { scope, query } = effectiveSearch();
    locationSelect.value = locationForQuery(roster, searchIndex, {
      query,
      searchScope: scope,
      state: filterState.state,
      currentLocation: locationSelect.value,
      field: fieldSelect.value,
      track: trackSelect.value,
      institutionType: institutionTypeSelect.value,
    });
  }

  const params = new URLSearchParams(window.location.search);
  if (params.has('q')) {
    setSearchValue(params.get('q') ?? '');
  }
  const requestedLocation = params.get('loc') ?? params.get('location');
  filterState.state = params.get('state') ?? '';
  const requestedField = params.get('field') ?? '';
  const requestedTrack = params.get('track') ?? '';
  const requestedInstitutionType = params.get('institutionType') ?? '';
  const requestedSort = params.get('sort') ?? '';
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
  filterState.health = params.get('view') === 'health';
  filterState.insights = !filterState.health && (params.get('view') === 'insights' || requestedField === 'interesting');
  let initialTrack = 'all';
  if (TRACKS.some((track) => track === requestedTrack) && roster.some((p) => p.track === requestedTrack)) {
    initialTrack = requestedTrack;
  }
  let initialInstitutionType = 'all';
  if (INSTITUTION_TYPES.some((type) => type === requestedInstitutionType)) {
    initialInstitutionType = requestedInstitutionType;
  }
  setFilterValues({ location: initialLocation, field: initialField, track: initialTrack, institutionType: initialInstitutionType });
  if (['random', 'last-name', 'first-name', 'recent', 'vp-newest'].includes(requestedSort)) {
    sortSelect.value = requestedSort;
  }

  function syncUrl() {
    const next = new URLSearchParams();
    const searchQuery = searchQueryValue();
    if (searchQuery) next.set('q', searchQuery);
    if (filterState.state) next.set('state', filterState.state);
    if (locationSelect.value !== 'World') next.set('loc', locationSelect.value);
    if (fieldSelect.value !== 'all') next.set('field', fieldSelect.value);
    if (trackSelect.value !== 'all') next.set('track', trackSelect.value);
    if (institutionTypeSelect.value !== 'all') next.set('institutionType', institutionTypeSelect.value);
    if (sortSelect.value !== 'random') next.set('sort', sortSelect.value);
    if (filterState.health) next.set('view', 'health');
    else if (filterState.insights) next.set('view', 'insights');
    const query = next.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState(null, '', url);
  }

  function pinnedSearchLabel(query: string): string {
    const params = new URLSearchParams(query);
    const labels = [
      params.get('q'),
      params.get('loc') && `in ${params.get('loc')}`,
      params.get('field'),
      params.get('track'),
      params.get('institutionType'),
    ].filter(Boolean);
    return (labels.join(' · ') || 'Saved search').slice(0, 80);
  }

  function renderBrowserShelf() {
    const currentQuery = window.location.search.slice(1);
    const pins = loadPinnedSearches();
    pinSearchBtn.disabled = !currentQuery;
    pinSearchBtn.classList.toggle('is-pinned', pins.includes(currentQuery));
    pinSearchBtn.setAttribute('aria-pressed', String(pins.includes(currentQuery)));
    pinSearchBtn.textContent = pins.includes(currentQuery) ? 'Unpin search' : 'Pin search';

    const recent = loadRecentProfiles()
      .map((id) => roster.find((person) => person.id === id))
      .filter((person): person is RosterEntry => Boolean(person));
    browserShelf.replaceChildren();
    if (!pins.length && !recent.length) {
      browserShelf.hidden = true;
      return;
    }
    browserShelf.hidden = false;
    const appendGroup = (label: string, clearAction: 'pinned' | 'recent', entries: { href: string; text: string }[]) => {
      if (!entries.length) return;
      const group = document.createElement('div');
      group.className = 'browser-shelf-group';
      const heading = document.createElement('span');
      heading.textContent = label;
      const clearButton = document.createElement('button');
      clearButton.type = 'button';
      clearButton.className = 'browser-shelf-clear';
      clearButton.dataset.clearSaved = clearAction;
      clearButton.textContent = '×';
      const clearLabel = clearAction === 'pinned' ? 'Clear pinned searches' : 'Clear recent profiles';
      clearButton.setAttribute('aria-label', clearLabel);
      clearButton.title = clearLabel;
      group.append(heading, document.createTextNode(' '), clearButton);
      entries.forEach(({ href, text }) => {
        const link = document.createElement('a');
        link.className = 'browser-shelf-chip';
        link.href = href;
        link.textContent = text;
        group.append(link);
      });
      browserShelf.append(group);
    };
    appendGroup('Pinned', 'pinned', pins.map((query) => ({ href: `${window.location.pathname}?${query}`, text: pinnedSearchLabel(query) })));
    appendGroup('Recent', 'recent', recent.map((person) => ({ href: `${import.meta.env.BASE_URL}${personPath(person.id)}`, text: displayName(person.name) })));
  }

  function update({ fromSearch = false } = {}) {
    if (fromSearch) {
      filterState.state = '';
      filterState.insights = false;
      filterState.health = false;
      autoSelectLocationForQuery();
    }
    updateDropdownHighlights();
    const countEl = document.getElementById('result-count');
    const rosterEl = document.getElementById('roster');
    if (filterState.health) {
      if (countEl) {
        countEl.textContent = 'Dataset health, metadata completeness, and verification metrics:';
      }
      if (rosterEl) {
        rosterEl.innerHTML = renderHealthPanel(roster, import.meta.env.BASE_URL);
      }
      renderQueryPlan(roster.length, 'health');
      syncUrl();
      renderBrowserShelf();
      return;
    }
    const locRoster = roster.filter((p) => locationMatches(p, locationSelect.value));
    if (filterState.insights) {
      renderFunFacts(locRoster, locationLabel(locationSelect.value), locationSelect.value, roster, statsHistory, currentGrowthMetric);
      renderQueryPlan(locRoster.length, 'insights');
      syncUrl();
      renderBrowserShelf();
      return;
    }
    const { scope, query } = effectiveSearch();
    const filtered = filterRoster(searchIndex, {
      query,
      searchScope: scope,
      state: filterState.state,
      location: locationSelect.value,
      field: fieldSelect.value,
      track: trackSelect.value,
      institutionType: institutionTypeSelect.value,
    });
    renderRoster(sortRoster(filtered, sortSelect.value), {
      field: fieldSelect.value,
      location: locationSelect.value,
    });
    keyboardSelectedIndex = -1;
    renderQueryPlan(filtered.length);
    syncUrl();
    renderBrowserShelf();
  }

  pinSearchBtn.addEventListener('click', () => {
    togglePinnedSearch(window.location.search.slice(1));
    renderBrowserShelf();
  });

  healthLink?.addEventListener('click', (e) => {
    e.preventDefault();
    filterState.health = !filterState.health;
    if (filterState.health) {
      filterState.insights = false;
    }
    update();
  });

  browserShelf.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-clear-saved]');
    if (!button) return;
    if (button.dataset.clearSaved === 'pinned') clearPinnedSearches();
    if (button.dataset.clearSaved === 'recent') clearRecentProfiles();
    renderBrowserShelf();
  });

  function resetDirectory() {
    clearSearch();
    hideCommandOutput();
    filterState.state = '';
    filterState.insights = false;
    filterState.health = false;
    setFilterValues({ location: 'World' });
    sortSelect.value = 'random';
    update();
  }

  function runCommand(raw: string): boolean {
    const command = raw.trim().toLocaleLowerCase().replace(/^:/, '');
    if (!command) return false;
    if (command === 'recent' || command === 'updates' || command === 'recently updated' || command === 'whats new') {
      sortSelect.value = 'recent';
      update();
      completeCommand('Displaying faculty sorted by most recently updated.');
      return true;
    }
    if (command === 'completeness' || command === 'health' || command === 'audit') {
      clearSearch();
      filterState.health = true;
      filterState.insights = false;
      update();
      completeCommand('Displaying dataset health, metadata completeness, and verification metrics.');
      return true;
    }
    if (command === 'insights' || command === 'facts' || command === 'diaspora' || command === 'pathways') {
      clearSearch();
      filterState.insights = true;
      filterState.health = false;
      update();
      completeCommand('Displaying diaspora insights and macro statistics.');
      return true;
    }
    if (command === 'sudo vietprofs') {
      clearSearch();
      hideSuggestions();
      hideCommandOutput();
      update();
      openRosterShell(searchIndex);
      return true;
    }
    if (command === 'help') {
      hideSuggestions();
      searchHelpPanel.hidden = false;
      searchHelpBtn.setAttribute('aria-expanded', 'true');
      completeCommand('help: query prefixes, shortcuts, and commands are listed above');
      return true;
    }
    if (command === 'visitor stats' || command === 'traffic') {
      window.location.href = `${import.meta.env.BASE_URL}stats.html`;
      return true;
    }
    if (command === 'query plan') {
      completeCommand(`query plan: ${queryPlan}`);
      return true;
    }
    if (command === 'whoami') {
      completeCommand('VietProfs — an open, community-maintained index of the Vietnamese academic diaspora.');
      return true;
    }
    if (command === 'uname -a') {
      completeCommand(`VietProfs static-web TypeScript/Vite build ${__BUILD_COMMIT__} browser/${navigator.platform || 'unknown'}`);
      return true;
    }
    if (command === 'sudo find professor' || command === 'sudo find faculty') {
      completeCommand('Permission granted. Academic credentials still require independent verification.');
      return true;
    }
    if (command === 'fortune') {
      const fortune = ACADEMIC_FORTUNES[Math.floor(Math.random() * ACADEMIC_FORTUNES.length)];
      completeCommand(`fortune: ${fortune}`);
      return true;
    }
    if (command === '/dev/random' || command === 'random') {
      const person = roster[Math.floor(Math.random() * roster.length)];
      window.location.href = `${import.meta.env.BASE_URL}${personPath(person.id)}`;
      return true;
    }
    if (command === 'theme crt') {
      const enabled = document.documentElement.classList.toggle('crt-mode');
      localStorage.setItem('vietprofs:crt', enabled ? '1' : '0');
      completeCommand(`crt theme ${enabled ? 'enabled' : 'disabled'}; reduced-motion preferences are respected`);
      return true;
    }
    if (command === 'clear' || command === 'reset') {
      resetDirectory();
      return true;
    }
    return false;
  }

  if (localStorage.getItem('vietprofs:crt') === '1') document.documentElement.classList.add('crt-mode');

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
    const { scope, query: scopedQuery, isKeyword } = effectiveSearch();
    const rawQuery = scopedQuery.trim();
    const query = rawQuery.toLocaleLowerCase();
    const selectedScope = scope !== 'all' ? scope : undefined;
    const keywordValues = selectedScope ? suggestionSources.get(selectedScope) : undefined;
    if (!query && !(keywordValues && keywordValues.length <= 20)) {
      hideSuggestions();
      return;
    }
    const source = keywordValues ?? suggestionValues;
    const sourceQuery = normalizeText(rawQuery);
    const matches = source
      .filter((value) => normalizeText(value).includes(sourceQuery))
      .sort((a, b) => {
        const aStarts = normalizeText(a).startsWith(sourceQuery);
        const bStarts = normalizeText(b).startsWith(sourceQuery);
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
      // Keep focus on the search input until the click has selected this option.
      // Otherwise its blur handler can hide the list before a mouse click arrives.
      option.addEventListener('mousedown', (event) => event.preventDefault());
      option.addEventListener('click', () => {
        setSearchValue(isKeyword ? `${KEYWORD_LABELS[scope] ?? scope}: ${value}` : value);
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
  searchInput.addEventListener('input', () => {
    if (!activeSearchScope) {
      const parsed = parseKeywordQuery(searchInput.value);
      if (parsed) {
        activeSearchScope = parsed.scope;
        searchInput.value = parsed.query;
        renderSearchScopeChip();
      }
    }
    showSuggestions();
  });
  searchInput.addEventListener('keydown', (event) => {
    const options = [...suggestionPanel.querySelectorAll<HTMLButtonElement>('.search-suggestion')];
    if (event.key === 'Escape') {
      hideSuggestions();
      if (searchInput.value || activeSearchScope) {
        event.preventDefault();
        clearSearch();
        hideCommandOutput();
        update({ fromSearch: true });
      }
      return;
    }
    if (event.key === 'Enter' && runCommand(searchQueryValue())) {
      event.preventDefault();
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

  searchScopeChip.addEventListener('click', () => {
    activeSearchScope = null;
    renderSearchScopeChip();
    hideSuggestions();
    searchInput.focus();
    update({ fromSearch: true });
  });

  const searchHelpBtn = document.getElementById('search-help-btn') as HTMLButtonElement;
  const searchHelpPanel = document.getElementById('search-help-panel') as HTMLElement;
  function hideSearchHelp() {
    searchHelpPanel.hidden = true;
    searchHelpBtn.setAttribute('aria-expanded', 'false');
  }
  searchHelpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willShow = searchHelpPanel.hidden;
    hideSuggestions();
    searchHelpPanel.hidden = !willShow;
    searchHelpBtn.setAttribute('aria-expanded', String(willShow));
  });
  document.addEventListener('click', (e) => {
    if (!searchHelpPanel.hidden && !searchHelpPanel.contains(e.target as Node) && e.target !== searchHelpBtn) {
      hideSearchHelp();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!searchHelpPanel.hidden) {
        hideSearchHelp();
      } else if (filterState.insights || filterState.health || filterState.state) {
        filterState.insights = false;
        filterState.health = false;
        filterState.state = '';
        update();
      } else if (document.activeElement === searchInput) {
        searchInput.blur();
        hideSuggestions();
      } else if (searchInput.value) {
        clearSearch();
        update();
      }
    }
    const target = e.target as HTMLElement;
    const typing = target.matches('input, textarea, select, [contenteditable="true"]');
    if (e.key === '/' && !typing) {
      e.preventDefault();
      searchInput.focus();
      showSuggestions();
      return;
    }
    if (e.key === '?' && !typing) {
      e.preventDefault();
      searchHelpBtn.click();
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    const entries = [...document.querySelectorAll<HTMLElement>('.entry')];
    if ((e.key === 'j' || e.key === 'k' || e.key === 'ArrowDown' || e.key === 'ArrowUp') && (currentRoster.length || document.querySelectorAll('.entry').length)) {
      e.preventDefault();
      const currentEntries = document.querySelectorAll<HTMLElement>('.entry');
      currentEntries[keyboardSelectedIndex]?.classList.remove('entry-keyboard-selected');
      if (e.key === 'j' || e.key === 'ArrowDown') {
        const nextIndex = keyboardSelectedIndex + 1;
        const updatedEntries = document.querySelectorAll<HTMLElement>('.entry');
        keyboardSelectedIndex = updatedEntries.length ? nextIndex % updatedEntries.length : -1;
      } else {
        const updatedEntries = document.querySelectorAll<HTMLElement>('.entry');
        keyboardSelectedIndex = updatedEntries.length ? (keyboardSelectedIndex - 1 + updatedEntries.length) % updatedEntries.length : -1;
      }
      const updatedEntries = document.querySelectorAll<HTMLElement>('.entry');
      const selected = updatedEntries[keyboardSelectedIndex];
      selected?.classList.add('entry-keyboard-selected');
      selected?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    const selected = entries[keyboardSelectedIndex];
    if (e.key === 'Enter' && selected) {
      e.preventDefault();
      selected.querySelector<HTMLAnchorElement>('.entry-name')?.click();
      return;
    }
    if (e.key === 'f' && selected) {
      e.preventDefault();
      selected.querySelector<HTMLButtonElement>('.favorite-toggle')?.click();
      return;
    }
    if (e.key === 'r') {
      e.preventDefault();
      runCommand('/dev/random');
    }
  });

  locationSelect.addEventListener('change', () => {
    filterState.state = '';
    update();
  });
  fieldSelect.addEventListener('change', () => {
    filterState.insights = false;
    filterState.health = false;
    update();
  });
  trackSelect.addEventListener('change', () => update({ fromSearch: false }));
  institutionTypeSelect.addEventListener('change', () => update({ fromSearch: false }));
  sortSelect.addEventListener('change', () => update({ fromSearch: false }));

  document.getElementById('home-link').addEventListener('click', (e) => {
    e.preventDefault(); // already on this page — reset in place instead of reloading
    resetDirectory();
  });

  // Delegated on the roster container itself (attached once) rather than per-entry/per-tile,
  // since renderRoster()/renderFunFacts() both replace its innerHTML wholesale on every update().
  document.getElementById('roster').addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const favorite = target.closest<HTMLButtonElement>('.favorite-toggle');
    if (favorite?.dataset.id) {
      applyFavoriteToggle(favorite, toggleFavorite(favorite.dataset.id));
      return;
    }
    const tile = target.closest<HTMLButtonElement>('.state-tile');
    if (tile) {
      clearSearch();
      filterState.state = tile.dataset.state || '';
      filterState.insights = false;
      filterState.health = false;
      setFilterValues({ location: 'US' }); // leaving the facts view to show filtered U.S. results
      update();
      return;
    }
    const breakdownItem = target.closest<HTMLButtonElement>('.ranked-item');
    if (breakdownItem?.dataset.filter && breakdownItem.dataset.value) {
      clearSearch();
      filterState.insights = false;
      filterState.health = false;
      const { filter, value } = breakdownItem.dataset;
      if (filter === 'field') {
        setFilterValues({ location: locationSelect.value, field: value });
      } else if (filter === 'track') {
        setFilterValues({ location: locationSelect.value, track: value });
      } else if (filter === 'country') {
        setFilterValues({ location: value });
      }
      update();
      return;
    }
    const worldMapItem = target.closest<HTMLElement>('.world-map-country, .world-map-pin, .world-map-chip');
    if (worldMapItem?.dataset.country) {
      const country = worldMapItem.dataset.country;
      clearSearch();
      filterState.insights = false;
      filterState.health = false;
      setFilterValues({ location: country });
      update();
      return;
    }
    const growthMetricBtn = target.closest<HTMLButtonElement>('.growth-metric-btn');
    if (growthMetricBtn && growthMetricBtn.dataset.metric) {
      currentGrowthMetric = growthMetricBtn.dataset.metric as GrowthMetricKey;
      const growthSection = document.getElementById('growth-section');
      if (growthSection) {
        growthSection.outerHTML = renderGrowthChart(statsHistory, currentGrowthMetric);
      }
      return;
    }
    const rankedItem = target.closest<HTMLButtonElement>('.ranked-item');
    if (rankedItem && rankedItem.dataset.search) {
      const rankedScope = rankedItem.dataset.scope;
      setSearchValue(rankedScope && KEYWORD_LABELS[rankedScope]
        ? `${KEYWORD_LABELS[rankedScope]}: ${rankedItem.dataset.search}`
        : rankedItem.dataset.search);
      filterState.insights = false;
      filterState.health = false;
      fieldSelect.value = 'all';
      trackSelect.value = 'all';
      institutionTypeSelect.value = 'all';
      update({ fromSearch: true });
    }
  });

  // mousemove fires continuously while the pointer is over the insights dashboard, so the chart's
  // serialized point list is parsed once per <svg> element and cached against it rather than on
  // every event. The chart is re-rendered (new element) whenever the metric changes.
  type GrowthPoint = [number, string, number, string?, string?];
  const growthPointsCache = new WeakMap<SVGSVGElement, GrowthPoint[]>();
  function growthPointsOf(svg: SVGSVGElement): GrowthPoint[] {
    const cached = growthPointsCache.get(svg);
    if (cached) return cached;
    let parsed: GrowthPoint[] = [];
    try {
      parsed = JSON.parse(svg.dataset.points || '[]') as GrowthPoint[];
    } catch {
      parsed = [];
    }
    growthPointsCache.set(svg, parsed);
    return parsed;
  }

  // World map hover tooltip & highlight + Growth chart crosshairs
  document.getElementById('roster').addEventListener('mousemove', (e) => {
    const target = e.target as HTMLElement;

    // 1. World Map & Chips hover
    const mapSection = target.closest<HTMLElement>('.world-map-section');
    document.querySelectorAll<HTMLElement>('.world-map-section').forEach((sec) => {
      if (sec !== mapSection) {
        sec.querySelector('.world-map-tooltip')?.setAttribute('hidden', '');
        sec.querySelectorAll('.is-hovered').forEach((el) => el.classList.remove('is-hovered'));
      }
    });

    if (mapSection) {
      const mapWrap = mapSection.querySelector<HTMLElement>('.world-map-svg-wrap');
      const tooltip = mapSection.querySelector<HTMLElement>('.world-map-tooltip');
      const countryEl = target.closest<HTMLElement | SVGElement>('.world-map-country, .world-map-pin, .world-map-chip');
      if (countryEl && countryEl.dataset.country) {
        const { country, count, flag, share } = countryEl.dataset;
        const numCount = parseInt(count || '0', 10);
        const isOrigin = country === 'Vietnam';

        mapSection.querySelectorAll('.world-map-country, .world-map-pin, .world-map-chip').forEach((el) => {
          if (el.getAttribute('data-country') === country) {
            el.classList.add('is-hovered');
          } else {
            el.classList.remove('is-hovered');
          }
        });

        if (tooltip && mapWrap) {
          tooltip.innerHTML = `
            <div class="tooltip-header">
              <span class="tooltip-flag">${flag || '🌐'}</span>
              <span class="tooltip-title">${escapeHtml(country)}</span>
            </div>
            ${isOrigin ? `
              <div class="tooltip-stat"><strong>Origin</strong> of Vietnamese diaspora</div>
              <div class="tooltip-action">Heritage &amp; roots</div>
            ` : `
              <div class="tooltip-stat">
                <strong>${numCount.toLocaleString()}</strong> ${numCount === 1 ? 'person' : 'people'}
                ${share ? `<span class="tooltip-share">(${share}% of diaspora)</span>` : ''}
              </div>
              <div class="tooltip-action">Click to filter roster by ${escapeHtml(country)}</div>
            `}
          `;
          tooltip.removeAttribute('hidden');
          const wrapRect = mapWrap.getBoundingClientRect();
          const mouseX = e.clientX - wrapRect.left;
          const mouseY = e.clientY - wrapRect.top;
          const left = Math.max(10, Math.min(wrapRect.width - 230, mouseX + 15));
          const top = Math.max(10, Math.min(wrapRect.height - 100, mouseY + 15));
          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
        }
      } else {
        mapSection.querySelectorAll('.is-hovered').forEach((el) => el.classList.remove('is-hovered'));
        if (tooltip) tooltip.setAttribute('hidden', '');
      }
    }

    // 2. Growth chart hover
    const svg = target.closest?.('.growth-chart') as SVGSVGElement | null;
    document.querySelectorAll<SVGSVGElement>('.growth-chart').forEach((el) => {
      if (el !== svg) {
        el.querySelector('.growth-crosshair')?.setAttribute('hidden', '');
        el.parentElement?.querySelector('.growth-tooltip')?.setAttribute('hidden', '');
      }
    });
    if (!svg) return;
    const points = growthPointsOf(svg);
    if (!points.length) return;
    const rect = svg.getBoundingClientRect();
    const vbWidth = svg.viewBox.baseVal.width || 640;
    const x = ((e.clientX - rect.left) / rect.width) * vbWidth;
    let nearest = points[0];
    let bestDist = Math.abs(points[0][0] - x);
    for (const p of points) {
      const d = Math.abs(p[0] - x);
      if (d < bestDist) {
        bestDist = d;
        nearest = p;
      }
    }
    const [nx, date, val, unit, pluralUnit] = nearest;
    const unitLabel = val === 1 ? (unit || svg.dataset.unit || 'item') : (pluralUnit || svg.dataset.plural || 'items');
    const crosshair = svg.querySelector<SVGLineElement>('.growth-crosshair');
    if (crosshair) {
      crosshair.setAttribute('x1', String(nx));
      crosshair.setAttribute('x2', String(nx));
      crosshair.removeAttribute('hidden');
    }
    const tooltip = svg.parentElement?.querySelector<HTMLElement>('.growth-tooltip');
    if (tooltip) {
      tooltip.textContent = `${formatRosterDate(`${date}T00:00:00Z`)}: ${val.toLocaleString()} ${unitLabel}`;
      tooltip.removeAttribute('hidden');
      tooltip.style.left = `${(nx / vbWidth) * 100}%`;
    }
  });
  document.getElementById('roster').addEventListener('mouseleave', () => {
    document.querySelectorAll<SVGSVGElement>('.growth-chart').forEach((el) => {
      el.querySelector('.growth-crosshair')?.setAttribute('hidden', '');
      el.parentElement?.querySelector('.growth-tooltip')?.setAttribute('hidden', '');
    });
    document.querySelectorAll<HTMLElement>('.world-map-tooltip').forEach((el) => el.setAttribute('hidden', ''));
    document.querySelectorAll('.world-map-country.is-hovered, .world-map-pin.is-hovered').forEach((el) => el.classList.remove('is-hovered'));
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
  const profilesWithAbout = roster.filter((p) => p.researchOverview?.text);
  const randomAboutProfile = profilesWithAbout.length
    ? profilesWithAbout[Math.floor(Math.random() * profilesWithAbout.length)]
    : null;

  const rosterStats = deriveRosterStats(roster);

  const healthMetrics = [
    `${rosterStats.total.toLocaleString('en-US')} Total Faculty Records`,
    ...rosterStats.completeness.map((c) => `${c.percentage}% ${c.label} completed`),
  ];
  const randomHealthMetric = healthMetrics[Math.floor(Math.random() * healthMetrics.length)];

  const funFactsList = buildFunFacts(roster).filter((f) => f && !f.startsWith('No faculty'));
  const randomFact = funFactsList.length
    ? funFactsList[Math.floor(Math.random() * funFactsList.length)]
    : 'Diaspora Insights';
  const cleanFact = abbreviateInsightText(randomFact.replace(/\.$/, ''));
  const shortFact = cleanFact.length > 46 ? `${cleanFact.slice(0, 43)}…` : cleanFact;

  const trafficOptions = [
    statsHistory.length > 0 ? `${statsHistory.length} Daily Snapshots` : 'Live Analytics',
    `${rosterStats.total} Roster Audits`,
    'Visitor Traffic',
  ];
  const randomTrafficMetric = trafficOptions[Math.floor(Math.random() * trafficOptions.length)];

  type Example = {
    type: 'search' | 'field' | 'track' | 'loc' | 'fact' | 'health' | 'about' | 'stats';
    value: string;
    label?: string;
    icon?: string;
    targetName?: string;
  };

  const coreExamples: Example[] = [
    { type: 'health' as const, value: 'Dataset Health', label: `Health: ${abbreviateInsightText(randomHealthMetric)}`, icon: '💚' },
    { type: 'stats' as const, value: 'Visitor Traffic', label: `Traffic: ${abbreviateInsightText(randomTrafficMetric)}`, icon: '📈' },
    ...(randomAboutProfile
      ? [{ type: 'about' as const, value: displayName(randomAboutProfile.name), label: `About: ${displayName(randomAboutProfile.name)}`, icon: '📖', targetName: displayName(randomAboutProfile.name) }]
      : []),
    { type: 'fact' as const, value: 'Diaspora Insights', label: `Insight: ${shortFact}`, icon: '💡' },
  ];

  const categoryExamples: Example[] = shuffle([
    ...pickRandomUnique(roster.map((person) => displayName(person.name)), 1).map((value) => ({ type: 'search' as const, value, label: value, icon: '👤' })),
    ...pickRandomUnique(populatedFields, 1).map((value) => ({ type: 'field' as const, value, label: abbreviateInsightText(fieldDropdownLabel(value)), icon: '🔬' })),
    ...pickRandomUnique(TRACKS.filter((track) => roster.some((person) => person.track === track)), 1).map((value) => ({ type: 'track' as const, value, label: value, icon: '🎓' })),
    ...pickRandomUnique(populatedLocations, 1).map((value) => ({ type: 'loc' as const, value, label: value, icon: '📍' })),
  ] as Example[]);

  const examples: Example[] = [...coreExamples, ...categoryExamples];
  const examplesEl = document.getElementById('examples');
  examplesEl.replaceChildren();
  const label = document.createElement('span');
  label.className = 'examples-label';
  label.textContent = 'Try:';
  examplesEl.append(label);
  for (const ex of examples) {
    const button = document.createElement('button');
    button.type = 'button';
    const chipTypeClass = ex.type === 'fact' ? ' insight-chip'
      : ex.type === 'health' ? ' health-chip'
      : ex.type === 'about' ? ' about-chip'
      : ex.type === 'stats' ? ' stats-chip'
      : '';
    button.className = `example-chip${chipTypeClass}`;
    const iconPrefix = ex.icon ? `${ex.icon} ` : '';
    button.textContent = `${iconPrefix}${ex.label ?? ex.value}`;
    if (ex.type === 'fact') button.dataset.fact = '1';
    if (ex.type === 'health') button.dataset.health = '1';
    if (ex.type === 'stats') button.dataset.stats = '1';
    if (ex.type === 'about') button.dataset.about = ex.targetName ?? ex.value;
    if (ex.type === 'field') button.dataset.field = ex.value;
    if (ex.type === 'track') button.dataset.track = ex.value;
    if (ex.type === 'loc') button.dataset.loc = ex.value;
    examplesEl.append(button);
  }
  examplesEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.example-chip');
    if (!btn) return;
    filterState.state = '';
    if (btn.dataset.stats) {
      window.location.href = `${import.meta.env.BASE_URL}stats.html`;
      return;
    }
    if (btn.dataset.health || btn.dataset.fact) {
      clearSearch();
      filterState.insights = true;
      setFilterValues({ location: locationSelect.value });
      update();
      return;
    }
    if (btn.dataset.about) {
      const targetName = btn.dataset.about;
      setSearchValue(`Name: ${targetName}`);
      filterState.insights = false;
      filterState.health = false;
      update();
      return;
    }
    if (btn.dataset.field) {
      clearSearch();
      filterState.insights = false;
      setFilterValues({ location: 'World', field: btn.dataset.field });
      update();
      return;
    }
    if (btn.dataset.track) {
      clearSearch();
      filterState.insights = false;
      setFilterValues({ location: 'World', track: btn.dataset.track });
      update();
      return;
    }
    if (btn.dataset.loc) {
      clearSearch();
      filterState.insights = false;
      setFilterValues({ location: btn.dataset.loc });
      update();
      return;
    }
    setSearchValue(btn.textContent?.replace(/^[\p{Emoji}\s]+/u, '').trim() ?? '');
    filterState.insights = false;
    // If the selected search term is not found within the current location filter, widen to
    // 'World'. Query the shared index once — filtering a one-element array per person built a
    // throwaway SearchIndex (and WeakMap) for every roster entry on each click.
    const matchesCurrent = filterRoster(searchIndex, {
      query: btn.textContent ?? '',
      location: locationSelect.value,
    }).length > 0;
    if (!matchesCurrent) {
      locationSelect.value = 'World';
    }
    fieldSelect.value = 'all';
    trackSelect.value = 'all';
    institutionTypeSelect.value = 'all';
    update();
  });

  update();

  console.info(`%cVietProfs ${__BUILD_COMMIT__}`, 'color:#2e9e64;font-weight:bold;font-size:16px');
  console.info('The roster is open source: https://github.com/dynaroars/vietprofs');
  console.info('Try typing “help”, “fortune”, or “uname -a” into search.');
}

init();
