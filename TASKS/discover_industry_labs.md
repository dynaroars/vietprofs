# Discover Industry, Government & Policy Researchers (`discover_industry_labs.md`)

> **Autonomous Goal Directive (`/goal TASKS/discover_industry_labs.md`):**
> Find eligible Vietnamese and Vietnamese-diaspora career researchers outside Vietnam at corporate research labs, government and defense labs, FFRDCs/UARCs, central banks, international organizations, and think tanks who are not yet in `public/data.json`. Work one employer group per run, verify each person on a page published by the current employer, and file the verified candidates as a **GitHub Issue** (never a PR or a commit) for the auditor or owner to add.

---

## 🎯 Scope

Target file: `public/data.json` (Gov & Labs and Industry sectors). Eligibility, tracks, and `institutionType` values are the
`🏢 Industry` and `🏛️ Gov, Defense & Labs` rules in [`candidate_intake.md`](candidate_intake.md)
step 2 and `ROSTER_MAINTENANCE.md`; this playbook only adds how to find and verify people there.
University faculty and public/nonprofit scholarly institutes (CNRS, Max Planck, NIH intramural PIs)
stay with [`discover_new_faculty.md`](discover_new_faculty.md) and `public/data.json`.

## 🔁 One employer group per run

Pick the group least recently covered by a `[scheduled:discover]` Issue (read the last 60 days of
them, open and closed) and stay inside it:

| Group | Employers (examples, not a closed list) | Where the people are listed |
| :--- | :--- | :--- |
| AI labs | Google DeepMind, Google Research, Microsoft Research, Meta FAIR, NVIDIA Research, Apple MLR, Amazon Science, IBM Research, Adobe Research, Salesforce AI Research, Qualcomm AI Research, OpenAI, Anthropic | `research.google/people`, `microsoft.com/en-us/research/people`, `research.nvidia.com/person`, `amazon.science/author`, `research.ibm.com/people`, `research.adobe.com/person`, `machinelearning.apple.com` paper bylines |
| Other corporate R&D | Genentech, Regeneron, Novartis BioMedical Research, Bell Labs, Intel Labs, Samsung Research America, Bosch Research, Toyota Research Institute, Mitsubishi Electric Research Labs | Employer scientist/people pages; `gene.com/scientists` |
| US national labs | Argonne, LBNL, LLNL, LANL, ORNL, PNNL, Sandia, NREL, SLAC, Fermilab, Brookhaven, NIST, NASA centers | Lab staff directories (`anl.gov/profile`, `profiles.lbl.gov`, `people.llnl.gov`, `ornl.gov/staff-profile`, `pnnl.gov/people`, `nist.gov/people`, `science.gsfc.nasa.gov/sci/bio`) |
| Defense and FFRDC/UARC | ARL, NRL, AFRL, AFOSR, ONR, DARPA, MIT Lincoln Laboratory, JHU APL, Aerospace Corporation, MITRE, IDA, RAND | Agency program-officer and staff pages; `ll.mit.edu/biographies`; `jhuapl.edu` staff bios |
| Non-US public and corporate labs | CSIRO and DSTG (Australia), NRC (Canada), RIKEN and AIST (Japan), A*STAR (Singapore), Fraunhofer (Germany), NAVER Labs, Huawei and Samsung research centres outside Vietnam | Institute staff directories |
| Central banks and international organizations | Federal Reserve Board and regional Feds, ECB, BIS, Bank of England, Bank of Canada, RBA, IMF, World Bank, OECD, ADB | Economist directories (`federalreserve.gov/econres`, each regional Fed's economists page, `imf.org` author pages, `worldbank.org/en/about/people`) |
| Think tanks | Brookings, RAND, PIIE, Urban Institute, CSIS, Carnegie, NBER staff, ISEAS, Lowy Institute | Expert/staff pages |

Search each listing by surname, then by given-name token once the surname sweep is stale
(`ROSTER_MAINTENANCE.md` "Using a Vietnamese-name lexicon safely"). `npm run discover-leads --
--mode=coauthors` also surfaces industry co-authors of rostered scholars; an OpenAlex institution
filter (`authorships.institutions.ror`) on a lab's ROR id is a useful second source of leads.
Leads are never evidence: everything below is checked live.

## ✅ Verification: the three tests

A candidate goes in the Issue only when all three hold. A bulk batch that skipped them (2026-11-11)
left a duplicate of an existing entry, guessed `vietnameseName` values, and a quarter of its
`profileUrl`s pointing at Scholar, DBLP, or a former university.

1. **Current, on the employer's own page.** `profileUrl` is a page the current employer publishes
   that names the person (people page, author page, staff bio, economist directory). When the
   employer publishes none, which is common at OpenAI, Anthropic, Apple, and defense labs, use the
   person's own site or LinkedIn stating the current role and set `"confirmed": false`. Scholar,
   DBLP, ORCID, a conference bio, or a paper byline alone never establishes a current appointment,
   and a page at a former employer or university is not a `profileUrl` at all. Check which source
   is newer before recording an employer: lab pages outlive the job.
2. **A career research role.** Research Scientist, Principal/Staff/Distinguished Scientist,
   Research Director, Economist, Senior Fellow, program manager/officer, or the lab's equivalent
   permanent staff ladder. The role decides, not the title: a "Software Engineer" or "Member of
   Technical Staff" who publishes research from the current job qualifies, at a lab or at a product
   company that publishes (Waymo, Tesla, Bloomberg). Not eligible: engineers with no research output
   in the current job, product and program staff, residents, interns, student
   researchers, visiting researchers, postdocs and other fixed-term fellows, contractors, and
   consultants. For government, defense, FFRDC/UARC, central-bank, and international-organization
   roles a doctorate is required; record `phdInstitution`, and leave the person out when no source
   shows one.
3. **Not already on the roster.** Run
   `npm run find-roster-matches -- "<name>" --url <every identity URL>` (it reads both roster files
   and the retired-id ledger) and `gh issue list --state all --search '"<name>"'`. A hit at a
   university is usually the same person before or after a move: file a `Review stale institution:`
   side finding for that id, never a new candidate. Someone who holds a university faculty
   appointment *and* an industry role stays one entry, under the primary appointment.

Screening still applies: the name rulings in `ROSTER_MAINTENANCE.md`, and nobody physically based
in Vietnam (a Vietnam office of a foreign lab is out).

## 📝 Proposed fields

`name`, `university` (the employer, spelled as existing entries spell it; check
`public/data.json` before coining "Meta AI" next to "Meta FAIR"), `institutionType`, `city`,
`state`, `country`, `department` (team or division), `rank` (`Researcher`, or `Administrator` for
program officers and directors), `track`, `researchAreas`, `phdInstitution`, `phdYear`,
`undergradInstitution`, `profileUrl`, `scholarUrl`, `linkedinUrl`, `confirmed` (only when `false`).

Propose `vietnameseName` only when a cited source spells it with diacritics; never reconstruct
diacritics, name order, or a middle name from initials. Conference paper awards are not honors.

## 📬 Submission

One batched Issue per run, at most 25 verified candidates, titled
`[scheduled:discover] New industry batch (<N> candidates): <employer group>`, in the format of
`AUTOMATION.md` "Discover new faculty" step 4: summary table, one section per candidate with a
ready-to-paste JSON entry (no `id`), the dedup output, the verification URLs, and a "Coverage"
section listing every employer and listing page examined and each rejected lead with its reason.
Never edit a roster file, assign an id, or open a PR.
