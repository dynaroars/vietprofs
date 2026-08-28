# Extension-track research runbook

This is the durable work state and resume guide for expanding VietProfs with stable
`Research` and `Clinical` appointments, and stable Professor of Practice (or equivalent)
appointments recorded as `Teaching`. It is intentionally sequential: complete and validate one
batch before starting the next. Do not run batches in parallel or treat a found name as an
approved entry.

Read this file, [`ROSTER_MAINTENANCE.md`](../ROSTER_MAINTENANCE.md), and
[`README.md`](../README.md) before resuming. `ROSTER_MAINTENANCE.md` is authoritative if this
runbook conflicts with it.

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
| 3 | `pending` | United States | Professor of Practice / equivalent → Teaching |
| 4 | `pending` | Outside the United States and Vietnam | Professor of Practice / equivalent → Teaching |
| 5 | `pending` | United States | Clinical |
| 6 | `pending` | Outside the United States and Vietnam | Clinical |

Before changing a batch to `complete`, finish its candidate queue, record excluded/borderline
people below, and run the validation checklist. Immediately advance the next batch from `pending`
to `in_progress` and continue its research without waiting for confirmation. Keep a completed
batch as a reviewable unit if a commit is later requested.
If a candidate cannot be resolved, record it as deferred with the missing proof; do not block the
rest of the batch indefinitely.

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

### Batch 2 — International Research

- Not started.

### Batch 3 — U.S. Practice → Teaching

- Reclassified: Vu Tran — University of Chicago — `Teaching`; exact rank retained as Associate
  Professor of Practice in the Arts, 2026-08-28.
- Added: Daniella Zalcman — Tulane University — `Teaching`; exact rank retained as Professor of
  Practice, 2026-08-28.
- Deferred/excluded: Lien Nguyen — Merrimack College’s current directory lists an adjunct role;
  do not add as a practice appointment.

### Batch 4 — International Practice → Teaching

- Not started.

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

### Batch 6 — International Clinical

- Not started.

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
