import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'location', 'rating', 'featured', 'updatedAt'],
    description: 'Reusable customer testimonials and review quotes.',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'quote', type: 'textarea', required: true },
    { name: 'location', type: 'text' },
    { name: 'rating', type: 'number', min: 1, max: 5 },
    { name: 'source', type: 'text' },
    {
      name: 'timeAgo',
      type: 'text',
      admin: {
        description:
          'Relative date as the review platform shows it, e.g. "5 months ago". Rendered beside the source on the Testimonials page.',
      },
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'sortOrder', type: 'number', defaultValue: 0, index: true },
  ],
}
