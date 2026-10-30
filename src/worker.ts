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
  /** Flagged by `flagSuspectedDays`: shown, but left out of every summary and 7-day breakdown. */
  suspected?: true;
}

export interface CountryStat {
  code: string;
  name: string;
  flag: string;
  pageViews: number;
  pct: number;
}

/** One browser, operating system, or device type and its share of the 7-day browser page views. */
export interface BreakdownStat {
  name: string;
  pageViews: number;
  pct: number;
}

export interface CategoryStat {
  key: string;
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
  /** Totals, averages, and the median cover only the days not flagged as suspected; `excludedDays` lists the flagged ones. */
  last7Complete: {
    pageViews: number; visits: number; days: number; avgPageViews: number | null; avgVisits: number | null;
    medianPageViews?: number | null; excludedDays?: string[];
  };
  last30Available: { pageViews: number; visits: number; days: number };
  daily: DailyBrowserStat[];
  countries: CountryStat[];
  categories: CategoryStat[];
  categoryTotal: number;
  categoryPeriod: { startDate: string; endDate: string; days: number };
  historicalTransition: { newSeriesStartedAt: string | null; oldSeriesRetainedInternally: true };
  /** Same 7 days as `countries`; absent when Cloudflare didn't answer the separate breakdown query. */
  browsers?: BreakdownStat[];
  operatingSystems?: BreakdownStat[];
  devices?: BreakdownStat[];
  isDemo?: boolean;
}

interface RumGroup {
  count?: number;
  sum?: { visits?: number };
  dimensions?: { date?: string; countryName?: string; requestPath?: string; userAgentBrowser?: string; userAgentOS?: string; deviceType?: string };
}

interface RumGraphqlResponse {
  data?: { viewer?: { accounts?: Array<{ daily?: RumGroup[]; countries?: RumGroup[]; paths?: RumGroup[]; browsers?: RumGroup[]; systems?: RumGroup[]; devices?: RumGroup[] }> } };
  errors?: Array<{ message?: string }>;
}

const GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql';
const MAX_WINDOW_DAYS = 30;
const CATEGORY_DAYS = 7;

interface CategoryRule {
  key: string;
  label: string;
  // Tested against the lowercased normalized path; the first match wins and `other` catches the rest.
  match?: RegExp;
}

export interface SiteConfig {
  hostname: string;
  historyKey: string;
  lastSuccessKey: string;
  categories: CategoryRule[];
}

// One Worker serves /api/stats for every site in the roars.dev zone; the request's hostname picks the site.
// VietProfs keeps its original KV keys so the archived daily history carries over.
export const SITES: Record<string, SiteConfig> = {
  'vietprofs.roars.dev': {
    hostname: 'vietprofs.roars.dev',
    historyKey: 'browser-rum-daily-v1',
    lastSuccessKey: 'browser-rum-last-success-v1',
    categories: [
      { key: 'directory', label: 'Main directory', match: /^\/index\.html$/ },
      { key: 'profiles', label: 'Professor profiles', match: /^\/people\/[^/]+\.html$/ },
      { key: 'submit', label: 'Submit / update', match: /^\/submit\.html$/ },
      { key: 'statistics', label: 'Statistics', match: /^\/stats\.html$/ },
      { key: 'other', label: 'Other' },
    ],
  },
  'cspicks.roars.dev': {
    hostname: 'cspicks.roars.dev',
    historyKey: 'browser-rum-daily-v1:cspicks.roars.dev',
    lastSuccessKey: 'browser-rum-last-success-v1:cspicks.roars.dev',
    categories: [
      { key: 'search', label: 'Search', match: /^\/index\.html$/ },
      { key: 'directory', label: 'University & area pages', match: /^\/(schools|areas)\// },
      { key: 'simulator', label: 'Simulator', match: /^\/simulator\.html$/ },
      { key: 'csconfs', label: 'CS Confs', match: /^\/csconfs\.html$/ },
      { key: 'grants', label: 'Awards & Grants', match: /^\/grants\.html$/ },
      { key: 'jobs', label: 'CS Jobs', match: /^\/jobs\.html$/ },
      { key: 'nsf', label: 'NSF Funding', match: /^\/nsf\.html$/ },
      { key: 'submit', label: 'Submit / update', match: /-submit\.html$/ },
      { key: 'statistics', label: 'Statistics', match: /^\/stats\.html$/ },
      { key: 'other', label: 'Other' },
    ],
  },
};

const DEFAULT_HOSTNAME = 'vietprofs.roars.dev';

export function siteFor(hostname: string, env: Env): SiteConfig {
  return SITES[hostname] || SITES[env.CLOUDFLARE_HOSTNAME || DEFAULT_HOSTNAME] || SITES[DEFAULT_HOSTNAME];
}

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

export function categoryForPath(rawPath: string, site: SiteConfig = SITES[DEFAULT_HOSTNAME]): string {
  const path = normalizePath(rawPath).toLowerCase();
  return site.categories.find(rule => rule.match?.test(path))?.key || 'other';
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

// Cloudflare's own `bot: 0` filter misses a headless mobile-Chrome crawl that began 2026-10-02: Chrome on
// iOS/Android, never arriving from an external site (no referrer, or navigating from our own pages).
// Count mobile Chrome only when an external site sent the visitor; every other browser is kept as-is.
// Real direct mobile-Chrome visits are undercounted as a result (about 15% of the pre-October baseline).
const SUSPECTED_AUTOMATION_FILTER = `OR: [
          { userAgentBrowser_neq: "ChromeMobile" }
          { AND: [{ refererHost_neq: "" }, { refererHost_neq: $hostname }] }
        ]`;

// Inclusive UTC date ranges for the 7-day groups; null means the whole $categoryStart..$lastCompleteDate period.
type DateRanges = Array<[start: string, end: string]> | null;

// The 7-day groups' filter. Leaving out suspected days splits the period into ranges; both the ranges and the
// automation filter are OR lists, so they go into one AND.
function periodFilter(ranges: DateRanges): string {
  if (!ranges) return `filter: { date_geq: $categoryStart, date_leq: $lastCompleteDate, requestHost: $hostname, bot: 0
        ${SUSPECTED_AUTOMATION_FILTER} }`;
  const kept = ranges.map(([start, end]) => `{ date_geq: "${start}", date_leq: "${end}" }`).join(' ');
  return `filter: { requestHost: $hostname, bot: 0
        AND: [{ ${SUSPECTED_AUTOMATION_FILTER} }, { OR: [${kept}] }] }`;
}

const PERIOD_GROUPS = (ranges: DateRanges) => `
      countries: rumPageloadEventsAdaptiveGroups(
        limit: 250
        orderBy: [count_DESC]
        ${periodFilter(ranges)}
      ) { count dimensions { countryName } }
      paths: rumPageloadEventsAdaptiveGroups(
        limit: 5000
        orderBy: [count_DESC]
        ${periodFilter(ranges)}
      ) { count dimensions { requestPath } }`;

function buildQuery(): string {
  return `
query BrowserTraffic($accountTag: string!, $hostname: string!, $windowStart: Date!, $today: Date!, $categoryStart: Date!, $lastCompleteDate: Date!) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      daily: rumPageloadEventsAdaptiveGroups(
        limit: 40
        orderBy: [date_ASC]
        filter: { date_geq: $windowStart, date_leq: $today, requestHost: $hostname, bot: 0
        ${SUSPECTED_AUTOMATION_FILTER} }
      ) { count sum { visits } dimensions { date } }${PERIOD_GROUPS(null)}
    }
  }
}`;
}

// Countries and paths again, without the suspected days; only asked for when the 7-day period has some.
function buildKeptDaysQuery(ranges: Array<[string, string]>): string {
  return `
query BrowserTrafficKeptDays($accountTag: string!, $hostname: string!) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {${PERIOD_GROUPS(ranges)}
    }
  }
}`;
}

// A crawler that runs the analytics beacon gets past both Cloudflare's `bot: 0` and SUSPECTED_AUTOMATION_FILTER.
// The ones seen so far (mobile Chrome from 2026-10-02; desktop Chrome from Singapore, 2026-10-15 to 2026-10-19 and
// 2026-10-29) arrived in bursts several times the usual daily volume in which nearly every page view was its own
// visit; ordinary days run about one visit per two page views. Flag such days instead of writing a filter per crawler.
const SUSPECT_MIN_BASELINE_DAYS = 7;
const SUSPECT_MIN_PAGE_VIEWS = 100;
const SUSPECT_MEDIAN_MULTIPLE = 2.5;
const SUSPECT_VISIT_RATIO = 0.85;

/** Dates whose page views are far above the window's median and that are nearly all single-page visits. */
export function flagSuspectedDays(daily: DailyBrowserStat[]): string[] {
  const baseline = median(daily.filter(row => row.status === 'complete').map(row => row.pageViews || 0));
  if (baseline === null || daily.filter(row => row.status === 'complete').length < SUSPECT_MIN_BASELINE_DAYS) return [];
  return daily.filter(row => {
    const pageViews = row.pageViews || 0;
    return row.status !== 'missing' && pageViews >= SUSPECT_MIN_PAGE_VIEWS && pageViews > SUSPECT_MEDIAN_MULTIPLE * baseline
      && (row.visits || 0) >= SUSPECT_VISIT_RATIO * pageViews;
  }).map(row => row.date);
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

/** The dates of `period` not in `excluded`, as contiguous inclusive ranges. */
function keptRanges(period: string[], excluded: Set<string>): Array<[string, string]> {
  const ranges: Array<[string, string]> = [];
  for (const date of period) {
    if (excluded.has(date)) continue;
    const last = ranges.at(-1);
    if (last && shiftDate(last[1], 1) === date) last[1] = date;
    else ranges.push([date, date]);
  }
  return ranges;
}

// Browsers, operating systems, and device types over the same 7 complete days as countries. A separate request,
// so a problem with these dimensions can never take down the main traffic numbers.
function buildBreakdownQuery(ranges: DateRanges): string {
  const group = (alias: string, dimension: string) => `
      ${alias}: rumPageloadEventsAdaptiveGroups(
        limit: 50
        orderBy: [count_DESC]
        ${periodFilter(ranges)}
      ) { count dimensions { ${dimension} } }`;
  return `
query BrowserBreakdown($accountTag: string!, $hostname: string!${ranges ? '' : ', $categoryStart: Date!, $lastCompleteDate: Date!'}) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {${group('browsers', 'userAgentBrowser')}${group('systems', 'userAgentOS')}${group('devices', 'deviceType')}
    }
  }
}`;
}

const BREAKDOWN_LABELS: Record<string, string> = {
  ChromeMobile: 'Chrome (mobile)', MobileSafari: 'Safari (mobile)', FirefoxMobile: 'Firefox (mobile)', EdgeMobile: 'Edge (mobile)',
  SamsungBrowser: 'Samsung Internet', MacOSX: 'macOS', MacOS: 'macOS', ChromeOS: 'ChromeOS',
  desktop: 'Desktop', mobile: 'Mobile', tablet: 'Tablet', smarttv: 'Smart TV', console: 'Console', wearable: 'Wearable',
};

function breakdown(rows: RumGroup[] | undefined, dimension: 'userAgentBrowser' | 'userAgentOS' | 'deviceType'): BreakdownStat[] {
  const counts = new Map<string, number>();
  for (const row of rows || []) {
    const raw = row.dimensions?.[dimension] || '';
    const name = BREAKDOWN_LABELS[raw] || raw || 'Unknown';
    counts.set(name, (counts.get(name) || 0) + (row.count || 0));
  }
  const total = sum([...counts.values()]);
  return [...counts].filter(([, pageViews]) => pageViews > 0).sort((a, b) => b[1] - a[1])
    .map(([name, pageViews]) => ({ name, pageViews, pct: total ? Math.round(pageViews / total * 1000) / 10 : 0 }));
}

async function queryBreakdowns(env: Env, site: SiteConfig, categoryStart: string, lastCompleteDate: string, ranges: DateRanges) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: buildBreakdownQuery(ranges),
        variables: { accountTag: env.CLOUDFLARE_ACCOUNT_ID, hostname: site.hostname, ...(ranges ? {} : { categoryStart, lastCompleteDate }) },
      }),
    });
    if (!response.ok) return {};
    const result = await response.json() as RumGraphqlResponse;
    const account = result.errors?.length ? undefined : result.data?.viewer?.accounts?.[0];
    if (!account?.browsers?.length) return {};
    return {
      browsers: breakdown(account.browsers, 'userAgentBrowser'),
      operatingSystems: breakdown(account.systems, 'userAgentOS'),
      devices: breakdown(account.devices, 'deviceType'),
    };
  } catch {
    return {};
  }
}

async function queryKeptDays(env: Env, site: SiteConfig, ranges: Array<[string, string]>): Promise<{ countries?: RumGroup[]; paths?: RumGroup[] }> {
  // Every day of the period was flagged: there is nothing left to group.
  if (!ranges.length) return {};
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: buildKeptDaysQuery(ranges), variables: { accountTag: env.CLOUDFLARE_ACCOUNT_ID, hostname: site.hostname } }),
  });
  if (!response.ok) throw new Error(`Cloudflare GraphQL returned HTTP ${response.status}`);
  const result = await response.json() as RumGraphqlResponse;
  if (result.errors?.length) throw new Error(result.errors.map(error => error.message || 'Unknown GraphQL error').join('; '));
  const account = result.data?.viewer?.accounts?.[0];
  if (!account) throw new Error('Cloudflare returned no matching account data');
  return account;
}

export async function queryRum(env: Env, site: SiteConfig, now = new Date()): Promise<BrowserStatsResponse> {
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
      variables: { accountTag: env.CLOUDFLARE_ACCOUNT_ID, hostname: site.hostname, windowStart, today, categoryStart, lastCompleteDate },
    }),
  });
  if (!response.ok) throw new Error(`Cloudflare GraphQL returned HTTP ${response.status}`);
  const result = await response.json() as RumGraphqlResponse;
  if (result.errors?.length) throw new Error(result.errors.map(error => error.message || 'Unknown GraphQL error').join('; '));
  const account = result.data?.viewer?.accounts?.[0];
  if (!account) throw new Error('Cloudflare returned no matching account data');
  // Cloudflare can silently return no daily rows for a query it can't serve (as it did on 2026-10-13 when the daily
  // query also asked for avg { sampleInterval }); treat that as a failure rather than publishing a month of zeros.
  if (!account.daily?.length && account.countries?.length) throw new Error('Cloudflare returned country data but no daily rows');

  const returnedDaily = new Map<string, { pageViews: number; visits: number }>();
  for (const row of account.daily || []) {
    const date = row.dimensions?.date;
    if (date) returnedDaily.set(date, { pageViews: row.count || 0, visits: row.sum?.visits || 0 });
  }
  const firstReturnedDate = [...returnedDaily.keys()].sort()[0] || null;
  const archived = await env.STATS_KV?.get<DailyBrowserStat[]>(site.historyKey, 'json');
  const archivedDates = (archived || []).filter(row => row.status !== 'missing').map(row => row.date).sort();
  const measurementStartedAt = [firstReturnedDate, archivedDates[0]].filter((value): value is string => Boolean(value)).sort()[0] || null;
  const daily: DailyBrowserStat[] = dateRange(windowStart, today).map(date => {
    const row = returnedDaily.get(date);
    if (!measurementStartedAt || date < measurementStartedAt) return { date, pageViews: null, visits: null, status: 'missing' };
    return { date, pageViews: row?.pageViews ?? 0, visits: row?.visits ?? 0, status: date === today ? 'partial' : 'complete' };
  });
  const suspected = new Set(flagSuspectedDays(daily));
  for (const row of daily) if (suspected.has(row.date)) row.suspected = true;

  const complete = daily.filter(row => row.status === 'complete' && !row.suspected);
  const period = dateRange(categoryStart, lastCompleteDate);
  const excludedDays = period.filter(date => suspected.has(date));
  const last7 = complete.filter(row => row.date >= categoryStart && row.date <= lastCompleteDate);
  const todayRow = daily.find(row => row.date === today)!;
  const pageViews7 = sum(last7.map(row => row.pageViews || 0));
  const visits7 = sum(last7.map(row => row.visits || 0));
  const pageViews30 = sum(complete.map(row => row.pageViews || 0));
  const visits30 = sum(complete.map(row => row.visits || 0));

  // With suspected days in the period, countries and paths come from a second query that leaves them out.
  const ranges = excludedDays.length ? keptRanges(period, suspected) : null;
  const groups = ranges ? await queryKeptDays(env, site, ranges) : account;

  const countries = (groups.countries || []).map(row => {
    const code = (row.dimensions?.countryName || '').toUpperCase();
    const pageViews = row.count || 0;
    return { code, name: countryName(code), flag: countryFlag(code), pageViews, pct: pageViews7 ? Math.round(pageViews / pageViews7 * 1000) / 10 : 0 };
  }).filter(row => row.pageViews > 0);

  const categoryCounts = new Map<string, number>(site.categories.map(item => [item.key, 0]));
  let pathTotal = 0;
  for (const row of groups.paths || []) {
    const count = row.count || 0;
    pathTotal += count;
    const key = categoryForPath(row.dimensions?.requestPath || '', site);
    categoryCounts.set(key, (categoryCounts.get(key) || 0) + count);
  }
  const categories = site.categories.map(({ key, label }) => ({
    key, label,
    pageViews: categoryCounts.get(key) || 0,
    pct: pathTotal ? Math.round((categoryCounts.get(key) || 0) / pathTotal * 1000) / 10 : 0,
  }));
  const breakdowns = ranges?.length === 0 ? {} : await queryBreakdowns(env, site, categoryStart, lastCompleteDate, ranges);

  return {
    schemaVersion: 3, source: 'cloudflare-rum', generatedAt: now.toISOString(), timezone: 'UTC', status: 'ok', stale: false,
    measurementStartedAt,
    coverage: { firstDate: measurementStartedAt, lastCompleteDate, completeDays7: last7.length, availableDays30: complete.length },
    today: { date: today, pageViews: todayRow.pageViews, visits: todayRow.visits, complete: false, collected: todayRow.status === 'partial' },
    last7Complete: {
      pageViews: pageViews7, visits: visits7, days: last7.length,
      avgPageViews: last7.length ? Math.round(pageViews7 / last7.length * 10) / 10 : null,
      avgVisits: last7.length ? Math.round(visits7 / last7.length * 10) / 10 : null,
      medianPageViews: median(last7.map(row => row.pageViews || 0)), excludedDays,
    },
    last30Available: { pageViews: pageViews30, visits: visits30, days: complete.length },
    daily, countries, categories, categoryTotal: pathTotal,
    categoryPeriod: { startDate: categoryStart, endDate: lastCompleteDate, days: last7.length },
    historicalTransition: { newSeriesStartedAt: measurementStartedAt, oldSeriesRetainedInternally: true },
    ...breakdowns,
  };
}

function demoResponse(site: SiteConfig, now = new Date()): BrowserStatsResponse {
  const today = isoDate(now);
  const start = shiftDate(today, -9);
  const values = [18, 24, 17, 31, 0, 22, 28, 19, 26, 7];
  const daily = dateRange(start, today).map((date, index): DailyBrowserStat => ({ date, pageViews: values[index], visits: Math.round(values[index] * 0.55), status: date === today ? 'partial' : 'complete' }));
  const lastCompleteDate = shiftDate(today, -1);
  const categoryStart = shiftDate(lastCompleteDate, -6);
  const last7 = daily.filter(row => row.date >= categoryStart && row.date <= lastCompleteDate);
  const total = sum(last7.map(row => row.pageViews || 0));
  // Split the demo total across the site's categories, halving the share at each step.
  let remaining = total;
  const categories = site.categories.map(({ key, label }, index) => {
    const pageViews = index === site.categories.length - 1 ? remaining : Math.floor(remaining / 2);
    remaining -= pageViews;
    return { key, label, pageViews, pct: total ? Math.round(pageViews / total * 1000) / 10 : 0 };
  });
  const visits = sum(last7.map(row => row.visits || 0));
  return {
    schemaVersion: 3, source: 'cloudflare-rum', generatedAt: now.toISOString(), timezone: 'UTC', status: 'demo', stale: false,
    measurementStartedAt: start, isDemo: true,
    coverage: { firstDate: start, lastCompleteDate, completeDays7: 7, availableDays30: 9 },
    today: { date: today, pageViews: 7, visits: 4, complete: false, collected: true },
    last7Complete: {
      pageViews: total, visits, days: 7, avgPageViews: Math.round(total / 7 * 10) / 10, avgVisits: Math.round(visits / 7 * 10) / 10,
      medianPageViews: median(last7.map(row => row.pageViews || 0)), excludedDays: [],
    },
    last30Available: { pageViews: sum(daily.slice(0, -1).map(row => row.pageViews || 0)), visits: sum(daily.slice(0, -1).map(row => row.visits || 0)), days: 9 },
    daily, countries: [{ code: 'US', name: 'United States', flag: '🇺🇸', pageViews: total, pct: 100 }], categories, categoryTotal: total,
    categoryPeriod: { startDate: categoryStart, endDate: lastCompleteDate, days: 7 },
    browsers: [{ name: 'Chrome', pageViews: total, pct: 100 }],
    operatingSystems: [{ name: 'Linux', pageViews: total, pct: 100 }],
    devices: [{ name: 'Desktop', pageViews: total, pct: 100 }],
    historicalTransition: { newSeriesStartedAt: start, oldSeriesRetainedInternally: true },
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': status === 200 ? 'public, max-age=300' : 'no-store' } });
}

async function staleResponse(env: Env, site: SiteConfig, error: unknown): Promise<Response> {
  const snapshot = await env.STATS_KV?.get<BrowserStatsResponse>(site.lastSuccessKey, 'json');
  if (snapshot?.schemaVersion === 3) {
    return jsonResponse({ ...snapshot, servedAt: new Date().toISOString(), status: 'stale', stale: true, notice: 'Live browser statistics are temporarily unavailable. Showing the last successful snapshot.' });
  }
  return jsonResponse({ error: 'Browser statistics are temporarily unavailable.', detail: error instanceof Error ? error.message : 'Unknown Cloudflare API error' }, 503);
}

async function fetchStats(env: Env, site: SiteConfig): Promise<Response> {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) return jsonResponse(demoResponse(site));
  try { return jsonResponse(await queryRum(env, site)); } catch (error) { return staleResponse(env, site, error); }
}

async function archiveSuccessfulSnapshot(env: Env, site: SiteConfig): Promise<void> {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID || !env.STATS_KV) return;
  const snapshot = await queryRum(env, site);
  await Promise.all([
    env.STATS_KV.put(site.historyKey, JSON.stringify(snapshot.daily)),
    env.STATS_KV.put(site.lastSuccessKey, JSON.stringify(snapshot)),
  ]);
}

// Sites are archived one after another so one failure does not stop the others; failures still surface in the logs.
async function archiveAllSites(env: Env): Promise<void> {
  const failures: unknown[] = [];
  for (const site of Object.values(SITES)) {
    try { await archiveSuccessfulSnapshot(env, site); } catch (error) { failures.push(error); }
  }
  if (failures.length) throw new AggregateError(failures, `RUM archive failed for ${failures.length} site(s)`);
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' } });
    if (url.pathname === '/health') return jsonResponse({ status: 'ok', worker: 'vietprofs-stats-api', source: 'cloudflare-rum' });
    if (url.pathname !== '/api/stats') return jsonResponse({ error: 'Not found' }, 404);
    if (request.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'GET, OPTIONS' } });
    return fetchStats(env, siteFor(url.hostname, env));
  },
  async scheduled(_event: unknown, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(archiveAllSites(env));
  },
};
