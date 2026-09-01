# Service Information and Location Page Audit

Date: 2026-09-01

## Scope

This audit covers the seven WordPress pages whose slugs end in `-information`, plus the service/location pattern represented by `/kitchen-remodeling/kitchen-remodeling-in-saratoga/`. The `-information` pages are treated as Google Ads landing pages and must keep their existing slugs.

## Source facts

The live WordPress pages use repeated global sections, but not one identical page body:

- The information pages reuse the global header, service cards, Prime Difference/trust content, service areas, testimonials/reviews, CTA/contact, and footer patterns.
- The middle content changes by subject. Kitchen and bathroom pages contain service-specific process, gallery, FAQ, and sub-service content. Home Remodeling and Additions contain different sections and different copy. Home Repair contains repair-category sections. Outdoor and Siding pages have their own topic-specific content.
- Service/location pages reuse a common kitchen-location layout, while city names, SEO text, hero copy, thumbnails, testimonials and some available sub-service cards vary by location.
- The original location URL includes both the service slug and the city slug, for example `kitchen-remodeling/kitchen-remodeling-in-saratoga`.

## Information page checklist

The statuses below describe the current repository, not a claim that the WordPress content has already been imported.

| WordPress URL | Payload target | Required page-specific content | Current status |
|---|---|---|---|
| `/kitchen-remodeling-information` | Services record, `pageTemplate = google-ads` | Kitchen hero, video, kitchen intro, sub-services, six-step process, reviews, service areas, FAQs, gallery, contact CTA | Schema supported; source content still needs import and section verification |
| `/bathroom-remodeling-information` | Services record, `pageTemplate = google-ads` | Bathroom hero, six-step process, bathroom sub-services, gallery, Prime Difference, FAQs, reviews, service areas, contact CTA | Schema supported; source content still needs import and section verification |
| `/additions-remodeling-information` | Services record, `pageTemplate = google-ads` | Additions hero, features, benefits, service cards, benefits imagery, Prime Difference, FAQs, testimonials, CTA | Schema supported; source content still needs import and section verification |
| `/home-remodeling-information` | Services record, `pageTemplate = google-ads` | Home renovation hero, service cards, project/gallery content, renovation explanation, Prime Difference, contact/footer content | Schema supported; source content still needs import and section verification |
| `/outdoor-hardscape-outdoor-kitchen-information` | Services record, `pageTemplate = google-ads` | Outdoor hardscape/outdoor kitchen hero, topic sections, images, FAQs, reviews and CTA | Schema supported; source content still needs import and section verification |
| `/siding-installation-replacement-information` | Services record, `pageTemplate = google-ads` | Siding hero, installation/replacement content, images, FAQs, reviews and CTA | Schema supported; source content still needs import and section verification |
| `/comprehensive-home-repair-installation-services-in-silicon-valley` | Services record, `pageTemplate = google-ads` | Cabinet, door, drywall, flooring, interior painting and window repair sections, dark trust section, areas and footer CTA | Schema supported; source content still needs import and section verification |

The current Service collection already provides reusable `intro`, `feature-list`, `benefits`, `process`, `image-text`, `gallery`, `sub-services`, `video`, `icon-feature-list`, `checklist`, and `quote` blocks. That is sufficient to represent the known content families without creating seven collections or seven route components.

## Service/location comparison

For the Saratoga kitchen page, the WordPress structure is:

1. Location hero and lead form.
2. “Your Dream Kitchen Remodeling in Saratoga” introduction/video.
3. “Don’t Settle for a Mediocre Kitchen in Saratoga.”
4. Kitchen style/sub-service cards.
5. Promise/quote section.
6. Location reviews/testimonials.
7. Prime Difference/why choose us.
8. Silicon Valley Loves Working With Us.
9. Contact form and quote CTA.
10. Footer.

The current `ServiceLocationPage` renders this shared order. The location record supplies the service relationship, location relationship, city, featured image, hero heading/description, intro, and SEO override. The remaining shared sections are currently sourced from the service renderer/local fallback and are not yet fully Payload-driven per location.

## Missing, incorrect, or unordered sections

### Information pages

- Missing from the current CMS data: all seven Google Ads records and their exact WordPress section content.
- Missing from the current model: an explicit page template discriminator. This is now provided by `Services.pageTemplate`.
- Missing from the current migration: source URL/legacy path metadata for these records. The slug itself must remain the exact information-page slug; a future migration should also preserve the WordPress source URL in the existing source metadata convention.
- Potentially incorrect if entered as a generic Service: using the normal service-detail fallback will omit or add sections. Each Google Ads record must have its own ordered `contentBlocks` list.
- Ordering risk: global sections such as reviews, service areas, CTA and footer are rendered by the shared template, while topic-specific sections must remain in the service’s block order. Do not paste global sections into every record.
- Image risk: several WordPress pages use distinct hero, process, gallery, and category images. Placeholder service images must not be treated as migrated media.
- CTA risk: every information page has a consultation/contact action; verify the original button labels and destination after import.

### Service/location pages

- Missing from Payload-driven rendering: a full per-location ordered section override. Current fields cover hero/intro/SEO but the renderer still supplies many sections from shared/local service data.
- Missing image fidelity: the featured image is supported, but every source image used by location-specific sections must be represented as Media or an explicit relationship.
- Incorrect risk: deriving all city copy from one generic sentence loses the unique WordPress Rank Math description and location-specific text.
- Ordering: the common location template order is correct as a structural pattern, but the source must be checked for optional/missing sub-service cards per city.
- CTA: the hero form and lower contact CTA exist in the renderer; labels, phone number and destination still need source verification.

## Tabs versus blocks

Use Payload **admin tabs** to organize the editor interface into Identity, Hero, Content, SEO, and Relationships. Do not use frontend tabs to represent the page sections: tabs hide content, while the source pages display their sections sequentially.

For the data itself, the correct architecture is:

```text
Service record
  pageTemplate: service-detail | google-ads
  contentBlocks: ordered reusable sections

ServiceLocation record
  service -> Service
  location -> Location
  location-specific hero/SEO/content overrides
  shared location template renderer
```

The reason the sections look the same across many pages is that the renderer is shared. The reason the content differs is that each record owns its text, media and relationships. Replacing blocks with tabs would make the admin screen look tidier but would not model section order, optional sections, or different page families.

## Recommended data entry

Create these seven Services records with the exact WordPress slug and set `pageTemplate` to **Google Ads information page**:

```text
kitchen-remodeling-information
bathroom-remodeling-information
additions-remodeling-information
home-remodeling-information
outdoor-hardscape-outdoor-kitchen-information
siding-installation-replacement-information
comprehensive-home-repair-installation-services-in-silicon-valley
```

For each record, enter the exact WordPress hero, source images, topic-specific blocks, FAQs, SEO values and CTA content. Do not create separate React pages. The legacy top-level route resolves a Google Ads Service record and uses the existing reusable service renderer; normal service records continue to redirect to `/services/{serviceSlug}`.

## Migration risks

1. A generic fallback can make an empty Google Ads record appear valid. Import verification must distinguish a real Payload record from local fallback data.
2. The current local service data still supplies fallback sections for records that have no CMS blocks. This is useful during staging but must not be mistaken for completed migration.
3. WordPress pages may contain repeated global content in their HTML. Store global content once in globals and keep only page-specific content in the Service record.
4. Do not change information-page slugs to `/services/...` without an explicit redirect/canonical decision; these are Google Ads URLs.
5. Do not assume every page has a video. Store a video Media relationship only when the source page actually uses a video.

## Required next verification

After the seven records are entered, compare each route against WordPress for section count and order, hero image/video, every content image, CTA destination, FAQ set, canonical URL, robots setting, and sitemap inclusion. Then compare at least Saratoga, San Jose and Palo Alto location records to verify that the shared template is reused while city-specific content remains record-specific.

