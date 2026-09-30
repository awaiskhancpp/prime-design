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
