# Visitor statistics: data sources and operations

The public statistics page uses Cloudflare Web Analytics (RUM) browser-beacon data. It does not use raw edge-request analytics as a proxy for people.

## Historical implementation (retained only for context)

Before the browser series, `worker/index.ts` queried the zone-scoped `httpRequestsAdaptiveGroups` dataset with `requestSource: "eyeball"`:

- **Requests** counted all matching HTTP requests to the hostname.
- **HTML page views** counted successful (HTTP 2xx/3xx) HTML requests.
- **Visits** used the HTTP dataset's `sum.visits`; it was not a browser-confirmed visitor count.
- **Browser-like traffic** divided successful JavaScript and CSS requests by HTML requests.
- **Estimated real visits/day** multiplied average HTTP-dataset visits by that asset-request percentage.
- **Countries** and **most requested pages** were grouped from successful HTML edge requests.

Those values included crawlers and other automated clients. The old KV archive remains under `hostname-daily-v2` for private operational diagnosis, but it is no longer read by or shown on the public page.

## Public browser metrics

The Worker queries the account-scoped `rumPageloadEventsAdaptiveGroups` GraphQL dataset for `vietprofs.roars.dev`, with Cloudflare's `bot: 0` filter.

- **Browser page views today** is the RUM page-load count for the current UTC day and is marked in progress.
- **Average daily browser page views** is the sum over the last seven successfully collected, complete UTC days divided by the number of those days. The current day is excluded.
- **30-day browser page views** sums collected complete days in the available 30-day query window.
- **Browser visits** is Cloudflare's RUM `sum.visits`. It is an aggregate session-like measure, not exact people or unique visitors.
- **Countries reached** groups RUM page views by normalized country code for the last seven complete days.
- **Page categories** group normalized RUM paths for the same complete-day period. Query strings and fragments are ignored, `/` and `/index.html` are combined, and the category total must equal the daily total or the refresh fails safely.

Cloudflare Web Analytics does not retain URL query strings. Because the current Insights and Health views use `?view=...`, they cannot be separated from the main directory; the public page says so instead of inventing a split.

Dates are UTC. A successful query with no events after measurement began is zero traffic; dates before the browser series began are missing. Missing dates display as missing and are never included in averages.

## Privacy and beacon coverage

Cloudflare's automatic Web Analytics installation is enabled at the edge. Live RUM results were observed for `/`, `/index.html`, `/submit.html`, `/stats.html`, `/people/*.html`, and generated hub paths. A manual snippet is intentionally not also embedded because two beacons could double-count a page load.

VietProfs adds no cookies, fingerprinting, persistent visitor IDs, or IP storage. Browser measurements can undercount people who block JavaScript or the beacon.

## Storage and failure behavior

The scheduled Worker refresh stores the new browser series separately:

- `browser-rum-daily-v1`: browser daily rows
- `browser-rum-last-success-v1`: complete last successful public response

An API failure does not overwrite either key. The API serves the last successful snapshot with a visible stale-data notice; if no browser snapshot exists, it returns an unavailable response rather than zeros.

## Deployment and Cloudflare configuration

The GitHub Pages workflow builds and deploys the static page, but it does not deploy the Cloudflare Worker. After changing the Worker:

1. Confirm Web Analytics automatic installation remains enabled for `vietprofs.roars.dev` and all paths.
2. Give the Worker API token **Account Analytics: Read** for the configured account. Keep the token only in the Worker secret `CLOUDFLARE_API_TOKEN`.
3. Run `npx wrangler deploy` from an authorized environment.

The account/zone configuration is read from `wrangler.jsonc`; credentials must never be committed.

## One-time `vp-0706.html` diagnostic

For 2026-09-14 00:00 UTC through 2026-09-22 01:00 UTC, aggregate edge analytics showed 131 requests to `/people/vp-0706.html`: 122 (93.1%) identified as Bingbot, with 130 GETs, one HEAD, 129 HTTP 200 responses, one 304, and one 403. Requests were spread across hours and days rather than forming a single human browsing burst. Countries were United States (129) and France (2). Referrer grouping was not authorized by the available API plan/token. RUM recorded only three browser page views for that profile over the audited seven complete days. The anomaly was therefore repeated automated crawling, not evidence of unusual human interest.
