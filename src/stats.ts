import './style.css';
import './stats-components.css';
import { renderAddFab } from './add-fab.ts';
import { renderSeeAlso } from './see-also.ts';
import {
  type BrowserStatsResponse, fetchTrafficStats, formatTimestamp, renderCategories, renderChart, renderCountries,
  renderDailyTable, renderLoadError, renderMetrics, renderNotice,
} from './traffic-view.ts';
import { escapeHtml } from './utils.ts';

const app = document.getElementById('app')!;
const base = import.meta.env.BASE_URL;

function runningHead(): string {
  return `<p class="man-running-head">
    <span>STATS(1)</span>
    <span class="man-running-title"><a class="man-running-brand" href="${base}index.html" aria-label="VietProfs directory"><img class="brand-logo" src="${base}vietprofs-bamboo-v.svg" alt="" width="20" height="20"><span class="man-running-label">Statistics &amp; Insights</span></a></span>
    <span>STATS(1)</span>
  </p>`;
}

function renderStats(data: BrowserStatsResponse): string {
  return `<main><article class="man-page stats-man-page">
    ${runningHead()}
    <section class="man-section name-section"><div class="identity"><div class="identity-details"><div class="name-heading"><h1>Visitor Statistics</h1></div>
      <p class="synopsis stats-snapshot">Last successful snapshot: <time datetime="${escapeHtml(data.generatedAt)}">${escapeHtml(formatTimestamp(data.generatedAt))}</time> <button type="button" id="refresh-stats-btn" class="refresh-stats-btn">Refresh now</button></p>
    </div></div></section>
    ${renderNotice(data)}
    <section class="man-section"><h2>AT A GLANCE</h2>${renderMetrics(data)}</section>
    <section class="man-section"><h2>DAILY BROWSER TRAFFIC</h2>${renderChart(data.daily)}${renderDailyTable(data.daily)}</section>
    <section class="man-section"><h2>COUNTRIES REACHED</h2>${renderCountries(data)}</section>
    <section class="man-section"><h2>PAGE CATEGORIES</h2>${renderCategories(data)}</section>
    ${renderSeeAlso(base, 'stats')}
  </article></main>${renderAddFab(`${base}submit.html`)}`;
}

function renderLoading(): string {
  return `<main><article class="man-page stats-man-page">${runningHead()}<section class="man-section"><h1>Visitor Statistics</h1><div class="stats-loading-box"><p>Loading browser statistics…</p></div></section></article></main>${renderAddFab(`${base}submit.html`)}`;
}

function renderError(message: string): string {
  return `<main><article class="man-page stats-man-page">${runningHead()}<section class="man-section name-section"><h1>Visitor Statistics</h1></section>
    <section class="man-section"><h2>VISITOR TRAFFIC</h2>${renderLoadError(message)}</section>${renderSeeAlso(base, 'stats')}</article></main>${renderAddFab(`${base}submit.html`)}`;
}

const STATS_ENDPOINTS = ['/api/stats', 'https://vietprofs.roars.dev/api/stats'];

async function init(force = false): Promise<void> {
  app.innerHTML = renderLoading();
  try {
    app.innerHTML = renderStats(await fetchTrafficStats(STATS_ENDPOINTS, force));
    document.getElementById('refresh-stats-btn')?.addEventListener('click', () => void init(true));
  } catch (error) {
    app.innerHTML = renderError(error instanceof Error ? error.message : 'Unknown error');
    document.getElementById('retry-btn')?.addEventListener('click', () => void init(true));
  }
}

void init();
