import './style.css';
import { FIELDS, fieldOf, loadRoster, personPath, TRACKS, type RosterEntry } from './data.ts';
import { escapeHtml } from './utils.ts';

const SUBMISSION_EMAIL = 'root@roars.dev';
const GITHUB_REPO = 'dynaroars/vietprofs';
const app = document.getElementById('app');

// The submit form uses HTMLFormElement's legacy named-item access (`form.profileUrl`) for every
// field, which the DOM lib types don't model — each name comes from this form's own markup, not
// a fixed HTML API. This alias documents that the value is genuinely dynamic rather than letting
// it default to an unannotated (and therefore implicit) any.
type FormField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
// Omit 'name' because this form has a field named "name" (the person's name) that would
// otherwise collide with HTMLFormElement's own reserved `name` attribute (the form element's own
// name) and win out over the index signature below.
type SubmitForm = Omit<HTMLFormElement, 'name'> & Record<string, FormField | undefined>;

// The draft a visitor builds in the form before it's emailed/filed as an issue. It mirrors
// RosterEntry's field names where they overlap (see FIELD_LABELS below), but is a maintainer lead
// rather than a validated roster record: `field` is the broad-field dropdown value rather than a
// derived fact, `universityProfileUrl` has no equivalent in the canonical schema, and required
// vs. optional differs from RosterEntry (e.g. `profileUrl` is required here for a new entry).
interface SubmissionDraft {
  name: string;
  profileUrl: string;
  vietnameseName?: string;
  websiteUrl?: string;
  universityProfileUrl?: string;
  scholarUrl?: string;
  linkedinUrl?: string;
  portraitSource?: string;
  university?: string;
  city?: string;
  state?: string;
  country?: string;
  department?: string;
  field?: string;
  track?: string;
  rank?: string;
  researchAreas?: string[];
  undergradYear?: number;
  undergradInstitution?: string;
  msYear?: number;
  msInstitution?: string;
  phdYear?: number;
  phdInstitution?: string;
  mdYear?: number;
  mdInstitution?: string;
  postdocYear?: number;
  postdocInstitution?: string;
}

function renderShell() {
  app.innerHTML = `
    <header>
      <h1><a class="home-link brand-link" href="${import.meta.env.BASE_URL}"><img class="brand-logo" src="${import.meta.env.BASE_URL}vietprofs-bamboo-v.svg" alt="" width="56" height="56"><span>Vietnamese Academic Diaspora</span></a></h1>
      <p class="tagline">Submit a new professor or suggest an update</p>
    </header>

    <fieldset class="form-section purpose-toggle" id="purpose-toggle">
      <legend>What are you doing?</legend>
      <label class="radio-row">
        <input type="radio" name="purpose" value="add" checked />
        Add new people
      </label>
      <label class="radio-row">
        <input type="radio" name="purpose" value="update" />
        Modify an existing entry
      </label>
    </fieldset>

    <form id="submit-form" class="submit-form" novalidate>
      <section class="form-group" id="add-mode-section">
        <p class="criteria" id="bulk-criteria">
          Paste anything: a name, a link to someone's university profile or homepage, or a link to a
          page that lists several people (a department directory, a lab site). Plain text is fine —
          one item per line, or however you have it. Feel free to include any other notes or evidence
          here too — whatever helps us verify and add them.
        </p>
        <div class="form-section">
          <label for="bulkInput" id="bulkInput-label">Names, links, or notes</label>
          <textarea id="bulkInput" name="bulkInput" rows="8" placeholder="e.g.&#10;Jane T. Nguyen — https://cs.example.edu/~jnguyen&#10;https://example.edu/faculty-directory&#10;Some Name, Some University"></textarea>
        </div>
        <p class="form-help" id="add-mode-details-help">
          Have full details for one person instead of a link? <button type="button" class="link-button" id="add-mode-details-toggle">Enter them directly</button>.
        </p>
      </section>

      <section class="form-group required-group" aria-labelledby="required-heading" id="required-section">
        <h2 id="required-heading">Required</h2>
        <p class="form-group-description" id="required-description">These two fields are needed to verify the submission.</p>

      <div class="form-section">
        <label for="name">Full name</label>
        <input id="name" name="name" type="text" placeholder="e.g. ThanhVu H. Nguyen" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="name-suggestions" aria-describedby="name-hint" />
        <div id="name-suggestions" class="correction-suggestions" role="listbox" hidden></div>
        <p class="form-help" id="name-hint">If this professor is already listed, typing their name will suggest them and pre-fill their details for editing.</p>
        <p class="form-help notice" id="name-match-notice" hidden></p>
      </div>

      <div class="form-section">
        <label for="profileUrl">Profile or verification link <span class="info-icon" tabindex="0" role="img" aria-label="Why this is required" data-tooltip="We need at least one link (university profile, personal site, LinkedIn, etc.) to verify and add this entry.">i</span></label>
        <input id="profileUrl" name="profileUrl" type="url" placeholder="https://… (any link that helps verify this person)" />
      </div>

      </section>

      <details class="form-group optional-group" id="optional-details">
        <summary id="optional-heading">Optional details</summary>
        <p class="form-group-description">Share any details you have; maintainers will verify and complete the record.</p>

      <div class="form-section">
        <label for="vietnameseName">Vietnamese name</label>
        <input id="vietnameseName" name="vietnameseName" type="text" placeholder="e.g. Trần Lê-Nam (type with diacritics, e.g. Họ Tên)" />
      </div>

      <div class="form-section">
        <label for="websiteUrl">Personal or lab website</label>
        <input id="websiteUrl" name="websiteUrl" type="url" placeholder="https:// (personal homepage or lab site)" />
      </div>

      <div class="form-section">
        <label for="universityProfileUrl">University profile website</label>
        <input id="universityProfileUrl" name="universityProfileUrl" type="url" placeholder="https://… (official university faculty/directory page)" />
      </div>

      <div class="form-section">
        <label for="scholarUrl">Google Scholar profile</label>
        <input id="scholarUrl" name="scholarUrl" type="url" placeholder="https://scholar.google.com/…" />
      </div>

      <div class="form-section">
        <label for="linkedinUrl">LinkedIn profile</label>
        <input id="linkedinUrl" name="linkedinUrl" type="url" placeholder="https://www.linkedin.com/in/…" />
      </div>

      <div class="form-section">
        <label for="portraitSource">Profile picture URL</label>
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

      </details>

      <div class="submit-actions">
        <button type="submit" class="submit-btn" name="delivery" value="email">Send by email</button>
        <button type="submit" class="submit-btn" name="delivery" value="github">Submit as a GitHub issue</button>
      </div>
      <p class="submit-hint" id="submit-hint">
        Email is the easiest option and does not require a GitHub account. It opens a pre-filled
        message to the maintainers. GitHub is optional and opens a pre-filled issue for anyone who
        prefers to submit there.
      </p>
    </form>
  `;
}

function buildEmailUrl(title: string, body: string): string {
  return `mailto:${SUBMISSION_EMAIL}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

function buildGithubIssueUrl(title: string, body: string): string {
  const params = new URLSearchParams({ title, body });
  return `https://github.com/${GITHUB_REPO}/issues/new?${params.toString()}`;
}

const FIELD_LABELS: Partial<Record<keyof SubmissionDraft, string>> = {
  profileUrl: 'Profile or verification link',
  vietnameseName: 'Vietnamese name',
  websiteUrl: 'Personal/lab website',
  universityProfileUrl: 'University profile website',
  scholarUrl: 'Google Scholar',
  linkedinUrl: 'LinkedIn',
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

const FIELD_ORDER = Object.keys(FIELD_LABELS) as (keyof SubmissionDraft)[];

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function buildNewEntryBody(entry: SubmissionDraft, notes: string): string {
  const lines = ['Request: New entry', '', `Name: ${entry.name}`];
  for (const key of FIELD_ORDER) {
    const value = formatValue(entry[key]);
    if (value) lines.push(`${FIELD_LABELS[key]}: ${value}`);
  }
  if (notes) lines.push('', `Notes / evidence links: ${notes}`);
  return lines.join('\n');
}

// The bulk path intentionally does not parse or structure the pasted text: the maintainer's
// research workflow (see ROSTER_MAINTENANCE.md) treats a supplied name or link as a lead to
// independently verify, not as pre-validated facts, so passing it through raw is correct.
function buildBulkSubmissionBody(bulkText: string, entry: SubmissionDraft): string {
  const lines = ['Request: New entry submission (raw)', '', 'Raw input:', bulkText];
  const structuredLines: string[] = [];
  if (entry.name) structuredLines.push(`Name: ${entry.name}`);
  for (const key of FIELD_ORDER) {
    const value = formatValue(entry[key]);
    if (value) structuredLines.push(`${FIELD_LABELS[key]}: ${value}`);
  }
  if (structuredLines.length) lines.push('', 'Additional structured details for one person:', ...structuredLines);
  return lines.join('\n');
}

function buildUpdateBody(matchedEntry: RosterEntry, entry: SubmissionDraft, notes: string): string {
  const nameChanged = Boolean(entry.name) && entry.name !== matchedEntry.name;
  const lines = [
    'Request: Update existing entry',
    '',
    `VietProfs ID: ${matchedEntry.id}`,
    `VietProfs profile: https://vietprofs.roars.dev/${personPath(matchedEntry.id)}`,
    ...(nameChanged
      ? [`Current name: ${matchedEntry.name}`, `Proposed name: ${entry.name}`]
      : [`Name: ${matchedEntry.name}`]),
    '',
    'Changes:',
  ];
  const changes: string[] = [];
  if (entry.name && entry.name !== matchedEntry.name) {
    changes.push(`- Name: ${matchedEntry.name} → ${entry.name}`);
  }
  // matchedEntry (RosterEntry) and entry (SubmissionDraft) are deliberately not the same shape
  // (e.g. universityProfileUrl has no roster equivalent), so the old-value lookup goes through an
  // untyped view rather than claiming RosterEntry has every SubmissionDraft key.
  const matchedRecord = matchedEntry as unknown as Record<string, unknown>;
  for (const key of FIELD_ORDER) {
    const oldValue = key === 'field'
      ? fieldOf(matchedEntry.department, matchedEntry.university)
      : formatValue(matchedRecord[key]);
    const newValue = formatValue(entry[key]);
    if (oldValue !== newValue) {
      changes.push(`- ${FIELD_LABELS[key]}: ${oldValue || '(none)'} → ${newValue || '(removed)'}`);
    }
  }
  lines.push(...(changes.length ? changes : ['- No field changes submitted.']));
  if (notes) lines.push('', `Notes / evidence links: ${notes}`);
  return lines.join('\n');
}

function populateEntry(form: SubmitForm, entry: RosterEntry): void {
  form.dataset.editingId = entry.id;
  const optionalDetails = form.querySelector('.optional-group') as HTMLDetailsElement | null;
  if (optionalDetails) optionalDetails.open = true;
  form.name.value = entry.name;
  form.profileUrl.value = entry.profileUrl ?? '';
  form.vietnameseName.value = entry.vietnameseName ?? '';
  form.websiteUrl.value = entry.websiteUrl ?? '';
  // universityProfileUrl has no canonical roster field (see SubmissionDraft above), so an
  // existing entry never has anything to pre-fill here.
  form.universityProfileUrl.value = '';
  form.scholarUrl.value = entry.scholarUrl ?? '';
  form.linkedinUrl.value = entry.linkedinUrl ?? '';
  form.portraitSource.value = entry.portraitSource ?? '';
  updatePortraitPreview(form, entry);
  form.university.value = entry.university ?? '';
  form.city.value = entry.city ?? '';
  form.state.value = entry.state ?? '';
  form.country.value = entry.country ?? '';
  form.department.value = entry.department ?? '';
  form.field.value = fieldOf(entry.department, entry.university);
  form.rank.value = entry.rank ?? '';
  form.undergradYear.value = entry.undergradYear ? String(entry.undergradYear) : '';
  form.undergradInstitution.value = entry.undergradInstitution ?? '';
  form.msYear.value = entry.msYear ? String(entry.msYear) : '';
  form.msInstitution.value = entry.msInstitution ?? '';
  form.postdocYear.value = entry.postdocYear ? String(entry.postdocYear) : '';
  form.postdocInstitution.value = entry.postdocInstitution ?? '';
  form.phdYear.value = entry.phdYear ? String(entry.phdYear) : '';
  form.phdInstitution.value = entry.phdInstitution ?? '';
  form.mdYear.value = entry.mdYear ? String(entry.mdYear) : '';
  form.mdInstitution.value = entry.mdInstitution ?? '';
  form.researchAreas.value = entry.researchAreas ? entry.researchAreas.join(', ') : '';
  if (entry.track) {
    const radio = form.querySelector(`input[name="track"][value="${entry.track}"]`) as HTMLInputElement | null;
    if (radio) radio.checked = true;
  }
}

function updatePortraitPreview(form: SubmitForm, entry: RosterEntry | null): void {
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

function findMatchedEntry(
  form: SubmitForm,
  entriesById: Map<string, RosterEntry> | null,
  entriesByName: Map<string, RosterEntry> | null,
  name: string,
): RosterEntry | undefined {
  return entriesById?.get(form.dataset.editingId ?? '') ?? entriesByName?.get(name.toLocaleLowerCase().trim());
}

function clearAutoPopulatedEntry(form: SubmitForm): void {
  const name = form.name.value;
  form.reset();
  form.name.value = name;
  updatePortraitPreview(form, null);
  const optionalDetails = form.querySelector('.optional-group') as HTMLDetailsElement | null;
  if (optionalDetails) optionalDetails.open = false;
}

function getPurpose(): string {
  return (document.querySelector('input[name="purpose"]:checked') as HTMLInputElement | null)?.value ?? 'add';
}

function onSubmit(e: SubmitEvent, entriesById: Map<string, RosterEntry> | null, entriesByName: Map<string, RosterEntry> | null): void {
  e.preventDefault();
  const form = e.target as unknown as SubmitForm;
  const purpose = getPurpose();
  const bulkText = form.bulkInput?.value.trim() ?? '';
  const name = form.name.value.trim();

  if (purpose === 'add' && !bulkText && !name) {
    form.bulkInput.setCustomValidity('Paste at least a name or link, or enter one person’s details below.');
    form.bulkInput.reportValidity();
    return;
  }
  form.bulkInput?.setCustomValidity('');
  if (!form.reportValidity()) return;

  const matchedEntry = findMatchedEntry(form, entriesById, entriesByName, name);

  const researchAreas = form.researchAreas.value
    ? form.researchAreas.value
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];

  const entry: SubmissionDraft = {
    name,
    profileUrl: form.profileUrl.value.trim(),
    vietnameseName: form.vietnameseName.value.trim() || undefined,
    websiteUrl: form.websiteUrl.value.trim() || undefined,
    universityProfileUrl: form.universityProfileUrl.value.trim() || undefined,
    scholarUrl: form.scholarUrl.value.trim() || undefined,
    linkedinUrl: form.linkedinUrl.value.trim() || undefined,
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

  let title;
  let body;
  if (purpose === 'add' && bulkText) {
    title = name ? `VietProfs submission: ${name} + more` : 'VietProfs submission: new candidates';
    body = buildBulkSubmissionBody(bulkText, entry);
  } else if (matchedEntry) {
    title = `VietProfs update: ${name}`;
    body = buildUpdateBody(matchedEntry, entry, bulkText);
  } else {
    title = `VietProfs submission: ${name}`;
    body = buildNewEntryBody(entry, bulkText);
  }

  if ((e.submitter as HTMLButtonElement | null)?.value === 'github') {
    window.open(buildGithubIssueUrl(title, body), '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = buildEmailUrl(title, body);
  }
}

function applyPurpose(purpose: string): void {
  const requiredSection = document.getElementById('required-section');
  const requiredHeading = document.getElementById('required-heading');
  const requiredDescription = document.getElementById('required-description');
  const bulkCriteria = document.getElementById('bulk-criteria');
  const bulkLabel = document.getElementById('bulkInput-label');
  const bulkInput = document.getElementById('bulkInput') as HTMLTextAreaElement;
  const bulkHelp = document.getElementById('add-mode-details-help');
  const nameInput = document.getElementById('name') as HTMLInputElement;
  const profileUrlInput = document.getElementById('profileUrl') as HTMLInputElement;
  const isAdd = purpose === 'add';
  requiredSection.classList.toggle('single-entry-details', isAdd);
  requiredSection.hidden = isAdd && !requiredSection.classList.contains('expanded');
  requiredHeading.textContent = isAdd ? 'This person' : 'Required';
  requiredDescription.textContent = isAdd
    ? "You've filled in one person's full details directly, instead of pasting text above."
    : 'These two fields are needed to identify which entry to update.';
  bulkHelp.hidden = !isAdd;
  bulkCriteria.textContent = isAdd
    ? "Paste anything: a name, a link to someone's university profile or homepage, or a link to a page that lists several people (a department directory, a lab site). Plain text is fine — one item per line, or however you have it. Feel free to include any other notes or evidence here too — whatever helps us verify and add them."
    : 'Add any notes, corrections, or evidence links that will help us verify this update.';
  bulkLabel.textContent = isAdd ? 'Names, links, or notes' : 'Notes';
  bulkInput.placeholder = isAdd
    ? 'e.g.\nJane T. Nguyen — https://cs.example.edu/~jnguyen\nhttps://example.edu/faculty-directory\nSome Name, Some University'
    : 'e.g. Moved to a new university, updated title, corrected spelling, etc.';
  nameInput.required = !isAdd;
  profileUrlInput.required = !isAdd;
}

function initPurposeToggle() {
  const toggle = document.getElementById('purpose-toggle');
  const requiredSection = document.getElementById('required-section');
  const detailsButton = document.getElementById('add-mode-details-toggle');
  toggle.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.name === 'purpose') applyPurpose(target.value);
  });
  detailsButton.addEventListener('click', () => {
    requiredSection.classList.add('expanded');
    requiredSection.hidden = false;
    (document.getElementById('name') as HTMLInputElement).focus();
  });
  applyPurpose(getPurpose());
}

async function init() {
  renderShell();
  initPurposeToggle();
  const form = document.getElementById('submit-form') as SubmitForm;
  const nameInput = document.getElementById('name') as HTMLInputElement;
  const suggestions = document.getElementById('name-suggestions') as HTMLElement;
  const matchNotice = document.getElementById('name-match-notice') as HTMLElement;
  let entriesByName: Map<string, RosterEntry> | null = null;
  let entriesById: Map<string, RosterEntry> | null = null;

  form.addEventListener('submit', (e: SubmitEvent) => onSubmit(e, entriesById, entriesByName));

  try {
    const roster = await loadRoster();
    entriesByName = new Map(roster.map((entry) => [entry.name.toLocaleLowerCase(), entry]));
    entriesById = new Map(roster.map((entry) => [entry.id, entry]));
    let matchingEntries: RosterEntry[] = [];

    function hideSuggestions() {
      suggestions.hidden = true;
      nameInput.setAttribute('aria-expanded', 'false');
    }

    function checkMatch(name: string) {
      const entry = entriesById?.get(form.dataset.editingId ?? '') ?? entriesByName?.get(name.toLocaleLowerCase().trim());
      if (entry) {
        const profileUrl = `${import.meta.env.BASE_URL}${personPath(entry.id)}`;
        matchNotice.innerHTML = `Editing existing entry <strong>${escapeHtml(entry.id)}</strong> · <a href="${escapeHtml(profileUrl)}">View permanent profile</a><br><strong>${escapeHtml(entry.name)}</strong> · ${escapeHtml(entry.university)} · ${escapeHtml(entry.department)}. Details pre-filled for editing.`;
        matchNotice.hidden = false;
      } else {
        matchNotice.hidden = true;
      }
    }

    const requestedEdit = new URLSearchParams(window.location.search).get('edit');
    const entryToEdit = requestedEdit && (entriesById?.get(requestedEdit) ?? entriesByName?.get(requestedEdit.toLocaleLowerCase().trim()));
    const lockedEditId = entryToEdit ? entryToEdit.id : '';
    if (entryToEdit) {
      (document.querySelector('input[name="purpose"][value="update"]') as HTMLInputElement).checked = true;
      applyPurpose('update');
      populateEntry(form, entryToEdit);
      checkMatch(entryToEdit.name);
    }

    function showSuggestions(query: string) {
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
      const boundEntry = entriesById?.get(form.dataset.editingId ?? '');
      if (boundEntry && form.dataset.editingId !== lockedEditId && boundEntry.name.toLocaleLowerCase() !== query) {
        clearAutoPopulatedEntry(form);
        delete form.dataset.editingId;
      }
      const entry = entriesByName?.get(query);
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
