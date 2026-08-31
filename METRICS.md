# Metrics

Generated from `public/data.json` on 2026-08-31 with `npm run analyze`
(`analysis/analyze-roster.ts`, which imports the canonical `fieldOf` from `src/data.ts`).

| Metric | Value | Reproduction | Caveat |
|---|---:|---|---|
| roster records | 993 | analysis script | current snapshot, not census |
| universities | 423 | analysis script | exact strings after repository canonicalization |
| countries | 20 | analysis script | current-country field |
| U.S. records | 659 | analysis script | missing country defaults to U.S. in app |
| international records | 334 | analysis script | non-U.S. country values |
| broad fields | 17 | `src/data.ts` / tests | field mapping is rule plus overrides |
| profile URLs | 993 | analysis script | presence, not live HTTP validity |
| Scholar URLs | 219 | analysis script | presence, not identity correctness |
| personal/lab websites | 127 | analysis script | presence |
| PhD institutions | 751 | analysis script | explicit stored field |
| PhD years | 549 | analysis script | explicit stored field; range 1962--2026 |
| honors-bearing records | 182 | analysis script | at least one stored honor |

Current top institution counts are Stanford and UC San Diego (14 each), followed by Monash (13),
UC Irvine, UCLA, and the University of Florida (11 each), then the National University of
Singapore, Texas Tech, the University of Melbourne, the University of Toronto, and the University
of Wisconsin--Madison (10 each). Current track counts are Tenure-line 774, Clinical 96, Teaching
68, Emeritus 37, and Research 18. Current country counts are U.S. 659, Australia 64, U.K. 54,
Canada 47, France 36, Japan 33, Singapore 25, and Taiwan 21.

## Metrics worth instrumenting before publication

Record per-run candidates, accepted/rejected/deferred counts, rejection reasons, human-review
requests, changes by type, dead-link corroboration outcomes, agent/tool/model, elapsed time,
token/API cost, and time from an external page change to detection. Store evidence snapshots or
hashes and a stable event identifier for each applied proposal. These would support precision,
recall, cost, and freshness evaluation rather than only snapshot characterization.
