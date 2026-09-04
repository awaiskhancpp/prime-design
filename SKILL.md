---
name: wordpress-to-payload-migration
description: Use when migrating WordPress, especially WordPress + Bricks Builder, into Payload CMS with a Next.js frontend. Enforces extract → model → transform → load → verify → redirect; preserves legacy IDs, URLs, relationships, media, SEO, section order, and visual/interactive fidelity; makes loaders idempotent; and requires source/schema/renderer/runtime verification before changing migration code.
---

# WordPress → Payload CMS Migration

## Mission

Treat WordPress → Payload as controlled ETL, not blind export/import.

Primary objective: preserve source content, structure, relationships, media, SEO, URLs, and important behavior while transforming them into a typed Payload model and reusable Next.js rendering architecture.

For WordPress + Bricks, interpret Bricks semantically. Never assume an element name alone determines the target Payload block.

## Non-negotiable rules

### 1. Source truth
The original WordPress data is the source of truth.

Prefer:
1. Direct DB access when available.
2. Complete WXR/XML export.
3. REST API when appropriate.
4. Screenshots/rendered pages for visual verification.

Never invent missing source content. If ambiguous, inspect more source data.

### 2. Extract before transforming
Extract once into replayable local data. Do not repeatedly transform live against WordPress.

Recommended:
```text
WordPress → raw extraction → normalized JSON → transform → Payload
```

Preserve WP ID, post type, status, slug, title, original content, metadata, taxonomy/media IDs, original permalink, Bricks element/source IDs, and source ordering.

### 3. Model before migration code
Inspect the actual Payload schema first.

Map:
```text
WP post_type → Payload collection
```

Use typed fields rather than reproducing wp_postmeta as generic key/value data.

Carry stable identifiers such as:
```text
legacyWpId
legacySlug
legacyPermalink
sourceId
```

### 4. Preserve page order
For Bricks/visual-builder pages, order is content.

Prefer ordered blocks:
```ts
sections: [
  { blockType: "hero", ... },
  { blockType: "sub-services", ... },
  { blockType: "gallery", ... },
  { blockType: "booking", ... },
]
```

Do not replace genuinely different source structures with fixed slots. Preserve repeated block types as separate ordered blocks. Use a unique source ID for repeated blocks; blockType alone is unsafe.

### 5. Semantic transformation
Transform source structures into the semantic components the new site needs.

For each source element determine:
- real content vs decoration,
- text,
- links,
- media,
- business meaning,
- existing target component,
- source ordering,
- dynamic query behavior.

### 6. Never silently discard unsupported content
Every unsupported item must be classified:
```text
SUPPORTED
PARTIAL
SPECIAL_INTEGRATION
INTENTIONALLY_OMITTED
BLOCKED
```

Record page, sourceId, semantic type, reason, and planned handling.

### 7. Imported ≠ complete
`IMPORTED` only means data was written.

It does not prove fields, media, relationships, rendering, visual fidelity, forms, or redirects.

Use:
```text
EXTRACTED → TRANSFORMED → IMPORTED → RENDERED → VERIFIED → COMPLETE
```

### 8. Diagnose by layer
Trace missing content through:
```text
WordPress source
→ extraction
→ normalization
→ transformer
→ Payload
→ frontend fetch
→ block normalization
→ renderer registry
→ component
→ browser
```

Do not jump straight to the importer or renderer.

### 9. Verify runtime environment
Migration and frontend processes are separate.

Verify the browser-serving process has the intended DATABASE_URL, Payload config, storage, API URL, and feature flags.

During migration verification, do not silently replace DB data with placeholders. Prefer an explicit development error when a required DB connection is missing.

## Phase 1 — Extract

Create:
```text
migration/
├── raw/
├── normalized/
├── reports/
└── scripts/
```

Keep raw source immutable.

For `_bricks_page_content_*`:
- parse the stored structure,
- retain element IDs,
- retain parent/child relationships,
- retain order,
- retain relevant settings,
- retain dynamic query configuration,
- retain links/media IDs.

## Phase 2 — Model

Inspect the real project's collections and components before creating new architecture.

Typical concepts may include:
```text
Media
Services
Locations
ServiceLocations
LandingPages
Projects
Posts
Categories / Tags
```

Use the project's actual domain model rather than forcing this list.

### Service + ServiceLocation
When city pages inherit service content:
```text
Service
  ↓
ServiceLocation ← Location
```

ServiceLocation should normally contain sparse overrides rather than a duplicated service page.

## Phase 3 — Transform

Choose:
```text
normal WordPress HTML → Lexical/rich text
structured Bricks → semantic Payload blocks
```

Maintain an explicit mapping table and verify every mapping against source data.

### Links
If the target requires:
```ts
link: {
  label: string
  url: string
  openInNewTab: boolean
}
```
always emit valid values. Resolve explicit URL first, then WP post ID, then controlled slug/title fallback. Never emit an empty required link object.

### Media
Preserve attachment ID, filename, alt text, source URL, relationships, and useful metadata. Build an attachment-ID map.

For dynamic galleries, preserve `post__in`, `posts_per_page`, ordering, taxonomy filters, and post type. Never replace a scoped source query with all records.

## Phase 4 — Load

Load dependencies in this order:
```text
media → taxonomies → content → relationships
```

Use a second relationship pass when necessary.

### Idempotency
Upsert using stable legacy identity:
```ts
find by legacyWpId
if exists: update
else: create
```

Repeated runs must converge without duplicates.

### Side effects
During bulk loads, control revalidation, search indexing, webhooks, emails, and external APIs using mechanisms the project actually implements. Never invent unsupported context flags.

## Phase 5 — Verify

### Structural
Check counts, IDs, required fields, relationships, media references, and slugs.

### Semantic
Check that stored content corresponds to source content.

### Renderer
Confirm blockType → registry → renderer → component field shapes.

### Visual/interactive
Compare original and new pages for:
- order,
- typography,
- spacing,
- colors,
- images/overlays,
- cards/buttons,
- responsive behavior,
- galleries,
- tabs,
- forms,
- modals,
- CTAs,
- navigation/footer.

If the same visual/function appears on many pages, fix the shared component once.

## Forms, modals, integrations

Treat source behavior as first-class content.

Examples:
- appointment modal,
- contact form,
- booking,
- review tabs,
- video embeds,
- dynamic galleries.

A source appointment flow must produce a real trigger and working modal/form in the new site. Do not reduce it to a static placeholder.

## WordPress + Bricks special cases

### Shortcodes
A Bricks shortcode may delegate rendering to a WordPress plugin. XML may contain only the shortcode, not generated HTML. Model the integration; never fabricate plugin output.

### Tabs
Inspect actual tab labels/settings. Two tabs may be Google/Yelp reviews, not arbitrary categories.

### Dynamic queries
Preserve exact query constraints such as `post__in`.

### Repeated blocks
If source order is:
```text
gallery → sub-services → gallery
```
store separate blocks in that order.

## Unsupported-section decision tree

```text
Meaningful source content?
  ├─ no → intentionally omit with reason
  └─ yes
      ↓
Existing target component?
  ├─ yes → map data
  └─ no
      ↓
Special integration?
  ├─ yes → implement integration
  └─ no → create reusable block
```

## Migration debugging protocol

When something is missing:

1. Find exact source element.
2. Check normalized extraction.
3. Check transformer output.
4. Check Payload stored data.
5. Check frontend fetch.
6. Check registry lookup.
7. Check renderer field expectations.
8. Check component rendering.
9. Check runtime environment.
10. Only then modify code.

Fix the first layer where expected data disappears.

## Redirects and SEO

Preserve old identity where useful:
```text
legacyWpId
legacySlug
legacyPermalink
```

Use:
```text
301 → permanently moved
410 → intentionally removed
```

Verify old URL → expected status → new URL → correct content.

Also check metadata, canonical URLs, sitemap behavior, and internal links.

## Localization

If multilingual:
1. identify translation groups,
2. import original language first,
3. create one Payload document,
4. layer translations onto that same ID,
5. map locale codes,
6. merge localized arrays carefully.

Payload localizes fields, not arrays. Read all locales, match repeating rows by stable keys, preserve row IDs, merge, then write the complete locale state.

## Completion definition

```text
[ ] source extracted
[ ] target schema approved
[ ] media migrated
[ ] content migrated
[ ] relationships resolved
[ ] SEO migrated
[ ] unsupported content handled
[ ] renderer fields verified
[ ] interactive features verified
[ ] visual comparison completed
[ ] old URLs mapped
[ ] redirects verified
[ ] counts reconciled
[ ] migration rerunnable
[ ] production environment verified
```

Never report "done" merely because the migration command succeeds.

## AI working style

Before changing code:
1. Inspect repository.
2. Inspect actual source.
3. Inspect target schema.
4. Inspect relevant renderer/component.
5. State evidence-backed root cause.
6. Make the smallest correct change.
7. Run migration/test.
8. Inspect resulting data.
9. Verify browser output.
10. Report remaining work.

Avoid speculative rewrites, repeated schema changes without evidence, invented content, premature deletion of legacy fields, duplicate page implementations, and declaring success from DB writes alone.

When under time pressure, make one representative page correct, build shared components, prove the mapping, then scale it.
