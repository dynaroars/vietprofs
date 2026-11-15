# Cross-verification brief

Another agent proposed the items in the input file named in your prompt. Re-verify each one
independently, live, as a skeptical reviewer. Do not trust their evidence text; open the pages.

For each item in `candidates`, apply the tests below with `ROSTER_MAINTENANCE.md` (university
eligibility, tracks, exclusions) and `TASKS/discover_industry_labs.md` (non-university):
1. `profileUrl` is a live page published by the CURRENT employer that names this person in a current
   role (for universities: the official faculty/staff profile or department directory entry; the
   appointment must be eligible: no adjunct, visiting, postdoc, affiliate, or lecturer-by-semester). Not acceptable as profileUrl: a homepage/landing page, a news story, a publication or PDF,
   ORCID, Scholar, ResearchGate, LinkedIn, a team-wide page that does not single out the person, or a
   former employer. If the employer publishes no profile, the person's own site stating the current
   role is acceptable only with `"confirmed": false`. If you find a better employer page, give it.
2. Universities: an eligible faculty track per ROSTER_MAINTENANCE.md. Non-university: career research
   role + research doctorate (or >=2 papers in 3 years at the employer). No postdocs, students,
   visitors, contractors.
3. Vietnamese or Vietnamese-diaspora, with an affirmative signal beyond a shared surname (Hang, Lee,
   Ly, Ha, Lam, Mai, Kim, Tran-as-Chinese-Chen romanization, etc. are not enough alone).
4. Not on the roster: `npm run find-roster-matches -- "<name>" --url <urls...>`. A name hit needs
   identity resolution (field, education, co-authors); a different person still passes test 4.
   Also fail anyone listed in `maintenance/sector-expansion/already-proposed.txt`.
5. Not physically based in Vietnam.

For each item in `possible_move` (existing roster id, maybe moved): check live whether the person's
current employer differs from the roster's `university`; report `moved` (with new employer + URL),
`not_moved`, or `unclear`.

Hard rules: write ONLY the output file named in your prompt. No edits elsewhere, no git, no Issues,
no LinkedIn fetching, no login.

Output JSON:
{
  "verifier": "<codex|agy>",
  "input": "<input file>",
  "candidates": [ { "name": "...", "verdict": "pass|fail|fixable",
                    "failedTests": [1,2,3,4,5], "reason": "...",
                    "correctedProfileUrl": "...", "correctedFields": { } } ],
  "possible_move": [ { "name": "...", "id": "vp-....", "verdict": "moved|not_moved|unclear",
                       "newEmployer": "...", "url": "...", "reason": "..." } ]
}
`fixable` = eligible person, but a field (usually profileUrl) must be corrected; give the correction.

## Lessons from the 2026-11-14 sweep (added after the audit)

- Fail an "Incoming" or future-dated appointment (Codex passed one that starts in 2027).
- Fail a `profileUrl` that is a team, list or department page, or that names a different person in
  its header.
- Check that the stored `rank` matches the page's title (e.g. "Senior Lecturer II" is Senior
  Lecturer, not Professor; "Associate Project Scientist" is not a Lecturer).
- If the page is bot-blocked for you, say so in `reason`. The final auditor cannot read those pages
  either, so the candidate will be held.
