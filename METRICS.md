# Metrics

Generated from `public/data.json` on 2026-08-29 with `node analysis/analyze-roster.mjs`.

| Metric | Value | Reproduction | Caveat |
|---|---:|---|---|
| roster records | 831 | analysis script | current snapshot, not census |
| universities | 367 | analysis script | exact strings after repository canonicalization |
| countries | 19 | analysis script | current-country field |
| U.S. records | 554 | analysis script | missing country defaults to U.S. in app |
| international records | 277 | analysis script | non-U.S. country values |
| broad fields | 17 | `src/data.ts` / tests | field mapping is rule plus overrides |
| profile URLs | 831 | analysis script | presence, not live HTTP validity |
| Scholar URLs | 325 | analysis script | presence, not identity correctness |
| personal/lab websites | 103 | analysis script | presence |
| PhD institutions | 656 | analysis script | explicit stored field |
| PhD years | 488 | analysis script | explicit stored field; range 1962--2026 |
| honors-bearing records | 178 | analysis script | at least one stored honor |

Current top institution counts are Monash (13), UC San Diego (12), National University of
Singapore (11), and Texas Tech, UC Irvine, University of Melbourne, and University of Toronto
(10 each). Current track counts are Tenure-line 701, Teaching 68, Emeritus 37, Clinical 21, and
Research 4. Current country counts are U.S. 554, Australia 60, Canada 46, U.K. 46, France 33,
Singapore 26, and Taiwan 21.

## Metrics worth instrumenting before publication

Record per-run candidates, accepted/rejected/deferred counts, rejection reasons, human-review
requests, changes by type, dead-link corroboration outcomes, agent/tool/model, elapsed time,
token/API cost, and time from an external page change to detection. Store evidence snapshots or
hashes and a stable event identifier for each applied proposal. These would support precision,
recall, cost, and freshness evaluation rather than only snapshot characterization.
