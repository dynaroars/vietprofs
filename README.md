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
| `phd:`, `phdinstitution:`, `alma:` | Doctoral institution | `phd:Stanford` |
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

## Data and contributions

Edit [`public/data.json`](./public/data.json) to add, remove, or correct roster entries. Each entry needs a current academic profile URL, university, department, rank/track, and country. The accepted tracks are `Tenure-line`, `Teaching`, and `Emeritus`.

Use [`submit.html`](./submit.html) to propose an entry or correction without editing the repository directly. Maintainers review submissions before adding them to the roster.

Detailed inclusion, verification, discovery, field-mapping, and data-format guidance is in [`ROSTER_MAINTENANCE.md`](./ROSTER_MAINTENANCE.md).

## Licensing

The source code is licensed under the [MIT License](./LICENSE). Original roster curation and documentation are licensed under [CC BY 4.0](./DATA-LICENSE.md).

Portraits, linked pages, university names, trademarks, and other third-party content are not covered by these project licenses and remain subject to their respective rights. See [`DATA-LICENSE.md`](./DATA-LICENSE.md).
