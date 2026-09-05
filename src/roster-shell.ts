import { displayName, filterRoster, personPath, type SearchIndex, type Roster } from './data.ts';
import { loadFavorites } from './favorites-store.ts';
import './roster-shell.css';

export function openRosterShell(index: SearchIndex) {
  const returnFocus = document.activeElement as HTMLElement | null;
  const roster = index.roster;
  const dialog = document.createElement('dialog');
  dialog.className = 'roster-shell';
  dialog.setAttribute('aria-labelledby', 'roster-shell-title');
  dialog.innerHTML = `
    <header><strong id="roster-shell-title">VIETPROFS // ROSTER SHELL</strong>
      <button type="button" aria-label="Close roster shell">ESC / CLOSE</button></header>
    <div class="shell-output" role="log" aria-label="Command output" tabindex="0"></div>
    <form class="shell-prompt">
      <label for="shell-command">vietprofs&gt;</label>
      <input id="shell-command" aria-label="Terminal command" autocomplete="off" autocapitalize="off" spellcheck="false" autofocus>
    </form>`;
  const output = dialog.querySelector<HTMLDivElement>('.shell-output')!;
  const input = dialog.querySelector<HTMLInputElement>('input')!;
  let results: Roster = [];
  const history: string[] = [];
  let historyIndex = 0;
  let draft = '';

  function print(text: string) {
    const line = document.createElement('div');
    line.textContent = text;
    output.append(line);
  }

  function showResults(matches: Roster) {
    results = matches;
    print(`${matches.length} roster result(s). Use open <number> or click a profile.`);
    matches.forEach((person, i) => {
      const link = document.createElement('a');
      link.href = `${import.meta.env.BASE_URL}${personPath(person.id)}`;
      link.textContent = `${i + 1}. ${displayName(person.name)} / ${person.university}`;
      output.append(link);
    });
  }

  function rank(key: 'country' | 'university') {
    const counts = new Map<string, number>();
    roster.forEach(person => {
      const value = person[key] || 'Unknown';
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    print(`Top ${key === 'country' ? 'countries' : 'institutions'} by roster entries (not population estimates):`);
    [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10).forEach(([name, count]) => print(`${String(count).padStart(4)}  ${name}`));
  }

  function run(raw: string) {
    const [command, ...args] = raw.toLowerCase().split(/\s+/);
    const argument = args.join(' ');
    switch (command) {
      case 'help':
        print('help                  Show commands\nstats                 Count this roster\nfind <text>           Search the full roster\ntop countries         Countries by roster count\ntop institutions      Institutions by roster count\nrandom                Pick a profile\nfavorites             Your starred profiles\nopen <number>         Open a result from the last profile list\nwhoami                Identify yourself\nhack gibson           Try your luck\nclear / exit          Clear screen / close shell\nUp / Down             Command history');
        break;
      case 'stats':
        print(`${roster.length} roster entries\n${new Set(roster.map(p => p.university)).size} institutions\n${new Set(roster.map(p => p.country).filter(Boolean)).size} known countries\nCounts describe this roster only.`);
        break;
      case 'find':
        if (!argument) print('Usage: find <text>');
        else showResults(filterRoster(index, { query: raw.slice(command.length).trim() }));
        break;
      case 'top':
        if (argument === 'countries') rank('country');
        else if (argument === 'institutions') rank('university');
        else print('Usage: top countries | top institutions');
        break;
      case 'random':
        showResults(roster.length ? [roster[Math.floor(Math.random() * roster.length)]] : []);
        break;
      case 'favorites': {
        const favorites = new Set(loadFavorites());
        showResults(roster.filter(person => favorites.has(person.id)));
        break;
      }
      case 'open': {
        const person = /^\d+$/.test(argument) ? results[Number(argument) - 1] : undefined;
        if (person) window.location.href = `${import.meta.env.BASE_URL}${personPath(person.id)}`;
        else print('Choose a valid number from the last profile list. Try find, random, or favorites.');
        break;
      }
      case 'whoami': print('guest researcher'); break;
      case 'hack': print(argument === 'gibson' ? 'Permission denied. Tenure required.' : 'Usage: hack gibson'); break;
      case 'clear': output.replaceChildren(); results = []; break;
      case 'exit': dialog.close(); break;
      default: print(`Unknown command: ${command}. Type help.`);
    }
  }

  dialog.querySelector('form')!.addEventListener('submit', event => {
    event.preventDefault();
    const raw = input.value.trim();
    if (!raw) return;
    history.push(raw);
    historyIndex = history.length;
    draft = input.value = '';
    print(`\nvietprofs> ${raw}`);
    run(raw);
    output.scrollTop = output.scrollHeight;
  });
  input.addEventListener('keydown', event => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    if (historyIndex === history.length) draft = input.value;
    historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
    input.value = history[historyIndex] ?? draft;
    input.setSelectionRange(input.value.length, input.value.length);
  });
  // Keep directory shortcuts from handling keys while the modal owns focus.
  dialog.addEventListener('keydown', event => event.stopPropagation());
  dialog.querySelector('button')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    dialog.remove();
    returnFocus?.focus();
  });
  print('Connecting to the faculty mainframe...\nAccess granted. Academic credentials optional.\n\nLocal roster online. Type help to begin.');
  document.body.append(dialog);
  dialog.showModal();
}
