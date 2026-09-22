import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { categoryForPath, normalizePath } from '../worker/index.ts';

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
      directory: 30, profiles: 15, submit: 5, statistics: 4, 'insights-health': 0, other: 6,
    });
    assert.equal(data.categories.reduce((total: number, row: any) => total + row.pageViews, 0), data.last7Complete.pageViews);
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
    assert.deepEqual(writtenKeys.sort(), ['browser-rum-daily-v1', 'browser-rum-last-success-v1']);
    assert.ok(!readKeys.includes('hostname-daily-v2'));
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
