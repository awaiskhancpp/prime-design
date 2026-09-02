# Phase 2 — WordPress vs Normalized Structure Audit

Audit source: `primedesignampbuild.WordPress.2026-08-28.xml`  
Scope: the eight requested information/Google Ads pages.  
This is an audit artifact only. No Payload collection, React component, route, or importer was changed.

## Phase 3 normalization update

The intermediate normalizer now assigns semantic types before generic heuristics. The source section count remains 105 and the root order remains unchanged. Current examples are:

| Source section | Before | After |
|---|---|---|
| Kitchen “Choose a Kitchen That Reflects Your Unique Style…” | `cta` | `sub-services` |
| Kitchen “The Prime Difference” | `content` | `prime-difference` |
| Kitchen “Experience the Prime Difference” | `content` | `experience-difference` |
| Kitchen “Areas we service” | `image-text` | `service-areas` |
| Kitchen “Our Happy Customers” | `content` | `testimonials` |
| Kitchen booking shortcode root | `unsupported` | `booking` with `missing-renderer` status |
| Kitchen “Find us” | `content` | `find-us` |
| Kitchen “Contact Info” | `content` | `contact-form` |
| Comprehensive Home Repair service content | `content` | `repair-services` |

The normalizer now also carries the complete source subtree in `data.sourceTree`, in addition to source IDs, nested IDs, media references, button links, and original settings. Unsupported-element diagnostics remain present.

## Executive result

The parser preserves the order of the top-level Bricks `section` nodes. It does **not** yet preserve the page's full semantic model. Several sections are currently reduced to generic `cta`, `content`, or `image-text` records, and third-party/nested structures are marked partial. Therefore the normalized output is not ready to drive a faithful Payload migration.

The source contains 105 top-level sections across the eight pages. The default dry run reports 73 supported, 25 partial, and 3 requiring a missing renderer/schema. “Supported” here means the root was recognized; it does not mean every nested Bricks setting has been faithfully transformed.

## Section coverage matrix

Counts below are top-level Bricks `section` roots versus normalized roots. The utility/header root is included because it exists in the XML, but it must not be treated as landing-page body content without an explicit shell decision.

| Page | WordPress sections | Normalized | Correct root/order coverage | Wrong semantic mappings | Partial | Missing/unsupported |
|---|---:|---:|---:|---:|---:|---:|
| Kitchen Remodeling Information | 17 | 17 | 17 ordered | 5 | 3 | 1 utility + 1 booking renderer |
| Bathroom Remodeling Information | 17 | 17 | 17 ordered | 5 | 4 | 1 utility + 1 booking renderer |
| Additions Remodeling Information | 12 | 12 | 12 ordered | 4 | 3 | 0 |
| Home Remodeling Information | 12 | 12 | 12 ordered | 5 | 2 | 1 utility |
| Outdoor Hardscape & Outdoor Kitchen Information | 12 | 12 | 12 ordered | 4 | 3 | 0 |
| Siding Installation & Replacement Information | 12 | 12 | 12 ordered | 4 | 3 | 0 |
| Comprehensive Home Repair Installation Services | 4 roots / 7 visible service groups | 4 | 4 ordered roots | 2 | 1 | 1 nested code element |
| Remodeling Information | 19 | 19 | 19 ordered | 7 | 6 | 1 utility + 1 booking renderer |

“Wrong semantic mapping” means the section is present and in the correct source position, but the generic normalized type loses its actual role. It is not a claim that the XML section is absent.

## WordPress source order versus normalized order

### Kitchen Remodeling Information

The source and normalized root order is identical:

1. Embedded sticky utility/header (`hxxiyf`) — normalized as `cta/utility`; not body content.
2. Hero (`a90988`) — `hero`; correct.
3. “Let’s start your kitchen renovation” (`140d10`) — `cta`; correct.
4. “Choose a Kitchen That Reflects Your Unique Style and Vision” (`73aa13`) — currently `cta`; wrong semantic mapping, should be a sub-services/style-selection section.
5. Custom/European/Shaker kitchen cards (`15f718`) — `image-text`; partial semantic mapping, should be part of the sub-services/style section.
6. “The Prime Difference” (`3d3a22`) — generic `content`; should be a dedicated Prime Difference section.
7. Video (`011200`) — `video`; correct.
8. “Showcasing kitchen remodeling projects” (`946299`) — `gallery`; correct.
9. “A reflection of kitchen remodeling projects” (`eb408a`) — `gallery`; correct source position, but HappyFiles gallery data requires verification.
10. “Experience the Prime Difference / Why choose…” (`4d6549`) — generic `content`; should be the separate experience/why-choose section.
11. Areas we service (`743e27`) — `image-text`; wrong semantic mapping, should be `service-areas`.
12. FAQ tabs and accordions (`3f69e1`) — `faq/partial`; order correct, nested data needs a tabs/accordion normalizer.
13. Happy Customers/testimonials (`cefc42`) — generic `content/partial`; should be `testimonials`.
14. Silicon Valley’s Luxury Home Contractor (`cbaa17`) — generic `content`; should be the footer CTA/luxury CTA section.
15. Shortcode-only booking area (`txzwml`) — missing renderer.
16. Find Us (`doymhf`) — generic `content`; should be `find-us`.
17. Contact Info / estimate form (`ubnakb`) — generic `content/partial`; should be `form` or `contact-form`.

No root was moved, duplicated, or omitted by the current normalizer. The problem is semantic loss, not root ordering.

### Other pages

The same source-order behavior is present on the other seven pages. Their meaningful differences are real source differences, not parser omissions:

- Bathroom has a `slider-nested` video section where Kitchen has a plain video root.
- Outdoor and Siding have `xbeforeafterimage` sections; these normalize correctly as `before-after`.
- Home and Remodeling contain `carousel`/`slider-nested` sections and have different source section counts from the kitchen-family pages.
- Additions, Outdoor, and Siding end with a combined Find Us/contact/form root rather than the separate roots found on Kitchen/Bathroom.
- Comprehensive Home Repair stores most service detail in a single raw HTML/text root, with seven visible service groups inside it. Treating that as one generic `content` section is structurally insufficient for CMS editing.

## Missing implementation report

| Missing or incomplete capability | Actual Bricks elements | Example pages | Data available now | Required Payload support | Required renderer |
|---|---|---|---|---|---|
| Sub-services/style cards | `heading`, `image`, `button`, nested `div` | Kitchen, Bathroom, Remodeling | Headings, descriptions, buttons, image IDs | Ordered cards: title, description, image, link | `SubServicesSection` / style cards |
| Prime Difference | `icon-box`, `list` | All service-family pages | Heading, bullet/list text, icon/image references | Eyebrow, heading, body, bullets, media | `PrimeDifferenceSection` |
| Experience / Why Choose | `icon-box`, `heading` | All service-family pages | Heading and icon feature data | Feature cards and optional media | `ExperienceDifferenceSection` |
| Service Areas | `icon-box`, `heading`, `image` | All service-family pages | Area labels and image references | Reusable linked service-area list | `ServiceAreasSection` |
| Testimonials | `tabs-nested`, `shortcode`, `icon-box` | All pages with reviews | Provider labels, rating UI, shortcode references | Provider tabs, review cards, ratings, author data | `TestimonialsSection` |
| FAQ tabs/accordion | `tabs-nested`, `xproaccordion` | Kitchen, Bathroom, Additions, Home, Outdoor, Siding, Remodeling | Category labels, questions, answers in nested settings | FAQ categories with ordered question/answer items | `FaqTabsSection` |
| Booking/scheduling | shortcode-only root | Kitchen, Bathroom, Remodeling; likely related pages | Shortcode marker only; no inspectable booking fields | Appointment configuration or external booking integration | `BookingSection` |
| Contact/estimate form | `xfluentform`, `shortcode` | Additions, Outdoor, Siding and all family pages | Form shortcode/plugin IDs and surrounding labels | Form reference/configuration, not fake fields | `ContactFormSection` |
| Nested slider video | `slider-nested`, `video` | Bathroom, Home, Remodeling | Video URLs/posters from nested settings | Ordered video items and poster media | `VideoCarouselSection` |
| Carousel gallery | `carousel` | Home, Remodeling | Carousel settings and child media | Ordered gallery items/settings | `GalleryCarouselSection` |
| Raw HTML/code service groups | `code`, raw `text` HTML | Comprehensive Home Repair | Full HTML, headings, lists, image references | Structured repair-category entries or explicitly preserved rich text | `RepairServicesSection` |
| HappyFiles gallery | `happyfiles-gallery` | Kitchen, Bathroom, Remodeling | Gallery settings/IDs | Ordered gallery media relation | Gallery renderer with HappyFiles mapping |

## False positives and unnecessary sections

1. The sticky utility/header root is being assigned a normalized `cta` type because it contains a button. Its `classification: utility` is correct, but its `type` is misleading. It should be excluded from body-section counts or given a dedicated shell classification.
2. A button-containing service/style section is being classified as `cta` before its semantic content is considered. This affects Kitchen, Bathroom, Additions, Outdoor, Siding, and Remodeling.
3. Areas We Service is being classified as `image-text` only because it contains an image and heading. This is a false positive; it is a shared linked-area section.
4. Testimonials, Find Us, Prime Difference, Experience Difference, and the luxury CTA are being classified as generic `content`. These are not duplicate source sections; they are under-modeled sections.
5. No evidence was found that the normalizer itself duplicates a root. Apparent duplicate visible content in the source must be handled as source truth and reported separately from parser duplication.
6. The fallback renderer is outside this phase's normalized audit. The migration pipeline must not use a fallback section to fill any of the gaps listed here.

## Wrong mappings

- `button`-first classification incorrectly labels style/sub-service sections as `cta`.
- `image + heading` classification incorrectly labels Areas We Service as `image-text`.
- Prime Difference is reduced to generic `content`.
- Experience the Prime Difference / Why Choose is reduced to generic `content`.
- Testimonials are reduced to generic `content`.
- Find Us is reduced to generic `content`.
- Luxury/footer CTA is reduced to generic `content`.
- Comprehensive Home Repair's structured service groups are collapsed into generic roots rather than represented as repair categories.

## Renderer requirements

The normalized intermediate format needs semantic section identity separate from the low-level element type. The required renderer set is:

1. Landing-page shell/utility handling.
2. Hero.
3. Estimate CTA.
4. Sub-services/style cards.
5. Image/text content.
6. Prime Difference.
7. Video and video carousel.
8. Project gallery and gallery carousel.
9. Experience Difference.
10. Service Areas.
11. FAQ tabs with nested accordions.
12. Testimonials/provider tabs.
13. Luxury/footer CTA.
14. Booking/scheduling.
15. Find Us.
16. Contact/Fluent Form.
17. Repair Services structured categories.

## Normalization problems to fix before Payload

- Keep source root order, which is currently preserved.
- Add semantic detection before generic `button`, `image`, and `heading` heuristics.
- Preserve nested tab labels, question/answer pairs, provider tabs, and gallery items instead of only recording the root.
- Represent third-party shortcodes explicitly with provider, shortcode value, and a migration status; do not treat them as ordinary text.
- Represent `slider-nested` and `carousel` as ordered child media/video data.
- Split the Comprehensive Home Repair raw HTML into structured service-category data, or explicitly mark it as a rich-text/code migration requirement.
- Give utility/header roots a non-body classification that cannot be mistaken for a CTA.
- Treat unsupported nested elements as actionable diagnostics with actual element name, page, root ID, and required support.

## Recommended implementation order

1. Correct semantic classification for existing source roots without changing their order.
2. Add nested extraction for FAQ tabs/accordions and testimonial/provider tabs.
3. Add media extraction for HappyFiles galleries, sliders, and carousels.
4. Add explicit shortcode/form/booking diagnostics and integration fields.
5. Normalize sub-services, Prime Difference, Experience Difference, Service Areas, Find Us, and luxury CTA as distinct semantic types.
6. Normalize Comprehensive Home Repair service categories from its raw HTML/code source.
7. Re-run this audit and require zero wrong mappings before Payload transformation.

## Conclusion

**Not ready for Payload migration.** The source tree order is reliable at the top-level section boundary, but normalized coverage is not yet semantically faithful. The next work belongs in the normalizer and extraction layer, not in Payload schema design or frontend fallback logic.
