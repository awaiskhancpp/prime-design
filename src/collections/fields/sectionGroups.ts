import type { Field } from 'payload'
import { buttonTextField, linkUrlField } from '../../fields/Shared'

/**
 * Section groups that a service and its city pages both carry.
 *
 * Services.ts and ServiceLocations.ts used to declare each of these on their
 * own, and the copies drifted: the same "Quote" section took an uploaded image
 * on a service and a typed file path on a city page, and the city copy of
 * "Silicon Valley Loves" had no star toggle and no buttons, so a city page
 * borrowed those from its service without the admin showing why. One
 * definition per section now; each collection passes only its own label and
 * description. Field names are the ones both collections already used, so
 * the database columns do not move.
 */

type GroupOptions = { label: string; description?: string }

const substitutions = '{City} / {Company} are substituted.'

/** The copy above the quote form at the top of a city page. */
export const locationHeroGroup = ({ label, description }: GroupOptions): Field => ({
  name: 'locationHero',
  type: 'group',
  label,
  admin: { description },
  fields: [
    {
      name: 'lede',
      type: 'text',
      admin: { description: `Small brass line above the H1. ${substitutions}` },
    },
    {
      name: 'body',
      type: 'textarea',
      admin: { description: `Paragraph under the H1. ${substitutions}` },
    },
    {
      name: 'formSubject',
      type: 'text',
      admin: {
        description: 'Completes “Let’s talk about your dream …” beside the form — e.g. “kitchen”.',
      },
    },
    {
      name: 'blurbs',
      type: 'array',
      admin: {
        description: `The three captions under the hero feature photos, in order. ${substitutions}`,
      },
      fields: [{ name: 'text', type: 'text' }],
    },
  ],
})

/** The "Crafting Your Dream Home, Our Promise" pull-quote section. */
export const quoteGroup = ({ label, description }: GroupOptions): Field => ({
  name: 'quote',
  type: 'group',
  label,
  admin: { description },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'quote', type: 'textarea' },
    { name: 'attribution', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
})

/** The "Silicon Valley loves working with us!" trust section (`ProjectsTrustIntro`). */
export const siliconValleyLovesGroup = ({ label, description }: GroupOptions): Field => ({
  name: 'siliconValleyLoves',
  type: 'group',
  label,
  admin: { description },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'stats',
      type: 'array',
      admin: {
        description:
          'The floating stat card (e.g. rating / review count / projects built). One row per figure.',
      },
      fields: [
        { name: 'value', type: 'text' },
        { name: 'label', type: 'text' },
        { name: 'detail', type: 'text' },
        {
          name: 'showStars',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Render five stars above the value (for ratings).' },
        },
      ],
    },
    {
      name: 'buttons',
      type: 'array',
      admin: { description: 'Call-to-action buttons under the copy.' },
      fields: [
        buttonTextField('label', true),
        linkUrlField('url', true),
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'outline',
          options: [
            { label: 'Outlined', value: 'outline' },
            { label: 'Brass (filled)', value: 'brass' },
          ],
        },
      ],
    },
  ],
})

/** The testimonial card grid, picked from the Testimonials collection. */
export const testimonialCardsGroup = ({
  label,
  description,
  testimonialsDescription,
}: GroupOptions & { testimonialsDescription: string }): Field => ({
  name: 'testimonialCards',
  type: 'group',
  label,
  admin: { description },
  fields: [
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
      admin: { description: testimonialsDescription },
    },
  ],
})

/** The city-page video section. `{City}` / `{ServiceTitle}` are substituted. */
export const locationVideoGroup = ({ label, description }: GroupOptions): Field => ({
  name: 'locationVideo',
  type: 'group',
  label,
  admin: { description },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'tagline', type: 'text' },
    { name: 'videoUrl', type: 'text' },
    { name: 'poster', type: 'upload', relationTo: 'media' },
  ],
})

/** The city-page "Don't Settle for a Mediocre…" intro. `{City}` / `{ServiceTitle}` are substituted. */
export const dontSettleGroup = ({ label, description }: GroupOptions): Field => ({
  name: 'dontSettle',
  type: 'group',
  label,
  admin: { description },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'headingAccent', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'ctaLabel', type: 'text', label: 'Button text' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Side image. WordPress uses the same photo (attachment 579, 11.png) on all three family templates.',
      },
    },
  ],
})

/** The city-page "The Prime Difference" section (checklist + four reason cards). */
export const locationPrimeDifferenceGroup = ({ label, description }: GroupOptions): Field => ({
  name: 'primeDifference',
  type: 'group',
  label,
  admin: { description },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    // Rich text: the WordPress original emphasises a phrase in this paragraph
    // ("we are the <b>unrivaled experts</b>").
    { name: 'body', type: 'richText' },
    {
      name: 'checklist',
      type: 'array',
      fields: [{ name: 'text', type: 'text' }],
    },
    {
      name: 'reasons',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'richText' },
        {
          // A path to a site icon in /public, not a Media document: the brass
          // versions of WordPress's black icons (CLAUDE.md §8c).
          name: 'image',
          type: 'text',
          label: 'Icon path',
          admin: { description: 'A site icon, e.g. /customer-satisfaction.svg.' },
        },
      ],
    },
  ],
})
