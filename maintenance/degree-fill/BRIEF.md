# Degree fill brief

You are given a JSON batch of 25 people already on the VietProfs roster. None has a recorded PhD
institution. For each person, find their education on live pages and report only what a page
explicitly states. Do not edit any file; you are read-only. Your final answer is one JSON object.

## Where to look, in order

1. The entry's `profileUrl` and `websiteUrl` (official faculty profile, lab or personal site, CV
   linked from them). Medical-school profiles usually have an Education/Training section.
2. Other official pages of the same employer (department directory, research portal such as
   Pure/Esploro/Elements/Scholars@, "Experts" pages), and a CV PDF linked from any of them.
3. A dissertation record (university repository, ProQuest, theses.fr, DART-Europe, national
   library) only when identity is unambiguous: same name AND same field AND a timeline that fits,
   or the person's own page links to it.
4. A previous employer's official page for the same person, when the current profile links or
   names it.

Never use name-alike pages of a different person. A Google Scholar or LinkedIn link in the entry
identifies the person but you will rarely be able to read LinkedIn; do not guess from snippets.

## What to record

Only these fields, only when a page states them explicitly (never infer a year from career
chronology, never guess an institution):

- `phdInstitution`, `phdYear`: a research doctorate. PhD, DPhil, ScD/DSc, EdD, DrPH, DBA,
  Dr. rer. nat./Dr.-Ing./Dr. med. (German research doctorates), French doctorat, Japanese 博士,
  and equivalents. NOT professional doctorates: MD, DO, DDS, DMD, PharmD, JD, DNP, DPT, OTD, AuD,
  PsyD, MFA. Record the doctorate type you saw in `doctorate`.
- `mdInstitution`: medical school (MD/DO/MBBS or foreign equivalent).
- `undergradInstitution`, `undergradYear`: the bachelor's (BS/BA/BEng/Kỹ sư/Cử nhân).
- `msInstitution`: a master's (MS/MA/MSc/MPhil/MEng/MPH/MBA).
- `postdocInstitution`: a completed postdoc.

Write institution names in English, in their official current form, without degree words
("University of Washington", not "Ph.D., University of Washington"). Years are four-digit strings.
Skip any field that the entry already has (the batch shows existing values) unless the page
contradicts it; then report the contradiction in `note`.

## Output

End with ONLY this JSON object, one result per person in the batch, in batch order:

```json
{
  "batch": "<batch key>",
  "results": [
    {
      "id": "vp-0123",
      "found": true,
      "doctorate": "PhD",
      "phdInstitution": "Stanford University",
      "phdYear": "2014",
      "undergradInstitution": "Hanoi University of Science and Technology",
      "undergradYear": "2007",
      "msInstitution": "...",
      "mdInstitution": "...",
      "postdocInstitution": "...",
      "source": "https://... (the page that states the degrees)",
      "quote": "verbatim degree text from that page, up to 300 characters",
      "note": "optional: second source, contradiction, or why nothing was found"
    },
    { "id": "vp-0124", "found": false, "note": "Profile lists no education; CV link 404" }
  ]
}
```

Omit fields you did not find. `found` is true when at least one field is reported. Every reported
field must be supported by `quote` (or by a second quote in `note` when two pages were used).
