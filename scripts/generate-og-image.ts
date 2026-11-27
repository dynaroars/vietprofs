// Generates the 1200x630 Open Graph / Twitter social preview cards (English and Vietnamese)
// directly from the live roster and world-map paths so the card stays faithful to VietProfs's
// visual identity. Run `npm run og-image` whenever you want to refresh the milestone counts or
// world-map shading in public/vietprofs-og.png and public/vietprofs-og-vi.png.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import type { Roster } from '../src/data.ts';
import { escapeHtml } from '../src/utils.ts';
import { densityHeatTier } from '../src/world-map.ts';
import {
  ISO_TO_COUNTRY_NAME,
  WORLD_MAP_SVG_PATHS,
  WORLD_MAP_VIEWBOX,
} from '../src/world-map-data.ts';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = resolve(import.meta.dirname, '..');

type CardSpec = {
  lang: 'en' | 'vi';
  outPath: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  stats: Array<{ value: string; label: string }>;
  footer: string;
};

const HEAT_FILLS: Record<number, string> = {
  0: '#e2ebe6',
  1: '#b7e4cc',
  2: '#78ce9f',
  3: '#3eb476',
  4: '#1d7a4c',
};

function buildMapSvg(roster: Roster): string {
  const counts = new Map<string, number>();
  for (const person of roster) {
    const country = person.country || 'United States';
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  const shapes = Object.entries(WORLD_MAP_SVG_PATHS)
    .map(([iso, pathData]) => {
      const name = ISO_TO_COUNTRY_NAME[iso] || iso.toUpperCase();
      const count = counts.get(name) ?? 0;
      const fill = HEAT_FILLS[densityHeatTier(count)] ?? HEAT_FILLS[0];
      const stroke = count > 0 ? '#ffffff' : '#f3f7f5';
      const strokeWidth = count > 0 ? '0.65' : '0.45';
      if (pathData.type === 'group' && pathData.subPaths) {
        const inner = pathData.subPaths
          .map(
            (sub) =>
              `<path d="${sub.d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`,
          )
          .join('');
        return `<g>${inner}</g>`;
      }
      return `<path d="${pathData.d ?? ''}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
    })
    .join('');

  return `<svg class="world-map" viewBox="${WORLD_MAP_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${shapes}</svg>`;
}

function buildHtml(spec: CardSpec, logoSvg: string, mapSvg: string): string {
  const statsHtml = spec.stats
    .map(
      (stat) => `
      <div class="stat">
        <div class="stat-value">${escapeHtml(stat.value)}</div>
        <div class="stat-label">${escapeHtml(stat.label)}</div>
      </div>`,
    )
    .join('');

  return `<!doctype html>
<html lang="${spec.lang}">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Inter:wght@500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      font-family: 'Inter', 'Cantarell', 'DejaVu Sans', sans-serif;
      background: #f6faf8;
      color: #0f172a;
    }
    .card {
      position: relative;
      width: 1200px;
      height: 630px;
      padding: 52px 64px 46px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background:
        radial-gradient(circle at 84% 26%, rgba(46, 158, 100, 0.14), transparent 52%),
        radial-gradient(circle at 12% 92%, rgba(255, 204, 51, 0.11), transparent 44%),
        linear-gradient(145deg, #ffffff 0%, #f4faf6 62%, #ebf6ef 100%);
    }
    .accent-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 10px;
      background: linear-gradient(90deg, #1d7a4c 0%, #2e9e64 62%, #ffcc33 100%);
    }
    .map-backdrop {
      position: absolute;
      right: 18px;
      top: 46px;
      width: 690px;
      height: 410px;
      opacity: 0.92;
      pointer-events: none;
      mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.72) 14%, rgba(0, 0, 0, 1) 34%);
      -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.72) 14%, rgba(0, 0, 0, 1) 34%);
    }
    .world-map {
      width: 100%;
      height: 100%;
      display: block;
    }
    .header {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .logo-wrap {
      width: 84px;
      height: 84px;
      border-radius: 20px;
      background: #ffffff;
      border: 1.5px solid #d4e8dc;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      flex-shrink: 0;
    }
    .logo-wrap svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .brand-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .eyebrow {
      font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #1d7a4c;
      text-transform: uppercase;
    }
    .brand-title {
      font-family: 'Outfit', 'Inter', 'Cantarell', sans-serif;
      font-size: 56px;
      font-weight: 800;
      line-height: 1.02;
      letter-spacing: -0.025em;
      color: #0f172a;
    }
    .hero {
      position: relative;
      z-index: 2;
      max-width: 660px;
      margin-top: 8px;
    }
    .subtitle {
      font-family: 'Outfit', 'Inter', 'Cantarell', sans-serif;
      font-size: 38px;
      font-weight: 700;
      line-height: 1.22;
      letter-spacing: -0.015em;
      color: #1e293b;
      text-shadow: 0 2px 18px rgba(255, 255, 255, 0.9);
    }
    .bottom {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .stats {
      display: flex;
      gap: 18px;
    }
    .stat {
      background: rgba(255, 255, 255, 0.94);
      border: 1.5px solid #d4e8dc;
      border-radius: 16px;
      padding: 16px 26px;
      min-width: 195px;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
    }
    .stat-value {
      font-family: 'Outfit', 'Inter', 'Cantarell', sans-serif;
      font-size: 34px;
      font-weight: 800;
      line-height: 1.08;
      color: #1d7a4c;
      letter-spacing: -0.02em;
    }
    .stat-label {
      margin-top: 4px;
      font-size: 17px;
      font-weight: 600;
      color: #475569;
    }
    .footer {
      font-size: 19px;
      font-weight: 600;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: #2e9e64;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="accent-bar"></div>
    <div class="map-backdrop">${mapSvg}</div>
    <div class="header">
      <div class="logo-wrap">${logoSvg}</div>
      <div class="brand-meta">
        <div class="eyebrow">${escapeHtml(spec.eyebrow)}</div>
        <div class="brand-title">${escapeHtml(spec.title)}</div>
      </div>
    </div>
    <div class="hero">
      <p class="subtitle">${escapeHtml(spec.subtitle)}</p>
    </div>
    <div class="bottom">
      <div class="stats">${statsHtml}</div>
      <div class="footer"><span class="dot"></span><span>${escapeHtml(spec.footer)}</span></div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  const [rawRoster, logoSvg] = await Promise.all([
    readFile(resolve(root, 'public/data.json'), 'utf8'),
    readFile(resolve(root, 'public/vietprofs-bamboo-v.svg'), 'utf8'),
  ]);
  const roster = JSON.parse(rawRoster) as Roster;
  const countries = new Set(roster.map((person) => person.country || 'United States'));
  const universities = new Set(roster.map((person) => person.university).filter(Boolean));
  const roundedScholars = Math.floor(roster.length / 100) * 100;
  const roundedOrgs = Math.floor(universities.size / 100) * 100;
  const mapSvg = buildMapSvg(roster);

  const specs: CardSpec[] = [
    {
      lang: 'en',
      outPath: resolve(root, 'public/vietprofs-og.png'),
      eyebrow: 'vietprofs.roars.dev',
      title: 'VietProfs',
      subtitle: 'Global Directory of Vietnamese Professors, Researchers & Scientists',
      stats: [
        { value: `${roundedScholars.toLocaleString('en-US')}+`, label: 'Scholars Worldwide' },
        { value: String(countries.size), label: 'Countries' },
        { value: `${roundedOrgs.toLocaleString('en-US')}+`, label: 'Universities & Labs' },
      ],
      footer: 'Academia · Government & Nonprofit Labs · Industry Research',
    },
    {
      lang: 'vi',
      outPath: resolve(root, 'public/vietprofs-og-vi.png'),
      eyebrow: 'vietprofs.roars.dev/vi',
      title: 'VietProfs',
      subtitle: 'Danh bạ Giáo sư & Nhà khoa học Người Việt trên Thế giới',
      stats: [
        { value: `${roundedScholars.toLocaleString('vi-VN')}+`, label: 'Học giả toàn cầu' },
        { value: String(countries.size), label: 'Quốc gia' },
        { value: `${roundedOrgs.toLocaleString('vi-VN')}+`, label: 'Trường & Viện nghiên cứu' },
      ],
      footer: 'Đại học · Viện nghiên cứu & Chính phủ · Doanh nghiệp',
    },
  ];

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    for (const spec of specs) {
      const html = buildHtml(spec, logoSvg, mapSvg);
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: spec.outPath, type: 'png' });
      console.log(`Generated ${spec.outPath}`);
    }
  } finally {
    await browser.close();
  }
}

await main();
