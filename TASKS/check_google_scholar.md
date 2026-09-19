# Task Guide: Google Scholar Profile Validation and Link Repair (`check_google_scholar.md`)

This task playbook governs the discovery, identity verification, canonical formatting, and health auditing of Google Scholar citation profile URLs (`scholarUrl`) in the **VietProfs** repository.

---

## ⚡ Batching & `/goal` Execution Protocol

When running this task (especially during a long-running or overnight `/goal` run):

1. **Strict Batch Size (20–30 Profiles Per Batch):** Work in bounded batches of **20–30 profiles per batch** using `npm run check-links -- --field scholarUrl`. Do NOT try to audit all entries in a single un-throttled pass (prevents Google Scholar rate-limiting).
2. **Thorough Verification Per Candidate:** Inspect user ID, top co-authors, and paper subjects to ensure strict ownership. Disambiguate common Vietnamese surnames on Google Scholar.
3. **Batch Test, Commit, and Push Pipeline:**
   After completing each 20–30 profile batch:
   - Validate pipeline: `npm test && npm run build && git diff --check`
   - Commit batch: `git add public/data.json`
   - Commit message: `git commit -m "fix(scholar): repair Google Scholar profile links batch [BATCH_NUM]"`
   - Push immediately: `git push origin main`
4. **Resumable Loop:** Resume with the next batch until all flagged or unverified Google Scholar links are fully audited.

---

## 1. Core Objective & Canonical URL Standard

The `scholarUrl` field stores direct links to official Google Scholar user citation profiles.

- **Canonical Format:** Must match `https://scholar.google.com/citations?user=USER_ID` (or with optional language parameter `https://scholar.google.com/citations?hl=en&user=USER_ID`).
- **Strict Prohibitions:**
  - Never store search query URLs (`https://scholar.google.com/scholar?q=...`).
  - Never store individual paper/article URLs (`https://scholar.google.com/citations?view_op=view_citation...`).
  - Never assign a single Google Scholar profile ID to multiple roster entries.
- **Protected Fields:** If `scholarUrl` is listed in `directFields`, automated maintenance must never alter it.

---

## 2. Thorough Verification & Disambiguation Workflow

Do NOT attach a Google Scholar profile based on a superficial search snippet. Disambiguate using the following protocol:

1. **Profile Affiliation & Bio Inspection:**
   - Verify that the profile header lists the scholar's current or former university, department, or research institute.
   - Verify that listed co-authors and lab members match known collaborators.

2. **Publication & Field Cross-Checking:**
   - Inspect the top cited papers on the profile.
   - Confirm that paper titles, journals, and topics match the scholar's primary research domain.

3. **Homonym Disambiguation (Common Names):**
   - Vietnamese surnames (e.g. *Nguyen*, *Tran*, *Le*, *Pham*) produce frequent collisions on Google Scholar.
   - If a search surfaces multiple profiles for the same name (e.g. two scholars named "Huy Nguyen"), cross-reference their PhD institution and specific co-authors before selecting the correct profile.

---

## 3. Link Health & Auditing Protocol

Run the automated link checker to discover broken or dead Scholar links:

```bash
# Audit scholarUrl entries across the roster
npm run check-links -- --field scholarUrl
```

### Action Standard for Link Checker Results

- **Confirmed 404 / 410 (Profile Deleted or Renamed):**
  - If Google Scholar returns HTTP 404/410, attempt to locate the scholar's updated user ID via web search.
  - If no live replacement profile exists, remove `scholarUrl` from the entry and update `lastUpdatedAt`.
- **403 / Bot-Blocking Warnings:**
  - Google Scholar heavily rate-limits automated requests. A 403 response does NOT mean the profile is broken. Recheck manually in a web browser before removing.
- **Duplicate `scholarUrl` Errors:**
  - If `validate-data` flags duplicate `scholarUrl` values across entries, investigate which person actually owns the profile ID and clear it from the incorrect entry.

---

## 4. Execution & Validation Protocol

```bash
# Validate data constraints and uniqueness rules
npm run validate-data

# Run full test suite and build
npm test && npm run build && git diff --check
```
