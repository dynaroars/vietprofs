import { countryFlag, type Roster } from './data.ts';
import { escapeHtml } from './utils.ts';
import {
  COUNTRY_PIN_COORDS,
  ISO_TO_COUNTRY_NAME,
  WORLD_MAP_SVG_PATHS,
  WORLD_MAP_VIEWBOX,
} from './world-map-data.ts';

export function heatTier(count: number, max: number): number {
  if (count === 0 || max === 0) return 0;
  if (count >= 100) return 4;
  if (count >= 20) return 3;
  if (count >= 5) return 2;
  return 1;
}

export function renderWorldMap(roster: Roster, selectedLocation?: string): string {
  const counts = new Map<string, number>();
  for (const p of roster) {
    const country = p.country || 'United States';
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  const sortedCountries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const max = sortedCountries[0] ? sortedCountries[0][1] : 1;
  const total = roster.length || 1;

  // Build SVG country paths
  const countryElements = Object.entries(WORLD_MAP_SVG_PATHS).map(([iso, pathData]) => {
    const countryName = ISO_TO_COUNTRY_NAME[iso] || iso.toUpperCase();
    const count = counts.get(countryName) ?? 0;
    const tier = heatTier(count, max);
    const flag = countryFlag(countryName);
    const isOrigin = iso === 'vn';
    const isSelected = selectedLocation && (selectedLocation === countryName || selectedLocation === iso);
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const label = isOrigin
      ? 'Vietnam: Origin of the diaspora'
      : `${flag} ${countryName}: ${count} ${count === 1 ? 'person' : 'people'} (${pct}%)`;

    const commonAttrs = `id="map-country-${iso}" class="world-map-country heat-${tier}${isOrigin ? ' is-origin' : ''}${isSelected ? ' is-selected' : ''}" data-country="${escapeHtml(countryName)}" data-code="${iso}" data-count="${count}" data-flag="${flag}" data-tier="${tier}" data-share="${pct}" role="button" tabindex="0" aria-label="${escapeHtml(label)}"`;

    if (pathData.type === 'path' && pathData.d) {
      return `<path ${commonAttrs} d="${pathData.d}"><title>${escapeHtml(label)}</title></path>`;
    }

    if (pathData.type === 'group' && pathData.subPaths) {
      const subPathsHtml = pathData.subPaths
        .map((sp) => `<path class="${sp.isMainland ? 'mainland' : ''}" d="${sp.d}" />`)
        .join('');
      return `<g ${commonAttrs}>${subPathsHtml}<title>${escapeHtml(label)}</title></g>`;
    }

    return '';
  }).join('');

  // Build Pin Badges on countries with counts
  const pinsHtml = sortedCountries.map(([countryName, count]) => {
    const coords = COUNTRY_PIN_COORDS[countryName];
    if (!coords) return '';
    const tier = heatTier(count, max);
    const flag = countryFlag(countryName);
    const pct = Math.round((count / total) * 100);
    const label = `${flag} ${countryName}: ${count} ${count === 1 ? 'person' : 'people'} (${pct}%)`;
    const numDigits = String(count).length;
    const badgeWidth = Math.max(22, numDigits * 8 + 12);
    const badgeHalf = badgeWidth / 2;

    return `
      <g class="world-map-pin heat-${tier}" data-country="${escapeHtml(countryName)}" data-count="${count}" data-flag="${flag}" data-share="${pct}" transform="translate(${coords.x}, ${coords.y})" role="button" tabindex="0" aria-label="${escapeHtml(label)}">
        <rect class="pin-badge-bg" x="-${badgeHalf}" y="-8" width="${badgeWidth}" height="16" rx="8" />
        <text class="pin-badge-text" text-anchor="middle" y="3.5">${count}</text>
      </g>
    `;
  }).join('');

  // Vietnam Origin Pin
  const vnCoords = COUNTRY_PIN_COORDS['Vietnam'] || { x: 662, y: 490 };
  const vnPinHtml = `
    <g class="world-map-pin is-origin-pin" data-country="Vietnam" data-count="0" data-flag="🇻🇳" data-share="0" transform="translate(${vnCoords.x}, ${vnCoords.y})" role="button" tabindex="0" aria-label="Vietnam: Origin of diaspora">
      <circle class="origin-pin-halo" r="9" />
      <circle class="origin-pin-core" r="5" />
      <text class="origin-pin-star" text-anchor="middle" y="3.2">★</text>
    </g>
  `;

  // Top Country Quick Chips
  const quickChips = sortedCountries.slice(0, 10).map(([countryName, count]) => {
    const tier = heatTier(count, max);
    const flag = countryFlag(countryName);
    const pct = Math.round((count / total) * 100);
    return `
      <button type="button" class="world-map-chip heat-${tier} ranked-item" data-filter="country" data-value="${escapeHtml(countryName)}" title="Filter by ${escapeHtml(countryName)} (${count} people)">
        <span class="chip-flag" aria-hidden="true">${flag}</span>
        <span class="chip-name">${escapeHtml(countryName)}</span>
        <span class="chip-count">${count}</span>
        <span class="chip-share">${pct}%</span>
      </button>
    `;
  }).join('');

  return `
    <div class="insights-section world-map-section" id="world-map-section">
      <div class="world-map-header">
        <div class="world-map-title-row">
          <h3 class="insights-heading">Global Diaspora Geographic Heatmap</h3>
          <span class="world-map-host-badge">🌐 ${counts.size} Host Countries</span>
        </div>
        <p class="insights-caption">Faculty density across worldwide host nations — darker/vibrant heatmap shading indicates larger faculty communities. Hover over any country or badge to inspect details; click to filter roster.</p>
      </div>

      <div class="world-map-svg-wrap">
        <svg class="world-map-svg" viewBox="${WORLD_MAP_VIEWBOX}" role="img" aria-label="Global Heatmap of Vietnamese Diaspora Faculty">
          <rect class="world-map-ocean" x="30" y="240" width="785" height="460" rx="12" />
          <g class="world-map-countries">
            ${countryElements}
          </g>
          <g class="world-map-pins">
            ${pinsHtml}
            ${vnPinHtml}
          </g>
        </svg>
        <div class="world-map-tooltip" role="tooltip" hidden></div>
      </div>

      <div class="world-map-footer">
        <div class="world-map-legend">
          <span class="legend-title">Density:</span>
          <div class="legend-scale">
            <span class="legend-cell heat-0" title="0 faculty"><span class="legend-color"></span>0</span>
            <span class="legend-cell heat-1" title="1 to 4 faculty"><span class="legend-color"></span>1–4</span>
            <span class="legend-cell heat-2" title="5 to 19 faculty"><span class="legend-color"></span>5–19</span>
            <span class="legend-cell heat-3" title="20 to 99 faculty"><span class="legend-color"></span>20–99</span>
            <span class="legend-cell heat-4" title="100+ faculty"><span class="legend-color"></span>100+</span>
            <span class="legend-cell is-origin-legend" title="Vietnam: Diaspora Origin"><span class="legend-color origin-color">★</span>Origin</span>
          </div>
        </div>
        <div class="world-map-quick-chips" role="group" aria-label="Top host countries">
          ${quickChips}
        </div>
      </div>
    </div>
  `;
}
