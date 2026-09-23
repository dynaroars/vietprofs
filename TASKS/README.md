# VietProfs Autonomous Task Suite (`TASKS/`)

This directory contains executable task playbooks for maintaining the **VietProfs** codebase and roster data (`src/roster.json`).

---

## 🚀 One-Line Execution Model

Each playbook is pre-configured with an **Autonomous Goal Directive** header. You can trigger any workflow by typing `/goal TASKS/<filename>.md`:

```bash
/goal TASKS/discover_new_faculty.md
/goal TASKS/fetch_portraits.md
/goal TASKS/backfill_linkedin.md
/goal TASKS/check_google_scholar.md
/goal TASKS/verify_websites_and_labs.md
/goal TASKS/enrich_research_overviews.md
/goal TASKS/audit_education_chronology.md
/goal TASKS/audit_facts_and_honors.md
/goal TASKS/discover_academic_relationships.md
/goal TASKS/AUDIT_ISSUES_PRS.md
```

---

## 🔒 PR & Issue Submission Protocol (No Direct Commits to `main`)

To preserve git history and ensure multi-agent safety:

1. **Maintenance & Discovery Agents DO NOT commit directly to `main`** (relationship-discovery work is the sole owner-directed exception; see `discover_academic_relationships.md`):
   - **New roster ID vs. edit to an existing ID** (see `AGENTS.md`'s "New entries vs. edits" policy): adding a person to the roster requires assigning a brand-new immutable `vp-####` ID, which is a higher-stakes, harder-to-reverse action than editing a field on an already-vetted entry. Because of that, **any change that adds a new roster ID — a new faculty discovery, or any other brand-new `public/data.json` entry — MUST be proposed as a GitHub Issue**, with evidence and proposed fields, and never as a PR or direct commit.
   - Verified updates that only edit or correct **existing** roster IDs (facts, honors, links, portraits, degree chronology, etc.) MUST be committed on a dedicated topic branch (e.g. `task/verify-urls-batch-1`) and submitted as a **GitHub Pull Request**.
   - If an edit to an existing entry is ambiguous, unconfirmed by official sources, or protected by `directFields`, create a **GitHub Issue** detailing the finding instead of pushing a PR.
   - If a batch mixes new candidates and edits to existing entries, split them: PR the edits, and file a separate Issue per new candidate.

2. **Auditor Agent (`/goal TASKS/AUDIT_ISSUES_PRS.md`)**:
   - Reviews open Pull Requests and Issues.
   - Runs full verification (`npm test && npm run build && git diff --check`).
   - Squash-merges verified PRs into `main`, deletes topic branches, and closes resolved issues.

---

## 📋 Task Playbooks Overview

| Playbook | Purpose | Core Output |
| :--- | :--- | :--- |
| [`discover_new_faculty.md`](discover_new_faculty.md) | Search university directories, Google Scholar, DBLP, and conference rosters for eligible Vietnamese faculty outside Vietnam. | `src/roster.json` new entry Issues |
| [`fetch_portraits.md`](fetch_portraits.md) | Search official university sites and personal homepages for verified faculty headshots. | `src/roster.json` headshot PRs |
| [`backfill_linkedin.md`](backfill_linkedin.md) | Audit and backfill missing personal LinkedIn profile links. | `src/roster.json` LinkedIn PRs |
| [`check_google_scholar.md`](check_google_scholar.md) | Audit and backfill missing Google Scholar citation profile links. | `src/roster.json` Scholar PRs |
| [`verify_websites_and_labs.md`](verify_websites_and_labs.md) | Verify personal homepages, lab URLs, and resolve broken links. | `src/roster.json` URL PRs |
| [`enrich_research_overviews.md`](enrich_research_overviews.md) | Audit research area summaries and keywords against author publications. | `maintenance/enrichment.json` PRs |
| [`audit_education_chronology.md`](audit_education_chronology.md) | Audit undergrad, MS, PhD, and postdoc institutions and graduation years for chronological validity. | `src/roster.json` degree PRs |
| [`audit_facts_and_honors.md`](audit_facts_and_honors.md) | Audit honors, academy fellowships, and interesting facts against strict provenance rules. | `src/roster.json` honors PRs (existing IDs) / new-candidate Issues |
| [`discover_academic_relationships.md`](discover_academic_relationships.md) | Verify roster-internal advisor and postdoctoral mentorships, coauthorship, joint award leadership across NSF, NIH, and other public funders, and patent co-inventorship; personal relationships are prohibited. | `public/relationships.json` direct-to-`main` commits |
| [`AUDIT_ISSUES_PRS.md`](AUDIT_ISSUES_PRS.md) | Autonomous auditor agent that tests, squash-merges clean PRs into `main`, and closes resolved GitHub Issues. | Repository merge & issue closure |
