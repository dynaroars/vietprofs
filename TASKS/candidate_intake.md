# Owner-Supplied Candidate Intake (`candidate_intake.md`)

This task governs what to do when the repository owner pastes one or more candidate names (with or
without a hint like a university, field, or a link) directly into a conversation, asking to check
them against the roster. It is distinct from [`discover_new_faculty.md`](discover_new_faculty.md)
(autonomous open-ended search) — here the owner has already named the candidate(s); the job is to
verify, enrich, and hand off, not to search broadly for new names.

## 1. Roster dedup check (do this first, before any deep research)

For each pasted name, follow `ROSTER_MAINTENANCE.md` "One person, one ID":

- Run `npm run find-roster-matches -- "<name>" --url <each identity URL you have>` (profile,
  homepage, lab, Scholar, LinkedIn; rerun it once step 3 has found more). Treat every hit as the
  same person until ruled out. A same-name entry at a different institution usually means the
  person moved (Tin Nguyen was listed at Auburn as vp-0037 when an intake re-added him at Wayne
  State as vp-1692, 2026-09-24). A retired-id hit means they were on the roster before.
- Also check `public/data.json` for an existing entry by hand: match on `name`, `vietnameseName`, and obvious
  name-order/diacritic/anglicized variants (see the given-name/surname search guidance in
  `ROSTER_MAINTENANCE.md`). Also check common Vietnamese surname/given-name reordering — a
  candidate can be already listed under a shortened, anglicized, or reordered published name that a
  literal string match on the pasted name won't catch (e.g. "Nhan (David) Huynh" already listed as
  "Nhan Huynh"; "Thieu Vo" already listed as "Thieu Ngoc Vo").
- Once identity-establishing fields are gathered in step 3 (`profileUrl`, `websiteUrl`,
  `scholarUrl`, `linkedinUrl`), also cross-check those exact URLs against every existing roster
  entry's corresponding fields, not just against names. A shared institutional profile, personal
  site, Scholar ID, or LinkedIn URL is a stronger duplicate signal than name matching alone and
  catches cases a name-only pass misses.
- **Already listed (including under a former institution or name):** stop here for that person.
  Update the existing entry in place; never file a `New candidate:` Issue or create a second entry.
  If the owner's message supplies new facts about them (an award, a moved institution, a corrected
  link, etc.), treat that per `AGENTS.md` "Direct updates": apply the fields (protecting only name,
  Vietnamese name, honors, or portrait) and follow the entry's normal edit path (PR or direct-to-`main`, per the field/task involved). A move
  also changes `profileUrl`, department, rank, and location; keep everything that is still true.
  Report back which existing `vp-####` ID it matches.
- **Previously on the roster (retired id):** the person keeps the original ID. File the Issue as
  usual, but say "restore `vp-####`" and include why the earlier removal no longer applies.
- **This dedup check goes stale.** It only reflects the roster's state at the moment the Issue is
  filed. The roster keeps growing from other automated maintenance passes running concurrently or
  afterward, so a candidate cleared here can be added by a different process before this Issue is
  ever acted on. Whoever later assigns the `vp-####` ID (the audit workflow, per
  `AUDIT_ISSUES_PRS.md`) must re-run this same dedup check (`npm run find-roster-matches` with
  every identity URL in the Issue) against the *current* `public/data.json` immediately before
  adding the entry, not rely on the Issue's original "not already on the roster" claim.
- **Not listed:** continue to step 2.

## 2. Eligibility check

Before spending time on enrichment, confirm the candidate can plausibly satisfy
`ROSTER_MAINTENANCE.md`'s inclusion standard:

- A current (or accepted-and-dated incoming) appointment at a university or eligible
  public/nonprofit research institute outside Vietnam.
- One of the accepted tracks (`Tenure-line`, `Teaching`, `Research`, `Clinical`,
  `Admin and Staff`, `Emeritus`, `Deceased`).
- Vietnamese or Vietnamese-diaspora signal (name is normally sufficient; no separate identity
  documentation is required once appointment eligibility is otherwise established).

If the first-pass evidence clearly fails eligibility (e.g. postdoc, adjunct, industry-only,
on-the-market candidate, Vietnam-based institution), stop and report why to the owner instead of
filing an Issue. If eligibility is plausible but thin, keep going and note the gap explicitly in
the Issue rather than guessing.

## 3. Full enrichment pass

Once a candidate clears steps 1–2, gather everything reasonably available before filing the Issue —
the goal is for the Issue alone to give a downstream agent enough to add the entry without further
research:

- **Core fields:** current `university`, `country`, `city`/`state` if applicable, `department`,
  `rank`, `track`, `institutionType` (if non-university), primary `field`/`researchAreas`.
- **Identity/name:** `name`, `vietnameseName`, and any published surname-change history (apply the
  AGENTS.md rule of preserving the original Vietnamese surname in `name`/`vietnameseName` if the
  candidate publishes under a changed surname).
- **Official profile:** the institutional faculty-profile `profileUrl`; note whether this makes the
  record confirmable (no `confirmed` field) or whether only identity-resolved secondary sources are
  available (`"confirmed": false`, and say why).
- **Links:** `websiteUrl` (personal/academic homepage), `labUrl` (if the candidate runs or belongs
  to a named lab), `linkedinUrl`, `scholarUrl` (Google Scholar), and any other reputable profile
  (DBLP, ORCID, etc.) worth recording as a source even if not a stored field.
- **Portrait:** a candidate headshot image URL (`portraitSource`) from an official or otherwise
  reliable page, following the quality bar in `fetch_portraits.md` (real individual headshot, not a
  logo/silhouette/group photo). Do not download or commit the image yourself — record the source
  URL for the downstream agent to fetch and vet.
- **Awards/honors:** any awards, fellowships, or honors meeting the roster's honors bar (see
  memory: conference distinguished/best-paper awards do not qualify; test-of-time/most-influential
  awards do) with `name`, `year`, `organization`, and `source` URL for each.
- **Degrees/history:** `phdInstitution`/`phdYear`, `msInstitution`, `mdInstitution`,
  `undergradInstitution`/`undergradYear`, and a completed `postdocInstitution` where findable.
- **About/bio summary:** a short factual "about" paragraph or research-overview draft (same quality
  bar as `researchOverview.text` in `ROSTER_MAINTENANCE.md`: neutral, gender-neutral phrasing, no
  raw HTML/citations/boilerplate, ≤3 sentences, ≤500 characters) with its source(s), for the
  downstream agent to adapt into `researchOverview`.
- Cite a source URL for every fact gathered. Do not invent or infer facts not backed by a source.

## 4. File one GitHub Issue per candidate

Per `AGENTS.md`'s "New entries vs. edits" policy, a new roster ID is always proposed via a **GitHub
Issue**, never a PR, never a direct commit, and never by running `assign-profile-ids -- --apply`
yourself. For each eligible, not-yet-listed candidate, file an Issue containing:

1. Full name (and Vietnamese name / known aliases).
2. Eligibility rationale citing the specific `ROSTER_MAINTENANCE.md` track and evidence.
3. All proposed fields gathered in step 3, clearly labeled (so another agent can paste them
   directly into a new `public/data.json` entry), including which are officially confirmable vs.
   unconfirmed.
4. Every source URL used, mapped to the fact(s) it supports.
5. Open questions or gaps (missing portrait, missing degree year, ambiguous identity, etc.) so the
   downstream agent knows what still needs work rather than assuming the Issue is fully complete.

If a single batch of pasted names mixes eligible-new-candidates with already-listed people needing
edits, split the work: file edits via their normal path and open a separate Issue per new
candidate — do not combine them into one Issue.

## 5. Report back

After filing, tell the owner (in the terminal, not just via the Issue) which names were: already on
the roster (with `vp-####` ids), filed as new-candidate Issues (with Issue numbers/links), or
rejected as ineligible (with the reason).
