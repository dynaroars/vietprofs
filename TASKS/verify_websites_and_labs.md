# Task Guide: Personal Website and Lab Homepage Discovery (`verify_websites_and_labs.md`)

This task playbook governs the deep discovery, validation, link health repair, and backfilling of maintained personal academic homepages (`websiteUrl`) and active research group/lab sites (`labUrl`) in the **VietProfs** repository.

---

## ⚡ Batching & `/goal` Execution Protocol

When running this task (especially during a long-running or overnight `/goal` run):

1. **Strict Batch Size (50 Profiles Per Batch):** Work in bounded batches of **50 profiles per batch** using `WEBSITE_LAB_BACKFILL.md` (e.g. Batch WL-01, Batch WL-02). Do NOT skip batch tracking or process everything in a single shallow pass.
2. **Thorough Verification Per Candidate:** Search personal domains (`.com`, `.org`, `github.io`, Google Sites) and lab team pages (`/members`, `/people`). Verify that the scholar is the PI/Director.
3. **Batch Test, Commit, and Push Pipeline:**
   After completing each 50-profile batch:
   - Validate pipeline: `npm test && npm run build && git diff --check`
   - Mark batch done in `WEBSITE_LAB_BACKFILL.md`.
   - Commit batch: `git add public/data.json WEBSITE_LAB_BACKFILL.md`
   - Commit message: `git commit -m "feat(data): backfill verified website and lab URLs batch [BATCH_NAME]"`
   - Push immediately: `git push origin main`
4. **Resumable Loop:** Resume with the next 50-profile batch until all batches in `WEBSITE_LAB_BACKFILL.md` are marked complete.

---

## 1. Core Objective & Schema Standard

The roster distinguishes between three distinct web location fields:
- `profileUrl`: Official university or department directory bio page (required).
- `websiteUrl`: Maintained personal academic homepage or professional portfolio (optional).
- `labUrl`: Active research group, laboratory, or research center homepage (optional).

### Strict Schema Rules
- **No Duplicate URLs:** `websiteUrl` must differ from `profileUrl`. `labUrl` must differ from both `profileUrl` and `websiteUrl`.
- **No Generic Department Homepages:** Do not assign generic college or department root URLs (e.g. `https://cs.university.edu`) as a personal site.
- **Distinct HTTPS URLs Only:** Only add a URL if a distinct, active site genuinely exists. Do not fabricate URLs.
- **Protected Fields:** If `websiteUrl` or `labUrl` is listed in `directFields`, automated maintenance must never overwrite it.

---

## 2. Deep Discovery & Search Strategy

Do NOT stop after inspecting the official university bio page. Conduct a deep-dig search across academic web channels:

### A. Personal Academic Homepages (`websiteUrl`)
Search for maintained personal domains and platform sites:
- **Personal Domain Patterns:** `https://firstname-lastname.com`, `https://lastnamelab.org`, `https://firstnamelastname.github.io`
- **Academic Host Platforms:** Google Sites (`sites.google.com/view/...`), university personal user directories (`.edu/~username`), Notion/Quarto/Jekyll academic pages.
- **Search Queries:**
  ```text
  "<Scholar Name>" homepage OR "personal site" OR "github.io" OR "sites.google.com"
  ```

### B. Research Lab & Group Homepages (`labUrl`)
Search for active research group or laboratory sites:
- **Lab Naming Patterns:** `[Topic] Lab`, `[Scholar Surname] Research Group`, `[Abbreviation] Center`
- **Search Queries:**
  ```text
  "<Scholar Name>" "Research Group" OR "Laboratory" OR "Lab" -site:linkedin.com
  ```
- **Verification:** Inspect the lab team page (`/members`, `/people`, `/team`) to confirm the scholar is the Principal Investigator (PI) or Director.

---

## 3. Link Health & Auditing Protocol

Run the automated link repair suite to detect 404s, domain migrations, or generic directory fallbacks:

```bash
# Audit websiteUrl and labUrl entries
npm run check-links -- --field websiteUrl
npm run check-links -- --field labUrl
```

### Repair Actions
- **Confirmed 404 / Domain Expired:** If a personal domain or lab site has expired or returns 404, search for a migrated URL. If no replacement exists, remove the field and update `lastUpdatedAt`.
- **URL Duplication Fixes:** If a personal site matches `profileUrl` or `labUrl`, clear the duplicate field to maintain clean schema separation.

---

## 4. Batch Tracking & Execution Protocol

When executing batch backfills (such as those tracked in `WEBSITE_LAB_BACKFILL.md`):

1. Update `public/data.json` with verified `websiteUrl` and/or `labUrl`.
2. Advance `lastUpdatedAt` for every entry modified.
3. Update the corresponding batch status in `WEBSITE_LAB_BACKFILL.md`.
4. Run full repository validation:
   ```bash
   npm test && npm run build && git diff --check
   ```
5. Commit and push changes after each batch.
