# Prime Design & Build — Payload Admin Content Guide

This document explains how to enter the WordPress content into the current Payload CMS model. The migration is intentionally staged: create and verify the CMS records first, then import the remaining WordPress records. Keep the existing URLs and use the exact WordPress copy wherever it is available. Do not rewrite source content while entering it.

## 1. Rules that apply to every record

1. Upload the original media file to **Media** before selecting it in another collection.
2. Preserve the WordPress title, slug, body copy, dates, image, alt text, and SEO values.
3. Use lowercase hyphenated slugs. A slug is part of the URL and must not be changed casually.
4. Use **Draft** while a record is incomplete. Use **Published** only after its images, links, SEO, and frontend route have been checked.
5. Do not create a separate Page document for every service/location URL. Those URLs are generated from **ServiceLocations**.
6. Do not create `ConsultationTypes` or `LandscapingPages` records. Those are not part of the approved architecture.
7. The current local TypeScript data is only a fallback while CMS records are missing. It is not a second permanent source of truth.

## 2. Media — do this first

Go to **Media → Create New** and upload each original image or video.

Fill in:

- **File:** the original file.
- **Alt text:** describe what is visible and include the service or location only when it is genuinely visible/relevant.
- **Caption/description:** use the WordPress attachment description if one exists.
- **WordPress ID / source URL / source path:** preserve the XML attachment values when available.
- **MIME type:** allow Payload to detect it. Videos must remain video files; do not upload a video as an image.

Use uploaded Media relationships for hero images, featured images, galleries, section images, posters, and SEO social images. Do not paste local filesystem paths into content fields.

## 3. Locations collection

Create one record per service area. The current location set is:

| Name | Slug |
|---|---|
| Campbell | `campbell` |
| Cupertino | `cupertino` |
| Fremont | `fremont` |
| Los Altos | `los-altos` |
| Los Gatos | `los-gatos` |
| Menlo Park | `menlo-park` |
| Milpitas | `milpitas` |
| Mountain View | `mountain-view` |
| Palo Alto | `palo-alto` |
| Redwood City | `redwood-city` |
| San Jose | `san-jose` |
| Santa Clara | `santa-clara` |
| Saratoga | `saratoga` |
| Silicon Valley | `silicon-valley` |
| Sunnyvale | `sunnyvale` |

For each Location enter:

- **Name:** the city name exactly as shown above.
- **Slug:** the matching slug.
- **SEO description:** the WordPress location description if available.
- **Featured image:** the location thumbnail from WordPress, if available.
- **SEO:** copy the WordPress title, description, canonical URL, and no-index value when present.

Locations are reusable records. They do not contain the full service page copy.

## 4. Services collection

Create these service records. The slug is the canonical service identifier used by the dynamic route `/services/{slug}`.

| Title | Slug | Parent service |
|---|---|---|
| ADU | `adu` | none |
| Additions | `additions` | none |
| New Construction / Complete Renovation | `complete-renovation` | none |
| Kitchen Remodeling | `kitchen-remodeling` | none |
| European Kitchens | `european-kitchen` | Kitchen Remodeling |
| Shaker Kitchens | `shaker-kitchens` | Kitchen Remodeling |
| Custom Kitchens | `custom-kitchens` | Kitchen Remodeling |
| Bathroom Remodeling | `bathroom-remodeling` | none |
| Home Remodeling | `home-remodeling` | none |
| Home Repair Services | `home-repair-installation-services` | none |
| Financing | `financing` | none |

For every Service fill in:

- **Title and slug:** use the table.
- **Parent service:** select the parent only for European Kitchens, Shaker Kitchens, and Custom Kitchens.
- **Short description / description:** copy the corresponding WordPress text.
- **Hero → eyebrow, heading, lead:** copy the page hero text exactly.
- **Hero → image:** select the hero image from Media.
- **Hero → video:** select an uploaded video only for pages whose original hero actually uses a video. Leave it empty for image-only heroes.
- **Featured:** enable only where the service appears as a featured service.
- **Show in Consultation Form:** enable only for services shown as consultation cards on the Contact page.
- **Sort order:** use the visible order from the original Services/Contact page.
- **SEO:** copy the WordPress SEO values.

### Service content blocks

Add blocks in the same order as the original page. The block names describe the content; they do not automatically attach themselves based on an image or title. The block belongs to the Service because it is entered inside that Service record.

Available blocks:

- **Intro:** eyebrow, heading, body, image, and image side.
- **Feature List:** heading and one item per bullet.
- **Benefits:** heading and one item per bullet.
- **Process:** heading and ordered steps. Each step has title, description, and optional image.
- **Image and Text:** eyebrow, heading, body, image, and image side.
- **Gallery:** heading and ordered Media images.
- **Sub-services:** heading and repeated title, description, image, and link.
- **Video:** heading, uploaded video, optional external video URL, and poster. Use the upload when the video has been downloaded; use the URL only when the original is intentionally external.
- **Quote:** exact quotation and attribution.

### What to enter for each service family

Use the WordPress page and XML as the source for the exact words and image order.

#### ADU

Enter the ADU hero, then the ADU introduction, key features, benefits, and the numbered ADU process. Add the page’s uploaded images in the relevant Intro/Image and Text or Process blocks. Add the original video only if the source page uses one. Do not add kitchen-only sub-service or kitchen FAQ blocks.

#### Additions

Enter the Room Additions hero, the Home Additions introduction, key features, benefits, and the numbered process. Add the Real Homes/Real Stories content and its images if that content belongs to the source page. Add the source video, quote, and image/text sections in their original order.

#### New Construction / Complete Renovation

Enter the Complete Renovation hero and its actual source sections. The live WordPress page currently contains copy that duplicates the Additions page; preserve it as source content only after confirming the XML/page source. Do not silently “correct” that content during migration. Add the client-centered process, craftsmanship section, testimonials/reviews, and CTA only where they are present in the source layout.

#### Kitchen Remodeling

Enter the Kitchen Remodeling hero, the introductory video or image section, kitchen sub-services, the consultation/process steps, gallery, quote, FAQ relationship, and the source service-area content where applicable. The page may include European, Shaker, and Custom Kitchens as sub-services; those are separate Service records and can also be linked through Sub-services.

#### European Kitchens, Shaker Kitchens, and Custom Kitchens

These are separate child Services, not merely headings inside Kitchen Remodeling. Enter each page’s own hero, video/image behavior, content blocks, gallery, testimonials/reviews, and SEO. Do not copy sections from the parent unless the original page actually contains them.

#### Bathroom Remodeling

Enter the bathroom hero, six-step process, bathroom sub-services, gallery, craftsmanship/why-choose sections, FAQ relationship, service areas, and SEO exactly in the source order. Leave kitchen-specific blocks out.

#### Home Remodeling

Enter the Home Remodeling hero, real homes/testimonials, video, client-centered process, gallery, service-area section, FAQ relationship, and SEO exactly as shown in the original page.

#### Home Repair Services

Enter the hero and each repair category as ordered Image and Text or Intro blocks: Cabinet Repair & Installation, Door Installation & Repair, Drywall Repair/Installation/Replacement, Flooring Installation & Repairs, Interior Painting, and Window Repair & Replacement. Preserve each category’s bullets and image. Add the source “Why choose Prime Design & Build?” section as a block only if it belongs to this page.

#### Financing

Enter the financing page’s own hero, explanatory copy, images, form/CTA links, and SEO. Do not use the remodeling process blocks unless they are present in the source page.

## 5. ServiceLocations collection

The 45 location pages are combinations of three parent services and fifteen locations:

- Kitchen Remodeling × every Location
- Bathroom Remodeling × every Location
- Home Remodeling × every Location

Create or verify one record per combination. Do not manually create React files or Page records for these URLs.

For each ServiceLocation record enter:

- **Title:** the source title, normally `{Service} in {City}`.
- **Slug:** preserve the WordPress slug, for example `kitchen-remodeling-in-saratoga`.
- **Service:** relationship to the correct Services record.
- **Location:** relationship to the correct Locations record.
- **City:** the exact city value from the WordPress custom field.
- **Featured image:** the location page thumbnail from Media.
- **Hero heading/description/intro:** copy the location page source values.
- **SEO overrides:** copy the unique Rank Math title/description/canonical/no-index values. Use an override only when the location page differs from the service defaults.

The frontend constructs the legacy URL as:

`/{service-slug}/{service-slug}-in-{location-slug}/`

The newer service page URL is `/services/{service-slug}`. Keep redirects for old service URLs and keep the 45 WordPress location URLs unchanged.

## 6. BlogCategories and Blog

### BlogCategories

Create the categories used by the source posts, using the exact WordPress names and lowercase slugs. At minimum, the current local source data uses:

- Kitchen Remodeling → `kitchen-remodeling`
- Bathroom Remodeling → `bathroom-remodeling`
- Home Remodeling → `home-remodeling`

Set **Published** only when the category is ready. Do not create a category for every tag.

### Blog

Create one Blog record per WordPress post. The current local fallback contains these source slugs:

- `cabinetry-done-right-exclusive-seminar`
- `designing-with-intent`
- `design-first-thoughtful-plan`
- `winterization-checklist-roof`
- `eco-friendly-kitchen-remodeling-guide`

For each Blog record:

- **Title:** exact post title.
- **Slug:** exact WordPress slug.
- **WordPress ID / source URL:** XML values.
- **Status:** Draft during entry; Published after verification.
- **Published date:** original WordPress publication date.
- **Author:** select the matching Users record when available.
- **Excerpt:** the source excerpt, no more than the field limit.
- **Featured image:** the post’s original featured image.
- **Intro:** the opening paragraph if it is separate from the article body.
- **Structured Sections:** add one section per visible article section, in order. Enter eyebrow, heading, exact body, image, image alt text, and the original image position.
- **Free-form content:** use this only for content that cannot be represented by the structured sections. Do not enter the same article twice.
- **Table of Contents:** enable only when the source post has a visible table of contents. The headings are generated from H2 content.
- **FAQ heading/FAQ:** add only when the post has an FAQ; enter the exact question and answer.
- **Categories:** select the related BlogCategories records.
- **Tags:** enter source tags as individual text items.
- **Related posts:** select related Blog records only when the source has an intentional related-post relationship.
- **SEO:** enter `meta_title`, `meta_description`, `meta_image`, `keywords`, `canonical_url`, and `no_index` from WordPress. Do not put SEO copy in the article body.
- **Featured:** enable only for posts shown as featured.

## 7. FAQCategories and FAQs

Create one FAQCategories record for each source heading. The current source headings are:

- About Us Questions
- ADU Questions
- Bathroom Remodel Questions
- Complete Renovations Questions
- Custom Kitchen Questions
- European Kitchen Questions
- Finance Questions
- General Questions
- Home Remodel Questions
- Kitchen Remodel Questions
- Outdoor Hardscape Questions
- Outdoor Kitchen Questions
- Room Additions Questions
- Shaker Kitchen Questions
- Siding Questions

Then create one FAQ record per question:

- **Question:** exact source question.
- **Answer:** exact source answer.
- **Category:** relationship to one FAQCategories record.
- **Sort order:** source order within that category.
- **Visible:** enabled unless the source item is intentionally hidden.

Do not write the category name as a second free-text field. The relationship is the source of truth.

## 8. Pages collection

Use Pages for normal CMS-managed pages and future landing pages. The current specialized frontend routes still render their existing page components, so a Page document does not replace those components until the route is explicitly wired to query Pages.

For a Page record enter:

- **Title:** page title.
- **Slug:** route slug, such as `about`, `contact`, `faq`, `gallery`, `our-projects`, or `testimonials`.
- **Hero:** eyebrow, heading, description, image, and video. Use only the video/image behavior present on the source page.
- **Layout:** ordered Page blocks matching the page source. Do not add blocks merely because they exist in the collection.
- **Google Ads Page:** disabled for ordinary pages.
- **SEO:** exact WordPress SEO values.

The current Page block set is used for flexible page content:

- Callout
- Rich text
- Image and text
- Gallery
- FAQ
- Testimonials
- Service areas
- Contact form

If a page is still rendered by a dedicated existing route, keep the Page record as migration content/reference until that route has been integrated. Do not create duplicate page content in both the Page document and a local component without an explicit transition plan.

## 9. Google Ads landing pages

Use the Pages collection with **Google Ads Page** enabled. There is no separate GoogleAdsPages collection in the current approved model.

For each paid landing page enter its unique title, slug, hero, layout blocks, form, and SEO. Set `no_index` according to the campaign requirement. Campaign attribution should remain in the campaign URL/query parameters unless campaign fields are added to Pages in a later approved change. Do not add campaign fields in the admin because they do not currently exist in the schema.

## 10. Projects, Team, and Testimonials

### Projects

Create one Project per WordPress project. Preserve title, slug, project type/category, location, description, hero/featured image, ordered gallery, date, and SEO. Use Media relationships for all images. Do not create one route file per project; use the existing `/our-projects/[slug]` dynamic route.

### Team

Create one Team record per WordPress team member. Preserve name, role, biography, portrait, sort order, and social/contact links where present.

### Testimonials

Create one Testimonial per source testimonial. Preserve customer name, quote, rating, service/location reference, image/avatar, source platform, and display order. Do not duplicate the same review in every Service record.

## 11. SiteSettings global

Enter company-wide values once in **Site Settings**:

- Company name
- Logo and default social image
- Phone and email
- License number
- Office addresses
- Social links
- Service-area location relationships
- Default SEO values

Use this global for header, footer, contact information, Areas We Serve, and default metadata. A service or page should override a value only when the source page genuinely differs.

## 12. Redirects collection

Create active 308 redirects for intentionally changed URLs. Examples include:

- `/adu/` → `/services/adu/`
- `/additions/` → `/services/additions/`
- `/complete-renovation/` → `/services/complete-renovation/`
- `/kitchen-remodeling/` → `/services/kitchen-remodeling/`
- `/bathroom-remodeling/` → `/services/bathroom-remodeling/`
- `/home-remodeling/` → `/services/home-remodeling/`

Do not redirect a location URL to `/services`. A location link must resolve to its exact service/location URL, for example:

`/kitchen-remodeling/kitchen-remodeling-in-saratoga/`

## 13. Recommended entry order

1. Media
2. Locations
3. Services and child Services
4. ServiceLocations
5. FAQCategories and FAQs
6. BlogCategories and Blog posts
7. Projects, Team, and Testimonials
8. Site Settings
9. Pages and Google Ads pages
10. Redirects
11. Publish and verify representative routes before importing the remaining records

## 14. Verification before publishing

Check at least:

- `/services/kitchen-remodeling/`
- `/services/bathroom-remodeling/`
- `/services/home-remodeling/`
- `/kitchen-remodeling/kitchen-remodeling-in-saratoga/`
- `/kitchen-remodeling/kitchen-remodeling-in-san-jose/`
- `/bathroom-remodeling/bathroom-remodeling-in-palo-alto/`
- `/home-remodeling/home-remodeling-in-palo-alto/`
- `/blog/cabinetry-done-right-exclusive-seminar/`
- `/contact/`
- `/faq/`

Confirm that the page has the correct image files, the correct section order, no unintended extra sections, working internal links, correct canonical/no-index behavior, and no missing Payload relationships. Only after these checks should the remaining WordPress data be imported.

