# Migration Workflow

Canonical pipeline:

```text
EXTRACT → MODEL → TRANSFORM → LOAD → VERIFY → REDIRECT
```

Recommended layout:
```text
migration/
├── raw/
├── normalized/
├── reports/
└── scripts/
```

Keep raw source immutable. Regenerate normalized data from it.

Stage outputs:
- Extract: raw + normalized source
- Model: approved Payload schema
- Transform: target-shaped documents
- Load: Payload records/uploads
- Verify: reconciliation + rendering report
- Redirect: old URL → new URL map

If time is limited:
1. Make one representative page correct.
2. Make shared components reusable.
3. Prove the importer.
4. Scale the mapping.
5. Reconcile all pages.
6. Verify redirects.
