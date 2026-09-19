# Task Guide: Academic Research Overview Enrichment (`enrich_research_overviews.md`)

This task playbook governs the multi-source synthesis, quality sanitization, validation, mismatch detection, and ledger management of academic summaries (`researchOverview`) rendered on scholar profile pages (`/vp-####.html`).

---

## 1. Core Objective & Render Standard

`researchOverview` provides a publicly rendered, 1–3 sentence summary of a scholar's primary research program, specialized methodologies, and major application domains.

- **Structure:**
  - `text`: High-quality, standard English academic summary (max 3 sentences, max 500 characters).
  - `sources`: Array of 1–3 verified HTTPS source URLs supporting the summary.
  - `verifiedAt`: ISO timestamp of when the overview was verified.
- **Enrichment Invariance:** Adding or updating `researchOverview` does NOT alter `lastUpdatedAt` or appointment verification status.

---

## 2. Strict Quality & Sanitization Rules

Every generated or edited `researchOverview` MUST strictly satisfy all of the following quality guardrails. Overviews violating these rules will fail validation:

1. **No Raw HTML Entities or Markup:**
   - Never include unescaped HTML entities (e.g. `&amp;`, `&nbsp;`, `&#039;`, `&times;`, `&quot;`) or tags (`<p>`, `<a>`, `<span>`, `<div>`). All text must be decoded into clean plain text.
2. **No Scraped Web Boilerplate or UI Artifacts:**
   - Strictly prohibit scraper output such as `Toggle navigation`, `Skip to main content`, `Researchers Information`, `What are you looking for?`, `Staff Directory`, `Loading...`, `Phone:`, `Email:`, or `Download contact card`.
3. **No Raw Citation or Bibliographic Dumps:**
   - An overview is a research summary, not a CV bibliography. Do not dump journal issue numbers (e.g. `12(4): 203-210`), PubMed extracts, co-author lists, or DOI links into the prose.
4. **Strict Gender-Neutral Phrasing:**
   - Never use gendered pronouns (`He`, `She`, `His`, `Her`, `Him`, `Hers`).
   - Use the scholar's surname (e.g., *"Nguyen investigates..."*) or direct active-voice phrasing (*"Researches..."*).
5. **No Bare Unformatted URLs or Template Placeholders:**
   - Text containing `{{...}}`, `<!-- ... -->`, or bare URLs (`https://...`) loose in prose is invalid.

---

## 3. Multi-Source Synthesis Workflow

Do NOT rely on single search engine snippet snippets. Synthesize overviews using the following multi-source process:

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
