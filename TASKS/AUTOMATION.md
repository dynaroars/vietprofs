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
 finding Issues (side discoveries)   ──►  verify → fix on main → close
 new-candidate Issues (single/batch) ──►  re-dedup → verify → add entry,  ──►  only if the add is
                                          close (else "ready for owner")      denied or unclear
 owner-review Issues                 ──►  comment findings, leave open   ──►  only items the
                                                                              auditor leaves open
```

- **Producers** do one playbook each, in small capped batches. They never merge or push to `main`,
  except the relationships routine (see `AGENTS.md`). The auditor merges PRs and lands its own
  verified Issue fixes on `main` (one `audit-fix` PR only if the push is denied). Verified new candidates are added by the
  auditor itself (see "New-candidate Issues" under the auditor section).
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
a run that opens a PR schedules hourly "Re-check PR" reminders until the PR is merged. Every
producer also lists `mcp__claude-code-remote__subscribe_pr_activity` and
`mcp__claude-code-remote__unsubscribe_pr_activity` in `disallowed_tools` (since 2026-11-07);
otherwise the session is auto-subscribed to its PR and wakes again when the auditor merges it.

Ordering rule: the auditor runs nightly at 03:00 UTC and only takes items at least 12 hours old,
so every producer must run between 04:00 and 15:00 UTC: after the audit finishes, and early enough
that its output is 12+ hours old at the next night's audit. Producers are spread across that window
(links 05:00, discover 08:00, portraits/honors 11:00, relationships 14:00) so no two writers of
`public/data.json` overlap: portraits and honors alternate days, and links finishes hours before
either. Producers run Mon–Sat, so every run is audited the following night; Sunday has no
producers, so the Sun audit takes Saturday's output, overflow past the nightly caps, and the
automation-health check. Frequencies (changed 2026-09-29; portraits cut to weekly 2026-10-29,
after the setup review in #475): discovery, relationships, and links Mon–Sat; portraits Wed;
honors Tue/Thu/Sat. Watch the portraits queue
(`node scripts/fetch-portraits.ts --status`). Keep new routines inside the 04:00–15:00 window.

The same usage limit is shared with CS Picks (`../cspicks/docs/AUTOMATION.md`, 16:00–02:00 UTC)
and the GMU CS directory (`../people/TASKS/AUTOMATION.md`), whose weekly producers use the Sunday
slots VietProfs leaves free (05:00, 08:00, 11:00, 14:00 UTC) and whose Opus audit runs Monday
10:30 UTC. Don't add VietProfs routines on Sunday daytime or Monday 09:00–12:00 without moving those.

| Key | Routine id | Model | Cron (UTC) | ET | Section |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `audit` | `trig_01GeWQmgtoeJtaf7E2LsA7BA` | Opus 5.5 | `0 3 * * *` | Daily 11 PM (previous day) | [Auditor](#auditor-audit) |
| `discover` | `trig_01R9AeywUniWNP3iK8XDw9ju` | Sonnet 5.5 | `0 8 * * 1-6` | Mon–Sat 4 AM | [Discovery](#discover-new-faculty-discover) |
| `relationships` | `trig_01EgwQ418znNbFQ95ghg4p5E` | Sonnet 5.5 | `0 14 * * 1-6` | Mon–Sat 10 AM | [Relationships](#academic-relationships-relationships) |
| `links` | `trig_0162DEq1aGRH3vWrEtpKoNmy` | Sonnet 5.5 | `0 5 * * 1-6` | Mon–Sat 1 AM | [Links](#links-links) |
| `portraits` | `trig_01D58Azgkh8kdKFBdFNAXox2` | Sonnet 5.5 | `0 11 * * 3` | Wed 7 AM | [Portraits](#portraits-portraits) |
| `honors` | `trig_012eH5rSZwQw7PXiQPSRj9Wn` | Sonnet 5.5 | `0 11 * * 2,4,6` | Tue/Thu/Sat 7 AM | [Honors & degrees](#honors-and-degrees-honors) |

One-time: `review` (`trig_017xbcfAPtZwntWrPBW8W5A6`, Opus 5.5) ran once on 2026-10-26 and filed the
`[scheduled:review] Automation setup review (2026-10-26)` Issue for the owner; the routine was
deleted on 2026-11-05.

Outside the cloud:

| What | Where | When | Notes |
| :-- | :-- | :-- | :-- |
| Link-health report | GitHub Action `.github/workflows/link-health.yml` | 1st of month, 08:00 UTC; manual via `gh workflow run link-health.yml` | Opens or comments on the "Link-health report (automated)" Issue. No model involved. |
| Automation watchdog | GitHub Action `.github/workflows/automation-watchdog.yml` | Mon and Thu 12:00 UTC; manual via `gh workflow run automation-watchdog.yml` | Opens or comments on one "Automation watchdog (automated)" Issue when a PR has been open more than 5 days (auditor stopped or PR stuck) or a producer has had no output of its own for about two cron cycles (discover, links, relationships 4 days; honors 6; portraits 15; keep these in step with the Schedule table); closes it when checks pass. No model involved. |
| Browser tests | GitHub Action `.github/workflows/browser-tests.yml` | On pushes and PRs to `main` that change code or pages; manual via `gh workflow run browser-tests.yml` | Runs `npm run test:e2e` (Playwright). Skipped when only roster, portrait, relationship, maintenance, paper, `TASKS/`, or Markdown files change, so data routines never wait on it; it does not gate the Pages deploy. A red run on a code PR means don't merge it yet. No model involved. |
| Branch cleanup | GitHub Action `.github/workflows/delete-pr-branches.yml` | Whenever a PR is merged or closed; sweep Mondays 13:00 UTC; manual via `gh workflow run delete-pr-branches.yml` | Deletes a PR's branch once all its PRs are closed, because cloud agents can't delete branches. Keeps `main`, branches with an open PR, and branches that never had a PR. No model involved. |

Retired routines (2026-09-27), replaced by the ones above:

- `scholar` (`trig_01KLRvszaFCY869VkchMmiAE`) and `websites` (`trig_01RKg7at1hAC3cY8NHVN8VBU`) were
  merged with `linkedin` into `links` (which reuses the `linkedin` id): three routines reading the
  same pages tripled the writers on `public/data.json`.
- `overviews` (`trig_01NUyNrE7x8WZgLMHbpCU7Zi`) and `education` (`trig_011kuvE1P6aHNn7fcw9XVnLS`)
  were retired with the fields they maintained (the "About" overview, degree years and majors).
- The link-health sweep became the link-health Action plus `links` and `audit`: `check-links` in
  the cloud sandbox is useless (4,794 of 5,501 URLs returned egress-proxy 403s on 2026-09-21).

`scholar`, `websites`, `overviews`, and `education` have been deleted (confirmed 2026-10-14).

## Conventions for every scheduled run

Every routine prompt says: "Read TASKS/AUTOMATION.md and follow the section for `<key>`." All of
them share these rules:

1. **Setup.** Read `AGENTS.md`, then this section and the playbook it names, then the
   `ROSTER_MAINTENANCE.md` sections the playbook cites. Run `npm ci` (not `npm install`). Work
   sequentially; don't spawn subagents. Use the GitHub MCP tools when `gh` is missing.
2. **Caps.** Stay within the section's batch cap, then stop. Before starting, list open PRs and
   Issues titled `[scheduled:<key>]` and skip entries they already touch. The cap is also the
   target: work through it unless a source is actually blocked or the queue is empty. A thin
   search result is not a reason to stop; move to the next slice, channel, or entry. Every step the
   section lists is part of a check (skipping Scholar, LinkedIn, or the portrait recheck leaves the
   entry unchecked). Runs through 2026-11-05 often ended after about 2 minutes with half the cap
   unused; the summary must say why if a run stops short of its cap.
   **There is no time, turn, or token budget for a run.** A full cap normally takes 20–40
   minutes; a run that finishes in under 10 minutes almost certainly skipped work. "Ran out of
   time" or "to keep the run short" is never a valid reason to stop (links on 2026-11-07 stopped
   at 16 of 30 entries after 135 seconds, citing time). The only valid reasons are a blocked
   source, an empty queue, or a failing `npm test`/`npm run build` you can't fix.
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
   wakeups, or re-armed routines to watch CI or the PR, and don't subscribe to PR activity (each
   event wakes the finished session again); the auditor handles review. If CI fails, note it in the
   PR and leave it for the auditor.
10. **Every close gets a comment.** Never close a PR or Issue, or merge a PR, without a comment
   saying what was found and what was done: the change and its source, or the reason for
   rejecting it. A `Closes #n` line or a commit message alone doesn't count.
11. **Small steps for data edits.** Write a roster edit as a script in the scratchpad and run it as
   its own command. Don't combine branch creation, the data edit, and the push in one command; the
   permission check may deny a bundled command (it did on 2026-10-20).

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
  session created. At most 5 PRs and 20 Issues per run.
- PRs: test merged onto fresh `main` (`npm test`, `npm run build`, `git diff --check`),
  re-verify every changed entry live, check `directFields` and the ledger rule, and require green
  CI. Squash-merge and delete the branch, with a comment saying what was re-verified (for example,
  "Re-verified vp-0123 and vp-0456 live on <date>; CI green; merged."), or request changes (or
  close) with a comment naming each rejected entry and why. Never merge a partial subset silently.
  Every night, when several open PRs touch the same file (usually `public/data.json` or a
  maintenance file), merge the oldest first, then rebase each remaining PR onto `main`,
  regenerate the shared file, and re-test before merging it.
- `[scheduled:links]` PRs: merge one whose only change is `maintenance/links-rotation.json`, as
  long as its per-entry table shows real checks (spot-check 3 "confirmed" rows live). If the
  table is missing or shows only URL status codes, close the PR and say why. The next run then
  repeats those ids.
- New-candidate Issues, both single (`New candidate:`) and batched (`[scheduled:discover] New
  faculty batch`): at most 25 candidates per run across all candidate Issues, oldest Issue first;
  a batch counts as one Issue toward the 20-Issue cap. For each candidate, re-run the dedup
  (`npm run find-roster-matches` with the name and every identity URL in the Issue) against current
  `public/data.json`. If it hits the same person (often at a former institution), update that entry
  in place; a retired-id hit gets its original id back. Otherwise re-verify eligibility live. Under
  the standing owner authorization in `AGENTS.md` ("New entries vs. edits"), the auditor adds a
  verified candidate itself: add the entry (no `id`) to `public/data.json`, add any needed
  `FIELD_OVERRIDES` in `src/data.ts`, run `npm run assign-profile-ids -- --apply`, and store the
  portrait if the verified official profile page shows a clear single-person headshot (validate with
  `identify`, convert to WebP in `public/portraits/`, set `portrait` and `portraitSource`;
  `TASKS/fetch_portraits.md`). Rejected candidates get a one-line reason. Comment on the Issue with
  a table of each candidate's outcome (`vp-####`, existing id updated, or rejection reason). Close a
  single-candidate Issue with its commit's `Closes #n`; close a batched Issue only when every
  candidate in it has an outcome, otherwise post the progress table and leave it open for the next
  night. If the permission check denies the add, comment `## Audit <date>: verified, ready for owner`
  with the verified entries (no `id`), leave the Issue open, and report the exact denial in the
  Sunday health Issue.
- Removals: when live evidence confirms that a person is gone or no longer eligible (left academia,
  now visiting or postdoc, deceased), the auditor retires the id in the run's fixes instead of leaving
  the Issue for the owner: delete the entry and its portrait, and add a row to
  `maintenance/retired-ids.json` (`replacedBy: null`, with the reason and source). The official page
  outranks a personal homepage, and a personal page that still says student or postdoc is not
  removal evidence on its own. An entry with protected `directFields` is never removed by
  automation; that conflict goes to the owner.
- Side-finding and other correction Issues: verify live. If confirmed, fix, validate, and put it
  in the run's fixes with what changed and the source. If the evidence is wrong, close with the
  reason. Duplicates: keep the older (lower) id, even if the newer entry is richer or has protected
  fields; move the verified current facts and unique sourced fields onto it, delete the newer
  entry, and run `npm run retire-profile-id -- <newer> --into <older> --reason "..." --apply`,
  which also rewrites every maintenance-file reference (`ROSTER_MAINTENANCE.md` "One person,
  one ID").
- Needs an owner decision (protected `directFields` conflict, ambiguous identity or eligibility,
  unverifiable from the cloud): comment with findings and a recommendation, and leave it open.
  After that, skip it on later runs unless someone commented or edited it since your last comment;
  re-checking with no new input only repeats the same comment (the Sunday health check still
  lists ones older than 14 days).
- Tracking Issues such as the link-health report: work up to 10 entries, post a progress comment,
  and leave it open while entries remain. When every entry is resolved (fixed, or re-checked live
  and confirmed healthy), close it with a comment listing the outcome of each entry. Entries that
  can't be checked from the cloud (blocked sites, bot challenges) don't hold it open: list them in
  the closing comment and file one Issue per entry that needs an owner decision, since the next
  monthly report will flag them again.
- The auditor doesn't file side findings about its own items; it resolves them.
- `[scheduled:review]` Issues are for the owner: leave them open and don't act on them.
- Applying fixes (changed 2026-11-05: `main` first): commit each verified Issue fix on fresh
  `main`, one commit per Issue (`Closes #n` in each message), run `npm test`, `npm run build`, and
  `git diff --check`, and push to `main`; comment on each Issue with the change. Pull and re-test
  before each push if `main` moved. Fallback: if the permission check denies the push to `main`
  (it did through October 2026: "Modify Shared Resources" on large `public/data.json` rewrites), put
  the run's remaining fixes on one `audit-fix/<YYYY-MM-DD>` branch, open one PR titled
  `[scheduled:audit] Verified Issue fixes (<date>)` with one `Closes #n` line per Issue (a comma list
  only closes the first), and squash-merge it once CI is green. Report which path the run used in its
  summary, and a denial in the Sunday health Issue. If the fallback PR's CI is red, leave it open with
  a comment; the next run fixes or closes it.
- Automation health (Sunday runs only, after the normal work). Check:
  1. PRs open more than 3 days, and why (red CI, conflict, rejected but still open).
  2. Open PRs that still conflict or fail after the nightly rebase (see PRs above): why.
  3. Each routine in the Schedule table: no `[scheduled:<key>]` PR, Issue, or commit (for
     `relationships`, a `data(relationships)` commit on `main`) within two of its cron cycles means
     it has likely stopped.
  4. Issues left open for an owner decision for more than 14 days.

  Items 1-4 catch routines that stopped. Items 5-7 catch routines that run and report success
  but accomplish nothing, which the watchdog and the run status can't see:

  5. Verified work never applied: open Issues where an earlier audit comment says a verified fix
     couldn't be applied (permission denied, push rejected, tool failure). Apply it now within the
     caps; if it fails again, report the exact error. That is an automation failure, not an owner
     decision. New candidates marked "ready for owner" mean the permission check denied the add;
     report the denial, and list any older than 7
     days so the owner can add them.
  6. Empty runs: a producer whose last two runs changed no roster data (PRs touching only
     `maintenance/` files, "no new candidates found", or nothing filed). Say the likely reason:
     queue exhausted, source blocked, or the playbook re-selecting entries already tried.
  7. Queues running dry: a producer whose remaining work runs out within about 4 weeks at its
     cap. Check `node scripts/fetch-portraits.ts --status` (pending portraits) and roster ids
     with no outcome under `people` in `maintenance/relationship-research.json`.
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
link-health report Issue first, then continue in id order from `nextId` in
`maintenance/links-rotation.json`, wrapping at the end of the roster. That rotation reaches every
entry, not only ones missing a link, so each person is re-checked about every six months.

**Every run opens a PR, even when no entry changed.** The PR sets `nextId` to the id after the
last entry it fully checked, `updatedAt` to today, and `lastPr` to the previous links PR number.
Without that PR the rotation doesn't advance and the next run repeats the same ids (this happened
2026-10-03 to 10-14: one PR in 12 days). An entry counts as checked only when every bullet below
was done for it. A URL-status pass (fetching links and reading HTTP codes) is not a check. If you
run short of time, stop the batch early and set `nextId` to the first entry you didn't finish; a
PR covering 8 entries properly beats one claiming 30. An entry whose official page is blocked
still counts once you've searched for an alternate official source; list it as blocked.

For each entry, open the official profile, homepage, and Scholar once and settle everything they
show:
- **Appointment:** confirm `university`, `department`, `rank`, and `track` against the official
  profile, and fix what changed (a promotion, a new department, a move). A move follows
  `ROSTER_MAINTENANCE.md` "One person, one ID": update the entry in place. Someone who is gone or no
  longer eligible (left academia, retired without an emeritus title, now a postdoc or visiting)
  isn't removed by this routine; file a `Review stale institution:` or `Review possible eligibility
  issue:` side finding with the evidence.
- **Website:** for batch entries with no `websiteUrl`, run
  `npm run harvest-websites -- --ids=<the batch's ids>`. It reads each official profile, keeps links
  labeled website/homepage/lab/group, follows redirects, and requires the destination to name the
  person. Store a HIGH candidate after opening it (a lab or personal site, not a clinic, a
  department, an institute, or a colleague's page); MEDIUM is a lead only. Candidates are written to
  `maintenance/website-candidates.json`; don't commit that file from a batch PR.
- **Links:** check the stored `profileUrl` and `websiteUrl`, and fill a missing Scholar or LinkedIn
  only on a strict identity match (never name alone; `npm test` rejects a Scholar or LinkedIn URL
  shared by two entries). LinkedIn blocks fetches; verify it from the search index as described in
  `TASKS/backfill_linkedin.md` "Verifying without fetching LinkedIn". For a dead link, search the
  name and university fresh before calling it unfixable.
- **Portrait:** open the stored portrait and compare it with the official page (see the portrait
  recheck in `ROSTER_MAINTENANCE.md` step 4). Run `python3 scripts/portrait_faces.py --roster` (install with
  `python3 -m pip install opencv-python-headless numpy && python3 -m pip install --force-reinstall --ignore-installed pillow`: the sandbox's system Pillow is broken and
  shadows a plain `pip install`, found 2026-11-01; it prints a verdict per portrait; `multiple` and `none` are almost always a group photo, logo, or
  building, but look at the image before removing) at the start and handle flagged entries before
  the id-order rotation. Replace or remove a wrong
  unprotected portrait in the PR; for a protected one file `Likely wrong portrait: <name> (<vp-id>)`.
- **Missing portrait:** for batch entries with no `portrait`, run
  `node scripts/fetch-portraits.ts --ids=<those ids> --apply` after the face-check setup above. It
  stores HIGH candidates that pass the size, aspect, and one-face checks; open each stored image and
  compare it with the official page before keeping it. For a MEDIUM (`needs_review`) candidate,
  look at it next to the page and store it with `--store=<id>` only if it is clearly that person.
  Commit `public/portraits/`, `public/data.json`, and the portrait ledger files with the batch, and
  give each new portrait a row note (source page, why accepted).
- **Honors and degrees** noticed on those pages go in side findings, not this PR.

In the PR body, put one table row per entry, including entries checked with no change, with these
columns: id, appointment (confirmed / changed / blocked), profile and website, Scholar, LinkedIn,
portrait, and the source URL used. The auditor rejects a links PR without that table, and one whose
rows show only URL status codes.

### Portraits (`portraits`)

Playbook: `TASKS/fetch_portraits.md` section 4, exactly. Order (changed 2026-11-05): up to 10
`needs_review` candidates from `--review` (section 4, "Review the MEDIUM candidates too"), then
batch 1, `--next=10` (newest roster entries never attempted; the script queues new entries
automatically), then batch 2, `--refused=10` (entries whose photo was found but refused by the old
0.70 aspect minimum or another size check; each leaves that set after one retry). Don't run
`--retry` on old unresolved entries: blind retries found nothing (#991 went 0 for 10), and the
`links` rotation now fills missing portraits from each entry's live official page. When `--next`
and `--refused` both come back empty, say so in the summary; the Sunday audit then recommends
retiring this routine or cutting it to monthly. Run
`npx playwright install chromium` (the script renders JavaScript-built profile pages and fetches
images that CDNs refuse to curl; without Chromium it skips that fallback) and
`python3 -m pip install opencv-python-headless numpy && python3 -m pip install --force-reinstall --ignore-installed pillow` first (the force-reinstall replaces the sandbox's broken system Pillow): `fetch-portraits.ts --apply` refuses to
run without OpenCV, because every candidate must pass the one-dominant-face check
(`scripts/portrait_faces.py`) before it is stored. Open every added image with the Read tool and
look at it. In the PR body, give each portrait's id, its source page, and one line on why it was
accepted. Never replace a portrait protected by `directFields`.

### Honors and degrees (`honors`)

Playbook: `TASKS/audit_facts_and_honors.md`. Cap: 20 roster entries, in id order after the highest
id in the last `[scheduled:honors]` PR, wrapping at the end of the roster, so every entry gets an
honors and degree pass about every seven months. If that PR lists entries as not checked, start the
batch with those, then continue after its range. List any entries you don't check in your own PR
the same way. Fixes to those entries go in the batch PR, with
every checked entry listed. New eligible people noticed along the way get one `New candidate:`
Issue each.

### Discover new faculty (`discover`)

Playbooks: `TASKS/discover_from_database.md` (database channels), `TASKS/discover_new_faculty.md`
(web/directory search), `TASKS/discover_industry_labs.md` (corporate, government, and policy
employers), and `TASKS/candidate_intake.md` (eligibility and enrichment).

1. **Channel by weekday (UTC):** Mon `grants` (NIH RePORTER + NSF PIs), Tue `coauthors`
   (Crossref/OpenAlex co-authors of rostered scholars), Wed `gaps` (feeder-vs-faculty gap report,
   then `./scripts/faculty-discovery-queries.ts` for the top uncovered gap university), Thu `labs`
   (alumni pages on rostered `websiteUrl`s), Fri web search: on odd ISO weeks per `discover_new_faculty.md` (one field
   or institution group; given-name tokens once that field's surname sweep is done), on even ISO
   weeks per `discover_industry_labs.md` (one employer group, filed as a `New industry batch`), Sat `logs`
   (out-of-roster leads in `maintenance/relationship-research.json`). Run
   `npm run discover-leads -- --mode=<channel> --limit=<n>` (never `--mode=all`). If the day's channel
   yields fewer than 5 promising leads, fall back to the next channel in the list.
2. **Skip covered ground:** read the `[scheduled:discover]` Issues of the last 30 days (open and
   closed) and skip leads, gap universities, seed labs, or fields they already list.
   `maintenance/discovery-leads.json` is gitignored, so the Issue body is the only record that
   survives between runs.
3. **Dedup and verify:** for each lead, `npm run find-roster-matches -- "<Name>" --url <url> ...`
   and `gh issue list --state all --search '"<Name>"'`. A roster hit is a move or promotion: file a
   side-finding Issue for that id instead. Otherwise verify eligibility live on the official page
   (`ROSTER_MAINTENANCE.md`) and enrich per `candidate_intake.md`.
4. **File one batched Issue per run:** at most 25 verified candidates, titled
   `[scheduled:discover] New faculty batch (<N> candidates): <channel and slice>`. Never pad the
   batch with unverified leads; a run with 3 verified candidates files 3. Body: a summary table, then
   one numbered section per candidate with a ready-to-paste JSON entry (no `id`), the dedup result,
   and the verification URLs. End with a "Coverage" section listing the channel, parameters, and
   every lead, university, lab, or query examined, including rejected leads and why.
5. **Boundaries:** never edit `public/data.json` or `public/industry.json`, assign an id, or open a PR. The only commit allowed
   is `maintenance/network-discovery.json` after a `labs` or `coauthors` run (pushed to `main` after
   `npm test`, `npm run build`, `git diff --check`).

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
  Read TASKS/AUTOMATION.md and follow "Conventions for every scheduled run", "Side findings", and
  the section for <key>. ...`

## Troubleshooting

- **Fixes posted on Issues but never applied:** check the run log (`get_run_log`) for
  `permission_denied`. See "Applying fixes" in the auditor section: a denied push to `main` must fall back
  to the `audit-fix/<date>` PR in the same run.
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
