import {
  canonicalRank,
  countryFlag,
  displayName,
  fieldOf,
  personPath,
  sectorOf,
  type Roster,
  type RosterEntry,
} from './data.ts';
import { canonicalAlmaMater } from './alma-mater.ts';
import { escapeHtml } from './utils.ts';

export type PathwayStage = 'undergrad' | 'ms' | 'phd' | 'postdoc' | 'all';

export interface AlmaMaterEntry {
  institution: string;
  total: number;
  byStage: {
    undergrad: number;
    ms: number;
    phd: number;
    postdoc: number;
  };
  isVietnamese: boolean;
}

export interface UniversityPathways {
  institution: string;
  stage: PathwayStage;
  total: number;
  stageCounts: {
    undergrad: number;
    ms: number;
    phd: number;
    postdoc: number;
    all: number;
  };
  hostCountries: [string, number][];
  sectors: {
    academia: number;
    labs: number;
    industry: number;
  };
  nextPhdInstitutions: [string, number][];
  nextPostdocInstitutions: [string, number][];
  topCurrentInstitutions: [string, number][];
  topFields: [string, number][];
  trajectories: RosterEntry[];
}

const VIETNAMESE_INSTITUTION_PATTERN =
  /\b(vietnam|viet nam|hanoi|ha noi|ho chi minh|saigon|hue university|da nang|danang|can tho|thai nguyen|vinh university|nha trang|quy nhon|da lat|dalat|hai phong|bach khoa|ngoai thuong|quoc gia|ton duc thang|fpt university|foreign trade university|national economics university|diplomatic academy of vietnam|banking academy|academy of finance|vnu\b|hust\b|hcmut\b|hcmus\b|hnue\b|ftu\b|neu\b|uet\b|uit\b|university of medicine and pharmacy|university of transport|university of agriculture|water resources university|thuyloi|phenikaa|vinuniversity|fulbright university vietnam|duy tan|van lang|hoa sen|rmit vietnam|vietnamese-german university)\b/i;

// Foreign schools whose names contain a Vietnamese keyword ("University of Agriculture", "UiT", "Transport").
const NON_VIETNAMESE_INSTITUTION_PATTERN =
  /tokyo university of agriculture|arctic university of norway|\bž?zilina\b|žilina/i;

export function isVietnameseInstitution(name: string | undefined): boolean {
  if (!name || NON_VIETNAMESE_INSTITUTION_PATTERN.test(name)) return false;
  return VIETNAMESE_INSTITUTION_PATTERN.test(name);
}

function normalizedInst(value: string | undefined): string {
  return (canonicalAlmaMater(value) ?? '').toLowerCase();
}

function stagesForPerson(
  person: RosterEntry,
): Array<{ stage: Exclude<PathwayStage, 'all'>; inst: string }> {
  const result: Array<{ stage: Exclude<PathwayStage, 'all'>; inst: string }> = [];
  if (person.undergradInstitution?.trim()) {
    result.push({ stage: 'undergrad', inst: canonicalAlmaMater(person.undergradInstitution) });
  }
  if (person.msInstitution?.trim()) {
    result.push({ stage: 'ms', inst: canonicalAlmaMater(person.msInstitution) });
  }
  if (person.phdInstitution?.trim()) {
    result.push({ stage: 'phd', inst: canonicalAlmaMater(person.phdInstitution) });
  }
  if (person.postdocInstitution?.trim()) {
    result.push({ stage: 'postdoc', inst: canonicalAlmaMater(person.postdocInstitution) });
  }
  return result;
}

function countStrings(values: Array<string | undefined>, limit: number): [string, number][] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const val = raw?.trim();
    if (!val) continue;
    counts.set(val, (counts.get(val) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

export function buildAlmaMaterIndex(roster: Roster): AlmaMaterEntry[] {
  const byKey = new Map<
    string,
    {
      institution: string;
      people: Set<string>;
      undergrad: Set<string>;
      ms: Set<string>;
      phd: Set<string>;
      postdoc: Set<string>;
    }
  >();

  for (const person of roster) {
    for (const { stage, inst } of stagesForPerson(person)) {
      const key = inst.toLowerCase();
      let entry = byKey.get(key);
      if (!entry) {
        entry = {
          institution: inst,
          people: new Set(),
          undergrad: new Set(),
          ms: new Set(),
          phd: new Set(),
          postdoc: new Set(),
        };
        byKey.set(key, entry);
      }
      entry.people.add(person.id);
      entry[stage].add(person.id);
    }
  }

  return [...byKey.values()]
    .map((entry) => ({
      institution: entry.institution,
      total: entry.people.size,
      byStage: {
        undergrad: entry.undergrad.size,
        ms: entry.ms.size,
        phd: entry.phd.size,
        postdoc: entry.postdoc.size,
      },
      isVietnamese: isVietnameseInstitution(entry.institution),
    }))
    .sort((a, b) => b.total - a.total || a.institution.localeCompare(b.institution));
}

function trajectoryRichness(person: RosterEntry): number {
  let score = 0;
  if (person.undergradInstitution) score += 2;
  if (person.msInstitution) score += 1;
  if (person.phdInstitution) score += 2;
  if (person.postdocInstitution) score += 1;
  if (person.honors?.length) score += 1;
  return score;
}

export function buildUniversityPathways(
  roster: Roster,
  institution: string,
  requestedStage: PathwayStage = 'undergrad',
): UniversityPathways {
  const target = normalizedInst(institution);
  const byStage: Record<Exclude<PathwayStage, 'all'>, RosterEntry[]> = {
    undergrad: [],
    ms: [],
    phd: [],
    postdoc: [],
  };
  const allMatched: RosterEntry[] = [];
  const seenAll = new Set<string>();
  let canonicalName = institution.trim();

  for (const person of roster) {
    for (const { stage, inst } of stagesForPerson(person)) {
      if (inst.toLowerCase() !== target) continue;
      canonicalName = inst;
      byStage[stage].push(person);
      if (!seenAll.has(person.id)) {
        seenAll.add(person.id);
        allMatched.push(person);
      }
    }
  }

  // If the requested stage has 0 records but the university has alumni at another stage,
  // fall back to 'all' so the user always sees real paths.
  const effectiveStage: PathwayStage =
    requestedStage === 'all' ? 'all' : byStage[requestedStage].length > 0 ? requestedStage : 'all';

  const matched = effectiveStage === 'all' ? allMatched : byStage[effectiveStage];

  const sectors = { academia: 0, labs: 0, industry: 0 };
  for (const p of matched) {
    sectors[sectorOf(p)] += 1;
  }

  const trajectories = [...matched]
    .sort(
      (a, b) =>
        trajectoryRichness(b) - trajectoryRichness(a) ||
        (b.honors?.length ?? 0) - (a.honors?.length ?? 0) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 12);

  return {
    institution: canonicalName,
    stage: effectiveStage,
    total: matched.length,
    stageCounts: {
      undergrad: byStage.undergrad.length,
      ms: byStage.ms.length,
      phd: byStage.phd.length,
      postdoc: byStage.postdoc.length,
      all: allMatched.length,
    },
    hostCountries: countStrings(
      matched.map((p) => p.country || 'United States'),
      6,
    ),
    sectors,
    nextPhdInstitutions: countStrings(
      matched.map((p) => canonicalAlmaMater(p.phdInstitution)),
      6,
    ),
    nextPostdocInstitutions: countStrings(
      matched.map((p) => canonicalAlmaMater(p.postdocInstitution)),
      6,
    ),
    topCurrentInstitutions: countStrings(
      matched.map((p) => p.university),
      6,
    ),
    topFields: countStrings(
      matched.map((p) => fieldOf(p.department, p.university, p.researchAreas)),
      6,
    ),
    trajectories,
  };
}

export function defaultPathwayInstitution(roster: Roster): {
  institution: string;
  stage: PathwayStage;
} | null {
  const index = buildAlmaMaterIndex(roster);
  if (!index.length) return null;
  const topVnUg = index
    .filter((entry) => entry.isVietnamese && entry.byStage.undergrad > 0)
    .sort(
      (a, b) =>
        b.byStage.undergrad - a.byStage.undergrad || a.institution.localeCompare(b.institution),
    )[0];
  if (topVnUg) return { institution: topVnUg.institution, stage: 'undergrad' };
  const topUg = index
    .filter((entry) => entry.byStage.undergrad > 0)
    .sort(
      (a, b) =>
        b.byStage.undergrad - a.byStage.undergrad || a.institution.localeCompare(b.institution),
    )[0];
  if (topUg) return { institution: topUg.institution, stage: 'undergrad' };
  return { institution: index[0].institution, stage: 'all' };
}

function renderMiniRankedList(
  items: [string, number][],
  scope: 'phd' | 'university' | 'country' | 'field',
  emptyText: string,
): string {
  if (!items.length) return `<p class="empty-state">${escapeHtml(emptyText)}</p>`;
  const max = items[0][1];
  return `<div class="ranked-list">${items
    .map(([label, count]) => {
      const pct = Math.round((count / max) * 100);
      const display = scope === 'country' ? `${countryFlag(label)} ${label}` : label;
      const attrs =
        scope === 'country'
          ? `data-filter="country" data-value="${escapeHtml(label)}"`
          : scope === 'field'
            ? `data-filter="field" data-value="${escapeHtml(label)}"`
            : `data-search="${escapeHtml(label)}" data-scope="${scope}"`;
      return `
        <button type="button" class="ranked-item" ${attrs} title="Filter directory by ${escapeHtml(label)}">
          <div class="ranked-header">
            <span class="ranked-name">${escapeHtml(display)}</span>
            <span class="ranked-count">${count}</span>
          </div>
          <div class="ranked-track"><div class="ranked-bar" style="width: ${pct}%;"></div></div>
        </button>`;
    })
    .join('')}</div>`;
}

function renderTrajectoryRow(person: RosterEntry, baseUrl: string): string {
  const steps: string[] = [];
  if (person.undergradInstitution) {
    steps.push(
      `UG: ${person.undergradInstitution}${person.undergradYear ? ` (${person.undergradYear})` : ''}`,
    );
  }
  if (person.msInstitution) steps.push(`MS: ${person.msInstitution}`);
  if (person.phdInstitution) {
    steps.push(`PhD: ${person.phdInstitution}${person.phdYear ? ` (${person.phdYear})` : ''}`);
  }
  if (person.postdocInstitution) steps.push(`Postdoc: ${person.postdocInstitution}`);
  const role = canonicalRank(person) || person.track || '';
  const country = person.country || 'United States';
  steps.push(`Now: ${person.university}${role ? ` (${role})` : ''} ${countryFlag(country)}`);

  return `
    <li class="pathway-trajectory-item">
      <div class="pathway-trajectory-head">
        <a class="pathway-person-link" href="${escapeHtml(`${baseUrl}${personPath(person.id)}`)}">${escapeHtml(displayName(person.name))}</a>
        <span class="pathway-person-dept">${escapeHtml(fieldOf(person.department, person.university, person.researchAreas))}</span>
      </div>
      <div class="pathway-steps">${steps
        .map((step) => `<span class="pathway-step">${escapeHtml(step)}</span>`)
        .join('<span class="pathway-arrow" aria-hidden="true">→</span>')}</div>
    </li>`;
}

export function renderPathwayResults(
  roster: Roster,
  institution: string,
  stage: PathwayStage = 'undergrad',
  baseUrl = '/',
): string {
  const pathways = buildUniversityPathways(roster, institution, stage);
  if (pathways.total === 0) {
    return `<div class="pathway-empty">No alumni with a recorded degree or postdoc at <strong>${escapeHtml(institution)}</strong> were found in this view. Try another institution or switch to World view.</div>`;
  }

  const allStageButtons: Array<{ key: PathwayStage; label: string; count: number }> = [
    { key: 'undergrad', label: 'Undergrad', count: pathways.stageCounts.undergrad },
    { key: 'ms', label: "Master's", count: pathways.stageCounts.ms },
    { key: 'phd', label: 'PhD', count: pathways.stageCounts.phd },
    { key: 'postdoc', label: 'Postdoc', count: pathways.stageCounts.postdoc },
    { key: 'all', label: 'Any stage', count: pathways.stageCounts.all },
  ];
  const stageButtons = allStageButtons.filter((s) => s.count > 0 || s.key === 'all');

  const directoryScope =
    pathways.stage === 'undergrad' ? 'undergrad' : pathways.stage === 'phd' ? 'phd' : 'trained';

  const sectorParts: string[] = [];
  if (pathways.sectors.academia) sectorParts.push(`${pathways.sectors.academia} Academia`);
  if (pathways.sectors.labs) sectorParts.push(`${pathways.sectors.labs} Gov & Labs`);
  if (pathways.sectors.industry) sectorParts.push(`${pathways.sectors.industry} Industry`);

  const topField = pathways.topFields[0]?.[0] ?? '—';

  return `
    <div class="pathway-stage-row" role="group" aria-label="Training stage at ${escapeHtml(pathways.institution)}">
      ${stageButtons
        .map(
          (btn) =>
            `<button type="button" class="pathway-stage-btn${pathways.stage === btn.key ? ' is-active' : ''}" data-pathway-stage="${btn.key}" data-pathway-inst="${escapeHtml(pathways.institution)}" aria-pressed="${pathways.stage === btn.key}">${escapeHtml(btn.label)} <span class="pathway-chip-count">${btn.count}</span></button>`,
        )
        .join('')}
    </div>

    <div class="pathway-kpi-grid">
      <div class="pathway-kpi">
        <span class="pathway-kpi-label">Alumni on roster</span>
        <strong class="pathway-kpi-value">${pathways.total}</strong>
      </div>
      <div class="pathway-kpi">
        <span class="pathway-kpi-label">Host countries</span>
        <strong class="pathway-kpi-value">${pathways.hostCountries.length}</strong>
      </div>
      <div class="pathway-kpi">
        <span class="pathway-kpi-label">Sectors</span>
        <strong class="pathway-kpi-value pathway-kpi-small">${escapeHtml(sectorParts.join(' · ') || '—')}</strong>
      </div>
      <div class="pathway-kpi">
        <span class="pathway-kpi-label">Top field</span>
        <strong class="pathway-kpi-value pathway-kpi-small">${escapeHtml(topField)}</strong>
      </div>
    </div>

    <div class="insights-grid pathway-columns">
      <div class="insights-card">
        <h4 class="insights-heading">Where They Earned PhDs</h4>
        <p class="insights-caption">Doctoral institutions recorded for these alumni; click to search.</p>
        ${renderMiniRankedList(pathways.nextPhdInstitutions, 'phd', 'No PhD institutions recorded for this group.')}
      </div>
      <div class="insights-card">
        <h4 class="insights-heading">Where They Are Today</h4>
        <p class="insights-caption">Current host countries in the roster; click to filter.</p>
        ${renderMiniRankedList(pathways.hostCountries, 'country', 'No host country data recorded.')}
      </div>
    </div>

    <div class="pathway-trajectories-card">
      <div class="pathway-trajectories-header">
        <div>
          <h4 class="insights-heading">Recorded Career Trajectories</h4>
          <p class="insights-caption">Showing ${pathways.trajectories.length} of ${pathways.total} alumni from ${escapeHtml(pathways.institution)} based on explicit degree fields.</p>
        </div>
        <button type="button" class="pathway-browse-btn" data-search="${escapeHtml(pathways.institution)}" data-scope="${directoryScope}">
          Browse all ${pathways.total} in directory →
        </button>
      </div>
      <ol class="pathway-trajectory-list">
        ${pathways.trajectories.map((person) => renderTrajectoryRow(person, baseUrl)).join('')}
      </ol>
    </div>
  `;
}

export function renderPathwayExplorer(
  roster: Roster,
  selectedInstitution?: string,
  selectedStage?: PathwayStage,
  baseUrl = '/',
): string {
  const index = buildAlmaMaterIndex(roster);
  if (!index.length) return '';

  const fallback = defaultPathwayInstitution(roster);
  const activeInst = selectedInstitution?.trim() || fallback?.institution || index[0].institution;
  const activeStage = selectedStage ?? fallback?.stage ?? 'undergrad';

  const quickVnPicks = index
    .filter((entry) => entry.isVietnamese && entry.byStage.undergrad > 0)
    .sort(
      (a, b) =>
        b.byStage.undergrad - a.byStage.undergrad || a.institution.localeCompare(b.institution),
    )
    .slice(0, 8);

  const quickPicks = quickVnPicks.length
    ? quickVnPicks
    : index
        .filter((entry) => entry.byStage.undergrad > 0)
        .sort(
          (a, b) =>
            b.byStage.undergrad - a.byStage.undergrad || a.institution.localeCompare(b.institution),
        )
        .slice(0, 8);

  const datalistOptions = index
    .slice(0, 400)
    .map(
      (entry) =>
        `<option value="${escapeHtml(entry.institution)}">${escapeHtml(entry.institution)} (${entry.total})</option>`,
    )
    .join('');

  return `
    <div class="pathway-explorer" id="pathway-explorer">
      <div class="pathway-explorer-header">
        <div>
          <span class="insights-badge">START FROM MY UNIVERSITY</span>
          <h3 class="insights-heading">Pathway Explorer</h3>
          <p class="insights-caption">Pick a Vietnamese or international alma mater to see where its alumni earned PhDs and where they work today.</p>
        </div>
      </div>

      <div class="pathway-controls">
        <label class="pathway-search-label" for="pathway-institution-input">
          <span>Choose any alma mater (${index.length.toLocaleString()} recorded)</span>
          <div class="pathway-input-row">
            <input
              type="search"
              id="pathway-institution-input"
              class="pathway-input"
              list="pathway-inst-list"
              value="${escapeHtml(activeInst)}"
              placeholder="e.g., Hanoi University of Science and Technology, MIT…"
              autocomplete="off"
            />
            <button type="button" id="pathway-explore-btn" class="pathway-explore-btn">Explore</button>
          </div>
          <datalist id="pathway-inst-list">${datalistOptions}</datalist>
        </label>

        <div class="pathway-quick-picks" role="group" aria-label="Popular Vietnamese alma maters">
          <span class="pathway-quick-label">${quickVnPicks.length ? 'Vietnamese alma maters:' : 'Top alma maters:'}</span>
          ${quickPicks
            .map((entry) => {
              const isActive = entry.institution.toLowerCase() === activeInst.toLowerCase();
              return `<button type="button" class="pathway-chip${isActive ? ' is-active' : ''}" data-pathway-inst="${escapeHtml(entry.institution)}" data-pathway-stage="undergrad" aria-pressed="${isActive}">${escapeHtml(entry.institution)} <span class="pathway-chip-count">${entry.byStage.undergrad}</span></button>`;
            })
            .join('')}
        </div>
      </div>

      <div id="pathway-results" class="pathway-results">
        ${renderPathwayResults(roster, activeInst, activeStage, baseUrl)}
      </div>
    </div>
  `;
}
