# Discover Academic Relationships (`discover_academic_relationships.md`)

> **Autonomous Goal Directive (`/goal TASKS/discover_academic_relationships.md`):**
> Discover and verify academic relationships **between people already listed in `public/data.json`**. Work in resumable batches of 20 roster members and write verified doctoral advisor/advisee relationships, explicitly documented postdoctoral mentorships, and identity-verified coauthorship signals to the public roster relationship database at `public/relationships.json`. Never research or record spouses, relatives, or other personal relationships. Treat automated author matching and genealogy databases as leads rather than proof, retain evidence for every accepted relationship, and commit and push relationship updates directly to `main`.

---

## 1. Purpose and scope

Build a reproducible evidence ledger for academic connections within VietProfs. Both endpoints of a relationship must already have immutable `vp-####` IDs in `public/data.json`.

Allowed relationship types:

- `doctoral-advisor`: directional from the advisor to the doctoral advisee.
- `postdoctoral-mentor`: directional from the mentor to the postdoctoral researcher, but only when a source explicitly names the mentoring relationship.
- `coauthor`: symmetric evidence that two roster members coauthored qualifying scholarly works.

Explicitly out of scope:

- spouses, partners, relatives, and every other personal or family relationship;
- inferred mentorship based only on attendance at the same institution, department, laboratory, grant, or conference;
- generic professional proximity such as colleagues, collaborators, co-investigators, or lab members without the evidence required below;
- relationships involving a person who is not already in the VietProfs roster; and
- adding new roster members. Record an out-of-roster counterparty as an excluded outcome, not as a new entry.

Do not duplicate relationships inside individual `public/data.json` entries. `public/relationships.json` is the normalized public edge table for the roster: each relationship is stored once and references people by immutable roster ID. Only verified relationships belong in this file.

---

## 2. Evidence standards

### Doctoral advisor / advisee

Require a source that explicitly connects the named doctorate recipient to the named doctoral advisor. Preferred evidence, in order:

1. an official university dissertation or institutional-repository record;
2. an official faculty profile, CV, dissertation announcement, or university biography;
3. the scholar's maintained academic CV or personal site; or
4. a field-specific genealogy database corroborated by an independently identity-resolved source.

A genealogy entry, search snippet, acknowledgments page, shared institution, overlapping dates, or similar research topic is a lead only. Do not infer the direction of mentorship. Distinguish doctoral advisors from committee members, master's advisers, informal mentors, and postdoctoral supervisors.

### Postdoctoral mentor

Require explicit wording such as `postdoctoral mentor`, `postdoctoral advisor`, `worked as a postdoctoral fellow with`, or an equivalent unambiguous statement. A recorded postdoctoral institution, laboratory membership, coauthorship, or overlapping appointment is insufficient by itself.

### Coauthor

Record a verified `coauthor` relationship only when:

1. both roster members have been individually identity-resolved against the works;
2. at least two qualifying shared scholarly works are found;
3. each retained work has a stable identifier such as a DOI, OpenAlex work ID, PubMed ID, or an official repository URL; and
4. the match is not driven only by a large consortium or hyper-authored publication.

Use the factual display concept `coauthored N works`; do not turn coauthorship into an unsupported claim about friendship, mentorship, research dependence, or the importance of the collaboration. Exclude corrections, errata, acknowledgments, editorial-board lists, and records where either author identity remains ambiguous.

OpenAlex, Crossref, ORCID, PubMed, DBLP, and Google Scholar may be used for discovery. Automated author IDs can be split, merged, or assigned to namesakes, so verify each mapping with multiple identity signals: official profile or publication list, full-name variants, current or historical affiliation, research area, coauthors, ORCID, and work titles.

---

## 3. Public roster relationship database

Create `public/relationships.json` if it does not exist. Preserve prior verified records and use this top-level structure:

```json
{
  "version": 1,
  "updatedAt": "2026-09-21T00:00:00.000Z",
  "relationships": []
}
```

Every public relationship record uses immutable roster IDs and must be verified and self-contained:

```json
{
  "id": "rel-doctoral-advisor-vp-0001-vp-0002",
  "type": "doctoral-advisor",
  "sourceId": "vp-0001",
  "targetId": "vp-0002",
  "sources": [
    "https://institutional-repository.example/dissertation"
  ],
  "evidence": "The official dissertation record explicitly names vp-0001 as the doctoral advisor of vp-0002.",
  "works": [],
  "verifiedAt": "2026-09-21T00:00:00.000Z",
  "direct": false,
  "notes": ""
}
```

For `coauthor`, store the two IDs in ascending lexical order, use that same order in the deterministic `id`, and populate `works` with the retained work identifiers, titles, dates, and source URLs. For directional mentorship, `sourceId` is always the advisor or mentor and `targetId` is the advisee or postdoctoral researcher.

Do not write `unresolved`, `candidate`, or `excluded` records to the public database. Those are not established relationships. If resumable research state is needed, create `maintenance/relationship-research.json` containing only provider identity mappings, processed batch IDs, rejected candidates, unresolved leads, and next actions. It must never be loaded by the public site or described as roster relationship data.

### Relationship review handoff

Record unresolved leads, rejected candidates, and next actions in `maintenance/relationship-research.json`.
Routine unresolved relationship leads do not require a GitHub Issue or PR. Open one only when the
repository owner explicitly requests external review or when a protected direct record conflicts
with live evidence. Never place an unresolved lead in `public/relationships.json`.

Information explicitly supplied by the repository owner may set `direct: true`; web research must always use `direct: false`. Protected direct relationship records follow the same correction process as protected direct roster fields: verify them, but open an Issue instead of silently changing or removing them when live evidence conflicts.

---

## 4. Batch workflow

Process 20 roster members per batch in stable ascending ID order, skipping IDs already completed in a prior batch.

### Step 1: Establish the batch

Record the batch number, roster IDs, start timestamp, and status in `maintenance/relationship-research.json`. Check the complete public relationship database and non-public research state before searching so relationships and provider mappings are not duplicated.

### Step 2: Search mentorship evidence

For each person, search bounded combinations of:

- full published name and name variants with `doctoral advisor`, `dissertation`, `thesis`, `PhD advisor`, and equivalent local-language terms;
- official university domains and institutional repositories;
- the person's official profile, CV, personal academic site, and lab site; and
- field-specific genealogy resources as lead generators.

Write verified relationships to `public/relationships.json`. Record unresolved and excluded outcomes only in the non-public research-state file. Stop searching a candidate once the evidence standard is met or the bounded sources are exhausted.

### Step 3: Resolve publication identities

Prefer an authenticated or officially published ORCID when available. Otherwise resolve an OpenAlex, Crossref, PubMed, DBLP, or comparable author identity using multiple signals. Never accept name-only matching, particularly for common Vietnamese names and initials.

Retain rejected provider mappings with the mismatch reason, such as incompatible institution, field, chronology, middle name, or publication history.

### Step 4: Detect roster-internal coauthorship

For verified author mappings, retrieve works and invert each work's verified authorships back to VietProfs IDs. Evaluate only pairs in which both identities are resolved. Deduplicate versions by DOI or another stable work identifier, remove non-qualifying records, and require at least two retained shared works before marking the pair verified.

### Step 5: Review the batch

Before closing a batch:

- confirm both IDs exist in `public/data.json` and are different;
- confirm relationship direction and type;
- confirm source URLs resolve to the claimed evidence;
- confirm symmetric pairs are stored once;
- confirm every verified coauthor edge has at least two qualifying works;
- confirm no spouse, family, demographic, or inferred personal information appears; and
- give every roster ID a completed, unresolved, or excluded batch outcome.

Mark the batch complete only after these checks. Continue with the next unprocessed batch when the goal invocation calls for complete-roster coverage.

---

## 5. Validation and direct-push protocol

Validate every batch:

```bash
node -e "JSON.parse(require('node:fs').readFileSync('public/relationships.json', 'utf8'))"
npm test
npm run build
git diff --check
```

Commit and push `public/relationships.json`, the non-public research-state file when it changed,
and any explicitly requested supporting validation code directly to `main`. Do not create a routine
PR or Issue for the batch. If protected direct information conflicts with live evidence, or the
owner explicitly requests a decision, open a GitHub Issue rather than silently changing or removing
it.

Suggested commit title:

```text
data(relationships): verify academic relationship batch [BATCH_NUM]
```

The PR summary must report:

- roster members processed;
- verified advisor/advisee relationships;
- verified postdoctoral mentorships;
- verified coauthor pairs and qualifying works;
- unresolved and excluded counts with major reasons;
- provider mappings added or rejected; and
- validation commands and results.

---

## 6. Completion criteria

A batch is complete only when every selected roster member has a documented research outcome and all public edges meet the evidence rules. Complete-roster coverage means every current `vp-####` ID appears in a completed research batch; it does **not** mean every person must have a relationship.

Absence of a discovered relationship is not evidence that no relationship exists. Public output must never label a person as having no advisor, advisee, mentor, or coauthor merely because the sources checked by this task did not reveal one.
