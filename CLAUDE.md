
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

## 8b. Migrations: generate them, then check them against the database

`migrate:create` was blocked until 2026-09-30 because the newest `.json`
schema snapshot was 55 migrations out of date (every migration after
`20260914_180701_video_story_fields` was hand-written SQL with no snapshot), so
a generated migration would have read those tables as removals and emitted
`DROP`/`RENAME` against live data.

That is fixed. `20260930_200000_baseline_schema_alignment` ships a snapshot
generated from the config itself, plus the small SQL needed to make the
database match it (missing indexes, two varchar→enum columns, NOT NULLs). It
was built on a restored copy of production and verified there: after it,
`migrate:create --skip-empty` produces nothing. The guard script is gone.

How to change the schema from now on:

1. Change the config.
2. `pnpm migrate:create <name>` — review the generated `up` line by line
   before applying. If it prompts "created or renamed?", the answer is almost
   always *create*; a rename prompt you did not expect means the config is
   dropping something.
3. `pnpm payload migrate`, then `pnpm schema:check`
   (`scripts/schema-drift.ts`): it compares the config with the **real
   database** — tables, columns, types, nullability, enums, indexes, foreign
   keys — rather than with a snapshot. Expected output: `0 difference(s)`.
   (The leftover tables from older schema shapes were checked and dropped in
   `20260930_221100_drop_orphaned_tables`.)

**Block table names.** Payload stores one table per block slug per
collection. If one collection has two block definitions with the same slug
but different fields, the second gets a `…_2` table. Removing the first then
makes the generated migration drop the `_2` table and create a fresh one,
**losing its rows**. The services Page Builder's `gallery`, `image-text`,
`sub-services` and `video` blocks live in `_2` tables for this reason and are
pinned with `dbName` (`SERVICE_BLOCK_TABLES` in `src/blocks/LandingPageBlocks.ts`).
A `DROP TABLE` of a table with rows in a generated migration is always a
reason to stop and look.

**Removing blocks shifts relationships.** A relationship inside a block is
stored by the block's *index*: `services_rels.path =
'sections.6.categories.0.faqOrder'`. Deleting blocks from a list (a block
type, or rows) moves every later block down, and the generated migration does
not rewrite those paths — the relationship silently lands on the wrong
section. See `20260930_220900_renumber_service_section_rels` for the fix
pattern; run it before the drop.

**Never edit, rewrite or delete an existing migration file to make a diff
come out clean.** They have already run against production; rewriting them
makes the applied state and the file history disagree.

## 8c. Accepted divergences from the WordPress source

These differ from the WordPress export **on purpose**. Do not "fix" them back
without asking — each was a decision, not a migration error.

- **`/thank-you` is `noIndex`; WordPress serves it `follow, index`.** A
  post-submission confirmation page has no business in search results, which
  is what the `noIndex` field's own description in
  `src/collections/fields/SEO.ts` says ("Tick only for pages that should stay
  out of Google (thank-you pages, duplicates)"). The value lives on the
  `thank-you` pages record, so the CMS can change it; `/thank-you/page.tsx`
  additionally defaults to `noIndex: true` when the record is missing, so a
  deleted row cannot quietly start indexing it.

- **`/thank-you`'s meta description is authored, not migrated.** WordPress
  emits none at all for that page. "Thanks for getting in touch — a member of
  our team will be with you shortly." was written for this site. The same is
  true of the page body: WordPress has a heading and two sentences ("Thank You
  / For contacting us. Your submission have been received. Our team will get
  back to you soon."), where this site has a hero, a "What happens next" list
  and an "In the meantime" link row. All of it is in the CMS now — the page
  record's `hero`, a `next-steps` block and a `link-list` block.

- **The privacy policy names Prime Design & Build, WordPress names Prime
  Kitchens.** The live WordPress page still opens "This Privacy Policy
  describes how Prime Kitchens…" and closes with `1729 N First St, San Jose,
  CA 95112` and `office@primekitchens.net` — the former trading name and an
  address the company has left, so a visitor exercising a right under the
  policy would write to a dead mailbox. The opening paragraph now names the
  current company, the Rank Math meta description was corrected the same way,
  and the closing contact block is no longer copy at all: `PolicySections`
  prints the name, first address and email from the Site Settings global, so
  the policy cannot fall out of step with the rest of the site again. The
  eight numbered sections are the WordPress wording, unchanged.

- **Prime Difference icons are brass, WordPress is black.** WordPress uses
  wp 901 `Customer-Focused.svg`, 897 `Innovation.svg`, 898 `Process-2.svg` and
  902 `Process-1.svg`, and all four carry hardcoded black fills (`#100f0d` on
  the first, `#000000` on the rest). The site renders the local `/public`
  equivalents instead — `customer-satisfaction.svg`,
  `professional-expertise.svg`, `attention-to-detail.svg`,
  `quality-craftsmanship.svg` — which are `#c19a5b` brass. Applied to the
  Shaker Kitchen page and, consistently, to the service-location pages.
  Reverting would turn every one of these icons black. The WordPress originals
  remain in the Media collection if that is ever wanted.

  (A comment in `scripts/fix-shaker-prime-icons.mjs` used to claim the
  WordPress SVGs relied on `currentColor` and lost their colour through an
  `<img>` tag. They do not — the fills are literal. The script's docstring has
  been corrected.)

- **The footer's "Home Remodel" links to Home Remodeling; WordPress sends it
  to Complete Renovation.** The label says home remodel, so it goes to
  `/services/home-remodeling`. Every other header and footer label is
  WordPress's own wording, kept as it is even where it differs from the
  service's title ("ADU" in the header, "ADU" and "Garage Conversion" as two
  footer links to the same page): they live in the Navigation global
  (`src/globals/Navigation.ts`), editable per place.

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