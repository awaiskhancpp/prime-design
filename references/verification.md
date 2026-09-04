# Verification Reference

Four levels:

1. Structural — expected documents/blocks exist.
2. Semantic — stored fields represent source content.
3. Rendering — registry/renderer/component field shapes match.
4. Visual/interactive — browser matches source design and behavior.

Missing-content trace:
```text
WP → normalized JSON → transformer → Payload → fetch → registry → renderer → component → browser
```

Stop at the first layer where data disappears.

Verify that the browser-serving Next.js process uses the intended database/environment. A migration script connecting successfully does not prove that `next dev` uses the same DB.

Use separate statuses:
```text
IMPORTED
RENDERED
VERIFIED
COMPLETE
```
