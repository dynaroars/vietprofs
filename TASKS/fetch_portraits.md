# Scholar Portrait Retrieval, Visual Auditing, and Quality Assurance (`fetch_portraits.md`)

> **Autonomous Goal Directive (`/goal TASKS/fetch_portraits.md`):**  
> When invoked as `/goal TASKS/fetch_portraits.md`, the agent MUST execute the full portrait discovery and auditing workflow batch by batch until every pending or unresolved entry in `maintenance/portrait-queue.json` has been processed (across runs; a scheduled run stops at its batch cap per `AGENTS.md`). Process in bounded 10-profile batches, perform thorough visual/image inspection, submit a GitHub PR (or Issue) for each batch that yields verified portraits, return to `main`, and **IMMEDIATELY PROCEED TO THE NEXT BATCH**.

---

## ⚡ Multi-Batch Loop & PR/Issue Submission Protocol

1. **Batching:** Keep going batch after batch in interactive runs; scheduled runs stop at the batch cap in `AGENTS.md`. Skip entries touched by an open portrait PR.
2. **Routing:** Follow the "Where each kind of change lands" table in `AGENTS.md` (portrait edits → PR; never commit directly to `main`).
3. **Strict Batch Size (10 Profiles Per Batch), Newest First:** Work in bounded batches of **10 profiles per batch**, selected with `--next=10` (section 4): never-attempted entries first, newest roster id first, because recently added entries have freshly verified profile URLs. Unresolved entries are retried only once no never-attempted entry remains, least recently attempted first.
4. **Thorough Verification Per Candidate:** For every candidate, open the image and look at it, run the face check (`python3 scripts/portrait_faces.py`), check aspect ratio (0.70–1.55), and confirm single-person headshot identity before accepting.
5. **Per-Run PR Pipeline:** (commands in section 4)
   - Before the first batch, create one topic branch for the run: `git checkout -b maintenance/portraits-$(date -u +%Y%m%d)` (never reuse an old branch name).
   - After each 10-profile batch: validate (`npm test && npm run build && git diff --check`) and commit it on that branch with `git add public/data.json public/updates.json public/portraits/ maintenance/portrait-provenance.json maintenance/portrait-queue.json` and message `fix(portraits): recover missing portraits (<first id>–<last id>)`.
   - Continue with the next batch on the same branch until the run's batch cap is reached.
   - Push (`git push -u origin HEAD`), open one PR for the run listing every batch, and return to `main`.
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

Before adding or updating any portrait, run the face check and look at the image:

### A. Face Check (`scripts/portrait_faces.py`)
The face check runs OpenCV's YuNet detector and reports
`ok` (one dominant face), `multiple` (a group), `none` (no face: building, logo, scenery, chart),
or `tiny` (a person lost in a scene). `fetch-portraits.ts --apply` rejects anything but `ok`.
```bash
pip install opencv-python-headless pillow numpy       # once per environment
python3 scripts/portrait_faces.py public/portraits/a.webp ...   # specific images
python3 scripts/portrait_faces.py --roster                      # every stored portrait (~15 s)
```
Locally, `PORTRAIT_PYTHON=/path/to/venv/bin/python` points the scripts at a Python that has OpenCV.
A non-`ok` verdict means "look at the image", not "delete": the detector can miss a real face
(profile view, heavy shadow), so confirm visually before removing a portrait.

### B. Removing a Wrong Portrait
Remove a confirmed non-human or wrong portrait by hand, only after looking at the image: delete the
file under `public/portraits/`, drop `portrait`/`portraitSource` from the entry (never on an
entry whose `directFields` protect them); `npm test` stamps `lastUpdatedAt`. Aspect ratio alone is not
evidence — a ratio-only bulk purge once removed 103 valid headshots (#106).

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
npx tsx scripts/fetch-portraits.ts --status        # syncs the queue with the roster; newestPending = what --next picks
npx tsx scripts/fetch-portraits.ts --next=10 --apply --retry   # newest never-attempted 10 (retries only when none remain); stores HIGH-confidence candidates
python3 scripts/portrait_faces.py $(git status --porcelain public/portraits | awk '{print $2}')   # every added image must be `ok`
```

Then open every portrait this batch added (`git status --porcelain public/portraits/`) and look at
it against the section 2 rejection rules. For any that fail, remove that entry's `portrait` and
`portraitSource` from `public/data.json`, delete the image file, and mark the entry unresolved in
both `maintenance/portrait-provenance.json` (outcome `not_found`, with the rejection reason) and
`maintenance/portrait-queue.json` (status `unresolved`). Otherwise the queue sync re-queues it as
new and the next run fetches the same image again. Only then:

```bash
npm test && npm run build && git diff --check
git checkout -b maintenance/portraits-$(date -u +%Y%m%d)   # first batch only; later batches stay on it
git add public/data.json public/updates.json public/portraits/ maintenance/portrait-provenance.json maintenance/portrait-queue.json
git commit -m "fix(portraits): recover missing portraits (<first id>–<last id>)"
git push -u origin HEAD                             # after the run's last batch
# open the PR (gh pr create, or the GitHub MCP tools in cloud sessions), then:
git checkout main
```

If the batch added nothing, still commit the ledger/queue updates on the same kind of branch: they
mark those entries attempted, so the next run moves on instead of repeating them. When a run does more
than one batch, stay on the first batch's branch: run the next `--next=10` there (the queue now
marks the first ten attempted, so it picks the following ten), commit it as a second commit, and
open one PR for the run listing every batch.
