# Vietnamese Professors Worldwide

> Find Vietnamese and Vietnamese diaspora professors across fields at universities worldwide.

A searchable directory of Vietnamese professors across fields worldwide, covering three
employment tracks — **Tenure-line** (tenure-track or tenured), **Teaching** (full-time,
continuing/permanent non-tenure-track teaching faculty), and **Emeritus** (formally conferred
emeritus/emerita status after a tenure-line career) — selectable from a track dropdown alongside
the location and field filters. No track includes adjunct, visiting, postdoctoral, affiliate/courtesy,
research-track, or any other term-limited or part-time appointment, and plain retirement without a
conferred emeritus title doesn't qualify for the Emeritus track either; see "Roster maintenance
handoff" below for the exact bar each track has to clear. Faculty whose tenure/teaching home is in
one department with a secondary/joint appointment elsewhere are marked with `†` and carry
`secondaryAppointment: true`.

Static site, no backend: the roster lives in `public/data.json` and is loaded, searched, filtered,
and sorted client-side.

Started as a Computer Science-only list and completed an initial audit of the ten canonical STEM
fields on 2026-08-18. Six non-STEM fields (Business & Economics through Arts & Design below) were
added to the taxonomy on 2026-08-19. All sixteen fields, including Agricultural & Natural Resource
Sciences (the last to receive its first entries), completed a second full audit-and-search pass on
2026-08-19: every existing entry was checked against a current source, several stale entries were
corrected or removed, and new candidates were searched for field by field. Every field remains open
to further research passes — none of this is exhaustive, especially in the smaller-count fields.
The `Others` category was added on 2026-08-20 so qualifying faculty in departments outside those
sixteen disciplines are included rather than omitted. Global location support across North America,
Europe, Asia, Australasia, South America, and Africa was introduced with a dedicated location selector.

## Using the website & search features

The directory offers instant client-side filtering, free-text search, and structured query operators:

### Basic & diacritic-insensitive search
The main search bar matches across professor names, current universities, departments, ranks, cities, states, countries, research areas, and **doctoral (PhD) institutions**. Search is fully diacritic-insensitive in both directions: typing `Nguyen` or `Nguyễn`, `Vu` or `Vũ`, and `Do` or `Đỗ` will find all matching profiles.

> **Why does searching for a place or school return faculty located elsewhere?**
> Free-text search matches across **all profile metadata**, including a professor's **PhD Alma Mater**. For instance, searching `Hong Kong` will return faculty currently appointed in Hong Kong (*e.g., at HKU or CUHK*) **as well as** professors who completed their doctorate in Hong Kong (*e.g., Prof. Ngoc Son Bui at Oxford, who earned his PhD at the University of Hong Kong*).

### Structured query prefixes
To target a specific field (such as current appointment vs. PhD alma mater vs. country) and avoid broader full-text matches, use structured prefix filters in the search box:

| Prefix | Description | Examples |
|---|---|---|
| `univ:` / `university:` / `school:` | Matches only faculty currently appointed at that university (excludes alumni who graduated from there but teach elsewhere). | `univ:Oxford`, `univ:"University of Hong Kong"`, `univ:NUS` |
| `phd:` / `phdinstitution:` / `alma:` | Matches only faculty who earned their doctorate at that institution. | `phd:Stanford`, `phd:"University of Hong Kong"`, `phd:MIT` |
| `country:` / `nation:` | Matches professors currently located in that country. | `country:"Hong Kong"`, `country:France`, `country:Singapore`, `country:Australia` |
| `continent:` / `location:` / `loc:` | Matches professors in that continent/region (`US`, `North America`, `Europe`, `Asia`, `Australasia`, `South America`, `Africa`, `World`). | `continent:Europe`, `continent:Asia`, `loc:"North America"` |
| `state:` | Matches professors located in that state or province (supports full name or two-letter postal code). | `state:California`, `state:TX`, `state:Ontario`, `state:Victoria` |
| `city:` | Matches professors located in that city. | `city:Seattle`, `city:Singapore`, `city:Paris`, `city:Melbourne` |
| `dept:` / `department:` | Matches primary department names. | `dept:Computer Science`, `dept:Economics`, `dept:Law` |
| `name:` | Matches the professor's displayed name. | `name:"Thanh Nguyen"`, `name:"Ngoc Son Bui"` |

*Note: Multi-word values can be written directly (e.g. `univ:University of Hong Kong`) or enclosed in quotes (e.g. `univ:"University of Hong Kong"`).*

### Filters & insights dashboard
- **Location, Field & Track Dropdowns**: Filter concurrently across countries represented by at least one professor (**United States** [default], followed by the other countries in the roster, with flags), or by continent (**North America**, **South America**, **Africa**, **Asia**, **Australasia**, **Europe**, **World**), 17 broad academic disciplines, and 3 appointment tracks (**Tenure-line**, **Teaching**, **Emeritus**). The search syntax also supports these continent/region filters directly, such as `loc:Europe`.
- **✨ Show me something interesting**: Select this option in the field dropdown to open the interactive insights dashboard:
  - **Geographic Distribution**: 50 states + DC schematic heat map. Clicking any state tile automatically filters the roster by `state:<State>`.
  - **Top Faculty Hubs**: Universities employing the most Vietnamese faculty. Clicking a hub filters by `univ:<University>`.
  - **Top PhD Alma Maters**: Doctoral institutions that trained the most faculty. Clicking an institution filters by `phd:<Institution>`.
  - **PhD Graduation Cohorts & Highlights**: Decadal graduation timeline and community statistics calculated live from the live roster.
- **Sharable URLs**: All active searches and filters sync automatically with URL parameters (`?q=...`, `?loc=...`, `?field=...`, `?track=...`) so any filtered view can be shared or bookmarked directly.

## Roster maintenance handoff

Include a person only when reliable evidence, preferably an official university page, supports
all of the following: Vietnamese or Vietnamese-American identity (a Vietnamese-sounding name is
sufficient on its own — the maintainer reviews each addition and will catch false positives), a
U.S.-university appointment (current, except for Emeritus — see below) that clears the bar for one
of the three tracks below, and a primary academic appointment in any department. A relevant PhD
program or PhD-advising eligibility is not required.

Every entry carries a `track` field, one of the three values in `TRACKS` (`src/data.js`):

- **`"Tenure-line"`** — tenure-track or already tenured.
- **`"Teaching"`** — a full-time, continuing/permanent non-tenure-track teaching appointment:
  titles like Teaching Professor, Senior/Principal/Distinguished Lecturer, or "Professor of
  Practice" *only* when the university's own page describes it as their permanent teaching-ladder
  rank, not a placeholder for a one-off practitioner hire. Confirm permanence from the source's own
  language ("full-time," "continuing appointment," "non-tenure-track faculty," a named promotion
  ladder) — never from the title alone, since the same title means career security at one school
  and a one-year visiting gig at another.
- **`"Emeritus"`** — a formally conferred emeritus title following a
  tenure-line career, evidenced by the university's own emeritus faculty listing, a news item about
  the conferral, or the person's own page using the title. Plain retirement, resignation, or "former
  faculty" phrasing without the specific conferred title does not qualify — the university has to
  have granted the honorific, not just stopped employing them. Prefer a source that still lists them
  as living/current emeritus faculty; skip anyone whose only listing is an in-memoriam/deceased-
  faculty page rather than an active emeritus roster.

Regardless of track, exclude adjunct, visiting, postdoctoral, affiliate/courtesy, research-track,
graduate teaching assistants, plain "Instructor" (almost always term-limited — verify case by case
rather than including on the title alone), and non-university appointments.

Work on one university or broad field at a time. Audit its existing entries before adding candidates; verify
identity, current track status, primary department, simplified rank, and profile URL individually;
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
17. Others

A department that fits none of the sixteen named disciplinary buckets maps to `Others`. Use that
catch-all for valid appointments outside the taxonomy; do not exclude the person merely because
their department lacks an existing field rule.

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

`track` is required and must be one of `TRACKS` in `src/data.js` (`"Tenure-line"`, `"Teaching"`, or
`"Emeritus"`) — see "Roster maintenance handoff" above for what each one requires. `scholarUrl`,
`rank`, `phdYear`, `phdInstitution`, and `undergradInstitution` are optional. Rank uses only
`"Assistant Professor"`, `"Associate Professor"`, or `"Professor"` for Tenure-line entries,
`"Teaching"` for Teaching entries, and `"Emeritus"` for Emeritus entries; named chairs and
institution-specific title wording remain available on the linked profile. Keep
each object on one line. `undergradInstitution` isn't populated on any entry yet — several bios
mention a Vietnamese undergraduate alma mater, and `buildFunFacts()` in `src/data.js` already
computes a "most common undergraduate alma mater" fact from it, but filling it in is a dedicated
research pass that hasn't happened; the fact simply doesn't appear until it does. `profileUrl`
should be a current, working academic profile: prefer the professor's own
maintained academic homepage when available, then use an official university faculty page as a
fallback. Store Google Scholar separately in `scholarUrl`; never use it as `profileUrl`.

For roster audits, preserve an existing Google Scholar URL by moving it to `scholarUrl` before
replacing `profileUrl`. Verify replacement URLs follow redirects and do not return 404. Map the
source's title to the simplified rank vocabulary above. Add `phdYear` and `phdInstitution` only when a
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
It accepts faculty on any of the three tracks — **Tenure-line** (tenure-track or tenured),
**Teaching** (full-time, continuing/permanent non-tenure-track teaching faculty), or **Emeritus**
(formally conferred emeritus/emerita status) — but not adjunct, visiting, postdoctoral,
affiliate/courtesy, research-track appointments, or plain retirement without a conferred emeritus
title, and requires a faculty or scholarly profile link before it will submit. The default path opens a
pre-filled email to `root@roars.dev`; contributors
who prefer GitHub can instead open a pre-filled issue in `dynaroars/vietprofs`. No backend or
credentials are handled by the site. Maintainers review email and GitHub submissions before
folding accepted entries into `public/data.json`.
