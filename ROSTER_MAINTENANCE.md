# Roster maintenance guide

This document is for maintainers and automated agents. It contains the detailed research and data-entry rules that are intentionally kept out of the public project overview.

## Inclusion standard

Include a person only when reliable evidence, preferably an official university page, supports all of the following:

- Vietnamese or Vietnamese-diaspora identity. A Vietnamese-sounding name is a lead, not conclusive evidence; review each addition for false positives.
- A current university appointment anywhere outside Vietnam, except for Emeritus entries.
- A primary academic appointment and one of the accepted tracks below.

Accepted tracks:

- `Tenure-line`: tenure-track or tenured.
- `Teaching`: full-time, continuing/permanent non-tenure-track teaching faculty. Confirm permanence from the university's language, such as “full-time,” “continuing appointment,” “non-tenure-track faculty,” or a named teaching promotion ladder. Do not infer it from the title alone.
- `Emeritus`: a formally conferred emeritus/emerita title following a tenure-line career. Prefer an active emeritus listing or a source documenting the conferral. Plain retirement, resignation, former-faculty status, and in-memoriam listings do not qualify.

Exclude adjunct, visiting, postdoctoral, affiliate/courtesy, research-track, graduate teaching-assistant, non-university, and other term-limited or part-time appointments. Plain `Instructor` requires case-by-case verification and should not be included from the title alone.

## Research workflow

Work on one university or broad field at a time. Audit existing entries before adding candidates. For every candidate, verify identity, current appointment, primary department, rank/track, and profile URL individually. Deduplicate by person rather than URL and check for former affiliations or recent moves.

Use all relevant candidate sources:

- official department, school, college, and university faculty directories;
- linked person pages, including opaque directory URLs such as `/profile/tn294`;
- official university news, research-center, lab, grant, and award pages;
- personal academic homepages, Google Sites, lab pages, and CVs, followed by confirmation of the current appointment on an official page; and
- broad search-engine queries using the institution, field, Vietnamese surnames (`Nguyen`, `Tran`, `Le`, `Pham`, `Vo`, `Vu`, `Bui`, `Do`, `Phan`, `Lai`), and common Vietnamese given names.

Do not depend on URL shape, visible diacritics, or a faculty page being linked from a department homepage. A research mention, dissertation-supervision link, coauthorship, student page, or grant page is a lead—not proof of a current faculty appointment.

Generate repeatable search queries with:

```bash
node scripts/faculty-discovery-queries.mjs \
  --university "New Jersey Institute of Technology" \
  --field "Data Science" \
  --domain njit.edu
```

Every result still requires the inclusion and identity checks above.

## Data-entry rules

`public/data.json` is the canonical roster. Each entry should use the following conventions:

- `track` must be `Tenure-line`, `Teaching`, or `Emeritus`.
- `profileUrl` must be a current, working academic or official university profile and must not be a Google Scholar URL. Store Scholar separately in `scholarUrl`; store a maintained personal or lab homepage in `websiteUrl`.
- Preserve an existing Scholar URL by moving it to `scholarUrl` before replacing `profileUrl`. Verify replacement URLs follow redirects and do not return 404.
- Use only `Assistant Professor`, `Associate Professor`, or `Professor` as the rank vocabulary for Tenure-line entries; use `Teaching` and `Emeritus` for the corresponding tracks.
- Add `phdYear` and `phdInstitution` only when a source explicitly states them. Never infer them from dates, CV chronology, or context.
- Education research is not limited to PhD, MS, and undergraduate degrees. Record explicitly documented professional or equivalent degrees such as MD, JD, DDS, PharmD, EdD, DO, and other credentials when the data model has an appropriate field. Do not force an MD/JD or another degree into the PhD/MS/undergraduate fields; if no suitable field exists yet, preserve the source for a later schema update and mention it in the change notes.
- For undergraduate education, use the explicitly stated bachelor’s institution and completion year. A professional degree such as a JD is separate from undergraduate education and must not be substituted for it.
- Use the person's full published academic name only when an official profile or maintained academic homepage supplies it. Expand initials only with direct evidence.
- Store `name` without Vietnamese diacritics and in First (Middle) Last order. This is a display normalization, not a claim about publishing name order.
- Keep `secondaryAppointment: true` when the listed field is secondary or joint and the primary tenure home is elsewhere.
- Preserve source URLs for profiles, honors, name evidence, and portraits. These URLs establish provenance, not redistribution rights.

### Honors and awards eligibility

The `honors` field is curated for substantial distinctions, not every item listed on a CV or
personal homepage. An honor should normally fit one of these patterns:

- election to a recognized national academy or equivalent learned academy (`academy`);
- election to Fellow or honorary-member status by a major disciplinary society (`fellow`);
- a nationally or internationally competitive career, early-career, or research fellowship or
  award, such as NSF CAREER, Sloan Research Fellowship, Simons Investigator, PECASE, or a
  comparable national-agency or foundation program (`career_award`);
- a major field-wide medal, prize, book award, lifetime/impact or test-of-time award, or another
  distinction with clear disciplinary standing (`major_award`); or
- a named endowed chair, distinguished professorship, university professorship, or comparable
  research chair that represents a significant appointment distinction (`distinguished_professorship`).

Do not add routine conference best-paper awards, paper awards with only runner-up or candidate
status, ordinary departmental or university service/teaching awards, generic grants, invited
talks, or ambiguous honors whose standing cannot be established. A conference recognition may be
included only when it is clearly a durable, field-level distinction—for example, a most
influential-paper, impact, highest-impact, or test-of-time award already represented in the
roster. The award source must identify the recipient, the distinction, and preferably the year;
do not infer prestige from the title alone.

When two people share a name, use a fuller official form if available (for example, a middle name, initial, or nickname). Only if their names are genuinely identical should the university be appended: `Full Name - University`.

## Fields

The canonical field list is:

1. Computer & Information Sciences
2. Engineering
3. Mathematics
4. Statistics & Data Science
5. Physics & Astronomy
6. Chemistry
7. Biological & Biomedical Sciences
8. Earth & Environmental Sciences
9. Agricultural & Natural Resource Sciences
10. Health Sciences
11. Business & Economics
12. Social & Behavioral Sciences
13. Education
14. Humanities
15. Law & Public Affairs
16. Arts & Design
17. Others

Map a department that fits none of the named buckets to `Others`. If a department name is structurally ambiguous, use an exact `department|university` entry in `FIELD_OVERRIDES` in `src/data.js` rather than broadening a regex.

## Portraits and third-party content

Public availability does not establish permission to redistribute an image. Do not assume that a university or personal-site portrait can be copied into the repository. Prefer images with clear permission or an applicable open license, retain provenance in `portraitSource`, and remove or replace assets when rights are unclear or a rights holder objects. See [`DATA-LICENSE.md`](./DATA-LICENSE.md).

## Validation checklist

Before committing a roster change, run:

```bash
npm test
npm run build
git diff --check
```

Keep edits incremental, avoid changing unrelated fields, and update `src/data.js` when a new department type requires a shared filter rule.
