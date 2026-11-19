# Discover New Faculty & Scholars (`discover_new_faculty.md`)

> **Autonomous Goal Directive (`/goal TASKS/discover_new_faculty.md`):**  
> Systematically search external university department directories, public research institutes, Google Scholar, DBLP, and academic conference author rosters to discover eligible Vietnamese and Vietnamese-diaspora faculty outside Vietnam who are not yet listed in `vietprofs`. Verify identity, appointment track (Tenure-line, Teaching, Research, Clinical, Admin and Staff, Emeritus), institution eligibility, and official current institutional profile URL according to `ROSTER_MAINTENANCE.md`. Every candidate here needs a brand-new `vp-####` ID, so submit all proposed new entries as a **GitHub Issue** (never a PR, and never a direct commit to `main`) with the evidence and proposed fields, and let the owner or the audit workflow assign the ID. Iterate in bounded batches until target research areas/universities are thoroughly scouted.

---

## 🎯 Task Purpose & Scope

Expand roster coverage by finding qualified Vietnamese and Vietnamese-diaspora scholars at universities and public research institutes outside Vietnam. You can generate targeted directory search queries with `./scripts/faculty-discovery-queries.ts` and mine database-driven leads (NIH/NSF grant PIs, OpenAlex/Crossref co-authors, lab alumni pages, relationship-research logs, and feeder-vs-faculty institutional gaps) with `npm run discover-leads` (see [`TASKS/discover_from_database.md`](discover_from_database.md)).

---

## 🛠️ Research & Inclusion Criteria (`ROSTER_MAINTENANCE.md`)

1. **Eligibility Criteria**:
   - Current academic appointment at a university or eligible public/nonprofit research institute outside Vietnam (e.g. CNRS, INRIA, Max Planck, NIH, NIST, NASA, Argonne, LBNL, Allen Institute).
   - Accepted track: `Tenure-line`, `Teaching`, `Research`, `Clinical`, `Admin and Staff`, `Emeritus`, `Deceased`.
   - Exclude adjunct, visiting, postdoctoral, graduate student, and temporary positions. Industry, government, and policy researchers without a university appointment (e.g. Microsoft Research, MIT Lincoln Laboratory, the IMF) are not faculty leads: they follow [`discover_industry_labs.md`](discover_industry_labs.md) and `institutionType`/`track` values other than `University`.
2. **Data Fields Required**:
   - `name`, `university`, `country`, `rank`, `track`, `department`, `field`, `profileUrl`, `keywords`, `confirmed`.
   - Propose `vietnameseName` only when a source spells it with diacritics (cite that source). Never
     reconstruct diacritics or middle names from the published name: it is a protected field, so a
     guess that gets merged is hard to undo. Use the exact `track` and `rank` values from
     `ROSTER_MAINTENANCE.md` (`Tenure-line`, `Clinical`, …), not "tenured" or "clinical".
3. **Verification Protocol**:
   - Official institutional profile page: omit `confirmed` (the default).
   - Identity-resolved public page (lab site, personal site, Google Scholar) sets `"confirmed": false` (Unconfirmed).
4. **Local Verification** (run against a scratch copy before filing the Issue, never committed to a branch):
   ```bash
   npm test && npm run build && git diff --check
   ```
5. **Issue Submission** (per `AGENTS.md`'s "New entries vs. edits" policy — a new roster ID always goes through an Issue, never a PR or direct commit):
   - For bulk discovery passes, file **batched GitHub Issues (20+ verified candidates per Issue)** rather than one Issue per person (or a single Issue if fewer than 20 candidates are found in a targeted pass), including each candidate's full name, evidence/source URLs, proposed fields (`university`, `country`, `rank`, `track`, `department`, `field`, `profileUrl`, `keywords`, `confirmed`), and eligibility rationale.
   - Before filing, run `npm run find-roster-matches -- "<name>" --url ...` with every identity URL. A hit at another institution is usually the same person after a move: file a `Review stale institution:` side finding for that id instead of a new candidate (`ROSTER_MAINTENANCE.md` "One person, one ID").
   - Do not run `assign-profile-ids -- --apply` or add the candidate to `public/data.json` yourself; leave ID assignment to the owner or to `AUDIT_ISSUES_PRS.md` once the Issue is resolved.

---

## 🆕 New-hire channel (`newhires`, Thu routine)

Brand-new hires show up on official pages a year or more before they reach grant and citation
databases, and the owner's manual sweeps found most of their additions this way (2026-11). Each run:

1. **Pick sources:** 10–15 official "New faculty 2025-26" / "Welcome our new faculty" pages
   (provost, college, or department news), plus full department directories for the top uncovered
   gap universities (`npm run discover-leads -- --mode=gaps`). Search with `allowed_domains` set
   to the university's domain; prefer pages dated within the last two academic years. Skip
   sources any `[scheduled:discover]` Issue of the last 90 days lists in its Coverage section.
2. **Screen locally:** fetch each page in full (summarizers drop or refuse name filtering) and run
   every name through `screenVietnameseName` in `scripts/name-screen.ts`. Kept names become leads.
   A screened-out name with other evidence (a Vietnamese degree or bio) can still be pursued by hand.
3. **Verify and file:** as in `TASKS/AUTOMATION.md` steps 3–4 (dedup, live eligibility on the
   official profile, one batched Issue). In Coverage, list every source URL examined and how many
   names it had, so later runs skip it.
4. **Fallback:** if the sources yield fewer than 5 promising leads, run `labs` next.
