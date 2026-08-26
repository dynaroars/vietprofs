# Periodic full-roster refresh — progress checklist

Total entries in `public/data.json`: 772. Batches are consecutive index ranges (0-based),
~38-39 people each. Check off a batch only after it has been verified per
ROSTER_MAINTENANCE.md §"Periodic full-roster refresh", committed, and pushed.

- [x] Batch 01: indices 0-38
- [x] Batch 02: indices 39-77
- [x] Batch 03: indices 78-116
- [x] Batch 04: indices 117-155
- [x] Batch 05: indices 156-194
- [ ] Batch 06: indices 195-233
- [ ] Batch 07: indices 234-272
- [ ] Batch 08: indices 273-311
- [ ] Batch 09: indices 312-350
- [ ] Batch 10: indices 351-389
- [ ] Batch 11: indices 390-428
- [ ] Batch 12: indices 429-467
- [ ] Batch 13: indices 468-506
- [ ] Batch 14: indices 507-545
- [ ] Batch 15: indices 546-584
- [ ] Batch 16: indices 585-623
- [ ] Batch 17: indices 624-662
- [ ] Batch 18: indices 663-701
- [ ] Batch 19: indices 702-740
- [ ] Batch 20: indices 741-771

## Notes / leads found while working (not yet added)

- Batch 05: index 176 (Viet Tuan Pham, Susquehanna) — current profileUrl uses an old CMS
  URL pattern; couldn't confirm liveness directly (403/no-fetch). Possible live alternates seen
  in search: https://www.susqu.edu/live/profiles/3271-viet-tuan-pham or
  https://www.susqu.edu/profiles/phamv/ — verify and swap in on a future pass.
- Batch 05: index 191 (Khanh Le, Queens College CUNY) — profileUrl is still his personal site
  (mykle85.com); official department profile confirmed live at
  https://www.qc.cuny.edu/academics/lcd/faculty/ but that's a list page, not a person-specific
  URL — find the exact profile URL and switch profileUrl to the official page, moving the
  personal site to websiteUrl.
- Batch 05: index 161 (Long Pham, TAMU-Corpus Christi) — rank corrected Professor→Associate
  Professor based on strong multi-source search corroboration (tamucc.edu directory content
  itself could not be fetched directly after repeated timeouts). Worth a direct-fetch
  re-confirmation later. Search also surfaced possible additional degrees (MS Accountancy 2023,
  MBA 2024) that were NOT added — too speculative from an aggregated search summary without
  primary-source confirmation.
