import type { CollectionConfig } from 'payload'

/**
 * A person's reusable contact profile: who they are and how to reach them.
 *
 * One record per person, not per booking. It is created or matched by
 * `/api/contact` the moment somebody books a consultation, and it says exactly
 * one thing — "we have this person's contact details". It is not a login
 * account (nothing on this site authenticates a customer), and it is not a
 * confirmed appointment: the appointment carries its own status, and a record
 * here exists whether or not that appointment is ever approved.
 *
 * Matching is on email, then phone, and never on name — two different people
 * share a name far more often than they share an inbox. `/api/contact`
 * normalises both before looking: the email lowercased, the phone to E.164, so
 * "(650) 235-4863" and "+16502354863" are one person rather than two.
 *
 * A Lead does NOT create a customer. An enquiry is somebody asking a question,
 * and turning every question into a directory entry fills the directory with
 * people who never became customers. If that is wanted later it should be an
 * explicit rule — on qualification, say — rather than a side effect of the
 * contact form.
 *
 * What is deliberately absent: appointment counts, next-appointment dates and
 * "time until" figures. Those are derived from the `appointments` join below
 * and would be a second, staler copy of it if stored. Payment, likewise,
 * belongs to an order, not to a person's contact details.
 */
export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'phone', 'accountStatus', 'createdAt'],
    description:
      'Contact profiles. One per person, created or matched when a consultation is booked.',
    group: 'Leads',
  },
  access: {
    // The public endpoint creates these with Payload's Local API (which runs
    // with `overrideAccess` by default), so nothing here has to be open.
    create: () => false,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  timestamps: true,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          /**
           * The match key. Unique, because two rows with the same address are
           * the duplicate this collection exists to prevent — and a unique
           * index makes that true at the database level, not merely in the
           * endpoint that happens to look first.
           */
          name: 'email',
          type: 'email',
          required: true,
          unique: true,
          index: true,
        },
        {
          name: 'phone',
          type: 'text',
          index: true,
          admin: { description: 'Normalised to E.164, so the same number matches one profile.' },
        },
      ],
    },
    {
      /**
       * Whether they have an account, as opposed to having simply booked.
       *
       * Every profile this site creates is a guest: nothing here authenticates
       * a customer — the WordPress "Customer Cabinet" that would have let them
       * log in has its authentication switched off — so a record means "we
       * have this person's contact details" and never "they can sign in".
       */
      name: 'accountStatus',
      type: 'select',
      required: true,
      defaultValue: 'guest',
      index: true,
      options: [
        { label: 'Guest', value: 'guest' },
        { label: 'Registered', value: 'registered' },
      ],
    },
    {
      name: 'customerNotes',
      type: 'textarea',
      label: 'Notes left by the customer',
      admin: {
        description: 'What they wrote themselves — the comments from their most recent booking.',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Admin notes',
      admin: {
        description: 'Internal. Never shown to the customer and never written by the site.',
      },
    },
    {
      /**
       * The extra questions the booking form asks, kept together and kept out
       * of the core contact fields.
       *
       * `phoneNumber` here is NOT the primary phone above. The WordPress admin
       * shows the two holding different values — a second number somebody
       * added by hand — and collapsing them would quietly overwrite one with
       * the other. The booking form asks for one number, which is the primary;
       * this one is only ever set by staff.
       */
      type: 'group',
      name: 'customFields',
      label: 'Custom fields',
      fields: [
        {
          name: 'phoneNumber',
          type: 'text',
          label: 'Phone Number',
          admin: {
            description:
              'A second number, separate from the primary phone above. Never written by the site.',
          },
        },
        { name: 'address', type: 'text', label: 'Address' },
        { name: 'zipCode', type: 'text', label: 'Zip Code' },
        {
          name: 'comments',
          type: 'textarea',
          label: 'Comments',
          admin: {
            description:
              'The comment box on the booking form. Distinct from “Notes left by the customer” above, which is the core note field and is not written by the site.',
          },
        },
      ],
    },
    {
      /**
       * Their appointments, read from the other side of the relationship.
       *
       * A join stores nothing: the total, the next one and the last one are
       * all read off this list, so there is no count to fall out of step with
       * the appointments themselves.
       */
      name: 'appointments',
      type: 'join',
      collection: 'appointments',
      on: 'customer',
      admin: { defaultColumns: ['startsAt', 'consultationType', 'status'] },
    },
  ],
}
