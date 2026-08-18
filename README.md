# Vietnamese Professors at U.S. Universities

A searchable directory of Vietnamese professors across STEM fields at U.S. universities —
tenure-line faculty (tenure-track or tenured; not adjunct, teaching-only, or research-track).
Faculty whose tenure home is in one department with a
secondary/joint appointment elsewhere are marked with `†` and carry `secondaryAppointment: true`.

Static site, no backend: the roster lives in `public/data.json` and is loaded, searched, filtered,
and sorted client-side.

Started as a Computer Science-only list; now being expanded field by field to cover all STEM
disciplines. See [`ROSTER_EXPANSION.md`](./ROSTER_EXPANSION.md) for the verification bar, schema,
and per-field progress — read it before adding entries for a new field.

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

`submit.html` (linked from the site footer) lets anyone propose a new entry or a correction
without touching git directly — similar to [csrankings.org/submit](https://csrankings.org/submit).
It only accepts **tenure-line** faculty (tenure-track or tenured — not adjunct, visiting,
teaching-only, research-track, or emeritus) and requires a Google Scholar profile link before it
will submit. On submit, it opens GitHub's "create new file" page, pre-filled with a JSON
submission file under `submissions/`, targeting `dynaroars/vietprofs`; the contributor reviews it
on GitHub and opens the pull request themselves (auto-forking if they lack push access). No
backend, no credentials handled by this site. Maintainers fold accepted `submissions/*.json` files
into `public/data.json` and delete them.
