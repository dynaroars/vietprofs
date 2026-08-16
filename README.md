# VietAcademia

A searchable directory of Vietnamese professors in Computer Science at U.S. universities —
full-time, tenure-line faculty who can solely advise CS PhD students. Faculty whose tenure home
is in another department (e.g. ECE, Statistics) with a secondary/joint CS appointment are marked
with `†`.

Static site, no backend: the roster lives in `public/data.json` and is loaded, searched, filtered,
and sorted client-side.

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
  "secondaryAppointment": false
}
```

`npm test` checks that every entry has the required fields and that names are unique.
