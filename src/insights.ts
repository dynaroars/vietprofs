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
  buildTopCities,
  buildTopCountries,
  buildTopPhdInstitutions,
  buildTopUndergradInstitutions,
  buildTopUniversities,
  buildTrackCounts,
  buildUsObservations,
  countryFlag,
  sectorOf,
  type Roster,
} from './data.ts';
import type { StatsHistoryPoint } from './stats-history.ts';
import { STATE_GRID } from './state-grid.ts';
import { abbreviateInsightText, escapeHtml } from './utils.ts';
import { renderWorldMap } from './world-map.ts';
import { deriveRosterStats, type DerivedRosterStats } from './derived-stats.ts';
import { fieldVi, placeVi, type Lang } from './i18n-vi.ts';
import {
  almaMaterHtml,
  alumniHubPath,
  buildAlmaMaterIndex,
  renderPathwayExplorer,
  type PathwayStage,
} from './pathways.ts';
import { almaMaterInfo } from './alma-mater.ts';

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
        <button type="button" class="ranked-item" data-search="${escapeHtml(inst)}" data-scope="undergrad" title="Search people with undergrad degree from ${escapeHtml(inst)}">
          <div class="ranked-header">
            <span class="ranked-name"><span class="ranked-num">${idx + 1}.</span> ${almaMaterHtml(inst)}</span>
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
        <button type="button" class="ranked-item" data-search="${escapeHtml(inst)}" data-scope="phd" title="Search people with PhD from ${escapeHtml(inst)}">
          <div class="ranked-header">
            <span class="ranked-name"><span class="ranked-num">${idx + 1}.</span> ${almaMaterHtml(inst)}</span>
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

export function renderAcademicFlowSummary(subRoster: Roster, academic = true): string {
  const pairings = buildPhdToFacultyPairings(subRoster, 6);
  if (!pairings.length) return '';
  const max = pairings[0][2];
  const items = pairings
    .map(([phd, country, count]) => {
      const pct = Math.round((count / max) * 100);
      const flag = countryFlag(country);
      return `
        <div class="flow-pair-item">
          <button type="button" class="ranked-item flow-pair-btn" data-search="${escapeHtml(phd)}" data-scope="phd" title="Search people who earned PhD at ${escapeHtml(phd)}">
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
      <h3 class="insights-heading">${academic ? 'Doctoral-to-Faculty Pairings' : 'Doctoral-to-Host-Country Pairings'}</h3>
      <p class="insights-caption">Most frequent PhD institution and host country pairs in the roster; click to search alumni.</p>
      <div class="flow-pair-list">${items}</div>
    </div>
  `;
}

const MIN_COHORT_RECORDS = 10;

export function renderDecadesChart(roster: Roster): string {
  const decadeCounts = buildDecadeCounts(roster);
  const total = roster.filter((p) => p.phdYear).length;
  // A handful of PhD years is too thin to chart as cohorts (small sectors, small locations).
  if (!decadeCounts.length || total < MIN_COHORT_RECORDS) return '';
  const max = Math.max(...decadeCounts.map(([, c]) => c));
  const rows = decadeCounts
    .map(([decade, count]) => {
      const pct = Math.round((count / max) * 100);
      const share = Math.round((count / total) * 100);
      return `
        <button type="button" class="chart-row-btn chart-row" data-search="${escapeHtml(decade)}" data-scope="phd" title="Search people with PhD in ${escapeHtml(decade)}">
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
      <p class="insights-caption">Distribution by decade of PhD completion (${total} ${total === 1 ? 'person' : 'people'} on record); click a decade to search.</p>
      <div class="chart-container">${rows}</div>
    </div>
  `;
}

export function renderTopFacultyHubs(
  subRoster: Roster,
  title = 'Top Faculty Hubs',
  desc = 'Universities with the most Vietnamese faculty; click to search.',
): string {
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

export function renderCityHubs(
  subRoster: Roster,
  title = 'Top City & Metro Hubs',
  desc = 'Cities with the largest concentrations of listed researchers — click a city to find peers nearby.',
): string {
  const cities = buildTopCities(subRoster, 10);
  if (!cities.length) return '';
  const maxCount = cities[0].count;
  const rows = cities
    .map((hub, idx) => {
      const pct = Math.round((hub.count / maxCount) * 100);
      const flag = countryFlag(hub.country);
      const regionPart =
        hub.country === 'United States' && hub.state
          ? STATE_ABBR[hub.state] || hub.state
          : hub.country;
      const placeLabel =
        hub.city.toLowerCase() === hub.country.toLowerCase()
          ? `${flag} ${hub.city}`
          : `${flag} ${hub.city}, ${regionPart}`;
      const instLabel = `${hub.institutions} ${hub.institutions === 1 ? 'org' : 'orgs'}`;
      return `
        <button type="button" class="ranked-item" data-search="${escapeHtml(hub.city)}" data-scope="city" title="Find researchers in ${escapeHtml(hub.city)}, ${escapeHtml(hub.country)}">
          <div class="ranked-header">
            <span class="ranked-name"><span class="ranked-num">${idx + 1}.</span> ${escapeHtml(placeLabel)} <span class="city-hub-meta">· ${escapeHtml(instLabel)}</span></span>
            <span class="ranked-count">${hub.count}</span>
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
      <div class="ranked-list">${rows}</div>
    </div>
  `;
}

export interface DiasporaSnapshotData {
  total: number;
  institutions: number;
  countries: number;
  cities: number;
  sectors: { academia: number; labs: number; industry: number };
  topCountries: [string, number][];
  topFields: [string, number][];
  topCities: ReturnType<typeof buildTopCities>;
  topVnFeeders: Array<{ institution: string; count: number }>;
  honorsPeople: number;
  totalHonors: number;
}

export function computeDiasporaSnapshot(roster: Roster): DiasporaSnapshotData {
  const sectors = { academia: 0, labs: 0, industry: 0 };
  const institutions = new Set<string>();
  const countries = new Set<string>();
  const cities = new Set<string>();
  let honorsPeople = 0;
  let totalHonors = 0;

  for (const p of roster) {
    sectors[sectorOf(p)] += 1;
    if (p.university) institutions.add(p.university);
    countries.add(p.country || 'United States');
    if (p.city)
      cities.add(`${p.city.toLowerCase()}|${(p.country || 'United States').toLowerCase()}`);
    if (p.honors?.length) {
      honorsPeople += 1;
      totalHonors += p.honors.length;
    }
  }

  const topVnFeeders = buildAlmaMaterIndex(roster)
    .filter((entry) => entry.isVietnamese && entry.byStage.undergrad > 0)
    .sort(
      (a, b) =>
        b.byStage.undergrad - a.byStage.undergrad || a.institution.localeCompare(b.institution),
    )
    .slice(0, 5)
    .map((entry) => ({ institution: entry.institution, count: entry.byStage.undergrad }));

  return {
    total: roster.length,
    institutions: institutions.size,
    countries: countries.size,
    cities: cities.size,
    sectors,
    topCountries: buildTopCountries(roster, 5),
    topFields: buildFieldCounts(roster).slice(0, 5),
    topCities: buildTopCities(roster, 5),
    topVnFeeders,
    honorsPeople,
    totalHonors,
  };
}

export function buildDiasporaSnapshotMarkdown(roster: Roster, lang: Lang = 'en'): string {
  const s = computeDiasporaSnapshot(roster);
  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);
  const isVi = lang === 'vi';
  const countriesLine = s.topCountries
    .map(([c, n]) => `${isVi ? placeVi(c) : c} (${fmt(n)})`)
    .join(', ');
  const fieldsLine = s.topFields.map(([f, n]) => `${isVi ? fieldVi(f) : f} (${fmt(n)})`).join(', ');
  const citiesLine = s.topCities.map((h) => `${h.city} (${fmt(h.count)})`).join(', ');
  const vnLine = s.topVnFeeders
    .map((v) => {
      const short = almaMaterInfo(v.institution)?.short;
      return `${v.institution}${short ? ` (${short})` : ''}: ${fmt(v.count)}`;
    })
    .join(', ');

  if (isVi) {
    return [
      '# Tóm tắt Cộng đồng Nghiên cứu Việt Nam ở Nước ngoài (VietProfs)',
      '',
      `- **Quy mô danh bạ:** ${fmt(s.total)} nhà khoa học và giảng viên tại ${fmt(s.institutions)} cơ sở, ${fmt(s.cities)} thành phố thuộc ${fmt(s.countries)} quốc gia và vùng lãnh thổ.`,
      `- **Phân bố khu vực:** Học thuật (${fmt(s.sectors.academia)}), Viện nghiên cứu & Chính phủ (${fmt(s.sectors.labs)}), Nghiên cứu công nghiệp (${fmt(s.sectors.industry)}).`,
      `- **Quốc gia tập trung nhiều nhất:** ${countriesLine}.`,
      `- **Thành phố tập trung nhiều nhất:** ${citiesLine}.`,
      `- **Lĩnh vực nổi bật:** ${fieldsLine}.`,
      ...(vnLine
        ? [`- **Đại học tại Việt Nam có nhiều cựu sinh viên nhất (bậc đại học):** ${vnLine}.`]
        : []),
      `- **Giải thưởng & vinh danh được ghi nhận:** ${fmt(s.totalHonors)} giải thưởng/danh hiệu của ${fmt(s.honorsPeople)} người.`,
      '',
      '_Nguồn: VietProfs (https://vietprofs.roars.dev) — thống kê trực tiếp từ các trường dữ liệu đã xác minh trong danh bạ._',
    ].join('\n');
  }

  return [
    '# State of the Vietnamese Research Diaspora — VietProfs Snapshot',
    '',
    `- **Roster scope:** ${fmt(s.total)} listed scholars across ${fmt(s.institutions)} institutions, ${fmt(s.cities)} cities, and ${fmt(s.countries)} countries/territories.`,
    `- **Sector breakdown:** Academia (${fmt(s.sectors.academia)}), Gov, Defense & Labs (${fmt(s.sectors.labs)}), Industry Research (${fmt(s.sectors.industry)}).`,
    `- **Top host countries:** ${countriesLine}.`,
    `- **Top city hubs:** ${citiesLine}.`,
    `- **Largest fields:** ${fieldsLine}.`,
    ...(vnLine ? [`- **Top Vietnamese undergraduate alma maters on record:** ${vnLine}.`] : []),
    `- **Verified honors:** ${fmt(s.totalHonors)} recorded honors across ${fmt(s.honorsPeople)} scholars.`,
    '',
    '_Source: VietProfs (https://vietprofs.roars.dev) — reproducible snapshot computed directly from verified roster fields._',
  ].join('\n');
}

export function renderDiasporaSnapshot(roster: Roster, lang: Lang = 'en'): string {
  if (!roster.length) return '';
  const s = computeDiasporaSnapshot(roster);
  const isVi = lang === 'vi';
  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

  const countriesText = s.topCountries
    .map(([c, n]) => `${countryFlag(c)} ${isVi ? placeVi(c) : c} (${fmt(n)})`)
    .join(' · ');
  const fieldsText = s.topFields
    .map(([f, n]) => `${isVi ? fieldVi(f) : f} (${fmt(n)})`)
    .join(' · ');
  const citiesText = s.topCities
    .map((h) => `${countryFlag(h.country)} ${h.city} (${fmt(h.count)})`)
    .join(' · ');
  const vnFeedersHtml = s.topVnFeeders
    .map((v) => {
      const path = alumniHubPath(roster, v.institution);
      const label = `${almaMaterHtml(v.institution)} (${fmt(v.count)})`;
      return path
        ? `<a class="snapshot-alumni-link" href="./${escapeHtml(path)}">${label}</a>`
        : label;
    })
    .join(' · ');

  return `
    <section class="diaspora-snapshot" id="diaspora-snapshot" lang="${lang}">
      <div class="snapshot-header">
        <div>
          <span class="insights-badge">${isVi ? 'BẢN TÓM TẮT CỘNG ĐỒNG' : 'DIASPORA SNAPSHOT'}</span>
          <h3 class="insights-heading">${isVi ? 'Toàn cảnh Cộng đồng Nghiên cứu Việt Nam ở Nước ngoài' : 'State of the Vietnamese Research Diaspora'}</h3>
          <p class="insights-caption">${isVi ? 'Số liệu trực tiếp từ các trường đã xác minh trong danh bạ VietProfs.' : 'Reproducible summary computed directly from verified VietProfs roster fields.'}</p>
        </div>
        <div class="snapshot-actions">
          <div class="snapshot-lang-toggle" role="group" aria-label="Snapshot language">
            <button type="button" class="snapshot-lang-btn${!isVi ? ' is-active' : ''}" data-snapshot-lang="en" aria-pressed="${!isVi}">EN</button>
            <button type="button" class="snapshot-lang-btn${isVi ? ' is-active' : ''}" data-snapshot-lang="vi" aria-pressed="${isVi}">Tiếng Việt</button>
          </div>
          <button type="button" class="snapshot-copy-btn" data-copy-snapshot="${lang}">
            ${isVi ? 'Sao chép tóm tắt' : 'Copy Markdown'}
          </button>
        </div>
      </div>

      <div class="snapshot-metrics">
        <div class="snapshot-metric">
          <span class="snapshot-metric-value">${fmt(s.total)}</span>
          <span class="snapshot-metric-label">${isVi ? 'Học giả & nhà nghiên cứu' : 'Listed scholars'}</span>
        </div>
        <div class="snapshot-metric">
          <span class="snapshot-metric-value">${fmt(s.institutions)}</span>
          <span class="snapshot-metric-label">${isVi ? 'Trường & viện nghiên cứu' : 'Institutions'}</span>
        </div>
        <div class="snapshot-metric">
          <span class="snapshot-metric-value">${fmt(s.countries)}</span>
          <span class="snapshot-metric-label">${isVi ? 'Quốc gia & vùng lãnh thổ' : 'Countries'}</span>
        </div>
        <div class="snapshot-metric">
          <span class="snapshot-metric-value">${fmt(s.cities)}</span>
          <span class="snapshot-metric-label">${isVi ? 'Thành phố' : 'Cities'}</span>
        </div>
      </div>

      <dl class="snapshot-facts">
        <div class="snapshot-fact-row">
          <dt>${isVi ? 'Khu vực' : 'Sectors'}</dt>
          <dd>${isVi ? `🎓 Học thuật (${fmt(s.sectors.academia)}) · 🏛️ Viện & Chính phủ (${fmt(s.sectors.labs)}) · 🏢 Công nghiệp (${fmt(s.sectors.industry)})` : `🎓 Academia (${fmt(s.sectors.academia)}) · 🏛️ Gov & Labs (${fmt(s.sectors.labs)}) · 🏢 Industry (${fmt(s.sectors.industry)})`}</dd>
        </div>
        <div class="snapshot-fact-row">
          <dt>${isVi ? 'Quốc gia hàng đầu' : 'Top host countries'}</dt>
          <dd>${escapeHtml(countriesText)}</dd>
        </div>
        <div class="snapshot-fact-row">
          <dt>${isVi ? 'Trung tâm đô thị' : 'Top city hubs'}</dt>
          <dd>${escapeHtml(citiesText)}</dd>
        </div>
        <div class="snapshot-fact-row">
          <dt>${isVi ? 'Lĩnh vực lớn nhất' : 'Largest fields'}</dt>
          <dd>${escapeHtml(fieldsText)}</dd>
        </div>
        ${
          vnFeedersHtml
            ? `<div class="snapshot-fact-row">
          <dt>${isVi ? 'Đại học nguồn tại VN' : 'Top VN undergrad feeders'}</dt>
          <dd>${vnFeedersHtml}</dd>
        </div>`
            : ''
        }
        <div class="snapshot-fact-row">
          <dt>${isVi ? 'Vinh danh & giải thưởng' : 'Verified honors'}</dt>
          <dd>${isVi ? `${fmt(s.totalHonors)} giải thưởng và danh hiệu của ${fmt(s.honorsPeople)} người` : `${fmt(s.totalHonors)} recorded honors across ${fmt(s.honorsPeople)} scholars`}</dd>
        </div>
      </dl>
    </section>
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

export function renderDistributionCharts(subRoster: Roster, academic = true): string {
  const fieldCard = renderFilterBreakdown(buildFieldCounts(subRoster), {
    title: 'By Field',
    caption: academic
      ? 'Broad academic field; click a bar to filter.'
      : 'Broad field; click a bar to filter.',
    filterKey: 'field',
  });
  // One track is no distribution (e.g. everyone in Industry is "Industry Research").
  const tracks = buildTrackCounts(subRoster);
  const trackCard =
    tracks.length < 2
      ? ''
      : renderFilterBreakdown(tracks, {
          title: academic ? 'By Career Stage' : 'By Track',
          caption: 'Appointment track; click a bar to filter.',
          filterKey: 'track',
        });
  if (!fieldCard && !trackCard) return '';
  return `<div class="insights-grid">${fieldCard}${trackCard}</div>`;
}

export type GrowthMetricKey =
  | 'count'
  | 'institutions'
  | 'countries'
  | 'portraits'
  | 'honors'
  | 'codeLines';

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

export function renderGrowthChart(
  history: StatsHistoryPoint[],
  activeMetric: GrowthMetricKey = 'count',
): string {
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
  const dates = history.map((point) => Date.parse(`${point.date}T00:00:00Z`));
  const duration = Math.max(1, dates[dates.length - 1] - dates[0]);
  const xFor = (i: number) => padX + ((dates[i] - dates[0]) / duration) * (width - padX * 2);
  const yFor = (val: number) =>
    padTop + (1 - (val - minVal) / range) * (height - padTop - padBottom);
  const linePoints = values
    .map((val, i) => `${xFor(i).toFixed(1)},${yFor(val).toFixed(1)}`)
    .join(' ');
  const areaPoints = `${padX},${(height - padBottom).toFixed(1)} ${linePoints} ${(width - padX).toFixed(1)},${(height - padBottom).toFixed(1)}`;
  const first = history[0];
  const last = history[history.length - 1];
  const firstVal = values[0];
  const lastVal = values[values.length - 1];
  const dots = history
    .map(
      (p, i) =>
        `<circle class="growth-dot" cx="${xFor(i).toFixed(1)}" cy="${yFor(values[i]).toFixed(1)}" r="2.5" data-date="${escapeHtml(p.date)}" data-count="${values[i]}"></circle>`,
    )
    .join('');
  const pointsData = escapeHtml(
    JSON.stringify(
      history.map((p, i) => [xFor(i), p.date, values[i], metric.unit, metric.pluralUnit]),
    ),
  );

  const metricKeys: GrowthMetricKey[] = [
    'count',
    'institutions',
    'countries',
    'portraits',
    'honors',
    'codeLines',
  ];
  const metricButtons = metricKeys
    .map((key) => {
      const cfg = GROWTH_METRICS[key];
      const cur = last[key] ?? last.count;
      const init = first[key] ?? first.count;
      const pctChange =
        init > 0
          ? formatChange(Math.round(((cur - init) / init) * 100), '%')
          : formatChange(cur - init, '');
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

export interface FunFactsOptions {
  snapshotLang?: Lang;
  pathwayInstitution?: string;
  pathwayStage?: PathwayStage;
  baseUrl?: string;
}

export function renderFunFacts(
  visibleRoster: Roster,
  selectedLocationLabel: string,
  selectedLocation: string,
  fullRoster: Roster,
  sector: 'all' | 'academia' | 'labs' | 'industry' = 'all',
  options: FunFactsOptions = {},
) {
  const { snapshotLang = 'en', pathwayInstitution, pathwayStage, baseUrl = './' } = options;
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  if (countEl) {
    countEl.textContent =
      selectedLocation === 'World'
        ? 'Insights and patterns across the roster:'
        : 'Insights and patterns for the selected location and across all locations in this view:';
  }

  const worldUsRoster = fullRoster.filter(
    (p) => (p.country || 'United States') === 'United States',
  );
  const worldInternationalRoster = fullRoster.filter(
    (p) => (p.country || 'United States') !== 'United States',
  );
  const selectedIsWorld = selectedLocation === 'World';
  const selectedRoster = selectedIsWorld ? fullRoster : visibleRoster;
  const selectedIsUs = selectedLocation === 'US';
  const selectedFacts = selectedIsUs
    ? buildUsObservations(selectedRoster)
    : buildLocationObservations(selectedRoster, selectedLocationLabel);
  const selectedAwardsFacts = buildAwardsFunFacts(selectedRoster);

  const worldFacts = [
    ...buildUsObservations(worldUsRoster),
    ...buildInternationalObservations(fullRoster),
    ...buildQualifiedObservations(fullRoster),
  ];
  const worldAwardsFacts = buildAwardsFunFacts(fullRoster);

  const formatList = (facts: string[]) =>
    facts.map((f) => `<li>${escapeHtml(abbreviateInsightText(f))}</li>`).join('');

  const selectedOrganizations = new Set(selectedRoster.map((p) => p.university)).size;

  // Faculty/academic wording suits Academia only. The default All view and the other sectors
  // use neutral wording, and sections that need a larger or academic roster are skipped.
  const academic = sector === 'academia';
  const regionName = selectedIsUs ? 'United States' : selectedLocationLabel.replace(/^\S+\s+/, '');
  let sectionNumber = 0;
  const category = (title: string, subtitle: string, body: string): string => {
    if (!body.trim()) return '';
    sectionNumber += 1;
    return `
        <div class="insights-category">
          <div class="insights-category-header">
            <h3 class="insights-category-title">${sectionNumber}. ${title}</h3>
            <p class="insights-category-subtitle">${subtitle}</p>
          </div>
          ${body}
        </div>`;
  };
  const hubsTitle = academic ? 'Faculty Hubs' : 'Organization Hubs';
  const disciplinesTitle = academic
    ? 'Academic Disciplines &amp; Career Stages'
    : 'Fields &amp; Tracks';
  const generationsTitle = academic ? 'Academic Generations' : 'PhD Cohorts';
  const flowSubtitle = academic
    ? 'Undergraduate feeder schools, doctoral alma maters, and international faculty trajectories.'
    : 'Undergraduate feeder schools and doctoral alma maters recorded in the roster.';

  const selectedSection = selectedIsWorld
    ? ''
    : `
      <!-- REGIONAL SECTION -->
      <section class="insights-section-block">
        <div class="insights-section-header">
          <span class="insights-badge">${escapeHtml(selectedLocationLabel)}</span>
          <h2 class="insights-main-heading">${escapeHtml(academic ? `${regionName} Academic Landscape` : `${regionName} Landscape`)}</h2>
          <p class="insights-main-desc">${selectedRoster.length} ${selectedRoster.length === 1 ? 'person' : 'people'} across ${selectedOrganizations} ${academic ? 'institution' : 'organization'}${selectedOrganizations === 1 ? '' : 's'} in ${escapeHtml(selectedIsUs ? 'the United States' : regionName)}.</p>
        </div>
        ${category(
          `Geographic Distribution &amp; ${hubsTitle}`,
          academic
            ? 'Regional density and institutions with the highest concentration of Vietnamese faculty.'
            : 'Regional density and organizations with the most people listed.',
          [
            selectedIsUs && selectedRoster.length ? renderStateGrid(selectedRoster) : '',
            !selectedIsUs && selectedRoster.length
              ? renderWorldMap(selectedRoster, selectedLocation)
              : '',
            selectedRoster.length
              ? renderTopFacultyHubs(
                  selectedRoster,
                  `${selectedIsUs ? 'Top U.S. ' : 'Top '}${hubsTitle}`,
                  academic
                    ? 'Institutions with the most Vietnamese academics in the selected location; click to search.'
                    : 'Organizations with the most people in the selected location; click to search.',
                )
              : '',
            selectedRoster.length
              ? renderCityHubs(
                  selectedRoster,
                  `${selectedIsUs ? 'Top U.S. ' : 'Top '}City & Metro Hubs`,
                  'Cities with the largest concentrations of listed researchers in this location; click to find peers nearby.',
                )
              : '',
          ].join(''),
        )}
        ${category(
          disciplinesTitle,
          academic
            ? 'Broad disciplinary distributions and faculty appointment tracks.'
            : 'Broad field and appointment-track distributions.',
          selectedRoster.length ? renderDistributionCharts(selectedRoster, academic) : '',
        )}
        ${category(
          'Diaspora Pathways &amp; Educational Origins',
          flowSubtitle,
          selectedRoster.length
            ? renderAlmaMaterOriginsMap(selectedRoster) +
                renderAcademicFlowSummary(selectedRoster, academic)
            : '',
        )}
        ${category(
          generationsTitle,
          'Distribution by PhD graduation decade.',
          selectedRoster.length ? renderDecadesChart(selectedRoster) : '',
        )}
        ${category(
          'Scholarly Highlights &amp; Honors',
          'Roster-verified observations, prestigious recognitions, and major honors.',
          `<div class="insights-section">
            <ul class="fun-facts">${formatList([...selectedFacts, ...selectedAwardsFacts])}</ul>
            ${calculationBasis(selectedRoster, selectedLocationLabel)}
          </div>`,
        )}
      </section>
  `;

  // The world/all-locations block numbers from 1 again, after the regional block's sections.
  sectionNumber = 0;
  const worldSection = `
        ${category(
          `Geographic Distribution &amp; ${hubsTitle}`,
          academic
            ? 'Worldwide diaspora geography and top international faculty concentrations.'
            : 'Geography of the roster and the organizations outside the U.S. with the most people.',
          renderWorldMap(fullRoster, selectedLocation) +
            (worldInternationalRoster.length
              ? renderTopFacultyHubs(
                  worldInternationalRoster,
                  `Top International ${hubsTitle}`,
                  academic
                    ? 'Global institutions outside the U.S. with the most Vietnamese academics; click to search.'
                    : 'Organizations outside the U.S. with the most people; click to search.',
                )
              : '') +
            renderCityHubs(
              fullRoster,
              'Top Global City & Metro Hubs',
              'Find peers near you — cities worldwide with the largest clusters of Vietnamese researchers; click any city to filter.',
            ),
        )}
        ${category(
          disciplinesTitle,
          academic
            ? 'Field distribution across STEM, medicine, humanities, and faculty tracks.'
            : 'Field and appointment-track distributions.',
          renderDistributionCharts(fullRoster, academic),
        )}
        ${category(
          'Diaspora Pathways &amp; Educational Origins',
          academic
            ? 'Explore concrete trajectories from your university, top undergraduate feeders, doctoral alma maters, and international career pairings.'
            : 'Explore concrete trajectories from your university, top undergraduate feeders, and doctoral alma maters.',
          renderPathwayExplorer(fullRoster, pathwayInstitution, pathwayStage, baseUrl) +
            renderAlmaMaterOriginsMap(fullRoster) +
            renderAcademicFlowSummary(fullRoster, academic),
        )}
        ${category(
          generationsTitle,
          'Historical cohorts grouped by PhD completion decade.',
          renderDecadesChart(fullRoster),
        )}
        ${category(
          'Scholarly Highlights &amp; Honors',
          'Curated roster observations, prestigious fellowships, and major awards.',
          `<div class="insights-section">
              <ul class="fun-facts">${formatList([...worldFacts, ...worldAwardsFacts])}</ul>
              ${calculationBasis(fullRoster, 'World')}
            </div>`,
        )}`;

  if (rosterEl) {
    rosterEl.innerHTML = `
      <div class="insights-dashboard">
        <!-- DIASPORA PATHWAYS & MACRO INSIGHTS -->
        <section class="insights-section-block insights-main-block" id="pathways-section">
          <div class="insights-section-header">
            <span class="insights-badge">DIASPORA INSIGHTS</span>
            <p class="insights-main-desc">${academic ? 'Geographic distributions, city hubs, PhD graduation cohorts, alma mater pathway explorer, and academic disciplines.' : 'Geographic distributions, city hubs, PhD graduation cohorts, alma mater pathway explorer, and fields.'}</p>
          </div>
          ${renderDiasporaSnapshot(fullRoster, snapshotLang)}
          ${selectedSection}
          ${worldSection}
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
  statsHistory: StatsHistoryPoint[] = [],
  activeGrowthMetric: GrowthMetricKey = 'count',
): string {
  const stats: DerivedRosterStats = deriveRosterStats(roster);
  const htmlInventory = buildRosterHtmlInventory(roster);

  return `
    <div class="health-panel-dashboard">
      ${
        includeHeader
          ? `
        <div class="health-panel-header">
          <div class="health-badge-row">
            <span class="insights-badge">📊 System Health &amp; Maintenance</span>
            <span class="health-records-count">${formatNumber(stats.total)} Total Records</span>
          </div>
          <h2 class="health-main-heading">System Health &amp; Verification</h2>
          <p class="health-main-desc">
            VietProfs is an evidence-audited directory of Vietnamese and Vietnamese-diaspora faculty, researchers, and scientific leaders outside Vietnam.
            This section tracks generated pages and metadata completeness.
          </p>
        </div>
      `
          : ''
      }

      <div class="html-inventory-card generated-html-card">
        <div class="html-inventory-header">
          <div>
            <h3 class="html-inventory-title">Generated HTML Inventory</h3>
            <p class="html-inventory-desc">Roster hubs require at least three listed people.</p>
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
        ${stats.completeness
          .map(
            (m) => `
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
        `,
          )
          .join('')}
      </div>

      ${
        stats.recentUpdatesCount.last30Days > 0
          ? `
        <div class="recent-updates-badge">
          <span class="pulse-dot" aria-hidden="true"></span>
          <span><strong>${formatNumber(stats.recentUpdatesCount.last30Days)} profiles</strong> actively updated or verified in the past 30 days (${formatNumber(stats.recentUpdatesCount.last7Days)} this week).</span>
          <a class="recent-updates-link" href="${baseUrl}?sort=recent">Browse recently updated →</a>
        </div>
      `
          : ''
      }

      ${
        statsHistory.length > 1
          ? `
        <div class="health-growth-section">
          <h3 class="insights-category-title">Project &amp; Archive Growth History</h3>
          <p class="insights-caption">Daily repository snapshots; these counts describe the archive, not changes in the underlying population.</p>
          ${renderGrowthChart(statsHistory, activeGrowthMetric)}
        </div>
      `
          : ''
      }

    </div>
  `;
}
