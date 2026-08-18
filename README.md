# Vietnamese Professors at U.S. Universities

> Find Vietnamese and Vietnamese-American tenure-line STEM professors at U.S. universities.

A searchable directory of Vietnamese professors across STEM fields at U.S. universities —
tenure-line faculty (tenure-track or tenured; not adjunct, teaching-only, or research-track).
Faculty whose tenure home is in one department with a
secondary/joint appointment elsewhere are marked with `†` and carry `secondaryAppointment: true`.

Static site, no backend: the roster lives in `public/data.json` and is loaded, searched, filtered,
and sorted client-side.

Started as a Computer Science-only list and has now completed an initial audit of the ten
canonical STEM fields. See [`ROSTER_EXPANSION.md`](./ROSTER_EXPANSION.md) for the detailed audit
handoff.

## Roster maintenance handoff

Before editing the roster, read [`ROSTER_EXPANSION.md`](./ROSTER_EXPANSION.md). It is the
authoritative continuation guide: inclusion criteria, evidence standard, JSON conventions,
completed-field log, and validation steps.

The canonical field list is:

1. Computer & Information Sciences
2. Engineering
3. Mathematics
4. Statistics & Data Science
5. Physics & Astronomy
6. Chemistry
7. Biological & Biomedical Sciences
8. Earth & Environmental Sciences
9. Agricultural & Natural Resource Sciences
10. Health Sciences

All ten received an initial pass on 2026-08-18. Subsequent work should be a targeted re-audit or
expansion of **one** of these fields at a time: review existing entries first, verify current
tenure-line status from official sources, then make only well-supported corrections, removals, or
additions. A relevant PhD program is not required. Run `npm test`, `npm run build`, and
`git diff --check` before committing.

## Commands

```bash
npm install
npm run dev       # vite dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
npm test          # data integrity checks (test/data.test.js)
```

## Data

`public/data.json` is this repo's own copy of the roster — edit it directly to add, remove, or
correct an entry. Each entry:

```json
{
  "name": "Full Name",
  "profileUrl": "https://…",
  "university": "…",
  "city": "…",
  "state": "…",
  "researchAreas": ["Area 1", "Area 2"],
  "secondaryAppointment": false,
  "department": "…"
}
```

`npm test` checks that every entry has the required fields and that names are unique.

## Public submissions

[`submit.html`](./submit.html) lets anyone propose a new entry or a correction without touching
git directly — similar to [csrankings.org/submit](https://csrankings.org/submit).
It only accepts **tenure-line** faculty (tenure-track or tenured — not adjunct, visiting,
teaching-only, research-track, or emeritus) and requires a faculty or scholarly profile link
before it will submit. On submit, it opens GitHub's "create new file" page, pre-filled with a JSON
submission file under `submissions/`, targeting `dynaroars/vietprofs`; the contributor reviews it
on GitHub and opens the pull request themselves (auto-forking if they lack push access). No
backend, no credentials handled by this site. Maintainers fold accepted `submissions/*.json` files
into `public/data.json` and delete them.
