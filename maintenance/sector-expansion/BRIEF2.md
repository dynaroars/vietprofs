# Discovery brief (2026-11-14; universities and non-university employers)

You are finding eligible Vietnamese and Vietnamese-diaspora career researchers outside Vietnam who
are NOT yet in `public/data.json`, in one assigned slice (given in your prompt).

Read first, and follow exactly:
- University slices: `TASKS/discover_new_faculty.md` and `TASKS/candidate_intake.md` (tracks:
  Tenure-line, Teaching, Research, Clinical, Admin and Staff, Emeritus; official institutional
  profile page as `profileUrl`; omit `institutionType` for universities).
- Non-university slices: `TASKS/discover_industry_labs.md` — the three verification tests,
  proposed fields, screening.
- `ROSTER_MAINTENANCE.md` — eligibility (tracks, `institutionType`, exclusions: postdocs, students,
  visiting, adjunct, contractors, anyone physically based in Vietnam), name rules (no diacritics in
  `name`, First Middle Last order; `vietnameseName` only when a cited source spells it).

Hard rules:
- Do NOT edit `public/`, `src/`, `scripts/`, `TASKS/`, or any file other than your output file.
- Do NOT run git commands that change state, and do NOT create GitHub Issues/PRs.
- Do NOT fetch LinkedIn or log in anywhere; no CAPTCHA/bot-check evasion. Search engines are for
  discovery only; every candidate must be verified on a live page published by the current employer
  (or, when the employer publishes none, the person's own site with `"confirmed": false`).
- A Vietnamese surname alone is a lead, not evidence. Exclude people of other ancestry who share
  surnames (e.g. Korean/Chinese "Lee/Li", "Tran" is fine but check "Le", "Ly", "Ha", "Lam", "Mai",
  "Dang", "Kim"): need a Vietnamese given name, Vietnamese-language page, Vietnamese education, or
  other affirmative signal; record which.
- Skip every name in `maintenance/sector-expansion/already-proposed.txt` (proposed in earlier runs).
- Dedup every candidate if you can run shell commands:
  `npm run find-roster-matches -- "<name>" --url <urls...>`. A hit is a lead, not a verdict: resolve
  identity (field, education, co-authors, page links). Same person → `already_listed` (or
  `possible_move` if the employer changed). Different person → keep as a candidate and note the id
  checked against. If you cannot run commands, say so in `dedup`.
- `profileUrl` must be a URL you actually opened in this run and that returned the person's page.
  Never construct or guess a URL from a pattern.
- Career research role + (research doctorate, or ≥2 papers in last 3 years at the current employer).
- At most 25 verified candidates. Quality over count: 8 solid ones beat 25 shaky ones.

Output: write ONE JSON file at the path given in your prompt:
{
  "group": "<group name>",
  "agent": "<codex|agy>",
  "slice": "<slice key>",
  "finishedAt": "<ISO time>",
  "candidates": [
    { "entry": { "name": "...", "university": "<employer, spelled like existing roster entries>",
                 "institutionType": "...", "track": "...", "rank": "Researcher|Administrator",
                 "department": "...", "city": "...", "state": "...", "country": "...",
                 "researchAreas": ["..."], "phdInstitution": "...", "phdYear": 2015,
                 "profileUrl": "https://<employer page>", "scholarUrl": "...", "websiteUrl": "..." },
      "evidence": { "currentRole": "<url + quoted line>", "doctorateOrPapers": "<url/papers>",
                    "vietnameseSignal": "<what and where>", "dedup": "<command output summary>" } }
  ],
  "already_listed": [ { "name": "...", "id": "vp-....", "note": "..." } ],
  "possible_move": [ { "name": "...", "id": "vp-....", "note": "roster says X, employer page says Y" } ],
  "rejected": [ { "name": "...", "reason": "..." } ],
  "coverage": [ { "employer": "...", "pagesExamined": ["..."], "note": "..." } ]
}
Omit fields you cannot source (never guess phdYear, city, or vietnameseName).

## Lessons from the 2026-11-14 sweep (added after the audit)

- `profileUrl` must be this person's own page. Team, lab, department or faculty-list pages are held.
- Quote the person's exact current title from that page in `evidence.currentRole`. If the page
  states no title, find another official page that does, or leave the person out.
- Do not propose "incoming" or "will join" appointments until they have started.
- Before you write, check your own list for duplicates: the same person must not appear twice.
