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
  assert.equal(data.isDemo, true);
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
