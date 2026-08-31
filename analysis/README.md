# Reproducible analysis

Run from the repository root:

```bash
npm run analyze > /tmp/vietprofs-roster-analysis.json
```

This script reads `public/data.json` and reports counts, distributions, coverage fields,
and conservative institution/field observations. It imports `fieldOf`, `FIELDS`, and `countBy`
from `src/data.ts`, so its broad-field counts are exactly the ones the site shows rather than an
approximation of them.

Counts published in `METRICS.md`, `INTERESTING-FACTS.md`, and `paper.tex` come from this
script; regenerate all three together after a roster change so they stay mutually consistent.
