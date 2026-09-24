import type { CollectionConfig } from 'payload'
import { landingPageBlocks } from '../blocks/LandingPageBlocks'
import { buttonGroupFields } from '../fields/Shared'
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
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'template'],
    description: 'Google Ads landing pages with ordered, reusable content sections.',
    group: 'Marketing',
  },
  fields: [
    // Identity stays outside the tabs: these are the fields an editor needs
    // to see whichever tab they are on, and the two required ones must never
    // be hidden behind a tab that is not open.
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          defaultValue: 'draft',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'template',
          type: 'select',
          defaultValue: 'information',
          options: [{ label: 'Information Page', value: 'information' }],
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          description:
            'The first screen: the headline, the copy under it, the background video or image, and the buttons.',
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: false,
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
                { name: 'backgroundMedia', type: 'upload', relationTo: 'media' },
                { name: 'foregroundMedia', type: 'upload', relationTo: 'media' },
                ...buttonGroupFields(),
              ],
            },
          ],
        },
        {
          label: 'Sections',
          description:
            'The page, in the order it renders. Drag a row to move a section; the row label is the section’s own heading. Pages deliberately differ from one another — a section missing here is missing from that page, not broken.',
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
          label: 'Campaign',
          description: 'UTM values for the ads that point at this page.',
          fields: [
            {
              name: 'campaignTracking',
              type: 'group',
              label: false,
              fields: [
                { name: 'campaignName', type: 'text' },
                { name: 'source', type: 'text' },
                { name: 'medium', type: 'text' },
                { name: 'term', type: 'text' },
                { name: 'content', type: 'text' },
              ],
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
