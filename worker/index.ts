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
}


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
  breakdownPeriodDays: number;
  metricNotice: string;
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
  if (path === '/vietprofs.pdf') return 'VietProfs Manuscript (PDF)';
  if (path === '/data.json') return 'Roster Dataset (data.json)';
  if (path === '/stats-history.json') return 'Roster Growth Dataset';
  if (path.startsWith('/people/')) {
    const filename = path.replace('/people/', '').replace('.html', '');
    return `Profile ${filename}`;
  }
  return path;
}

const GRAPHQL_QUERY = `
query GetZoneTrafficStats($zoneTag: String!, $startDate: Date!, $endDate: Date!, $breakdownDate: Date!, $hostname: String!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      daily: httpRequests1dGroups(
        limit: 35
        filter: { date_geq: $startDate, date_leq: $endDate }
        orderBy: [date_ASC]
      ) {
        dimensions {
          date
        }
        sum {
          requests
          pageViews
        }
        uniq {
          uniques
        }
      }
      topCountries: httpRequestsAdaptiveGroups(
        limit: 30
        filter: { date: $breakdownDate, clientRequestHTTPHost: $hostname }
        orderBy: [count_DESC]
      ) {
        count
        dimensions {
          clientCountryName
        }
      }
      topPages: httpRequestsAdaptiveGroups(
        limit: 30
        filter: { date: $breakdownDate, clientRequestHTTPHost: $hostname }
        orderBy: [count_DESC]
      ) {
        count
        dimensions {
          clientRequestPath
        }
      }
    }
  }
}
`;

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
      uniques: Math.round(base * 0.8),
    });
  }

  const todayStat = daily[daily.length - 1] || { requests: 0, pageViews: 0, uniques: 0 };
  const last7 = daily.slice(-7);
  const sum7 = last7.reduce((acc, curr) => ({
    requests: acc.requests + curr.requests,
    pageViews: acc.pageViews + curr.pageViews,
    uniques: acc.uniques + curr.uniques,
  }), { requests: 0, pageViews: 0, uniques: 0 });

  const sum30 = daily.reduce((acc, curr) => ({
    requests: acc.requests + curr.requests,
    pageViews: acc.pageViews + curr.pageViews,
    uniques: acc.uniques + curr.uniques,
  }), { requests: 0, pageViews: 0, uniques: 0 });

  return {
    generatedAt: new Date().toISOString(),
    dataPeriodDays: 30,
    breakdownPeriodDays: 1,
    metricNotice: 'Unique-IP totals for multi-day periods sum each day\'s count, so a repeat visitor may be counted on more than one day.',
    today: todayStat,
    last7Days: sum7,
    last30Days: sum30,
    countriesCount: 18,
    topCountries: [
      { code: 'US', name: 'United States', flag: '🇺🇸', count: 2450 },
      { code: 'VN', name: 'Vietnam', flag: '🇻🇳', count: 1820 },
      { code: 'JP', name: 'Japan', flag: '🇯🇵', count: 420 },
      { code: 'FR', name: 'France', flag: '🇫🇷', count: 390 },
      { code: 'DE', name: 'Germany', flag: '🇩🇪', count: 310 },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', count: 280 },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', count: 240 },
      { code: 'AU', name: 'Australia', flag: '🇦🇺', count: 190 },
      { code: 'SG', name: 'Singapore', flag: '🇸🇬', count: 150 },
      { code: 'KR', name: 'South Korea', flag: '🇰🇷', count: 120 },
    ],
    topReferrers: [
      { host: 'google.com', label: 'Google Search', count: 1850 },
      { host: 'github.com', label: 'GitHub', count: 1240 },
      { host: 'direct', label: 'Direct / Bookmarks', count: 980 },
      { host: 'linkedin.com', label: 'LinkedIn', count: 620 },
      { host: 'roars.dev', label: 'ROARS Lab', count: 340 },
      { host: 't.co', label: 'X / Twitter', count: 210 },
      { host: 'hieuphay.com', label: 'HieuPhay Blog', count: 140 },
    ],
    topPages: [
      { path: '/', label: 'Main Directory', count: 4850 },
      { path: '/submit.html', label: 'Submit / Update Entry', count: 890 },
      { path: '/vietprofs.pdf', label: 'VietProfs Manuscript (PDF)', count: 410 },
      { path: '/data.json', label: 'Roster Dataset (data.json)', count: 320 },
      { path: '/people/vp-0001.html', label: 'Profile vp-0001', count: 180 },
      { path: '/people/vp-0012.html', label: 'Profile vp-0012', count: 140 },
    ],
    daily,
    isDemo: true,
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

    // Check Cloudflare edge cache first
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


    // If Cloudflare token / Zone ID is missing, return demo/fallback structure cleanly
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

    // Live Cloudflare GraphQL query
    const today = new Date();
    const startDateObj = new Date(today);
    startDateObj.setUTCDate(startDateObj.getUTCDate() - 29);
    const startDate = startDateObj.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    try {
      const gqlRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GRAPHQL_QUERY,
          variables: {
            zoneTag: env.CLOUDFLARE_ZONE_ID,
            startDate,
            endDate,
            breakdownDate: endDate,
            hostname: env.CLOUDFLARE_HOSTNAME || 'vietprofs.roars.dev',
          },
        }),
      });

      if (!gqlRes.ok) {
        throw new Error(`Cloudflare GraphQL API HTTP error: ${gqlRes.status}`);
      }

      const gqlData = (await gqlRes.json()) as {
        data?: {
          viewer?: {
            zones?: Array<{
              daily?: Array<{
                dimensions: { date: string };
                sum: { requests?: number; pageViews?: number };
                uniq: { uniques?: number };
              }>;
              topCountries?: Array<{
                count: number;
                dimensions: { clientCountryName: string };
              }>;
              topPages?: Array<{
                count: number;
                dimensions: { clientRequestPath: string };
              }>;
            }>;
          };
        };
        errors?: Array<{ message: string }>;
      };

      if (gqlData.errors?.length) {
        throw new Error(`Cloudflare GraphQL errors: ${gqlData.errors.map(e => e.message).join('; ')}`);
      }

      const zoneData = gqlData.data?.viewer?.zones?.[0];
      if (!zoneData) {
        throw new Error('No zone data returned from Cloudflare GraphQL API');
      }

      const rawDaily = zoneData.daily || [];
      const daily: DailyStat[] = rawDaily.map(item => ({
        date: item.dimensions.date,
        requests: item.sum.requests || 0,
        pageViews: item.sum.pageViews || 0,
        uniques: item.uniq.uniques || 0,
      }));

      const todayStr = endDate;
      const todayStat = daily.find(d => d.date === todayStr) || { date: todayStr, requests: 0, pageViews: 0, uniques: 0 };

      const last7DaysDateStr = new Date(today.getTime() - 6 * 86400000).toISOString().split('T')[0];
      const last7 = daily.filter(d => d.date >= last7DaysDateStr);
      const sum7 = last7.reduce((acc, curr) => ({
        requests: acc.requests + curr.requests,
        pageViews: acc.pageViews + curr.pageViews,
        uniques: acc.uniques + curr.uniques,
      }), { requests: 0, pageViews: 0, uniques: 0 });

      const sum30 = daily.reduce((acc, curr) => ({
        requests: acc.requests + curr.requests,
        pageViews: acc.pageViews + curr.pageViews,
        uniques: acc.uniques + curr.uniques,
      }), { requests: 0, pageViews: 0, uniques: 0 });

      const rawCountries = zoneData.topCountries || [];
      const topCountries: CountryStat[] = rawCountries.map(item => {
        const countryInput = item.dimensions.clientCountryName || 'Unknown';
        const code = countryInput.length === 2 ? countryInput.toUpperCase() : 'XX';
        const name = COUNTRY_NAMES[code] || countryInput;
        const flag = countryCodeToFlag(code);
        return {
          code,
          name,
          flag,
          count: item.count || 0,
        };
      });

      const topReferrers: ReferrerStat[] = [];

      const rawPages = zoneData.topPages || [];
      const topPages: PageStat[] = rawPages
        .filter(item => {
          const path = item.dimensions.clientRequestPath || '';
          return !path.startsWith('/api/') && path !== '/stats.html';
        })
        .map(item => {
          const path = item.dimensions.clientRequestPath || '/';
          return {
            path,
            label: cleanPageLabel(path),
            count: item.count || 0,
          };
        });

      const responsePayload: StatsResponse = {
        generatedAt: new Date().toISOString(),
        dataPeriodDays: 30,
        breakdownPeriodDays: 1,
        metricNotice: 'Unique-IP totals for multi-day periods sum each day\'s count, so a repeat visitor may be counted on more than one day.',
        today: todayStat,
        last7Days: sum7,
        last30Days: sum30,
        countriesCount: topCountries.length,
        topCountries,
        topReferrers,
        topPages,
        daily,
        isDemo: false,
      };

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
      // Fallback response with clean error notice, avoiding internal secret exposure
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
};
