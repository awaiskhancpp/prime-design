# Prime Design & Build — Redesign and Payload Migration Plan

## Purpose

This repository is rebuilding the Prime Design & Build WordPress website in Next.js and Payload CMS. The work must happen in two separate phases:

1. **Redesign and frontend verification** — reproduce the approved page structures and visual design using local, hardcoded source data.
2. **Content migration** — move the verified content and media into Payload, then replace local data reads with Payload queries.

Migration must not begin for a page until its redesign is approved. Existing visual design, URLs, content order, and reusable components must not be changed accidentally during migration.

## Current technical architecture

- Next.js App Router frontend.
- Payload CMS with PostgreSQL.
- `src/components/` contains reusable visual sections.
- `src/lib/` currently contains temporary local source data.
- `website.json` currently contains temporary site-wide settings, navigation, reviews, footer links, and service-area data.
- `src/collections/` contains the Payload collection definitions.
- `media/` contains locally available migrated media files.

The local data is intentional during the redesign phase. It is not proof that all content has already been migrated.

## Important rule about sections

A component file does **not** automatically attach itself to a service.

The connection has three parts:

```text
Service document
  └─ ordered contentBlocks[]
       └─ blockType: "process"
            └─ renderer maps "process" → ServiceProcessSection
```

Therefore, every section needs:

1. A reusable React component.
2. A Payload block definition, when the section contains editable content.
3. A renderer mapping for that block type.
4. An ordered entry in the relevant Service document.

Creating an empty file alone does none of these things. The empty files in `src/components/services/sections/` are planning placeholders only.

## Source page families

### Service root pages

- Kitchen Remodeling
- Bathroom Remodeling
- Home Remodeling
- ADU & Garage Conversions
- Room Additions
- Complete Renovation
- Comprehensive Home Repair & Installation Services

### Kitchen sub-pages

- European Kitchen
- Shaker Kitchen
- Custom Kitchen

### Service-location pages

There are 45 WordPress location pages:

- 15 Kitchen Remodeling locations
- 15 Bathroom Remodeling locations
- 15 Home Remodeling locations

These use the architecture:

```text
Service + Location + shared location template
```

The original location URLs must remain unchanged:

`/{serviceSlug}/{serviceSlug}-in-{citySlug}/`

## Reusable sections already present

These should be reused instead of recreated:

- `ServiceHero`
- `ServiceProcessSection`
- `ServiceVideoSection`
- `ServiceOfferingsSection`
- `ServiceGallery`
- `ServiceQuoteSection`
- `ServiceFaq`
- `ServiceAreasSection`
- `ServiceEstimateCta`
- `ProjectsReviews`
- `HomeContact`
- `LandscapingServiceAreas`
- `LandscapingCta`
- `SiteHeader`
- `SiteFooter`

The same component may be configured differently per service. A component should not be duplicated merely because its copy or image changes.

## Sections requiring service-specific planning

These are distinct source patterns and should not be silently substituted with unrelated sections:

- Real Homes, Real Stories
- Craftsmanship That Transforms
- Prime Difference / Why Choose Prime Design & Build
- Silicon Valley Loves Working With Us
- Home Repair service categories
- Home Repair “Why choose Prime Design & Build?” panel
- Client-Centered Approach to Home Remodeling

The placeholder files under `src/components/services/sections/` identify these planned section types. They contain no design or content yet.

## Service section matrix for redesign

### ADU

- Hero
- ADU overview, key features, benefits, and process
- Ready to schedule your free estimate
- Craftsmanship That Transforms
- Prime Difference / Why choose Prime Design & Build
- Reviews
- Contact form with video
- Service areas
- Global footer CTA and footer

### Additions

- Hero
- Additions overview, benefits, and process
- Real Homes, Real Stories
- Video
- Ready to schedule your free estimate
- Silicon Valley Loves Working With Us
- Prime Difference
- Reviews
- Contact form with video
- Service areas
- Global footer CTA and footer

### Complete Renovation

- Hero
- Complete renovation overview
- Ready to schedule your free estimate
- Client-Centered Approach to Home Remodeling
- Craftsmanship That Transforms
- Reviews
- Contact form with video
- Service areas
- Global footer CTA and footer

The copied “Home Additions” text visible on the source Complete Renovation page must be treated as a source-content issue and not automatically assumed to be the intended renovation copy.

### Home Remodeling

- Hero
- Real Homes, Real Stories
- Video
- Ready to schedule your free estimate
- Client-Centered Approach to Home Remodeling
- Gallery
- Craftsmanship That Transforms
- Service areas and location cards
- Silicon Valley Loves Working With Us
- Prime Difference
- FAQs
- Reviews
- Contact form
- Global footer CTA and footer

### Bathroom Remodeling

- Hero
- Six-step remodeling process
- Bathroom sub-services
- Gallery
- Craftsmanship That Transforms
- Silicon Valley Loves Working With Us
- Prime Difference
- FAQs
- Reviews
- Contact form
- Service areas
- Global footer CTA and footer

### Kitchen Remodeling

- Hero
- Video
- Kitchen sub-services
- We make it easy / six-step process
- Crafting Your Dream Home, Our Promise
- Service areas and location cards
- FAQs
- Gallery
- Reviews
- Contact form
- Global footer CTA and footer

### Home Repair

- Hero
- Repair and installation category sections
- Why choose Prime Design & Build panel
- Service areas
- Global footer CTA and footer

The Home Repair page should not inherit unrelated kitchen/bathroom sections simply because it uses the same service renderer.

## Payload model required

### Services

One document per service or service sub-page, with:

- `title`
- unique `slug`
- `shortDescription`
- `description`
- `hero.eyebrow`
- `hero.heading`
- `hero.lead`
- `hero.image` → Media relationship
- `contentBlocks[]` — ordered blocks, only when a section has service-specific editable content
- `faqs[]` → FAQ relationship
- `relatedServices[]` → Services relationship
- SEO fields

The block list must be flexible. Services do not all contain the same sections or the same order.

### Locations

One document per city:

- `name`
- unique `slug`
- optional featured image
- SEO fields where needed

### Service Locations

One document per service/city combination:

- unique page `title`
- unique page `slug` within the intended URL strategy
- `service` → Services relationship
- `location` → Locations relationship
- legacy `city` value only if required for source compatibility
- featured image → Media relationship
- city-specific overrides
- SEO fields

Multiple Service Location records must be able to reference the same Service and the same Location.

### Media

All featured images, galleries, section images, videos/posters, logos, review assets, and project media must be represented as Media records or explicit external media URLs.

Do not rely on a filename alone. Use Payload media relationships after import.

## Redesign phase workflow

1. Lock the route map and canonical URLs.
2. Inventory each source page’s sections in source order.
3. Identify which sections are shared and which are service-specific.
4. Reuse an existing component whenever the structure is the same.
5. Create a new component only for a genuinely different structure.
6. Build each service page with local hardcoded data.
7. Compare the page visually against the supplied source screenshot.
8. Verify mobile and desktop layouts.
9. Verify that no section appears on a service where it does not belong.
10. Approve the page before creating migration records.

## Migration phase workflow

1. Import or verify Media records.
2. Seed Services.
3. Seed Locations.
4. Seed Service Locations and relationships.
5. Seed FAQs and link them to services where applicable.
6. Populate ordered service content blocks.
7. Replace local data access with Payload queries.
8. Keep local fallback data only as an explicit development fallback.
9. Verify every canonical route and every legacy redirect.
10. Verify sitemap output, SEO metadata, media files, and missing-record behavior.

## Routing rules

Canonical service routes:

- `/services/{serviceSlug}`
- `/services/kitchen-remodeling/{subcategorySlug}`

Legacy service root routes redirect permanently:

- `/adu` → `/services/adu`
- `/additions` → `/services/additions`
- `/complete-renovation` → `/services/complete-renovation`
- `/kitchen-remodeling` → `/services/kitchen-remodeling`
- `/bathroom-remodeling` → `/services/bathroom-remodeling`
- `/home-remodeling` → `/services/home-remodeling`

Original service-location routes remain unchanged so search-engine URLs are preserved.

The sitemap must list canonical service routes and preserved service-location routes. Redirect-only legacy service roots must not be listed as canonical sitemap entries.

## Verification checklist before importing all data

- Every source service has a route.
- Every route renders the correct service section order.
- No section is attached merely because a component file exists.
- Service and location relationships resolve through Payload.
- Media relationships resolve to valid files.
- SEO overrides work.
- Missing Payload records do not silently hide broken queries.
- Legacy service URLs redirect correctly.
- Service-location URLs remain unchanged.
- TypeScript passes.
- Lint passes without new errors.
- Production build passes.
- Screenshots or browser checks confirm visual parity.

## Current status

- Service, Location, and Service Location collections exist.
- Service content-block migrations exist.
- Service-location seed and media migration tooling exists.
- Local service fallback data is still present for redesign work.
- The frontend is not ready for a blind full import until each service family is visually verified.
- The next correct task is service-page redesign and section mapping, followed by controlled migration—not importing all records first.
