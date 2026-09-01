import type { CollectionConfig, Field } from 'payload'
import { SEOFields } from './fields/SEO'

const enabled = (name: string, defaultValue = true): Field => ({
  name: `${name}Enabled`,
  type: 'checkbox',
  defaultValue,
})
const upload = (name: string, hasMany = false): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  ...(hasMany ? { hasMany: true } : {}),
})
const textItems = (name: string, label: string): Field => ({
  name,
  type: 'array',
  labels: { singular: label, plural: `${label}s` },
  fields: [{ name: 'text', type: 'textarea', required: true }],
})

const orderField: Field = {
  name: 'sectionOrder',
  type: 'array',
  admin: {
    description: 'Optional order for enabled tabs. Empty uses the standard landing-page order.',
  },
  fields: [
    {
      name: 'section',
      type: 'select',
      required: true,
      options: [
        { label: 'Estimate CTA', value: 'estimate' },
        { label: 'Intro', value: 'intro' },
        { label: 'Sub-services', value: 'subServices' },
        { label: 'Prime Difference', value: 'primeDifference' },
        { label: 'Our Projects', value: 'projects' },
        { label: 'Project Gallery', value: 'projectGallery' },
        { label: 'Reflection Gallery', value: 'reflectionGallery' },
        { label: 'Video', value: 'video' },
        { label: 'Why Choose Us', value: 'whyChoose' },
        { label: 'Service Areas', value: 'serviceAreas' },
        { label: 'FAQs', value: 'faq' },
        { label: 'Testimonials', value: 'testimonials' },
        { label: 'Luxury CTA', value: 'luxuryCta' },
        { label: 'Consultation Booking', value: 'booking' },
        { label: 'Find Us', value: 'findUs' },
        { label: 'Contact Form', value: 'contactForm' },
      ],
    },
  ],
}

export const LandingPages: CollectionConfig = {
  slug: 'landing-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'template'],
    description:
      'Google Ads landing pages. Use the shared tabs; each page stores its own copy, media, and visibility.',
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
      options: [
        { label: 'Information Page', value: 'information' },
        { label: 'Default Landing Page', value: 'default' },
      ],
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text', required: true },
        { name: 'lead', type: 'textarea' },
        upload('image'),
      ],
    },
    orderField,
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Estimate CTA',
          fields: [
            enabled('estimate'),
            {
              name: 'estimate',
              type: 'group',
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  defaultValue: 'Ready to schedule your free estimate?',
                },
                { name: 'body', type: 'textarea' },
                { name: 'link', type: 'text', defaultValue: '/contact' },
              ],
            },
          ],
        },
        {
          label: 'Intro',
          fields: [
            enabled('intro'),
            {
              name: 'intro',
              type: 'group',
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text' },
                { name: 'body', type: 'textarea' },
                upload('image'),
              ],
            },
          ],
        },
        {
          label: 'Sub-services',
          fields: [
            enabled('subServices'),
            {
              name: 'subServices',
              type: 'group',
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'body', type: 'textarea' },
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'description', type: 'textarea' },
                    upload('image'),
                    { name: 'link', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Prime Difference',
          fields: [
            enabled('primeDifference'),
            {
              name: 'primeDifference',
              type: 'group',
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text' },
                { name: 'headingAccent', type: 'text' },
                { name: 'body', type: 'textarea' },
                textItems('checklist', 'Checklist item'),
              ],
            },
          ],
        },
        {
          label: 'Project Gallery',
          fields: [
            enabled('projectGallery'),
            {
              name: 'projectGallery',
              type: 'group',
              fields: [{ name: 'heading', type: 'text' }, upload('images', true)],
            },
          ],
        },
        {
          label: 'Reflection Gallery',
          fields: [
            enabled('reflectionGallery', false),
            {
              name: 'reflectionGallery',
              type: 'group',
              fields: [{ name: 'heading', type: 'text' }, upload('images', true)],
            },
          ],
        },
        {
          label: 'Our Projects',
          fields: [
            enabled('projects'),
            {
              name: 'projects',
              type: 'group',
              fields: [
                { name: 'eyebrow', type: 'text', defaultValue: 'Our Projects' },
                { name: 'heading', type: 'text' },
                { name: 'description', type: 'textarea' },
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'description', type: 'textarea' },
                    upload('image'),
                    { name: 'link', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Video',
          fields: [
            enabled('video', false),
            {
              name: 'video',
              type: 'group',
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text' },
                { name: 'description', type: 'textarea' },
                { name: 'videoUrl', type: 'text' },
                upload('videoFile'),
                upload('poster'),
              ],
            },
          ],
        },
        {
          label: 'Why Choose Us',
          fields: [enabled('whyChoose'), { name: 'whyChoose', type: 'group', fields: [] }],
        },
        {
          label: 'Service Areas',
          fields: [enabled('serviceAreas'), { name: 'serviceAreas', type: 'group', fields: [] }],
        },
        {
          label: 'FAQs',
          fields: [
            enabled('faq'),
            {
              name: 'faq',
              type: 'group',
              fields: [
                { name: 'heading', type: 'text' },
                {
                  name: 'categories',
                  type: 'array',
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    {
                      name: 'items',
                      type: 'array',
                      fields: [
                        { name: 'question', type: 'text', required: true },
                        { name: 'answer', type: 'textarea', required: true },
                      ],
                    },
                  ],
                },
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    { name: 'question', type: 'text', required: true },
                    { name: 'answer', type: 'textarea', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Testimonials',
          fields: [enabled('testimonials'), { name: 'testimonials', type: 'group', fields: [] }],
        },
        {
          label: 'Luxury CTA',
          fields: [
            enabled('luxuryCta'),
            {
              name: 'luxuryCta',
              type: 'group',
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text' },
                { name: 'body', type: 'textarea' },
                { name: 'link', type: 'text', defaultValue: '/contact' },
              ],
            },
          ],
        },
        {
          label: 'Consultation Booking',
          fields: [
            enabled('booking', false),
            {
              name: 'booking',
              type: 'group',
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'description', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Find Us',
          fields: [
            enabled('findUs'),
            {
              name: 'findUs',
              type: 'group',
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'phone', type: 'text' },
                { name: 'email', type: 'text' },
                { name: 'address', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Contact Form',
          fields: [
            enabled('contactForm'),
            {
              name: 'contactForm',
              type: 'group',
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'description', type: 'textarea' },
              ],
            },
          ],
        },
      ],
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
