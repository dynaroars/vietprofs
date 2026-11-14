# Dedup-hold resolution brief

A discovery run put people under `possible_move` because `find-roster-matches` returned a roster
entry with a similar name. A name match alone is not identity. For each `possible_move` item in the
input file, decide:
- `same_person_moved`: the roster id IS this person (same field, education, co-authors, or a link
  between pages) and they now work at the new employer. Give the new employer and URL.
- `same_person_not_moved`: same person, still at the roster institution (the new page is stale or a
  secondary affiliation).
- `different_person`: a distinct person. Then apply the full candidate tests from
  `maintenance/sector-expansion/VERIFY.md` (tests 1-5) and, if they pass, give a ready entry in the
  BRIEF.md `candidates` format.
Also re-verify any `candidates` in the input with VERIFY.md (independent of the producer's evidence).

Hard rules: write ONLY your output file; no edits elsewhere, no git, no Issues, no LinkedIn, no login.
Output JSON: { "verifier": "codex", "input": "...",
  "holds": [ { "name": "...", "id": "vp-....", "verdict": "same_person_moved|same_person_not_moved|different_person",
               "reason": "...", "newEmployer": "...", "url": "...",
               "candidate": { "entry": {...}, "evidence": {...} } } ],
  "candidates": [ VERIFY.md candidate verdicts ] }
