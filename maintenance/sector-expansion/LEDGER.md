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
