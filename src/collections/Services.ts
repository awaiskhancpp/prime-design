import type { Block, CollectionConfig, CollectionSlug } from 'payload'
import { SEOFields } from './fields/SEO'
import { landingPageBlocks } from '../blocks/LandingPageBlocks'

const textItems = (name = 'items') => ({
  name,
  type: 'array' as const,
  fields: [{ name: 'text', type: 'textarea' as const, required: true }],
})

const imageField = { name: 'image', type: 'upload' as const, relationTo: 'media' as const }

export const serviceContentBlocks: Block[] = [
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
      {
        name: 'video',
        type: 'upload',
        relationTo: 'media',
        admin: {
          description: 'Optional uploaded video. If empty, the external video URL can be used.',
        },
      },
      { name: 'videoUrl', type: 'text' },
      { name: 'poster', type: 'upload', relationTo: 'media' },
    ],
  },
  {
    slug: 'icon-feature-list',
    labels: {
      singular: 'Feature List with Titles (e.g. "The Power of Customization")',
      plural: 'Feature Lists with Titles',
    },
    fields: [
      { name: 'heading', type: 'text', required: true },
      { name: 'intro', type: 'textarea' },
      imageField,
      { name: 'imageSide', type: 'select', defaultValue: 'left', options: ['left', 'right'] },
      {
        name: 'items',
        type: 'array',
        minRows: 1,
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
        ],
      },
    ],
  },
  {
    slug: 'checklist',
    labels: { singular: 'Feature Checklist (image + checklist)', plural: 'Feature Checklists' },
    fields: [
      { name: 'eyebrow', type: 'text' },
      { name: 'heading', type: 'text', required: true },
      {
        name: 'description',
        type: 'text',
        admin: {
          description:
            'Short italic lead-in line above the checklist, e.g. "Unleash the Beauty and Durability:"',
        },
      },
      imageField,
      { name: 'imageSide', type: 'select', defaultValue: 'left', options: ['left', 'right'] },
      textItems(),
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
    {
      name: 'parentService',
      type: 'relationship',
      relationTo: 'services' as CollectionSlug,
      index: true,
      admin: { description: 'Optional parent service for a service subcategory.' },
    },
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
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'Optional uploaded background video. Use this instead of an external video URL when available.',
          },
        },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'showInConsultationForm',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show in Consultation Form',
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    {
      name: 'sectionOrder',
      type: 'array',
      admin: {
        description:
          'The complete ordered section sequence for this service. Use section keys once each; empty means legacy fallback while content is being migrated.',
      },
      fields: [
        {
          name: 'section',
          type: 'select',
          required: true,
          options: [
            'hero',
            'intro',
            'video',
            'process',
            'offerings',
            'gallery',
            'quote',
            'craftsmanship',
            'real-homes',
            'why-choose-us',
            'faq',
            'estimate',
            'reviews',
            'silicon-valley-loves',
            'home-repair-categories',
            'contact',
          ],
        },
      ],
    },
    { name: 'contentBlocks', type: 'blocks', blocks: serviceContentBlocks },
    {
      name: 'sections',
      type: 'blocks',
      blocks: landingPageBlocks,
      admin: {
        description:
          'Canonical ordered sections for new service records. Existing contentBlocks and sectionOrder remain available during migration.',
      },
    },
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
