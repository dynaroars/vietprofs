import './style.css';
import { loadRoster, uniqueStates, uniqueDepartments, filterRoster, sortRoster } from './data.js';
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
      <h1>VietAcademia</h1>
      <p class="tagline">Vietnamese professors at U.S. universities</p>
      <p class="criteria">
        <span class="term" tabindex="0" data-tooltip="On the tenure track or already tenured — not a term, teaching-only, or research-track position.">Tenure-line</span>
        faculty at U.S. universities.
      </p>
    </header>
    <div class="controls">
      <input id="search" class="search-input" type="search" list="search-suggestions" placeholder="Search name, university, department, location, or area…" aria-label="Search" />
      <datalist id="search-suggestions"></datalist>
    </div>
    <div class="examples" id="examples"></div>
    <p class="result-count" id="result-count"></p>
    <div class="roster" id="roster"></div>
    <footer id="footer"></footer>
  `;
}

function renderRoster(roster) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  countEl.textContent = `${roster.length} professor${roster.length === 1 ? '' : 's'}`;

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

  function update() {
    const filtered = filterRoster(roster, {
      query: searchInput.value,
    });
    renderRoster(sortRoster(filtered));
  }

  searchInput.addEventListener('input', update);

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

  const universities = new Set(roster.map((p) => p.university)).size;
  const states = new Set(roster.map((p) => p.state)).size;
  document.getElementById('footer').innerHTML =
    `${roster.length} professors across ${universities} universities in ${states} states/territories. ` +
    `<a class="footer-link" href="/submit.html">Know someone missing, or spot an error? Submit an entry.</a>`;

  update();
}

init();
