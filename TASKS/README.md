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

1. **Maintenance & Discovery Agents DO NOT commit directly to `main`**:
   - All roster maintenance updates, new faculty additions, and verified profile updates MUST be committed on a dedicated topic branch (e.g. `task/discover-faculty-batch-1`) and submitted as a **GitHub Pull Request**.
   - If an update is ambiguous, unconfirmed by official sources, or protected by `directFields`, create a **GitHub Issue** detailing the finding instead of pushing a PR.

2. **Auditor Agent (`/goal TASKS/AUDIT_ISSUES_PRS.md`)**:
   - Reviews open Pull Requests and Issues.
   - Runs full verification (`npm test && npm run build && git diff --check`).
   - Squash-merges verified PRs into `main`, deletes topic branches, and closes resolved issues.

---

## 📋 Task Playbooks Overview

| Playbook | Purpose | Core Output |
| :--- | :--- | :--- |
| [`discover_new_faculty.md`](discover_new_faculty.md) | Search university directories, Google Scholar, DBLP, and conference rosters for eligible Vietnamese faculty outside Vietnam. | `src/roster.json` new entry PRs |
| [`fetch_portraits.md`](fetch_portraits.md) | Search official university sites and personal homepages for verified faculty headshots. | `src/roster.json` headshot PRs |
| [`backfill_linkedin.md`](backfill_linkedin.md) | Audit and backfill missing personal LinkedIn profile links. | `src/roster.json` LinkedIn PRs |
| [`check_google_scholar.md`](check_google_scholar.md) | Audit and backfill missing Google Scholar citation profile links. | `src/roster.json` Scholar PRs |
| [`verify_websites_and_labs.md`](verify_websites_and_labs.md) | Verify personal homepages, lab URLs, and resolve broken links. | `src/roster.json` URL PRs |
| [`enrich_research_overviews.md`](enrich_research_overviews.md) | Audit research area summaries and keywords against author publications. | `maintenance/enrichment.json` PRs |
| [`audit_education_chronology.md`](audit_education_chronology.md) | Audit undergrad, MS, PhD, and postdoc institutions and graduation years for chronological validity. | `src/roster.json` degree PRs |
| [`audit_facts_and_honors.md`](audit_facts_and_honors.md) | Audit honors, academy fellowships, and interesting facts against strict provenance rules. | `src/roster.json` honors PRs |
| [`discover_academic_relationships.md`](discover_academic_relationships.md) | Verify roster-internal doctoral mentorship, documented postdoctoral mentorship, and coauthorship relationships; personal relationships are prohibited. | `public/relationships.json` roster-data PRs |
| [`AUDIT_ISSUES_PRS.md`](AUDIT_ISSUES_PRS.md) | Autonomous auditor agent that tests, squash-merges clean PRs into `main`, and closes resolved GitHub Issues. | Repository merge & issue closure |
