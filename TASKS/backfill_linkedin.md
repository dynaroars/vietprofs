# Task Guide: Thorough LinkedIn Profile Discovery and Disambiguation (`backfill_linkedin.md`)

This task playbook governs the deep research, identity disambiguation, verification, and backfilling of personal LinkedIn profile URLs (`linkedinUrl`) in the **VietProfs** repository.

---

## ⚡ Batching & `/goal` Execution Protocol

When running this task (especially during a long-running or overnight `/goal` run):

1. **Strict Batch Size (15–20 Profiles Per Batch):** Work in bounded batches of **15–20 profiles per batch** across ID ranges (e.g. `vp-0100` to `vp-0120`). Do NOT try to process the entire dataset in a single shallow pass.
2. **Thorough Verification Per Candidate:** Execute 3 distinct search queries per person (Name + University, Name + Department/PhD, Diacritic Name + Field). Verify at least 2 independent identity signals (PhD school, past affiliations, research domain) before accepting.
3. **Batch Test, Commit, and Push Pipeline:**
   After completing each batch of 15–20 profiles:
   - Validate pipeline: `npm test && npm run build && git diff --check`
   - Commit batch: `git add public/data.json`
   - Commit message: `git commit -m "feat(data): backfill verified linkedin URLs batch [ID_RANGE]"`
   - Push immediately: `git push origin main`
4. **Resumable Loop:** Move to the next ID range batch until all target roster IDs missing `linkedinUrl` have been researched.

---

## 1. Core Objective & Strict Disambiguation Standard

The goal is to locate and verify direct personal LinkedIn profile URLs for faculty roster entries.

- **Strict Verification Standard:** Never guess a LinkedIn URL from name alone. Only add a profile when multiple independent signals (current/past university, department, PhD institution, research field) match the canonical roster record.
- **Skip Unconfirmed Profiles:** If search results yield no candidate, ambiguous namesakes, or unconfirmed matches, skip the entry and leave `linkedinUrl` omitted.
- **Protected Fields:** If `linkedinUrl` is listed in `directFields`, automated maintenance must never modify or replace it.

---

## 2. Thorough Multi-Query Research Protocol

Do NOT rely on a single shallow search engine query. Perform a thorough, multi-step search pipeline for every candidate:

1. **Query 1 (Name + Primary Institution):**
   ```text
   site:linkedin.com/in/ "<Scholar Name>" "<University Name>"
   ```
2. **Query 2 (Name + Department / PhD Institution):**
   ```text
   site:linkedin.com/in/ "<Scholar Name>" "<Department / Field>" OR "<PhD Institution>"
   ```
3. **Query 3 (Full Name / Diacritic Vietnamese Name + Research Field):**
   ```text
   site:linkedin.com/in/ "<Vietnamese Name>" "<Primary Research Area>"
   ```

---

## 3. Disambiguation Checklist & Identity Signals

Before accepting a candidate LinkedIn profile, verify at least **TWO** of the following identity signals:

- [x] **Primary Appointment Match:** Headline or experience section lists current university and department/school.
- [x] **Prior Appointment Match:** Past experience lists documented previous academic roles (e.g. Assistant Professor at UNC Chapel Hill prior to moving to Penn State).
- [x] **Education Match:** Education section lists matching PhD/MD/MS institution and graduation year.
- [x] **Research Field Match:** Profile summary, skills, or publications align with the scholar's specialized research domain.

### Common Namesake Exclusions (Red Flags)

- **Corporate / Non-Academic Namesakes:** Professionals in banking, sales, real estate, or software engineering without documented academic faculty history.
- **Student / Trainee Profiles:** Undergraduate or master's students sharing the scholar's name.
- **Different Institution / Field:** Same-name profiles belonging to scholars in completely different disciplines or regions.

---

## 4. URL Format & Data-Entry Standard

1. **Canonical Profile URL:**
   - Must be a direct personal profile URL: `https://www.linkedin.com/in/username/` (or regional domain `https://www.linkedin.com/in/username`).
   - Remove tracking parameters (e.g. `?utm_source=...`, `?originalSubdomain=...`).
   - Never store search query URLs (`linkedin.com/pub/dir/...`), company pages (`linkedin.com/company/...`), or post links.

2. **Updating Roster Data (`public/data.json`):**
   - Add `"linkedinUrl": "https://www.linkedin.com/in/username/"`.
   - Update `"lastUpdatedAt": "<CURRENT_ISO_TIMESTAMP>"`.

3. **Ledger Policy:**
   - A LinkedIn-only addition does NOT advance `maintenance/verification.json` unless accompanied by a complete live periodic review pass.

---

## 5. Execution & Verification Workflow

```bash
# Validate data format and check for duplicate LinkedIn URLs
npm run validate-data

# Run full test suite and build validation
npm test && npm run build && git diff --check
```
