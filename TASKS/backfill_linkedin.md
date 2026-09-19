# Backfill LinkedIn Profiles (`backfill_linkedin.md`)

> **Autonomous Goal Directive (`/goal TASKS/backfill_linkedin.md`):**  
> Systematically search for missing LinkedIn profile links in `public/data.json`. Execute the research and backfill workflow across **ALL BATCHES CONTINUOUSLY** until **100% of missing entries in the repository are fully audited and processed**. Perform multi-query research using name, affiliation, department, and degree. Validate that candidate LinkedIn profiles match the exact individual. Update `linkedinUrl`, `lastUpdatedAt`, `lastVerified` fields. For each batch of verified updates, create a topic branch (`task/backfill-linkedin-batch-[BATCH_NUM]`), run verification (`npm test && npm run build && git diff --check`), submit a GitHub PR (or Issue), return to `main`, and **IMMEDIATELY PROCEED TO THE NEXT BATCH**. Do NOT stop execution until ALL batches are completed!

---

## 🎯 Task Goal

Achieve complete, verified LinkedIn profile coverage across the entire roster.

---

## 🛠️ Multi-Batch & Verification Rules

1. **Continuous Multi-Batch Mandate:**  
   Do NOT stop after completing a single batch. Iterate continuously through **all remaining batches** until 100% of missing entries are audited.
2. **Identity Confirmation:** Verify name, degree stage, advisor, and university affiliation before accepting a LinkedIn profile link.
3. **URL Normalization:** Standardize to `https://www.linkedin.com/in/username/`.
4. **Local Verification:**
   ```bash
   npm test && npm run build && git diff --check
   ```
5. **PR / Issue Protocol:**
   - Submit per-batch updates via GitHub Pull Request on a topic branch.
   - Never commit directly to `main`.
