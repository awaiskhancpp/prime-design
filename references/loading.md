# Loading Reference

Dependency order:
```text
media → taxonomies → content → relationships
```

Use idempotent upserts keyed by stable legacy identity.

```ts
const existing = await findByLegacyId(legacyWpId)
if (existing) {
  await update(existing.id, data)
} else {
  await create(data)
}
```

Repeated runs must not duplicate records.

Bulk writes may trigger revalidation, indexing, webhooks, emails, or external APIs. Disable them only through mechanisms actually implemented by the project.

A successful write is an import result, not proof of completeness.
