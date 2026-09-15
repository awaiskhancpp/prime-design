import type { Block, Field } from 'payload'

import { videoStoryFields } from '../fields/videoStory'
import { customSectionBlock } from './SharedBlocks'

/**
 * The page sections, shared by every page in the Pages collection.
 *
 * These used to live in three separate blocks sets (Homepage / About /
 * Gallery). They're one set now so any section can be placed on any page.
 * The hero is a single block carrying the union of the three hero designs:
 * `align` picks the layout, `image`/`imageSecondary` give the pair slider,
 * `video` is the CMS upload and `videoUrl` an optional higher-quality
 * external clip used on wide screens (WordPress serves the homepage hero
 * that way).
 */

const headingHighlight = (example: string): Field => ({
  name: 'headingHighlight',
  type: 'text',
  label: 'Heading highlight',
  admin: {
    description: `Word(s) of the heading to render in the accent color, e.g. "${example}". Separate multiple phrases with |.`,
  },
})

export const heroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    headingHighlight('design and build'),
    { name: 'description', type: 'richText' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Background image, or the first slide when a second image is set. Doubles as the video poster.',
      },
    },
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
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Background video. Takes priority over the image(s).' },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Desktop video URL',
      admin: {
        description:
          'Optional external clip (hot-linked, e.g. the CDN) used from 768px up, for a lighter mobile cut in the upload above. WordPress serves the homepage hero this way.',
      },
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
        {
          name: 'style',
          type: 'select',
          defaultValue: 'filled',
          options: [
            { label: 'Filled', value: 'filled' },
            { label: 'Outlined', value: 'outlined' },
          ],
        },
        {
          name: 'showCalendarIcon',
          type: 'checkbox',
          label: 'Show calendar icon',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'align',
      type: 'select',
      label: 'Hero alignment',
      defaultValue: 'left',
      options: [
        { label: 'Center aligned', value: 'center' },
        { label: 'Left aligned', value: 'left' },
      ],
      admin: {
        description:
          'Center is the full-width primary hero; left aligns the copy to the left edge like the inner pages.',
      },
    },
  ],
}

export const introBlock: Block = {
  slug: 'intro',
  labels: { singular: 'Intro', plural: 'Intros' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}

export const differenceBlock: Block = {
  slug: 'difference',
  labels: { singular: 'Prime Difference', plural: 'Prime Difference' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    headingHighlight('Difference'),
    {
      name: 'checklist',
      type: 'array',
      admin: {
        description:
          'The "Why choose" checklist (lead renders bold, text renders after it).',
      },
      fields: [
        { name: 'lead', type: 'text' },
        { name: 'text', type: 'text' },
      ],
    },
    {
      name: 'videos',
      type: 'array',
      label: 'Project videos',
      admin: {
        description:
          'The video tiles under the checklist (WordPress hot-links these from the CDN, so a URL is used rather than an upload).',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: { description: 'Direct .mp4 URL.' },
        },
        ...videoStoryFields(),
      ],
    },
  ],
}

export const projectsBlock: Block = {
  slug: 'projects',
  labels: { singular: 'Latest Projects', plural: 'Latest Projects' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    headingHighlight('projects'),
    { name: 'body', type: 'richText' },
  ],
}

export const servicesBlock: Block = {
  slug: 'services',
  labels: { singular: 'Services', plural: 'Services' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    headingHighlight('services'),
    { name: 'body', type: 'richText' },
  ],
}

export const featureBlocksBlock: Block = {
  slug: 'feature-blocks',
  labels: { singular: 'Feature Blocks', plural: 'Feature Blocks' },
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
      admin: { description: 'Before/after feature cards.' },
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
}

export const contactIntroBlock: Block = {
  slug: 'contact-intro',
  labels: { singular: 'Contact intro', plural: 'Contact intros' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    headingHighlight('today'),
    { name: 'body', type: 'richText' },
  ],
}

export const teamIntroBlock: Block = {
  slug: 'team',
  labels: { singular: 'Team Intro', plural: 'Team Intros' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    headingHighlight('exceptional'),
    { name: 'body', type: 'richText' },
    { name: 'ctaLabel', type: 'text' },
    { name: 'ctaHref', type: 'text' },
    { name: 'introHeading', type: 'text' },
    { name: 'introSubheading', type: 'text' },
    { name: 'introBody', type: 'richText' },
  ],
}

export const guidingPrincipleBlock: Block = {
  slug: 'guiding-principle',
  labels: { singular: 'Guiding Principle', plural: 'Guiding Principles' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    headingHighlight('Reliability in Every Project We Take On'),
    { name: 'body', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'imageSecondary', type: 'upload', relationTo: 'media' },
    { name: 'ctaLabel', type: 'text' },
    { name: 'ctaHref', type: 'text' },
  ],
}

export const coreValuesBlock: Block = {
  slug: 'core-values',
  labels: { singular: 'Core Values', plural: 'Core Values' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'values',
      type: 'array',
      admin: { description: 'Icon + title; body is optional.' },
      fields: [
        {
          name: 'icon',
          type: 'text',
          admin: {
            description:
              'Icon path (files live in /public, e.g. "/about/about-customer-focused.svg").',
          },
        },
        { name: 'title', type: 'text' },
        { name: 'body', type: 'richText' },
      ],
    },
  ],
}

export const expertsBlock: Block = {
  slug: 'experts',
  labels: { singular: 'Experts / Video', plural: 'Experts / Video' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'description', type: 'richText' },
    { name: 'video', type: 'upload', relationTo: 'media' },
    { name: 'poster', type: 'upload', relationTo: 'media' },
    { name: 'badge', type: 'upload', relationTo: 'media' },
    { name: 'ctaLabel', type: 'text' },
    { name: 'ctaHref', type: 'text' },
    ...videoStoryFields(),
  ],
}

export const faqIntroBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ Intro', plural: 'FAQ Intros' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'description', type: 'textarea' },
  ],
}

export const galleryTabsBlock: Block = {
  slug: 'gallery-tabs',
  labels: { singular: 'Gallery tabs + grid', plural: 'Gallery tabs + grid' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Optional heading above the category tabs. Leave empty for the bare layout.',
      },
    },
    { name: 'description', type: 'textarea' },
  ],
}

export const whyChooseUsBlock: Block = {
  slug: 'why-choose-us',
  labels: { singular: 'Why Choose Us', plural: 'Why Choose Us' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'eyebrowAccent', type: 'text', label: 'Eyebrow accent' },
    { name: 'heading', type: 'text' },
    {
      name: 'reasons',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'text',
          admin: { description: 'Icon path (files live in /public).' },
        },
        { name: 'title', type: 'text' },
        { name: 'body', type: 'text' },
      ],
    },
  ],
}

export const contactFormBlock: Block = {
  slug: 'contact',
  labels: { singular: 'Contact form', plural: 'Contact forms' },
  fields: [
    {
      name: 'city',
      type: 'text',
      admin: {
        description:
          'Optional city for the lead line ("Start Crafting Your Dream Project in {city} Today"). Empty uses the generic wording.',
      },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional poster frame for the contact walkthrough video.' },
    },
  ],
}

export const serviceAreasBlock: Block = {
  slug: 'service-areas',
  labels: { singular: 'Service Areas', plural: 'Service Areas' },
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
}

/** Every section a page can be built from. */
export const sectionBlocks: Block[] = [
  heroBlock,
  introBlock,
  differenceBlock,
  projectsBlock,
  servicesBlock,
  featureBlocksBlock,
  contactIntroBlock,
  teamIntroBlock,
  guidingPrincipleBlock,
  coreValuesBlock,
  expertsBlock,
  faqIntroBlock,
  galleryTabsBlock,
  whyChooseUsBlock,
  contactFormBlock,
  serviceAreasBlock,
  customSectionBlock,
]
