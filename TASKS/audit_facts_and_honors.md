# Credentials, Honors, and Direct Fields Protection (`audit_facts_and_honors.md`)

> **Autonomous Goal Directive (`/goal TASKS/audit_facts_and_honors.md`):**
> When invoked as `/goal TASKS/audit_facts_and_honors.md`, the agent MUST immediately execute this full credentials and honors auditing workflow without needing any extra prompt text. Work in 15–20 candidate batches (`hieuphay-leads.json` / `openalex-leads.json`), verify inclusion criteria and degree chronology, submit verified batches as GitHub PRs, and loop until all lead candidates are processed. Per `AGENTS.md`'s "New entries vs. edits" policy: a lead that is a brand-new person (needs a new `vp-####` ID) goes to a GitHub Issue, never a PR; only credential/honors corrections to a person who already has a roster ID belong in a PR.

---

## ⚡ Batching, PR/Issue Submission, and `/goal` Protocol

1. **Routing:** Follow the "Where each kind of change lands" table in `AGENTS.md` (existing-ID edits → PR; new people → Issue; never commit directly to `main`).
2. **Strict Batch Size (15–20 Candidates Per Batch):** Work in bounded batches of **15–20 candidates per batch** using lead files (`maintenance/hieuphay-leads.json` or `maintenance/openalex-leads.json`).
3. **Thorough Verification Standard:** Verify full inclusion standard for every candidate: current appointment outside Vietnam, accepted track, non-corporate employer, degree chronology (`undergradYear <= msYear <= phdYear <= postdocYear`), and honors categorization.
4. **New-ID vs. Edit Split (per `AGENTS.md`):** A batch's candidates fall into two kinds, and each kind is submitted differently:
   - **Brand-new person (needs a new `vp-####` ID):** Do NOT run `assign-profile-ids -- --apply` or add them to `public/data.json` on a branch. File one GitHub Issue per candidate (or a small group) with evidence, source URLs, and proposed fields, and let the owner or `AUDIT_ISSUES_PRS.md` assign the ID.
   - **Credential/honors correction to an existing roster ID:** Submit via the PR pipeline below.
5. **Automated PR Submission Pipeline (existing-ID edits only):**
   After completing each batch's existing-ID edits:
   - Sync verification ledger: update `maintenance/verification.json`
   - Snapshot enrichment: `npm run enrich -- snapshot`
   - Create batch topic branch: `git checkout -b maintenance/leads-batch-[DISCIPLINE/TIMESTAMP]`
   - Validate pipeline: `npm test && npm run build && git diff --check`
   - Commit batch: `git add public/data.json maintenance/verification.json maintenance/hieuphay-leads.json`
   - Commit message: `git commit -m "fix(roster): resolve candidate leads batch [DISCIPLINE/BATCH_NAME]"`
   - Push topic branch: `git push origin maintenance/leads-batch-[DISCIPLINE/TIMESTAMP]`
   - File GitHub PR:
     ```bash
     gh pr create --title "Resolve OpenAlex [DISCIPLINE] leads batch" --body "Verified and corrected 15 candidate leads..."
     ```
   - For ambiguous eligibility cases, protected field conflicts, or honors requiring maintainer review (on an existing entry), file GitHub Issues (`gh issue create`).
   - Return to `main`: `git checkout main`
6. **Auditing & Merging Delegation:** Do NOT merge the PR yourself. The dedicated audit agent running `TASKS/AUDIT_ISSUES_PRS.md` will review, test, squash-merge, and delete the PR branch.

---

## 1. Core Principles & Governance Rules

`directFields` protection and the direct-update rules are defined in `AGENTS.md` ("Direct
updates"). Set `lastUpdatedAt` whenever a substantive fact (appointment, rank, degree, honor,
portrait) changes; advance `maintenance/verification.json` only for a complete live review.

---

## 2. Educational Credentials Verification & Chronology Rules

Academic degrees must be corroborated by official institutional bios, personal academic homepages, or verified CVs.

### A. Allowed Credential Fields
- `phdInstitution`, `phdYear`, `phdMajor`
- `msInstitution`, `msYear`
- `undergradInstitution`, `undergradYear`
- `postdocInstitution`, `postdocYear`
- `mdInstitution`, `mdYear`

### B. Strict Chronology & Formatting Rules
1. **Academic Progression Order:** Degrees must follow logical academic chronology: `undergradYear <= msYear <= phdYear <= postdocYear`.
2. **Implausible Interval Detection:** Flag and investigate implausible intervals (e.g. an undergrad graduation year of 2024 for a professor who completed a PhD in 2003).
3. **Canonical Institution Formatting:** Store canonical institution names without prepended degree prefixes (e.g., store `"University of California, Berkeley"`, NOT `"PhD from UC Berkeley"`).
4. **Completed Postdoctoral Training:** Record completed postdoctoral institution (`postdocInstitution`) and completion year (`postdocYear`) when explicitly documented.

---

## 3. Honors & Awards Eligibility

The authoritative rules are "Honors and awards eligibility" in `ROSTER_MAINTENANCE.md`; read it
before adding or rejecting any honor. Do not maintain a separate list here. Each honor needs
`name`, `category` (`academy`, `fellow`, `career_award`, `major_award`,
`distinguished_professorship`), `organization`, an HTTPS `source` that names the recipient, and
`year` when available.

Frequent rejections: per-year best/distinguished-paper awards (only test-of-time,
most-influential, or similar retrospective awards qualify), student/postdoc-stage awards
(including dissertation awards), NSF CRII and other research-initiation grants,
university-local awards, and anything whose standing can't be established from the source.

---

## 4. Execution & Validation Workflow

```bash
# Validate data schema, degree chronology, and honors provenance
npm run validate-data

# Check honor source URLs for broken links
npm run check-links -- --field honors

# Run full test suite and build validation
npm test && npm run build && git diff --check
```
