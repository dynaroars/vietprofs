# VietProfs

VietProfs is a searchable, community-maintained directory of Vietnamese and Vietnamese-diaspora professors at universities worldwide.

The site is a static Vite application. The roster is stored in [`public/data.json`](./public/data.json) and loaded, searched, filtered, and sorted in the browser.

Live site: <https://vietprofs.roars.dev>

## Search and filters

The search box matches names, universities, departments, ranks, locations, research areas, honors, and PhD institutions. Matching is diacritic-insensitive, so `Nguyen` finds `Nguyễn`.

Use prefixes when you want to search one attribute:

| Prefix | Searches | Example |
| --- | --- | --- |
| `univ:`, `university:`, `school:` | Current university | `univ:Oxford` |
| `phd`, `postdoc`, `ms`, `undergrad` | People with that recorded credential; add `:Institution` to narrow it | `postdoc:Carnegie Mellon` |
| `country:`, `nation:` | Current country | `country:France` |
| `continent:`, `location:`, `loc:` | Continent or region | `loc:Europe` |
| `state:` | State or province | `state:California` |
| `city:` | City | `city:Paris` |
| `dept:`, `department:` | Primary department | `dept:Economics` |
| `name:` | Displayed name | `name:"Thanh Nguyen"` |

The location, field, and track filters can be combined. Shareable URLs preserve the active search and filters. The “Show me something interesting” option provides geographic, university, PhD, and graduation-cohort insights.

## Commands

```bash
npm install
npm run dev       # start the Vite development server
npm run build     # build the production site to dist/
npm run preview   # preview the production build
npm test          # validate data and run unit/UI tests
npm run test:e2e  # run browser smoke tests
```

By default `npm run dev` only listens on `localhost`. To make the dev server reachable from other
machines on your network over HTTPS:

```bash
npm run dev -- --host
```

This binds to all network interfaces and serves a self-signed certificate via
`@vitejs/plugin-basic-ssl` (already configured in `vite.config.js`). Other machines on the network
can then browse to `https://<this-machine's-hostname-or-IP>:5173`, accepting the self-signed
certificate warning on first visit.

## Data and contributions

Edit [`public/data.json`](./public/data.json) to add, remove, or correct roster entries. Each entry needs a current academic profile URL, university, department, rank/track, country, and canonical UTC `lastUpdatedAt` timestamp. The accepted tracks are `Tenure-line`, `Teaching`, and `Emeritus`. Maintainers track full-review times separately in [`maintenance/verification.json`](./maintenance/verification.json), which is not part of the public site data.

Completed postdoctoral training may be recorded with `postdocInstitution` when a source explicitly identifies the institution. Add `postdocYear` only when that source explicitly gives the end or completion year.

Use [`submit.html`](./submit.html) to propose an entry or correction without editing the repository directly. Maintainers review submissions before adding them to the roster.

Detailed inclusion, verification, discovery, field-mapping, and data-format guidance is in [`ROSTER_MAINTENANCE.md`](./ROSTER_MAINTENANCE.md).

## Automated roster maintenance

[`scripts/maintain-roster.mjs`](./scripts/maintain-roster.mjs) is the unattended weekly
maintenance controller. It selects missing or oldest entries from
[`maintenance/verification.json`](./maintenance/verification.json), asks Claude Code to perform
the full live research pass, and asks Codex to verify the proposal independently. Neither agent can
edit repository files. The controller applies structured data only when Codex agrees, runs the
project checks, commits that person, and pushes directly to `origin/main`. No pull request or
manual review is required.

Prerequisites:

- Linux with Node.js, npm, and Git;
- the `claude` and `codex` CLIs installed and available on `PATH`;
- authenticated sessions (`claude auth status` and `codex login status` must succeed); and
- a configured Git author identity and push access to `origin/main`.

Run it from the repository root:

```bash
./scripts/maintain-roster.mjs run
```

A new run processes at most 40 entries that have not completed a full review in 365 days. Preview
the selection without invoking either agent or changing Git:

```bash
./scripts/maintain-roster.mjs run --dry-run
```

For the first complete sweep of the roster, allow one long run to queue every current entry:

```bash
./scripts/maintain-roster.mjs run --all --limit 1000
```

After that sweep completes, the normal weekly command selects only entries whose successful full
verification is at least one year old.

Use `--limit` or `--stale-days` to change the run, or force a small current-data pass with:

```bash
./scripts/maintain-roster.mjs run --all --limit 1
```

Use `--name` with a person-like query to have Claude match it to one canonical roster member and
run the full workflow regardless of verification age. Capitalization and omitted middle initials
may be resolved when the match is unambiguous:

```bash
./scripts/maintain-roster.mjs run --name "Thanhvu Nguyen"
```

The same option accepts a field-like query. Claude maps it to a canonical field and the controller
queues every roster member in that field, ignoring the normal age and entry-limit selection:

```bash
./scripts/maintain-roster.mjs run --name "Computer Science"
```

The process may remain active for hours while an account limit resets. It automatically retries
rate limits with increasing waits. To stop it safely, press <kbd>Ctrl</kbd>+<kbd>C</kbd>, or run this
from another terminal:

```bash
./scripts/maintain-roster.mjs stop
```

Running `./scripts/maintain-roster.mjs run` again—even days later—detects the saved checkpoint and
resumes the interrupted person and stage. Check progress with:

```bash
./scripts/maintain-roster.mjs status
```

For a run that should survive closing the terminal, start it in the background:

```bash
nohup ./scripts/maintain-roster.mjs run >/tmp/vietprofs-maintenance.log 2>&1 &
```

Controller state and per-agent logs live under `~/.local/state/vietprofs-maintenance/` by default.
Set `VIETPROFS_MAINTENANCE_STATE_DIR=/another/path` to override that location. Start a new run from
a clean `main` checkout, and do not edit that checkout while the controller is active or paused.
Rejected proposals receive up to two Claude revisions using Codex's concrete feedback, with a new
independent review after each revision. Proposals still rejected after those attempts, and
incomplete or uncertain reviews, are logged, keep their old verification timestamp, and are
deferred for 30 days so they do not prevent the rest of the roster from being processed.
