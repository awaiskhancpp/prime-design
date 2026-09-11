import type { GlobalConfig } from 'payload'

/**
 * Homepage content — one group per section of LandscapingPage, mirroring
 * the WordPress homepage (post 2) section by section. Empty fields fall
 * back to the migrated WordPress copy at render time.
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
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
              'Word(s) of the heading to render in the accent color, e.g. "design and build". Separate multiple phrases with |.',
          },
        },
        { name: 'description', type: 'text' },
        { name: 'image', type: 'upload', relationTo: 'media' },
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
      name: 'intro',
      type: 'group',
      label: 'Intro',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'richText' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'difference',
      type: 'group',
      label: 'Prime Difference',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        {
          name: 'headingHighlight',
          type: 'text',
          label: 'Heading highlight',
          admin: {
            description:
              'Word(s) of the heading to render in the accent color, e.g. "Difference". Separate multiple phrases with |.',
          },
        },
        {
          name: 'checklist',
          type: 'array',
          admin: {
            description:
              'The "Why choose" checklist (lead renders bold, text renders after it). WordPress items only.',
          },
          fields: [
            { name: 'lead', type: 'text' },
            { name: 'text', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'projectsIntro',
      type: 'group',
      label: 'Latest Projects',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'richText' },
      ],
    },
    {
      name: 'servicesIntro',
      type: 'group',
      label: 'Services',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'richText' },
      ],
    },
    {
      name: 'featureBlocks',
      type: 'group',
      label: 'Feature Blocks',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text' },
        {
          name: 'titleHighlight',
          type: 'text',
          label: 'Title highlight',
          admin: {
            description:
              'Word(s) of the title to render in the accent color, e.g. "We do it all". Separate multiple phrases with |.',
          },
        },
        {
          name: 'items',
          type: 'array',
          admin: {
            description:
              'Before/after feature cards (WordPress: Bathroom Remodeling, Complete Home Renovation).',
          },
          fields: [
            { name: 'title', type: 'text' },
            { name: 'body', type: 'richText' },
            { name: 'ctaLabel', type: 'text' },
            { name: 'ctaHref', type: 'text' },
            { name: 'beforeImage', type: 'upload', relationTo: 'media' },
            { name: 'afterImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
    {
      name: 'contactIntro',
      type: 'group',
      label: 'Contact',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        {
          name: 'headingHighlight',
          type: 'text',
          label: 'Heading highlight',
          admin: {
            description:
              'Word(s) of the heading to render in the accent color, e.g. "today". Separate multiple phrases with |.',
          },
        },
        { name: 'body', type: 'richText' },
      ],
    },
    {
      name: 'serviceAreas',
      type: 'group',
      label: 'Service Areas',
      fields: [
        {
          name: 'heading',
          type: 'text',
          admin: {
            description:
              'Heading only — the city list is shared site-wide via Site Settings service areas.',
          },
        },
      ],
    },
  ],
}
