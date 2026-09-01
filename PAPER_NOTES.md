# VietProfs manuscript notes

This file is the single working companion to `paper.tex`. It collects reproducibility instructions,
the current snapshot, the repository-claim audit, useful implementation evidence, and work still
needed before publication. The manuscript itself remains authoritative for prose and citations;
`ROSTER_MAINTENANCE.md` remains authoritative for eligibility and evidence policy.

## Reproducing the snapshot

Run from the repository root:

```bash
npm run analyze > /tmp/vietprofs-roster-analysis.json
npm run figures
```

`analysis/analyze-roster.ts` reads `public/data.json` and imports the canonical `fieldOf`, `FIELDS`,
and `countBy` implementations from `src/data.ts`. Its field counts therefore match the site rather
than approximating its taxonomy. `npm run figures` rebuilds the site before capturing the fixed
manuscript screenshots. Regenerate the analysis, this file's snapshot values, figures, and the
corresponding `paper.tex` claims together after any cited roster change.

## Current snapshot

Generated on 2026-08-31 from `public/data.json` with `npm run analyze`.

| Metric | Value | Caveat |
|---|---:|---|
| roster records | 993 | current maintained snapshot, not a census |
| universities | 423 | exact canonicalized roster strings |
| countries | 20 | current-country field |
| U.S. / international records | 659 / 334 | missing country defaults to U.S. in the app |
| broad fields | 17 | canonical rules plus explicit overrides |
| profile URLs | 993 | presence, not live HTTP validity |
| Scholar URLs | 219 | presence, not identity correctness |
| personal/lab websites | 127 | presence only |
| explicit PhD institutions / years | 751 / 549 | recorded evidence only; year range 1962--2026 |
| honors-bearing records | 182 | at least one eligible stored honor |

Track counts are Tenure-line 774, Clinical 96, Teaching 68, Emeritus 37, and Research 18. The
largest exact university groups are Stanford and UC San Diego (14 each), Monash (13), UC Irvine,
UCLA, and the University of Florida (11 each). Country counts include U.S. 659, Australia 64,
U.K. 54, Canada 47, France 36, Japan 33, Singapore 25, and Taiwan 21.

Conservative observations supported by the analysis include:

- The snapshot spans 17 fields; Health Sciences (203), Computer & Information Sciences (148),
  Business & Economics (143), and Engineering (139) are the four largest.
- California and Texas contain 218 of the 659 U.S. records (33%). This is a roster observation,
  not evidence about population size, prestige, causation, or migration.
- Computing represents 11% of U.S. entries and 22% of international entries; health represents
  27% and 8%, respectively. Coverage and selection differences prevent population inference.
- Monash and Stanford each span 12 distinct stored departments; department naming granularity
  affects this comparison.
- Missingness is measurable: the education and external-link counts above are coverage signals,
  not correctness claims.

Runtime facts should remain computed from roster fields and follow the stricter wording and sample
rules in `ROSTER_MAINTENANCE.md`. Do not preserve hand-written snapshot facts in the application.

## Repository claims and evidence

| Claim | Evidence | Status |
|---|---|---|
| The application is a static Vite site loading public JSON in the browser. | `README.md`, `src/data.ts`, `src/main.ts` | supported |
| Eligibility requires a current primary appointment outside Vietnam on an accepted track. | `ROSTER_MAINTENANCE.md` | supported |
| Names are discovery signals rather than identity proof. | `ROSTER_MAINTENANCE.md` | supported |
| The controller selects stale/missing ledger entries and validates target-scoped proposals. | `scripts/maintain-roster.ts`, controller tests | supported |
| Full review may advance the private ledger without changing public roster content. | maintenance guide and controller | supported |
| Runtime observations are recomputed from the current roster. | `src/data.ts`, `src/main.ts`, tests | supported |
| Profile pages and manuscript figures are generated deterministically. | generation/capture scripts | supported |
| The system is completely autonomous. | review and uncertainty paths contradict this | do not claim |
| Recall, precision, cost, and freshness are measured. | no controlled evaluation or telemetry | unsupported |

External scholarly claims must remain cited in `paper.tex` and `references.bib`. Recheck repository
claims against the current branch before submission because both code and roster continue to change.

## Historical implementation evidence

Representative public Git events used by the manuscript include:

- `2aa15c0`: merged duplicate University of Dayton records for Tam V. Nguyen.
- `9a4a171`: removed an entry under the inclusion policy.
- `ba71beb`: corrected a Teaching record to Clinical after appointment review.
- `c1f4380`: corrected an affiliation.
- `c0c0603` and `4212955`: repaired identity suffixes, a duplicate, and university names.
- `9b31b95`: recorded a bounded Taiwan sweep with no eligible additions.

These commits demonstrate maintenance operations, not independently reconstructed biographies.
Git history is a partial event record; it does not supply a complete candidate denominator,
rejection taxonomy, or review-cost log.

## Evaluation and publication checklist

- Confirm authors, affiliations, snapshot date, publication status, and archival release/tag.
- Instrument candidate outcomes, rejection/defer reasons, review outcomes, change types, elapsed
  time, model/tool identity, token/API cost, and external-change-to-detection latency.
- Build a labeled evaluation set for eligibility, exclusion, identity resolution, and changed-page
  detection; report precision/recall and reviewer agreement.
- Decide whether prompts and agent transcripts can be published, with credentials and private
  contact data removed.
- Verify deployment claims and whether direct pushes should be described as deployed operation or
  only controller capability.
- Add evidence snapshots/hashes, stable event identifiers, and field-level provenance if stronger
  reproducibility is required.
- Confirm all named real-person cases and public source URLs immediately before submission.

