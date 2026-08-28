import type { CollectionConfig } from 'payload'
import { PageBlocks } from './blocks/PageBlocks'
import { SEOFields } from './fields/SEO'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isGoogleAdsPage', 'updatedAt'],
    description: 'CMS-managed pages rendered by the shared page route.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'video', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'layout', type: 'blocks', blocks: PageBlocks },
    {
      name: 'isGoogleAdsPage',
      type: 'checkbox',
      defaultValue: false,
      label: 'Google Ads Page',
    },
    ...SEOFields,
  ],
}
