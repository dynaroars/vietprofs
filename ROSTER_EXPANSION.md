# Roster expansion: all STEM fields

This site started as a Computer Science-only list, then picked up some Math/Physics/ECE/Stats
entries during the initial scaffold. The goal now is to cover Vietnamese, tenure-line faculty
across **all STEM fields** at U.S. universities, added one field at a time. This doc is
the handoff point for whichever agent or session picks up the next field — read it before adding
entries so the bar stays consistent across fields.

## Verification bar (confirmed with the user, 2026-08-18; full-time requirement dropped 2026-08-18)

Include a person only if all three hold:

1. Clearly Vietnamese name.
2. A working **.edu faculty/department profile page** confirming they are tenure-line
   (tenure-track or tenured — not adjunct, teaching-only, visiting, research-track/
   research-professor, or emeritus/retired) at a U.S. university. Full-time status is not a
   separate requirement — tenure-line is sufficient.
3. A working **Google Scholar profile URL**
   (`https://scholar.google.com/citations?user=...`).

Do not guess or fabricate URLs, universities, or research areas. If any of the three can't be
confirmed, leave the person out rather than including a best-guess entry. This is a real,
public-facing directory — every entry must be independently checkable by a reader.

Quantity target per field: as exhaustive a web-search pass as reasonably achievable, not just the
first handful found. The CS list (~49 entries) is the rough depth benchmark, though smaller fields
will naturally have fewer.

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
3. Verify each candidate individually: fetch their faculty page and their Google Scholar page.
4. Append verified entries to `public/data.json`, run `npm test`, confirm it passes. Do this
   incrementally (every few verified candidates), not only at the very end — a long research pass
   can get cut off by a session/usage limit mid-run, and unsaved findings are lost (this has
   already happened twice).
5. Update the progress table below with what was added and what was checked-and-rejected (briefly
   — e.g. "adjunct", "no Scholar profile found", "already in roster under Math").
6. If the new field's departments don't already match one of the `FIELD_RULES` patterns in
   `src/data.js` (used to bucket entries for the site's field-filter dropdown), add a rule there —
   otherwise those entries fall through to their raw `department` string instead of a shared field
   bucket, and won't group with the rest of the field in the dropdown.

## Progress by field

| Field | Status | Notes |
|---|---|---|
| Computer Science | Done (pre-existing) | ~49 entries, from initial scaffold. |
| Mathematics | Done (pre-existing) | 19 entries, from initial scaffold. |
| Electrical and Computer Engineering | Done (pre-existing) | 7 entries, mostly secondary appointments. |
| Physics | Done (pre-existing) | 5 entries, from initial scaffold. |
| Statistics / Biostatistics / Operations Research | Done (pre-existing) | 3 entries total, from initial scaffold. |
| Chemistry | Done (2026-08-18) | 7 entries added: Vy M. Dong (UC Irvine), Thuc-Quyen Nguyen (UCSB), SonBinh T. Nguyen (Northwestern), Hien M. Nguyen (Wayne State), Hung T. Nguyen (SUNY Buffalo), M. Tuan Trinh (Utah State), Tuan Vo-Dinh (Duke, secondary appointment — primary home is Biomedical Engineering, not yet in roster). Rejected after investigation: Thanh N. Truong (Utah) — emeritus; Hoang (Long) Nguyen (Washburn) — tenure-track chemistry but no findable Google Scholar profile; Diep Ca (Shenandoah University) — professor of chemistry but no Google Scholar profile found; Danith Ly (CMU) — Cambodian-American, not Vietnamese; Ka Un Lao (VCU) — born in Macau, not Vietnamese; Nga Lee "Sally" Ng (Georgia Tech) — Hong Kong heritage, not Vietnamese, and dept is Chemical/Biomolecular Engineering; Tran Nguyen (UC Davis) — Vietnamese-heritage, tenure-track, has Scholar profile, but department is Environmental Toxicology (Atmospheric/Environmental Chemistry) rather than a Chemistry/Biochemistry department — better fit for a future Earth/Environmental Science pass; Hung Phan (Soka University) — visiting assistant professor; Hung V. Pham (UCLA) — adjunct/instructor; Khanh Ha (U. Florida) — graduate student, not faculty; My Hang V. Huynh — Los Alamos National Laboratory (not university faculty). First attempt (2026-08-18) via a forked agent had silently failed — it reported success but made zero tool calls and added zero entries; this pass is the real retry. |
| Biology / Life Sciences | Done (2026-08-18) | 6 entries added: Lena H. Nguyen (UT Dallas, Neuroscience), Tracy S. Tran (Rutgers University-Newark, Biological Sciences, Professor rank), Tuan Minh Tran (Kansas State, Plant Pathology), Trang Thi Huyen Nguyen (Arkansas State, Biological Sciences/Microbiology), Thuy Ngo (OHSU, Molecular and Medical Genetics), Huy Q. Dinh (UW-Madison, Oncology/McArdle Lab for Cancer Research). Rejected after investigation: Vu Q. Nguyen (UCSD Molecular Biology) — tenure-track but no findable Google Scholar profile; Ally/Alexandra Nguyen (CU Anschutz Cell & Dev Biology) — tenure-track but no findable Google Scholar profile; An Phu Tran Nguyen (UW-Milwaukee Biological Sciences) — tenure-track but no findable Google Scholar profile; Trang Nguyen (Bowdoin) — Visiting Assistant Professor; Louis T. Dang (Michigan) — MD, clinical track (listed as Clinical Lecturer elsewhere), not confirmed tenure-line; John T. Ngo (Boston University) — primary tenure home is Biomedical Engineering, not Biology, better fit for a future Bioengineering pass; Trung V. Phan (Pitzer & Scripps) — Assistant Professor of Physics, not Biology; Nicole Vo (U Washington) — Acting Assistant Professor (non-tenure-track); Tuan M. Tran (Indiana University School of Medicine) — MD/PhD, primarily clinical Associate Professor of Medicine, ambiguous tenure status, better fit for a future Medicine pass; Khanh-Van Ho (U Missouri Chemistry) — Assistant Research Professor (research-track, not tenure-line); Xuong Nguyen-Huu (UCSD) — emeritus and deceased; Tran Dang Khanh (UC Riverside) — appears to be a visiting scientist from Vietnam's Agricultural Genetics Institute, not UCR faculty. Search was broad across neuroscience, molecular/cell biology, genetics, microbiology, plant pathology, cancer biology, immunology, virology, structural biology, marine biology, entomology, and stem cell biology, plus faculty-directory scans at ~10 additional universities (UVA, ECU, BU, Georgia Tech, Emory, UNC, USC Marine Biology, U Houston) with no further Vietnamese-surname matches; ended when the session's web search budget was exhausted. |
| Chemical Engineering | Not started | |
| Mechanical Engineering | Not started | |
| Civil Engineering | Not started | |
| Materials Science / Engineering | Not started | |
| Bioengineering / Biomedical Engineering | Not started | Candidates already surfaced during other passes: Tuan Vo-Dinh (Duke, secondary appt, already in roster under Chemistry), John T. Ngo (Boston University). |
| Earth / Environmental Science | Not started | Candidate already surfaced: Tran Nguyen (UC Davis, Environmental Toxicology). |
| Astronomy / Astrophysics | Not started | |
| Aerospace Engineering | Not started | |
| Industrial / Systems Engineering | Not started | |
| Environmental Engineering | Not started | |
| Nuclear Engineering | Not started | |
| Agricultural & Food Science | Not started | |
| Geology / Oceanography / Atmospheric Science | Not started | |
| Data Science / Information Science | Not started | Overlaps heavily with CS — check for duplicates against the existing CS list before adding. |
| Pharmaceutical Sciences | Not started | |
| Public Health / Epidemiology | Not started | STEM-adjacent by most classifications (e.g. NSF); include if a clean pass turns up candidates. |
| Medicine (MD/PhD research faculty) | Not started | Distinct from Biology — several MD/PhD candidates were rejected from the Biology pass for having primarily clinical rather than confirmed tenure-line research appointments (see Biology row). Needs its own verification approach given how clinical vs. tenure-line status is documented differently at med schools. |
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
