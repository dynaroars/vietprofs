import './style.css';
import { loadRoster, uniqueStates, uniqueAreas, filterRoster, sortRoster } from './data.js';

const app = document.getElementById('app');

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

function renderShell() {
  app.innerHTML = `
    <header>
      <h1>VietAcademia</h1>
      <p class="tagline">Vietnamese professors in Computer Science at U.S. universities</p>
      <p class="criteria">
        Full-time, tenure-line faculty at a U.S. university with a CS PhD program, able to
        solely advise CS PhD students. <span class="dagger">†</span> marks faculty whose
        tenure home is in another department (e.g. ECE, Statistics) with a secondary or joint
        appointment in CS.
      </p>
    </header>
    <div class="controls">
      <input id="search" class="search-input" type="search" placeholder="Search name, university, location, or area…" aria-label="Search" />
      <select id="state-filter" aria-label="Filter by state">
        <option value="">All states</option>
      </select>
      <select id="area-filter" aria-label="Filter by research area">
        <option value="">All research areas</option>
      </select>
      <select id="sort-by" aria-label="Sort by">
        <option value="name">Sort: Name</option>
        <option value="university">Sort: University</option>
        <option value="state">Sort: State</option>
      </select>
    </div>
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
          <div class="entry-name">
            <a href="${escapeHtml(p.profileUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.name)}</a>${p.secondaryAppointment ? ' <span class="dagger">†</span>' : ''}
          </div>
          <div class="entry-university">${escapeHtml(p.university)}</div>
          <div class="entry-location">${escapeHtml(p.city)}, ${escapeHtml(p.state)}</div>
          <div class="tags">${tags}</div>
        </div>
      `;
    })
    .join('');
}

async function init() {
  renderShell();
  const roster = await loadRoster();

  const stateFilter = document.getElementById('state-filter');
  for (const state of uniqueStates(roster)) {
    stateFilter.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(state)}">${escapeHtml(state)}</option>`);
  }

  const areaFilter = document.getElementById('area-filter');
  for (const area of uniqueAreas(roster)) {
    areaFilter.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(area)}">${escapeHtml(area)}</option>`);
  }

  const searchInput = document.getElementById('search');
  const sortSelect = document.getElementById('sort-by');

  function update() {
    const filtered = filterRoster(roster, {
      query: searchInput.value,
      state: stateFilter.value,
      area: areaFilter.value,
    });
    renderRoster(sortRoster(filtered, sortSelect.value));
  }

  searchInput.addEventListener('input', update);
  stateFilter.addEventListener('change', update);
  areaFilter.addEventListener('change', update);
  sortSelect.addEventListener('change', update);

  const universities = new Set(roster.map((p) => p.university)).size;
  const states = new Set(roster.map((p) => p.state)).size;
  document.getElementById('footer').textContent =
    `${roster.length} professors across ${universities} universities in ${states} states/territories.`;

  update();
}

init();
