# Verify Homepages & Lab Websites (`verify_websites_and_labs.md`)

> **Autonomous Goal Directive (`/goal TASKS/verify_websites_and_labs.md`):**  
> Audit all personal academic websites and research lab URLs in `public/data.json`. Execute the link verification workflow across **ALL BATCHES CONTINUOUSLY** until **100% of entries in the repository are fully audited and processed**. Verify active HTTP status, fix broken/404 links, remove outdated domain redirects, and update new lab sites (`.edu/~user`, GitHub Pages, personal domains). Update `websiteUrl`, `labUrl`, `lastUpdatedAt`, and `lastVerified` fields. For each batch of verified updates, create a topic branch (`task/verify-urls-batch-[BATCH_NUM]`), run verification (`npm test && npm run build && git diff --check`), submit a GitHub PR (or Issue), return to `main`, and **IMMEDIATELY PROCEED TO THE NEXT BATCH**. Do NOT stop execution until ALL batches are completed!

---

## 🎯 Task Goal

Ensure all personal homepage and lab links across faculty directory profiles are active and accurate.

---

## 🛠️ Multi-Batch & Verification Rules

1. **Continuous Multi-Batch Mandate:**  
   Do NOT stop after completing a single batch. Iterate continuously through **all remaining batches** until 100% of roster entries are audited.
2. **Active HTTP Check:** Test links to ensure they resolve without HTTP 404, 500, or domain squatting.
   When a link is dead, don't just re-fetch the same URL or the institution's top-level directory
   (often JS-rendered and empty to a plain fetch) — search `"${name}" "${university}"` (or
   department) fresh first. A moved/renamed department page, personal/lab site, or research-database
   entry frequently turns up that a stale stored URL or generic directory search misses. A page that
   403s/404s directly may also render when re-fetched with a `Referer` header pointing at whatever
   page linked it.
3. **Local Verification:**
   ```bash
   npm test && npm run build && git diff --check
   ```
4. **PR / Issue Protocol:**
   - Submit per-batch updates via GitHub Pull Request on a topic branch.
   - Never commit directly to `main`.
