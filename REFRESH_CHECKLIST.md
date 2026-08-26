# Periodic full-roster refresh — progress checklist

Total entries in `public/data.json`: 772. Batches are consecutive index ranges (0-based),
~38-39 people each. Check off a batch only after it has been verified per
ROSTER_MAINTENANCE.md §"Periodic full-roster refresh", committed, and pushed.

- [x] Batch 01: indices 0-38
- [x] Batch 02: indices 39-77
- [x] Batch 03: indices 78-116
- [x] Batch 04: indices 117-155
- [x] Batch 05: indices 156-194
- [x] Batch 06: indices 195-233
- [x] Batch 07: indices 234-272
- [x] Batch 08: indices 273-311
- [x] Batch 09: indices 312-350
- [x] Batch 10: indices 351-389
- [x] Batch 11: indices 390-428
- [x] Batch 12: indices 429-467
- [x] Batch 13: verified through "Hung Dinh Nguyen" (Nanyang Technological University) — the person
      immediately following "Vu N. Duong" in the original ordering. 2 people were removed during
      this batch (Quynh Camthi Nguyen, Vu N. Duong — see notes), so raw index numbers no longer
      line up with earlier batches. From here on, track progress by **last verified person's
      name** instead of index, and pick the next ~39 people in file order after that name.
- [ ] Batch 14: continue in `public/data.json` file order starting right after "Hung Dinh Nguyen"
      (Nanyang Technological University)
- [ ] Batch 15
- [ ] Batch 16
- [ ] Batch 17
- [ ] Batch 18
- [ ] Batch 19
- [ ] Batch 20

## Notes / leads found while working (not yet added)

- Batch 13: Minh Khuong Vu (National University of Singapore, Lee Kuan Yew School of Public
  Policy) — currently recorded as `track: Teaching`. Search results are mixed: some (older) hits
  call him a full-time "Practice Professor" at the main school; one shows him listed under the
  Institute of Water Policy's "affiliate and adjunct faculty" page path, and he also has an active
  faculty role at Fulbright University Vietnam. Couldn't confirm current full-time/continuing
  status at NUS directly — both his main LKYSPP profile page and the affiliate-listing page are
  JS-rendered SPAs that returned no server-side content, and the Fulbright page 403'd. Left
  unchanged; worth a direct check (e.g. via a JS-capable fetch, or emailing/checking a syllabus)
  of whether his primary appointment is still NUS or has shifted to Fulbright/Vietnam.
- Batch 12: index 442 (Khanh-Hoa Tran-Ba, Towson) — his official page lists "Seventeenth Jess &
  Mildred Fisher Endowed Chair in the Biological and Physical Sciences (2022-2025)"; Towson's
  chair program rotates on 3-year terms, so this may already have lapsed by 2026. Not added as a
  distinguished_professorship honor pending confirmation he's still the current holder.
- Batch 12: index 447 (Long D. Tran, UTHealth Houston Dentistry) — official page lists "PharmD,
  DDS" credentials but names no institution or year for either; not enough to add a sourced
  otherDegrees entry per the no-inference rule. Worth a follow-up search for his CV.
- Batch 12: index 467 (Lan Chi Nguyen, U Houston Optometry) — search snippets (not a page I could
  directly fetch; aaopt.org returned 403) suggest an EdD (2022) and FAAO (Fellow, American
  Academy of Optometry) status. Neither added without a primary source — worth a direct fetch of
  her CV or the AAO diplomate page from a different network/UA.
- Batch 12: index 462 (was "Van T. Nguyen", University of Dayton) — corrected name to "Tam V.
  Nguyen" per his official UD directory page and personal site (vantam.github.io); the old name
  had first/middle-initial order reversed relative to how he actually publishes. No duplicate
  entry existed under "Tam" so this was a safe in-place rename, not a merge.
- Batch 11: index 405 (Lan Ngo, LMU) — track corrected Tenure-line→Teaching, rank
  Professor→Teaching. Official scholars.lmu.edu profile states "Clinical Assistant Professor"
  (since 2018), not "Professor"; LMU's Faculty Handbook confirms Clinical Faculty is
  non-tenure-track full-time. This was a significant pre-existing data error, not a rank change
  over time.
- Batch 11: index 421 (Thao Bui, Queens College CUNY) — profileUrl remains the department's
  faculty-staff list page; no individual profile page exists for her there. Added her personal
  site (sites.google.com/view/thaobui/home) as websiteUrl instead.
- Batch 11: index 292/306/307-style blocked-fetch pattern recurred for Kim-Phuong Le (Rutgers,
  SSL cert error on chem.rutgers.edu) — resolved this time via curl -k rather than left as an
  open lead.

- Batch 10: Tin Nguyen (originally listed "Tin Nguyen - Auburn University", index ~363) —
  removed as a duplicate. He moved Auburn -> Wayne State University and was promoted to
  Professor; a correct, up-to-date "Tin Nguyen - Wayne State University" entry already existed
  earlier in the roster (added in a prior batch as an incidental new-candidate lead without the
  old Auburn entry being cleaned up). Confirm no other similar stale-duplicate pairs exist from
  earlier batches' incidental additions.
- Batch 10: Trent Nguyen (CSUF Human Services) — could not find him on the department's
  current full-time or part-time faculty listings; only source is an old (~2004) Daily Titan
  article describing him as a new assistant professor. Left unchanged (existing entry, not
  newly added) pending a clearer current source — needs direct confirmation he's still on
  faculty, and if so, at what rank.
- Batch 10: Truyen D. Nguyen (CSUF Human Services) — profileUrl swapped to
  itwebstg.fullerton.edu/husr/faculty/TruyenNguyen.php (a staging-looking but live URL; no
  cleaner production URL found). Note the old portraitSource file was literally named
  "TrentNguyen.jpg" even though this is a different, distinct person from Trent Nguyen per two
  separate search-corroborated bios (different PhD focus/backstory) — likely just a scraper
  filename mixup, not a duplicate identity, but worth a second look.
- Batch 10: Nga Nguyen (CSUF Anthropology, primatologist) — anthro.fullerton.edu and
  hss.fullerton.edu both returned HTTP 500 site-wide during this pass (not specific to her
  page); left profileUrl unchanged since her appointment is well-corroborated via search
  (Fulbright Scholar, ResearchGate, etc.) and the outage looks transient. Re-check the URL
  resolves on a future pass.
- Batch 10: Boone Nguyen (CSULA, Lecturer/Teaching) — pre-existing entry; "Lecturer" title
  alone doesn't confirm the full-time/continuing permanence the Teaching track requires, and no
  source found explicitly stating full-time/continuing status. Left unchanged (not newly
  added) but worth verifying his appointment type directly on a future pass.

- Batch 09: index 336 (Hung M. Nguyen, George Mason) — profileUrl remains a PDF
  (faculty-emeriti.pdf) since no cleaner official GMU Schar School page was found; search
  corroborates Professor Emeritus of Government and International Relations. Worth swapping to
  a proper page if one turns up later.
- Batch 09: index 346 (Tina I. Bui-Bullock, UAB Pathology) — profileUrl swapped from a news
  article to the official pathology faculty list page (https://www.uab.edu/medicine/pathology/faculty),
  which does list her but has no clickable per-person link; there may not be an individual
  profile page for her yet since she just joined.

- Batch 05: index 176 (Viet Tuan Pham, Susquehanna) — current profileUrl uses an old CMS
  URL pattern; couldn't confirm liveness directly (403/no-fetch). Possible live alternates seen
  in search: https://www.susqu.edu/live/profiles/3271-viet-tuan-pham or
  https://www.susqu.edu/profiles/phamv/ — verify and swap in on a future pass.
- Batch 05: index 191 (Khanh Le, Queens College CUNY) — profileUrl is still his personal site
  (mykle85.com); official department profile confirmed live at
  https://www.qc.cuny.edu/academics/lcd/faculty/ but that's a list page, not a person-specific
  URL — find the exact profile URL and switch profileUrl to the official page, moving the
  personal site to websiteUrl.
- Batch 05: index 161 (Long Pham, TAMU-Corpus Christi) — rank corrected Professor→Associate
  Professor based on strong multi-source search corroboration (tamucc.edu directory content
  itself could not be fetched directly after repeated timeouts). Worth a direct-fetch
  re-confirmation later. Search also surfaced possible additional degrees (MS Accountancy 2023,
  MBA 2024) that were NOT added — too speculative from an aggregated search summary without
  primary-source confirmation.
- Batch 06: index 217 (Trang T.H. Nguyen, Arkansas State) — profileUrl (department
  faculty-staff listing page) now 404s, and Arkansas State appears to have restructured its
  Beck College of Sciences and Mathematics site; the new consolidated faculty-and-staff page
  (https://www.astate.edu/colleges/beck-college-of-sciences-and-mathematics/faculty-and-staff.html)
  does NOT list her either. Her personal site (https://sites.google.com/view/trang-t-h-nguyen/)
  still states she's Assistant Professor of Microbiology at Arkansas State, and also mentions a
  possibly-concurrent "Assistant Professor, Integrated Sciences, Fulbright University Vietnam"
  role. Left profileUrl and entry unchanged pending a clearer official source — needs a direct
  check (e.g. an Arkansas State directory search or department contact page) to confirm she's
  still on faculty there before either fixing the URL or removing the entry.
- Batch 07: index 262 (Yen Kim Nguyen, University of Washington) — profileUrl was a 2022 news
  article, not a directory page. The current UW Asian Languages & Literature faculty listing
  (https://asian.washington.edu/people/faculty) no longer shows her; the department's Vietnamese
  instructor slot now appears to be held by a different person (Ha Nguyen,
  https://asian.washington.edu/people/ha-nguyen). No evidence found of her moving elsewhere.
  Left entry and profileUrl unchanged rather than guess she's departed — needs a direct check
  (e.g. UW directory search, or contacting the department) to confirm whether she's still on
  faculty before removing her or updating the URL.
- Batch 08: index 279 (Tan Van Nguyen) and index 280 (Christopher Pham), both San Jose State EE
  — both confirmed live as "Lecturer Emeritus" on the department's emeriti page. The Emeritus
  track requires "a formally conferred emeritus/emerita title following a tenure-line career";
  "Lecturer" is usually non-tenure-track. Left both entries unchanged (pre-existing, not newly
  added) since it's unclear whether SJSU EE's historical "Lecturer" title was actually
  tenure-line for these two — needs someone to check SJSU's title history/policy before deciding
  whether to keep, retitle, or remove.
- Batch 08: index 292 (Hau Pham, Boston University, Surgery, Emeritus/MD) — original profileUrl
  was a dead PDF that never mentioned him. Search turned up what looks like two different "Hau
  Pham"s at BU: a DPM podiatric surgeon (bumc.bu.edu/camed/profile/hau-pham/, titled "Emeritus
  Assistant Professor") and the MD general surgeon the existing record's `mdInstitution: Boston
  University` implies. Couldn't confirm whether these are the same person, and the DPM/podiatry
  degree doesn't match an MD. Left the record unchanged pending a source that clearly
  distinguishes (or merges) these two identities.
- Batch 08: index 278 (Long Thai Bui / David Bui, Saint Mary's College of California) — rank
  corrected from "Professor" to "Assistant Professor". No page explicitly states his rank; the
  correction is inferred from his PhD completion date and hire date both being 2024 (full
  Professor in year one is not realistic), and from "Professor" likely being scraped from a
  generic "About Professor {Name}" boilerplate string used by the Pure/Elsevier profile system
  at scholars.stmarys-ca.edu. Worth re-confirming directly once his rank is explicitly stated
  somewhere.
- Batch 08: index 306 (Hieu Tran, UMass Boston) and index 307 (Matthew Bui, University of
  Michigan) — official-looking profile pages exist and were corroborated via search, but both
  blocked direct WebFetch/curl (403) throughout this batch; details entered were sourced from
  search-result summaries of their own CVs/bios rather than a direct primary-source fetch. Worth
  a direct re-fetch later to fully confirm.
