# Backfill LinkedIn Profiles (`backfill_linkedin.md`)

> **Autonomous Goal Directive (`/goal TASKS/backfill_linkedin.md`):**  
> Systematically search for missing LinkedIn profile links in `public/data.json`. Execute the research and backfill workflow batch by batch until every missing entry has been audited (across runs; a scheduled run stops at its batch cap per `AGENTS.md`). Perform multi-query research using name, affiliation, department, and degree. Validate that candidate LinkedIn profiles match the exact individual. Update `linkedinUrl` and `lastUpdatedAt` (never the verification ledger). For each batch of verified updates, create a topic branch (`task/backfill-linkedin-batch-[BATCH_NUM]`), run verification (`npm test && npm run build && git diff --check`), submit a GitHub PR (or Issue), return to `main`, and continue with the next batch.

---

## 🎯 Task Goal

Achieve complete, verified LinkedIn profile coverage across the entire roster.

---

## 🛠️ Multi-Batch & Verification Rules

1. **Batching:** Keep going batch after batch in interactive runs; scheduled runs stop at the batch cap in `AGENTS.md`. Skip entries touched by an open PR from this task.
2. **Identity Confirmation:** Verify name, degree stage, advisor, and university affiliation before accepting a LinkedIn profile link.
3. **URL Normalization:** Standardize to `https://www.linkedin.com/in/username/`.
4. **Local Verification:**
   ```bash
   npm test && npm run build && git diff --check
   ```
5. **Timestamps:** Set `lastUpdatedAt` on changed entries; do not touch `maintenance/verification.json` (a single-field backfill is not a full review).
6. **Submission:** Submit per-batch edits as a PR on a topic branch, per the routing table in `AGENTS.md`. Never commit directly to `main`. Protected `directFields` conflicts go to an Issue.
