# Task Guide: Audit Open GitHub Issues, PRs, and Branches (`AUDIT_ISSUES_PRS.md`)

This document defines the standard operating procedure for auditing, verifying, merging, and closing open GitHub issues, pull requests (PRs), and topic branches in the **VietProfs** repository.

---

## ⚡ Role & `/goal` Execution Protocol

### Primary Audit & Merge Role
In this multi-agent architecture:
- **Task Agents** (`fetch_portraits.md`, `backfill_linkedin.md`, `check_google_scholar.md`, `verify_websites_and_labs.md`, `audit_facts_and_honors.md`) discover data, perform deep research, create topic branches, and **file GitHub Pull Requests or GitHub Issues**. Task agents DO NOT commit directly to `main` or merge their own PRs.
- **Audit Agent (`AUDIT_ISSUES_PRS.md`):** Acts as the primary auditor. Reviews all open PRs, verifies diffs, executes test suites (`npm test`, `npm run build`), **squash-merges verified PRs**, deletes topic branches, processes issues, and updates ledgers.

> **One fix PR per run.** When auditing a GitHub *issue* (not a PR), the fix flow is: verify the
> claim live, apply the change on the run's `audit-fix/<date>` branch, run the validation pipeline,
> open one PR for all of the run's fixes and squash-merge it on green CI (Step 4); the PR's
> `Closes #n` lines close the Issues (Step 5). Scheduled runs never push to `main` directly: the
> cloud permission check denies it, and fixes left only as Issue comments never reach the roster.
> A local owner session may still commit a single verified fix straight to `main`.

### Independent review (agent checks agent)

PRs and Issues from task agents exist so that a separate agent can check them. The auditor
therefore:

- does not audit or merge a PR/Issue that it opened itself or that was opened in the same
  session, and in scheduled runs skips anything created less than 12 hours ago (the next audit run
  picks it up);
- re-verifies claims against live sources rather than trusting the PR description; a PR's own
  "verified" note is not evidence;
- merges only when the PR's CI checks are green (check the PR's status checks; wait or skip if
  they are pending or failing);
- when it rejects part of a PR, requests changes or closes it with a comment that names each
  rejected entry and the reason. It doesn't silently drop entries and merge the rest.

In scheduled runs, handle at most 5 PRs and 10 Issues per run, oldest first, and leave the rest
for the next run.

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
- **Direct Updates & `directFields`:** Apply every field an owner or direct submission asserts. Only `name`, `vietnameseName`, `honors`, `portrait`, and `portraitSource` go in the sorted `directFields` array (see `AGENTS.md` "Direct updates").
- **Protected Direct Fields:** Those five fields must never be altered or removed by automated maintenance. If web evidence conflicts with one, file or update a GitHub issue for the owner. Appointment facts, degrees, and links are never protected: update them from the current official page.
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
     id (e.g. rows in `maintenance/portrait-queue.json`). Reminting is only for ids
     that never reached `main`; an id already on `main` is permanent (see `ROSTER_MAINTENANCE.md`
     "One person, one ID").
   - **Check that nothing on `main` disappears.** A branch that rewrote `public/data.json` from a stale
     copy drops every entry added to `main` since it branched, plus later edits, and still merges
     cleanly (fc655f5 on 2026-09-12 lost 22 people and undid a field removal this way). On the scratch
     branch, list ids that `main` has and the merge result doesn't:
     ```bash
     comm -23 <(git show main:public/data.json | grep -o '"id": "vp-[0-9]*"' | sort) <(grep -o '"id": "vp-[0-9]*"' public/data.json | sort)
     ```
     Any id the PR doesn't explicitly remove (with a reason and a `maintenance/retired-ids.json` row)
     means a stale overwrite: request changes, don't merge.
4. **Merge verified PRs** — only after the fresh-`main`+PR combination above passes cleanly, and
   comment with what you re-verified first (`docs/AUTOMATION.md` convention 10):
   ```bash
   gh pr comment <PR_NUMBER> --body "Re-verified <ids> live on <date>; CI green; merged."
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
     - Ground truth info submitted by owner/user, and — per `AGENTS.md`'s "New entries vs. edits" policy — every brand-new roster candidate proposed by `discover_new_faculty.md` or `audit_facts_and_honors.md`, since a new roster ID always arrives here as an Issue rather than a PR.
     - Apply the submitted fields; add asserted `name`/`vietnameseName`/`honors`/`portrait`/`portraitSource` to the sorted `directFields` array (owner/user submissions only, not independently-sourced candidate research).
     - Ensure Western display name order (`First (Middle) Last`) in `name` and Vietnamese order in `vietnameseName`.
     - Re-verify eligibility (appointment, track, institution type) against live sources before assigning an ID — an Issue is a proposal, not a pre-cleared fact.
     - Re-run the dedup check from `TASKS/candidate_intake.md` step 1 (`npm run find-roster-matches -- "<name>" --url ...` with every identity URL in the Issue) against the current `public/data.json`; the Issue's "not on the roster" claim may be stale. A hit at another institution is a probable move: if it's the same person, update that entry in place (the Issue's fields become an edit, with owner-asserted ones in `directFields`) and close the Issue naming the existing ID. See `ROSTER_MAINTENANCE.md` "One person, one ID".
     - A retired-ID hit means the person was on the roster before: add them back under that original ID and remove it from `maintenance/retired-ids.json`, instead of assigning a new one.
     - Assign immutable profile IDs for genuinely new people only: `npm run assign-profile-ids -- --apply`.
     - Scheduled cloud audits stop before adding a genuinely new person: they comment "verified, ready for owner" with a ready-to-paste entry and leave the Issue open for the owner to add locally (`docs/AUTOMATION.md`, auditor "New-candidate Issues").
     - When adding a new entry locally, also fetch its portrait if the Issue or the verified official profile page has a clear single-person headshot: validate with `identify` (≥120×120, aspect ≤1.55), convert to WebP in `public/portraits/`, set `portrait` and the direct original URL as `portraitSource`. Don't leave it for the weekly `portraits` routine.

   - **B. Honors & Award Additions:**
     - Check against `ROSTER_MAINTENANCE.md` honors eligibility.
     - Accept: National academy elections (`academy`), major career/fellowship awards (`career_award`), discipline-wide major distinctions (`major_award`), named/distinguished chairs (`distinguished_professorship`).
     - Reject: Routine conference or division best-paper awards. Explain exclusion in issue comment and close.

   - **C. Stale Rank / Department / Institution / profileUrl / Education:**
     - Verify against live official university profiles or primary sources.
     - Update fields as verified (`rank`, `department`, `university`, `profileUrl`, `phdInstitution`, etc.).
     - For a dead `profileUrl`/`portraitSource`, don't stop at re-fetching the same stale URL or the
       institution's top-level directory (which is often JS-rendered and returns nothing to a plain
       fetch). Search `"${name}" "${university}"` (or department) fresh — a department-specific page,
       personal/lab site, or research-database entry frequently surfaces that a generic directory
       search misses, and a page that 404s directly may still render when fetched with a `Referer`
       header pointing at the page that linked it.

   - **C2. Duplicate entries (`Duplicate roster entry:` Issues, or two IDs found for one person):**
     - Keep the **older (lower) ID**, even when the newer entry has protected `directFields` or more data; protected values move with the data onto the older ID. Follow `ROSTER_MAINTENANCE.md` "One person, one ID": put the verified current facts and unique sourced fields on the older entry, drop fields that only fit the other institution, delete the newer entry, then run `npm run retire-profile-id -- <newer-id> --into <older-id> --reason "..." --apply` (it also rewrites every maintenance-file reference).
     - If the older ID was already removed (a merge that kept the newer one, or a person re-added after removal), restore it: `npm run retire-profile-id -- <newer-id> --into <older-id> --reason "..." --apply` renames the entry back.

   - **D. Multi-item Maintenance Sweeps:**
     - Update verified items.

---

### Step 3: Synchronize Ledgers & Field Overrides
1. **Assign Profile IDs:**
   ```bash
   npm run assign-profile-ids -- --apply
   ```
2. **Update `src/data.ts` (Field Overrides):**
   - If a new institution or department falls into unmapped `Others`, add an entry to `FIELD_OVERRIDES` in `src/data.ts`.

---

### Step 4: Validate and Land the Fixes Through One PR
Scheduled audit runs never push to `main` directly (see `docs/AUTOMATION.md` "Applying fixes"; the
cloud permission check blocks it). Make every verified fix on one branch:
1. **Branch from fresh `main` and commit one Issue at a time:**
   ```bash
   git checkout -B audit-fix/$(date -u +%F) origin/main
   # ...apply the fix for one Issue...
   git add -A public/data.json public/updates.json maintenance/ src/data.ts
   git commit -m "fix(roster): <what changed> (Closes #<n>)"
   ```
2. **Validate, push the branch, open the PR, merge on green CI:**
   ```bash
   npm test && npm run build && git diff --check
   git push -u origin HEAD
   # open "[scheduled:audit] Verified Issue fixes (<date>)" listing each Issue and its evidence,
   # with one "Closes #<n>" line per Issue (a comma-separated list only closes the first),
   # wait for CI to pass, then squash-merge it (the GitHub MCP merge tool or gh pr merge --squash)
   ```
   A local owner session may still commit a single verified fix straight to `main`; it then
   closes the Issue explicitly with a comment (Step 5), not only through the commit's `Closes #n`.

---

### Step 5: Close GitHub Issues
Every close gets a comment saying what was found and what was done (`docs/AUTOMATION.md`
convention 10). Issues that the fix PR's `Closes #n` already closed still get a comment with the
change and its source. Close other resolved issues with a clear summary comment:
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
npm run find-roster-matches -- "<name>" --url <url>

# Local testing & build validation
npm test
npm run build
git diff --check

# Merging & Issue closure
gh pr merge <PR_NUM> --squash --delete-branch
gh issue close <ISSUE_NUM> --comment "..."
```
