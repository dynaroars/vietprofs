import './style.css';
import { loadRoster, type Roster } from './data.ts';
import { deriveRosterStats, type DerivedRosterStats } from './derived-stats.ts';
import { escapeHtml } from './utils.ts';

export interface DailyStat {
  date: string;
  requests: number;
  pageViews: number;
  visits?: number;
  uniques?: number;
}

export interface CountryStat {
  code: string;
  name: string;
  flag: string;
  count: number;
}

export interface PageStat {
  path: string;
  label: string;
  count: number;
}

export interface StatsResponse {
  generatedAt: string;
  dataPeriodDays: number;
  breakdownPeriodDays?: number;
  metricNotice?: string;
  coverage?: {
    last7Days: number;
    last30Days: number;
  };
  today: {
    requests: number;
    pageViews: number;
    visits?: number;
    uniques?: number;
  };
  last7Days: {
    requests: number;
    pageViews: number;
    visits?: number;
    uniques?: number;
  };
  last30Days: {
    requests: number;
    pageViews: number;
    visits?: number;
    uniques?: number;
  };
  countriesCount: number;
  topCountries: CountryStat[];
  topPages: PageStat[];
  daily: DailyStat[];
  isDemo?: boolean;
}

const app = document.getElementById('app')!;

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function visitCount(stat: { visits?: number; uniques?: number; requests?: number } | undefined): number {
  return stat?.visits ?? stat?.uniques ?? 0;
}

function coverageLabel(actual: number, requested: number): string {
  return `${actual} of ${requested} days collected`;
}

function pageHref(path: string): string | null {
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  const baseUrl = import.meta.env.BASE_URL;
  return `${baseUrl}${path === '/' ? '' : path.slice(1)}`;
}

function renderRunningHead() {
  const base = import.meta.env.BASE_URL;
  return `<p class="man-running-head">
          <span>STATS(1)</span>
          <span class="man-running-title"><a class="man-running-brand" href="${base}" aria-label="VietProfs directory"><img class="brand-logo" src="${base}vietprofs-bamboo-v.svg" alt="" width="20" height="20"></a><span class="man-running-label">VietProfs Statistics & Insights</span></span>
          <span>STATS(1)</span>
        </p>`;
}

function renderTrafficChart(daily: DailyStat[]): string {
  if (!daily || daily.length === 0) {
    return '<p class="no-data">No traffic chart data available.</p>';
  }

  const width = 800;
  const height = 220;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(10, ...daily.map((d) => Math.max(d.pageViews || 0, visitCount(d))));
  const yTicks = 4;

  const pointsVisits: { x: number; y: number; date: string; val: number }[] = [];
  const pointsViews: { x: number; y: number; date: string; val: number }[] = [];

  daily.forEach((d, i) => {
    const x = paddingLeft + (i / Math.max(1, daily.length - 1)) * chartWidth;
    const yVisits = paddingTop + chartHeight - (visitCount(d) / maxVal) * chartHeight;
    const yViews = paddingTop + chartHeight - ((d.pageViews || 0) / maxVal) * chartHeight;

    pointsVisits.push({ x, y: yVisits, date: d.date, val: visitCount(d) });
    pointsViews.push({ x, y: yViews, date: d.date, val: d.pageViews || 0 });
  });

  const pathVisits = pointsVisits.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const pathViews = pointsViews.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const areaVisits = `${pathVisits} L ${pointsVisits[pointsVisits.length - 1].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${pointsVisits[0].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`;

  let gridLines = '';
  for (let i = 0; i <= yTicks; i++) {
    const val = Math.round((maxVal / yTicks) * i);
    const y = paddingTop + chartHeight - (i / yTicks) * chartHeight;
    gridLines += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3 3" />
      <text x="${paddingLeft - 8}" y="${y + 4}" font-size="11" text-anchor="end" fill="currentColor" opacity="0.6">${formatNumber(val)}</text>
    `;
  }

  let xAxisLabels = '';
  const step = Math.max(1, Math.floor(daily.length / 5));
  daily.forEach((d, i) => {
    if (i % step === 0 || i === daily.length - 1) {
      const x = paddingLeft + (i / Math.max(1, daily.length - 1)) * chartWidth;
      xAxisLabels += `
        <text x="${x}" y="${height - 12}" font-size="11" text-anchor="middle" fill="currentColor" opacity="0.6">${formatDateLabel(d.date)}</text>
      `;
    }
  });

  return `
    <div class="stats-chart-container">
      <div class="chart-legend">
        <span class="legend-item"><span class="legend-dot dot-visits"></span> Unique Visits</span>
        <span class="legend-item"><span class="legend-dot dot-views"></span> HTML Page Views</span>
      </div>
      <div class="svg-wrap">
        <svg viewBox="0 0 ${width} ${height}" class="stats-svg" preserveAspectRatio="none">
          ${gridLines}
          <path d="${areaVisits}" class="area-visits" />
          <path d="${pathVisits}" class="path-visits" fill="none" stroke-width="2.5" />
          <path d="${pathViews}" class="path-views" fill="none" stroke-width="2" stroke-dasharray="4 4" />
          ${xAxisLabels}
        </svg>
      </div>
    </div>
  `;
}

function renderCompletenessSection(stats: DerivedRosterStats): string {
  const base = import.meta.env.BASE_URL;
  return `
    <section class="man-section">
      <h2>DATASET HEALTH & COMPLETENESS</h2>
      <p class="stat-sub">Aggregate completeness across <strong>${formatNumber(stats.total)}</strong> faculty profiles actively maintained outside Vietnam.</p>
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
          <span><strong>${formatNumber(stats.recentUpdatesCount.last30Days)} profiles</strong> updated or verified in the past 30 days (${formatNumber(stats.recentUpdatesCount.last7Days)} this week).</span>
          <a class="recent-updates-link" href="${base}?sort=recent">Browse recently updated →</a>
        </div>
      ` : ''}
    </section>
  `;
}

function renderPathwaysSection(stats: DerivedRosterStats): string {
  const base = import.meta.env.BASE_URL;
  return `
    <section class="man-section">
      <h2>DIASPORA PATHWAYS & MACRO INSIGHTS</h2>
      <div class="pathways-grid">
        <div class="pathway-block">
          <h3>TOP DOCTORAL (PHD) ALMA MATERS</h3>
          <p class="stat-sub">Institutions producing the most Vietnamese faculty worldwide</p>
          <div class="stats-table-wrapper">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Doctoral Institution</th>
                  <th class="num-col">Faculty</th>
                  <th class="num-col">Share</th>
                </tr>
              </thead>
              <tbody>
                ${stats.topPhdInstitutions.map((inst) => `
                  <tr>
                    <td>
                      <a class="stats-page-link" href="${base}?q=${encodeURIComponent(inst.queryParam)}">
                        <strong>${escapeHtml(inst.name)}</strong>
                      </a>
                      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${Math.min(100, inst.percentage * 8)}%"></div></div>
                    </td>
                    <td class="num-col">${formatNumber(inst.count)}</td>
                    <td class="num-col">${inst.percentage}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="pathway-block">
          <h3>TOP UNDERGRADUATE FEEDERS</h3>
          <p class="stat-sub">Universities educating future international faculty</p>
          <div class="stats-table-wrapper">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Undergraduate Institution</th>
                  <th class="num-col">Faculty</th>
                  <th class="num-col">Share</th>
                </tr>
              </thead>
              <tbody>
                ${stats.topUndergradInstitutions.map((inst) => `
                  <tr>
                    <td>
                      <a class="stats-page-link" href="${base}?q=${encodeURIComponent(inst.queryParam)}">
                        <strong>${escapeHtml(inst.name)}</strong>
                      </a>
                      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${Math.min(100, inst.percentage * 6)}%"></div></div>
                    </td>
                    <td class="num-col">${formatNumber(inst.count)}</td>
                    <td class="num-col">${inst.percentage}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="generations-container">
        <h3>ACADEMIC GENERATIONS (PHD DECADE COHORTS)</h3>
        <p class="stat-sub">Distribution of doctoral graduations across decades</p>
        <div class="generations-grid">
          ${stats.academicGenerations.map((gen) => `
            <div class="generation-card">
              <div class="generation-header">
                <span class="generation-decade">${escapeHtml(gen.decade)}</span>
                <strong class="generation-count">${formatNumber(gen.count)}</strong>
              </div>
              <span class="generation-range">${escapeHtml(gen.range)}</span>
              <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${gen.percentage}%"></div></div>
              <span class="generation-pct">${gen.percentage}% of dated degrees</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderStatsContent(data: StatsResponse, rosterStats: DerivedRosterStats) {
  const topCountry = data.topCountries?.[0];
  const coverage7 = data.coverage?.last7Days ?? Math.min(data.daily?.length || 0, 7);
  const coverage30 = data.coverage?.last30Days ?? (data.daily?.length || 0);
  const headline = data.countriesCount > 0
    ? `VietProfs received visits from <strong>${data.countriesCount} request-origin countries</strong> today.`
    : `Hostname-scoped aggregate network statistics for VietProfs.`;

  return `
    <main>
      <article class="man-page stats-man-page">
        ${renderRunningHead()}

        <section class="man-section name-section">
          <h2>NAME</h2>
          <div class="identity">
            <div class="identity-details">
              <div class="name-heading">
                <h1>VietProfs Statistics & Insights</h1>
              </div>
              <p class="synopsis">Dataset health, diaspora education pathways, and privacy-respecting visitor metrics.</p>
            </div>
          </div>
        </section>

        ${renderCompletenessSection(rosterStats)}

        ${renderPathwaysSection(rosterStats)}

        <div class="stats-highlight-banner">
          <p class="highlight-text">${headline}</p>
          ${data.isDemo ? '<span class="demo-badge">Preview Mode</span>' : ''}
        </div>

        ${coverage30 < 30 ? `<div class="stats-highlight-banner">
          <p class="highlight-text"><strong>Data coverage:</strong> ${escapeHtml(coverageLabel(coverage30, 30))}. The 30-day archive is still building.</p>
        </div>` : ''}

        <section class="man-section">
          <h2>VISITOR TRAFFIC (30 DAYS)</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Visits Today</span>
              <strong class="stat-value">${formatNumber(visitCount(data.today))}</strong>
              <span class="stat-sub">${formatNumber(data.today?.pageViews || 0)} successful HTML page requests</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Visits (7 Days)</span>
              <strong class="stat-value">${formatNumber(visitCount(data.last7Days))}</strong>
              <span class="stat-sub">${escapeHtml(coverageLabel(coverage7, 7))}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Visits (30-Day Window)</span>
              <strong class="stat-value">${formatNumber(visitCount(data.last30Days))}</strong>
              <span class="stat-sub">${escapeHtml(coverageLabel(coverage30, 30))}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Successful HTML Requests (30-Day Window)</span>
              <strong class="stat-value">${formatNumber(data.last30Days?.pageViews || 0)}</strong>
              <span class="stat-sub">${formatNumber(data.last30Days?.requests || 0)} HTTP requests including assets</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Request-Origin Countries Today</span>
              <strong class="stat-value">${formatNumber(data.countriesCount || 0)}</strong>
              <span class="stat-sub">${topCountry ? `Most visits: ${escapeHtml(topCountry.flag)} ${escapeHtml(topCountry.name)}` : 'No visit data'}</span>
            </div>
          </div>
        </section>

        <section class="man-section">
          <h2>TRAFFIC TREND (LAST 30 DAYS)</h2>
          ${renderTrafficChart(data.daily)}
        </section>

        <section class="man-section">
          <h2>TOP VISITOR COUNTRIES (TODAY)</h2>
          <div class="stats-table-wrapper">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th class="num-col">Visits</th>
                </tr>
              </thead>
              <tbody>
                ${(data.topCountries || []).slice(0, 10).map((c) => {
                  const maxCount = data.topCountries[0]?.count || 1;
                  const pct = Math.round((c.count / maxCount) * 100);
                  return `
                    <tr>
                      <td>
                        <span class="country-cell">
                          <span class="flag-icon" aria-hidden="true">${escapeHtml(c.flag)}</span>
                          <span class="country-name">${escapeHtml(c.name)}</span>
                        </span>
                        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${pct}%"></div></div>
                      </td>
                      <td class="num-col">${formatNumber(c.count)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="man-section">
          <h2>MOST REQUESTED PAGES (TODAY)</h2>
          <div class="stats-table-wrapper">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Path</th>
                  <th class="num-col">Requests</th>
                </tr>
              </thead>
              <tbody>
                ${(data.topPages || []).slice(0, 8).map((p) => {
                  const href = pageHref(p.path);
                  const pageLabel = href
                    ? `<a class="stats-page-link" href="${escapeHtml(href)}"><strong>${escapeHtml(p.label)}</strong></a>`
                    : `<strong>${escapeHtml(p.label)}</strong>`;
                  const pagePath = href
                    ? `<a class="stats-page-link" href="${escapeHtml(href)}"><code class="path-code">${escapeHtml(p.path)}</code></a>`
                    : `<code class="path-code">${escapeHtml(p.path)}</code>`;
                  return `
                  <tr>
                    <td>${pageLabel}</td>
                    <td>${pagePath}</td>
                    <td class="num-col">${formatNumber(p.count)}</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="man-section privacy-section">
          <h2>PRIVACY & METHODOLOGY</h2>
          <div class="privacy-note">
            <p>
              VietProfs respects visitor privacy. This page displays only high-level aggregate metrics provided by Cloudflare.
            </p>
            <ul>
              <li><strong>No individual IP data:</strong> VietProfs receives aggregate counts, not visitor IP addresses or request-level logs.</li>
              <li><strong>No cookies:</strong> No cookies, persistent identifiers, or local tracking scripts are used.</li>
              <li><strong>Hostname scoped:</strong> Every displayed count is filtered to <code>vietprofs.roars.dev</code>; sibling <code>roars.dev</code> sites are excluded.</li>
              <li><strong>Visits:</strong> The visit estimate is more audience-oriented than raw requests, but it is not a count of verified people and may include automation.</li>
              <li><strong>Page requests:</strong> Page totals include only successful HTML responses. HTTP-request totals also include errors, images, scripts, styles, JSON, and other assets.</li>
              <li><strong>Countries:</strong> Locations are request-origin network geolocations, not demographic claims about readers.</li>
              <li><strong>Coverage:</strong> The API reports how many dated snapshots contribute to each window; a scheduled archive builds the full 30-day history.</li>
              <li><strong>Caching:</strong> Stats are cached at the edge for 10 minutes to minimize backend load.</li>
            </ul>
            ${data.metricNotice ? `<p class="stat-sub">${escapeHtml(data.metricNotice)}</p>` : ''}
          </div>
        </section>

        <footer class="man-footer">
          <p>
            <a href="${import.meta.env.BASE_URL}">← Back to VietProfs Directory</a> ·
            <a href="${import.meta.env.BASE_URL}submit.html">Submit / Update Entry</a> ·
            <a href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </footer>
      </article>
    </main>
  `;
}

function renderError(message: string, rosterStats?: DerivedRosterStats) {
  const base = import.meta.env.BASE_URL;
  return `
    <main>
      <article class="man-page stats-man-page">
        ${renderRunningHead()}

        <section class="man-section name-section">
          <h2>NAME</h2>
          <div class="identity">
            <div class="identity-details">
              <div class="name-heading">
                <h1>VietProfs Statistics & Insights</h1>
              </div>
              <p class="synopsis">Dataset health and diaspora education pathways.</p>
            </div>
          </div>
        </section>

        ${rosterStats ? renderCompletenessSection(rosterStats) : ''}
        ${rosterStats ? renderPathwaysSection(rosterStats) : ''}

        <section class="man-section">
          <h2>VISITOR TRAFFIC</h2>
          <div class="stats-error-box">
            <p class="error-title">Visitor statistics are temporarily unavailable.</p>
            <p class="error-detail">${escapeHtml(message || 'Could not fetch aggregate traffic statistics.')}</p>
            <button type="button" id="retry-btn" class="retry-btn">Retry loading visitor traffic</button>
          </div>
        </section>

        <footer class="man-footer">
          <p><a href="${base}">← Back to VietProfs Directory</a></p>
        </footer>
      </article>
    </main>
  `;
}

function renderLoading() {
  return `
    <main>
      <article class="man-page">
        ${renderRunningHead()}

        <section class="man-section">
          <h2>STATISTICS & INSIGHTS</h2>
          <div class="stats-loading-box">
            <p>Loading dataset health and visitor statistics...</p>
          </div>
        </section>
      </article>
    </main>
  `;
}

const STATS_ENDPOINTS = ['/api/stats', 'https://vietprofs.roars.dev/api/stats'];

async function fetchStats(): Promise<StatsResponse> {
  let lastError: Error | null = null;

  for (const endpoint of STATS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = (await res.json()) as StatsResponse;
        if (data && (data.today || data.last30Days)) {
          return data;
        }
        lastError = new Error('The statistics service returned an incomplete response.');
        continue;
      }
      lastError = new Error(await statusMessage(res));
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error('Unable to connect to statistics service.');
}

async function statusMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; message?: string };
    const detail = [body?.error, body?.message].filter(Boolean).join(' — ');
    if (detail) return detail;
  } catch {
    // Not a JSON error envelope; fall back to the status line.
  }
  return `The statistics service responded with HTTP ${res.status}.`;
}

async function initStatsPage() {
  app.innerHTML = renderLoading();

  let rosterStats: DerivedRosterStats;
  try {
    const roster = await loadRoster();
    rosterStats = deriveRosterStats(roster);
  } catch {
    rosterStats = {
      total: 0,
      completeness: [],
      topPhdInstitutions: [],
      topUndergradInstitutions: [],
      academicGenerations: [],
      regionFieldDistribution: [],
      recentUpdatesCount: { last7Days: 0, last30Days: 0, last90Days: 0 },
    };
  }

  try {
    const data = await fetchStats();
    app.innerHTML = renderStatsContent(data, rosterStats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Temporarily unavailable';
    app.innerHTML = renderError(msg, rosterStats);
    document.getElementById('retry-btn')?.addEventListener('click', () => initStatsPage());
  }
}

initStatsPage();
