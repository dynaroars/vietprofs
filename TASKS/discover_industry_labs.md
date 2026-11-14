# Discover Industry, Government & Policy Researchers (`discover_industry_labs.md`)

> **Autonomous Goal Directive (`/goal TASKS/discover_industry_labs.md`):**
> Find eligible Vietnamese and Vietnamese-diaspora career researchers outside Vietnam at corporate research labs, government and defense labs, FFRDCs/UARCs, central banks, international organizations, and think tanks who are not yet in `public/data.json`. Work one employer group per run, verify each person on a page published by the current employer, and file the verified candidates as a **GitHub Issue** (never a PR or a commit) for the auditor or owner to add.

---

## 🎯 Scope

Target file: `public/data.json` (Gov & Labs and Industry sectors). Eligibility, tracks, and `institutionType` values are the
`🏢 Industry` and `🏛️ Gov, Defense & Labs` rules in [`candidate_intake.md`](candidate_intake.md)
step 2 and `ROSTER_MAINTENANCE.md`; this playbook only adds how to find and verify people there.
University faculty stay with [`discover_new_faculty.md`](discover_new_faculty.md). Public and
nonprofit scholarly institutes (CNRS, Max Planck, NIH intramural, WEHI, Fred Hutch) are covered by
both playbooks: here as whole-institute employer groups (rows below), there when a field or
institution sweep reaches them. Either way they are Gov & Labs entries.

## 🔁 One employer group per run

Pick the group least recently covered by a `[scheduled:discover]` Issue (read the last 60 days of
them, open and closed) and stay inside it. Break ties toward the higher-yield groups in
`maintenance/sector-expansion/LEDGER.md`, and skip any group it marks `exhausted`:

| Group | Employers (examples, not a closed list) | Where the people are listed |
| :--- | :--- | :--- |
| AI labs | Google DeepMind, Google Research, Microsoft Research, Meta FAIR, NVIDIA Research, Apple MLR, Amazon Science, IBM Research, Adobe Research, Salesforce AI Research, Qualcomm AI Research, OpenAI, Anthropic | `research.google/people`, `microsoft.com/en-us/research/people`, `research.nvidia.com/person`, `amazon.science/author`, `research.ibm.com/people`, `research.adobe.com/person`, `machinelearning.apple.com` paper bylines |
| Pharma & biotech R&D | Genentech, Regeneron, Novartis BioMedical Research, Moderna, BMS, Lilly, Gilead, GSK, AstraZeneca, Merck, Pfizer, Amgen, Vertex, AbbVie, Sanofi, Biogen, Alnylam, Takeda | Employer scientist pages (`gene.com/scientists`) are rare; usually the person's own site or publication record with `"confirmed": false`. Strict role test: no manufacturing, QA, regulatory, medical affairs |
| Hardware & physical-science labs | Intel Labs, SAIT / Samsung Research America, Nokia Bell Labs, HP/HPE Labs, Toyota Research Institute, Bosch Research, Siemens Technology, GE Aerospace/Vernova Research, Dow, 3M, Boeing R&T, Applied Materials, Micron, TI Kilby Labs, MERL, NEC Labs America, Sony AI, Honda Research Institute | Employer research people pages; publication bylines as leads |
| US independent biomedical institutes | Fred Hutch, St. Jude, Sloan Kettering Institute, Dana-Farber, Broad, Salk, Scripps Research, Allen Institute, HHMI Janelia, Stowers, Jackson Laboratory, City of Hope Beckman | Faculty/investigator directories; `institutionType: "Independent nonprofit research institute"` |
| US federal science agencies | NIH intramural institutes (NIAID, NHLBI, NIDDK, NINDS, NICHD, NIEHS, NLM/NCBI, NHGRI, NIA, NIMH; NCI too), CDC, FDA research centers, NASA centers, NOAA labs, USGS, USDA ARS, EPA ORD | `irp.nih.gov/pi`, agency staff/scientist pages |
| US national labs | Argonne, LBNL, LLNL, LANL, ORNL, PNNL, Sandia, National Laboratory of the Rockies (formerly NREL), INL, SLAC, Fermilab, Brookhaven, Ames, PPPL, Jefferson Lab, NIST | Lab staff directories (`anl.gov/profile`, `profiles.lbl.gov`, `people.llnl.gov`, `ornl.gov/staff-profile`, `pnnl.gov/people`, `nist.gov/people`, `science.gsfc.nasa.gov/sci/bio`) |
| Defense and FFRDC/UARC | ARL, NRL, AFRL, AFOSR, ONR, DARPA, MIT Lincoln Laboratory, JHU APL, Aerospace Corporation, MITRE, IDA, RAND | Agency program-officer and staff pages; `ll.mit.edu/biographies`; `jhuapl.edu` staff bios |
| French public research | CNRS, Inserm, Inria, CEA, IRD, INRAE, Institut Pasteur, ONERA, IFREMER, CNES (permanent CR/DR and research engineers) | Lab/unit annuaires; HAL author pages as leads only |
| Australian medical research institutes | WEHI, Garvan, QIMR Berghofer, Murdoch Children's, Peter MacCallum, Florey, Hudson, Baker, Kirby, Telethon Kids, CMRI, Harry Perkins | Institute lab-head and researcher pages; check for a university conjoint entry first |
| Non-US public and corporate labs | Max Planck, Helmholtz (DLR, Jülich, DESY, DKFZ), Fraunhofer (Germany); RIKEN, AIST, NIMS, NICT, JAXA (Japan); KIST, ETRI (Korea); NRC (Canada); A*STAR (Singapore); CSIRO and DSTG (Australia); NPL (UK); TNO (Netherlands); NAVER Labs, Huawei and Samsung research centres outside Vietnam | Institute staff directories |
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
   consultants. Every sector this playbook covers needs a research doctorate (PhD or equivalent; an MD
   for clinical-research roles) or a current publication record: two or more papers in the last
   three years with the person as author at the current employer, from OpenAlex, DBLP, Scholar, or
   the employer's publication pages, identity resolved by co-authors, topic, or a linked profile.
   Record `phdInstitution` when there is a doctorate; otherwise list the papers in the Issue. Leave
   the person out when neither holds.
3. **Not already on the roster.** Run
   `npm run find-roster-matches -- "<name>" --url <every identity URL>` (it reads both roster files
   and the retired-id ledger) and `gh issue list --state all --search '"<name>"'`. A hit is a
   lead, not a verdict: resolve identity first by field, education, co-authors, or links between
   the pages. Same person (usually before or after a move): file a `Review stale institution:`
   side finding for that id, never a new candidate. Different person (common with names like Thao
   Tran or Tony Nguyen): carry on as a new candidate and say in the Issue which id it was checked
   against. On 2026-11-14, 30 of 32 name-only holds were different people, 6 of them eligible.
   Someone who holds a university faculty
   appointment *and* an industry role stays one entry, under the primary appointment.

Screening still applies: the name rulings in `ROSTER_MAINTENANCE.md`, and nobody physically based
in Vietnam (a Vietnam office of a foreign lab is out).

## 🤝 External producers (Codex, agy)

When the owner delegates discovery to an external CLI agent, give it
`maintenance/sector-expansion/BRIEF.md`, and have a different agent re-verify every candidate
with `maintenance/sector-expansion/VERIFY.md` before anything is filed. Record each run's yield and
the producer's accuracy in `maintenance/sector-expansion/LEDGER.md`. agy invents plausible
`profileUrl` slugs and cannot run shell commands headless, so its URLs and dedup claims never
count as checked.

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
