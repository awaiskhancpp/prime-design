# Extraction Reference

## Source priority
1. Direct WordPress DB
2. WXR/XML
3. REST API
4. Screenshots/rendered pages for visual verification

Screenshots are not a substitute for structured source data.

## Minimum normalized record

```json
{
  "wpId": 123,
  "type": "page",
  "status": "publish",
  "slug": "example",
  "title": "Example",
  "contentHtml": "...",
  "meta": {},
  "legacyPermalink": "/example/"
}
```

Also preserve attachment IDs, taxonomy IDs, Bricks element IDs, source ordering, and dynamic query settings.

## Bricks extraction
When `_bricks_page_content_*` exists:
- parse the structure,
- retain element IDs,
- retain order,
- retain parent/child relationships,
- retain relevant settings,
- retain links/media,
- retain dynamic queries.

Extract once; transform repeatedly.
