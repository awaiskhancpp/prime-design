import type { CollectionConfig } from 'payload'
import { landingPageBlocks } from '../blocks/LandingPageBlocks'
import { buttonGroupFields } from '../fields/Shared'
import { SEOFields } from './fields/SEO'

export const LandingPages: CollectionConfig = {
  slug: 'landing-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'template'],
    description: 'Google Ads landing pages with ordered, reusable content sections.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'template',
      type: 'select',
      defaultValue: 'information',
      options: [{ label: 'Information Page', value: 'information' }],
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'backgroundMedia', type: 'upload', relationTo: 'media' },
        { name: 'foregroundMedia', type: 'upload', relationTo: 'media' },
        ...buttonGroupFields(),
      ],
    },
    { name: 'sections', type: 'blocks', blocks: landingPageBlocks, required: true },
    {
      name: 'campaignTracking',
      type: 'group',
      fields: [
        { name: 'campaignName', type: 'text' },
        { name: 'source', type: 'text' },
        { name: 'medium', type: 'text' },
        { name: 'term', type: 'text' },
        { name: 'content', type: 'text' },
      ],
    },
    { name: 'sourceWordPressId', type: 'number', index: true },
    { name: 'sourceSlug', type: 'text', index: true },
    ...SEOFields,
  ],
}
