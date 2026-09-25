import type { CollectionConfig } from 'payload'

/**
 * The commercial record behind a booking: what it costs, what has been paid,
 * and whether it has been delivered.
 *
 * It exists as its own collection because none of that is appointment data.
 * "Open", "Not Paid" and "Pending Approval" are three different facts about
 * three different things — an order's state, its payment, and whether anyone
 * has agreed to the visit — and a site that keeps them in one column ends up
 * unable to say that a completed consultation was never invoiced.
 *
 * Today every one of these is a free consultation, so `/api/contact` opens a
 * zero-total order alongside each appointment: Open, Not Fulfilled, Not Paid,
 * nothing owed. That is what the WordPress admin shows, and a $0 total with no
 * transactions is not a failed booking — it is a free appointment. Nothing on
 * this site takes a payment, so nothing here is ever written again by code;
 * the fields are for staff, and for whatever takes payments later.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'customer', 'orderStatus', 'paymentStatus', 'total', 'createdAt'],
    description:
      'Price, payment and fulfilment for a booking. Consultations are free, so these open at zero.',
    group: 'Leads',
  },
  access: {
    create: () => false,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  timestamps: true,
  fields: [
    {
      /**
       * Shares the booking's reference, so the number a customer quotes finds
       * the appointment and the order alike rather than only one of them.
       */
      name: 'reference',
      type: 'text',
      index: true,
      admin: { description: 'The same reference as the appointment it was opened for.' },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers' as const,
      index: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'orderStatus',
          type: 'select',
          required: true,
          defaultValue: 'open',
          index: true,
          options: [
            { label: 'Open', value: 'open' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
        },
        {
          name: 'fulfillmentStatus',
          type: 'select',
          required: true,
          defaultValue: 'not-fulfilled',
          options: [
            { label: 'Not Fulfilled', value: 'not-fulfilled' },
            { label: 'Partially Fulfilled', value: 'partially-fulfilled' },
            { label: 'Fulfilled', value: 'fulfilled' },
          ],
        },
      ],
    },
    {
      name: 'paymentStatus',
      type: 'select',
      required: true,
      defaultValue: 'not-paid',
      index: true,
      options: [
        { label: 'Not Paid', value: 'not-paid' },
        { label: 'Partially Paid', value: 'partially-paid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Processing', value: 'processing' },
      ],
    },
    {
      name: 'coupon',
      type: 'text',
      admin: { description: 'Code applied to this order, if any.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', type: 'number', defaultValue: 0, min: 0 },
        { name: 'total', type: 'number', label: 'Total price', defaultValue: 0, min: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'totalPayments', type: 'number', defaultValue: 0, min: 0 },
        {
          name: 'balanceDue',
          type: 'number',
          label: 'Total balance due',
          defaultValue: 0,
          admin: { description: 'Total price less payments taken.' },
        },
      ],
    },
    {
      /**
       * The appointments this order covers, read from the other side of
       * `appointments.order`. A join stores nothing, so an order cannot end up
       * listing a visit that has since been attached elsewhere.
       */
      name: 'appointments',
      type: 'join',
      collection: 'appointments',
      on: 'order',
      admin: { defaultColumns: ['startsAt', 'consultationType', 'status'] },
    },
  ],
}
