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

How to use them (2026-11-14):

- agy for broad discovery, never unverified: every agy candidate needs an independent verifier that
  opens the pages (Codex did this well). Run it with `--sandbox`; it has no auto-approve mode on
  this account.
- Codex for verification and for groups where pages are scarce; tell it explicitly that a name hit
  needs identity resolution (field, education, co-authors), not automatic exclusion.
- Producer files, verifier files, and briefs live in this directory (`BRIEF.md`, `VERIFY.md`,
  `HOLDS.md`, `<group>.<producer>.json`, `<group>.verify-<verifier>.json`).
