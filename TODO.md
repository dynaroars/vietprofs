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
- [x] **Mathematics & Statistics** (8/8 resolved — 6 included, 2 duplicates)
- [x] **Life Sciences** (22/22 resolved — 7 included, 1 duplicate, 14 excluded)
- [x] **Social Sciences** (36/36 resolved — 12 included, 10 duplicates, 14 excluded)
- [x] **Agriculture & Environment** (54/54 resolved — 8 included, 10 duplicates, 36 excluded)
- [x] **Other** (69/69 resolved — 11 included, 16 duplicates, 42 excluded)
- [x] **Physical Sciences** (123/123 resolved — 23 included, 33 duplicates, 67 excluded)
- [x] **Engineering** (131/131 resolved — 15 included, 35 duplicates, 81 excluded)
- [x] **Medicine & Health** (210/210 resolved — 35 leads / 29 unique included profiles, 65 duplicates, 110 excluded)

---

### Remaining Batches to Process
All non-empty queues in `maintenance/openalex-leads.json` have been fully processed and resolved (100% complete across all 9 non-empty disciplines).

#### Empty Batches (No leads found / No action needed)
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
