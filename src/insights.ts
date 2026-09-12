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
  type GitInfo,
  type Roster,
  type StatsHistoryPoint,
} from './data.ts';
import { STATE_GRID } from './state-grid.ts';
import { abbreviateInsightText, escapeHtml, formatRosterDate } from './utils.ts';
import { renderWorldMap } from './world-map.ts';
import { deriveRosterStats, type DerivedRosterStats } from './derived-stats.ts';

export { renderWorldMap };

// Shades relative to the largest bucket in the same view, for grids whose absolute counts are
// small (U.S. states). Distinct from world-map.ts's densityHeatTier(), which uses fixed
// absolute thresholds and publishes them in a legend; the two used to share the name `heatTier`
// while behaving differently on the same heat-N CSS classes.
export function relativeHeatTier(count: number, max: number): number {
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

const STATE_NAME_BY_ABBR = new Map(Object.entries(STATE_ABBR).map(([name, abbr]) => [abbr, name]));

export function renderStateGrid(roster: Roster): string {
  const counts = new Map<string, number>();
  // Entries with no recorded state are skipped rather than pooled under one undefined key,
  // which would otherwise feed the max() below and wash out the whole grid's shading.
  for (const p of roster) {
    if (!p.state) continue;
    counts.set(p.state, (counts.get(p.state) ?? 0) + 1);
  }
  const max = Math.max(0, ...counts.values());
  const tiles = Object.entries(STATE_GRID)
    .map(([abbr, [row, col]]) => {
      const fullName = STATE_NAME_BY_ABBR.get(abbr) ?? abbr;
      const count = counts.get(fullName) ?? 0;
      const tier = relativeHeatTier(count, max);
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
        <button type="button" class="chart-row-btn chart-row" data-search="${escapeHtml(decade)}" data-scope="phd" title="Search faculty with PhD in ${escapeHtml(decade)}">
          <span class="chart-label">${escapeHtml(decade)}</span>
          <div class="chart-track">
            <div class="chart-bar" style="width: ${pct}%;"></div>
          </div>
          <span class="chart-value">${count} <span class="chart-share">(${share}%)</span></span>
        </button>
      `;
    })
    .join('');
  return `
    <div class="insights-section">
      <h3 class="insights-heading">PhD Graduation Cohorts</h3>
      <p class="insights-caption">Distribution by decade of PhD completion (${total} faculty on record); click a decade to search.</p>
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
    description: 'Total academics on record',
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

// A metric can fall (codeLines after a refactor), so the sign comes from the value rather than
// being hardcoded — `+${-12}%` rendered as "+-12%".
function formatChange(delta: number, suffix: string): string {
  return `${delta >= 0 ? '+' : ''}${delta.toLocaleString()}${suffix}`;
}

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
      const pctChange = init > 0 ? formatChange(Math.round(((cur - init) / init) * 100), '%') : formatChange(cur - init, '');
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
  gitInfo: GitInfo | null = null,
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
  const selectedIsUs = selectedLocation === 'US';
  const selectedFacts = selectedIsUs
    ? buildUsObservations(selectedRoster)
    : buildLocationObservations(selectedRoster, selectedLocationLabel);
  const selectedAwardsFacts = buildAwardsFunFacts(selectedRoster);

  const worldFacts = [...buildUsObservations(worldUsRoster), ...buildInternationalObservations(fullRoster), ...buildQualifiedObservations(fullRoster)];
  const worldAwardsFacts = buildAwardsFunFacts(fullRoster);

  const formatList = (facts: string[]) => facts.map((f) => `<li>${escapeHtml(abbreviateInsightText(f))}</li>`).join('');

  const selectedUniversities = new Set(selectedRoster.map((p) => p.university)).size;

  const selectedSection = selectedIsWorld ? '' : `
      <!-- REGIONAL SECTION -->
      <section class="insights-section-block">
        <div class="insights-section-header">
          <span class="insights-badge">${escapeHtml(selectedLocationLabel)}</span>
          <h2 class="insights-main-heading">${escapeHtml(selectedIsUs ? 'United States Academic Landscape' : `${selectedLocationLabel} Academic Landscape`)}</h2>
          <p class="insights-main-desc">${selectedRoster.length} ${selectedRoster.length === 1 ? 'person' : 'people'} across ${selectedUniversities} institution${selectedUniversities === 1 ? '' : 's'} in ${escapeHtml(selectedIsUs ? 'the United States' : selectedLocationLabel.replace(/^\S+\s+/, ''))}.</p>
        </div>

        <div class="insights-category">
          <div class="insights-category-header">
            <h3 class="insights-category-title">1. Geographic Distribution &amp; Faculty Hubs</h3>
            <p class="insights-category-subtitle">Regional density and institutions with the highest concentration of Vietnamese faculty.</p>
          </div>
          ${selectedIsUs && selectedRoster.length ? renderStateGrid(selectedRoster) : ''}
          ${!selectedIsUs && selectedRoster.length ? renderWorldMap(selectedRoster, selectedLocation) : ''}
          ${selectedRoster.length ? renderTopFacultyHubs(selectedRoster, selectedIsUs ? 'Top U.S. Faculty Hubs' : 'Top Faculty Hubs', 'Institutions with the most Vietnamese academics in the selected location; click to search.') : ''}
        </div>

        <div class="insights-category">
          <div class="insights-category-header">
            <h3 class="insights-category-title">2. Academic Disciplines &amp; Career Stages</h3>
            <p class="insights-category-subtitle">Broad disciplinary distributions and faculty appointment tracks.</p>
          </div>
          ${selectedRoster.length ? renderDistributionCharts(selectedRoster) : ''}
        </div>

        <div class="insights-category">
          <div class="insights-category-header">
            <h3 class="insights-category-title">3. Diaspora Pathways &amp; Educational Origins</h3>
            <p class="insights-category-subtitle">Undergraduate feeder schools, doctoral alma maters, and international faculty trajectories.</p>
          </div>
          ${selectedRoster.length ? renderAlmaMaterOriginsMap(selectedRoster) : ''}
          ${selectedRoster.length ? renderAcademicFlowSummary(selectedRoster) : ''}
        </div>

        <div class="insights-category">
          <div class="insights-category-header">
            <h3 class="insights-category-title">4. Academic Generations</h3>
            <p class="insights-category-subtitle">Distribution by PhD graduation decade.</p>
          </div>
          ${selectedRoster.length ? renderDecadesChart(selectedRoster) : ''}
        </div>

        <div class="insights-category">
          <div class="insights-category-header">
            <h3 class="insights-category-title">5. Scholarly Highlights &amp; Honors</h3>
            <p class="insights-category-subtitle">Roster-verified observations, prestigious recognitions, and major honors.</p>
          </div>
          <div class="insights-section">
            <ul class="fun-facts">${formatList([...selectedFacts, ...selectedAwardsFacts])}</ul>
            ${calculationBasis(selectedRoster, selectedLocationLabel)}
          </div>
        </div>
      </section>
  `;

  if (rosterEl) {
    rosterEl.innerHTML = `
      <div class="insights-dashboard">
        <!-- SECTION 1: SYSTEM HEALTH & MAINTENANCE -->
        <section class="insights-section-block health-section-block" id="health-section">
          <div class="insights-section-header">
            <span class="insights-badge">SECTION 1 — SYSTEM HEALTH</span>
            <h2 class="insights-main-heading">System Health, Codebase Status &amp; Project History</h2>
            <p class="insights-main-desc">Metadata audit coverage, GitHub repository status, and database growth tracking across all <strong>${fullRoster.length}</strong> maintained profiles.</p>
          </div>
          ${renderHealthPanel(fullRoster, import.meta.env.BASE_URL, gitInfo, false, statsHistory, activeGrowthMetric)}
        </section>

        <!-- SECTION 2: DIASPORA PATHWAYS & MACRO INSIGHTS -->
        <section class="insights-section-block insights-main-block" id="pathways-section">
          <div class="insights-section-header">
            <span class="insights-badge">SECTION 2 — DIASPORA INSIGHTS</span>
            <h2 class="insights-main-heading">Diaspora Pathways &amp; Macro Analysis</h2>
            <p class="insights-main-desc">Geographic distributions, PhD graduation cohorts, alma mater feeder networks, and academic disciplines.</p>
          </div>
          ${selectedSection}

          <!-- GLOBAL SECTION -->
          <div class="insights-category">
            <div class="insights-category-header">
              <h3 class="insights-category-title">1. Geographic Distribution &amp; Faculty Hubs</h3>
              <p class="insights-category-subtitle">Worldwide diaspora geography and top international faculty concentrations.</p>
            </div>
            ${renderWorldMap(fullRoster, selectedLocation)}
            ${worldInternationalRoster.length ? renderTopFacultyHubs(worldInternationalRoster, 'Top International Faculty Hubs', 'Global institutions outside the U.S. with the most Vietnamese academics; click to search.') : ''}
          </div>

          <div class="insights-category">
            <div class="insights-category-header">
              <h3 class="insights-category-title">2. Academic Disciplines &amp; Career Stages</h3>
              <p class="insights-category-subtitle">Field distribution across STEM, medicine, humanities, and faculty tracks.</p>
            </div>
            ${renderDistributionCharts(fullRoster)}
          </div>

          <div class="insights-category">
            <div class="insights-category-header">
              <h3 class="insights-category-title">3. Diaspora Pathways &amp; Educational Origins</h3>
              <p class="insights-category-subtitle">Top undergraduate feeders, doctoral alma maters, and international academic career pairings.</p>
            </div>
            ${renderAlmaMaterOriginsMap(fullRoster)}
            ${renderAcademicFlowSummary(fullRoster)}
          </div>

          <div class="insights-category">
            <div class="insights-category-header">
              <h3 class="insights-category-title">4. Academic Generations</h3>
              <p class="insights-category-subtitle">Historical cohorts grouped by PhD completion decade.</p>
            </div>
            ${renderDecadesChart(fullRoster)}
          </div>

          <div class="insights-category">
            <div class="insights-category-header">
              <h3 class="insights-category-title">5. Scholarly Highlights &amp; Honors</h3>
              <p class="insights-category-subtitle">Curated roster observations, prestigious fellowships, and major awards.</p>
            </div>
            <div class="insights-section">
              <ul class="fun-facts">${formatList([...worldFacts, ...worldAwardsFacts])}</ul>
              ${calculationBasis(fullRoster, 'World')}
            </div>
          </div>
        </section>
      </div>
    `;
  }
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function renderHealthPanel(
  roster: Roster,
  baseUrl = '/',
  gitInfo: GitInfo | null = null,
  includeHeader = false,
  statsHistory: StatsHistoryPoint[] = [],
  activeGrowthMetric: GrowthMetricKey = 'count',
): string {
  const stats: DerivedRosterStats = deriveRosterStats(roster);

  return `
    <div class="health-panel-dashboard">
      ${includeHeader ? `
        <div class="health-panel-header">
          <div class="health-badge-row">
            <span class="insights-badge">📊 System Health &amp; Maintenance</span>
            <span class="health-records-count">${formatNumber(stats.total)} Total Faculty Records</span>
          </div>
          <h2 class="health-main-heading">System Health, Verification &amp; Codebase Status</h2>
          <p class="health-main-desc">
            VietProfs is an open, evidence-audited repository of Vietnamese and Vietnamese-diaspora university faculty outside Vietnam.
            This section tracks overall repository hygiene, Git commit activity, and metadata completeness metrics.
          </p>
        </div>
      ` : ''}

      ${gitInfo ? `
        <div class="github-status-card">
          <div class="github-status-header">
            <div class="github-status-title">
              <svg class="github-icon" viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span><strong>GitHub Repository Status</strong></span>
            </div>
            <a class="github-repo-link" href="${escapeHtml(gitInfo.repoUrl)}" target="_blank" rel="noopener noreferrer">dynaroars/vietprofs ↗</a>
          </div>
          <div class="github-metrics-grid">
            <div class="github-metric-item">
              <span class="github-metric-label">Total Commits</span>
              <strong class="github-metric-value">${formatNumber(gitInfo.totalCommits)}</strong>
              <span class="github-metric-sub">Branch: <code>${escapeHtml(gitInfo.branch)}</code></span>
            </div>
            <div class="github-metric-item">
              <span class="github-metric-label">Latest Commit</span>
              <strong class="github-metric-value"><code>${escapeHtml(gitInfo.latestHash)}</code></strong>
              <span class="github-metric-sub" title="${escapeHtml(gitInfo.latestMessage)}">${escapeHtml(gitInfo.latestMessage)}</span>
            </div>
            <div class="github-metric-item">
              <span class="github-metric-label">Latest Activity</span>
              <strong class="github-metric-value">${formatRosterDate(gitInfo.latestDate)}</strong>
              <span class="github-metric-sub">System maintenance timestamp</span>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="completeness-grid">
        ${stats.completeness.map((m) => `
          <div class="completeness-card">
            <div class="completeness-header">
              <span class="completeness-label">${escapeHtml(m.label)}</span>
              <strong class="completeness-pct">${m.percentage}%</strong>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${m.percentage}%"></div>
            </div>
            <div class="completeness-meta">
              <span>${formatNumber(m.count)} of ${formatNumber(m.total)} records</span>
              <span class="completeness-desc">${escapeHtml(m.description)}</span>
            </div>
          </div>
        `).join('')}
      </div>

      ${stats.recentUpdatesCount.last30Days > 0 ? `
        <div class="recent-updates-badge">
          <span class="pulse-dot" aria-hidden="true"></span>
          <span><strong>${formatNumber(stats.recentUpdatesCount.last30Days)} profiles</strong> actively updated or verified in the past 30 days (${formatNumber(stats.recentUpdatesCount.last7Days)} this week).</span>
          <a class="recent-updates-link" href="${baseUrl}?sort=recent">Browse recently updated →</a>
        </div>
      ` : ''}

      ${statsHistory && statsHistory.length > 0 ? `
        <div class="health-growth-section" style="margin-top: 0.5rem;">
          <div class="insights-category-header" style="margin-bottom: 0.5rem;">
            <h3 class="insights-category-title">Project &amp; Archive Growth History</h3>
          </div>
          ${renderGrowthChart(statsHistory, activeGrowthMetric)}
        </div>
      ` : ''}
    </div>
  `;
}
