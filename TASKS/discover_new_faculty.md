# Discover New Faculty & Scholars (`discover_new_faculty.md`)

> **Autonomous Goal Directive (`/goal TASKS/discover_new_faculty.md`):**  
> Systematically search external university department directories, public research institutes, Google Scholar, DBLP, and academic conference author rosters to discover eligible Vietnamese and Vietnamese-diaspora faculty outside Vietnam who are not yet listed in `vietprofs`. Verify identity, appointment track (Tenure-line, Teaching, Research, Clinical, Academic staff, Emeritus), institution eligibility, and official current institutional profile URL according to `ROSTER_MAINTENANCE.md`. Every candidate here needs a brand-new `vp-####` ID, so submit all proposed new entries as a **GitHub Issue** (never a PR, and never a direct commit to `main`) with the evidence and proposed fields, and let the owner or the audit workflow assign the ID. Iterate in bounded batches until target research areas/universities are thoroughly scouted.

---

## 🎯 Task Purpose & Scope

Expand roster coverage by finding qualified Vietnamese and Vietnamese-diaspora scholars at universities and public research institutes outside Vietnam.

---

## 🛠️ Research & Inclusion Criteria (`ROSTER_MAINTENANCE.md`)

1. **Eligibility Criteria**:
   - Current academic appointment at a university or eligible public/nonprofit research institute outside Vietnam (e.g. CNRS, INRIA, Max Planck, NIH, NIST, NASA, Argonne, LBNL, Allen Institute).
   - Accepted track: `Tenure-line`, `Teaching`, `Research`, `Clinical`, `Academic staff`, `Emeritus`, `Deceased`.
   - Exclude adjunct, visiting, postdoctoral, graduate student, industry-only (e.g. Microsoft Research without university appointment), and temporary positions.
2. **Data Fields Required**:
   - `name`, `university`, `country`, `rank`, `track`, `department`, `field`, `profileUrl`, `keywords`, `confirmed`.
3. **Verification Protocol**:
   - Official institutional profile page sets `"confirmed": true`.
   - Identity-resolved public page (lab site, personal site, Google Scholar) sets `"confirmed": false` (Unconfirmed).
4. **Local Verification** (run against a scratch copy before filing the Issue, never committed to a branch):
   ```bash
   npm test && npm run build && git diff --check
   ```
5. **Issue Submission** (per `AGENTS.md`'s "New entries vs. edits" policy — a new roster ID always goes through an Issue, never a PR or direct commit):
   - File one GitHub Issue per candidate (or a small batch of candidates), including full name, evidence/source URLs, proposed fields (university, country, rank, track, department, field, profileUrl, keywords, confirmed), and eligibility rationale.
   - Do not run `assign-profile-ids -- --apply` or add the candidate to `public/data.json` yourself; leave ID assignment to the owner or to `AUDIT_ISSUES_PRS.md` once the Issue is resolved.
