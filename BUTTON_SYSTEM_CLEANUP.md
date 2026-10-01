# Button system — cleanup backlog

Dead, duplicated and inconsistent code found while making the site's buttons
consistent (October 2026). **Nothing here has been removed or changed.** It is
recorded separately, per the project owner's instruction, so that a cleanup
pass is a deliberate change rather than a drive-by edit — see CLAUDE.md §1.

None of it is a live crash. Items 2 and 3 are real visual/accessibility
defects; item 1 is inert.

---

## 1. The `ghost` button variant is unreachable, and broken if reached

`src/components/ui/Button.tsx` defines

```ts
ghost: 'border-transparent px-0 text-brass hover:text-brass-deep',
```

No call site in `src/` passes `variant="ghost"` — it is the only variant with
no usage at all (`outline-light`, which looks similarly unused, is reached by
`SiteHeader.tsx` for the non-light header).

Two things are wrong with it if anyone does reach for it:

- **Its `px-0` never applies.** `cva` emits variant classes before size
  classes, so every size's `px-*` wins under `tailwind-merge`. A `ghost`
  button renders with the horizontal padding it is trying to remove. This
  predates the current work — the same conflict existed between the old
  `px-0` and the old `px-4`/`px-5`/`px-6`.
- **Its resting colour fails contrast.** `text-brass` is `#C19A5B`, which is
  **2.6:1** against white — below WCAG AA at any size. Only its
  `hover:text-brass-deep` (4.8:1) passes.

Either delete it, or fix it to `text-brass-deep` and move the padding reset
somewhere that survives the merge. Deleting looks right — the `line` variant
already covers "a button that is really a text link", and `line` is the one
the site actually uses.

## 2. Two live implementations of the "Silicon Valley Loves" section

This is the CLAUDE.md §2 shape, again.

- `src/components/projects/ProjectsTrustIntro.tsx` — CMS-driven (heading,
  body and a `buttons` array with the `outline`/`brass` enum from
  `collections/fields/sectionGroups.ts`). Rendered by `ProjectsPage`,
  `ServiceDetailPage.tsx:563` and `ServiceLocationPage.tsx:343`. **This is
  what actually renders on the live pages** — confirmed by fetching
  `/services/kitchen-remodeling` and `/our-projects` and finding its CMS
  labels ("See our projects" / "Contact our team") under the "Silicon Valley
  Loves Working With Us!" heading.
- `src/components/services/sections/ServiceSiliconValleyLovesSection.tsx` —
  the older one, with the copy hardcoded ("See Our Projects" / "Contact our
  team", note the different casing) plus a stats strip the CMS version has no
  equivalent for. Still wired into `ServiceSectionRenderer.tsx:659`.

`ServiceLocationPage.tsx:228` already documents the swap in a comment:
"rather than the older `ServiceSiliconValleyLovesSection` this file used to
call". The service-page renderer was apparently never moved over.

Both were brought in line with the new button rules, so neither is visually
wrong today. The question to settle is whether `ServiceSectionRenderer`
should route this section type to `ProjectsTrustIntro` as well, and whether
the stats strip needs a home in the CMS version first. That is a content
decision, not a refactor.

### 2b. The CMS pair is ordered quiet-first

On `/services/kitchen-remodeling` and `/our-projects` the pair renders as
`outline` "See our projects" **then** `brass` "Contact our team". The arrow
rule is satisfied (it is on the second button), but the *loudest* button is
the second one, which inverts the usual hierarchy — normally the filled
button leads and the quieter one follows.

This order is Payload content, not code: `ProjectsTrustIntro` maps the
`buttons` array straight through. Flipping it is a CMS edit (or a deliberate
decision to sort filled-first in the component), so it was left alone.

## 3. Brass chips and tabs still set white text on brass

Outside the button system, several selected/active states use brass with
white text:

- `landing/GalleryGrid.tsx:144`
- `landing/LandingGalleryTabs.tsx:58`
- `landing/PrimeDifferenceMedia.tsx:91` and `:156`
- `landing/VideoCarousel.tsx:79`
- `contact/AppointmentModal.tsx:797` (the selected time slot)

White on `#C19A5B` is **2.6:1**, which fails WCAG AA. `faq/FaqExplorer.tsx:264`
and `testimonials/ReviewHighlights.tsx:384` already use `text-ink` on brass
(6.1:1) for the same kind of state, so the correct value is already in use
elsewhere in the codebase — these six are the stragglers.

They were left alone because they are tabs, chips and pagination dots rather
than call-to-action buttons: a different component family with its own sizing
and shape, and folding them into `Button` would be a visual redesign rather
than a consistency fix.
