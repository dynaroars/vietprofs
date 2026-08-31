import './style.css';
import { displayName, loadRoster, type Roster, type RosterEntry } from './data.ts';
import { loadFavorites, saveFavorites, toggleFavorite } from './favorites-store.ts';
import { renderRosterEntry } from './render.ts';

const app = document.getElementById('app');

function favoritePeople(roster: Roster): RosterEntry[] {
  const known = new Set(roster.map((person) => person.id));
  const stored = loadFavorites();
  const ids = stored.filter((id) => known.has(id));
  if (ids.length !== stored.length) saveFavorites(ids);
  const wanted = new Set(ids);
  return roster
    .filter((person) => wanted.has(person.id))
    .sort((a, b) => displayName(a.name).localeCompare(displayName(b.name), 'en'));
}

function emptyState() {
  return `<p class="empty-state">Star someone on the directory to save them here. <a href="${import.meta.env.BASE_URL}">Back to the directory</a></p>`;
}

function renderList(people: RosterEntry[]) {
  const rosterEl = document.getElementById('roster');
  const countEl = document.getElementById('result-count');
  if (!people.length) {
    countEl.textContent = '';
    rosterEl.innerHTML = emptyState();
    return;
  }
  countEl.textContent = people.length === 1 ? '1 favorite' : `${people.length} favorites`;
  rosterEl.innerHTML = people.map((person) => renderRosterEntry(person, import.meta.env.BASE_URL)).join('');
}

function renderShell() {
  app.innerHTML = `
    <header>
      <h1><a class="home-link" href="${import.meta.env.BASE_URL}">Vietnamese Academic Diaspora</a></h1>
      <div class="subtitle-row">
        <p class="site-subtitle">Your saved professors</p>
        <div class="header-actions">
          <a class="back-link" href="${import.meta.env.BASE_URL}">Back</a>
        </div>
      </div>
    </header>
    <p class="result-count" id="result-count" aria-live="polite"></p>
    <div class="roster" id="roster"></div>
  `;
}

async function init() {
  renderShell();
  const roster = await loadRoster();
  renderList(favoritePeople(roster));
  document.getElementById('roster').addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>('.favorite-toggle');
    if (!button?.dataset.id) return;
    if (!toggleFavorite(button.dataset.id)) renderList(favoritePeople(roster));
  });
}

init();
