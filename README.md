# VietProfs

VietProfs is a searchable, community-maintained directory of Vietnamese and Vietnamese-diaspora professors at universities worldwide.

The site is a static Vite application. The roster is stored in [`public/data.json`](./public/data.json) and loaded, searched, filtered, and sorted in the browser.

Live site: <https://vietprofs.roars.dev>

## Search and filters

The search box matches names, universities, departments, ranks, locations, research areas, honors, and PhD institutions. Use the selector at the left of the search box to limit the search to name, university, department, rank, research area, honors, or PhD institution; it defaults to `Everything`. Location, field, and appointment track remain dedicated filters. Matching is diacritic-insensitive, so `Nguyen` finds `Nguyễn`.

The location, field, and track filters can be combined. Shareable URLs preserve the active search and filters. The “Show me something interesting” option provides roster-derived observations about geography, institutions, fields, and appointment tracks. It does not make claims about institutional prestige or Vietnamese population size.

## Commands

```bash
npm install
npm run dev       # start the Vite development server
npm run build     # build the production site to dist/
npm run preview   # preview the production build
npm run typecheck # check TypeScript modules
npm test          # validate data and run unit/UI tests
npm run test:e2e  # run browser smoke tests
```

By default `npm run dev` only listens on `localhost`. To make the dev server reachable from other
machines on your network over HTTPS:

```bash
npm run dev -- --host
```

This binds to all network interfaces and serves a self-signed certificate via
`@vitejs/plugin-basic-ssl` (already configured in `vite.config.ts`). Other machines on the network
can then browse to `https://<this-machine's-hostname-or-IP>:5173`, accepting the self-signed
certificate warning on first visit.

## Data and contributions

Edit [`public/data.json`](./public/data.json) to add, remove, or correct roster entries. When adding a person, omit `id`: normal development, validation, and build commands assign the next immutable `vp-####` ID and write it into the file; commit that generated ID with the entry. Current academic profile URL, university, department, rank/track, country, and canonical UTC `lastUpdatedAt` timestamp remain required. Maintainers track full-review times separately in [`maintenance/verification.json`](./maintenance/verification.json), which is not part of the public site data.

Each active record generates a static public profile at `people/vp-####.html` during development and production builds. Names on roster cards link to that profile, and its edit link opens the submission form with the record pre-filled. A name correction therefore preserves the profile URL. The generator also produces redirects for former name-based profile URLs. For a deletion or duplicate merge, retire the old ID in [`maintenance/profile-redirects.json`](./maintenance/profile-redirects.json): a merge redirects to the surviving ID, while a removal retains a noindex retirement page.

The accepted tracks are:

- `Tenure-line` — tenure-track or tenured faculty.
- `Teaching` — stable, full-time non-tenure-track teaching faculty; this includes Professor of Practice and equivalent appointments.
- `Research` — stable faculty-level research appointments, not postdoctoral or temporary research roles.
- `Clinical` — stable clinical-faculty appointments, not adjunct or temporary clinical teaching.
- `Emeritus` — formally conferred emeritus/emerita appointments following a tenure-line career.

The stored `rank` preserves an institution’s actual title when it clarifies a non-tenure track, such as `Clinical Professor`, `Assistant Research Professor`, or `Professor of Practice`.

Completed postdoctoral training may be recorded with `postdocInstitution` when a source explicitly identifies the institution. Add `postdocYear` only when that source explicitly gives the end or completion year.

Honors are limited to substantial, field-level distinctions. Local university, departmental, student,
service, teaching, and community-engagement awards are not included unless their independent
field-wide standing is clearly documented; an impressive title or cash prize alone is insufficient.

Use [`submit.html`](./submit.html) to propose an entry or correction without editing the repository directly. Correction emails include the existing record's immutable ID, permanent VietProfs profile URL, current and proposed names, and a field-by-field change list; new-entry emails include the submitted facts and evidence notes. Maintainers review submissions before adding them to the roster.

Detailed inclusion, verification, discovery, field-mapping, and data-format guidance is in [`ROSTER_MAINTENANCE.md`](./ROSTER_MAINTENANCE.md).

### Interesting-facts guidelines

The interesting-facts view is computed from the current [`public/data.json`](./public/data.json), not from hand-written anecdotes. Observations should:

- be reproducible from stored roster fields such as university, city, state, country, department, field, rank, and track;
- describe multiple records and use explicit counts or percentages where useful;
- apply conservative minimum sample sizes and omit weak patterns from small filtered subsets;
- be phrased as observations about this roster, not as estimates of the entire Vietnamese academic diaspora; qualified signals may use language such as “suggests” or “is consistent with” when the data supports a pattern but cannot establish a broader conclusion; and
- remain valid when the roster changes, because the values are calculated at runtime.

Do not turn a suggestive pattern into a definitive claim. In particular, do not infer prestige, selectivity, research quality, population size, ethnicity, migration history, or causal explanations from a university, city, country, field, surname, or award name. Do not present current-roster concentrations as growth, migration paths, or emerging regions unless historical data explicitly supports the claim. External rankings and population statistics are out of scope for this view unless they are separately sourced and intentionally documented.

## Automated roster maintenance

[`scripts/maintain-roster.ts`](./scripts/maintain-roster.ts) is the unattended weekly
maintenance controller. It selects missing or oldest entries from
[`maintenance/verification.json`](./maintenance/verification.json), asks the selected agent to
perform the full live research pass. Claude is the default agent. An independent Codex verification pass is optional and can be enabled
with `--codex-review`. The agent can be changed from Claude (the default) to Codex with
`--agent codex`. Neither agent can edit repository files. The controller applies structured data
after the agent's work, or after the independent Codex review when that
flag is enabled, and runs the
project checks, commits that person, and pushes directly to `origin/main`. No pull request or
manual review is required.

Prerequisites:

- Linux with Node.js, npm, and Git;
- a configured Git author identity and push access to `origin/main`.

The default Claude agent requires the `claude` CLI and a successful `claude auth status`.

The optional `--codex-review` pass also requires the `codex` CLI and a successful
`codex login status`.

Run it from the repository root:

```bash
./scripts/maintain-roster.ts run
```

A new run processes at most 40 entries that have not completed a full review in 365 days. Preview
the selection without invoking either agent or changing Git:

```bash
./scripts/maintain-roster.ts run --dry-run
```

For the first complete sweep of the roster, allow one long run to queue every current entry:

```bash
./scripts/maintain-roster.ts run --all --limit 1000
```

To process the entire roster in smaller commit-and-push batches, use `--all` with the batch size
specified by `--limit`. To cap the run, use `--total` instead. Both modes prioritize the least
recently verified entries before each batch:

```bash
./scripts/maintain-roster.ts run --all --limit 40
# or, for up to 1,000 entries:
./scripts/maintain-roster.ts run --total 1000 --limit 40
```

The controller commits and pushes after each completed batch and resumes the active batch if it is
interrupted.

After that sweep completes, the normal weekly command selects only entries whose successful full
verification is at least one year old.

Use `--limit` or `--stale-days` to change the run, or force a small current-data pass with:

```bash
./scripts/maintain-roster.ts run --all --limit 1
```

Enable independent Codex verification for a run with:

```bash
./scripts/maintain-roster.ts run --all --limit 1 --codex-review
```

Use Codex as the agent when Claude is unavailable or rate-limited:

```bash
./scripts/maintain-roster.ts --all --limit 1 --agent codex
```

Use `--name` with a person-like query to have Claude match it to one canonical roster member and
run the full workflow regardless of verification age. Capitalization and omitted middle initials
may be resolved when the match is unambiguous:

```bash
./scripts/maintain-roster.ts run --name "Thanhvu Nguyen"
```

The same option accepts a field-like query. Claude maps it to a canonical field and the controller
queues every roster member in that field, ignoring the normal age and entry-limit selection:

```bash
./scripts/maintain-roster.ts run --name "Computer Science"
```

The process may remain active for hours while an account limit resets. It automatically retries
rate limits with increasing waits. To stop it safely, press <kbd>Ctrl</kbd>+<kbd>C</kbd>, or run this
from another terminal:

```bash
./scripts/maintain-roster.ts stop
```

Running `./scripts/maintain-roster.ts run` again—even days later—detects the saved checkpoint and
resumes the interrupted person and stage. Check progress with:

```bash
./scripts/maintain-roster.ts status
```

For a run that should survive closing the terminal, start it in the background:

```bash
nohup ./scripts/maintain-roster.ts run >/tmp/vietprofs-maintenance.log 2>&1 &
```

Controller state and per-agent logs live under `~/.local/state/vietprofs-maintenance/` by default.
Set `VIETPROFS_MAINTENANCE_STATE_DIR=/another/path` to override that location. Start a new run from
a clean `main` checkout, and do not edit that checkout while the controller is active or paused.
When enabled, rejected proposals receive up to two Claude revisions using Codex's concrete
feedback, with a new independent review after each revision. Proposals still rejected after those
attempts, and incomplete or uncertain reviews, are logged, keep their old verification timestamp,
and are deferred for 30 days so they do not prevent the rest of the roster from being processed.
