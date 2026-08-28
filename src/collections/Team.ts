import type { CollectionConfig } from 'payload'
import { SEOFields } from './fields/SEO'

export const Team: CollectionConfig = {
  slug: 'team',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'updatedAt'],
    description: 'Team members displayed on the company page.',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'position', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'richText' },
    ...SEOFields,
  ],
}
