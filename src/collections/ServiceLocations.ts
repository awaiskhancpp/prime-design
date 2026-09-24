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

/**
 * The location hero — the copy above the quote form at the top of every city
 * page. WordPress keeps this on the family template (1495/1584/1639) rather
 * than per city, so the parent service holds the default and this group is the
 * per-city override. Shape is identical to the `locationHero` group on
 * Services.
 */
const locationHeroField = {
  name: 'locationHero',
  type: 'group' as const,
  label: 'Hero Section',
  admin: {
    description:
      'Hero copy above the quote form. Use {City} for the city name and {Company} for the company name — both are substituted when the page renders. Leave a field empty to inherit the parent service’s hero copy, then the built-in WordPress family template.',
  },
  fields: [
    {
      name: 'lede',
      type: 'text' as const,
      admin: { description: 'Small brass line above the H1. {City} / {Company} are substituted.' },
    },
    {
      name: 'body',
      type: 'textarea' as const,
      admin: { description: 'Paragraph under the H1. {City} / {Company} are substituted.' },
    },
    {
      name: 'formSubject',
      type: 'text' as const,
      admin: {
        description: 'Completes “Let’s talk about your dream …” beside the form — e.g. “kitchen”.',
      },
    },
    {
      name: 'blurbs',
      type: 'array' as const,
      admin: {
        description:
          'The three captions under the hero feature photos. {City} / {Company} are substituted.',
      },
      fields: [{ name: 'text', type: 'text' as const }],
    },
  ],
}

const locationVideoField = {
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
}

const dontSettleField = {
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
    {
      name: 'image',
      type: 'text' as const,
      admin: {
        description:
          'Side image. WordPress uses the same photo (attachment 579, 11.png) on all three family templates. Empty falls back to the page hero, which is the city marketing graphic — not what WordPress shows.',
      },
    },
  ],
}

const primeDifferenceField = {
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
    // Rich text, not a textarea: the WordPress original emphasises a phrase
    // inside this paragraph ("we are the <b>unrivaled experts</b>"), which a
    // plain string cannot carry, and editors were otherwise unable to bold or
    // link anything in the one paragraph that sells the section.
    { name: 'body', type: 'richText' as const },
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
        // Also rich text, for the same reason and so the four cards are
        // editable in the same way as the paragraph above them.
        { name: 'description', type: 'richText' as const },
        { name: 'image', type: 'text' as const },
      ],
    },
  ],
}

/**
 * The two buttons under the sub-service cards.
 *
 * They live on the location record rather than being read off the parent
 * service's `sub-services` block, because a location page is a different
 * WordPress template from its parent service page and its buttons are its
 * own — the project owner has corrected this exact assumption before. What
 * the live original carries on every one of these pages is "View our gallery"
 * (→ /gallery) and "Talk to an expert" (→ #contact, the form further down the
 * same page); the labels were hardcoded in `ServiceLocationPage` until now,
 * which meant no editor could change a word of them.
 */
const offeringsField = {
  name: 'offerings',
  type: 'group' as const,
  label: 'Offerings Section',
  admin: {
    description:
      "The sub-service cards section. The cards themselves come from the parent service; these are this page's own buttons.",
  },
  fields: [
    { name: 'heading', type: 'text' as const },
    { name: 'description', type: 'textarea' as const },
    {
      /**
       * The three cards, as this page shows them.
       *
       * They used to be read off the parent service's `sub-services` block,
       * with the city appended to each title. That was wrong in both halves.
       * The location template carries its own photographs — the kitchen pages
       * use `Custom-Kitchen.png` / `European-Kitchen.png` /
       * `Shaker-Kitchen.png` while the parent service page uses project
       * photos, and the bathroom pages use three specific 2023-05-05 photos,
       * not the neighbouring frames from the same series the service page
       * shows. And only the kitchen pages append the city to a card title;
       * the bathroom pages read "Custom Bathtubs" full stop.
       *
       * Empty falls back to the parent service's cards, so a page that has
       * not been seeded renders exactly as it did before.
       */
      name: 'cards',
      type: 'array' as const,
      labels: { singular: 'Card', plural: 'Cards' },
      fields: [
        { name: 'title', type: 'text' as const, required: true },
        { name: 'description', type: 'textarea' as const },
        { name: 'image', type: 'upload' as const, relationTo: 'media' as const },
        { name: 'href', type: 'text' as const },
      ],
    },
    {
      name: 'primaryCta',
      type: 'group' as const,
      label: 'Primary Button',
      fields: [
        { name: 'label', type: 'text' as const },
        { name: 'href', type: 'text' as const },
      ],
    },
    {
      name: 'secondaryCta',
      type: 'group' as const,
      label: 'Secondary Button',
      fields: [
        { name: 'label', type: 'text' as const },
        { name: 'href', type: 'text' as const },
      ],
    },
  ],
}

const quoteField = {
  name: 'quote',
  type: 'group' as const,
  label: 'Quote Section',
  fields: [
    { name: 'heading', type: 'text' as const },
    { name: 'quote', type: 'textarea' as const },
    { name: 'attribution', type: 'text' as const },
    { name: 'image', type: 'text' as const },
  ],
}

const siliconValleyLovesField = {
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
}

const testimonialCardsField = {
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
}

/**
 * The location-page section groups, in the order the sections render in
 * `ServiceLocationPage`. Each one gets its own admin tab below.
 *
 * Nothing outside this file imports this array — the comment that used to
 * claim it was shared with Services.ts was stale, since Services.ts declares
 * its own copies of these groups inside its own tabs. It stays exported so the
 * grouping is reviewable in one place.
 */
export const locationPageSectionFields = [
  locationHeroField,
  locationVideoField,
  dontSettleField,
  quoteField,
  offeringsField,
  primeDifferenceField,
  testimonialCardsField,
  siliconValleyLovesField,
]

export const ServiceLocations: CollectionConfig = {
  slug: 'service-locations',
  // Grouped, predictable list: bathroom-* → home-* → kitchen-*.
  defaultSort: 'slug',
  admin: {
    group: 'Services',
    useAsTitle: 'title',
    defaultColumns: ['title', 'service', 'location', 'slug'],
    // All 45 records visible on one page (no pagination repeats).
    pagination: { defaultLimit: 50 },
    description:
      'The small service + location record. Shared page layout comes from the frontend template.',
  },
  hooks: { beforeValidate: [ensureUniqueServiceLocation] },
  // Identity fields stay outside the tabs so the required ones are always
  // visible, whichever tab the editor is on.
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
      // Every tab below is UNNAMED (label + fields, no `name`), so its fields
      // live at the document root exactly as they did when they shared one
      // tab. Splitting them is an admin-only change: no column moves, no
      // migration, and no change to the generated types. Order matches the
      // order the sections render in ServiceLocationPage.
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          description:
            'Hero copy above the quote form. Use {City} for the city name and {Company} for the company name — both are substituted when the page renders. Leave a field empty to inherit the parent service’s hero copy, then the built-in WordPress family template.',
          fields: [locationHeroField],
        },
        {
          label: 'Video',
          description:
            'Video shown on the location page. Use {City} for the city name and {ServiceTitle} for the service name.',
          fields: [locationVideoField],
        },
        {
          label: 'Don’t Settle',
          description:
            '"Don’t Settle for a Mediocre…" intro section. Use {City} and {ServiceTitle} placeholders.',
          fields: [dontSettleField],
        },
        {
          label: 'Offerings',
          description:
            'The sub-service cards section. The cards come from the parent service; the two buttons under them belong to this page — the live original carries “View our gallery” and “Talk to an expert”.',
          fields: [offeringsField],
        },
        {
          label: 'Quote',
          description:
            'The “Crafting Your Dream Home, Our Promise” pull-quote. Empty falls back to the parent service’s Quote section.',
          fields: [quoteField],
        },
        {
          label: 'Prime Difference',
          description:
            '"The Prime Difference" section (heading + checklist + reason cards + review logos).',
          fields: [primeDifferenceField],
        },
        {
          label: 'Testimonials',
          description:
            'The three review cards under the reviews strip. Empty falls back to the parent service’s Testimonial Cards section.',
          fields: [testimonialCardsField],
        },
        {
          label: 'Silicon Valley',
          description:
            'The “Silicon Valley loves working with us!” trust section. Empty falls back to the parent service’s matching section.',
          fields: [siliconValleyLovesField],
        },
        {
          label: 'Page Settings',
          description:
            'Identity and import fields for this city page, plus optional per-section on/off overrides.',
          fields: [
            {
              name: 'city',
              type: 'text',
              admin: {
                description: 'Legacy WordPress city value; retained for import compatibility.',
              },
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
          ],
        },
        {
          label: 'SEO',
          description: 'Search and social metadata for this city page.',
          fields: [...SEOFields],
        },
      ],
    },
  ],
}
