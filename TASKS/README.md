# VietProfs Autonomous Task Suite (`TASKS/`)

This directory contains executable task playbooks for maintaining the **VietProfs** codebase and roster data (`public/data.json`).

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
/goal TASKS/candidate_intake.md
/goal TASKS/AUDIT_ISSUES_PRS.md
```

---

## 🔒 Submission Protocol

Where each kind of change lands (new-ID Issues, edit PRs, direct-to-`main` exceptions) is defined
once in the "Where each kind of change lands" table in [`AGENTS.md`](../AGENTS.md). Playbooks
point there instead of restating it. Unattended/scheduled runs also follow that file's
"Unattended and scheduled runs" batch cap. The schedule and the side-findings convention for all playbooks
are in [`docs/AUTOMATION.md`](../docs/AUTOMATION.md).

---

## 📋 Task Playbooks Overview

| Playbook | Purpose | Core Output |
| :--- | :--- | :--- |
| [`discover_new_faculty.md`](discover_new_faculty.md) | Search university directories, Google Scholar, DBLP, and conference rosters for eligible Vietnamese faculty outside Vietnam. | `public/data.json` new entry Issues |
| [`fetch_portraits.md`](fetch_portraits.md) | Search official university sites and personal homepages for verified faculty headshots. | `public/data.json` headshot PRs |
| [`backfill_linkedin.md`](backfill_linkedin.md) | Audit and backfill missing personal LinkedIn profile links. | `public/data.json` LinkedIn PRs |
| [`check_google_scholar.md`](check_google_scholar.md) | Audit and backfill missing Google Scholar citation profile links. | `public/data.json` Scholar PRs |
| [`verify_websites_and_labs.md`](verify_websites_and_labs.md) | Verify personal homepages, lab URLs, and resolve broken links. | `public/data.json` URL PRs |
| [`enrich_research_overviews.md`](enrich_research_overviews.md) | Audit research area summaries and keywords against author publications. | `maintenance/enrichment.json` PRs |
| [`audit_education_chronology.md`](audit_education_chronology.md) | Audit undergrad, MS, PhD, and postdoc institutions and graduation years for chronological validity. | `public/data.json` degree PRs |
| [`audit_facts_and_honors.md`](audit_facts_and_honors.md) | Audit honors, academy fellowships, and interesting facts against strict provenance rules. | `public/data.json` honors PRs (existing IDs) / new-candidate Issues |
| [`discover_academic_relationships.md`](discover_academic_relationships.md) | Verify roster-internal advisor and postdoctoral mentorships, coauthorship, joint award leadership across NSF, NIH, and other public funders, and patent co-inventorship; personal relationships are prohibited. | `public/relationships.json` direct-to-`main` commits |
| [`candidate_intake.md`](candidate_intake.md) | Dedup, vet, and enrich candidate names the owner pastes into a conversation. | One new-candidate Issue per eligible person |
| [`AUDIT_ISSUES_PRS.md`](AUDIT_ISSUES_PRS.md) | Autonomous auditor agent that tests, squash-merges clean PRs into `main`, and closes resolved GitHub Issues. | Repository merge & issue closure |
