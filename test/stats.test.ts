import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.ts';

test('Worker handles /health endpoint', async () => {
  const req = new Request('http://localhost/health');
  const env = {};
  const ctx = {
    waitUntil: () => {},
    passThroughOnException: () => {},
  };
  const res = await worker.fetch(req, env, ctx as any);
  assert.equal(res.status, 200);
  const data = await res.json() as { status: string; worker: string };
  assert.equal(data.status, 'ok');
  assert.equal(data.worker, 'vietprofs-stats-api');
});

test('Worker handles /api/stats endpoint in fallback/demo mode when token is absent', async () => {
  const req = new Request('http://localhost/api/stats');
  const env = {};
  const ctx = {
    waitUntil: () => {},
    passThroughOnException: () => {},
  };
  const res = await worker.fetch(req, env, ctx as any);
  assert.equal(res.status, 200);
  const data = await res.json() as any;
  assert.ok(data.today);
  assert.ok(data.last7Days);
  assert.ok(data.last30Days);
  assert.ok(data.topCountries.length > 0);
  assert.ok(data.topReferrers.length > 0);
  assert.ok(data.topPages.length > 0);
  assert.ok(data.daily.length === 30);
  assert.ok(data.today.visits > 0);
  assert.deepEqual(data.coverage, { last7Days: 7, last30Days: 30 });
  assert.equal(data.isDemo, true);
});

test('Worker scopes live analytics to the hostname and reports honest coverage', async () => {
  const originalFetch = globalThis.fetch;
  let requestBody: any;
  let storedHistory = '';
  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    const zone: Record<string, unknown> = {
      topCountries: [
        { count: 40, sum: { visits: 4 }, dimensions: { clientCountryName: 'US' } },
        { count: 30, sum: { visits: 3 }, dimensions: { clientCountryName: 'VN' } },
      ],
      topPages: [
        { count: 12, dimensions: { clientRequestPath: '/' } },
        { count: 2, dimensions: { clientRequestPath: '/stats.html' } },
        { count: 2, dimensions: { clientRequestPath: '/favicon.ico' } },
      ],
    };
    for (let index = 0; index < 7; index++) {
      zone[`traffic${index}`] = [{ count: 10 + index }];
      zone[`pages${index}`] = [{ count: index + 2, sum: { visits: index + 1 } }];
    }
    return new Response(JSON.stringify({ data: { viewer: { zones: [zone] } } }), {
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const req = new Request('http://localhost/api/stats');
    const env = {
      CLOUDFLARE_API_TOKEN: 'test-token',
      CLOUDFLARE_ZONE_ID: 'test-zone',
      CLOUDFLARE_HOSTNAME: 'vietprofs.roars.dev',
      STATS_KV: {
        get: async (): Promise<null> => null,
        put: async (_key: string, value: string) => { storedHistory = value; },
      },
    };
    const ctx = { waitUntil: () => {}, passThroughOnException: () => {} };
    const res = await worker.fetch(req, env, ctx as any);
    const data = await res.json() as any;

    assert.equal(res.status, 200);
    assert.equal(requestBody.variables.hostname, 'vietprofs.roars.dev');
    assert.doesNotMatch(requestBody.query, /httpRequests1dGroups/);
    assert.match(requestBody.query, /clientRequestHTTPHost: \$hostname/);
    assert.match(requestBody.query, /requestSource: "eyeball"/);
    assert.match(requestBody.query, /edgeResponseContentTypeName: "html"/);
    assert.match(requestBody.query, /edgeResponseStatus_geq: 200/);
    assert.match(requestBody.query, /edgeResponseStatus_lt: 400/);
    assert.deepEqual(data.coverage, { last7Days: 7, last30Days: 7 });
    assert.equal(data.last7Days.visits, 28);
    assert.equal(data.last7Days.pageViews, 35);
    assert.equal(data.last7Days.requests, 91);
    assert.equal(data.countriesCount, 2);
    assert.equal(data.topCountries[0].count, 4);
    assert.equal(data.topPages.length, 1);
    assert.equal(data.topReferrers.length, 0);
    assert.equal(JSON.parse(storedHistory).length, 7);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Worker returns 404 for unknown endpoints', async () => {
  const req = new Request('http://localhost/unknown-path');
  const env = {};
  const ctx = {
    waitUntil: () => {},
    passThroughOnException: () => {},
  };
  const res = await worker.fetch(req, env, ctx as any);
  assert.equal(res.status, 404);
});

test('Worker rejects unsupported methods on the stats endpoint', async () => {
  const req = new Request('http://localhost/api/stats', { method: 'POST' });
  const env = {};
  const ctx = {
    waitUntil: () => {},
    passThroughOnException: () => {},
  };
  const res = await worker.fetch(req, env, ctx as any);
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('Allow'), 'GET, OPTIONS');
});
