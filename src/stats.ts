import './style.css';
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
  visits?: number;
  pct?: number;
}

export interface PageStat {
  path: string;
  label: string;
  count: number;
}

export interface PageBreakdown {
  profileViews: number;
  profilePct: number;
  mainViews: number;
  submitViews: number;
  statsViews: number;
  otherViews: number;
  totalViews: number;
}

export interface BaselineStat {
  avgVisitsPerDay: number;
  medianVisitsPerDay: number;
  avgPageViewsPerDay: number;
}

export interface StatsResponse {
  generatedAt: string;
  dataPeriodDays: number;
  breakdownPeriodDays?: number;
  metricNotice?: string;
  retentionNotice?: string;
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
  baseline?: BaselineStat;
  countriesCount: number;
  topCountries: CountryStat[];
  topCountriesToday?: CountryStat[];
  topPages: PageStat[];
  topPagesToday?: PageStat[];
  pageBreakdown?: PageBreakdown;
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

function formatDateFull(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
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

function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }
  return sorted[middle];
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
        <span class="legend-item"><span class="legend-dot dot-visits"></span> Visits (Network Estimate)</span>
        <span class="legend-item"><span class="legend-dot dot-views"></span> Successful HTML Page Views</span>
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

function renderDailyTable(daily: DailyStat[]): string {
  if (!daily || daily.length === 0) return '';
  const reversed = [...daily].reverse();

  return `
    <div class="stats-table-wrapper" style="margin-top: 1.5rem;">
      <table class="stats-table">
        <thead>
          <tr>
            <th>Date</th>
            <th class="num-col">Visits</th>
            <th class="num-col">Successful HTML Page Views</th>
            <th class="num-col">Eyeball HTTP Requests</th>
          </tr>
        </thead>
        <tbody>
          ${reversed.map((d) => `
            <tr>
              <td><strong>${escapeHtml(formatDateFull(d.date))}</strong></td>
              <td class="num-col"><strong>${formatNumber(visitCount(d))}</strong></td>
              <td class="num-col">${formatNumber(d.pageViews || 0)}</td>
              <td class="num-col">${formatNumber(d.requests || 0)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderStatsContent(data: StatsResponse) {
  const coverage7 = data.coverage?.last7Days ?? Math.min(data.daily?.length || 0, 7);
  const coverage30 = data.coverage?.last30Days ?? (data.daily?.length || 0);

  const visits7List = (data.daily || []).slice(-7).map(d => visitCount(d));
  const avgVisits7 = data.baseline?.avgVisitsPerDay ?? Math.round(visitCount(data.last7Days) / Math.max(1, coverage7));
  const medianVisits7 = data.baseline?.medianVisitsPerDay ?? calculateMedian(visits7List);

  const headline = data.topCountries?.length > 0
    ? `VietProfs received visits from <strong>${data.topCountries.length} request-origin countries</strong> over the recent 7-day period.`
    : `Hostname-scoped aggregate network statistics for VietProfs.`;

  // Page breakdown statistics
  const profileViews = data.pageBreakdown?.profileViews ?? 0;
  const profilePct = data.pageBreakdown?.profilePct ?? 0;
  const mainViews = data.pageBreakdown?.mainViews ?? 0;
  const submitViews = data.pageBreakdown?.submitViews ?? 0;
  const statsViews = data.pageBreakdown?.statsViews ?? 0;

  // 7-day country total visits calculation for percentages
  const total7DayCountryVisits = (data.topCountries || []).reduce((acc, c) => acc + (c.visits || c.count || 0), 0);

  return `
    <main>
      <article class="man-page stats-man-page">
        ${renderRunningHead()}

        <section class="man-section name-section">
          <div class="identity">
            <div class="identity-details">
              <div class="name-heading">
                <h1>VietProfs Visitor Statistics</h1>
              </div>
              <p class="synopsis">Hostname-scoped, privacy-respecting visitor traffic metrics powered by Cloudflare Analytics.</p>
            </div>
          </div>
        </section>

        <div class="stats-highlight-banner">
          <p class="highlight-text">${headline}</p>
          ${data.isDemo ? '<span class="demo-badge">Preview Mode</span>' : ''}
        </div>

        <div class="stats-highlight-banner info-banner">
          <p class="highlight-text">
            <strong>Data Retention &amp; Archive Status:</strong> Cloudflare live API retention is ~8 days. Local stats archive status: <strong>${escapeHtml(coverageLabel(coverage30, 30))}</strong>.
          </p>
        </div>

        <section class="man-section">
          <h2>VISITOR TRAFFIC METRICS</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Visits Today</span>
              <strong class="stat-value">${formatNumber(visitCount(data.today))}</strong>
              <span class="stat-sub">${formatNumber(data.today?.pageViews || 0)} successful HTML page views</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Visits (7 Days)</span>
              <strong class="stat-value">${formatNumber(visitCount(data.last7Days))}</strong>
              <span class="stat-sub">${escapeHtml(coverageLabel(coverage7, 7))}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Recent Daily Baseline (7 Days)</span>
              <strong class="stat-value">${formatNumber(medianVisits7)} <span class="stat-unit">median visits/day</span></strong>
              <span class="stat-sub">Average: ${formatNumber(avgVisits7)} visits/day over recent available days</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Visits (30-Day Window)</span>
              <strong class="stat-value">${formatNumber(visitCount(data.last30Days))}</strong>
              <span class="stat-sub">${escapeHtml(coverageLabel(coverage30, 30))}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Successful HTML Page Views (30 Days)</span>
              <strong class="stat-value">${formatNumber(data.last30Days?.pageViews || 0)}</strong>
              <span class="stat-sub">${formatNumber(data.last30Days?.requests || 0)} HTTP requests including assets</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Request-Origin Countries (7 Days)</span>
              <strong class="stat-value">${formatNumber(data.countriesCount || 0)}</strong>
              <span class="stat-sub">${data.topCountries?.[0] ? `Top: ${escapeHtml(data.topCountries[0].flag)} ${escapeHtml(data.topCountries[0].name)}` : 'No visit data'}</span>
            </div>
          </div>
        </section>

        <section class="man-section">
          <h2>TRAFFIC TREND &amp; DAILY HISTORY</h2>
          ${renderTrafficChart(data.daily)}
          ${renderDailyTable(data.daily)}
        </section>

        <section class="man-section">
          <h2>TOP VISITOR COUNTRIES (7 DAYS)</h2>
          <div class="stats-table-wrapper">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th class="num-col">Visits (7 Days)</th>
                  <th class="num-col">Share of Visits</th>
                </tr>
              </thead>
              <tbody>
                ${(data.topCountries || []).slice(0, 10).map((c) => {
                  const visits = c.visits ?? c.count ?? 0;
                  const pct = c.pct ?? (total7DayCountryVisits > 0 ? Math.round((visits / total7DayCountryVisits) * 1000) / 10 : 0);
                  const maxVisits = data.topCountries[0]?.visits ?? data.topCountries[0]?.count ?? 1;
                  const barPct = Math.min(100, Math.round((visits / maxVisits) * 100));
                  return `
                    <tr>
                      <td>
                        <span class="country-cell">
                          <span class="flag-icon" aria-hidden="true">${escapeHtml(c.flag)}</span>
                          <span class="country-name">${escapeHtml(c.name)}</span>
                        </span>
                        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${barPct}%"></div></div>
                      </td>
                      <td class="num-col">${formatNumber(visits)}</td>
                      <td class="num-col">${pct.toFixed(1)}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          ${(data.topCountriesToday && data.topCountriesToday.length > 0) ? `
            <details class="stats-secondary-details" style="margin-top: 1rem;">
              <summary><strong>View Top Countries Today (Secondary View)</strong></summary>
              <div class="stats-table-wrapper" style="margin-top: 0.5rem;">
                <table class="stats-table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th class="num-col">Visits Today</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.topCountriesToday.slice(0, 5).map((c) => `
                      <tr>
                        <td>
                          <span class="country-cell">
                            <span class="flag-icon" aria-hidden="true">${escapeHtml(c.flag)}</span>
                            <span class="country-name">${escapeHtml(c.name)}</span>
                          </span>
                        </td>
                        <td class="num-col">${formatNumber(c.count)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </details>
          ` : ''}
        </section>

        <section class="man-section">
          <h2>MOST REQUESTED PAGES (7 DAYS)</h2>

          <div class="stats-callout-box">
            <h3>Content Category Breakdown (7 Days)</h3>
            <div class="stats-callout-grid">
              <div class="callout-item">
                <span class="callout-label">Individual Professor Profiles</span>
                <strong class="callout-value">${formatNumber(profileViews)} views</strong>
                <span class="callout-sub">${profilePct}% of 7-day HTML views</span>
              </div>
              <div class="callout-item">
                <span class="callout-label">Main Directory (Homepage)</span>
                <strong class="callout-value">${formatNumber(mainViews)} views</strong>
              </div>
              <div class="callout-item">
                <span class="callout-label">Submit / Update Entry</span>
                <strong class="callout-value">${formatNumber(submitViews)} views</strong>
              </div>
              <div class="callout-item">
                <span class="callout-label">Visitor Statistics</span>
                <strong class="callout-value">${formatNumber(statsViews)} views</strong>
              </div>
            </div>
            <p class="callout-note">
              <em>Individual professor profiles account for approximately ${profilePct}% of recent page views.</em>
            </p>
          </div>

          <div class="stats-table-wrapper">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Path</th>
                  <th class="num-col">HTML Page Views (7 Days)</th>
                </tr>
              </thead>
              <tbody>
                ${(data.topPages || []).slice(0, 10).map((p) => {
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
          <h2>PRIVACY &amp; METHODOLOGY</h2>
          <div class="privacy-note">
            <p>
              VietProfs respects visitor privacy. This page displays high-level aggregate metrics provided by Cloudflare Analytics without tracking individual readers.
            </p>
            <ul>
              <li><strong>Visits:</strong> Visits are Cloudflare network visit estimates, not unique verified people.</li>
              <li><strong>Eyeball Traffic:</strong> Eyeball traffic represents external client requests. It is not equivalent to verified human visitors and may still include automated traffic.</li>
              <li><strong>Page Requests:</strong> Page view totals include only successful HTML responses (HTTP 200–399). Total HTTP requests include non-eyeball traffic, images, scripts, styles, JSON datasets, and static asset files.</li>
              <li><strong>Countries:</strong> Locations represent request-origin network geolocations, not demographic assertions about individual readers.</li>
              <li><strong>Data Retention &amp; Coverage:</strong> Cloudflare live API retention is approximately 8 days. A local scheduled archive builds the 30-day history over time; currently ${escapeHtml(coverageLabel(coverage30, 30))}.</li>
              <li><strong>Hostname Scoped:</strong> Every metric is strictly filtered to <code>vietprofs.roars.dev</code>; traffic for sibling <code>roars.dev</code> sites is excluded.</li>
              <li><strong>Unavailable Metrics:</strong> Referrer hosts (Google, LinkedIn, Facebook), returning vs. new visitors, session duration, and verified human/bot percentages are not provided by Cloudflare on this zone plan tier and are intentionally omitted.</li>
              <li><strong>Edge Caching:</strong> Public responses are cached at the Cloudflare edge for 10 minutes (<code>Cache-Control: public, max-age=600</code>).</li>
            </ul>
            ${data.metricNotice ? `<p class="stat-sub">${escapeHtml(data.metricNotice)}</p>` : ''}
          </div>
        </section>

        <footer class="man-footer">
          <p>
            <a href="${import.meta.env.BASE_URL}">← Back to Directory</a> ·
            <a href="${import.meta.env.BASE_URL}?view=health">Data Health &amp; Completeness</a> ·
            <a href="${import.meta.env.BASE_URL}?view=insights">Diaspora Insights &amp; Pathways</a> ·
            <a href="${import.meta.env.BASE_URL}submit.html">Submit / Update</a> ·
            <a href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </footer>
      </article>
    </main>
  `;
}

function renderError(message: string) {
  const base = import.meta.env.BASE_URL;
  return `
    <main>
      <article class="man-page stats-man-page">
        ${renderRunningHead()}

        <section class="man-section name-section">
          <div class="identity">
            <div class="identity-details">
              <div class="name-heading">
                <h1>VietProfs Visitor Statistics</h1>
              </div>
              <p class="synopsis">Privacy-respecting visitor metrics.</p>
            </div>
          </div>
        </section>

        <section class="man-section">
          <h2>VISITOR TRAFFIC</h2>
          <div class="stats-error-box">
            <p class="error-title">Visitor statistics are temporarily unavailable.</p>
            <p class="error-detail">${escapeHtml(message || 'Could not fetch aggregate traffic statistics.')}</p>
            <button type="button" id="retry-btn" class="retry-btn">Retry loading visitor traffic</button>
          </div>
        </section>

        <footer class="man-footer">
          <p>
            <a href="${base}">← Back to Directory</a> ·
            <a href="${base}?view=health">Data Health &amp; Completeness</a> ·
            <a href="${base}?view=insights">Diaspora Insights &amp; Pathways</a>
          </p>
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
          <h2>VISITOR STATISTICS</h2>
          <div class="stats-loading-box">
            <p>Loading visitor statistics...</p>
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

  try {
    const data = await fetchStats();
    app.innerHTML = renderStatsContent(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Temporarily unavailable';
    app.innerHTML = renderError(msg);
    document.getElementById('retry-btn')?.addEventListener('click', () => initStatsPage());
  }
}

initStatsPage();
