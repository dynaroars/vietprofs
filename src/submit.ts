import './style.css';
import { FIELDS, fieldOf, loadRoster, personPath, TRACKS } from './data.ts';
import { escapeHtml } from './utils.ts';

const SUBMISSION_EMAIL = 'root@roars.dev';
// Form behavior remains browser-native; this module is migrated incrementally.

const app = document.getElementById('app');

function renderShell() {
  app.innerHTML = `
    <header>
      <h1><a class="home-link" href="${import.meta.env.BASE_URL}">Vietnamese Academic Diaspora</a></h1>
      <p class="tagline">Submit a new professor or suggest an update</p>
      <p class="criteria">
        Only <strong>full name</strong> and <strong>official university profile</strong> are required. Everything else below is optional — maintainers will review and fill in the rest.
      </p>
    </header>

    <form id="submit-form" class="submit-form" novalidate>
      <section class="form-group required-group" aria-labelledby="required-heading">
        <h2 id="required-heading">Required</h2>
        <p class="form-group-description">These two fields are needed to verify the submission.</p>

      <div class="form-section">
        <label for="name">Full name</label>
        <input id="name" name="name" type="text" required placeholder="e.g. ThanhVu H. Nguyen" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="name-suggestions" aria-describedby="name-hint" />
        <div id="name-suggestions" class="correction-suggestions" role="listbox" hidden></div>
        <p class="form-help" id="name-hint">If this professor is already listed, typing their name will suggest them and pre-fill their details for editing.</p>
        <p class="form-help notice" id="name-match-notice" hidden></p>
      </div>

      <div class="form-section">
        <label for="profileUrl">Official university profile <span class="info-icon" tabindex="0" role="img" aria-label="Why this is required" data-tooltip="We need at least the official university profile link to verify and add this entry.">i</span></label>
        <input id="profileUrl" name="profileUrl" type="url" required placeholder="https://… (department or faculty directory page)" />
      </div>

      </section>

      <details class="form-group optional-group">
        <summary id="optional-heading">Optional details</summary>
        <p class="form-group-description">Share any details you have; maintainers will verify and complete the record.</p>

      <div class="form-section">
        <label for="websiteUrl">Personal or lab website</label>
        <input id="websiteUrl" name="websiteUrl" type="url" placeholder="https:// (personal homepage or lab site)" />
      </div>

      <div class="form-section">
        <label for="scholarUrl">Google Scholar profile</label>
        <input id="scholarUrl" name="scholarUrl" type="url" placeholder="https://scholar.google.com/…" />
      </div>

      <div class="form-section">
        <label for="portraitSource">Profile picture URL <span class="optional-label">(optional)</span></label>
        <div id="portrait-preview" class="portrait-preview" hidden>
          <img id="portrait-preview-image" src="" alt="Existing profile picture" width="96" height="96" />
          <span>Existing picture</span>
        </div>
        <input id="portraitSource" name="portraitSource" type="url" placeholder="https://… (official university or personal profile image)" />
        <p class="form-help">You may provide a direct image URL. Maintainers will review it and create the roster portrait.</p>
      </div>

      <div class="form-section">
        <label for="university">University</label>
        <input id="university" name="university" type="text" placeholder="e.g. University of Washington, NUS, Monash University, etc." />
      </div>

      <div class="form-section">
        <label for="department">Department</label>
        <input id="department" name="department" type="text" placeholder="e.g. Computer Science" />
      </div>

      <div class="form-section">
        <label for="field">Broad field</label>
        <select id="field" name="field">
          <option value="">Unspecified / Maintainer will check</option>
          ${FIELDS.map((field) => `<option value="${escapeHtml(field)}">${escapeHtml(field)}</option>`).join('')}
        </select>
      </div>

      <div class="form-section form-row">
        <div>
          <label for="city">City</label>
          <input id="city" name="city" type="text" placeholder="e.g. Seattle, Singapore, Paris" />
        </div>
        <div>
          <label for="state">State / Province</label>
          <input id="state" name="state" type="text" placeholder="e.g. Washington, Ontario, NSW" />
        </div>
      </div>

      <div class="form-section">
        <label for="country">Country</label>
        <input id="country" name="country" type="text" placeholder="e.g. United States, Singapore, Australia, France, Canada" />
      </div>

      <fieldset class="form-section">
        <legend>Employment track</legend>
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
        <label for="rank">Simplified academic rank</label>
        <input id="rank" name="rank" type="text" placeholder="Assistant Professor, Clinical Professor, Professor of Practice, or other official title" />
      </div>

      <div class="form-section form-row">
        <div>
          <label for="undergradYear">Undergraduate completion year</label>
          <input id="undergradYear" name="undergradYear" type="number" min="1900" max="${new Date().getFullYear()}" placeholder="e.g. 2010" />
        </div>
        <div>
          <label for="undergradInstitution">Undergraduate institution</label>
          <input id="undergradInstitution" name="undergradInstitution" type="text" placeholder="e.g. University of Washington" />
        </div>
      </div>

      <div class="form-section form-row">
        <div>
          <label for="msYear">Master's completion year</label>
          <input id="msYear" name="msYear" type="number" min="1900" max="${new Date().getFullYear()}" placeholder="e.g. 2014" />
        </div>
        <div>
          <label for="msInstitution">Master's institution</label>
          <input id="msInstitution" name="msInstitution" type="text" placeholder="e.g. Stanford University" />
        </div>
      </div>

      <div class="form-section form-row">
        <div>
          <label for="phdYear">PhD year</label>
          <input id="phdYear" name="phdYear" type="number" min="1900" max="${new Date().getFullYear()}" placeholder="e.g. 2018" />
        </div>
        <div>
          <label for="phdInstitution">PhD institution</label>
          <input id="phdInstitution" name="phdInstitution" type="text" placeholder="e.g. MIT" />
        </div>
      </div>

      <div class="form-section form-row">
        <div>
          <label for="mdYear">MD completion year</label>
          <input id="mdYear" name="mdYear" type="number" min="1900" max="${new Date().getFullYear()}" placeholder="e.g. 2016" />
        </div>
        <div>
          <label for="mdInstitution">MD institution</label>
          <input id="mdInstitution" name="mdInstitution" type="text" placeholder="e.g. Johns Hopkins University" />
        </div>
      </div>

      <div class="form-section form-row">
        <div>
          <label for="postdocYear">Postdoc completion year</label>
          <input id="postdocYear" name="postdocYear" type="number" min="1900" max="${new Date().getFullYear()}" placeholder="e.g. 2022" />
        </div>
        <div>
          <label for="postdocInstitution">Postdoc institution</label>
          <input id="postdocInstitution" name="postdocInstitution" type="text" placeholder="e.g. Carnegie Mellon University" />
        </div>
      </div>

      <div class="form-section">
        <label for="researchAreas">Research areas (comma-separated)</label>
        <input id="researchAreas" name="researchAreas" type="text" placeholder="e.g. Machine Learning, Robotics" />
      </div>

      <div class="form-section">
        <label for="notes">Notes for the maintainer</label>
        <textarea id="notes" name="notes" rows="2" placeholder="Anything else that helps verify this (e.g. recent move, other evidence links, etc.)"></textarea>
      </div>
      </details>

      <div class="submit-actions">
        <button type="submit" class="submit-btn">Send by email</button>
      </div>
      <p class="submit-hint" id="submit-hint">
        This opens a pre-filled email message to the maintainers.
      </p>
    </form>
  `;
}

function buildEmailUrl(title, body) {
  return `mailto:${SUBMISSION_EMAIL}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

const FIELD_LABELS = {
  profileUrl: 'Official university profile',
  websiteUrl: 'Personal/lab website',
  scholarUrl: 'Google Scholar',
  portraitSource: 'Profile picture URL',
  university: 'University',
  department: 'Department',
  field: 'Broad field',
  city: 'City',
  state: 'State/Province',
  country: 'Country',
  track: 'Employment track',
  rank: 'Rank',
  undergradInstitution: 'Undergraduate institution',
  undergradYear: 'Undergraduate year',
  msInstitution: "Master's institution",
  msYear: "Master's year",
  phdInstitution: 'PhD institution',
  phdYear: 'PhD year',
  mdInstitution: 'MD institution',
  mdYear: 'MD year',
  postdocInstitution: 'Postdoc institution',
  postdocYear: 'Postdoc year',
  researchAreas: 'Research areas',
};

const FIELD_ORDER = Object.keys(FIELD_LABELS);

function formatValue(value) {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function buildNewEntryBody(entry, notes) {
  const lines = ['Request: New entry', '', `Name: ${entry.name}`];
  for (const key of FIELD_ORDER) {
    const value = formatValue(entry[key]);
    if (value) lines.push(`${FIELD_LABELS[key]}: ${value}`);
  }
  if (notes) lines.push('', `Notes / evidence links: ${notes}`);
  return lines.join('\n');
}

function buildUpdateBody(matchedEntry, entry, notes) {
  const lines = [
    'Request: Update existing entry',
    '',
    `VietProfs ID: ${matchedEntry.id}`,
    `VietProfs profile: https://vietprofs.roars.dev/${personPath(matchedEntry.id)}`,
    `Current name: ${matchedEntry.name}`,
    `Proposed name: ${entry.name}`,
    '',
    'Changes:',
  ];
  const changes = [];
  if (entry.name && entry.name !== matchedEntry.name) {
    changes.push(`- Name: ${matchedEntry.name} → ${entry.name}`);
  }
  for (const key of FIELD_ORDER) {
    const oldValue = key === 'field'
      ? fieldOf(matchedEntry.department, matchedEntry.university)
      : formatValue(matchedEntry[key]);
    const newValue = formatValue(entry[key]);
    if (oldValue !== newValue) {
      changes.push(`- ${FIELD_LABELS[key]}: ${oldValue || '(none)'} → ${newValue || '(removed)'}`);
    }
  }
  lines.push(...(changes.length ? changes : ['- No field changes submitted.']));
  if (notes) lines.push('', `Notes / evidence links: ${notes}`);
  return lines.join('\n');
}

function populateEntry(form, entry) {
  form.dataset.editingId = entry.id;
  const optionalDetails = form.querySelector('.optional-group') as HTMLDetailsElement | null;
  if (optionalDetails) optionalDetails.open = true;
  form.name.value = entry.name;
  form.profileUrl.value = entry.profileUrl ?? '';
  form.websiteUrl.value = entry.websiteUrl ?? '';
  form.scholarUrl.value = entry.scholarUrl ?? '';
  form.portraitSource.value = entry.portraitSource ?? '';
  updatePortraitPreview(form, entry);
  form.university.value = entry.university ?? '';
  form.city.value = entry.city ?? '';
  form.state.value = entry.state ?? '';
  form.country.value = entry.country ?? '';
  form.department.value = entry.department ?? '';
  form.field.value = fieldOf(entry.department, entry.university);
  form.rank.value = entry.rank ?? '';
  form.undergradYear.value = entry.undergradYear ?? '';
  form.undergradInstitution.value = entry.undergradInstitution ?? '';
  form.msYear.value = entry.msYear ?? '';
  form.msInstitution.value = entry.msInstitution ?? '';
  form.postdocYear.value = entry.postdocYear ?? '';
  form.postdocInstitution.value = entry.postdocInstitution ?? '';
  form.phdYear.value = entry.phdYear ?? '';
  form.phdInstitution.value = entry.phdInstitution ?? '';
  form.mdYear.value = entry.mdYear ?? '';
  form.mdInstitution.value = entry.mdInstitution ?? '';
  form.researchAreas.value = entry.researchAreas ? entry.researchAreas.join(', ') : '';
  if (entry.track) {
    const radio = form.querySelector(`input[name="track"][value="${entry.track}"]`);
    if (radio) radio.checked = true;
  }
}

function updatePortraitPreview(form, entry) {
  const preview = form.querySelector('#portrait-preview') as HTMLDivElement | null;
  const image = form.querySelector('#portrait-preview-image') as HTMLImageElement | null;
  if (!preview || !image) return;
  if (entry?.portrait) {
    image.src = `${import.meta.env.BASE_URL}${entry.portrait}`;
    preview.hidden = false;
  } else {
    image.removeAttribute('src');
    preview.hidden = true;
  }
}

function findMatchedEntry(form, entriesById, entriesByName, name) {
  return entriesById?.get(form.dataset.editingId) ?? entriesByName?.get(name.toLocaleLowerCase().trim());
}

function clearAutoPopulatedEntry(form) {
  const name = form.name.value;
  form.reset();
  form.name.value = name;
  updatePortraitPreview(form, null);
  const optionalDetails = form.querySelector('.optional-group') as HTMLDetailsElement | null;
  if (optionalDetails) optionalDetails.open = false;
}

function onSubmit(e, entriesById, entriesByName) {
  e.preventDefault();
  const form = e.target;

  if (!form.reportValidity()) return;

  const name = form.name.value.trim();
  const matchedEntry = findMatchedEntry(form, entriesById, entriesByName, name);

  const researchAreas = form.researchAreas.value
    ? form.researchAreas.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const entry = {
    name,
    profileUrl: form.profileUrl.value.trim(),
    websiteUrl: form.websiteUrl.value.trim() || undefined,
    scholarUrl: form.scholarUrl.value.trim() || undefined,
    portraitSource: form.portraitSource.value.trim() || undefined,
    university: form.university.value.trim() || undefined,
    city: form.city.value.trim() || undefined,
    state: form.state.value.trim() || undefined,
    country: form.country.value.trim() || undefined,
    department: form.department.value.trim() || undefined,
    field: form.field.value || undefined,
    track: form.track.value || undefined,
    rank: form.rank.value.trim() || undefined,
    researchAreas: researchAreas.length ? researchAreas : undefined,
    undergradYear: form.undergradYear.value ? Number(form.undergradYear.value) : undefined,
    undergradInstitution: form.undergradInstitution.value.trim() || undefined,
    msYear: form.msYear.value ? Number(form.msYear.value) : undefined,
    msInstitution: form.msInstitution.value.trim() || undefined,
    phdYear: form.phdYear.value ? Number(form.phdYear.value) : undefined,
    phdInstitution: form.phdInstitution.value.trim() || undefined,
    mdYear: form.mdYear.value ? Number(form.mdYear.value) : undefined,
    mdInstitution: form.mdInstitution.value.trim() || undefined,
    postdocYear: form.postdocYear.value ? Number(form.postdocYear.value) : undefined,
    postdocInstitution: form.postdocInstitution.value.trim() || undefined,
  };

  const notes = form.notes.value.trim();
  const body = matchedEntry ? buildUpdateBody(matchedEntry, entry, notes) : buildNewEntryBody(entry, notes);
  const title = matchedEntry ? `VietProfs update: ${name}` : `VietProfs submission: ${name}`;

  window.location.href = buildEmailUrl(title, body);
}

async function init() {
  renderShell();
  const form = document.getElementById('submit-form');
  const nameInput = document.getElementById('name');
  const suggestions = document.getElementById('name-suggestions');
  const matchNotice = document.getElementById('name-match-notice');
  let entriesByName = null;
  let entriesById = null;

  form.addEventListener('submit', (e) => onSubmit(e, entriesById, entriesByName));

  try {
    const roster = await loadRoster();
    entriesByName = new Map(roster.map((entry) => [entry.name.toLocaleLowerCase(), entry]));
    entriesById = new Map(roster.map((entry) => [entry.id, entry]));
    let matchingEntries = [];

    function hideSuggestions() {
      suggestions.hidden = true;
      nameInput.setAttribute('aria-expanded', 'false');
    }

    function checkMatch(name) {
      const entry = entriesById.get(form.dataset.editingId) ?? entriesByName.get(name.toLocaleLowerCase().trim());
      if (entry) {
        const profileUrl = `${import.meta.env.BASE_URL}${personPath(entry.id)}`;
        matchNotice.innerHTML = `Editing existing entry <strong>${escapeHtml(entry.id)}</strong> · <a href="${escapeHtml(profileUrl)}">View permanent profile</a><br><strong>${escapeHtml(entry.name)}</strong> · ${escapeHtml(entry.university)} · ${escapeHtml(entry.department)}. Details pre-filled for editing.`;
        matchNotice.hidden = false;
      } else {
        matchNotice.hidden = true;
      }
    }

    const requestedEdit = new URLSearchParams(window.location.search).get('edit');
    const entryToEdit = requestedEdit && (entriesById.get(requestedEdit) ?? entriesByName.get(requestedEdit.toLocaleLowerCase().trim()));
    const lockedEditId = entryToEdit ? entryToEdit.id : '';
    if (entryToEdit) {
      populateEntry(form, entryToEdit);
      checkMatch(entryToEdit.name);
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
      suggestions.replaceChildren();
      matchingEntries.forEach((entry, index) => {
        const button = document.createElement('button');
        button.className = 'correction-suggestion';
        button.type = 'button';
        button.role = 'option';
        button.dataset.index = String(index);
        const name = document.createElement('strong');
        name.textContent = entry.name;
        const details = document.createElement('span');
        details.textContent = `${entry.university} · ${entry.department}`;
        button.append(name, details);
        suggestions.append(button);
      });
      suggestions.hidden = false;
      nameInput.setAttribute('aria-expanded', 'true');
    }

    nameInput.addEventListener('input', () => {
      const query = nameInput.value.trim().toLocaleLowerCase();
      const boundEntry = entriesById.get(form.dataset.editingId);
      if (boundEntry && form.dataset.editingId !== lockedEditId && boundEntry.name.toLocaleLowerCase() !== query) {
        clearAutoPopulatedEntry(form);
        delete form.dataset.editingId;
      }
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
      const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('.correction-suggestion');
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
