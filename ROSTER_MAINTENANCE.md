# Roster maintenance guide

This document is for maintainers and automated agents. It contains the detailed research and data-entry rules that are intentionally kept out of the public project overview.

## Inclusion standard

Include a person only when reliable evidence, preferably an official university page, supports all of the following:

- A current university appointment anywhere outside Vietnam, except for Emeritus entries.
- A primary academic appointment and one of the accepted tracks below.

Use Vietnamese names and other relevant discovery signals to find roster candidates. Do not require
separate documentary evidence of Vietnamese or Vietnamese-diaspora identity once the candidate is
otherwise eligible.

Accepted tracks:

- `Tenure-line`: tenure-track or tenured.
- `Teaching`: full-time, continuing/permanent non-tenure-track teaching faculty, including stable Professor of Practice and equivalent appointments. Confirm permanence from the university's language, such as “full-time,” “continuing appointment,” “non-tenure-track faculty,” or a named teaching promotion ladder. Do not infer it from the title alone.
- `Research`: a stable, faculty-level research appointment, such as Research Professor or a research-faculty promotion ladder. Do not include postdoctoral, visiting, grant-limited, or otherwise temporary research roles.
- `Clinical`: a stable clinical-faculty appointment, such as Clinical Professor or a documented clinical-faculty ladder. Do not include adjunct or temporary clinical teaching.
- `Emeritus`: a formally conferred emeritus/emerita title following a tenure-line career. Prefer an active emeritus listing or a source documenting the conferral. Plain retirement, resignation, former-faculty status, and in-memoriam listings do not qualify.

Exclude adjunct, visiting, postdoctoral, affiliate/courtesy, graduate teaching-assistant, non-university, industry-only, and other term-limited or part-time appointments. Plain `Instructor` requires case-by-case verification and should not be included from the title alone.

### Evaluating Research, Clinical, and Practice titles

Titles alone do not establish eligibility. For a proposed `Research` or `Clinical` entry, find an official university source that identifies the person and their current appointment, then establish that the role is faculty-level and stable through one or more of the following: a departmental faculty directory, an institutional faculty profile, an established promotion ladder, explicit continuing/permanent/full-time language, or an enduring university appointment page.

`Research Assistant Professor` needs particular care. Include it only when the institution treats it as a genuine research-faculty rank or there is comparably strong evidence of a career-type appointment; do not treat a senior postdoctoral role as faculty merely because it uses that title. Similarly, only include a Senior or Principal Research Scientist when the official evidence establishes a faculty-equivalent or long-term university academic appointment.

Professor of Practice, Associate Professor of Practice, Assistant Professor of Practice, and equivalent institution-specific practice titles belong in `Teaching`, not a separate track. They still require evidence that the appointment is stable and substantive; exclude visiting and adjunct practice roles. Keep the published practice title in `rank`.

## Research workflow

Work on one university or broad field at a time. Audit existing entries before adding candidates. For every candidate, verify identity, current appointment, primary department, rank/track, and profile URL individually. Deduplicate by person rather than URL and check for former affiliations or recent moves.

Use all relevant candidate sources:

- official department, school, college, and university faculty directories;
- linked person pages, including opaque directory URLs such as `/profile/tn294`;
- official university news, research-center, lab, grant, and award pages;
- personal academic homepages, Google Sites, lab pages, and CVs, followed by confirmation of the current appointment on an official page; and
- broad search-engine queries using the institution, field, Vietnamese surnames (`Nguyen`, `Tran`, `Le`, `Pham`, `Vo`, `Vu`, `Bui`, `Do`, `Phan`, `Lai`, `Huynh`, `Duong`, `Truong`, `Dang`, `Ngo`, `Mai`, `Dao`), and common Vietnamese given names.

Do not depend on URL shape, visible diacritics, or a faculty page being linked from a department homepage. A research mention, dissertation-supervision link, coauthorship, student page, or grant page is a lead—not proof of a current faculty appointment.

Generate repeatable search queries with:

```bash
./scripts/faculty-discovery-queries.ts \
  --university "New Jersey Institute of Technology" \
  --field "Data Science" \
  --domain njit.edu
```

The surname list above was extended (from an original ten) after a plain token-frequency scan of
`public/data.json` itself surfaced `Huynh`, `Duong`, `Truong`, `Dang`, `Ngo`, `Mai`, and `Dao` as
common Vietnamese surnames the original list happened to miss — worth checking periodically as the
roster grows, since a name common enough to be worth adding will show up as a frequent token in the
existing data before anyone thinks to add it by hand.

Pass `--given-names` to also generate queries for common given/middle-name tokens (`Thanh`, `Quang`,
`Minh`, `Hoang`, `Anh`, `Tuan`, `Van`, `Hung`, `Quan`, `Quoc`, `Ngoc`, `Viet`, `Phuong`, `Huy`, `Kim`,
`Nam`, `Long`, `Linh`, `Toan`, `Hieu`, `Chinh`, `Thai`, `Hai`, `Dinh`, `Quynh`), each with `-Vietnam
-student -postdoctoral` appended. A given-name token matches far more broadly than a surname — it hits
anyone with that token anywhere in their name, not just as a family name — so it needs both the
institution restriction the generator already applies and those extra exclusions to stay usable;
without them, an unrestricted given-name search returns mostly noise (Vietnam-based faculty out of
scope, students, and postdocs). It also needs a first pass against `public/data.json` before adding
any candidate: a given-name token search is far more likely than a surname search to resurface someone
already in the roster under a different profile page or research summary, since the token alone does
very little to narrow down which person it is.

**Try given-name search before, or alongside, surname search once a surname sweep has already run
against a field or institution.** Once the standard per-surname queries have been run against a field
a few times, they start mostly re-finding people already in the roster — surname search saturates
faster than given-name search does, because there are only ~17 surnames but dozens of given-name
tokens, and a field-wide surname sweep doesn't imply a given-name sweep has happened too. Lead with
given-name queries on a field that has already had a surname pass and is still small on the current
snapshot; fall back to surname search for a field that hasn't been swept at all yet.

Results across three informal sessions have been mixed enough to report honestly rather than round up.
The first session, tried against a handful of otherwise-unremarkable US, Japanese, and Australian
universities, found six new verified faculty from a small number of queries — three from a surname
missing from the original list, three from a given-name token — a comparable hit rate to the standard
per-surname queries. A control run against a country slice already thoroughly searched this way found
nothing new, which helps rule out those six hits being a fluke of an unsearched region rather than
evidence the technique itself works. The second session, testing `Quan`, `Quoc`, `Ngoc`, `Toan`,
`Hieu`, `Chinh`, and `Liem` unrestricted (no institution filter), found zero new people: `Toan`,
`Hieu`, and `Chinh` returned only generic academic-rank definition pages with no usable lead, and the
`Quan` and `Ngoc` hits that did surface were both already in the roster under a different profile
URL — a good outcome for data quality (each contributed a previously-missing fact to its existing
record instead of becoming a duplicate) but not a new addition. `Liem` is deliberately left out of the
generator's default list: it is also a common Chinese-Indonesian surname, and the one hit it returned
in an unrestricted search was a plausible-looking but non-Vietnamese name.

The third session tested `Quynh` (combined with `Thang` in one query) unrestricted, aimed at fields
that had already had several rounds of surname search and gone stale (Agricultural Sciences, Law,
Chemistry) — every surname hit in those specific fields was by then already in the roster. The query
found three new, independently verified people in one pass, but not in the targeted fields: an
international-studies professor, a pharmacology professor, and a UK marketing lecturer — a reminder
that a broad given-name query returns whatever it returns regardless of the field terms in the query,
so its yield should be credited to the token, not to the field it was aimed at. `Quynh` is now in the
generator's default given-name list on the strength of that hit rate. `Thang` surfaced no isolable new
lead of its own that session, and a repeat of `Liem` unrestricted again found nothing — both consistent
with prior results, so neither is added.

A fourth session then targeted `Quynh`, `Thanh`, `Minh`, `Hoang`, `Anh`, `Van`, `Tuan`, `Hung`, `Nam`,
`Long`, `Kim`, `Thai`, `Hai`, `Dinh`, and `Viet` specifically at Earth & Environmental Sciences and
Agricultural & Natural Resource Sciences — the two smallest fields in the roster and, per the third
session's lesson, fields a given-name query had not actually been tried against yet. This produced no
new candidates across a dozen-plus queries and several direct faculty-directory fetches at large
programs (Cornell CALS, Michigan State CANR, Oregon State climate science, Scripps Oceanography). This
does not mean the technique failed generally — the third session's hits landed in Social & Behavioral
Sciences, Health Sciences, and Business, not in these two fields — but it is a genuine null result
specifically for Earth & Environmental Sciences and Agricultural & Natural Resource Sciences, worth
recording so a future session does not re-run the same unproductive queries. Those two fields may
simply have fewer Vietnamese-diaspora faculty in the US, or need a different discovery channel
(professional-society membership directories, conference programs) rather than more general web
search.

Overall the given-name mode's yield varies a lot by token *and* by which field it happens to land in
— `Quynh` and the first session's three unnamed tokens were strong (in fields other than the ones they
were aimed at), `Quan`/`Toan`/`Hieu`/`Chinh`/`Thang`/`Liem` were not, and no token tested so far has
found anything in Earth & Environmental Sciences or Agricultural & Natural Resource Sciences — so
treat a specific untested token's yield, and a specific field's yield, as unproven until they have
found a genuinely new person, not just a not-yet-fully-documented one.

Every result still requires the appointment, track, and source-quality checks above.

### Reviewing user-supplied links

Unless the user gives narrower instructions, treat a supplied personal profile, university
profile, homepage, lab site, or CV as a request to identify the person, check whether they already
exist in the canonical roster, and perform a thorough roster-relevant review. Follow useful links
from the supplied page and find an official university source when needed; the supplied URL is a
source or lead, not by itself proof of eligibility or every fact it contains.

First, resolve the person's identity and search `public/data.json` for them, including name
variants, before changing anything. Then review all applicable roster fields rather than stopping
after the first correction:

- current university, primary department, rank, track, and a working official `profileUrl`;
- a maintained personal or lab `websiteUrl` and Google Scholar `scholarUrl`, keeping each URL in
  its designated field;
- a suitable current portrait and its source;
- explicitly documented education, including degree institutions, graduation years, majors,
  professional degrees, and completed postdoctoral institution (plus end/completion year when
  explicitly documented); and
- honors and awards that meet the eligibility standard below, with supporting sources.

If the person already has an entry, compare the collected evidence with every relevant stored
field and apply all current, sufficiently supported corrections and additions. If the person is
absent, independently verify the full inclusion standard and add them with all supported roster
details when eligible. Do not add an ineligible person or unsupported portrait, credential,
graduation detail, award, or other fact merely because it appears at the supplied URL. If the URL
is not about a person or the user explicitly requests only a summary or another narrower action,
follow that context instead.

Update `lastUpdatedAt` whenever this review changes substantive roster data. Advance the
verification ledger only if the work also completes the full live review required by the
verification-ledger and periodic-refresh rules; a supplied link or partial correction alone is not
enough.

### Reviewing user-supplied names

When a user supplies a person's name without a link, search the web and relevant official
university sources for that person and for roster-relevant details. Use the research workflow
above to resolve the person and locate current appointment evidence.

Search the canonical roster for the person before making a change. For an existing entry, use
reliable sources to identify eligible corrections or additions, such as a current appointment,
profile URL, education, honors, or a portrait. For a person not already in the
roster, independently verify every part of the inclusion standard before adding them. Apply the
same data-entry, honors, and field-mapping rules as when reviewing a user-supplied
link.

## Data-entry rules

`public/data.json` is the canonical roster. Each entry should use the following conventions:

- `id` is a required immutable profile identifier in `vp-####` form. Contributors must not choose
  or edit it manually: after adding an entry, run `npm run assign-profile-ids -- --apply` to assign
  IDs while reserving retired ones. Tests, development, and builds only verify IDs and do not edit
  the roster. Preserve the generated ID when correcting a name,
  appointment, or other facts; never reuse a removed ID.
- `track` must be `Tenure-line`, `Teaching`, `Research`, `Clinical`, or `Emeritus`.
- `profileUrl` must be a current, working academic or official university profile and must not be a Google Scholar URL. Store Scholar separately in `scholarUrl`; store a maintained personal or lab homepage in `websiteUrl`.
- `lastUpdatedAt` is required and must be a canonical UTC ISO timestamp in
  `YYYY-MM-DDTHH:mm:ss.sssZ` form. It records when roster content for
  the person last materially changed, whether by adding the person or changing a profile,
  appointment, degree, honor, portrait, source, or another stored fact. A verification that finds
  no data change must not advance it.
- Preserve an existing Scholar URL by moving it to `scholarUrl` before replacing `profileUrl`. Verify replacement URLs follow redirects and do not return 404.
- Use only `Assistant Professor`, `Associate Professor`, or `Professor` as the rank vocabulary for Tenure-line entries; use `Teaching` and `Emeritus` for those corresponding tracks. For Research and Clinical entries, preserve the institution's published appointment title in `rank`. Preserve a Professor of Practice title in `rank` for Teaching entries when that is the institution's published title.
- Add `phdYear` and `phdInstitution` only when a source explicitly states them. Never infer them from dates, CV chronology, or context.
- Record completed postdoctoral training when a source explicitly identifies the institution. Add
  `postdocYear` only when the source also explicitly states an end or completion year; never infer
  it from CV chronology or context. Past postdoctoral training is an education credential; a
  current postdoctoral appointment remains ineligible for the roster.
- Education research is not limited to PhD, MS, and undergraduate degrees. Record explicitly documented professional or equivalent degrees such as MD, JD, DDS, PharmD, EdD, DO, and other credentials when the data model has an appropriate field. Do not force an MD/JD or another degree into the PhD/MS/undergraduate fields; if no suitable field exists yet, preserve the source for a later schema update and mention it in the change notes.
- For undergraduate education, use the explicitly stated bachelor’s institution and completion year. A professional degree such as a JD is separate from undergraduate education and must not be substituted for it.
- Use the person's full published academic name only when an official profile or maintained academic homepage supplies it. Expand initials only with direct evidence.
- Store `name` without Vietnamese diacritics and in First (Middle) Last order. This is a display normalization, not a claim about publishing name order.
- Preserve source URLs for profiles, honors, name evidence, and portraits.
- Profile URLs are generated from `id`, so a canonical-name correction does not change the public
  profile URL. For a removal, add the retired ID to `maintenance/profile-redirects.json` with
  `reason: "removed"` and `redirectTo: null`. For a merge, remove the duplicate and record its
  retired ID with `reason: "merged"` and the surviving entry's ID as `redirectTo`. The build
  emits a noindex retirement page or a redirect page, respectively.
- Store the university's full canonical name in `public/data.json`; shortening is display-only.
  Card displays abbreviate a terminal ` University` (`George Mason University` →
  `George Mason Univ.`) but preserve leading forms such as `University of New Mexico`.
  Established names needing a more specific form belong in the exact
  `UNIVERSITY_DISPLAY_NAMES` aliases in `src/data.ts` (`Pennsylvania State University` →
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

Do not add routine conference best-paper or distinguished-paper awards, paper awards with only
runner-up or candidate status, institution-local student, departmental, university
service/teaching, or community-engagement awards, generic grants, invited talks, or ambiguous
honors whose standing cannot be established. "Distinguished Paper Award," "Best Paper Award," and
similarly named per-year paper-selection recognitions are routine even at a top-tier venue and do
not qualify on their own, regardless of a comparable award already present in the roster; do not
treat an existing roster entry as precedent for adding another one. A conference paper recognition
may be included only when the source explicitly frames it as a durable, retrospective distinction
made well after publication—a most-influential-paper, impact, highest-impact, or test-of-time
award. An award created and administered by one university is presumed local and ineligible unless
reliable evidence shows that it has independent field-wide standing; a large-sounding title or cash
prize is not enough. The award source must identify the recipient, the distinction, and preferably
the year; do not infer prestige from the title alone.

When two people share a name, use a fuller official form if available (for example, a middle name, initial, or nickname). Only if their names are genuinely identical should the university be appended: `Full Name - University`.

## Interesting-facts guidelines

The “Show me something interesting” view presents observations calculated at runtime from the
canonical `public/data.json`. It is a descriptive view of the maintained roster, not a survey or
estimate of all Vietnamese and Vietnamese-diaspora faculty.

Use an observation only when it is:

- directly reproducible from stored fields, such as university, city, state, country, department,
  canonical field, rank, or track;
- supported by multiple records and stated with exact counts or percentages when that makes the
  pattern easier to check;
- sufficiently large to survive ordinary roster changes; small filtered groups should omit
  comparative observations rather than manufacture a pattern; and
- relevant to understanding the roster’s academic or geographic distribution.

Good examples include a concentration at one institution, a multi-department institutional
cluster, a same-institution same-field cluster, a city or country grouping, broad-field balance,
or a documented difference in track distribution between two adequately sized groups. A pattern
that is interesting but not conclusive may be included as a qualified signal using language such
as “the current roster suggests” or “is consistent with”; retain the counts and comparison that
make the signal checkable.

Do not present a qualified signal as proof, and do not infer institutional prestige, selectivity,
research quality, population size, ethnicity, causal explanations, migration paths, or career
history from a university, location, field, surname, rank, or award name. Current-roster counts
must not be described as growth, an emerging region, or a historical trend unless a versioned
historical dataset or Git-history analysis explicitly supports that claim. External rankings and
demographic statistics are not inputs to the runtime facts view. If an observation depends on
external evidence, document and source it separately instead of presenting it as a
canonical-roster fact.

When changing the observation logic, add tests for the underlying calculation and for empty or
small filtered rosters. Run `npm test`, `npm run build`, and `git diff --check` before submitting
the change.

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
`department|university` entry in `FIELD_OVERRIDES` in `src/data.ts` rather than broadening a
regex.


## Periodic full-roster refresh

This is a separate, recurring task from the "Research workflow" above. That section covers
finding and vetting *new* candidates. This section covers re-verifying *every existing* entry in
`public/data.json`, since profiles go dead, people move institutions, ranks change, and new
honors accrue over time. Run this when the user asks for a periodic roster refresh.

For unattended local maintenance, use `./scripts/maintain-roster.ts run`. The controller applies
the workflow below one person at a time. An independent Codex approval of the research can be
enabled with `--codex-review`; when enabled, it is required before applying the researcher's
proposal. The research agent defaults to Claude and can be changed to Codex with
`--agent codex`. The controller keeps resumable state outside the repository, and commits and pushes
after the entire selected batch. `./scripts/maintain-roster.ts stop` safely pauses it; running `run` again
resumes the saved person and stage. Incomplete or disputed entries must remain unverified so a
later run retries them. When Codex rejects a correctable proposal, the controller gives Claude up
to two revisions containing the proposal and the reviewer's exact reasons, and independently
reviews each revision. It never applies only the convenient subset of a rejected proposal.

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
2. **Check both URL roles independently.** For every person, compare the stored `profileUrl` and
   `websiteUrl` against the live pages and determine which page is the official university/
   department profile and which is the maintained personal or lab homepage. Correct swapped values
   even when both URLs work. A university directory, faculty bio, department profile, or official
   institutional person page belongs in `profileUrl`; a personal domain, Google Site, lab page, or
   maintained academic homepage belongs in `websiteUrl`. If only one usable page exists, put it in
   the appropriate field and leave the other field absent. Never retain a personal page in
   `profileUrl` merely because it is the only currently stored URL, and never put a university
   directory page in `websiteUrl`.
3. **Find and verify Google Scholar.** Search for the person's Google Scholar profile even when
   `scholarUrl` is currently missing. Confirm it belongs to the same person using affiliation,
   research area, publications, linked homepage, or other corroborating details; do not select a
   profile from the name alone. Add or update a verified profile in `scholarUrl`, never in
   `profileUrl`. Preserve the existing value if no better verified Scholar profile is found.
4. **Visit the site(s) and update information thoroughly.** Read the official profile and any
   personal/lab site fully, not just the first field that looks off. Update whatever has changed
   since last verified: rank/track, `phdInstitution`/`phdYear` (only when explicitly stated, never
   inferred), other documented degrees, and honors/awards. Apply the same
   Honors and awards eligibility rules as elsewhere — do not import a full CV award list, only
   distinctions that meet the documented bar.
5. **Watch for new candidates while you're there.** Coauthors, lab members who became faculty, or
   other Vietnamese-diaspora names surfaced incidentally during this research are leads, not
   confirmed additions. If you find a plausibly eligible new person, verify them independently
   against the full inclusion standard and, if they qualify, add them with as much sourced detail
   as you can gather (rank, track, degrees, honors, portrait) using the same
   data-entry rules as any other addition. Don't let a promising lead stall progress on the
   current batch — note it and come back if needed.
6. **Record successful verification.** After all applicable checks above are complete and no
   material question remains unresolved, set the person's timestamp in
   `maintenance/verification.json` to the current UTC time. Do this even if the review found no
   other change, so future refreshes can reliably choose the oldest entries. If the review changed
   any substantive roster data, set `lastUpdatedAt` to the same time; otherwise preserve the
   existing `lastUpdatedAt`. If the review is incomplete, preserve the old timestamps and retry
   later.

## Education-field consistency sweep

This is a separate, cheaper technique from the periodic full-roster refresh above. It targets
records already in `public/data.json` whose education fields are structurally incomplete, using
each person's already-stored `profileUrl` instead of a new discovery search. Because the source is
already known and was already accepted once, this sweep does not redo the liveness, URL-role, or
Scholar-identity checks from the periodic refresh; it only asks whether the previously reviewed
page in fact states the missing fact.

Two gap patterns are easy to find with a plain scan of the roster file, with very different yield:

- **A degree year without its paired institution** (`phdYear` present but `phdInstitution` absent,
  and likewise for `msYear`/`msInstitution` and `undergradYear`/`undergradInstitution`). This is
  close to always resolvable: whatever page supplied the year almost always names the institution
  next to it, so the original entry was very likely an incomplete transcription rather than a gap
  in the source.
- **A record with no education field populated at all.** This resolves at a much lower rate.
  Directory-style listings for adjunct, lecturer, and teaching-track staff frequently omit degree
  history entirely — refetching the same terse page a second time will not produce new information.
  Structured CV-style pages at academic medical centers (MD Anderson, OHSU, and similar) are
  disproportionately productive by contrast, since they routinely publish a dedicated education
  section with medical school, residency, and fellowship institutions and years.

Apply the same data-entry rules as any other correction: add only what the page explicitly states,
never infer a year from chronology, and route a professional degree without a dedicated field (JD,
DMD, DO, PharmD, MFA, MBA, etc.) through `otherDegrees` rather than forcing it into `phdInstitution`
or `msInstitution`. Update `lastUpdatedAt` for any record that gains a fact. Do not advance
`lastVerifiedAt` in the ledger for this sweep alone — it does not perform the full live review the
periodic refresh requires, so advancing the ledger would let that record skip a real refresh later.
When a scan turns up no education fields and the primary source states none, leave the record
unresolved and say so explicitly (which people, and why) rather than silently treating an empty
page as proof no degree exists.

## Periodic link-health sweep

`npm run check-links` fetches every stored URL (profile, website, Scholar, portrait source, and
honor sources) and reports any that don't resolve. It's network-dependent and slow (2,500+
requests), so it's not part of `npm test` — run it occasionally, or after a batch import, rather
than on every change. A shared/invalid Scholar ID copied across a batch of entries is the failure
mode this caught once already (see git history); `npm test` now blocks a duplicate `scholarUrl`
across two different people as a permanent regression check, but a URL can still go dead on its own
later, which only this sweep catches.

When it reports a broken URL, don't just delete the field — visit the person's other stored URLs
or search for their current page first, since a moved/renamed page is far more common than a
person's web presence disappearing entirely.

## Validation checklist

Before committing a roster change, run:

```bash
npm test
npm run build
git diff --check
```

Keep edits incremental, avoid changing unrelated fields, and update `src/data.ts` when a new department type requires a shared filter rule.
