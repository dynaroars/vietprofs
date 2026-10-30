# VietProfs

[VietProfs](https://vietprofs.roars.dev) is a searchable, community-maintained directory of Vietnamese and Vietnamese-diaspora academics at universities and eligible public or nonprofit research institutes worldwide, covering tenure-line, teaching, research, and clinical faculty (see [`ROSTER_MAINTENANCE.md`](./ROSTER_MAINTENANCE.md) for exact eligibility). [Read the paper](https://vietprofs.roars.dev/vietprofs.pdf) ([arXiv](https://arxiv.org/abs/2609.06091)) describing the project — the site's copy is kept current; the arXiv listing is a versioned snapshot.

This site is maintained by users all around the world (e.g., [submitting new or editing existing entries](https://vietprofs.roars.dev/submit.html)) _and_ AI bots that continuously validate and update the directory database. The site itself documents its search, filters, and keyboard shortcuts (press `?` there for help).

Repository documentation:

- [`README.md`](./README.md): project overview, commands, and operating instructions.
- [`ROSTER_MAINTENANCE.md`](./ROSTER_MAINTENANCE.md): authoritative eligibility, evidence, and roster-editing policy.
- [`AGENTS.md`](./AGENTS.md): instructions for automated contributors, including where each kind of change is submitted.
- [`TASKS/`](./TASKS/README.md): per-task agent playbooks (discovery, portraits, links, honors, relationships, PR/Issue audit).
- [`paper/PAPER_NOTES.md`](./paper/PAPER_NOTES.md): reproducible manuscript metrics, claim audit, and publication checklist.
- [`TASKS/AUTOMATION.md`](./TASKS/AUTOMATION.md): scheduled maintenance agents, their cadence, and how the auditor reviews their PRs/Issues.

## Commands

```bash
npm install
npm run dev       # start the Vite development server
npm run build     # build the production site to dist/
npm run preview   # preview the production build
npm run typecheck # check TypeScript modules
npm test          # validate data and run unit/UI tests
npm run test:e2e  # run browser smoke tests
npm run analyze   # print snapshot counts for paper/PAPER_NOTES.md and the paper
npm run figures   # rebuild and recapture the paper's screenshot figures
```

The manuscript source lives under [`paper/`](./paper/). After a roster change it cites, run `npm
run analyze` and `npm run figures` to refresh its snapshot values and screenshots, update
`paper/PAPER_NOTES.md`/`paper/paper.tex` accordingly, rebuild the PDF (`cd paper && latexmk -pdf
paper.tex`), and copy the result to `public/vietprofs.pdf` — that copy isn't built in CI,
so it must be committed manually.

The health view includes a current Project Complexity snapshot (source lines, files, commits,
contributors, and GitHub PR/Issue counts and latest links). `npm run build-project-stats`
refreshes it automatically on dev/build, without walking historical roster snapshots or running
network requests during unit tests. GitHub requests use `GITHUB_TOKEN`/`GH_TOKEN` or local `gh`
authentication; if unavailable, the last successful GitHub snapshot is kept with its date.

## Data and contributions

The roster lives in [`public/data.json`](./public/data.json). Each active record gets a static
public profile at `people/vp-####.html`, and its immutable `vp-####` `id` is assigned by `npm run
assign-profile-ids -- --apply` after an entry is added.

Verified roster-internal academic connections live in the normalized edge table
[`public/relationships.json`](./public/relationships.json). Profile pages render these records in a
Connections section; candidate or unresolved relationships never appear in this public file.

Thanks to [hieuphay.com](https://hieuphay.com/ban-do-kinh-te-viet-nam/) for an initial dataset of
Vietnamese economists that seeded a batch of entries, and to the many contributors over
LinkedIn and other channels who've suggested corrections and additions.

Scheduled AI routines maintain the roster, each reviewed by an independent nightly auditor; see
[TASKS/AUTOMATION.md](./TASKS/AUTOMATION.md). Existing entries are re-verified in rotation following
[ROSTER_MAINTENANCE.md](./ROSTER_MAINTENANCE.md#periodic-full-roster-refresh).

## License

Code is licensed under [Creative Commons
Attribution-NonCommercial-NoDerivatives 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/).
The roster data is not openly licensed: you may browse it on the site, cite individual facts, and
link to it, but copying, scraping, redistributing, or using it for AI training or commercial
purposes needs written permission. Portraits and the manuscript are not covered. See
[`LICENSE`](./LICENSE) for full terms.
