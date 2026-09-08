import './style.css';
import { escapeHtml } from './utils.ts';

export interface DailyStat {
  date: string;
  requests: number;
  pageViews: number;
  uniques: number;
}

export interface CountryStat {
  code: string;
  name: string;
  flag: string;
  count: number;
}

export interface ReferrerStat {
  host: string;
  label: string;
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
  today: {
    requests: number;
    pageViews: number;
    uniques: number;
  };
  last7Days: {
    requests: number;
    pageViews: number;
    uniques: number;
  };
  last30Days: {
    requests: number;
    pageViews: number;
    uniques: number;
  };
  countriesCount: number;
  topCountries: CountryStat[];
  topReferrers: ReferrerStat[];
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

function renderHeader() {
  return `
    <header>
      <a class="eyebrow" href="${import.meta.env.BASE_URL}">
        <img class="brand-logo" src="${import.meta.env.BASE_URL}vietprofs-bamboo-v.svg" alt="" width="32" height="32" />
        VietProfs
      </a>
      <span class="man-page-title">STATS(1)</span>
    </header>
  `;
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

  const maxVal = Math.max(10, ...daily.map(d => Math.max(d.pageViews || 0, d.uniques || 0, d.requests || 0)));
  const yTicks = 4;

  const pointsVisits: { x: number; y: number; date: string; val: number }[] = [];
  const pointsViews: { x: number; y: number; date: string; val: number }[] = [];

  daily.forEach((d, i) => {
    const x = paddingLeft + (i / Math.max(1, daily.length - 1)) * chartWidth;
    const yVisits = paddingTop + chartHeight - ((d.uniques || d.requests || 0) / maxVal) * chartHeight;
    const yViews = paddingTop + chartHeight - ((d.pageViews || 0) / maxVal) * chartHeight;

    pointsVisits.push({ x, y: yVisits, date: d.date, val: d.uniques || d.requests || 0 });
    pointsViews.push({ x, y: yViews, date: d.date, val: d.pageViews || 0 });
  });

  const pathVisits = pointsVisits.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const pathViews = pointsViews.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const areaVisits = `${pathVisits} L ${pointsVisits[pointsVisits.length - 1].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${pointsVisits[0].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`;

  // Generate gridlines and Y labels
  let gridLines = '';
  for (let i = 0; i <= yTicks; i++) {
    const val = Math.round((maxVal / yTicks) * i);
    const y = paddingTop + chartHeight - (i / yTicks) * chartHeight;
    gridLines += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3 3" />
      <text x="${paddingLeft - 8}" y="${y + 4}" font-size="11" text-anchor="end" fill="currentColor" opacity="0.6">${formatNumber(val)}</text>
    `;
  }

  // Generate X axis labels (pick ~6 evenly spaced dates)
  let xAxisLabels = '';
  const step = Math.max(1, Math.floor(daily.length / 5));
  daily.forEach((d, i) => {
    if (i % step === 0 || i === daily.length - 1) {
      const x = paddingLeft + (i / Math.max(1, daily.length - 1)) * chartWidth;
      xAxisLabels += `
        <text x="${x}" y="${height - 10}" font-size="11" text-anchor="middle" fill="currentColor" opacity="0.6">${escapeHtml(formatDateLabel(d.date))}</text>
      `;
    }
  });

  return `
    <div class="stats-chart-container">
      <div class="chart-legend">
        <span class="legend-item legend-visits"><span class="legend-swatch"></span> Daily unique IPs</span>
        <span class="legend-item legend-views"><span class="legend-swatch"></span> Page Views</span>
      </div>
      <svg class="stats-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="30-day traffic trend chart">
        ${gridLines}
        ${xAxisLabels}
        <path d="${areaVisits}" fill="var(--chart-fill, rgba(37, 99, 235, 0.12))" />
        <path d="${pathViews}" fill="none" stroke="var(--accent-dim, #60a5fa)" stroke-width="2" stroke-dasharray="4 3" />
        <path d="${pathVisits}" fill="none" stroke="var(--accent-color, #2563eb)" stroke-width="2.5" />
        ${pointsVisits.map(p => `
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="var(--accent-color, #2563eb)">
            <title>${escapeHtml(p.date)}: ${formatNumber(p.val)} visits</title>
          </circle>
        `).join('')}
      </svg>
    </div>
  `;
}

function renderStatsContent(data: StatsResponse) {
  const topCountry = data.topCountries?.[0];
  const headline = data.countriesCount > 0
    ? `VietProfs traffic came from <strong>${data.countriesCount} countries</strong> today.`
    : `VietProfs aggregate readership statistics across the last 30 days.`;

  return `
    <main>
      <article class="man-page stats-man-page">
        <p class="man-running-head">
          <span>STATS(1)</span>
          <span>VietProfs Visitor Statistics</span>
          <span>STATS(1)</span>
        </p>

        <section class="man-section name-section">
          <h2>NAME</h2>
          <div class="identity">
            <div class="identity-details">
              <div class="name-heading">
                <h1>Public Visitor Statistics</h1>
              </div>
              <p class="synopsis">Privacy-respecting aggregate traffic and global readership metrics for VietProfs.</p>
            </div>
          </div>
        </section>

        <div class="stats-highlight-banner">
          <p class="highlight-text">${headline}</p>
          ${data.isDemo ? '<span class="demo-badge">Preview Mode (Cloudflare token pending)</span>' : ''}
        </div>

        <section class="man-section">
          <h2>OVERVIEW (30 DAYS)</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Unique IPs Today</span>
              <strong class="stat-value">${formatNumber(data.today?.uniques || data.today?.requests || 0)}</strong>
              <span class="stat-sub">${formatNumber(data.today?.pageViews || 0)} page views</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Daily Unique IPs (7 Days)</span>
              <strong class="stat-value">${formatNumber(data.last7Days?.uniques || data.last7Days?.requests || 0)}</strong>
              <span class="stat-sub">${formatNumber(data.last7Days?.pageViews || 0)} page views</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Daily Unique IPs (30 Days)</span>
              <strong class="stat-value">${formatNumber(data.last30Days?.uniques || data.last30Days?.requests || 0)}</strong>
              <span class="stat-sub">${formatNumber(data.last30Days?.pageViews || 0)} page views</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Page Views (30 Days)</span>
              <strong class="stat-value">${formatNumber(data.last30Days?.pageViews || 0)}</strong>
              <span class="stat-sub">${formatNumber(data.last30Days?.requests || 0)} total requests</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Countries Represented</span>
              <strong class="stat-value">${formatNumber(data.countriesCount || 0)}</strong>
              <span class="stat-sub">${topCountry ? `Top: ${escapeHtml(topCountry.flag)} ${escapeHtml(topCountry.name)}` : 'Global readership'}</span>
            </div>
          </div>
        </section>

        <section class="man-section">
          <h2>TRAFFIC TREND (LAST 30 DAYS)</h2>
          ${renderTrafficChart(data.daily)}
        </section>

        <div class="stats-columns-grid">
          <section class="man-section">
            <h2>TOP COUNTRIES (TODAY)</h2>
            <div class="stats-table-wrapper">
              <table class="stats-table">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th class="num-col">Traffic</th>
                  </tr>
                </thead>
                <tbody>
                  ${(data.topCountries || []).slice(0, 10).map(c => {
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
            <h2>TOP REFERRERS (TODAY)</h2>
            <div class="stats-table-wrapper">
              <table class="stats-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th class="num-col">Visits</th>
                  </tr>
                </thead>
                <tbody>
                  ${(data.topReferrers || []).length === 0 ? `
                    <tr>
                      <td colspan="2">Referrer details are unavailable on the current analytics plan.</td>
                    </tr>
                  ` : (data.topReferrers || []).slice(0, 8).map(r => {
                    const maxCount = data.topReferrers[0]?.count || 1;
                    const pct = Math.round((r.count / maxCount) * 100);
                    return `
                      <tr>
                        <td>
                          <span class="referrer-name">${escapeHtml(r.label)}</span>
                          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${pct}%"></div></div>
                        </td>
                        <td class="num-col">${formatNumber(r.count)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </section>
        </div>

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
                ${(data.topPages || []).slice(0, 8).map(p => `
                  <tr>
                    <td><strong>${escapeHtml(p.label)}</strong></td>
                    <td><code class="path-code">${escapeHtml(p.path)}</code></td>
                    <td class="num-col">${formatNumber(p.count)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="man-section privacy-section">
          <h2>PRIVACY & METHODOLOGY</h2>
          <div class="privacy-note">
            <p>
              VietProfs respects visitor privacy. This statistics page displays only high-level, aggregate metrics processed at Cloudflare's network edge.
            </p>
            <ul>
              <li><strong>No individual IP data:</strong> VietProfs receives only Cloudflare's aggregate counts, not visitor IP addresses or request-level logs.</li>
              <li><strong>No cookies:</strong> No cookies, persistent identifiers, or local tracking scripts are used.</li>
              <li><strong>Aggregate metrics:</strong> Location metrics reflect country-level aggregated traffic.</li>
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

function renderError(message: string) {
  return `
    <main>
      <article class="man-page">
        <p class="man-running-head">
          <span>STATS(1)</span>
          <span>VietProfs Visitor Statistics</span>
          <span>STATS(1)</span>
        </p>

        <section class="man-section">
          <h2>VISITOR STATISTICS</h2>
          <div class="stats-error-box">
            <p class="error-title">Visitor statistics are temporarily unavailable.</p>
            <p class="error-detail">${escapeHtml(message || 'Could not fetch aggregate traffic statistics.')}</p>
            <button type="button" id="retry-btn" class="retry-btn">Retry loading stats</button>
          </div>
        </section>

        <footer class="man-footer">
          <p><a href="${import.meta.env.BASE_URL}">← Back to VietProfs Directory</a></p>
        </footer>
      </article>
    </main>
  `;
}

function renderLoading() {
  return `
    <main>
      <article class="man-page">
        <p class="man-running-head">
          <span>STATS(1)</span>
          <span>VietProfs Visitor Statistics</span>
          <span>STATS(1)</span>
        </p>

        <section class="man-section">
          <h2>VISITOR STATISTICS</h2>
          <div class="stats-loading-box">
            <p>Loading aggregate visitor statistics...</p>
          </div>
        </section>
      </article>
    </main>
  `;
}

async function fetchStats(): Promise<StatsResponse> {
  const endpoints = [
    '/api/stats',
    'https://vietprofs.roars.dev/api/stats',
  ];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = (await res.json()) as StatsResponse;
        if (data && (data.today || data.last30Days)) {
          return data;
        }
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('Unable to connect to statistics service.');
}

async function initStatsPage() {
  app.innerHTML = renderHeader() + renderLoading();

  try {
    const data = await fetchStats();
    app.innerHTML = renderHeader() + renderStatsContent(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Temporarily unavailable';
    app.innerHTML = renderHeader() + renderError(msg);
    document.getElementById('retry-btn')?.addEventListener('click', () => initStatsPage());
  }
}

initStatsPage();
