# Phase 4 — Final Normalized Structure Validation

Source: `C:\Users\HP\Downloads\primedesignampbuild.WordPress.2026-08-28.xml`  
Scope: eight requested information/Google Ads pages.  
Validation is audit-only; no Payload collections, React components, routes, imports, or migration code were changed.

## Result

The normalized representation preserves every top-level WordPress Bricks section and its source order. It is **not yet sufficient for a faithful Payload migration** because several sections expose only root-level metadata while their meaningful content is nested in tabs, accordions, third-party shortcodes, sliders, galleries, or raw HTML.

| Metric | Result |
|---|---:|
| Target pages | 8 |
| WordPress top-level sections | 105 |
| Normalized sections | 105 |
| Moved sections | 0 |
| Duplicated normalized roots | 0 detected |
| Missing normalized roots | 0 detected |
| Supported semantic roots | 73 |
| Partial roots | 25 |
| Roots needing a renderer/schema or source investigation | 3 |
| Missing media files in local dry-run | 32 |
| Unresolved media references | 0 |

## Status meanings

- **Ready for Payload** — semantic type and currently extracted data are sufficient for a first Payload representation.
- **Needs Payload block** — the source role is known, but the normalized data needs a dedicated structured block before import.
- **Needs renderer only** — the source data is identifiable, but frontend/third-party behavior is not represented by the current renderer contract.
- **Needs source investigation** — raw shortcode/code/plugin data must be decoded or intentionally preserved before migration.

## Final section coverage matrix

The compact entries below list `order: normalized type — status`. Every entry corresponds to one top-level WordPress `section` root. The source Bricks element and extracted-data details are summarized in the key immediately below each page.

### Kitchen Remodeling Information — 17 source / 17 normalized

| Order | WordPress section / Bricks structure | Normalized type | Data extracted | Status |
|---:|---|---|---|---|
| 1 | Sticky utility; section/container/block/image/button | utility | buttons, images, source settings | Needs source investigation |
| 2 | Hero; section/container/block/image/heading/text/button | hero | heading, description, button/link, images | Ready for Payload |
| 3 | Estimate CTA; heading/text/button/image | cta | heading, body, button/link, images | Ready for Payload |
| 4 | Kitchen style selector; repeated heading/text/button/image groups | sub-services | headings, descriptions, links, images | Needs Payload block |
| 5 | Custom/European/Shaker cards; repeated div/image/heading groups | sub-services | card headings, descriptions, images | Needs Payload block |
| 6 | The Prime Difference; icon-box/list | prime-difference | heading, lists, icons | Ready for Payload |
| 7 | Video; video | video | video URL, poster/media references | Ready for Payload |
| 8 | Project showcase; image-gallery | gallery | heading, image references | Needs Payload block |
| 9 | Reflection gallery; happyfiles-gallery | gallery | heading, gallery references | Needs source investigation |
| 10 | Experience / Why Choose; icon-box | experience-difference | headings, icon features | Ready for Payload |
| 11 | Areas We Service; icon-box/image | service-areas | heading, area text, image references | Needs Payload block |
| 12 | FAQ tabs/accordion; tabs-nested/xproaccordion | faq | heading, body, nested IDs | Needs Payload block |
| 13 | Happy Customers; tabs-nested/shortcode | testimonials | headings, rating labels, nested IDs | Needs Payload block |
| 14 | Luxury Home Contractor CTA; icon-box/text | luxury-cta | heading, description, media | Ready for Payload |
| 15 | Booking shortcode-only section | booking | source shortcode marker/settings | Needs source investigation |
| 16 | Find Us; icon-box | find-us | heading, contact labels, media | Ready for Payload |
| 17 | Contact Info / estimate form; shortcode | contact-form | heading, body, shortcode marker | Needs source investigation |

### Bathroom Remodeling Information — 17 source / 17 normalized

| Order | WordPress section | Normalized type | Data extracted | Status |
|---:|---|---|---|---|
| 1 | Sticky utility/header | utility | buttons, images, settings | Needs source investigation |
| 2 | Bathroom hero | hero | heading, description, button/link, images | Ready for Payload |
| 3 | Estimate CTA | cta | heading, body, button/link, images | Ready for Payload |
| 4 | Bathroom transformation intro | image-text | heading, description, button/link, image | Ready for Payload |
| 5 | Custom Bathtubs/Showers cards | sub-services | headings, descriptions, images | Needs Payload block |
| 6 | The Prime Difference | prime-difference | heading, lists, icons | Ready for Payload |
| 7 | Nested video slider | carousel | nested video URLs/settings | Needs renderer only |
| 8 | Project showcase gallery | gallery | heading, image-gallery references | Needs Payload block |
| 9 | Reflection gallery | gallery | heading, HappyFiles references | Needs source investigation |
| 10 | Experience / Why Choose | experience-difference | headings, icon features | Ready for Payload |
| 11 | Areas We Service | service-areas | area labels, images | Needs Payload block |
| 12 | FAQ tabs/accordion | faq | category headings, nested IDs | Needs Payload block |
| 13 | Happy Customers | testimonials | rating labels, nested IDs, shortcode marker | Needs Payload block |
| 14 | Luxury Home Contractor CTA | luxury-cta | heading, description, media | Ready for Payload |
| 15 | Booking shortcode-only section | booking | shortcode marker/settings | Needs source investigation |
| 16 | Find Us | find-us | heading, contact labels | Ready for Payload |
| 17 | Contact Info / form | contact-form | heading, body, shortcode marker | Needs source investigation |

### Additions Remodeling Information — 12 source / 12 normalized

| Order | WordPress section | Normalized type | Data extracted | Status |
|---:|---|---|---|---|
| 1 | Additions hero | hero | heading, description, button/link, images | Ready for Payload |
| 2 | Estimate CTA | cta | heading, body, button/link, images | Ready for Payload |
| 3 | Home Additions feature section | image-text | headings, lists, button/link, images | Ready for Payload |
| 4 | Benefits of Home Additions | image-text | headings, descriptions, images | Ready for Payload |
| 5 | The Prime Difference | prime-difference | heading, lists, icons | Ready for Payload |
| 6 | Video | video | video URL, poster/media references | Ready for Payload |
| 7 | Experience / Why Choose | experience-difference | headings, icon features | Ready for Payload |
| 8 | Areas We Service | service-areas | area labels, images | Needs Payload block |
| 9 | FAQ tabs/accordion | faq | category headings, nested IDs | Needs Payload block |
| 10 | Happy Customers | testimonials | rating labels, nested IDs, shortcode marker | Needs Payload block |
| 11 | Luxury Home Contractor CTA | luxury-cta | heading, description, media | Ready for Payload |
| 12 | Combined Find Us/contact form | contact-form | headings, body, form element marker | Needs source investigation |

### Home Remodeling Information — 12 source / 12 normalized

| Order | WordPress section | Normalized type | Data extracted | Status |
|---:|---|---|---|---|
| 1 | Sticky utility/header | utility | buttons, images, settings | Needs source investigation |
| 2 | Hero with shortcode | hero | heading, button/link, shortcode marker, background | Needs source investigation |
| 3 | Home renovation intro | image-text | heading, description, image | Ready for Payload |
| 4 | Services/intro image-text | image-text | headings, descriptions, images | Ready for Payload |
| 5 | Luxury CTA | luxury-cta | heading, description, button/link | Ready for Payload |
| 6 | Home renovation CTA/content | cta | heading, description, button/link, image | Ready for Payload |
| 7 | The Prime Difference | prime-difference | heading, lists, icons | Ready for Payload |
| 8 | Video | video | video URLs, poster/media references | Ready for Payload |
| 9 | Project gallery | gallery | heading, image-gallery references | Needs Payload block |
| 10 | Gallery carousel | carousel | carousel marker, nested media/settings | Needs renderer only |
| 11 | Find Us/footer content | find-us | heading, contact labels, images | Ready for Payload |
| 12 | Schedule a Call | cta | button/link | Ready for Payload |

### Outdoor Hardscape & Outdoor Kitchen Information — 12 source / 12 normalized

| Order | WordPress section | Normalized type | Data extracted | Status |
|---:|---|---|---|---|
| 1 | Outdoor hero | hero | heading, description, button/link, images | Ready for Payload |
| 2 | Estimate CTA | cta | heading, body, button/link, images | Ready for Payload |
| 3 | Outdoor feature section | image-text | headings, lists, button/link, images | Ready for Payload |
| 4 | Outdoor benefits | image-text | headings, descriptions, images | Ready for Payload |
| 5 | The Prime Difference | prime-difference | heading, lists, icons | Ready for Payload |
| 6 | Before/after image | before-after | image references, source settings | Ready for Payload |
| 7 | Experience / Why Choose | experience-difference | headings, icon features | Ready for Payload |
| 8 | Areas We Service | service-areas | area labels, images | Needs Payload block |
| 9 | FAQ tabs/accordion | faq | category headings, nested IDs | Needs Payload block |
| 10 | Happy Customers | testimonials | rating labels, nested IDs, shortcode marker | Needs Payload block |
| 11 | Luxury Home Contractor CTA | luxury-cta | heading, description, media | Ready for Payload |
| 12 | Find Us/contact form | contact-form | headings, form element marker | Needs source investigation |

### Siding Installation & Replacement Information — 12 source / 12 normalized

The Siding page has the same 12-root order as Outdoor Hardscape: hero, estimate CTA, feature section, benefits, Prime Difference, before/after, Experience Difference, Areas We Service, FAQ, Happy Customers, Luxury CTA, and combined Find Us/contact form. Types and statuses are respectively `hero`, `cta`, `image-text`, `image-text`, `prime-difference`, `before-after`, `experience-difference`, `service-areas`, `faq`, `testimonials`, `luxury-cta`, and `contact-form`; the FAQ/testimonial/form sections need structured block extraction and shortcode/form investigation.

### Comprehensive Home Repair Installation Services — 4 roots / 7 visible service groups

| Order | WordPress section | Normalized type | Data extracted | Status |
|---:|---|---|---|---|
| 1 | Repair hero; heading/text/button/image | hero | heading, description, button/link, image | Ready for Payload |
| 2 | Cabinet/service group; heading/text/list/image/code | repair-services | headings, descriptions, lists, images; raw `code` remains diagnostic | Needs source investigation |
| 3 | Why Choose Prime Design & Build; icon-box | experience-difference | heading, icon features | Ready for Payload |
| 4 | Raw HTML/text containing cabinet, door, drywall, flooring, interior, and window groups | repair-services | raw HTML/text and embedded lists | Needs Payload block |

The seven visible repair categories are not seven top-level Bricks roots. They are nested/raw content within roots 2 and 4. Importing these as four generic sections would lose editor-level category structure.

### Remodeling Information — 19 source / 19 normalized

| Order | WordPress section | Normalized type | Data extracted | Status |
|---:|---|---|---|---|
| 1 | Sticky utility/header | utility | buttons, images, settings | Needs source investigation |
| 2 | Hero with shortcode | hero | heading, button/link, shortcode marker, background | Needs source investigation |
| 3 | Estimate CTA | cta | heading, body, button/link, images | Ready for Payload |
| 4 | Services intro | image-text | headings, descriptions, images | Ready for Payload |
| 5 | Home renovation content | image-text | heading, description, images | Ready for Payload |
| 6 | The Prime Difference | prime-difference | heading, lists, icons | Ready for Payload |
| 7 | Nested video slider | carousel | nested video URLs/settings | Needs renderer only |
| 8 | Project showcase | gallery | heading, image-gallery references | Needs Payload block |
| 9 | Reflection gallery with nested tabs | gallery | heading, gallery references, nested IDs | Needs source investigation |
| 10 | Experience / Why Choose | experience-difference | headings, icon features | Ready for Payload |
| 11 | Areas We Service | service-areas | area labels, images | Needs Payload block |
| 12 | FAQ tabs/accordion | faq | category headings, nested IDs | Needs Payload block |
| 13 | Happy Customers | testimonials | rating labels, nested IDs, shortcode marker | Needs Payload block |
| 14 | Luxury Home Contractor CTA | luxury-cta | heading, description, media | Ready for Payload |
| 15 | Find Us | find-us | heading, contact labels | Ready for Payload |
| 16 | Contact Info/form | contact-form | heading, body, shortcode marker | Needs source investigation |
| 17 | Booking shortcode-only section | booking | shortcode marker/settings | Needs source investigation |
| 18 | Find Us duplicate source root | find-us | heading, icon features | Needs source investigation |
| 19 | Contact Info/estimate form duplicate source root | contact-form | heading, body, shortcode marker | Needs source investigation |

The two Find Us/contact pairs are present in the WordPress source itself. They are not normalized-parser duplicates, so they must not be removed without verifying the original rendered page behavior.

## Missing data report

### Directly extracted by the current normalizer

- Source root ID and original order.
- Full nested source subtree, including responsive settings and visibility/configuration settings.
- Heading strings when stored on heading/title elements.
- Body strings from text, list, and accordion-like elements.
- Button labels and link values when stored on button settings.
- Recursive image references found in settings.
- Video URLs found in nested settings.
- Nested element IDs.

### Not yet extracted at the required semantic depth

| Data | Affected sections | Current state | Required validation |
|---|---|---|---|
| FAQ category tabs | FAQ sections on 7 pages | Category text and nested IDs only | Extract ordered tab/category records and their Q&A items |
| FAQ questions/answers | FAQ sections on 7 pages | Not exposed as structured question/answer fields | Parse `xproaccordion` and nested tab settings |
| Testimonial cards | Happy Customers sections | Rating labels/shortcode markers only | Decode provider tabs, reviewer, rating, text, and ordering |
| Gallery items | Image-gallery/HappyFiles sections | Root-level image references only | Preserve ordered gallery items, captions, and gallery grouping |
| Video slider items | Bathroom/Home/Remodeling | URLs/settings detected | Extract ordered videos and slider configuration |
| Forms | `xfluentform` and shortcode sections | Element/shortcode marker only | Resolve Fluent Form/shortcode identity and field configuration |
| Booking | Booking shortcode roots | Shortcode marker/settings only | Identify external booking provider, service, duration, availability, and CTA behavior |
| Raw repair categories | Comprehensive page | Raw HTML/text available | Parse seven service categories into structured entries or deliberately preserve rich text |
| Media files | All pages | 32 local files missing; 0 unresolved attachment IDs | Resolve/download files before migration |

## Ordering verification

- All 105 WordPress top-level section roots have a corresponding normalized root.
- All normalized roots retain the original zero-based order as `order` and the original Bricks ID as `sourceId`.
- No normalized-root move was detected.
- No parser-created duplicate root was detected.
- The apparent repeated Find Us/contact roots on Remodeling Information are source facts and require frontend verification; they are not evidence of parser duplication.
- Nested order inside tabs, galleries, sliders, and raw HTML is not yet validated semantically because those child structures are not fully extracted.

## Can every section become Normalized Section → Payload Block → React Component?

**No, not yet.** The exact blockers are:

1. FAQ tabs/accordion children are not structured as ordered categories and Q&A records.
2. Testimonials are represented partly by tabs and shortcodes, not review records.
3. Gallery and HappyFiles item ordering/grouping is not fully normalized.
4. Slider/carousel child media and settings are not fully normalized.
5. Booking and Fluent Form shortcodes require provider/configuration resolution.
6. Comprehensive Home Repair contains raw HTML/code and seven nested service groups that need structured extraction or an explicit rich-text migration decision.
7. Thirty-two referenced local media files are missing from the supplied local uploads folder.

## Recommended next step

Complete nested semantic extraction in this order: FAQ tabs/accordions → testimonials → galleries/sliders → forms/booking → repair categories. Then rerun this validation and require every section to be either **Ready for Payload** or explicitly approved as a source-preserved rich-text/third-party integration. Do not begin bulk Payload import before that rerun.
