# Profile-finding brief 3 (2026-11-17)

You get a list of researchers (from OpenAlex: name, last known employer, city, topics). For EACH
person, find the page that proves their current role:

1. Prefer their own page on the employer's site (staff profile, people page, author page, bio).
2. Otherwise their personal site or CV stating the current employer and title.
3. Never use LinkedIn, Scholar, ORCID, ResearchGate, DBLP, news, or PDFs of papers as the page.

For each person report what the page says. Do not judge eligibility; the auditor does that. If you
cannot find a page, say so and move on: every person in the list needs an answer. Use web search
and open the pages; do not guess URLs from patterns.

Do not create or edit any file (read pages to stdout only), run state-changing git commands, open
GitHub Issues/PRs, log in anywhere, fetch LinkedIn, or evade bot checks.

Your FINAL reply must be ONLY this JSON (no prose, no code fence):
{"results": [
  {"name": "<as given>", "found": true,
   "profileUrl": "<page you opened>", "pageName": "<name as shown on the page>",
   "title": "<exact current title quoted from the page>", "employer": "<as shown>",
   "department": "<team/division if shown>", "city": "<if the page or a CV states it>",
   "phd": "<institution and year if shown>", "vietnameseSignal": "<Vietnamese education, Vietnamese-language page, etc., if seen>",
   "otherUrls": ["personal site / Scholar if seen"], "note": "<e.g. page says former, postdoc, intern>"},
  {"name": "<as given>", "found": false, "note": "<what you tried>"}
]}
