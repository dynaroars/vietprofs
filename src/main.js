import './style.css';
import { loadRoster, uniqueStates, uniqueDepartments, FIELDS, fieldOf, filterRoster, sortRoster } from './data.js';
import { escapeHtml } from './utils.js';

const app = document.getElementById('app');

function pickRandomUnique(values, count) {
  const pool = [...new Set(values)];
  const result = [];
  while (result.length < count && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}

function debounce(fn, delayMs) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

function renderShell() {
  app.innerHTML = `
    <header>
      <div class="title-row">
        <h1>Vietnamese Profs. in the US</h1>
        <a class="github-link" href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer" aria-label="View VietProfs on GitHub" title="View source on GitHub"></a>
        <a class="icon-link roars-link" href="https://roars.dev" target="_blank" rel="noopener noreferrer" aria-label="ROARS Lab" title="ROARS Lab"></a>
        <a class="icon-link" href="https://github.com/dynaroars/vietprofs/blob/main/FAQ.md" target="_blank" rel="noopener noreferrer" aria-label="Frequently asked questions" title="Frequently asked questions"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 2-2.8 2.4-2.8 4.2"/><circle cx="12" cy="17.6" r="1.1" fill="currentColor" stroke="none"/></svg></a>
      </div>
    </header>
    <div class="controls">
      <input id="search" class="search-input" type="search" list="search-suggestions" placeholder="Search name, university, department, location, or area…" aria-label="Search" />
      <datalist id="search-suggestions"></datalist>
      <select id="field-filter" class="field-select" aria-label="Filter by field">
        <option value="all">All fields</option>
      </select>
    </div>
    <div class="examples" id="examples"></div>
    <p class="result-count" id="result-count" aria-live="polite"></p>
    <div class="roster" id="roster"></div>
  `;
}

function renderRoster(roster) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  const universities = new Set(roster.map((p) => p.university)).size;
  const states = new Set(roster.map((p) => p.state)).size;
  countEl.innerHTML = `${roster.length} <span class="term" tabindex="0" data-tooltip="On the tenure track or already tenured — not adjunct, visiting, teaching-only, research-track, or emeritus.">tenure-line</span> professor${roster.length === 1 ? '' : 's'} across ${universities} universit${universities === 1 ? 'y' : 'ies'} in ${states} state${states === 1 ? '' : 's'}. <a class="submission-link" href="https://vietprofs.roars.dev/submit.html">Add or update info.</a>`;

  if (roster.length === 0) {
    rosterEl.innerHTML = '<p class="empty-state">No matches. Try a different search or filter.</p>';
    return;
  }

  rosterEl.innerHTML = roster
    .map((p) => {
      const tags = p.researchAreas
        .map((a) => `<span class="tag">${escapeHtml(a)}</span>`)
        .join('');
      return `
        <div class="entry">
          <div class="entry-line">
            <a class="entry-name" href="${escapeHtml(p.websiteUrl ?? p.profileUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.name)}</a>${p.scholarUrl ? ` <a class="scholar-link" href="${escapeHtml(p.scholarUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(p.name)} on Google Scholar" title="Google Scholar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Z"/><path d="M5 12.18V16c0 1.66 3.13 3 7 3s7-1.34 7-3v-3.82l-7 3.82-7-3.82Z"/></svg></a>` : ''}${p.secondaryAppointment ? ' <span class="dagger">†</span>' : ''}
            <span class="entry-meta">${escapeHtml(p.university)} · ${escapeHtml(p.department)} · ${escapeHtml(p.city)}, ${escapeHtml(p.state)}</span>
          </div>
          ${p.rank || p.phdYear || p.phdInstitution ? `<div class="entry-details">${[
            p.rank && escapeHtml(p.rank),
            p.phdYear && `PhD ${escapeHtml(String(p.phdYear))}${p.phdInstitution ? `, ${escapeHtml(p.phdInstitution)}` : ''}`,
            !p.phdYear && p.phdInstitution && `PhD, ${escapeHtml(p.phdInstitution)}`,
          ].filter(Boolean).join(' · ')}</div>` : ''}
          <div class="tags">${tags}</div>
        </div>
      `;
    })
    .join('');
}

async function init() {
  renderShell();

  let roster;
  try {
    roster = await loadRoster();
  } catch {
    document.getElementById('roster').innerHTML =
      '<p class="empty-state">Could not load the roster. Please refresh the page or try again later.</p>';
    return;
  }

  const suggestions = document.getElementById('search-suggestions');
  const suggestionValues = [...uniqueDepartments(roster), ...uniqueStates(roster)].sort();
  for (const value of suggestionValues) {
    suggestions.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(value)}"></option>`);
  }

  const searchInput = document.getElementById('search');
  const fieldSelect = document.getElementById('field-filter');
  const fieldCounts = new Map(
    FIELDS.map((field) => [
      field,
      roster.filter((person) => fieldOf(person.department, person.university) === field).length,
    ]),
  );
  fieldSelect.options[0].textContent = `All fields (${roster.length})`;
  for (const field of FIELDS) {
    fieldSelect.insertAdjacentHTML(
      'beforeend',
      `<option value="${escapeHtml(field)}">${escapeHtml(field)} (${fieldCounts.get(field)})</option>`,
    );
  }

  const params = new URLSearchParams(window.location.search);
  if (params.has('q')) searchInput.value = params.get('q');
  if (params.has('field') && FIELDS.includes(params.get('field'))) {
    fieldSelect.value = params.get('field');
  }

  function syncUrl() {
    const next = new URLSearchParams();
    if (searchInput.value.trim()) next.set('q', searchInput.value.trim());
    if (fieldSelect.value !== 'all') next.set('field', fieldSelect.value);
    const query = next.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState(null, '', url);
  }

  function update() {
    const filtered = filterRoster(roster, {
      query: searchInput.value,
      field: fieldSelect.value,
    });
    renderRoster(sortRoster(filtered));
    syncUrl();
  }

  searchInput.addEventListener('input', debounce(update, 150));
  fieldSelect.addEventListener('change', update);

  const examples = [
    ...pickRandomUnique(roster.map((p) => p.name), 2),
    ...pickRandomUnique(uniqueDepartments(roster), 1),
    ...pickRandomUnique(uniqueStates(roster), 1),
    ...pickRandomUnique(roster.flatMap((p) => p.researchAreas), 1),
  ].sort(() => Math.random() - 0.5);
  const examplesEl = document.getElementById('examples');
  examplesEl.innerHTML =
    '<span class="examples-label">Try:</span>' +
    examples
      .map((value) => `<button type="button" class="example-chip">${escapeHtml(value)}</button>`)
      .join('');
  examplesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.example-chip');
    if (!btn) return;
    searchInput.value = btn.textContent;
    fieldSelect.value = 'all';
    update();
  });

  update();
}

init();
