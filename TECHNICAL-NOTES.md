# VietProfs technical notes

## Scope and canonical state

The application is a static Vite/TypeScript site. `public/data.json` is the public canonical
roster; `maintenance/verification.json` is a tracked but non-public-site ledger of full-review
timestamps. Each public record stores a display name, current profile URL, university, location,
department, research areas, track/rank, optional education, honors, portrait provenance, and
`lastUpdatedAt`. The current snapshot has 831 records, 367 universities, 19 countries, and 17
broad application fields (analysis generated 2026-08-29).

Eligibility is policy-driven, not surname-driven: current primary university appointment outside
Vietnam plus one of Tenure-line, Teaching, Research, Clinical, or Emeritus. Adjunct, visiting,
postdoctoral, affiliate/courtesy, temporary, part-time, and industry-only roles are excluded.
The maintenance guide explicitly says Vietnamese identity is not to be inferred from a surname;
the research process uses names as discovery signals but requires appointment evidence.

## Pipeline inventory

| Subsystem | Files | Inputs/outputs | Automation boundary |
|---|---|---|---|
| Discovery query generation | `scripts/faculty-discovery-queries.ts` | university, field, domain -> repeatable search queries | deterministic helper; research remains agent/human |
| Agent maintenance | `scripts/maintain-roster.ts` | roster + ledger + web research -> structured proposal/report | Claude default; Codex selectable or independent review |
| Proposal validation | same controller; tests in `test/maintenance-controller.test.ts` | JSON proposal -> accepted/rejected targeted change | deterministic schema/scope checks |
| Canonical data | `public/data.json` | approved records -> site | committed JSON |
| Review ledger | `maintenance/verification.json` | full-review completion -> due-entry selection | deterministic prioritization |
| Classification/search | `src/data.ts`, `src/main.ts` | records -> broad fields, index, filters | runtime deterministic logic |
| Derived view | `buildFunFacts`, `build*Observations`, `buildAwardsFunFacts` | current roster -> runtime observations | deterministic, not stored |
| Deployment | `.github/workflows/deploy.yml` | push to `main` -> test/build/GitHub Pages | GitHub Actions |
| Submission | `submit.html`, `src/submit.ts` | user proposal -> maintainer email/form payload | human review before canonical inclusion |

## Actual maintenance behavior

The controller selects missing or oldest ledger entries, normally older than 365 days, in batches
of at most 40. It supports `--all`, `--total`, `--name`, dry runs, resumable checkpoints, rate
limit retries, safe stop/status, and optional Codex review. It asks the research agent for a full
live pass, validates a structured proposal, prevents edits outside the target, preserves the
baseline timestamp while comparing content, and sets `lastUpdatedAt` only for substantive changes.
The ledger timestamp advances after a complete review even when the public record is unchanged.
The deployed default can commit and push directly after checks; this is unattended operation with
deterministic gates, not a formal correctness guarantee.

The process has two distinct loops. Expansion searches a bounded university/field/country space
for people absent from the roster. Revalidation starts from an existing record and checks the
profile URL, URL roles, Scholar link, appointment, rank/track, education, honors, and incidental
new candidates. A disappeared page is treated as a research problem, not automatic deletion.

## Important implementation examples

The repository history contains a 20-batch full-roster refresh on 2026-08-26, country sweeps for
Australia, Canada, France, Singapore, Taiwan, Japan, Germany, Hong Kong, and others on 2026-08-28,
and automated maintenance batches on 2026-08-28/29. Concrete correction commits include:

* `2aa15c0` merged duplicate University of Dayton entries for Tam V. Nguyen;
* `9a4a171` removed Nhung Nguyen (UCSF) under the inclusion policy;
* `ba71beb` changed Khiem Pham-Nguyen from Teaching to Clinical;
* `c1f4380` corrected Nguyen-Truc-Dao Nguyen's affiliation;
* `c0c0603` fixed a true duplicate and inconsistent name suffix;
* `4212955` canonicalized university names and deduplicated entries.

These are historical repository events, not independently reconstructed biographies. Their value
for the paper is that the Git history exposes additions, policy corrections, track changes,
deduplication, and revalidation as first-class maintenance operations.

## Derived observations

The site computes observations at runtime from current records. The current code reports counts,
state/country/institution groups, same-institution same-field clusters, track shares, broad-field
comparisons between U.S. and international subsets, award categories, PhD cohorts, and top
universities/doctoral institutions. Tests require observations to be roster-derived and avoid
name-based trivia, prestige inference, and demographic claims. Derived observations are therefore
fresh for a changed snapshot, but no separate dependency graph or historical fact store exists.

## Failure modes and gaps

No controlled recall/precision experiment, cost telemetry, candidate rejection log, page-change
latency metric, or formal evidence confidence score is present in the repository. The verification
ledger records completed reviews, not all observed evidence or rejected candidates. Source URLs are
stored for profiles, honors, and portraits, but there is no per-field evidence graph. These limits
should be explicit in any paper.
