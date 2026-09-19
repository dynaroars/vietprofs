# Task Guide: Scholar Portrait Retrieval, Visual Auditing, and Quality Assurance (`fetch_portraits.md`)

This task playbook governs the thorough discovery, visual auditing, identity verification, formatting, and provenance tracking of faculty portrait headshots in the **VietProfs** repository.

---

## ⚡ Batching, PR/Issue Submission, and `/goal` Protocol

When running this task (especially during a long-running or overnight `/goal` run):

1. **No Direct Commits to `main`:** Maintenance tasks MUST NOT commit directly to `main`. All data updates must be submitted via **GitHub Pull Requests** or **GitHub Issues**.
2. **Strict Batch Size (10 Profiles Per Batch):** Work in bounded batches of **10 profiles per batch** using `maintenance/missing-portraits.json`.
3. **Thorough Verification Per Candidate:** For every candidate, inspect the image visually or run statistical analyzers (`python3 scripts/fast_portrait_analyzer.py`), check aspect ratio (0.70–1.55), and confirm single-person headshot identity before accepting.
4. **Automated PR & Issue Submission Pipeline:**
   After completing each 10-profile batch:
   - Create batch topic branch: `git checkout -b maintenance/portrait-batch-[BATCH_NUM]`
   - Validate pipeline: `npm test && npm run build && git diff --check`
   - Commit batch: `git add public/data.json public/portraits/ maintenance/portrait-provenance.json maintenance/missing-portraits.json`
   - Commit message: `git commit -m "fix(portraits): recover missing portraits batch [BATCH_NUM]"`
   - Push topic branch: `git push origin maintenance/portrait-batch-[BATCH_NUM]`
   - File GitHub PR:
     ```bash
     gh pr create --title "fix(portraits): recover missing portraits batch [BATCH_NUM]" --body "Recovered verified portraits for 10 missing entries..."
     ```
   - For ambiguous, unconfirmed, or protected field cases, file a GitHub Issue (`gh issue create`).
   - Return to `main`: `git checkout main`
5. **Auditing & Merging Delegation:** Do NOT merge the PR yourself. The dedicated audit agent running `TASKS/AUDIT_ISSUES_PRS.md` will review, test, squash-merge, and delete the PR branch.

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

## 4. Thorough Discovery & Search Workflow

Do NOT rely on quick 1-second search engine snippets. Perform a deep, multi-step search:

1. **Official Institutional Profile (`profileUrl`):**
   - Inspect the scholar's official university or department directory bio page.
   - Fetch the raw page or inspect DOM image elements (`<img src="...">`, CSS background images, figure captions).

2. **Maintained Academic Homepage (`websiteUrl`) & Lab Site (`labUrl`):**
   - Search for personal sites (`.edu/~user`, Google Sites, GitHub Pages, personal domains) or lab team pages (`/people`, `/members`, `/team`).
   - Locate individual headshots or team bio photos.

3. **Authoritative Academic Sources & PDF CVs:**
   - Search official university news releases, award announcements, and inaugural lecture posters.
   - Search high-resolution PDF CVs uploaded to academic pages.
   - Google Scholar avatars and ORCID pages may serve as identity clues, but require independent verification.

4. **Multi-Query Web Scouting Strategy:**
   Run explicit multi-token queries if initial profile inspection is blocked or unhelpful:
   - `"<Scholar Name>" "<University Name>" headshot OR photo OR portrait`
   - `"<Scholar Name>" "<Department>" faculty biography image`

---

## 5. Image Formatting, Storage, & Provenance Logging

Once a valid portrait is verified:

1. **Format & Conversion:**
   - Crop cleanly to head and shoulders.
   - Convert image to WebP format.
   - Save to `public/portraits/` with naming pattern: `portraits/vp-####-canonical-name.webp` (e.g. `portraits/0147-anh-le-pennsylvania-state-university.webp`).

2. **Update Roster (`public/data.json`):**
   - Set `"portrait": "portraits/vp-####-canonical-name.webp"`.
   - Set `"portraitSource": "<DIRECT_HTTP_URL_OF_ORIGINAL_IMAGE>"`.
   - Update `"lastUpdatedAt": "<CURRENT_ISO_TIMESTAMP>"`.

3. **Update Provenance Ledger (`maintenance/portrait-provenance.json`):**
   Record the full provenance entry under the scholar's canonical name:
   ```json
   {
     "name": "Scholar Name",
     "outcome": "found",
     "pageUrl": "https://university.edu/faculty/profile",
     "imageUrl": "https://university.edu/images/headshot.jpg",
     "sourceType": "official_faculty",
     "confidence": "HIGH",
     "identitySignals": ["name", "institution", "department"],
     "retrievedAt": "2026-09-19T17:30:00.000Z",
     "note": "Verified headshot from official faculty bio page."
   }
   ```
   If no valid portrait exists after thorough search, log `"outcome": "not_found"` with an explanatory note.

---

## 6. Execution Commands

```bash
# Run portrait discovery script for a specific batch
npx tsx scripts/fetch-portraits.ts 1 --apply

# Run fast statistical analyzer to detect logos/silhouettes
python3 scripts/fast_portrait_analyzer.py

# Run portrait audit suite
npx tsx scripts/audit-portraits.ts

# Full repository validation
npm test && npm run build && git diff --check
```
