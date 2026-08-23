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

### Deep re-audit tracker

The current field-by-field re-audit began on 2026-08-22. Completed fields are removed from this
list only after current faculty sources and major-honor sources have been checked:

- Completed: Physics & Astronomy; Statistics & Data Science; Chemistry;
  Biological & Biomedical Sciences; Earth & Environmental Sciences;
  Agricultural & Natural Resource Sciences; Health Sciences; Business & Economics;
  Social & Behavioral Sciences; Education; Computer & Information Sciences; Engineering;
  Mathematics
- Remaining: none — all listed fields have been audited.
  Humanities; Law & Public Affairs; Arts & Design; Others

### Non-U.S. field-by-field audit TODO

This separate pass covers faculty currently based outside the United States. It searches for
major internationally recognized honors and selective national equivalents of U.S. programs
such as NSF CAREER, PECASE, Sloan, ONR YIP, and DARPA YFA. Completed fields are crossed out
after current-faculty and major-honor sources have been checked:

- [x] ~~Mathematics~~
- [x] ~~Engineering~~
- [x] ~~Chemistry~~
- [x] ~~Health Sciences~~
- [x] ~~Biological & Biomedical Sciences~~
- [x] ~~Law & Public Affairs~~
- [x] ~~Physics & Astronomy~~
- [x] ~~Computer & Information Sciences~~
- [x] ~~Business & Economics~~
- [ ] Education
- [ ] Humanities
- [ ] Agricultural & Natural Resource Sciences
- [ ] Social & Behavioral Sciences
- [ ] Others
- [ ] Statistics & Data Science
- [ ] Arts & Design
- [ ] Earth & Environmental Sciences

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

## Awards and honors

The optional `honors` field in each professor record is intentionally conservative. It is
reserved for major, selective, and internationally or nationally recognized academic honors
that help distinguish a professor's research standing. The goal is precision rather than a
complete CV transcription.

Included honors generally fall into these categories:

- **Academy memberships**: selective membership in organizations such as the National Academies,
  the American Academy of Arts and Sciences, the Royal Society, Academia Europaea, or TWAS.
- **Major professional fellowships**: Fellow designations from highly recognized societies such
  as ACM, IEEE, AAAI, APS, SIAM, INFORMS, ASA, ASME, ASCE, AIMBE, or Optica.
- **Major early-career awards**: NSF CAREER, PECASE, Sloan Research Fellowship, Packard,
  ONR/ARO/AFOSR Young Investigator awards, DARPA Young Faculty Award, DOE Early Career Award,
  NIH Director's awards, and comparable national programs.
- **Field-wide or international awards**: major discipline-wide prizes such as the Turing Award,
  Fields Medal, Nobel Prize, Gödel Prize, Knuth Prize, ACM Prize in Computing, and comparable
  international research awards.
- **Major research-impact awards**: official 10-year, test-of-time, most-influential-paper,
  or most-impactful-paper awards from major ACM, IEEE, or equivalent disciplinary venues. Examples
  include ACM SIGCOMM, SIGMOD, SIGKDD, SIGACT/STOC, SIGSOFT/ICSE, SIGSAC/CCS, SIGOPS, SIGPLAN,
  SIGMOBILE, SenSys, MobiSys, CHI, UIST, IMC, and SIGEVO awards, as well as IEEE INFOCOM,
  ICDE, VIS/VAST, and comparable flagship-venue awards; VLDB 10-Year Best Paper Awards are also
  eligible. These are included only when the award is a retrospective field-recognition
  distinction—not an ordinary Best Paper, Distinguished Paper, or honorable-mention award. For
  example, ACM SIGSOFT/IEEE TCSE ICSE Most Influential Paper and ACM SIGEVO Impact Award qualify.
- **Major technical achievement awards**: internationally recognized individual awards from major
  scholarly societies, such as the ACM Software System Award, Paris Kanellakis Theory and Practice
  Award, SIGPLAN Programming Languages Achievement Award, SIGOPS Mark Weiser Award, SIGMOD
  Systems Award, SIGCOMM Networking Systems Award, SIGSAC Outstanding Innovation Award, IEEE
  Computer Society W. Wallace McDowell Award, Charles Babbage Award, Edward J. McCluskey Technical
  Achievement Award, Harry H. Goode Memorial Award, Harlan D. Mills Award, ACM/IEEE Eckert-Mauchly
  Award, Seymour Cray Computer Engineering Award, and comparable major mathematics or engineering
  society prizes. These must represent broad technical or research achievement, not service,
  teaching, or a routine conference distinction.
- **Major society early-career honors**: unusually selective field-wide recognitions such as the
  ACM Grace Murray Hopper Award, ACM SIGCOMM Rising Star Award, ACM SIGSOFT Early Career Research
  Award, and comparable society-level awards. These qualify because they recognize exceptional
  research contributions across a field, rather than a single paper or a local university award.
- **Distinguished professorships**: exceptionally prestigious university-wide professorships or
  endowed chairs, such as University Professor, Institute Professor, Regents Professor, or a
  comparable distinguished university appointment. Ordinary named faculty positions do not
  automatically qualify.

The cross-field award families considered in the audit include:

- **Computing and engineering**: ACM, IEEE, AAAI, SIAM, and equivalent society Fellow elections;
  NSF CAREER, PECASE, Sloan, Packard, ONR/ARO/AFOSR, DARPA, DOE, and comparable investigator
  programs; major ACM/IEEE technical achievement prizes; and retrospective Test-of-Time,
  Most-Influential-Paper, or Impact awards from major ACM, IEEE, or equivalent flagship venues.
- **Mathematics, statistics, and economics**: academy memberships; AMS, ASA, IMS, SIAM,
  Econometric Society, and comparable Fellow distinctions; major national early-career awards;
  and field-wide prizes such as Fields-, Abel-, Wolf-, COPSS-, and Frisch-level honors when the
  recipient and award are directly verified.
- **Natural, biomedical, and public-health sciences**: National Academy elections; major society
  Fellow designations; NIH, NSF, Sloan, PECASE, and comparable national investigator awards; and
  internationally recognized discipline-wide prizes.
- **Social sciences, humanities, and the arts**: major academy or society Fellow elections;
  discipline-wide honors from organizations such as APSA, ASA, AEA, AHA, MLA, and equivalent
  international bodies; major national book or research prizes; and exceptional distinctions
  such as the Pulitzer Prize, MacArthur Fellowship, Guggenheim Fellowship, or a comparable
  internationally recognized honor. Ordinary book, article, dissertation, teaching, service,
  and campus awards remain excluded even when they are competitive within a subfield.

Routine grants and recognition are excluded, including NSF CRII and ordinary research grants,
best-paper and distinguished-paper awards, teaching or service awards, department-level awards,
travel awards, student scholarships, ordinary society membership, IEEE/ACM Senior Member status,
editorial positions, committee service, keynote invitations, citation metrics, and highly cited
researcher lists. A qualifying honor must be verified for the correct person and must carry its
own source URL; official awarding-body pages are preferred, followed by official university
announcements, faculty pages, and the professor's CV or academic website.

Honors use normalized names and categories (`academy`, `fellow`, `career_award`, `major_award`,
or `distinguished_professorship`) and record the official year when it can be verified; otherwise
the year is `null`. Honor names and organizations are indexed by the search box, so searches for
an award such as `IEEE Fellow`, `NSF CAREER Award`, or `honors`/`awards` return the relevant
professors.

## FAQ

### What is VietProfs?

VietProfs is a searchable, community-maintained directory of Vietnamese and Vietnamese diaspora
professors across fields at universities worldwide, on one of three employment tracks: Tenure-line,
Teaching, or Emeritus.

### Who is included?

An entry is included when reliable evidence supports all of the following:

- Vietnamese or Vietnamese diaspora identity;
- a university appointment on one of the three tracks below (current, except for Emeritus) at an accredited higher education institution worldwide, focused on the global diaspora outside domestic Vietnam;
- a primary academic appointment in any field.

The university does not need to offer a PhD program.

**Tenure-line** — tenure-track or tenured. Assistant, Associate, and full Professors generally qualify when the other requirements are met.

**Teaching** — a full-time, continuing/permanent non-tenure-track teaching appointment (Teaching Professor, Senior/Principal/Distinguished Lecturer, or a "Professor of Practice" title only when the university's own page describes it as a permanent teaching-ladder rank). This track requires the source to say the position is full-time and continuing/permanent, not just carry a teaching-sounding title.

**Emeritus** — a formally conferred emeritus title following a tenure-line career, shown on the university's own emeritus faculty listing, a conferral announcement, or the person's own page. Plain retirement or "former faculty" phrasing without the specific conferred title doesn't qualify, and an in-memoriam/deceased-faculty-only listing isn't enough either — the university has to still carry them as living, current emeritus faculty.

Displayed ranks are deliberately simple: Assistant Professor, Associate Professor, or Professor for Tenure-line faculty; Teaching for the continuing teaching track; and Emeritus for the emeritus track. Named chairs and institution-specific title variants remain on each linked university page.

### Who is excluded?

Regardless of track, the directory excludes adjunct, visiting, postdoctoral, affiliate/courtesy, research-track, graduate teaching assistants, plain "Instructor" (verified case by case, since it's almost always term-limited), and non-university appointments. Clinical faculty are not included solely because they hold an academic title, and retirement alone doesn't qualify someone for the Emeritus track without a conferred emeritus title.

### How is identity determined?

A Vietnamese-sounding name is sufficient on its own to include someone; the maintainer reviews each addition and corrects any false positive. Supporting evidence — an official biography, education history in Vietnam, self-identification, Vietnamese professional or community affiliation — is welcome but not required.

### How current is the data?

The roster is audited field by field using official university sources where possible. Academic appointments change, so entries can become outdated. The project welcomes corrections.

### Why is an entry marked with a dagger (†)?

A dagger means the person has a secondary or joint appointment in the listed field while their primary tenure home is in another department.

### Why does a search for a university or city/country return professors teaching elsewhere?

The default search box is a comprehensive **full-text search** that indexes all profile fields, including a professor's **doctoral (PhD) alma mater**. For example, typing "Hong Kong" matches faculty currently teaching at HKU/CUHK as well as professors who completed their doctorate in Hong Kong, such as Prof. Ngoc Son Bui at the University of Oxford, who earned his PhD at the University of Hong Kong.

To restrict your search to a specific attribute, use structured prefixes:

- **country:** "Hong Kong" — matches only professors currently appointed in Hong Kong.
- **univ:** "University of Hong Kong" — matches only professors currently teaching at HKU.
- **phd:** "University of Hong Kong" — matches only professors who graduated from HKU.
- **loc:** Asia (or the location dropdown) — filters for all faculty in Asia.

### How can I submit a correction or missing professor?

Use the [Submit an entry page](./submit.html). Please include an official university profile and evidence of Vietnamese identity when available.

### What are the broad fields?

Computer & Information Sciences; Engineering; Mathematics; Statistics & Data Science; Physics & Astronomy; Chemistry; Biological & Biomedical Sciences; Earth & Environmental Sciences; Agricultural & Natural Resource Sciences; Health Sciences; Business & Economics; Social & Behavioral Sciences; Education; Humanities; Law & Public Affairs; Arts & Design; and Others.

Others includes qualifying faculty whose primary departments do not fit one of the sixteen named disciplinary categories. The taxonomy never limits who is eligible for the directory.

The ten STEM fields were rostered first; the other six were added to the field filter on 2026-08-19. All sixteen fields completed a full audit-and-search pass on 2026-08-19, including Agricultural & Natural Resource Sciences, which received its first entries during that pass.

The directory's categories are an editorial grouping, informed by the National Science Foundation's National Center for Science and Engineering Statistics (NCSES) [science and engineering field taxonomy](https://ncses.nsf.gov/pubs/nsb202332/introduction) and its more detailed [doctoral field taxonomy](https://ncses.nsf.gov/pubs/ncses23200/table/4). They are not presented as an official NSF classification.

Economics departments are listed under Business & Economics.


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

### Faculty discovery coverage

The roster is a curated JSON dataset, not a continuously running web crawler. To reduce discovery
blind spots, every university/field pass should use all of these candidate sources:

- official department, school, college, and university-wide faculty directories;
- linked person pages, including opaque directory URLs such as `/profile/tn294` or `/profile/phan`;
- official university news, research-center, lab, and grant pages that identify current faculty;
- faculty personal homepages, Google Sites, lab pages, and CVs, followed by confirmation of the
  current university appointment on an official page;
- search-engine queries combining the institution, department, and name patterns `Nguyen`, `Tran`,
  `Le`, `Pham`, `Vo`, `Vu`, `Bui`, `Do`, `Phan`, `Lai`, and common Vietnamese given names;
- former-affiliation and recent-move checks, since a person may retain an old personal homepage or
  appear in a previous institution's directory after moving.

Directory crawls must not depend on URL shape, visible Vietnamese diacritics, or a faculty page
being linked from the department homepage. For each candidate, deduplicate by identity rather than
URL, then verify the current appointment, primary department, rank/track, and university before
adding the record. A research mention, dissertation supervision link, coauthorship, student page,
or grant page is a lead—not proof of a current faculty appointment.

The repository includes [`scripts/faculty-discovery-queries.mjs`](./scripts/faculty-discovery-queries.mjs)
to generate repeatable institution/field query sets for manual or external search tooling:

```bash
node scripts/faculty-discovery-queries.mjs --university "New Jersey Institute of Technology" --field "Data Science" --domain njit.edu
```

This produces queries for official directories, opaque profile pages, personal homepages, current
faculty announcements, and recent moves. It does not automatically add records; every result still
requires the inclusion and identity checks above.

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
  "websiteUrl": "https://…",
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
should be a current, working academic profile or official university faculty page. When a
maintained personal academic homepage or lab homepage is available, store it separately in
`websiteUrl`; the UI uses it as the primary name link and keeps `profileUrl` as the official
identity/appointment evidence. Store Google Scholar separately in `scholarUrl`; never use it as
`profileUrl`.

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
