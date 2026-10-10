# Credentials, Honors, and Direct Fields Protection (`audit_facts_and_honors.md`)

> Audit honors and degrees on existing roster entries in rotation. Each run takes the next batch of
> roster ids, checks every entry's honors and degree fields against official and awarding-body
> sources, and submits the corrections as one PR. New people noticed along the way go to
> `New candidate:` Issues (`AGENTS.md` "New entries vs. edits"); this task never assigns an id.

---

## Batching and PR protocol

1. **Routing:** Follow the "Where each kind of change lands" table in `AGENTS.md` (existing-ID
   edits → PR; new people → Issue; never commit directly to `main`).
2. **Batch:** At most 20 roster entries per run, in id order after the highest id listed in the
   last `[scheduled:honors]` PR, wrapping at the end of the roster. One batch per run; the rotation
   continues across runs.
3. **Per entry:** Open the official profile and, where available, the CV or homepage. Search the
   awarding bodies for honors that meet the bar in section 3 (academies, society fellowships,
   career awards, major awards, named chairs) and check that each stored honor still has a working
   HTTPS source naming the person. Check degree fields against section 2. Record only what a source
   states; leave a field empty rather than guess.
4. **Protected values:** Never change an honor on an entry whose `directFields` lists `honors`; a
   conflict goes to an Issue for the owner.
5. **Submit:** Branch `maintenance/honors-<YYYY-MM-DD>`, run
   `npm test && npm run build && git diff --check`, commit `public/data.json` and
   `public/updates.json`, push, and open a PR titled `[scheduled:honors] Honors and degrees
   (<first id>–<last id>)`. In the body, list every entry checked, including those with no change,
   so the next run knows where to resume. Do not merge it; the auditor (`TASKS/AUDIT_ISSUES_PRS.md`)
   reviews and merges.

---

## 1. Core Principles & Governance Rules

`directFields` protection and the direct-update rules are defined in `AGENTS.md` ("Direct
updates"). `npm test` stamps `lastUpdatedAt` on changed entries.

---

## 2. Educational Credentials Verification & Chronology Rules

Academic degrees must be corroborated by official institutional bios, personal academic homepages, or verified CVs.

### A. Allowed Credential Fields
- `phdInstitution`, `phdYear`
- `msInstitution`
- `undergradInstitution`, `undergradYear`
- `mdInstitution`
- `postdocInstitution` (completed postdoc only)

### B. Strict Chronology & Formatting Rules
1. **Academic Progression Order:** `phdYear` must be at least 2 years after `undergradYear`.
2. **Implausible Interval Detection:** Flag and investigate implausible intervals (e.g. an undergrad graduation year of 2024 for a professor who completed a PhD in 2003).
3. **Canonical Institution Formatting:** Store canonical institution names without prepended degree prefixes (e.g., store `"University of California, Berkeley"`, NOT `"PhD from UC Berkeley"`).

---

## 3. Honors & Awards Eligibility

The authoritative rules are "Honors and awards eligibility" in `ROSTER_MAINTENANCE.md`; read it
before adding or rejecting any honor. Do not maintain a separate list here. Each honor needs
`name`, `category` (`academy`, `fellow`, `career_award`, `major_award`,
`distinguished_professorship`), `organization`, an HTTPS `source` that names the recipient, and
`year` when available.

Frequent rejections: per-year best/distinguished-paper awards (only test-of-time,
most-influential, or similar retrospective awards qualify), student/postdoc-stage awards
(including dissertation awards), NSF CRII and other research-initiation grants,
university-local awards, and anything whose standing can't be established from the source.

---

## 4. Execution & Validation Workflow

```bash
# Validate data schema, degree chronology, and honors provenance
npm run validate-data

# Check honor source URLs for broken links
npm run check-links -- --field honors

# Run full test suite and build validation
npm test && npm run build && git diff --check
```
