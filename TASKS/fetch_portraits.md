# Scholar Portrait Retrieval, Visual Auditing, and Quality Assurance (`fetch_portraits.md`)

> **Autonomous Goal Directive (`/goal TASKS/fetch_portraits.md`):**  
> When invoked as `/goal TASKS/fetch_portraits.md`, the agent MUST execute the full portrait discovery and auditing workflow across **ALL BATCHES CONTINUOUSLY** until **100% of missing entries in `maintenance/missing-portraits.json` and `public/data.json` are processed**. Process in bounded 10-profile batches, perform thorough visual/image inspection, submit a GitHub PR (or Issue) for each batch that yields verified portraits, return to `main`, and **IMMEDIATELY PROCEED TO THE NEXT BATCH**. Do NOT stop execution after processing a single batch; continue looping until ALL batches (from Batch 1 to the final batch) are completely processed.

---

## ⚡ Multi-Batch Loop & PR/Issue Submission Protocol

1. **Continuous Multi-Batch Execution:**  
   The agent MUST NOT stop execution after completing Batch 1. It MUST continuously iterate through **all remaining batches** (Batch 1, Batch 2, Batch 3 ... Batch N) until every eligible missing portrait entry has been audited.
2. **No Direct Commits to `main`:** Maintenance tasks MUST NOT commit directly to `main`. All data updates must be submitted via **GitHub Pull Requests** or **GitHub Issues**.
3. **Strict Batch Size (10 Profiles Per Batch):** Work in bounded batches of **10 profiles per batch** using `maintenance/missing-portraits.json`.
4. **Thorough Verification Per Candidate:** For every candidate, inspect the image visually or run statistical analyzers (`python3 scripts/fast_portrait_analyzer.py`), check aspect ratio (0.70–1.55), and confirm single-person headshot identity before accepting.
5. **Per-Batch Automated PR Pipeline:**  
   After completing each 10-profile batch:
   - Create batch topic branch: `git checkout -b maintenance/portrait-batch-[BATCH_NUM]`
   - Validate pipeline: `npm test && npm run build && git diff --check`
   - Commit batch: `git add public/data.json public/portraits/ maintenance/portrait-provenance.json maintenance/missing-portraits.json`
   - Commit message: `git commit -m "fix(portraits): recover missing portraits batch [BATCH_NUM]"`
   - Push topic branch: `git push origin maintenance/portrait-batch-[BATCH_NUM]`
   - File GitHub PR:
     ```bash
     gh pr create --title "fix(portraits): recover missing portraits batch [BATCH_NUM]" --body "Recovered verified portraits for batch [BATCH_NUM]..."
     ```
   - Return to `main`: `git checkout main`
   - **Immediately launch the next batch!**
6. **Auditing & Merging Delegation:** Do NOT merge PRs yourself. The dedicated audit agent running `TASKS/AUDIT_ISSUES_PRS.md` will review, test, squash-merge, and delete PR branches.

---

## 1. Core Objective & Quality Standard

The goal is to acquire a high-confidence, individual human portrait headshot for every eligible faculty entry in `public/data.json`.

- **Quality Priority:** A missing portrait (`portrait: undefined`) is far better than an incorrect, hallucinated, low-quality, or non-person image.
- **Confidence Requirement:** Only commit portraits with `HIGH` or verified `MEDIUM` confidence. Never commit `LOW` confidence or unverified headshots.
- **Protected Fields:** If `portrait` or `portraitSource` is protected by `directFields`, automated maintenance must never replace or overwrite it without explicit owner instructions.

---

## 2. CRITICAL WARNING: Non-Person and Hallucinated Image Rejection

Automated web scraping and superficial web search frequently return non-person images. You MUST thoroughly inspect every candidate image before adding it to the repository.

### Strictly Prohibited Images (Rejection Rules)

1. **Default Silhouettes & Generic Avatars:** Neutral head outlines, grey user icons, default CMS avatar silhouettes.
2. **University Logos & Department Wordmarks:** Institutional crests, school seals, hospital badges, corporate logos.
3. **Campus Buildings, Facilities, & Scenery:** Photos of university halls, laboratory equipment, landscapes, or stock backgrounds.
4. **Group Photos & Uncropped Crowd Shots:** Lab group photos, panel discussions, or event photos where an individual scholar cannot be cleanly isolated into a headshot.
5. **Wrong-Person Headshots:** Headshots of co-authors, department chairs, administrative staff, or unrelated namesakes.
6. **Low-Resolution / Heavily Pixelated Thumbnails:** Images under 120×120px or with severe compression artifacts.

---

## 3. Image Inspection & Automated Validation Tools

Before adding or updating any portrait, use both automated pre-screening scripts and visual inspection:

### A. Automated Image Analysis (`scripts/fast_portrait_analyzer.py`)
Run the Python statistical analyzer to detect flat graphics, logos, and non-skin images:
```bash
python3 scripts/fast_portrait_analyzer.py
```
- **Skin Tone Ratio (`skin_ratio < 0.01`):** Flags images lacking human skin color in YCbCr space (detects logos, buildings, wordmarks).
- **Color Count (`num_colors < 150`):** Flags flat vector graphics and logos.
- **Color Variance (`stddev < 10.0`):** Flags flat silhouettes and monochrome icons.

### B. Portrait Audit & Cleaning Scripts
- Find non-human portraits in the roster:
  ```bash
  npx tsx scripts/find-all-nonhuman-portraits.ts
  ```
- Clean/purge confirmed non-human portraits:
  ```bash
  npx tsx scripts/clean-nonhuman-portraits.ts
  python3 scripts/purge_verified_nonhuman_portraits.py
  ```
- Run the full portrait audit suite:
  ```bash
  npx tsx scripts/audit-portraits.ts
  ```

### C. Visual Inspection Protocol
When processing portraits manually or reviewing automated candidates:
- View the candidate image using `view_file` or local image preview.
- Confirm the image displays a single, clearly identifiable human face matching the scholar's identity.
- Verify aspect ratio (width/height ratio must be between **0.70 and 1.55**).

---

## 4. Execution Commands

```bash
# Run portrait discovery loop across ALL batches continuously
node -e '
const { execSync } = require("child_process");
for (let b = 1; b <= 30; b++) {
  console.log(`=== Processing Batch ${b} ===`);
  try {
    execSync(`npx tsx scripts/fetch-portraits.ts ${b} --apply --retry`);
    const status = execSync("git status --porcelain").toString();
    if (status.includes("public/data.json") || status.includes("public/portraits/")) {
      const branchName = `maintenance/portrait-batch-${b}`;
      execSync(`git checkout -b ${branchName}`);
      execSync("git checkout public/git-info.json").catch(() => {});
      execSync("git add public/data.json public/portraits/ maintenance/portrait-provenance.json maintenance/portrait-queue.json maintenance/missing-portraits.json");
      execSync(`git commit -m "fix(portraits): recover missing portraits batch ${b}"`);
      execSync(`git push origin ${branchName}`);
      execSync(`gh pr create --title "fix(portraits): recover missing portraits batch ${b}" --body "Recovered verified portraits for batch ${b}."`);
      execSync("git checkout main");
      execSync("git checkout public/git-info.json").catch(() => {});
    }
  } catch (err) {
    execSync("git checkout main").catch(() => {});
  }
}
'

# Full repository validation
npm test && npm run build && git diff --check
```
