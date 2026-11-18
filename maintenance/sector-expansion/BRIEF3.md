# Discovery brief 3 (2026-11-17; non-academic employers only)

You are finding Vietnamese and Vietnamese-diaspora career researchers outside Vietnam who work at
NON-university employers (corporate research labs, national labs, government science and defense
agencies, public/nonprofit research institutes, central banks, international organizations, think
tanks) and who are NOT yet in `public/data.json`. Stay inside the one slice given in your prompt.

Read first: `TASKS/discover_industry_labs.md` (scope, "the three tests", proposed fields) and the
eligibility/name rules in `ROSTER_MAINTENANCE.md`. Spell each employer the way existing
`public/data.json` entries spell it (grep for it) before coining a new spelling.

## How to search

- Work the employer's own people/staff/author directory (examples in the playbook's group table).
- Search by Vietnamese surname (Nguyen, Tran, Le, Pham, Hoang/Huynh, Phan, Vu/Vo, Dang, Bui, Do,
  Ho, Ngo, Duong, Ly, Truong, Dinh, Lam, Luong, Trinh, Doan, Cao, Ta, Mai, Ha, La, Quach, Thai...)
  AND by Vietnamese given-name tokens (Thanh, Tuan, Minh, Quang, Huong, Phuong, Trung, Hieu, Duc,
  Nhan, Khoa, Long, Thao, Linh, Hai, Hung, Dung, Vinh, Tam, Khanh, Hoa, Trang, Nam, Binh, Cuong,
  Dat, Toan, Thuy, Ngoc, Huy, Viet, Bao, Phuc, Loc, Tien, Son, Thang...). The given-name pass
  finds people the surname sweeps already missed.
- OpenAlex/Scholar/DBLP/news are leads only. Every candidate needs a live employer page.

## Rules (all must hold for a candidate)

1. `profileUrl` is this person's OWN page published by the CURRENT employer (people page, author
   page, staff bio, economist page), which you actually opened in this run. Never construct a URL
   from a pattern. Not acceptable: team/lab/list pages, news, PDFs, ORCID, Scholar, ResearchGate,
   LinkedIn, conference bios, a former employer. If the employer publishes no page, the person's
   own site stating the current role is acceptable with `"confirmed": false`. An official, current
   team or member-list page is acceptable when it shows this person's title (2026-11-17 rule in
   `ROSTER_MAINTENANCE.md`); a list without titles or an alumni list is not.
2. Quote the exact current title from that page in `evidence.currentRole`.
3. Career research role (Research Scientist, Staff/Principal Scientist, Research Engineer who
   publishes, Economist, Senior Fellow, Program Officer/Manager, lab staff scientist). NOT:
   postdocs, fellows on fixed terms, interns, students, visitors, contractors, product/QA/regulatory
   staff, pure software engineers without research output, incoming hires who have not started.
4. Research doctorate (record `phdInstitution`, `phdYear` if stated) or >=2 papers in the last
   three years at the current employer (list them in evidence).
5. Affirmative Vietnamese signal beyond a shared surname (Vietnamese given name, Vietnamese
   education, Vietnamese-language page, etc.); say what it is. Names like Lee, Li, Ly, Ha, Lam, Mai,
   Kim, Dang (Chinese), Hang need extra evidence.
6. Not physically based in Vietnam (a Vietnam office of a foreign company is out).
7. Not on the roster: grep `public/data.json` for the name (and name-order variants) and the
   profileUrl; if you can run shell commands, also run
   `npm run find-roster-matches -- "<name>" --url <urls...>`. A same-name hit at a different
   employer needs identity resolution (field, education); if it is the same person, list them in
   `possible_move`, not `candidates`. Skip every name in
   `maintenance/sector-expansion/already-proposed.txt`.
8. `city` is required: the city where the person works, sourced from their own page, the
   employer page, a CV, or a recent paper affiliation that names the city/site (e.g. "Amazon,
   Berlin"). Put the source in `evidence.location`. A company headquarters is not a source.
   Candidates without a sourced city are held by the auditor, so look for it.
9. Do not list the same person twice. At most 25 candidates; 8 solid beat 25 shaky.

## Hard limits

Do not create or edit any file (no `curl -o`, no saved pages; read pages to stdout), run state-changing git commands, create GitHub Issues/PRs, log in anywhere,
fetch LinkedIn, or evade bot checks.

## Output

Your FINAL reply must be ONLY this JSON object (no prose, no code fence):
{
  "slice": "<slice key>",
  "candidates": [
    { "entry": { "name": "First Middle Last, no diacritics", "university": "<employer>",
                 "institutionType": "Corporate research lab|Public research institute|Independent nonprofit research institute|Government & defense|Policy & international organization|Think tank",
                 "track": "Industry Research|Research|Government & Defense|Policy & Think Tank",
                 "rank": "Researcher|Administrator", "department": "...", "city": "...",
                 "state": "...", "country": "...", "researchAreas": ["..."],
                 "phdInstitution": "...", "phdYear": 2015, "profileUrl": "https://...",
                 "scholarUrl": "...", "websiteUrl": "...", "vietnameseName": "only if a cited source spells it" },
      "evidence": { "currentRole": "<url> — \"<quoted title>\"",
                    "doctorateOrPapers": "<url or paper list>",
                    "vietnameseSignal": "<what and where>",
                    "location": "<url> — \"<quoted text naming the city>\"",
                    "dedup": "<what you checked>" } }
  ],
  "possible_move": [ { "name": "...", "id": "vp-....", "note": "roster says X, live page says Y <url>" } ],
  "rejected": [ { "name": "...", "reason": "..." } ]
}
Omit any field you cannot source; never guess phdYear, city, or vietnameseName.
