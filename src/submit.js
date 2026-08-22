import './style.css';
import { loadRoster, TRACKS } from './data.js';
import { escapeHtml } from './utils.js';

const GITHUB_REPO = 'dynaroars/vietprofs';
const SUBMISSION_EMAIL = 'root@roars.dev';

const app = document.getElementById('app');

function renderShell() {
  app.innerHTML = `
    <header>
      <h1><a class="home-link" href="${import.meta.env.BASE_URL}">Vietnamese Professors</a></h1>
      <p class="tagline">Submit a new professor or suggest an update</p>
      <p class="criteria">
        To submit or update a professor, simply enter their <strong>full name</strong> and <strong>one or more evidence links</strong> (official faculty profile, personal homepage, lab website, Google Scholar, etc.). All other fields are optional — maintainers will review the links to verify and complete details.
      </p>
    </header>

    <form id="submit-form" class="submit-form" novalidate>
      <div class="form-section">
        <label for="name">Full name *</label>
        <input id="name" name="name" type="text" required placeholder="e.g. Anh Nguyen" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="name-suggestions" aria-describedby="name-hint" />
        <div id="name-suggestions" class="correction-suggestions" role="listbox" hidden></div>
        <p class="form-help" id="name-hint">If this professor is already listed, typing their name will suggest them and pre-fill their details for editing.</p>
        <p class="form-help notice" id="name-match-notice" hidden></p>
      </div>

      <div class="form-section">
        <label for="profileUrl">Faculty website or evidence link(s) *</label>
        <textarea id="profileUrl" name="profileUrl" rows="2" required placeholder="https://… (enter one or multiple URLs: university profile, academic homepage, lab site, Google Scholar, etc.)"></textarea>
        <p class="form-help">Enter at least one working profile or scholarly link. Additional links can be separated by spaces or newlines.</p>
      </div>

      <div class="form-section">
        <label for="university">University (optional)</label>
        <input id="university" name="university" type="text" placeholder="e.g. University of Washington, NUS, Monash University, etc." />
      </div>

      <div class="form-section">
        <label for="department">Department (optional)</label>
        <input id="department" name="department" type="text" placeholder="e.g. Computer Science" />
      </div>

      <div class="form-section form-row">
        <div>
          <label for="city">City (optional)</label>
          <input id="city" name="city" type="text" placeholder="e.g. Seattle, Singapore, Paris" />
        </div>
        <div>
          <label for="state">State / Province (optional)</label>
          <input id="state" name="state" type="text" placeholder="e.g. Washington, Ontario, NSW" />
        </div>
      </div>

      <div class="form-section">
        <label for="country">Country (optional)</label>
        <input id="country" name="country" type="text" placeholder="e.g. United States, Singapore, Australia, France, Canada" />
      </div>

      <fieldset class="form-section">
        <legend>Employment track (optional)</legend>
        <label class="radio-row">
          <input type="radio" name="track" value="" checked />
          Unspecified / Maintainer will check
        </label>
        ${TRACKS.map(
          (track) => `
        <label class="radio-row">
          <input type="radio" name="track" value="${escapeHtml(track)}" />
          ${escapeHtml(track)}
        </label>`,
        ).join('')}
      </fieldset>

      <div class="form-section">
        <label for="rank">Simplified academic rank (optional)</label>
        <input id="rank" name="rank" type="text" placeholder="Assistant Professor, Associate Professor, Professor, Teaching, or Emeritus" />
      </div>

      <div class="form-section form-row">
        <div>
          <label for="phdYear">PhD year (optional)</label>
          <input id="phdYear" name="phdYear" type="number" min="1900" max="${new Date().getFullYear()}" placeholder="e.g. 2018" />
        </div>
        <div>
          <label for="phdInstitution">PhD institution (optional)</label>
          <input id="phdInstitution" name="phdInstitution" type="text" placeholder="e.g. MIT" />
        </div>
      </div>

      <div class="form-section">
        <label for="researchAreas">Research areas (optional, comma-separated)</label>
        <input id="researchAreas" name="researchAreas" type="text" placeholder="e.g. Machine Learning, Robotics" />
      </div>

      <div class="form-section">
        <label class="checkbox-row">
          <input id="secondaryAppointment" name="secondaryAppointment" type="checkbox" />
          This is a secondary/joint appointment (tenure home is in a different department)
        </label>
      </div>

      <div class="form-section">
        <label for="notes">Notes for the maintainer (optional)</label>
        <textarea id="notes" name="notes" rows="2" placeholder="Anything else that helps verify this (e.g. recent move, joint appointment note, etc.)"></textarea>
      </div>

      <div class="submit-actions">
        <button type="submit" class="submit-btn" name="delivery" value="email">Send by email</button>
        <button type="submit" class="submit-btn submit-btn-secondary" name="delivery" value="github">Submit as a GitHub issue</button>
      </div>
      <p class="submit-hint" id="submit-hint">
        Email is the easiest option and does not require a GitHub account. It opens a pre-filled
        message to the maintainers. GitHub is optional and opens a pre-filled issue for anyone who
        prefers to submit there.
      </p>
    </form>
  `;
}

function buildGithubIssueUrl(title, content) {
  const params = new URLSearchParams({
    title,
    body: `## Proposed roster submission\n\n\`\`\`json\n${content}\n\`\`\``,
  });
  return `https://github.com/${GITHUB_REPO}/issues/new?${params.toString()}`;
}

function buildEmailUrl(title, content) {
  const params = new URLSearchParams({
    subject: title,
    body: `Proposed roster submission:\n\n${content}\n`,
  });
  return `mailto:${SUBMISSION_EMAIL}?${params.toString()}`;
}

function populateEntry(form, entry) {
  form.name.value = entry.name;
  const links = [entry.profileUrl, entry.scholarUrl].filter(Boolean);
  form.profileUrl.value = links.join('\n');
  form.university.value = entry.university ?? '';
  form.city.value = entry.city ?? '';
  form.state.value = entry.state ?? '';
  form.country.value = entry.country ?? '';
  form.department.value = entry.department ?? '';
  form.rank.value = entry.rank ?? '';
  form.phdYear.value = entry.phdYear ?? '';
  form.phdInstitution.value = entry.phdInstitution ?? '';
  form.researchAreas.value = entry.researchAreas ? entry.researchAreas.join(', ') : '';
  form.secondaryAppointment.checked = entry.secondaryAppointment ?? false;
  if (entry.track) {
    const radio = form.querySelector(`input[name="track"][value="${entry.track}"]`);
    if (radio) radio.checked = true;
  }
}

function findDuplicate(entriesByName, name) {
  return entriesByName?.get(name.toLocaleLowerCase().trim());
}

function onSubmit(e, entriesByName) {
  e.preventDefault();
  const form = e.target;

  if (!form.reportValidity()) return;

  const name = form.name.value.trim();
  const matchedEntry = findDuplicate(entriesByName, name);
  const type = matchedEntry ? 'update' : 'new';
  const target = matchedEntry ? matchedEntry.name : null;

  const links = form.profileUrl.value
    .split(/[\r\n\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const primaryProfileUrl = links[0] || '';
  const scholarUrl = links.find((l) => l.includes('scholar.google')) || undefined;

  const researchAreas = form.researchAreas.value
    ? form.researchAreas.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const submission = {
    type,
    target,
    name,
    evidenceUrls: links,
    entry: {
      name,
      profileUrl: primaryProfileUrl,
      scholarUrl,
      university: form.university.value.trim() || undefined,
      city: form.city.value.trim() || undefined,
      state: form.state.value.trim() || undefined,
      country: form.country.value.trim() || undefined,
      department: form.department.value.trim() || undefined,
      track: form.track.value || undefined,
      rank: form.rank.value.trim() || undefined,
      researchAreas: researchAreas.length ? researchAreas : undefined,
      phdYear: form.phdYear.value ? Number(form.phdYear.value) : undefined,
      phdInstitution: form.phdInstitution.value.trim() || undefined,
      secondaryAppointment: form.secondaryAppointment.checked || undefined,
    },
    notes: form.notes.value.trim() || undefined,
  };

  const content = JSON.stringify(submission, null, 2);
  const title = matchedEntry ? `VietProfs update: ${name}` : `VietProfs submission: ${name}`;

  if (e.submitter?.value === 'github') {
    window.open(buildGithubIssueUrl(title, content), '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = buildEmailUrl(title, content);
  }
}

async function init() {
  renderShell();
  const form = document.getElementById('submit-form');
  const nameInput = document.getElementById('name');
  const suggestions = document.getElementById('name-suggestions');
  const matchNotice = document.getElementById('name-match-notice');
  let entriesByName = null;

  form.addEventListener('submit', (e) => onSubmit(e, entriesByName));

  try {
    const roster = await loadRoster();
    entriesByName = new Map(roster.map((entry) => [entry.name.toLocaleLowerCase(), entry]));
    let matchingEntries = [];

    function hideSuggestions() {
      suggestions.hidden = true;
      nameInput.setAttribute('aria-expanded', 'false');
    }

    function checkMatch(name) {
      const entry = entriesByName.get(name.toLocaleLowerCase().trim());
      if (entry) {
        matchNotice.innerHTML = `Found on roster at <strong>${escapeHtml(entry.university)}</strong> · ${escapeHtml(entry.department)}. Details pre-filled for editing.`;
        matchNotice.hidden = false;
      } else {
        matchNotice.hidden = true;
      }
    }

    function showSuggestions(query) {
      if (!query) {
        hideSuggestions();
        return;
      }
      matchingEntries = roster
        .filter((entry) => entry.name.toLocaleLowerCase().includes(query))
        .slice(0, 8);
      if (matchingEntries.length === 0) {
        hideSuggestions();
        return;
      }
      suggestions.innerHTML = matchingEntries
        .map(
          (entry, index) =>
            `<button class="correction-suggestion" type="button" role="option" data-index="${index}"><strong>${escapeHtml(entry.name)}</strong><span>${escapeHtml(entry.university)} · ${escapeHtml(entry.department)}</span></button>`,
        )
        .join('');
      suggestions.hidden = false;
      nameInput.setAttribute('aria-expanded', 'true');
    }

    nameInput.addEventListener('input', () => {
      const query = nameInput.value.trim().toLocaleLowerCase();
      const entry = entriesByName.get(query);
      if (entry) {
        populateEntry(form, entry);
        checkMatch(query);
        hideSuggestions();
        return;
      }
      checkMatch(query);
      showSuggestions(query);
    });

    suggestions.addEventListener('click', (event) => {
      const button = event.target.closest('.correction-suggestion');
      if (!button) return;
      const entry = matchingEntries[Number(button.dataset.index)];
      if (!entry) return;
      nameInput.value = entry.name;
      populateEntry(form, entry);
      checkMatch(entry.name);
      hideSuggestions();
    });

    nameInput.addEventListener('blur', () => {
      window.setTimeout(hideSuggestions, 150);
    });
  } catch {
    // If roster fails to load, form still works normally without auto-complete
  }
}

init();
