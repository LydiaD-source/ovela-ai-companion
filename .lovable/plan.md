# Ovela: Card-first website reorganisation

## Direction and confirmed choices

Refocus the existing website, not rebuild it from scratch. Digital Cards become Ovela’s primary commercial product. Digital Employees and tools demonstrate its wider business capabilities. IIPE is independent Ovela-developed IP, with its own website and sales.

- **Get Your Digital Card:** opens the existing Basic/Pro comparison; choosing a plan then opens Isabella’s enquiry.
- **Keep prices:** Basic €2/month or €24/year; Pro €3/month or €36/year, per person. Existing allowances and team-arranged delivery stay unchanged.
- **Other solutions:** one compact homepage introduction, without demo tools in the homepage flow.
- **IIPE:** link to https://iipe.exchange/ as a partner and independent platform developed by Ovela.

## 1. Premium card-first homepage

Keep Ovela’s logo, dark premium identity, gold accents and typography. Replace the large Isabella composition with a crisp, realistic phone frame showing the actual supplied Ovela card screenshot. No generated interface text, imaginary analytics or unrelated stock imagery. Keep the screen readable, motion restrained and the opening unframed, with a glimpse of the next section.

Use the second document’s starting copy:
- Eyebrow: **OVELA INTERACTIVE**; make **Ovela Digital Cards** prominent in the first screen as well.
- Headline: **Make Every Business Connection Go Further.**
- Supporting text: **Your business card should do more than share your details. Create a digital business card that stays current as your business evolves.**
- Two actions only: **Get Your Digital Card** and **Explore Solutions**.

### Short homepage sequence
1. Card-first opening and phone visual.
2. Product demonstration: sharing, keeping details current and staying connected, using actual screenshots and three concise benefits.
3. Compact Basic/Pro comparison, with full details on the existing card page.
4. Short use-case row: professionals, consultants, sales teams and networking—not another long section.
5. One compact **More from Ovela** introduction linking to Solutions.
6. Brief, distinct **IIPE — developed by Ovela** introduction linking out.
7. Clean footer without another repeated sales pitch.

## 2. What moves or is reduced

Create one **Solutions** page rather than scattering existing material across many new pages.

| Current material | Proposed destination |
| --- | --- |
| Digital Employee portraits, information and carousel | Solutions: Digital Employees; preserve images and useful interactions, adapting presentation to this destination |
| Reception cost and missed-call tools | Solutions: Business Tools |
| Nutrition, recovery/resilience and other assessments, sample reports | Solutions: Specialist Applications, retaining limitations and disclaimers |
| Detailed business showcases and industry examples | Solutions, linking to existing project/industry pages |
| Long company introduction | About; retain only a concise company signal on Home |
| Repeated employee sales messaging and generic closing pitches | Remove from Home; retain useful material on Solutions or existing pages |
| Videos and topics | Keep existing pages and discoverable links; do not delete search-relevant content |

**Recommendation:** remove the long showcase/tool sequence and repeated “website as a team” pitches from Home completely. Do not delete functioning tools, assets or established pages. Saved tool links must still launch the same experience.

## 3. Smaller Isabella, same abilities

Use IIPE’s compact avatar presentation as a reference: a small circular portrait at the lower right, closed by default. Opening it reveals Isabella’s existing conversation with minimise/close controls. On mobile, retain the full-screen conversation treatment.

Preserve text, voice, animation, languages, attachments, assessments, reports, card enquiries, contact capture and conversation continuity. Keep one Isabella session across main-site navigation, not a second simplified chat.

- Existing card-plan, tool and chat links still open the right conversation immediately.
- Normal page visits do not automatically open chat or activate microphone/voice activity.
- Keep the avatar clear of cookie controls, navigation and important actions.
- Leave `/welcome` and `/welcome/qr` standalone without the global launcher.
- Reuse Ovela’s working chat/streaming experience; IIPE is a visual reference, not replacement chat logic.

## 4. Navigation and Digital Cards page

Simplify navigation to **Digital Cards · Solutions · IIPE · About**, plus a prominent **Get Your Digital Card** action. Keep Contact, Projects, Videos, Topics and legal pages discoverable through Solutions/About/footer. Ensure the full mobile menu is visible.

Retain `/digital-cards`, its real screenshots, pricing and paper-to-digital benefits. Improve scanning and add a short factual FAQ covering sharing, monthly changes, Basic versus Pro and what happens after an enquiry.

No instant-purchase or checkout claims: Isabella collects the request; the team agrees delivery details. Continue distinguishing Pro Smart Updates, push notices and analytics from functionality demonstrated by the screenshots. Do not claim planned delivery is already working.

## 5. Visibility and traffic

**Verified discovery gap:** `/digital-cards` has browser-updated SEO information but is missing from the inspected sitemap and pre-rendered page coverage. Correct this during the refocus.

- Give Home, Digital Cards and Solutions distinct search-relevant titles/descriptions, readable headings and strong internal links.
- Include Digital Cards and Solutions in sitemap/pre-rendered coverage, preserving the canonical www domain. Maintain consistent language handling; translate maintained public copy and metadata together rather than adding misleading language alternates.
- Preserve established video/topic/industry URLs and their discovery value. Keep existing structured-data restrictions; no new Product/Offer schemas.
- Measure card-page visits, plan comparisons, selected-plan enquiry clicks, Solutions visits and IIPE clicks using existing consent-aware analytics. A click is not a completed enquiry.
- Keep screenshots lightweight, avoid loading the full gallery at the opening and defer chat work until needed without breaking continuity.

**After publication:** submit the updated sitemap and request card-page indexing in Search Console, then review search impressions and enquiry clicks. Organisation and SEO improve discovery opportunities but cannot guarantee traffic. Targeted card use-case articles or campaigns are a sensible later phase, not part of this redesign.

## Technical approach

- Reuse React/Vite, design tokens, the locale system, pricing configuration and hosted asset helper. No new CMS or service.
- Separate homepage copy, destinations and visual references from layout through the existing translation/configuration pattern.
- Extract Home’s existing Isabella launch/stream coordination into one shared main-site host, retaining the current chat UI and launch contracts. Leave backend, persona and CRM rules unchanged.
- Reuse current homepage sections on `/solutions` and localized equivalents. Preserve localized prefixes and compatibility for old homepage hashes and tool deep links.
- Update architecture rules for the new Solutions destination and shared Isabella placement.

## Implementation order and acceptance checks

1. Establish the shared Isabella host; verify existing launch paths before removing the old hero placement.
2. Build Solutions from existing material, then refocus Home and navigation.
3. Refine card comparison, search discovery coverage and relevant analytics.
4. Check desktop, tablet and mobile: readable product screens, no overlap/overflow, complete menus, cookie controls and reduced-motion behaviour.
5. Exercise Home → comparison → Basic/Pro enquiry → Isabella response, plus direct-email and team-follow-up paths. Do not claim inbox delivery from configuration alone.
6. Check voice/animated portrait, attachments, language choice, representative tool/report flows and continuity across navigation. Run existing pricing/policy tests and add focused tests for changed launch rules.
7. Check titles, canonicals, sitemap output, important existing URLs and preview errors. Publish only when explicitly requested.

**Not included:** payment/account flows, price changes, backend changes, rebuilding IIPE, deleting tools, or an invented product demo/video. Existing screenshots are sufficient for the phone visual.
