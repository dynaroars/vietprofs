# Automated maintenance setup

This file describes how VietProfs is maintained by scheduled agents: what runs, when, where,
and how the pieces hand work to each other. It is the source of truth for routine behavior. Each
cloud routine's prompt is a short pointer to its section below, so behavior is changed by editing
this file, not the routine.

Policy (eligibility, evidence, routing of Issues/PRs/direct pushes) lives in `AGENTS.md`,
`ROSTER_MAINTENANCE.md`, and `TASKS/`. This file only covers scheduling and the handoffs.

## How it fits together

```
 producers (Sonnet, overnight)           auditor (Opus, next night)          owner
 ─────────────────────────────           ──────────────────────────          ─────
 task PRs  "[scheduled:<task>] ..."  ──►  re-verify live, test on main,
                                          CI green → squash-merge
 finding Issues (side discoveries)   ──►  verify → fix on main → close   ──►  only items the
 new-candidate Issues                ──►  re-dedup → add entry → close        auditor leaves
 owner-review Issues                 ──►  comment findings, leave open        open
```

- **Producers** do one playbook each, in small capped batches. They never merge or push to `main`,
  except the relationships routine (see `AGENTS.md`).
- While researching, producers also report **side findings**: errors or leads outside their own
  task, filed as Issues (see "Side findings" below). This is how a narrow task like the LinkedIn
  backfill turns up stale ranks, duplicates, missing honors, and new candidates.
- **The auditor** is a separate model and a separate session. It runs once a day and only takes
  items at least 12 hours old, so each producer run is reviewed by a different agent the next day.
  Its rules are in `TASKS/AUDIT_ISSUES_PRS.md` ("Independent review").
- **The owner** only sees what the auditor leaves open: protected `directFields` conflicts,
  ambiguous identities or eligibility, and anything it couldn't verify from the cloud.

## Schedule

Cloud routines live at <https://claude.ai/code/routines> (environment: Default, network access **Full** since 2026-09-24; edit it from the environment button above the claude.ai/code message box → gear icon). Cron is UTC; ET
is shown for convenience (EDT; add an hour in winter).

Each routine attaches only the `Claude_Docs` connector. Don't add `Claude_Code_Remote`: with it,
a run that opens a PR schedules hourly "Re-check PR" reminders until the PR is merged.

| Key | Routine id | Model | Cron (UTC) | ET | Section |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `audit` | `trig_01GeWQmgtoeJtaf7E2LsA7BA` | Opus 5.5 | `0 3 * * *` | daily 11 PM | [Auditor](#auditor-audit) |
| `linkedin` | `trig_0162DEq1aGRH3vWrEtpKoNmy` | Sonnet 5 | `0 5 */3 * *` | every 3rd day of the month (1st, 4th, … 31st) 1 AM | [LinkedIn](#linkedin-backfill-linkedin) |
| `scholar` | `trig_01KLRvszaFCY869VkchMmiAE` | Sonnet 5 | `30 5 * * 1,4` | Mon/Thu 1:30 AM | [Scholar](#google-scholar-backfill-scholar) |
| `websites` | `trig_01RKg7at1hAC3cY8NHVN8VBU` | Sonnet 5 | `30 5 * * 2,5` | Tue/Fri 1:30 AM | [Websites](#websites-and-labs-websites) |
| `portraits` | `trig_01D58Azgkh8kdKFBdFNAXox2` | Sonnet 5 | `30 5 * * 3,6` | Wed/Sat 1:30 AM | [Portraits](#portraits-portraits) |
| `overviews` | `trig_01NUyNrE7x8WZgLMHbpCU7Zi` | Sonnet 5 | `30 5 * * 0` | Sun 1:30 AM | [Overviews](#research-overviews-overviews) |
| `education` | `trig_011kuvE1P6aHNn7fcw9XVnLS` | Sonnet 5 | `30 6 * * 0` | Sun 2:30 AM | [Education](#education-chronology-education) |
| `honors` | `trig_012eH5rSZwQw7PXiQPSRj9Wn` | Sonnet 5 | `30 6 * * 4` | Thu 2:30 AM | [Honors & leads](#honors-and-lead-triage-honors) |
| `discover` | `trig_01R9AeywUniWNP3iK8XDw9ju` | Sonnet 5 | `30 6 * * 2` | Tue 2:30 AM | [Discovery](#discover-new-faculty-discover) |
| `relationships` | `trig_01EgwQ418znNbFQ95ghg4p5E` | Sonnet 5 | `0 7 * * 1,3,5` | Mon/Wed/Fri 3 AM | [Relationships](#academic-relationships-relationships) |

Outside the cloud:

| What | Where | When | Notes |
| :-- | :-- | :-- | :-- |
| Link-health report | GitHub Action `.github/workflows/link-health.yml` | 1st of month, 08:00 UTC; manual via `gh workflow run link-health.yml` | Opens or comments on the "Link-health report (automated)" Issue. No model involved. |
| Full-roster controller | Owner's crontab: `0 22 * * 6 …/scripts/cron-maintain-roster.sh` | Sat 10 PM local | Runs `scripts/maintain-roster.ts` in the separate clone `~/git/projects/vietprofs-maintenance`; state in `~/.local/state/vietprofs-maintenance/cron-state`, log in `…/cron.log`. Pushes to `main`. With the default 365-day staleness it selects nobody until entries age (about Aug 2027); set `VIETPROFS_MAINT_ARGS="--stale-days 180"` on the cron line for a shorter cycle. |

Retired routines (deleted; no longer at claude.ai/code/routines). The routines above replace them:

- `vietprofs-linkedin-url-backfill` (every 2h) → `linkedin`. Same task; its side-findings behavior now applies to all producers.
- `vietprofs-link-health-sweep` (Mon) → link-health Action + `websites` + `audit`. Running `check-links` inside the cloud sandbox is useless: on 2026-09-21, 4,794 of 5,501 URLs returned egress-proxy 403s. Its prompt also allowed deleting fields or entries over "dead" links. Link detection now runs on GitHub runners with real internet access.

## Conventions for every scheduled run

Every routine prompt says: "Read docs/AUTOMATION.md and follow the section for `<key>`." All of
them share these rules:

1. **Setup.** Read `AGENTS.md`, then this section and the playbook it names, then the
   `ROSTER_MAINTENANCE.md` sections the playbook cites. Run `npm ci` (not `npm install`). Work
   sequentially; don't spawn subagents. Use the GitHub MCP tools when `gh` is missing.
2. **Caps.** Stay within the section's batch cap, then stop. Before starting, list open PRs and
   Issues titled `[scheduled:<key>]` and skip entries they already touch.
3. **Titles.** Every PR and Issue title starts with `[scheduled:<key>]`.
4. **Boundaries.** Producers never merge PRs and never push to `main` (relationships excepted).
   They never add a person to `public/data.json` or assign an id. New people always go in an
   Issue. Protected `directFields` values are never edited (except rewriting into an exactly equivalent
   canonical form, e.g. state `CA` → `California`); a conflict goes in an Issue.
5. **Timestamps.** Set `lastUpdatedAt` on changed entries. Only a complete live review advances
   `maintenance/verification.json`, so no routine here touches it except the auditor when it adds
   a new entry.
6. **Unverifiable means untouched.** If the egress proxy blocks a source, don't accept the fact,
   and don't delete an existing value because of the block. List those entries in the PR/Issue so
   a later run retries them.
7. **Side findings.** Report them as described below.
8. **Summary.** End with entries processed, changes made, PR/Issue links, side findings filed,
   entries skipped with reasons, and any egress blocks.
9. **No follow-ups.** Once your PR/Issues are open, stop. Don't schedule check-ins, reminders,
   wakeups, or re-armed routines to watch CI or the PR; the auditor handles review. If CI fails,
   note it in the PR and leave it for the auditor.

## Side findings

While working on its own task, a producer often sees evidence that something else about an entry
is wrong or missing. It doesn't fix that in its task PR, which stays scoped to its own fields.
Instead it files one Issue per finding, so the auditor can verify and resolve it independently.

File a finding when a source you actually read shows one of these:

| Finding | Title after the `[scheduled:<key>]` prefix |
| :-- | :-- |
| Rank, track, department, or field looks stale | `Review possible rank mismatch: <name> (<vp-id>)` (or `stale department`, `stale institution`) |
| Person seems to have moved, retired, died, or left academia | `Review stale institution: <name> (<vp-id>)` |
| Appointment looks postdoc, visiting, adjunct, or otherwise ineligible | `Review possible eligibility issue: <name> (<vp-id>)` |
| Dead or wrong `profileUrl`, `websiteUrl`, `labUrl`, `scholarUrl`, or portrait | `Likely wrong <field>: <name> (<vp-id>)` |
| Two roster entries are the same person | `Duplicate roster entry: <name> (<vp-id>) duplicates <vp-id>` |
| An honor that plausibly meets the honors bar is missing | `Possible new honor: <name> (<vp-id>) — <honor>` |
| Degree fact wrong or missing | `Review incorrect <field>: <name> (<vp-id>)` |
| `researchOverview` describes someone else or is stale | `Review mismatched researchOverview: <name> (<vp-id>)` |
| An eligible person not on the roster (coauthor, lab member, colleague) | `New candidate: <name> — <rank>, <institution>` (follow `TASKS/candidate_intake.md` steps 1-4) |

Rules:

- **Dedup first.** Search open Issues, and Issues closed in the last 60 days, for the vp-id or name.
  If one exists, add a comment only when you have new evidence; otherwise skip.
- **Evidence.** The body gives the roster id and the current stored value, the evidence with source
  URLs, what you think the correct value is, how confident you are, and what you couldn't check
  (for example, egress blocks).
- **Bar.** Apply the honors rules in `ROSTER_MAINTENANCE.md` before filing a honor finding.
  Per-year best-paper awards, student or postdoc awards, and research-initiation grants don't
  qualify, so don't file them. A vague hunch isn't a finding; a source that conflicts with the
  stored value is.
- **Cap.** At most 5 side-finding Issues per run, plus new-candidate Issues. When there are more,
  file the strongest and mention the rest in the run summary.

## Routine sections

### Auditor (`audit`)

Follow `TASKS/AUDIT_ISSUES_PRS.md`, including "Independent review". Also read
`TASKS/candidate_intake.md`.

- Scope: open PRs and Issues created at least 12 hours ago, oldest first, skipping anything this
  session created. At most 5 PRs and 10 Issues per run.
- PRs: test merged onto fresh `main` (`npm test`, `npm run build`, `git diff --check`),
  re-verify every changed entry live, check `directFields` and the ledger rule, and require green
  CI. Squash-merge and delete the branch, or request changes (or close) with a comment naming each
  rejected entry and why. Never merge a partial subset silently.
- New-candidate Issues: re-run the dedup (name variants plus profile/website/Scholar/LinkedIn
  URLs) against current `public/data.json`, re-verify eligibility live, add the entry, run
  `npm run assign-profile-ids -- --apply`, update `maintenance/verification.json`, validate, push
  to `main`, and close the Issue with the new id.
- Side-finding and other correction Issues: verify live. If confirmed, fix, validate, push to
  `main`, and close with what changed and the source. If the evidence is wrong, close with the
  reason. Duplicates: keep the richer entry, move any unique sourced fields onto it, remove the
  other, and rename or remove its `maintenance/verification.json` key.
- Needs an owner decision (protected `directFields` conflict, ambiguous identity or eligibility,
  unverifiable from the cloud): comment with findings and a recommendation, and leave it open.
- Tracking Issues such as the link-health report: work up to 10 entries, post a progress comment,
  and leave it open.
- The auditor doesn't file side findings about its own items; it resolves them.

### LinkedIn backfill (`linkedin`)

Playbook: `TASKS/backfill_linkedin.md`. Cap: 2 batches of 15 entries missing `linkedinUrl`.
Continue in id order after the highest id covered by recent LinkedIn backfill PRs (open or
merged), wrapping at the end of the roster. Each candidate means reading the person's official
profile, Scholar, and homepage, so this routine is the main source of side findings. Apply the
rules above to everything you read.

### Google Scholar backfill (`scholar`)

Playbook: `TASKS/check_google_scholar.md`, plus step 3 of "Periodic full-roster refresh" in
`ROSTER_MAINTENANCE.md`. Cap: 2 batches of 15 entries missing `scholarUrl`, in id order after the
last `[scheduled:scholar]` PR, wrapping. Never match on name alone (`npm test` rejects a Scholar
URL shared by two people). A Scholar profile's affiliation line is a common source of
stale-institution findings.

### Websites and labs (`websites`)

Playbook: `TASKS/verify_websites_and_labs.md`, plus step 2 of "Periodic full-roster refresh" and
"Periodic link-health sweep". Cap: 2 batches of 15. Handle entries from the open link-health
report Issue first, then continue in id order after the last `[scheduled:websites]` PR. For a dead
link, search the name and university fresh before calling it unfixable.

### Portraits (`portraits`)

Playbook: `TASKS/fetch_portraits.md` section 4, exactly. Cap: 2 batches of 10. Run
`pip install pillow numpy` if the analyzer needs it. Open every added image with the Read tool and
look at it. In the PR body, give each portrait's id, its source page, and one line on why it was
accepted. Never replace a portrait protected by `directFields`.

### Research overviews (`overviews`)

Playbook: `TASKS/enrich_research_overviews.md`. Cap: one 20-profile snapshot
(`npm run enrich -- snapshot/status/collect/apply/finalize`). Write only from the scholar's own
pages, check for namesakes, and follow the ROSTER_MAINTENANCE.md quality rules. Overviews don't
change `lastUpdatedAt`.

### Education chronology (`education`)

Playbook: `TASKS/audit_education_chronology.md`, plus "Education-field consistency sweep". Cap:
20 entries, in this order: a year without its institution; out-of-order years; no education
fields (prefer medical-center profiles). Add only explicit facts, never inferred years.
Professional degrees go in `otherDegrees`.

### Honors and lead triage (`honors`)

Playbooks: `TASKS/audit_facts_and_honors.md` and `TASKS/candidate_intake.md`. Cap: 15-20
unprocessed leads from `maintenance/openalex-leads.json` or `maintenance/hieuphay-leads.json`.
Leads already on the roster get honor and degree fixes in the batch PR. New eligible people get one
`New candidate:` Issue each. Ineligible leads are marked resolved in the lead file with the reason.

### Discover new faculty (`discover`)

Playbooks: `TASKS/discover_new_faculty.md` and `TASKS/candidate_intake.md`. Pick one field or
institution group that no `[scheduled:discover]` Issue has covered in the last 30 days. File at
most 10 `New candidate:` Issues, one per person. When that field's surname searches are already
done, search by common Vietnamese given-name tokens. Never edit `public/data.json` or open a PR.
Put the field and the queries used in the run summary and in a comment on the first Issue filed,
so the next run can avoid repeating them.

### Academic relationships (`relationships`)

Playbook: `TASKS/discover_academic_relationships.md`, exactly. Cap: one 20-member batch (the next
unprocessed batch in `maintenance/relationship-research.json`). Validate, then commit
`public/relationships.json` and the research file and push straight to `main` after
`git pull --rebase`, re-validating once if the push is rejected. No PR. Open an Issue only for a
protected direct-record conflict. Side findings still apply, most often new candidates found as
out-of-roster advisors or coauthors.

## Changing the setup

- **Behavior:** edit this file (and the playbooks), then commit. Routines pick it up on their next
  run.
- **Schedule, model, or on/off:** change the routine at <https://claude.ai/code/routines>, or ask
  Claude Code to use `RemoteTrigger update`, then update the Schedule table here to match. Routines
  can't be deleted through the API, only in the web UI.
- **New routine:** add a section and a table row here. Its prompt should be the same pointer the
  others use:
  `You are the scheduled VietProfs agent for routine key "<key>" (github.com/dynaroars/vietprofs).
  Read docs/AUTOMATION.md and follow "Conventions for every scheduled run", "Side findings", and
  the section for <key>. ...`

## Troubleshooting

- **What did a run do?** Use `RemoteTrigger list_runs` for the routine, then `get_run_log` for a
  session. Or open the session link in the commit's `Claude-Session:` trailer.
- **Lots of "unverified" items or `EGRESS_BLOCKED` errors:** check that the Default environment's
  network access is still **Full**. With the original **Trusted** level, most university, `.gov`,
  Scholar, and LinkedIn pages were blocked. Some sites (notably LinkedIn) block bots even with
  Full access; in that case, blocked items stay open rather than being guessed.
- **Duplicate-id failures after a merge:** see `TASKS/AUDIT_ISSUES_PRS.md` Step 1 (test on fresh
  `main`; remint only the new entries' ids).
- **Controller not doing anything:** run `./scripts/maintain-roster.ts status` in the maintenance
  clone with `VIETPROFS_MAINTENANCE_STATE_DIR=~/.local/state/vietprofs-maintenance/cron-state`, and
  check `cron.log`. A 365-day staleness window means an idle week is normal.
