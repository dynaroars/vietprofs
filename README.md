# VietProfs

Visitor-statistics methodology and Worker operations are documented in [docs/VISITOR_STATISTICS.md](docs/VISITOR_STATISTICS.md).

[VietProfs](https://vietroars.roars.dev) is a searchable, community-maintained directory of Vietnamese and Vietnamese-diaspora academics at universities and eligible public or nonprofit research institutes worldwide, covering tenure-line, teaching, research, and clinical faculty (see [`ROSTER_MAINTENANCE.md`](./ROSTER_MAINTENANCE.md) for exact eligibility). [Read the paper](https://vietprofs.roars.dev/vietprofs.pdf) ([arXiv](https://arxiv.org/abs/2609.06091)) describing the project — the site's copy is kept current; the arXiv listing is a versioned snapshot.

This site is maintained by users all around the world (e.g., [submitting new or editing existing entries](https://vietprofs.roars.dev/submit.html)) _and_ AI bots that continuously validate and update the directory database. The site itself documents its search, filters, and keyboard shortcuts (press `?` there for help).

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

The manuscript source lives under [`paper/`](./paper/). After a roster change it cites, run `npm
run analyze` and `npm run figures` to refresh its snapshot values and screenshots, update
`paper/PAPER_NOTES.md`/`paper/paper.tex` accordingly, rebuild the PDF (`cd paper && latexmk -pdf
paper.tex`), and copy the result to `vietprofs.pdf` at the repo root — that copy isn't built in CI,
so it must be committed manually.

## Data and contributions

The roster lives in [`public/data.json`](./public/data.json) and is also published on [Hugging Face Datasets](https://huggingface.co/datasets/nguyenthanhvuh/vietprofs). Each active record gets a static
public profile at `people/vp-####.html`, and its immutable `vp-####` `id` is assigned by `npm run
assign-profile-ids -- --apply` after an entry is added.

Verified roster-internal academic connections live in the normalized edge table
[`public/relationships.json`](./public/relationships.json). Profile pages render these records in a
Connections section; candidate or unresolved relationships never appear in this public file.

Thanks to [hieuphay.com](https://hieuphay.com/ban-do-kinh-te-viet-nam/) for an initial dataset of
Vietnamese economists that seeded a batch of entries, and to the many contributors over
LinkedIn and other channels who've suggested corrections and additions.

An unattended AI-based maintenance controller ([`scripts/maintain-roster.ts`](./scripts/maintain-roster.ts))
periodically re-verifies existing entries and pushes updates directly to `main`; see
[ROSTER_MAINTENANCE.md](./ROSTER_MAINTENANCE.md#periodic-full-roster-refresh) for how it works and
how to run it manually.

## License

Code and data are licensed under [Creative Commons
Attribution-NonCommercial-NoDerivatives 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/);
portraits and the manuscript are not covered. See [`LICENSE`](./LICENSE) for full terms.
