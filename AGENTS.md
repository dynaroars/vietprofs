# VietProfs contributor instructions

Before researching or modifying the roster, read [ROSTER_MAINTENANCE.md](ROSTER_MAINTENANCE.md) and [README.md](README.md). Before reviewing, merging, or closing a GitHub PR or Issue in this repository, read [TASKS/AUDIT_ISSUES_PRS.md](TASKS/AUDIT_ISSUES_PRS.md) — it is the authoritative audit workflow (fresh-`main` testing, id-collision handling, merge/close steps) and takes precedence over any ad hoc review approach. When the repository owner pastes one or more candidate names directly into a conversation for roster consideration, follow [TASKS/candidate_intake.md](TASKS/candidate_intake.md) — dedup against the roster, check eligibility, enrich (awards, portrait source, LinkedIn, lab/personal website, about/bio), and file one GitHub Issue per new eligible candidate.

This repository is **VietProfs**: a roster of Vietnamese and Vietnamese-diaspora faculty at universities outside Vietnam. Do not apply inclusion criteria from an external repository or linked project without first confirming that it is relevant here.

`ROSTER_MAINTENANCE.md` is the authoritative guide for eligibility, evidence, appointment tracks, degrees, honors, and portraits. For local roster data updates without UI changes, `npm test`, `npm run build`, and `git diff --check` are fast, lightweight, and sufficient. Full browser smoke tests (`npm run test:e2e`) are only needed before pushing frontend/UI changes.

Interesting-facts output must follow the roster-only, reproducible-observation rules in `README.md` and `ROSTER_MAINTENANCE.md`; qualified signals such as “the roster suggests” are allowed when supported by explicit comparisons, but do not invent claims or infer prestige, demographics, causation, growth, or migration paths from current counts.

## Direct updates

Information explicitly supplied by the repository owner, or in a GitHub issue, email, or similar
submission that the owner asks you to process, is ground truth when it is applied: apply every
field it asserts. Canonical formatting and field mapping may be applied while processing it.

Only facts that the web can't settle are protected afterwards: `name`, `vietnameseName`, `honors`,
`portrait`, and `portraitSource`. Add those, when the submission asserts them, to the entry's sorted
`directFields` array. Automated work must never change or remove a protected value, or delete an
entry that has protected fields; if live evidence conflicts with one, file an Issue for the owner.
Only another direct update may replace a protected value.

Appointment and other checkable facts (`university`, `department`, `rank`, `track`, `profileUrl`,
location, degrees, links) are not protected. They go stale when people move or get promoted, and
the current official page is the authority: a later verified change updates them normally, and
its commit or PR says what the submitted value was.

When updating names or processing university profile changes where a scholar's published surname has changed (e.g. to a non-Vietnamese surname), retain the original Vietnamese surname in `name` and `vietnameseName` (e.g., `First [Vietnamese Surname] [New Surname]`) as per `ROSTER_MAINTENANCE.md` so that the entry's Vietnamese lineage and discovery context are preserved.

## New entries vs. edits: Issue vs. PR

Adding a person to the roster requires assigning a new immutable `vp-####` ID — a
higher-stakes, harder-to-reverse action than editing a field on an entry that has already
passed eligibility review. Because of that:

- **Standing owner authorization (2026-10-01).** The repository owner authorizes two kinds of
  session to add and remove roster entries directly, on `main`, without asking again: the
  scheduled **auditor** (`audit`) and any **owner-run session** the owner has asked to process an
  Issue, an owner submission, or a pasted candidate. When the audit verifies a New-candidate Issue
  (the dedup is clean and the eligibility is confirmed live), it adds the entry, runs
  `assign-profile-ids -- --apply`, stores the portrait, and closes the Issue. When it confirms that
  someone is gone or no longer eligible, it retires the id (`maintenance/retired-ids.json`). Tests,
  build, and `git diff --check` must pass first. An entry with protected `directFields` is never
  removed by automation; that conflict goes to an Issue.
- **All other producers** (`discover`, `honors`, `links`, `portraits`, `relationships`) never
  assign an id. For them, **any change that adds a new roster ID** (a new faculty discovery, a
  relationship counterparty who isn't in the roster yet, or any other brand-new
  `public/data.json` entry) must be proposed as a **GitHub Issue**, not a PR, regardless of how
  strong the supporting evidence is. Do not run `assign-profile-ids -- --apply` or otherwise commit
  a new ID to a branch for review; describe the candidate (evidence, source URLs, proposed fields)
  in the Issue and let the auditor or the owner add it.
- **A person already on the roster is never a new ID**, even at a new institution, under a
  different name order, or after an earlier removal. Run `npm run find-roster-matches` with the
  name and every identity URL before proposing anyone; a hit at another institution is usually a
  move and becomes an edit to that ID. When two IDs turn out to be one person, the older ID is
  kept. See "One person, one ID" in `ROSTER_MAINTENANCE.md`.
- **Any change that only edits or corrects existing roster IDs** (facts, honors, links,
  portraits, relationships between already-listed people, etc.) follows the routing table below.
- If a single batch mixes both (some brand-new candidates, some edits to existing entries),
  split them: submit the edits via their normal PR/direct-commit path and file a separate
  Issue per new candidate.

## Where each kind of change lands

This table is the single source of truth for submission routing; task playbooks refer here
instead of restating it.

| Change | Route |
| :--- | :--- |
| New roster ID (any new `public/data.json` entry) | GitHub Issue, one per candidate |
| Edit to existing IDs from a `TASKS/` playbook (links, portraits, honors, degrees) | Topic branch + PR; the auditor (`TASKS/AUDIT_ISSUES_PRS.md`) merges |
| Auditor's own fixes for verified Issues | One `audit-fix/<date>` branch + PR per run; the auditor squash-merges it on green CI (`docs/AUTOMATION.md` "Applying fixes") |
| Relationship batches (`public/relationships.json`) | Commit and push to `main` |
| Conflict with a protected `directFields` value, or anything needing an owner decision | GitHub Issue |

Never merge your own PR (the one exception is the auditor's `audit-fix` PR for Issues other agents or the owner filed). PRs and Issues are review handoffs: a separate auditor run checks them
later (see "Independent review" in `TASKS/AUDIT_ISSUES_PRS.md`). `lastUpdatedAt` lives in
`public/updates.json` and is stamped by `npm test`; never set it by hand.

## Unattended and scheduled runs

A playbook that says "continue until 100% complete" means across runs, not within one. A
scheduled or unattended run should process at most the batch cap the scheduler gives it (default:
3 batches), open its PR/Issues, then stop. Before starting, check open PRs from the same task and
skip entries they already touch. Stop early, without pushing, if `npm test` or `npm run build`
fails for a reason you can't fix inside the batch.

Scheduled routines, their cadence, and the producer → auditor handoff are documented in
[docs/AUTOMATION.md](docs/AUTOMATION.md), which is the source of truth for routine behavior. Any
agent that notices an error or lead outside its own task (a stale rank, duplicate entry, missing
honor, wrong link, or new candidate) files it as a side-finding Issue as described there, instead
of fixing it in its task PR or dropping it.

Cloud sessions: run `npm ci` before testing (not `npm install`, which rewrites
`package-lock.json`). If `gh` is unavailable, use the GitHub MCP tools for PRs, Issues, comments,
and merges. If a site is blocked by the egress proxy, say so in the PR/Issue and don't accept a fact
you couldn't check; an unverified item stays for a later run or goes to an Issue.

## Human review handoff

If any automated maintenance, scouting, audit, portrait recovery, relationship discovery, or
similar workflow produces an item that requires human review, identity resolution, an owner
decision, or a manual confirmation, create a GitHub Issue for it. Include the relevant roster ID
or candidate name, evidence and source URLs, the reason review is required, and the concrete next
action. Do not leave review-required items only in local maintenance files; do not apply them to
public roster or relationship data until the review is resolved.

Relationship-discovery work is an owner-directed exception: routine unresolved relationship leads
may remain in `maintenance/relationship-research.json` without an Issue, and relationship updates
must be committed and pushed directly to `main`. Use an Issue or PR for relationship work only when
the repository owner explicitly requests one or a protected direct record conflicts with live
evidence.
