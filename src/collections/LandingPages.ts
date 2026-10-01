import type { CollectionConfig } from 'payload'
import { landingPageBlocks } from '../blocks/LandingPageBlocks'
import { SEOFields } from './fields/SEO'

/**
 * Google Ads landing pages.
 *
 * ── Why the sections are a block list and not tabs ────────────────────────
 *
 * The Service Locations collection gives every section its own admin tab,
 * because all 45 of those pages are the same template in the same order: a
 * tab per section is a complete, predictable map of the page. Landing pages
 * are the opposite case and the difference is worth stating, because tabs
 * look like the tidier answer from the outside.
 *
 * The seven pages share no fixed vocabulary. `remodeling-information` carries
 * fifteen sections including craftsmanship, experience-difference, service
 * areas, FAQ, testimonials and booking; `home-remodeling-information` has ten
 * and none of those six, and it is the only page with `gallery-carousel`.
 * Several pages use the same block twice — two `sub-services` sections on the
 * home page, `cta` in two different places elsewhere — and the order differs
 * per page because it came from each WordPress page's own layout.
 *
 * A fixed tab per section type would therefore show every editor a row of
 * tabs mostly leading to empty forms, would silently drop the second copy of
 * any repeated section, and would lose the per-page order entirely — the one
 * thing §3 of CLAUDE.md says must never be treated as an implementation
 * detail. So the sections stay an ordered block list, and the admin work goes
 * into making that list legible instead: rows labelled with their own heading
 * (`BlockRowLabel`), collapsed by default so the page is a readable outline,
 * and everything that is *not* a section moved out of the way into tabs.
 */
export const LandingPages: CollectionConfig = {
  slug: 'landing-pages',
  // Every save is kept (Version History): compare and restore any of the last 20.
  versions: { maxPerDoc: 20 },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'service'],
    description: 'Google Ads landing pages with ordered, reusable content sections.',
    group: 'Marketing',
  },
  fields: [
    // Identity stays outside the tabs: these are the fields an editor needs
    // to see whichever tab they are on, and the two required ones must never
    // be hidden behind a tab that is not open.
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    // `template` (one option, never read) and the Campaign tab's UTM group
    // (never read) are gone: fields that do nothing when filled in.
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      /**
       * The service this page advertises. Its booking and contact forms book
       * that service and show its consultation label from the contact page
       * ("Kitchen Remodeling Consultation", …). Empty for a page with no
       * matching service (outdoor/hardscape, siding): a booking there is sent
       * with no service rather than a guessed one.
       *
       * This replaces `src/lib/landingPageServices.ts`, which guessed the
       * service from the URL and kept its own copy of each label in code.
       */
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      admin: {
        description:
          'The service this page advertises. Its booking form books this service. Leave empty if none fits.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Sections',
          description:
            'The page, in the order it renders — the first section is the hero. Drag a row to move a section; the row label is the section’s own heading. Pages deliberately differ from one another — a section missing here is missing from that page, not broken.',
          fields: [
            {
              name: 'sections',
              type: 'blocks',
              blocks: landingPageBlocks,
              required: true,
              label: false,
              admin: {
                // Fifteen open forms is not a page outline. Collapsed, the
                // list reads as the page itself.
                initCollapsed: true,
              },
            },
          ],
        },
        {
          label: 'SEO',
          description: 'Search and social metadata for this page.',
          fields: [...SEOFields],
        },
        {
          label: 'Source',
          description:
            'Where this page came from in WordPress. Provenance for tracing a section back to the export — not content, and not used at render time.',
          fields: [
            { name: 'sourceWordPressId', type: 'number', index: true },
            { name: 'sourceSlug', type: 'text', index: true },
          ],
        },
      ],
    },
  ],
}
