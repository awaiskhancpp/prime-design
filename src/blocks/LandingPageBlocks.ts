import type { Block } from 'payload'
import {
  buttonGroupFields,
  faqCategoryFields,
  featureCardFields,
  galleryItemFields,
  imageTextContentFields,
  linkFields,
  mediaReferenceFields,
  provenanceFields,
} from '../fields/Shared'

const labels = (singular: string, plural = `${singular}s`) => ({ singular, plural })

const base = (slug: string, singular: string, fields: Block['fields']): Block => ({
  slug,
  labels: labels(singular),
  fields: [...fields, ...provenanceFields()],
})

const text = (name: string, required = false) => ({ name, type: 'text' as const, required })
const description = (name = 'description') => ({ name, type: 'textarea' as const })

export const landingPageBlocks: Block[] = [
  base('hero', 'Hero', [
    text('eyebrow'),
    text('heading', true),
    description(),
    ...mediaReferenceFields('backgroundMedia'),
    ...mediaReferenceFields('foregroundMedia'),
    ...buttonGroupFields(),
  ]),
  base('cta', 'CTA', [
    text('eyebrow'),
    text('heading', true),
    description(),
    ...mediaReferenceFields(),
    ...buttonGroupFields(),
  ]),
  base('image-text', 'Image and Text', imageTextContentFields()),
  base('video', 'Video', [
    text('heading'),
    description(),
    { name: 'source', type: 'select' as const, options: ['media', 'externalUrl'] },
    { name: 'video', type: 'upload' as const, relationTo: 'media' as const },
    { name: 'externalUrl', type: 'text' as const },
    { name: 'poster', type: 'upload' as const, relationTo: 'media' as const },
    { name: 'controls', type: 'checkbox' as const, defaultValue: true },
    text('sourceVideoId'),
  ]),
  base('gallery', 'Gallery', [
    text('heading'),
    description(),
    { name: 'items', type: 'array' as const, fields: galleryItemFields() },
    {
      name: 'groups',
      type: 'array' as const,
      admin: {
        description:
          'Optional ordered gallery categories from the source page. Do not invent groups.',
      },
      fields: [
        text('label', true),
        text('heading'),
        description(),
        { name: 'items', type: 'array' as const, fields: galleryItemFields() },
      ],
    },
    { name: 'layout', type: 'json' as const },
    { name: 'lightbox', type: 'checkbox' as const, defaultValue: true },
    text('sourceGalleryType'),
  ]),
  base('before-after', 'Before and After', [
    text('heading'),
    { name: 'beforeMedia', type: 'upload' as const, relationTo: 'media' as const },
    { name: 'afterMedia', type: 'upload' as const, relationTo: 'media' as const },
    { name: 'beforeLabel', type: 'text' as const },
    { name: 'afterLabel', type: 'text' as const },
  ]),
  base('sub-services', 'Sub-services', [
    text('eyebrow'),
    text('heading', true),
    description(),
    {
      name: 'items',
      type: 'array' as const,
      fields: [
        text('title', true),
        description(),
        ...mediaReferenceFields(),
        { name: 'link', type: 'group' as const, fields: linkFields() },
      ],
    },
  ]),
  base('prime-difference', 'Prime Difference', [
    text('eyebrow'),
    text('heading', true),
    description(),
    { name: 'features', type: 'array' as const, fields: featureCardFields() },
    {
      name: 'videos',
      type: 'array' as const,
      admin: {
        description: 'Ordered videos embedded in the WordPress Prime Difference section.',
      },
      fields: [
        { name: 'video', type: 'upload' as const, relationTo: 'media' as const },
        text('externalUrl'),
        { name: 'poster', type: 'upload' as const, relationTo: 'media' as const },
        text('caption'),
        text('sourceVideoId'),
      ],
    },
    ...mediaReferenceFields(),
  ]),
  base('experience-difference', 'Experience Difference', [
    text('eyebrow'),
    text('heading', true),
    description(),
    { name: 'features', type: 'array' as const, fields: featureCardFields() },
    ...mediaReferenceFields(),
  ]),
  base('service-areas', 'Service Areas', [
    text('eyebrow'),
    text('heading', true),
    description(),
    {
      name: 'areas',
      type: 'array' as const,
      fields: [
        text('label', true),
        { name: 'location', type: 'relationship' as const, relationTo: 'locations' as const },
        { name: 'link', type: 'group' as const, fields: linkFields() },
      ],
    },
  ]),
  base('repair-services', 'Repair Services', [
    text('heading', true),
    description(),
    {
      name: 'categories',
      type: 'array' as const,
      fields: [
        text('title', true),
        { name: 'description', type: 'textarea' as const },
        {
          name: 'features',
          type: 'array' as const,
          fields: [{ name: 'text', type: 'text' as const }],
        },
        ...mediaReferenceFields(),
        text('sourceId'),
      ],
    },
  ]),
  base('luxury-cta', 'Luxury CTA', [
    text('eyebrow'),
    text('heading', true),
    description(),
    ...mediaReferenceFields(),
    ...buttonGroupFields(),
  ]),
  base('booking', 'Booking', [
    text('provider'),
    text('shortcode'),
    text('sourceElementId'),
    { name: 'integrationMetadata', type: 'json' as const },
  ]),
  base('contact-form', 'Contact Form', [
    text('provider'),
    text('shortcode'),
    text('sourceElementId'),
    { name: 'integrationMetadata', type: 'json' as const },
  ]),
  base('find-us', 'Find Us', [
    text('heading', true),
    text('phone'),
    text('email'),
    { name: 'address', type: 'textarea' as const },
    text('mapUrl'),
  ]),
  base('testimonials', 'Testimonials', [
    text('heading'),
    {
      name: 'providers',
      type: 'array' as const,
      fields: [
        text('name', true),
        text('shortcode'),
        text('collectionId'),
        {
          name: 'reviews',
          type: 'array' as const,
          fields: [
            text('reviewer'),
            { name: 'rating', type: 'number' as const },
            { name: 'body', type: 'textarea' as const },
            { name: 'date', type: 'date' as const },
            text('sourceId'),
          ],
        },
      ],
    },
  ]),
  base('faq', 'FAQ', [
    text('heading'),
    description(),
    { name: 'categories', type: 'array' as const, fields: faqCategoryFields() },
  ]),
  base('video-carousel', 'Video Carousel', [
    {
      name: 'items',
      type: 'array' as const,
      fields: [
        { name: 'video', type: 'upload' as const, relationTo: 'media' as const },
        text('externalUrl'),
        { name: 'poster', type: 'upload' as const, relationTo: 'media' as const },
        { name: 'caption', type: 'text' as const },
        text('sourceId'),
        { name: 'sourceOrder', type: 'number' as const },
      ],
    },
    { name: 'settings', type: 'json' as const },
  ]),
  base('gallery-carousel', 'Gallery Carousel', [
    { name: 'items', type: 'array' as const, fields: galleryItemFields() },
    { name: 'settings', type: 'json' as const },
  ]),
]
