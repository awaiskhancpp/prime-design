import type { CollectionConfig } from 'payload'
import { SEOFields } from './fields/SEO'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    description: 'Reusable Silicon Valley service-area locations.',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'seoDescription', type: 'textarea' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    ...SEOFields,
  ],
}
