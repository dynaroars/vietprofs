# Audit Education Chronology (`audit_education_chronology.md`)

> **Autonomous Goal Directive (`/goal TASKS/audit_education_chronology.md`):**  
> Audit and backfill education degree credentials in `src/roster.json` (`undergradInstitution`/`undergradYear`, `msInstitution`/`msYear`, `phdInstitution`/`phdYear`, `postdocInstitution`/`postdocYear`). Verify degree progression, doctoral dissertations, and degree completion years against official university homepages, CVs, and institutional repositories. Enforce strict chronology rules (no inverted intervals, no prepended degree prefixes in institution fields). Update `lastModified` and `lastVerified` fields. Submit updates as a GitHub PR. Never commit directly to `main`. Iterate in bounded batches.

---

## 🎯 Task Purpose & Scope

Maintain complete and chronologically valid education degree records across all roster entries.

---

## 🛠️ Verification & Chronology Rules

1. **Chronology Rules**:
   - `undergradYear <= msYear <= phdYear <= postdocYear`.
   - Never guess a year; leave both institution and year blank if unknown.
   - Keep institution names canonical (e.g., `University of Maryland`, not `Ph.D. from University of Maryland`).
2. **Local Verification**:
   ```bash
   npm test && npm run build && git diff --check
   ```
3. **PR Submission**:
   - Submit clean updates via GitHub Pull Request on a topic branch.
