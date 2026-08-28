import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    { name: 'caption', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'wordpressId', type: 'number', unique: true, index: true },
    { name: 'sourceUrl', type: 'text' },
    { name: 'sourcePath', type: 'text' },
  ],
  upload: true,
}
