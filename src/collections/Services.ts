import type { CollectionConfig, CollectionSlug } from 'payload'
import { SEOFields } from './fields/SEO'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'featured', 'sortOrder'],
    description: 'Reusable remodeling and construction services shared by service and location pages.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'shortDescription', type: 'textarea' },
    { name: 'description', type: 'textarea' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    {
      name: 'benefits',
      type: 'array',
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'process',
      type: 'array',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true },
    { name: 'relatedServices', type: 'relationship', relationTo: 'services' as CollectionSlug, hasMany: true },
    ...SEOFields,
  ],
}
