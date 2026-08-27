import type { Block, CollectionConfig, CollectionSlug } from 'payload'
import { SEOFields } from './fields/SEO'

const textItems = (name = 'items') => ({
  name,
  type: 'array' as const,
  fields: [{ name: 'text', type: 'textarea' as const, required: true }],
})

const imageField = { name: 'image', type: 'upload' as const, relationTo: 'media' as const }

const contentBlocks: Block[] = [
  {
    slug: 'intro',
    labels: { singular: 'Intro', plural: 'Intro' },
    fields: [
      { name: 'eyebrow', type: 'text', required: false },
      { name: 'heading', type: 'text', required: true },
      { name: 'body', type: 'textarea', required: true },
      imageField,
      { name: 'imageSide', type: 'select', defaultValue: 'right', options: ['left', 'right'] },
    ],
  },
  {
    slug: 'feature-list',
    labels: { singular: 'Feature List', plural: 'Feature Lists' },
    fields: [{ name: 'heading', type: 'text', required: true }, textItems()],
  },
  {
    slug: 'benefits',
    labels: { singular: 'Benefits', plural: 'Benefits' },
    fields: [{ name: 'heading', type: 'text', required: true }, textItems()],
  },
  {
    slug: 'process',
    labels: { singular: 'Process', plural: 'Processes' },
    fields: [
      { name: 'heading', type: 'text', required: true },
      {
        name: 'steps',
        type: 'array',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          imageField,
        ],
      },
    ],
  },
  {
    slug: 'image-text',
    labels: { singular: 'Image and Text', plural: 'Image and Text' },
    fields: [
      { name: 'eyebrow', type: 'text' },
      { name: 'heading', type: 'text', required: true },
      { name: 'body', type: 'textarea', required: true },
      imageField,
      { name: 'imageSide', type: 'select', defaultValue: 'left', options: ['left', 'right'] },
    ],
  },
  {
    slug: 'gallery',
    labels: { singular: 'Gallery', plural: 'Galleries' },
    fields: [
      { name: 'heading', type: 'text' },
      { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    ],
  },
  {
    slug: 'sub-services',
    labels: { singular: 'Sub-services', plural: 'Sub-services' },
    fields: [
      { name: 'heading', type: 'text', required: true },
      {
        name: 'items',
        type: 'array',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          imageField,
          { name: 'link', type: 'text' },
        ],
      },
    ],
  },
  {
    slug: 'video',
    labels: { singular: 'Video', plural: 'Videos' },
    fields: [
      { name: 'heading', type: 'text' },
      { name: 'videoUrl', type: 'text', required: true },
      { name: 'poster', type: 'upload', relationTo: 'media' },
    ],
  },
  {
    slug: 'quote',
    labels: { singular: 'Quote', plural: 'Quotes' },
    fields: [
      { name: 'quote', type: 'textarea', required: true },
      { name: 'attribution', type: 'text' },
    ],
  },
]

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'featured', 'sortOrder'],
    description:
      'Reusable remodeling and construction services shared by service and location pages.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'shortDescription', type: 'textarea' },
    { name: 'description', type: 'textarea' },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        { name: 'lead', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'contentBlocks', type: 'blocks', blocks: contentBlocks },
    { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true },
    {
      name: 'relatedServices',
      type: 'relationship',
      relationTo: 'services' as CollectionSlug,
      hasMany: true,
    },
    ...SEOFields,
  ],
}
