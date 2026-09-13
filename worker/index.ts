export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

declare global {
  interface CacheStorage {
    default: Cache;
  }
}

export interface Env {
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ZONE_ID?: string;
  CLOUDFLARE_HOSTNAME?: string;
  STATS_KV?: KVNamespace;
}

interface KVNamespace {
  get<T>(key: string, type: 'json'): Promise<T | null>;
  put(key: string, value: string): Promise<void>;
}

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

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  VN: 'Vietnam',
  JP: 'Japan',
  FR: 'France',
  DE: 'Germany',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
  KR: 'South Korea',
  SG: 'Singapore',
  CH: 'Switzerland',
  NL: 'Netherlands',
  SE: 'Sweden',
  NO: 'Norway',
  FI: 'Finland',
  DK: 'Denmark',
  IT: 'Italy',
  ES: 'Spain',
  BE: 'Belgium',
  AT: 'Austria',
  NZ: 'New Zealand',
  IE: 'Ireland',
  TW: 'Taiwan',
  HK: 'Hong Kong',
  IL: 'Israel',
  IN: 'India',
  BR: 'Brazil',
  MX: 'Mexico',
  PL: 'Poland',
  CZ: 'Czech Republic',
  AD: 'Andorra',
  RU: 'Russia',
  CN: 'China',
};

function countryCodeToFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return '🌐';
  const upper = code.toUpperCase();
  const first = upper.charCodeAt(0) - 65 + 0x1f1e6;
  const second = upper.charCodeAt(1) - 65 + 0x1f1e6;
  return String.fromCodePoint(first, second);
}

function cleanPageLabel(path: string): string {
  if (!path || path === '/' || path === '/index.html') return 'Main Directory';
  if (path === '/submit.html') return 'Submit / Update Entry';
  if (path === '/stats.html') return 'Visitor Statistics';
  if (path.startsWith('/people/')) {
    const filename = path.replace('/people/', '').replace('.html', '');
    return `Profile ${filename}`;
  }
  return path;
}

const PUBLIC_HTML_PAGES = new Set(['/', '/index.html', '/submit.html', '/stats.html']);

function isPublicHtmlPage(path: string): boolean {
  return PUBLIC_HTML_PAGES.has(path) || /^\/people\/vp-\d{4}\.html$/.test(path);
}

const DAILY_HISTORY_KEY = 'hostname-daily-v2';
const MAX_STORED_DAYS = 30;
const SOURCE_LOOKBACK_DAYS = 7;

function dateStringsEndingOn(endDate: string, count: number): string[] {
  const end = new Date(`${endDate}T00:00:00Z`);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(date.getUTCDate() - (count - index - 1));
    return date.toISOString().split('T')[0];
  });
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

function calculatePageBreakdown(pages: PageStat[]): PageBreakdown {
  let profileViews = 0;
  let mainViews = 0;
  let submitViews = 0;
  let statsViews = 0;
  let otherViews = 0;
  let totalViews = 0;

  pages.forEach(p => {
    totalViews += p.count;
    if (p.path.startsWith('/people/')) {
      profileViews += p.count;
    } else if (p.path === '/' || p.path === '/index.html') {
      mainViews += p.count;
    } else if (p.path === '/submit.html') {
      submitViews += p.count;
    } else if (p.path === '/stats.html') {
      statsViews += p.count;
    } else {
      otherViews += p.count;
    }
  });

  const profilePct = totalViews > 0 ? Math.round((profileViews / totalViews) * 100) : 0;

  return {
    profileViews,
    profilePct,
    mainViews,
    submitViews,
    statsViews,
    otherViews,
    totalViews,
  };
}

function buildGraphqlQuery(dates: string[]): string {
  const dateVariables = dates.map((_, index) => `$date${index}: Date!`).join(', ');
  const dailyNodes = dates.map((_, index) => `
      traffic${index}: httpRequestsAdaptiveGroups(
        limit: 1
        filter: { date: $date${index}, clientRequestHTTPHost: $hostname, requestSource: "eyeball" }
      ) { count }
      pages${index}: httpRequestsAdaptiveGroups(
        limit: 1
        filter: { date: $date${index}, clientRequestHTTPHost: $hostname, requestSource: "eyeball", edgeResponseContentTypeName: "html", edgeResponseStatus_geq: 200, edgeResponseStatus_lt: 400 }
      ) { count sum { visits } }
      topCountries${index}: httpRequestsAdaptiveGroups(
        limit: 250
        filter: { date: $date${index}, clientRequestHTTPHost: $hostname, requestSource: "eyeball", edgeResponseContentTypeName: "html", edgeResponseStatus_geq: 200, edgeResponseStatus_lt: 400 }
      ) {
        count
        sum { visits }
        dimensions { clientCountryName }
      }
      topPages${index}: httpRequestsAdaptiveGroups(
        limit: 250
        filter: { date: $date${index}, clientRequestHTTPHost: $hostname, requestSource: "eyeball", edgeResponseContentTypeName: "html", edgeResponseStatus_geq: 200, edgeResponseStatus_lt: 400 }
      ) {
        count
        dimensions { clientRequestPath }
      }`).join('');

  return `
query GetHostnameTrafficStats($zoneTag: String!, $hostname: String!, ${dateVariables}) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {${dailyNodes}
      topCountries: httpRequestsAdaptiveGroups(
        limit: 250
        filter: { date: $date${dates.length - 1}, clientRequestHTTPHost: $hostname, requestSource: "eyeball", edgeResponseContentTypeName: "html", edgeResponseStatus_geq: 200, edgeResponseStatus_lt: 400 }
      ) {
        count
        sum { visits }
        dimensions { clientCountryName }
      }
      topPages: httpRequestsAdaptiveGroups(
        limit: 100
        filter: { date: $date${dates.length - 1}, clientRequestHTTPHost: $hostname, requestSource: "eyeball", edgeResponseContentTypeName: "html", edgeResponseStatus_geq: 200, edgeResponseStatus_lt: 400 }
        orderBy: [count_DESC]
      ) {
        count
        dimensions { clientRequestPath }
      }
    }
  }
}
`;
}

function buildDemoResponse(): StatsResponse {
  const today = new Date();
  const daily: DailyStat[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const base = 120 + Math.floor(Math.sin(i * 0.5) * 40) + (i % 7 === 0 ? 60 : 0);
    daily.push({
      date: dateStr,
      requests: Math.round(base * 3.8),
      pageViews: Math.round(base * 1.6),
      visits: Math.round(base * 0.8),
    });
  }

  const todayStat = daily[daily.length - 1] || { requests: 0, pageViews: 0, visits: 0 };
  const last7 = daily.slice(-7);
  const sum7 = last7.reduce((acc, curr) => ({
    requests: acc.requests + curr.requests,
    pageViews: acc.pageViews + curr.pageViews,
    visits: acc.visits + (curr.visits || 0),
  }), { requests: 0, pageViews: 0, visits: 0 });

  const sum30 = daily.reduce((acc, curr) => ({
    requests: acc.requests + curr.requests,
    pageViews: acc.pageViews + curr.pageViews,
    visits: acc.visits + (curr.visits || 0),
  }), { requests: 0, pageViews: 0, visits: 0 });

  const visitsList7 = last7.map(d => d.visits || 0);
  const avgVisitsPerDay = Math.round(sum7.visits / 7);
  const medianVisitsPerDay = calculateMedian(visitsList7);

  const topCountries7Day: CountryStat[] = [
    { code: 'US', name: 'United States', flag: '🇺🇸', count: 2450, visits: 2450, pct: 54.4 },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳', count: 1820, visits: 1820, pct: 40.4 },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', count: 420, visits: 420, pct: 9.3 },
    { code: 'FR', name: 'France', flag: '🇫🇷', count: 390, visits: 390, pct: 8.7 },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', count: 310, visits: 310, pct: 6.9 },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', count: 280, visits: 280, pct: 6.2 },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', count: 240, visits: 240, pct: 5.3 },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', count: 190, visits: 190, pct: 4.2 },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', count: 150, visits: 150, pct: 3.3 },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷', count: 120, visits: 120, pct: 2.7 },
  ];

  const topPages7Day: PageStat[] = [
    { path: '/', label: 'Main Directory', count: 4850 },
    { path: '/submit.html', label: 'Submit / Update Entry', count: 890 },
    { path: '/people/vp-1183.html', label: 'Profile vp-1183', count: 320 },
    { path: '/people/vp-0064.html', label: 'Profile vp-0064', count: 280 },
    { path: '/stats.html', label: 'Visitor Statistics', count: 210 },
    { path: '/people/vp-0753.html', label: 'Profile vp-0753', count: 180 },
    { path: '/people/vp-0706.html', label: 'Profile vp-0706', count: 140 },
  ];

  const pageBreakdown = calculatePageBreakdown(topPages7Day);

  return {
    generatedAt: new Date().toISOString(),
    dataPeriodDays: 30,
    breakdownPeriodDays: 7,
    metricNotice: 'Visits are Cloudflare network visit estimates, not unique verified people. Eyeball traffic represents external client requests; it is not equivalent to verified human visitors and may still include automated traffic.',
    retentionNotice: 'Cloudflare live API retention is approximately 8 days. A scheduled archive builds the longer 30-day history over time.',
    coverage: { last7Days: 7, last30Days: 30 },
    today: todayStat,
    last7Days: sum7,
    last30Days: sum30,
    baseline: {
      avgVisitsPerDay,
      medianVisitsPerDay,
      avgPageViewsPerDay: Math.round(sum7.pageViews / 7),
    },
    countriesCount: topCountries7Day.length,
    topCountries: topCountries7Day,
    topCountriesToday: topCountries7Day.slice(0, 5),
    topPages: topPages7Day,
    topPagesToday: topPages7Day.slice(0, 5),
    pageBreakdown,
    daily,
    isDemo: true,
  };
}

interface AdaptiveRow {
  count?: number;
  sum?: { visits?: number };
  dimensions?: {
    clientCountryName?: string;
    clientRequestPath?: string;
  };
}

type ZoneAnalytics = Record<string, AdaptiveRow[] | undefined>;

function sumDaily(rows: DailyStat[]): Omit<DailyStat, 'date'> {
  return rows.reduce((total, row) => ({
    requests: total.requests + row.requests,
    pageViews: total.pageViews + row.pageViews,
    visits: (total.visits || 0) + (row.visits || 0),
  }), { requests: 0, pageViews: 0, visits: 0 });
}

async function fetchLiveStats(env: Env, { persist = false } = {}): Promise<StatsResponse> {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ZONE_ID) {
    return buildDemoResponse();
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const sourceDates = dateStringsEndingOn(todayStr, SOURCE_LOOKBACK_DAYS);
  const hostname = env.CLOUDFLARE_HOSTNAME || 'vietprofs.roars.dev';
  const variables: Record<string, string> = {
    zoneTag: env.CLOUDFLARE_ZONE_ID,
    hostname,
  };
  sourceDates.forEach((date, index) => {
    variables[`date${index}`] = date;
  });

  const gqlRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: buildGraphqlQuery(sourceDates), variables }),
  });

  if (!gqlRes.ok) {
    throw new Error(`Cloudflare GraphQL API HTTP error: ${gqlRes.status}`);
  }

  const gqlData = (await gqlRes.json()) as {
    data?: { viewer?: { zones?: ZoneAnalytics[] } };
    errors?: Array<{ message: string }>;
  };
  if (gqlData.errors?.length) {
    throw new Error(`Cloudflare GraphQL errors: ${gqlData.errors.map(error => error.message).join('; ')}`);
  }

  const zoneData = gqlData.data?.viewer?.zones?.[0];
  if (!zoneData) {
    throw new Error('No zone data returned from Cloudflare GraphQL API');
  }

  const freshDaily = sourceDates.map((date, index): DailyStat => {
    const traffic = zoneData[`traffic${index}`]?.[0];
    const pages = zoneData[`pages${index}`]?.[0];
    return {
      date,
      requests: traffic?.count || 0,
      pageViews: pages?.count || 0,
      visits: pages?.sum?.visits || 0,
    };
  });

  let storedDaily: DailyStat[] = [];
  if (env.STATS_KV) {
    try {
      storedDaily = (await env.STATS_KV.get<DailyStat[]>(DAILY_HISTORY_KEY, 'json')) || [];
    } catch (error) {
      console.error('Could not read stored analytics history', error);
    }
  }

  const historyByDate = new Map<string, DailyStat>();
  [...storedDaily, ...freshDaily].forEach(row => historyByDate.set(row.date, row));
  const firstDate = dateStringsEndingOn(todayStr, MAX_STORED_DAYS)[0];
  const daily = [...historyByDate.values()]
    .filter(row => row.date >= firstDate && row.date <= todayStr)
    .sort((left, right) => left.date.localeCompare(right.date));

  if (persist && env.STATS_KV) {
    try {
      await env.STATS_KV.put(DAILY_HISTORY_KEY, JSON.stringify(daily));
    } catch (error) {
      console.error('Could not store analytics history', error);
    }
  }

  const last7Start = dateStringsEndingOn(todayStr, 7)[0];
  const last7 = daily.filter(row => row.date >= last7Start);
  const today = daily.find(row => row.date === todayStr) || {
    date: todayStr,
    requests: 0,
    pageViews: 0,
    visits: 0,
  };

  // Aggregate Top Countries over available daily nodes (7 days)
  const countryVisits7Day: Record<string, number> = {};
  sourceDates.forEach((_, index) => {
    const nodes = zoneData[`topCountries${index}`] || (index === sourceDates.length - 1 ? zoneData.topCountries : undefined) || [];
    nodes.forEach(item => {
      const countryInput = item.dimensions?.clientCountryName || 'Unknown';
      const code = countryInput.length === 2 ? countryInput.toUpperCase() : 'XX';
      countryVisits7Day[code] = (countryVisits7Day[code] || 0) + (item.sum?.visits || 0);
    });
  });

  const total7DayVisits = Object.values(countryVisits7Day).reduce((a, b) => a + b, 0);

  const topCountries = Object.entries(countryVisits7Day)
    .map(([code, visits]): CountryStat => ({
      code,
      name: COUNTRY_NAMES[code] || code,
      flag: countryCodeToFlag(code),
      count: visits,
      visits,
      pct: total7DayVisits > 0 ? Math.round((visits / total7DayVisits) * 1000) / 10 : 0,
    }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  // Today's countries view
  const topCountriesToday = (zoneData.topCountries || [])
    .map((item): CountryStat => {
      const countryInput = item.dimensions?.clientCountryName || 'Unknown';
      const code = countryInput.length === 2 ? countryInput.toUpperCase() : 'XX';
      return {
        code,
        name: COUNTRY_NAMES[code] || countryInput,
        flag: countryCodeToFlag(code),
        count: item.sum?.visits || 0,
        visits: item.sum?.visits || 0,
      };
    })
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  // Aggregate Top Pages over available daily nodes (7 days)
  const pageViews7Day: Record<string, number> = {};
  sourceDates.forEach((_, index) => {
    const nodes = zoneData[`topPages${index}`] || (index === sourceDates.length - 1 ? zoneData.topPages : undefined) || [];
    nodes.forEach(item => {
      const path = item.dimensions?.clientRequestPath || '/';
      if (isPublicHtmlPage(path)) {
        pageViews7Day[path] = (pageViews7Day[path] || 0) + (item.count || 0);
      }
    });
  });

  const topPages = Object.entries(pageViews7Day)
    .map(([path, count]): PageStat => ({
      path,
      label: cleanPageLabel(path),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Today's pages view
  const topPagesToday = (zoneData.topPages || [])
    .filter(item => isPublicHtmlPage(item.dimensions?.clientRequestPath || ''))
    .map((item): PageStat => {
      const path = item.dimensions?.clientRequestPath || '/';
      return { path, label: cleanPageLabel(path), count: item.count || 0 };
    });

  const pageBreakdown = calculatePageBreakdown(topPages);

  const visitsList7 = last7.map(d => d.visits || 0);
  const sum7 = sumDaily(last7);
  const avgVisitsPerDay = Math.round((sum7.visits || 0) / Math.max(1, last7.length));
  const medianVisitsPerDay = calculateMedian(visitsList7);

  return {
    generatedAt: new Date().toISOString(),
    dataPeriodDays: MAX_STORED_DAYS,
    breakdownPeriodDays: 7,
    metricNotice: 'Visits are Cloudflare network visit estimates, not unique verified people. Eyeball traffic represents external client requests; it is not equivalent to verified human visitors and may still include automated traffic.',
    retentionNotice: 'Cloudflare live API retention is approximately 8 days. A scheduled archive builds the longer 30-day history over time.',
    coverage: { last7Days: last7.length, last30Days: daily.length },
    today,
    last7Days: sum7,
    last30Days: sumDaily(daily),
    baseline: {
      avgVisitsPerDay,
      medianVisitsPerDay,
      avgPageViewsPerDay: Math.round(sum7.pageViews / Math.max(1, last7.length)),
    },
    countriesCount: topCountries.length,
    topCountries,
    topCountriesToday,
    topPages,
    topPagesToday,
    pageBreakdown,
    daily,
    isDemo: false,
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', worker: 'vietprofs-stats-api' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname !== '/api/stats' && url.pathname !== '/stats' && url.pathname !== '/api/stats/') {
      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'GET, OPTIONS' },
      });
    }

    const cacheKey = new Request(url.toString(), request);
    if (typeof caches !== 'undefined') {
      try {
        const cachedResponse = await caches.default.match(cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }
      } catch {
        // Edge cache lookup failure can be safely ignored
      }
    }

    if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ZONE_ID) {
      const demoData = buildDemoResponse();
      const response = new Response(JSON.stringify(demoData), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      });
      return response;
    }

    try {
      const responsePayload = await fetchLiveStats(env);

      const response = new Response(JSON.stringify(responsePayload), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=600',
        },
      });

      if (typeof caches !== 'undefined') {
        ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
      }
      return response;
    } catch (err: unknown) {
      console.error('Cloudflare Analytics request failed', err);
      const fallbackPayload = {
        error: 'Visitor statistics temporarily unavailable',
        generatedAt: new Date().toISOString(),
        message: 'The aggregate analytics provider did not return data.',
      };
      return new Response(JSON.stringify(fallbackPayload), {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }
  },
  async scheduled(_controller: unknown, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(fetchLiveStats(env, { persist: true }).then((): undefined => undefined).catch(error => {
      console.error('Scheduled analytics refresh failed', error);
    }));
  },
};
