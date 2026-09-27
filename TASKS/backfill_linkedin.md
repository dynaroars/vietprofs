# Backfill LinkedIn Profiles (`backfill_linkedin.md`)

> **Autonomous Goal Directive (`/goal TASKS/backfill_linkedin.md`):**  
> Systematically search for missing LinkedIn profile links in `public/data.json`. Execute the research and backfill workflow batch by batch until every missing entry has been audited (across runs; a scheduled run stops at its batch cap per `AGENTS.md`). Perform multi-query research using name, affiliation, department, and degree. Validate that candidate LinkedIn profiles match the exact individual. Update `linkedinUrl`; `npm test` stamps `lastUpdatedAt`. On a schedule this runs inside the `links` routine. For each batch of verified updates, create a topic branch (`task/backfill-linkedin-batch-[BATCH_NUM]`), run verification (`npm test && npm run build && git diff --check`), submit a GitHub PR (or Issue), return to `main`, and continue with the next batch.

---

## 🎯 Task Goal

Achieve complete, verified LinkedIn profile coverage across the entire roster.

---

## 🛠️ Multi-Batch & Verification Rules

1. **Batching:** Keep going batch after batch in interactive runs; scheduled runs stop at the batch cap in `AGENTS.md`. Skip entries touched by an open PR from this task.
2. **Identity Confirmation:** Verify name and current university affiliation, plus the rank or field where shown, before accepting a LinkedIn profile link. A name alone is never enough. See "Verifying without fetching LinkedIn" below.
3. **URL Normalization:** Standardize to `https://www.linkedin.com/in/username/`. Use the address the search index shows now; LinkedIn usernames get renamed, so an older address in an Issue may be out of date.
4. **Local Verification:**
   ```bash
   npm test && npm run build && git diff --check
   ```
5. **Timestamps:** `npm test` stamps `lastUpdatedAt` on changed entries.
6. **Submission:** Submit per-batch edits as a PR on a topic branch, per the routing table in `AGENTS.md`. Never commit directly to `main`. Protected `directFields` conflicts go to an Issue.

---

## 🔎 Verifying without fetching LinkedIn

LinkedIn returns HTTP 999 to scripts and WebFetch, even with Full network access, so the profile
page itself can't be read. Don't leave the field empty for that reason alone. Use these sources,
strongest first, and stop at the first one that settles it:

1. **Linked from an official or personal page.** The faculty profile, homepage, or CV links the
   LinkedIn URL. Accept it.
2. **Owner-supplied.** The owner gave the URL (for example, in a candidate Issue). It's a direct
   update: accept it as given.
3. **Search-indexed profile title.** Run a web search restricted to `linkedin.com` with the name,
   institution, and the username if known (e.g. `"Giang Hoang" Monash linkedin
   giang-hoang-327807353`). Accept only when the indexed title or snippet for that exact username
   names the same person **and** the roster's current institution, e.g. "Giang Hoang – Assistant
   Lecturer – Monash University". A matching rank, field, or post about the job makes it stronger.

Reject, and leave the field empty, when:
- no indexed title for that username names the institution;
- the index has two or more plausible profiles for the same name and institution (e.g. one titled
  "Associate professor at East Carolina University" and another with only credentials). Say which
  ones in the PR so the owner can pick;
- the only match is a similarly named person the Issue or roster already warns about.

In the PR body, give each accepted URL with the source that settled it (the page that links it, or
the indexed title quoted word for word) so the auditor can re-run the same search.
