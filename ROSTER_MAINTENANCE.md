# Roster maintenance guide

This document is for maintainers and automated agents. It contains the detailed research and data-entry rules that are intentionally kept out of the public project overview.

## Inclusion standard

Include a person only when reliable evidence, preferably an official university page, supports all of the following:

- Vietnamese or Vietnamese-diaspora identity. A Vietnamese-sounding name is a lead, not conclusive evidence; review each addition for false positives.
- A current university appointment anywhere outside Vietnam, except for Emeritus entries.
- A primary academic appointment and one of the accepted tracks below.

Accepted tracks:

- `Tenure-line`: tenure-track or tenured.
- `Teaching`: full-time, continuing/permanent non-tenure-track teaching faculty. Confirm permanence from the university's language, such as “full-time,” “continuing appointment,” “non-tenure-track faculty,” or a named teaching promotion ladder. Do not infer it from the title alone.
- `Emeritus`: a formally conferred emeritus/emerita title following a tenure-line career. Prefer an active emeritus listing or a source documenting the conferral. Plain retirement, resignation, former-faculty status, and in-memoriam listings do not qualify.

Exclude adjunct, visiting, postdoctoral, affiliate/courtesy, research-track, graduate teaching-assistant, non-university, and other term-limited or part-time appointments. Plain `Instructor` requires case-by-case verification and should not be included from the title alone.

## Research workflow

Work on one university or broad field at a time. Audit existing entries before adding candidates. For every candidate, verify identity, current appointment, primary department, rank/track, and profile URL individually. Deduplicate by person rather than URL and check for former affiliations or recent moves.

Use all relevant candidate sources:

- official department, school, college, and university faculty directories;
- linked person pages, including opaque directory URLs such as `/profile/tn294`;
- official university news, research-center, lab, grant, and award pages;
- personal academic homepages, Google Sites, lab pages, and CVs, followed by confirmation of the current appointment on an official page; and
- broad search-engine queries using the institution, field, Vietnamese surnames (`Nguyen`, `Tran`, `Le`, `Pham`, `Vo`, `Vu`, `Bui`, `Do`, `Phan`, `Lai`), and common Vietnamese given names.

Do not depend on URL shape, visible diacritics, or a faculty page being linked from a department homepage. A research mention, dissertation-supervision link, coauthorship, student page, or grant page is a lead—not proof of a current faculty appointment.

Generate repeatable search queries with:

```bash
node scripts/faculty-discovery-queries.mjs \
  --university "New Jersey Institute of Technology" \
  --field "Data Science" \
  --domain njit.edu
```

Every result still requires the inclusion and identity checks above.

### Reviewing user-supplied links

When a user supplies a URL or link, inspect the linked content for roster-relevant information,
which may include a person's name, current appointment, portrait, education, graduation details,
or honors and awards. Treat the link as a source or lead, not as automatic authorization to add
the information.

First, search the canonical roster for the person. If they already have an entry, compare the
linked information with the entry and update only information that is current, sufficiently
supported, and permitted by the applicable data-entry and honors rules. If they do not
have an entry, verify their identity and eligibility against the inclusion standard before adding
them. Do not add a person, portrait, degree, graduation detail, award, or other field merely
because it appears at the supplied URL; each addition must independently satisfy the relevant
requirements in this guide.

### Reviewing user-supplied names

When a user supplies a person's name without a link, search the web and relevant official
university sources for that person and for roster-relevant details. Use the research workflow
above to resolve identity and locate evidence; do not treat a name, including a Vietnamese-
sounding name, as sufficient proof of identity or eligibility.

Search the canonical roster for the person before making a change. For an existing entry, use
reliable sources to identify eligible corrections or additions, such as a current appointment,
profile URL, education, honors, or a portrait. For a person not already in the
roster, independently verify every part of the inclusion standard before adding them. Apply the
same data-entry, honors, and field-mapping rules as when reviewing a user-supplied
link.

## Data-entry rules

`public/data.json` is the canonical roster. Each entry should use the following conventions:

- `track` must be `Tenure-line`, `Teaching`, or `Emeritus`.
- `profileUrl` must be a current, working academic or official university profile and must not be a Google Scholar URL. Store Scholar separately in `scholarUrl`; store a maintained personal or lab homepage in `websiteUrl`.
- `lastUpdatedAt` is required and must be a canonical UTC ISO timestamp in
  `YYYY-MM-DDTHH:mm:ss.sssZ` form. It records when roster content for
  the person last materially changed, whether by adding the person or changing a profile,
  appointment, degree, honor, portrait, source, or another stored fact. A verification that finds
  no data change must not advance it.
- Preserve an existing Scholar URL by moving it to `scholarUrl` before replacing `profileUrl`. Verify replacement URLs follow redirects and do not return 404.
- Use only `Assistant Professor`, `Associate Professor`, or `Professor` as the rank vocabulary for Tenure-line entries; use `Teaching` and `Emeritus` for the corresponding tracks.
- Add `phdYear` and `phdInstitution` only when a source explicitly states them. Never infer them from dates, CV chronology, or context.
- Education research is not limited to PhD, MS, and undergraduate degrees. Record explicitly documented professional or equivalent degrees such as MD, JD, DDS, PharmD, EdD, DO, and other credentials when the data model has an appropriate field. Do not force an MD/JD or another degree into the PhD/MS/undergraduate fields; if no suitable field exists yet, preserve the source for a later schema update and mention it in the change notes.
- For undergraduate education, use the explicitly stated bachelor’s institution and completion year. A professional degree such as a JD is separate from undergraduate education and must not be substituted for it.
- Use the person's full published academic name only when an official profile or maintained academic homepage supplies it. Expand initials only with direct evidence.
- Store `name` without Vietnamese diacritics and in First (Middle) Last order. This is a display normalization, not a claim about publishing name order.
- Keep `secondaryAppointment: true` when the listed field is secondary or joint and the primary tenure home is elsewhere.
- Preserve source URLs for profiles, honors, name evidence, and portraits.
- Store the university's full canonical name in `public/data.json`; shortening is display-only.
  Card displays abbreviate a terminal ` University` (`George Mason University` →
  `George Mason Univ.`) but preserve leading forms such as `University of New Mexico`.
  Established names needing a more specific form belong in the exact
  `UNIVERSITY_DISPLAY_NAMES` aliases in `src/data.js` (`Pennsylvania State University` →
  `Penn State`). Apply the same display rule to education institutions. Never shorten the
  canonical roster value or generically remove `College`, `Institute`, or other name components.

### Verification ledger and update timestamps

`lastVerifiedAt` is maintenance state, not public roster content. Store it in the tracked
`maintenance/verification.json` ledger, keyed by the exact canonical `name` in
`public/data.json`; do not add it to a public roster entry. Tracking the ledger in Git lets weekly
automation resume on another machine or fresh clone, while keeping it out of the site build.
The validator requires exactly one ledger entry for every roster name and rejects stale entries.
When adding, renaming, or removing a person, update the public roster and ledger together.

Set a ledger timestamp for a new entry only after independently verifying every part of the
inclusion standard and all required roster fields. For an existing entry, advance it only after a
complete live review covers the person's identity, current and primary university appointment,
department, rank/track, profile URL, and the other information described in the periodic-refresh
workflow. A complete review may advance the timestamp even when no roster facts changed. Ledger
values must use canonical UTC ISO `YYYY-MM-DDTHH:mm:ss.sssZ` form.

Do not advance the ledger timestamp for a link-health check, a partial correction, a single
supplied source, a failed or blocked fetch, or a review that leaves a material eligibility or
appointment question unresolved. Automated maintenance should record those attempts in its
resumable working state and retry them later without changing the durable ledger. The maintenance
controller, not a research model, should generate the timestamp only after all required
verification and validation gates pass. Never backdate a new review, infer a timestamp from page
metadata, or set a future value.

Set `lastUpdatedAt` when adding a new entry and whenever at least one substantive field in an
existing entry changes. For a new entry, `lastUpdatedAt` and the ledger timestamp will normally be
the same. During a refresh that changes facts, set both to the successful review time; during a
complete refresh that confirms the existing facts without changing them, advance only the ledger
timestamp. Do not treat timestamp-only edits, key reordering, formatting, generated-file
changes, or maintenance-state changes as roster updates. The maintenance controller should
compare substantive fields and generate `lastUpdatedAt` after an approved patch rather than
allowing a research model to choose it.

### Honors and awards eligibility

The `honors` field is curated for substantial distinctions, not every item listed on a CV or
personal homepage. An honor should normally fit one of these patterns:

- election to a recognized national academy or equivalent learned academy (`academy`);
- election to Fellow or honorary-member status by a major disciplinary society (`fellow`);
- a nationally or internationally competitive career, early-career, or research fellowship or
  award, such as NSF CAREER, Sloan Research Fellowship, Simons Investigator, PECASE, or a
  comparable national-agency or foundation program (`career_award`);
- a major field-wide medal, prize, book award, lifetime/impact or test-of-time award, or another
  distinction with clear disciplinary standing (`major_award`); or
- a named endowed chair, distinguished professorship, university professorship, or comparable
  research chair that represents a significant appointment distinction (`distinguished_professorship`).

Do not add routine conference best-paper awards, paper awards with only runner-up or candidate
status, ordinary departmental or university service/teaching awards, generic grants, invited
talks, or ambiguous honors whose standing cannot be established. A conference recognition may be
included only when it is clearly a durable, field-level distinction—for example, a most
influential-paper, impact, highest-impact, or test-of-time award already represented in the
roster. The award source must identify the recipient, the distinction, and preferably the year;
do not infer prestige from the title alone.

When two people share a name, use a fuller official form if available (for example, a middle name, initial, or nickname). Only if their names are genuinely identical should the university be appended: `Full Name - University`.

## Fields

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

If a person's department or academic field does not fit any named bucket, do not automatically
map it to `Others`: ask the user whether to add a new field or place it in `Others`. The existing
field list may not be exhaustive. If a department name is structurally ambiguous, use an exact
`department|university` entry in `FIELD_OVERRIDES` in `src/data.js` rather than broadening a
regex.


## Periodic full-roster refresh

This is a separate, recurring task from the "Research workflow" above. That section covers
finding and vetting *new* candidates. This section covers re-verifying *every existing* entry in
`public/data.json`, since profiles go dead, people move institutions, ranks change, and new
honors accrue over time. Run this when the user asks for a periodic roster refresh.

For unattended local maintenance, use `./scripts/maintain-roster.mjs run`. The controller applies
the workflow below one person at a time, requires an independent Codex approval of Claude's
research before applying it, keeps resumable state outside the repository, and commits and pushes
each approved entry. `./scripts/maintain-roster.mjs stop` safely pauses it; running `run` again
resumes the saved person and stage. Incomplete or disputed entries must remain unverified so a
later run retries them.

Because it touches the whole roster, split the work into roughly 20 batches (about 35-40 people
each) and work one batch at a time. For recurring automated maintenance, select entries missing
from `maintenance/verification.json` first and then those with the oldest ledger timestamps; for
a manually initiated full pass, consecutive file order is also acceptable. Track which entries
and stages are done in durable working state so a refresh can resume without redoing successful
work. Commit after each batch (or another reviewably small chunk) rather than as one giant diff,
and run the validation checklist before each commit. Push each commit immediately after making
it, then continue straight on to the next batch without stopping for confirmation in between — treat
commit-and-push-per-batch as pre-authorized for this recurring task. Only pause if you hit a
genuine blocker (for example, a validation failure you can't resolve, or a push that's rejected).

Do this very thoroughly for each person and expect it to take a long time. Do not skip someone
because their existing entry looks fine at a glance — confirm it live. For every person, in
order:

1. **Check for a dead `profileUrl`.** Fetch it and confirm it isn't a 404, a generic "not found"
   page, a parked/default page, or a page that no longer identifies that specific person (site
   redesigns and department reorganizations silently orphan old URLs). If it's dead or clearly
   stale, search for the person's current official profile, at the same institution or a new one.
   If they moved, update `university`, `field`, `rank`, and `track` to match; if they no longer
   meet the inclusion standard (retired without emeritus status, left academia, moved to an
   ineligible track, etc.), remove them and note why in the commit message.
2. **Check for a real personal or lab website.** Independent of the university directory profile,
   look for a currently maintained personal homepage or lab site. If one exists and `websiteUrl`
   is missing or points somewhere stale, add or update it. `profileUrl` must remain the official
   university/department page per the data-entry rules above — do not replace it with a personal
   site unless the university profile no longer exists at all.
3. **Visit the site(s) and update information thoroughly.** Read the official profile and any
   personal/lab site fully, not just the first field that looks off. Update whatever has changed
   since last verified: rank/track, `phdInstitution`/`phdYear` (only when explicitly stated, never
   inferred), other documented degrees, `secondaryAppointment`, and honors/awards. Apply the same
   Honors and awards eligibility rules as elsewhere — do not import a full CV award list, only
   distinctions that meet the documented bar.
4. **Watch for new candidates while you're there.** Coauthors, lab members who became faculty, or
   other Vietnamese-diaspora names surfaced incidentally during this research are leads, not
   confirmed additions. If you find a plausibly eligible new person, verify them independently
   against the full inclusion standard and, if they qualify, add them with as much sourced detail
   as you can gather (rank, track, degrees, honors, portrait) using the same
   data-entry rules as any other addition. Don't let a promising lead stall progress on the
   current batch — note it and come back if needed.
5. **Record successful verification.** After all applicable checks above are complete and no
   material question remains unresolved, set the person's timestamp in
   `maintenance/verification.json` to the current UTC time. Do this even if the review found no
   other change, so future refreshes can reliably choose the oldest entries. If the review changed
   any substantive roster data, set `lastUpdatedAt` to the same time; otherwise preserve the
   existing `lastUpdatedAt`. If the review is incomplete, preserve the old timestamps and retry
   later.

## Validation checklist

Before committing a roster change, run:

```bash
npm test
npm run build
git diff --check
```

Keep edits incremental, avoid changing unrelated fields, and update `src/data.js` when a new department type requires a shared filter rule.
