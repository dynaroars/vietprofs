import {
  STATE_ABBR,
  buildAwardsFunFacts,
  buildDecadeCounts,
  buildFieldCounts,
  buildInternationalObservations,
  buildLocationObservations,
  buildPhdToFacultyPairings,
  buildQualifiedObservations,
  buildTopCountries,
  buildTopPhdInstitutions,
  buildTopUndergradInstitutions,
  buildTopUniversities,
  buildTrackCounts,
  buildUsObservations,
  countryFlag,
  type Roster,
  type StatsHistoryPoint,
} from './data.ts';
import { STATE_GRID } from './state-grid.ts';
import { escapeHtml } from './utils.ts';
import { renderWorldMap } from './world-map.ts';

export { renderWorldMap };

export function heatTier(count: number, max: number): number {
  if (count === 0 || max === 0) return 0;
  const ratio = count / max;
  if (ratio > 0.66) return 4;
  if (ratio > 0.33) return 3;
  if (ratio > 0.1) return 2;
  return 1;
}

export function calculationBasis(roster: Roster, scope: string): string {
  const universities = new Set(roster.map((person) => person.university)).size;
  return `<details class="calculation-details"><summary>show calculation basis</summary><code>source=public/data.json · scope=${escapeHtml(scope)} · records=${roster.length} · universities=${universities} · generated in browser from explicit roster fields</code></details>`;
}

export const NGUYEN_TOOLTIP = 'Nguyễn was Vietnam’s last ruling dynasty (1802–1945); many people adopted '
  + 'or were assigned the name under it, which is why it’s estimated to be shared by nearly 40% '
  + 'of Vietnamese people today.';

export function renderStateGrid(roster: Roster): string {
  const counts = new Map<string | undefined, number>();
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

export function renderWorldCountryGrid(roster: Roster): string {
  const counts = new Map<string, number>();
  for (const p of roster) {
    const country = p.country || 'United States';
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }
  if (counts.size === 0) return '';
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const max = sorted[0] ? sorted[0][1] : 1;
  const total = roster.length || 1;

  const tiles = sorted.map(([country, count]) => {
    const tier = heatTier(count, max);
    const flag = countryFlag(country);
    const pct = Math.round((count / total) * 100);
    const label = `${flag} ${country}: ${count} ${count === 1 ? 'person' : 'people'} (${pct}%)`;
    return `
      <button type="button" class="country-grid-tile heat-${tier} ranked-item" data-filter="country" data-value="${escapeHtml(country)}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">
        <span class="country-flag" aria-hidden="true">${flag}</span>
        <span class="country-name">${escapeHtml(country)}</span>
        <span class="country-count">${count}</span>
        <span class="country-share">${pct}%</span>
      </button>
    `;
  }).join('');

  return `
    <div class="insights-section">
      <h3 class="insights-heading">Global Diaspora Host Country Map Grid</h3>
      <p class="insights-caption">Faculty distribution across ${counts.size} host countries worldwide — darker tiles indicate higher counts; click a tile to filter by country.</p>
      <div class="country-grid">${tiles}</div>
    </div>
  `;
}

export function renderAlmaMaterOriginsMap(subRoster: Roster): string {
  const topUndergrad = buildTopUndergradInstitutions(subRoster, 6);
  const topPhd = buildTopPhdInstitutions(subRoster, 6);
  if (topUndergrad.length === 0 && topPhd.length === 0) return '';
  const maxUg = topUndergrad[0] ? topUndergrad[0][1] : 1;
  const maxPhd = topPhd[0] ? topPhd[0][1] : 1;

  const ugRows = topUndergrad
    .map(([inst, count], idx) => {
      const pct = Math.round((count / maxUg) * 100);
      return `
        <button type="button" class="ranked-item" data-search="${escapeHtml(inst)}" data-scope="undergrad" title="Search faculty with undergrad degree from ${escapeHtml(inst)}">
          <div class="ranked-header">
            <span class="ranked-name"><span class="ranked-num">${idx + 1}.</span> ${escapeHtml(inst)}</span>
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
        <button type="button" class="ranked-item" data-search="${escapeHtml(inst)}" data-scope="phd" title="Search faculty with PhD from ${escapeHtml(inst)}">
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
        <h3 class="insights-heading">Undergraduate Origins</h3>
        <p class="insights-caption">Top undergraduate institutions recorded in the roster; click to search alumni.</p>
        <div class="ranked-list">${ugRows.length ? ugRows : '<p class="empty-state">No undergraduate data recorded in selection.</p>'}</div>
      </div>
      <div class="insights-card">
        <h3 class="insights-heading">Doctoral Alma Maters</h3>
        <p class="insights-caption">Top PhD-granting institutions across the roster; click to search alumni.</p>
        <div class="ranked-list">${phdRows.length ? phdRows : '<p class="empty-state">No PhD data recorded in selection.</p>'}</div>
      </div>
    </div>
  `;
}

export function renderAcademicFlowSummary(subRoster: Roster): string {
  const pairings = buildPhdToFacultyPairings(subRoster, 6);
  if (!pairings.length) return '';
  const max = pairings[0][2];
  const items = pairings
    .map(([phd, country, count]) => {
      const pct = Math.round((count / max) * 100);
      const flag = countryFlag(country);
      return `
        <div class="flow-pair-item">
          <button type="button" class="ranked-item flow-pair-btn" data-search="${escapeHtml(phd)}" data-scope="phd" title="Search faculty who earned PhD at ${escapeHtml(phd)}">
            <div class="ranked-header">
              <span class="ranked-name"><span class="flow-phd">🎓 ${escapeHtml(phd)}</span> <span class="flow-arrow">➔</span> <span class="flow-dest">${flag} ${escapeHtml(country)}</span></span>
              <span class="ranked-count">${count} ${count === 1 ? 'person' : 'people'}</span>
            </div>
            <div class="ranked-track"><div class="ranked-bar" style="width: ${pct}%;"></div></div>
          </button>
        </div>
      `;
    })
    .join('');

  return `
    <div class="insights-section">
      <h3 class="insights-heading">Doctoral-to-Faculty Pairings</h3>
      <p class="insights-caption">Most frequent PhD institution and faculty host country pairs in the roster; click to search alumni.</p>
      <div class="flow-pair-list">${items}</div>
    </div>
  `;
}

export function renderDecadesChart(roster: Roster): string {
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

export function renderTopFacultyHubs(subRoster: Roster, title = 'Top Faculty Hubs', desc = 'Universities with the most Vietnamese faculty; click to search.'): string {
  const topUnis = buildTopUniversities(subRoster, 8);
  if (!topUnis.length) return '';
  const maxUni = topUnis[0] ? topUnis[0][1] : 1;

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

  return `
    <div class="insights-section">
      <h3 class="insights-heading">${escapeHtml(title)}</h3>
      <p class="insights-caption">${escapeHtml(desc)}</p>
      <div class="ranked-list">${uniRows}</div>
    </div>
  `;
}

export function renderFilterBreakdown(
  counts: [string, number][],
  {
    title,
    caption,
    filterKey,
    formatLabel = (v: string) => v,
  }: {
    title: string;
    caption: string;
    filterKey: 'field' | 'track';
    formatLabel?: (value: string) => string;
  },
): string {
  if (!counts.length) return '';
  const total = counts.reduce((sum, [, c]) => sum + c, 0);
  const max = counts[0][1];
  const rows = counts
    .map(([value, count]) => {
      const pct = Math.round((count / max) * 100);
      const share = Math.round((count / total) * 100);
      return `
        <button type="button" class="ranked-item" data-filter="${filterKey}" data-value="${escapeHtml(value)}" title="Filter by ${escapeHtml(formatLabel(value))}">
          <div class="ranked-header">
            <span class="ranked-name">${escapeHtml(formatLabel(value))}</span>
            <span class="ranked-count">${count} <span class="chart-share">(${share}%)</span></span>
          </div>
          <div class="ranked-track"><div class="ranked-bar" style="width: ${pct}%;"></div></div>
        </button>
      `;
    })
    .join('');
  return `
    <div class="insights-card">
      <h3 class="insights-heading">${escapeHtml(title)}</h3>
      <p class="insights-caption">${escapeHtml(caption)}</p>
      <div class="ranked-list">${rows}</div>
    </div>
  `;
}

export function renderDistributionCharts(subRoster: Roster): string {
  const fieldCard = renderFilterBreakdown(buildFieldCounts(subRoster), {
    title: 'By Field',
    caption: 'Broad academic field; click a bar to filter.',
    filterKey: 'field',
  });
  const trackCard = renderFilterBreakdown(buildTrackCounts(subRoster), {
    title: 'By Career Stage',
    caption: 'Appointment track; click a bar to filter.',
    filterKey: 'track',
  });
  if (!fieldCard && !trackCard) return '';
  return `<div class="insights-grid">${fieldCard}${trackCard}</div>`;
}

export type GrowthMetricKey = 'count' | 'institutions' | 'countries' | 'portraits' | 'honors' | 'codeLines';

export interface GrowthMetricConfig {
  key: GrowthMetricKey;
  label: string;
  icon: string;
  unit: string;
  pluralUnit: string;
  description: string;
}

export const GROWTH_METRICS: Record<GrowthMetricKey, GrowthMetricConfig> = {
  count: {
    key: 'count',
    label: 'Roster Size',
    icon: '👥',
    unit: 'person',
    pluralUnit: 'people',
    description: 'Total verified academics on record',
  },
  institutions: {
    key: 'institutions',
    label: 'Institutions',
    icon: '🏛️',
    unit: 'institution',
    pluralUnit: 'institutions',
    description: 'Distinct universities and research institutes represented',
  },
  countries: {
    key: 'countries',
    label: 'Countries',
    icon: '🌐',
    unit: 'country',
    pluralUnit: 'countries',
    description: 'Distinct countries and territories with diaspora faculty',
  },
  portraits: {
    key: 'portraits',
    label: 'Portraits',
    icon: '🖼️',
    unit: 'portrait',
    pluralUnit: 'portraits',
    description: 'Faculty portraits collected and archived',
  },
  honors: {
    key: 'honors',
    label: 'Honors & Awards',
    icon: '🏆',
    unit: 'honor',
    pluralUnit: 'honors',
    description: 'Major scholarly honors, awards, fellowships, and chairs',
  },
  codeLines: {
    key: 'codeLines',
    label: 'Codebase (LOC)',
    icon: '💻',
    unit: 'source line',
    pluralUnit: 'source lines',
    description: 'Application source code lines in src/ (TypeScript, CSS, HTML)',
  },
};

export function renderGrowthChart(history: StatsHistoryPoint[], activeMetric: GrowthMetricKey = 'count'): string {
  if (history.length < 2) return '';
  const metric = GROWTH_METRICS[activeMetric] ?? GROWTH_METRICS.count;
  const values = history.map((p) => {
    const val = p[activeMetric];
    return typeof val === 'number' ? val : p.count;
  });
  const width = 640;
  const height = 180;
  const padX = 8;
  const padTop = 14;
  const padBottom = 28;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = Math.max(1, maxVal - minVal);
  const xFor = (i: number) => padX + (i / (history.length - 1)) * (width - padX * 2);
  const yFor = (val: number) => padTop + (1 - (val - minVal) / range) * (height - padTop - padBottom);
  const linePoints = values.map((val, i) => `${xFor(i).toFixed(1)},${yFor(val).toFixed(1)}`).join(' ');
  const areaPoints = `${padX},${(height - padBottom).toFixed(1)} ${linePoints} ${(width - padX).toFixed(1)},${(height - padBottom).toFixed(1)}`;
  const first = history[0];
  const last = history[history.length - 1];
  const firstVal = values[0];
  const lastVal = values[values.length - 1];
  const dots = history
    .map((p, i) => `<circle class="growth-dot" cx="${xFor(i).toFixed(1)}" cy="${yFor(values[i]).toFixed(1)}" r="2.5" data-date="${escapeHtml(p.date)}" data-count="${values[i]}"></circle>`)
    .join('');
  const pointsData = escapeHtml(JSON.stringify(history.map((p, i) => [xFor(i), p.date, values[i], metric.unit, metric.pluralUnit])));

  const metricKeys: GrowthMetricKey[] = ['count', 'institutions', 'countries', 'portraits', 'honors', 'codeLines'];
  const metricButtons = metricKeys
    .map((key) => {
      const cfg = GROWTH_METRICS[key];
      const cur = last[key] ?? last.count;
      const init = first[key] ?? first.count;
      const pctChange = init > 0 ? `+${Math.round(((cur - init) / init) * 100)}%` : `+${cur}`;
      const isActive = key === activeMetric;
      return `
        <button type="button" class="growth-metric-btn${isActive ? ' is-active' : ''}" data-metric="${key}" aria-pressed="${isActive}">
          <span class="growth-metric-icon">${cfg.icon}</span>
          <span class="growth-metric-label">${cfg.label}</span>
          <span class="growth-metric-val">${cur.toLocaleString()}</span>
          <span class="growth-metric-badge">${pctChange}</span>
        </button>
      `;
    })
    .join('');

  return `
    <div class="insights-section" id="growth-section">
      <h3 class="insights-heading">Project &amp; Roster Growth</h3>
      <p class="insights-caption">${escapeHtml(metric.description)}, from ${escapeHtml(first.date)} (${firstVal.toLocaleString()} ${firstVal === 1 ? metric.unit : metric.pluralUnit}) to ${escapeHtml(last.date)} (${lastVal.toLocaleString()} ${lastVal === 1 ? metric.unit : metric.pluralUnit}); click any metric to switch dimension.</p>
      <div class="growth-metrics-bar" role="group" aria-label="Growth dimensions">
        ${metricButtons}
      </div>
      <div class="growth-chart-wrap">
        <svg class="growth-chart" viewBox="0 0 ${width} ${height}" data-points="${pointsData}" data-metric="${metric.key}" data-unit="${metric.unit}" data-plural="${metric.pluralUnit}" data-height="${height}" data-pad-bottom="${padBottom}" role="img" aria-label="Line chart of ${escapeHtml(metric.label)} over time">
          <polygon class="growth-area" points="${areaPoints}"></polygon>
          <polyline class="growth-line" points="${linePoints}"></polyline>
          ${dots}
          <line class="growth-crosshair" x1="0" y1="${padTop}" x2="0" y2="${height - padBottom}" hidden></line>
        </svg>
        <div class="growth-tooltip" hidden></div>
      </div>
    </div>
  `;
}

export function renderFunFacts(
  visibleRoster: Roster,
  selectedLocationLabel: string,
  selectedLocation: string,
  fullRoster: Roster,
  statsHistory: StatsHistoryPoint[],
  activeGrowthMetric: GrowthMetricKey = 'count',
) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  if (countEl) {
    countEl.textContent = 'Insights and patterns for the selected location and the worldwide diaspora:';
  }

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

  const formatList = (facts: string[]) =>
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
          <p class="insights-main-desc">${selectedRoster.length} ${selectedRoster.length === 1 ? 'person' : 'people'} across ${selectedUniversities} institution${selectedUniversities === 1 ? '' : 's'} in ${escapeHtml(selectedIsUs ? 'the United States' : selectedLocationLabel.replace(/^\S+\s+/, ''))}.</p>
        </div>
        ${selectedIsUs && selectedRoster.length ? renderStateGrid(selectedRoster) : ''}
        ${!selectedIsUs && selectedRoster.length ? renderWorldMap(selectedRoster, selectedLocation) : ''}
        ${selectedRoster.length ? renderDistributionCharts(selectedRoster) : ''}
        ${selectedRoster.length ? renderTopFacultyHubs(selectedRoster, selectedIsUs ? 'Top U.S. Faculty Hubs' : 'Top Faculty Hubs', 'Institutions with the most Vietnamese academics in the selected location; click to search.') : ''}
        ${selectedRoster.length ? renderAlmaMaterOriginsMap(selectedRoster) : ''}
        ${selectedRoster.length ? renderAcademicFlowSummary(selectedRoster) : ''}
        ${selectedRoster.length ? renderDecadesChart(selectedRoster) : ''}
        <div class="insights-section">
          <h3 class="insights-heading">${escapeHtml(selectedLabel)} Highlights</h3>
          <ul class="fun-facts">${formatList([...selectedFacts, ...selectedAwardsFacts])}</ul>
          ${calculationBasis(selectedRoster, selectedLabel)}
        </div>
      </section>
  `;

  if (rosterEl) {
    rosterEl.innerHTML = `
      <div class="insights-dashboard">
        ${selectedSection}

        <!-- WORLD -->
        <section class="insights-section-block">
          <div class="insights-section-header">
            <span class="insights-badge">🌐 World</span>
            <h2 class="insights-main-heading">Global &amp; Worldwide Diaspora Landscape</h2>
            <p class="insights-main-desc">${fullRoster.length} people across ${worldUniversities} institutions in the World.</p>
          </div>
          ${renderWorldMap(fullRoster, selectedLocation)}
          ${renderDistributionCharts(fullRoster)}
          ${worldInternationalRoster.length ? renderTopFacultyHubs(worldInternationalRoster, 'Top International Faculty Hubs', 'Global institutions outside the U.S. with the most Vietnamese academics; click to search.') : ''}
          ${renderAlmaMaterOriginsMap(fullRoster)}
          ${renderAcademicFlowSummary(fullRoster)}
          ${renderGrowthChart(statsHistory, activeGrowthMetric)}
          ${renderDecadesChart(fullRoster)}
          <div class="insights-section">
            <h3 class="insights-heading">World Highlights</h3>
            <ul class="fun-facts">${formatList([...worldFacts, ...worldAwardsFacts])}</ul>
            ${calculationBasis(fullRoster, 'World')}
          </div>
        </section>
      </div>
    `;
  }
}
