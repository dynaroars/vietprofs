# Sector-expansion ledger

Tracks the employer groups added to `TASKS/discover_industry_labs.md` on 2026-11-14: which ones
yield eligible, verified candidates, and how reliable each producer was. The `discover` routine
reads this file to break ties between groups and to skip any group marked `exhausted`.

Status values: `active` (keep rotating), `low-yield` (rotate last), `exhausted` (skip until the
owner reopens it).

## Groups

"Proposed" counts the producer's candidates; "Verified" counts those an independent verifier passed
(including ones that needed a corrected `profileUrl`). Issues are the batches filed for the auditor.

| Group | Status | Last run | Producer | Proposed | Verified | Issue | Notes |
| :-- | :-- | :-- | :-- | --: | --: | :-- | :-- |
| Non-US public and corporate labs | active | 2026-11-14 | agy | 25 | 13 | #1314 | Best yield. A*STAR and CSIRO profile pages are clean sources. Next pass: Max Planck, Helmholtz, RIKEN, KIST directories by surname. |
| French public research | active | 2026-11-14 | agy | 21 | 12 | #1315 | High yield; 14 more already listed. Lab annuaires move often: expect URL fixes. |
| Australian medical research institutes | active | 2026-11-14 | agy | 11 | 6 | #1313 | WEHI individual URLs 404; use `findaresearcher.wehi.edu.au`. MCRI uses `/researcher-details/`; The Kids uses `/contact-us/our-people/`. Four WEHI lab members failed for lack of an individual page. |
| US national labs | active | 2026-11-14 | codex | 2 (+4 from holds) | 6 | #1312 | 25 already listed. Four of 13 name-collision holds were new people. |
| US independent biomedical institutes | active | 2026-11-14 | codex | 2 (+1 from holds) | 3 | #1312 | 47 leads rejected (postdocs, no Vietnamese signal). St. Jude core-facility cards split the verifiers. |
| US federal science agencies | low-yield | 2026-11-14 | codex | 1 (+1 from holds) | 1 | #1312 | 44 rejected; many NIH/USDA staff lack an individual page. Retry with `irp.nih.gov/pi` and ARS person pages only. |
| Hardware & physical-science labs | low-yield | 2026-11-14 | agy | 10 | 3 | #1316 | Corporate labs rarely publish individual pages; 7 of 10 failed on profileUrl (ORCID, Scholar, news). |
| Pharma & biotech R&D | low-yield | 2026-11-14 | codex | 0 | 0 | — | 34 leads rejected, 10 already listed: role or current-employer evidence rarely public. Rotate last; owner-supplied names (`candidate_intake.md`) work better here. |

## Producer reliability

Spot-check precision for external producers (share of proposed candidates that passed all three
tests in `TASKS/discover_industry_labs.md` on independent re-verification).

| Producer | Runs | Proposed | Passed as submitted | Passed after URL fix | Failed | Common errors |
| :-- | --: | --: | --: | --: | --: | :-- |
| agy | 4 | 67 | 2 | 32 | 33 | Invented or stale `profileUrl` slugs (most 404); news stories, ORCID, Scholar, ResearchGate, lab-wide pages, or homepages as `profileUrl`. Headless `agy -p` cannot run shell commands, so it cannot run `find-roster-matches`: its dedup claims are unverified. Good at finding real people. |
| codex | 4 | 5 | 4 | 0 | 1 | Over-conservative: treated every `find-roster-matches` name hit as a duplicate and held 32 people, of whom 30 were different people (6 eligible) and 1 an actual roster match. Thorough, accurate verifier. |
| agy (sweep) | 54 shards | 0 | 0 | 0 | — | Wrote no output file in any shard: `agy -p --sandbox` cannot write files, so a brief that says "write your JSON to <path>" yields nothing. Capture stdout instead if agy is used again. |
| codex (sweep) | 54 shards | 298 | 247 | — | 51 | After Claude's live audit: 3 rejected (an incoming 2027 hire, two in-batch duplicates), 48 held (32 pages unreadable without bot-block evasion, 16 where the page did not support the entry: team or list pages, no title, a mismatched name, a different rank). See `AUDIT-2026-11-14.md`. |

How to use them (2026-11-14):

- agy for broad discovery, never unverified: every agy candidate needs an independent verifier that
  opens the pages (Codex did this well). Run it with `--sandbox`; it has no auto-approve mode on
  this account.
- Codex for verification and for groups where pages are scarce; tell it explicitly that a name hit
  needs identity resolution (field, education, co-authors), not automatic exclusion.
- Producer files, verifier files, and briefs live in this directory (`BRIEF.md`, `VERIFY.md`,
  `HOLDS.md`, `<group>.<producer>.json`, `<group>.verify-<verifier>.json`).

## University and lab sweep (2026-11-14)

36 slices (`slices.tsv`, briefs `BRIEF2.md` and `VERIFY2.md`), three waves, six shards at a time;
producers alternated agy and Codex, and a fresh Codex session verified each producer file. Outputs
are in `runs/<wave>/`. The run stopped after three waves at 298 verified (target was 500): the
agy half of every wave produced nothing, so in practice this was a Codex-only run. Claude's audit
added 247 (merged as vp-3356 to vp-3600; 2 were already in from #1312) and recorded the rest in `AUDIT-2026-11-14.md`.

Per-slice yield across all three waves ("Added" is after the audit):

| Slice | Proposed | Verified | Added |
| :-- | --: | --: | --: |
| us-math-stat | 28 | 28 | 25 |
| us-social-hum | 16 | 16 | 15 |
| us-eng-other | 16 | 16 | 14 |
| us-med-n-z | 16 | 15 | 13 |
| uk-other | 14 | 14 | 13 |
| us-cs | 13 | 13 | 11 |
| au-go8 | 13 | 13 | 11 |
| canada | 15 | 15 | 11 |
| france-univ | 15 | 15 | 11 |
| us-california | 14 | 13 | 10 |
| nordic-benelux | 9 | 9 | 9 |
| au-institutes-2 | 11 | 10 | 9 |
| nonus-public-2 | 10 | 9 | 8 |
| us-teaching-colleges | 7 | 7 | 7 |
| au-other | 8 | 8 | 7 |
| taiwan-korea | 11 | 11 | 7 |
| us-ece | 6 | 6 | 6 |
| us-med-a-m | 6 | 6 | 6 |
| us-physical | 7 | 7 | 6 |
| us-texas | 9 | 9 | 6 |
| us-business | 7 | 7 | 5 |
| japan | 8 | 8 | 5 |
| nih-irp | 5 | 5 | 5 |
| uk-russell | 6 | 5 | 4 |
| nz-ireland | 8 | 8 | 4 |
| us-bio | 5 | 5 | 3 |
| ai-labs | 3 | 3 | 3 |
| doe-labs-2 | 3 | 3 | 3 |
| us-institutes-2 | 3 | 3 | 3 |
| us-health-other | 2 | 2 | 2 |
| dach | 1 | 1 | 1 |
| sg-hk-asia | 3 | 2 | 1 |
| south-east-europe | 2 | 2 | 1 |
| france-public-2 | 1 | 1 | 1 |
| canada-asia-public | 3 | 3 | 1 |
| middle-east | 0 | 0 | 0 |

Takeaways for the next sweep:

- Broad US slices (math/stat, social sciences and humanities, engineering, medicine) still yield
  10+ per pass; later waves found fewer but non-zero. Run them again first.
- Middle East, DACH, south-east Europe, Singapore/Hong Kong, and Canada/Asia public labs gave 0–1:
  mark them low-yield.
- Ask producers for an individual profile page and the person's exact title quoted from it: most
  holds were team pages, list pages, or pages with no title.
- Tell the verifier to reject "incoming" appointments that have not started.

## Non-academic sweep (2026-11-17)

Owner goal: 500 more non-academic people, produced by Codex/agy and audited by Claude, added
directly (no Issues). Briefs: `BRIEF3.md` (discovery), `LEADS3.md` (lead lists), `FIND3.md`
(find the page for a named lead); slices in `slices3.tsv`; outputs in `runs/w4`–`runs/w9`.

| Run | Producer | Input | Output | Added |
| :-- | :-- | :-- | --: | --: |
| w4 | agy gemini-3.8-flash (7 shards before quota) + Codex gpt-6-luna (22) | 22 slices | 33 | 10 |
| w5 test | gpt-reserve, gpt-6.1-terra | 2 slices | 0–3 each | 0 |
| w6 | gpt-6.1-sol FIND3 | 1,121 OpenAlex leads (>=15 works, >=3 since 2024) | 567 pages | 37 |
| w7 | gpt-6.1-sol BRIEF3 | 22 slices | 40 | 24 |
| w8 | gpt-6.1-sol FIND3 | 919 OpenAlex leads (>=6 works) | 327 pages | 8 |
| w9 | gpt-6.1-sol FIND3 rescue | 55 held people | 48 pages | 6 |

Lessons:

- Cheaper Codex models (gpt-6-luna, gpt-reserve, gpt-6.1-terra) quit after 1–5 minutes with
  almost nothing, whatever the task. gpt-6.1-sol works (~5 min per 25-person batch).
- agy finds real people but its account quota runs out after ~7 long shards and did not
  recover the same day. `--dangerously-skip-permissions` is blocked; `--sandbox` works.
- OpenAlex leads (last known institution type company/government/facility/nonprofit, outside
  Vietnam, Vietnamese surname + given name via `name-screen.ts`, not on the roster) are the
  richest pool, but OpenAlex mislabels many university and hospital people, and many authors
  are students, postdocs, technicians or already listed under a name variant.
- Most rejections are evidence, not eligibility: team/member-list pages, alumni pages at a
  former employer, no stated title, and no sourced work city (Amazon, Salesforce, DeepMind,
  multi-site institutes). Without a looser evidence rule the remaining pool is small.

## Under-covered sweep (2026-11-21)

Owner goal: 1,000 more people from Codex and agy, focusing on areas earlier sweeps did not
target; Claude audited every candidate live and added passes directly (no Issues). Result:
1,006 added (vp-3757 to vp-4771) in ~11 hours over waves w10–w18. Briefs: `BRIEF3.md`
(non-academic), `BRIEF4.md` (universities and institutes in thin countries and US
non-flagships); slices in `slices4.tsv`–`slices11.tsv`.

| Source | Approx. added | Notes |
| :-- | --: | :-- |
| US academic medicine: specialty slices (`slices8`/`slices9`) and single-institution sweeps (`slices10`/`slices11`) | ~520 | Best yield by far: 10–25 per slice. California and Texas centers (UCI, UCSF, UCLA, Loma Linda, Kaiser Tyson, Baylor, MD Anderson, UTSW) richest. Central/West halves ~3x East halves. |
| US regional, private, business and state second-pass slices (`slices6`/`slices7`/`slices8`) | ~250 | Region-plus-many-institutions slices yield 8–25; nationwide discipline slices yield 2–5. |
| Non-US universities and institutes (`slices4`/`slices5`) | ~200 | Canada, Australia, France (regional + grandes écoles), UK post-92, Taiwan, Japan, Nordics, central/eastern Europe, Russia gave the most. |
| Industry and labs | ~25 | Corporate researchers rarely have a citable page; DOE/NASA/NIH/defense slices returned ~0 (covered by earlier sweeps). |
| Minor-surname OpenAlex pairs leads (FIND3) | ~17 | ~4% yield; most leads were postdocs, students, or back in Vietnam. |

Producer notes:

- Codex gpt-6.1-sol did most of the work: 4–20 minutes per slice, accurate titles and URLs.
- agy works only with `--settings` allowing read-only commands (`grep`, `sed`, `cat`, `head`,
  `rg`, `find-roster-matches`); before that it cited Scholar, ORCID or paper affiliations or
  produced nothing. With it, its French and UK slices were clean. Quota still runs out after
  ~10 long slices (resets in under an hour). Its output schema varies (`institution`,
  `location{}`, lowercase ranks), so map it before review. 404 URLs from agy were recovered by a
  Codex FIND pass.
- Common rejections: Korean research-professor and Japanese 特任 contract posts, postdoc-level
  research fellows, non-continuing lecturers and instructors, community colleges, Canadian
  assistant clinical professors without full-time evidence, pages without the person's name or
  title, and names whose order could not be confirmed.
- Held for an owner ruling: Vincent T. Ho (Harvard/Dana-Farber), Saigon-born, ethnically Chinese.

## w24 (2026-11-22)

`slices17.tsv` (inst224–inst265), Codex gpt-6.1-sol only. 78 added (vp-5127 to vp-5204).

- Given-name second pass on the 15 richest US academic-medicine centers: 38 added (best since
  w18). Surname sweeps had missed people with common surnames; searching by given name works.
- Osteopathic, dental and pharmacy schools, US regional universities and liberal arts colleges: 29.
- Non-US second-tier slices (Taiwan, Japan, Korea, China, SE Asia, Germany, Max Planck/Helmholtz,
  Italy/Spain, Russia, Israel/Turkey, Ireland): ~0–1 each. Canadian hospitals gave 21 leads but
  most were Quebec "de clinique" or hospital-based titles without full-time evidence; 4 added.
- Skipped on rules: plain Instructors, pages without a rank, AU Senior Research Officers
  (postdoc level), lab managers, Czech "lektor".

## w25 (2026-11-22)

`slices18.tsv` (inst266–inst320): the w24 given-name second pass applied to the other 55 US
academic-medicine centers. 35 added (vp-5205 to vp-5239), ~0.6 per slice, versus 2.5 for the 15
richest centers in w24. The given-name channel is now largely spent for US medicine.

## w26 (2026-11-22)

`slices19.tsv` (inst321–inst372): given-name second pass on the main (non-medical) campuses of
large US universities, grouped by region. 20 added (vp-5240 to vp-5259), ~0.4 per slice; 33 of 52
slices returned nothing. Surname sweeps had already covered these campuses well.

- Skipped: Harold Linh Cole (Penn; middle name Linh is the only signal) and three community
  college faculty (Hostos, Kingsborough, UH Maui College).
- Name-order calls: Nguyen Q. Minh (UCSD CER lists "Minh, Nguyen"; publishes as Nguyen Q. Minh),
  Le My Tran Ozor (given name Le My, retained surname Tran).

## w27 (2026-11-22)

OpenAlex channel: authors at education/healthcare institutions outside Vietnam with a Vietnamese
surname and a distinctly Vietnamese given name, ≥30 works and ≥5 since 2024, not matching a roster
name (4,055 raw → 188 leads in 16 batches; Codex FIND3 brief). 3 added (vp-5302 to vp-5304).
Almost all leads were postdocs, research fellows, students, hospital clinicians, staff scientists
or Korean research professors. Not worth repeating for academia.

## w28 (2026-11-22)

`slices20.tsv` (inst373–inst398): given-name second pass on non-US universities (Australia, NZ,
Canada, France, Benelux/Switzerland, Germany, Nordics, UK, Japan, Korea, Taiwan, SE Asia, Middle
East, central Europe). 42 added (vp-5260 to vp-5301), ~1.6 per slice — much better than the US
non-medical pass. Held: 21 Canadian clinical-title physicians (Université de Montréal "de
clinique", Laval, UBC, U of T, McGill) without full-time evidence. Skipped: associate/assistant
lecturers, language instructors (Polish wykładowca, Russian преподаватель), Hungarian tanársegéd,
a Manitoba senior instructor.

## w29 (2026-11-23)

`slices21.tsv` (inst399–inst438): third, narrow-scope pass on single non-US institutions or small
groups, querying staff directories one given-name or surname token at a time. 35 added (vp-5305
to vp-5339), ~0.9 per slice, mostly from France, the UK, Japan, Taiwan, Thailand and China.
Name-screen reviewed: Chooc Ly Tan (CV: Afro/Vietnamese/Cambodian heritage), Hainam Do (fused Hải
Nam). Thu Thuy Dang (Clermont Auvergne INP) entered as Associate Professor from the CNU section 61
electoral list (maître de conférences); the employer profile only says "Permanent".

## w30 (2026-11-23)

`slices22.tsv` (inst439–inst488): discipline × region slices outside the US (10 fields each for
AU/NZ, UK/IE, France/Belgium/Switzerland and Canada; 5 fields each for continental Europe and
Asia). 43 added (vp-5340 to vp-5382), ~0.9 per slice; France and Japan gave the most, Canada
and the UK the least. Skipped: lecturers at private non-university providers (Melbourne Institute
of Technology, Canterbury Institute of Management, Excelsia University College, Whitecliffe),
The Georges Be Duc (name-only signal). Kept Manukau Institute of Technology (NZ polytechnic,
Unitec precedent). Name-order allowlist: Mai K. Nguyen-Verger.

## w31 (2026-11-23)

`slices23.tsv` (inst489–inst508): remaining field × region slices for continental Europe and
Asia, medical schools in five non-US regions, and the Middle East/Africa/Latin America. 12 added
(vp-5383 to vp-5393, plus reinstated vp-1512 Van Anh Nguyen, Innsbruck, whose 2026-09-12 entry had
been retired for lacking a source), ~0.6 per slice. Middle East/Africa/Latin America slices
returned nothing; French PU-PH and Japanese universities supplied most hits.

## w32 (2026-11-23)

`slices24.tsv` (inst509–inst528): non-US public research institutes (CNRS institutes, INSERM,
INRAE/IRD, Inria, CEA group, Pasteur/Curie, German, Benelux/Nordic, UK, Japanese, Korean/Taiwanese,
Asian, Australian/NZ and Canadian institutes, non-US central banks). 9 added (vp-5394 to vp-5402),
~0.45 per slice; 12 of 20 slices returned nothing. Skipped three permanent ingénieur de recherche /
lab-manager posts (IPGP platform, Géoazur, INRAE Thonon) as technical-support roles.

## w33 (2026-11-23)

`slices25.tsv` (inst529–inst542): smaller US four-year institutions by region (Cal State,
California privates, Texas regionals and privates, Pacific Northwest, Mountain West, Midwest,
CUNY/SUNY/NJ, Mid-Atlantic, Virginia/Carolinas, Southeast, New England). 17 added (vp-5403 to
vp-5419), ~1.2 per slice — better than the w26 large-campus pass, so w34 extends it. Phu Phan
(CSUDH) uses the catalog addendum as profileUrl because the department page is already vp-0367's.

## w34 (2026-11-23)

`slices26.tsv` (inst543–inst557): US professional schools nationwide (pharmacy, osteopathic,
dental, optometry/podiatry, nursing, law, art/design/music), engineering-focused schools, liberal
arts colleges, religious universities, and smaller state universities not named in w33. 13 added
(vp-5420 to vp-5432), ~0.9 per slice; law and art schools gave the most. Skipped Euane Newen
(Stony Brook dentistry; only signal is Vietnamese as a spoken language). Name-order allowlist:
Mai Linh Spencer.
