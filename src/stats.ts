import './style.css';
import { escapeHtml } from './utils.ts';

interface DailyBrowserStat {
  date: string;
  pageViews: number | null;
  visits: number | null;
  status: 'complete' | 'partial' | 'missing';
}

interface BrowserStatsResponse {
  schemaVersion: 3;
  source: 'cloudflare-rum';
  generatedAt: string;
  servedAt?: string;
  timezone: 'UTC';
  status: 'ok' | 'stale' | 'demo';
  stale: boolean;
  notice?: string;
  measurementStartedAt: string | null;
  coverage: { firstDate: string | null; lastCompleteDate: string; completeDays7: number; availableDays30: number };
  today: { date: string; pageViews: number | null; visits: number | null; complete: false; collected: boolean };
  last7Complete: { pageViews: number; visits: number; days: number; avgPageViews: number | null; avgVisits: number | null };
  last30Available: { pageViews: number; visits: number; days: number };
  daily: DailyBrowserStat[];
  countries: Array<{ code: string; name: string; flag: string; pageViews: number; pct: number }>;
  categories: Array<{ key: string; label: string; pageViews: number; pct: number }>;
  categoryTotal: number;
  categoryPeriod: { startDate: string; endDate: string; days: number };
  historicalTransition: { newSeriesStartedAt: string | null; oldSeriesRetainedInternally: true };
  isDemo?: boolean;
}

const app = document.getElementById('app')!;
const base = import.meta.env.BASE_URL;

function formatNumber(value: number | null): string {
  return value === null ? '—' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}

function formatDate(value: string | null, withYear = true): string {
  if (!value) return 'Not available';
  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: withYear ? 'numeric' : undefined, timeZone: 'UTC' }).format(date);
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return `${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'UTC' }).format(date)} UTC`;
}

function runningHead(): string {
  return `<p class="man-running-head">
    <span>STATS(1)</span>
    <span class="man-running-title"><a class="man-running-brand" href="${base}index.html" aria-label="VietProfs directory"><img class="brand-logo" src="${base}vietprofs-bamboo-v.svg" alt="" width="20" height="20"><span class="man-running-label">VietProfs Statistics &amp; Insights</span></a></span>
    <span>STATS(1)</span>
  </p>`;
}

function footer(): string {
  return `<footer class="man-footer"><p>
    <a href="${base}index.html">← Back to Directory</a> ·
    <a href="${base}index.html?view=health">Data Health &amp; Completeness</a> ·
    <a href="${base}index.html?view=insights">Diaspora Insights &amp; Pathways</a> ·
    <a href="${base}connections.html">Academic Connections</a> ·
    <a href="${base}submit.html">Submit / Update</a> ·
    <a href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer">GitHub</a>
  </p></footer>`;
}

function renderMetrics(data: BrowserStatsResponse): string {
  const countries = data.countries.filter(country => country.pageViews > 0).length;
  const cards = [
    ['Browser page views today', formatNumber(data.today.collected ? data.today.pageViews : null), 'In progress · UTC'],
    ['Average daily page views', formatNumber(data.last7Complete.avgPageViews), `${data.last7Complete.days} complete day${data.last7Complete.days === 1 ? '' : 's'}`],
    ['Browser page views', formatNumber(data.last30Available.pageViews), `${data.last30Available.days} collected day${data.last30Available.days === 1 ? '' : 's'} in the 30-day window`],
    ['Browser visits', formatNumber(data.last7Complete.visits), `${data.last7Complete.days} complete day${data.last7Complete.days === 1 ? '' : 's'} · not unique people`],
    ['Countries reached', formatNumber(countries), `${data.last7Complete.days} complete day${data.last7Complete.days === 1 ? '' : 's'}`],
  ];
  return `<div class="browser-metric-grid">${cards.map(([label, value, detail]) => `<article class="browser-metric-card">
    <p class="browser-metric-label">${escapeHtml(label)}</p>
    <p class="browser-metric-value">${escapeHtml(value)}</p>
    <p class="browser-metric-detail">${escapeHtml(detail)}</p>
  </article>`).join('')}</div>`;
}

function renderChart(daily: DailyBrowserStat[]): string {
  const available = daily.filter(row => row.pageViews !== null);
  if (!available.length) return '<p class="no-data">No browser-traffic days have been collected yet.</p>';
  const width = 800;
  const height = 230;
  const left = 48;
  const right = 18;
  const top = 18;
  const bottom = 42;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maximum = Math.max(1, ...available.map(row => row.pageViews || 0));
  const segments: string[] = [];
  let active: string[] = [];
  daily.forEach((row, index) => {
    if (row.pageViews === null) {
      if (active.length) segments.push(active.join(' '));
      active = [];
      return;
    }
    const x = left + index / Math.max(1, daily.length - 1) * chartWidth;
    const y = top + chartHeight - row.pageViews / maximum * chartHeight;
    active.push(`${active.length ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  });
  if (active.length) segments.push(active.join(' '));
  const grid = [0, 0.25, 0.5, 0.75, 1].map(fraction => {
    const y = top + chartHeight - fraction * chartHeight;
    return `<line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3 3"/><text x="${left - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="currentColor" opacity="0.65">${Math.round(maximum * fraction)}</text>`;
  }).join('');
  const labelStep = Math.max(1, Math.ceil(daily.length / 6));
  const labels = daily.map((row, index) => {
    if (index % labelStep !== 0 && index !== daily.length - 1) return '';
    const x = left + index / Math.max(1, daily.length - 1) * chartWidth;
    const suffix = row.status === 'partial' ? '*' : '';
    return `<text x="${x}" y="${height - 12}" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.65">${escapeHtml(formatDate(row.date, false) + suffix)}</text>`;
  }).join('');
  return `<div class="stats-chart-container">
    <p class="chart-legend"><span class="legend-item"><span class="legend-dot dot-views"></span> Browser page views</span></p>
    <div class="svg-wrap"><svg viewBox="0 0 ${width} ${height}" class="stats-svg" role="img" aria-label="Daily browser page views" preserveAspectRatio="xMidYMid meet">${grid}${segments.map(path => `<path d="${path}" class="path-views" fill="none" stroke-width="2.5"/>`).join('')}${labels}</svg></div>
  </div>`;
}

function renderDailyTable(daily: DailyBrowserStat[]): string {
  return `<details class="stats-secondary-details"><summary><strong>View day-by-day browser traffic</strong></summary>
    <div class="stats-table-wrapper"><table class="stats-table"><thead><tr><th>Date (UTC)</th><th class="num-col">Page views</th><th class="num-col">Browser visits</th><th>Status</th></tr></thead>
    <tbody>${[...daily].reverse().map(row => `<tr class="${row.status === 'partial' ? 'partial-row' : ''}">
      <td><strong>${escapeHtml(formatDate(row.date))}</strong></td><td class="num-col">${formatNumber(row.pageViews)}</td><td class="num-col">${formatNumber(row.visits)}</td>
      <td>${row.status === 'partial' ? 'In progress' : row.status === 'missing' ? 'Not collected' : 'Complete'}</td></tr>`).join('')}</tbody></table></div>
  </details>`;
}

function renderCountries(data: BrowserStatsResponse): string {
  const rows = data.countries.filter(country => country.pageViews > 0);
  if (!rows.length) return '<p class="no-data">No country-level browser data is available for this period.</p>';
  return `<div class="stats-table-wrapper"><table class="stats-table"><thead><tr><th>Country</th><th class="num-col">Browser page views</th><th class="num-col">Share</th></tr></thead>
    <tbody>${rows.map(country => `<tr><td><span class="country-cell"><span class="flag-icon" aria-hidden="true">${escapeHtml(country.flag)}</span><span>${escapeHtml(country.name)}</span></span></td><td class="num-col">${formatNumber(country.pageViews)}</td><td class="num-col">${country.pct.toFixed(1)}%</td></tr>`).join('')}</tbody></table></div>`;
}

function renderCategories(data: BrowserStatsResponse): string {
  const total = data.categoryTotal;
  const rows = data.categories.map(category => {
    const queryOnly = category.key === 'insights-health';
    return `<tr><td>${escapeHtml(category.label)}</td><td class="num-col">${queryOnly ? '—' : formatNumber(category.pageViews)}</td><td class="num-col">${queryOnly ? 'Not separable' : `${category.pct.toFixed(1)}%`}</td></tr>`;
  }).join('');
  return `<p class="stat-sub">Page categories for ${escapeHtml(formatDate(data.categoryPeriod.startDate))}–${escapeHtml(formatDate(data.categoryPeriod.endDate))}. Cloudflare's path aggregation counted ${formatNumber(total)} browser page views; its independently aggregated daily total may differ slightly.</p>
    <div class="stats-table-wrapper"><table class="stats-table"><thead><tr><th>Page category</th><th class="num-col">Browser page views</th><th class="num-col">Share</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="stats-footnote">Cloudflare does not retain URL query strings. The current Insights and Health views use <code>?view=…</code>, so their views are included with the main directory and cannot be separated honestly.</p>`;
}

function renderStats(data: BrowserStatsResponse): string {
  const notice = data.stale
    ? `<div class="stats-status-notice stats-status-warning" role="status"><strong>Data temporarily unavailable.</strong> ${escapeHtml(data.notice || 'Showing the last successful snapshot.')}</div>`
    : data.isDemo ? '<div class="stats-status-notice" role="status"><strong>Preview data.</strong> Cloudflare credentials are not configured in this environment.</div>' : '';
  const transitionDate = formatDate(data.historicalTransition.newSeriesStartedAt);
  return `<main><article class="man-page stats-man-page">
    ${runningHead()}
    <section class="man-section name-section"><div class="identity"><div class="identity-details"><div class="name-heading"><h1>VietProfs Visitor Statistics</h1></div>
      <p class="synopsis">Privacy-preserving measurements from browsers that load VietProfs.</p>
      <p class="synopsis stats-snapshot">Last successful snapshot: <time datetime="${escapeHtml(data.generatedAt)}">${escapeHtml(formatTimestamp(data.generatedAt))}</time> <button type="button" id="refresh-stats-btn" class="refresh-stats-btn">Refresh now</button></p>
    </div></div></section>
    ${notice}
    <section class="man-section"><h2>AT A GLANCE</h2>${renderMetrics(data)}</section>
    <section class="man-section"><h2>DAILY BROWSER TRAFFIC</h2>${renderChart(data.daily)}${renderDailyTable(data.daily)}</section>
    <section class="man-section"><h2>COUNTRIES REACHED</h2><p class="stat-sub">Based only on browser page views during the last ${data.last7Complete.days} complete UTC day${data.last7Complete.days === 1 ? '' : 's'}.</p>${renderCountries(data)}</section>
    <section class="man-section"><h2>PAGE CATEGORIES</h2>${renderCategories(data)}</section>
    <section class="man-section privacy-section"><h2>PRIVACY &amp; METHODOLOGY</h2><div class="privacy-note">
      <p>These statistics come from privacy-preserving Cloudflare Web Analytics browser beacons, not raw server logs — no cookies, IPs, or individual visitor records are collected, though crawlers are excluded and JavaScript-blocking readers can go uncounted. A "page view" is a browser load and a "visit" is Cloudflare's session-like aggregate, not an exact unique-visitor count. Dates use complete UTC days only; the clean browser series begins ${escapeHtml(transitionDate)}, with earlier crawler-inclusive history kept separately.</p>
    </div></section>
    ${footer()}
  </article></main>`;
}

function renderLoading(): string {
  return `<main><article class="man-page stats-man-page">${runningHead()}<section class="man-section"><h1>VietProfs Visitor Statistics</h1><div class="stats-loading-box"><p>Loading browser statistics…</p></div></section></article></main>`;
}

function renderError(message: string): string {
  return `<main><article class="man-page stats-man-page">${runningHead()}<section class="man-section name-section"><h1>VietProfs Visitor Statistics</h1><p class="synopsis">Privacy-preserving browser measurements.</p></section>
    <section class="man-section"><h2>VISITOR TRAFFIC</h2><div class="stats-error-box" role="alert"><p class="error-title">Browser statistics are temporarily unavailable.</p><p class="error-detail">${escapeHtml(message)}</p><button type="button" id="retry-btn" class="retry-btn">Retry</button></div></section>${footer()}</article></main>`;
}

const STATS_ENDPOINTS = ['/api/stats', 'https://vietprofs.roars.dev/api/stats'];

async function fetchStats(force = false): Promise<BrowserStatsResponse> {
  let lastError = new Error('Unable to connect to the statistics service.');
  for (const endpoint of STATS_ENDPOINTS) {
    try {
      const url = force ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}refresh=${Date.now()}` : endpoint;
      const response = await fetch(url, { cache: force ? 'no-store' : 'default' });
      const body = await response.json() as BrowserStatsResponse & { error?: string; detail?: string };
      if (!response.ok) throw new Error([body.error, body.detail].filter(Boolean).join(' — ') || `HTTP ${response.status}`);
      if (body.schemaVersion !== 3 || body.source !== 'cloudflare-rum') throw new Error('The statistics service returned an unsupported or request-based dataset.');
      return body;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  throw lastError;
}

async function init(force = false): Promise<void> {
  app.innerHTML = renderLoading();
  try {
    app.innerHTML = renderStats(await fetchStats(force));
    document.getElementById('refresh-stats-btn')?.addEventListener('click', () => void init(true));
  } catch (error) {
    app.innerHTML = renderError(error instanceof Error ? error.message : 'Unknown error');
    document.getElementById('retry-btn')?.addEventListener('click', () => void init(true));
  }
}

void init();
