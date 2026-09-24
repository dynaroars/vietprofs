# Academic Research Overview Enrichment (`enrich_research_overviews.md`)

> **Autonomous Goal Directive (`/goal TASKS/enrich_research_overviews.md`):**
> When invoked as `/goal TASKS/enrich_research_overviews.md`, the agent MUST immediately execute this full research overview enrichment workflow without needing any extra prompt text. Work in 20-profile batches using `npm run enrich -- snapshot`, synthesize 1–3 sentence neutral academic summaries, strictly enforce sanitization guardrails (no HTML entities, no scraped UI boilerplate, no gendered pronouns), submit verified batches as GitHub PRs, and loop until all pending entries are enriched.

---

## ⚡ Batching, PR/Issue Submission, and `/goal` Protocol

1. **Routing:** Follow the "Where each kind of change lands" table in `AGENTS.md` (overview edits → PR; mismatches needing review → Issue; never commit directly to `main`).
2. **Strict Batch Size (20 Profiles Per Batch):** Work in bounded batches of **20 profiles per batch** using `npm run enrich -- snapshot` and `maintenance/enrichment.json`.
3. **Thorough Synthesis & Quality Sanitization:** Synthesize 1–3 sentence neutral academic summaries from official bio pages, lab homepages, and paper abstracts. Strictly enforce zero HTML entities, zero scraped UI boilerplate, zero gendered pronouns, max 3 sentences, and max 500 characters.
4. **Automated PR & Issue Submission Pipeline:**
   After completing each 20-profile batch (`npm run enrich -- finalize 20`):
   - Create batch topic branch: `git checkout -b maintenance/enrichment-batch-[BATCH_NUM]`
   - Validate pipeline: `npm test && npm run build && git diff --check`
   - Commit batch: `git add public/data.json maintenance/enrichment.json`
   - Commit message: `git commit -m "feat(enrichment): resolve research overview batch [BATCH_NUM]"`
   - Push topic branch: `git push origin maintenance/enrichment-batch-[BATCH_NUM]`
   - File GitHub PR:
     ```bash
     gh pr create --title "feat(enrichment): resolve research overview batch [BATCH_NUM]" --body "Enriched verified research overviews for 20 entries..."
     ```
   - For mismatched overviews requiring human review, file GitHub Issues (`gh issue create`).
   - Return to `main`: `git checkout main`
5. **Auditing & Merging Delegation:** Do NOT merge the PR yourself. The dedicated audit agent running `TASKS/AUDIT_ISSUES_PRS.md` will review, test, squash-merge, and delete the PR branch.

---

## 1. Core Objective & Render Standard

`researchOverview` provides a publicly rendered, 1–3 sentence summary of a scholar's primary research program, specialized methodologies, and major application domains.

- **Structure:**
  - `text`: High-quality, standard English academic summary (max 3 sentences, max 500 characters).
  - `sources`: Array of 1–3 verified HTTPS source URLs supporting the summary.
  - `verifiedAt`: ISO timestamp of when the overview was verified.
- **Enrichment Invariance:** Adding or updating `researchOverview` does NOT alter `lastUpdatedAt` or appointment verification status.

---

## 2. Quality & Sanitization Rules

The authoritative rules are "Research overview quality and sanitization guidelines" in
`ROSTER_MAINTENANCE.md` (≤3 sentences, ≤500 characters, no HTML/entities, no scraped boilerplate,
no citation dumps, no gendered pronouns, links only as Markdown `[text](https://...)`).
`npm run validate-data` enforces most of them. Do not restate them here.

---

## 3. Multi-Source Synthesis Workflow

Do NOT rely on a single search-engine snippet. Synthesize overviews using the following multi-source process:

1. **Source Exploration:**
   - Read the scholar's official university bio page (`profileUrl`).
   - Read personal academic homepages (`websiteUrl`) or lab group pages (`labUrl`).
   - Read major recent paper abstracts or research statement overviews.

2. **Drafting Prose:**
   - Sentence 1: Core research domain and central questions (e.g. *"Focuses on high-frequency financial markets, empirical microstructure, and algorithmic trading dynamics."*).
   - Sentence 2: Key methodologies, materials, or theoretical frameworks.
   - Sentence 3: Primary application areas or notable interdisciplinary connections.

3. **Mismatch Auditing:**
   - Before applying an overview, confirm that the summary describes the specific scholar's field—not a namesake or neighboring entry in `public/data.json`.
   - If an existing entry contains a mismatched overview (e.g. a MEMS professor assigned a physics summary from another scholar), regenerate the overview from the scholar's actual official pages.

---

## 4. Enrichment Tooling & Ledger Lifecycle

The enrichment pipeline uses `maintenance/enrichment.json` to manage resumable batch snapshots:

```bash
# 1. Create a stable snapshot batch
npm run enrich -- snapshot

# 2. Check snapshot coverage and pending batches
npm run enrich -- status

# 3. Collect source evidence for N pending entries
npm run enrich -- collect 20

# 4. Apply validated proposals file
npm run enrich -- apply proposals.json

# 5. Finalize reviewed batch outcomes
npm run enrich -- finalize 20
```

---

## 5. Execution & Repository Validation

```bash
# Run data validation suite (checks researchOverview length, quality, and entities)
npm run validate-data

# Run full test suite and build validation
npm test && npm run build && git diff --check
```
