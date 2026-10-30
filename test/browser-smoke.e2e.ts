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
const AxeBuilder = require('@axe-core/playwright').default || require('@axe-core/playwright');
const port = 4179;
let server: ChildProcess;
let browser: Browser;
let context: BrowserContext;
let baseUrl: string;

type TextSource = { textContent(): Promise<string | null>; getAttribute(name: string): Promise<string | null> };

async function textOf(locator: TextSource): Promise<string> {
  const value = await locator.textContent();
  assert.notEqual(value, null, 'expected the locator to match an element with text');
  return value ?? '';
}

async function attrOf(locator: TextSource, name: string): Promise<string> {
  const value = await locator.getAttribute(name);
  assert.notEqual(value, null, `expected the matched element to have a ${name} attribute`);
  return value ?? '';
}

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
  assert.equal(await page.locator('.entry-updated').count(), 0);
  const personalSiteLinks = page.locator('.personal-site-link');
  assert.ok(await personalSiteLinks.count() > 0);
  assert.match(await attrOf(personalSiteLinks.first(), 'href'), /^https?:\/\//);
  assert.equal(await personalSiteLinks.first().getAttribute('title'), 'Website');
  assert.equal(await page.locator('#site-updated').count(), 0);
  assert.match(await page.locator('#search').getAttribute('placeholder') ?? '', /^Search [\d,]+ people/);
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
  assert.match(await textOf(page.locator('.entry-meta')), /George Mason Univ\./);
  assert.doesNotMatch(await textOf(page.locator('.entry-meta')), /George Mason University/);
  assert.match(await textOf(page.locator('.entry-details')), /MS: Penn State; Undergrad: Penn State, 2003/);
  await page.locator('#search').fill('Nguyen');
  await page.waitForTimeout(250);
  assert.ok((await page.locator('.entry').count()) > 0);
  const resultCount = await textOf(page.locator('#result-count'));
  assert.match(resultCount, /people/);
  assert.match(resultCount, /in the World\.$/);
  assert.doesNotMatch(resultCount, /countr(?:y|ies)/);
  await page.locator('#search').fill('query plan');
  await page.locator('#search').press('Enter');
  assert.match(await textOf(page.locator('#command-output')), /query plan: mode=roster/);
  assert.match(await textOf(page.locator('#command-output')), /matches=\d+/);
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

test('clicking a search suggestion fills the search input', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const search = page.locator('#search');
  const panel = page.locator('#search-suggestion-panel');
  const suggestion = panel.locator('.search-suggestion').first();

  await search.fill('Thanh');
  await suggestion.waitFor();
  const value = await suggestion.textContent();
  await suggestion.click();

  assert.equal(await search.inputValue(), value);
  assert.equal(await panel.isHidden(), true);
  await page.close();
});

test('recently viewed profiles stay in browser storage', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('vietprofs:recent-profiles'));
  assert.equal(await page.locator('#pin-search-btn').count(), 0);
  const search = page.locator('#search');
  await search.fill('ThanhVu');
  await page.waitForTimeout(250);
  const shelf = page.locator('#browser-shelf');

  const profileHref = await page.locator('.entry-name').first().getAttribute('href');
  await page.goto(new URL(profileHref!, `${baseUrl}/`).href, { waitUntil: 'networkidle' });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const recent = shelf.locator('.browser-shelf-group').filter({ hasText: 'Recent' }).locator('a');
  assert.equal(await recent.count(), 1);
  assert.equal(await recent.getAttribute('href'), profileHref);
  const clearRecent = shelf.locator('button[aria-label="Clear recent profiles"]');
  assert.equal(await clearRecent.count(), 1);
  await clearRecent.click();
  assert.equal(await shelf.isHidden(), true);
  await page.evaluate(() => localStorage.removeItem('vietprofs:recent-profiles'));
  await page.close();
});

test('keyboard navigation and the query plan command work without leaving the directory', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.removeItem('vietprofs:favorites');
  });
  await page.reload({ waitUntil: 'networkidle' });

  await page.keyboard.press('/');
  assert.equal(await page.locator('#search').evaluate((element) => element === document.activeElement), true);
  await page.locator('#search').fill('query plan');
  await page.locator('#search').press('Enter');
  assert.match(await textOf(page.locator('#command-output')), /query plan: .*matches=\d+/);
  assert.equal(await page.locator('#search').inputValue(), '');
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
  const shell = await page.locator('.search-input-shell').boundingBox();
  const search = await page.locator('#search').boundingBox();
  const helpBtn = await page.locator('#search-help-btn').boundingBox();
  assert.ok(searchBox && shell && search && helpBtn);
  assert.ok(shell.width >= searchBox.width * 0.98);
  // The help button sits inside the search field, to the right of the input.
  assert.ok(helpBtn.x >= search.x + search.width - 1);
  assert.ok(helpBtn.x + helpBtn.width <= shell.x + shell.width + 1);
  assert.ok(helpBtn.y >= shell.y - 1 && helpBtn.y + helpBtn.height <= shell.y + shell.height + 1);

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
        // getClientRects() is empty when the element or an ancestor (e.g. a `hidden` form
        // section) isn't rendered at all, so there is nothing to tap.
        return element.getClientRects().length > 0 && style.display !== 'none' && style.visibility !== 'hidden' && (rect.width < 44 || rect.height < 44);
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
  await assertTapTargets('.add-fab, .example-chip, .entry-name, .personal-site-link, .scholar-link, .profile-link, .favorite-toggle, .search-input, .search-help-btn, .field-select');
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
  await assertTapTargets('.man-running-brand, .profile-actions a, .links a');
  await page.close();
});

test('directory renders the complete result list without lazy-scroll batches', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const expected = await page.evaluate(async () => (await (await fetch('/data.json')).json()).length);
  assert.equal(await page.locator('.entry').count(), expected);
  assert.equal(await page.locator('#roster-sentinel').count(), 0);
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
    /^(Official (university|institution) profile|Verification source)$/.test(link.getAttribute('title') || '')
      && / (official (university|institution) profile|verification source)$/.test(link.getAttribute('aria-label') || '')
      && /^https?:\/\//.test(link.href)
  ))));
  const [actualUrls, expectedUrls] = await Promise.all([
    profileLinks.evaluateAll((links: HTMLAnchorElement[]) => links.map((link) => link.href).sort()),
    page.evaluate(async () => (await (await fetch('/data.json')).json()).map((person: RosterEntry) => new URL(person.profileUrl ?? '').href).sort()),
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

  await page.locator('#sort-order').selectOption('vp-newest');
  await page.waitForFunction(() => new URL(window.location.href).searchParams.get('sort') === 'vp-newest');
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
  assert.match(await attrOf(portrait, 'src'), /\/portraits\/.*\.webp$/);
  assert.ok(await portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0));
  await page.close();
});

test('entries without a portrait fall back to the graduation-cap placeholder', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const placeholder = page.locator('.entry-portrait-placeholder').first();
  await placeholder.waitFor();
  assert.match(await attrOf(placeholder, 'src'), /\/default-portrait\.svg$/);
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
  assert.match(await textOf(page.locator('#name-match-notice')), new RegExp(`Editing existing entry\\s+${tan.id}`));
  assert.equal(await page.locator('#name-match-notice a').getAttribute('href'), `./people/${tan.id}.html`);
  assert.equal(await page.locator('#selfSubmission').isChecked(), false);
  await page.locator('#name').fill('Corrected Tan Minh Nguyen');
  assert.equal(await page.locator('#submit-form').getAttribute('data-editing-id'), tan.id);
  // Profile pages link here with ?self=1 ("Is this you?") and ?missing=… (fields the entry lacks).
  const sparse: RosterEntry = await page.evaluate(async () => (await (await fetch('/data.json')).json()).find((person: RosterEntry) => !person.scholarUrl && !person.mdInstitution));
  await page.goto(`${baseUrl}/submit.html?edit=${encodeURIComponent(sparse.id)}&self=1&missing=scholarUrl,bogus`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#selfSubmission').isChecked(), true);
  assert.equal(await page.locator('.form-section.field-missing').count(), 1);
  assert.equal(await page.locator('.form-section.field-missing #scholarUrl').count(), 1);
  assert.match(await textOf(page.locator('#name-match-notice')), /Not on record yet: Google Scholar/);
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
  // Update order: Required, then the notes, then Optional details. Back to the top for adding.
  const order = () => page.evaluate(() => [...document.querySelectorAll('#submit-form > section:not([hidden]), #submit-form > details:not([hidden])')].map((el) => el.id).filter(Boolean));
  assert.deepEqual(await order(), ['required-section', 'add-mode-section', 'optional-details']);
  assert.equal(await page.locator('#add-mode-heading').innerText(), 'WHAT CHANGED');
  await page.locator('input[name="purpose"][value="add"]').check();
  assert.deepEqual((await order()).slice(0, 2), ['add-mode-section', 'required-section']);
  await page.close();
});

test('stale zero-result field URLs fall back to the roster', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?field=Others`, { waitUntil: 'networkidle' });
  assert.ok((await page.locator('.entry').count()) > 0);
  await page.close();
});

test('the + button opens the form and the header links switch views in place', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.header-links, .quick-menu').count(), 0);
  assert.equal(await page.locator('.add-fab').getAttribute('href'), 'submit.html');
  assert.equal(await page.locator('.add-fab').getAttribute('aria-label'), 'Add or update info');
  const nav = page.locator('.site-nav');
  const labels = await nav.locator(':scope > a, .share-toggle').evaluateAll((links) => links.map((link) => link.getAttribute('aria-label')));
  assert.deepEqual(labels, ['Diaspora Insights & Pathways', 'Academic Connections', 'Data Health & Completeness', 'Read the paper (PDF)', 'Share']);
  assert.equal(await page.locator('#institution-type-filter').count(), 0);
  assert.deepEqual(await page.locator('.controls #sort-order option').allInnerTexts(), ['Random order', 'Most recently added', 'Last name', 'First name']);
  const chips = page.locator('.example-chip');
  assert.equal(await chips.count(), 4);
  for (const text of await chips.allInnerTexts()) assert.doesNotMatch(text, /\p{Extended_Pictographic}/u);
  assert.doesNotMatch(await page.locator('#field-filter option:checked').innerText(), /\(\d/);
  assert.match(await page.locator('#field-filter option').nth(1).innerText(), /\(\d[\d,]*\)$/);
  const before = page.url();
  await nav.locator('a[data-view="insights"]').click();
  assert.match(page.url(), /view=insights/);
  assert.notEqual(page.url(), before);
  assert.equal(await page.locator('.entry').count(), 0);
  await nav.locator('a[data-view="health"]').click();
  assert.match(page.url(), /view=health/);
  await page.close();
});

test('combined field and location filters link to their static intersection hub', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?field=Health%20Sciences&loc=Japan`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#field-filter').inputValue(), 'Health Sciences');
  assert.equal(await page.locator('#location-filter').inputValue(), 'Japan');
  assert.match(await textOf(page.locator('#result-count')), /\d+ people in Health Sciences .* across \d+ institutions in Japan/);

  const fieldHubLink = page.locator('#result-count .result-count-link').first();
  assert.match(await attrOf(fieldHubLink, 'href'), /\/regions\/japan\/health-sciences\.html$/);
  await fieldHubLink.click();
  await page.waitForLoadState('networkidle');
  assert.equal(await textOf(page.locator('h1')), 'Vietnamese Health Sciences Professors in Japan');
  await page.close();
});

test('data health reports the generated HTML inventory and links standalone pages', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?view=health`, { waitUntil: 'networkidle' });
  const inventory = page.locator('.generated-html-card');
  assert.equal(await textOf(inventory.locator('.html-inventory-title')), 'Generated HTML Inventory');
  assert.equal(await inventory.locator('.html-inventory-item').count(), 4);
  assert.equal(await inventory.locator('.html-standalone-links a').count(), 4);
  assert.match(await textOf(inventory.locator('.html-inventory-total')), /^\d[\d,]* pages$/);
  assert.equal(await page.locator('.complexity-card').count(), 1);
  assert.match(await textOf(page.locator('.complexity-card .html-inventory-total')), /[\d,]+ LoC/);
  assert.equal(await page.locator('.github-status-card, .growth-chart').count(), 0);
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
  assert.equal(await page.locator('#track-filter option[value="Tenure-line"]').count(), 1);
  assert.equal(await page.locator('#track-filter option[value="Teaching"]').count(), 0);
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
  await page.goto(`${baseUrl}/?loc=Antarctica`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#location-filter').inputValue(), 'World');
  assert.ok((await page.locator('.entry').count()) > 0);
  await page.goto(`${baseUrl}/?loc=South%20America`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#location-filter').inputValue(), 'South America');
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
  await page.goto(`${baseUrl}/?loc=World&view=insights`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.insights-section-block').count(), 1);
  await page.goto(`${baseUrl}/?loc=France&view=insights`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.insights-section-block').count(), 2);
  assert.equal(await page.locator('.insights-badge').filter({ hasText: 'France' }).count(), 1);
  assert.equal(await page.locator('.insights-badge').filter({ hasText: 'DIASPORA INSIGHTS' }).count(), 1);
  await page.locator('#location-filter').selectOption('World');
  assert.equal(await page.locator('.insights-section-block').count(), 0);
  assert.ok((await page.locator('.entry').count()) > 0);
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
  assert.equal(await page.locator('link[href^="../profile.css?v="]').count(), 1);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), 'light dark');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(21, 24, 28)');
  assert.equal(await page.locator('.man-page').count(), 1);
  assert.equal(await page.locator('.man-section').filter({ hasText: 'SYNOPSIS' }).count(), 1);
  assert.match(await textOf(page.locator('.record-id')), /^vp-\d+$/);
  assert.equal(await page.locator('.raw-record').count(), 1);
  assert.equal(await page.locator('.profile-actions .submission-link').count(), 0);
  assert.equal(await page.locator('.add-fab').getAttribute('href'), `../submit.html?edit=${id}`);
  assert.equal(await page.locator('.name-heading .profile-actions').count(), 1);
  const seeAlso = page.locator('.man-section').filter({ has: page.locator('h2', { hasText: 'SEE ALSO' }) });
  assert.equal(await seeAlso.locator('nav.links a').count(), 6);
  assert.equal(await seeAlso.locator('a[href="../connections.html"]').count(), 1);
  assert.equal(await page.locator('footer.man-footer').count(), 0);
  const profileStar = page.locator('.name-title .favorite-toggle');
  assert.equal(await profileStar.getAttribute('aria-pressed'), 'true');
  await profileStar.click();
  assert.equal(await profileStar.getAttribute('aria-pressed'), 'false');
  await page.close();
});

test('verified academic connections render on both linked profiles', async () => {
  const page = await context.newPage();
  for (const [id, linkedId, linkedName] of [
    ['vp-0015', 'vp-0018', 'Khoa Luu'],
    ['vp-0018', 'vp-0015', 'Ngan Hoang Le'],
  ]) {
    await page.goto(`${baseUrl}/people/${id}.html`, { waitUntil: 'networkidle' });
    const connections = page.locator('.man-section').filter({ has: page.locator('h2', { hasText: 'CONNECTIONS' }) });
    assert.equal(await connections.count(), 1);
    // Scope to this pair: either person may gain further connections over time.
    const item = connections.locator('.connection-item').filter({ has: page.locator(`a.connection-person[href="../people/${linkedId}.html"]`) });
    assert.equal(await item.count(), 1);
    assert.equal(await item.locator('.connection-person').textContent(), linkedName);
    assert.equal(await item.locator('.connection-kind').textContent(), 'Coauthor · 2 shared works');
    assert.equal(await item.locator('.connection-sources a').count(), 3);
    assert.equal(await item.locator('.connection-works').count(), 0);
  }
  await page.goto(`${baseUrl}/people/vp-0001.html`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.connection-list').count(), 0);
  await page.close();
});

test('main directory and profile pages meet core WCAG accessibility standards', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const directoryResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .disableRules(['color-contrast'])
    .analyze();
  const severeViolations = directoryResults.violations.filter((v: any) => v.impact === 'critical' || v.impact === 'serious');
  assert.equal(severeViolations.length, 0, `Directory has severe a11y violations: ${JSON.stringify(severeViolations, null, 2)}`);

  await page.goto(`${baseUrl}/people/vp-0001.html`, { waitUntil: 'networkidle' });
  const profileResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .disableRules(['color-contrast'])
    .analyze();
  const profileViolations = profileResults.violations.filter((v: any) => v.impact === 'critical' || v.impact === 'serious');
  assert.equal(profileViolations.length, 0, `Profile page has severe a11y violations: ${JSON.stringify(profileViolations, null, 2)}`);
  await page.close();
});

test('connections explorer filters verified edges, focuses people, and exposes evidence on mobile', async () => {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/connections.html`, { waitUntil: 'networkidle' });
  const response = await page.request.get(`${baseUrl}/relationships.json`);
  const database = await response.json() as { relationships: { sourceId: string; targetId: string; type: string }[] };
  const ids = new Set(database.relationships.flatMap(edge => [edge.sourceId, edge.targetId]));
  assert.equal(await page.locator('#connection-explorer select').count(), 0);
  assert.equal(await page.locator('#network-filters').getAttribute('open'), null);
  assert.equal(await page.locator('.network-node').count(), ids.size);
  assert.equal(await page.locator('.network-edge').count(), database.relationships.length);
  assert.ok((await page.locator('.network-canvas').boundingBox())!.height >= 620);
  assert.ok((await page.locator('.network-node circle').first().boundingBox())!.width >= 24);

  const firstNode = page.locator('.network-node').first();
  const firstId = await firstNode.getAttribute('data-person');
  await firstNode.hover();
  const activeLabel = page.locator(`#network-labels [data-label="${firstId}"]`);
  assert.equal(await activeLabel.evaluate(label => getComputedStyle(label).opacity), '1');
  assert.ok(await activeLabel.evaluate(label => label === label.parentElement!.lastElementChild));
  assert.ok(await page.locator('#network-labels').evaluate(layer => layer === layer.parentElement!.lastElementChild));
  assert.equal(await page.locator('#network-labels').evaluate(layer => getComputedStyle(layer).pointerEvents), 'none');
  await page.mouse.move(0, 0);
  assert.equal(await activeLabel.evaluate(label => getComputedStyle(label).opacity), '0');
  await firstNode.focus();
  assert.equal(await activeLabel.evaluate(label => getComputedStyle(label).opacity), '1');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.network-node.is-selected').count(), 1);
  assert.ok(await page.locator('.network-node.is-selected').evaluate(node => node === document.activeElement));
  assert.match(await textOf(page.locator('#network-summary')), /Network of/);
  await page.locator('#network-depth').click();
  await page.locator('#network-clear').click();
  await page.locator('#network-filters summary').click();
  await page.locator('[data-type="doctoral-advisor"]').click();
  assert.equal(await page.locator('.network-edge').count(), database.relationships.filter(edge => edge.type === 'doctoral-advisor').length);
  assert.ok(await page.locator('.network-edge path[marker-end]').count() > 0);

  await page.locator('#network-table-toggle').click();
  assert.ok(await page.locator('#network-table-panel').isVisible());
  await page.locator('#network-table-panel button').first().click();
  assert.ok(await page.locator('#network-details a[target="_blank"]').count() > 0);
  await page.locator('[data-type=""]').click();
  await page.locator('#network-search').fill('nguyen');
  assert.ok(await page.locator('#network-results button').count() > 0);
  await page.locator('#network-results button').first().click();
  await page.locator('#network-graph-toggle').click();
  await page.locator('#network-zoom-in').click();
  assert.match(await attrOf(page.locator('#network-layer'), 'transform'), /scale\(1.3\)/);
  await page.locator('#network-reset').click();
  assert.match(await attrOf(page.locator('#network-layer'), 'transform'), /scale\(1\)/);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(100);
  assert.ok((await page.locator('.network-canvas').boundingBox())!.height >= 560);
  assert.ok((await page.locator('.network-node circle').first().boundingBox())!.width >= 24);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.close();
});

test('lineage and path views preserve advisor directions, show evidence, and handle missing paths', async () => {
  const page = await context.newPage();
  const roster = await (await page.request.get(`${baseUrl}/data.json`)).json() as RosterEntry[];
  const [a, b, c, isolated] = roster;
  const edges = [
    { id: 'lineage-a-b', sourceId: a.id, targetId: b.id, type: 'doctoral-advisor' },
    { id: 'lineage-b-c', sourceId: b.id, targetId: c.id, type: 'masters-advisor' },
  ].map(edge => ({ ...edge, sources: ['https://example.org/evidence'], evidence: 'Verified mentorship evidence', works: [], notes: '', direct: false }));
  await page.route('**/relationships.json*', route => route.fulfill({ json: { version: 1, updatedAt: '2026-10-01T00:00:00.000Z', relationships: edges } }));
  await page.goto(`${baseUrl}/connections.html`, { waitUntil: 'networkidle' });
  await page.locator('#network-mode-lineage').click();
  const positions = await page.locator('.network-node').evaluateAll(nodes => nodes.map(node => ({ id: node.getAttribute('data-person'), y: Number(node.getAttribute('transform')!.split(' ')[1].replace(')', '')) })));
  assert.ok(positions.find(node => node.id === a.id)!.y < positions.find(node => node.id === b.id)!.y);
  assert.ok(positions.find(node => node.id === b.id)!.y < positions.find(node => node.id === c.id)!.y);
  await page.locator('#network-mode-path').click();
  await page.locator('#network-path-start').fill(await page.locator(`#network-people option[value$="(${c.id})"]`).getAttribute('value') as string);
  await page.locator('#network-path-end').fill(await page.locator(`#network-people option[value$="(${a.id})"]`).getAttribute('value') as string);
  assert.match(await textOf(page.locator('#network-summary')), /2 steps/);
  assert.equal(await page.locator('#network-path-result li').count(), 3);
  assert.match(await textOf(page.locator('#network-path-result button').first()), /←/);
  await page.locator('#network-path-result button').first().click();
  assert.match(await textOf(page.locator('#network-details')), /Verified mentorship evidence/);
  await page.locator('#network-filters summary').click();
  await page.locator('[data-type="doctoral-advisor"]').click();
  assert.match(await textOf(page.locator('#network-summary')), /No path is recorded/);
  await page.locator('[data-type=""]').click();
  await page.locator('#network-path-end').fill(await page.locator(`#network-people option[value$="(${isolated.id})"]`).getAttribute('value') as string);
  assert.equal(await page.locator('.network-edge').count(), 0);
  await page.locator('#network-path-end').fill(await page.locator(`#network-people option[value$="(${c.id})"]`).getAttribute('value') as string);
  assert.match(await textOf(page.locator('#network-summary')), /two different people/);
  await page.setViewportSize({ width: 375, height: 812 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.locator('#network-clear').click();
  assert.match(await textOf(page.locator('#network-summary')), /Choose two people/);
  await page.close();
});
