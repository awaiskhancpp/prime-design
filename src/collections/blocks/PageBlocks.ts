import type { Block } from 'payload'

const mediaField = { name: 'image', type: 'upload' as const, relationTo: 'media' as const }

export const PageBlocks: Block[] = [
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
      { name: 'body', type: 'textarea' },
      { name: 'label', type: 'text' },
      { name: 'href', type: 'text' },
    ],
  },
]
