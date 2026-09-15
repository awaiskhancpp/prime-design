
# CLAUDE.md

## Project context

This is a WordPress → Next.js (App Router) + Payload CMS migration for Prime Design & Build,
a Silicon Valley remodeling contractor. The source is a Bricks Builder WordPress site exported
as WXR/XML. Content is migrated in phases by slug-targeted scripts (`scripts/migrate-*.ts`,
`wordpress-migration/*`) that parse the Bricks-serialized tree and write Payload records.

Read this file before touching `payload.config.ts`, any file in `src/collections/`,
`src/migrations/`, `src/blocks/`, or any `scripts/migrate-*.ts` script. If a task looks like it
touches one of the rules below, stop and follow the rule rather than using judgment in the
moment — every rule here exists because the default judgment call already went wrong once on
this exact project.

---

## 1. Ask before changing anything already decided

Established decisions on this project are not neutral defaults you should feel free to
"improve" — they were made deliberately, sometimes after redoing them once already. Before
changing any of the following, stop and ask, don't just proceed:

- The shape of a Payload field (e.g. `blocks` vs `tabs` vs `group`) for a collection that
  already has real content in it.
- Which component renders a route or section (e.g. `ServiceTemplate`, `LandingBlockRenderer`,
  anything in `src/components/services/sections/`).
- `next.config.ts`, `payload.config.ts`, or anything in `src/migrations/`.
- Deleting or emptying a `lib/*.ts` fallback object (e.g. `lib/services.ts`'s
  `serviceDetails`) — these are intentional dev fallbacks, not dead code.
- File/folder naming conventions, even ones that look inconsistent (see §9).

"This would be cleaner if I restructured it" is not sufficient justification mid-task. If you
notice something like that, say so and ask, rather than doing it as a drive-by.

## 2. Never re-introduce a parallel implementation of the same section

**This is the bug that has actually happened, more than once, on this project**: a section
gets a real, designed component in `src/components/services/sections/` or similar — and then
a *different*, generic component (a `Landing*` component, a second `Gallery*` component, etc.)
quietly renders the same content instead, because some code path routes through it by default.

Concretely: `ServiceTemplate` and `ServiceLocationPage` both had an early-return branch that,
the moment `service.sections?.length` was truthy, rendered everything through
`LandingBlockRenderer` — the exact same generic components used for Google Ads landing pages
— completely bypassing every hand-designed `services/sections/*` component. The result looked
like a different, worse site. The fix was not "delete the generic renderer"; it was "route
each real section type to the component that was actually designed for it."

Before writing a new component for a section: **search for whether one already exists.**
`src/components/services/sections/`, `src/components/landing/`, and `src/components/gallery/`
have all independently grown near-duplicate implementations of the same conceptual section at
different points in this project. If you find two, that's a bug to flag, not a naming
coincidence to leave alone.

## 3. Preserve section order. Never duplicate a section.

Section order on a page is a content decision (`sectionOrder`, or the order fields are defined
in a schema/tab), not an implementation detail. Refactoring how sections render must not
silently reorder them.

Watch for the same underlying content being counted as two sections — this happened during
migration when a `video`/`carousel` block immediately following a `prime-difference` block was
actually one WordPress section, not two, and needed to be merged before mapping (see the
`mergedFollowOnIds` logic in `migrate-services.ts` / `migrate-landing-pages.ts` for the
established pattern). If a new content type has this shape, merge at the same stage, using the
same reasoning — don't render both and end up with the same video twice.

## 4. Migrating content into a component is a data-plumbing change, not a redesign

When wiring real Payload/WordPress content into a component that currently has hardcoded
content: the only correct diff is *static value → prop*. JSX structure, class names, and
visual output must not change. If you notice the design could be better while you're in there
— say so separately; don't fix it in the same change.

If the real WordPress content includes something the component has no slot for (a button, an
image, a list item, a whole field), **add the missing prop** rather than dropping that content
on the floor. This project's standing rule, stated by the project owner directly: "even if my
sections have missing fields, add those fields." Never silently truncate real content to fit
an existing prop shape.

## 5. Content fidelity: real WordPress content only, never invented copy

Migrated content must match the real WordPress source — actual headings, actual body copy,
actual specific details (a real address, a real reason list, a real step). Never fabricate
placeholder copy to fill a gap, even a small one, even temporarily.

If a field genuinely has no WordPress source for a given page, leave it disabled/empty and
**report the gap explicitly** — this project already has an established pattern for this
(unresolved ACF tokens and unsupported/skipped sections are both logged by name in
`migrate-landing-pages.ts` and `migrate-services.ts`'s console output). Extend that same
reporting habit to any new gap you find; don't paper over it.

## 6. Payload is the source of truth. Verify it actually is — every time.

This is the thing the project owner is most concerned about, and it deserves its own checklist
because "looks dynamic" and "is dynamic" have already been confused once on this project (a
page can render correctly purely because a hardcoded fallback happens to match reality, while
the actual CMS wiring is broken or absent).

Before calling any "make X dynamic" task done, check all three of the following, not just the
first one that's convenient to check:

1. **Schema**: does the Payload collection/global actually have a field for this content?
2. **Data**: is the real database row actually populated — checked by reading the real value
   back (`payload.find()` / a direct query), not just by re-reading what the migration script
   computed in memory before writing?
3. **Render path**: does the component actually render from the fetched Payload value, or does
   it silently fall through to a hardcoded default because the fetch returned empty/undefined?
   A component with a fallback default will look identical in both cases — you have to check
   which path actually executed, not just what appeared on screen.

`lib/services.ts`, `website.json`, and similar objects are **local-dev fallbacks for working
without a database connection** — never treat their presence as evidence that a page is
CMS-driven, and never treat them as the place new real content should live once a Payload
field exists for it.

## 7. Payload conventions to actually follow (not just "some CMS pattern")

- **Fixed, per-page-family repeating structure → `tabs`/`group` fields with `enabled` flags,
  not an open-ended `blocks` array.** Services pages reuse ~15 known section types across all
  9 pages; that's a fixed vocabulary, and `blocks` (meant for genuinely unpredictable,
  admin-composed layouts) is why content drifted across pages in the first place — nothing
  stopped the same generic copy from rendering on six different pages. Landing pages are the
  opposite case (genuinely arbitrary per-page composition) and correctly use `blocks`. Match
  the field type to which of these two situations you're actually in.
- **Media belongs in the `Media` collection as real uploaded documents**, not as a permanent
  external `sourceUrl` string. `sourceUrl` is a legitimate *during-migration* provenance value
  for tracing back to the original WordPress attachment — the migration isn't finished until
  the binary is actually imported and the reference points at a real Payload media document ID.
- **Relationships are Payload relationship fields**, not hand-synced duplicate slug strings
  (see `Service.parentService`, `ServiceLocation.service`/`.location` for the pattern already
  in use — follow it, don't add a new string-slug-matching scheme next to it).
- **Schema changes reach the database only through a real, committed migration file**, applied
  and confirmed against the actual schema — not through `push: true` dev-sync left to diverge
  from what's committed. (`scripts/baseline-migrations.ts` exists specifically to reconcile one
  case where that already happened; treat it as a repair for a one-time incident, not a
  routine tool.)
- **One real, singleton thing on the whole site → a Payload Global, not a Collection.** There
  is one homepage; if it becomes CMS-driven, model it as a Global (see `SiteSettings.ts` for
  the existing convention on this project), not as a one-record Collection.

## 8. Definition of "done"

Never report a migration or feature as done because the code compiles or nothing throws.
Required, every time:

1. Load the actual page (or query the actual row) and compare it **section by section**
   against the real WordPress source — quote the specific real heading/copy you're checking
   against, don't eyeball "looks about right."
2. Confirm the migration actually ran against the real database — check `payload_migrations`
   or an equivalent schema inspection, not just that the migration command exited 0.
3. Confirm the specific named gaps for that task (if any were identified going in) are
   actually closed, one by one — not just that the general shape of the page looks complete.

## 9. Known debt — don't silently "fix" it, but do know it's there

- Homepage components are split between a `Landscaping*` naming scheme and a `Home*` one
  (`LandscapingHero`, `LandscapingIntro` next to `HomeProjects`, `HomeServices`) — leftover
  from a landscaping-template starter this project was built from. It's real, it's confusing,
  and renaming it is a big enough change to need explicit sign-off first (see §1).
- `AppointmentModal`'s container height is fixed across steps; width still isn't
  (`max-w-lg` on the last step vs `max-w-4xl` elsewhere) — a known, still-open inconsistency,
  not something already resolved.

## 10. How to report your work

State plainly: what changed, which real WordPress content backs it (quote it briefly so it's
checkable), what you verified and how (per §8), and any gap you left open and why. If you
found a duplicate implementation, a content mismatch, or something that looks CMS-driven but
isn't, say so explicitly rather than quietly working around it.