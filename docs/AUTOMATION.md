# Automated maintenance setup

This file describes how VietProfs is maintained by scheduled agents: what runs, when, where,
and how the pieces hand work to each other. It is the source of truth for routine behavior. Each
cloud routine's prompt is a short pointer to its section below, so behavior is changed by editing
this file, not the routine.

Policy (eligibility, evidence, routing of Issues/PRs/direct pushes) lives in `AGENTS.md`,
`ROSTER_MAINTENANCE.md`, and `TASKS/`. This file only covers scheduling and the handoffs.

## How it fits together

```
 producers (Sonnet, overnight)           auditor (Opus, nightly)             owner
 ─────────────────────────────           ──────────────────────────          ─────
 task PRs  "[scheduled:<task>] ..."  ──►  re-verify live, test on main,
                                          CI green → squash-merge
 finding Issues (side discoveries)   ──►  verify → fix PR → close
 new-candidate Issues                ──►  re-dedup → verify → "ready for  ──►  adds entry from a
                                          owner" comment, leave open          local session
 owner-review Issues                 ──►  comment findings, leave open   ──►  only items the
                                                                              auditor leaves open
```

- **Producers** do one playbook each, in small capped batches. They never merge or push to `main`,
  except the relationships routine (see `AGENTS.md`). The auditor merges PRs and lands its own
  verified Issue fixes through one fix PR per run. New roster entries are the exception: the
  owner adds them (see "New-candidate Issues" under the auditor section).
- While researching, producers also report **side findings**: errors or leads outside their own
  task, filed as Issues (see "Side findings" below). This is how a narrow task like the LinkedIn
  backfill turns up stale ranks, duplicates, missing honors, and new candidates.
- **The auditor** is a separate model and a separate session. It runs every night and only takes items at least
  12 hours old, so each producer run is reviewed by a different agent at the next night's audit.
  Its rules are in `TASKS/AUDIT_ISSUES_PRS.md` ("Independent review").
- **The owner** only sees what the auditor leaves open: verified new candidates ready to add,
  conflicts with a protected name, honor, or portrait, ambiguous identities or eligibility, and
  anything it couldn't verify from the cloud.

## Schedule

Cloud routines live at <https://claude.ai/code/routines> (environment: Default, network access **Full** since 2026-09-24; edit it from the environment button above the claude.ai/code message box → gear icon). Cron is UTC; ET
is shown for convenience (EDT; add an hour in winter).

Each routine attaches only the `Claude_Docs` connector. Don't add `Claude_Code_Remote`: with it,
a run that opens a PR schedules hourly "Re-check PR" reminders until the PR is merged.

Ordering rule: the auditor runs nightly at 03:00 UTC and every producer starts between 05:00
and 06:30 UTC. So an audit never runs while that day's producers are still working, and
everything a producer creates is at least ~19 hours old at the next night's audit, past the
auditor's 12-hour minimum. Producers run Mon–Sat, so every producer run is audited the following
night; Sunday has no producers, so the Sun audit takes Saturday's output, overflow past the
nightly caps, and the automation-health check. Frequencies (changed 2026-09-27): discovery,
relationships, and links twice a week; the rest weekly. Portraits stays weekly
because its pending queue (71 new entries on 2026-09-27) would run dry within weeks at twice that.
Keep new routines inside those windows.

| Key | Routine id | Model | Cron (UTC) | ET | Section |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `audit` | `trig_01GeWQmgtoeJtaf7E2LsA7BA` | Opus 5.5 | `0 3 * * *` | Daily 11 PM (previous day) | [Auditor](#auditor-audit) |
| `discover` | `trig_01R9AeywUniWNP3iK8XDw9ju` | Sonnet 5 | `30 5 * * 1,4` | Mon/Thu 1:30 AM | [Discovery](#discover-new-faculty-discover) |
| `relationships` | `trig_01EgwQ418znNbFQ95ghg4p5E` | Sonnet 5 | `30 6 * * 1,4` | Mon/Thu 2:30 AM | [Relationships](#academic-relationships-relationships) |
| `links` | `trig_0162DEq1aGRH3vWrEtpKoNmy` | Sonnet 5 | `0 5 * * 3,6` | Wed/Sat 1 AM | [Links](#links-links) |
| `portraits` | `trig_01D58Azgkh8kdKFBdFNAXox2` | Sonnet 5 | `0 5 * * 4` | Thu 1 AM | [Portraits](#portraits-portraits) |
| `honors` | `trig_012eH5rSZwQw7PXiQPSRj9Wn` | Sonnet 5 | `30 6 * * 5` | Fri 2:30 AM | [Honors & leads](#honors-and-lead-triage-honors) |

One-time: `review` (`trig_017xbcfAPtZwntWrPBW8W5A6`, Opus 5.5) runs once on 2026-10-26 at 14:00 UTC
(10 AM ET), after every routine above has run at least four times. It changes nothing and files one
`[scheduled:review] Automation setup review (2026-10-26)` Issue with per-routine results and
recommendations for the owner. Until then, leave the setup as it is unless something is broken or the owner asks for a change.

Outside the cloud:

| What | Where | When | Notes |
| :-- | :-- | :-- | :-- |
| Link-health report | GitHub Action `.github/workflows/link-health.yml` | 1st of month, 08:00 UTC; manual via `gh workflow run link-health.yml` | Opens or comments on the "Link-health report (automated)" Issue. No model involved. |
| Automation watchdog | GitHub Action `.github/workflows/automation-watchdog.yml` | Mon and Thu 12:00 UTC; manual via `gh workflow run automation-watchdog.yml` | Opens or comments on one "Automation watchdog (automated)" Issue when a PR has been open more than 5 days (auditor stopped or PR stuck) or nothing `[scheduled:*]` appeared in 4 days (routines stopped); closes it when checks pass. No model involved. |
| Branch cleanup | GitHub Action `.github/workflows/delete-pr-branches.yml` | Whenever a PR is merged or closed; sweep Mondays 13:00 UTC; manual via `gh workflow run delete-pr-branches.yml` | Deletes a PR's branch once all its PRs are closed, because cloud agents can't delete branches. Keeps `main`, branches with an open PR, and branches that never had a PR. No model involved. |

Retired routines (deleted; no longer at claude.ai/code/routines). The routines above replace them:

- `linkedin` (Wed/Sat), `scholar` (Wed), and `websites` (Tue/Fri) → `links` on 2026-09-27, which
  reuses the `linkedin` routine id. Three routines each reading the same pages for one field
  tripled the writers on `public/data.json`. `scholar` (`trig_01KLRvszaFCY869VkchMmiAE`) and
  `websites` (`trig_01RKg7at1hAC3cY8NHVN8VBU`) are disabled; delete them in the web UI.
- `overviews` (`trig_01NUyNrE7x8WZgLMHbpCU7Zi`, Tue) → retired 2026-09-27 with the research-overview
  ("About") field, which was the main source of invented or mismatched text. Disabled; delete it in
  the web UI.
- `education` (`trig_011kuvE1P6aHNn7fcw9XVnLS`, Sat) → retired 2026-09-27 when the degree years,
  majors, and other degrees it mostly maintained were removed. Disabled; delete it in the web UI.
- `vietprofs-linkedin-url-backfill` (every 2h) → `linkedin`, later `links`. Same task; its side-findings behavior now applies to all producers.
- `vietprofs-link-health-sweep` (Mon) → link-health Action + `links` + `audit`. Running `check-links` inside the cloud sandbox is useless: on 2026-09-21, 4,794 of 5,501 URLs returned egress-proxy 403s. Its prompt also allowed deleting fields or entries over "dead" links. Link detection now runs on GitHub runners with real internet access.

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
   Issue. Protected `directFields` values (name, Vietnamese name, honors, portrait) are never edited; a
   conflict goes in an Issue. Appointment facts and links are never protected.
5. **Timestamps.** Never set `lastUpdatedAt` by hand; `npm test` stamps changed entries in
   `public/updates.json`. Commit that file with `public/data.json`.
6. **Unverifiable means untouched.** If the egress proxy blocks a source, don't accept the fact,
   and don't delete an existing value because of the block. List those entries in the PR/Issue so
   a later run retries them.
7. **Side findings.** Report them as described below.
8. **Summary.** End with entries processed, changes made, PR/Issue links, side findings filed,
   entries skipped with reasons, and any egress blocks.
9. **No follow-ups.** Once your PR/Issues are open, stop. Don't schedule check-ins, reminders,
   wakeups, or re-armed routines to watch CI or the PR; the auditor handles review. If CI fails,
   note it in the PR and leave it for the auditor.
10. **Every close gets a comment.** Never close a PR or Issue, or merge a PR, without a comment
   saying what was found and what was done: the change and its source, or the reason for
   rejecting it. A `Closes #n` line or a commit message alone doesn't count.

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
| Dead or wrong `profileUrl`, `websiteUrl`, `scholarUrl`, `linkedinUrl`, or portrait | `Likely wrong <field>: <name> (<vp-id>)` |
| Two roster entries are the same person | `Duplicate roster entry: <name> (<vp-id>) duplicates <vp-id>` |
| An honor that plausibly meets the honors bar is missing | `Possible new honor: <name> (<vp-id>) — <honor>` |
| Degree fact wrong or missing | `Review incorrect <field>: <name> (<vp-id>)` |
| An eligible person not on the roster (coauthor, lab member, colleague) | `New candidate: <name> — <rank>, <institution>` (follow `TASKS/candidate_intake.md` steps 1-4; if `npm run find-roster-matches` hits them at another institution, file `Review stale institution:` for that id instead) |

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
  CI. Squash-merge and delete the branch, with a comment saying what was re-verified (for example,
  "Re-verified vp-0123 and vp-0456 live on <date>; CI green; merged."), or request changes (or
  close) with a comment naming each rejected entry and why. Never merge a partial subset silently.
- New-candidate Issues: re-run the dedup (`npm run find-roster-matches` with the name and every
  identity URL in the Issue) against current `public/data.json`. If it hits the same person
  (often at a former institution), update that entry in place and close the Issue with its id; a
  retired-id hit gets its original id back. Otherwise re-verify eligibility live and hand it to the
  owner: comment `## Audit <date>: verified, ready for owner` with the evidence and a ready-to-paste
  entry (no `id`), and leave the Issue open. Don't add the entry or run `assign-profile-ids`: the
  cloud permission check denies adding a new person to `public/data.json` ("Modify Shared
  Resources"), even on an `audit-fix` branch with written authorization in the prompt (2026-09-29
  run). The owner adds it from a local session, which assigns the id and closes the Issue. A
  moved-person or retired-id hit is an edit, not a new entry, so it still goes in the fix PR.
- Side-finding and other correction Issues: verify live. If confirmed, fix, validate, and put it
  in the run's fix PR with what changed and the source. If the evidence is wrong, close with the
  reason. Duplicates: keep the older (lower) id, even if the newer entry is richer or has protected
  fields; move the verified current facts and unique sourced fields onto it, delete the newer
  entry, and run `npm run retire-profile-id -- <newer> --into <older> --reason "..." --apply`,
  which also rewrites every maintenance-file reference (`ROSTER_MAINTENANCE.md` "One person,
  one ID").
- Needs an owner decision (protected `directFields` conflict, ambiguous identity or eligibility,
  unverifiable from the cloud): comment with findings and a recommendation, and leave it open.
- Tracking Issues such as the link-health report: work up to 10 entries, post a progress comment,
  and leave it open.
- The auditor doesn't file side findings about its own items; it resolves them.
- `[scheduled:review]` Issues are for the owner: leave them open and don't act on them.
- Applying fixes: the auditor never edits `main` directly. It makes all of a run's verified Issue
  fixes on one branch, `audit-fix/<YYYY-MM-DD>`, with one commit per Issue
  (`Closes #n` in each message), runs `npm test`, `npm run build`, and `git diff --check`, pushes
  the branch, opens one PR titled `[scheduled:audit] Verified Issue fixes (<date>)` that lists each
  Issue and its evidence, with one `Closes #n` line per Issue (a comma list only closes the first), and squash-merges it once CI is green, then comments on each Issue with
  the change. This is the one PR the auditor merges itself: the Issues were filed by other agents or
  the owner, so the review is still independent, and the PR adds a CI gate and a record. Why not
  push to `main`: the cloud session's permission check blocks large unreviewed rewrites of
  `public/data.json` headed for `main` ("Modify Shared Resources"), even with written authorization
  in the prompt. The 2026-09-25, 09-26, and 09-27 runs had every such edit denied and left the fixes
  as Issue comments, while edits to existing entries on a branch and PR merges were allowed.
  Adding a new entry is denied even on the branch (see "New-candidate Issues"). If the fix PR's CI is
  red, leave it open with a comment; the next run fixes or closes it.
- Automation health (Sunday runs only, after the normal work). Check:
  1. PRs open more than 3 days, and why (red CI, conflict, rejected but still open).
  2. Open PRs touching the same maintenance file: merge the first as usual, then rebase the rest
     onto `main`, regenerate the shared file, and re-test before merging.
  3. Each routine in the Schedule table: no `[scheduled:<key>]` PR, Issue, or commit (for
     `relationships`, a `data(relationships)` commit on `main`) within two of its cron cycles means
     it has likely stopped.
  4. Issues left open for an owner decision for more than 14 days.

  Items 1-4 catch routines that stopped. Items 5-7 catch routines that run and report success
  but accomplish nothing, which the watchdog and the run status can't see:

  5. Verified work never applied: open Issues where an earlier audit comment says a verified fix
     couldn't be applied (permission denied, push rejected, tool failure). Apply it now within the
     caps; if it fails again, report the exact error. That is an automation failure, not an owner
     decision. New candidates marked "ready for owner" are not failures; list any older than 7
     days so the owner can add them.
  6. Empty runs: a producer whose last two runs changed no roster data (PRs touching only
     `maintenance/` files, "no new candidates found", or nothing filed). Say the likely reason:
     queue exhausted, source blocked, or the playbook re-selecting entries already tried.
  7. Queues running dry: a producer whose remaining work runs out within about 4 weeks at its
     cap. Check `npx tsx scripts/fetch-portraits.ts --status` (pending portraits), pending leads
     in `maintenance/hieuphay-leads.json`, and roster ids not yet in a completed batch in
     `maintenance/relationship-research.json`.
     Recommend a lower frequency or a new source.

  Item 8 catches data problems that pass every test:

  8. Duplicates: run `npm run find-roster-matches -- --roster` and file (or resolve, within the
     caps) a `Duplicate roster entry:` Issue for each new likely pair. Also check that the roster
     size only changed by entries added or retired on purpose since the last Sunday audit.

  Fix what you can within the normal caps. Report the rest in one open Issue titled
  `[scheduled:audit] Automation health`: update it with a comment when something is wrong, and
  close it with a "checks clean on <date>" comment when a check comes back clean. Never open a second one. When everything is healthy
  and no such Issue is open, do nothing.

### Links (`links`)

Playbooks: "Periodic full-roster refresh" steps 1-4 in `ROSTER_MAINTENANCE.md`, plus
`TASKS/verify_websites_and_labs.md`, `TASKS/check_google_scholar.md`, `TASKS/backfill_linkedin.md`,
and "Periodic link-health sweep". Cap: 2 batches of 15 entries. Handle entries from the open
link-health report Issue first, then continue in id order after the highest id in the last
`[scheduled:links]` PR, wrapping at the end of the roster. That rotation reaches every entry, not
only ones missing a link, so each person is re-checked about every six months.

For each entry, open the official profile, homepage, and Scholar once and settle everything they
show:
- **Appointment:** confirm `university`, `department`, `rank`, and `track` against the official
  profile, and fix what changed (a promotion, a new department, a move). A move follows
  `ROSTER_MAINTENANCE.md` "One person, one ID": update the entry in place. Someone who is gone or no
  longer eligible (left academia, retired without an emeritus title, now a postdoc or visiting)
  isn't removed by this routine; file a `Review stale institution:` or `Review possible eligibility
  issue:` side finding with the evidence.
- **Links:** check the stored `profileUrl` and `websiteUrl`, and fill a missing Scholar or LinkedIn
  only on a strict identity match (never name alone; `npm test` rejects a Scholar or LinkedIn URL
  shared by two entries). LinkedIn blocks fetches; verify it from the search index as described in
  `TASKS/backfill_linkedin.md` "Verifying without fetching LinkedIn". For a dead link, search the
  name and university fresh before calling it unfixable.
- **Honors and degrees** noticed on those pages go in side findings, not this PR.

In the PR body, list each entry with what was checked and what changed, including entries checked
with no change, so the rotation is visible.

### Portraits (`portraits`)

Playbook: `TASKS/fetch_portraits.md` section 4, exactly. Cap: 2 batches of 10, newest roster
entries first (`--next=10`; the script queues new entries automatically). Old unresolved entries
are retried only once every new entry has been attempted. Run
`pip install pillow numpy` if the analyzer needs it. Open every added image with the Read tool and
look at it. In the PR body, give each portrait's id, its source page, and one line on why it was
accepted. Never replace a portrait protected by `directFields`.

### Honors and lead triage (`honors`)

Playbooks: `TASKS/audit_facts_and_honors.md` and `TASKS/candidate_intake.md`. Cap: 15-20
unprocessed leads from `maintenance/hieuphay-leads.json`.
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

- **Fixes posted on Issues but never applied:** check the run log (`get_run_log`) for
  `permission_denied`. See "Applying fixes" in the auditor section: fixes must go through the
  `audit-fix/<date>` PR, not a direct edit of `main`.
- **PR branches piling up:** agents can't delete branches (the cloud git proxy returns 403). The
  branch-cleanup Action does it; check its runs with `gh run list -w delete-pr-branches.yml`.

- **What did a run do?** Use `RemoteTrigger list_runs` for the routine, then `get_run_log` for a
  session. Or open the session link in the commit's `Claude-Session:` trailer.
- **Lots of "unverified" items or `EGRESS_BLOCKED` errors:** check that the Default environment's
  network access is still **Full**. With the original **Trusted** level, most university, `.gov`,
  Scholar, and LinkedIn pages were blocked. Some sites (notably LinkedIn) block bots even with
  Full access; in that case, blocked items stay open rather than being guessed.
- **Duplicate-id failures after a merge:** see `TASKS/AUDIT_ISSUES_PRS.md` Step 1 (test on fresh
  `main`; remint only the new entries' ids).
