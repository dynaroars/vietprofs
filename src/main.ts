import './style.css';
import { loadProjectStats } from './project-stats.ts';
import {
  FIELDS,
  INSTITUTION_TYPES,
  LOCATION_LABELS,
  LOCATIONS,
  TRACKS,
  buildSearchIndex,
  canonicalRank,
  countryFlag,
  displayName,
  fieldOf,
  fieldPath,
  fieldRegionPath,
  filterRoster,
  hasEnoughPeopleForRosterHub,
  institutionTypeOf,
  loadRelationships,
  loadRoster,
  locationMatches,
  personPath,
  regionPath,
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
} from './data.ts';
import { abbreviateInsightText, escapeHtml } from './utils.ts';
import { applyFavoriteToggle, fieldDropdownLabel, renderRosterEntry } from './render.ts';
import { clearRecentProfiles, loadFavorites, loadRecentProfiles, toggleFavorite } from './favorites-store.ts';
import { locationForQuery } from './filter-state.ts';
import { renderAddFab } from './add-fab.ts';
import { ICONS } from './see-also.ts';
import { renderShareMenu } from './share.ts';
import { renderFunFacts, renderHealthPanel } from './insights.ts';
import {
  createCommandHandler,
  createSearchController,
  focusQuietly,
  hideCommandOutput as hideCommandOutputEl,
  parseKeywordQuery as parseKeywordQueryShared,
  setupKeyboardShortcuts,
  setupSearchHelp,
} from './search-kit.ts';
import { setupBackToTop } from './back-to-top.ts';

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
  connection: 'Connection',
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
  connection: '🔗',
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
  connection: 'co-author, mentorship',
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
  connection: 'connection',
  connections: 'connection',
};

function parseKeywordQuery(raw: string): { scope: string; query: string } | null {
  const parsed = parseKeywordQueryShared(raw, (key) => KEYWORD_ALIASES[key]);
  return parsed ? { scope: parsed.key, query: parsed.query } : null;
}

const PAPER_ICON = 'M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V9h5.5L13 3.5ZM8 13h8v1.5H8V13Zm0 3.5h8V18H8v-1.5Z';
const EXTERNAL = ' target="_blank" rel="noopener noreferrer"';

// Header links are icon-only; the label is the accessible name and the hover tooltip.
function siteNavLink(href: string, label: string, icon: string, attrs = ''): string {
  const name = escapeHtml(label);
  return `<a href="${escapeHtml(href)}"${attrs} aria-label="${name}" title="${name}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icon}"/></svg></a>`;
}

function renderShell() {
  app.innerHTML = `
    <header>
      <div class="title-row">
        <h1><a class="home-link brand-link" href="${import.meta.env.BASE_URL}" id="home-link" title="A Public Directory of the Vietnamese Academic and Research Diaspora Worldwide"><img class="brand-logo" src="${import.meta.env.BASE_URL}vietprofs-bamboo-v.svg" alt="" width="56" height="56"><span>Vietnamese Academic Diaspora</span></a></h1>
        <div class="header-icons">
          <a class="icon-link roars-link" href="https://roars.dev" target="_blank" rel="noopener noreferrer" aria-label="ROARS Lab website" title="ROARS Lab website"></a>
          <a class="icon-link github-link" href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" title="GitHub repository and source code">
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
          </a>
        </div>
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
            <button id="search-state-chip" class="search-scope-chip" type="button" aria-label="Remove state filter" hidden>
              <span id="search-state-chip-label"></span>
              <span class="search-scope-chip-remove" aria-hidden="true">×</span>
            </button>
            <input id="search" class="search-input" type="search" autocomplete="off" placeholder="Search by name, field, or university" aria-label="Search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="search-suggestion-panel" />
            <button type="button" id="search-help-btn" class="search-help-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="search-help-panel" aria-label="Search syntax and keyboard help" title="Search syntax and keyboard help"><span class="search-help-icon" aria-hidden="true">?</span></button>
          </div>
          <div id="search-suggestion-panel" class="search-suggestion-panel" role="listbox" hidden></div>
        </div>
        <div id="search-help-panel" class="search-help-panel" role="dialog" aria-label="Search syntax help" hidden>
          <p><strong>QUERY SYNTAX</strong></p>
          <p>Type a keyword prefix to search one field directly:</p>
          <ul>
            ${Object.entries(KEYWORD_LABELS).map(([scope, label]) => `<li><code>${escapeHtml(label)}:</code> ${escapeHtml(KEYWORD_EXAMPLES[scope] ?? '')}</li>`).join('')}
          </ul>
          <p><strong>KEYBOARD</strong></p>
          <p><code>/</code> search · <code>j</code>/<code>k</code> move · <code>Enter</code> open · <code>f</code> favorite · <code>r</code> random · <code>Esc</code> clear</p>
          <p><strong>COMMANDS</strong></p>
          <p><code>help</code> · <code>query plan</code> · <code>clear</code></p>
        </div>
      </div>
      <select id="location-filter" class="field-select location-select" aria-label="Filter by location">
      </select>
      <select id="field-filter" class="field-select" aria-label="Filter by field">
        <option value="all">All Fields</option>
      </select>
      <select id="track-filter" class="field-select track-select" aria-label="Filter by faculty track">
        <option value="all">All Tracks</option>
      </select>
      <select id="sort-order" class="field-select sort-select" aria-label="Sort order">
        <option value="random">Random order</option>
        <option value="vp-newest">Most recently added</option>
        <option value="last-name">Last name</option>
        <option value="first-name">First name</option>
      </select>
    </div>
    <nav class="browser-shelf" id="browser-shelf" aria-label="Saved browser data" hidden></nav>
    <output class="command-output" id="command-output" aria-live="polite" hidden></output>
    <div class="examples" id="examples"></div>
    <div class="result-row">
      <p class="result-count" id="result-count" aria-live="polite"></p>
      <nav class="site-nav" aria-label="Site">
          ${siteNavLink('index.html?view=insights', 'Diaspora Insights & Pathways', ICONS.insights, ' data-view="insights"')}
          ${siteNavLink('connections.html', 'Academic Connections', ICONS.connections)}
          ${siteNavLink('index.html?view=health', 'Data Health & Completeness', ICONS.health, ' data-view="health"')}
          ${siteNavLink(`${import.meta.env.BASE_URL}vietprofs.pdf`, 'Read the paper (PDF)', PAPER_ICON, EXTERNAL)}
          ${renderShareMenu({ title: 'VietProfs: Vietnamese professors worldwide' })}
        </nav>
    </div>
    <div class="roster" id="roster"></div>
    ${renderAddFab('submit.html')}
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
  'Admin and Staff': {
    label: 'admin-and-staff',
    tooltip: 'A senior academic leader (dean, provost, president) without a faculty rank on another track, or a faculty-status or senior permanent academic librarian or archivist — not an ordinary staff or temporary role.',
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
  hasIntersectionHub?: boolean;
  hasLocationHub?: boolean;
  availableRegionHubs?: ReadonlySet<string>;
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
      : order === 'vp-newest'
        ? (a: RosterEntry, b: RosterEntry) => (Number.parseInt(b.id.replace(/\D/g, ''), 10) || 0) - (Number.parseInt(a.id.replace(/\D/g, ''), 10) || 0)
        : () => 0;

  return [...roster].sort((a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id)) || bySelectedOrder(a, b));
}

let currentRoster: Roster = [];

function renderRoster(roster: Roster, { field, location, hasIntersectionHub = false, hasLocationHub = false, availableRegionHubs = new Set<string>() }: RenderOptions = {}) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  const institutions = new Set(roster.map((p) => p.university)).size;
  const isFieldFiltered = Boolean(field && field !== 'all');
  const isLocationFiltered = Boolean(location && location !== 'World');
  const locationTargetName = location === 'US' ? 'United States' : location ?? 'United States';
  const fieldTarget = isFieldFiltered
    ? `${import.meta.env.BASE_URL}${hasIntersectionHub && isLocationFiltered
      ? fieldRegionPath(field as string, locationTargetName)
      : fieldPath(field as string)}`
    : '';
  const fieldPhrase = isFieldFiltered
    ? ` in <a class="result-count-link" href="${fieldTarget}" title="Open ${escapeHtml(field as string)}${hasIntersectionHub && isLocationFiltered ? ` in ${escapeHtml(locationTargetName)}` : ''} hub">${escapeHtml(field as string)} ↗</a>`
    : '';
  const locationTarget = isLocationFiltered
    ? `${import.meta.env.BASE_URL}${regionPath(locationTargetName)}`
    : '';
  const rawLocationName = location === 'US' ? 'the United States' : location === 'World' || !location ? 'the World' : location;
  const locationPhrase = isLocationFiltered && hasLocationHub
    ? `<a class="result-count-link" href="${locationTarget}" title="Open ${escapeHtml(rawLocationName)} region hub">${escapeHtml(rawLocationName)} ↗</a>`
    : escapeHtml(rawLocationName);
  const peopleLabel = roster.length === 1 ? 'person' : 'people';
  countEl.innerHTML = `${roster.length}${trackQualifier(roster)} ${peopleLabel}${fieldPhrase} across ${institutions} institution${institutions === 1 ? '' : 's'} in ${locationPhrase}.`;

  currentRoster = roster;

  if (roster.length === 0) {
    rosterEl.innerHTML = '<p class="empty-state">No matches. Try a different search or filter.</p>';
    return;
  }

  rosterEl.innerHTML = roster.map((person) => {
    const countryTarget = person.country && !['United States', 'US', 'USA'].includes(person.country) ? person.country : 'United States';
    return renderRosterEntry(person, import.meta.env.BASE_URL, availableRegionHubs.has(countryTarget));
  }).join('');
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
  const relationshipDatabase = await loadRelationships();
  const searchIndex = buildSearchIndex(roster);
  const regionHubCandidates = [...new Set([
    ...LOCATIONS.filter((location) => location !== 'World').map((location) => location === 'US' ? 'United States' : location),
    ...uniqueCountries(roster),
  ])];
  const availableRegionHubs = new Set(regionHubCandidates.filter((region) =>
    hasEnoughPeopleForRosterHub(filterRoster(roster, { location: region }).length)));

  const projectStats = await loadProjectStats();

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
  // The full placeholder doesn't fit a phone-width box.
  const narrowScreen = window.matchMedia('(max-width: 560px)');
  const rosterSize = roster.length.toLocaleString('en-US');
  const applySearchPlaceholder = () => {
    searchInput.placeholder = narrowScreen.matches
      ? `Search ${rosterSize} people`
      : `Search ${rosterSize} people by name, field, or university`;
  };
  applySearchPlaceholder();
  narrowScreen.addEventListener('change', applySearchPlaceholder);
  const searchScopeChip = document.getElementById('search-scope-chip') as HTMLButtonElement;
  const searchScopeChipLabel = document.getElementById('search-scope-chip-label') as HTMLElement;
  const searchStateChip = document.getElementById('search-state-chip') as HTMLButtonElement;
  const searchStateChipLabel = document.getElementById('search-state-chip-label') as HTMLElement;
  const suggestionPanel = document.getElementById('search-suggestion-panel') as HTMLElement;
  const healthLink = document.getElementById('health-link') as HTMLAnchorElement | null;
  const browserShelf = document.getElementById('browser-shelf') as HTMLElement;
  const locationSelect = document.getElementById('location-filter') as HTMLSelectElement;
  const fieldSelect = document.getElementById('field-filter') as HTMLSelectElement;
  const trackSelect = document.getElementById('track-filter') as HTMLSelectElement;
  const sortSelect = document.getElementById('sort-order') as HTMLSelectElement;
  const filterState = { state: '', insights: false, health: false };
  const commandOutput = document.getElementById('command-output') as HTMLOutputElement;
  let queryPlan = '';
  let keyboardSelectedIndex = -1;
  // Search box: a typed/pasted "Keyword: value" prefix becomes a removable scope chip
  // (createSearchController in the shared search-kit), with an in-page suggestion listbox.
  // An in-page listbox rather than a native <datalist>: browser-owned datalist popups can
  // flicker or close while the debounced search results update, especially in Chromium.
  const search = createSearchController({
    input: searchInput,
    scopeChip: searchScopeChip,
    scopeChipLabel: searchScopeChipLabel,
    suggestionPanel,
    keywordMeta: Object.fromEntries(Object.entries(KEYWORD_LABELS)
      .map(([scope, label]) => [scope, { label, icon: KEYWORD_ICONS[scope] }])),
    resolveKey: (key) => KEYWORD_ALIASES[key],
    // Free text completes over everything filterRoster searches; scopes without their own list
    // (e.g. Connection) fall back to the same combined list.
    getSuggestions: (key) => suggestionSources.get(key) ?? suggestionValues,
    unscopedKey: 'all',
    showAllWhenEmpty: 20,
    formatQuery: (_key, label, query) => `${label}:${query ? ` ${query}` : ''}`,
    debounceMs: 150,
    onChange: () => update({ fromSearch: true }),
    onClear: () => hideCommandOutput(),
    onCommand: (raw) => runCommand(raw),
  });

  function renderStateFilterChip() {
    searchStateChip.hidden = !filterState.state;
    if (!filterState.state) {
      searchStateChipLabel.textContent = '';
      return;
    }
    searchStateChipLabel.textContent = `📍 ${filterState.state}`;
    searchStateChip.setAttribute('aria-label', `Remove ${filterState.state} state filter`);
  }

  function setSearchValue(raw: string) {
    search.setSearchValue(raw);
  }

  function clearSearch() {
    setSearchValue('');
  }

  function searchQueryValue() {
    return search.searchQueryValue();
  }

  // The scope chip remains the source of truth until the user removes it.
  function effectiveSearch() {
    const activeSearchScope = search.activeScope();
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
      relationships: relationshipDatabase,
    });
  }

  function hideCommandOutput() {
    hideCommandOutputEl(commandOutput);
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
      filterState.state ? `state=${JSON.stringify(filterState.state)}` : '',
      `sort=${sortSelect.value}`,
      `matches=${matches}`,
    ].filter(Boolean).join('  ');
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
    if (locationSelect.selectedIndex < 0) {
      const worldOption = locationSelect.querySelector('option[value="World"]') as HTMLOptionElement | null;
      if (worldOption) {
        locationSelect.value = 'World';
      } else {
        locationSelect.selectedIndex = 0;
      }
    }
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
  const continentCounts = new Map(
    continentOptions.map((continent) => [
      continent,
      continent === 'World' ? roster.length : roster.filter((person) => locationMatches(person, continent)).length,
    ]),
  );
  continentOptions.sort((a, b) => (continentCounts.get(b) ?? 0) - (continentCounts.get(a) ?? 0) || a.localeCompare(b));
  const locationOptions = [...countryOptions, ...continentOptions];
  const locationLabel = (loc: string): string => LOCATION_LABELS[loc] || `${countryFlag(loc)} ${loc}`;

  function filtersHaveResults(location: string, field: string, track: string): boolean {
    return roster.some((person) =>
      locationMatches(person, location) &&
      (field === 'all' || fieldOf(person.department, person.university) === field) &&
      (track === 'all' || person.track === track)
    );
  }

  const fieldCounts = new Map(
    FIELDS.map((field) => [field, roster.filter((person) => fieldOf(person.department, person.university) === field).length]),
  );
  const sortedFields = [...FIELDS].sort((a, b) => (fieldCounts.get(b) ?? 0) - (fieldCounts.get(a) ?? 0) || a.localeCompare(b));

  const trackCounts = new Map(
    TRACKS.map((track) => [track, roster.filter((person) => person.track === track).length]),
  );
  const sortedTracks = [...TRACKS].sort((a, b) => (trackCounts.get(b) ?? 0) - (trackCounts.get(a) ?? 0) || a.localeCompare(b));


  function updateDropdownCounts() {
    const { scope, query } = effectiveSearch();
    const currentLoc = locationSelect.value || 'World';
    const currentField = fieldSelect.value || 'all';
    const currentTrack = trackSelect.value || 'all';

    const locationContext = filterRoster(searchIndex, {
      query,
      searchScope: scope,
      state: undefined,
      location: 'World',
      field: currentField,
      track: currentTrack,
      relationships: relationshipDatabase,
    });
    const countryEntries: OptionEntry[] = [];
    for (const country of countryOptions) {
      const count = locationContext.filter((p) => locationMatches(p, country)).length;
      if (count > 0) {
        countryEntries.push({ value: country, label: `${locationLabel(country)} (${count})` });
      }
    }
    const continentEntries: OptionEntry[] = [];
    for (const continent of continentOptions) {
      const count = continent === 'World'
        ? locationContext.length
        : locationContext.filter((p) => locationMatches(p, continent)).length;
      if (continent === 'World' || count > 0) {
        continentEntries.push({ value: continent, label: `${locationLabel(continent)} (${count})` });
      }
    }
    setLocationOptions(countryEntries, continentEntries, currentLoc);

    const fieldContext = filterRoster(searchIndex, {
      query,
      searchScope: scope,
      state: filterState.state,
      location: locationSelect.value || 'World',
      field: 'all',
      track: currentTrack,
      relationships: relationshipDatabase,
    });
    const fieldEntries: OptionEntry[] = [
      { value: 'all', label: `All Fields (${fieldContext.length})` },
    ];
    for (const field of sortedFields) {
      const count = fieldContext.filter((p) => fieldOf(p.department, p.university) === field).length;
      if (count > 0) {
        fieldEntries.push({ value: field, label: `${fieldDropdownLabel(field)} (${count})` });
      }
    }
    setOptions(fieldSelect, fieldEntries, currentField);

    const trackContext = filterRoster(searchIndex, {
      query,
      searchScope: scope,
      state: filterState.state,
      location: locationSelect.value || 'World',
      field: fieldSelect.value || 'all',
      track: 'all',
      relationships: relationshipDatabase,
    });
    const trackEntries: OptionEntry[] = [
      { value: 'all', label: `All Tracks (${trackContext.length})` },
    ];
    for (const track of sortedTracks) {
      const count = trackContext.filter((p) => p.track === track).length;
      if (count > 0) {
        trackEntries.push({ value: track, label: `${track} (${count})` });
      }
    }
    setOptions(trackSelect, trackEntries, currentTrack);

    // A closed dropdown shows only its choice; the counts are for comparing options in the open list.
    for (const select of [locationSelect, fieldSelect, trackSelect]) {
      const selected = select.selectedOptions[0];
      if (selected) selected.textContent = selected.textContent?.replace(/ \([\d,]+\)$/, '') ?? '';
    }
  }

  function initializeDropdowns() {
    updateDropdownCounts();
  }

  function updateDropdownHighlights() {
    locationSelect.classList.toggle('is-active', locationSelect.value !== 'World');
    fieldSelect.classList.toggle('is-active', fieldSelect.value !== 'all');
    trackSelect.classList.toggle('is-active', trackSelect.value !== 'all');
    sortSelect.classList.toggle('is-active', sortSelect.value !== 'random');
  }

  function setFilterValues({ location, field = 'all', track = 'all' }: { location: string; field?: string; track?: string }) {
    const safeLocation = locationOptions.includes(location) && roster.some((person) => locationMatches(person, location))
      ? location
      : 'World';
    const safeFilters = filtersHaveResults(safeLocation, field, track)
      ? { location: safeLocation, field, track }
      : { location: safeLocation, field: 'all', track: 'all' };
    locationSelect.value = safeFilters.location;
    fieldSelect.value = safeFilters.field;
    trackSelect.value = safeFilters.track;
    updateDropdownHighlights();
  }

  const params = new URLSearchParams(window.location.search);
  // Institution type used to be a dropdown; old links with ?institutionType= become the keyword search.
  const requestedInstitutionType = params.get('institutionType') ?? '';
  if (params.has('q')) {
    setSearchValue(params.get('q') ?? '');
  } else if (INSTITUTION_TYPES.some((type) => type === requestedInstitutionType)) {
    setSearchValue(`${KEYWORD_LABELS.institution}: ${requestedInstitutionType}`);
  }
  const requestedLocation = params.get('loc') ?? params.get('location');
  filterState.state = params.get('state') ?? '';
  const requestedField = params.get('field') ?? '';
  // 'Academic staff' was renamed 'Admin and Staff'; keep old shared links working.
  const requestedTrack = (params.get('track') ?? '').replace(/^Academic staff$/, 'Admin and Staff');
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
  initializeDropdowns();
  setFilterValues({ location: initialLocation, field: initialField, track: initialTrack });
  if (['random', 'last-name', 'first-name', 'vp-newest'].includes(requestedSort)) {
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
    if (sortSelect.value !== 'random') next.set('sort', sortSelect.value);
    if (filterState.health) next.set('view', 'health');
    else if (filterState.insights) next.set('view', 'insights');
    const query = next.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState(null, '', url);
  }

  function renderBrowserShelf() {
    const recent = loadRecentProfiles()
      .map((id) => roster.find((person) => person.id === id))
      .filter((person): person is RosterEntry => Boolean(person));
    browserShelf.replaceChildren();
    if (!recent.length) {
      browserShelf.hidden = true;
      return;
    }
    browserShelf.hidden = false;
    const group = document.createElement('div');
    group.className = 'browser-shelf-group';
    const heading = document.createElement('span');
    heading.textContent = 'Recent';
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'browser-shelf-clear';
    clearButton.dataset.clearSaved = 'recent';
    clearButton.textContent = '×';
    clearButton.setAttribute('aria-label', 'Clear recent profiles');
    clearButton.title = 'Clear recent profiles';
    group.append(heading, document.createTextNode(' '), clearButton);
    recent.forEach((person) => {
      const link = document.createElement('a');
      link.className = 'browser-shelf-chip';
      link.href = `${import.meta.env.BASE_URL}${personPath(person.id)}`;
      link.textContent = displayName(person.name);
      group.append(link);
    });
    browserShelf.append(group);
  }

  function update({ fromSearch = false } = {}) {
    if (fromSearch) {
      filterState.state = '';
      filterState.insights = false;
      filterState.health = false;
      autoSelectLocationForQuery();
    }
    updateDropdownHighlights();
    updateDropdownCounts();
    renderStateFilterChip();
    const countEl = document.getElementById('result-count');
    const rosterEl = document.getElementById('roster');
    if (filterState.health) {
      if (countEl) {
        countEl.textContent = 'Dataset health, metadata completeness, and verification metrics:';
      }
      if (rosterEl) {
        rosterEl.innerHTML = renderHealthPanel(roster, import.meta.env.BASE_URL, true, projectStats);
      }
      renderQueryPlan(roster.length, 'health');
      syncUrl();
      renderBrowserShelf();
      return;
    }
    const locRoster = roster.filter((p) => locationMatches(p, locationSelect.value));
    if (filterState.insights) {
      renderFunFacts(locRoster, locationLabel(locationSelect.value), locationSelect.value, roster);
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
      relationships: relationshipDatabase,
    });
    renderRoster(sortRoster(filtered, sortSelect.value), {
      field: fieldSelect.value,
      location: locationSelect.value,
      hasIntersectionHub: fieldSelect.value !== 'all'
        && locationSelect.value !== 'World'
        && hasEnoughPeopleForRosterHub(filterRoster(roster, { field: fieldSelect.value, location: locationSelect.value }).length),
      hasLocationHub: locationSelect.value !== 'World'
        && availableRegionHubs.has(locationSelect.value === 'US' ? 'United States' : locationSelect.value),
      availableRegionHubs,
    });
    keyboardSelectedIndex = -1;
    renderQueryPlan(filtered.length);
    syncUrl();
    renderBrowserShelf();
  }

  // Insights and Health are views of this page, so switch in place instead of reloading 2,000 entries.
  document.querySelector('.site-nav')?.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-view]');
    if (!link) return;
    e.preventDefault();
    clearSearch();
    filterState.health = link.dataset.view === 'health';
    filterState.insights = link.dataset.view === 'insights';
    update();
    window.scrollTo({ top: 0 });
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

  const searchHelp = setupSearchHelp({
    btn: document.getElementById('search-help-btn') as HTMLButtonElement,
    panel: document.getElementById('search-help-panel') as HTMLElement,
    onBeforeToggle: () => search.close(),
  });

  // The shared help / query plan / clear commands; every other input is a search.
  const runCommand = createCommandHandler({
    input: searchInput,
    getSearch: () => search,
    commandOutputEl: commandOutput,
    help: searchHelp,
    onUpdate: () => update({ fromSearch: true }),
    getQueryPlan: () => queryPlan,
    resetDirectory,
  });

  searchStateChip.addEventListener('click', () => {
    filterState.state = '';
    renderStateFilterChip();
    update();
  });

  // j/k (or arrows) move, Enter opens, f favorites, r random, / search, ? help, and Escape steps
  // back: close help → leave insights/health/state filter → blur search → clear search.
  setupKeyboardShortcuts({
    input: searchInput,
    help: searchHelp,
    getItemElements: () => [...document.querySelectorAll<HTMLElement>('.entry')],
    getSelectedIndex: () => keyboardSelectedIndex,
    setSelectedIndex: (index) => { keyboardSelectedIndex = index; },
    selectedClass: 'entry-keyboard-selected',
    nextKeys: ['j', 'ArrowDown'],
    prevKeys: ['k', 'ArrowUp'],
    isNavigable: () => currentRoster.length > 0 || document.querySelectorAll('.entry').length > 0,
    onEnter: (selected) => selected.querySelector<HTMLAnchorElement>('.entry-name')?.click(),
    onSecondary: (selected) => selected.querySelector<HTMLButtonElement>('.favorite-toggle')?.click(),
    onRandom: () => runCommand('/dev/random'),
    escape: {
      onEscape: () => {
        if (!(filterState.insights || filterState.health || filterState.state)) return false;
        filterState.insights = false;
        filterState.health = false;
        filterState.state = '';
        update();
        return true;
      },
      closeSuggestions: () => search.close(),
      clearSearch: () => {
        clearSearch();
        update();
      },
    },
  });

  locationSelect.addEventListener('change', () => {
    filterState.state = '';
    filterState.insights = false;
    filterState.health = false;
    update();
  });
  fieldSelect.addEventListener('change', () => {
    filterState.insights = false;
    filterState.health = false;
    update();
  });
  trackSelect.addEventListener('change', () => {
    filterState.insights = false;
    filterState.health = false;
    update({ fromSearch: false });
  });
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
      update({ fromSearch: true });
    }
  });

  // World map hover tooltip & highlight
  document.getElementById('roster').addEventListener('mousemove', (e) => {
    const target = e.target as HTMLElement;

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
  });
  document.getElementById('roster').addEventListener('mouseleave', () => {
    document.querySelectorAll<HTMLElement>('.world-map-tooltip').forEach((el) => el.setAttribute('hidden', ''));
    document.querySelectorAll('.world-map-country.is-hovered, .world-map-pin.is-hovered').forEach((el) => el.classList.remove('is-hovered'));
  });

  setupBackToTop(document.getElementById('back-to-top'));

  const populatedFields = FIELDS.filter((field) => filtersHaveResults('World', field, 'all'));
  const populatedLocations = locationOptions.filter((location) =>
    !['US', 'World'].includes(location) && filtersHaveResults(location, 'all', 'all')
  );
  type Example = { type: 'field' | 'track' | 'loc'; value: string; label: string };

  // A few plain filter suggestions; facts and stats live in Insights, Health, and Stats.
  const examples: Example[] = shuffle([
    ...pickRandomUnique(populatedFields, 1).map((value) => ({ type: 'field' as const, value, label: abbreviateInsightText(fieldDropdownLabel(value)) })),
    ...pickRandomUnique(TRACKS.filter((track) => roster.some((person) => person.track === track)), 1).map((value) => ({ type: 'track' as const, value, label: value })),
    ...pickRandomUnique(populatedLocations, 2).map((value) => ({ type: 'loc' as const, value, label: value })),
  ]);
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
    button.textContent = ex.label;
    if (ex.type === 'field') button.dataset.field = ex.value;
    if (ex.type === 'track') button.dataset.track = ex.value;
    if (ex.type === 'loc') button.dataset.loc = ex.value;
    examplesEl.append(button);
  }
  examplesEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.example-chip');
    if (!btn) return;
    filterState.state = '';
    if (btn.dataset.field) {
      clearSearch();
      filterState.insights = false;
      filterState.health = false;
      setFilterValues({ location: 'World', field: btn.dataset.field });
      update();
      return;
    }
    if (btn.dataset.track) {
      clearSearch();
      filterState.insights = false;
      filterState.health = false;
      setFilterValues({ location: 'World', track: btn.dataset.track });
      update();
      return;
    }
    if (btn.dataset.loc) {
      clearSearch();
      filterState.insights = false;
      filterState.health = false;
      setFilterValues({ location: btn.dataset.loc });
      update();
    }
  });

  update();
  // Land ready to type, as on cspicks; leave focus alone if the reader already moved it.
  if (document.activeElement === document.body) {
    focusQuietly(searchInput);
  }

  console.info(`%cVietProfs ${__BUILD_COMMIT__}`, 'color:#2e9e64;font-weight:bold;font-size:16px');
  console.info('The roster is open source: https://github.com/dynaroars/vietprofs');
}

init();
