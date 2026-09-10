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
