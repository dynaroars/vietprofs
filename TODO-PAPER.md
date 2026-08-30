# TODO before publication

(Done: `analysis/analyze-roster.ts` now imports the canonical `fieldOf`, so published field counts
match the site. Regenerate with `npm run analyze` whenever the roster changes.)

* Record authors, affiliations, snapshot date, license/publication status, and whether the
  maintenance branch can be cited publicly.
* Add per-run telemetry: candidate outcomes, review outcomes, costs, latency, and change types.
* Build a labeled evaluation set for inclusion, exclusion, identity resolution, and changed-page
  detection; report precision/recall and reviewer agreement.
* Decide whether prompts and agent transcripts can be published; redact credentials and private
  contact data. The manuscript currently summarizes prompts only.
* Verify the current GitHub Actions/deployment and whether direct push is acceptable to describe as
  deployed operation rather than local capability.
* Add source snapshots or hashes and field-level provenance if stronger reproducibility is desired.
* Add automatic invalidation/recomputation of any future persisted derived facts.
* Confirm all real-person case studies and public source URLs before submission.
* Resolve whether the historical date range is acceptable for an arXiv snapshot and add a release
  tag/archived data artifact.
