# Vietnamese Professors at U.S. Universities

> Find Vietnamese and Vietnamese-American tenure-line STEM professors at U.S. universities.

A searchable directory of Vietnamese professors across STEM fields at U.S. universities —
tenure-line faculty (tenure-track or tenured; not adjunct, teaching-only, or research-track).
Faculty whose tenure home is in one department with a
secondary/joint appointment elsewhere are marked with `†` and carry `secondaryAppointment: true`.

Static site, no backend: the roster lives in `public/data.json` and is loaded, searched, filtered,
and sorted client-side.

Started as a Computer Science-only list and has now completed an initial audit of the ten
canonical STEM fields.

## Roster maintenance handoff

Include a person only when reliable evidence, preferably an official university page, supports
all of the following: Vietnamese or Vietnamese-American identity (never infer it from a name
alone), a current U.S.-university tenure-track or tenured appointment, and a primary appointment
that fits the field being reviewed. Exclude adjunct, visiting, teaching-only, research-track,
professor-of-practice, emeritus/retired, courtesy-only, and non-university appointments. A
relevant PhD program or PhD-advising eligibility is not required.

Work on one broad field at a time. Audit its existing entries before adding candidates; verify
identity, current tenure-line status, primary department, rank, and profile URL individually;
cross-check the full roster for duplicate people and joint appointments; and update the field
rules in `src/data.js` if a new department type needs a shared filter bucket. Search broadly
rather than stopping after the first few candidates, make incremental validated edits, and run
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
11. Misc — narrow, DHS STEM-Designated-Degree-Program fields that don't fit the ten canonical
    buckets above; currently just Economics (quantitative/econometrics — CIP 45.0603), not
    Economics broadly (which NSF classifies as a social science).

All ten canonical fields received an initial pass on 2026-08-18. Subsequent work should be a
targeted re-audit or expansion of **one** of these fields at a time: review existing entries first, verify current
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
  "scholarUrl": "https://scholar.google.com/…",
  "university": "…",
  "city": "…",
  "state": "…",
  "researchAreas": ["Area 1", "Area 2"],
  "secondaryAppointment": false,
  "department": "…",
  "rank": "Associate Professor",
  "phdYear": 2018,
  "phdInstitution": "…"
}
```

`scholarUrl`, `rank`, `phdYear`, and `phdInstitution` are optional. Keep each object on one
line. `profileUrl` should be a current, working academic profile: prefer the professor's own
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

`npm test` checks that every entry has the required fields and that names are unique.

## Field-audit history

## Progress by field

| Field | Status | Notes |
|---|---|---|
| Computer Science | Audited (2026-08-18) | Reviewed all 49 existing Computer & Information Sciences entries. No removals: each has current faculty evidence or, where the primary unit is a combined EECS department, a current tenure-line appointment with CS graduate-advising evidence. Reclassified Khoa Luu (Arkansas) to Electrical Engineering and Computer Science and Truong Nghiem (UCF) to Electrical and Computer Engineering; updated Nghiem and Thinh Nguyen (Oregon State) to official faculty profiles, and reclassified Thinh to Electrical Engineering and Computer Science. Broad searches did not surface an additional candidate meeting every inclusion criterion. Not added: Minh Hoai Nguyen (Stony Brook) is currently listed by the CS department as research associate professor/on leave, which is not a verified tenure-line appointment. |
| Mathematics | Policy-update review (2026-08-18) | The earlier audit reviewed all 19 existing entries and retained each. Added Trieu Le (University of Toledo), Dinh-Liem Nguyen (Kansas State), Huy Tai Ha (Tulane), and Ngo Bao Chau (University of Chicago). After the PhD-program rule was removed, added Thai Nhan (Menlo College): his official profile confirms the current Associate Professor appointment and Vietnam-based BSc/MSc education. Van Vu is now at the University of Hong Kong; Minh Hoai Nguyen (Stony Brook) is research-track/on leave rather than verified tenure-line. |
| Electrical and Computer Engineering | Audited (2026-08-18) | Reviewed all 10 ECE/EECS entries in the roster as part of the Engineering pass; retained them after current official-faculty and doctoral-program/advising checks. Replaced Minh N. Do's UIUC and Mai Vu's Tufts Google Scholar links with official faculty profiles. |
| Physics | Policy-update review (2026-08-18) | The earlier audit reviewed the 5 scaffold entries and retained all five. Added Kayla Nguyen (University of Oregon, Physics). After the PhD-program rule was removed, added Phat Vu (Soka University of America), whose official profile confirms a current Associate Professor of Physics appointment. Lan Quynh Nguyen (Notre Dame) is adjunct; Nguyen Trong Hien is a NASA/JPL researcher, not university faculty; Pham Quang Hung (UVA) could not be confirmed in the current official faculty directory. A 2026-08-18 correction renamed the existing "Vinh Nguyen" (Virginia Tech) entry to "Vinh Q. Nguyen" (user-provided middle initial) to disambiguate from a different, unrelated Vinh Nguyen added to Mechanical Engineering (Michigan Tech) the same day. |
| Statistics / Biostatistics / Operations Research | Audited (2026-08-18) | Reviewed the 3 scaffold entries. Corrected Long Nguyen and Quoc Tran-Dinh to use official faculty pages and marked their Statistics/STOR appointments as primary rather than secondary. Added Nhat Ho (UT Austin, Statistics and Data Sciences). Kept Kim-Anh Do (MD Anderson, Biostatistics). Added previously held candidates Tru Cao (UTHealth Houston Biostatistics and Data Science) and Phong Nguyen (UVA School of Data Science) after user-confirmed manual review. Nhu Nguyen (URI) remains excluded because his primary appointment is Mathematics. |
| Chemistry | Audited (2026-08-18) | Re-audited all 7 existing entries and retained each. Current official faculty evidence confirms the listed Chemistry appointments for Dong (UCI), Thuc-Quyen Nguyen (UCSB), SonBinh Nguyen (Northwestern), Hien Nguyen (Wayne State), Hung Nguyen (Buffalo), and Tuan Trinh (Utah State); Vo-Dinh remains correctly marked secondary because his primary Duke appointment is Biomedical Engineering. No data corrections or additional defensible Chemistry entries in this pass. Earlier exclusions retained: Thanh N. Truong (emeritus); Hoang (Long) Nguyen and Diep Ca (no verified Scholar profiles); Danith Ly (Cambodian-American); Ka Un Lao (Macau heritage); Nga Lee "Sally" Ng (Hong Kong heritage and Chemical/Biomolecular Engineering); Tran Nguyen (UC Davis Environmental Toxicology, defer to Earth/Environmental); Hung Phan (visiting); Hung V. Pham (adjunct/instructor); Khanh Ha (graduate student); My Hang V. Huynh (Los Alamos, not university faculty). |
| Biology / Life Sciences | Audited (2026-08-18) | Reviewed the 6 scaffold entries. Corrected Tuan Minh Tran from Kansas State Plant Pathology to his current tenure-track Assistant Professor position in Biology at the University of South Alabama. Removed Trang Thi Huyen Nguyen: the cited scholar identity's public research affiliations are South Korea/Oregon State, not Arkansas State, and no current Arkansas State faculty appointment could be found. Retained Lena H. Nguyen (UT Dallas, explicitly tenure-track and mentoring Neuroscience PhD students), Tracy S. Tran (Rutgers–Newark Biology graduate faculty and dissertation advisor), Thuy Ngo (OHSU Molecular and Medical Genetics primary faculty), and Huy Q. Dinh (UW–Madison Oncology Assistant Professor). No new entries added. Earlier exclusions retained: Vu Q. Nguyen, Ally/Alexandra Nguyen, and An Phu Tran Nguyen (no verified Scholar profile); Trang Nguyen (visiting); Louis T. Dang (clinical); John T. Ngo (primary BME); Trung V. Phan (Physics); Nicole Vo (acting/non-TT); Tuan M. Tran (clinical Medicine); Khanh-Van Ho (research-track); Xuong Nguyen-Huu (emeritus/deceased); Tran Dang Khanh (visiting scientist). |
| Chemical Engineering | Audited (2026-08-18) | Reviewed the 4 current entries added in the prior Chemical Engineering pass and retained them: Trung Van Nguyen (Kansas), Ngoc Bui (Oklahoma), Jonathan T. Pham (Cincinnati), and Thi Vo (Johns Hopkins). Earlier exclusions retained: Binh Vu (research-track), Hang Lu (Vietnamese heritage unconfirmed), Hung V.-T. Nguyen (better fit for Bioengineering), Duong D. Do (Australia), Thomas Dinh Tran (teaching-track), Kim-Vy Nguyen-Ngoc (Pediatrics), Mi (Kelly) Hoang Tran (business), Annalee Nguyen (research-track), and Nam-Trung Nguyen (Australia). |
| Mechanical Engineering | Partial pass (2026-08-18) | Added 6 (see below), plus a 2026-08-18 follow-up pass adding Thanh Duc Nguyen (UConn), The Nguyen (CSU Fresno, Dept Chair), Jacqueline Huynh (UC Irvine, Mechanical and Aerospace Engineering), Trinh Pham (Cal State LA), Thao (Vicky) Nguyen (Johns Hopkins), and Vinh Nguyen (Michigan Tech, Mechanical and Aerospace Engineering — disambiguated from the unrelated Vinh Q. Nguyen already in the roster under Physics at Virginia Tech) after user-confirmed Vietnamese identity for each. Remaining `PENDING_REVIEW.md` candidates are blocked on tenure-track/status questions, not identity. |
| Civil Engineering | Audited (2026-08-18) | Added Khiem T. Tran (University of Florida) and Thang N. Dao (University of Alabama). Both have official civil-engineering faculty appointments, documented Vietnam-based undergraduate education, and direct evidence of doctoral student supervision or doctoral dissertation participation. |
| Materials Science / Engineering | Partial pass (2026-08-18) | Added Vicky Doan-Nguyen (Ohio State) and Thang Pham (Virginia Tech) as part of the combined Mechanical Engineering pass above; a few more candidates in `PENDING_REVIEW.md`. |
| Bioengineering / Biomedical Engineering | Partial pass (2026-08-18) | Added Kytai Nguyen (UT Arlington). Candidates already surfaced during other passes: Tuan Vo-Dinh (Duke, secondary appt, already in roster under Chemistry), John T. Ngo (Boston University). A 2026-08-18 follow-up pass added Tran N. H. Nguyen (UT Southwestern, Biomedical Engineering) and Hung V.-T. Nguyen (Dartmouth, Thayer School of Engineering) after user-confirmed Vietnamese identity. Remaining `PENDING_REVIEW.md` candidates are blocked on other open questions, not identity. |
| Earth / Environmental Science | Policy-update review (2026-08-18) | No pre-existing entries in the original pass. Added Tran B. Nguyen (UC Davis Environmental Toxicology). After the PhD-program rule was removed, added Thi Hong Diep Dao (University of Colorado Colorado Springs): her official profile confirms the current Associate Professor appointment and prior research roles at Vietnamese institutions. Added Chanh Kieu (Indiana University Bloomington, Earth and Atmospheric Sciences) in the 2026-08-18 second pass. |
| Astronomy / Astrophysics | Audited, thin (2026-08-18) | Searched broadly; the one clear Vietnamese-American candidate (Trinh Xuan Thuan, UVA) is Professor Emeritus and excluded. No new entries — this field appears to have very few current tenure-line matches. |
| Aerospace Engineering | Partial pass (2026-08-18) | Added Hoang-Vu Phan (UNR) and Quan Nguyen (USC) as part of the combined Mechanical Engineering / Bioengineering passes (both independently surfaced by two separate research passes). A 2026-08-18 follow-up pass added Huy T. Tran (UIUC) after user-confirmed Vietnamese identity. A few more candidates in `PENDING_REVIEW.md`. |
| Industrial / Systems Engineering | Partial pass (2026-08-18) | Added Hoang Pham (Rutgers) and Christine Nguyen (Northern Illinois University). Also surfaced a likely-stale existing roster entry — see `PENDING_REVIEW.md` "Correction needed" section for Tin Nguyen (listed as Auburn CS; search results suggest he's since moved to Wayne State ISE/Oncology). A few more candidates in `PENDING_REVIEW.md`. |
| Environmental Engineering | Partial pass (2026-08-18) | Added Helen Nguyen (UIUC, Civil and Environmental Engineering). Checked for overlap with the existing Earth/Environmental Science and Civil Engineering rows — no duplicates found. A couple more candidates in `PENDING_REVIEW.md`. |
| Nuclear Engineering | Partial pass (2026-08-18) | Added Nam T. Dinh (NC State). This field turned up very few candidates despite broad searching — may be a genuinely small population rather than a search gap. |
| Agricultural & Food Science | Audited (2026-08-18) | No pre-existing entries and no additions made after searches across plant science, plant pathology, agronomy, food science, and natural resources. Tuan Minh Tran remains classified under Biological & Biomedical Sciences because his primary appointment is Biology, rather than an agricultural academic unit. |
| Geology / Oceanography / Atmospheric Science | Partial pass (2026-08-18) | Added Chanh Kieu (see Earth/Environmental Science row above — same person/entry). One more candidate (Trang Nguyen, Bowdoin, currently "Visiting") in `PENDING_REVIEW.md`. |
| Data Science / Information Science | Audited, none found (2026-08-18) | Overlaps heavily with CS — checked for duplicates against the existing CS list. No candidate met the field-fit bar (primary appointment specifically in a Data Science/Information/iSchool unit, not general CS); this is a genuinely thin field for Vietnamese faculty currently in the roster's search reach. |
| Pharmaceutical Sciences | Partial pass (2026-08-18) | A 2026-08-18 follow-up pass added Juliane Nguyen (UNC Chapel Hill, Professor & Vice Chair, Pharmacoengineering and Molecular Pharmaceutics) after user-confirmed Vietnamese identity; her tenure-line status was already clear. `FIELD_RULES` in `src/data.js` now buckets pharma departments under Health Sciences (checked ahead of the generic Engineering match, since "Pharmacoengineering" contains "engineering"). 2 candidates remain in `PENDING_REVIEW.md` (small school with an unconfirmed tenure system). |
| Public Health / Epidemiology | Partial pass (2026-08-18) | STEM-adjacent by most classifications (e.g. NSF). No confirmed additions — 4 candidates in `PENDING_REVIEW.md`, mostly blocked on appointment-series or affiliate-vs-primary questions. |
| Medicine (MD/PhD research faculty) | Audited (2026-08-18) | Added James Huynh (University of Michigan, Health Management and Policy): official faculty and doctoral-program pages confirm Assistant Professor/faculty status and inclusion among the PhD program's sociology-and-organizational-studies faculty; his profile explicitly identifies him as Vietnamese American and tenure-track. Excluded primarily clinical faculty and emeritus candidates. |
| Psychology (cognitive/quantitative) | Not started, disputed | Included in some STEM classifications (e.g. NSF), excluded from others. Flagging rather than deciding unilaterally — ask before starting this one. A 2026-08-18 pass surfaced 3 candidates anyway (in `PENDING_REVIEW.md`) rather than skip the search, but none were added and the field-inclusion question is still open. |
| Economics (quantitative/econometrics) | Started 2026-08-18, scoped to `Misc` field | Resolved by user decision: broad Economics is a social science, not STEM, but "Econometrics and Quantitative Economics" is on the DHS STEM-Designated Degree Program list (CIP 45.0603) — narrow enough to include without pulling in Economics generally. Added a `Misc` bucket to `STEM_FIELDS`/`FIELD_RULES` in `src/data.js` for this and any future narrow DHS-STEM-only fields. Added Quang Vuong (NYU, Professor of Economics — creator of the "Vuong test") after user-confirmed Vietnamese identity. Thuy Lan Nguyen (Santa Clara/SF Fed) remains in `PENDING_REVIEW.md`: current SCU status/rank and international-macro subfield fit are unresolved, not identity. |

This list is still not exhaustive — there is no single canonical definition of "all STEM fields";
different classifications (NSF, the DHS STEM-Designated Degree Program list, individual
universities' own department structures) draw the boundary differently, especially for
math-heavy social sciences. Treat this table as a living checklist, not a finished taxonomy: add a
row whenever a plausible field is identified, rather than assuming coverage is complete once every
current row is "Done".

**Coverage caveat, even for "Done" fields**: every pass so far is a best-effort web search
(surname patterns + faculty-directory scans), not an authoritative census. It will systematically
miss people with a thin web presence, at smaller/non-R1 schools, or whose name doesn't read as
obviously Vietnamese. A field marked "Done" means one solid search pass was completed, not that
the roster is exhaustive for that field.

## Known issue: WebFetch fully blocked during the 2026-08-18 second pass

All five parallel research agents run on 2026-08-18 for the "partial pass" rows above hit a
sandbox network policy that blocked `WebFetch` (direct page loads) for essentially every domain —
university `.edu` sites, Google Scholar, ResearchGate, Wikipedia, even RateMyProfessors all
returned `EGRESS_BLOCKED`. Every finding from that pass rests on `WebSearch` result snippets
rather than a directly-verified official page, and several agents also exhausted their
`WebSearch` call budget before finishing every planned university. See `PENDING_REVIEW.md` for
the resulting list of candidates that need a human (or a future session with working page-fetch
access) to do the final five-minute verification. Treat "Partial pass" rows above as a strong
first cut, not an exhaustive audit — re-run them with working `WebFetch` before marking "Audited."

## Known issue: background research agent can silently no-op

The first Chemistry attempt was delegated to a forked background agent that reported
"completed" with a plausible-sounding summary, but its actual tool-use count was 0 and it ran for
~6 seconds — i.e. it did no real search or verification work and the diff it claimed to make
never happened. **Don't trust a completion report at face value** — after any research agent
reports done, check `git diff public/data.json` (or `git status`) yourself to confirm entries
were actually added before updating this table or telling the user it's done.

## Public submissions

[`submit.html`](./submit.html) lets anyone propose a new entry or a correction without touching
git directly — similar to [csrankings.org/submit](https://csrankings.org/submit).
It only accepts **tenure-line** faculty (tenure-track or tenured — not adjunct, visiting,
teaching-only, research-track, or emeritus) and requires a faculty or scholarly profile link
before it will submit. The default path opens a pre-filled email to `root@roars.dev`; contributors
who prefer GitHub can instead open a pre-filled issue in `dynaroars/vietprofs`. No backend or
credentials are handled by the site. Maintainers review email and GitHub submissions before
folding accepted entries into `public/data.json`.
