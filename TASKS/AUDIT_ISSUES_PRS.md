# Task Guide: Audit Open GitHub Issues, PRs, and Branches (`AUDIT_ISSUES_PRS.md`)

This document defines the standard operating procedure for auditing, verifying, merging, and closing open GitHub issues, pull requests (PRs), and topic branches in the **VietProfs** repository.

---

## ⚡ Batching & `/goal` Execution Protocol

When running this task (especially during a long-running or overnight `/goal` run):

1. **Strict Batch Size (1 PR / 5 Issues Per Batch):** Process open PRs one by one (`gh pr diff <id>`) and issues in batches of **5 issues per batch**. Do NOT rush or gloss over error output.
2. **Thorough Evidence Verification:** For every issue, cross-check live web evidence, verify degree/honors standards in `ROSTER_MAINTENANCE.md`, and check protected fields (`directFields`).
3. **Batch Test, Commit, Push, and Close Pipeline:**
   After resolving each PR or 5-issue batch:
   - Validate pipeline: `npm test && npm run build && git diff --check`
   - Commit batch changes if roster updated: `git commit -m "fix(roster): ..."`
   - Push to main: `git push origin main`
   - Close resolved PRs/issues with explanatory comments (`gh pr merge`, `gh issue close`).
4. **Resumable Loop:** Resume immediately with the next open PR or issue batch until all actionable open PRs and issues are processed.

---

## 1. Core Maintenance Principles

Before modifying data or closing issues, ensure compliance with repository rules:
- **Authoritative Reference:** [ROSTER_MAINTENANCE.md](../ROSTER_MAINTENANCE.md) dictates eligibility, degree formats, honors standards, rank vocabulary, and field mappings.
- **Direct Updates & `directFields`:** Information explicitly submitted by the repo owner or via a direct issue submission is treated as ground truth. Add each asserted field name to the entry's sorted `directFields` array.
- **Protected Direct Fields:** Fields listed in `directFields` must never be altered or removed by automated maintenance without explicit owner authorization. If web evidence conflicts with a protected field, do not edit it directly; file or update a GitHub issue for maintainer review.
- **Verification Requirement:** Never declare a task complete without local verification (`npm test`, `npm run build`, `git diff --check`).

---

## 2. Step-by-Step Audit Workflow

### Step 1: Audit & Process Open Pull Requests (PRs)
1. **List open PRs and branches:**
   ```bash
   gh pr list --state open
   git branch -a
   ```
2. **Inspect each PR diff and intent:**
   ```bash
   gh pr view <PR_NUMBER>
   gh pr diff <PR_NUMBER>
   ```
3. **Verify PR quality & test suite:**
   - Ensure the PR follows data-entry standards.
   - Run tests locally or on the branch:
     ```bash
     npm test && npm run build && git diff --check
     ```
4. **Merge verified PRs:**
   ```bash
   gh pr merge <PR_NUMBER> --squash --delete-branch
   ```
5. **Handle conflicts & duplicate PRs:**
   - If a scheduled PR is duplicate or superseded by an earlier merged PR (e.g. backfilling the same `linkedinUrl`), close it with an explanatory comment:
     ```bash
     gh pr close <PR_NUMBER> --comment "Closed as duplicate/superseded: URL already backfilled and merged in PR #..."
     ```
   - If git conflicts occur in `public/data.json`, pull `main`, resolve line offsets, run validation, and merge.

---

### Step 2: Audit & Resolve Open GitHub Issues
1. **List and fetch open issues:**
   ```bash
   gh issue list --state open
   gh issue view <ISSUE_NUMBER>
   ```
2. **Categorize and process each issue:**

   - **A. Direct Updates / Candidate Submissions:**
     - Ground truth info submitted by owner/user.
     - Add asserted fields to the entry's sorted `directFields` array.
     - Ensure Western display name order (`First (Middle) Last`) in `name` and Vietnamese order in `vietnameseName`.
     - Assign immutable profile IDs for new additions: `npm run assign-profile-ids -- --apply`.

   - **B. Honors & Award Additions:**
     - Check against `ROSTER_MAINTENANCE.md` honors eligibility.
     - Accept: National academy elections (`academy`), major career/fellowship awards (`career_award`), discipline-wide major distinctions (`major_award`), named/distinguished chairs (`distinguished_professorship`).
     - Reject: Routine conference or division best-paper awards. Explain exclusion in issue comment and close.

   - **C. Stale Rank / Department / Institution / profileUrl / Education:**
     - Verify against live official university profiles or primary sources.
     - Update fields as verified (`rank`, `department`, `university`, `profileUrl`, `phdInstitution`, etc.).

   - **D. Mismatched `researchOverview`:**
     - Regenerate 1–3 sentence neutral academic summary from the scholar's official profile/homepage.
     - Ensure no gendered pronouns, raw HTML entities, or scraped boilerplate.

   - **E. Multi-item Maintenance Sweeps:**
     - Update verified items.
     - If a canonical `name` is changed (e.g., `Son Phan Lam Tran` → `Lam-Son Phan Tran`), rename the corresponding key in `maintenance/verification.json`.

---

### Step 3: Synchronize Ledgers & Field Overrides
1. **Assign Profile IDs:**
   ```bash
   npm run assign-profile-ids -- --apply
   ```
2. **Update `maintenance/verification.json`:**
   - Map every roster entry name to an ISO timestamp.
   - Preserve alphabetical key sorting.
3. **Update `src/data.ts` (Field Overrides):**
   - If a new institution or department falls into unmapped `Others`, add an entry to `FIELD_OVERRIDES` in `src/data.ts`.
4. **Update `maintenance/enrichment.json`:**
   ```bash
   npm run enrich -- snapshot
   ```

---

### Step 4: Validate, Commit, and Push
1. **Run full verification pipeline:**
   ```bash
   npm test && npm run build && git diff --check
   ```
2. **Commit and push changes:**
   ```bash
   git add maintenance/enrichment.json maintenance/verification.json public/data.json src/data.ts
   git commit -m "fix(roster): resolve open github issue updates, honors, and direct submissions"
   git push origin main
   ```

---

### Step 5: Close GitHub Issues
Close resolved issues with a clear summary comment:
```bash
gh issue close <ISSUE_NUMBER> --comment "Verified and resolved: <SUMMARY_OF_CHANGES>"
```
For ongoing tracking issues (e.g., dead link tracking or ambiguous eligibility calls requiring owner decision), post an updated audit comment summarizing progress and leave open.

---

## 3. Quick Command Reference

```bash
# PR & Issue inspection
gh pr list --state open
gh issue list --state open
gh pr diff <PR_NUM>
gh issue view <ISSUE_NUM>

# Roster synchronization
npm run assign-profile-ids -- --apply
npm run enrich -- snapshot

# Local testing & build validation
npm test
npm run build
git diff --check

# Merging & Issue closure
gh pr merge <PR_NUM> --squash --delete-branch
gh issue close <ISSUE_NUM> --comment "..."
```
