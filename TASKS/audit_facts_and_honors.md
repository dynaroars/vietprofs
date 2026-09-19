# Task Guide: Credentials, Honors, and Direct Fields Protection (`audit_facts_and_honors.md`)

This task playbook governs the deep verification of academic degree credentials (`phdInstitution`, `phdYear`, `msInstitution`, `undergradInstitution`, `postdocInstitution`), honors and awards (`honors`), and the strict governance of direct fields (`directFields`) in the **VietProfs** repository.

---

## 1. Core Principles & Governance Rules

- **Direct Updates (`directFields`):** Information explicitly supplied by the repository owner or submitted via direct request is ground truth. Add each asserted field name to the entry's sorted `directFields` array.
- **Protected Direct Fields Governance:** Fields in `directFields` must NEVER be altered or removed by web scouting or automated maintenance. If web evidence conflicts with a protected field, do NOT edit it directly—file a GitHub Issue for maintainer review.
- **Substantive Update Requirement:** Advance `lastUpdatedAt` whenever substantive roster facts (appointment, rank, degree, honor, portrait) are added or corrected.

---

## 2. Educational Credentials Verification & Chronology Rules

Academic degrees must be corroborated by official institutional bios, personal academic homepages, or verified CVs.

### A. Allowed Credential Fields
- `phdInstitution`, `phdYear`, `phdMajor`
- `msInstitution`, `msYear`
- `undergradInstitution`, `undergradYear`
- `postdocInstitution`, `postdocYear`
- `mdInstitution`, `mdYear`

### B. Strict Chronology & Formatting Rules
1. **Academic Progression Order:** Degrees must follow logical academic chronology: `undergradYear <= msYear <= phdYear <= postdocYear`.
2. **Implausible Interval Detection:** Flag and investigate implausible intervals (e.g. an undergrad graduation year of 2024 for a professor who completed a PhD in 2003).
3. **Canonical Institution Formatting:** Store canonical institution names without prepended degree prefixes (e.g., store `"University of California, Berkeley"`, NOT `"PhD from UC Berkeley"`).
4. **Completed Postdoctoral Training:** Record completed postdoctoral institution (`postdocInstitution`) and completion year (`postdocYear`) when explicitly documented.

---

## 3. Honors & Awards Categorization Standards

Honors must meet the explicit eligibility standards in `ROSTER_MAINTENANCE.md`. Each honor entry requires `name`, `category`, `organization`, `source` (HTTPS URL), and optional `year`.

### Accepted Honors Categories

1. **`academy` (National Academy Election):**
   - Formal election to national academies or learned societies.
   - Examples: National Academy of Sciences (NAS), National Academy of Engineering (NAE), National Academy of Medicine (NAM), American Academy of Arts and Sciences (AAA&S), American Academy of Arts and Letters, *Légion d'honneur*, *Académie des sciences* (France).
2. **`career_award` (Major Career / Early-Career Research Fellowships):**
   - Highly competitive national/international career development awards.
   - Examples: NSF CAREER Award, Sloan Research Fellowship, ERC Grants (Starting/Consolidator/Advanced), JST PRESTO Fellowship, NAEd/Spencer Postdoctoral Fellowship, CNRS Bronze/Silver Medal, David and Lucile Packard Fellowship.
3. **`major_award` (Discipline-Wide Major Distinctions):**
   - Major awards administered by national or international professional societies for sustained research contributions.
   - Examples: ACM Turing Award, IEEE Medal of Honor, ISA RC31 Best Book Award.
4. **`fellow` (Society Fellowships):**
   - Conferred Fellow status in major scholarly or professional bodies.
   - Examples: IEEE Fellow, ACM Fellow, AAAS Fellow, AIAA Fellow, APS Fellow, BMES Fellow.
5. **`distinguished_professorship` (Named & Endowed Chairs):**
   - Conferred named professorships or university distinguished professorships.
   - Examples: *"Charles Franklin Kellogg Professor in the Arts"*, *"Distinguished Professor of Ethnic Studies"*.

### Strict Honors Exclusion Standards (Do NOT Include)

- **Exclude Routine Best-Paper Awards:** Do NOT add best-paper or best-poster awards from individual conferences or annual workshops. (Exception: Lifetime or retrospective Test-of-Time awards given across a decade or more).
- **Exclude Postdoctoral & Graduate Student Awards:** Exclude student poster prizes, dissertation awards, or internal departmental grants.
- **Exclude Corporate R&D & Internal University Grants:** Exclude internal campus seed grants, corporate travel stipends, or commercial software awards.

---

## 4. Execution & Validation Workflow

```bash
# Validate data schema, degree chronology, and honors provenance
npm run validate-data

# Check honor source URLs for broken links
npm run check-links -- --field honors

# Run full test suite and build validation
npm test && npm run build && git diff --check
```
