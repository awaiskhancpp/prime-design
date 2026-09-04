# Payload Modeling Reference

Model domain concepts, not WordPress's implementation details.

Avoid reproducing `wp_postmeta` as arbitrary key/value storage.

Use stable migration identity where useful:
```text
legacyWpId
legacySlug
legacyPermalink
sourceId
```

For structured pages:
```ts
sections: [
  { blockType: 'hero', sourceId: 'abc', ... }
]
```

This supports variable composition, repeated block types, ordering, and sparse overrides.

For inherited service/location pages:
```text
Service
 ├── sections
 └── metadata

ServiceLocation
 ├── service
 ├── location
 └── sectionOverrides
```

Do not duplicate service content into every location unless the source is genuinely city-specific.

Do not change schema merely to accommodate a malformed transformed record; first inspect the source and transformer.
