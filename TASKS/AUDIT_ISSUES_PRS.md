# Task Guide: Audit Open GitHub Issues, PRs, and Branches (`AUDIT_ISSUES_PRS.md`)

This document defines the standard operating procedure for auditing, verifying, merging, and closing open GitHub issues, pull requests (PRs), and topic branches in the **VietProfs** repository.

---

## ⚡ Role & `/goal` Execution Protocol

### Primary Audit & Merge Role
In this multi-agent architecture:
- **Task Agents** (`fetch_portraits.md`, `backfill_linkedin.md`, `check_google_scholar.md`, `verify_websites_and_labs.md`, `enrich_research_overviews.md`, `audit_facts_and_honors.md`) discover data, perform deep research, create topic branches, and **file GitHub Pull Requests or GitHub Issues**. Task agents DO NOT commit directly to `main` or merge their own PRs.
- **Audit Agent (`AUDIT_ISSUES_PRS.md`):** Acts as the primary auditor. Reviews all open PRs, verifies diffs, executes test suites (`npm test`, `npm run build`), **squash-merges verified PRs**, deletes topic branches, processes issues, and updates ledgers.

> **No PR-for-an-issue-fix step.** When auditing a GitHub *issue* (not a PR), the fix flow is: verify the
> claim live, apply the change, run the validation pipeline, **commit and push straight to `main`** (Step
> 4), then close the issue (Step 5). Do not open a separate PR for the auditor's own already-audited
> single-issue fix — that's a Task-Agent behavior, not an Audit-Agent one, and adds a redundant review
> cycle for something that was already independently verified. Only merge-vs-squash applies to PRs that
> Task Agents already opened.

---

## ⚡ Batching & `/goal` Protocol

When running this task (especially during a long-running or overnight `/goal` run):

1. **Strict Batch Size (1 PR / 5 Issues Per Batch):** Process open PRs one by one (`gh pr diff <id>`) and issues in batches of **5 issues per batch**. Do NOT rush or gloss over error output.
2. **Thorough Evidence Verification:** For every PR and issue, cross-check live web evidence, verify degree/honors standards in `ROSTER_MAINTENANCE.md`, and check protected fields (`directFields`).
3. **Batch Test, Merge, Push, and Close Pipeline:**
   After resolving each PR or 5-issue batch:
   - Validate pipeline: `npm test && npm run build && git diff --check`
   - Merge clean PRs: `gh pr merge <PR_NUMBER> --squash --delete-branch`
   - Pull `main` to sync local repo: `git checkout main && git pull origin main`
   - Close resolved issues with explanatory comments (`gh issue close <ISSUE_NUMBER> --comment "..."`).
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
   - **Always test the PR merged into a fresh `main`, never the PR branch in isolation.** A duplicate
     `vp-####` id introduced by this PR and by another PR merged since this branch was created will
     **not** show up as a git conflict — two entries with the same id value in different, non-adjacent
     parts of `public/data.json` merge cleanly at the text level, and `gh pr merge --squash` would
     happily push that straight into `main`. The only thing that catches it is running the full test
     suite (`validate-data.ts`'s duplicate-id check) against the actual merged result:
     ```bash
     git checkout main && git pull origin main
     git checkout -b audit/pr-<PR_NUMBER> main
     git merge --no-ff <pr-head-branch>   # or: gh pr checkout <PR_NUMBER>, then: git merge main
     npm test && npm run build && git diff --check
     git checkout main && git branch -D audit/pr-<PR_NUMBER>   # clean up the scratch branch
     ```
   - Treat a passing `git merge` that then fails `npm test` with `duplicate id: vp-####` exactly like a
     textual conflict (see Step 5): identify which entries are new relative to `main`, clear only their
     `id` field, run `npm run assign-profile-ids -- --apply` to remint fresh ids, and re-run the test
     suite before proceeding. Also patch any other file this PR touches that referenced the discarded
     id (e.g. `maintenance/enrichment.json`'s `ids`/`batches`/`entries`).
4. **Merge verified PRs** — only after the fresh-`main`+PR combination above passes cleanly:
   ```bash
   gh pr merge <PR_NUMBER> --squash --delete-branch
   ```
5. **Handle conflicts & duplicate PRs:**
   - If a scheduled PR is duplicate or superseded by an earlier merged PR (e.g. backfilling the same `linkedinUrl`), close it with an explanatory comment:
     ```bash
     gh pr close <PR_NUMBER> --comment "Closed as duplicate/superseded: URL already backfilled and merged in PR #..."
     ```
   - If git conflicts occur in `public/data.json` (or the id-collision case above), pull `main`, resolve line offsets or reassign colliding ids, re-run validation, and merge.

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
