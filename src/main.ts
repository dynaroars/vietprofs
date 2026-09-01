import './style.css';
import { loadRoster, buildSearchIndex, uniqueStates, uniqueCities, uniqueDepartments, uniqueRanks, uniqueResearchAreas, uniquePhdInstitutions, uniqueUndergradInstitutions, uniqueCountries, FIELDS, TRACKS, LOCATIONS, LOCATION_LABELS, countryFlag, canonicalRank, displayName, fieldOf, locationMatches, filterRoster, buildFunFacts, buildUsObservations, buildInternationalObservations, buildLocationObservations, buildQualifiedObservations, buildAwardsFunFacts, buildDecadeCounts, buildTopPhdInstitutions, buildTopUniversities, STATE_ABBR, type Roster } from './data.ts';
import { escapeHtml } from './utils.ts';
import { STATE_GRID } from './state-grid.ts';
import { applyFavoriteToggle, fieldDropdownLabel, renderRosterEntry } from './render.ts';
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

function debounce(fn, delayMs) {
  let timer;
  return (...args) => {
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
  const match = raw.match(/^\s*([^:]{1,24}?)\s*:\s*(.*)$/s);
  if (!match) return null;
  const key = match[1].toLowerCase().replace(/[^a-z0-9]/g, '');
  const scope = KEYWORD_ALIASES[key];
  if (!scope) return null;
  return { scope, query: match[2] };
}

function renderShell() {
  app.innerHTML = `
    <header>
      <div class="title-row">
        <h1 class="brand-link"><a class="brand-logo-link" href="${import.meta.env.BASE_URL}vietprofs-bamboo-v-2048.png" target="_blank" rel="noopener noreferrer" aria-label="View the full-size VietProfs logo"><img class="brand-logo" src="${import.meta.env.BASE_URL}vietprofs-bamboo-v.svg" alt="" width="56" height="56"></a><a class="home-link" href="${import.meta.env.BASE_URL}" id="home-link"><span>Vietnamese Academic Diaspora</span></a></h1>
        <div class="header-icons">
          <a class="icon-link roars-link" href="https://roars.dev" target="_blank" rel="noopener noreferrer" aria-label="ROARS Lab" title="ROARS Lab"></a>
          <a class="icon-link github-link" href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" title="GitHub repository">
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
          </a>
        </div>
      </div>
      <div class="subtitle-row">
        <p class="site-subtitle">An open-source directory of Vietnamese professors worldwide</p>
        <div class="header-actions">
          <a class="paper-link" href="${import.meta.env.BASE_URL}paper.pdf" target="_blank" rel="noopener noreferrer">Read the paper</a>
          <a class="submission-link" href="submit.html">Add or update info</a>
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
            <input id="search" class="search-input" type="search" placeholder="Search the roster…" aria-label="Search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="search-suggestion-panel" />
          </div>
          <div id="search-suggestion-panel" class="search-suggestion-panel" role="listbox" hidden></div>
        </div>
        <button type="button" id="search-help-btn" class="search-help-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="search-help-panel" aria-label="Search syntax help" title="Search syntax help">i</button>
        <div id="search-help-panel" class="search-help-panel" role="dialog" aria-label="Search syntax help" hidden>
          <p>Type a keyword prefix to search one field directly:</p>
          <ul>
            ${Object.entries(KEYWORD_LABELS).map(([scope, label]) => `<li><code>${escapeHtml(label)}:</code> ${escapeHtml(KEYWORD_EXAMPLES[scope] ?? '')}</li>`).join('')}
          </ul>
        </div>
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
  const fieldPhrase = field && field !== 'all' ? ` in ${escapeHtml(field)}` : '';
  const locationName = location === 'US' ? 'the United States' : location === 'World' || !location ? 'the World' : location;
  const peopleLabel = roster.length === 1 ? 'person' : 'people';
  countEl.innerHTML = `${roster.length}${trackQualifier(roster)} ${peopleLabel}${fieldPhrase} across ${universities} universit${universities === 1 ? 'y' : 'ies'} in ${escapeHtml(locationName)}.`;

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
  const worldUniversities = new Set(fullRoster.map((p) => p.university)).size;

  const selectedSection = selectedIsWorld ? '' : `
      <!-- SECTION 1: SELECTED LOCATION -->
      <section class="insights-section-block">
        <div class="insights-section-header">
          <span class="insights-badge">${escapeHtml(selectedLabel)}</span>
          <h2 class="insights-main-heading">${escapeHtml(selectedIsUs ? 'United States Academic Landscape' : `${selectedLocationLabel} Academic Landscape`)}</h2>
          <p class="insights-main-desc">${selectedRoster.length} ${selectedRoster.length === 1 ? 'person' : 'people'} across ${selectedUniversities} universit${selectedUniversities === 1 ? 'y' : 'ies'} in ${escapeHtml(selectedIsUs ? 'the United States' : selectedLocationLabel.replace(/^\S+\s+/, ''))}.</p>
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
          <p class="insights-main-desc">${fullRoster.length} people across ${worldUniversities} universities in the World.</p>
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
  const searchInput = document.getElementById('search') as HTMLInputElement;
  const searchScopeChip = document.getElementById('search-scope-chip') as HTMLButtonElement;
  const searchScopeChipLabel = document.getElementById('search-scope-chip-label') as HTMLElement;
  const suggestionPanel = document.getElementById('search-suggestion-panel') as HTMLElement;
  const locationSelect = document.getElementById('location-filter') as HTMLSelectElement;
  const fieldSelect = document.getElementById('field-filter') as HTMLSelectElement;
  const trackSelect = document.getElementById('track-filter') as HTMLSelectElement;
  const sortSelect = document.getElementById('sort-order') as HTMLSelectElement;
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
      return count > 0 ? [{ value, label: labelFor(value) }] : [];
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
        { value: 'all', label: 'All fields' },
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
        { value: 'all', label: 'All faculty types' },
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
    });
  }

  const params = new URLSearchParams(window.location.search);
  if (params.has('q')) {
    setSearchValue(params.get('q') ?? '');
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
    const searchQuery = searchQueryValue();
    if (searchQuery) next.set('q', searchQuery);
    if (filterState.state) next.set('state', filterState.state);
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
    const { scope, query } = effectiveSearch();
    const filtered = filterRoster(searchIndex, {
      query,
      searchScope: scope,
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
    const { scope, query: scopedQuery, isKeyword } = effectiveSearch();
    const rawQuery = scopedQuery.trim();
    const query = rawQuery.toLocaleLowerCase();
    const selectedScope = scope !== 'all' ? scope : undefined;
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
        setSearchValue(isKeyword ? `${KEYWORD_LABELS[scope]}: ${value}` : value);
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
    if (e.key === 'Escape' && !searchHelpPanel.hidden) hideSearchHelp();
  });

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
    clearSearch();
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
      applyFavoriteToggle(favorite, toggleFavorite(favorite.dataset.id));
      return;
    }
    const tile = target.closest<HTMLButtonElement>('.state-tile');
    if (tile) {
      clearSearch();
      filterState.state = tile.dataset.state || '';
      filterState.insights = false;
      setFilterValues({ location: 'US' }); // leaving the facts view to show filtered U.S. results
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
  const facts = buildFunFacts(roster);
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  type Example = { type: 'search' | 'field' | 'track' | 'loc' | 'fact'; value: string; label?: string };
  const examples: Example[] = shuffle([
    ...pickRandomUnique(roster.map((person) => displayName(person.name)), 2).map((value) => ({ type: 'search' as const, value })),
    ...pickRandomUnique(uniqueDepartments(roster), 1).map((value) => ({ type: 'search' as const, value })),
    ...pickRandomUnique(uniqueStates(roster), 1).map((value) => ({ type: 'search' as const, value })),
    ...pickRandomUnique(roster.flatMap((person) => person.researchAreas), 1).map((value) => ({ type: 'search' as const, value })),
    ...pickRandomUnique(populatedFields, 2).map((value) => ({ type: 'field' as const, value, label: fieldDropdownLabel(value) })),
    ...pickRandomUnique(TRACKS, 1).map((value) => ({ type: 'track' as const, value })),
    ...pickRandomUnique(populatedLocations, 1).map((value) => ({ type: 'loc' as const, value })),
  ] as Example[]);
  examples.push({ type: 'fact', value: randomFact });
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
    if (ex.type === 'fact') button.dataset.fact = '1';
    if (ex.type === 'field') button.dataset.field = ex.value;
    if (ex.type === 'track') button.dataset.track = ex.value;
    if (ex.type === 'loc') button.dataset.loc = ex.value;
    examplesEl.append(button);
  }
  examplesEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.example-chip');
    if (!btn) return;
    filterState.state = '';
    if (btn.dataset.fact) {
      clearSearch();
      filterState.insights = true;
      setFilterValues({ location: locationSelect.value });
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
    setSearchValue(btn.textContent ?? '');
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
