import type { CollectionConfig } from 'payload'
import { SEOFields } from './fields/SEO'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'location', 'updatedAt'],
    description: 'Completed remodeling and construction projects.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'summary', type: 'textarea' },
    { name: 'description', type: 'textarea' },
    { name: 'content', type: 'richText' },
    { name: 'location', type: 'text' },
    { name: 'category', type: 'text' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'address', type: 'textarea' },
    { name: 'videoUrl', type: 'text' },
    ...SEOFields,
  ],
}
