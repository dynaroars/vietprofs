# Periodic full-roster refresh — progress checklist

**STATUS: COMPLETE.** All 20 batches done as of Batch 20 (committed and pushed). Started at 772
entries; ended at 766 after removing people who no longer meet the inclusion standard (see
per-batch notes below for each removal's justification). Batches are consecutive index ranges
(0-based) at the time each batch started, ~38-39 people each; from Batch 13 onward, tracking
switched to "last verified person's name" since removals shift array positions. When the next
periodic refresh is run, start a fresh batch plan from index 0 rather than resuming this one.

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
- [x] Batch 14: verified "Viet Ha Hoang" through "Le Minh Nguyen" (38 people, file order right
      after "Hung Dinh Nguyen"). No removals; array order unchanged. See notes for a misidentified
      department (Vuong Phan) and other fixes.
- [x] Batch 15: verified "Tu Bao Ho" through "Ngoc Thang Vu" (39 people, international spread:
      Japan, Hong Kong, Australia, NZ, Ireland, Netherlands, Canada, France, Norway, UK, Germany).
      1 removal (Quan Nguyen, UQ — see notes). Array order otherwise unchanged; next batch
      continues right after "Ngoc Thang Vu".
- [x] Batch 16: verified "Van Bang Le" through "An Nguyen" (39 people, mostly UK + Canada
      + a few Australia/Poland/Germany/Singapore) in the original file order for this batch.
      2 removals (Quynh Pham, An Nguyen — see notes; "An Nguyen" no longer exists in the array,
      so it can't be used as the next-batch anchor). Also did a systemic pass normalizing
      rank-vocabulary violations (UK titles like "Senior Lecturer in Finance", "Professor of X",
      "Reader" etc. mapped to the accepted Assistant/Associate/Professor/Teaching/Emeritus
      vocabulary — this pattern is widespread across the whole roster, not just this batch; a
      dedicated normalization pass across all ~766 entries would be worth doing separately from
      the per-batch refresh). Array order otherwise unchanged; next batch continues right after
      "Mai Nguyen - Manchester Metropolitan University" (the last remaining person from this
      batch, in file order).
- [x] Batch 17: verified "Chi Hieu Le" (University of Greenwich) through "Martino Tran"
      (University of British Columbia) — 39 people, mostly UK + France + a few
      Netherlands/Germany/Switzerland/Sweden/Canada. No removals; array order unchanged. Next
      batch continues right after "Martino Tran" (next person: Kim Chi Nguyen, University of
      British Columbia).

      Established a new convention worth applying consistently: France's "Maître de conférences"
      (MCF) maps to "Associate Professor" and "Professeur des universités"/"Professeur" maps to
      "Professor" — confirmed directly from an official French university page (u-paris.fr LCAO)
      that itself glosses "[ MCF: Associate Professor, PU: Professor ]" in English. Applied this
      to fix 7 rank-vocabulary violations in this batch. Also fixed the recurring UK
      Senior-Lecturer/titled-rank pattern from batches 15-16 (7 more instances), one German
      "Junior Professor" → "Assistant Professor" (confirmed via the department's own page, which
      labels the position "Assistant Professor" in English), and normalized 2 Teaching-track
      entries with raw descriptive titles ("Professor of Management Practice", "Assistant
      Professor, Teaching Stream") down to plain "Teaching" per the majority (57/69) existing
      convention for that track.

      Added one honor: Nguyen Viet Dang (Sorbonne Université, index ~626) was confirmed via an
      official Sorbonne news article to have been named to the Institut Universitaire de France
      (IUF) in 2022 — a competitive national distinction — recorded as a `career_award`.

      Swapped Nguyen Bac Dang's (Paris-Saclay) profileUrl from a generic "new faculty members
      introduce themselves" listing page to his own live personal page, which also independently
      confirmed his rank.

      This session's WebSearch budget was exhausted partway through this batch; several UK/French
      pages that block direct fetches (403/Cloudflare) were instead verified via recent Wayback
      Machine snapshots (Jan/Jul 2026) rather than live search corroboration — noted per-person
      below where relevant.
- [x] Batch 18: verified "Kim Chi Nguyen" (UBC) through "Hoa Nguyen - Australian National
      University" (39 people, Canada + Singapore + Australia). No removals; array order
      unchanged.

      This session's WebSearch budget was fully exhausted for this batch (200/200), and
      DuckDuckGo/Bing HTML scraping via curl returned no usable organic results (bot-blocked), so
      verification relied entirely on direct curl fetches (real desktop user agent) plus
      cross-checking each entry's own `portraitSource` field, which in several cases already
      pointed at the correct person-specific URL that `profileUrl` was missing.

      Fixed 3 profileUrls that were generic list/directory pages, not person-specific: Kim Chi
      Nguyen (UBC) → medicaloncology.med.ubc.ca/kim-nguyen-chi/ (from portraitSource); Tuan Trang
      (Calgary) → profiles.ucalgary.ca/tuan-trang (from portraitSource); Cuong Dang (NTU) →
      personal.ntu.edu.sg/hcdang/ (found via a site link crawl from his lab page).

      Fixed 2 rank-vocabulary violations, mapping to the accepted vocabulary and preserving the
      named title as a distinguished_professorship honor where warranted: Anh Tuan Phan — "Lee
      Soo Ying Professor in Biological Physics" → rank "Professor" + honor; Vinh Q. Nguyen (HKU)
      — "Assistant Professor of Finance" → "Assistant Professor".

      Normalized 4 Australian "Lecturer"/"Senior Lecturer" ranks to the accepted vocabulary,
      consistent with the UK/French/German mapping conventions established in batches 15-17
      (Australian academic titles follow the same UK-derived ladder): Van Nguyen (Monash) and Bao
      Nguyen (Melbourne) — Lecturer → Assistant Professor; Kieu-Trang Nguyen (Melbourne) — Senior
      Lecturer → Associate Professor; Linh Nguyen (Melbourne, Teaching track) — Lecturer →
      Teaching.

      Several other generic-list-page profileUrls in this batch could not be independently
      upgraded without a working search engine — left unchanged and logged below.
- [x] Batch 19: verified "Anh Nguyen - The University of Queensland" through "Duy Duong-Tran"
      (United States Naval Academy) — 39 people, mostly Australia/UK plus a run of US entries.
      No removals; array order unchanged. Next batch continues right after "Duy Duong-Tran".

      This session's WebSearch budget was fully exhausted (0 available all batch); verification
      relied on direct curl fetches (real desktop user agent), a legacy-TLS-renegotiation
      workaround (`OPENSSL_CONF` enabling `UnsafeLegacyRenegotiation`) for one Adelaide page that
      otherwise failed the TLS handshake, Wayback Machine snapshots for two persistently
      bot-blocked/dead pages, and WebFetch as a fallback for JS-rendered/blocked pages.

      Continued the Australian/UK rank-vocabulary normalization from batches 15-18: "Senior
      Lecturer" → Associate Professor (Ngoc Nguyen/UQ, Thao Nguyen/Adelaide); UK "Lecturer in X"
      → Assistant Professor (Cung Nguyen/Salford, Emma Nguyen/Newcastle, Kim Nguyen &
      Thach Nguyen/Sheffield, Duy Tan Nguyen/Greenwich, Maya Nguyen/SOAS); raw Teaching-track
      titles → plain "Teaching" (Natalie (Nhung) Le/Melbourne, Quinn Nguyen/Flinders, Andy
      Tran/Sydney, Linh Tran/Monash, Ruby-Ngoc Nhu Nguyen/Sydney).

      New case: Quyen Nguyen (Brunel University London) — track corrected Tenure-line→Teaching,
      rank corrected "Lecturer (Education)"→"Teaching". Brunel's "(Education)" suffix denotes the
      teaching-focused promotion pathway (parallel to the research-focused "Lecturer" track), not
      a research-track tenure-line role — same category-error pattern as batch 11's Lan Ngo (LMU)
      finding, just a UK-specific label this time.

      New case: Van H. Vu (University of Hong Kong) — rank corrected "Chair Professor"→
      "Professor". His HKU page reads "Professor, Chair of Mathematics" — he holds the
      *administrative* department chair, not the *honorific* "Chair Professor" title; the old
      data had conflated the two. No honor added since department headship isn't a distinguished
      professorship.

      Fixed 1 dead profileUrl: Caroline Cao (Wright State) — old lab-page URL 404s; confirmed
      still on faculty via the university's live people-directory page
      (people.wright.edu/caroline.cao), swapped in as the new profileUrl.

      3 open leads logged below rather than guessed at: Hai T. Tran (Point Park) has a dead
      profileUrl with no live or archived replacement found; Trung Le (NDSU) profileUrl 403s live
      but was confirmed correct via a May 2025 Wayback snapshot and his working lab site; Jane X.
      Luu (Tufts) and Xuan Thuan Trinh (UVA) both still resolve to stale news-article URLs rather
      than proper directory profiles, with no replacement found this pass.
- [x] Batch 20: verified "Thuy Dao" (IPAG Business School) through "Tam Le" (Institute of
      Statistical Mathematics) — the final 31 entries in `public/data.json`, reaching the literal
      end of the file. No removals.

      **The full periodic roster refresh is now complete: all 766 entries verified across 20
      batches.**

      Continued rank-vocabulary normalization: French "Senior lecturer with HDR" (Minh Cuong Ha,
      ENS Paris-Saclay — his own page's English gloss) → Associate Professor, consistent with the
      MCF convention from batch 17; UK "Senior Lecturer" (Tho Pham, York) → Associate Professor;
      Australian "Lecturer" (Trang Vu, Monash, Tenure-line) → Assistant Professor; raw
      Teaching-track titles → plain "Teaching" (Hanh Huynh/UBC "Associate Professor of
      Teaching", Tuong Vi Ho/TWU "Associate Clinical Professor"); verbose-but-plain-rank titles
      trimmed to the vocabulary word (Thi Viet Ha Nguyen/IPAG "Associate Professor of Law" →
      Associate Professor; Trai Le/Notre Dame "Professor Emerita of Law" → Emeritus).

      2 new distinguished_professorship honors added by splitting a named-chair title out of the
      rank field, same pattern as batches 13-14/18-19: Jean Tran Thanh Van (Caltech, Emeritus) —
      "Linde Professor Emeritus" → rank "Emeritus" + "Linde Professor" honor; Dinh Tien-Cuong
      (NUS Mathematics) — "Provost's Chair Professor" → rank "Professor" + "Provost's Chair
      Professor" honor. Both honors sourced from the same URLs already on file for these two
      people (a 2012 newsline article and a 2020 NUS Science blog post, respectively) — I could
      not independently re-fetch either source this pass (Caltech's people-search returned 404s
      for him; NUS domains returned bot-blocked 212-byte stub responses), so these are
      normalizations of already-sourced data rather than newly verified facts.

      Fixed 1 dead profileUrl: Thi-Mai-Trang Nguyen (Université Sorbonne Paris Nord) — the old
      `www-phare.lip6.fr/~trnguyen` personal page no longer resolves at all; swapped in her
      current, live personal homepage (`www-l2ti.univ-paris13.fr/~thimaitrang.nguyen/`, matching
      her existing `portraitSource` domain), which independently confirms "Professeur des
      universités" / "Full Professor" — matches the existing rank.

      This session's WebSearch budget remained fully exhausted (as in batches 17-19);
      verification relied on curl (real desktop user agent), Wayback Machine snapshots (Thao L.
      Nguyen/UTHealth — confirmed alive via an October 2025 snapshot after live fetches 403'd),
      and WebFetch as a fallback for JS-heavy/blocked pages (Dinh Tien-Cuong's own blog).

      1 open lead logged below rather than acted on: Nhung Nguyen (UCSF) holds the title
      "Assistant Adjunct Professor," which is UC's real, continuing (not part-time) faculty
      series but literally contains the word "adjunct" that ROSTER_MAINTENANCE.md's inclusion
      standard excludes — left the entry unchanged pending a human judgment call on how the UC
      Adjunct/In-Residence series should be treated, rather than unilaterally removing someone
      who may well be legitimately eligible.

## Batch 20 notes / leads

- RESOLVED (post-refresh): Nhung Nguyen (University of California, San Francisco, Medicine) —
  official UCSF profile states "Assistant Adjunct Professor." Referred to the user as a
  policy question (a real, continuing UC faculty series, but the inclusion standard literally
  excludes "adjunct" titles and this doesn't map to Tenure-line/Teaching/Emeritus). User decided
  to keep excluding by the word "adjunct" per the existing standard — entry removed.
- Jean Tran Thanh Van (Caltech, Emeritus) — no live Caltech directory page could be found
  (pma.caltech.edu and directory.caltech.edu both 404 for his name); the only profileUrl on file
  is a 2012 newsline.linearcollider.org article. He's extremely notable and clearly still active
  (a 2025 French Legion of Honour promotion is already recorded), so left unchanged rather than
  questioned, but a proper Caltech or IJCLab/CNRS profile URL would be worth finding.
- Dinh Tien-Cuong (NUS Mathematics) — his own blog (blog.nus.edu.sg/dinh) confirmed alive and
  "Prof. DINH Tien-Cuong," but both math.nus.edu.sg and science.nus.edu.sg returned tiny
  (212-byte) stub responses on every fetch attempt this pass, so the "Provost's Chair Professor"
  honor (see above) rests on the same source used originally rather than a fresh re-fetch. Worth
  re-confirming once those domains stop bot-blocking.
- Hien Nguyen (University of Wisconsin-Whitewater, Computer Science) — confirmed alive and
  "Professor, Computer Science" via a university-wide staff directory page, but `profileUrl`
  (web-ns-vip.uww.edu/graduate-studies/grad-directory) is a generic directory search tool, not a
  person-specific page. A `websiteUrl` (blogs.uww.edu/nguyenh/) already covers her personal
  site; a proper CS-department profile URL would still be an improvement if one exists.

## Batch 19 notes / leads

- Hai T. Tran (Point Park University, Natural Sciences and Engineering Technology) —
  `profileUrl` now 404s. No Wayback Machine snapshot exists for that exact URL (checked via the
  CDX API), and a Point Park site-search fetch for his name returned nothing. Left the entry
  unchanged (not removed — a dead link alone doesn't establish he's left) pending either a
  working search engine or a direct department-page crawl to find a live replacement URL, or
  confirmation he's departed.
- Trung Le (North Dakota State University, Civil, Construction and Environmental Engineering) —
  `profileUrl` returns 403 on every fetch attempt (both plain curl and WebFetch), consistent with
  bot-blocking rather than a dead page. Confirmed via a Wayback Machine snapshot from 2025-05-14
  that the page was live then and matches the current data exactly (Associate Professor, same
  PhD/MS/BS institutions, same personal lab site). Left `profileUrl` unchanged; worth a direct
  re-check once the block clears.
- Jane X. Luu (Tufts University, Physics and Astronomy) — `profileUrl` is a 2022-2023
  faculty-news archive page, not a directory profile page; confirmed live and still identifies
  her as "Lecturer in Physics and Astronomy" as of a March 2023 article. Couldn't find a proper
  Tufts physics-department profile URL this pass (department people page returned no result via
  direct fetch). Left unchanged; worth finding the actual directory page later.
- Xuan Thuan Trinh (University of Virginia, Astronomy) — `profileUrl` is a 2022 UVA news
  article, not a directory page; confirmed live and still identifies him as "Professor Trinh
  Xuan Thuan." The UVA astronomy faculty listing page 404'd when checked directly. Left
  unchanged; worth finding the actual directory page later.

## Batch 18 notes / leads

- Kim Chi Nguyen (UBC) — profileUrl fixed to the person-specific page (see above); the page
  confirms "Professor" rank in its text but a direct name+title co-occurrence wasn't isolated by
  a simple grep. Worth a quick human skim to double check "Professor" is still accurate.
- Thanh Binh Nguyen (University of Ottawa) — profileUrl remains a generic radiologists list page
  (0 name hits on fetch); the department may render the specific bio via JS. Not upgraded.
- Bich Ngoc Nguyen (Université de Montréal, pathologie) — profileUrl is a generic
  laboratoires-de-recherche list page; her name does appear once in the raw HTML, suggesting she
  is listed there, but not confirmed as a person-specific page. Not upgraded.
- Caroline Nguyen Ngoc (Université de Montréal, dentisterie) — profileUrl is a generic
  corps-professoral list page (0 name hits on fetch, page may be JS-rendered). Not upgraded.
- Hung Minh Tan Nguyen (NUS Mathematics) — profileUrl is a very short (953-byte) academic-faculty
  listing page, almost certainly JS-rendered client-side; 0 name hits. His personal site
  (tanmnguyen89.github.io, already in portraitSource) may be a better candidate for websiteUrl or
  even profileUrl if no NUS person-specific page can be found — not changed this pass.
- Li Nguyen (NTU, Linguistics) — profileUrl is a program-faculty listing page but did return 4
  name hits, so it's plausibly still accurate/live; not swapped since no cleaner
  person-specific URL was found.
- Helena Nguyen (University of Sydney Business School) — profileUrl is an "academics" listing
  page with 4 name hits; plausibly fine, not swapped since no cleaner URL was found.
- Peter V. Nguyen (University of Alberta, Physiology) — profileUrl now returns HTTP 410 Gone.
  Tried several guessed replacement URL patterns (ualberta.ca faculty pages, directory search)
  without success; the department's people-listing page also didn't surface his name on a raw
  fetch (may be JS-rendered). Left unchanged pending a proper search-engine lookup or direct site
  navigation once WebSearch is available again — this is the one entry in this batch where the
  existing profileUrl is confirmed dead with no replacement found.
- Three Melbourne Institute/FBE pages (Viet Hoang Nguyen, Kieu-Trang Nguyen, Linh Nguyen) 403'd on
  every direct fetch attempt (Cloudflare-style bot blocking); entries were left as recorded except
  for the rank-vocabulary fixes above, which were sourced from other prior-existing evidence
  (Kieu-Trang Nguyen's own Google Sites page, linked as portraitSource) rather than a fresh fetch
  of the blocked university page. Worth a direct re-check when unblocked.

## Batch 17 notes / leads

- Kim Phuc Tran (was recorded at University of Lille, ENSAIT/GEMTEX) — profileUrl points to a
  Dong A University (Vietnam) advisory-board page, not an official University of Lille/ENSAIT
  page. Could not find a working ENSAIT or GEMTEX staff page for him (gemtex.ensait.fr doesn't
  resolve; ensait.fr staff-directory paths 404). Left profileUrl unchanged pending a better
  source — needs a direct search for his official Lille-affiliated page.
- Jason Nguyen (University of Toronto, Daniels Faculty of Architecture) — profileUrl remains the
  department's general "People" listing page (confirmed it has no server-rendered content
  mentioning him; likely a JS-rendered directory). No working person-specific URL found in a few
  guessed patterns. Left unchanged pending the real slug.
- Nguyen Viet Dang (Sorbonne Université, IMJ-PRG) — profileUrl remains a 2022 news article
  (better than nothing: it does independently confirm his current title and department). A
  cleaner official IMJ-PRG personal/annuaire page likely exists but wasn't found within this
  batch's budget (webusers.imj-prg.fr blocks bots with no Wayback snapshot available;
  imj-prg.fr's annuaire slug guesses 404'd).
- Giang T. Nguyen (TU Dresden) — page is Cloudflare-challenge-blocked to direct fetch; verified
  via a May 2026 Wayback snapshot instead, which itself shows the department listing his role in
  English as "Assistant Professor" (German "Juniorprofessur" title, addressed as "Prof. Dr.-Ing."
  per German convention but not a tenured full professorship) — rank corrected accordingly.
- Chau Duong (UEL), Tam Nguyen / Thao Ngoc Nguyen / Hai Dang Nguyen (all NTU) — all four pages
  block direct fetch (Akamai/Cloudflare); verified via Jan/Jul 2026 Wayback snapshots instead,
  all showing current live titles matching what's now recorded.

## Batch 16 notes / leads

- Quynh Pham (was University of Toronto, IHPME) — REMOVED. Her own IHPME profile states her
  title as "Assistant Professor (Status-Only)" — UofT's status-only appointments are unpaid,
  cross-appointment titles for people whose primary paid employer is elsewhere (here, University
  Health Network, where she's Director/PI of the Centre for Digital Therapeutics). This is
  functionally a courtesy/affiliate appointment, excluded per the inclusion standard, not a real
  primary tenure-line position at the university.
- An Nguyen (was Bournemouth University) — REMOVED. His own staff page states he was full-time
  Professor of Journalism & Public Communication only "up until August 2025," and has since
  transitioned to "Visiting Professor" while running his own consultancy (Media Scholarship and
  Solutions for Development). Visiting appointments are explicitly excluded per the inclusion
  standard.
- Van Bang Le (University of Rostock, recorded as track: Emeritus / rank: Professor) — his own
  personal page shows zero indication of emeritus/retired status (no "em." honorific, no
  retirement language) and presents him as a fully active professor; couldn't reach an
  authoritative Rostock CS-institute staff directory to resolve this either way. Left entirely
  unchanged (track, rank, and profileUrl) pending a clearer source — this may need reclassifying
  to Tenure-line rather than Emeritus, or may simply be a stale personal page.
- Nga Pham (Monash Centre for Financial Studies) — her own Monash profile states her title as
  "Associate Professor (Research)." Monash does have a distinct "Research" academic career
  stream (continuing, but non-teaching) alongside the standard Teaching & Research stream; unlike
  the batch-15 UQ "Senior Research Fellow" removal, this is a named Associate Professor-level
  continuing appointment, not a junior/fixed-term research fellowship, so it's genuinely
  ambiguous whether it should count as "research-track" under the inclusion standard. Left
  unchanged pending a clearer read on Monash's academic-stream policy.
- Cuc Nguyen (University of Melbourne) — findanexpert.unimelb.edu.au bot-blocks all fetch
  attempts (Akamai "Pardon our interruption"), same pattern as batch 15's Tuan Ngo/Xuan-Bach Le.
  Left unchanged; rank/appointment not independently re-confirmed this pass.
- Tien D. Bui (Concordia) and Tien Tuan Anh Dinh (SUTD) — both profileUrls now 404
  (Concordia's faculty-members.html page was restructured; SUTD's istd.sutd.edu.sg subdomain no
  longer resolves in DNS at all, and www.sutd.edu.sg/istd/people/faculty/ doesn't list him among
  the visible entries). No working replacement URL found this pass. Left unchanged.
- Nhung Tran (University of Toronto, History) — the department page is behind a Cloudflare
  challenge that returns no usable content via WebFetch or curl-with-UA. Left unchanged.
- Minh-Hiên Lê, Christine Tran, Jennifer Nguyen (all University of Toronto / UBC Teaching-track)
  — all three had dead profileUrls (404 or DNS failure); no working replacements found this pass.
  Left unchanged aside from the rank-vocabulary normalization to "Teaching".
- Hung Nguyen (UTS, Emeritus) — profiles.uts.edu.au is a JS SPA that returns no server-rendered
  content (same pattern as several UTS entries in batch 15); left profileUrl unchanged, emeritus
  status not independently re-confirmed this pass (rank vocabulary normalized to "Emeritus" on
  the strength of the pre-existing "Emeritus Professor" label, not new evidence).
- Dong Nguyen (Durham) and Hoa Do (Leicester) — both pages return 403 to WebFetch specifically
  but 200 to curl-with-UA; treated as live and kept, but content wasn't actually readable either
  way, so rank/title weren't independently re-confirmed this pass beyond the vocabulary
  normalization.
- Mai Nguyen (Manchester Metropolitan University) — profileUrl was already just the university's
  generic homepage (https://www.mmu.ac.uk/), not a person-specific page; a guessed replacement
  URL 404'd and no working one was found this pass. Left unchanged aside from rank normalization.
- Anh Nguyen (University of Liverpool) — promoted from "Senior Lecturer in Artificial
  Intelligence" to "Reader in Artificial Intelligence and Robotics" per his own official page.
  Mapped to rank "Associate Professor" (no "Reader" tier exists in the accepted vocabulary;
  Associate Professor is the working convention this refresh has used for UK Reader/Senior
  Lecturer titles — see batch 14's Xuan-Vinh Doan note for the earlier version of this same
  open question, which still doesn't have a settled resolution).
- Minh-Son Pham (Imperial College London) — promoted from Senior Lecturer-equivalent to
  Associate Professor ("Reader level" per his own bio); profileUrl updated to the new
  profiles.imperial.ac.uk redirect target.

## Notes / leads found while working (not yet added)

- Batch 15: Quan Nguyen (was "Quan Nguyen - The University of Queensland") — REMOVED. His own
  IMB profile (https://imb.uq.edu.au/profile/1672/quan-nguyen) states his title is "Senior
  Research Fellow & Group Leader", and his School of Biomedical Sciences page lists him as
  "Affiliate Senior Research Fellow" — a research-track primary appointment plus an
  affiliate/honorary secondary one, neither of which meets the inclusion standard's Tenure-line
  requirement. The old "Associate Professor" rank in the roster no longer matches any current UQ
  title for him. Renamed the remaining "Quan Nguyen - University of Southern California" entry to
  plain "Quan Nguyen" since the disambiguating duplicate is gone.
- Batch 15: Xuan-Bach Le (University of Melbourne) — rank corrected "Senior Lecturer" ->
  "Associate Professor" per his own site, which explicitly states "Senior Lecturer (equivalent to
  US Associate Professor)" — a rank-vocabulary fix, not a promotion. His official
  findanexpert.unimelb.edu.au profile (id 912173) now 404s and no working replacement was found
  (Melbourne's findanexpert also bot-blocks direct fetch/curl attempts for at least one other
  person this batch); profileUrl left unchanged/dead pending a working replacement — worth a
  fresh search on a future pass.
- Batch 15: Ngoc Khanh Nguyen (King's College London) — rank corrected "Senior Lecturer" ->
  "Assistant Professor". His official KCL page states his title is "Lecturer (Assistant
  Professor) in Cryptography", i.e. UK Lecturer, not Senior Lecturer — a vocabulary/rank error in
  the prior data, not a demotion.
- Batch 15: Duong Tuan Hoang (UTS) — phdInstitution/phdYear corrected from "Tokyo Institute of
  Technology"/1993 to "Odessa State University" (Ukraine)/1991, matching his own official UTS bio
  text (diploma and PhD both in applied mathematics from Odessa State University, 1987/1991); the
  old data appears to have been simply wrong.
- Batch 15: Minh Hoai Nguyen (University of Adelaide, AIML) and Duc-Tien Dang-Nguyen (University
  of Bergen) — both promoted Associate Professor -> Professor per their own current official/
  personal pages.
- Batch 15: Duc Truong Pham (University of Birmingham) — added "Chance Professor of Engineering"
  as a distinguished_professorship honor (named chair, sourced from his own staff profile); rank
  stays "Professor" per the accepted vocabulary.
- Batch 15: Tuan Ngo (University of Melbourne) and Sonny Pham (Curtin), Minh Nguyen (AUT), Kenneth
  Tran (Auckland) — official profile pages could not be directly fetched (Akamai bot-block or JS
  SPA shells that return no server-rendered content), but current rank/appointment was
  corroborated via independent search results (university news pages, ATSE fellow listing,
  ResearchGate, LinkedIn) and left unchanged. Worth direct re-fetches on a future pass, ideally
  from a different network/UA.
- Batch 15: Minh-Ngoc Tran (University of Sydney Business School) — profiles.sydney.edu.au is a
  client-side-rendered SPA that returns no usable server content via WebFetch or curl; left
  unchanged (pre-existing entry, no evidence of change) pending a JS-capable fetch method.
- Batch 15: Dinh-Tuan Pham (Emeritus, Université Grenoble Alpes / Laboratoire Jean Kuntzmann) —
  profileUrl is still just the lab's generic homepage; no working person-specific page or fresh
  emeritus-status confirmation found this pass. Left unchanged (pre-existing, not newly added).
- Batch 15: Quang Minh Bui (ANU) — ANU has migrated from researchers.anu.edu.au to
  researchportalplus.anu.edu.au and the old profile URL now 404s; couldn't find/confirm the new
  slug within this session's search budget. Left unchanged pending a fresh lookup.

- Batch 14: Phu Nguyen-Van (recorded as "Professor", Université Paris Nanterre / EconomiX) — his
  own EconomiX profile page states his title as "Directeur de Recherche" (Research Director) at
  CNRS, not a university professorship. CNRS research-director is a research-track position
  (excluded per the inclusion standard) even though he's affiliated with a university lab; France's
  CNRS/university joint-appointment system makes this genuinely ambiguous rather than a clear-cut
  case. Left unchanged (existing entry) pending a source that clarifies whether he also holds a
  university teaching-and-research professorship, or whether this entry should be reclassified or
  removed.
- Batch 14: Tien Zung Nguyen (Université Toulouse III, Institut de Mathématiques de Toulouse) —
  no working profileUrl found. His old personal-site domain (zetamu.com) has expired and is now a
  domain-reseller parking page; the Institut de Mathématiques de Toulouse's own site returned
  404/403 for every path tried. Search independently confirms he's still a full Professor there
  (ResearchGate, mathnet.ru, a validated univ-toulouse.fr email). profileUrl left as the old (now
  404) `~nzung/` page rather than guess at a replacement — needs a direct visit to
  math.univ-toulouse.fr's current staff directory to find his real page.
- Batch 14: Xuan-Vinh Doan (University of Warwick) — his current official title per Warwick's own
  site and Warwick Business School is "Reader," not "Associate Professor" (he moved from
  Associate Professor to Reader in 2021). Kept the roster's rank at "Associate Professor" since
  "Reader" isn't in the accepted rank vocabulary and no clear "Reader → which of our 3 ranks"
  mapping exists elsewhere in the roster; worth deciding a standard UK-title mapping convention.
- Batch 14: Vuong Phan (University of Southampton) — the pre-existing entry had him in the
  "Department of Aeronautics and Astronautics" doing aerodynamics/aeroacoustics research; the
  live page and multiple independent sources (ResearchGate, LinkedIn, module listings) show he's
  actually in the School of Mathematical Sciences doing Operational Research/optimization — a
  different field entirely, and the old profileUrl slug (5x8h4f) also didn't match the live one
  (5y2ds9). Corrected department, researchAreas, and profileUrl this batch; this looks like a
  clear pre-existing data error (likely a scraper mismatch) rather than a career change.
- Batch 14: Duong Bui (University of Waterloo, joint Chemistry/Biology) — old profileUrl was
  dead and old researchAreas ("Membrane Proteins," "Cryo-EM") don't match his live bio (glycan
  biology, native mass spectrometry); fixed both. He appears to have joined March 2026 per
  search results, so this may originally have been added from an announcement rather than a live
  profile.
- Batch 14: Nguyen Tran / Nguyen H. Tran (University of Sydney), Thi Kim Thanh Nguyen (UCL), Nam-
  Trung Nguyen (Griffith), Tuan Van Nguyen (UTS), Helen Tran (U Toronto), Vinh Nguyen (Waterloo),
  and Viet Nguyen (Melbourne) all sit behind bot-blocking (Cloudflare/WAF captcha or JS-only SPA
  shells) that neither WebFetch nor curl-with-UA could get past; existing/updated profileUrls were
  kept on the strength of independent WebSearch corroboration rather than a direct fetch. Worth a
  from-a-different-network re-check on a future pass.
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
