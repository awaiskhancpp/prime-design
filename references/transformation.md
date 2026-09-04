# Transformation Reference

Layers:
```text
raw WP → normalized source → semantic section → Payload block
```

Keep the layers traceable.

For each mapping inspect text, media, links, business meaning, surrounding section, and order.

If a target link is required:
```ts
link: {
  label: string,
  url: string,
  openInNewTab: boolean
}
```
always emit valid values.

Resolve links in this order:
1. explicit source URL,
2. source WP post ID,
3. controlled slug/title fallback.

For dynamic content, preserve query constraints such as:
- post__in
- posts_per_page
- order/orderby
- taxonomy filters
- post type

Repeated source sections should retain unique source IDs.
