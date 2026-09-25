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
        description: 'The "Why choose" checklist (lead renders bold, text renders after it).',
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
        {
          name: 'poster',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Poster frame for the thumbnail strip.' },
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

/**
 * The review-platform row — Yelp, Google and Houzz.
 *
 * Only the copy lives here. The three profile URLs come from Site Settings →
 * Social Links, which the homepage badge row already reads, so a changed
 * profile link updates both places instead of drifting between them.
 */
export const socialProofBlock: Block = {
  slug: 'social-proof',
  labels: {
    singular: 'Social proof (review platforms)',
    plural: 'Social proof (review platforms)',
  },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'description', type: 'textarea' },
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

/**
 * The Testimonials page's video wall (WordPress page `testimonials`, second
 * Bricks section — seven `<video>` elements with bunny.net sources).
 */
export const testimonialVideosBlock: Block = {
  slug: 'testimonial-videos',
  labels: { singular: 'Testimonial Videos', plural: 'Testimonial Videos' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'videos',
      type: 'array',
      admin: { description: 'One card per clip. Upload the file, or paste an external URL.' },
      fields: [
        { name: 'title', type: 'text' },
        {
          name: 'speaker',
          type: 'text',
          admin: { description: 'Caption under the title — usually the project manager.' },
        },
        { name: 'video', type: 'upload', relationTo: 'media' },
        {
          name: 'externalUrl',
          type: 'text',
          admin: { description: 'Used when no file is uploaded (e.g. a bunny.net URL).' },
        },
        { name: 'poster', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}

/**
 * The aggregate review strip — rating badges, the per-platform score/count,
 * and the "read all reviews" links.
 *
 * On WordPress this whole section is a third-party plugin shortcode
 * (`[brb_collection id="1223"]`), so there is no WordPress content to migrate:
 * the numbers come from Google and Yelp. They live here so they can be updated
 * in the admin instead of being edited in code.
 */
export const reviewHighlightsBlock: Block = {
  slug: 'review-highlights',
  labels: { singular: 'Review Highlights', plural: 'Review Highlights' },
  fields: [
    {
      name: 'badges',
      type: 'array',
      admin: { description: 'Rating badges shown across the top (Yelp, Google, Houzz, BBB).' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'imagePath',
          type: 'text',
          admin: { description: 'Used when no upload is set (files live in /public/social).' },
        },
        { name: 'alt', type: 'text' },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      admin: { description: 'One entry per review platform.' },
      fields: [
        { name: 'label', type: 'text', admin: { description: 'e.g. "Google reviews".' } },
        { name: 'rating', type: 'number' },
        { name: 'count', type: 'number' },
        { name: 'url', type: 'text' },
        {
          name: 'linkLabel',
          type: 'text',
          admin: { description: 'e.g. "Read all reviews on Google".' },
        },
      ],
    },
    {
      name: 'reviewLimit',
      type: 'number',
      admin: {
        description:
          'How many featured testimonials to show as cards below the badges. Cards come from the Testimonials collection (featured, by sort order) — they are not stored on this page.',
      },
    },
  ],
}

/**
 * "Testimonials that Matter / Real Results, Real People" — the scrolling
 * review marquee.
 *
 * On WordPress this is a Bricks slider whose query loop reads the
 * `testimonial` custom post type (`{"objectType":"post","post_type":
 * ["testimonial"]}`) and prints `{post_title}` / `{post_content}` per slide.
 * The Payload equivalent is the same split: this block stores only the
 * section's own copy, and the cards are read from the Testimonials collection
 * at render time. Nothing about an individual review is duplicated here.
 */
export const testimonialsSpotlightBlock: Block = {
  slug: 'testimonials-spotlight',
  labels: { singular: 'Testimonials Spotlight', plural: 'Testimonials Spotlight' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'richText' },
    { name: 'ctaLabel', type: 'text' },
    { name: 'ctaHref', type: 'text' },
    {
      name: 'ctaNote',
      type: 'text',
      admin: { description: 'Small line beside the button ("Ready to talk?").' },
    },
    {
      name: 'reviewLimit',
      type: 'number',
      admin: {
        description:
          'How many testimonials to pull into the marquee. Empty shows every featured testimonial.',
      },
    },
  ],
}

/**
 * The FAQ page's searchable index.
 *
 * WordPress builds this page as an authored hero plus a Bricks query loop
 * (`{term_name} Questions` -> `{post_title}` / `{post_content}`) over the FAQ
 * taxonomy. The Payload equivalent keeps that split: this block stores only
 * the section's own copy, and the questions come from the FAQs collection
 * grouped by their FAQ Category relationship at render time. No question is
 * ever stored on the page.
 */
export const faqIndexBlock: Block = {
  slug: 'faq-index',
  labels: { singular: 'FAQ Index', plural: 'FAQ Indexes' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Line above the search field, e.g. "Browse by category or search below".',
      },
    },
    { name: 'searchPlaceholder', type: 'text' },
    {
      name: 'allLabel',
      type: 'text',
      admin: {
        description: 'Label for the category that shows every question, e.g. "All questions".',
      },
    },
    {
      name: 'emptyMessage',
      type: 'text',
      admin: { description: 'Shown when a search matches nothing.' },
    },
  ],
}

/**
 * The contact page's consultation picker.
 *
 * WordPress authors the six consultation cards inline under a "Schedule Your
 * Free Consultation" heading. Here the cards are Consultations records, so
 * this block stores only the section's own copy and the cards are read from
 * the collection at render time — the same split the FAQ and testimonials
 * pages use.
 */
export const consultationsBlock: Block = {
  slug: 'consultations',
  labels: { singular: 'Consultation Picker', plural: 'Consultation Pickers' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      /**
       * The reassurance line in the corner of every card.
       *
       * It belongs to the section and not to a consultation: it reads the
       * same on all six cards because it is a promise about booking any of
       * them, so storing it per service would be six copies of one sentence
       * to keep in step. It was hardcoded in `ConsultationGrid` until now.
       */
      name: 'assuranceNote',
      type: 'text',
      admin: {
        description:
          'Small print on each card, e.g. \u201cFree \u00b7 No commitment\u201d. Empty prints nothing.',
      },
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

/**
 * A numbered legal document — the privacy policy, and anything else with the
 * same shape. Sections are numbered by their order in the array, so moving one
 * renumbers the rest; storing the number would let the two disagree.
 */
export const policyBlock: Block = {
  slug: 'policy',
  labels: { singular: 'Policy', plural: 'Policies' },
  fields: [
    { name: 'intro', type: 'textarea', admin: { description: 'Opening paragraph, above the numbered sections.' } },
    {
      name: 'sections',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'paragraphs',
          type: 'array',
          fields: [
            {
              name: 'lead',
              type: 'text',
              admin: { description: 'Bold run before the paragraph, e.g. \u201c1.1 Personal Information:\u201d.' },
            },
            { name: 'body', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      name: 'showContactDetails',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Print the company name, first address and email from Site Settings below the last section, so the policy cannot fall out of step with the rest of the site.',
      },
    },
  ],
}

/** A short numbered list of what happens next. */
export const nextStepsBlock: Block = {
  slug: 'next-steps',
  labels: { singular: 'Next Steps', plural: 'Next Steps' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'steps',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'detail', type: 'textarea' },
      ],
    },
  ],
}

/** A row of link chips — somewhere to go from a page that is a dead end. */
export const linkListBlock: Block = {
  slug: 'link-list',
  labels: { singular: 'Link List', plural: 'Link Lists' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
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
  socialProofBlock,
  faqIntroBlock,
  galleryTabsBlock,
  whyChooseUsBlock,
  contactFormBlock,
  faqIndexBlock,
  consultationsBlock,
  testimonialVideosBlock,
  reviewHighlightsBlock,
  testimonialsSpotlightBlock,
  serviceAreasBlock,
  customSectionBlock,
  policyBlock,
  nextStepsBlock,
  linkListBlock,
]
