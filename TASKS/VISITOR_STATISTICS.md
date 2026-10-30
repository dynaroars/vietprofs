# Visitor statistics: data sources and operations

The public statistics page uses Cloudflare Web Analytics (RUM) browser-beacon data. It does not use raw edge-request analytics as a proxy for people.

## Historical implementation (retained only for context)

Before the browser series, `src/worker.ts` queried the zone-scoped `httpRequestsAdaptiveGroups` dataset with `requestSource: "eyeball"`:

- **Requests** counted all matching HTTP requests to the hostname.
- **HTML page views** counted successful (HTTP 2xx/3xx) HTML requests.
- **Visits** used the HTTP dataset's `sum.visits`; it was not a browser-confirmed visitor count.
- **Browser-like traffic** divided successful JavaScript and CSS requests by HTML requests.
- **Estimated real visits/day** multiplied average HTTP-dataset visits by that asset-request percentage.
- **Countries** and **most requested pages** were grouped from successful HTML edge requests.

Those values included crawlers and other automated clients. The old KV archive remains under `hostname-daily-v2` for private operational diagnosis, but it is no longer read by or shown on the public page.

## Public browser metrics

The Worker queries the account-scoped `rumPageloadEventsAdaptiveGroups` GraphQL dataset with Cloudflare's `bot: 0` filter, for the hostname that requested `/api/stats`.

One Worker serves every site in the `roars.dev` zone that is listed in `SITES` in `src/worker.ts`: currently `vietprofs.roars.dev` and `cspicks.roars.dev`, each with its own route in `wrangler.jsonc`. Each site has its own page categories and KV keys; an unknown hostname falls back to VietProfs. The page rendering (`src/traffic-view.ts`) and its styles (`src/stats-components.css`) are shared: cspicks keeps verbatim copies, so copy any change to those two files into `../cspicks/src/` as well.

- **Suspected automated traffic is excluded.** Starting 2026-10-02 a headless mobile-Chrome crawl (about 2,000 page views a day, roughly 10 rotating Pixel/Galaxy/iPhone user agents, flat around the clock, every hit its own visit) passed Cloudflare's `bot: 0` filter because it runs the beacon. All three queries therefore keep mobile Chrome (`userAgentBrowser = ChromeMobile`) only when an external site is the referrer; other browsers are unaffected. This drops about 15% of the pre-October baseline (real direct mobile-Chrome visits), so counts are slightly conservative. Neither RUM nor the zone's HTTP analytics (no ASN on this plan) separate the crawl from those real visitors, so the counts are left conservative rather than estimated. Remove the filter (`SUSPECTED_AUTOMATION_FILTER` in `src/worker.ts`) if the crawl stops and you want the full counts back.
- **Suspected automated days are flagged automatically.** A crawler that runs the beacon passes `bot: 0`, and a hand-written filter only catches the one crawler it was written for. So `flagSuspectedDays` in `src/worker.ts` marks any day (complete or in progress) whose page views are at least 100, more than 2.5× the median of the complete days in the 30-day window, and at least 85% single-page visits. Ordinary days run about one visit per two page views; the October 2026 bursts (mobile Chrome from Oct 2, desktop Chrome from Singapore on Oct 15–19 and Oct 29) were near 1:1. Flagging needs at least seven complete days of baseline. Flagged days stay in the daily chart and table, marked, but are left out of every summary number and of the 7-day countries, page categories, and browser breakdowns. When the 7-day period contains a flagged day, countries and paths are fetched again with a second query (`BrowserTrafficKeptDays`) restricted to the remaining date ranges, and the breakdown query uses the same ranges. A real surge of visitors who each read one page would also be flagged; the day remains visible, and the median headline barely moves either way. Tune the `SUSPECT_*` constants if that happens.
- **Typical daily page views** is the median over the last seven complete, unflagged UTC days, so one unusual day cannot move it much. The response also keeps `avgPageViews` (sum divided by the same days). The current day is excluded; its in-progress count is shown in the card's detail line ("N today so far"), marked if it is already flagged.
- **Browser visits** (daily table only) is Cloudflare's RUM `sum.visits`: page loads that arrived from another site or directly, not from another page on the same site. It is not a count of people or unique visitors.
- **Countries reached** groups RUM page views by normalized country code for the last seven complete days.
- **Page categories** group normalized RUM paths for the same complete-day period. Query strings and fragments are ignored, `/` and `/index.html` are combined. Cloudflare's independently aggregated path and daily totals can differ slightly, so category shares use the path-grouped total and are labeled separately from the overall daily total.

Cloudflare Web Analytics does not retain URL query strings. Because the current Insights and Health views use `?view=...`, they cannot be separated from the main directory; the public page says so instead of inventing a split.

Dates are UTC. A successful query with no events after measurement began is zero traffic; dates before the browser series began are missing. Missing dates display as missing and are never included in averages.

## Privacy and beacon coverage

Cloudflare's automatic Web Analytics installation is enabled at the edge. Live RUM results were observed for `/`, `/index.html`, `/submit.html`, `/stats.html`, `/people/*.html`, and generated hub paths. A manual snippet is intentionally not also embedded because two beacons could double-count a page load.

VietProfs adds no cookies, fingerprinting, persistent visitor IDs, or IP storage. Browser measurements can undercount people who block JavaScript or the beacon.

## Storage and failure behavior

The scheduled Worker refresh stores the new browser series separately:

- `browser-rum-daily-v1`: browser daily rows
- `browser-rum-last-success-v1`: complete last successful public response

Those are VietProfs' keys. Other sites append `:<hostname>` (e.g. `browser-rum-daily-v1:cspicks.roars.dev`). The cron refreshes each site in turn, so one site's failure doesn't skip the others.

An API failure does not overwrite either key. The API serves the last successful snapshot with a visible stale-data notice; if no browser snapshot exists, it returns an unavailable response rather than zeros.

## Deployment and Cloudflare configuration

The GitHub Pages workflow builds and deploys the static page, but it does not deploy the Cloudflare Worker. After changing the Worker:

1. Confirm Web Analytics automatic installation remains enabled for every hostname in `SITES`, on all paths.
2. Give the Worker API token **Account Analytics: Read** for the configured account. Keep the token only in the Worker secret `CLOUDFLARE_API_TOKEN`.
3. Run `npx wrangler deploy` from an authorized environment.

The account/zone configuration is read from `wrangler.jsonc`; credentials must never be committed.

## One-time `vp-0706.html` diagnostic

For 2026-09-14 00:00 UTC through 2026-09-22 01:00 UTC, aggregate edge analytics showed 131 requests to `/people/vp-0706.html`: 122 (93.1%) identified as Bingbot, with 130 GETs, one HEAD, 129 HTTP 200 responses, one 304, and one 403. Requests were spread across hours and days rather than forming a single human browsing burst. Countries were United States (129) and France (2). Referrer grouping was not authorized by the available API plan/token. RUM recorded only three browser page views for that profile over the audited seven complete days. The anomaly was therefore repeated automated crawling, not evidence of unusual human interest.
