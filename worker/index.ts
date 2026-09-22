export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface KVNamespace {
  get<T>(key: string, type: 'json'): Promise<T | null>;
  put(key: string, value: string): Promise<void>;
}

export interface Env {
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_HOSTNAME?: string;
  STATS_KV?: KVNamespace;
}

export interface DailyBrowserStat {
  date: string;
  pageViews: number | null;
  visits: number | null;
  status: 'complete' | 'partial' | 'missing';
}

export interface CountryStat {
  code: string;
  name: string;
  flag: string;
  pageViews: number;
  pct: number;
}

export interface CategoryStat {
  key: 'directory' | 'profiles' | 'submit' | 'statistics' | 'insights-health' | 'other';
  label: string;
  pageViews: number;
  pct: number;
}

export interface BrowserStatsResponse {
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
  countries: CountryStat[];
  categories: CategoryStat[];
  categoryPeriod: { startDate: string; endDate: string; days: number };
  historicalTransition: { newSeriesStartedAt: string | null; oldSeriesRetainedInternally: true };
  isDemo?: boolean;
}

interface RumGroup {
  count?: number;
  sum?: { visits?: number };
  avg?: { sampleInterval?: number };
  dimensions?: { date?: string; countryName?: string; requestPath?: string };
}

interface RumGraphqlResponse {
  data?: { viewer?: { accounts?: Array<{ daily?: RumGroup[]; countries?: RumGroup[]; paths?: RumGroup[] }> } };
  errors?: Array<{ message?: string }>;
}

const GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql';
const BROWSER_HISTORY_KEY = 'browser-rum-daily-v1';
const LAST_SUCCESS_KEY = 'browser-rum-last-success-v1';
const MAX_WINDOW_DAYS = 30;
const CATEGORY_DAYS = 7;

const CATEGORY_DEFINITIONS: Array<Pick<CategoryStat, 'key' | 'label'>> = [
  { key: 'directory', label: 'Main directory' },
  { key: 'profiles', label: 'Professor profiles' },
  { key: 'submit', label: 'Submit / update' },
  { key: 'statistics', label: 'Statistics' },
  { key: 'insights-health', label: 'Insights / health' },
  { key: 'other', label: 'Other' },
];

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return isoDate(value);
}

function dateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  for (let date = startDate; date <= endDate; date = shiftDate(date, 1)) dates.push(date);
  return dates;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function normalizePath(rawPath: string): string {
  try {
    let path = new URL(rawPath || '/', 'https://vietprofs.invalid').pathname;
    path = path.replace(/\/{2,}/g, '/');
    if (path.length > 1) path = path.replace(/\/$/, '');
    return path === '/' || path.toLowerCase() === '/index.html' ? '/index.html' : path;
  } catch {
    return '/unknown';
  }
}

export function categoryForPath(rawPath: string): CategoryStat['key'] {
  const path = normalizePath(rawPath).toLowerCase();
  if (path === '/index.html') return 'directory';
  if (/^\/people\/[^/]+\.html$/.test(path)) return 'profiles';
  if (path === '/submit.html') return 'submit';
  if (path === '/stats.html') return 'statistics';
  if (path === '/insights.html' || path === '/health.html') return 'insights-health';
  return 'other';
}

function countryName(code: string): string {
  const normalized = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized) || normalized === 'XX' || normalized === 'T1') return 'Unknown location';
  try {
    const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(normalized);
    return name && name !== normalized && !/^unknown\b/i.test(name) ? name : `Unknown location (${normalized})`;
  } catch {
    return normalized === 'UA' ? 'Ukraine' : `Unknown location (${normalized})`;
  }
}

function countryFlag(code: string): string {
  const normalized = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized) || normalized === 'XX' || normalized === 'T1') return '🌐';
  return String.fromCodePoint(...normalized.split('').map(character => character.charCodeAt(0) + 127397));
}

function buildQuery(): string {
  return `
query BrowserTraffic($accountTag: string!, $hostname: string!, $windowStart: Date!, $today: Date!, $categoryStart: Date!, $lastCompleteDate: Date!) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      daily: rumPageloadEventsAdaptiveGroups(
        limit: 40
        orderBy: [date_ASC]
        filter: { date_geq: $windowStart, date_leq: $today, requestHost: $hostname, bot: 0 }
      ) { count sum { visits } avg { sampleInterval } dimensions { date } }
      countries: rumPageloadEventsAdaptiveGroups(
        limit: 250
        orderBy: [count_DESC]
        filter: { date_geq: $categoryStart, date_leq: $lastCompleteDate, requestHost: $hostname, bot: 0 }
      ) { count dimensions { countryName } }
      paths: rumPageloadEventsAdaptiveGroups(
        limit: 5000
        orderBy: [count_DESC]
        filter: { date_geq: $categoryStart, date_leq: $lastCompleteDate, requestHost: $hostname, bot: 0 }
      ) { count dimensions { requestPath } }
    }
  }
}`;
}

export async function queryRum(env: Env, now = new Date()): Promise<BrowserStatsResponse> {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) throw new Error('Cloudflare RUM credentials are not configured');
  const today = isoDate(now);
  const lastCompleteDate = shiftDate(today, -1);
  const windowStart = shiftDate(today, -(MAX_WINDOW_DAYS - 1));
  const categoryStart = shiftDate(lastCompleteDate, -(CATEGORY_DAYS - 1));
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: buildQuery(),
      variables: { accountTag: env.CLOUDFLARE_ACCOUNT_ID, hostname: env.CLOUDFLARE_HOSTNAME || 'vietprofs.roars.dev', windowStart, today, categoryStart, lastCompleteDate },
    }),
  });
  if (!response.ok) throw new Error(`Cloudflare GraphQL returned HTTP ${response.status}`);
  const result = await response.json() as RumGraphqlResponse;
  if (result.errors?.length) throw new Error(result.errors.map(error => error.message || 'Unknown GraphQL error').join('; '));
  const account = result.data?.viewer?.accounts?.[0];
  if (!account) throw new Error('Cloudflare returned no matching account data');

  const returnedDaily = new Map<string, { pageViews: number; visits: number }>();
  for (const row of account.daily || []) {
    const date = row.dimensions?.date;
    if (date) returnedDaily.set(date, { pageViews: row.count || 0, visits: row.sum?.visits || 0 });
  }
  const firstReturnedDate = [...returnedDaily.keys()].sort()[0] || null;
  const archived = await env.STATS_KV?.get<DailyBrowserStat[]>(BROWSER_HISTORY_KEY, 'json');
  const archivedDates = (archived || []).filter(row => row.status !== 'missing').map(row => row.date).sort();
  const measurementStartedAt = [firstReturnedDate, archivedDates[0]].filter((value): value is string => Boolean(value)).sort()[0] || null;
  const daily: DailyBrowserStat[] = dateRange(windowStart, today).map(date => {
    const row = returnedDaily.get(date);
    if (!measurementStartedAt || date < measurementStartedAt) return { date, pageViews: null, visits: null, status: 'missing' };
    return { date, pageViews: row?.pageViews ?? 0, visits: row?.visits ?? 0, status: date === today ? 'partial' : 'complete' };
  });

  const complete = daily.filter(row => row.status === 'complete');
  const last7 = complete.filter(row => row.date >= categoryStart && row.date <= lastCompleteDate);
  const todayRow = daily.find(row => row.date === today)!;
  const pageViews7 = sum(last7.map(row => row.pageViews || 0));
  const visits7 = sum(last7.map(row => row.visits || 0));
  const pageViews30 = sum(complete.map(row => row.pageViews || 0));
  const visits30 = sum(complete.map(row => row.visits || 0));

  const countries = (account.countries || []).map(row => {
    const code = (row.dimensions?.countryName || '').toUpperCase();
    const pageViews = row.count || 0;
    return { code, name: countryName(code), flag: countryFlag(code), pageViews, pct: pageViews7 ? Math.round(pageViews / pageViews7 * 1000) / 10 : 0 };
  }).filter(row => row.pageViews > 0);

  const categoryCounts = new Map<CategoryStat['key'], number>(CATEGORY_DEFINITIONS.map(item => [item.key, 0]));
  let pathTotal = 0;
  for (const row of account.paths || []) {
    const count = row.count || 0;
    pathTotal += count;
    const key = categoryForPath(row.dimensions?.requestPath || '');
    categoryCounts.set(key, (categoryCounts.get(key) || 0) + count);
  }
  if (pathTotal !== pageViews7) throw new Error(`RUM category total ${pathTotal} does not match daily total ${pageViews7}`);
  const categories = CATEGORY_DEFINITIONS.map(item => ({
    ...item,
    pageViews: categoryCounts.get(item.key) || 0,
    pct: pageViews7 ? Math.round((categoryCounts.get(item.key) || 0) / pageViews7 * 1000) / 10 : 0,
  }));

  return {
    schemaVersion: 3, source: 'cloudflare-rum', generatedAt: now.toISOString(), timezone: 'UTC', status: 'ok', stale: false,
    measurementStartedAt,
    coverage: { firstDate: measurementStartedAt, lastCompleteDate, completeDays7: last7.length, availableDays30: complete.length },
    today: { date: today, pageViews: todayRow.pageViews, visits: todayRow.visits, complete: false, collected: todayRow.status === 'partial' },
    last7Complete: {
      pageViews: pageViews7, visits: visits7, days: last7.length,
      avgPageViews: last7.length ? Math.round(pageViews7 / last7.length * 10) / 10 : null,
      avgVisits: last7.length ? Math.round(visits7 / last7.length * 10) / 10 : null,
    },
    last30Available: { pageViews: pageViews30, visits: visits30, days: complete.length },
    daily, countries, categories,
    categoryPeriod: { startDate: categoryStart, endDate: lastCompleteDate, days: last7.length },
    historicalTransition: { newSeriesStartedAt: measurementStartedAt, oldSeriesRetainedInternally: true },
  };
}

function demoResponse(now = new Date()): BrowserStatsResponse {
  const today = isoDate(now);
  const start = shiftDate(today, -9);
  const values = [18, 24, 17, 31, 0, 22, 28, 19, 26, 7];
  const daily = dateRange(start, today).map((date, index): DailyBrowserStat => ({ date, pageViews: values[index], visits: Math.round(values[index] * 0.55), status: date === today ? 'partial' : 'complete' }));
  const lastCompleteDate = shiftDate(today, -1);
  const categoryStart = shiftDate(lastCompleteDate, -6);
  const last7 = daily.filter(row => row.date >= categoryStart && row.date <= lastCompleteDate);
  const total = sum(last7.map(row => row.pageViews || 0));
  const fixedCategories: Array<[CategoryStat['key'], string, number]> = [
    ['directory', 'Main directory', 72], ['profiles', 'Professor profiles', 50], ['submit', 'Submit / update', 8],
    ['statistics', 'Statistics', 6], ['insights-health', 'Insights / health', 0], ['other', 'Other', Math.max(0, total - 136)],
  ];
  const categories = fixedCategories.map(([key, label, pageViews]) => ({ key, label, pageViews, pct: total ? Math.round(pageViews / total * 1000) / 10 : 0 }));
  const visits = sum(last7.map(row => row.visits || 0));
  return {
    schemaVersion: 3, source: 'cloudflare-rum', generatedAt: now.toISOString(), timezone: 'UTC', status: 'demo', stale: false,
    measurementStartedAt: start, isDemo: true,
    coverage: { firstDate: start, lastCompleteDate, completeDays7: 7, availableDays30: 9 },
    today: { date: today, pageViews: 7, visits: 4, complete: false, collected: true },
    last7Complete: { pageViews: total, visits, days: 7, avgPageViews: Math.round(total / 7 * 10) / 10, avgVisits: Math.round(visits / 7 * 10) / 10 },
    last30Available: { pageViews: sum(daily.slice(0, -1).map(row => row.pageViews || 0)), visits: sum(daily.slice(0, -1).map(row => row.visits || 0)), days: 9 },
    daily, countries: [{ code: 'US', name: 'United States', flag: '🇺🇸', pageViews: total, pct: 100 }], categories,
    categoryPeriod: { startDate: categoryStart, endDate: lastCompleteDate, days: 7 },
    historicalTransition: { newSeriesStartedAt: start, oldSeriesRetainedInternally: true },
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': status === 200 ? 'public, max-age=300' : 'no-store' } });
}

async function staleResponse(env: Env, error: unknown): Promise<Response> {
  const snapshot = await env.STATS_KV?.get<BrowserStatsResponse>(LAST_SUCCESS_KEY, 'json');
  if (snapshot?.schemaVersion === 3) {
    return jsonResponse({ ...snapshot, servedAt: new Date().toISOString(), status: 'stale', stale: true, notice: 'Live browser statistics are temporarily unavailable. Showing the last successful snapshot.' });
  }
  return jsonResponse({ error: 'Browser statistics are temporarily unavailable.', detail: error instanceof Error ? error.message : 'Unknown Cloudflare API error' }, 503);
}

async function fetchStats(env: Env): Promise<Response> {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) return jsonResponse(demoResponse());
  try { return jsonResponse(await queryRum(env)); } catch (error) { return staleResponse(env, error); }
}

async function archiveSuccessfulSnapshot(env: Env): Promise<void> {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID || !env.STATS_KV) return;
  const snapshot = await queryRum(env);
  await Promise.all([
    env.STATS_KV.put(BROWSER_HISTORY_KEY, JSON.stringify(snapshot.daily)),
    env.STATS_KV.put(LAST_SUCCESS_KEY, JSON.stringify(snapshot)),
  ]);
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' } });
    if (url.pathname === '/health') return jsonResponse({ status: 'ok', worker: 'vietprofs-stats-api', source: 'cloudflare-rum' });
    if (url.pathname !== '/api/stats') return jsonResponse({ error: 'Not found' }, 404);
    if (request.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'GET, OPTIONS' } });
    return fetchStats(env);
  },
  async scheduled(_event: unknown, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(archiveSuccessfulSnapshot(env));
  },
};
