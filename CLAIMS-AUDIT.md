# Claims audit

| Claim | Evidence | Confidence | Author confirmation |
|---|---|---|---|
| Static Vite site loads public JSON in browser | `README.md`, `src/data.ts`, `src/main.ts` | High | No |
| Eligibility requires current primary appointment outside Vietnam and accepted tracks | `ROSTER_MAINTENANCE.md` | High | No |
| Surname is a discovery signal, not identity proof | `ROSTER_MAINTENANCE.md` research workflow | High | No |
| Controller selects stale/missing ledger entries and batches them | `README.md`, `scripts/maintain-roster.ts` | High | No |
| Claude is default; Codex is selectable/optional independent review | README and controller schemas/CLI | High | No |
| Proposal edits are constrained to one target and validated structurally | `analyzeRosterProposal`, `proposalValidationError`, tests | High | No |
| Full review advances ledger even without public data change | `ROSTER_MAINTENANCE.md`, controller workflow | High | No |
| Runtime observations are recomputed from current roster | `src/data.ts`, `src/main.ts`, tests | High | No |
| Search narrows by a scope selector, not attribute prefixes (`univ:`) | `src/main.ts` scope select; `matchesSearchScope` in `src/data.ts` | High | No |
| Paper figures are regenerated from the built site | `scripts/capture-figures.ts` | High | No |
| Snapshot has 993 records, 423 universities, 20 countries | `public/data.json`, `analysis/analyze-roster.ts` | High | No |
| Git history includes full refresh, country sweeps, dedupe, track corrections | Git commits listed in `TECHNICAL-NOTES.md` | High | No |
| The system is completely autonomous | No supporting evidence; contradicted by review/uncertainty paths | Do not claim | Yes |
| Recall, precision, cost, and freshness are measured | No telemetry or controlled evaluation found | Low/unsupported | Yes |

External scholarly claims are cited in `paper.tex` and `references.bib`; repository claims should
be rechecked against the current branch before submission because the roster and code are changing.
