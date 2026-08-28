# WordPress WXR audit and Payload migration blueprint

Source: `primedesignampbuild.WordPress.2026-08-28.xml`.

This document records what is present in the export and what is currently represented in the Payload project. It does not replace the existing service/location architecture or redesign any existing frontend page.

## Executive summary

- **SOURCE FACT:** The export contains 1,307 items: 79 pages, 5 posts, 1,049 attachments, 46 FAQs, 18 projects, 12 team records, 7 testimonials, 24 Bricks templates, 20 navigation items, and WordPress/ACF/system records.
- **SOURCE FACT:** The 45 location pages are present: 15 kitchen, 15 bathroom, and 15 home-remodeling pages. Their slugs end in `-in-{city}` and their parents are the corresponding service pages.
- **SOURCE FACT:** Location pages have empty `post_content`; their source data is represented through page metadata, featured images, Rank Math metadata, and the WordPress runtime architecture identified in the earlier runtime audit.
- **INFERENCE:** The location pages are generated instances of `service + city + shared template`, not 45 independent Bricks documents.
- **SOURCE FACT:** The current project already has dynamic service/location routes and local fallback data for the 45 location slugs. The new missing-page shell is only for exported public pages that had no current dedicated route.

## A. Content types found

### Recommended Payload collections

| Payload collection               | WordPress source                             | Required source-backed fields                                                                       |
| -------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Services`                       | service pages and service runtime data       | title, slug, description, hero fields, ordered content blocks, SEO, media                           |
| `Locations`                      | 45 location pages                            | name/city, slug, featured image, SEO                                                                |
| `ServiceLocations`               | 45 child location pages                      | service relationship, location relationship, legacy slug, city, featured image, hero overrides, SEO |
| `BlogPosts`                      | 5 `post` records                             | title, slug, content, author, date, featured image, categories/tags, SEO                            |
| `FAQs`                           | 46 `faq` records and `faq-category` taxonomy | question, answer, category, order, SEO if retained                                                  |
| `Projects`                       | 18 `project` records                         | title, content/summary, featured image, gallery, address, video URL, SEO                            |
| `Team`                           | 12 `team` records                            | name/title, description, featured image, position                                                   |
| `Testimonials`                   | 7 `testimonial` records                      | title/name, content, featured image, location/source fields                                         |
| `Media`                          | 1,049 attachments                            | filename, URL/path, MIME type, alt text, attachment metadata, taxonomy/category references          |
| `Pages` or a page-data singleton | 79 `page` records                            | title, slug, source content where non-empty, template/role, SEO, page-specific metadata             |
| `SiteSettings` singleton         | ACF Options page                             | company name, email, phone, address, license, review links, social/business links                   |

**INFERENCE:** `Pages` should be added if non-service WordPress pages must be edited from Payload. The existing service collections should continue to own service pages and service-location pages.

## B. Relationship diagram

```text
SiteSettings
  ├── review/business URLs
  └── company contact details

Services ───────────────┐
  ├── hero media        │
  ├── content blocks    │
  └── SEO               │
                         ├── ServiceLocations ── Locations
                         │       ├── featured image
                         │       ├── city/legacy metadata
                         │       └── SEO overrides
                         └── related service pages

BlogPosts ── Media / Authors / Categories / Tags
FAQs ────── FAQ Categories
Projects ── Media / Project Gallery / Address / Video URL
Team ────── Media / Team Member Position
Testimonials ── Media
Pages ───── Media / SEO / page template metadata
```

## 1. Taxonomies, authors, and media

- **SOURCE FACT:** Taxonomy domains are `category`, `faq-category`, `happyfiles_category`, `hf_cat_page`, `nav_menu`, and `template_tag`.
- **SOURCE FACT:** `faq-category` contains 16 terms, including About, ADU, Bathroom Remodel, Complete Renovations, Custom Kitchen, European Kitchen, Finance, Home Page, Home Remodel, Kitchen Remodel, Outdoor Hardscape, Outdoor Kitchen, Room Additions, Shaker Kitchen, and Siding.
- **SOURCE FACT:** `happyfiles_category` is used for media organization and contains service/gallery/project/team/video categories.
- **SOURCE FACT:** `hf_cat_page` includes landing-page groupings for kitchen, bathroom, and home-remodeling pages plus main-site/coming-soon groupings.
- **SOURCE FACT:** Three authors are present: `tahor_flfdpz6fPsw2`, `tdjksafjdklj324`, and `primesocialmedia`.
- **SOURCE FACT:** There are 1,049 attachment records with `_wp_attached_file` and `_wp_attachment_metadata`.
- **INFERENCE:** Media taxonomy categories are migration organization metadata; they do not necessarily need to become public Payload collections.

## 2. Metadata and ACF fields

### ACF field groups

| Group              | Key                   | Location rule                  |
| ------------------ | --------------------- | ------------------------------ |
| Options            | `group_61367d28206e5` | ACF options page `acf-options` |
| All Pages          | `group_641b42239f6c7` | post type `page`               |
| Team Member fields | `group_646a9d897454d` | post type `team`               |
| Testimonials       | `group_646aa45a4d28f` | post type `testimonial`        |
| Project fields     | `group_646aaea92dbc2` | post type `project`            |
| Landing Pages      | `group_64728a113ac9a` | pages with parent ID `327`     |

### ACF fields found

- **SOURCE FACT:** Options fields: Company Name (`field_61367d37ef922`), Company Email (`field_61367d3eef923`), Company Email Link (`field_6250d01e7b9c3`), Company Phone (`field_61367d44ef924`), Company Phone Clean (`field_61367dc39b9b5`), Company Address (`field_6137e633f1bf7`), Company License (`field_6250d0147b9c2`), Google Business Link (`field_6250d21205794`), Yelp (`field_646fbe416ea89`), Houzz (`field_6476a87cc2dea`), and BBB (`field_6696b8babebe4`).
- **SOURCE FACT:** All Pages fields: Header Overlay Style (`field_641b4226fc086`), radio choices `Standard` and `Overlay`, default `Standard`; Header text color (`field_64a70d331e314`), radio choices `Black` and `White`, default `Black`.
- **SOURCE FACT:** Landing Pages field: City (`field_64728a16a87d5`), text field, applied to pages whose parent is WordPress page ID `327`.
- **SOURCE FACT:** Team field: Team Member Position (`field_646a9d8b10322`), text field.
- **SOURCE FACT:** Project fields: Project Gallery (`field_646aaeab46827`, gallery), Address (`field_646aaec146828`, Google Map), and Video URL (`field_65934b49894c0`, URL).
- **SOURCE FACT:** Testimonials group has no field record listed in the export beyond its group definition; its data must be verified from the `testimonial` items.
- **INFERENCE:** The `City` field is page-specific landing-page metadata and should remain on the location/landing-page migration model; it is not a relationship to another ACF field and has no conditional logic in the exported field definition.

### WordPress metadata keys

Relevant keys include `rank_math_title`, `rank_math_description`, `rank_math_focus_keyword`, `rank_math_robots`, Rank Math schema keys, `_thumbnail_id`, `city`/`_city`, `header_overlay_style`/`_header_overlay_style`, `header_text_color`/`_header_text_color`, `video_url`/`_video_url`, `project_gallery`/`_project_gallery`, `address`/`_address`, and `team_member_position`/`_team_member_position`.

## 3. Gutenberg, Bricks, and runtime evidence

- **SOURCE FACT:** The export contains 24 `bricks_template` records and Bricks-related metadata including `_bricks_page_content_2`, `_bricks_editor_mode`, `_bricks_template_type`, `_bricks_page_settings`, header/footer metadata, and template settings.
- **SOURCE FACT:** The 45 location pages have empty `post_content`; the earlier runtime audit established that they also lack Bricks page content/editor mode/template type.
- **SOURCE FACT:** The main service pages contain Bricks/runtime content metadata, while location pages rely on the shared runtime mechanism.
- **INFERENCE:** Bricks templates and WordPress runtime code are source architecture evidence, not content collections to copy blindly into Payload. Payload should store the source-backed data and the frontend should render the shared reusable template.
- **UNKNOWN:** The WXR alone cannot prove every Bricks condition or every plugin/theme hook that executed on the live site. That requires the WordPress admin/runtime audit artifacts.

## 4. Location page generation check

- **SOURCE FACT:** All 45 expected Google/location-style pages exist in the XML: 15 kitchen, 15 bathroom, and 15 home-remodeling pages, including `...-in-san-jose`, `...-in-palo-alto`, and `...-in-silicon-valley` where present.
- **SOURCE FACT:** The current project has `serviceLocations`, the dynamic `/{serviceSlug}/{pageSlug}` compatibility route, and the Payload `ServiceLocations` collection.
- **SOURCE FACT:** The current sitemap emits the 45 preserved service-location URLs.
- **INFERENCE:** The location pages are generated at runtime from the service/location model rather than requiring 45 hand-built frontend page files.
- **UNKNOWN:** Whether every location record has already been imported into the current database cannot be established from this XML alone; query the Payload admin/database for the current count.

## 5. Pages present in WordPress but not previously dedicated in the frontend

The implementation now provides a reusable basic shell through the existing top-level dynamic route for these exported public pages:

`/team`, `/finance`, `/book-online`, `/remodeling-information`, `/customer-cabinet`, `/kitchen-remodeling-information`, `/bathroom-remodeling-information`, `/additions-remodeling-information`, `/comprehensive-home-repair-installation-services-in-silicon-valley`, `/home-remodeling-information`, `/outdoor-hardscape-outdoor-kitchen-information`, `/siding-installation-replacement-information`, `/privacy-policy`, and `/thank-you`.

- **SOURCE FACT:** These slugs are published pages in the WXR.
- **SOURCE FACT:** Most have empty `post_content`; `privacy-policy` has 5,225 characters and `customer-cabinet` has 156 characters.
- **INFERENCE:** The basic shell is intentionally a migration placeholder. It does not claim that empty WXR content is the complete rendered page content.
- **SOURCE FACT:** `sample-page`, `coming-soon`, and `ads-test1` are not treated as normal public redesign pages because they are a default/staging/test set; preserve them only if the deployment requires them.

## 6. C. Missing source-backed fields in the current Payload project

Payload itself can represent all of these values; the gap is in the current project model, not a Payload limitation.

- **SOURCE FACT:** Current config includes Services, Locations, ServiceLocations, BlogPosts, FAQs, Media, LandscapingPages, Users, and ConsultationTypes.
- **SOURCE FACT:** The current config does not include dedicated Team, Projects, Testimonials, SiteSettings/Options, or a general WordPress Pages collection.
- **MIGRATION GAP:** Team position and team records.
- **MIGRATION GAP:** Project gallery, Google Map address, video URL, and project relationships.
- **MIGRATION GAP:** Testimonial records and their source metadata.
- **MIGRATION GAP:** ACF Options company contact/review/business links.
- **MIGRATION GAP:** FAQ category taxonomy and ordering, if category-driven FAQ navigation must be editable.
- **MIGRATION GAP:** Media organization taxonomy, if media categories must be preserved in the CMS.
- **MIGRATION GAP:** The non-service WordPress page records and their source content.

## 7. D. Migration risks

- **RISK:** Empty `post_content` on location and service pages means an XML-only import will not reproduce the frontend; runtime/template behavior must remain represented by shared Payload renderers.
- **RISK:** Bricks content is serialized WordPress-specific data and should not be treated as portable Gutenberg content.
- **RISK:** 1,049 media records include duplicate optimization metadata and taxonomy organization; filename-only matching can create collisions or missing files.
- **RISK:** Rank Math title/description and schema metadata need explicit mapping into the existing SEO field group.
- **RISK:** ACF Options values are global and should not be duplicated into every page.
- **RISK:** Some published pages are utilities, staging pages, or form flow endpoints rather than public marketing pages.
- **UNKNOWN:** The export does not prove whether every external video URL is still reachable or whether a local uploaded video should replace it.

## Recommended migration order

1. Preserve the existing service, location, and service-location architecture.
2. Complete the missing shared collections: SiteSettings, Team, Projects, Testimonials, and general Pages as required by the final route inventory.
3. Import Media with attachment filename, alt text, source path, and relevant source categories.
4. Import Services and Locations, then ServiceLocations and verify all 45 preserved URLs.
5. Import FAQs with `faq-category`, then BlogPosts, Projects, Team, and Testimonials.
6. Import SEO values and verify canonical URLs, robots, descriptions, and featured media.
7. Replace the basic missing-page shells one page family at a time with redesigned reusable components.

No migration code or bulk data import is included in this blueprint.
