import type { GlobalConfig } from 'payload'

/**
 * About page content — one group per section of AboutPage, mirroring the
 * WordPress About page (post 343) section by section. Empty fields fall
 * back to the migrated WordPress copy at render time.
 */
export const About: GlobalConfig = {
  slug: 'about',
  label: 'About Page',
  admin: {
    group: 'Content',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Hero',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        {
          name: 'headingHighlight',
          type: 'text',
          label: 'Heading highlight',
          admin: {
            description:
              'Word(s) of the heading to render in the accent color, e.g. "Go-To Choice". Separate multiple phrases with |.',
          },
        },
        { name: 'description', type: 'richText' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'imageSecondary',
          type: 'upload',
          relationTo: 'media',
          label: 'Second image (two-image slider)',
          admin: {
            description:
              'Optional. When set together with the main image, the hero shows the two-image slider. A video replaces the image(s) when both are set.',
          },
        },
        { name: 'video', type: 'upload', relationTo: 'media' },
        {
          name: 'cta',
          type: 'group',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'href', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'team',
      type: 'group',
      label: 'Team Intro',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        {
          name: 'headingHighlight',
          type: 'text',
          label: 'Heading highlight',
          admin: {
            description:
              'Word(s) of the heading to render in the accent color, e.g. "exceptional". Separate multiple phrases with |.',
          },
        },
        { name: 'body', type: 'richText' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaHref', type: 'text' },
        { name: 'introHeading', type: 'text' },
        { name: 'introSubheading', type: 'text' },
        { name: 'introBody', type: 'richText' },
      ],
    },
    {
      name: 'guidingPrinciple',
      type: 'group',
      label: 'Guiding Principle',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        {
          name: 'headingHighlight',
          type: 'text',
          label: 'Heading highlight',
          admin: {
            description:
              'Word(s) of the heading to render in the accent color, e.g. "Reliability in Every Project We Take On". Separate multiple phrases with |.',
          },
        },
        { name: 'body', type: 'richText' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'imageSecondary', type: 'upload', relationTo: 'media' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaHref', type: 'text' },
      ],
    },
    {
      name: 'coreValues',
      type: 'group',
      label: 'Core Values',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'description', type: 'textarea' },
        {
          name: 'values',
          type: 'array',
          admin: {
            description: 'The six WordPress core values (icon + title; body is optional).',
          },
          fields: [
            {
              name: 'icon',
              type: 'text',
              admin: {
                description: 'Icon path (files live in /public, e.g. "/about/about-customer-focused.svg").',
              },
            },
            { name: 'title', type: 'text' },
            { name: 'body', type: 'richText' },
          ],
        },
      ],
    },
    {
      name: 'experts',
      type: 'group',
      label: 'Experts / Video',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        { name: 'description', type: 'richText' },
        { name: 'video', type: 'upload', relationTo: 'media' },
        { name: 'poster', type: 'upload', relationTo: 'media' },
        { name: 'badge', type: 'upload', relationTo: 'media' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaHref', type: 'text' },
      ],
    },
    {
      name: 'faq',
      type: 'group',
      label: 'FAQ Intro',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}
