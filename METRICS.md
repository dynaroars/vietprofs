# Metrics

Generated from `public/data.json` on 2026-08-30 with `npm run analyze`
(`analysis/analyze-roster.ts`, which imports the canonical `fieldOf` from `src/data.ts`).

| Metric | Value | Reproduction | Caveat |
|---|---:|---|---|
| roster records | 950 | analysis script | current snapshot, not census |
| universities | 399 | analysis script | exact strings after repository canonicalization |
| countries | 19 | analysis script | current-country field |
| U.S. records | 637 | analysis script | missing country defaults to U.S. in app |
| international records | 313 | analysis script | non-U.S. country values |
| broad fields | 17 | `src/data.ts` / tests | field mapping is rule plus overrides |
| profile URLs | 950 | analysis script | presence, not live HTTP validity |
| Scholar URLs | 342 | analysis script | presence, not identity correctness |
| personal/lab websites | 121 | analysis script | presence |
| PhD institutions | 716 | analysis script | explicit stored field |
| PhD years | 526 | analysis script | explicit stored field; range 1962--2026 |
| honors-bearing records | 183 | analysis script | at least one stored honor |

Current top institution counts are Stanford (14), Monash (13), and UC San Diego (12), followed by
UC Irvine, UCLA, the University of Florida, and the University of Wisconsin--Madison (11 each) and
by the National University of Singapore, Texas Tech, the University of Melbourne, and the
University of Toronto (10 each). Current track counts are Tenure-line 740, Clinical 89, Teaching
69, Emeritus 37, and Research 15. Current country counts are U.S. 637, Australia 62, U.K. 53,
Canada 46, France 33, Japan 26, Singapore 25, and Taiwan 21.

## Metrics worth instrumenting before publication

Record per-run candidates, accepted/rejected/deferred counts, rejection reasons, human-review
requests, changes by type, dead-link corroboration outcomes, agent/tool/model, elapsed time,
token/API cost, and time from an external page change to detection. Store evidence snapshots or
hashes and a stable event identifier for each applied proposal. These would support precision,
recall, cost, and freshness evaluation rather than only snapshot characterization.
