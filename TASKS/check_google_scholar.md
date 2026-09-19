# Check & Backfill Google Scholar Profiles (`check_google_scholar.md`)

> **Autonomous Goal Directive (`/goal TASKS/check_google_scholar.md`):**  
> Audit missing Google Scholar citation profile links in `public/data.json`. Execute the audit and backfill workflow across **ALL BATCHES CONTINUOUSLY** until **100% of missing entries in the repository are fully audited and processed**. Perform targeted web searches to identify authentic Google Scholar user IDs matching faculty publication records. Update `scholarUrl`, `lastUpdatedAt`, and `lastVerified` fields. For each batch of verified updates, create a topic branch (`task/check-scholar-batch-[BATCH_NUM]`), run verification (`npm test && npm run build && git diff --check`), submit a GitHub PR (or Issue), return to `main`, and **IMMEDIATELY PROCEED TO THE NEXT BATCH**. Do NOT stop execution until ALL batches are completed!

---

## 🎯 Task Goal

Ensure all scholars with active Google Scholar profiles have verified citation profile links.

---

## 🛠️ Multi-Batch & Verification Rules

1. **Continuous Multi-Batch Mandate:**  
   Do NOT stop after completing a single batch. Iterate continuously through **all remaining batches** until 100% of missing entries are audited.
2. **Profile Disambiguation:** Verify author papers, co-authors, and institutional affiliation listed on Google Scholar.
3. **URL Standard:** `https://scholar.google.com/citations?user=USER_ID`.
4. **Local Verification:**
   ```bash
   npm test && npm run build && git diff --check
   ```
5. **PR / Issue Protocol:**
   - Submit per-batch updates via GitHub Pull Request on a topic branch.
   - Never commit directly to `main`.
