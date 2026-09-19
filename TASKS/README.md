# VietProfs Maintenance Tasks

This directory contains standardized task guides and playbooks for recurring roster maintenance operations in the **VietProfs** repository.

## Available Task Playbooks

1. **[fetch_portraits.md](fetch_portraits.md)**: Scholar portrait discovery, visual auditing, image inspection tools (`fast_portrait_analyzer.py`), aspect ratio rules, WebP conversion, non-person/hallucinated image rejection (no logos, silhouettes, wordmarks, or group photos), and provenance ledger logging (`portrait-provenance.json`).
2. **[backfill_linkedin.md](backfill_linkedin.md)**: Multi-query discovery, identity disambiguation, cross-checking PhD/institution/field, canonical URL formatting, and backfilling personal LinkedIn profile URLs (`linkedinUrl`).
3. **[check_google_scholar.md](check_google_scholar.md)**: Verification, canonical formatting (`citations?user=...`), link health auditing, 404 repair, and homonym disambiguation for Google Scholar profile URLs (`scholarUrl`).
4. **[verify_websites_and_labs.md](verify_websites_and_labs.md)**: Deep discovery of personal homepages (`websiteUrl`) and research group/lab sites (`labUrl`), distinct URL rules, link persistence checks, and batch tracking.
5. **[enrich_research_overviews.md](enrich_research_overviews.md)**: Multi-source synthesis of 1–3 sentence academic summaries (`researchOverview`), strict quality sanitization (no HTML entities, no scraped UI boilerplate, no gendered pronouns), mismatch detection, and enrichment snapshot management.
6. **[audit_facts_and_honors.md](audit_facts_and_honors.md)**: Deep verification of degree credentials (`phdInstitution`, `phdYear`, `msInstitution`, `undergradInstitution`, `postdocInstitution`), degree chronology validation, honors categorization (`academy`, `career_award`, `major_award`, `fellow`, `distinguished_professorship`), paper-award exclusions, and strict `directFields` protection governance.
7. **[AUDIT_ISSUES_PRS.md](AUDIT_ISSUES_PRS.md)**: Complete workflow for auditing open GitHub issues, pull requests, and branches, merging verified PRs, processing direct updates, updating ledgers, running local test pipelines, and closing resolved issues.

---

## Invoking Tasks in Antigravity Agent Sessions

To instruct an agent to perform a specific task, reference the task file in your prompt:
> "Please follow the procedure in `TASKS/fetch_portraits.md` to discover, visually audit, and fetch portraits for missing roster entries."
> "Please follow the procedure in `TASKS/backfill_linkedin.md` to research and backfill LinkedIn URLs."
> "Please follow the procedure in `TASKS/AUDIT_ISSUES_PRS.md` to audit and process all open GitHub issues and PRs."
