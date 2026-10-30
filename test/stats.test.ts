import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { SITES, categoryForPath, flagSuspectedDays, healthProblems, normalizePath, refreshFailure } from '../src/worker.ts';

const ctx = { waitUntil: () => {}, passThroughOnException: () => {} };

function shift(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function liveEnv(kvOverrides: Record<string, unknown> = {}) {
  return {
    CLOUDFLARE_API_TOKEN: 'test-token',
    CLOUDFLARE_ACCOUNT_ID: 'test-account',
    CLOUDFLARE_HOSTNAME: 'vietprofs.roars.dev',
    STATS_KV: { get: async () => null, put: async () => {}, ...kvOverrides },
  };
}

test('Worker handles /health endpoint', async () => {
  const response = await worker.fetch(new Request('http://localhost/health'), {}, ctx as any);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', worker: 'vietprofs-stats-api', source: 'cloudflare-rum' });
});

test('demo mode uses only the browser/RUM schema', async () => {
  const response = await worker.fetch(new Request('http://localhost/api/stats'), {}, ctx as any);
  const data = await response.json() as any;
  assert.equal(response.status, 200);
  assert.equal(data.schemaVersion, 3);
  assert.equal(data.source, 'cloudflare-rum');
  assert.equal(data.isDemo, true);
  assert.equal(data.daily.at(-1).status, 'partial');
  assert.equal(data.requests, undefined);
  assert.equal(data.topPages, undefined);
  assert.equal(data.browserLikeTrafficPct, undefined);
});

test('live analytics uses bot-filtered account RUM, complete-day averages, normalized paths, and countries', async () => {
  const originalFetch = globalThis.fetch;
  let requestBody: any;
  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    const { lastCompleteDate } = requestBody.variables;
    const first = shift(lastCompleteDate, -2);
    return new Response(JSON.stringify({ data: { viewer: { accounts: [{
      daily: [
        { count: 10, sum: { visits: 5 }, dimensions: { date: first } },
        { count: 20, sum: { visits: 8 }, dimensions: { date: shift(first, 1) } },
        { count: 30, sum: { visits: 10 }, dimensions: { date: lastCompleteDate } },
        { count: 99, sum: { visits: 50 }, dimensions: { date: requestBody.variables.today } },
      ],
      countries: [
        { count: 40, dimensions: { countryName: 'US' } },
        { count: 19, dimensions: { countryName: 'UA' } },
        { count: 1, dimensions: { countryName: 'ZZ' } },
      ],
      paths: [
        { count: 20, dimensions: { requestPath: '/' } },
        { count: 10, dimensions: { requestPath: '/index.html?view=health' } },
        { count: 15, dimensions: { requestPath: '/people/vp-0001.html?source=x' } },
        { count: 5, dimensions: { requestPath: '/submit.html#form' } },
        { count: 4, dimensions: { requestPath: '/stats.html' } },
        { count: 6, dimensions: { requestPath: '/fields/health-sciences.html' } },
      ],
    }] } } }), { headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const response = await worker.fetch(new Request('http://localhost/api/stats'), liveEnv(), ctx as any);
    const data = await response.json() as any;
    assert.equal(response.status, 200);
    assert.match(requestBody.query, /rumPageloadEventsAdaptiveGroups/);
    assert.match(requestBody.query, /accounts\(filter:/);
    assert.match(requestBody.query, /bot: 0/);
    assert.equal((requestBody.query.match(/userAgentBrowser_neq: "ChromeMobile"/g) || []).length, 3, 'every dataset excludes suspected automated mobile Chrome');
    assert.equal((requestBody.query.match(/refererHost_neq: \$hostname/g) || []).length, 3);
    assert.doesNotMatch(requestBody.query, /httpRequestsAdaptiveGroups|javascript|css/);
    assert.equal(requestBody.variables.hostname, 'vietprofs.roars.dev');
    assert.equal(data.today.pageViews, 99);
    assert.equal(data.last7Complete.pageViews, 60);
    assert.equal(data.last7Complete.days, 3);
    assert.equal(data.last7Complete.avgPageViews, 20);
    assert.equal(data.last30Available.days, 3);
    assert.equal(data.countries[1].name, 'Ukraine');
    assert.match(data.countries[2].name, /Unknown location/);
    assert.deepEqual(Object.fromEntries(data.categories.map((row: any) => [row.key, row.pageViews])), {
      directory: 30, profiles: 15, submit: 5, statistics: 4, other: 6,
    });
    assert.equal(data.categoryTotal, 60);
    assert.equal(data.categories.reduce((total: number, row: any) => total + row.pageViews, 0), data.categoryTotal);
    assert.equal(data.daily.filter((row: any) => row.status === 'missing').length, 26);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('path grouping ignores query strings, fragments, trailing slashes, and duplicate home URLs', () => {
  assert.equal(normalizePath('/?view=health'), '/index.html');
  assert.equal(normalizePath('/index.html#top'), '/index.html');
  assert.equal(normalizePath('/submit.html/?x=1'), '/submit.html');
  assert.equal(categoryForPath('/people/vp-0706.html?x=1'), 'profiles');
  assert.equal(categoryForPath('/fields/health-sciences.html'), 'other');
});

test('a successful zero-traffic query records zero rather than missing after collection began', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ data: { viewer: { accounts: [{
      daily: [{ count: 0, sum: { visits: 0 }, dimensions: { date: body.variables.lastCompleteDate } }], countries: [], paths: [],
    }] } } }));
  };
  try {
    const response = await worker.fetch(new Request('http://localhost/api/stats'), liveEnv(), ctx as any);
    const data = await response.json() as any;
    assert.equal(data.last7Complete.days, 1);
    assert.equal(data.last7Complete.pageViews, 0);
    assert.equal(data.last7Complete.avgPageViews, 0);
    assert.equal(data.daily.at(-2).status, 'complete');
    assert.equal(data.daily.at(-2).pageViews, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('API failure preserves and visibly marks the last successful RUM snapshot', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('down', { status: 503 });
  const snapshot = (await (await worker.fetch(new Request('http://localhost/api/stats'), {}, ctx as any)).json()) as any;
  snapshot.status = 'ok';
  snapshot.stale = false;
  snapshot.isDemo = false;
  try {
    const env = liveEnv({ get: async (key: string) => key === 'browser-rum-last-success-v1' ? snapshot : null });
    const response = await worker.fetch(new Request('http://localhost/api/stats'), env, ctx as any);
    const data = await response.json() as any;
    assert.equal(response.status, 200);
    assert.equal(data.status, 'stale');
    assert.equal(data.stale, true);
    assert.match(data.notice, /last successful snapshot/i);
    assert.equal(data.today.pageViews, snapshot.today.pageViews);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('API failure without a browser snapshot reports unavailable instead of zeros', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('network unavailable'); };
  try {
    const response = await worker.fetch(new Request('http://localhost/api/stats'), liveEnv(), ctx as any);
    const data = await response.json() as any;
    assert.equal(response.status, 503);
    assert.match(data.error, /temporarily unavailable/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('scheduled refresh writes separate RUM keys and never reads the old raw-request archive', async () => {
  const originalFetch = globalThis.fetch;
  const readKeys: string[] = [];
  const writtenKeys: string[] = [];
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ data: { viewer: { accounts: [{
      daily: [{ count: 1, sum: { visits: 1 }, dimensions: { date: body.variables.lastCompleteDate } }],
      countries: [{ count: 1, dimensions: { countryName: 'US' } }],
      paths: [{ count: 1, dimensions: { requestPath: '/' } }],
    }] } } }));
  };
  try {
    const pending: Promise<unknown>[] = [];
    const env = liveEnv({
      get: async (key: string) => { readKeys.push(key); return null; },
      put: async (key: string) => { writtenKeys.push(key); },
    });
    await worker.scheduled(null, env, { waitUntil: promise => pending.push(promise), passThroughOnException: () => {} });
    await Promise.all(pending);
    assert.deepEqual(writtenKeys.sort(), [
      'browser-rum-daily-v1', 'browser-rum-daily-v1:cspicks.roars.dev',
      'browser-rum-last-success-v1', 'browser-rum-last-success-v1:cspicks.roars.dev',
      'stats-health-v1:cspicks.roars.dev', 'stats-health-v1:vietprofs.roars.dev',
    ]);
    assert.ok(!readKeys.includes('hostname-daily-v2'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('the request hostname selects the site, its hostname filter, KV keys, and page categories', async () => {
  const originalFetch = globalThis.fetch;
  let hostname = '';
  globalThis.fetch = async (_input, init) => {
    hostname = JSON.parse(String(init?.body)).variables.hostname;
    return new Response(JSON.stringify({ data: { viewer: { accounts: [{ daily: [], countries: [], paths: [
      { count: 4, dimensions: { requestPath: '/' } },
      { count: 3, dimensions: { requestPath: '/schools/mit/index.html' } },
      { count: 2, dimensions: { requestPath: '/jobs-submit.html' } },
      { count: 1, dimensions: { requestPath: '/people/vp-0001.html' } },
    ] }] } } }));
  };
  try {
    const readKeys: string[] = [];
    const env = liveEnv({ get: async (key: string) => { readKeys.push(key); return null; } });
    const data = await (await worker.fetch(new Request('https://cspicks.roars.dev/api/stats'), env, ctx as any)).json() as any;
    assert.equal(hostname, 'cspicks.roars.dev');
    assert.deepEqual(readKeys, ['browser-rum-daily-v1:cspicks.roars.dev']);
    const counts = Object.fromEntries(data.categories.map((row: any) => [row.key, row.pageViews]));
    assert.equal(counts.search, 4);
    assert.equal(counts.directory, 3);
    assert.equal(counts.submit, 2);
    assert.equal(counts.other, 1);
    await worker.fetch(new Request('https://unknown.example/api/stats'), env, ctx as any);
    assert.equal(hostname, 'vietprofs.roars.dev');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('demo categories follow the requesting site and add up to the demo total', async () => {
  const data = await (await worker.fetch(new Request('https://cspicks.roars.dev/api/stats'), {}, ctx as any)).json() as any;
  assert.equal(data.categories[0].key, 'search');
  assert.equal(data.categories.reduce((total: number, row: any) => total + row.pageViews, 0), data.categoryTotal);
});

test('daily rows missing while other groups have data serves the last snapshot instead of zeros', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ data: { viewer: { accounts: [{
    daily: [], countries: [{ count: 9, dimensions: { countryName: 'US' } }], paths: [{ count: 9, dimensions: { requestPath: '/' } }],
  }] } } }));
  try {
    const response = await worker.fetch(new Request('http://localhost/api/stats'), liveEnv(), ctx as any);
    assert.equal(response.status, 503);
    assert.match((await response.json() as any).detail, /no daily rows/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Worker returns 404 and rejects unsupported methods', async () => {
  assert.equal((await worker.fetch(new Request('http://localhost/unknown'), {}, ctx as any)).status, 404);
  const response = await worker.fetch(new Request('http://localhost/api/stats', { method: 'POST' }), {}, ctx as any);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'GET, OPTIONS');
});

test('browser, operating system, and device breakdowns come from a separate query and never break the main stats', async () => {
  const originalFetch = globalThis.fetch;
  const queries: string[] = [];
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body));
    queries.push(body.query);
    const { lastCompleteDate } = body.variables;
    if (/BrowserBreakdown/.test(body.query)) {
      return new Response(JSON.stringify({ data: { viewer: { accounts: [{
        browsers: [{ count: 30, dimensions: { userAgentBrowser: 'Chrome' } }, { count: 10, dimensions: { userAgentBrowser: 'ChromeMobile' } }],
        systems: [{ count: 25, dimensions: { userAgentOS: 'Linux' } }, { count: 15, dimensions: { userAgentOS: 'MacOSX' } }],
        devices: [{ count: 40, dimensions: { deviceType: 'desktop' } }],
      }] } } }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ data: { viewer: { accounts: [{
      daily: [{ count: 40, sum: { visits: 20 }, dimensions: { date: lastCompleteDate } }], countries: [], paths: [],
    }] } } }), { headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const data = await (await worker.fetch(new Request('http://localhost/api/stats'), liveEnv(), ctx as any)).json() as any;
    assert.equal(queries.length, 2);
    assert.match(queries[1]!, /userAgentBrowser[\s\S]*userAgentOS[\s\S]*deviceType/);
    assert.equal((queries[1]!.match(/userAgentBrowser_neq: "ChromeMobile"/g) || []).length, 3, 'same automation filter as the main stats');
    assert.deepEqual(data.browsers, [{ name: 'Chrome', pageViews: 30, pct: 75 }, { name: 'Chrome (mobile)', pageViews: 10, pct: 25 }]);
    assert.deepEqual(data.operatingSystems.map((row: any) => row.name), ['Linux', 'macOS']);
    assert.deepEqual(data.devices, [{ name: 'Desktop', pageViews: 40, pct: 100 }]);
  } finally {
    globalThis.fetch = originalFetch;
  }

  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body));
    if (/BrowserBreakdown/.test(body.query)) return new Response(JSON.stringify({ errors: [{ message: 'unknown field' }] }), { headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify({ data: { viewer: { accounts: [{
      daily: [{ count: 5, sum: { visits: 3 }, dimensions: { date: body.variables.lastCompleteDate } }], countries: [], paths: [],
    }] } } }), { headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const response = await worker.fetch(new Request('http://localhost/api/stats'), liveEnv(), ctx as any);
    const data = await response.json() as any;
    assert.equal(response.status, 200);
    assert.equal(data.status, 'ok');
    assert.equal(data.browsers, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// Daily page views and visits for 2026-10-01..2026-10-29 as the live Worker reported them on 2026-10-30.
const OCTOBER_2026 = [
  [50, 40], [180, 90], [160, 90], [100, 70], [170, 90], [70, 20], [460, 230], [800, 240], [280, 170], [220, 120],
  [80, 40], [250, 60], [230, 190], [180, 90], [1190, 1150], [5130, 5010], [1840, 1690], [1190, 1180], [540, 510], [40, 20],
  [140, 100], [120, 90], [80, 30], [100, 30], [390, 310], [120, 100], [50, 40], [30, 10], [870, 810],
];

test('suspected-day flagging catches the October 2026 crawler bursts but not ordinary busy days', () => {
  const daily = OCTOBER_2026.map(([pageViews, visits], index) => ({
    date: `2026-10-${String(index + 1).padStart(2, '0')}`, pageViews, visits, status: 'complete' as const,
  }));
  assert.deepEqual(flagSuspectedDays(daily), ['2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-29']);
  assert.deepEqual(flagSuspectedDays(daily.slice(0, 6)), [], 'too few days for a baseline');
});

test('suspected days are left out of the summary, countries, paths, and breakdowns', async () => {
  const originalFetch = globalThis.fetch;
  const queries: Array<{ query: string; variables: Record<string, string> }> = [];
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body));
    queries.push(body);
    if (/BrowserTrafficKeptDays/.test(body.query)) {
      return new Response(JSON.stringify({ data: { viewer: { accounts: [{
        countries: [{ count: 300, dimensions: { countryName: 'US' } }], paths: [{ count: 300, dimensions: { requestPath: '/' } }],
      }] } } }));
    }
    if (/BrowserBreakdown/.test(body.query)) {
      return new Response(JSON.stringify({ data: { viewer: { accounts: [{ browsers: [{ count: 300, dimensions: { userAgentBrowser: 'Firefox' } }], systems: [], devices: [] }] } } }));
    }
    const { today } = body.variables;
    // 14 ordinary days of 50 page views, with a crawler burst four days ago.
    const daily = Array.from({ length: 14 }, (_, index) => {
      const date = shift(today, index - 14);
      const burst = date === shift(today, -4);
      return { count: burst ? 2000 : 50, sum: { visits: burst ? 1990 : 25 }, dimensions: { date } };
    });
    return new Response(JSON.stringify({ data: { viewer: { accounts: [{
      daily, countries: [{ count: 2300, dimensions: { countryName: 'SG' } }], paths: [{ count: 2300, dimensions: { requestPath: '/' } }],
    }] } } }));
  };
  try {
    const data = await (await worker.fetch(new Request('http://localhost/api/stats'), liveEnv(), ctx as any)).json() as any;
    const burst = shift(data.today.date, -4);
    assert.deepEqual(data.daily.filter((row: any) => row.suspected).map((row: any) => row.date), [burst]);
    assert.deepEqual(data.last7Complete.excludedDays, [burst]);
    assert.equal(data.last7Complete.days, 6);
    assert.equal(data.last7Complete.pageViews, 300);
    assert.equal(data.last7Complete.medianPageViews, 50);
    assert.equal(data.last7Complete.avgPageViews, 50);
    assert.deepEqual(data.countries.map((row: any) => [row.code, row.pct]), [['US', 100]]);
    assert.equal(data.categoryTotal, 300);
    assert.deepEqual(data.browsers.map((row: any) => row.name), ['Firefox']);

    const kept = queries.find(body => /BrowserTrafficKeptDays/.test(body.query))!;
    const breakdown = queries.find(body => /BrowserBreakdown/.test(body.query))!;
    const yesterday = shift(data.today.date, -1);
    for (const body of [kept, breakdown]) {
      assert.match(body.query, new RegExp(`\\{ date_geq: "${shift(yesterday, -6)}", date_leq: "${shift(burst, -1)}" \\} \\{ date_geq: "${shift(burst, 1)}", date_leq: "${yesterday}" \\}`));
      assert.doesNotMatch(body.query, /\$categoryStart|\$lastCompleteDate/, 'no unused GraphQL variables');
      assert.deepEqual(Object.keys(body.variables).sort(), ['accountTag', 'hostname']);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

function snapshotWith(rows: Array<[pageViews: number, visits: number, suspected?: boolean]>, countries: Array<[code: string, pct: number]> = []) {
  const daily = rows.map(([pageViews, visits, suspected], index) => ({
    date: `2026-10-${String(index + 1).padStart(2, '0')}`, pageViews, visits, status: 'complete', ...(suspected ? { suspected: true } : {}),
  }));
  return {
    generatedAt: '2026-10-30T01:15:00Z', coverage: { lastCompleteDate: daily.at(-1)!.date }, daily,
    countries: countries.map(([code, pct]) => ({ code, name: code, flag: '', pageViews: pct, pct })),
  } as any;
}

test('health check reports a silent beacon, a near-miss burst, and a sudden country shift', () => {
  const site = SITES['vietprofs.roars.dev']!;
  const ordinary: Array<[number, number]> = Array.from({ length: 10 }, () => [80, 40]);
  assert.deepEqual(healthProblems(site, snapshotWith([...ordinary, [90, 45]]), null), []);
  assert.match(healthProblems(site, snapshotWith([...ordinary, [0, 0]]), null)[0]!.title, /no page views recorded/);
  // Oct 25, 2026: 390 page views and 310 visits, under the 0.85 visit ratio that flags a day.
  assert.match(healthProblems(site, snapshotWith([...ordinary, [390, 310]]), null)[0]!.title, /possible unflagged crawler/);
  assert.deepEqual(healthProblems(site, snapshotWith([...ordinary, [870, 810, true]]), null), [], 'already flagged');
  assert.deepEqual(healthProblems(site, snapshotWith([...ordinary, [390, 120]]), null), [], 'busy, but ordinary browsing');
  const before = snapshotWith(ordinary, [['US', 40], ['SG', 1]]);
  assert.match(healthProblems(site, snapshotWith(ordinary, [['SG', 75]]), before)[0]!.body, /SG went from 1% to 75%/);
  assert.deepEqual(healthProblems(site, snapshotWith(ordinary, [['US', 71]]), snapshotWith(ordinary, [['US', 69]])), [], 'steady leader');
});

test('one failed refresh reports nothing; a snapshot older than a day and a half does', () => {
  const site = SITES['cspicks.roars.dev']!;
  const previous = snapshotWith([[1, 1]]);
  assert.deepEqual(refreshFailure(site, previous, 'HTTP 500', new Date('2026-10-31T01:15:00Z')), []);
  const [problem] = refreshFailure(site, previous, 'HTTP 500', new Date('2026-11-01T01:15:00Z'));
  assert.equal(problem!.title, 'Visitor stats (cspicks.roars.dev): refresh failing');
  assert.match(problem!.body, /since 2026-10-30T01:15:00Z; the last attempt failed with: HTTP 500/);
  assert.equal(refreshFailure(site, null).length, 1);
});

test('the scheduled refresh stores each site\'s problems and /api/health serves them with the refresh age', async () => {
  const originalFetch = globalThis.fetch;
  const store = new Map<string, unknown>();
  const kv = { get: async (key: string) => store.get(key) ?? null, put: async (key: string, value: string) => { store.set(key, JSON.parse(value)); } };
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body));
    if (body.variables.hostname === 'cspicks.roars.dev') return new Response('down', { status: 503 });
    const { lastCompleteDate } = body.variables;
    // Ten ordinary days, then yesterday at 0: the beacon looks broken.
    const daily = Array.from({ length: 11 }, (_, index) => ({ count: index === 10 ? 0 : 80, sum: { visits: index === 10 ? 0 : 40 }, dimensions: { date: shift(lastCompleteDate, index - 10) } }));
    return new Response(JSON.stringify({ data: { viewer: { accounts: [{ daily, countries: [], paths: [] }] } } }));
  };
  try {
    const pending: Promise<unknown>[] = [];
    await worker.scheduled(null, liveEnv(kv), { waitUntil: promise => pending.push(promise), passThroughOnException: () => {} });
    await assert.rejects(Promise.all(pending), /RUM archive failed for 1 site/);
    const response = await worker.fetch(new Request('https://vietprofs.roars.dev/api/health'), liveEnv(kv), ctx as any);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    const report = await response.json() as any;
    const titles = Object.fromEntries(report.sites.map((site: any) => [site.hostname, site.problems.map((problem: any) => problem.title)]));
    assert.deepEqual(titles, {
      'vietprofs.roars.dev': ['Visitor stats (vietprofs.roars.dev): no page views recorded'],
      'cspicks.roars.dev': ['Visitor stats (cspicks.roars.dev): refresh failing'],
    });
    assert.match(report.sites[1].problems[0].body, /HTTP 503/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
