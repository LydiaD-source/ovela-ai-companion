# Card-first SEO review — 17 October 2026

## Live Search Console evidence
Connection: wellnespirt. Selected verified property: sc-domain:ovelainteractive.com (sole match).
- Homepage: Submitted and indexed, both canonicals https://www.ovelainteractive.com/; last crawl 11 October 2026.
- /es/contact: Submitted and indexed, matching self-canonicals; last crawl 29 July 2026.
- /digital-cards: URL unknown to Google. Not evidence of blocking; the old sitemap omitted it.
- /ca/videos: Duplicate, Google chose different canonical than user. Google's stored crawl is 5 July 2026; its chosen page is an individual video. The existing static SEO mechanism consolidates untranslated video libraries to /videos. Live deployment and a future crawl must be checked before declaring the Google finding resolved.
- www sitemap and video sitemap: zero warnings and errors. Ignore the deprecated indexed count. An old apex sitemap submission also exists; no destructive changes made.

## Follow-up — 24 October 2026
- /digital-cards: now Submitted and indexed, matching self-canonicals; last crawl 20 October 2026. Earlier "URL unknown" resolved.
- /solutions: now Submitted and indexed, matching self-canonicals; last crawl 22 October 2026.
- Homepage: still indexed, canonicals match; last crawl 22 October 2026.
- Sitemap: 345 URLs submitted, zero errors/warnings, last downloaded by Google 21 October 2026 (fresh version with card/Solutions entries).
- /ca/videos: still "Duplicate, Google chose different canonical than user", but Google's stored crawl is 5 July 2026 — before the prerender canonical fix went live. No source action remains; needs a recrawl (request indexing in the Search Console UI; the API cannot).
- Traffic, last 28 days: homepage 19 clicks / 289 impressions (avg position 5.4); /about 2 clicks / 91 impressions. All other pages have impressions but zero clicks. Biggest CTR opportunities: /videos/category/studio-overview (69 impressions, position 5), /contact (63 impressions, position 15), /ecosystem (50 impressions, position 7), /fr/topics/ai-receptionist (34 impressions, position 21). /digital-cards has begun appearing (3 impressions, position ~4.7).

## Source corrections
- Card-first homepage metadata, shared localized copy, card and Solutions entries in the existing sitemap.
- Static localized HTML now includes English pages, including card/Solutions, with one canonical and visible initial text.
- Strip inherited canonical/hreflang tags before route-specific prerendering; do not emit hidden offscreen SEO text.
- Remove non-page-specific build-date lastmod entries; preserve www canonical domain and existing crawler rules.
- The updated sitemap contains 345 unique URLs. Consent-gated card enquiry/comparison and Solutions interactions remain available for measurement.

## Pending outside this source update
Publish through the site's actual hosting workflow, verify live HTML on www.ovelainteractive.com, then submit the changed sitemap once to the verified property. Request indexing for /digital-cards in Google's Search Console UI; the URL Inspection API cannot request indexing or perform a live test. Google decides when to crawl and index, so no indexing or traffic guarantee is implied.
SEO-tab host mismatch findings remain unmodified: they are stale and conflict with the confirmed www canonical domain. The unrelated AI receptionist content suggestion was not implemented.
