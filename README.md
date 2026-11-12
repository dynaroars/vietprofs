# VietProfs

[VietProfs](https://vietprofs.roars.dev) is a searchable, AI and community-maintained directory of Vietnamese and Vietnamese-diaspora academics, researchers, and scientific leaders outside Vietnam. The site is one directory (`index.html`) with a Sector filter: **`🎓 Academia`** (university faculty), **`🏛️ Gov, Defense & Labs`** (public/nonprofit research institutes, defense research, scientific program officers, central banks, international organizations, and policy think tanks), and **`🏢 Industry`** (corporate research labs), all drawn from the same `public/data.json` roster (each entry's sector is derived from its `institutionType` and `track`). See [`ROSTER_MAINTENANCE.md`](./ROSTER_MAINTENANCE.md) for exact eligibility across all tracks. [Read the paper](https://vietprofs.roars.dev/vietprofs.pdf) ([arXiv](https://arxiv.org/abs/2609.06091)) describing the project — the site's copy is kept current; the arXiv listing is a versioned snapshot.

This site is maintained by users all around the world (e.g., [submitting new or editing existing entries](https://vietprofs.roars.dev/submit.html)) _and_ AI bots that continuously validate and update the directory database. The site itself documents its search syntax and filters (click the `?` in the search box for help).


## Data and contributions

The roster lives in one file, [`public/data.json`](./public/data.json), with a unified immutable `vp-####` ID namespace. It covers university faculty, public/nonprofit research institutes, defense/government scientific leaders, corporate research labs, central banks, international organizations, and think tanks; each entry's `institutionType` and `track` decide which directory sector it appears in.

Each active record gets a static public profile at `people/vp-####.html`, and its immutable `vp-####` `id` is assigned by `npm run assign-profile-ids -- --apply` after an entry is added.

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
