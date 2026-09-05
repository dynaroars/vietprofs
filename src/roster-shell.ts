import {
  displayName,
  fieldOf,
  filterRoster,
  institutionTypeOf,
  personPath,
  type RosterEntry,
  type SearchIndex,
  type Roster,
} from './data.ts';
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

  function rank(label: string, values: (person: RosterEntry) => string | undefined) {
    const counts = new Map<string, number>();
    roster.forEach(person => {
      const value = values(person) || 'Unknown';
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    print(`Top ${label} by roster entries${label === 'countries' ? ' (not population estimates)' : ''}:`);
    [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10).forEach(([name, count]) => print(`${String(count).padStart(4)}  ${name}`));
  }

  function list(label: string, values: string[]) {
    const unique = [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
    print(`${label} (${unique.length}):\n${unique.join('\n') || 'None recorded.'}`);
  }

  function inspect(person: RosterEntry) {
    const lines = [
      displayName(person.name),
      `${person.rank || 'Rank not recorded'} · ${person.track || 'Track not recorded'}`,
      `${person.department || 'Department not recorded'} · ${person.university}`,
      [person.city, person.state, person.country].filter(Boolean).join(', ') || 'Location not recorded',
      `Field: ${fieldOf(person.department, person.university)}`,
      person.researchAreas?.length ? `Research: ${person.researchAreas.join('; ')}` : 'Research areas not recorded',
      person.phdInstitution ? `PhD: ${person.phdInstitution}${person.phdYear ? ` (${person.phdYear})` : ''}` : 'PhD institution not recorded',
      `Profile ID: ${person.id}`,
    ];
    print(lines.join('\n'));
  }

  function findScoped(scope: string, argument: string, usage: string) {
    if (!argument) print(`Usage: ${usage}`);
    else showResults(filterRoster(index, { query: argument, searchScope: scope }));
  }

  function run(raw: string) {
    const [typedCommand = '', ...args] = raw.trim().split(/\s+/);
    const command = typedCommand.toLowerCase();
    const argument = args.join(' ');
    switch (command) {
      case 'help':
      case '?':
      case 'commands':
        print('DISCOVER\nhelp / ? / commands                 Show this guide\nabout / whoami / pwd / version        Shell and roster information\nstats / status                        Count this roster\nls countries|fields|tracks|types       List available values\ntop countries|institutions|fields|tracks|ranks|types\n                                      Rank roster values\n\nSEARCH\nfind <text>                           Search all indexed roster fields\ncountry|state|institution|phd <text>   Search a structured field\nfield|track|research|honors <text>     Search a structured field\nid <vp-####>                           Find a profile ID\nrandom / favorites / results            Show profile lists\nopen|profile <number>                  Open a result from the last list\ninspect <number>                       Read a result without leaving the shell\n\nSHELL\necho <text> / history / clear / exit\nhack gibson                            Try your luck\nUp / Down                              Command history');
        break;
      case 'about':
        print('VietProfs is a community-maintained roster of Vietnamese and Vietnamese-diaspora academics. This shell reads only the roster loaded in your browser.');
        break;
      case 'pwd': print('/vietprofs/roster'); break;
      case 'version': print('vietprofs roster shell v1 · local browser session'); break;
      case 'stats':
      case 'status':
        print(`${roster.length} roster entries\n${new Set(roster.map(p => p.university)).size} institutions\n${new Set(roster.map(p => p.country).filter(Boolean)).size} known countries\nCounts describe this roster only.`);
        break;
      case 'find':
        if (!argument) print('Usage: find <text>');
        else showResults(filterRoster(index, { query: argument }));
        break;
      case 'country': findScoped('country', argument, 'country <name>'); break;
      case 'state':
        if (!argument) print('Usage: state <name or abbreviation>');
        else showResults(filterRoster(index, { state: argument }));
        break;
      case 'institution': findScoped('university', argument, 'institution <text>'); break;
      case 'phd': findScoped('phd', argument, 'phd <institution>'); break;
      case 'field': findScoped('field', argument, 'field <text>'); break;
      case 'track': findScoped('track', argument, 'track <text>'); break;
      case 'research': findScoped('research', argument, 'research <text>'); break;
      case 'honors': findScoped('honors', argument, 'honors <text>'); break;
      case 'id': {
        const person = roster.find(entry => entry.id.toLowerCase() === argument.toLowerCase());
        if (person) showResults([person]);
        else print('Usage: id <vp-####> (profile ID not found)');
        break;
      }
      case 'top':
        switch (argument.toLowerCase()) {
          case 'countries': rank('countries', person => person.country); break;
          case 'institutions': rank('institutions', person => person.university); break;
          case 'fields': rank('fields', person => fieldOf(person.department, person.university)); break;
          case 'tracks': rank('appointment tracks', person => person.track); break;
          case 'ranks': rank('recorded ranks', person => person.rank); break;
          case 'types': rank('institution types', person => institutionTypeOf(person)); break;
          default: print('Usage: top countries | institutions | fields | tracks | ranks | types');
        }
        break;
      case 'ls':
        switch (argument.toLowerCase()) {
          case 'countries': list('Countries', roster.map(person => person.country || 'United States')); break;
          case 'fields': list('Fields', roster.map(person => fieldOf(person.department, person.university))); break;
          case 'tracks': list('Appointment tracks', roster.map(person => person.track || 'Unknown')); break;
          case 'types': list('Institution types', roster.map(institutionTypeOf)); break;
          default: print('Usage: ls countries | fields | tracks | types');
        }
        break;
      case 'random':
        showResults(roster.length ? [roster[Math.floor(Math.random() * roster.length)]] : []);
        break;
      case 'favorites': {
        const favorites = new Set(loadFavorites());
        showResults(roster.filter(person => favorites.has(person.id)));
        break;
      }
      case 'results':
      case 'again':
        if (results.length) showResults(results);
        else print('No previous profile list. Try find, random, or favorites.');
        break;
      case 'open':
      case 'profile': {
        const person = /^\d+$/.test(argument) ? results[Number(argument) - 1] : undefined;
        if (person) window.location.href = `${import.meta.env.BASE_URL}${personPath(person.id)}`;
        else print('Choose a valid number from the last profile list. Try find, random, or favorites.');
        break;
      }
      case 'inspect': {
        const person = /^\d+$/.test(argument) ? results[Number(argument) - 1] : undefined;
        if (person) inspect(person);
        else print('Usage: inspect <number from the last profile list>');
        break;
      }
      case 'whoami': print('guest researcher'); break;
      case 'echo': print(argument); break;
      case 'history':
        print(history.length ? history.map((entry, i) => `${String(i + 1).padStart(3)}  ${entry}`).join('\n') : 'No commands yet.');
        break;
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
