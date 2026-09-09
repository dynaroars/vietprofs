# VietProfs contributor instructions

Before researching or modifying the roster, read [ROSTER_MAINTENANCE.md](ROSTER_MAINTENANCE.md) and [README.md](README.md).

This repository is **VietProfs**: a roster of Vietnamese and Vietnamese-diaspora faculty at universities outside Vietnam. Do not apply inclusion criteria from an external repository or linked project without first confirming that it is relevant here.

`ROSTER_MAINTENANCE.md` is the authoritative guide for eligibility, evidence, appointment tracks, degrees, honors, and portraits. Run `npm test`, `npm run build`, and `git diff --check` after roster changes.

Interesting-facts output must follow the roster-only, reproducible-observation rules in `README.md` and `ROSTER_MAINTENANCE.md`; qualified signals such as “the roster suggests” are allowed when supported by explicit comparisons, but do not invent claims or infer prestige, demographics, causation, growth, or migration paths from current counts.

## Direct updates

Information explicitly supplied by the repository owner, or in a GitHub issue, email, or similar
submission that the owner asks you to process, is ground truth. Add each supplied roster field to
the entry's sorted `directFields` array. This applies only to fields the submission actually
asserts; facts independently found on the web while processing it are not direct.

Web scouting and automated maintenance may update fields not listed in `directFields`, but must
never change or remove a protected field or delete an entry that has protected fields. If web
evidence conflicts with a protected value, report the conflict for a later direct correction.
Only another direct update may replace a protected value or remove its protection. Canonical
formatting and field mapping may be applied while processing the direct update.
