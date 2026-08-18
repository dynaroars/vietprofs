import './style.css';

const GITHUB_REPO = 'dynaroars/vietprofs';
const GITHUB_BRANCH = 'main';

const app = document.getElementById('app');

function slugify(name) {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'entry'
  );
}

function renderShell() {
  app.innerHTML = `
    <header>
      <h1><a class="home-link" href="/">VietAcademia</a></h1>
      <p class="tagline">Submit a new entry, or correct an existing one</p>
      <p class="criteria">
        Only <span class="term" tabindex="0" data-tooltip="On the tenure track or already tenured — not a term, teaching-only, visiting, research-track, or emeritus position.">tenure-line</span>
        faculty (tenure-track or tenured) qualify — no adjunct, visiting, teaching-only, or
        research-track positions. Please have a .edu faculty page and a Google Scholar profile
        link ready; both are required below.
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
        <label for="target">Name of the existing entry, exactly as shown on the site *</label>
        <input id="target" name="target" type="text" />
      </div>

      <div class="form-section">
        <label for="name">Full name *</label>
        <input id="name" name="name" type="text" required />
      </div>

      <div class="form-section">
        <label for="profileUrl">Google Scholar profile URL *</label>
        <input id="profileUrl" name="profileUrl" type="url" required placeholder="https://scholar.google.com/citations?user=…" />
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
          verified this via their .edu faculty page and Google Scholar profile.
        </label>
      </div>

      <button type="submit" class="submit-btn">Open pull request on GitHub</button>
      <p class="submit-hint" id="submit-hint">
        This opens GitHub with a new file pre-filled from this form — nothing is sent anywhere
        until you take action on GitHub yourself. You'll need a free GitHub account; if you're not
        signed in, GitHub will ask you to sign in first. Review the pre-filled file and click
        "Propose new file" to open a pull request — no hand-written JSON required.
      </p>
    </form>
  `;
}

function buildGithubUrl(filename, content) {
  const params = new URLSearchParams({ filename, value: content });
  return `https://github.com/${GITHUB_REPO}/new/${GITHUB_BRANCH}?${params.toString()}`;
}

function onKindChange(form) {
  const isCorrection = form.kind.value === 'correction';
  document.getElementById('correction-target-row').hidden = !isCorrection;
  form.target.required = isCorrection;
}

function onSubmit(e) {
  e.preventDefault();
  const form = e.target;

  if (!form.reportValidity()) return;

  const kind = form.kind.value;
  const name = form.name.value.trim();
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

  const filename = `submissions/${slugify(name)}-${Date.now()}.json`;
  const content = JSON.stringify(submission, null, 2);
  window.open(buildGithubUrl(filename, content), '_blank', 'noopener,noreferrer');
}

function init() {
  renderShell();
  const form = document.getElementById('submit-form');
  form.addEventListener('submit', onSubmit);
  form.querySelectorAll('input[name="kind"]').forEach((radio) => {
    radio.addEventListener('change', () => onKindChange(form));
  });
}

init();
