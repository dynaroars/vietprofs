# VietProfs Maintenance Tasks

This directory contains standardized task guides and playbooks for recurring roster maintenance operations in the **VietProfs** repository.

---

## 🏗️ Multi-Agent Workflow Architecture

The repository uses a 2-tier multi-agent workflow for all automated and batch maintenance tasks:

1. **Task Execution Agents (No Direct Commits to `main`):**
   - Task agents (`fetch_portraits.md`, `backfill_linkedin.md`, `check_google_scholar.md`, `verify_websites_and_labs.md`, `enrich_research_overviews.md`, `audit_facts_and_honors.md`) discover data, perform deep research, create topic branches, and **file GitHub Pull Requests or GitHub Issues**.
   - Task agents MUST NOT commit directly to `main` or merge their own PRs.
   - For ambiguous, unconfirmed, or protected field conflicts, task agents file GitHub Issues.

2. **Audit & Merge Agent (`AUDIT_ISSUES_PRS.md`):**
   - The dedicated audit agent running `TASKS/AUDIT_ISSUES_PRS.md` reviews all open PRs and Issues.
   - Verifies diffs, runs test pipelines (`npm test`, `npm run build`, `git diff --check`), squash-merges clean PRs, deletes topic branches, and processes/closes issues.

---

## Available Task Playbooks

1. **[fetch_portraits.md](fetch_portraits.md)**: Scholar portrait discovery, visual auditing, image inspection tools (`fast_portrait_analyzer.py`), aspect ratio rules, WebP conversion, non-person/hallucinated image rejection (no logos, silhouettes, wordmarks, or group photos), provenance ledger logging (`portrait-provenance.json`), and GitHub PR/Issue submission.
2. **[backfill_linkedin.md](backfill_linkedin.md)**: Multi-query discovery, identity disambiguation, cross-checking PhD/institution/field, canonical URL formatting, backfilling personal LinkedIn profile URLs (`linkedinUrl`), and GitHub PR/Issue submission.
3. **[check_google_scholar.md](check_google_scholar.md)**: Verification, canonical formatting (`citations?user=...`), link health auditing, 404 repair, homonym disambiguation for Google Scholar profile URLs (`scholarUrl`), and GitHub PR/Issue submission.
4. **[verify_websites_and_labs.md](verify_websites_and_labs.md)**: Deep discovery of personal homepages (`websiteUrl`) and research group/lab sites (`labUrl`), distinct URL rules, link persistence checks, batch tracking, and GitHub PR/Issue submission.
5. **[enrich_research_overviews.md](enrich_research_overviews.md)**: Multi-source synthesis of 1–3 sentence academic summaries (`researchOverview`), strict quality sanitization (no HTML entities, no scraped UI boilerplate, no gendered pronouns), mismatch detection, enrichment snapshot management, and GitHub PR/Issue submission.
6. **[audit_facts_and_honors.md](audit_facts_and_honors.md)**: Deep verification of degree credentials (`phdInstitution`, `phdYear`, `msInstitution`, `undergradInstitution`, `postdocInstitution`), degree chronology validation, honors categorization (`academy`, `career_award`, `major_award`, `fellow`, `distinguished_professorship`), paper-award exclusions, strict `directFields` protection governance, and GitHub PR/Issue submission.
7. **[AUDIT_ISSUES_PRS.md](AUDIT_ISSUES_PRS.md)**: Primary audit agent workflow for auditing open GitHub issues, pull requests, and topic branches, verifying PR diffs, running test pipelines, squash-merging clean PRs, deleting branches, and closing resolved issues.

---

## Invoking Tasks in Antigravity Agent Sessions

To instruct an agent to perform a specific task, reference the task file in your prompt:
> **Task Execution Agent:** *"Please follow the procedure in `TASKS/fetch_portraits.md` to discover and fetch missing portraits, submitting verified batches as GitHub PRs."*
> **Audit & Merge Agent:** *"Please follow the procedure in `TASKS/AUDIT_ISSUES_PRS.md` to audit all open GitHub PRs and Issues, verify diffs, run tests, and merge clean PRs."*
