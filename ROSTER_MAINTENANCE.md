# Roster maintenance guide

This document is for maintainers and automated agents. It contains the detailed research and data-entry rules that are intentionally kept out of the public project overview.

## Inclusion standard

Include a person only when reliable evidence, preferably an official institutional page, supports all of the following:

- A current appointment at a university or an eligible public/nonprofit scholarly research
  institute anywhere outside Vietnam, except for Emeritus and Deceased entries. An
  incoming appointment also qualifies — one an official or otherwise reliable source (typically
  the person's own site, since the hiring institution often has no page live yet) confirms has
  been offered and accepted, with a start date, even if that date is still in the future — but not
  a mere on-the-market candidacy, an application, or an interview.
- A primary academic appointment and one of the accepted tracks below. University leaders qualify
  only through a substantial underlying academic appointment; an administrative title alone is not
  sufficient.

An official current institutional profile makes an entry **confirmed** and remains the preferred
standard. When that profile is unavailable but reliable, identity-resolved evidence supports an
otherwise eligible current appointment, include the person with `"confirmed": false`. The site
labels those records **Unconfirmed** and calls the linked page a verification source. Do not use
this status to bypass the appointment, identity, institution-type, or track requirements, and
replace it with confirmed status when an official profile becomes available.

Use Vietnamese names and other relevant discovery signals to find roster candidates. Do not require
separate documentary evidence of Vietnamese or Vietnamese-diaspora identity once the candidate is
otherwise eligible.

Accepted tracks:

- `Tenure-line`: tenure-track or tenured.
- `Teaching`: full-time, continuing/permanent non-tenure-track teaching faculty, including stable Professor of Practice and equivalent appointments. Confirm permanence from the university's language, such as “full-time,” “continuing appointment,” “non-tenure-track faculty,” or a named teaching promotion ladder. Do not infer it from the title alone.
- `Research`: a stable, faculty-level or faculty-equivalent research appointment. This includes
  university Research Assistant/Associate/Full Professors, permanent Research Scientists and
  Principal Scientists when equivalence is documented, and any full-time, permanent, doctorate-holding
  researcher — principal investigator, group leader, director, or rank-and-file staff scientist alike —
  at eligible public or independent nonprofit scholarly research institutes. Seniority, independent PI
  status, or a leadership title is not required once the doctorate and the permanent, career (non-trainee)
  nature of the appointment are established. Do not include postdoctoral, visiting, grant-limited, or
  otherwise temporary research roles.
- `Clinical`: a stable, full-time, continuing clinical-faculty appointment, such as Clinical
  Professor or a documented clinical-faculty ladder. Do not include adjunct or temporary clinical
  teaching.
- `Admin and Staff`: senior academic leaders at an eligible university — presidents, chancellors,
  provosts, deans, and associate deans — who hold no published faculty rank on another track, plus
  university librarians and archivists with documented faculty status or a senior, permanent
  academic appointment. Use `rank` `Administrator` for leaders and `Librarian` for librarians. A leader who also holds a
  published professorship belongs on that faculty track instead. Ordinary professional staff roles
  (for example HR, IT, advising, program coordination, communications, or center management) do
  not qualify.
- `Emeritus`: a formally conferred emeritus/emerita title following a tenure-line career. Prefer an active emeritus listing or a source documenting the conferral.
- `Deceased`: deceased or historical scholars who held an eligible tenure-line, permanent teaching/research, or emeritus faculty appointment at a university or eligible public/nonprofit research institute outside Vietnam during their career.

Eligible non-university employers are limited to public research bodies (for example, CNRS, INRIA,
national academies, Max Planck institutes, Japan's RIKEN, Australia's CSIRO, U.S. Department of
Energy national laboratories, NIH intramural institutes, NIST, NASA research centers, NOAA research
laboratories, USGS research centers, the U.S. Naval Research Laboratory, Air Force Research Laboratory, and
Army Research Laboratory/DEVCOM ARL) and independent nonprofit scholarly research institutes
(for example, the Allen
Institute, Broad Institute, and HHMI Janelia). University-managed or university-affiliated U.S.
research centers such as MIT Lincoln Laboratory (an FFRDC) and Johns Hopkins Applied Physics
Laboratory (a UARC) may also be included when the individual appointment is permanent and
faculty-equivalent. The appointment must be permanent: any full-time, career (non-trainee, non-term-limited)
research appointment held by someone with a doctorate qualifies, regardless of seniority, rank, or
whether the role carries independent PI/leadership status — a rank-and-file Staff Scientist or Research
Scientist is eligible on the same footing as a Principal Investigator or group leader. Titles
need not say `Professor`; for example, RIKEN Research Scientists/Unit Leaders and CSIRO Research
Scientists/Research Group Leaders may qualify at any rank once the appointment is ongoing.
Corporate research labs,
including Microsoft Research, are excluded even when the work is scholarly. Government agencies,
hospitals without a qualifying university appointment, think tanks, advocacy organizations, and
other non-academic employers remain excluded.

For U.S. federal laboratories, treat the laboratory itself as an eligible public research institute,
not every person employed there as an academic. Include any full-time, permanent, doctorate-holding
Researcher/Scientist, Principal Investigator, or laboratory/group/branch/division leader — seniority
titles (Staff, Senior, Distinguished, Principal) are not required, only that the appointment is
permanent/career rather than a trainee or term-limited role. Laboratory Fellow titles qualify only when
the source shows a continuing career research appointment; postdoctoral, visiting, or fixed-term
fellowships do not. Ordinary engineers, engineering staff, and technical specialists without a doctorate
are excluded by default, particularly roles requiring only a bachelor's degree. A Research Engineer
qualifies once the source shows a doctorate and a permanent, career research appointment (independent
PI/leadership status such as Principal/Distinguished Research Engineer is no longer required, only
evidence of doctoral-level research work). Also exclude contractor-only personnel, postdocs, students,
interns, visiting researchers, temporary project staff, technical or administrative staff, and
funding-agency program officers whose role is not to conduct research. The Office of Naval Research
(ONR), for example, is primarily a funding and program-management agency; its program officers are not
roster entries unless they separately hold a qualifying research appointment.

Exclude adjunct, visiting, postdoctoral, affiliate/courtesy, graduate teaching-assistant,
industry-only, and other term-limited or part-time appointments. Plain `Instructor` requires
case-by-case verification and should not be included from the title alone.

### Evaluating Research, Clinical, and Practice titles

Titles alone do not establish eligibility. For a proposed `Research` or `Clinical` entry, prefer an
official institutional source that identifies the person and their current appointment. If none is
available, use multiple reliable identity-resolved sources and set `"confirmed": false`, then
establish that the role is faculty-level or faculty-equivalent and stable through one or more of the
following: a departmental faculty directory, an institutional profile, an established promotion
ladder, explicit continuing/permanent/full-time language, or an enduring appointment page.

A research-track assistant professor (`Research Assistant Professor`) needs particular care. Include it only when the institution treats it as a genuine research-faculty rank or there is comparably strong evidence of a career-type appointment; do not treat a senior postdoctoral role as faculty merely because it uses that title. Similarly, only include a Senior or Principal Research Scientist when reliable evidence establishes a faculty-equivalent, permanent university or eligible research-institute appointment; mark the record unconfirmed if no official current profile is available.

Professor of Practice, Associate Professor of Practice, Assistant Professor of Practice, and equivalent institution-specific practice titles belong in `Teaching`, not a separate track. They still require evidence that the appointment is stable and substantive; exclude visiting and adjunct practice roles. Store the career level in `rank` (a Professor of Practice is `Professor` on the `Teaching` track).

Artist in Residence and Writer in Residence titles also belong in `Teaching`, but only when reliable
evidence establishes a full-time, continuing position. The title by itself usually denotes a temporary
residency and is not enough; mark a record unconfirmed if the evidence is not official.

Leadership titles (chair, dean, director) are not stored in `rank`; record the underlying academic
level, which must be independently eligible. Do not use a presidency,
provostship, deanship, or center directorship to convert an otherwise ineligible administrative or
temporary role into a Tenure-line, Teaching, Research, or Clinical appointment. A current
university president, chancellor, provost, dean, or associate dean with no published faculty rank
goes on the `Admin and Staff` track; center directors and other administrative roles do not.

### Institution type

The `university` field retains the canonical name of the employing institution for compatibility.
For a university, omit `institutionType` (legacy records therefore mean `University`). For every
eligible non-university employer, set `institutionType` to `Public research institute` or
`Independent nonprofit research institute`. These labels are displayed publicly and must not be
used for corporate laboratories. Non-university entries must use the `Research` track.

## Research workflow

There are no generated prose fields: research overviews ("About") and work lists were removed in
2026-09 because generated text was the roster's main source of invented or mismatched content. An
entry's research is described only by `researchAreas` (short keywords from the person's own pages),
and the linked official profile carries the full bio.

Work on one institution or broad field at a time. Audit existing entries before adding candidates. For every candidate, verify identity, current appointment, primary department or research unit, rank/track, institution type, and profile URL individually. Deduplicate by person rather than URL and check for former affiliations or recent moves (see "One person, one ID").

Use all relevant candidate sources:

- official department, school, college, university, and research-institute directories;
- linked person pages, including opaque directory URLs such as `/profile/tn294`;
- official institutional news, research-center, lab, grant, and award pages;
- personal academic homepages, Google Sites, lab pages, CVs, Google Scholar, and reputable conference profiles; mark the entry unconfirmed if these are the best available current-appointment evidence; and
- broad search-engine queries using the institution, field, Vietnamese surnames (`Nguyen`, `Tran`, `Le`, `Pham`, `Vo`, `Vu`, `Bui`, `Do`, `Phan`, `Lai`, `Huynh`, `Duong`, `Truong`, `Dang`, `Ngo`, `Mai`, `Dao`), and common Vietnamese given names.

Do not depend on URL shape, visible diacritics, or a faculty page being linked from a department homepage. A research mention, dissertation-supervision link, coauthorship, student page, or grant page is a lead—not proof of a current faculty appointment.

### Alumni-network discovery

Faculty and research-group alumni pages are a bounded discovery route worth testing. One initial
WiiLAB sweep produced two additions: an alumnus with an announced tenure-track placement and a
missing professor named in its collaborator list. This is a source-specific result, not evidence of
a general yield. Start from an existing roster member whose maintained lab site has `Alumni`,
`Former Members`, `Students`, `People`, or placement-news pages. Scan the named people and any
explicit faculty-placement announcements, then take at most one outward step to verify a promising
placement on the hiring institution's official profile or news page. Check `public/data.json`,
including published-name variants and initials, before doing detailed research.

Treat a lab's listed “current job” or former affiliation as a lead only: it can be stale. A placement
announcement can establish an accepted incoming appointment when it names the institution, rank or
track, and start date; confirm the current appointment independently once the destination publishes
a profile. Record the lab page and the hiring institution's evidence together, since this combination
both resolves identity and confirms eligibility.

Also scan a lab's named academic collaborators. A collaborator list can expose missing professors
at universities or eligible public/nonprofit research institutes, especially when the person appears
under a shortened publishing name. Deduplicate each named collaborator against the roster first,
then verify the current official appointment, institution type, and track. A `Dr.` title,
coauthorship, or old affiliation is insufficient; research-scientist titles require the same
permanence and faculty-equivalence evidence as every other Research-track candidate.

For every alumni-network sweep, retain a resumable source record in
`maintenance/network-discovery.json`: seed member, scan date, source URLs, candidate and aliases,
reported institution, status (`included`, `already-listed`, `excluded`, or `unresolved`), evidence,
and next action. Record student, postdoctoral, corporate, Vietnam-based, and other ineligible
outcomes with their reason. An unsuccessful identity or appointment search remains `unresolved`.

### Emeritus-focused discovery

Emeritus coverage is often much thinner than active-faculty coverage because universities place
retired scholars in separate directories or preserve them only in faculty catalogs. Run a dedicated
emeritus pass after the active-faculty pass, starting with large universities and their central
provost, registrar, library, and department emeriti pages. Search both Vietnamese-name signals and
the local-language appointment terms; do not search only the English word “emeritus.” Useful forms
include:

- English: `Professor Emeritus`, `Professor Emerita`, `Associate Professor Emeritus`, `Faculty
  Emeriti`, `Emeritus Faculty`, and `Research Professor Emeritus`;
- French: `professeur émérite`, `professeure émérite`, `enseignant-chercheur émérite`, and
  `directeur de recherche émérite`;
- Spanish/Portuguese/Italian: `profesor(a) emérito(a)`, `professor(a) emérito(a)`, and
  `professore emerito`;
- German/Dutch/Nordic usage: `Professor emeritus`, `Professor im Ruhestand`, `emeritierter
  Professor`, `emeritus hoogleraar`, and the corresponding national-language variants; and
- Korean/Japanese/Chinese pages: English “emeritus” alongside local faculty-directory terms such
  as Korean `명예교수` / `전임교수`, Japanese `名誉教授`, and Chinese `荣休教授` / `名誉教授`.

Use queries combining the institution, a Vietnamese surname or given-name token, and one or more
of these terms (for example, `site:mcgill.ca Nguyen "Professor Emeritus"` or
`site:univ-amu.fr Nguyen "professeur émérite"`). Check the current institutional directory or
official emeritus list first, then use an official appointment/conferral notice, CV, or reputable
academy profile to fill in the former rank, department, degrees, and research areas. A personal
homepage, obituary, conference program, or research mention is a lead only. Exclude plain “retired,”
“former professor,” visiting/honorary titles without a formal emeritus conferral, and in-memoriam
pages; a deceased scholar is not a current emeritus roster entry. Deduplicate by person and
institution because emeriti commonly appear in both a central list and a department page.

When a page gives a surname-first Vietnamese name (for example, `Nguyen Cac`), normalize the
public `name` to the repository’s first/middle/last display order (`Cac Nguyen`) and preserve the
authoritative Vietnamese form in `vietnameseName` when available. Run the name-order validator and
check for an existing record before adding a new emeritus entry.

### Postdoctoral and temporary-role guardrail

Personal sites frequently describe joint university/institute postdocs as “research fellows” or
show them prominently beside permanent faculty. These remain out of scope: a postdoctoral fellow,
research fellow, visiting scholar, grant-funded fellow, or other trainee/term appointment does not
become eligible merely because the host is a major university or an eligible nonprofit institute.
For example, a joint postdoctoral appointment at Harvard and a research institute is still excluded
unless a separate, current permanent faculty-equivalent appointment is documented.

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

### Using a Vietnamese-name lexicon safely

A combined vocabulary of Vietnamese family-name and given/middle-name tokens is useful for finding
and prioritizing leads in long faculty directories or author lists. Normalize diacritics and case for
matching, and allow for both Vietnamese (family-name-first) and Westernized (family-name-last) order.
Keep the family-name and given/middle-name vocabularies separate so a token's position and its
combination with other tokens can inform the match instead of treating every vocabulary hit alike.

Some Vietnamese family names are also names or common tokens in other cultures. In particular, do
not prioritize a surname-only match for ambiguous tokens such as `Le`, `Ho`, `Do`, or `Dang` as a
likely Vietnamese lead unless the name also contains a recognized Vietnamese given/middle-name token
or another relevant discovery signal. This is a noise-reduction rule for triage, not a conclusion
about the person. The examples are not exhaustive: review false positives and add other ambiguous
tokens as the searches reveal them.

When a name detector or vocabulary is changed, test it against author or faculty-name samples from
several relevant non-Vietnamese populations, including Chinese, Korean, Indian, Thai, and Japanese
samples, and manually inspect the matches. Record the sample, method, and results before making a
quantitative accuracy claim; a small or convenient control set does not establish general accuracy.

Name matching is deliberately high-precision discovery assistance, not an exhaustive classifier.
It will miss Vietnamese-diaspora people who publish under names without a recognized Vietnamese
token, as well as unfamiliar, changed, shortened, or initialed names. Continue using the non-name
sources above, and never exclude an otherwise supported candidate because the lexicon does not match.
Conversely, a lexicon match is only a lead and does not replace the appointment and source-quality
checks required for roster inclusion.

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

Information explicitly asserted by the repository owner or by a submission the owner asks to
process is a direct update: apply every field it asserts, normalized or mapped to the right roster
field. Only `name`, `vietnameseName`, `honors`, `portrait`, and `portraitSource` can be protected
afterwards (`npm test` rejects anything else in `directFields`): list the ones the submission
asserts in the entry's sorted `directFields` array. Automated work never changes or removes a
protected value, or deletes an entry with protected fields; a conflict with live evidence goes in
an Issue for the owner. Appointment facts, degrees, and links are not protected: the current
official page wins, so a later verified change updates them and says what the submitted value was
(see `AGENTS.md` "Direct updates"). `directFields` is provenance metadata and does not by itself
advance `lastUpdatedAt`.

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
- explicitly documented education in the stored fields (undergraduate, master's, PhD, MD, and
  completed-postdoc institutions; undergraduate and PhD years); and
- honors and awards that meet the eligibility standard below, with supporting sources.

If the person already has an entry, compare the collected evidence with every relevant stored
field and apply all current, sufficiently supported corrections and additions. If the person is
absent, independently verify the full inclusion standard and add them with all supported roster
details when eligible. Do not add an ineligible person or unsupported portrait, credential,
graduation detail, award, or other fact merely because it appears at the supplied URL. If the URL
is not about a person or the user explicitly requests only a summary or another narrower action,
follow that context instead.


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

### The hieuphay.com economist lead queue

`https://hieuphay.com/ban-do-kinh-te-viet-nam/` ("Bản đồ nghiên cứu kinh tế Việt Nam") is an
interactive map of ~100,000 economics and social-science papers by Vietnamese-named authors,
built from OpenAlex. It has no API: the page embeds a gzip+base64 blob directly in a `<script>`
tag, decompressed client-side into a ~20MB JSON payload and rendered onto a `<canvas>`. That
payload's `units.researchers.table` already tags each of its ~21,000 researchers with a `loc`
code (0 = in Vietnam, 1 = diaspora abroad, 2 = foreign/Vietnam-linked, 3 = unknown) and an `econ`
flag, using a name/location classifier the site's own methodology note says was validated against
Chinese, Korean, Indian, Thai, and Japanese name samples — the same practice recommended above for
a Vietnamese-name lexicon. That makes it a large, mostly-free source of `loc==1 & econ==1` leads,
instead of a manual surname/given-name web-search sweep.

Run `./scripts/extract-hieuphay-leads.ts` to (re-)fetch the page, decode that payload, filter to
diaspora-abroad economics researchers whose listed institution looks like a university, and
dedupe against `public/data.json` (by order-independent name-token match, so "Khuong Vu" catches
an existing "Minh Khuong Vu" and vice versa). It writes/updates `maintenance/hieuphay-leads.json`
— a flat list of `{ name, inst, country, npapers, cited, status, note, rosterId }` records, sorted
by citation count as a rough verification priority. Re-running it is safe and idempotent: it
carries forward the `status`/`note`/`rosterId` of every lead already recorded by name+institution,
and only ever changes a `pending` lead's status to the heuristic `duplicate` (never overrides a
human-set `included`/`excluded`/`duplicate`).

**This is a lead queue, not a to-add list.** Every entry needs the same independent verification as
any other candidate — current university appointment, track, rank, and an official or otherwise
reliable source — before being added. The first round of 27 leads processed this way (see git
history around 2026-09-01) turned up, alongside 11 genuine additions: two people already correctly
in the roster under a different name-token order (a raw lead's "Khuong Vu" was the roster's
existing "Minh Khuong Vu"); one lead whose "outdated institution" was actually still current and
correct (do not blindly trust an agent's claim that a person "moved" without checking); and three
excludable people (a non-academic career move, a primary employer that is not a university, and no
verifiable faculty appointment at all). Expect a similar mix in every batch — verify, don't assume.

Resuming across sessions (including on a different machine):

1. `git pull`, `npm install`, then optionally `./scripts/extract-hieuphay-leads.ts` to pick up any
   newer dataset version (harmless if the dataset hasn't changed — it will just report all-zero
   new leads).
2. Open `maintenance/hieuphay-leads.json` and take the next batch of `status: "pending"` entries,
   highest `cited` first (higher-cited researchers are more likely to have an easily verifiable,
   stable appointment). A batch of 5 candidates per parallel research agent, 3 agents at a time
   (15 people per round), has worked well: enough to make real progress, small enough that each
   agent's findings are easy to read and check when it reports back.
3. For each candidate, verify the full inclusion standard (see "Inclusion standard" above): a
   current university faculty appointment, in an accepted track, on an official or otherwise
   reliable source. Watch specifically for: the listed institution being stale (people move); the
   role being non-academic, visiting, adjunct, or postdoctoral; the same person appearing under
   multiple leads (split OpenAlex profiles, or a name common enough to collide with an unrelated
   person); and the person already being in the roster under a name-token order, spelling, or
   former institution this queue's dedup missed (run `npm run find-roster-matches` as in "One
   person, one ID" before adding).
4. For each resolved candidate, update its `maintenance/hieuphay-leads.json` entry: set `status`
   to `included` (with `rosterId`), `excluded` (with a one-line `note` explaining why), or
   `duplicate` (with a `note` pointing at the existing roster entry). Then add every `included`
   candidate to `public/data.json` following the "Data-entry
   rules" and inclusion standard exactly as for any other addition.
5. Run the validation checklist (`npm test`, `npm run build`, `git diff --check`), then commit
   and push. Commit after every batch (roughly every 10-20 resolved candidates) rather than
   accumulating one giant diff — this is what makes the queue resumable if a session ends
   mid-batch: the last pushed commit plus `maintenance/hieuphay-leads.json`'s recorded statuses are
   the entire state a fresh session needs to continue. Push immediately after each commit.

### Lead triage methodology

#### 1. Systematic Triage & Resolution Playbook

Lead-queue entries (currently `maintenance/hieuphay-leads.json`) are **leads only**: the source does not know faculty status, tenure eligibility, or Vietnamese heritage. Maintainers and automated agents process each candidate queue using the following step-by-step verification standard:

1. **Fast-path Deduplication & Entity Matching:**
   - Check the candidate against the existing roster (`public/data.json`) by canonical name, full diacritic `vietnameseName`, and the lead's recorded name variants, using `npm run find-roster-matches` with every identity URL (see "One person, one ID"). A same-name entry at another institution is a probable move, not a namesake.
   - Detect **split leads** (several lead records for the same individual). Map all of them to the single primary canonical roster ID (`matchedId: "vp-####"`).
   - Beware of false-positive duplicate collisions on 2-token names (e.g., "Minh Huynh" at CSIRO vs an unrelated clinical namesake). Always verify institution and research domain before marking as duplicate.

2. **Geographic & Primary Appointment Verification:**
   - Confirm the candidate's primary active appointment is located outside Vietnam.
   - Exclude researchers whose primary, full-time appointment is at a Vietnamese university or institute (e.g., VNU, Hanoi Medical University, Pasteur Institute Ho Chi Minh City, VinUni), even if they hold adjunct, honorary, or visiting positions abroad. Mark `status: "excluded"` with `reason: "Primary academic affiliation is based in Vietnam (...) "`.

3. **Academic Position & Track Eligibility Standard:**
   - Verify that the candidate holds an eligible, continuing faculty appointment at an accredited university or eligible public/nonprofit research institute:
     - `Tenure-line`: Assistant Professor, Associate Professor, Full Professor, Chaired Professor.
     - `Research`: Faculty-equivalent permanent researchers (e.g., CNRS *Directeur/Chargé de Recherche*, INRIA Research Scientist, CSIRO Group Leader / Senior Principal Research Scientist, RIKEN Unit Leader, U.S. National Lab Staff/Senior/Distinguished Scientist, AFRL Principal Engineer).
     - `Clinical`: Continuing, full-time clinical-faculty appointment (e.g., Clinical Assistant/Associate/Full Professor, PU-PH / MCU-PH hospital-university practitioners in France).
     - `Teaching`: Full-time permanent teaching faculty (e.g., Associate Professor of Teaching, Professor of Practice).
     - `Emeritus`: Formally conferred emeritus/emerita faculty.
   - Exclude ineligible roles:
     - Postdoctoral fellows, research assistants, and graduate students.
     - Purely clinical medical staff, hospital residents, and fellows without a qualifying university academic faculty appointment.
     - Corporate/industry scientists and commercial R&D staff (e.g. pharmaceutical or software companies).
     - Funding agency program officers without active research appointments.

4. **Cultural & Disambiguation Checks:**
   - Exclude candidates matching substring/surname filters who are not of Vietnamese heritage:
     - Korean researchers matching prefix/substring "Do" (e.g., *Do-Hyung Kim*, *Do Young Kim*, *Do-Hyun Nam*).
     - Chinese researchers sharing romanized surnames (e.g., *Hai-Qiang Mai*, *Hong-Shiee Lai*, *Hong Dang* from Peking University).
     - Western researchers sharing romanized surname spellings (e.g., *Laurent Le Cam* with Breton surname *Le Cam*).

5. **Metadata Structuring & Roster Enrichment:**
   - **Name order:** Canonical roster name must use Western order `"First (Middle) Last"`. For hyphenated or maiden names, verify against publications and add to `surnameFirstAllowlist` in `scripts/validate-data.ts` if a Vietnamese token is the first name.
   - **Vietnamese name:** Record full diacritic Vietnamese name (`vietnameseName`) in `"Họ Tên"` order when verified from authoritative sources (e.g., Vietnamese media, thesis, university bio).
   - **Academic degrees:** Extract explicit degree credentials (`phdInstitution`, `phdYear`, `mdInstitution`, `msInstitution`, `undergradInstitution`, `undergradYear`, `postdocInstitution`) only when explicitly documented in institutional bios or CVs.
   - **Honors & Awards:** Record major academy memberships, fellow titles (e.g., IEEE Fellow, AIAA Fellow, NAI Fellow, ACM Fellow), national orders (e.g., *Légion d'honneur*), and career awards with proper category, year, organization, and HTTPS source URL.
   - **Field Classification & Overrides:** Ensure the candidate's department maps correctly to `FIELD_RULES`. For specialized research labs, foreign institutes, or clinical divisions that do not match default regex rules (e.g. French UMRs, medical service units), add an explicit entry to `FIELD_OVERRIDES` in `src/data.ts`.

#### 2. State Synchronization & Resumable Commit Protocol

To prevent desynchronization between data files and ensure interrupted runs are cleanly resumable:

1. Update `public/data.json` with new entries.
2. Update the lead file (`maintenance/hieuphay-leads.json`) with updated candidate statuses (`included`, `duplicate`, `excluded`, `unresolved`).
3. Run immutable ID assignment:
   ```bash
   npm run assign-profile-ids -- --apply
   ```
4. Run the validation suite:
   ```bash
   npm test && npm run build && git diff --check
   ```
5. Commit and push each batch immediately after validation:
   ```bash
   git add maintenance/hieuphay-leads.json public/data.json scripts/validate-data.ts src/data.ts
   git commit -m "Resolve <source> leads batch"
   git push origin main
   ```

## One person, one ID

A `vp-####` ID is the person's permanent public address (`people/vp-####.html`). People move,
get promoted, change the name they publish under, retire into emeritus status, or get removed and
later qualify again. None of that is a new person, so none of it gets a new ID.

- **Dedup before anything else.** Before filing, adding, or approving any candidate, run
  `npm run find-roster-matches -- "<name>" --url <profile> --url <website> --url <lab> --url <Scholar> --url <LinkedIn>`
  with every identity URL you have. It matches order-independent name tokens (diacritics and
  initials ignored), every identity URL against every identity field of every entry, and
  `maintenance/retired-ids.json`. The candidate intake playbook (`TASKS/candidate_intake.md`
  step 1) is the full procedure; every other playbook uses it.
- **A hit is the same person until ruled out.** A same-name entry at a different institution is
  the usual sign of a move, not a namesake. Compare former affiliations (the new profile's CV or
  bio, the old entry's institution), PhD institution and year, lab or homepage, Scholar, LinkedIn,
  and research area. Only call it a different person when those actually differ, and say how in
  the Issue.
- **Same person, current entry:** update that entry in place: `university`, `department`, `rank`,
  `track`, `profileUrl`, location, and anything else the move changed. Keep everything still true
  (honors, degrees, Scholar, LinkedIn, portrait if still them). For an owner or Issue submission,
  the supplied fields are applied as usual (only name, Vietnamese name, honors, and portrait go in
  `directFields`). This is an edit, never a `New candidate:`
  Issue.
- **Same person, retired ID** (removed earlier, e.g. as retired before an emeritus title, or
  merged): restore the original ID. Add the entry with that ID and remove it from
  `maintenance/retired-ids.json` (or, if a new ID was already assigned by mistake, run
  `npm run retire-profile-id -- <new-id> --into <original-id> --reason "..." --apply`, which
  renames the entry back and rewrites every ledger reference). Re-verify eligibility first.
- **Two entries for one person:** keep the older (lower) ID. Move the current, verified facts and
  any unique sourced fields onto it; drop fields that only applied to the other institution
  (`institutionType`, an old `profileUrl`, a stale portrait). Protected `directFields` values move
  with the data: the rule protects the value, not the ID it was stored under. Delete the newer
  entry, then run `npm run retire-profile-id -- <newer-id> --into <older-id> --reason "..." --apply`
  (which also rewrites every maintenance-file reference). Never keep the newer ID because it has
  protected fields or looks more complete.
- **Retired IDs are permanent.** `maintenance/retired-ids.json` records every ID ever removed,
  with what replaced it and why. `assign-profile-ids` never hands them out again, the build writes
  a redirect page from each merged ID to the entry that absorbed it, and `npm test` fails if a
  retired ID reappears in the roster without being removed from the ledger.
- **`npm test` blocks the common duplicates:** the same Scholar profile, LinkedIn slug, or homepage
  (in any URL form) on two entries, and matching names at one institution. A pair confirmed to be
  different people goes in `DISTINCT_PEOPLE` in `scripts/validate-data.ts` with how it was
  confirmed. `npm run find-roster-matches -- --roster` lists the remaining likely pairs (for
  example, same name and PhD at different institutions).
- **Never remove an entry silently.** Removing someone (ineligible, deceased without a record, a
  merge) needs its reason in the commit message and a row in `maintenance/retired-ids.json`.
  Stale-branch overwrites of `public/data.json` have dropped entries before (fc655f5, 2026-09-12);
  test on fresh `main` (see `TASKS/AUDIT_ISSUES_PRS.md`) and check that the entry count only
  changes by the entries you meant to add or remove.

## Data-entry rules

`public/data.json` is the canonical roster. Each entry should use the following conventions:

- `id` is a required immutable profile identifier in `vp-####` form. Contributors must not choose
  or edit it manually: after adding an entry, run `npm run assign-profile-ids -- --apply` to assign
  an ID strictly higher than every ID currently in the roster. Tests, development, and builds only
  verify IDs and do not edit the roster. Preserve the generated ID when correcting a name,
  appointment, or other facts. An ID belongs to the person, not the appointment: see "One person,
  one ID" above before adding anyone.
- `track` must be `Tenure-line`, `Teaching`, `Research`, `Clinical`, `Admin and Staff`, `Emeritus`, or `Deceased`.
- `institutionType`, when present, must be `University`, `Public research institute`, or
  `Independent nonprofit research institute`. Omit it for ordinary university records; it is
  required for eligible non-university institutes, which must use the `Research` track.
- `profileUrl` must be a current, working academic or official institutional profile and must not be a Google Scholar URL. Store Scholar separately in `scholarUrl` (must be a canonical citations profile URL `https://scholar.google.com/citations?user=...`, never a search query). Store one maintained personal or lab homepage in `websiteUrl` (there is no separate lab field; prefer the personal page when both exist); store a verified LinkedIn profile in `linkedinUrl` (must be a direct personal profile URL `https://linkedin.com/in/...` or `https://www.linkedin.com/in/...`, never search or company pages). Verify Scholar and LinkedIn matches strictly: confirm name, institution, and publication/field overlap before attaching them — never guess from name alone. Prefer LinkedIn profiles directly linked from the faculty member's institutional bio or homepage.
- `lastUpdatedAt` is not stored in `public/data.json`. It lives in `public/updates.json`, keyed by
  id, and the site merges it in when it loads the roster. Never edit that file by hand: `npm test`
  (via `npm run stamp-updates`) stamps every entry whose content changed since the last commit, and
  new entries, and drops retired ids. It records when
  roster content for the person last changed; `directFields` doesn't count. For a
  roster-wide schema or formatting migration, run `SCHEMA_MIGRATION=1 npm test` so it stamps
  nothing.
- Preserve an existing Scholar URL by moving it to `scholarUrl` before replacing `profileUrl`. Verify replacement URLs follow redirects and do not return 404.
- `rank` is the career level only, one of `Assistant Professor`, `Associate Professor`, `Professor`, `Lecturer`, `Senior Lecturer`, `Researcher`, `Librarian`, or `Administrator` (`npm test` rejects anything else). The track carries the appointment type, and the display combines them ("Assistant Clinical Professor", "Teaching Professor", "Professor Emeritus"). Don't store the published title, a named chair, a department ("of Medicine"), or a leadership role; the linked profile has those, and named chairs go in `honors`. Map by level, not by translating systems: `Clinical Assistant Professor` → `Assistant Professor` (Clinical track); every non-professorial research title (`Research Scientist`, `Staff Scientist`, `Principal`/`Senior Scientist`, `Group Leader`, `Chargé(e)` or `Directeur de recherche`) → `Researcher`, since seniority inside research titles doesn't map consistently across institutions; `Distinguished`/`Full`/`Endowed Professor` → `Professor`. Keep Commonwealth `Lecturer` and `Senior Lecturer` as they are; never equate them with US ranks. A modern UK `Reader` is `Associate Professor`. Leave `rank` empty when the level isn't stated (e.g. a bare emeritus title); never guess.
- Add `phdYear` and `phdInstitution` only when a source explicitly states them. Never infer them from dates, CV chronology, or context. Institution names must not contain degree prefixes (e.g., "Ph.D. in ...").
- Education is deliberately small: `undergradInstitution`/`undergradYear`, `msInstitution`,
  `phdInstitution`/`phdYear`, `mdInstitution`, and `postdocInstitution` for a completed postdoc,
  which is education like a PhD. (A *current* postdoc is an eligibility question: that person isn't
  on the roster.) There are no majors, other degrees, or master's/MD/postdoc years (removed 2026-09-27; `npm test` rejects them). The one chronology rule is at least 2 years
  between `undergradYear` and `phdYear`. Don't force a JD, MBA, or other professional degree into
  these fields; leave it on the linked profile.
- For undergraduate education, use the explicitly stated bachelor’s institution and completion year. A professional degree such as a JD is separate from undergraduate education and must not be substituted for it.
- Use the person's full published academic name only when an official profile or maintained academic homepage supplies it. Expand initials only with direct evidence.
- Store `name` without Vietnamese diacritics and in First (Middle) Last order. This is a display normalization, not a claim about publishing name order.
- **Name updates & surname changes:** When an existing roster member updates their published surname or directory display name (e.g. due to marriage or legal name change to a non-Vietnamese surname), retain the original Vietnamese surname within `name` and `vietnameseName` (e.g. `First [Vietnamese Surname] [New Surname]`, such as *Leanna Nguyen Rubio*). Automated syncs and web scouting must not drop the underlying Vietnamese surname from an existing entry when updating a profile or directory URL.
- Preserve source URLs for profiles, honors, name evidence, and portraits.

### Portrait recovery and scouting standard

The objective is a high-confidence portrait of the correct scholar, not maximum automation
speed or coverage. A missing portrait is preferable to an incorrect one. Automated web scouting
and manual portrait recovery must perform the following identity-resolution workflow for each
person independently; never run a generic image scraper blindly across the roster.

1. **Establish the target identity.** Start with the roster's full name, university or eligible
   research institute, department/field, rank when available, and all stored first-party URLs:
   `profileUrl` and `websiteUrl`. Do not use facial similarity as identity evidence.
   Take particular care with common Vietnamese names.
2. **Inspect stored pages first.** Follow redirects and inspect the person's official profile,
   personal academic homepage, and lab page for `<img>` elements, `og:image`, `twitter:image`,
   JSON-LD `image`, lazy-load attributes, `srcset`, and profile/avatar CSS background images.
   Resolve relative URLs. When a maintained personal homepage needs it, inspect obvious identity
   pages such as `/about`, `/bio`, or `/people`. A suitable portrait need not be an institutional
   headshot: a clearly identified portrait from a maintained personal academic homepage, lab site,
   or Google Site is acceptable.
3. **Use search for discovery, never as image evidence.** If the stored pages do not yield a
   usable portrait, search the exact name with the institution, department/field, and institution
   domain (for example, `"${name}" "${university}"`, `"${name}" "${department}" "${university}"`,
   and `site:institution.example "${name}"`). Inspect the resulting authoritative page, rather
   than downloading an image-result thumbnail. Prefer official faculty, department, university
   news, research-center, hospital/clinical-directory, and institutional research-profile pages.
   Then seek a clearly identified personal academic homepage, followed by other authoritative
   academic sources such as lab sites, conference speaker bios, and professional-society profiles.
   Google Scholar and ORCID are identity clues, not default portrait sources.
4. **Treat blocks as a route change, not a failure.** Do not repeatedly request a bot-blocked
   page. Use it or its search result only to discover alternate official institutional pages, a
   department directory, a personal homepage, or another page that references the same image.
   A block alone is never sufficient reason to accept an unverified search image or to give up.

Before saving an image, require at least two matching identity signals and prefer three: an exact
or near-exact full name; the same university/institute; the same department, research area, or
rank; or a link/URL relationship to an already verified roster homepage. Explicit name evidence
must appear in the image URL or its surrounding page context. An exact-name personal homepage
that is linked by, or otherwise clearly matches, the rostered academic identity can satisfy this
standard even when it does not repeat every institutional field.

Reject logos, seals, buildings, publication figures, generic avatars, default silhouettes,
theme icons/site headers, unrelated people, unverified search-result thumbnails, and group photos
unless the scholar can be reliably isolated. Filter known placeholder patterns such as
`blank_profile`, `default_profile`, `silhouette`, `no_photo`, and `default@mobile3x`. Prefer an
image that visibly contains one person, is reasonably high resolution (roughly 200×200px when
available), originates on an identity-resolved page, and has a stable direct JPEG, PNG, or WebP
URL. Preserve the existing validation floor: use ImageMagick (`identify`) to require at least
120×120px and a portrait aspect ratio (width/height) no greater than 1.55. Convert an approved
headshot to WebP in `public/portraits/` and store the direct original image URL in
`portraitSource`.

Do not replace an existing portrait unless it is missing, broken, generic, demonstrably the wrong
person, or materially worse than an identity-verified alternative. `portrait` and
`portraitSource` are a pair. If either is protected by `directFields`, automated maintenance must
not change or remove either value, even when live evidence conflicts; record the conflict for a
direct correction as required by the direct-update policy.

Assign an internal result confidence:

- **HIGH:** direct image from an unambiguous official faculty/institutional profile or maintained
  personal academic homepage.
- **MEDIUM:** direct image from another authoritative institutional or academic page with strong,
  documented identity resolution.
- **LOW:** identity, page ownership, or image ownership remains uncertain.

Automatically commit only HIGH-confidence portraits. MEDIUM-confidence portraits require recorded
identity evidence and a deliberate review; never commit LOW-confidence portraits. For every
attempt, retain a maintenance provenance record keyed by immutable `vp-####` ID with the name,
direct image URL when found, page URL, source type (such as `official_faculty`,
`personal_homepage`, or `university_news`), confidence, matching identity signals, retrieval date,
and outcome. Record unsuccessful completed searches as `not_found` in that maintenance ledger.
Do not add ad-hoc `portrait_status` fields to `public/data.json`: its canonical schema instead
requires `portrait` and `portraitSource` together.

Before a broad retrieval run or a substantial retriever rewrite, test a reproducible sample of at
least 10 known-good portraits, 10 missing portraits, 10 known-bad/incorrect portraits, several
common-name cases, and several blocked sites. Report each result as correct portrait found,
incorrect portrait, or not found, together with source, confidence, and evidence. Do not deploy
broadly until that sample demonstrates very high precision.

- Profile URLs are generated from `id`, so a canonical-name correction does not change the public
  profile URL. Removing an entry also removes its generated profile page.
- Store the university's full canonical name in `public/data.json`; shortening is display-only.
  Card displays abbreviate a terminal ` University` (`George Mason University` →
  `George Mason Univ.`) but preserve leading forms such as `University of New Mexico`.
  Established names needing a more specific form belong in the exact
  `UNIVERSITY_DISPLAY_NAMES` aliases in `src/data.ts` (`Pennsylvania State University` →
  `Penn State`). Apply the same display rule to education institutions. Never shorten the
  canonical roster value or generically remove `College`, `Institute`, or other name components.

### Honors and awards eligibility

The `honors` field is curated for substantial distinctions, not every item listed on a CV or
personal homepage. An honor should normally fit one of these patterns:

- election to a recognized national academy or equivalent learned academy (`academy`);
- election to Fellow or honorary-member status by a major disciplinary society (`fellow`);
- a nationally or internationally competitive career, early-career, or research fellowship or
  award, such as NSF CAREER, Sloan Research Fellowship, Simons Investigator, PECASE, or a
  comparable national-agency or foundation program (`career_award`);
- a major field-wide medal, prize, book award, lifetime/impact or test-of-time award, or another
  distinction with clear disciplinary standing (`major_award`);
- an eponymous scientific discovery, foundational algorithm/theorem/concept bearing the scholar's name
  (e.g., Phong shading, Brieskorn-Pham singularities, Lê cycles/numbers), or seminal landmark publication
  that fundamentally shaped a discipline (`major_award`, linking to the authoritative DOI or disciplinary record);
- a formal retrospective honor, dedicated historical tribute, or memorial symposium organized by a premier
  international professional society or academy (`major_award`); or
- a named endowed chair, distinguished professorship, university professorship, or comparable
  research chair that represents a significant appointment distinction (`distinguished_professorship`).

Clarivate Highly Cited Researchers listings qualify as `major_award` (owner decision, Issue #243);
the source must be Clarivate or an official institutional announcement that names the person and year.

Do not add routine conference best-paper or distinguished-paper awards, paper awards with only
runner-up or candidate status, institution-local student, departmental, university
service/teaching, or community-engagement awards, generic grants, invited talks, or ambiguous
honors whose standing cannot be established. This also excludes NSF's seed/exploratory programs for
researchers without prior NSF funding, such as the CISE Research Initiation Initiative (CRII) award
or comparable "research initiation" grants — these are not competitive career awards on the level of
NSF CAREER, PECASE, or a Sloan Research Fellowship and do not qualify on their own. The `honors`
field is for faculty-level distinctions only: doctoral dissertation awards, dissertation research
fellowships/grants, and other student- or trainee-stage awards (won while a graduate student or
postdoc, not as faculty) do not qualify regardless of how competitive or prestigious the program is
— exclude these even when nationally competitive. "Distinguished Paper Award," "Best Paper Award," and
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
small filtered rosters. Run `npm test`, `npm run test:e2e`, `npm run build`, and `git diff --check` before submitting
the change.

### Roster growth chart

The "Show me something interesting" view's growth-over-time chart is the one place that
satisfies the Git-history exception above: `scripts/build-stats-history.ts` walks `git log` for
`public/data.json`, keeps the last commit of each UTC day, and writes total roster size per day to
the build-generated (gitignored) `public/stats-history.json`, consumed by `renderGrowthChart` in
`src/main.ts`. It runs as part of `predev`/`prebuild`/`pretest`, so it always reflects whatever git
history is actually present in the current checkout — a shallow clone (a sandboxed agent checkout,
or CI without `fetch-depth: 0`) yields a short or single-point series rather than a failure. The
deploy workflow (`.github/workflows/deploy.yml`) uses `fetch-depth: 0` specifically so the
production build gets full history. Do not commit `public/stats-history.json` itself, and do not
extend it to chart per-country/per-field history without also reconciling that with the
no-historical-trend rule above.

## Fields

The canonical field list is:

1. Agricultural & Natural Resource Sciences
2. Arts & Design
3. Biological & Biomedical Sciences
4. Business & Economics
5. Chemistry
6. Computer & Information Sciences
7. Earth & Environmental Sciences
8. Education
9. Engineering
10. Health Sciences
11. Humanities
12. Law & Public Affairs
13. Mathematics
14. Physics & Astronomy
15. Social & Behavioral Sciences
16. Statistics & Data Science
17. Others

The list is kept alphabetical in `src/data.ts`'s `FIELDS` constant (and everywhere it's
displayed — main-page filters, the submission form's field dropdown), with `Others` always last.

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

On a schedule this runs in rotation inside the `links` routine (`TASKS/AUTOMATION.md`): each run
takes the next entries in id order and, while it has each person's official profile open, applies
the checks below and fixes what changed in its PR. A manually requested full pass follows the same
steps in id order, in small batches (about 20-40 people), committing and pushing each validated
batch before moving on.

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

   Also recheck the stored portrait: open the image (Read tool) next to the official page and
   confirm it is a single-person headshot of this person, not a banner, ad, logo, group photo, or
   someone else's picture (a `portraitSource` filename like `taxe26-v2-copie` is a warning sign;
   `npx tsx scripts/find-all-nonhuman-portraits.ts` lists candidates). If it fails and `portrait`
   is not in `directFields`, replace it from the official page (`TASKS/fetch_portraits.md`
   section 4 rules) or, when none exists, remove `portrait`/`portraitSource` and the file and mark
   the entry unresolved in the portrait ledger and queue so the `portraits` routine refills it. If it is protected,
   file a `Likely wrong portrait: <name> (<vp-id>)` Issue instead.
5. **Watch for new candidates while you're there.** Coauthors, lab members who became faculty, or
   other Vietnamese-diaspora names surfaced incidentally during this research are leads, not
   confirmed additions. If you find a plausibly eligible new person, verify them independently
   against the full inclusion standard and, if they qualify, file a GitHub Issue with as much
   sourced detail as you can gather (rank, track, degrees, honors, portrait), following
   `TASKS/candidate_intake.md` steps 1–4. Do not add the entry yourself — new roster IDs always go
   through an Issue (see `AGENTS.md`). Don't let a promising lead stall progress on the current
   batch.
## Education-field consistency sweep

This is a separate, cheaper technique from the periodic full-roster refresh above. It targets
records already in `public/data.json` whose education fields are structurally incomplete, using
each person's already-stored `profileUrl` instead of a new discovery search. Because the source is
already known and was already accepted once, this sweep does not redo the liveness, URL-role, or
Scholar-identity checks from the periodic refresh; it only asks whether the previously reviewed
page in fact states the missing fact.

Two gap patterns are easy to find with a plain scan of the roster file, with very different yield:

- **A degree year without its paired institution** (`phdYear` present but `phdInstitution` absent,
  and likewise for `undergradYear`/`undergradInstitution`). This is
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
never infer a year from chronology, and don't force a professional degree (JD, DMD, PharmD, MBA,
etc.) into `phdInstitution` or `msInstitution`. Only the education fields in "Data-entry rules"
exist; the validator rejects anything else.
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
person's web presence disappearing entirely. A direct web search for `"${name}" "${university}"` (or
department) frequently turns up a live, more specific page — a department-level profile, a lab site, a
Google Scholar/ORCID page, or a research-database entry — even when the previously stored URL now
404s and a fetch of the institution's own top-level directory comes back empty or JS-rendered. Try that
before concluding the link is unfixable; several "dead" links across `#29`'s sweep turned out to just
need the person's name searched fresh rather than re-fetching the same stale URL.

## Validation checklist

Before committing a roster change, run:

```bash
npm test
npm run build
git diff --check
```

Keep edits incremental, avoid changing unrelated fields, and update `src/data.ts` when a new department type requires a shared filter rule.
