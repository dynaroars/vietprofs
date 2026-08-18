# Roster expansion: all STEM fields

This site started as a Computer Science-only list, then picked up some Math/Physics/ECE/Stats
entries during the initial scaffold. The goal now is to cover Vietnamese, tenure-line faculty
across **all STEM fields** at U.S. universities, added one field at a time. This doc is
the handoff point for whichever agent or session picks up the next field — read it before adding
entries so the bar stays consistent across fields.

## Verification bar (authoritative user instruction, 2026-08-18)

Include a person only when all of the following are supported by reliable evidence, preferably
official university pages:

1. They are Vietnamese or Vietnamese-American. Do **not** infer identity solely from a
   Vietnamese-looking name; seek an official biography, education in Vietnam, self-identification,
   Vietnamese community/professional affiliation, or comparably reliable evidence.
2. They are currently employed by a U.S. university in a tenure-track or tenured academic role
   (typically Assistant Professor, Associate Professor, or Professor).
3. Their primary appointment belongs in the broad field under review.
4. They can serve as a primary advisor or dissertation chair for PhD students in a relevant
   doctoral program. Direct dissertation/advising evidence is best; graduate-faculty and program
   evidence may support a current tenure-line appointment.

Exclude adjunct, visiting, teaching-only, research-track/research-professor, professor-of-practice,
emeritus/retired, courtesy-only, and non-university appointments. A Google Scholar URL is useful
but is not itself an inclusion criterion; prefer an official profile URL when available.

Do not guess or fabricate URLs, universities, research areas, ranks, or identity evidence. This is
a public-facing directory, so every addition must be independently checkable by a reader.

Quantity target per field: as exhaustive a web-search pass as reasonably achievable, not just the
first handful found. The CS list (~49 entries) is the rough depth benchmark, though smaller fields
will naturally have fewer. Work on exactly one broad field per run, then report changes and stop.

## Schema

See `README.md` for the field list. Notes specific to filling it in:

- `state`: full state name (e.g. `"Massachusetts"`, not `"MA"`) — `"DC"` is the one existing
  exception, kept as-is for consistency with existing entries.
- `department`: the department name as that university actually calls it (e.g. `"Chemistry"` vs
  `"Chemistry and Biochemistry"`) — don't normalize across universities.
- `researchAreas`: short, Title Case topical tags, matching the terseness of existing entries.
- `secondaryAppointment: true`: use only when the person's *primary/tenure home* is a different
  department and the field you're adding is a joint/secondary appointment. Before adding such an
  entry, check whether the person is already in the roster under their primary department — if
  so, don't create a duplicate; a joint appointment is one row, not two. (This means cross-checking
  new candidates against the full existing roster, not just the field you're currently working on.)
- File formatting: `public/data.json` is one compact JSON object per line, not pretty-printed —
  match that exactly when appending.

## Process for a field pass

1. Read `public/data.json`, `src/data.js`, `test/data.test.js` to (re-)confirm schema and
   validation rules (no duplicate names, all required fields present, `profileUrl` starts with
   `https://`, etc).
2. Web search broadly for candidates (common Vietnamese surnames + department + "professor",
   university-by-university, etc), not just the first obvious names.
3. Audit every existing entry in that field before adding candidates: current university, rank,
   tenure-line status, department, profile URL, doctoral-advising eligibility, broad-field fit, and
   identity support. Correct stale data; remove only entries clearly shown to be ineligible.
   Computer & Information Sciences is high confidence: do not delete a CS entry on weak or missing
   evidence; retain and flag ambiguity instead.
4. Verify each candidate individually using official pages, including identity and PhD-advising
   evidence. Check name variants and institutions to prevent duplicates.
5. Append verified entries to `public/data.json`, run `npm test`, confirm it passes. Do this
   incrementally (every few verified candidates), not only at the very end — a long research pass
   can get cut off by a session/usage limit mid-run, and unsaved findings are lost (this has
   already happened twice).
6. Update the progress table below with what was added and what was checked-and-rejected (briefly
   — e.g. "adjunct", "no Scholar profile found", "already in roster under Math").
7. If the new field's departments don't already match one of the `FIELD_RULES` patterns in
   `src/data.js` (used to bucket entries for the site's field-filter dropdown), add a rule there —
   otherwise those entries fall through to their raw `department` string instead of a shared field
   bucket, and won't group with the rest of the field in the dropdown.

## Progress by field

| Field | Status | Notes |
|---|---|---|
| Computer Science | Audited (2026-08-18) | Reviewed all 49 existing Computer & Information Sciences entries. No removals: each has current faculty evidence or, where the primary unit is a combined EECS department, a current tenure-line appointment with CS graduate-advising evidence. Reclassified Khoa Luu (Arkansas) to Electrical Engineering and Computer Science and Truong Nghiem (UCF) to Electrical and Computer Engineering; updated Nghiem and Thinh Nguyen (Oregon State) to official faculty profiles, and reclassified Thinh to Electrical Engineering and Computer Science. Broad searches did not surface an additional candidate meeting every inclusion criterion. Not added: Minh Hoai Nguyen (Stony Brook) is currently listed by the CS department as research associate professor/on leave, which is not a verified tenure-line appointment. |
| Mathematics | Audited (2026-08-18) | Reviewed all 19 existing entries and retained each: current official departmental pages support their appointments, and graduate-course, dissertation, or doctoral-advising records support eligibility to advise relevant PhD students. Added Trieu Le (University of Toledo), Dinh-Liem Nguyen (Kansas State), Huy Tai Ha (Tulane), and Ngo Bao Chau (University of Chicago). Excluded Thai Nhan (Menlo College): it has no relevant doctoral mathematics program; Van Vu is now at the University of Hong Kong; Minh Hoai Nguyen (Stony Brook) is research-track/on leave rather than verified tenure-line. |
| Electrical and Computer Engineering | Audited (2026-08-18) | Reviewed all 10 ECE/EECS entries in the roster as part of the Engineering pass; retained them after current official-faculty and doctoral-program/advising checks. Replaced Minh N. Do's UIUC and Mai Vu's Tufts Google Scholar links with official faculty profiles. |
| Physics | Audited (2026-08-18) | Reviewed the 5 scaffold entries and retained all five. Dien Nguyen's outdated `instructional-faculty` URL category was checked against her current page: she is an Assistant Professor at UT Knoxville and actively recruits PhD students. Added Kayla Nguyen (University of Oregon, Physics). Rejected/left out: Phat Vu (Soka University) has no doctoral program; Lan Quynh Nguyen (Notre Dame) is adjunct; Nguyen Trong Hien is a NASA/JPL researcher, not university faculty; Pham Quang Hung (UVA) could not be confirmed in the current official faculty directory. |
| Statistics / Biostatistics / Operations Research | Audited (2026-08-18) | Reviewed the 3 scaffold entries. Corrected Long Nguyen and Quoc Tran-Dinh to use official faculty pages and marked their Statistics/STOR appointments as primary rather than secondary. Added Nhat Ho (UT Austin, Statistics and Data Sciences). Kept Kim-Anh Do (MD Anderson, Biostatistics). Added previously held candidates Tru Cao (UTHealth Houston Biostatistics and Data Science) and Phong Nguyen (UVA School of Data Science) after user-confirmed manual review. Nhu Nguyen (URI) remains excluded because his primary appointment is Mathematics. |
| Chemistry | Audited (2026-08-18) | Re-audited all 7 existing entries and retained each. Current official faculty evidence confirms the listed Chemistry appointments for Dong (UCI), Thuc-Quyen Nguyen (UCSB), SonBinh Nguyen (Northwestern), Hien Nguyen (Wayne State), Hung Nguyen (Buffalo), and Tuan Trinh (Utah State); Vo-Dinh remains correctly marked secondary because his primary Duke appointment is Biomedical Engineering. No data corrections or additional defensible Chemistry entries in this pass. Earlier exclusions retained: Thanh N. Truong (emeritus); Hoang (Long) Nguyen and Diep Ca (no verified Scholar profiles); Danith Ly (Cambodian-American); Ka Un Lao (Macau heritage); Nga Lee "Sally" Ng (Hong Kong heritage and Chemical/Biomolecular Engineering); Tran Nguyen (UC Davis Environmental Toxicology, defer to Earth/Environmental); Hung Phan (visiting); Hung V. Pham (adjunct/instructor); Khanh Ha (graduate student); My Hang V. Huynh (Los Alamos, not university faculty). |
| Biology / Life Sciences | Audited (2026-08-18) | Reviewed the 6 scaffold entries. Corrected Tuan Minh Tran from Kansas State Plant Pathology to his current tenure-track Assistant Professor position in Biology at the University of South Alabama. Removed Trang Thi Huyen Nguyen: the cited scholar identity's public research affiliations are South Korea/Oregon State, not Arkansas State, and no current Arkansas State faculty appointment could be found. Retained Lena H. Nguyen (UT Dallas, explicitly tenure-track and mentoring Neuroscience PhD students), Tracy S. Tran (Rutgers–Newark Biology graduate faculty and dissertation advisor), Thuy Ngo (OHSU Molecular and Medical Genetics primary faculty), and Huy Q. Dinh (UW–Madison Oncology Assistant Professor). No new entries added. Earlier exclusions retained: Vu Q. Nguyen, Ally/Alexandra Nguyen, and An Phu Tran Nguyen (no verified Scholar profile); Trang Nguyen (visiting); Louis T. Dang (clinical); John T. Ngo (primary BME); Trung V. Phan (Physics); Nicole Vo (acting/non-TT); Tuan M. Tran (clinical Medicine); Khanh-Van Ho (research-track); Xuong Nguyen-Huu (emeritus/deceased); Tran Dang Khanh (visiting scientist). |
| Chemical Engineering | Audited (2026-08-18) | Reviewed the 4 current entries added in the prior Chemical Engineering pass and retained them: Trung Van Nguyen (Kansas), Ngoc Bui (Oklahoma), Jonathan T. Pham (Cincinnati), and Thi Vo (Johns Hopkins). Earlier exclusions retained: Binh Vu (research-track), Hang Lu (Vietnamese heritage unconfirmed), Hung V.-T. Nguyen (better fit for Bioengineering), Duong D. Do (Australia), Thomas Dinh Tran (teaching-track), Kim-Vy Nguyen-Ngoc (Pediatrics), Mi (Kelly) Hoang Tran (business), Annalee Nguyen (research-track), and Nam-Trung Nguyen (Australia). |
| Mechanical Engineering | Not started | |
| Civil Engineering | Audited (2026-08-18) | Added Khiem T. Tran (University of Florida) and Thang N. Dao (University of Alabama). Both have official civil-engineering faculty appointments, documented Vietnam-based undergraduate education, and direct evidence of doctoral student supervision or doctoral dissertation participation. |
| Materials Science / Engineering | Not started | |
| Bioengineering / Biomedical Engineering | Not started | Candidates already surfaced during other passes: Tuan Vo-Dinh (Duke, secondary appt, already in roster under Chemistry), John T. Ngo (Boston University). |
| Earth / Environmental Science | Audited (2026-08-18) | No pre-existing entries. Added Tran B. Nguyen (UC Davis Environmental Toxicology) after user-confirmed manual review; official faculty and graduate-program sources support the appointment and primary PhD advising. Thi Hong Diep Dao (UCCS Geography/GIScience) remains excluded because UCCS does not offer a relevant doctoral program. |
| Astronomy / Astrophysics | Not started | |
| Aerospace Engineering | Not started | |
| Industrial / Systems Engineering | Not started | |
| Environmental Engineering | Not started | |
| Nuclear Engineering | Not started | |
| Agricultural & Food Science | Audited (2026-08-18) | No pre-existing entries and no additions made after searches across plant science, plant pathology, agronomy, food science, and natural resources. Tuan Minh Tran remains classified under Biological & Biomedical Sciences because his primary appointment is Biology, rather than an agricultural academic unit. |
| Geology / Oceanography / Atmospheric Science | Not started | |
| Data Science / Information Science | Not started | Overlaps heavily with CS — check for duplicates against the existing CS list before adding. |
| Pharmaceutical Sciences | Not started | |
| Public Health / Epidemiology | Not started | STEM-adjacent by most classifications (e.g. NSF); include if a clean pass turns up candidates. |
| Medicine (MD/PhD research faculty) | Audited (2026-08-18) | Added James Huynh (University of Michigan, Health Management and Policy): official faculty and doctoral-program pages confirm Assistant Professor/faculty status and inclusion among the PhD program's sociology-and-organizational-studies faculty; his profile explicitly identifies him as Vietnamese American and tenure-track. Excluded primarily clinical faculty and emeritus candidates. |
| Psychology (cognitive/quantitative) | Not started, disputed | Included in some STEM classifications (e.g. NSF), excluded from others. Flagging rather than deciding unilaterally — ask before starting this one. |
| Economics (quantitative/econometrics) | Not started, disputed | Same caveat as Psychology above. |

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

## Known issue: background research agent can silently no-op

The first Chemistry attempt was delegated to a forked background agent that reported
"completed" with a plausible-sounding summary, but its actual tool-use count was 0 and it ran for
~6 seconds — i.e. it did no real search or verification work and the diff it claimed to make
never happened. **Don't trust a completion report at face value** — after any research agent
reports done, check `git diff public/data.json` (or `git status`) yourself to confirm entries
were actually added before updating this table or telling the user it's done.
