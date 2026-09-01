// Regenerates the paper's screenshot figures from the built site so they cannot drift out of
// sync with the roster snapshot the manuscript reports. Run `npm run figures` after a roster
// change, then rebuild paper.pdf.
//
// The server/browser setup mirrors test/browser-smoke.test.ts: `vite preview` over the built
// dist/, driven by headless Chromium.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { get } from 'node:http';
import { fileURLToPath } from 'node:url';
import type { Page } from 'playwright';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const port = 4180;
const baseUrl = `http://127.0.0.1:${port}`;
const figuresDir = fileURLToPath(new URL('../figures/', import.meta.url));

// Matches the existing figures: a 1360x900 CSS viewport at 2x, so the PNGs stay 2720x1800.
const viewport = { width: 1360, height: 900 };
const submitViewport = { width: 1360, height: 820 };

async function waitForServer(url: string) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
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

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)], {
  stdio: 'ignore',
});
let browser;

try {
  await waitForServer(`${baseUrl}/`);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
  });

  // Each figure is one page state: a path plus the interaction that produces the view.
  const figures: Array<{
    file: string;
    path: string;
    viewport?: typeof viewport;
    prepare?: (page: Page) => Promise<void>;
  }> = [
    { file: 'screenshot-home.png', path: '/' },
    {
      // The caption describes a university-scoped search, which the scope selector expresses.
      file: 'screenshot-search.png',
      path: '/?q=Stanford&scope=university',
    },
    // The caption describes the U.S. view, whose choropleth grid only renders with a U.S. location.
    { file: 'screenshot-interesting.png', path: '/?loc=US&view=insights' },
    {
      // The caption describes the existing-record suggestion, so type a name already on the roster.
      file: 'screenshot-submit.png',
      path: '/submit.html',
      viewport: submitViewport,
      prepare: async (page) => {
        await page.getByLabel('Modify an existing entry').check();
        // A partial name (an exact match instead pre-fills the record and hides the list).
        await page.locator('#name').fill('Tri Da');
        await page.locator('.correction-suggestion').first().waitFor();
      },
    },
  ];

  for (const figure of figures) {
    const page = await context.newPage();
    if (figure.viewport) await page.setViewportSize(figure.viewport);
    await page.goto(`${baseUrl}${figure.path}`, { waitUntil: 'networkidle' });
    await figure.prepare?.(page);
    await page.screenshot({ path: `${figuresDir}${figure.file}` });
    await page.close();
    console.log(`Captured figures/${figure.file}`);
  }

  await context.close();
} finally {
  await browser?.close();
  server.kill();
}
