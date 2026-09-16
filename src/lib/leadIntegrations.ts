import 'server-only'

import type { ContactSubmission } from '@/payload-types'

/**
 * The single seam for everything that happens to a lead AFTER it is stored.
 *
 * Nothing is dispatched today. The WordPress audit could not recover the
 * notification destination for the form the contact page actually used —
 * Fluent Forms keeps its settings in custom database tables that a WXR export
 * does not include — so no destination has been assumed. The one recipient the
 * export does evidence (`office@primedesignandbuild.com`) belongs to the
 * Forminator form used on the Google-Ads landing pages, not this one, and the
 * same form carried a HubSpot contact sync.
 *
 * To add delivery later, implement it here and nothing else changes: not the
 * form components, not the endpoint, not the collection schema. The endpoint
 * already calls this and writes whatever statuses come back onto the
 * submission, so a send can be audited and retried per lead.
 *
 * Expected shape when it is implemented:
 *
 *   - email  a Payload email adapter configured in `payload.config.ts`
 *            (`@payloadcms/email-resend` or `-nodemailer`), sending to
 *            `CONTACT_NOTIFICATION_TO` from `CONTACT_FROM_EMAIL`, with the
 *            submitter as Reply-To.
 *   - crm    a HubSpot contact upsert using `HUBSPOT_PRIVATE_APP_TOKEN`,
 *            mapping email / firstname / lastname / phone as the WordPress
 *            addon did.
 *
 * Failures must never fail the request: the lead is already saved, so a bad
 * delivery is recorded and retried, not surfaced to the visitor.
 */
export type LeadDeliveryResult = {
  notificationStatus: ContactSubmission['notificationStatus']
  crmStatus: ContactSubmission['crmStatus']
  deliveryError?: string
}

export async function dispatchLeadIntegrations(
  _submission: ContactSubmission,
): Promise<LeadDeliveryResult> {
  // Intentionally inert. `pending` (rather than `not-configured`) records that
  // these leads are still waiting to be delivered once a destination is
  // confirmed, so they can be backfilled rather than looking already handled.
  return { notificationStatus: 'pending', crmStatus: 'pending' }
}
