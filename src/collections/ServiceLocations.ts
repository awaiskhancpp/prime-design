import type { CollectionConfig, CollectionSlug } from 'payload'
import { SEOFields } from './fields/SEO'

export const ServiceLocations: CollectionConfig = {
  slug: 'service-locations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'service', 'location', 'slug'],
    description: 'The small service + location record. Shared page layout comes from the frontend template.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'service', type: 'relationship', relationTo: 'services' as CollectionSlug, required: true, index: true },
    { name: 'location', type: 'relationship', relationTo: 'locations' as CollectionSlug, required: true, index: true },
    { name: 'city', type: 'text', admin: { description: 'Legacy WordPress city value; retained for import compatibility.' } },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'heroHeading', type: 'text' },
    { name: 'heroDescription', type: 'textarea' },
    { name: 'intro', type: 'textarea' },
    { name: 'content', type: 'richText' },
    ...SEOFields,
  ],
}
