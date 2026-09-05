# VietProfs

[VietProfs](https://vietroars.roars.dev) is a searchable, community-maintained directory of Vietnamese and Vietnamese-diaspora academics at universities and eligible public or nonprofit scholarly research institutes worldwide. It includes university faculty and faculty-equivalent permanent researchers---such as CNRS and INRIA researchers, Max Planck group leaders, RIKEN scientists, and CSIRO researchers---because they publish, lead research groups, obtain funding, and mentor students much like university faculty. Corporate research labs are outside its scope. This [paper](https://vietprofs.roars.dev/vietprofs.pdf) describes the project.

This site is maintained by users all around the world (e.g., [submitting new or editing existing entries](https://vietprofs.roars.dev/submit.html)) _and_ AI bots that continuously validates and updates the directory database.  

## Search and filters

The search box matches names, employing institutions and institution types, departments, ranks, locations, research areas, honors, and degree institutions. Keyword prefixes can limit a search to a particular field; it defaults to everything. Location, field, appointment track, and institution type have dedicated filters. Matching is diacritic-insensitive, so `Nguyen` finds `Nguyễn`.

The location, field, and track filters can be combined. Shareable URLs preserve the active search and filters. The “Show me something interesting” option provides roster-derived observations about geography, institutions, fields, and appointment tracks, alongside interactive charts (distribution by field, career stage, and country; PhD-cohort and top-institution rankings; and roster growth over time, built from `public/data.json`'s git history). It does not make claims about institutional prestige or Vietnamese population size.

The directory also has a keyboard-first interface: `/` focuses search, `j` and `k` move through
results, `Enter` opens the selected profile, `f` toggles its favorite state, `r` opens a random
profile, and `?` shows help. Search accepts the documented field prefixes as well as small terminal
Easter eggs such as `help`, `whoami`, `uname -a`, `fortune`, `/dev/random`, and `theme crt`.
Individual profile pages use a compact Unix-manual layout and expose roster provenance and the raw
record behind the rendered page.


Repository documentation is intentionally limited to four files:

- [`README.md`](./README.md): project overview, commands, and operating instructions.
- [`ROSTER_MAINTENANCE.md`](./ROSTER_MAINTENANCE.md): authoritative eligibility, evidence, and roster-editing policy.
- [`paper/PAPER_NOTES.md`](./paper/PAPER_NOTES.md): reproducible manuscript metrics, claim audit, and publication checklist.
- [`AGENTS.md`](./AGENTS.md): concise instructions for automated contributors.


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

`npm run analyze` produces the snapshot values used by the manuscript, and `npm run figures`
rebuilds its screenshots. Run both after a roster change that the paper cites, then update
`paper/PAPER_NOTES.md` and `paper/paper.tex` from those outputs. The manuscript source lives
entirely under [`paper/`](./paper/); after editing it, rebuild the PDF locally (e.g. `cd paper &&
latexmk -pdf paper.tex`) and copy the result to `vietprofs.pdf` at the repo root — the committed
PDF is not built in CI, so this copy must be committed manually for the site to pick up the
change.

By default `npm run dev` serves the site at `http://localhost:5173`. To make the dev server
reachable from other machines on your network:

```bash
npm run dev -- --host
```

This binds to all network interfaces. Other machines can then browse to
`http://<this-machine's-hostname-or-IP>:5173`.

## Data and contributions

The roster lives in [`public/data.json`](./public/data.json). Each active record gets a static
public profile at `people/vp-####.html`, and its immutable `vp-####` `id` is assigned by `npm run
assign-profile-ids -- --apply` after an entry is added.

To suggest an addition or correction, use [`submit.html`](./submit.html) rather than editing the
repository directly — paste a name, a profile/homepage link, or a directory page, and it opens a
pre-filled email or GitHub issue for maintainers to research and verify.

Full eligibility, evidence, and data-format rules — accepted appointment tracks, honors criteria,
degree fields, and more — are documented in
[`ROSTER_MAINTENANCE.md`](./ROSTER_MAINTENANCE.md). The rules behind the "Show me something
interesting" view are in its [interesting-facts
section](./ROSTER_MAINTENANCE.md#interesting-facts-guidelines).

Thanks to [hieuphay.com](https://hieuphay.com/ban-do-kinh-te-viet-nam/) for a dataset of
Vietnamese-diaspora economists that seeded a batch of entries, and to the many contributors over
LinkedIn and other channels who've suggested corrections and additions.

An unattended maintenance controller ([`scripts/maintain-roster.ts`](./scripts/maintain-roster.ts))
periodically re-verifies existing entries and pushes updates directly to `main`; see
[ROSTER_MAINTENANCE.md](./ROSTER_MAINTENANCE.md#periodic-full-roster-refresh) for how it works and
how to run it manually.

## License

Code and data are licensed under [Creative Commons
Attribution-NonCommercial-NoDerivatives 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/);
portraits and the manuscript are not covered. See [`LICENSE`](./LICENSE) for full terms.
