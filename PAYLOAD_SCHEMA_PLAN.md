# Phase 6 — Payload Schema Architecture Plan

Status: design only.  
This document maps the completed WordPress → Bricks → normalized representation to a future Payload architecture.

No Payload collections, React components, routes, importers, or migration scripts are changed by this phase.

## Architecture principles

The future runtime should follow:

```text
Payload document.sections[]
        ↓
blockType section registry
        ↓
React renderer for that block type
```

Payload controls section existence, order, content, relationships, and configuration. React controls rendering, styling, and interaction behavior. There must be no page-specific collection, service-name conditional, or hardcoded fallback section.

## Shared field groups

These are reusable Payload field groups, not separate collections.

### ButtonGroup

```text
buttons[]
  label: text
  url: text
  variant: select (primary | secondary | text | outline)
  openInNewTab: checkbox
```

Source: Bricks button label and link settings. The variant should be retained only when the source provides an identifiable style; it must not be invented during migration.

### Link

```text
label: text
url: text
openInNewTab: checkbox
```

Used by cards, service areas, sub-services, and CTA buttons.

### MediaReference

```text
media: relationship(Media)
alt: text
caption: text
sourceAttachmentId: number
sourceUrl: text
```

`media` is the canonical Payload relationship. Source IDs and URLs are migration diagnostics/provenance, not replacements for the relationship.

### IconReference

```text
iconMedia: relationship(Media)
iconLibrary: text
iconName: text
sourceSvgUrl: text
```

The original Bricks icon library/name is retained where available. No replacement icon should be guessed.

### ImageTextContent

```text
eyebrow: text
heading: text
description: richText or text
media: MediaReference
buttons: ButtonGroup
alignment: select (left | right)
```

### FeatureCard

```text
title: text
description: richText or text
icon: IconReference
media: MediaReference
link: Link
```

### GalleryItem

```text
media: relationship(Media)
caption: text
alt: text
sourceOrder: number
sourceAttachmentId: number
```

### FAQQuestion

```text
question: text
answer: richText
sourceId: text
```

### FAQCategory

```text
title: text
questions: FAQQuestion[]
sourceQuery: json
sourceId: text
```

`sourceQuery` is needed because the WordPress page uses taxonomy/query-driven FAQ content. It must be populated only from the source query; it is not a substitute for imported questions.

## Block inventory

Each block below is intended to be an entry in an ordered `sections` array. The Payload block `blockType` values should remain stable after implementation.

### HeroBlock

Purpose: page or landing-page hero.

Fields:

```text
eyebrow: text
heading: text
description: richText or text
backgroundMedia: relationship(Media)
foregroundMedia: relationship(Media)
buttons: ButtonGroup
overlay: number or select, only if source/design requires it
sourceId: text
```

Mapping:

```text
Bricks heading/text/image/button/background
        ↓
HeroBlock heading/description/media/buttons
```

Renderer requirement: `HeroSection`; supports responsive settings and optional background video only when the source contains video media.

### CtaBlock

Purpose: estimate or consultation CTA embedded in the page.

Fields:

```text
eyebrow: text
heading: text
description: richText or text
media: relationship(Media)
buttons: ButtonGroup
sourceId: text
```

Mapping: Bricks heading/text/image/button → CTA fields.

Renderer requirement: `CtaSection`.

### ImageTextBlock

Purpose: general alternating image/text content.

Fields: `ImageTextContent`, plus `sourceId`.

Mapping: Bricks heading/text/image/button → image/text fields.

Renderer requirement: `ImageTextSection`.

### VideoBlock

Purpose: one video in a page section.

Fields:

```text
source: select (media | externalUrl)
media: relationship(Media)
externalUrl: text
poster: relationship(Media)
controls: checkbox
sourceVideoId: text
sourceId: text
```

Mapping: Bricks video `fileUrl`, provider IDs, poster, and controls → corresponding fields. An external URL must remain external unless the media migration supplies a local file.

Renderer requirement: `VideoSection`.

### GalleryBlock

Purpose: ordered project or reflection gallery.

Fields:

```text
heading: text
description: richText or text
items: GalleryItem[]
layout: select or json, only for source-supported layout settings
lightbox: checkbox
sourceGalleryType: text
sourceId: text
```

Mapping:

```text
Bricks image-gallery / happyfiles-gallery
        ↓
GalleryBlock.items[]
```

Renderer requirement: `GallerySection`; must preserve source order and lightbox behavior.

### BeforeAfterBlock

Purpose: before/after image comparison.

Fields:

```text
heading: text
beforeMedia: relationship(Media)
afterMedia: relationship(Media)
labels: group (before, after)
sourceId: text
```

Mapping: Bricks `xbeforeafterimage` image/settings → before and after media.

Renderer requirement: `BeforeAfterSection`.

### SubServicesBlock

Purpose: repeated kitchen, bathroom, or related style/service cards.

Fields:

```text
eyebrow: text
heading: text
description: richText or text
items: array
  title: text
  description: richText or text
  media: relationship(Media)
  link: Link
sourceId: text
```

Mapping: repeated Bricks image + heading/text + button groups → `items[]`. Buttons must not cause this section to become a CTA.

Renderer requirement: `SubServicesSection`.

### PrimeDifferenceBlock

Purpose: the “The Prime Difference” section with benefit/list content.

Fields:

```text
eyebrow: text
heading: text
description: richText or text
features: FeatureCard[]
media: relationship(Media)
sourceId: text
```

Mapping: Bricks `icon-box`, list, heading, text, and media → features.

Renderer requirement: `PrimeDifferenceSection`.

### ExperienceDifferenceBlock

Purpose: the separate “Experience the Prime Difference” / “Why choose Prime Design & Build?” section.

Fields:

```text
eyebrow: text
heading: text
description: richText or text
features: FeatureCard[]
media: relationship(Media)
sourceId: text
```

Mapping: Bricks heading and icon-box group → feature cards. This must remain distinct from `PrimeDifferenceBlock`.

Renderer requirement: `ExperienceDifferenceSection`.

### ServiceAreasBlock

Purpose: shared linked Areas We Service section.

Fields:

```text
eyebrow: text
heading: text
description: richText or text
areas: array
  label: text
  link: Link
sourceId: text
```

Relationship decision: area labels may reference a future `Locations` collection when the location route exists. The block should not require an active service context to build links; links must be resolved from the service/location route policy.

Mapping: Bricks area labels, links, and heading → `areas[]`.

Renderer requirement: `ServiceAreasSection`.

### RepairServicesBlock

Purpose: structured repair and installation categories.

Fields:

```text
heading: text
description: richText or text
categories: array
  title: text
  description: richText
  features: array of text
  media: relationship(Media)
  sourceId: text
sourceId: text
```

Mapping: raw HTML/code headings, paragraphs, lists, and images from the Comprehensive Home Repair page → category records. The raw source HTML should be retained in migration provenance until the structured extraction is verified.

Renderer requirement: `RepairServicesSection`.

### LuxuryCTABlock

Purpose: the “Silicon Valley’s Luxury Home Contractor” CTA.

Fields: `eyebrow`, `heading`, `description`, `media`, `buttons`, `sourceId`.

Mapping: Bricks heading/text/icon-box/background/button → CTA fields.

Renderer requirement: `LuxuryCTASection`.

### BookingBlock

Purpose: external appointment scheduling.

Fields currently approved by source evidence:

```text
provider: text
shortcode: text
sourceElementId: text
integrationMetadata: json
```

The current source contains LatePoint shortcode data such as selected service/agent values. Do not invent appointment availability, staff, duration, or pricing fields until the booking integration is verified.

Renderer requirement: `BookingSection` or a provider-specific integration adapter.

Migration status: pending integration decision.

### ContactFormBlock

Purpose: contact/estimate form embedded in a page.

Fields currently approved by source evidence:

```text
provider: text
shortcode: text
sourceElementId: text
integrationMetadata: json
```

The source contains Forminator and Fluent Forms references. Do not convert the form into invented Payload fields until the form provider configuration is available.

Renderer requirement: `ContactFormSection` or a provider adapter.

Migration status: pending integration decision.

### FindUsBlock

Purpose: contact details/location information.

Fields:

```text
heading: text
phone: text
email: text
address: text
mapUrl: text
sourceId: text
```

Mapping: Bricks Find Us heading/icon-box/contact values → structured contact fields. Values absent from the source remain empty; no values should be copied from a global unless the source explicitly references the global.

Renderer requirement: `FindUsSection`.

### TestimonialsBlock

Purpose: provider-tabbed customer reviews.

Fields:

```text
heading: text
providers: array
  name: text
  shortcode: text
  collectionId: text
  reviews: array
    reviewer: text
    rating: number
    body: richText or text
    date: date
    sourceId: text
sourceId: text
```

Mapping: Bricks testimonial tab labels and review shortcodes → provider records. Review records should be populated only if the shortcode provider data is exported or accessible.

Renderer requirement: `TestimonialsSection`.

Migration status: provider shortcode data is known; review-card data requires provider extraction.

### FAQBlock

Purpose: category tabs containing accordion questions.

Fields:

```text
heading: text
description: richText or text
categories: FAQCategory[]
sourceId: text
```

Mapping:

```text
Bricks tabs-nested tab titles
        ↓
FAQBlock.categories[].title

Bricks xproaccordion query + post_title/post_content templates
        ↓
FAQCategory.questions[]
```

The source currently provides taxonomy/query references and dynamic templates. Imported FAQ posts must be related by category during migration; the page must not receive fake questions when those posts are unavailable.

Renderer requirement: `FAQSection` with category tabs and accordion behavior.

Migration status: partial until FAQ post records and taxonomy relationships are imported.

### VideoCarouselBlock

Purpose: ordered nested video slider.

Fields:

```text
items: array
  media: relationship(Media)
  externalUrl: text
  poster: relationship(Media)
  sourceId: text
  sourceOrder: number
settings: json
sourceId: text
```

Mapping: Bricks `slider-nested` and child video elements → ordered `items[]`.

Renderer requirement: `VideoCarouselSection`.

### GalleryCarouselBlock

Purpose: ordered image carousel.

Fields:

```text
items: GalleryItem[]
settings: json
sourceId: text
```

Mapping: Bricks `carousel` and child image/media elements → ordered items and source settings.

Renderer requirement: `GalleryCarouselSection`.

## Non-body and unsupported representations

### Utility/global sections

Embedded sticky/header roots are not content blocks. They belong to a global site shell or a separately verified landing-page shell. They must not be imported as `CtaBlock` merely because they contain a button.

### Unsupported Bricks elements

Unknown elements must remain migration diagnostics with:

```text
sourceElement
actualElement
classification
reason
required
```

They must not be replaced by a generic block or fallback content. The migration should fail or produce an explicit review item when required content cannot be represented.

## LandingPages collection design

The seven `-information` pages and `remodeling-information` are Google Ads landing pages and should remain independent from normal `Services` documents.

```text
LandingPages
  title: text, required
  slug: text, required, unique
  status: select (draft | published)
  template: select (google-ads)
  hero: HeroBlock fields or HeroBlock data group
  sections: blocks[]
  ctaConfiguration: group/json, only for verified landing-page CTA behavior
  campaignTracking: group
    campaignName: text
    source: text
    medium: text
    term: text
    content: text
  seo: shared SEO field group
  noIndex: checkbox
  sourceWordPressId: number
  sourceSlug: text
```

`sections[]` is ordered. Payload's block discriminator is `blockType`; each entry maps to exactly one block schema above. Reusable global sections such as header/footer are not duplicated into every landing-page document.

## Relationship design

```text
LandingPage
  ├── sections[]
  │     ├── media → Media
  │     ├── GalleryItem.media → Media
  │     ├── FAQCategory.questions[]
  │     ├── Testimonials providers/reviews
  │     └── ServiceAreas areas → Locations (when applicable)
  ├── SEO
  └── source provenance
```

Core relationship rules:

- All migrated images, posters, and uploaded videos use `relationship(Media)`.
- External video URLs remain URL fields when the source is not available as a downloadable attachment.
- FAQ categories/questions are nested data; their source WordPress FAQ posts and taxonomy must be imported or explicitly reported missing.
- Testimonials are nested under the section unless an independent review collection is later justified by provider data and editorial requirements.
- Service areas should reference `Locations` where a canonical location entity exists; the rendered link must preserve the approved URL strategy.
- No block creates a duplicate media collection or page-specific service collection.

## Normalized type mapping and readiness

| Normalized type | Payload block | Ready | Notes |
|---|---|---|---|
| hero | HeroBlock | Yes | Media and buttons must be resolved. |
| cta | CtaBlock | Yes | Distinguish from sub-services by semantic classification. |
| image-text | ImageTextBlock | Yes | Generic alternating content. |
| video | VideoBlock | Yes | External/local media decision remains per item. |
| gallery | GalleryBlock | Partial | HappyFiles/dynamic gallery references need media resolution. |
| before-after | BeforeAfterBlock | Partial | Before/after side mapping must be verified per source settings. |
| sub-services | SubServicesBlock | Yes | Repeated cards and links are now identifiable. |
| prime-difference | PrimeDifferenceBlock | Yes | Feature extraction available. |
| experience-difference | ExperienceDifferenceBlock | Yes | Separate from Prime Difference. |
| service-areas | ServiceAreasBlock | Partial | Canonical Location relationship/link policy required. |
| repair-services | RepairServicesBlock | Partial | Raw HTML/code extraction needs verification. |
| luxury-cta | LuxuryCTABlock | Yes | Shared visual section, page content remains source-specific. |
| booking | BookingBlock | Pending | LatePoint/provider integration decision required. |
| contact-form | ContactFormBlock | Pending | Forminator/Fluent Forms integration decision required. |
| find-us | FindUsBlock | Yes | Values must be sourced, not invented from globals. |
| testimonials | TestimonialsBlock | Partial | Provider shortcodes known; review records not yet exported. |
| faq | FAQBlock | Partial | Categories/query templates known; FAQ records required. |
| carousel | GalleryCarouselBlock or VideoCarouselBlock | Partial | Final choice is determined from child media type. |
| utility | Global/site-shell configuration | Pending | Not a LandingPage body block. |
| unsupported | No automatic block | No | Must remain a migration error/review item. |

## Shared globals

These should be Globals or shared site configuration, not repeated fields in every service/landing-page document:

- Header/navigation and phone/contact information.
- Footer/company information.
- Areas We Service canonical labels/locations, where globally identical.
- Shared reviews summary only if the source confirms it is global.
- Shared CTA defaults only when the source confirms they are identical.

Page-specific section content remains inside the page's ordered blocks even when the renderer is shared.

## Migration mapping contract

```text
WordPress page
  ↓
Bricks serialized tree
  ↓
NormalizedSection[]
  ↓
blockType + block data
  ↓
Payload LandingPage.sections[]
  ↓
registered React renderer
```

Each normalized section must carry:

- original order
- original Bricks source ID
- source element type
- extracted semantic data
- media references
- links
- source subtree/settings for responsive and visibility provenance
- unsupported diagnostics

The transformer must be deterministic and idempotent by source WordPress ID/slug. A missing image, unresolved shortcode, or unsupported element must produce a report item; it must not silently create fallback content.

## Unresolved integrations and decisions

### Fluent Forms

Current source: `xfluentform` element and form reference metadata.  
Payload representation: `ContactFormBlock` provider/reference metadata pending.  
Decision required: whether the frontend embeds the external form provider or whether form fields are recreated in Payload.

### Forminator

Current source: Forminator shortcode with form ID.  
Payload representation: `ContactFormBlock` provider, shortcode, ID, and metadata.  
Decision required: provider embed versus a native Payload form.

### LatePoint booking

Current source: LatePoint booking shortcode with selected service/agent metadata.  
Payload representation: `BookingBlock` provider/reference metadata.  
Decision required: preserve the booking embed or integrate a native scheduling system.

### Testimonial shortcodes

Current source: provider tabs and review collection shortcodes.  
Payload representation: provider metadata initially; review records only after source provider data is available.  
Decision required: import reviews as nested data or maintain provider embeds.

### Dynamic WordPress queries

Current source: FAQ query references such as FAQ post type and taxonomy IDs, plus dynamic templates such as `{post_title}` and `{post_content}`.  
Payload representation: imported FAQ category/question data and source query provenance.  
Decision required: confirm the WordPress FAQ post export and taxonomy mapping before migration.

## Final design decision

The recommended architecture is:

```text
LandingPages
  └── ordered sections[]
        └── blockType
              └── one block schema

Services
  └── reusable service sections[]

ServiceLocations
  └── service relationship
  └── location relationship
  └── override data only
```

There are no `KitchenPage`, `BathroomPage`, or page-specific schemas. Service names and landing-page slugs do not control rendering. The registry and block data do.

## Readiness for schema implementation

**Ready to begin Payload schema design for the stable structured blocks.**

**Not ready for final migration/import until:**

1. FAQ source posts/taxonomies are available and mapped.
2. Testimonial provider data or embed policy is decided.
3. Booking and form provider integration is decided.
4. Dynamic/HappyFiles gallery references are resolved to Media.
5. Missing media files are supplied or explicitly accepted as unavailable.
6. Comprehensive Home Repair category extraction is reviewed against the original page.

This document is the architecture contract for the next implementation phase; it does not authorize collection creation or content import by itself.
