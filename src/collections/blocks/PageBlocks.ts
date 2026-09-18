import type { Block } from 'payload'

import { sectionBlocks } from './sections'

const mediaField = { name: 'image', type: 'upload' as const, relationTo: 'media' as const }

/**
 * Blocks available on a page in the Pages collection: the original generic
 * blocks plus every page section (see `./sections`). The homepage, About and
 * Gallery pages are ordinary records here, so any section can be placed on
 * any page.
 */
export const PageBlocks: Block[] = [
  ...sectionBlocks,
  {
    slug: 'content',
    labels: { singular: 'Content', plural: 'Content' },
    fields: [
      { name: 'eyebrow', type: 'text' },
      { name: 'heading', type: 'text', required: true },
      { name: 'body', type: 'textarea', required: true },
    ],
  },
  {
    slug: 'image-text',
    labels: { singular: 'Image and Text', plural: 'Image and Text' },
    fields: [
      { name: 'eyebrow', type: 'text' },
      { name: 'heading', type: 'text', required: true },
      { name: 'body', type: 'textarea', required: true },
      mediaField,
      { name: 'imageSide', type: 'select', defaultValue: 'right', options: ['left', 'right'] },
    ],
  },
  {
    slug: 'gallery',
    labels: { singular: 'Gallery', plural: 'Galleries' },
    fields: [
      { name: 'heading', type: 'text' },
      { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    ],
  },
  {
    slug: 'cta',
    labels: { singular: 'Call to Action', plural: 'Calls to Action' },
    fields: [
      { name: 'heading', type: 'text', required: true },
      // Rich text so the band can carry the contact link and the phone
      // number as real links (see `20260919_130000_cta_body_rich_text`).
      { name: 'body', type: 'richText' },
      { name: 'label', type: 'text' },
      { name: 'href', type: 'text' },
    ],
  },
]
