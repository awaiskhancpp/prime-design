import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  // Its own sidebar heading: every other collection is now grouped, and an
  // uploads collection belongs with neither the content nor the settings.
  admin: { group: 'Library' },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc, req }) => {
        if (!data || (typeof data.alt === 'string' && data.alt.trim())) return data

        const filename = req.file?.name || data.filename || originalDoc?.filename
        if (typeof filename === 'string' && filename.trim()) {
          data.alt = filename.trim()
        }

        return data
      },
    ],
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
