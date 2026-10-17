# Project architecture
- Keep the homepage solutions summary and dedicated Digital Card product page separate, with shared pricing and limits tested beside their configuration; this keeps the homepage concise and commercial rules consistent.
- Link Digital Cards to its dedicated product page; use the separate Solutions page for employee and tool discovery and preserve localized URL prefixes so navigation remains consistent.
- Digital Card pricing calls to action open a plan-specific Isabella enquiry via homepage deep links; reuse the existing CRM contact tool, never payment or card provisioning, so the team retains responsibility for agreements and delivery.
- Resolve Digital Card asset pointers through the shared hostedAssetUrl helper using the public Lovable hosting origin; embedded previews do not always forward CDN paths. Keep the Vite asset proxy for other relative asset references.
- Keep Digital Card enquiry launch configuration and concierge policy in focused modules; card enquiries use the local tool-enabled chat path and await CRM results so external chat settings cannot bypass the intake rules or falsely report submission success.
- Mount a single Isabella dock in the main site layout and launch existing chat via events or URL seeds; one orchestration owner preserves voice, attachments, assessment and enquiry behaviour across navigation.
- Share card-first page copy and route metadata with static prerendering; sitemap entries must match canonical policy and omit build-time lastmod values.
