# Sector-expansion discovery brief (2026-11-14)

You are finding eligible Vietnamese and Vietnamese-diaspora career researchers outside Vietnam who
are NOT yet in `public/data.json`, at one assigned employer group (given in your prompt).

Read first, and follow exactly:
- `TASKS/discover_industry_labs.md` — the three verification tests, proposed fields, screening.
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
- Dedup every candidate: `npm run find-roster-matches -- "<name>" --url <urls...>`. Any hit → not a
  new candidate (list it under `already_listed` or `possible_move` with the matching id).
- Career research role + (research doctorate, or ≥2 papers in last 3 years at the current employer).
- At most 25 verified candidates. Quality over count: 8 solid ones beat 25 shaky ones.

Output: write ONE JSON file at the path given in your prompt:
{
  "group": "<group name>",
  "agent": "<codex|agy>",
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
