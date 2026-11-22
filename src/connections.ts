import './style.css';
import './connections.css';
import './stats-components.css';
import { initGraphExplorer, renderGraphExplorer } from './connections-graph.ts';
import { analyzeMentorshipLineages } from './connection-layouts.ts';
import { renderAddFab } from './add-fab.ts';
import { renderSeeAlso } from './see-also.ts';
import { escapeHtml, formatLocalTimestamp } from './utils.ts';
import { displayName, personPath, type Roster, type RosterEntry } from './data.ts';
import type {
  AcademicRelationship,
  RelationshipDatabase,
  RelationshipType,
} from './relationships.ts';

const app = document.getElementById('app')!;
const base = import.meta.env.BASE_URL;

const TYPE_LABELS: Record<RelationshipType, string> = {
  'doctoral-advisor': 'Doctoral advisor',
  'masters-advisor': "Master's advisor",
  'undergraduate-advisor': 'Undergraduate thesis advisor',
  'postdoctoral-mentor': 'Postdoctoral mentor',
  coauthor: 'Coauthor',
  'grant-collaborator': 'Grant collaborator',
  'patent-coinventor': 'Patent co-inventor',
};

const DIRECTIONAL_TYPES = new Set<RelationshipType>([
  'doctoral-advisor',
  'masters-advisor',
  'undergraduate-advisor',
  'postdoctoral-mentor',
]);

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function runningHead(): string {
  return `<p class="man-running-head">
    <span>CONNECTIONS(1)</span>
    <span class="man-running-title"><a class="man-running-brand" href="${base}index.html" aria-label="VietProfs directory"><img class="brand-logo" src="${base}vietprofs-bamboo-v.svg" alt="" width="20" height="20"><span class="man-running-label">Statistics &amp; Insights</span></a></span>
    <span>CONNECTIONS(1)</span>
  </p>`;
}

interface Edge {
  relationship: AcademicRelationship;
  source: RosterEntry;
  target: RosterEntry;
}

function personLink(person: RosterEntry): string {
  return `<a href="${escapeHtml(`${base}${personPath(person.id)}`)}">${escapeHtml(displayName(person.name))}</a>`;
}

function edgeArrow(relationship: AcademicRelationship): string {
  return DIRECTIONAL_TYPES.has(relationship.type) ? '→' : '↔';
}

function renderMetrics(roster: Roster, database: RelationshipDatabase): string {
  const connected = new Set<string>();
  for (const relationship of database.relationships) {
    connected.add(relationship.sourceId);
    connected.add(relationship.targetId);
  }
  const typeCount = new Set(database.relationships.map((relationship) => relationship.type)).size;
  const cards = [
    [
      'Verified connections',
      formatNumber(database.relationships.length),
      `${typeCount} relationship type${typeCount === 1 ? '' : 's'}`,
    ],
    [
      'People with a connection',
      formatNumber(connected.size),
      `of ${formatNumber(roster.length)} roster entries`,
    ],
    [
      'Doctoral advising links',
      formatNumber(database.relationships.filter((r) => r.type === 'doctoral-advisor').length),
      'Advisor → advisee, roster-to-roster',
    ],
    [
      'Coauthor links',
      formatNumber(database.relationships.filter((r) => r.type === 'coauthor').length),
      'Two or more shared works',
    ],
  ];
  return `<div class="browser-metric-grid">${cards
    .map(
      ([label, value, detail]) => `<article class="browser-metric-card">
    <p class="browser-metric-label">${escapeHtml(label)}</p>
    <p class="browser-metric-value">${escapeHtml(value)}</p>
    <p class="browser-metric-detail">${escapeHtml(detail)}</p>
  </article>`,
    )
    .join('')}</div>`;
}

function renderTypeBreakdown(database: RelationshipDatabase): string {
  const counts = new Map<RelationshipType, number>();
  for (const relationship of database.relationships) {
    counts.set(relationship.type, (counts.get(relationship.type) ?? 0) + 1);
  }
  const total = database.relationships.length;
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!rows.length) return '<p class="no-data">No verified connections have been recorded yet.</p>';
  return `<div class="stats-table-wrapper"><table class="stats-table"><thead><tr><th>Relationship type</th><th class="num-col">Connections</th><th class="num-col">Share</th></tr></thead>
    <tbody>${rows.map(([type, count]) => `<tr><td>${escapeHtml(TYPE_LABELS[type])}</td><td class="num-col">${formatNumber(count)}</td><td class="num-col">${((count / total) * 100).toFixed(1)}%</td></tr>`).join('')}</tbody></table></div>`;
}

function renderTopConnected(roster: Roster, database: RelationshipDatabase): string {
  const byId = new Map(roster.map((person) => [person.id, person]));
  const counts = new Map<string, number>();
  for (const relationship of database.relationships) {
    counts.set(relationship.sourceId, (counts.get(relationship.sourceId) ?? 0) + 1);
    counts.set(relationship.targetId, (counts.get(relationship.targetId) ?? 0) + 1);
  }
  const rows = [...counts.entries()]
    .map(([id, count]) => ({ person: byId.get(id), count }))
    .filter((row): row is { person: RosterEntry; count: number } => Boolean(row.person))
    .sort((a, b) => b.count - a.count || a.person.name.localeCompare(b.person.name))
    .slice(0, 15);
  if (!rows.length) return '<p class="no-data">No verified connections have been recorded yet.</p>';
  return `<div class="stats-table-wrapper"><table class="stats-table"><thead><tr><th>Person</th><th>University</th><th class="num-col">Connections</th></tr></thead>
    <tbody>${rows.map(({ person, count }) => `<tr><td>${personLink(person)}</td><td>${escapeHtml(person.university)}</td><td class="num-col">${formatNumber(count)}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderAllConnections(roster: Roster, database: RelationshipDatabase): string {
  const byId = new Map(roster.map((person) => [person.id, person]));
  const edges: Edge[] = database.relationships.flatMap((relationship) => {
    const source = byId.get(relationship.sourceId);
    const target = byId.get(relationship.targetId);
    return source && target ? [{ relationship, source, target }] : [];
  });
  edges.sort(
    (a, b) =>
      TYPE_LABELS[a.relationship.type].localeCompare(TYPE_LABELS[b.relationship.type]) ||
      a.source.name.localeCompare(b.source.name),
  );
  if (!edges.length)
    return '<p class="no-data">No verified connections have been recorded yet.</p>';
  return `<details class="stats-secondary-details"><summary><strong>View all ${formatNumber(edges.length)} verified connections</strong></summary>
    <div class="stats-table-wrapper"><table class="stats-table"><thead><tr><th>Type</th><th>From</th><th></th><th>To</th><th>Evidence</th></tr></thead>
    <tbody>${edges
      .map(
        ({ relationship, source, target }) => `<tr>
      <td>${escapeHtml(TYPE_LABELS[relationship.type])}</td>
      <td>${personLink(source)}</td>
      <td>${edgeArrow(relationship)}</td>
      <td>${personLink(target)}</td>
      <td><a href="${escapeHtml(relationship.sources[0])}" target="_blank" rel="noopener noreferrer">source</a></td>
    </tr>`,
      )
      .join('')}</tbody></table></div>
  </details>`;
}

function renderMentorshipLineages(roster: Roster, database: RelationshipDatabase): string {
  const byId = new Map(roster.map((person) => [person.id, person]));
  const analysis = analyzeMentorshipLineages(database.relationships);
  if (analysis.mentorshipEdgeCount === 0) {
    return '<p class="no-data">No verified mentorship links have been recorded yet.</p>';
  }

  const cards = [
    [
      'Mentorship links',
      formatNumber(analysis.mentorshipEdgeCount),
      'Advisor & postdoc mentor edges',
    ],
    ['Verified mentors', formatNumber(analysis.mentorCount), 'Distinct advisors on record'],
    ['Verified mentees', formatNumber(analysis.menteeCount), 'Distinct advisees on record'],
    [
      'Longest lineage',
      `${analysis.maxGenerations} gen`,
      analysis.multiGenChains.length
        ? `${analysis.multiGenChains.length} multi-generation chain${analysis.multiGenChains.length === 1 ? '' : 's'}`
        : 'Direct mentor → mentee pairs',
    ],
  ];

  const mentorRows = analysis.topMentors
    .slice(0, 12)
    .map((mentor) => ({ mentor, person: byId.get(mentor.id) }))
    .filter((row): row is { mentor: (typeof analysis.topMentors)[number]; person: RosterEntry } =>
      Boolean(row.person),
    );

  const mentorsTable = mentorRows.length
    ? `<h3 class="lineage-subheading">Top Verified Mentors</h3>
      <div class="stats-table-wrapper"><table class="stats-table"><thead><tr><th>Mentor</th><th>Institution</th><th>Roles</th><th class="num-col">Mentees</th></tr></thead>
      <tbody>${mentorRows
        .map(
          ({ mentor, person }) =>
            `<tr><td>${personLink(person)}</td><td>${escapeHtml(person.university)}</td><td>${escapeHtml(mentor.types.map((t) => TYPE_LABELS[t]).join(', '))}</td><td class="num-col">${formatNumber(mentor.count)}</td></tr>`,
        )
        .join('')}</tbody></table></div>`
    : '';

  const chainsHtml = analysis.multiGenChains.length
    ? `<h3 class="lineage-subheading">Multi-Generational Academic Lineages</h3>
      <ol class="mentorship-lineage-list">${analysis.multiGenChains
        .slice(0, 10)
        .map((chain) => {
          const steps = chain.ids
            .map((id, idx) => {
              const person = byId.get(id);
              const label = person ? personLink(person) : escapeHtml(id);
              const edge = chain.edges[idx];
              const arrow = edge
                ? ` <span class="lineage-edge-tag" title="${escapeHtml(TYPE_LABELS[edge.type])}">→</span> `
                : '';
              return `<span class="lineage-node">${label}</span>${arrow}`;
            })
            .join('');
          return `<li class="mentorship-lineage-item"><span class="lineage-gen-badge">${chain.ids.length} gen</span><div class="lineage-chain">${steps}</div></li>`;
        })
        .join('')}</ol>`
    : '';

  return `
    <div class="browser-metric-grid">${cards
      .map(
        ([label, value, detail]) => `<article class="browser-metric-card">
      <p class="browser-metric-label">${escapeHtml(label)}</p>
      <p class="browser-metric-value">${escapeHtml(value)}</p>
      <p class="browser-metric-detail">${escapeHtml(detail)}</p>
    </article>`,
      )
      .join('')}</div>
    <div class="lineage-actions">
      <button type="button" id="focus-lineage-btn" class="lineage-focus-btn">Open Mentorship Lineage View in Graph ↑</button>
    </div>
    ${chainsHtml}
    ${mentorsTable}
  `;
}

function renderConnections(roster: Roster, database: RelationshipDatabase): string {
  return `<main><article class="man-page stats-man-page">
    ${runningHead()}
    <section class="man-section name-section"><div class="identity"><div class="identity-details"><div class="name-heading"><h1>Research Connections</h1></div>
      <p class="synopsis stats-snapshot">Last updated: <time datetime="${escapeHtml(database.updatedAt)}">${escapeHtml(formatLocalTimestamp(database.updatedAt))}</time></p>
    </div></div></section>
    <section class="man-section"><h2>AT A GLANCE</h2>${renderMetrics(roster, database)}</section>
    ${renderGraphExplorer()}
    <section class="man-section"><h2>MENTORSHIP &amp; ACADEMIC LINEAGES</h2>${renderMentorshipLineages(roster, database)}</section>
    <section class="man-section"><h2>CONNECTIONS BY TYPE</h2>${renderTypeBreakdown(database)}</section>
    <section class="man-section"><h2>MOST CONNECTED PEOPLE</h2>${renderTopConnected(roster, database)}</section>
    <section class="man-section"><h2>ALL CONNECTIONS</h2>${renderAllConnections(roster, database)}</section>
    <section class="man-section privacy-section"><h2>METHODOLOGY</h2><div class="privacy-note">
      <p>Every connection listed here is independently verified against public evidence (advisor pages, dissertations, shared publications, shared grant or patent records) before being added — see each row's source link. Coauthor, grant-collaborator, and patent-coinventor links require multiple independently attributable shared works; advisor and mentor links are directional and verified against an official advisor-side listing where possible. This view only shows connections between two people already on the VietProfs roster.</p>
    </div></section>
    ${renderSeeAlso(base, 'connections')}
  </article></main>${renderAddFab(`${base}submit.html`)}`;
}

function renderLoading(): string {
  return `<main><article class="man-page stats-man-page">${runningHead()}<section class="man-section"><h1>Research Connections</h1><div class="stats-loading-box"><p>Loading connections…</p></div></section></article></main>${renderAddFab(`${base}submit.html`)}`;
}

function renderError(message: string): string {
  return `<main><article class="man-page stats-man-page">${runningHead()}<section class="man-section name-section"><h1>Research Connections</h1></section>
    <section class="man-section"><h2>CONNECTIONS</h2><div class="stats-error-box" role="alert"><p class="error-title">Connections data is temporarily unavailable.</p><p class="error-detail">${escapeHtml(message)}</p><button type="button" id="retry-btn" class="retry-btn">Retry</button></div></section>${renderSeeAlso(base, 'connections')}</article></main>${renderAddFab(`${base}submit.html`)}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const cacheBuster =
    typeof __BUILD_COMMIT__ !== 'undefined' && __BUILD_COMMIT__ ? `?v=${__BUILD_COMMIT__}` : '';
  const response = await fetch(`${base}${path}${cacheBuster}`);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.json() as Promise<T>;
}

async function init(): Promise<void> {
  app.innerHTML = renderLoading();
  try {
    const [roster, database] = await Promise.all([
      fetchJson<Roster>('data.json'),
      fetchJson<RelationshipDatabase>('relationships.json'),
    ]);
    app.innerHTML = renderConnections(roster, database);
    initGraphExplorer(roster, database);
    document.getElementById('focus-lineage-btn')?.addEventListener('click', () => {
      const lineageBtn = document.querySelector<HTMLButtonElement>('[data-mode="lineage"]');
      lineageBtn?.click();
      document.querySelector('.connection-explorer')?.scrollIntoView({ behavior: 'smooth' });
    });
    // Land ready to type in "Find a person", as the directory does with its search.
    if (document.activeElement === document.body)
      document.querySelector<HTMLInputElement>('#network-search')?.focus({ preventScroll: true });
  } catch (error) {
    app.innerHTML = renderError(error instanceof Error ? error.message : 'Unknown error');
    document.getElementById('retry-btn')?.addEventListener('click', () => void init());
  }
}

void init();
