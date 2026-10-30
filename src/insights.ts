import {
  STATE_ABBR,
  canonicalState,
  buildAwardsFunFacts,
  buildDecadeCounts,
  buildFieldCounts,
  buildRosterHtmlInventory,
  buildInternationalObservations,
  buildLocationObservations,
  buildPhdToFacultyPairings,
  buildQualifiedObservations,
  buildTopPhdInstitutions,
  buildTopUndergradInstitutions,
  buildTopUniversities,
  buildTrackCounts,
  buildUsObservations,
  countryFlag,
  type Roster,
} from './data.ts';
import { STATE_GRID } from './state-grid.ts';
import { abbreviateInsightText, escapeHtml } from './utils.ts';
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
    const state = canonicalState(p.state, p.country);
    if (!state) continue;
    counts.set(state, (counts.get(state) ?? 0) + 1);
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

export function renderFunFacts(
  visibleRoster: Roster,
  selectedLocationLabel: string,
  selectedLocation: string,
  fullRoster: Roster,
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
        <!-- DIASPORA PATHWAYS & MACRO INSIGHTS -->
        <section class="insights-section-block insights-main-block" id="pathways-section">
          <div class="insights-section-header">
            <span class="insights-badge">DIASPORA INSIGHTS</span>
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
  includeHeader = false,
): string {
  const stats: DerivedRosterStats = deriveRosterStats(roster);
  const htmlInventory = buildRosterHtmlInventory(roster);

  return `
    <div class="health-panel-dashboard">
      ${includeHeader ? `
        <div class="health-panel-header">
          <div class="health-badge-row">
            <span class="insights-badge">📊 System Health &amp; Maintenance</span>
            <span class="health-records-count">${formatNumber(stats.total)} Total Faculty Records</span>
          </div>
          <h2 class="health-main-heading">System Health &amp; Verification</h2>
          <p class="health-main-desc">
            VietProfs is an open, evidence-audited repository of Vietnamese and Vietnamese-diaspora university faculty outside Vietnam.
            This section tracks generated pages and metadata completeness.
          </p>
        </div>
      ` : ''}

      <div class="html-inventory-card generated-html-card">
        <div class="html-inventory-header">
          <div>
            <h3 class="html-inventory-title">Generated HTML Inventory</h3>
            <p class="html-inventory-desc">Roster hubs require at least three listed faculty members.</p>
          </div>
          <strong class="html-inventory-total">${formatNumber(htmlInventory.total)} pages</strong>
        </div>
        <div class="html-inventory-grid">
          <div class="html-inventory-item">
            <strong>${formatNumber(htmlInventory.profiles)}</strong>
            <span>Individual profiles</span>
          </div>
          <div class="html-inventory-item">
            <strong>${formatNumber(htmlInventory.fields)}</strong>
            <span>Discipline hubs</span>
          </div>
          <div class="html-inventory-item">
            <strong>${formatNumber(htmlInventory.regions)}</strong>
            <span>Region hubs</span>
          </div>
          <div class="html-inventory-item">
            <strong>${formatNumber(htmlInventory.intersections)}</strong>
            <span>Field × region hubs</span>
          </div>
        </div>
        <nav class="html-standalone-links" aria-label="Standalone HTML pages">
          <span>${htmlInventory.standalone} standalone:</span>
          <a href="${baseUrl}index.html">Directory</a>
          <a href="${baseUrl}connections.html">Connections</a>
          <a href="${baseUrl}submit.html">Submit / Update</a>
          <a href="${baseUrl}404.html">404</a>
        </nav>
      </div>

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

    </div>
  `;
}
