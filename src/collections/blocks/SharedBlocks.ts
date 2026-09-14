import type { Block } from 'payload'

/**
 * Generic section, available on every blocks-based page.
 *
 * The other blocks are fixed layouts (hero, services, FAQ …) and can only be
 * reordered or removed. This one lets editors add a brand-new section —
 * eyebrow, heading, rich text, optional image and up to two buttons — without
 * a developer touching the codebase.
 */
export const customSectionBlock: Block = {
  slug: 'custom',
  labels: { singular: 'Custom section', plural: 'Custom sections' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    {
      name: 'headingHighlight',
      type: 'text',
      label: 'Heading highlight',
      admin: {
        description:
          'Word(s) of the heading to render in the accent color. Separate multiple phrases with |.',
      },
    },
    { name: 'body', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'imageSide',
      type: 'select',
      label: 'Image position',
      defaultValue: 'right',
      options: [
        { label: 'Right of the text', value: 'right' },
        { label: 'Left of the text', value: 'left' },
      ],
    },
    {
      name: 'buttons',
      type: 'array',
      maxRows: 2,
      admin: {
        description:
          'Optional. The first button renders filled, the second one outlined.',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
  ],
}
