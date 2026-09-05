import fs from 'node:fs';
import { execSync } from 'node:child_process';

const svg = execSync('curl -s https://raw.githubusercontent.com/flekschas/simple-world-map/master/world-map.svg', { encoding: 'utf8' });

const singlePathRegex = /<path\s+id="([^"]+)"([^>]*\bd="([^"]+)"[^>]*)>/g;
const mapPaths: Record<string, { type: 'path'; d: string } | { type: 'group'; subPaths: { d: string; isMainland?: boolean }[] }> = {};
let m: RegExpExecArray | null;

while ((m = singlePathRegex.exec(svg)) !== null) {
  mapPaths[m[1]] = { type: 'path', d: m[3] };
}

const groupRegex = /<g\s+id="([^"]+)">(.*?)<\/g>/gs;
while ((m = groupRegex.exec(svg)) !== null) {
  const id = m[1];
  const inner = m[2];
  const subPaths = [...inner.matchAll(/<path([^>]*\bd="([^"]+)"[^>]*)>/g)].map((x) => {
    const isMainland = x[1].includes('mainland');
    return { d: x[2], isMainland };
  });
  mapPaths[id] = { type: 'group', subPaths };
}

// Add Hong Kong as a path if not present
if (!mapPaths['hk']) {
  mapPaths['hk'] = {
    type: 'path',
    d: 'M673.5,471.5 a2.5,2.5 0 1,0 0.1,0 Z',
  };
}

const ISO_TO_COUNTRY: Record<string, string> = {
  us: 'United States',
  au: 'Australia',
  gb: 'United Kingdom',
  ca: 'Canada',
  fr: 'France',
  jp: 'Japan',
  sg: 'Singapore',
  tw: 'Taiwan',
  nl: 'Netherlands',
  nz: 'New Zealand',
  de: 'Germany',
  hk: 'Hong Kong',
  no: 'Norway',
  ie: 'Ireland',
  se: 'Sweden',
  pl: 'Poland',
  ch: 'Switzerland',
  dk: 'Denmark',
  be: 'Belgium',
  cn: 'China',
  th: 'Thailand',
  kr: 'South Korea',
  fi: 'Finland',
  vn: 'Vietnam',
  it: 'Italy',
  es: 'Spain',
  pt: 'Portugal',
  at: 'Austria',
  cz: 'Czech Republic',
  hu: 'Hungary',
  ro: 'Romania',
  gr: 'Greece',
  tr: 'Turkey',
  ru: 'Russia',
  in: 'India',
  pk: 'Pakistan',
  bd: 'Bangladesh',
  my: 'Malaysia',
  id: 'Indonesia',
  ph: 'Philippines',
  sa: 'Saudi Arabia',
  ae: 'United Arab Emirates',
  qa: 'Qatar',
  il: 'Israel',
  eg: 'Egypt',
  za: 'South Africa',
  ng: 'Nigeria',
  ke: 'Kenya',
  ma: 'Morocco',
  br: 'Brazil',
  mx: 'Mexico',
  ar: 'Argentina',
  cl: 'Chile',
  co: 'Colombia',
  pe: 'Peru',
  is: 'Iceland',
};

const COUNTRY_PIN_COORDS: Record<string, { x: number; y: number }> = {
  'United States': { x: 195, y: 420 },
  'Canada': { x: 210, y: 345 },
  'Australia': { x: 720, y: 615 },
  'United Kingdom': { x: 395, y: 365 },
  'France': { x: 412, y: 410 },
  'Germany': { x: 432, y: 390 },
  'Netherlands': { x: 418, y: 378 },
  'Belgium': { x: 410, y: 388 },
  'Switzerland': { x: 426, y: 410 },
  'Poland': { x: 450, y: 388 },
  'Ireland': { x: 382, y: 382 },
  'Norway': { x: 435, y: 335 },
  'Sweden': { x: 448, y: 345 },
  'Finland': { x: 462, y: 338 },
  'Denmark': { x: 428, y: 368 },
  'Japan': { x: 720, y: 432 },
  'South Korea': { x: 698, y: 417 },
  'China': { x: 625, y: 415 },
  'Taiwan': { x: 700, y: 462 },
  'Hong Kong': { x: 672, y: 472 },
  'Vietnam': { x: 662, y: 490 },
  'Thailand': { x: 648, y: 492 },
  'Singapore': { x: 659, y: 535 },
  'New Zealand': { x: 806, y: 670 },
};

const fileContent = `// Auto-generated SVG World Map dataset with Robinson projection ISO-3166-1 alpha-2 paths.

export interface WorldMapPathData {
  type: 'path' | 'group';
  d?: string;
  subPaths?: { d: string; isMainland?: boolean }[];
}

export const WORLD_MAP_VIEWBOX = '30.767 241.591 784.077 458.627';

export const ISO_TO_COUNTRY_NAME: Record<string, string> = ${JSON.stringify(ISO_TO_COUNTRY, null, 2)};

export const COUNTRY_NAME_TO_ISO: Record<string, string> = Object.fromEntries(
  Object.entries(ISO_TO_COUNTRY_NAME).map(([iso, name]) => [name, iso]),
);

export const COUNTRY_PIN_COORDS: Record<string, { x: number; y: number }> = ${JSON.stringify(COUNTRY_PIN_COORDS, null, 2)};

export const WORLD_MAP_SVG_PATHS: Record<string, WorldMapPathData> = ${JSON.stringify(mapPaths, null, 2)};
`;

fs.writeFileSync('src/world-map-data.ts', fileContent);
console.log('Successfully wrote src/world-map-data.ts');
