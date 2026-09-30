import type { GlobalConfig } from 'payload'

import {
  dontSettleGroup,
  locationPrimeDifferenceGroup,
  locationVideoGroup,
  quoteGroup,
  siliconValleyLovesGroup,
  testimonialCardsGroup,
} from '../collections/fields/sectionGroups'

/**
 * Sections that read the same on every page of a kind, stored once.
 *
 * The 45 service-location pages carried their own copy of the quote, the
 * Silicon Valley Loves section, the testimonial cards, the Prime Difference
 * section (4 reason cards and a 5-item checklist — 405 rows between them),
 * and the parts of the "Don't Settle" intro and the video section that never
 * change. Every copy was identical, so a wording change meant 45 edits and
 * one missed page meant two versions of the site.
 *
 * A city page now resolves each field in order: its own value, then its
 * service's (the kitchen, bathroom and home families differ in a few lines —
 * those live on the service, under City Page Defaults), then this global. A
 * city page can still say something different: fill the field on that page.
 */
export const SharedSections: GlobalConfig = {
  slug: 'shared-sections',
  label: 'Shared Sections',
  admin: {
    group: 'Settings',
    description:
      'Copy shared by every page of a kind. A page that fills a field of its own shows that instead.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'City pages',
          description:
            'The 45 service-location pages (e.g. Kitchen Remodeling in Cupertino). Use {City} and {ServiceTitle} where the page’s city or service belongs.',
          fields: [
            locationVideoGroup({ label: 'Video Section' }),
            dontSettleGroup({ label: '“Don’t Settle” Section' }),
            quoteGroup({ label: 'Quote Section' }),
            locationPrimeDifferenceGroup({ label: 'Prime Difference Section' }),
            testimonialCardsGroup({
              label: 'Testimonial Cards Section',
              testimonialsDescription: 'The testimonials to show, in order.',
            }),
            siliconValleyLovesGroup({ label: 'Silicon Valley Loves Section' }),
          ],
        },
      ],
    },
  ],
}
