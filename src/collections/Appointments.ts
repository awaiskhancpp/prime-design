import type { CollectionConfig } from 'payload'

/**
 * A consultation requested through the site: a service, a day, a time slot,
 * and a status of its own.
 *
 * Three things are kept apart here, because they are three things:
 *
 *   Lead (`contact-submissions`)  an enquiry — a message somebody sent, with
 *                                 a lifecycle of new → contacted → qualified.
 *   Customer (`customers`)        the reusable contact profile: who they are
 *                                 and how to reach them. One per person.
 *   Appointment (this)            the visit itself. Its status is an approval
 *                                 and attendance status, nothing else.
 *
 * `/api/contact` writes here when `source === 'appointment'` and writes a lead
 * otherwise, and it finds-or-creates the `customer` at the same time, matching
 * on email and then phone — never on name. Daily capacity in
 * `lib/bookingAvailability.ts` is counted on this collection alone.
 *
 * The contact fields below are deliberately BOTH here and on the linked
 * Customer. They are the snapshot of what the person typed when they booked;
 * the Customer record is their contact details as they stand today. Editing a
 * customer's phone number must not silently rewrite what an appointment from
 * six months ago says they gave, and calling an old booking's address up needs
 * the address they asked the estimator to visit, not the one they later moved
 * to.
 *
 * NOT modelled here, deliberately: payment. An order status, a price, a
 * transaction and an invoice are a commercial record, and "Not Paid" is not an
 * appointment status. These consultations are free and nothing bills for them,
 * so there is no Order collection; if payments ever arrive, they belong in one
 * rather than in extra columns here.
 */
export const Appointments: CollectionConfig = {
  slug: 'appointments',
  admin: {
    useAsTitle: 'email',
    // What you need to see about a booking at a glance: who, what they booked,
    // when it is, and whether it is still happening.
    defaultColumns: [
      'email',
      'customer',
      'consultationType',
      'startsAt',
      'status',
    ],
    description:
      'Consultations requested through the site. The contact details are the snapshot given at booking; the linked Customer holds the current ones.',
    group: 'Leads',
  },
  access: {
    // The public endpoint creates these with Payload's Local API (which runs
    // with `overrideAccess` by default), so nothing here has to be open.
    create: () => false,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: () => false,
  },
  timestamps: true,
  fields: [
    {
      /**
       * The person this appointment is for.
       *
       * Created or matched by `/api/contact` when the booking comes in, so a
       * returning customer accumulates appointments against one profile
       * instead of a new row each time. Matching is on email, then phone —
       * two different people share a name far more often than an inbox.
       */
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers' as const,
      index: true,
      admin: { description: 'The contact profile. Their details as they stand today.' },
    },
    // The snapshot: what the person typed when they booked. Not kept in step
    // with the linked Customer record, on purpose — see the note above.
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
        { name: 'email', type: 'email', required: true, index: true },
        {
          name: 'phone',
          type: 'text',
          required: true,
          admin: { description: 'Normalised to E.164 on submit; the raw input is kept in `meta`.' },
        },
      ],
    },
    {
      /**
       * The service the booking is about, as a relationship rather than a copy
       * of its name — the same reasoning as on `contact-submissions.service`:
       * renaming a service must not leave old bookings describing something
       * that no longer exists under that name.
       */
      name: 'service',
      type: 'relationship',
      relationTo: 'services' as const,
      index: true,
      admin: { description: 'Chosen from the booking form’s service dropdown.' },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'Comments',
      admin: {
        description:
          'Context the customer added to the booking. The modal asks for three words, not the contact form’s eight — the booking has already said which service, which day and which time.',
      },
    },

    {
      type: 'collapsible',
      label: 'Appointment',
      fields: [
        {
          type: 'row',
          fields: [
            {
              /**
               * When it starts, as an instant.
               *
               * Not a date column plus a "09:00 am" string: those are two
               * values that can disagree, and neither of them alone says what
               * moment the visit actually is. The slot the visitor picks is a
               * Pacific wall-clock time, so `checkBooking` resolves it through
               * `pacificToUtcIso` — the admin may show the date and the time in
               * two inputs, but one instant is what is stored, and capacity is
               * counted on it.
               */
              name: 'startsAt',
              type: 'date',
              label: 'Starts',
              index: true,
              admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, h:mm a' } },
            },
            {
              /** `startsAt` plus the appointment length in Booking Settings. */
              name: 'endsAt',
              type: 'date',
              label: 'Ends',
              admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, h:mm a' } },
            },
          ],
        },
        {
          /**
           * Travel and turnaround either side of the visit, in minutes.
           *
           * Nobody is asked for these — they are the estimator's diary, not the
           * customer's booking. LatePoint sets them per service; there is no
           * source for what this company uses, so both start at nothing and
           * staff set them where they matter.
           */
          type: 'row',
          fields: [
            {
              name: 'bufferBefore',
              type: 'number',
              label: 'Buffer before (minutes)',
              defaultValue: 0,
              min: 0,
              max: 480,
            },
            {
              name: 'bufferAfter',
              type: 'number',
              label: 'Buffer after (minutes)',
              defaultValue: 0,
              min: 0,
              max: 480,
            },
          ],
        },
        { name: 'consultationType', type: 'text' },
        {
          /**
           * The reference the modal prints on its confirmation screen and
           * writes into the calendar invite. It was buried inside `meta` on
           * `contact-submissions`, where the number a caller quotes could not
           * be searched for; here it is the field it always was.
           */
          name: 'bookingReference',
          type: 'text',
          index: true,
          admin: { description: 'Quoted by the customer, e.g. \u201cLWYFS8N\u201d.' },
        },
        {
          type: 'row',
          fields: [
            { name: 'address', type: 'text', admin: { description: 'Where to send an estimator.' } },
            { name: 'zipCode', type: 'text' },
          ],
        },
      ],
    },

    {
      /**
       * The commercial record this visit belongs to.
       *
       * A consultation is free, so its order is an open, unpaid, zero-total
       * one — which is exactly what the WordPress admin shows. It exists so
       * that price, payment and fulfilment have somewhere to live that is not
       * the appointment: "Not Paid" is not an appointment status, and an
       * appointment that is Completed says nothing about whether an invoice
       * was raised.
       */
      name: 'order',
      type: 'relationship',
      relationTo: 'orders' as const,
      label: 'Parent order',
      index: true,
    },

    {
      /**
       * Approval and attendance, and nothing else — the five LatePoint uses.
       * Whether anyone has been billed is the order's business.
       *
       * `cancelled` and `no-show` are the two that give the slot back;
       * `lib/bookingAvailability.ts` counts everything else against the day's
       * capacity. A booking arrives as Pending Approval, which is what it is:
       * the visitor chose a time the calendar offered, nobody has agreed to it
       * yet.
       */
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending-approval',
      index: true,
      options: [
        { label: 'Pending Approval', value: 'pending-approval' },
        { label: 'Approved', value: 'approved' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'No Show', value: 'no-show' },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'formName',
          type: 'text',
          admin: { description: 'The form that was filled in, e.g. “Appointment modal”.' },
        },
        {
          name: 'sourceUrl',
          type: 'text',
          admin: { readOnly: true, description: 'Page the booking was made from.' },
        },
      ],
    },

    {
      type: 'collapsible',
      label: 'Delivery',
      admin: {
        description:
          'Nothing dispatches these yet. When email or CRM delivery is added in src/lib/leadIntegrations.ts it records its outcome here.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'notificationStatus',
              type: 'select',
              defaultValue: 'pending',
              admin: { readOnly: true },
              options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Not configured', value: 'not-configured' },
                { label: 'Sent', value: 'sent' },
                { label: 'Failed', value: 'failed' },
              ],
            },
            {
              name: 'crmStatus',
              type: 'select',
              defaultValue: 'pending',
              admin: { readOnly: true },
              options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Not configured', value: 'not-configured' },
                { label: 'Synced', value: 'synced' },
                { label: 'Failed', value: 'failed' },
              ],
            },
          ],
        },
        {
          name: 'deliveryError',
          type: 'textarea',
          admin: { readOnly: true, description: 'Last delivery error, if any.' },
        },
      ],
    },

    {
      type: 'collapsible',
      label: 'Anti-spam',
      admin: { description: 'How this booking cleared the endpoint checks.' },
      fields: [
        {
          name: 'recaptchaStatus',
          type: 'select',
          defaultValue: 'not-configured',
          admin: { readOnly: true },
          options: [
            { label: 'Not configured', value: 'not-configured' },
            { label: 'Verified', value: 'verified' },
            { label: 'Skipped', value: 'skipped' },
          ],
        },
        {
          name: 'recaptchaScore',
          type: 'number',
          admin: { readOnly: true, description: 'Only set by reCAPTCHA v3.' },
        },
        {
          name: 'meta',
          type: 'json',
          admin: {
            readOnly: true,
            description: 'Raw phone input, user agent and a hashed IP. No raw IP is stored.',
          },
        },
      ],
    },
  ],
}
