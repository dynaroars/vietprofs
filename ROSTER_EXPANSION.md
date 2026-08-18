# Roster expansion: all STEM fields

This site started as a Computer Science-only list, then picked up some Math/Physics/ECE/Stats
entries during the initial scaffold. The goal now is to cover Vietnamese, tenure-line faculty
across **all STEM fields** at U.S. universities, added one field at a time. This doc is
the handoff point for whichever agent or session picks up the next field — read it before adding
entries so the bar stays consistent across fields.

## Verification bar (authoritative user instruction, updated 2026-08-18)

Include a person only when all of the following are supported by reliable evidence, preferably
official university pages:

1. They are Vietnamese or Vietnamese-American. Do **not** infer identity solely from a
   Vietnamese-looking name; seek an official biography, education in Vietnam, self-identification,
   Vietnamese community/professional affiliation, or comparably reliable evidence.
2. They are currently employed by a U.S. university in a tenure-track or tenured academic role
   (typically Assistant Professor, Associate Professor, or Professor).
3. Their primary appointment belongs in the broad field under review.

Exclude adjunct, visiting, teaching-only, research-track/research-professor, professor-of-practice,
emeritus/retired, courtesy-only, and non-university appointments. A Google Scholar URL is useful
but is not itself an inclusion criterion; prefer an official profile URL when available.

**Policy update:** A relevant PhD program and PhD-advising eligibility are no longer inclusion
requirements. Tenure-line STEM faculty at universities without doctoral programs are eligible.
Future field re-audits should reconsider candidates previously excluded only for that reason.

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
   tenure-line status, department, profile URL, broad-field fit, and identity support. Correct stale
   data; remove only entries clearly shown to be ineligible.
   Computer & Information Sciences is high confidence: do not delete a CS entry on weak or missing
   evidence; retain and flag ambiguity instead.
4. Verify each candidate individually using official pages, including identity and current
   tenure-line evidence. Check name variants and institutions to prevent duplicates.
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
