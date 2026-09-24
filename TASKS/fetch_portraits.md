# Scholar Portrait Retrieval, Visual Auditing, and Quality Assurance (`fetch_portraits.md`)

> **Autonomous Goal Directive (`/goal TASKS/fetch_portraits.md`):**  
> When invoked as `/goal TASKS/fetch_portraits.md`, the agent MUST execute the full portrait discovery and auditing workflow batch by batch until every missing entry in `maintenance/missing-portraits.json` and `public/data.json` has been processed (across runs; a scheduled run stops at its batch cap per `AGENTS.md`). Process in bounded 10-profile batches, perform thorough visual/image inspection, submit a GitHub PR (or Issue) for each batch that yields verified portraits, return to `main`, and **IMMEDIATELY PROCEED TO THE NEXT BATCH**.

---

## ⚡ Multi-Batch Loop & PR/Issue Submission Protocol

1. **Batching:** Keep going batch after batch in interactive runs; scheduled runs stop at the batch cap in `AGENTS.md`. Skip entries touched by an open portrait PR.
2. **Routing:** Follow the "Where each kind of change lands" table in `AGENTS.md` (portrait edits → PR; never commit directly to `main`).
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
   - Continue with the next batch (unless the run's batch cap is reached).
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
- Remove a confirmed non-human portrait by hand, only after looking at the image: delete the
  file under `public/portraits/`, drop `portrait`/`portraitSource` from the entry (never on an
  entry whose `directFields` protect them), and set `lastUpdatedAt`. Aspect ratio alone is not
  evidence — a ratio-only bulk purge once removed 103 valid headshots (#106).
- Run the full portrait audit suite:
  ```bash
  npx tsx scripts/audit-portraits.ts
  ```

### C. Visual Inspection Protocol
When processing portraits manually or reviewing automated candidates:
- Open the downloaded image with your image-capable file reader (e.g. Claude Code's Read tool) and look at it.
- Confirm the image displays a single, clearly identifiable human face matching the scholar's identity.
- Verify aspect ratio (width/height ratio must be between **0.70 and 1.55**).

---

## 4. Per-Batch Procedure

Run one batch at a time and stop at the first failing step; don't wrap this in a loop that
swallows errors.

```bash
git checkout main && git pull --ff-only
B=<batch number>                                   # next batch with pending items in maintenance/portrait-queue.json
npx tsx scripts/fetch-portraits.ts $B              # dry run: lists candidates and confidence, writes nothing to data.json
npx tsx scripts/fetch-portraits.ts $B --apply --retry   # stores HIGH-confidence candidates
python3 scripts/fast_portrait_analyzer.py          # flags logos, silhouettes, flat graphics
```

Then open every portrait this batch added (`git status --porcelain public/portraits/`) and look at
it against the section 2 rejection rules. For any that fail, remove that entry's `portrait` and
`portraitSource` from `public/data.json`, delete the image file, and mark the entry unresolved in
`maintenance/portrait-provenance.json`. Only then:

```bash
npm test && npm run build && git diff --check
git checkout -b maintenance/portrait-batch-$B
git add public/data.json public/portraits/ maintenance/portrait-provenance.json maintenance/portrait-queue.json maintenance/missing-portraits.json
git commit -m "fix(portraits): recover missing portraits batch $B"
git push -u origin maintenance/portrait-batch-$B
# open the PR (gh pr create, or the GitHub MCP tools in cloud sessions), then:
git checkout main
```

If the batch added nothing, commit the ledger/queue updates on the same kind of branch so the next
run doesn't repeat it.
