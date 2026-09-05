import { test, before, after } from 'node:test';
// Browser tests intentionally exercise the built application through Playwright.
import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { createRequire } from 'node:module';
import { get } from 'node:http';
import type { Browser, BrowserContext } from 'playwright';
import type { RosterEntry } from '../src/data.ts';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const port = 4179;
let server: ChildProcess;
let browser: Browser;
let context: BrowserContext;
let baseUrl: string;

async function waitForServer(url: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const status = await new Promise<number>((resolve, reject) => {
        const request = get(url, (response) => {
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
  baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(`${baseUrl}/`);
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
});

after(async () => {
  await context?.close();
  await browser?.close();
  server?.kill();
});

test('directory loads and searching changes the roster', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#query-inspector').count(), 0);
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
  await page.locator('#search').fill('University: Pennsylvania State University');
  await page.waitForTimeout(250);
  assert.ok(await page.locator('.entry').count() > 0);
  const pennStateMeta = await page.locator('.entry-meta').allTextContents();
  assert.ok(pennStateMeta.every((text) => text.includes('Penn State')));
  assert.ok(pennStateMeta.every((text) => !text.includes('Pennsylvania State University')));
  await page.locator('#search-scope-chip').click();
  await page.locator('#search').fill('ThanhVu');
  await page.waitForTimeout(250);
  assert.equal(await page.locator('.entry').count(), 1);
  assert.match(await page.locator('.entry-meta').textContent(), /George Mason Univ\./);
  assert.doesNotMatch(await page.locator('.entry-meta').textContent(), /George Mason University/);
  assert.match(await page.locator('.entry-details').textContent(), /MS: Penn State, 2006; Undergrad: Penn State, 2003/);
  await page.locator('#search').fill('Nguyen');
  await page.waitForTimeout(250);
  assert.ok((await page.locator('.entry').count()) > 0);
  const resultCount = await page.locator('#result-count').textContent();
  assert.match(resultCount, /people/);
  assert.match(resultCount, /in the World\.$/);
  assert.doesNotMatch(resultCount, /countr(?:y|ies)/);
  await page.locator('#search').fill('query plan');
  await page.locator('#search').press('Enter');
  assert.match(await page.locator('#command-output').textContent(), /query plan: mode=roster/);
  assert.match(await page.locator('#command-output').textContent(), /matches=\d+/);
  await page.close();
});

test('hidden roster shell searches, reads favorites, recalls commands, and restores focus', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const roster: RosterEntry[] = await page.evaluate(async () => (await fetch('/data.json')).json());
  const person = roster[0];
  await page.evaluate(id => localStorage.setItem('vietprofs:favorites', JSON.stringify([id])), person.id);
  const search = page.locator('#search');
  await search.fill('sudo vietprofs');
  await search.press('Enter');
  const shell = page.locator('.roster-shell');
  const input = shell.locator('input');
  const output = shell.locator('.shell-output');
  assert.equal(await shell.isVisible(), true);
  assert.equal(await shell.evaluate(el => getComputedStyle(el).color), 'rgb(113, 245, 154)');
  async function command(text: string) {
    await input.fill(text);
    await input.press('Enter');
  }
  await command('stats');
  assert.ok((await output.innerText()).includes(`${roster.length} roster entries`));
  await command('favorites');
  assert.equal(await output.locator('a').count(), 1);
  assert.equal(await output.locator('a').evaluate(el => (el as HTMLAnchorElement).pathname), `/people/${person.id}.html`);
  await command('open 0');
  assert.match(await output.innerText(), /Choose a valid number/);
  await command('clear');
  await command(`find ${person.name}`);
  assert.ok(await output.locator(`a[href$="/people/${person.id}.html"]`).count() > 0);
  await input.press('ArrowUp');
  assert.equal(await input.inputValue(), `find ${person.name}`);
  await input.press('ArrowDown');
  assert.equal(await input.inputValue(), '');
  await command('top countries');
  assert.match(await output.innerText(), /Top countries by roster entries/);
  await command('<img src=x onerror=alert(1)>');
  assert.equal(await output.locator('img').count(), 0);
  await input.press('Escape');
  await shell.waitFor({ state: 'detached' });
  assert.equal(await shell.count(), 0);
  assert.equal(await search.evaluate(el => document.activeElement === el), true);
  await page.setViewportSize({ width: 375, height: 667 });
  await search.fill('sudo vietprofs');
  await search.press('Enter');
  assert.equal(await shell.evaluate(el => el.scrollWidth <= el.clientWidth), true);
  await command('random');
  assert.equal(await output.locator('a').count(), 1);
  const href = await output.locator('a').getAttribute('href');
  await command('open 1');
  await page.waitForURL(new URL(href!, `${baseUrl}/`).href);
  await page.evaluate(() => localStorage.removeItem('vietprofs:favorites'));
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

test('pinned searches and recently viewed profiles stay in browser storage', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.removeItem('vietprofs:pinned-searches');
    localStorage.removeItem('vietprofs:recent-profiles');
  });
  const search = page.locator('#search');
  await search.fill('ThanhVu');
  await page.waitForTimeout(250);
  const pin = page.locator('#pin-search-btn');
  assert.equal(await pin.isDisabled(), false);
  await pin.click();
  const shelf = page.locator('#browser-shelf');
  const pinned = shelf.locator('.browser-shelf-group').filter({ hasText: 'Pinned:' }).locator('a');
  assert.equal(await pinned.count(), 1);
  assert.match(await pinned.getAttribute('href'), /q=ThanhVu/);

  const profileHref = await page.locator('.entry-name').first().getAttribute('href');
  await page.goto(new URL(profileHref!, `${baseUrl}/`).href, { waitUntil: 'networkidle' });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const recent = shelf.locator('.browser-shelf-group').filter({ hasText: 'Recent:' }).locator('a');
  assert.equal(await recent.count(), 1);
  assert.equal(await recent.getAttribute('href'), profileHref);
  await page.evaluate(() => {
    localStorage.removeItem('vietprofs:pinned-searches');
    localStorage.removeItem('vietprofs:recent-profiles');
  });
  await page.close();
});

test('keyboard navigation, query plan, and terminal commands work without leaving the directory', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.removeItem('vietprofs:favorites');
    localStorage.removeItem('vietprofs:crt');
  });
  await page.reload({ waitUntil: 'networkidle' });

  await page.keyboard.press('/');
  assert.equal(await page.locator('#search').evaluate((element) => element === document.activeElement), true);
  await page.locator('#search').fill('whoami');
  await page.locator('#search').press('Enter');
  assert.match(await page.locator('#command-output').textContent(), /community-maintained index/);
  assert.equal(await page.locator('#search').inputValue(), '');
  await page.locator('#search').fill('query plan');
  await page.locator('#search').press('Enter');
  assert.match(await page.locator('#command-output').textContent(), /query plan: .*matches=\d+/);

  await page.locator('#search').fill('theme crt');
  await page.locator('#search').press('Enter');
  assert.equal(await page.locator('html').evaluate((element) => element.classList.contains('crt-mode')), true);
  await page.locator('#search').blur();
  await page.keyboard.press('j');
  const selected = page.locator('.entry-keyboard-selected');
  assert.equal(await selected.count(), 1);
  await page.keyboard.press('f');
  assert.equal(await selected.locator('.favorite-toggle').getAttribute('aria-pressed'), 'true');
  await page.close();
});

test('undergraduate institution keyword prefix filters the roster and persists in the URL', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const search = page.locator('#search');

  await search.fill('Ugrad: Boise State University');
  await page.waitForFunction(() => new URL(window.location.href).searchParams.get('q') === 'Ugrad: Boise State University');
  assert.match(await page.locator('#search-scope-chip').innerText(), /Ugrad/);
  assert.equal(await search.inputValue(), 'Boise State University');

  const expectedCount = await page.evaluate(async () => (
    await (await fetch('/data.json')).json()
  ).filter((person: RosterEntry) => person.undergradInstitution?.includes('Boise State University')).length);
  assert.ok(expectedCount > 0);
  await page.waitForFunction((count) => document.querySelectorAll('.entry').length === count, expectedCount);
  assert.equal(await page.locator('.entry').count(), expectedCount);
  assert.ok((await page.locator('.entry-details').allTextContents()).every((text) => text.includes('Undergrad: Boise State')));

  await page.reload({ waitUntil: 'networkidle' });
  assert.match(await page.locator('#search-scope-chip').innerText(), /Ugrad/);
  assert.equal(await search.inputValue(), 'Boise State University');
  assert.equal(await page.locator('.entry').count(), expectedCount);
  await page.close();
});

test('awards keyword becomes a removable Honors search scope chip', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const search = page.locator('#search');
  const chip = page.locator('#search-scope-chip');

  await search.fill('Awards: NSF CAREER Award');
  await page.waitForFunction(() => new URL(window.location.href).searchParams.get('q') === 'Honors: NSF CAREER Award');
  assert.match(await chip.innerText(), /🏅 Honors/);
  assert.equal(await search.inputValue(), 'NSF CAREER Award');
  assert.ok(await page.locator('.entry').count() > 0);

  await chip.click();
  assert.equal(await chip.isHidden(), true);
  assert.equal(await search.inputValue(), 'NSF CAREER Award');
  await page.waitForFunction(() => new URL(window.location.href).searchParams.get('q') === 'NSF CAREER Award');
  await page.close();
});

test('mobile search input uses the full control width', async () => {
  const page = await context.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  const searchBox = await page.locator('.search-box').boundingBox();
  const search = await page.locator('#search').boundingBox();
  const helpBtn = await page.locator('#search-help-btn').boundingBox();
  assert.ok(searchBox && search && helpBtn);
  assert.ok(search.width >= searchBox.width * 0.98);
  assert.ok(helpBtn.y >= search.y + search.height);

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
  const assertTapTargets = async (selector: string) => {
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
  await assertTapTargets('.paper-link, .submission-link, .example-chip, .entry-name, .personal-site-link, .scholar-link, .profile-link, .favorite-toggle, .search-input, .search-help-btn, .field-select');
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
  await assertTapTargets('.eyebrow, .profile-actions a, .links a');
  await page.close();
});

test('directory lazy loads entries in batches of 50 as user scrolls', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.entry').count(), 50);
  assert.equal(await page.locator('#roster-sentinel').count(), 1);

  // Scroll down to trigger next batch
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForFunction(() => document.querySelectorAll('.entry').length >= 100);
  assert.equal(await page.locator('.entry').count(), 100);
  await page.close();
});

test('every roster card exposes its official profile link', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  while (await page.locator('#roster-sentinel').count() > 0) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(50);
  }
  const entryCount = await page.locator('.entry').count();
  const profileLinks = page.locator('.profile-link');
  assert.equal(await profileLinks.count(), entryCount);
  assert.ok(await profileLinks.evaluateAll((links: HTMLAnchorElement[]) => links.every((link) => (
    /^Official (university|institution) profile$/.test(link.getAttribute('title') || '')
      && / official (university|institution) profile$/.test(link.getAttribute('aria-label') || '')
      && /^https?:\/\//.test(link.href)
  ))));
  const [actualUrls, expectedUrls] = await Promise.all([
    profileLinks.evaluateAll((links: HTMLAnchorElement[]) => links.map((link) => link.href).sort()),
    page.evaluate(async () => (await (await fetch('/data.json')).json()).map((person: RosterEntry) => new URL(person.profileUrl).href).sort()),
  ]);
  assert.deepEqual(actualUrls, expectedUrls);
  await page.close();
});

test('favorites stay at the top while the directory can be sorted', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('vietprofs:favorites'));
  await page.reload({ waitUntil: 'networkidle' });
  const first = page.locator('.entry').first();
  const name = (await first.locator('.entry-name').textContent())?.trim();
  const star = first.locator('.favorite-toggle');
  assert.equal(await star.getAttribute('aria-pressed'), 'false');
  await star.click();
  assert.equal((await first.locator('.entry-name').textContent())?.trim(), name);
  assert.equal(await star.getAttribute('aria-pressed'), 'true');

  await page.locator('#sort-order').selectOption('recent');
  await page.waitForFunction(() => new URL(window.location.href).searchParams.get('sort') === 'recent');
  assert.equal((await page.locator('.entry-name').first().textContent())?.trim(), name);

  await page.locator('#sort-order').selectOption('last-name');
  await page.waitForFunction(() => new URL(window.location.href).searchParams.get('sort') === 'last-name');
  assert.equal((await page.locator('.entry-name').first().textContent())?.trim(), name);
  await page.close();
});

test('local faculty portraits render and load', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const portrait = page.locator('.entry-portrait:not(.entry-portrait-placeholder)').first();
  await portrait.waitFor();
  assert.match(await portrait.getAttribute('src'), /\/portraits\/.*\.webp$/);
  assert.ok(await portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0));
  await page.close();
});

test('entries without a portrait fall back to the graduation-cap placeholder', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const placeholder = page.locator('.entry-portrait-placeholder').first();
  await placeholder.waitFor();
  assert.match(await placeholder.getAttribute('src'), /\/default-portrait\.svg$/);
  assert.equal(await page.locator('.entry-portrait').count(), await page.locator('.entry').count());
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
  const tan: RosterEntry = await page.evaluate(async () => (await (await fetch('/data.json')).json()).find((person: RosterEntry) => person.name === 'Tan Minh Nguyen'));
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
  // The bulk/notes box stays visible for updates too — it doubles as a freeform notes field —
  // but the "paste a link" help text is add-mode-only.
  assert.equal(await page.locator('#add-mode-section').isVisible(), true);
  assert.equal(await page.locator('#bulkInput-label').innerText(), 'Notes');
  assert.equal(await page.locator('#add-mode-details-help').isVisible(), false);
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
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const fieldOptions = page.locator('#field-filter option');
  const trackOptions = page.locator('#track-filter option');
  const fieldLabels = await fieldOptions.evaluateAll((options: HTMLOptionElement[]) =>
    options.filter((option) => option.value !== 'interesting').map((option) => option.textContent),
  );
  const trackLabels = await trackOptions.allTextContents();
  assert.ok(fieldLabels.every((text) => text.trim().length > 0));
  assert.ok(trackLabels.every((text) => text.trim().length > 0));
  assert.equal(await fieldOptions.filter({ hasText: 'Health' }).count(), 1);
  assert.equal(await fieldOptions.filter({ hasText: 'Law' }).count(), 1);
  assert.equal(await trackOptions.filter({ hasText: 'Tenure-line' }).count(), 1);
  assert.equal(await page.locator('#field-filter option[value="Earth & Environmental Sciences"]').count(), 1);
  await page.locator('#field-filter').selectOption('Biological & Biomedical Sciences');
  assert.ok((await page.locator('.entry').count()) > 0);
  assert.equal(await page.locator('#track-filter option[value="Teaching"]').count(), 1);
  assert.equal(await page.locator('#track-filter option[value="Emeritus"]').count(), 1);
  assert.equal(await page.locator('#field-filter option[value="Earth & Environmental Sciences"]').count(), 1);
  const locationLabels = await page.locator('#location-filter option').allTextContents();
  assert.ok(locationLabels.every((label) => label.trim().length > 0));
  await page.locator('#location-filter').selectOption('World');
  await page.locator('#field-filter').selectOption('Physics & Astronomy');
  await page.locator('#track-filter').selectOption('Emeritus');
  assert.equal(await page.locator('#field-filter').evaluate((el) => el.classList.contains('is-active')), true);
  assert.equal(await page.locator('#track-filter').evaluate((el) => el.classList.contains('is-active')), true);
  assert.equal(await page.locator('#location-filter').evaluate((el) => el.classList.contains('is-active')), false);
  assert.equal(await page.locator('#location-filter option[value="US"]').count(), 1);
  await page.locator('#home-link').click();
  assert.equal(await page.locator('#location-filter').inputValue(), 'World');
  assert.equal(await page.locator('#field-filter').inputValue(), 'all');
  assert.equal(await page.locator('#track-filter').inputValue(), 'all');
  assert.equal(await page.locator('#field-filter').evaluate((el) => el.classList.contains('is-active')), false);
  assert.equal(await page.locator('#track-filter').evaluate((el) => el.classList.contains('is-active')), false);
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
  await page.locator('.example-chip[data-fact]').click();
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
  await page.evaluate((profileId) => {
    localStorage.setItem('vietprofs:favorites', JSON.stringify([profileId]));
  }, id);
  await page.goto(`${baseUrl}/people/${id}.html`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('link[href="../profile.css"]').count(), 1);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), 'light dark');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(21, 24, 28)');
  assert.equal(await page.locator('.man-page').count(), 1);
  assert.equal(await page.locator('.man-section').filter({ hasText: 'SYNOPSIS' }).count(), 1);
  assert.match(await page.locator('.record-id').textContent(), /^vp-\d+$/);
  assert.equal(await page.locator('.raw-record').count(), 1);
  assert.equal(await page.locator('.profile-actions .submission-link').count(), 1);
  assert.equal(await page.locator('.name-heading .profile-actions').count(), 1);
  const profileStar = page.locator('.profile-actions .favorite-toggle');
  assert.equal(await profileStar.getAttribute('aria-pressed'), 'true');
  await profileStar.click();
  assert.equal(await profileStar.getAttribute('aria-pressed'), 'false');
  await page.close();
});
