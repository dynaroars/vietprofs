# Audit Education Chronology (`audit_education_chronology.md`)

> **Autonomous Goal Directive (`/goal TASKS/audit_education_chronology.md`):**  
> Audit and backfill education degree credentials in `public/data.json` (`undergradInstitution`/`undergradYear`, `msInstitution`/`msYear`, `phdInstitution`/`phdYear`, `postdocInstitution`/`postdocYear`). Verify degree progression, doctoral dissertations, and degree completion years against official university homepages, CVs, and institutional repositories. Enforce strict chronology rules (no inverted intervals, no prepended degree prefixes in institution fields). Set `lastUpdatedAt` on changed entries; do not advance `maintenance/verification.json`. Submit updates as a GitHub PR. Never commit directly to `main`. Iterate in bounded batches.

---

## 🎯 Task Purpose & Scope

Maintain complete and chronologically valid education degree records across all roster entries.

---

## 🛠️ Verification & Chronology Rules

1. **Chronology Rules**:
   - `undergradYear <= msYear <= phdYear <= postdocYear`.
   - Never guess a year. Record an institution without a year when only the institution is stated; leave both blank if neither is.
   - Professional degrees without a dedicated field (JD, DMD, PharmD, MBA, …) go in `otherDegrees`; see "Education-field consistency sweep" in `ROSTER_MAINTENANCE.md`.
   - Keep institution names canonical (e.g., `University of Maryland`, not `Ph.D. from University of Maryland`).
2. **Local Verification**:
   ```bash
   npm test && npm run build && git diff --check
   ```
3. **PR Submission**:
   - Submit per-batch edits as a PR on a topic branch, per the routing table in `AGENTS.md`. Never commit directly to `main`.
