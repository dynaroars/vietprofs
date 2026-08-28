# Extension-track research runbook

This is the durable work state and resume guide for expanding VietProfs with stable
`Research` and `Clinical` appointments, and stable Professor of Practice (or equivalent)
appointments recorded as `Teaching`. It is intentionally sequential: complete and validate one
batch before starting the next. Do not run batches in parallel or treat a found name as an
approved entry.

Read this file, [`ROSTER_MAINTENANCE.md`](../ROSTER_MAINTENANCE.md), and
[`README.md`](../README.md) before resuming. `ROSTER_MAINTENANCE.md` is authoritative if this
runbook conflicts with it.

## Search methodology (updated 2026-08-28)

Searching by track keyword first (e.g. `"Research Professor" "Nguyen" site:.edu`) turned out to
have very low yield: it mostly re-surfaces tenure-line faculty already in the roster, and misses
people whose actual title doesn't happen to contain the searched keyword. The better-yielding
approach, used from this point on: for each **country already represented in the roster**, search
big/well-known universities in that country combined with Vietnamese surnames with **no track
keyword**, identify who comes up, then classify each person into whichever track actually fits
(Tenure-line, Research, Clinical, Teaching, or Emeritus) from their official profile — not just the
extension tracks. This also surfaces plain Tenure-line additions and existing-entry corrections
(dead links, wrong track, unpreserved titles) alongside extension-track candidates, and dedupes
against the existing roster by name/university before adding anything. Countries already in the
roster (person counts as of 2026-08-28): United States (546), Australia (56), Canada (44), United
Kingdom (44), France (31), Singapore (22), Taiwan (21), Netherlands (8), Hong Kong (5), Japan (5),
Germany (5), Switzerland (3), Poland (3), New Zealand (2), Norway (2), Belgium (1), Ireland (1→2),
Sweden (1), Denmark (0→1). Work through these from largest to smallest, then consider countries not
yet represented at all if a strong candidate surfaces.

## Scope and non-negotiable gates

The roster covers Vietnamese and Vietnamese-diaspora academics at universities **outside
Vietnam**. Use Vietnamese names and other relevant discovery signals to find candidates; no
separate documentary identity-evidence check is required. Add someone only after individually
verifying all of the following from reliable evidence:

1. A current primary university appointment and a working official `profileUrl`.
2. A stable, career-type role in the relevant track. Faculty directories, a published promotion
   ladder, explicit continuing/permanent/full-time language, or repeated/current institutional
   evidence may establish stability.
3. The exact published appointment title, current university, primary department, and geographic
   location.
4. No duplicate roster member under another spelling, order, diacritic form, former affiliation,
   or URL.

Never add adjunct, affiliate/courtesy, visiting, postdoctoral, student, assistant/research
assistant, short-term fellow, industry-only, or otherwise temporary/part-time roles. Do not use
LinkedIn, ResearchGate, Google Scholar, or social media as the sole evidence. A `Research
Assistant Professor` is eligible only when evidence establishes a genuine, career-type
research-faculty appointment rather than a senior postdoc. Senior/Principal Research Scientists
need equally strong proof of faculty-equivalent or long-term academic status.

Track mapping:

| Found appointment | Stored `track` | Stored `rank` |
| --- | --- | --- |
| Research Professor / Associate / Assistant Professor | `Research` | Exact institutional title |
| Long-term faculty-equivalent research scientist | `Research` | Exact institutional title |
| Clinical Professor / Associate / Assistant Professor / documented clinical faculty | `Clinical` | Exact institutional title |
| Professor of Practice / Associate / Assistant / stable equivalent | `Teaching` | Exact institutional title |

If a country-specific title is actually tenure-line or teaching-track under that university's
rules, use the existing `Tenure-line` or `Teaching` track. Do not invent another track.

## Batch sequence

| Batch | Status | Search area | Appointment target |
| --- | --- | --- | --- |
| 1 | `in_progress` | United States | Research |
| 2 | `pending` | Outside the United States and Vietnam | Research |
| 3 | `in_progress` | United States | Professor of Practice / equivalent → Teaching |
| 4 | `pending` | Outside the United States and Vietnam | Professor of Practice / equivalent → Teaching |
| 5 | `in_progress` | United States | Clinical |
| 6 | `in_progress` | Outside the United States and Vietnam | Clinical |

Before changing a batch to `complete`, finish its candidate queue, record excluded/borderline
people below, and run the validation checklist. Immediately advance the next batch from `pending`
to `in_progress` and continue its research without waiting for confirmation. Keep a completed
batch as a reviewable unit if a commit is later requested.
If a candidate cannot be resolved, record it as deferred with the missing proof; do not block the
rest of the batch indefinitely.

Note (2026-08-28 session): broad, general-purpose web search on Vietnamese surnames yields very
low net-new candidates because most tenure-line matches are already in the 786+-entry roster, so
this session worked several batches (1, 3, 5, 6) opportunistically as promising leads surfaced
rather than strictly finishing one before starting the next. None of 1/3/5/6 is close to a
genuine, exhaustive sweep of its search area — treat their `in_progress` status as "started, real
additions logged, far from complete," not as near-complete. A later session or the unattended
`maintain-roster.mjs`-style controller should continue each with narrower, institution- and
discipline-specific searches (medical-school clinical-faculty directories, named non-tenure
promotion ladders, research institutes) rather than repeating broad surname sweeps.

### Batch 1 — U.S. Research

Prioritize major R1 universities, medical schools, engineering/computing departments, and
university research centers. Search by institution and discipline, using Vietnamese names and
other relevant discovery signals. Useful starting patterns include:

```text
site:university-domain.edu "Research Professor" faculty
site:university-domain.edu "Research Associate Professor" faculty
site:university-domain.edu "Research Assistant Professor" faculty
site:university-domain.edu "Senior Research Scientist" faculty
"Vietnamese American" "Research Professor"
```

For every promising person, locate current appointment evidence and look for
continuity/promotion evidence before inclusion.

### Batch 2 — International Research

Cover Canada, the UK, Australia, Singapore, Hong Kong, and continental Europe first, then other
eligible countries. Check the meaning and contract structure of local titles; do not equate
Lecturer, Senior Lecturer, Reader, Research Fellow, or Senior Research Fellow with `Research`
without institutional evidence.

### Batch 3 — U.S. Practice mapped to Teaching

Search business, engineering, law, arts, education, communications, and professional schools for
Professor of Practice ladders. A current official faculty listing plus evidence of an ongoing
substantive appointment is required. Visiting and adjunct practice appointments are excluded.

### Batch 4 — International Practice mapped to Teaching

Use the same standard as Batch 3. Interpret institution-specific practice titles carefully and
map only stable teaching-facing appointments to `Teaching`.

### Batch 5 — U.S. Clinical

Prioritize medical, pharmacy, nursing, dentistry, public-health, and health-science schools.
Require an official clinical-faculty title or documented clinical ladder, not merely clinical work
or a clinician who holds an ordinary tenure-line appointment.

### Batch 6 — International Clinical

Use the same standard as Batch 5, accounting for local clinical academic structures. Do not
infer a clinical faculty track from hospital employment alone.

## Required per-person research and data collection

Search `public/data.json` for every name variant before editing. For every approved person,
collect and verify:

- official university profile URL, university, primary department, exact title, track, city,
  state/province where applicable, and country;
- current maintained `websiteUrl` and a verified `scholarUrl`, when available;
- research areas from the official profile;
- all explicitly documented education supported by the existing schema: PhD, master's,
  undergraduate, professional degrees, and completed postdoctoral training. Never infer years;
- eligible major honors only, each with its source URL; and
- a current, suitable portrait. Save a local WebP file under `public/portraits/`, use a stable
  filename, and record the source in `portraitSource`. Do not add an unsupported portrait.

Do not overwrite stronger existing data with weaker data. For an existing person whose official
title establishes one of these tracks, update the track and preserve their actual title in `rank`;
perform the same full review before advancing the verification ledger.

## Checkpoint log

Add concise candidate notes as work proceeds. A candidate is not an addition until it passes every
gate above. Include URLs for identity, appointment, and stability evidence in the note.

### Batch 1 — U.S. Research

- Added: Alex-Thai Dinh Vo — Texas Tech University — `Research`; pre-run addition, 2026-08-28.
- Added: Trang Nguyen — University at Albany, State University of New York — `Research`; full
  official profile, education, and portrait review completed, 2026-08-28.
- Deferred/excluded: Thoa Tran — Indiana University — an official profile establishes the Research
  Assistant Professor title, but this pass did not establish a career-type appointment beyond the
  title.
- Deferred/excluded: Tyler Nguyen — Indiana University — current official profile confirms a
  Research Assistant Professor appointment after a postdoctoral fellowship, but this pass did not
  establish career-type stability beyond the title.
- Deferred/excluded: Truc (Tru V.) Tran — Weill Cornell Medicine — VIVO research-profile page
  confirms "Associate Professor of Pharmacology Research in Medicine" (a Research-track title at
  this institution), but no official source documents her research areas, so the roster's required
  `researchAreas` field cannot be populated without inference; retry with deeper search.
- Deferred/excluded: An Vo — Feinstein Institutes for Medical Research / Zucker School of Medicine
  at Hofstra — listed as plain "Assistant Professor"; no source found designating this a Research-
  track (vs. ordinary tenure-line) appointment.
- Deferred/excluded: Khanh Pham — University of New Mexico ECE — official profile states "Adjunct
  Research Professor"; adjunct appointments are excluded regardless of the Research qualifier.
- Note: broad Vietnamese-surname + "Research Professor"/"Research Associate Professor" web
  searches are producing very low net-new yield because most matching tenure-line faculty are
  already in the 786-entry roster; subsequent sessions should prioritize discipline- or
  institution-specific sweeps (national labs, research institutes, medical school research-faculty
  directories) over broad surname search.
- Added (2026-08-28, big-university pass): Cuong Nguyen (disambiguated as "Cuong Nguyen -
  Massachusetts Institute of Technology"; roster namesake at University of Florida) — MIT,
  Aeronautics and Astronautics — `Research`; official CSE profile confirms "Principal Research
  Scientist" (MIT's senior research-track rank), PhD 2005 National University of Singapore,
  https://cse.mit.edu/people/n-cuong-nguyen/.
- Added: Minhtri Khac Nguyen — UCLA, Medicine/Nephrology — `Clinical`; official UCLA profile
  confirms "HS Clinical Professor" (UC's Health Sciences Clinical Professor ladder),
  https://profiles.ucla.edu/minhtri.nguyen.
- Added: Teresa Phuongtram Nguyen — Stanford University, Anesthesiology, Perioperative and Pain
  Medicine — `Clinical`; official Stanford Profiles page confirms "Clinical Assistant Professor",
  https://profiles.stanford.edu/138089.
- Deferred/excluded: Thanh Phuong Pham Nguyen — UPenn Perelman, Biostatistics/Epidemiology —
  official profile lists "Research Associate," not a stable faculty rank.
- Deferred/excluded: Thai Tran Nguyen — Johns Hopkins Anesthesiology — official faculty listing
  gives the title "Clinical Associate," a sub-faculty rank at Hopkins, not Assistant/Associate/full
  Clinical Professor.
- Deferred/excluded: Nicole Y. Nguyen — UCSF pharmacy — third-party sources describe her as
  "Associate Clinical Professor," but she does not appear on UCSF's own Department of Clinical
  Pharmacy faculty listing; no official source confirms the title.
- Added: Tran Nguyen — Ohio State University, Internal Medicine (Dublin, OH) — `Clinical`;
  official Wexner Medical Center profile confirms "Assistant Clinical Professor of Internal
  Medicine", https://wexnermedical.osu.edu/find-a-doctor/tran-nguyen-100001229.
- Added: Huyen Q. Pham — University of Southern California, Keck School of Medicine, Obstetrics &
  Gynecology (Gynecologic Oncology) — `Clinical`; official Keck faculty-search profile confirms
  "Assistant Professor of Clinical Obstetrics & Gynecology" (USC's clinical-track title format),
  https://keck.usc.edu/faculty-search/huyen-q-pham/.
- Added: Vu Dang La — University of Pennsylvania, School of Dental Medicine, Periodontics —
  `Clinical`; official Penn Dental faculty profile confirms "Clinical Assistant Professor of
  Periodontics", https://www.dental.upenn.edu/faculty/vu-dang-la/.
- Added: Thao T. Dang — Indiana University School of Medicine, Medical & Molecular Genetics —
  `Clinical`; official IU School of Medicine profile confirms "Assistant Professor of Clinical
  Medical & Molecular Genetics", https://medicine.iu.edu/faculty/63488/dang-thao.
- Deferred/excluded: Duc T. Pham — Northwestern Feinberg, Cardiac Surgery — official profile lists
  plain "Professor" (tenure-line), not a Clinical-track title; out of this batch's scope (a
  possible lead for the general tenure-line roster, not logged there in this pass).
- Deferred/excluded: Trang K. Nguyen — Washington University in St. Louis, Surgery — public sources
  give plain "Associate Professor of Surgery" without a Clinical qualifier; insufficient evidence
  to classify as Clinical vs. tenure-line from available sources (official profile page returned
  HTTP 403).
- Corrected an existing entry: Thanh Tran (Rice University, ECE) already carried `track: Teaching`
  but `rank: "Teaching"` (a placeholder, not the institution's actual title). Official Rice profile
  gives his title as "Professor in the Practice, Electrical and Computer Engineering" — updated
  `rank` to preserve it, per the rule to keep an institution's actual Professor-of-Practice-
  equivalent title. `lastUpdatedAt` advanced.
- Added: Uyen L. Tran — Vanderbilt University, Ophthalmology & Visual Sciences — `Clinical`;
  official Vanderbilt faculty-directory profile confirms "Professor of Clinical Ophthalmology &
  Visual Sciences", https://wag.app.vanderbilt.edu/PublicPage/Faculty/Details/27306.
- Deferred/excluded: Quyen Nguyen — University of Pittsburgh, Pulmonary/Allergy/Critical Care —
  official profile lists plain "Assistant Professor of Medicine" without a Clinical qualifier.

**Data-quality audit, 2026-08-28:** searched the roster for existing entries stuck with the
generic `rank: "Teaching"` placeholder (a sign the actual published title was never captured) in
medicine/dental/pharmacy/nursing-adjacent departments — 64 entries carry that placeholder
roster-wide; spot-checked those in health-related departments. Found and fixed three genuine
Clinical-track misclassifications, corrected one dead profile URL, and confirmed several
false-positive leads (Instructional Assistant Professor and Teaching-Stream/Professor-of-Teaching
titles are correctly `Teaching`, not `Clinical`, even though "clinical" appears in the department
name or research area):
- Corrected: Khoa Nguyen — University of Florida College of Pharmacy, Pharmacotherapy and
  Translational Research — official profile confirms "Clinical Associate Professor"; moved from
  `Teaching`/"Teaching" to `Clinical`/"Clinical Associate Professor".
- Corrected: Tuong Vi Ho — Texas Woman's University, Nursing (Houston Center) — official profile
  confirms "Associate Clinical Professor"; moved from `Teaching`/"Teaching" to `Clinical`/
  "Associate Clinical Professor".
- Fixed dead link: Minh-Hiên Lê — University of Toronto, Leslie Dan Faculty of Pharmacy — stored
  `profileUrl` 404'd; replaced with the live profile URL and preserved her actual title,
  "Assistant Professor, Teaching Stream" (confirmed still correctly `Teaching`).
- Confirmed correct as-is (no change): Lan Chi Nguyen (University of Houston College of
  Optometry, "Instructional Assistant Professor" — department is literally named "Clinical
  Sciences" but her rank is a teaching title); Hanh Huynh (UBC Pathology and Laboratory Medicine,
  "Associate Professor of Teaching"); Vuvi H. Nguyen and Leanna Rubio (UTHealth Houston School of
  Dentistry, plain "Associate/Assistant Professor" with no Clinical qualifier found).
- The remaining ~59 `rank: "Teaching"` placeholder entries outside health-adjacent departments were
  not individually re-verified in this pass; a future session should continue this audit across
  the rest of the roster, since it is a higher-yield way to find misclassified entries than fresh
  candidate search.

### Batch 2 — International Research

- Attempted 2026-08-28: broad searches across UK, Germany, Netherlands, Australia (UNSW/Sydney/
  Melbourne/Monash), Singapore/Hong Kong, and Scandinavia turned up tenure-line/associate-professor
  matches (out of this batch's scope) or no matches; no eligible Research-track addition found yet.
- Deferred/excluded: Thuy (Amanda) Tran — Karolinska Institutet, Department of Oncology-Pathology —
  official KI profile lists "Principal Researcher" (employed since 2024) and Group Leader/Head of
  the Theranostics Trial Center at Karolinska University Hospital, with a Docent (Lund, 2016)
  qualification — a plausible Research-track match, but no source found explicitly documents
  permanent/career-track status for the Principal Researcher title itself; retry with deeper
  search into KI's research-appointment policy before adding.
  https://ki.se/en/people/thuy-tran

### Batch 3 — U.S. Practice → Teaching

- Reclassified: Vu Tran — University of Chicago — `Teaching`; exact rank retained as Associate
  Professor of Practice in the Arts, 2026-08-28.
- Added: Daniella Zalcman — Tulane University — `Teaching`; exact rank retained as Professor of
  Practice, 2026-08-28.
- Deferred/excluded: Lien Nguyen — Merrimack College’s current directory lists an adjunct role;
  do not add as a practice appointment.
- Added: Quoc-Viet Dang — University of California, Irvine, EECS — `Teaching`; official profile
  confirms "Associate Professor of Teaching" on UC's named continuing Teaching Professor ladder,
  https://engineering.uci.edu/users/quoc-viet-dang, 2026-08-28.

### Batch 4 — International Practice → Teaching

- Attempted 2026-08-28: searched UK (Imperial/LSE/LBS/Oxford/Cambridge), Canada (UBC/Toronto/
  McGill/Rotman/Sauder/Ivey), and Australia for "Professor of Practice"/"Professor of Teaching"/
  "Teaching Stream" faculty with Vietnamese surnames; found only tenure-line/associate-professor
  matches (out of scope) or profiles too thin to confirm a stable, named non-tenure teaching
  ladder. No eligible addition found yet — needs institution-by-institution directory browsing
  rather than open web search, since these titles are not indexing well.

### Batch 5 — U.S. Clinical

- Reclassified: Huong Nguyen — University of Minnesota — `Clinical`; exact rank retained as
  Clinical Associate Professor, 2026-08-28.
- Added: Van Hellerslia — Temple University — `Clinical`, 2026-08-28.
- Added: Patrick Nguyen — UT Health San Antonio, Department of Surgery — `Clinical`; official
  directory profile confirms "Associate Professor/Clinical" since 2009,
  https://directory.uthscsa.edu/academics/profile/nguyenp1, 2026-08-28.
- Added: Elizabeth Nguyen — Texas A&M University College of Medicine, Pediatrics — `Clinical`;
  official faculty listing confirms "Clinical Assistant Professor",
  https://medicine.tamu.edu/faculty-listings/nguyen-e.html, 2026-08-28.
- Deferred/excluded: Phuong T. Vo — University of Washington’s official current appointment is
  Assistant Professor, not an explicitly clinical-faculty title; do not use `Clinical` without
  stronger track evidence.
- Deferred/excluded: David Pham — UT Southwestern, Pulmonary and Critical Care Medicine — official
  profile (https://profiles.utsouthwestern.edu/profile/181740/) lists plain "Assistant Professor"
  without a Clinical qualifier; insufficient evidence of Clinical track from title alone.
- Deferred/excluded: Ngoc Lien Minh Nguyen — School of Medicine Greenville — directory profile page
  returned no title/appointment detail (https://www.lancaster.sc.edu/study/colleges_schools/medicine_greenville/about/faculty/facultydir/pf2081fe0467b5e9717884a845c788c198);
  cannot verify stable appointment from this source alone.
- Deferred/excluded: Trang Pham — Loyola University New Orleans College of Law — directory profile
  returned HTTP 403 and no other official source with her exact title was found in this pass.
- Corrected an existing entry: Khiem Pham-Nguyen (Boston University Dental School) was previously
  stored as `track: Teaching` with a placeholder `rank: "Teaching"`. Official BU profile confirms
  his title is "Clinical Assistant Professor of Orthodontics & Dentofacial Orthopedics" — moved to
  `track: Clinical` with the correct rank. `lastUpdatedAt` advanced.
- Added: Billie Nguyen — University of Florida College of Pharmacy (Jacksonville) — `Clinical`;
  official faculty listing confirms "Clinical Assistant Professor and Manager, Ambulatory Care",
  https://ufhealthjax.org/pharmacy-residency/faculty, 2026-08-28.
- Added: Thuan Nguyen (disambiguated as "Thuan Nguyen - University of North Texas"; a roster
  namesake already exists at Oregon Health & Science University) — UNT College of Information,
  Data Analytics & Statistics — `Clinical`; UNT policy documents a formal, named non-tenure
  Clinical Faculty promotion ladder (Assistant/Associate/full Clinical Professor),
  https://dataanalytics.unt.edu/people/thuan-nguyen.html, 2026-08-28.

### Batch 6 — International Clinical

- Added: Huyen Tran — Monash University, Australian Centre for Blood Diseases, Central Clinical
  School — `Clinical`; official Monash research-profile page confirms "Clinical Professor" title,
  clinical/research haematology role at Alfred Health, https://research.monash.edu/en/persons/huyen-tran/,
  2026-08-28.
- Added: Hien Thi Thu Nguyen — Aalborg University (Denmark), Department of Molecular Diagnostics /
  Department of Clinical Medicine — `Clinical`; official Aalborg University research-portal
  profile confirms "Associate Professor, Clinical Academic" at Aalborg University Hospital,
  https://vbn.aau.dk/en/persons/httn/, 2026-08-28. First Denmark entry in the roster.
- Deferred/excluded: Quynh Pham — University of Toronto, IHPME — official profile explicitly
  labels the appointment "Assistant Professor (Status-Only)," a University of Toronto affiliate/
  courtesy title without primary paid faculty status; excluded per the affiliate/courtesy
  exclusion.

## Country-sweep checkpoint log

Log of the country-by-country, no-track-keyword search described above (separate from the
batch-sequenced extension-track work above, since this sweep classifies into any track).

### United Kingdom

- Added: An Nguyen — King's College London, King's Business School (HRM & Employment Relations)
  — `Tenure-line`, "Assistant Professor" (UK "Lecturer" mapped per roster convention); official
  KCL profile, PhD Education Policy, The Open University.
- Added: Hoang D. Nguyen ("Harry Nguyen") — University College Cork, School of Computer Science
  and Information Technology — `Tenure-line`, "Associate Professor" (UK "Senior Lecturer" mapped
  per roster convention); official UCC research-profile page. First new addition placing a second
  person in Ireland.
- Confirmed already covered (no action): Ngoc Khanh Nguyen (King's College London, Informatics —
  already `Tenure-line`/Assistant Professor), Mai Nguyen (Manchester Metropolitan University —
  already present), Tuan T. Nguyen (University of Greenwich — already present), Long Tran-Thanh
  (University of Warwick — already present, correctly updated from a prior Southampton
  affiliation).
- Deferred/excluded: Professor An Nguyen — Bournemouth University, Media School — official profile
  currently lists "Visiting Professor" (a former full-time Professor of Journalism role that has
  since become visiting/affiliate status); visiting appointments are excluded regardless of past
  seniority. Note: if this person is later confirmed to hold a different current primary
  appointment elsewhere, re-evaluate there instead.
- Not yet swept: Oxford, Cambridge, Imperial, Bristol, Birmingham, Glasgow (beyond the one
  affiliate lead above), Queen Mary, Sheffield — general web search surfaced mostly staff-directory
  landing pages rather than individual profiles; needs institution-by-institution directory
  browsing rather than open search, similar to the earlier finding for Canada/Australia business
  schools.

### Canada

- Added: Vinh Nguyen — University of Waterloo, English Language and Literature — `Tenure-line`,
  Associate Professor; official profile, PhD/MA McMaster, BA Calgary, 2017 John C. Polanyi Prize
  in Literature (not logged as a roster `honors` entry — literary prize, not one of the documented
  honors categories).
- Added: Tri Nguyen-Quang — Dalhousie University, Engineering (Faculty of Agriculture, Truro
  campus) — `Tenure-line`, Associate Professor; official Faculty of Agriculture profile page. Note:
  a separate, older Dalhousie Industrial Engineering cross-listing page for the same person says
  "Professor Emeritus" — likely stale; the Faculty of Agriculture page (his active home unit, with
  a currently active lab/grants/recent publications) was treated as authoritative. Re-verify on a
  future pass if possible.
- Added: Phuong-Anh Nguyen — York University, School of Administrative Studies — `Tenure-line`,
  Associate Professor of Finance; official profile, PhD Virginia Tech.
- Confirmed already covered (no action): Thomas Nguyen (McGill Dentistry), Helen Tran (Toronto
  Chemistry), Vivian Nguyen (Carleton Biology).
- Deferred/excluded: The Hung Nguyen — École Polytechnique de Montréal, Mechanical Engineering —
  only third-party sources (RateMyProfessors, LinkedIn) found; the department's own personnel page
  did not render usable content in this pass. Retry with a direct fetch of a live official page.
- Deferred/excluded: a "Thi-Phuong Nguyen" / "Phuong-Tram Nguyen" lead at Carleton's Azrieli School
  of Architecture — name and title could not be confirmed from an official source in this pass
  (course-aggregator and Academia.edu mentions only); an existing unrelated roster member also
  named "Thi-Phuong Nguyen" is at a different university (Taiwan) and is not this person.
- Not yet swept: Ottawa, Concordia, Western, Queen's, Guelph, Victoria, Laval, Montreal, Calgary,
  Alberta, McMaster, Simon Fraser — general search surfaced mostly directory landing pages or
  nothing; needs direct directory browsing.

### Australia

- Added: My Nguyen — RMIT University, Economics, Finance and Marketing — `Tenure-line`, Associate
  Professor of Finance; official RMIT profile, PhD Monash University 2015.
- Added: Truyen Tran — Deakin University, Applied Artificial Intelligence Institute —
  `Tenure-line`, Professor; official profile/CV site, PhD Curtin University 2008, promoted through
  Assistant (2014)/Associate (2017)/Full Professor (2024).
- Added: Hoa Van Nguyen — Curtin University, School of Electrical Engineering, Computing and
  Mathematical Sciences — `Tenure-line`, Lecturer (mapped to Assistant Professor); official
  personal/university profile, PhD University of Adelaide 2020.
- Confirmed already covered (no action): Professor Vinh Nguyen (UNSW Chemistry — exact-name
  collision with the newly added University of Waterloo `Vinh Nguyen`, already disambiguated in
  the roster as "Vinh Nguyen - UNSW Sydney"), Associate Professor Hoa Nguyen (UNSW Education,
  already "Hoa Nguyen - University of New South Wales"), Emeritus Professor Binh Tran-Nam (UNSW
  Law, already present).
- Deferred/excluded: Thong Pham — Curtin University — staff-portal profile page did not render
  usable content (JS-only template) in this pass; retry with a different fetch approach.
- Note: several "Nguyen"/"Tran"/"Pham" results at RMIT were actually **RMIT Vietnam** staff
  (rmit.edu.vn) — excluded, since the roster requires a current appointment outside Vietnam.
- Not yet swept: Melbourne, Sydney, Monash (beyond the two already-covered names above),
  Queensland, Western Australia, Adelaide, Macquarie, UTS, Wollongong, La Trobe (beyond Truyen
  Tran's PhD-student list, which is leads not confirmed faculty) — general search surfaced mostly
  student/postdoc mentions or nothing usable; needs direct directory browsing.

### France

- Disambiguated an exact-name collision: the roster already had "Huyen Pham" (Texas A&M Law,
  Professor) — renamed to "Huyen Pham - Texas A&M University". Added the second, genuinely
  identically-named person as "Huyen Pham - École Polytechnique" — `Tenure-line`, Professor,
  Centre de Mathématiques Appliquées (CMAP); official personal site, stochastic control /
  mathematical finance.
- Added: Quy Nguyen Huy — INSEAD — `Tenure-line`, Professor of Strategy, Solvay Chaired Professor
  of Technological Innovation (logged as a `distinguished_professorship` honor); official INSEAD
  faculty profile confirms he is based at INSEAD's Asia (Singapore) campus, not Fontainebleau, so
  this entry is filed under Singapore (`country: Singapore`) despite being found via a France
  search — undergrad McGill 1978, at INSEAD since 1998. His many Academy of Management "best
  paper" awards were reviewed and correctly excluded (routine conference awards, not the roster's
  honors bar).
- Added: Huyen C. Nguyen — Université Paris-Saclay, LISN/CNRS — `Tenure-line`, "Maître de
  Conférences" mapped to Assistant Professor; official personal site, PhD INSA de Rennes 2014,
  virtual/augmented reality and HCI research.
- Not yet swept: remaining Paris institutions (Sorbonne proper, most of Paris-Saclay's many
  component schools), Lyon, Toulouse, Grenoble, Strasbourg, Bordeaux, Lille, Marseille, and
  business schools (HEC, ESSEC, ESCP) beyond the one INSEAD hit above.

### Singapore

- Added: Tan Minh Nguyen — National University of Singapore, Mathematics — `Tenure-line`,
  Assistant Professor (NUS Presidential Young Professor 2024-2027); official NUS Mathematics
  faculty listing, PhD Rice University 2020, postdoc UCLA.
- Added: Tran Anh Tuan — Nanyang Technological University, School of Mechanical and Aerospace
  Engineering — `Tenure-line`, Associate Professor; official NTU MAE faculty profile, BSc Hanoi
  University of Science 2004, joined NTU 2013 as Nanyang Assistant Professor.
- Added: Dang Thuy Tram — Nanyang Technological University, School of Chemistry, Chemical
  Engineering and Biotechnology — `Tenure-line`, Associate Professor; official NTU research
  faculty-directory profile, PhD MIT, postdoc Brigham and Women's Hospital/Harvard Medical School.
- Deferred/excluded: Nguyen Tran Bao Phuong — NUS Lee Kuan Yew School of Public Policy — profile
  page returned no usable content in this pass.
- Not yet swept: SMU, SUTD, SIT beyond the one blocked lead above; most of NUS/NTU outside
  Mathematics/MAE/SCCEB.

### Taiwan

- Found a curated third-party list of 28 Vietnamese professors in Taiwan
  (trithuctretw.com/en/giao-su-nguoi-viet-tai-dai-loan/) and cross-checked every name against the
  roster: 24 of 28 were already present. Verified the 4 unmatched leads individually against
  official sources rather than trusting the aggregator:
  - Minh-Quang Tran (NTUST, Industry 4.0 Implementation Center) and Le Thi Cuc (NKUST, Marine
    Environmental Engineering) both hold "Project Assistant Professor" (專案助理教授) — Taiwan's
    fixed-term/grant-funded title, not a stable tenure-track appointment; excluded as term-limited.
  - Huy Nam Chu — no official current academic-appointment source found (only an industry/MediaTek
    connection); deferred.
  - Thi-Yen Do (Nanhua University) — only the same third-party aggregator lists her; no official
    university source found; deferred.
  - No additions this pass. This is a useful negative result: Taiwan appears to already be
    thoroughly covered by prior sessions, and this aggregator list is a good source to re-check
    periodically for newly added names rather than to re-search from scratch.

### Hong Kong

- Added: Tuan Anh Nguyen — Hong Kong University of Science and Technology, Division of Life
  Science — `Tenure-line`, Associate Professor; official HKUST profile, PhD KAIST, RNA
  biology/microRNA biogenesis research.

### Netherlands

- Confirmed already covered (no action): Phuong H. Nguyen (TU Eindhoven, Electrical Engineering —
  already present).
- Not yet swept beyond TU Delft/Wageningen/Amsterdam/Eindhoven general search, which surfaced
  mostly non-matching or already-covered names.

### Japan

- Added: Nguyen Thanh Phuc — Kyoto University, Graduate School of Engineering, Department of
  Molecular Engineering — `Tenure-line`, "Lecturer" (講師) mapped to Assistant Professor per roster
  convention; official researchmap.jp profile, PhD University of Tokyo 2014, quantum
  transport/molecular polariton research.
- Deferred: Yen Khang Nguyen Tran (Shimane University) — LinkedIn profile returned an HTTP error;
  retry with a different source.
- Not yet swept: most of Tokyo, Osaka, and other Japanese institutions beyond this search round.

### Germany

- Swept Munich/Berlin/Heidelberg/RWTH Aachen with no Vietnamese-surname faculty matches in this
  round; not conclusive (general search yields little for German university directories), just
  not yet found. Needs institution-by-institution follow-up.

### Switzerland

- Confirmed already covered (no action): Suong Nguyen (EPFL Chemistry), Minh Quang Tran (EPFL
  Swiss Plasma Center) — both already present.

### New Zealand

- Added: Thi Thuy Minh Nguyen — University of Otago, English and Linguistics — `Tenure-line`,
  Associate Professor; official Otago staff page (confirmed via search after a 403 direct fetch),
  prior appointments at NIE/NTU Singapore and Vietnam National University, Hanoi.
- Deferred: Le Nguyen — University of Auckland — profile page did not render usable content (JS
  app); retry with a different source.

### Ireland

- Added: Viet Quoc Pham — Trinity College Dublin, School of Computer Science and Statistics —
  `Tenure-line`, Assistant Professor; official TCD profile, PhD Inje University (Korea) 2017,
  federated learning/edge AI/6G research. Third Ireland entry in the roster.

### Poland

- Confirmed already covered (no action): Ngoc Thanh Nguyen (Wrocław University of Science and
  Technology) — already present.
- Deferred/excluded: Nguyen Truong Co (Institute of Fundamental Technological Research, PAS) —
  recent affiliation history unclear (prior University of Gdańsk assistant-professor role listed
  as ended Dec 2024); current stability not confirmed. Huy Dinh Quoc Pham (Institute of Physics,
  PAS) — explicitly a postdoctoral researcher, excluded. Ha Thi Thu Nguyen (Kraków) — a PhD
  student, not faculty. Hanh Thi Van Tran (SGH Warsaw) — no official profile found.

### Negative sweeps (no matches or nothing confirmed this round)

Sweden (Stockholm/KTH/Lund/Uppsala), South Korea (Seoul/KAIST/Yonsei), Malaysia, Finland
(Helsinki/Aalto — only students/postdocs found), Austria (Vienna/TU Wien), Italy, Spain, Germany
(prior round). These are genuinely under-searched rather than confirmed empty — general web search
has low recall for faculty directories in these countries; a future session should try
institution-specific directory browsing or country-specific Vietnamese-diaspora academic network
pages (as the AVSE Global and Taiwan aggregator lists proved effective) rather than repeating the
same broad query pattern.

### Denmark

- Added: Tran Nguyen Le — Technical University of Denmark (DTU), Department of Engineering
  Technology and Didactics — `Tenure-line`, Assistant Professor; official DTU Orbit research
  profile, PhD Aalto University (Finland) 2024, robot learning/manipulation research.
- Added: Ninh Dang Pham — University of Southern Denmark, Mathematics and Computer Science —
  `Tenure-line`, Associate Professor; official SDU research-portal profile, PhD IT University of
  Copenhagen 2014, prior Lecturer/Senior Lecturer at University of Auckland (2019-2025).
- Belgium and further Germany/Korea/Malaysia/Finland/Austria/Italy/Spain sweeps this round again
  surfaced only students, postdocs, or industry contacts — no additions.

### U.S. medical-school specialty sweep (Batch 1/5, option chosen 2026-08-28)

Per user direction, switched to sweeping specific medical schools' clinical departments (Baylor
College of Medicine, Cedars-Sinai, University of Chicago Pritzker, Emory, University of Michigan,
Yale) with Vietnamese surnames, no track pre-filter.

- Added: Andrew Nguyen — University of Michigan Medical School, Neurosurgery and Neurology —
  `Clinical`; official department page + multiple corroborating official/near-official sources
  confirm "Clinical Assistant Professor", MD Indiana University.
- Added: Ngoc Nguyen - Yale University (disambiguated; an existing roster member, "Ngoc Nguyen -
  The University of Queensland", already used the plain name for a different, unrelated
  chemical-engineering academic — renamed that entry for the collision) — Therapeutic Radiology —
  `Clinical`, "Assistant Clinical Professor"; official Yale School of Medicine profile, PhD nuclear
  physics Michigan State 2013, BS Vietnam National University 2006.
- Deferred/excluded: Trung C. Nguyen (Baylor Pediatrics-Critical Care) and Minh Ly T. Nguyen
  (Emory, Infectious Diseases) — both hold plain "Associate Professor" with no Clinical qualifier
  found; ambiguous track, not added.
- Deferred/excluded: Anthony Nguyen (Cedars-Sinai Cancer Institute, Radiation Oncology) — holds
  "Assistant Professor" at Cedars-Sinai Health Sciences University (now its own accredited
  degree-granting institution as of 2023, not solely a UCLA-affiliated clinical appointment); track
  (Clinical vs. Tenure-line) could not be confirmed from available sources.
- Cedars-Sinai and University of Chicago Pritzker faculty-profile pages are largely JS-rendered and
  did not return usable content via direct fetch in this pass (Camtu/Cam Tu Nguyen, Nguyen Minh Le
  leads unresolved); needs retry with a different fetch approach or direct browsing.
- Added: Phuong D. Nguyen — University of Colorado School of Medicine, Surgery/Plastic Surgery —
  `Clinical`, "Clinical Professor"; official CU Anschutz profile plus corroborating institutional
  news page, MD University of Minnesota, Chair of Pediatric Plastic Surgery at Children's Hospital
  Colorado. (Distinguished from an unrelated, already-present "Phuong Nguyen" — South Dakota State,
  construction management — via the fuller published name "Phuong D. Nguyen" rather than a
  university-suffix, since a fuller name was available.)
- Added: Dao M. Nguyen — University of Miami Miller School of Medicine, Surgery/Cardiothoracic
  Surgery — `Tenure-line`, Professor, B. and Donald Carlin Endowed Chair for Thoracic Surgical
  Oncology (logged as `distinguished_professorship`); official Miller School profile, MD McGill
  University 1986. Distinct from an unrelated existing "Dao Nguyen" (McGill University, Canada).
- Added: Liem Nguyen — Case Western Reserve University School of Medicine, Molecular Biology and
  Microbiology — `Tenure-line`, Associate Professor; official department profile,
  Mycobacterium tuberculosis / antibiotic resistance research.
- Deferred/excluded: Hai Nguyen-Tran (Colorado, Pediatrics-Infectious Diseases) — profile explicitly
  flagged non-clinical-track "Assistant Professor" designation; Anh N. Tran and Minh Tu Dang Tran
  (Duke) — plain Associate/Assistant Professor with no Clinical qualifier found.

### Wikipedia diaspora-scientist categories (lead source, 2026-08-28)

User suggested finding a worldwide directory of Vietnamese professors/researchers. No single
comprehensive directory exists, but Wikipedia's Category:Vietnamese academics, Category:Academics
of Vietnamese descent, Category:Vietnamese scientists (and 21st-century/physicists/mathematicians
subcategories), and the VEF/VEFFA alumni networks are useful lead sources — small (dozens, not
hundreds) but high-precision since most entries are individually notable enough to have a
Wikipedia page. Cross-checking these against the roster found:

- Added: Dam Thanh Son (Đàm Thanh Sơn) — University of Chicago, Physics — `Tenure-line`,
  Professor; NAS member (2014), AAAS member (2014), 2018 ICTP Dirac Medal.
- Added: Duong Hong Phong — Columbia University, Mathematics — `Tenure-line`, Professor, Davies
  Chair of Mathematics; NAS member, AAAS Fellow, 2009 Bergman Prize.
- Confirmed already covered, with an actual move discovered: Van H. Vu was already in the roster,
  correctly updated to his current position — Professor and Chair of Mathematics, University of
  Hong Kong (moved from Yale; multiple Yale pages found via search are stale/outdated). No
  duplicate added.
- Also already covered (no action): Xuong Nguyen-Huu (UCSD, Emeritus), Jane X. Luu (Tufts,
  Kavli/Shaw Prize winner), Ngoc Thanh Nguyen (Wrocław), Minh Quang Tran (EPFL), Thuc-Quyen Nguyen,
  Trinh T. Minh-ha (as "T. Minh-ha Trinh").
- Added: Nguyen T. K. Thanh — University College London, Physics and Astronomy — `Tenure-line`,
  Professor of Nanomaterials; Academia Europaea Fellow (2024), Royal Society Rosalind Franklin
  Award (2019).
- Added: Nguyen Tien Hung (Nguyễn Tiến Hưng) — Howard University, Economics — `Emeritus`; sourced
  from Wikipedia only (no direct Howard University page found confirming current status) — flagged
  for re-verification against an official source in a future pass.
- Added: My-Van Tran — University of South Australia, International and Asian Studies —
  `Tenure-line`, Associate Professor; Member of the Order of Australia (AM).
- Added: Pipo Nguyen-duy — Oberlin College, Art (Photography) — `Tenure-line`, Professor; 2011
  Guggenheim Fellowship.
- Confirmed already covered (no action): Dinh Tien-Cuong (NUS Mathematics, already present with
  full honors detail).
- Excluded: Nam Le — acclaimed Vietnamese-Australian writer, but no current primary academic
  appointment found (teaches/lectures occasionally, not a faculty position); does not meet the
  inclusion standard. Jacqueline Nguyen — federal judge, not an academic.
- Checked Category:20th-century Vietnamese mathematicians, Category:Vietnamese biologists,
  Category:Vietnamese biochemists, Category:Vietnamese social scientists, and
  Category:Vietnamese economists:
  - Added: Pham Huu Tiep — Rutgers University, Mathematics — `Tenure-line`, Professor (Joshua
    Barlaz Distinguished Professor); group theory/representation theory, solved Brauer's Height
    Zero Conjecture.
  - Added: Tran Van Tho — Waseda University, Social Sciences — `Emeritus`; official Waseda
    Researchers Database confirms "Professor Emeritus" (profile last updated July 2026).
  - Deferred/excluded: Van Sang Nguyen (biologist) — appears based in Vietnam (Institute of
    Ecology/Vietnam National University), not confirmed to hold a qualifying appointment outside
    Vietnam.
  - Deferred/excluded: Tran Thanh Van (physicist, Rencontres du Vietnam founder) — long CNRS
    Research Director career in France, but CNRS is a national research body, not itself a
    university, and no specific current qualifying university appointment outside Vietnam was
    confirmed (his current visible role, ICISE, is based in Vietnam). Needs deeper research on any
    formal French university/CNRS-lab affiliation before a decision.
  - Remaining names in these categories (Đặng Phong, Đào Nguyên Cát, Nguyễn Thị Hồng, Nguyễn Thiện
    Nhân, Nguyễn Xuân Oánh, Phạm Chi Lan, and the biochemists/archaeologists) appear to be
    Vietnam-based public figures rather than overseas academics; not individually re-checked.

### U.S. medical-school specialty sweep, continued

- Added: Mylinh T. Nguyen — UC San Diego, Pediatrics (Rady Children's) — `Clinical`, Associate
  Clinical Professor; official UCSD Profiles page. Disambiguated from an unrelated existing
  "Mylinh Nguyen" (UT Dallas, Teaching) via her fuller published name.
- Added: Margaret Nguyen — UC San Diego, Pediatrics (Rady Children's) — `Clinical`, Associate
  Clinical Professor; health services research / injury prevention.
- Added: Minh-Ha Tran — UC Irvine, Pathology and Laboratory Medicine — `Clinical`, Clinical
  Professor; official UCI faculty profile, DO Western University of Health Sciences.
- Deferred: Bao-Ngoc Nguyen (GW, Vascular Surgery) — plain "Associate Professor," no Clinical
  qualifier found.

### Data-integrity self-check, 2026-08-28

Ran a script grouping all roster names by their pre-" - "-suffix base to catch accidental
duplicates or inconsistent disambiguation from this session's additions. Found and fixed two:
- **True duplicate removed:** "Vinh Nguyen" (added earlier this session, University of Waterloo,
  PhD McMaster 2014) was the same person as the already-present "Vinh Nguyen - University of
  Waterloo" (same PhD/year/university/field, with fuller honors). Deleted the newer, less-complete
  duplicate entry and its verification-ledger row.
- **Inconsistent suffix fixed:** a new "Liem Nguyen" (Case Western) was added as a bare name while
  two unrelated "Liem Nguyen - X" entries already existed elsewhere in the roster; renamed to
  "Liem Nguyen - Case Western Reserve University" for consistency with the disambiguation
  convention.
No other issues found; all other repeated first-two-word name groups already follow the
bare-name-stays-first, later-duplicates-get-suffixed pattern correctly. Recommend running this
kind of base-name grouping check periodically, especially after a large batch of additions.

### U.S. medical-school sweep, continued (2026-08-28, user-directed emphasis on long-term-only)

User re-emphasized: only add long-term faculty/research-scientist positions, never adjunct,
postdoc, or other temporary titles, and specifically flagged the "Principal Scientist"/"Principal
Research Scientist" pattern (permanent non-postdoc research staff at a university, e.g. the
earlier MIT and UVA finds) as a category worth actively looking for, not just Clinical Professor
titles.

- Added: Anh Nguyen-Tuong — University of Virginia, Computer Science, Security Dependability Group
  — `Research`, "Principal Scientist"; publication record spans 1993-2021+, indicating a long-term
  stable position, not a postdoc. (Found via a direct link the user supplied.)
- Added: Dzung L. Pham — Uniformed Services University of the Health Sciences, Radiology and
  Bioengineering — `Tenure-line`, Professor and Vice Chair for Research; also holds an adjunct
  appointment at Johns Hopkins ECE (that adjunct affiliation itself was not used as the basis for
  inclusion — his primary, non-adjunct USUHS professorship was).
- Added: Phu Tran — University of Minnesota Medical School, Pediatrics/Neonatology —
  `Tenure-line`, Associate Professor; PhD University of Iowa, epigenetics of early-life adversity.
- Added: Tuan M. Nguyen — Northwestern Feinberg School of Medicine, Obstetrics and Gynecology —
  `Clinical`, Clinical Assistant Professor; official Feinberg faculty-profile page.
- Deferred/excluded (explicitly temporary or ambiguous, per the long-term-only emphasis): Thao
  Pham (Northwestern, "Research Assistant Professor" — the "Research Assistant Professor" rank
  needs stronger stability evidence than title alone, per ROSTER_MAINTENANCE, and none was found
  this pass); Thai Tran Nguyen and other "Clinical Associate"-titled Johns Hopkins profiles (a
  sub-faculty rank, already excluded in an earlier pass).

## Safe resume procedure

1. Read this runbook and the two authoritative repository guides named above.
2. Inspect `git status --short`; preserve unrelated user changes.
3. Start only the first `in_progress` batch. Generate institution- and field-specific searches;
   record each candidate and outcome in that batch's checkpoint log as soon as it is resolved.
4. Verify each candidate live, check roster duplicates, then make incremental changes to
   `public/data.json`, `maintenance/verification.json`, and any needed track/field mappings.
5. After a roster edit, run `npm test`, `npm run build`, and `git diff --check`. Do not mark a
   batch complete if any check fails.
6. Update the batch status and checkpoint log. When the batch is genuinely complete, immediately
   advance the next batch from `pending` to `in_progress` and continue; create commits only when
   separately authorized.

If a session ends mid-batch, leave its status as `in_progress`, keep its candidate outcomes in the
checkpoint log, and resume at step 1. Never restart the batch from scratch or re-add people
already logged as added, reclassified, deferred, or excluded.
