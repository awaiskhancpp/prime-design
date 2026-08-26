# Prime Design & Build content architecture

This is the planned CMS model. It records the intended content flow without changing Payload collections, globals, or the database yet.

## Current content flow

```text
website.json ───────────────┐
                            ├─ layout, header, footer, service areas, reviews
src/lib/projects.ts ────────┤
                            ├─ projects index and project detail routes
src/lib/gallery.ts ─────────┘
                              └─ gallery categories and image grids
src/lib/testimonials.ts ─────── testimonials page and review summaries
src/lib/blog.ts ─────────────── blog index and detail routes
```

The current frontend is intentionally working from local data while the page designs are being finalized. `website.json`, `src/lib/projects.ts`, `src/lib/gallery.ts`, `src/lib/testimonials.ts`, and `src/lib/blog.ts` are the temporary content sources. The frontend still uses local service data by design; the Payload collections provide the normalized CMS shape for the later data migration.

## Planned Payload collections

### Media

Already exists. Stores project, gallery, team, and review images.

Fields: `alt`, upload metadata, focal point/crop settings when needed.

### Projects

Replaces `src/lib/projects.ts`.

Fields:

- `title`, `slug`, `status`, `location`, `category`
- `summary`, `description`
- `heroImage` → Media relationship
- `gallery` → ordered Media relationship array
- `services` → relationship to Services
- `featured` and `sortOrder`
- optional `testimonial` relationship

Flow: `/our-projects` queries published Projects ordered by `sortOrder`; `/our-projects/[slug]` queries one Project by slug.

### Gallery Categories

Replaces `src/lib/gallery.ts`.

Fields: `title`, `slug`, `intro`, `images` as an ordered Media relationship array, `sortOrder`, and `visible`.

Flow: `/gallery` queries visible categories and renders one reusable gallery section per category.

### Testimonials

Replaces the featured testimonial records currently inside `website.json`.

Fields: `author`, `source`, `rating`, `date`, `summary`, `reviewUrl`, `featured`, and optional `avatar` → Media.

Flow: project pages can show related testimonials; projects index and About can query featured testimonials.

### Services

Fields: `title`, `slug`, `description`, `image`, `icon`, `featured`, `sortOrder`.

Flow: shared service cards and project metadata use one service record instead of repeating labels.

### Locations

Fields: `name`, `slug`, `seoDescription`, `featuredImage`, and reusable SEO fields.

Flow: one city record can be related to many service/location pages.

### Service Locations

Fields: `title`, `slug`, `service`, `location`, legacy `city`, optional `featuredImage`, optional hero/intro overrides, rich-text content, and SEO fields.

Flow: `/[serviceSlug]/[locationSlug]` resolves the relationship and renders the existing shared `ServiceDetailPage`. It does not duplicate the service layout or create one schema per city.

### Blog Posts

Now exists as the `blog-posts` collection. It models the current blog listing and detail page fields: title, slug, excerpt, categories, author, published date, hero image, intro, and ordered article sections.

## Repository audit

Currently registered in Payload: `users`, `media`, `landscaping-pages`, `blog-posts`, `faqs`, `services`, `locations`, and `service-locations`.

Still needed for the planned migration: `projects`, `gallery-categories`, and `testimonials`. The FAQ page now uses the hardcoded source extracted from the supplied FAQ markup; its `faqs` collection is ready for a later data migration. The site-wide settings currently living in `website.json` are better represented as globals: Site Settings, Navigation, Footer Settings, Review Settings, and Service Areas.

## Planned Payload globals

### Site Settings

Global source for site name, tagline, logo, phone numbers, email, license, addresses, hours, and default SEO.

### Navigation

Global source for primary navigation, dropdown items, and CTA link.

### Footer Settings

Global source for footer columns, service links, legal links, copyright, and footer CTA.

### Review Settings

Global source for Google/Yelp/Houzz/BBB summary values, review links, and the selected featured testimonials.

### Service Areas

Global source for heading, city list, trailing label, and contact link used by the shared service-area section.

## Future request/data flow

```text
Payload Admin
    │
    ├─ Site Settings / Navigation / Footer / Review Settings / Service Areas
    ├─ Projects ────────┐
    ├─ Gallery Categories│
    ├─ Services          ├─ Payload Local API / REST / GraphQL
    ├─ Testimonials      │
    └─ Media ────────────┘
                              │
                              ▼
             Next.js server components and route metadata
                              │
                              ▼
       /about  /our-projects  /our-projects/[slug]  /gallery
```

## Migration order

1. Create and seed Media records.
2. Create Services and Gallery Categories.
3. Create Projects and attach galleries.
4. Create Testimonials and Review Settings.
5. Create Site Settings, Navigation, Footer Settings, and Service Areas globals.
6. Replace local imports with server-side Payload queries.
7. Keep the component APIs unchanged so the visual layer does not need to be rewritten.

## WordPress service/location transform

`scripts/transform-wordpress-service-locations.ts` reads the WXR export and emits normalized records for the three WordPress parent service IDs (327, 337, and 335). It extracts the page ID, title, slug, parent service, `city`, thumbnail ID, and Rank Math description. It found 45 records and 15 cities in the supplied export. The script is intentionally a dry transformation step; media upload and Payload API import can run after the destination media records are available.
