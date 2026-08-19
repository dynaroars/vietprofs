# Vietnamese Professors at U.S. Universities

> Find Vietnamese and Vietnamese-American professors across fields at U.S. universities.

A searchable directory of Vietnamese professors across fields at U.S. universities, covering two
employment tracks — **Tenure-line** (tenure-track or tenured) and **Teaching** (full-time,
continuing/permanent non-tenure-track teaching faculty) — selectable from a track dropdown
alongside the field filter. Neither track includes adjunct, visiting, postdoctoral,
affiliate/courtesy, research-track, emeritus/retired, or any other term-limited or part-time
appointment; see "Roster maintenance handoff" below for the exact bar each track has to clear.
Faculty whose tenure/teaching home is in one department with a secondary/joint appointment
elsewhere are marked with `†` and carry `secondaryAppointment: true`.

Static site, no backend: the roster lives in `public/data.json` and is loaded, searched, filtered,
and sorted client-side.

Started as a Computer Science-only list and completed an initial audit of the ten canonical STEM
fields on 2026-08-18. Six non-STEM fields (Business & Economics through Arts & Design below) were
added to the taxonomy on 2026-08-19. All sixteen fields, including Agricultural & Natural Resource
Sciences (the last to receive its first entries), completed a second full audit-and-search pass on
2026-08-19: every existing entry was checked against a current source, several stale entries were
corrected or removed, and new candidates were searched for field by field. Every field remains open
to further research passes — none of this is exhaustive, especially in the smaller-count fields.

## Roster maintenance handoff

Include a person only when reliable evidence, preferably an official university page, supports
all of the following: Vietnamese or Vietnamese-American identity (a Vietnamese-sounding name is
sufficient on its own — the maintainer reviews each addition and will catch false positives), a
current U.S.-university appointment that clears the bar for one of the two tracks below, and a
primary appointment that fits the field being reviewed. A relevant PhD program or PhD-advising
eligibility is not required.

Every entry carries a `track` field, one of the two values in `TRACKS` (`src/data.js`):

- **`"Tenure-line"`** — tenure-track or already tenured.
- **`"Teaching"`** — a full-time, continuing/permanent non-tenure-track teaching appointment:
  titles like Teaching Professor, Senior/Principal/Distinguished Lecturer, or "Professor of
  Practice" *only* when the university's own page describes it as their permanent teaching-ladder
  rank, not a placeholder for a one-off practitioner hire. Confirm permanence from the source's own
  language ("full-time," "continuing appointment," "non-tenure-track faculty," a named promotion
  ladder) — never from the title alone, since the same title means career security at one school
  and a one-year visiting gig at another.

Regardless of track, exclude adjunct, visiting, postdoctoral, affiliate/courtesy, research-track,
emeritus/retired, graduate teaching assistants, plain "Instructor" (almost always term-limited —
verify case by case rather than including on the title alone), and non-university appointments.

Work on one broad field at a time. Audit its existing entries before adding candidates; verify
identity, current track status, primary department, rank, and profile URL individually;
cross-check the full roster for duplicate people and joint appointments; and update the field
rules in `src/data.js` if a new department type needs a shared filter bucket. When a department
name is structurally ambiguous — the string alone doesn't say which field it belongs to, only
the school/unit that actually houses the position does (e.g. "Information Studies" is Computer &
Information Sciences at an iSchool but Education at UCLA's School of Education & Information
Studies) — add an exact `department|university` entry to `FIELD_OVERRIDES` in `src/data.js`
instead of stretching a regex to guess. Search broadly
rather than stopping after the first few candidates, make incremental validated edits, and run

Two different people can share the same name (`npm test` enforces unique `name` values). When
that happens, first check whether each person's own official profile publishes a fuller form of
their name (a middle name, initial, or nickname) — if so, use that; it's usually enough to make
the two entries distinct without any further change (e.g. "Thanh Nguyen" vs. "Thanh (Hans)
Nguyen"). Only when the names are genuinely identical with no such distinction available, fall
back to appending the university: `"Full Name - University"` for each person sharing the name.
`npm test`, `npm run build`, and `git diff --check` before committing.

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
11. Business & Economics
12. Social & Behavioral Sciences
13. Education
14. Humanities
15. Law & Public Affairs
16. Arts & Design

A department that fits none of these falls through to its own raw name rather than a bucket,
which `npm test` reports so a maintainer can add an explicit rule (or a `FIELD_OVERRIDES` entry)
in `src/data.js`.

The ten STEM fields received an initial pass on 2026-08-18. Subsequent work should be a
targeted re-audit or expansion of **one** of these fields at a time: review existing entries first, verify current
track status from official sources, then make only well-supported corrections, removals, or
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
  "scholarUrl": "https://scholar.google.com/…",
  "university": "…",
  "city": "…",
  "state": "…",
  "researchAreas": ["Area 1", "Area 2"],
  "secondaryAppointment": false,
  "track": "Tenure-line",
  "department": "…",
  "rank": "Associate Professor",
  "phdYear": 2018,
  "phdInstitution": "…",
  "undergradInstitution": "…"
}
```

`track` is required and must be one of `TRACKS` in `src/data.js` (`"Tenure-line"` or
`"Teaching"`) — see "Roster maintenance handoff" above for what each one requires. `scholarUrl`,
`rank`, `phdYear`, `phdInstitution`, and `undergradInstitution` are optional. Keep
each object on one line. `undergradInstitution` isn't populated on any entry yet — several bios
mention a Vietnamese undergraduate alma mater, and `buildFunFacts()` in `src/data.js` already
computes a "most common undergraduate alma mater" fact from it, but filling it in is a dedicated
research pass that hasn't happened; the fact simply doesn't appear until it does. `profileUrl`
should be a current, working academic profile: prefer the professor's own
maintained academic homepage when available, then use an official university faculty page as a
fallback. Store Google Scholar separately in `scholarUrl`; never use it as `profileUrl`.

For roster audits, preserve an existing Google Scholar URL by moving it to `scholarUrl` before
replacing `profileUrl`. Verify replacement URLs follow redirects and do not return 404. Add rank
only when a current academic homepage or official university page explicitly supports it. If a
current personal academic homepage gives a higher rank than a university directory, retain the
higher title (directories can lag promotions). Add `phdYear` and `phdInstitution` only when a
source explicitly states them; do not infer either from dates, CV chronology, or other context.
Do not alter unrelated roster fields during these audits.

Use the person's full published academic name when an official profile or maintained academic
homepage explicitly supplies it. Expand a middle initial only with such evidence; never infer or
guess a middle name from initials, publication metadata, or name patterns.

For display consistency, every `name` is stored without Vietnamese diacritics (`Nguyen`, not
`Nguyễn`) and in First (Middle) Last order, even when a person's own site or publications use
Vietnamese surname-first order (e.g. Rutgers' Pham Huu Tiep is stored as `Tiep Huu Pham`). This is
a roster-display normalization, not a claim about how the person publishes elsewhere. The search
box still matches either spelling — see `stripDiacritics` in `src/data.js`.

`npm test` checks that every entry has the required fields and that names are unique.


## Public submissions

[`submit.html`](./submit.html) lets anyone propose a new entry or a correction without touching
git directly.
It accepts faculty on either track — **Tenure-line** (tenure-track or tenured) or **Teaching**
(full-time, continuing/permanent non-tenure-track teaching faculty) — but not adjunct, visiting,
postdoctoral, affiliate/courtesy, research-track, or emeritus appointments on either track, and
requires a faculty or scholarly profile link before it will submit. The default path opens a
pre-filled email to `root@roars.dev`; contributors
who prefer GitHub can instead open a pre-filled issue in `dynaroars/vietprofs`. No backend or
credentials are handled by the site. Maintainers review email and GitHub submissions before
folding accepted entries into `public/data.json`.
