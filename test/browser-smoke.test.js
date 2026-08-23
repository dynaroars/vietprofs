import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { firefox } = require('playwright');
const port = 4179;
let server;
let browser;
let baseUrl;
let unavailable;

async function waitForServer(url) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

before(async () => {
  server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)], {
    stdio: 'ignore',
  });
  baseUrl = `http://127.0.0.1:${port}`;
  try {
    await waitForServer(`${baseUrl}/`);
  } catch (error) {
    unavailable = error.message;
    return;
  }
  const executablePath = process.env.BROWSER_PATH || '/usr/bin/firefox';
  try {
    browser = await firefox.launch({ headless: true, executablePath });
  } catch (error) {
    unavailable = error.message.split('\n')[0];
  }
});

after(async () => {
  await browser?.close();
  server?.kill();
});

test('directory loads and searching changes the roster', async (t) => {
  if (unavailable || !browser) return t.skip(`Browser smoke tests unavailable: ${unavailable ?? 'no browser'}`);
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const initial = await page.locator('.entry').count();
  assert.ok(initial > 0);
  await page.locator('#search').fill('Nguyen');
  await page.waitForTimeout(250);
  assert.ok((await page.locator('.entry').count()) > 0);
  assert.match(await page.locator('#result-count').textContent(), /professors?/);
  await page.close();
});

test('filters and submit-form suggestions work', async (t) => {
  if (unavailable || !browser) return t.skip(`Browser smoke tests unavailable: ${unavailable ?? 'no browser'}`);
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.locator('#location-filter').selectOption('World');
  assert.ok((await page.locator('.entry').count()) > 0);
  await page.goto(`${baseUrl}/submit.html`, { waitUntil: 'networkidle' });
  await page.locator('#name').fill('Nguyen');
  assert.ok((await page.locator('.correction-suggestion').count()) > 0);
  await page.locator('.correction-suggestion').first().click();
  assert.notEqual(await page.locator('#profileUrl').inputValue(), '');
  await page.close();
});

test('stale zero-result field URLs fall back to the roster', async (t) => {
  if (unavailable || !browser) return t.skip(`Browser smoke tests unavailable: ${unavailable ?? 'no browser'}`);
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/?field=Others`, { waitUntil: 'networkidle' });
  assert.ok((await page.locator('.entry').count()) > 0);
  await page.close();
});

test('zero-count filter options are hidden and stale locations recover', async (t) => {
  if (unavailable || !browser) return t.skip(`Browser smoke tests unavailable: ${unavailable ?? 'no browser'}`);
  const page = await browser.newPage();
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.locator('#field-filter').selectOption('Biological & Biomedical Sciences');
  assert.equal(await page.locator('#track-filter option[value="Teaching"]').getAttribute('hidden'), '');
  assert.equal(await page.locator('#track-filter option[value="Emeritus"]').getAttribute('hidden'), '');
  assert.equal(await page.locator('#field-filter option[value="Others"]').getAttribute('hidden'), '');
  const visibleCountryLabels = await page.locator('#location-filter option:not([hidden])').allTextContents();
  assert.ok(visibleCountryLabels.every((label) => !label.endsWith('(0)')));
  await page.goto(`${baseUrl}/?loc=Africa`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#location-filter').inputValue(), 'US');
  assert.ok((await page.locator('.entry').count()) > 0);
  assert.deepEqual(runtimeErrors, []);
  await page.close();
});
