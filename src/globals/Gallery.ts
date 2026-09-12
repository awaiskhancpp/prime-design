import type { GlobalConfig } from 'payload'

/**
 * Gallery page content — hero copy + the "Why choose us" block, mirroring
 * the WordPress gallery page (post 349). The gallery tabs themselves come
 * from the gallery-categories collection (WordPress HappyFiles).
 */
export const Gallery: GlobalConfig = {
  slug: 'gallery',
  label: 'Gallery Page',
  admin: {
    group: 'Content',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Hero',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        {
          name: 'headingHighlight',
          type: 'text',
          label: 'Heading highlight',
          admin: {
            description:
              'Word(s) of the heading to render in the accent color, e.g. "remodeling projects". Separate multiple phrases with |.',
          },
        },
        { name: 'description', type: 'richText' },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Optional hero background (WordPress has none — the hero renders plain dark without one).',
          },
        },
      ],
    },
    {
      name: 'whyChooseUs',
      type: 'group',
      label: 'Why Choose Us',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'eyebrowAccent', type: 'text' },
        { name: 'heading', type: 'text' },
        {
          name: 'reasons',
          type: 'array',
          fields: [
            { name: 'icon', type: 'text' },
            { name: 'title', type: 'text' },
            { name: 'body', type: 'text' },
          ],
        },
      ],
    },
  ],
}
