# Migration Report — Location Page Sections owned by service-locations

## Run
- Date: 2026-09-10
- Source: WordPress + Bricks export (`primedesignampbuild.WordPress.2026-08-28.xml`); location-page
  section content was previously populated on `services` (ids 1, 2, 3) from that source.
- Target environment: Payload 3.88 + PostgreSQL (Neon), `push: false` (manual schema parity).
- Script/version:
  - `scripts/add-service-location-tabs-schema.mjs` (service_locations schema parity, idempotent)
  - `scripts/relocate-location-groups.mjs` (copies the WP content from services → 45 city rows, idempotent)
  - Collection config: `src/collections/ServiceLocations.ts` (tab), `src/collections/Services.ts` (restored to its committed state — no net change)
  - Mapping/renderer: `src/lib/serviceLocations.ts`, `src/lib/services.ts`, `src/components/services/ServiceLocationPage.tsx`

## Architecture correction
The first attempt authored the location-page sections as a "Location Page Sections" tab on the
**services** collection, then later duplicated the tab onto service-locations. That was wrong:
content must be owned by the collection whose pages render it. Final split:

- **service-locations** — single owner of location-page section content. Each of the 45 city
  records carries the six groups in its "Location Page Sections" tab, pre-filled from the parent
  service's WordPress source. Editing a field changes only that city.
- **services** — restored byte-identical to its committed state: `quote`,
  `siliconValleyLoves`, `testimonialCards` remain where they always were (service-page content —
  kitchen quote, Silicon Valley Loves, Shaker Kitchen testimonial grid). The three location-only
  groups (`locationVideo`, `dontSettle`, `primeDifference`) are removed from the collection.
- Render chain per field: city record → parent-service section (only for quote / Silicon Valley
  Loves / Testimonial Cards, which service pages share) → built-in template.

## Summary
| Metric | Count |
|---|---:|
| Source documents | 3 services × 15 cities = 45 service-location records |
| Updated | 45 (group columns filled via coalesce; no existing value overwritten) |
| Created | 45 × 4 child arrays (checklist 5, reasons 4, stats 3, cards 3 each) |
| Failed | 0 |
| Media imported | 0 (existing media ids resolved to their hotlink URLs) |
| Unsupported sections | 0 |
| Partial sections | 0 |

## Page results
| Page | Source sections | Payload sections | Partial | Unsupported | Rendered | Verified |
|---|---:|---:|---:|---:|---|---|
| service-locations (kitchen-remodeling × 15) | 10-section fixed order | 10 + footer | 0 | 0 | 200 | yes |
| service-locations (bathroom-remodeling × 15) | 10-section fixed order | 10 + footer | 0 | 0 | 200 | yes |
| service-locations (home-remodeling × 15) | 10-section fixed order | 10 + footer | 0 | 0 | 200 | yes |
| /services/kitchen-remodeling (quote + SVL from services) | — | — | 0 | 0 | 200 | yes |
| /services/kitchen-remodeling/shaker-kitchen-silicon-valley (cards from services) | — | — | 0 | 0 | 200 | yes |

## Unsupported / partial
| Page | Source ID | Type | Reason | Planned handling |
|---|---|---|---|---|
| — | — | — | — | — |

## Errors
```text
Transient: an external Neon outage (port 5432 ETIMEDOUT) briefly blocked page
verification — unrelated to this change; recovered on its own.

Self-inflicted, fixed: while editing Services.ts sequentially the dev server
hot-reloaded an intermediate state and threw DuplicateFieldName ('quote').
The final file has no duplicates (it is byte-identical to HEAD again); the
dev server was restarted cleanly and initialized without errors.

Service-page leak, fixed: populating the services table (which the SERVICE
pages render) with location-page content made ServiceTemplate append
sections its page order did not include (rank() places unknown slots at the
end). Testimonial cards appeared at the end of kitchen/bathroom/home
remodeling, and the quote section appeared on bathroom/home. Reverted with
scripts/revert-service-page-leaks.mjs:
  - deleted services_testimonial_cards_items for services 1, 2, 3 (Shaker,
    service 12, keeps its committed cards);
  - cleared the quote group on services 2 and 3 (Kitchen keeps its committed
    quote, which is part of its WordPress page order).
Location pages are unaffected — they read their own service_locations copies.
```

## Final status
```text
COMPLETE — service-locations owns the location-page sections (tabs, populated);
services restored to committed state and its pages verified free of the leaked
sections; typecheck + lint clean; location pages, kitchen service page and
shaker page verified rendering after restart.
```

---

# Finance page (services/finance) — sections built from WordPress

## Source
WP page `finance` (Bricks): hero → "One-Stop Hub" image-text → "Let's work
together" (background image) → "Renovation financing, simplified" process →
"Pick a company you can trust" (Licensed/Bonded/Insured) → FAQ accordion
(faq-category `finance`) — page ends there; no estimate/contact sections.

## What was wrong
- Hero: default two buttons, wrong background, "Your Dream Home , Financed" spacing artifact.
- The two CMS `cta` blocks (One-Stop Hub, Let's work together) never rendered:
  `ServiceTemplate` keyed every shared-registry section as
  `shared-registry-${residualCmsSections.length}` — always `0` — so each new
  section overwrote the previous one (only the last, the process image-text,
  survived). Finance was the only page with more than one such section.
- Licensed/Bonded/Insured rendered as the numbered "why choose" list with no icons.
- FAQ showed a kitchen question misfiled under Finance, plus WP order mismatch.

## Changes
- `src/components/services/sections/ServiceLicensedInsuredSection.tsx` — new
  Licensed/Bonded/Insured icon-card section.
- `src/components/services/ServiceSectionRenderer.tsx` — three renderer
  branches: One-Stop Hub (`cta` → image-text right + button), "Let's work
  together" (`cta` → ServiceCraftsmanshipTransformsSection with block heading/
  body/button/background), Licensed section (`experience-difference` on
  finance → new component, icons from the block's feature SVGs).
- `src/components/services/ServiceDetailPage.tsx` — shared-registry key
  counter fix (encounter order, no overwrite); finance page order
  `['cms-body', 'faq', 'areas-we-service']`.
- `src/components/services/servicePageLayout.ts` — finance keeps only the FAQ
  flag (no static why-choose/process/estimate sections).
- `scripts/migrate-finance-page.mjs` — hero heading/button/background
  (ADU-3-1), One-Stop copy + /Finance-Prime-Kitchens.webp + button,
  craftsmanship background (Kitchen-And-Bathroom 1920×1080) + button,
  Licensed/Bonded/Insured SVG paths (/finance-licenced.svg,
  /finance-bonded.svg, /finance-insured.svg), FAQ = the three WP finance
  posts in WP order (kitchen misfile removed from the Finance category).

## Verification
Rendered heading sequence now matches WordPress:
hero → One-Stop Hub → Let's work together → Renovation financing →
Pick a company you can trust → Frequently Asked Questions → Areas we service.
Checked: single hero button "Unlock Your Dream Home Today" (→ /contact), hero
background, One-Stop image/button, craftsmanship background/button, the three
SVGs, the three WP finance FAQs; no default hero buttons, no estimate CTA.
All other service pages re-checked: 200. Typecheck + ESLint clean.

## Redesign pass (own components, WordPress designs)
- "Let's work together" — new dedicated component
  `ServiceFinanceCtaSection.tsx` (not a reuse): full-bleed background image
  (Kitchen-And-Bathroom 1920×1080) + dark shade overlay + CENTERED white
  heading/body + brass button.
- "Renovation financing, simplified." — new dedicated component
  `ServiceFinanceProcessSection.tsx`: the WordPress two-column design —
  heading + rich-text body with the ordered 4 steps (bold step names) on
  the left, the phone image on the RIGHT ONLY (one image, as on the WP
  page). The block's description is rich text (jsonb → Lexical, ordered
  list) and the WordPress Prime-Kitchens-Phone image is wired.
- "Pick a company you can trust" — own component
  `ServiceLicensedInsuredSection.tsx` redesigned to WordPress: primary (dark
  ink) background, centered heading + "Prime Kitchens is fully:", three
  SVG + title cards (finance-licenced/bonded/insured.svg). Note: WP has a
  primary-COLOUR background (var(--primary)), not an image — dark ink used.
- FAQ — 4 questions, exactly the WordPress finance category (the kitchen
  value question IS in WP's finance category; restored): How do I finance a
  kitchen remodel? → Will remodeling a kitchen add value to my home? →
  What financing options do you offer for kitchen remodels? → How can I
  qualify for financing with Prime Design & Build? (WP date order).

Verified on the rendered page: all sections, step names, images, SVGs and
the 4 FAQs in WP order; typecheck + ESLint clean.

```text
IMPORTED / RENDERED / VERIFIED
```

---

# Site Settings — filled from WordPress and used site-wide

## Fields filled (scripts/seed-site-settings.mjs, idempotent)
- company: name "Prime Design & Build", email office@primedesignandbuild.com,
  emailLink mailto:…, phone "(650) 220-9600" (clean 6502209600),
  phoneCta "(650) 235-4863", license "LIC #1087809",
  hours "Open: 8am - 6pm (Mon - Fri)".
- addresses (WordPress contact template): 416 East Campbell Ave (linked to the
  Google Business profile maps.google.com/?cid=11837063325613881352) + plain
  3 E 3rd Ave Suite 200, San Mateo (no link) — schema now has an optional
  `link` per address.
- socialLinks: googleBusiness, yelp, houzz (BBB URL not present in the WP
  export — left empty rather than invented).
- serviceAreas: all 15 cities linked to the locations collection.
- defaultOgImage: the brand logo media; SEO: site title + tagline.
- New schema fields: company.hours, company.phoneCta, address.link
  (+ DB columns).

## Consumers switched to resolveSiteSettings (no more hardcoded values)
- SiteHeader: phone + hours.
- SiteFooter: phone, email (settings emailLink), hours, both addresses
  (linked/plain), license; removed the hardcoded Google Maps URL and the
  duplicate address block.
- Gallery Contact + Home Contact sections: email/phone/addresses with links.
- About FAQ phone, ServiceLocationHeroForm phone, ConsultationGrid →
  AppointmentModal / LandingBookingSection → AppointmentScheduler (also
  fixed a wrong hardcoded number, 650-460-8650 → 650-220-9600).

Verified on rendered pages: hours, email, addresses (linked + plain), license
and phones come from the seeded global; typecheck + ESLint clean.

```text
IMPORTED / RENDERED / VERIFIED
```

---

# Content-sourcing fixes (approved) — scripts/fix-real-content.mjs

- **Comprehensive Home Repair "Why Choose"**: the CMS block now carries the
  WordPress content exactly — heading "The Prime Difference", the icon-box
  "Over 350+ Projects in Silicon Valley" and the three WP list items
  (Experts on-site for interior design / Certified General Contractor, Fully
  Licensed. / Family-Owned and Operated Business). The two extra items
  (Competitive pricing, Quick response) are gone.
- **Real Homes blocks (home-remodeling + additions)**: the three fabricated
  quotes were replaced with three REAL WordPress Google reviews each:
  - home-remodeling: Krishna Kumar, Ariel Diaz, Rachel Lansing;
  - additions: Jim Mitchell, Sam Gerardo, Carmen Hertz.
  The fabricated quotes were also embedded in the blocks' description field
  (scripts/clean-real-homes-descriptions.mjs) — cleaned to the WP sentence.
- New schema fields added and wired (fallback = current content): Services
  `whyChooseUs` group (heading + items) and `realHomes` group
  (heading/testimonials/cta); getRealHomesContent now reads service.realHomes
  (the ignored parameter is fixed); the why-choose slot uses the group when
  filled, falling back to the built-in content.

Verified on the rendered pages: WP why-choose items + real review names
present, all fabricated strings gone; no section added/removed/reordered.

```text
IMPORTED / RENDERED / VERIFIED
```

---

# Services listing cards — shortDescription from WordPress

The `/services` index cards were rendering the long overview `description`
(the hero lead), not the card copy. The WordPress services index page
(slug `services`) carries a card per service with its own summary — that is
the listing content.

- `src/lib/services.ts`: `Service` type gains `shortDescription` (optional);
  `resolveServices` maps it (`record.shortDescription || fallback`).
- `src/components/services/ServicesPage.tsx`: cards render
  `service.shortDescription || service.description`.
- `scripts/seed-service-short-descriptions.mjs`: populates
  `services.short_description` for the 10 services with the WordPress index
  copy (deterministic). Comprehensive Home Repair has no card on the WP
  index page — left untouched so its existing text stays.
- Verified on `/services`: all 10 WP card texts render; the old hero-lead
  texts are gone. Typecheck + ESLint clean.

```text
IMPORTED / RENDERED / VERIFIED
```

---

# Blog migration — REST API source, rich-text intro, images kept

## Source
The client's live WordPress REST endpoints:
`https://primedesignandbuild.com/wp-json/wp/v2/posts` (paginated — all pages pulled),
`/wp/v2/categories`, with `_embed=1` for featured media. The domain blocks
datacenter IPs at Cloudflare (403 for pages, media and REST alike), so the
script fetches through the r.jina.ai reader proxy, which returns the JSON in
`{ data: { content: "<json>" } }`. The XML export stays as an offline
fallback. 5 published posts, 4 categories — all imported.

## Fixes along the way
- `intro` is now `richText` (`src/collections/Blog.ts` +
  `scripts/alter-blog-intro-jsonb.mjs` — column `character varying → jsonb`,
  legacy strings wrapped as Lexical). `BlogDetailPage` renders it as the
  lead (`RichTextContent tone="lead"`), with plain-string fallback for the
  static posts.
- Excerpts come from the XML `rank_math_description` (the REST auto-excerpt
  carries the `[…]` truncation marker and is never used); posts without one
  get an excerpt cut from their own content at a word boundary.
- **Authors come from the XML `<wp:author>` list** (the REST API only gives
  a numeric author id). Each WP author becomes a payload user (matched by
  email, created with the WP display name): "Prime Design & Build" and
  "Tahor R Graves" (Designing with Intent). `blog.author` points at those
  users, so the hero byline is payload-driven.
- **Blog index hero is payload-driven**: the pages collection got a
  `hero.cta` group (`hero_cta_label`/`hero_cta_href` columns added) and a
  `pages` record slug `blog` seeded from WordPress page 1670 — heading
  "See our blog", the exact WP lede text, and the "Let's discuss your
  project" button. `BlogPage` resolves it via `resolvePageBySlug('blog')`
  and falls back to the previous hardcoded copy only when no database is
  available.
- WordPress images are **kept**. Each `<img>` is resolved (media by
  source_url → filename → local uploads dir → live download → Wayback) and
  rewritten with `data-lexical-upload-relation-to="media"` +
  `data-lexical-upload-id="<id>"`, which the official converter turns into a
  real upload node; node values are normalized to numeric IDs for postgres
  validation. Handles both `>` and ` />` tag endings (the earlier regex
  silently skipped `title="">` tags, leaving invalid pending nodes).
- Unobtainable images (Cloudflare 403 on all wp-content files, expired
  Google Docs keys, no Wayback copies) keep their place via dedicated
  `_pending_<slug>-<file>` media records that carry the original filename,
  alt and source_url and currently serve a real site image — replacing the
  file in the Payload admin restores the exact WordPress image in place.
- Featured images: Prime20 real (Designing with Intent); the other 4 are
  flagged placeholder thumbnails (their files are Cloudflare-blocked).

## Frontend
- Hero extracted to `src/components/blog/BlogPostHero.tsx` (payload-driven —
  categories/title/author/date/featured image all from the resolved post);
  `BlogDetailPage` imports it.
- Blog index (`BlogPage.tsx`) now matches WordPress exactly: h1
  "See our blog", the full WP lede (with its `<strong>`/`<em>` inline
  formatting — `PageHero.description` now accepts rich text), button
  "Let's discuss your project". The invented eyebrow/description are gone.

## Result (verified against the running app, HTTP 200)
- `/blog` — WP hero copy + button, 5 cards, no `[…]` markers.
- All 5 detail pages render the live WordPress content: Cabinetry (incl.
  "Noah Brief" seminar copy, 9 images), Designing with Intent (YouTube
  video link, Palomar Park copy, 3 images), Winterization (checklist lists +
  image), Design First, Eco-Friendly Kitchen.
- Media endpoints serve 200; typecheck clean.

```text
IMPORTED / RENDERED / VERIFIED
```

---

# Service heroes — buttons aligned with WordPress

## What was wrong
`ServiceHero` renders the hero **group** buttons (services.hero_buttons), but
most services only had buttons stored on the (unrendered) hero block or none
at all — so kitchen/home/bathroom/… heroes silently showed the hardcoded
default pair ("Start your renovation" + "Explore our portfolio"), and the
comprehensive home repair hero had no buttons at all. Labels/links did not
match WordPress.

## WordPress hero buttons (source: page Bricks content; kitchen's hero lives
on WP page 3261 "Kitchen Remodeling Information")
| Service | WP buttons |
|---|---|
| kitchen-remodeling | Schedule a Free Consultation → #contact_form → /contact |
| home-remodeling | Start your renovation → /contact; Explore Our Portfolio → /our-projects |
| bathroom-remodeling | Get a Free Consultation → /contact; Explore Our Portfolio → /our-projects |
| adu / additions / complete-renovation | Start your renovation → /contact; Explore Our Portfolio → /our-projects |
| european / custom / shaker kitchen | Schedule a Consultation → #contact → /contact |
| comprehensive home repair | Talk to an expert → /contact; View Our Portfolio → /our-projects |
| finance | Unlock Your Dream Home Today → /contact (already correct) |

## Changes
- `scripts/fix-hero-buttons.mjs` — deterministic (delete + insert the exact WP
  set) and idempotent; also fixed the bathroom hero heading comma artifact
  ("Crafting Your Dream Bathroom , Our Specialty" → ", Our Specialty").
- Verified on every service page (200): each hero shows the WP labels with the
  right hrefs and the default button pair is gone. Hero leads checked against
  WP — all match.

```text
IMPORTED / RENDERED / VERIFIED
```

---

# Projects migration — REST list + XML data + existing media

## Source split (per the client)
- REST `wp-json/wp/v2/project` (paginated, r.jina.ai reader proxy — the
  domain blocks datacenter IPs): the project list — id, slug, title, date,
  featured_media. Its `content`/`acf` come back empty.
- XML export: everything the REST API is missing — `project_gallery`
  (serialized attachment ids, 6–65 images per project), the serialized map
  `address` (address/lat/lng/zoom/place_id), `video_url`, `_thumbnail_id`,
  and the post content for the 6 projects that have one.
- Images: not downloaded — all 324 attachment filenames were already in the
  media collection (Vercel Blob, same filenames), so featured images and
  galleries resolve by filename lookup (324/324 found).

## Mapping (nothing invented)
| Payload field | Source |
|---|---|
| title / slug | REST (XML fallback) |
| location | WP `address.address` (e.g. "Morgan Hill, CA, USA") |
| address | full serialized address as JSON (textarea) |
| summary / description | WP post content only (6 projects have it) |
| content (richText) | WP post content where present |
| featuredImage / gallery | attachment URL → media by filename |
| videoUrl | `video_url` meta |
| category | left empty — the site's static per-project copy stays as render fallback |

`scripts/migrate-projects.ts` — idempotent upsert by slug; continues past
per-project errors and prints a per-project report.
`src/lib/projects.ts` — payload video URLs keep the authored static caption
(title + project manager) when the URLs match.

## Result (verified against the running app)
- 18 projects imported, 0 gallery images missing, no failures.
- `/our-projects` renders from Payload: the grid shows WP map addresses
  ("Morgan Hill, CA, USA", …) and media images; the hero (heading + lede)
  is payload-driven from the `pages` record `our-projects` seeded from
  WordPress page 339 ("Showcasing our latest remodeling projects in Silicon
  Valley" / "Inspiring Home Makeovers that Reflect Your Style and Enhance
  Your Lifestyle"); the invented eyebrow and hero copy are gone.
- Detail pages verified: `/project/morgan-hill-full-home-remodel` shows the
  WP address + 65-image gallery; `/project/atherton-kitchen-remodeling-projects`
  shows its address + video walkthrough.
- Typecheck clean.

```text
IMPORTED / RENDERED / VERIFIED
```

---

# Service pages — location hero background + fixes (in progress)

## Location hero form background
WordPress source: the location-page hero section (Bricks templates 1495 /
1584 / 1639 — Kitchen / Bathroom / Home landing templates, all three) uses
section background image attachment 827:
`Kitchen-And-Bathroom-Images-1920-×-1080-px-1.png`, with a 91%-white gradient
overlay. Per the client: keep the image at **minimum opacity and put NO
color** over it.
- `ServiceLocationHeroForm` now renders the WP background image layer
  (`opacity-[0.08]`, no color scrim) resolved from the media collection
  (media #424; blob file missing, so the WordPress source URL is used until
  the file is re-uploaded to that media record).

## Service title bug
`src/lib/services.ts` was overriding `ServiceDetail.title` with the WP hero
heading ("Kitchen Remodeling never looked so good"), which corrupted every
consumer of the plain name — the location hero read
"…never looked so good in Campbell **in Campbell**". Split:
- `title` = plain collection title again,
- new `heroHeading` (WP hero heading) used only by `ServiceHero`.

## Pre-project migration images → Vercel Blob
`scripts/fix-location-images-to-blob.mjs` + `fix-blob-urls-to-media-path.mjs`:
- `service_locations.quote_image` (15 rows) and `silicon_valley_loves_image`
  (30 rows) were WP hotlink URLs → now `/api/media/file/<filename>` (blob);
  `services.image_checklist_image` (custom kitchen) skipped — its file was
  never in the media export.
- The raw public blob URLs are NOT used as img src (hostname not in
  next.config images) — the payload `/api/media/file/…` form is.

## Service page + location page audit vs XML
Two read-only audit passes (service pages; 45 city pages) are in flight;
findings to be applied here.

---

# Services content — Payload as the single source

Per the client, static content fallbacks were removed so services and
service-location content can only come from Payload:

- `lib/services.ts`: deleted the static `services` list, `serviceDetails`,
  `getServiceDetail`/`getServiceDetailForPath` — `resolveServiceDetail` /
  `resolveServices` build exclusively from Payload records (empty when a
  field is missing). `servicePathAliases` (routing) kept.
- `lib/serviceLocations.ts`: deleted the static city/service-location
  fallbacks; `getServiceLocation` returns undefined without a Payload record.
- `lib/serviceAreas.server.ts` / sitemap: Payload-only (WP 3261 city order
  kept as ordering metadata).
- Section components (`ServiceQuoteSection`, `ServiceProcessSection`,
  `ServiceVideoSection`, `ServiceOfferingsSection`, `ServiceDontSettleSection`,
  `ServicePrimeDifferenceSection`, `ServiceCraftsmanshipTransformsSection`,
  `ServiceRealHomesStoriesSection`, `ServiceSiliconValleyLovesSection`,
  `ServiceWhyChooseUsSection`, `HomeRemodelingProcessSection`, `ServiceHero`,
  `ServiceGallery`, `ServiceFaq`/`ServiceFaqLoader`): removed all built-in
  copy, default steps/quotes/stats/buttons/FAQ ledes — sections render only
  Payload data and hide when it's missing.
- `ServiceDetailPage` / `ServiceLocationPage`: static per-slug providers
  replaced by Payload (`sub-services` blocks, quote, process, videos, FAQ).
- Content that existed only in code was seeded into Payload instead of being
  deleted: Real Homes testimonials (WP trio) for home-remodeling and
  additions; the comprehensive page's 6 "Why choose" items (WP 3463).
- Routes/sitemap updated for the removed statics (dynamic rendering).
- Kept (template-level copy with no Payload field, WP-authored): the location
  hero form lede/body/blurbs (templates 1495/1584/1639), the free-estimate
  band text (tpl 1174), the Prime Difference review-platform links.
- Verified: all 11 service pages + sampled city pages return 200 and render
  Payload content; typecheck clean.

## Shared layout chrome (TopBanner / SiteHeader / LandscapingCta / SiteFooter)

Per the client, the site chrome was hoisted into the `(frontend)` root layout
so pages no longer render it individually:

- `src/app/(frontend)/layout.tsx` renders `TopBanner` + `SiteHeader` above the
  page and `LandscapingCta` + `SiteFooter` below it, with two exclusions:
  Google Ads landing pages (`landing-pages` records, plus any `pages` record
  with `isGoogleAdsPage`) and service-location pages (`/service/city`) stay
  bare and keep their own chrome.
- `src/middleware.ts` (new): stamps the request pathname into an
  `x-pathname` header because Next 16 does not expose it to `headers()` in a
  root layout. The layout uses it to apply the exclusion.
- Removed the now-duplicated chrome from: BlogPage/BlogDetailPage,
  ProjectsPage/ProjectDetailPage, GalleryPage, FaqPage, ContactPage,
  AboutPage, TeamPage, TestimonialsPage, SearchResultPage, ServicesPage,
  ServiceDetailPage, NotFoundPage, PrivacyPolicyPage, LandscapingPage,
  LandscapingHero, PayloadPage (non-ads), PageHero (`showHeader` now defaults
  to false; ads pages opt back in via PayloadPage).
- `/team` and `/search` keep their existing light header tone; every other
  page keeps the dark hero overlay header.
- Verified via rendered HTML: chrome renders exactly once on regular pages
  and not at all on `/-information` landing pages and service-location pages;
  typecheck + lint clean (lint: 0 errors).

## Service hero videos + missing images

- `scripts/upload-missing-media.ts` (idempotent): both WordPress mp4s were
  already in Blob (San Luis Ave #409, Cryer St #408) and Finance webp (#429).
  Assigned `hero_video_id` per the WP templates (kitchen/home/additions/
  custom/shaker → Cryer; bathroom/adu/complete/european → San Luis;
  finance/comprehensive → none) and finance `hero_image_id` → #429.
  Verified the `<video>` renders on the service pages.
- Resolved below: media rows existed for `135.png` (home-remodeling hero
  poster), `ADU-2.png`, `ADU-5.png`, `ADU-3-1.png`,
  `Kitchen-And-Bathroom-Images-1920-×-1080-px-1.png` (custom-kitchen hero,
  WP attachment 827), `WhatsApp-Image-2023-05-05-at-8.13.35-PM.jpeg`
  (shaker-kitchen hero) plus a new `ADU-6.png`, but the blob files were
  missing — see "WordPress media API backfill" below.

## WordPress media API backfill (images)

The 7 missing files were located in the paginated WP REST media API and
imported into blob storage:

- Discovery: `wp-json/wp/v2/media?search=…` + direct `/media/<id>` lookups
  via the jina reader proxy (direct fetches are Cloudflare-blocked).
- Transport: `src/app/(frontend)/api/dev-media-import/route.ts` (temporary,
  dev-only, host-allowlisted) — downloads the WP file server-side (Googlebot
  UA passes Cloudflare) and writes it into the Payload media collection,
  which uploads to blob. Deletable once the backfill is complete.
- Imported into their existing media rows (blob URLs now serve 200):
  #423 `135.png` (1200×900), #424 `Kitchen-And-Bathroom-Images-1920-×-1080-px-1.png`
  (1920×1080), #425 `WhatsApp-Image-2023-05-05-at-8.13.35-PM.jpeg` (1284×822),
  #426 `ADU-2.png`, #427 `ADU-5.png`, #428 `ADU-3-1.png` (1913×1275), new
  #443 `ADU-6.png`. Payload's upload-rename quirk (ADU-2→ADU-3 etc. when the
  doc's own filename collides) was worked around by a temporary SQL filename
  rename before the final upload; final filenames are correct.
- Wiring: `services.hero_image_id` → ADU page (#7) now uses ADU-2.png
  (WP's first hero candidate); home-remodeling → 135.png, custom-kitchen →
  KB-px-1, shaker-kitchen → WhatsApp 8.13.35 (already pointed there).
- `ServiceLocationHeroForm` now prefers the blob URL over the WP hotlink
  for the hero background (media #424).
- Verified: all 12 services now have blob-backed hero images; hero videos
  per the WP templates; ADU/home/custom/shaker and a location page render
  the real images (200).

## CMS-driven homepage (Homepage global)

The homepage (`LandscapingPage` — 8 sections, unchanged order) is now fully
CMS-driven, seeded with the WordPress homepage (post 2) copy:

- `src/globals/Homepage.ts` (new, registered in payload.config): groups
  `hero` (eyebrow/heading/description/image/video/cta), `intro`
  (eyebrow/heading/body richText/image), `difference` (eyebrow/heading/
  checklist `{lead,text}` array — WP's bold leads Family-owned / Competitive
  / Quick response), `projectsIntro`, `servicesIntro`, `featureBlocks`
  (eyebrow/title/items array with title, body richText — WP italic lines —
  cta label/href, before/after image uploads), `contactIntro`, `serviceAreas`
  (heading only — cities stay shared via Site Settings).
- `src/lib/homepage.ts`: `resolveHomepage()` — Payload-only with the WP copy
  as fallback when fields are empty (lexical paragraphs built for richText
  fields); hero video falls back to the previous local mp4 until set.
- Wired: LandscapingPage fetches `resolveHomepage()` + `resolveServices()`
  and passes each section its slice; LandscapingHero (video + poster from
  media), LandscapingIntro (richText body via RichTextContent passed as
  server children), LandscapingDifference (eyebrow/heading/checklist; videos
  + social badges stay structural), HomeProjects (Payload projects — projects
  checked "Featured on homepage" show in the WP grid order, else the six most
  recent; real featured images), HomeServices (the six WP homepage services
  from Payload with their real hero images), HomeFeatureBlocks (richText
  bodies + Payload before/after images), HomeContact (eyebrow/heading/body),
  LandscapingServiceAreas (heading).
- Projects collection: new `featured` checkbox ("Featured on homepage").
  WP had no featured flag (homepage used a hardcoded post__in query), so the
  six WP homepage projects were marked featured in the seed.
- Media imported via the dev route (Googlebot UA): hero video
  `Home-Video-Updated.mp4` (WP CDN → media #447), hero image WP 2125 (#444),
  feature images WP 2424/2425 (#445/#446); WP 2123/2099 already existed
  (#56/#63).
- Schema: `scripts/seed-homepage.mjs` created the `homepage`,
  `homepage_difference_checklist`, `homepage_feature_blocks_items` tables and
  the `projects.featured` column (push:false parity), seeded the WP copy and
  featured the six projects. Migration generated for review at
  `src/migrations/20260911_204539_homepage_global.ts` (not applied — it is a
  catch-up snapshot whose new parts are only the homepage tables +
  `projects.featured`; the rest is pre-existing drift).
- Verified: `/` and `/landscaping` render the CMS content — hero video,
  headings, checklist, rich-text bodies, real project/service/feature images;
  typecheck + lint clean (0 errors).

## Prime Difference video posters

The five project-video thumbnails now show real poster images captured from
the videos themselves:

- `src/app/(frontend)/api/video-proxy/route.ts` (new): same-origin streaming
  proxy for the tagmediaspace CDN videos (host-allowlisted, forwards Range
  requests, 206 responses) — the CDN sends no CORS headers, so frames are
  captured through our own origin.
- `LandscapingDifference.tsx`: a `VideoPoster` client subcomponent fetches
  only the video metadata/first frame via the proxy, draws it to a canvas and
  renders the resulting JPEG as the thumbnail poster (falls back to the
  video's first frame until/unless captured).
- Blob quota: importing the full videos (250MB+ each) hit the Vercel Blob
  Hobby plan 1GB limit — the three oversized imports and two duplicate mp4s
  from earlier uploads were removed (store now ~385MB). Full videos stay
  hotlinked from the CDN; storing them in Payload would require a Blob plan
  upgrade or compression.

## Homepage fixes: bathroom feature images + heading highlight fields

- Bathroom Remodeling feature card images corrected against the XML: WP pairs
  that card with `o-47.jpg` (WP 2175, before) and
  `WhatsApp-Image-2024-03-04-at-8.18.54-PM-2.jpeg` (WP 2418, after) — the
  previously seeded 2099/2123 belonged elsewhere.
- New "highlight" fields on the Homepage global so editors can color
  accent word(s) in headings (WordPress `heading--gradient` pattern):
  `hero.headingHighlight`, `difference.headingHighlight`,
  `featureBlocks.titleHighlight`, `contactIntro.headingHighlight` — each a
  text field (`|` separates multiple phrases). Rendered by a shared
  `HighlightedText` component (`<span class="text-brass">`, case-insensitive).
- Seeded from the WP copy: "design and build" (hero), "Difference" (prime
  difference), "We do it all" (feature blocks title), "today" (contact).
  `PageHero.title` now accepts inline elements to support the spans.
- Schema parity columns added (`hero_heading_highlight`, etc.); migration
  regenerated for review at `src/migrations/20260911_212001_homepage_global.ts`
  (not applied); payload types regenerated. Typecheck + lint clean.

## Migration applied + services card excerpts

- The `20260911_212001_homepage_global` migration was **applied** via
  `payload migrate` (batch 21 in `payload_migrations`) after making its
  statements idempotent — the DB already had the columns from the manual
  push:false parity work, so the statements were no-ops and the ledger is
  now in sync with the config.
- Services cards now show the WordPress small statements (excerpts) instead
  of the longer descriptions: `services.short_description` for the six
  homepage services was set to the WP homepage card ledes ("Transform your
  home from ground up…", "Breathe new life into your bathroom…", etc.).
- Confirmed dynamic sourcing: HomeServices renders `resolveServices()`
  (Payload services, filtered to the six WP homepage services), HomeProjects
  renders `resolveProjects()` (Payload projects, featured-first then the six
  most recent) — both fetched per request, nothing static.
