# WordPress + Bricks Special Cases

## Shortcodes
Bricks shortcodes may delegate rendering to plugins. XML may contain only the shortcode, not the final HTML.

Do not fabricate generated plugin markup. Reproduce the intended integration with a real component.

## Tabs
Inspect actual labels and source settings. A review widget may have Google/Yelp tabs; do not infer unrelated categories from tab count.

## Dynamic galleries
Preserve exact query constraints, especially `post__in`. Never replace a scoped project list with all projects.

## Repeated sections
If source order is:
```text
gallery → sub-services → gallery
```
keep separate ordered blocks.

## Reusable components
If a visual/function appears on many pages, determine whether it is a global/shared source component or repeated local content. Prefer one reusable React component with page-specific data.
