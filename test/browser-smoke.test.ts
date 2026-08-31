import { test, before, after } from 'node:test';
// Browser tests intentionally exercise the built application through Playwright.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { get } from 'node:https';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const port = 4179;
let server;
let browser;
let context;
let baseUrl;

async function waitForServer(url) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const status = await new Promise<number>((resolve, reject) => {
        const request = get(url, { rejectUnauthorized: false }, (response) => {
          response.resume();
          resolve(response.statusCode ?? 0);
        });
        request.once('error', reject);
      });
      if (status >= 200 && status < 500) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

before(async () => {
  server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)], {
    stdio: 'ignore',
  });
  baseUrl = `https://127.0.0.1:${port}`;
  await waitForServer(`${baseUrl}/`);
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ ignoreHTTPSErrors: true });
});

after(async () => {
  await context?.close();
  await browser?.close();
  server?.kill();
});

test('directory loads and searching changes the roster', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const initial = await page.locator('.entry').count();
  assert.ok(initial > 0);
  assert.equal(await page.locator('.entry-updated').count(), initial);
  assert.equal(await page.locator('.entry-name-row > .entry-updated').count(), initial);
  const personalSiteLinks = page.locator('.personal-site-link');
  assert.ok(await personalSiteLinks.count() > 0);
  assert.match(await personalSiteLinks.first().getAttribute('href'), /^https?:\/\//);
  assert.equal(await personalSiteLinks.first().getAttribute('title'), 'Personal or lab website');
  const updated = page.locator('.entry-updated').first();
  assert.match(await updated.textContent(), /^Updated \d{1,2}\/\d{1,2}\/\d{2}$/);
  assert.match(await updated.getAttribute('datetime'), /^\d{4}-\d{2}-\d{2}T.*Z$/);
  const multiCredentialRow = page.locator('.entry-details').filter({ hasText: ';' }).first();
  await multiCredentialRow.waitFor();
  assert.equal(await multiCredentialRow.locator('xpath=..').locator('.entry-details').count(), 1);
  await page.locator('#search').fill('Thanh');
  const searchSuggestions = page.locator('#search-suggestion-panel .search-suggestion');
  await searchSuggestions.first().waitFor();
  assert.ok(await searchSuggestions.count() > 0);
  await page.locator('#search').press('Escape');
  assert.equal(await page.locator('#search-suggestion-panel').isHidden(), true);
  await page.locator('#search-scope').selectOption('university');
  await page.locator('#search').fill('Pennsylvania State University');
  await page.waitForTimeout(250);
  assert.ok(await page.locator('.entry').count() > 0);
  const pennStateMeta = await page.locator('.entry-meta').allTextContents();
  assert.ok(pennStateMeta.every((text) => text.includes('Penn State')));
  assert.ok(pennStateMeta.every((text) => !text.includes('Pennsylvania State University')));
  await page.locator('#search-scope').selectOption('all');
  await page.locator('#search').fill('ThanhVu');
  await page.waitForTimeout(250);
  assert.equal(await page.locator('.entry').count(), 1);
  assert.match(await page.locator('.entry-meta').textContent(), /George Mason Univ\./);
  assert.doesNotMatch(await page.locator('.entry-meta').textContent(), /George Mason University/);
  assert.match(await page.locator('.entry-details').textContent(), /MS: Penn State, 2006; Undergrad: Penn State, 2003/);
  await page.locator('#search').fill('Nguyen');
  await page.waitForTimeout(250);
  assert.ok((await page.locator('.entry').count()) > 0);
  assert.match(await page.locator('#result-count').textContent(), /professors?/);
  await page.close();
});

test('search suggestions remain visible while results update', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const search = page.locator('#search');
  const panel = page.locator('#search-suggestion-panel');
  const suggestions = panel.locator('.search-suggestion');

  assert.equal(await search.getAttribute('list'), null);
  await search.fill('Thanh');
  await suggestions.first().waitFor();
  assert.equal(await panel.isHidden(), false);
  assert.equal(await search.getAttribute('aria-expanded'), 'true');

  // The debounced roster update must not close or recreate the suggestion panel.
  await page.waitForTimeout(300);
  assert.equal(await panel.isHidden(), false);
  assert.ok(await suggestions.count() > 0);

  await page.close();
});

test('undergraduate institution scope filters the roster and persists in the URL', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const scope = page.locator('#search-scope');
  const search = page.locator('#search');

  await scope.selectOption('undergrad');
  assert.equal(await scope.locator('option:checked').textContent(), 'Ugrad Inst.');
  await search.fill('Boise State University');
  await page.waitForFunction(() => new URL(window.location.href).searchParams.get('scope') === 'undergrad');

  const expectedCount = await page.evaluate(async () => (
    await (await fetch('/data.json')).json()
  ).filter((person) => person.undergradInstitution?.includes('Boise State University')).length);
  assert.ok(expectedCount > 0);
  await page.waitForFunction((count) => document.querySelectorAll('.entry').length === count, expectedCount);
  assert.equal(await page.locator('.entry').count(), expectedCount);
  assert.ok((await page.locator('.entry-details').allTextContents()).every((text) => text.includes('Undergrad: Boise State')));

  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await scope.inputValue(), 'undergrad');
  assert.equal(await search.inputValue(), 'Boise State University');
  assert.equal(await page.locator('.entry').count(), expectedCount);
  await page.close();
});

test('mobile search input uses the full control width', async () => {
  const page = await context.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  const searchBox = await page.locator('.search-box').boundingBox();
  const scope = await page.locator('#search-scope').boundingBox();
  const search = await page.locator('#search').boundingBox();
  assert.ok(searchBox && scope && search);
  assert.ok(search.width >= searchBox.width * 0.98);
  assert.ok(scope.width >= searchBox.width * 0.98);
  assert.ok(search.y >= scope.y + scope.height);

  await page.locator('#search').fill('Thanh');
  const suggestions = page.locator('#search-suggestion-panel');
  await suggestions.waitFor();
  const panel = await suggestions.boundingBox();
  assert.ok(panel);
  assert.ok(panel.y >= search.y + search.height);
  await page.close();
});

test('mobile pages avoid horizontal overflow and provide usable tap targets', async () => {
  const page = await context.newPage();
  const assertNoOverflow = async () => {
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), await page.evaluate(() => document.documentElement.clientWidth));
  };
  const assertTapTargets = async (selector) => {
    const undersized = await page.locator(selector).evaluateAll((elements) => elements
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && (rect.width < 44 || rect.height < 44);
      })
      .map((element) => ({
        selector: `${element.tagName.toLowerCase()}#${element.id}.${String(element.className).replace(/\s+/g, '.')}`,
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height,
      })));
    assert.deepEqual(undersized, []);
  };

  for (const width of [320, 375, 430]) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await assertNoOverflow();
    await assertTapTargets('.paper-link, .favorites-link, .submission-link, .example-chip, .entry-name, .personal-site-link, .scholar-link, .profile-link, .favorite-toggle, .search-scope, .search-input, .field-select');
  }

  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto(`${baseUrl}/?view=insights`, { waitUntil: 'networkidle' });
  await assertNoOverflow();
  await assertTapTargets('.ranked-item');

  await page.goto(`${baseUrl}/submit.html`, { waitUntil: 'networkidle' });
  await page.locator('#add-mode-details-toggle').click();
  await assertNoOverflow();
  await assertTapTargets(".form-section input[type='text'], .form-section input[type='url'], .form-section input[type='number'], .form-section select, .form-section textarea, .radio-row, .link-button, .info-icon");
  await page.locator('.info-icon').click();
  assert.equal(await page.locator('.info-icon').evaluate((element) => getComputedStyle(element, '::after').visibility), 'visible');
  await assertNoOverflow();

  await page.goto(`${baseUrl}/people/vp-0242.html`, { waitUntil: 'networkidle' });
  await assertNoOverflow();
  await assertTapTargets('.eyebrow, .edit-link, .links a');
  await page.close();
});

test('every roster card exposes its official profile link', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const entryCount = await page.locator('.entry').count();
  const profileLinks = page.locator('.profile-link');
  assert.equal(await profileLinks.count(), entryCount);
  assert.ok(await profileLinks.evaluateAll((links) => links.every((link) => (
    link.getAttribute('title') === 'Official university profile'
      && link.getAttribute('aria-label')?.endsWith(' official university profile')
      && /^https?:\/\//.test(link.href)
  ))));
  const [actualUrls, expectedUrls] = await Promise.all([
    profileLinks.evaluateAll((links) => links.map((link) => link.href).sort()),
    page.evaluate(async () => (await (await fetch('/data.json')).json()).map((person) => new URL(person.profileUrl).href).sort()),
  ]);
  assert.deepEqual(actualUrls, expectedUrls);
  await page.close();
});

test('starring a professor lists them on the favorites page', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('vietprofs:favorites'));
  await page.reload({ waitUntil: 'networkidle' });
  const first = page.locator('.entry').first();
  const name = (await first.locator('.entry-name').textContent())?.trim();
  const star = first.locator('.favorite-toggle');
  assert.equal(await star.getAttribute('aria-pressed'), 'false');
  await star.click();
  assert.equal(await star.getAttribute('aria-pressed'), 'true');
  await page.locator('.favorites-link').click();
  await page.waitForURL(/favorites\.html/);
  await page.locator('.entry').first().waitFor();
  assert.equal(await page.locator('.entry').count(), 1);
  assert.equal((await page.locator('.entry-name').textContent())?.trim(), name);
  await page.locator('.favorite-toggle').click();
  await page.locator('.empty-state').waitFor();
  assert.equal(await page.locator('.entry').count(), 0);
  assert.match(await page.locator('.empty-state').textContent(), /Star someone on the directory/);
  await page.locator('.back-link').click();
  await page.waitForURL((url) => !url.pathname.endsWith('/favorites.html'));
  await page.locator('.roster .entry').first().waitFor();
  await page.close();
});

test('local faculty portraits render and load', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const portrait = page.locator('.entry-portrait').first();
  await portrait.waitFor();
  assert.match(await portrait.getAttribute('src'), /\/portraits\/.*\.webp$/);
  assert.ok(await portrait.evaluate((image) => image.complete && image.naturalWidth > 0));
  await page.close();
});

test('filters and submit-form suggestions work', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.locator('#location-filter').selectOption('World');
  assert.ok((await page.locator('.entry').count()) > 0);
  await page.goto(`${baseUrl}/submit.html`, { waitUntil: 'networkidle' });
  await page.locator('input[name="purpose"][value="update"]').check();
  await page.locator('#name').fill('Nguyen');
  assert.ok((await page.locator('.correction-suggestion').count()) > 0);
  await page.locator('.correction-suggestion').first().click();
  assert.notEqual(await page.locator('#profileUrl').inputValue(), '');
  const tan = await page.evaluate(async () => (await (await fetch('/data.json')).json()).find((person) => person.name === 'Tan Minh Nguyen'));
  assert.match(tan.id, /^vp-\d+$/);
  await page.goto(`${baseUrl}/submit.html?edit=${encodeURIComponent(tan.id)}`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#name').inputValue(), 'Tan Minh Nguyen');
  assert.equal(await page.locator('#university').inputValue(), 'National University of Singapore');
  assert.equal(await page.locator('#submit-form').getAttribute('data-editing-id'), tan.id);
  assert.match(await page.locator('#name-match-notice').textContent(), new RegExp(`Editing existing entry\\s+${tan.id}`));
  assert.equal(await page.locator('#name-match-notice a').getAttribute('href'), `./people/${tan.id}.html`);
  await page.locator('#name').fill('Corrected Tan Minh Nguyen');
  assert.equal(await page.locator('#submit-form').getAttribute('data-editing-id'), tan.id);
  await page.goto(`${baseUrl}/submit.html`, { waitUntil: 'networkidle' });
  await page.locator('input[name="purpose"][value="update"]').check();
  await page.locator('#name').fill('Tan Minh Nguyen');
  assert.equal(await page.locator('#submit-form').getAttribute('data-editing-id'), tan.id);
  await page.locator('#name').fill('Brand New Person');
  assert.equal(await page.locator('#submit-form').getAttribute('data-editing-id'), null);
  assert.equal(await page.locator('#profileUrl').inputValue(), '');
  assert.equal(await page.locator('#name-match-notice').isHidden(), true);
  await page.close();
});

test('submit form defaults to bulk add mode and toggles to single-entry details', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/submit.html`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('input[name="purpose"][value="add"]').isChecked(), true);
  assert.equal(await page.locator('#add-mode-section').isVisible(), true);
  assert.equal(await page.locator('#required-section').isVisible(), false);
  await page.locator('#bulkInput').fill('Jane T. Nguyen — https://cs.example.edu/~jnguyen');
  await page.locator('#add-mode-details-toggle').click();
  assert.equal(await page.locator('#required-section').isVisible(), true);
  assert.equal(await page.locator('#name').inputValue(), '');
  await page.locator('input[name="purpose"][value="update"]').check();
  assert.equal(await page.locator('#add-mode-section').isVisible(), false);
  assert.equal(await page.locator('#required-section').isVisible(), true);
  await page.close();
});

test('stale zero-result field URLs fall back to the roster', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?field=Others`, { waitUntil: 'networkidle' });
  assert.ok((await page.locator('.entry').count()) > 0);
  await page.close();
});

test('filter choices stay stable and stale filters recover', async () => {
  const page = await context.newPage();
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
  assert.equal(await page.locator('#field-filter option[value="Others"]').count(), 1);
  await page.locator('#field-filter').selectOption('Biological & Biomedical Sciences');
  assert.ok((await page.locator('.entry').count()) > 0);
  assert.equal(await page.locator('#track-filter option[value="Teaching"]').count(), 1);
  assert.equal(await page.locator('#track-filter option[value="Emeritus"]').count(), 1);
  assert.equal(await page.locator('#field-filter option[value="Others"]').count(), 1);
  const locationLabels = await page.locator('#location-filter option').allTextContents();
  assert.ok(locationLabels.every((label) => /\(\d+\)$/.test(label.trim())));
  assert.ok(locationLabels.every((label) => !label.endsWith('(0)')));
  await page.locator('#location-filter').selectOption('World');
  await page.locator('#field-filter').selectOption('Physics & Astronomy');
  await page.locator('#track-filter').selectOption('Emeritus');
  assert.equal(await page.locator('#location-filter option[value="US"]').count(), 1);
  await page.locator('#home-link').click();
  assert.equal(await page.locator('#location-filter').inputValue(), 'World');
  assert.equal(await page.locator('#field-filter').inputValue(), 'all');
  assert.equal(await page.locator('#track-filter').inputValue(), 'all');
  assert.ok((await page.locator('.entry').count()) > 0);
  await page.goto(`${baseUrl}/?state=Vermont&loc=US`, { waitUntil: 'networkidle' });
  assert.match(page.url(), /state=Vermont/);
  await page.locator('#home-link').click();
  assert.doesNotMatch(page.url(), /state=/);
  await page.goto(`${baseUrl}/?state=Vermont&loc=US`, { waitUntil: 'networkidle' });
  await page.locator('#location-filter').selectOption('Europe');
  assert.doesNotMatch(page.url(), /state=/);
  for (const selector of ['.example-chip[data-field]', '.example-chip[data-loc]']) {
    await page.locator(selector).first().click();
    assert.ok((await page.locator('.entry').count()) > 0, `${selector} should always produce roster results`);
  }
  await page.goto(`${baseUrl}/?loc=Africa`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#location-filter').inputValue(), 'World');
  assert.ok((await page.locator('.entry').count()) > 0);
  await page.goto(`${baseUrl}/?loc=France&field=Law%20%26%20Public%20Affairs&track=Teaching`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#location-filter').inputValue(), 'France');
  assert.equal(await page.locator('#field-filter').inputValue(), 'all');
  assert.equal(await page.locator('#track-filter').inputValue(), 'all');
  assert.ok((await page.locator('.entry').count()) > 0);
  assert.deepEqual(runtimeErrors, []);
  await page.close();
});

test('interesting view shows World alone, or the selected region plus World', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?loc=World`, { waitUntil: 'networkidle' });
  await page.locator('.example-chip[data-insights]').click();
  assert.equal(await page.locator('.insights-section-block').count(), 1);
  await page.locator('#location-filter').selectOption('France');
  assert.equal(await page.locator('.insights-section-block').count(), 2);
  assert.equal(await page.locator('.insights-badge').filter({ hasText: 'France' }).count(), 1);
  assert.equal(await page.locator('.insights-badge').filter({ hasText: 'World' }).count(), 1);
  await page.close();
});

test('profile pages honor dark mode through the shared stylesheet', async () => {
  const page = await context.newPage();
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const id = await page.evaluate(async () => (await (await fetch('/data.json')).json())[0].id);
  await page.goto(`${baseUrl}/people/${id}.html`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('link[href="../profile.css"]').count(), 1);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), 'light dark');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(21, 24, 28)');
  await page.close();
});
