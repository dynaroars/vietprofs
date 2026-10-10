# VietProfs

[VietProfs](https://vietprofs.roars.dev) is a searchable, community-maintained directory of Vietnamese and Vietnamese-diaspora academics at universities and eligible public or nonprofit research institutes worldwide, covering tenure-line, teaching, research, and clinical faculty (see [`ROSTER_MAINTENANCE.md`](./ROSTER_MAINTENANCE.md) for exact eligibility). [Read the paper](https://vietprofs.roars.dev/vietprofs.pdf) ([arXiv](https://arxiv.org/abs/2609.06091)) describing the project — the site's copy is kept current; the arXiv listing is a versioned snapshot.

This site is maintained by users all around the world (e.g., [submitting new or editing existing entries](https://vietprofs.roars.dev/submit.html)) _and_ AI bots that continuously validate and update the directory database. The site itself documents its search, filters, and keyboard shortcuts (press `?` there for help).

Repository documentation:

- [`README.md`](./README.md): project overview, commands, and operating instructions.
- [FAQ](#faq): frequently asked questions about eligibility, maintenance, automation, and features.
- [`ROSTER_MAINTENANCE.md`](./ROSTER_MAINTENANCE.md): authoritative eligibility, evidence, and roster-editing policy.
- [`AGENTS.md`](./AGENTS.md): instructions for automated contributors, including where each kind of change is submitted.
- [`TASKS/`](./TASKS/README.md): per-task agent playbooks (discovery, portraits, links, honors, relationships, PR/Issue audit).
- [`paper/PAPER_NOTES.md`](./paper/PAPER_NOTES.md): reproducible manuscript metrics, claim audit, and publication checklist.
- [`TASKS/AUTOMATION.md`](./TASKS/AUTOMATION.md): scheduled maintenance agents, their cadence, and how the auditor reviews their PRs/Issues.
- [`TASKS/VISITOR_STATISTICS.md`](./TASKS/VISITOR_STATISTICS.md): visitor-statistics methodology and Worker operations.

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

Scheduled AI routines maintain the roster, each reviewed by an independent nightly auditor; see
[TASKS/AUTOMATION.md](./TASKS/AUTOMATION.md). Existing entries are re-verified in rotation following
[ROSTER_MAINTENANCE.md](./ROSTER_MAINTENANCE.md#periodic-full-roster-refresh).

## FAQ

1. [General & Purpose](#general--purpose)
2. [Eligibility & Inclusion Criteria](#eligibility--inclusion-criteria)
3. [How the Website is Maintained & Kept Live](#how-the-website-is-maintained--kept-live)
4. [Features & Capabilities](#features--capabilities)
5. [Dataset & Access](#dataset--access)

### General & Purpose

**What is VietProfs?**

**VietProfs** ([vietprofs.roars.dev](https://vietprofs.roars.dev)) is an open-access, searchable directory documenting Vietnamese-heritage faculty and permanent research scientists worldwide. Each profile pairs an authentic Vietnamese-diacritic name and portrait with verified institutional affiliations, rank, department, appointment track, educational history, research keywords, curated major honors, and direct web links.

**Why was VietProfs created?**

Before VietProfs, Vietnamese-heritage scholars were scattered across thousands of departmental websites across dozens of countries with no centralized record. VietProfs serves several practical purposes:

- **Finding Mentors and Advisors:** Prospective graduate and undergraduate students can quickly discover mentors who share their cultural background and research interests.
- **Cross-Institutional Collaboration:** Researchers can find peers and collaborators in their geographic region or discipline.
- **Event Organization:** Conference organizers, professional societies, and student associations can find keynote speakers, panelists, and committee chairs.
- **Documenting Multi-Generational Contributions:** Preserving the long historical record of Vietnamese scholarly contributions abroad—from early pioneers like Bửu-Hội Nguyễn-Phúc (1939 Paris doctorate; CNRS Director of Research) and Xương Nguyễn-Hữu (1962 UC Berkeley PhD; UC San Diego) to newly minted assistant professors.

**Is VietProfs a ranking system?**

**No.** VietProfs is strictly a curated community directory and discovery tool. It does not rank scholars, institutions, or departments, nor does it evaluate individual research performance or prestige.

### Eligibility & Inclusion Criteria

**Who is eligible to be listed?**

To be included in VietProfs, a scholar must satisfy two concurrent requirements supported by verifiable public evidence (such as an official institutional webpage):

1. **Academic Appointment Outside Vietnam:** A verified appointment at a recognized university or eligible public/nonprofit research institute outside Vietnam (or formally conferred Emeritus status / authoritative historical record for deceased scholars).
2. **Accepted Track:** The appointment must fall into one of the recognized appointment tracks.

**What appointment tracks are accepted?**

VietProfs recognizes seven distinct appointment tracks:

- **Tenure-line:** Tenure-track or tenured faculty (Assistant Professor, Associate Professor, Full Professor, Chaired/Distinguished Professor).
- **Teaching:** Full-time, stable, continuing non-tenure-track teaching faculty (e.g., Professor of Instruction, Professor of the Practice, Senior Lecturer with permanent appointment).
- **Research:** Permanent or stable faculty-equivalent research scientists at universities or eligible public/nonprofit research institutes (e.g., CNRS, Max Planck, INRIA, CSIRO, NIH, RIKEN) who lead research groups and mentor students.
- **Clinical:** Stable clinical-faculty appointments (e.g., Clinical Professor, Clinical Associate Professor) on a documented institutional ladder.
- **Admin and Staff:** Senior academic leaders (presidents, provosts, deans) without a faculty rank on another track, and university librarians or archivists with documented faculty rank or permanent academic status.
- **Emeritus:** Formally conferred emeritus or emerita faculty.
- **Deceased:** Historical scholars who held an eligible faculty or permanent research appointment outside Vietnam during their active careers.

For complete criteria and verification guidelines, see [`ROSTER_MAINTENANCE.md`](./ROSTER_MAINTENANCE.md).

**Why are positions in Vietnam not listed?**

In Vietnam, virtually all faculty are Vietnamese, and domestic university directories already list them. The Vietnamese _diaspora_, however, is dispersed across hundreds of institutions in more than 30 countries without any central registry. Focusing outside Vietnam addresses this specific discoverability gap.

**Why are postdocs, adjuncts, visiting scholars, and industry roles excluded?**

- **Stability:** Postdoctoral, visiting, adjunct, and term-limited appointments typically last only 1–3 years. Including high-turnover temporary positions would quickly degrade directory accuracy and fill the database with stale records.
- **Scope:** Commercial research labs (e.g., corporate AI or industrial R&D labs) are outside the scope of VietProfs, which focuses on academic institutions and public/nonprofit research institutes.

**Are non-university research institutes included?**

**Yes**, provided they are public, national, or independent nonprofit scholarly research bodies (e.g., CNRS/INSERM/INRIA in France, Max Planck/Helmholtz in Germany, CSIRO in Australia, RIKEN in Japan, or NIH intramural research). These entries are explicitly labeled with their institution type.

**How is Vietnamese heritage determined?**

- **Search leads, not identity tests:** Common Vietnamese surnames and given-name tokens are used purely as initial discovery leads to locate departmental pages on the open web.
- **No intrusive heritage tests:** Once an individual holds an eligible academic appointment, VietProfs does not require or demand documentary proof of ethnicity or heritage.
- **Inclusive and respectful:** VietProfs recognizes that surnames are neither necessary nor sufficient (e.g., scholars who changed surnames through marriage or adoption, or non-Vietnamese individuals sharing common romanized surnames). Anyone misidentified or wishing to opt out is promptly removed upon request.

**How can I request an addition, correction, or profile removal?**

- **Public Submission Form:** Anyone can suggest a new candidate or propose updates via the [Public Submission Form](https://vietprofs.roars.dev/submit.html).
- **GitHub Issues:** Submissions and feedback can also be filed directly on the [VietProfs GitHub Repository](https://github.com/dynaroars/vietprofs/issues).
- **Opt-Out / Removal:** If you are listed and wish to update your information or be removed, submit a request through the form or file an issue; requests are processed promptly.

### How the Website is Maintained & Kept Live

**How does VietProfs stay up-to-date?**

Public directories often succumb to "link rot" and data staleness as faculty change universities, get promoted, retire, or update their websites. VietProfs solves this through a continuous **hybrid human-in-the-loop and autonomous AI maintenance system** documented in [`TASKS/AUTOMATION.md`](./TASKS/AUTOMATION.md).

**What is the core maintenance philosophy?**

> "AI proposes, evidence decides."

Automated LLM agents are restricted to information retrieval, webpage parsing, and structured patch proposals. No AI model can directly mutate the canonical roster. All proposals must pass deterministic schema, track, URL, provenance, and target-scope validation gates before being merged.

**How does the scheduled multi-agent automation work?**

VietProfs operates two continuous loops:

1. **Candidate Expansion Loop:** Identifying new eligible faculty leads through crowdsourced submissions, community networks (e.g., LinkedIn academic clusters), and targeted web searches.
2. **Periodic Revalidation Loop:** Regularly auditing existing records against live university pages to refresh ranks, detect relocations, backfill degrees and Google Scholar profiles, and update honors.

A fleet of scheduled cloud routines runs on a predictable cadence:

- **Nightly Auditor:** Runs every night to independently re-verify the previous day's PRs and issues.
- **Links:** Verifies each person's website, Google Scholar, and LinkedIn links in one pass, twice a week.
- **Portraits Sweep:** Ingests and optimizes high-resolution, verified portrait photos with provenance.
- **Honors & Awards Triage:** Audits major disciplinary awards against official awarding bodies.
- **Academic Relationships:** Discovers and validates advisor-advisee and co-affiliation connections.
- **Faculty Discovery:** Bounded searches across under-represented institutions and fields.

**What is the Producer-Auditor architecture?**

To guarantee data integrity, VietProfs uses an independent two-tier agent model:

- **Producers (Worker Agents):** Perform focused research playbooks in capped batches (e.g., backfilling missing links or portraits). Producers _never_ merge pull requests or push directly to `main` (with narrow exceptions for relationship data).
- **The Auditor Agent:** A separate, higher-capacity model runs daily on a minimum 12-hour delay. It checks out a clean clone of `main`, re-verifies every changed record against the live web, tests the build and test suite (`npm test`, `npm run build`), and only then squash-merges valid PRs or closes verified Issues.

**What are "Side Findings"?**

When a producer agent is auditing an entry for one task (e.g., checking a Google Scholar URL), it often notices unrelated changes (e.g., a promotion to Full Professor, a relocation to a new university, a missing prestigious award, or a duplicate record).

Instead of making unauthorized out-of-scope edits, the agent files a structured **Side Finding Issue**. The daily auditor then independently verifies the finding and updates the database.

**How is human ground-truth protected from bot overwrites?**

When a scholar or contributor directly submits facts that the web can't settle, such as the correct Vietnamese name with diacritics, an honor, or a portrait, those fields are recorded in a `directFields` list on the entry.

Automated maintenance never changes or deletes those protected fields. Appointment details such as rank, department, and university are applied as submitted but follow the official profile afterwards, so a later move or promotion is picked up automatically.

**How does VietProfs prevent "soft-404" errors and broken links?**

Modern university websites often catch deleted faculty pages and silently redirect them (HTTP 301/302) to generic department landing pages or admissions portals with a `200 OK` status code.

VietProfs avoids this "soft-404 fallacy" by requiring **semantic liveness verification**: the system confirms that the scholar's actual name and department appear on the destination page before accepting the link as valid.

**How are honors and awards curated without CV inflation?**

To prevent CV padding (such as departmental travel grants, routine paper acceptances, or student prizes), VietProfs restricts the `honors` field to five strict, schema-enforced categories backed by HTTPS provenance URLs:

1. `academy`: Election to national/international learned academies (e.g., National Academy of Engineering, National Academy of Sciences).
2. `fellow`: Fellow status in major disciplinary societies (e.g., IEEE Fellow, ACM Fellow, AAAS Fellow).
3. `career_award`: Highly competitive national early-career awards (e.g., NSF CAREER, Sloan Research Fellowship).
4. `major_award`: Major international or field-wide medals, lifetime achievement prizes, and test-of-time awards.
5. `distinguished_professorship`: Named endowed chairs and university-wide distinguished professorships.

### Features & Capabilities

**What search and filtering capabilities does the site offer?**

- **Zero-Latency In-Browser Search:** The full dataset and search index load client-side for instant, responsive searching without server-side lag.
- **Faceted Combinable Filters:** Filter simultaneously by Geographic Region (US, Continents, or specific Countries), Broad Field of Study, and Appointment Track.
- **Scoped Search:** Users can target queries to specific fields using the search scope selector: `All Fields`, `Name` (English or Vietnamese diacritic), `University`, `Department`, `Rank / Title`, `Research Area`, `Honors & Awards`, and `PhD Institution`.
- **Shareable & Bookmarkable URLs:** Every search query and filter combination automatically synchronizes with URL parameters (e.g., `?q=robotics&track=tenure-line&country=Australia`).
- **Keyboard Shortcuts:** Press `?` anywhere on the site to view quick keyboard shortcuts (`/` to focus search, `Esc` to clear, `j`/`k` navigation).

**How does diacritic-insensitive search work?**

Vietnamese names often lose their diacritics on Western university websites. VietProfs builds a normalized, accent-folded search index: searching for `Nguyen`, `Nguyễn`, or `nguyen` matches seamlessly across both standard English forms and authentic Vietnamese diacritics.

**What interactive data visualizations and leaderboards are available?**

- **Interactive U.S. Choropleth Map:** Selecting the U.S. view renders an interactive state grid map shaded by faculty concentration. Clicking any state immediately filters the directory.
- **Dynamic Leaderboards:** Real-time leaderboards compute the **Top Faculty Hubs** (institutions employing the most diaspora faculty) and **Top PhD Alma Maters** for whichever subset is currently filtered. Clicking any institution instantly scopes the roster to that school.
- **"Show me something interesting":** Clicking the dynamic insight button reveals real-time aggregate statistics, top feeder schools, generational cohorts, and geographic distribution.

**What is the Academic Connections / Genealogy network?**

VietProfs includes a verified academic relationship graph mapping connections between scholars, such as:

- Doctoral advisor ↔ PhD student relationships.
- Postdoctoral mentor ↔ mentee connections.
- Co-affiliation and lab lineages.

These relationships are displayed directly on individual profile pages and in the interactive [Academic Connections Explorer](https://vietprofs.roars.dev/connections.html).

**What information is shown on each profile card?**

Each profile card displays:

- **Portrait & Provenance:** High-resolution local WebP headshot with attribution link.
- **Bilingual Name:** English published name alongside authentic Vietnamese diacritics (`vietnameseName`).
- **Affiliation:** Current rank, department, university/institute, city, state/province, and country flag.
- **Appointment Track & Institution Type:** Clearly distinguishing tenure-line, teaching, research, clinical, staff, or emeritus roles.
- **Education History:** Undergraduate, master's, PhD, MD, and completed postdoctoral institutions, with undergraduate and PhD years.
- **Curated Honors:** Badges for academy memberships, society fellowships, career awards, and endowed chairs.
- **Research Areas:** Clickable keyword tags.
- **Direct Links:** One-click links to the official university profile, a website (personal page or lab site), Google Scholar, and LinkedIn.
- **Last Updated:** `lastUpdatedAt`, the date the entry's stored facts last changed. It is set automatically; it is not the date the record was last re-checked.

**Are dynamic statistics stored statically or computed live?**

All summary statistics, leaderboards, and aggregate metrics are **computed dynamically at runtime** from the underlying data. This prevents stale statistical claims from lingering when scholars relocate, get promoted, or join the roster.

### Dataset & Access

**Where can I access the open dataset and academic paper?**

- **Live Directory:** <https://vietprofs.roars.dev>
- **Academic Paper:** [Read the full paper (PDF)](https://vietprofs.roars.dev/vietprofs.pdf) or on [arXiv (2609.06091)](https://arxiv.org/abs/2609.06091)
- **GitHub Repository:** [github.com/dynaroars/vietprofs](https://github.com/dynaroars/vietprofs)
- **Hugging Face Dataset:** [huggingface.co/datasets/nguyenthanhvuh/vietprofs](https://huggingface.co/datasets/nguyenthanhvuh/vietprofs)
- **Visitor Statistics:** [vietprofs.roars.dev/stats.html](https://vietprofs.roars.dev/stats.html)
- **Academic Connections:** [vietprofs.roars.dev/connections.html](https://vietprofs.roars.dev/connections.html)
- **Public Submission Form:** [vietprofs.roars.dev/submit.html](https://vietprofs.roars.dev/submit.html)

## License

Code and data are licensed under [Creative Commons
Attribution-NonCommercial-NoDerivatives 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/);
portraits and the manuscript are not covered. See [`LICENSE`](./LICENSE) for full terms.
