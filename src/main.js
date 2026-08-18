import './style.css';
import { loadRoster, uniqueStates, uniqueDepartments, STEM_FIELDS, filterRoster, sortRoster } from './data.js';
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

function renderShell() {
  app.innerHTML = `
    <header>
      <div class="title-row">
        <h1>Vietnamese Profs. in the US</h1>
        <a class="github-link" href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer" aria-label="View VietProfs on GitHub" title="View source on GitHub"></a>
        <a class="icon-link roars-link" href="https://roars.dev" target="_blank" rel="noopener noreferrer" aria-label="ROARS Lab" title="ROARS Lab"></a>
        <a class="icon-link" href="https://github.com/dynaroars/vietprofs/blob/main/FAQ.md" target="_blank" rel="noopener noreferrer" aria-label="Frequently asked questions" title="Frequently asked questions"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 2-2.8 2.4-2.8 4.2"/><circle cx="12" cy="17.6" r="1.1" fill="currentColor" stroke="none"/></svg></a>
      </div>
      <p class="criteria">
        <span class="term" tabindex="0" data-tooltip="On the tenure track or already tenured — not a term, teaching-only, or research-track position.">Tenure-line</span>
        faculty at U.S. universities.
      </p>
    </header>
    <div class="controls">
      <input id="search" class="search-input" type="search" list="search-suggestions" placeholder="Search name, university, department, location, or area…" aria-label="Search" />
      <datalist id="search-suggestions"></datalist>
      <select id="field-filter" class="field-select" aria-label="Filter by STEM field">
        <option value="all">All fields</option>
      </select>
    </div>
    <div class="examples" id="examples"></div>
    <p class="result-count" id="result-count"></p>
    <div class="roster" id="roster"></div>
  `;
}

function renderRoster(roster) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  const universities = new Set(roster.map((p) => p.university)).size;
  const states = new Set(roster.map((p) => p.state)).size;
  countEl.textContent = `${roster.length} professor${roster.length === 1 ? '' : 's'} across ${universities} universit${universities === 1 ? 'y' : 'ies'} in ${states} state${states === 1 ? '' : 's'}.`;

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
            <a class="entry-name" href="${escapeHtml(p.profileUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.name)}</a>${p.secondaryAppointment ? ' <span class="dagger">†</span>' : ''}
            <span class="entry-meta">${escapeHtml(p.university)} · ${escapeHtml(p.department)} · ${escapeHtml(p.city)}, ${escapeHtml(p.state)}</span>
          </div>
          <div class="tags">${tags}</div>
        </div>
      `;
    })
    .join('');
}

async function init() {
  renderShell();
  const roster = await loadRoster();

  const suggestions = document.getElementById('search-suggestions');
  const suggestionValues = [...uniqueDepartments(roster), ...uniqueStates(roster)].sort();
  for (const value of suggestionValues) {
    suggestions.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(value)}"></option>`);
  }

  const searchInput = document.getElementById('search');
  const fieldSelect = document.getElementById('field-filter');
  for (const field of STEM_FIELDS) {
    fieldSelect.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(field)}">${escapeHtml(field)}</option>`);
  }

  function update() {
    const filtered = filterRoster(roster, {
      query: searchInput.value,
      field: fieldSelect.value,
    });
    renderRoster(sortRoster(filtered));
  }

  searchInput.addEventListener('input', update);
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
    update();
  });

  update();
}

init();
