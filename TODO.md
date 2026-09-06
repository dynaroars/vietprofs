# OpenAlex Cross-Discipline Verification Pass — TODO

## Context & Essential References
Before modifying the roster, review:
- [AGENTS.md](AGENTS.md)
- [README.md](README.md)
- [ROSTER_MAINTENANCE.md](ROSTER_MAINTENANCE.md) (authoritative criteria for eligibility, appointment tracks, degrees, honors, portraits, and evidence)

## Workflow & Rules
1. **Lead Queue:** `maintenance/openalex-leads.json`.
2. **Resolution Standard:** OpenAlex affiliations are leads only and may be stale. Resolve each candidate using current, identity-resolved evidence:
   - `included`: Add to roster with assigned `rosterId` and detailed `note` (official institutional profile $\rightarrow$ `"confirmed": true`; otherwise reliable evidence with `"confirmed": false`).
   - `duplicate`: Existing profile matched $\rightarrow$ set status to `"duplicate"` and reference the roster ID.
   - `excluded`: Ineligible (e.g. based in Vietnam, corporate/industry, student/postdoc, vocational institution) $\rightarrow$ set status to `"excluded"` with reason in `note`.
   - `unresolved`: Cannot verify identity or current appointment $\rightarrow$ set status to `"unresolved"` with reason in `note`.
3. **Inclusion Checklist:**
   - Update `public/data.json` (ensure fields, tracks, locations, degrees, honors match schema).
   - If a new country or institution field mapping is added, update `src/roster-constants.ts` (`COUNTRY_FLAGS`) and/or `src/data.ts` (`FIELD_OVERRIDES`).
   - Update `maintenance/verification.json` with entry verification record.
   - Update `maintenance/openalex-leads.json` candidate entry.
   - Run profile ID assignment: `npm run assign-profile-ids -- --apply`.
   - Validate and build: `npm test && npm run build && git diff --check`.
   - Commit and push changes per batch.

---

## Current Queue Status (as of 2026-09-05)

### Completed Batches
- [x] **Computer Science** (52/52 resolved — 8 included, 16 duplicates, 27 excluded, 1 unresolved)

---

### Remaining Batches to Process (in recommended order)

#### 1. Mathematics & Statistics (Small Batch — Quick Win)
- **Status:** 6 pending / 8 total (2 duplicates already marked)
- **Target:** `batches["Mathematics & Statistics"].candidates`

#### 2. Engineering (Large Batch)
- **Status:** 103 pending / 131 total (28 duplicates already marked)
- **Target:** `batches["Engineering"].candidates`

#### 3. Life Sciences
- **Status:** 19 pending / 22 total (3 duplicates already marked)
- **Target:** `batches["Life Sciences"].candidates`

#### 4. Social Sciences
- **Status:** 26 pending / 36 total (10 duplicates already marked)
- **Target:** `batches["Social Sciences"].candidates`

#### 5. Agriculture & Environment
- **Status:** 44 pending / 54 total (10 duplicates already marked)
- **Target:** `batches["Agriculture & Environment"].candidates`

#### 6. Physical Sciences
- **Status:** 91 pending / 123 total (32 duplicates already marked)
- **Target:** `batches["Physical Sciences"].candidates`

#### 7. Other
- **Status:** 53 pending / 69 total (16 duplicates already marked)
- **Target:** `batches["Other"].candidates`

#### 8. Medicine & Health (Largest Batch)
- **Status:** 164 pending / 210 total (46 duplicates already marked)
- **Target:** `batches["Medicine & Health"].candidates`

#### Empty Batches (No action needed)
- Business & Economics (0)
- Humanities & Arts (0)
- Education (0)
- Law (0)

---

## Handy Commands for Agent Execution
- Inspect pending counts:
  ```bash
  node -e 'const l = JSON.parse(fs.readFileSync("maintenance/openalex-leads.json")); for (const [k, v] of Object.entries(l.batches||{})) { const s = {}; (v.candidates||[]).forEach(c => s[c.status] = (s[c.status]||0)+1); console.log(k, s); }'
  ```
- Assign IDs:
  ```bash
  npm run assign-profile-ids -- --apply
  ```
- Test and verify:
  ```bash
  npm test && npm run build && git diff --check
  ```
- Commit and push batch:
  ```bash
  git add maintenance/openalex-leads.json maintenance/verification.json public/data.json src/data.ts src/roster-constants.ts
  git commit -m "Resolve all pending OpenAlex <Discipline> leads"
  git push origin main
  ```
