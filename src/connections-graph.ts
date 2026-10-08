import { displayName, personPath, type Roster } from './data.ts';
import { RELATIONSHIP_TYPES, type AcademicRelationship, type RelationshipDatabase, type RelationshipType } from './relationships.ts';
import { escapeHtml } from './utils.ts';
import { connectionPath, lineageLayout, isMentorship } from './connection-layouts.ts';

const LABELS: Record<RelationshipType, string> = {
  'doctoral-advisor': 'Doctoral advisor', 'masters-advisor': "Master’s advisor",
  'undergraduate-advisor': 'Undergraduate thesis advisor', 'postdoctoral-mentor': 'Postdoctoral mentor',
  coauthor: 'Coauthor', 'grant-collaborator': 'Grant collaborator', 'patent-coinventor': 'Patent co-inventor',
};
const COLORS: Record<RelationshipType, string> = {
  'doctoral-advisor': '#a875e5', 'masters-advisor': '#d28c35', 'undergraduate-advisor': '#d4578c',
  'postdoctoral-mentor': '#df685b', coauthor: '#2e9e64', 'grant-collaborator': '#459ed1', 'patent-coinventor': '#989b36',
};
const directed = (edge: AcademicRelationship): boolean => edge.type.endsWith('advisor') || edge.type === 'postdoctoral-mentor';
const normalize = (value: string): string => value.normalize('NFD').replace(/\p{M}/gu, '').replace(/[đĐ]/g, 'd').toLowerCase();
interface Point { x: number; y: number }

/** Stable component packing keeps unrelated pairs from collapsing into one large cloud. */
function layout(edges: AcademicRelationship[]): { points: Map<string, Point>; height: number } {
  const adjacency = new Map<string, Set<string>>();
  for (const edge of edges) {
    for (const [a, b] of [[edge.sourceId, edge.targetId], [edge.targetId, edge.sourceId]]) {
      if (!adjacency.has(a)) adjacency.set(a, new Set());
      adjacency.get(a)!.add(b);
    }
  }
  const seen = new Set<string>();
  const groups: string[][] = [];
  for (const id of [...adjacency.keys()].sort()) {
    if (seen.has(id)) continue;
    const queue = [id], group: string[] = [];
    seen.add(id);
    while (queue.length) {
      const next = queue.pop()!;
      group.push(next);
      for (const neighbor of adjacency.get(next)!) {
        if (!seen.has(neighbor)) { seen.add(neighbor); queue.push(neighbor); }
      }
    }
    groups.push(group.sort());
  }
  groups.sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]));
  const componentSize = (count: number): number => Math.max(150, Math.min(700, 85 * Math.sqrt(count)));
  const packingWidth = Math.max(800, Math.sqrt(groups.reduce((area, group) => area + componentSize(group.length) ** 2, 0) * 1.6));
  const points = new Map<string, Point>();
  let x = 0, y = 0, rowHeight = 0;
  for (const group of groups) {
    const size = componentSize(group.length);
    if (x + size > packingWidth && x > 0) { x = 0; y += rowHeight; rowHeight = 0; }
    const local = group.map((id, i) => ({ id, x: Math.cos(i * Math.PI * 2 / group.length) * size / 3, y: Math.sin(i * Math.PI * 2 / group.length) * size / 3 }));
    // Bounded, synchronous settling: no motion loop or random layout on reload.
    for (let step = 0; step < 100; step++) {
      const shifts = local.map(() => ({ x: 0, y: 0 }));
      for (let i = 0; i < local.length; i++) {
        for (let j = i + 1; j < local.length; j++) {
          const dx = local[j].x - local[i].x, dy = local[j].y - local[i].y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const force = -1600 / (distance * distance) + (adjacency.get(local[i].id)!.has(local[j].id) ? (distance - 65) * 0.025 : 0);
          shifts[i].x += dx / distance * force; shifts[i].y += dy / distance * force;
          shifts[j].x -= dx / distance * force; shifts[j].y -= dy / distance * force;
        }
      }
      local.forEach((point, i) => { point.x = Math.max(-size / 2 + 30, Math.min(size / 2 - 30, point.x + shifts[i].x)); point.y = Math.max(-size / 2 + 30, Math.min(size / 2 - 30, point.y + shifts[i].y)); });
    }
    for (const point of local) points.set(point.id, { x: x + size / 2 + point.x, y: y + size / 2 + point.y });
    x += size; rowHeight = Math.max(rowHeight, size);
  }
  const scale = 800 / packingWidth;
  for (const point of points.values()) { point.x *= scale; point.y *= scale; }
  return { points, height: Math.max(240, (y + rowHeight) * scale) };
}

export function renderGraphExplorer(): string {
  return `<section class="man-section"><h2>EXPLORE THE NETWORK</h2>
    <p>Shows verified relationships recorded in VietProfs. Missing links do not mean no relationship exists.</p>
    <div id="connection-explorer" class="connection-explorer">
      <label class="network-mode-label">Explore<select id="network-mode"><option value="network">Network overview</option><option value="lineage">Academic lineage</option><option value="path">Connection path</option></select></label>
      <p id="network-mode-help" class="network-help"></p>
      <div id="network-path-controls" class="connection-path-controls" hidden>
        <label>From<select id="network-path-start"><option value="">Choose a person</option></select></label>
        <label>To<select id="network-path-end"><option value="">Choose a person</option></select></label>
      </div>
      <div class="connection-controls">
        <label>Find a person<input id="network-search" type="search" placeholder="Name or institution" aria-controls="network-results" autocomplete="off"></label>
        <label>Relationship<select id="network-type"><option value="">All types</option></select></label>
        <label>Person’s network<select id="network-depth"><option value="1">Direct connections</option><option value="2">Two steps away</option></select></label>
      </div>
      <div id="network-results" class="network-results" aria-label="People matching your search"></div>
      <div class="network-toolbar" role="group" aria-label="Network view">
        <button type="button" id="network-graph-toggle" aria-pressed="true">Graph</button>
        <button type="button" id="network-table-toggle" aria-pressed="false">Table</button>
        <button type="button" id="network-clear">Show all people</button>
      </div>
      <p id="network-summary" class="stat-sub" role="status"></p>
      <div id="network-graph-panel">
        <div class="network-toolbar" role="group" aria-label="Graph navigation">
          <button type="button" id="network-zoom-in" aria-label="Zoom in">+</button>
          <button type="button" id="network-zoom-out" aria-label="Zoom out">−</button>
          <button type="button" id="network-fit">Fit graph</button>
        </div>
        <p class="network-help" id="network-help">Drag the background to pan. Drag a person to rearrange. Select a person or line for details. Use Tab and Enter to select people and connections.</p>
        <div class="network-canvas"><svg id="network-svg" viewBox="0 0 800 500" role="group" aria-label="Verified academic relationship graph" aria-describedby="network-help"></svg></div>
        <div id="network-legend" class="network-legend" aria-label="Relationship legend"></div>
      </div>
      <div id="network-table-panel" class="stats-table-wrapper" hidden></div>
      <div id="network-path-result" class="network-details" hidden></div>
      <aside id="network-details" class="network-details" aria-label="Selected person or relationship"><p>Select a person or connection to explore its details and sources.</p></aside>
    </div>
  </section>`;
}

export function initGraphExplorer(roster: Roster, database: RelationshipDatabase): void {
  const root = document.getElementById('connection-explorer')!;
  const byId = new Map(roster.map(person => [person.id, person]));
  const valid = database.relationships.filter(edge => byId.has(edge.sourceId) && byId.has(edge.targetId));
  const connectedIds = new Set(valid.flatMap(edge => [edge.sourceId, edge.targetId]));
  const people = roster.filter(person => connectedIds.has(person.id)).sort((a, b) => a.name.localeCompare(b.name));
  const get = <T extends HTMLElement>(id: string): T => root.querySelector<T>(`#${id}`)!;
  const search = get<HTMLInputElement>('network-search'), type = get<HTMLSelectElement>('network-type');
  const depth = get<HTMLSelectElement>('network-depth');
  const mode = get<HTMLSelectElement>('network-mode');
  const pathStart = get<HTMLSelectElement>('network-path-start');
  const pathEnd = get<HTMLSelectElement>('network-path-end');
  const options = [...roster].sort((a, b) => a.name.localeCompare(b.name)).map(person => `<option value="${person.id}">${escapeHtml(displayName(person.name))} · ${escapeHtml(person.university)}</option>`).join('');
  pathStart.innerHTML += options; pathEnd.innerHTML += options;
  let pathIds: string[] = [];
  let modeMessage = '';
  const svg = root.querySelector<SVGSVGElement>('#network-svg')!;
  const details = get('network-details');
  const link = (id: string): string => `<a href="${escapeHtml(`${import.meta.env.BASE_URL}${personPath(id)}`)}">${escapeHtml(displayName(byId.get(id)!.name))}</a>`;
  let selected = '', visible: AcademicRelationship[] = [], points = new Map<string, Point>();
  let zoom = 1, panX = 0, panY = 0, moved = false;
  type.innerHTML += RELATIONSHIP_TYPES.filter(t => valid.some(edge => edge.type === t)).map(t => `<option value="${t}">${escapeHtml(LABELS[t])}</option>`).join('');

  function transform(): void { svg.querySelector('#network-layer')?.setAttribute('transform', `translate(${panX} ${panY}) scale(${zoom})`); }
  function evidence(edge: AcademicRelationship): void {
    details.innerHTML = `<h3>${escapeHtml(LABELS[edge.type])}</h3><p>${link(edge.sourceId)} ${directed(edge) ? '→' : '↔'} ${link(edge.targetId)}</p>
      <p>${escapeHtml(edge.evidence)}</p>${edge.notes ? `<p>${escapeHtml(edge.notes)}</p>` : ''}
      ${edge.works.length ? `<ul>${edge.works.map(work => `<li><a href="${escapeHtml(work.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(work.title)}</a> (${escapeHtml(work.date)})</li>`).join('')}</ul>` : ''}
      <p>Sources: ${edge.sources.map((source, i) => `<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">Source ${i + 1}</a>`).join(' · ')}</p>`;
  }
  function personDetails(): void {
    const person = byId.get(selected);
    if (!person) { details.innerHTML = '<p>Select a person or connection to explore its details and sources.</p>'; return; }
    const edges = visible.filter(edge => edge.sourceId === selected || edge.targetId === selected);
    details.innerHTML = `<h3>${link(selected)}</h3><p>${escapeHtml(person.university)}</p><p>${escapeHtml(person.department)}</p>
      <ul>${edges.map(edge => { const other = edge.sourceId === selected ? edge.targetId : edge.sourceId; return `<li><button type="button" data-person="${other}">${escapeHtml(displayName(byId.get(other)!.name))}</button> · <button type="button" data-edge="${edge.id}">${escapeHtml(LABELS[edge.type])}${directed(edge) ? (edge.sourceId === selected ? ' →' : ' ←') : ''}</button></li>`; }).join('')}</ul>
      ${!edges.length ? '<p>No recorded connections match this relationship filter.</p>' : ''}`;
  }
  function draw(): void {
    svg.innerHTML = `<defs>${RELATIONSHIP_TYPES.map(t => `<marker id="arrow-${t}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="${COLORS[t]}"/></marker>`).join('')}</defs><g id="network-layer">
      ${visible.map(edge => {
        const a = points.get(edge.sourceId)!, b = points.get(edge.targetId)!;
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const siblings = visible.filter(other => [other.sourceId, other.targetId].sort().join('|') === [edge.sourceId, edge.targetId].sort().join('|'));
        const bend = (siblings.indexOf(edge) - (siblings.length - 1) / 2) * 30;
        const direction = edge.sourceId < edge.targetId ? 1 : -1;
        const curve = `M${a.x + Math.cos(angle) * 10} ${a.y + Math.sin(angle) * 10} Q${(a.x + b.x) / 2 - Math.sin(angle) * bend * direction} ${(a.y + b.y) / 2 + Math.cos(angle) * bend * direction} ${b.x - Math.cos(angle) * 12} ${b.y - Math.sin(angle) * 12}`;
        const dash = directed(edge) ? 'stroke-dasharray="5 3"' : '';
        return `<g class="network-edge" role="button" tabindex="0" data-edge="${edge.id}" aria-label="${escapeHtml(`${byId.get(edge.sourceId)!.name}, ${LABELS[edge.type]}, ${byId.get(edge.targetId)!.name}`)}"><title>${escapeHtml(LABELS[edge.type])}</title><path d="${curve}" fill="none" stroke="${COLORS[edge.type]}" stroke-width="2" ${dash} ${directed(edge) ? `marker-end="url(#arrow-${edge.type})"` : ''}/><path d="${curve}" fill="none" stroke="transparent" stroke-width="14"/></g>`;
      }).join('')}
      ${[...points].map(([id, point]) => `<g class="network-node${selected || mode.value !== 'network' ? ' in-person-view' : ''}${id === selected ? ' is-selected' : ''}" transform="translate(${point.x} ${point.y})" role="button" tabindex="0" data-person="${id}" aria-label="${escapeHtml(`${byId.get(id)!.name}, ${byId.get(id)!.university}`)}"><title>${escapeHtml(`${byId.get(id)!.name} · ${byId.get(id)!.university}`)}</title><circle r="9"/><text x="14" y="4">${escapeHtml(displayName(byId.get(id)!.name))}</text></g>`).join('')}</g>`;
    if (!points.size) svg.innerHTML += '<text x="400" y="120" text-anchor="middle" fill="currentColor">No recorded connections match this view.</text>';
    transform();
  }
  function render(): void {
    visible = valid.filter(edge => !type.value || edge.type === type.value);
    if (mode.value === 'lineage') visible = visible.filter(isMentorship);
    pathIds = [];
    modeMessage = '';
    if (mode.value === 'path') {
      if (!pathStart.value || !pathEnd.value) {
        visible = [];
        modeMessage = 'Choose two people to find a connection path.';
      } else {
        const path = connectionPath(visible, pathStart.value, pathEnd.value);
        visible = path?.edges ?? [];
        pathIds = path?.ids ?? [];
        modeMessage = path ? (path.edges.length ? `Shortest recorded path: ${path.edges.length} step${path.edges.length === 1 ? '' : 's'}.` : 'Choose two different people to explore a connection path.') : 'No path is recorded between these people with the current relationship filter. This does not mean they have no connection.';
      }
    }
    if (selected && mode.value !== 'path') {
      const ids = new Set([selected]);
      for (let step = 0; step < (mode.value === 'lineage' ? roster.length : Number(depth.value)); step++) {
        const frontier = new Set(ids);
        for (const edge of visible) if (frontier.has(edge.sourceId) || frontier.has(edge.targetId)) { ids.add(edge.sourceId); ids.add(edge.targetId); }
      }
      visible = visible.filter(edge => ids.has(edge.sourceId) && ids.has(edge.targetId));
    }
    const arranged = mode.value === 'lineage' ? lineageLayout(visible) : layout(visible);
    points = arranged.points;
    if ('hasCycle' in arranged && arranged.hasCycle) modeMessage = 'Some mentorship records form a cycle. Those people and their descendants appear in a separate row without an assigned generation.';
    if (mode.value === 'path') {
      points = new Map(pathIds.map((id, index) => [id, { x: 100, y: 60 + index * 110 }]));
      arranged.height = Math.max(240, pathIds.length * 110 + 40);
    }
    if (selected && mode.value !== 'path' && !points.has(selected)) points.set(selected, { x: 400, y: 120 });
    svg.setAttribute('viewBox', `0 0 ${'width' in arranged ? arranged.width : 800} ${arranged.height}`);
    zoom = 1; panX = panY = 0;
    draw();
    get('network-depth').toggleAttribute('disabled', !selected || mode.value !== 'network');
    get('network-path-controls').hidden = mode.value !== 'path';
    get('network-mode-help').textContent = mode.value === 'lineage' ? 'Advisor and mentor → advisee. Rows follow recorded mentorship links, not dates. Select a person to explore their full mentorship group. Pan sideways to explore wide rows.' : mode.value === 'path' ? 'Finds one shortest path through recorded relationships, in either direction. Advisor arrows keep their original direction. The relationship filter applies to the whole path.' : 'Explore recorded relationships, or select a person to see their network.';
    get('network-clear').textContent = mode.value === 'path' ? 'Clear path' : 'Show all people';
    get('network-summary').textContent = modeMessage || `${points.size} people · ${visible.length} verified relationships${selected && mode.value !== 'path' ? ` · Network of ${displayName(byId.get(selected)!.name)}` : ' · People with recorded connections only'}`;
    get('network-legend').innerHTML = RELATIONSHIP_TYPES.filter(t => visible.some(edge => edge.type === t)).map(t => `<span><i style="--edge-color:${COLORS[t]}" class="${t.endsWith('advisor') || t === 'postdoctoral-mentor' ? 'directional' : ''}"></i>${escapeHtml(LABELS[t])}${t.endsWith('advisor') || t === 'postdoctoral-mentor' ? ' →' : ''}</span>`).join('');
    get('network-table-panel').innerHTML = visible.length ? `<table class="stats-table"><caption>Connections in the current view</caption><thead><tr><th>From</th><th>Relationship</th><th>To</th><th>Evidence</th></tr></thead><tbody>${visible.map(edge => `<tr><td>${link(edge.sourceId)}</td><td>${escapeHtml(LABELS[edge.type])} ${directed(edge) ? '→' : '↔'}</td><td>${link(edge.targetId)}</td><td><button type="button" data-edge="${edge.id}">View evidence</button></td></tr>`).join('')}</tbody></table>` : '<p>No recorded connections match this view.</p>';
    personDetails();
    const pathResult = get('network-path-result');
    pathResult.hidden = mode.value !== 'path' || !pathIds.length;
    pathResult.innerHTML = pathIds.length ? `<h3>Recorded connection path</h3><ol>${pathIds.map((id, index) => `<li>${link(id)}${visible[index] ? `<p><button type="button" data-edge="${visible[index].id}">${escapeHtml(LABELS[visible[index].type])} ${directed(visible[index]) ? (visible[index].sourceId === id ? '→' : '←') : '↔'} · View evidence</button></p>` : ''}</li>`).join('')}</ol>` : '';
  }
  function activate(target: Element): void {
    const person = target.closest('[data-person]')?.getAttribute('data-person');
    const edge = target.closest('[data-edge]')?.getAttribute('data-edge');
    if (person) { selected = person; render(); svg.querySelector<SVGGElement>(`[data-person="${person}"]`)?.focus({ preventScroll: true }); }
    else if (edge) { const found = valid.find(item => item.id === edge); if (found) evidence(found); }
  }
  root.addEventListener('click', event => { if (moved) { moved = false; return; } if (event.target instanceof Element) activate(event.target); });
  svg.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof Element) { event.preventDefault(); activate(event.target); } });
  search.addEventListener('input', () => {
    const query = normalize(search.value.trim());
    const matches = query ? people.filter(person => normalize(`${person.name} ${person.vietnameseName ?? ''} ${person.university}`).includes(query)) : [];
    get('network-results').innerHTML = matches.slice(0, 12).map(person => `<button type="button" data-person="${person.id}">${escapeHtml(displayName(person.name))}<small>${escapeHtml(person.university)}</small></button>`).join('') + (query && !matches.length ? '<p>No people with recorded connections match your search.</p>' : matches.length > 12 ? '<p>Showing the first 12 matches. Refine your search to find more.</p>' : '');
  });
  mode.addEventListener('change', () => { selected = ''; type.value = ''; render(); });
  pathStart.addEventListener('change', () => { selected = ''; render(); });
  pathEnd.addEventListener('change', () => { selected = ''; render(); });
  type.addEventListener('change', render); depth.addEventListener('change', render);
  get('network-clear').addEventListener('click', () => { selected = ''; pathStart.value = ''; pathEnd.value = ''; search.value = ''; get('network-results').innerHTML = ''; render(); });
  for (const view of ['graph', 'table']) get(`network-${view}-toggle`).addEventListener('click', () => {
    get('network-graph-panel').hidden = view !== 'graph'; get('network-table-panel').hidden = view !== 'table';
    get('network-graph-toggle').setAttribute('aria-pressed', String(view === 'graph')); get('network-table-toggle').setAttribute('aria-pressed', String(view === 'table'));
  });
  function scale(factor: number): void {
    const next = Math.max(0.5, Math.min(5, zoom * factor));
    const height = svg.viewBox.baseVal.height;
    const center = svg.viewBox.baseVal.width / 2;
    panX = center - (center - panX) * next / zoom; panY = height / 2 - (height / 2 - panY) * next / zoom; zoom = next; transform();
  }
  get('network-zoom-in').addEventListener('click', () => scale(1.3));
  get('network-zoom-out').addEventListener('click', () => scale(1 / 1.3));
  get('network-fit').addEventListener('click', () => { zoom = 1; panX = panY = 0; transform(); });
  let drag: { x: number; y: number; id: string | null; pointerId: number } | null = null;
  const svgPoint = (event: PointerEvent): DOMPoint => new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
  svg.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const point = svgPoint(event);
    drag = { x: point.x, y: point.y, id: (event.target as Element).closest('[data-person]')?.getAttribute('data-person') ?? null, pointerId: event.pointerId };
    moved = false;
    svg.setPointerCapture(event.pointerId);
  });
  svg.addEventListener('pointermove', event => {
    if (!drag) return;
    const point = svgPoint(event), dx = point.x - drag.x, dy = point.y - drag.y;
    if (!moved && Math.hypot(dx, dy) < 3) return;
    moved = true;
    if (drag.id) { const node = points.get(drag.id)!; node.x += dx / zoom; node.y += dy / zoom; draw(); }
    else { panX += dx; panY += dy; transform(); }
    drag.x = point.x; drag.y = point.y;
  });
  svg.addEventListener('pointerup', event => {
    if (drag && !moved) { const target = document.elementFromPoint(event.clientX, event.clientY); if (target && svg.contains(target)) activate(target); }
    drag = null;
    // Captured pointer clicks are handled above; suppress the following synthetic click.
    moved = true;
    setTimeout(() => { moved = false; }, 0);
  });
  svg.addEventListener('pointercancel', () => { drag = null; moved = false; });
  render();
}
