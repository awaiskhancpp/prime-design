import type { Block } from 'payload'

import { sectionBlocks } from './sections'

/**
 * Blocks available on a page in the Pages collection: every page section
 * (see `./sections`) plus the free-estimate band. The generic Content, Image
 * and Text and Gallery blocks that predated the sections were never used on
 * any page and are gone — the Custom section (heading, rich text, image,
 * buttons) and the Gallery Tabs section cover both, with the site's design. The homepage, About and
 * Gallery pages are ordinary records here, so any section can be placed on
 * any page.
 */
export const PageBlocks: Block[] = [
  ...sectionBlocks,
  {
    slug: 'cta',
    labels: { singular: 'Call to Action', plural: 'Calls to Action' },
    fields: [
      { name: 'heading', type: 'text', required: true },
      // Rich text so the band can carry the contact link and the phone
      // number as real links (see `20260919_130000_cta_body_rich_text`).
      { name: 'body', type: 'richText' },
      {
        name: 'label',
        type: 'text',
        label: 'Button text',
        admin: { description: 'The band\'s button, e.g. "Get started". Empty shows no button.' },
      },
      {
        name: 'href',
        type: 'text',
        label: 'Link',
        admin: { description: 'Where the button goes, e.g. /contact.' },
      },
    ],
  },
]
