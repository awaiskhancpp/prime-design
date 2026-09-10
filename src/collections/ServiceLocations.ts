import type { CollectionBeforeValidateHook, CollectionConfig, CollectionSlug } from 'payload'
import { SEOFields } from './fields/SEO'

const relationId = (value: unknown) =>
  typeof value === 'object' && value !== null && 'id' in value
    ? String((value as { id: string | number }).id)
    : value === undefined || value === null
      ? undefined
      : String(value)

const ensureUniqueServiceLocation: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const serviceId = relationId(data?.service)
  const locationId = relationId(data?.location)
  if (!serviceId || !locationId) return data

  const existing = await req.payload.find({
    collection: 'service-locations',
    where: {
      and: [{ service: { equals: serviceId } }, { location: { equals: locationId } }],
    },
    depth: 0,
    limit: 1,
  })

  if (existing.docs[0] && String(existing.docs[0].id) !== String(originalDoc?.id)) {
    throw new Error('A ServiceLocation already exists for this service and location.')
  }

  return data
}

const sectionOverrideFields = [
  {
    name: 'sectionKey',
    type: 'text' as const,
    required: true,
    admin: {
      description:
        'Use the inherited section sourceId for repeated block types; a block type may be used for unique sections.',
    },
  },
  {
    name: 'enabled',
    type: 'checkbox' as const,
    defaultValue: true,
    admin: { description: 'Turn this inherited section on or off for this location.' },
  },
  { name: 'heading', type: 'text' as const },
  { name: 'body', type: 'textarea' as const },
  { name: 'image', type: 'upload' as const, relationTo: 'media' as const },
  { name: 'videoUrl', type: 'text' as const },
]

/** Location-page section groups shared between services (defaults) and service-locations (overrides). */
export const locationPageSectionFields = [
  {
    name: 'locationVideo',
    type: 'group' as const,
    label: 'Video Section',
    admin: {
      description:
        'Video shown on the location page. Use {City} for the city name and {ServiceTitle} for the service name.',
    },
    fields: [
      { name: 'eyebrow', type: 'text' as const },
      { name: 'title', type: 'text' as const },
      { name: 'description', type: 'textarea' as const },
      { name: 'tagline', type: 'text' as const },
      { name: 'videoUrl', type: 'text' as const },
      { name: 'poster', type: 'text' as const },
    ],
  },
  {
    name: 'dontSettle',
    type: 'group' as const,
    label: 'Dont Settle Section',
    admin: {
      description:
        '"Don\'t Settle for a Mediocre…" intro section. Use {City} and {ServiceTitle} placeholders.',
    },
    fields: [
      { name: 'eyebrow', type: 'text' as const },
      { name: 'heading', type: 'text' as const },
      { name: 'headingAccent', type: 'text' as const },
      { name: 'body', type: 'textarea' as const },
      { name: 'ctaLabel', type: 'text' as const },
    ],
  },
  {
    name: 'primeDifference',
    type: 'group' as const,
    label: 'Prime Difference Section',
    admin: {
      description:
        '"The Prime Difference" section (heading + checklist + reason cards + review logos).',
    },
    fields: [
      { name: 'eyebrow', type: 'text' as const },
      { name: 'heading', type: 'text' as const },
      { name: 'body', type: 'textarea' as const },
      {
        name: 'checklist',
        type: 'array' as const,
        fields: [{ name: 'text', type: 'text' as const }],
      },
      {
        name: 'reasons',
        type: 'array' as const,
        fields: [
          { name: 'title', type: 'text' as const, required: true },
          { name: 'description', type: 'textarea' as const },
          { name: 'image', type: 'text' as const },
        ],
      },
    ],
  },
  {
    name: 'quote',
    type: 'group' as const,
    label: 'Quote Section',
    fields: [
      { name: 'heading', type: 'text' as const },
      { name: 'quote', type: 'textarea' as const },
      { name: 'attribution', type: 'text' as const },
      { name: 'image', type: 'text' as const },
    ],
  },
  {
    name: 'siliconValleyLoves',
    type: 'group' as const,
    label: 'Silicon Valley Loves Section',
    fields: [
      { name: 'eyebrow', type: 'text' as const },
      { name: 'heading', type: 'text' as const },
      { name: 'body', type: 'textarea' as const },
      { name: 'image', type: 'text' as const },
      {
        name: 'stats',
        type: 'array' as const,
        fields: [
          { name: 'value', type: 'text' as const },
          { name: 'label', type: 'text' as const },
          { name: 'detail', type: 'text' as const },
        ],
      },
    ],
  },
  {
    name: 'testimonialCards',
    type: 'group' as const,
    label: 'Testimonial Cards Section',
    fields: [
      {
        name: 'items',
        type: 'array' as const,
        fields: [
          { name: 'name', type: 'text' as const, required: true },
          { name: 'quote', type: 'textarea' as const },
          { name: 'avatar', type: 'text' as const },
        ],
      },
    ],
  },
]

export const ServiceLocations: CollectionConfig = {
  slug: 'service-locations',
  // Grouped, predictable list: bathroom-* → home-* → kitchen-*.
  defaultSort: 'slug',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'service', 'location', 'slug'],
    // All 45 records visible on one page (no pagination repeats).
    pagination: { defaultLimit: 50 },
    description:
      'The small service + location record. Shared page layout comes from the frontend template.',
  },
  hooks: { beforeValidate: [ensureUniqueServiceLocation] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services' as CollectionSlug,
      required: true,
      index: true,
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations' as CollectionSlug,
      required: true,
      index: true,
    },
    {
      name: 'city',
      type: 'text',
      admin: { description: 'Legacy WordPress city value; retained for import compatibility.' },
    },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'heroHeading', type: 'text' },
    { name: 'heroDescription', type: 'textarea' },
    { name: 'intro', type: 'textarea' },
    { name: 'content', type: 'richText' },
    {
      name: 'sectionOverrides',
      type: 'array',
      fields: sectionOverrideFields,
      admin: {
        description:
          'Optional location-only changes. Leave empty to inherit the complete service template.',
      },
    },
    ...SEOFields,
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Location Page Sections',
          description:
            'Content for this location page, pre-filled from the parent service\u2019s WordPress source. Edit any field to change just this city; fields left empty fall back to the parent service\u2019s matching section (Quote, Silicon Valley Loves, Testimonial Cards) or the built-in per-city template (Video, Don\u2019t Settle, Prime Difference).',
          fields: locationPageSectionFields,
        },
      ],
    },
  ],
}
