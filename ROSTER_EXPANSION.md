# Roster expansion: all STEM fields

VietAcademia started as a Computer Science-only list, then picked up some Math/Physics/ECE/Stats
entries during the initial scaffold. The goal now is to cover Vietnamese, tenure-line faculty
across **all STEM fields** at U.S. universities, added one field at a time. This doc is
the handoff point for whichever agent or session picks up the next field — read it before adding
entries so the bar stays consistent across fields.

## Verification bar (confirmed with the user, 2026-08-18; full-time requirement dropped 2026-08-18)

Include a person only if all three hold:

1. Clearly Vietnamese name.
2. A working **.edu faculty/department profile page** confirming they are tenure-line
   (tenure-track or tenured — not adjunct, teaching-only, visiting, research-track/
   research-professor, or emeritus/retired) at a U.S. university. Full-time status is not a
   separate requirement — tenure-line is sufficient.
3. A working **Google Scholar profile URL**
   (`https://scholar.google.com/citations?user=...`).

Do not guess or fabricate URLs, universities, or research areas. If any of the three can't be
confirmed, leave the person out rather than including a best-guess entry. This is a real,
public-facing directory — every entry must be independently checkable by a reader.

Quantity target per field: as exhaustive a web-search pass as reasonably achievable, not just the
first handful found. The CS list (~49 entries) is the rough depth benchmark, though smaller fields
will naturally have fewer.

## Schema

See `README.md` for the field list. Notes specific to filling it in:

- `state`: full state name (e.g. `"Massachusetts"`, not `"MA"`) — `"DC"` is the one existing
  exception, kept as-is for consistency with existing entries.
- `department`: the department name as that university actually calls it (e.g. `"Chemistry"` vs
  `"Chemistry and Biochemistry"`) — don't normalize across universities.
- `researchAreas`: short, Title Case topical tags, matching the terseness of existing entries.
- `secondaryAppointment: true`: use only when the person's *primary/tenure home* is a different
  department and the field you're adding is a joint/secondary appointment. Before adding such an
  entry, check whether the person is already in the roster under their primary department — if
  so, don't create a duplicate; a joint appointment is one row, not two. (This means cross-checking
  new candidates against the full existing roster, not just the field you're currently working on.)
- File formatting: `public/data.json` is one compact JSON object per line, not pretty-printed —
  match that exactly when appending.

## Process for a field pass

1. Read `public/data.json`, `src/data.js`, `test/data.test.js` to (re-)confirm schema and
   validation rules (no duplicate names, all required fields present, `profileUrl` starts with
   `https://`, etc).
2. Web search broadly for candidates (common Vietnamese surnames + department + "professor",
   university-by-university, etc), not just the first obvious names.
3. Verify each candidate individually: fetch their faculty page and their Google Scholar page.
4. Append verified entries to `public/data.json`, run `npm test`, confirm it passes.
5. Update the progress table below with what was added and what was checked-and-rejected (briefly
   — e.g. "adjunct", "no Scholar profile found", "already in roster under Math").

## Progress by field

| Field | Status | Notes |
|---|---|---|
| Computer Science | Done (pre-existing) | ~49 entries, from initial scaffold. |
| Mathematics | Done (pre-existing) | 19 entries, from initial scaffold. |
| Electrical and Computer Engineering | Done (pre-existing) | 7 entries, mostly secondary appointments. |
| Physics | Done (pre-existing) | 5 entries, from initial scaffold. |
| Statistics / Biostatistics / Operations Research | Done (pre-existing) | 3 entries total, from initial scaffold. |
| Chemistry | Done (2026-08-18) | 7 entries added: Vy M. Dong (UC Irvine), Thuc-Quyen Nguyen (UCSB), SonBinh T. Nguyen (Northwestern), Hien M. Nguyen (Wayne State), Hung T. Nguyen (SUNY Buffalo), M. Tuan Trinh (Utah State), Tuan Vo-Dinh (Duke, secondary appointment — primary home is Biomedical Engineering, not yet in roster). Rejected after investigation: Thanh N. Truong (Utah) — emeritus; Hoang (Long) Nguyen (Washburn) — tenure-track chemistry but no findable Google Scholar profile; Diep Ca (Shenandoah University) — professor of chemistry but no Google Scholar profile found; Danith Ly (CMU) — Cambodian-American, not Vietnamese; Ka Un Lao (VCU) — born in Macau, not Vietnamese; Nga Lee "Sally" Ng (Georgia Tech) — Hong Kong heritage, not Vietnamese, and dept is Chemical/Biomolecular Engineering; Tran Nguyen (UC Davis) — Vietnamese-heritage, tenure-track, has Scholar profile, but department is Environmental Toxicology (Atmospheric/Environmental Chemistry) rather than a Chemistry/Biochemistry department — better fit for a future Earth/Environmental Science pass; Hung Phan (Soka University) — visiting assistant professor; Hung V. Pham (UCLA) — adjunct/instructor; Khanh Ha (U. Florida) — graduate student, not faculty; My Hang V. Huynh — Los Alamos National Laboratory (not university faculty). First attempt (2026-08-18) via a forked agent had silently failed — it reported success but made zero tool calls and added zero entries; this pass is the real retry. |
| Biology / Life Sciences | Not started | Next after Chemistry. |
| Chemical Engineering | Not started | |
| Mechanical Engineering | Not started | |
| Civil Engineering | Not started | |
| Materials Science / Engineering | Not started | |
| Bioengineering / Biomedical Engineering | Not started | |
| Earth / Environmental Science | Not started | |
| Astronomy / Astrophysics | Not started | |
| Other STEM fields not yet enumerated | Not started | Revisit this list as fields get covered — it's a starting set, not exhaustive. |

## Known issue: background research agent can silently no-op

The first Chemistry attempt was delegated to a forked background agent that reported
"completed" with a plausible-sounding summary, but its actual tool-use count was 0 and it ran for
~6 seconds — i.e. it did no real search or verification work and the diff it claimed to make
never happened. **Don't trust a completion report at face value** — after any research agent
reports done, check `git diff public/data.json` (or `git status`) yourself to confirm entries
were actually added before updating this table or telling the user it's done.
