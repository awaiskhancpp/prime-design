import type { CollectionConfig } from 'payload'

/**
 * Leads captured by the site's contact forms.
 *
 * The submission is written here first and nothing else happens to it yet.
 * Email notifications and the CRM sync are deliberately NOT wired: the audit of
 * the WordPress export could not recover the destination for the form the
 * contact page actually used (Fluent Forms stores its notification settings in
 * custom database tables that a WXR export does not include), so no destination
 * has been assumed.
 *
 * The seam for adding them later is `src/lib/leadIntegrations.ts`, which the
 * submission endpoint already calls. `notificationStatus` and `crmStatus` are
 * stored per submission so a delivery can be retried or audited without
 * changing the form, the endpoint or this schema — every lead sits at `pending`
 * until something is wired up to move it.
 */
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'projectType', 'status', 'createdAt'],
    description:
      'Leads submitted through the site forms. Read-only record of what the visitor sent.',
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
      name: 'projectType',
      type: 'select',
      admin: {
        description:
          'The six options the WordPress form offered. Blank when the form that submitted has no project selector.',
      },
      options: [
        { label: 'Kitchen Remodeling', value: 'kitchen-remodeling' },
        { label: 'Bathroom Remodeling', value: 'bathroom-remodeling' },
        { label: 'Home Remodeling', value: 'home-remodeling' },
        { label: 'Additions', value: 'additions' },
        { label: 'ADU & Garage Conversions', value: 'adu' },
        { label: 'New Construction / Complete Renovation', value: 'complete-renovation' },
      ],
    },
    { name: 'subject', type: 'text' },
    { name: 'message', type: 'textarea', required: true },

    {
      type: 'collapsible',
      label: 'Appointment details',
      admin: {
        description: 'Only set when the lead came from the consultation booking flow.',
      },
      fields: [
        { name: 'address', type: 'text' },
        { name: 'zipCode', type: 'text' },
        { name: 'consultationType', type: 'text' },
        { name: 'preferredDate', type: 'text' },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'select',
          required: true,
          defaultValue: 'contact-page',
          options: [
            { label: 'Contact page', value: 'contact-page' },
            { label: 'Service page', value: 'service-page' },
            { label: 'Location page', value: 'location-page' },
            { label: 'Landing page', value: 'landing-page' },
            { label: 'Appointment booking', value: 'appointment' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          index: true,
          options: [
            { label: 'New', value: 'new' },
            { label: 'Contacted', value: 'contacted' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'Archived', value: 'archived' },
          ],
        },
      ],
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: { readOnly: true, description: 'Page the form was submitted from.' },
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
      admin: { description: 'How this submission cleared the endpoint checks.' },
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
