# WordPress → Payload page comparison audit

Updated: 2026-09-02

## Evidence and limits

The original site was checked against the supplied WordPress export, the
provided full-page captures, indexed WordPress content, and the current local
renderers. Direct browser requests to the live site were blocked by
Cloudflare during this pass, so any item marked **UNVERIFIED** requires a fresh
frontend comparison when the original site is accessible.

This is a content/architecture audit, not a visual redesign approval.

## Required page families

| Family | Original URL pattern | Current Payload source | Current renderer |
|---|---|---|---|
| Core services | `/kitchen-remodeling/`, `/bathroom-remodeling/`, `/home-remodeling/` and related service URLs | `services` | `ServiceTemplate` through the service route |
| Service locations | `/kitchen-remodeling/kitchen-remodeling-in-saratoga/` and equivalent service/city URLs | `service-locations` + `services` + `locations` | `ServiceLocationPage` |
| Google Ads landing pages | `/*-information/` plus the long home-repair information URL | `landing-pages` | `LandingPageRenderer` |

## Core service comparison

| Page | Original sections in order | Current state | Finding |
|---|---|---|---|
| Kitchen Remodeling | Hero; estimate CTA; video; style/sub-service chooser; process; working-with-us/Prime Difference; service areas; FAQ; gallery; contact/footer | Hero and many sections are rendered, but the renderer combines CMS blocks with local slug configuration | **INCORRECT ARCHITECTURE:** order and presence are not exclusively CMS-driven. **VERIFY:** exact image/video assets and section order |
| Bathroom Remodeling | Hero; estimate CTA; six-step process; bathroom sub-services; gallery; craftsmanship/working-with-us; why choose; FAQ; service areas; reviews; contact/footer | Same shared renderer with slug-derived flags and fallback content | **INCORRECT:** local conditions can add/remove sections independently of CMS. **VERIFY:** original order and media |
| Home Remodeling | Hero; real homes/testimonials; video; estimate CTA; client-centered process; gallery; craftsmanship; service areas; why choose; FAQ; reviews; contact/footer | Same renderer; special process behavior is still configured by service slug | **INCORRECT:** service-specific behavior is not stored in the Service record |
| ADU | Hero; introductory ADU content; estimate CTA; craftsmanship; why choose; reviews; contact/footer | Shared renderer and local fallback | **EXISTING-BUT-UNUSED:** CMS `content`/structured location fields are not the source for this service layout. **VERIFY:** exact original content |
| Additions | Hero; additions content/features/benefits/process; real homes stories; video; estimate CTA; Prime Difference; why choose; reviews; contact/footer | Shared renderer with local additions configuration | **INCORRECT:** content is available in local data but not represented as a complete CMS section sequence |
| Complete Renovation | Hero; renovation content; client-centered process; craftsmanship; reviews; estimate/contact/footer | Shared renderer with a special local process branch | **INCORRECT:** special process is selected by slug rather than page data |
| Home Repair & Installation | Hero; six repair/installation category sections; why choose panel; service areas; footer CTA/footer | Dedicated category component is present | **EXISTING-BUT-PARTLY-UNUSED:** category copy/images remain local; not all category content is represented in Payload |
| Kitchen sub-services | Video hero; estimate CTA; page-specific intro/content; reviews; contact/footer | Routed through service detail renderer | **INCORRECT:** sub-service detection and contact variant rely on slug conditions |

## Service-location comparison

The original Saratoga location page establishes the location family: location
hero/form, intro/video, “Don’t Settle” content, related service cards, promise
quote, location reviews, Prime Difference, Silicon Valley Loves, contact, and
footer. Other service/city pages use the same family with different city copy,
media, SEO, and sometimes available sub-services.

Current implementation now has the correct relationships and an override
array, but the following remains:

- **FIXED / PARTLY INCORRECT:** `ServiceLocationPage` still calls local
  content generators for several sections instead of reading the inherited
  service section data.
- **IMPLEMENTED:** `heroHeading`, `heroDescription`, `featuredImage`, `intro`,
  SEO, and `sectionOverrides` are available and section enable/disable plus
  basic heading/body/image overrides are consumed.
- **MISSING:** an override for arbitrary structured section content (lists,
  process steps, cards, and gallery items).
- **MISSING:** explicit CMS section order for the location page; the current
  location override model controls visibility and selected content but does
  not yet store a complete ordered merged section list.
- **VERIFY:** all 45 location records against the original images and unique
  Rank Math descriptions.

## Google Ads landing-page comparison

The seven `-information` pages are not standard Services. Indexed WordPress
content confirms the landing-page family includes conversion-focused hero and
CTA content, service-specific information, FAQs, testimonials/reviews,
service areas, and footer/contact content. For example, the additions page
contains Home Additions, features, service cards, benefits, Prime Difference,
Why Choose, FAQs, testimonials, and conversion CTA sections. See the original
[Additions information page](https://primedesignandbuild.com/additions-remodeling-information/)
and [home-repair information page](https://primedesignandbuild.com/comprehensive-home-repair-installation-services-in-silicon-valley/).

Current state:

- **IMPLEMENTED:** independent `LandingPages` collection and
  `LandingPageRenderer`.
- **IMPLEMENTED:** landing pages now use fixed Payload admin tabs instead of
  an open-ended blocks picker. The shared tabs are Estimate CTA, Intro,
  Sub-services, Prime Difference, Video, Project Gallery, Reflection Gallery,
  Why Choose Us, Service Areas, FAQs, Testimonials, Consultation Booking, and
  Contact Form. Each tab has its own visibility flag and the optional
  `sectionOrder` field controls the final sequence without service-slug logic.
- **IMPLEMENTED:** the Video tab accepts either an external video URL or a
  media-library upload, plus an optional poster image.
- **MISSING:** full WordPress section content for all seven records. The local
  fallback is title/SEO-level placeholder data with empty sections.
- **MISSING:** full WordPress section content for all seven records. The tabs
  are now the storage model, but the source copy/media still needs to be
  entered from the WXR/visual captures before import.
- **VERIFY:** no-index and campaign tracking values page-by-page.

## Existing-but-unused or duplicated implementations

1. `ServiceLocations.content` is stored as rich text but is not rendered by
   `ServiceLocationPage`.
2. The service `contentBlocks` collection field is supported by a renderer,
   but the page also appends a separate hardcoded sequence.
3. `Services.sectionOrder` is now consumed by `ServiceTemplate`; records with
   this field control the final section order. Records without it still use
   the temporary legacy fallback order until their CMS data is populated.
4. Local maps in `ServiceDetailPage.tsx`, `ServiceGallery.tsx`, and related
   section helpers still contain service-slug decisions. They are fallback
   data, not an acceptable final source of truth.
5. Landing pages and Services now share block definitions, but the landing
   renderer must still support all block types or reject unsupported data
   visibly instead of dropping it.

## Required final section model

For each Service and LandingPage, the CMS record must contain one ordered
section list. Each entry has a section type and its structured content. The
renderer should iterate that list and dispatch only by section type:

`hero → intro → image-text → process → gallery → sub-services → faq →
testimonials → cta → contact-form → service-areas → video → quote`

The exact entries and order differ per record. No renderer may decide that a
section exists because `service.slug` equals a particular value.

For ServiceLocation, the renderer must load the parent Service list, load the
Location and its overrides, merge by stable section key, then iterate the
merged list. A location must not copy the parent blocks.

## Priority fixes before migration completion

1. Make `ServiceTemplate` render one data-driven ordered section list and
   remove the fixed JSX sequence.
2. Move each currently local service-specific section into the corresponding
   Service record or reusable structured block.
3. Make `ServiceLocationPage` merge parent sections with typed overrides,
   including lists, cards, process steps, media, and visibility.
4. Make `LandingPageRenderer` support every allowed landing block and populate
   all seven records from the WordPress source.
5. Compare every migrated record against WordPress and record image, CTA,
   order, and link differences here.

## Classification summary

- **SOURCE FACT:** independent LandingPages collection, ServiceLocations
  relationships, current route families, current component wiring, and the
  indexed WordPress section lists cited above.
- **INFERENCE:** shared service-location layout with city-specific overrides,
  based on the supplied location captures and repeated WordPress structure.
- **UNKNOWN / REQUIRES VERIFICATION:** exact live DOM/media/order for pages
  blocked by Cloudflare, and whether every WordPress Bricks section has a
  corresponding imported Payload record.
