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

test('local faculty portraits render and load', async (t) => {
  if (unavailable || !browser) return t.skip(`Browser smoke tests unavailable: ${unavailable ?? 'no browser'}`);
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const portrait = page.locator('.entry-portrait').first();
  await portrait.waitFor();
  assert.match(await portrait.getAttribute('src'), /\/portraits\/.*\.webp$/);
  assert.ok(await portrait.evaluate((image) => image.complete && image.naturalWidth > 0));
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

test('filter counts stay visible, zero-count choices are omitted, and stale filters recover', async (t) => {
  if (unavailable || !browser) return t.skip(`Browser smoke tests unavailable: ${unavailable ?? 'no browser'}`);
  const page = await browser.newPage();
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const fieldOptions = page.locator('#field-filter option');
  const trackOptions = page.locator('#track-filter option');
  const countedFieldLabels = await fieldOptions.evaluateAll((options) =>
    options.filter((option) => option.value !== 'interesting').map((option) => option.textContent),
  );
  const countedTrackLabels = await trackOptions.allTextContents();
  assert.ok(countedFieldLabels.every((text) => /\(\d+\)$/.test(text.trim())));
  assert.ok(countedTrackLabels.every((text) => /\(\d+\)$/.test(text.trim())));
  assert.ok(countedFieldLabels.every((text) => !text.endsWith('(0)')));
  assert.ok(countedTrackLabels.every((text) => !text.endsWith('(0)')));
  assert.match(await fieldOptions.filter({ hasText: 'Health' }).first().textContent(), /Health.*\(\d+\)/);
  assert.match(await fieldOptions.filter({ hasText: 'Law' }).first().textContent(), /Law.*\(\d+\)/);
  assert.match(await trackOptions.filter({ hasText: 'Tenure-line' }).first().textContent(), /Tenure-line \(\d+\)/);
  assert.equal(await page.locator('#field-filter option[value="Others"]').count(), 0);
  await page.locator('#field-filter').selectOption('Biological & Biomedical Sciences');
  assert.ok((await page.locator('.entry').count()) > 0);
  assert.equal(await page.locator('#track-filter option[value="Teaching"]').count(), 0);
  assert.equal(await page.locator('#track-filter option[value="Emeritus"]').count(), 0);
  assert.equal(await page.locator('#field-filter option[value="Others"]').count(), 0);
  const locationLabels = await page.locator('#location-filter option').allTextContents();
  assert.ok(locationLabels.every((label) => /\(\d+\)$/.test(label.trim())));
  assert.ok(locationLabels.every((label) => !label.endsWith('(0)')));
  await page.locator('#location-filter').selectOption('World');
  await page.locator('#field-filter').selectOption('Physics & Astronomy');
  await page.locator('#track-filter').selectOption('Emeritus');
  assert.equal(await page.locator('#location-filter option[value="US"]').count(), 0);
  await page.locator('#home-link').click();
  assert.equal(await page.locator('#location-filter').inputValue(), 'US');
  assert.equal(await page.locator('#field-filter').inputValue(), 'all');
  assert.equal(await page.locator('#track-filter').inputValue(), 'all');
  assert.ok((await page.locator('.entry').count()) > 0);
  for (const selector of ['.example-chip[data-field]', '.example-chip[data-track]', '.example-chip[data-loc]']) {
    await page.locator(selector).first().click();
    assert.ok((await page.locator('.entry').count()) > 0, `${selector} should always produce roster results`);
  }
  await page.goto(`${baseUrl}/?loc=Africa`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#location-filter').inputValue(), 'US');
  assert.ok((await page.locator('.entry').count()) > 0);
  await page.goto(`${baseUrl}/?loc=France&field=Law%20%26%20Public%20Affairs&track=Teaching`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#location-filter').inputValue(), 'France');
  assert.equal(await page.locator('#field-filter').inputValue(), 'all');
  assert.equal(await page.locator('#track-filter').inputValue(), 'all');
  assert.ok((await page.locator('.entry').count()) > 0);
  assert.deepEqual(runtimeErrors, []);
  await page.close();
});
