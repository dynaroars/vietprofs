import './style.css';
import { loadRoster } from './data.js';
import { escapeHtml } from './utils.js';

const GITHUB_REPO = 'dynaroars/vietprofs';
const SUBMISSION_EMAIL = 'root@roars.dev';

const app = document.getElementById('app');

function renderShell() {
  app.innerHTML = `
    <header>
      <h1><a class="home-link" href="${import.meta.env.BASE_URL}">Vietnamese Professors at U.S. Universities</a></h1>
      <p class="tagline">Submit a new entry, or correct an existing one</p>
      <p class="criteria">
        Only <span class="term" tabindex="0" data-tooltip="On the tenure track or already tenured — not a term, teaching-only, visiting, research-track, or emeritus position.">tenure-line</span>
        faculty (tenure-track or tenured) qualify — no adjunct, visiting, teaching-only, or
        research-track positions. Please have an official faculty page or scholarly profile link
        ready.
      </p>
    </header>

    <form id="submit-form" class="submit-form" novalidate>
      <fieldset class="form-section">
        <legend>What kind of submission is this?</legend>
        <label class="radio-row">
          <input type="radio" name="kind" value="new" checked />
          Add a new professor
        </label>
        <label class="radio-row">
          <input type="radio" name="kind" value="correction" />
          Correct an existing entry
        </label>
      </fieldset>

      <div class="form-section" id="correction-target-row" hidden>
        <label for="target">Name of the existing entry *</label>
        <input id="target" name="target" type="text" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="correction-suggestions" aria-describedby="correction-target-hint" />
        <div id="correction-suggestions" class="correction-suggestions" role="listbox" hidden></div>
        <p class="form-help" id="correction-target-hint">Start typing to select an existing professor. Their current details will populate the form for editing.</p>
      </div>

      <div class="form-section">
        <label for="name">Full name *</label>
        <input id="name" name="name" type="text" required aria-describedby="name-duplicate-warning" />
        <p class="form-help warning" id="name-duplicate-warning" hidden></p>
      </div>

      <div class="form-section">
        <label for="profileUrl">Faculty or scholarly profile URL *</label>
        <input id="profileUrl" name="profileUrl" type="url" required placeholder="https://…" />
      </div>

      <div class="form-section">
        <label for="university">University *</label>
        <input id="university" name="university" type="text" required />
      </div>

      <div class="form-section form-row">
        <div>
          <label for="city">City *</label>
          <input id="city" name="city" type="text" required />
        </div>
        <div>
          <label for="state">State *</label>
          <input id="state" name="state" type="text" required placeholder="e.g. Virginia" />
        </div>
      </div>

      <div class="form-section">
        <label for="department">Department *</label>
        <input id="department" name="department" type="text" required placeholder="e.g. Chemistry" />
      </div>

      <div class="form-section">
        <label for="researchAreas">Research areas * (comma-separated)</label>
        <input id="researchAreas" name="researchAreas" type="text" required placeholder="e.g. Organic Chemistry, Catalysis" />
      </div>

      <div class="form-section">
        <label class="checkbox-row">
          <input id="secondaryAppointment" name="secondaryAppointment" type="checkbox" />
          This is a secondary/joint appointment (their tenure home is a different department)
        </label>
      </div>

      <div class="form-section">
        <label for="notes">Notes for the maintainer (optional)</label>
        <textarea id="notes" name="notes" rows="3" placeholder="Anything that helps verify this — e.g. what's wrong with the existing entry, or where you confirmed tenure-line status."></textarea>
      </div>

      <div class="form-section attestation">
        <label class="checkbox-row">
          <input id="attest" name="attest" type="checkbox" required />
          I confirm this person is tenure-line (tenure-track or tenured) at this university —
          not adjunct, teaching-only, visiting, research-track, or emeritus — and that I've
          verified this via an official faculty page or scholarly profile.
        </label>
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

function buildGithubIssueUrl(name, content) {
  const params = new URLSearchParams({
    title: `VietProfs submission: ${name}`,
    body: `## Proposed roster submission\n\n\`\`\`json\n${content}\n\`\`\``,
  });
  return `https://github.com/${GITHUB_REPO}/issues/new?${params.toString()}`;
}

function buildEmailUrl(name, content) {
  const params = new URLSearchParams({
    subject: `VietProfs submission: ${name}`,
    body: `Hello VietProfs maintainers,\n\nHere is my proposed roster submission:\n\n${content}\n`,
  });
  return `mailto:${SUBMISSION_EMAIL}?${params.toString()}`;
}

function onKindChange(form) {
  const isCorrection = form.kind.value === 'correction';
  document.getElementById('correction-target-row').hidden = !isCorrection;
  form.target.required = isCorrection;
}

function populateEntry(form, entry) {
  form.name.value = entry.name;
  form.profileUrl.value = entry.profileUrl;
  form.university.value = entry.university;
  form.city.value = entry.city;
  form.state.value = entry.state;
  form.department.value = entry.department;
  form.researchAreas.value = entry.researchAreas.join(', ');
  form.secondaryAppointment.checked = entry.secondaryAppointment;
}

function findDuplicate(entriesByName, name) {
  return entriesByName?.get(name.toLocaleLowerCase());
}

function renderDuplicateWarning(entry) {
  const warning = document.getElementById('name-duplicate-warning');
  if (!entry) {
    warning.hidden = true;
    warning.innerHTML = '';
    return;
  }
  warning.innerHTML = `${escapeHtml(entry.name)} is already listed at ${escapeHtml(entry.university)}. If this is the same person, <button type="button" class="link-btn" id="switch-to-correction">switch to a correction</button> instead.`;
  warning.hidden = false;
}

function onSubmit(e, entriesByName) {
  e.preventDefault();
  const form = e.target;

  if (!form.reportValidity()) return;

  const kind = form.kind.value;
  const name = form.name.value.trim();

  if (kind === 'new') {
    const duplicate = findDuplicate(entriesByName, name);
    if (duplicate) {
      renderDuplicateWarning(duplicate);
      form.name.focus();
      return;
    }
  }
  const researchAreas = form.researchAreas.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const submission = {
    type: kind,
    target: kind === 'correction' ? form.target.value.trim() : null,
    notes: form.notes.value.trim(),
    entry: {
      name,
      profileUrl: form.profileUrl.value.trim(),
      university: form.university.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      researchAreas,
      secondaryAppointment: form.secondaryAppointment.checked,
      department: form.department.value.trim(),
    },
  };

  const content = JSON.stringify(submission, null, 2);
  if (e.submitter?.value === 'github') {
    window.open(buildGithubIssueUrl(name, content), '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = buildEmailUrl(name, content);
  }
}

async function init() {
  renderShell();
  const form = document.getElementById('submit-form');
  let entriesByName = null;
  form.addEventListener('submit', (e) => onSubmit(e, entriesByName));
  form.querySelectorAll('input[name="kind"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      onKindChange(form);
      renderDuplicateWarning(null);
    });
  });

  const nameWarning = document.getElementById('name-duplicate-warning');
  form.name.addEventListener('input', () => {
    if (form.kind.value !== 'new') return;
    const name = form.name.value.trim();
    renderDuplicateWarning(name ? findDuplicate(entriesByName, name) : null);
  });
  nameWarning.addEventListener('click', (event) => {
    if (!event.target.closest('#switch-to-correction')) return;
    const duplicate = findDuplicate(entriesByName, form.name.value.trim());
    if (!duplicate) return;
    form.kind.value = 'correction';
    onKindChange(form);
    form.target.value = duplicate.name;
    populateEntry(form, duplicate);
    renderDuplicateWarning(null);
  });

  const targetInput = form.target;
  const suggestions = document.getElementById('correction-suggestions');
  try {
    const roster = await loadRoster();
    entriesByName = new Map(roster.map((entry) => [entry.name.toLocaleLowerCase(), entry]));
    let matchingEntries = [];

    function hideSuggestions() {
      suggestions.hidden = true;
      targetInput.setAttribute('aria-expanded', 'false');
    }

    function showSuggestions(query) {
      matchingEntries = roster
        .filter((entry) => entry.name.toLocaleLowerCase().includes(query))
        .slice(0, 8);
      if (!query || matchingEntries.length === 0) {
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
      targetInput.setAttribute('aria-expanded', 'true');
    }

    targetInput.addEventListener('input', () => {
      const query = targetInput.value.trim().toLocaleLowerCase();
      const entry = entriesByName.get(query);
      if (entry) {
        populateEntry(form, entry);
        hideSuggestions();
        return;
      }
      showSuggestions(query);
    });

    suggestions.addEventListener('click', (event) => {
      const button = event.target.closest('.correction-suggestion');
      if (!button) return;
      const entry = matchingEntries[Number(button.dataset.index)];
      if (!entry) return;
      targetInput.value = entry.name;
      populateEntry(form, entry);
      hideSuggestions();
    });

    targetInput.addEventListener('blur', () => {
      window.setTimeout(hideSuggestions, 150);
    });
  } catch {
    document.getElementById('correction-target-hint').textContent =
      'Existing entries could not be loaded. Enter the current details manually.';
  }
}

init();
