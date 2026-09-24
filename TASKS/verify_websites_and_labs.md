# Verify Homepages & Lab Websites (`verify_websites_and_labs.md`)

> **Autonomous Goal Directive (`/goal TASKS/verify_websites_and_labs.md`):**  
> Audit all personal academic websites and research lab URLs in `public/data.json`. Execute the link verification workflow batch by batch until every entry has been audited (across runs; a scheduled run stops at its batch cap per `AGENTS.md`). Verify active HTTP status, fix broken/404 links, remove outdated domain redirects, and update new lab sites (`.edu/~user`, GitHub Pages, personal domains). Update `websiteUrl`, `labUrl`, and `lastUpdatedAt` (never the verification ledger). For each batch of verified updates, create a topic branch (`task/verify-urls-batch-[BATCH_NUM]`), run verification (`npm test && npm run build && git diff --check`), submit a GitHub PR (or Issue), return to `main`, and continue with the next batch.

---

## 🎯 Task Goal

Ensure all personal homepage and lab links across faculty directory profiles are active and accurate.

---

## 🛠️ Multi-Batch & Verification Rules

1. **Batching:** Keep going batch after batch in interactive runs; scheduled runs stop at the batch cap in `AGENTS.md`. Skip entries touched by an open PR from this task.
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
4. **Timestamps:** Set `lastUpdatedAt` on changed entries; do not touch `maintenance/verification.json` (a single-field backfill is not a full review).
5. **Submission:** Submit per-batch edits as a PR on a topic branch, per the routing table in `AGENTS.md`. Never commit directly to `main`. Protected `directFields` conflicts go to an Issue.
