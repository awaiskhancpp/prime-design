import type { CollectionConfig } from 'payload'
import { serviceContentBlocks } from './Services'
import { SEOFields } from './fields/SEO'

export const LandingPages: CollectionConfig = {
  slug: 'landing-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'template'],
    description: 'Google Ads landing pages and marketing landing pages.',
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
      defaultValue: 'default',
      options: [
        { label: 'Default Landing Page', value: 'default' },
        { label: 'Information Page', value: 'information' },
      ],
      admin: {
        description: 'Information pages are for Google Ads campaigns with simplified layouts.',
      },
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text', required: true },
        { name: 'lead', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: serviceContentBlocks,
      admin: {
        description:
          'Add landing-page sections in their exact display order. Use only the sections needed for this campaign.',
      },
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'text', type: 'text', defaultValue: 'Get Your Free Estimate' },
        { name: 'link', type: 'text', defaultValue: '/contact' },
        { name: 'showForm', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'campaignTracking',
      type: 'group',
      admin: {
        description: 'Campaign tracking fields for Google Ads and other marketing campaigns.',
      },
      fields: [
        { name: 'campaignName', type: 'text' },
        { name: 'campaignSource', type: 'text' },
        { name: 'campaignMedium', type: 'text' },
        { name: 'campaignTerm', type: 'text' },
        { name: 'campaignContent', type: 'text' },
      ],
    },
    ...SEOFields,
  ],
}
