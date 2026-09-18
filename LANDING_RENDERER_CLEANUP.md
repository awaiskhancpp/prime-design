# Landing renderer — cleanup backlog

Dead and near-duplicate code found while auditing the Google Ads landing
pages (September 2026). **Nothing here has been removed.** It is recorded
separately, per the project owner's instruction, so that a cleanup pass is a
deliberate change rather than a drive-by edit inside a content migration —
see CLAUDE.md §1.

All of it is *currently unreachable or inert*, so none of it is a live bug.
The reason to deal with it is CLAUDE.md §2: this file is exactly the shape
that has already caused the "a generic component quietly renders the section
instead of the designed one" failure on this project, more than once.

---

## 1. Three unused inline renderers in `LandingBlockRenderer.tsx`

ESLint flags all three as defined-but-never-used. Each is an inline,
lower-fidelity implementation of a section that **also** has a dedicated
component, and the dedicated component is the one wired into
`landingBlockRegistry`.

| Function | Line (approx.) | Live component that actually renders this block |
|---|---|---|
| `FeatureBlock` | 370 | *(none — no block type maps to it at all)* |
| `ServiceAreasBlock` | 402 | `LandingServiceAreasSection` |
| `RepairServicesBlock` | 438 | `LandingRepairServicesSection` |

`ServiceAreasBlock` and `RepairServicesBlock` are the concerning ones: both
render the same `service-areas` / `repair-services` block types as the
registered components, with plainer markup and different copy handling. If
either were ever wired back into the registry — or if someone reached for
"the one in the renderer file" — the page would silently lose the designed
section. `FeatureBlock` is orphaned outright; no block type references it.

`GalleryBlock`'s final `else` branch is a fourth, milder instance: it renders
a bare heading/description `<Section>` when a gallery block has neither
groups nor items. That one is a legitimate empty state, not a duplicate, and
should stay.

**Suggested resolution:** delete `FeatureBlock` outright. For
`ServiceAreasBlock` and `RepairServicesBlock`, confirm the registry entries
(`'service-areas'` and `'repair-services'`) cover every field the inline
versions read, then delete them too. Do this as its own commit, with the
landing pages loaded before and after.

## 2. `Link` import in `LandingServicesSection.tsx`

Unused because the per-card "View project →" link is commented out (it was
commented out before this audit, not by it). Either restore the link — the
`sub-services` block does carry a `link` group per item, and
`SubServicesBlock` already maps it into `item.link` — or remove both the
commented JSX and the import. Restoring it is probably right: the source
cards on `wekxhi` do link to their service pages, so the data is real and is
currently being dropped at render time.

## 3. Two near-duplicate gallery grids

Not dead code, but the same §2 pattern and worth recording:

- `src/components/gallery/GalleryTab.tsx` — tabs + grid + lightbox.
- `src/components/landing/GalleryGrid.tsx` + `LandingGalleryTabs.tsx` —
  tabs + grid, paginated.

The landing pair grew up without a lightbox even though the WordPress
HappyFiles galleries it replaces set `lightbox: true`. That has now been
fixed by having `GalleryGrid` use the existing
`src/components/gallery/Lightbox.tsx` rather than growing a second viewer —
but the two grid implementations still exist side by side and drift is
likely. Consolidating them is a larger change and needs sign-off.

## 4. `LandingBenefitsSection` and `LandingCraftsmanshipSection` overlap

Both render a staggered row of photo cards (image + heading + a line of copy)
from a block shaped `{ eyebrow, heading, items[], decorativeMedia }`:

- `craftsmanship` — `crempi`, "Remodel Your Entire Home…": 3 columns, the
  section copy occupies the first column beside the cards, and it also
  carries uncaptioned standalone photos (`images[]`).
- `benefit-cards` — `d1126c`, "Benefits of Siding": 4 equal columns, the
  section title sits above the row, no standalone photos.

They were kept separate deliberately: consolidating them means changing how
`craftsmanship` renders on remodeling-information, which is already signed
off, and CLAUDE.md §1 wants that asked rather than done in passing. The
unifying model if it is ever worth doing is "N columns, column 1 may lead
with the section copy, each column holds cards and/or bare photos, the last
may carry a decorative graphic" — which both are instances of.

Note the block slug is `benefit-cards`, not `benefits`: the Services
collection already defines its own `benefits` block, and reusing the slug
would have produced a second `services_blocks_benefits_2` table plus two
entries both labelled "Benefits" in the Services block picker.

## 5. `landingBlockRegistry` / `sharedSectionRegistry` alias

`export const sharedSectionRegistry = landingBlockRegistry` — the same object
under two names, both exported. Worth checking whether any caller depends on
the alias, and collapsing to one name if not.

---

### Not in scope for this note

The `Landscaping*` / `Home*` homepage naming split and the `AppointmentModal`
width inconsistency are already recorded as known debt in CLAUDE.md §9.
