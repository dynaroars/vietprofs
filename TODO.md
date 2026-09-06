# OpenAlex Cross-Discipline Discovery & Verification Pass — TODO

## Context & Essential References
Before researching or modifying the roster, review:
- [AGENTS.md](AGENTS.md)
- [README.md](README.md)
- [ROSTER_MAINTENANCE.md](ROSTER_MAINTENANCE.md) (authoritative criteria for eligibility, appointment tracks, degrees, honors, portraits, and evidence)

---

## Next Agent Quickstart / Resumption Guide

> [!IMPORTANT]
> **Status at Session Close:**
> - **Phase 1 (Expanded Surnames)**: **100% completed & pushed** across all 9 disciplines (roster at **1,381** profiles).
> - **OpenAlex Daily Quota:** OpenAlex daily free-tier search quota resets at **00:00 UTC (midnight UTC)**.
> - **Next Goal:** Execute **Phase 2 (High-Specificity Given-Name Discovery)**.

### Immediate Steps to Resume:
1. **Pull Latest Main:**
   ```bash
   git pull origin main
   ```
2. **Run Phase 2 Extraction (after 00:00 UTC quota reset):**
   ```bash
   npm run extract-openalex-leads -- --given-names-only
   ```
   *(Note: The extractor automatically merges new leads into existing queues and preserves all previous verification statuses).*
3. **Inspect Lead Queues:**
   ```bash
   node -e 'const l = JSON.parse(require("fs").readFileSync("maintenance/openalex-leads.json")); for (const [k, v] of Object.entries(l.batches||{})) { const s = {}; (v.candidates||[]).forEach(c => s[c.status] = (s[c.status]||0)+1); console.log(k, s); }'
   ```
4. **Triage & Resolve Discipline by Discipline:**
   - For each discipline in Phase 2 (`Computer Science`, `Engineering`, `Physical Sciences`, `Life Sciences`, `Medicine & Health`, `Agriculture & Environment`, `Social Sciences`, `Mathematics & Statistics`, `Other`):
     - Check each pending lead against [ROSTER_MAINTENANCE.md](ROSTER_MAINTENANCE.md).
     - For `included`: Add to `public/data.json` with next `vp-####` ID, add ISO timestamp to `maintenance/verification.json`, add any required overrides to `src/data.ts` or `scripts/validate-data.ts`.
     - For `duplicate`: Mark `status: "duplicate"`, `matchedId: "vp-####"`, and `note` in `maintenance/openalex-leads.json`.
     - For `excluded`: Mark `status: "excluded"` with specific `reason` in `maintenance/openalex-leads.json`.
     - For `unresolved`: Mark `status: "unresolved"` with reason in `maintenance/openalex-leads.json`.
   - Run verification and tests:
     ```bash
     npm test && npm run build && git diff --check
     ```
   - Update `TODO.md` checklist with exact counts and profile ID range.
   - Commit and push immediately:
     ```bash
     git add TODO.md maintenance/openalex-leads.json maintenance/verification.json public/data.json scripts/validate-data.ts src/data.ts
     git commit -m "Resolve OpenAlex Phase 2 <Discipline> leads"
     git push origin main
     ```
5. **Advance to Phase 3 & Phase 4:**
   - Once Phase 2 is complete, run Phase 3 (`npm run extract-openalex-leads -- --pages 3`) and Phase 4 (`npm run extract-openalex-leads -- --diacritics-only`).

---

## Strategic Roadmap: 4 Discovery Phases

This plan expands candidate discovery beyond the initial 17 surnames across 4 sequential, reproducible strategies:

1. **Phase 1: Expanded Surnames Pass (20+ New Vietnamese Surnames)**
   - Target queries: `Dinh`, `Trinh`, `Cao`, `Doan`, `Vuong`, `Nghiem`, `Luu`, `Phung`, `Ta`, `To`, `Ho`, `Lam`, `Ly`, `Chau`, `Bach`, `Ha`, `Diep`, `Quach`, `Kieu`, `Mac`, `Khuong`, `La`, `Ton That`.
   - Command: `npm run extract-openalex-leads -- --surnames-only`
2. **Phase 2: High-Specificity Given-Name Discovery (Inverted Search)**
   - Discovers diaspora scholars with hyphenated/Western surnames (e.g. *Le-Trilling*, *Nguyen-Brown*, *Smith*).
   - Target queries: `Quoc`, `Duy`, `Khang`, `Hieu`, `Kien`, `Tung`, `Triet`, `Bao`, `Phuong`, `Thao`, `Giang`, `Trang`, `Viet`, `Thanh`, `Tuan`, `Hung`, `Cuong`, `Xuan`, `Thuan`, `Nhat`, `Quyen`, `Linh`, `Huyen`, `Manh`, `Duc`.
   - Command: `npm run extract-openalex-leads -- --given-names-only`
3. **Phase 3: Deep Pagination on High-Volume Surnames (`--pages 2..5`)**
   - Targets rising Assistant & Associate Professors in the 500–2,500 citation tier for high-volume surnames (`Nguyen`, `Tran`, `Le`, `Pham`, `Vu`, `Vo`, `Bui`, `Do`, `Phan`, `Dang`, `Huynh`, `Duong`, `Truong`, `Ngo`, `Mai`, `Dao`).
   - Command: `npm run extract-openalex-leads -- --pages 3`
4. **Phase 4: Full Diacritic & Compound Search Passes**
   - Target queries: Full Vietnamese diacritics (`Nguyễn`, `Trần`, `Lê`, `Phạm`, `Võ`, `Vũ`, `Bùi`, `Đỗ`, `Phan`, `Huỳnh`, `Dương`, `Trương`, `Đặng`, `Ngô`, `Đào`, `Hoàng`, `Đoàn`, `Trịnh`, `Vương`) and compound names (`Ton That`, `Ton Nu`, `Doan Pham`).
   - Command: `npm run extract-openalex-leads -- --diacritics-only`

---

## Workflow & Resolution Standard

1. **Lead Queue:** `maintenance/openalex-leads.json`.
2. **Resolution Standard:** OpenAlex affiliations are leads only and may be stale. Resolve each candidate using current, identity-resolved evidence:
   - `included`: Add to roster (`public/data.json`) with assigned `vp-####` ID and verification timestamp in `maintenance/verification.json`.
   - `duplicate`: Matched existing profile $\rightarrow$ set `status: "duplicate"`, `matchedId: "vp-####"`, and `note`.
   - `excluded`: Ineligible (e.g. primary appointment based in Vietnam, non-Vietnamese heritage homonym, industry/corporate scientist, student/postdoc, non-faculty hospital staff) $\rightarrow$ set `status: "excluded"` with specific `reason`.
   - `unresolved`: Cannot verify identity or current appointment $\rightarrow$ set `status: "unresolved"` with reason in `note`.
3. **Inclusion Checklist:**
   - Update `public/data.json` (ensure `track`, `institutionType`, locations, degrees, honors match schema).
   - If a new department/institute string is added, update `src/data.ts` (`FIELD_OVERRIDES`).
   - If an author has a hyphenated/married name where the first token looks like a Vietnamese surname, add to `surnameFirstAllowlist` in `scripts/validate-data.ts`.
   - Update `maintenance/verification.json` with entry verification record (`"<Person Name>": "YYYY-MM-DDTHH:mm:ss.000Z"`).
   - Update candidate entry in `maintenance/openalex-leads.json`.
   - Run immutable profile ID assignment: `npm run assign-profile-ids -- --apply`.
   - Validate and build: `npm test && npm run build && git diff --check`.
   - Commit and push changes per batch immediately.

---

## Queue Status & Progress Tracking

### Initial Baseline Pass (17 Surnames, Page 1) — 100% Completed
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

### Active Execution Queues

#### Phase 1: Expanded Surnames Queue (`npm run extract-openalex-leads -- --surnames-only`)
- [x] **Computer Science** (31/31 resolved — 9 included `vp-1314`..`vp-1322`, 1 duplicate, 21 excluded)
- [x] **Engineering** (64/64 resolved — 10 included `vp-1339`..`vp-1348`, 2 duplicates, 52 excluded)
- [x] **Mathematics & Statistics** (2/2 resolved — 1 included `vp-1301`, 1 excluded)
- [x] **Physical Sciences** (45/45 resolved — 6 included `vp-1333`..`vp-1338`, 39 excluded)
- [x] **Life Sciences** (17/17 resolved — 6 included `vp-1308`..`vp-1313`, 11 excluded)
- [x] **Medicine & Health** (90/90 resolved — 32 included `vp-1350`..`vp-1381`, 2 duplicates, 56 excluded)
- [x] **Agriculture & Environment** (39/39 resolved — 7 included `vp-1326`..`vp-1332`, 1 duplicate, 31 excluded)
- [x] **Social Sciences** (16/16 resolved — 6 included `vp-1302`..`vp-1307`, 10 excluded)
- [x] **Other** (32/32 resolved — 3 included `vp-1323`..`vp-1325`, 29 excluded)

#### Phase 2: High-Specificity Given-Name Queue (`npm run extract-openalex-leads -- --given-names-only`)
- [x] **Computer Science** (61/61 resolved — 8 included `vp-1397`..`vp-1404`, 53 excluded)
- [x] **Engineering** (151/151 resolved — 14 included `vp-1421`..`vp-1434`, 137 excluded)
- [x] **Mathematics & Statistics** (10/10 resolved — 3 included `vp-1382`..`vp-1384`, 7 excluded)
- [x] **Physical Sciences** (129/129 resolved — 9 included `vp-1412`..`vp-1420`, 2 duplicates, 118 excluded)
- [x] **Life Sciences** (17/17 resolved — 5 included `vp-1388`..`vp-1392`, 12 excluded)
- [x] **Medicine & Health** (156/156 resolved — 9 included `vp-1435`..`vp-1443`, 147 excluded)
- [x] **Agriculture & Environment** (100/100 resolved — 4 included `vp-1408`..`vp-1411`, 96 excluded)
- [x] **Social Sciences** (34/34 resolved — 4 included `vp-1393`..`vp-1396`, 30 excluded)
- [x] **Other** (72/72 resolved — 3 included `vp-1405`..`vp-1407`, 69 excluded)

#### Phase 3: Deep Pagination Queue (`npm run extract-openalex-leads -- --pages 3`)
- [x] **Mathematics & Statistics** (13/13 resolved — 3 included `vp-1444`..`vp-1446`, 10 excluded)
- [ ] **Life Sciences** (34 pending)
- [ ] **Social Sciences** (77 pending)
- [ ] **Computer Science** (95 pending)
- [ ] **Other** (101 pending)
- [ ] **Agriculture & Environment** (127 pending)
- [ ] **Physical Sciences** (182 pending)
- [ ] **Engineering** (216 pending)
- [ ] **Medicine & Health** (329 pending)

#### Phase 4: Diacritic & Compound Name Queue (`npm run extract-openalex-leads -- --diacritics-only`)
- [ ] **Computer Science**
- [ ] **Engineering**
- [ ] **Mathematics & Statistics**
- [ ] **Physical Sciences**
- [ ] **Life Sciences**
- [ ] **Medicine & Health**
- [ ] **Agriculture & Environment**
- [ ] **Social Sciences**
- [ ] **Other**

---

## Handy Commands for Agent Execution

- **Inspect pending counts across all batches:**
  ```bash
  node -e 'const l = JSON.parse(require("fs").readFileSync("maintenance/openalex-leads.json")); for (const [k, v] of Object.entries(l.batches||{})) { const s = {}; (v.candidates||[]).forEach(c => s[c.status] = (s[c.status]||0)+1); console.log(k, s); }'
  ```

- **Run extraction by phase:**
  ```bash
  # Phase 1: Expanded Surnames
  npm run extract-openalex-leads -- --surnames-only

  # Phase 2: Given Names (Inverted Search)
  npm run extract-openalex-leads -- --given-names-only

  # Phase 3: Multi-page depth
  npm run extract-openalex-leads -- --pages 3

  # Phase 4: Full diacritics
  npm run extract-openalex-leads -- --diacritics-only
  ```

- **Assign immutable profile IDs:**
  ```bash
  npm run assign-profile-ids -- --apply
  ```

- **Validate data and build:**
  ```bash
  npm test && npm run build && git diff --check
  ```

- **Commit and push batch:**
  ```bash
  git add TODO.md maintenance/openalex-leads.json maintenance/verification.json public/data.json scripts/validate-data.ts src/data.ts
  git commit -m "Resolve OpenAlex <Phase> <Discipline> leads"
  git push origin main
  ```
