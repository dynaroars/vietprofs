# Database-Driven & API Faculty Discovery (`discover_from_database.md`)

> **Autonomous Goal Directive (`/goal TASKS/discover_from_database.md`):**  
> Leverage the existing `public/data.json` roster, maintenance ledgers, and public academic APIs (NIH RePORTER, NSF Award Search, OpenAlex, and Crossref) via `npm run discover-leads` (`scripts/discover-leads.ts`) to discover unlisted Vietnamese and Vietnamese-diaspora faculty and research-institute scientists outside Vietnam, as well as rank promotions and institutional moves among existing roster entries. Deduplicate every candidate with `npm run find-roster-matches` and against existing GitHub Issues (`gh issue list --state all`), verify current appointments live on official institutional pages according to `ROSTER_MAINTENANCE.md`, and file **batched GitHub Issues (20+ verified candidates per Issue)** (or a `Side finding:` Issue for existing-entry rank promotions or moves).

---

## 🎯 Why This Playbook Exists & What Works Best

Standard search-engine directory scraping (`site:<edu> "<surname>"`) misses many eligible scholars—especially clinical/medical school faculty, European/Commonwealth research-institute scientists (Inserm, CNRS, CEA, CSIRO, A\*STAR), scholars with secondary Vietnamese surnames (`Doan`, `Vuong`, `Phung`, `Hoang`, `Dinh`, `Luong`, `Kieu`, `Nghiem`, `Truong`), and newly hired Assistant Professors.

Empirical testing across all discovery channels shows a clear hierarchy of effectiveness:

| Channel | Command | Precision | Best For |
| :--- | :--- | :--- | :--- |
| **1. Grant PI/Co-PI Sweep (NIH RePORTER + NSF Awards)** | `npm run discover-leads -- --mode=grants --limit=100` | **~70%+** | US biomedical, clinical, engineering, and CS faculty; NSF CAREER winners; catching `Associate Professor` $\rightarrow$ `Professor` promotions on active R01/U01/P01 grants. |
| **2. OpenAlex High-Citation & Co-Author Graph Sweep** | `npm run discover-leads -- --mode=coauthors --limit=60` | **~50–65%** (with `works_count:>30`) | International faculty (Canada, UK, France, Netherlands, Switzerland, Nordics, Australia, Singapore) and senior national-lab/institute scientists (CNRS, Inserm, CEA, A\*STAR). |
| **3. Feeder-vs-Faculty Institutional Gap Sweep** | `npm run discover-leads -- --mode=gaps` + `./scripts/faculty-discovery-queries.ts` | **High** | Major universities where `public/data.json` records 5–40 alumni degrees/postdocs (`phdInstitution`, `postdocInstitution`) but only 0–2 current faculty (e.g., CMU, Princeton, MIT, Caltech, UTMB). |
| **4. Expanded Surname & Given-Name Lexicon** | `./scripts/faculty-discovery-queries.ts --given-names` | **High** | Catching the ~7% of Vietnamese scholars whose surnames (`Hoang`, `Dinh`, `Doan`, `Phung`, `Vuong`, `Luong`, `Kieu`) or married/hyphenated names were missed by the original surname list. |
| **5. Lab Website & Alumni Placement Sweep** | `npm run discover-leads -- --mode=labs --limit=30` | **~5% per page** (high value for junior hires) | Brand-new Assistant Professors (hired within the last 1–2 years) listed on their PhD/postdoc advisor's `/people` or `/alumni` page before they appear in grant or citation databases. |

---

## 🛠️ Step-by-Step Execution Playbook

### Step 1: Run the Multi-Channel Lead Harvester

Run `npm run discover-leads` across one or more channels. The script automatically reads the OpenAlex API key from `--api-key=<key>`, `OPENALEX_API_KEY`, `~/.config/cspicks/openalex-api.key`, or `~/.config/vietprofs/openalex-api.key`, and writes structured output to `maintenance/discovery-leads.json` (gitignored):

```bash
# Run all 5 channels at once:
npm run discover-leads -- --mode=all --limit=50

# Or target a specific high-yield channel:
npm run discover-leads -- --mode=grants --limit=100
npm run discover-leads -- --mode=coauthors --limit=60
npm run discover-leads -- --mode=labs --limit=30
npm run discover-leads -- --mode=gaps
```

### Step 2: Filter & Triage Leads Before Web Research

1. **Grant PI Leads (`nih-reporter` and `nsf-awards`):**
   - `scripts/discover-leads.ts` already filters out predoctoral/postdoctoral training mechanisms (`F30`, `F31`, `F32`, `F99`, `K99`, `R36`, `T32`, `TL1`), SBIR/STTR corporate entities (`LLC`, `Inc.`, `Therapeutics`), and trainee titles (`Postdoc`, `Fellow`, `Student`, `Research Associate`).
   - Check `promotionsOrMoves` in `maintenance/discovery-leads.json` first: when NIH RePORTER lists a rostered `Associate Professor` with title `PROFESSOR` at the same university, verify their live institutional profile and file a `Side finding:` Issue (e.g., `vp-1357` Thuy Doan at UCSF).
2. **OpenAlex & Crossref Leads (`crossref-coauthor`):**
   - Prioritize OpenAlex authors with `works_count > 30`, `last_known_institutions.type` in `education` or `facility`, and `country_code != 'VN'`.
   - Watch out for **surname-first / middle-name order** or **hyphenated/married surnames** in European entries (e.g., `Uyen Huynh-Do` at Bern, `Olivier Martineau-Huynh` at CNRS/Sorbonne, `Minh Ha-Duong` at CNRS, `Thérèse Truong` at Inserm).
   - For ambiguous surnames (`Le`, `Do`, `Dang`, `Mai`, `Ho`, `Lam`, `Ly`, `Cao`, `Ha`, `Ta`, `To`), require a Vietnamese given/middle-name token or explicit heritage/education signal before spending research time.
3. **Feeder-Gap Universities (`feederGaps`):**
   - Pick top universities from `feederGaps` in `maintenance/discovery-leads.json` (where `degreeOrPostdocCount >= 6` and `currentFacultyCount <= 2`) and generate targeted queries using the expanded 29-surname + 48-given-name lists:
     ```bash
     ./scripts/faculty-discovery-queries.ts --university "Carnegie Mellon University" --field "Business" --domain cmu.edu --given-names
     ```
4. **Lab Alumni Sweeps (`lab-alumni-network`):**
   - When scanning a rostered professor's lab site (`websiteUrl`), check the `Alumni` / `Former Members` / `Collaborators` sections for faculty placements outside Vietnam.
   - Always log completed lab sweeps in `maintenance/network-discovery.json` (recording `included`, `already-listed`, `excluded`, or `unresolved` statuses so future runs do not re-crawl the same seed lab).

### Step 3: Mandatory Deduplication Gate ("One Person, One ID")

Before researching or filing any candidate, run **both** checks:

```bash
npm run find-roster-matches -- "<Full Name>" --url <profileUrl> --url <websiteUrl> --url <scholarUrl>
gh issue list --state all --search "\"<Full Name>\"" --limit 5
```

- Check reversed name orders, middle-initial variants, and former institutions.
- If a candidate matches an existing `vp-####` entry at an older institution, they moved—file a `Side finding: vp-#### ... moved to <New University>` Issue instead of proposing a new ID.

### Step 4: Live Official Profile Verification & Enrichment

For each deduplicated candidate, verify their current appointment live (`curl -sL` or web search) and collect all supported fields per `ROSTER_MAINTENANCE.md`:

- **Required appointment evidence:** Official university or eligible public/nonprofit research-institute profile URL (`profileUrl`, HTTP 200), primary `department` (or research unit), `rank` (`Assistant Professor`, `Associate Professor`, `Professor`, `Lecturer`, `Senior Lecturer`, `Reader`, `Research Scientist`, `Senior Scientist`, `Principal Scientist`, `Staff Scientist`, etc.), `track` (`Tenure-line`, `Clinical`, `Research`, `Teaching`, `Emeritus`), and `institutionType` (for non-university research institutes: `Public research institute` or `Independent nonprofit research institute`).
- **Enrichment:**
  - `websiteUrl`, `scholarUrl`, `linkedinUrl`, `portraitSource`
  - `undergradInstitution` / `undergradYear`, `msInstitution`, `phdInstitution` / `phdYear`, `mdInstitution`, `postdocInstitution`
  - Qualifying `honors` (endowed chairs, national academies, NSF CAREER, society fellowships) with a verifiable `source` URL.
  - Never guess or reconstruct `vietnameseName` diacritics unless an authoritative source writes the name with diacritics.

### Step 5: Batched Issue Handoff (20+ Candidates per Issue) & Validation

1. Group verified new candidates into **batched GitHub Issues of 20+ candidates per Issue** (e.g., `[discover] New candidates batch: 25 verified faculty (OpenAlex & NIH/NSF)`), including each candidate's full name, `find-roster-matches` check, verified rank/track/department/university, official `profileUrl` (HTTP 200), degrees, research areas, honors, and source URLs.
2. If you updated `maintenance/network-discovery.json` or any script/doc files, run:
   ```bash
   npm test && npm run build && git diff --check
   ```
