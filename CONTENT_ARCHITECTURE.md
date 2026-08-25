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
```

The current frontend is intentionally working from local data while the page designs are being finalized. `website.json`, `src/lib/projects.ts`, `src/lib/gallery.ts`, and `src/lib/testimonials.ts` are the temporary content sources.

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
