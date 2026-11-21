# Discovery brief 4 (2026-11-21; universities and institutes in under-covered countries)

You are finding Vietnamese and Vietnamese-diaspora faculty and career researchers at universities
and public research institutes in countries the roster covers thinly, who are NOT yet in
`public/data.json`. Stay inside the one slice given in your prompt (a set of countries).

Read first: the eligibility, appointment-track, and name rules in `ROSTER_MAINTENANCE.md`. Spell
each university the way existing `public/data.json` entries spell it (grep for it) before
coining a new spelling.

## How to search

- Work each university's and institute's own staff directory, faculty lists, and department people
  pages, starting with the largest research universities in the slice, then technical
  universities, then medical schools.
- Search by Vietnamese surname (Nguyen, Tran, Le, Pham, Hoang, Huynh, Phan, Vu, Vo, Dang, Bui, Do,
  Ho, Ngo, Duong, Truong, Dinh, Luong, Trinh, Doan, Cao, Ta, Mai, Ha, La, Lam, Ly, Luu, Quach, Thai,
  Tong, Chu, Phung, Kieu, Vuong...) AND by Vietnamese given-name tokens (Thanh, Tuan, Minh, Quang,
  Huong, Phuong, Trung, Hieu, Duc, Khoa, Thao, Linh, Hung, Dung, Vinh, Khanh, Hoa, Trang, Binh,
  Cuong, Dat, Toan, Thuy, Ngoc, Huy, Viet, Phuc, Tien, Thang, Anh...).
- Leads from OpenAlex, Scholar, DBLP, or news are fine, but every candidate needs a live page from
  the current employer.

## Rules (all must hold for a candidate)

1. `profileUrl` is this person's OWN page published by the CURRENT employer (staff profile,
   faculty page, research-portal page), which you actually opened in this run. Never construct a
   URL from a pattern. Not acceptable: news, PDFs, ORCID, Scholar, ResearchGate, LinkedIn,
   conference bios, a former employer. An official, current team or member-list page is acceptable
   when it shows this person's title; a list without titles or an alumni list is not.
2. Quote the exact current title from that page in `evidence.currentRole`.
3. Eligible appointment: tenure-line or permanent faculty (Assistant/Associate/Full Professor,
   Lecturer, Senior Lecturer, Reader, docent/universitetslektor and equivalents), permanent
   teaching faculty, permanent research faculty or staff scientists, clinical faculty employed by
   the university or its hospital. NOT: postdocs, research fellows at postdoc level, PhD students,
   fixed-term project posts (Japanese 特任, "project", "temporary", "visiting"), adjunct, sessional,
   honorary, emeritus without a formal title, incoming hires who have not started.
4. Affirmative Vietnamese signal beyond a shared surname (Vietnamese given name, Vietnamese
   education, Vietnamese-language page, etc.); say what it is. Names like Lee, Li, Ly, Ha, Lam, Mai,
   Kim, Dang (Chinese), Hang need extra evidence. Chinese, Korean, and Cantonese names on shared
   surnames are out.
5. Not physically based in Vietnam: a branch campus in Vietnam (RMIT Vietnam, Fulbright, VinUni,
   British University Vietnam) is out, as is anyone whose primary appointment is in Vietnam.
6. Not on the roster: grep `public/data.json` for the name (and name-order variants) and the
   profileUrl; if you can run shell commands, also run
   `npm run find-roster-matches -- "<name>" --url <urls...>`. A same-name hit at a different
   employer needs identity resolution (field, education); if it is the same person, list them in
   `possible_move`, not `candidates`. Skip every name in
   `maintenance/sector-expansion/already-proposed.txt`.
7. `city` is required: where the person works, sourced from the page or the university's campus.
8. Do not list the same person twice. At most 25 candidates; 8 solid beat 25 shaky.

## Hard limits

Do not create or edit any file (no `curl -o`, no saved pages; read pages to stdout), run
state-changing git commands, create GitHub Issues/PRs, log in anywhere, fetch LinkedIn, or evade
bot checks.

## Output

Your FINAL reply must be ONLY this JSON object (no prose, no code fence):
{
  "slice": "<slice key>",
  "candidates": [
    { "entry": { "name": "First Middle Last, no diacritics", "university": "<employer>",
                 "institutionType": "only for a non-university employer",
                 "track": "Tenure-line|Teaching|Research|Clinical",
                 "rank": "Assistant Professor|Associate Professor|Professor|Lecturer|Senior Lecturer|Researcher",
                 "department": "...", "city": "...", "state": "...", "country": "...",
                 "researchAreas": ["..."], "phdInstitution": "...", "phdYear": 2015,
                 "profileUrl": "https://...", "scholarUrl": "...", "websiteUrl": "...",
                 "vietnameseName": "only if a cited source spells it" },
      "evidence": { "currentRole": "<url> — \"<quoted title>\"",
                    "vietnameseSignal": "<what and where>",
                    "location": "<url or campus>",
                    "dedup": "<what you checked>" } }
  ],
  "possible_move": [ { "name": "...", "id": "vp-....", "note": "roster says X, live page says Y <url>" } ],
  "rejected": [ { "name": "...", "reason": "..." } ]
}
Omit any field you cannot source; never guess phdYear, city, or vietnameseName.
