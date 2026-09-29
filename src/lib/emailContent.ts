import 'server-only'

import { DEFAULT_ENQUIRY_CTA, type EnquiryConfirmationContent } from '@/emails/enquiryConfirmation'
import type { EmailSettings } from '@/emails/shell'
import { resolvePageBySlug } from './pages'
import { resolveSiteSettings } from './siteSettings'

/**
 * The company details every email's header, contact strip and footer print.
 * One read, from the same Site Settings global the site itself renders from,
 * so an address or phone number corrected in the admin is corrected in the
 * mail too.
 */
export async function resolveEmailSettings(): Promise<EmailSettings> {
  const settings = await resolveSiteSettings()
  return {
    name: settings.name,
    phone: settings.phone,
    phoneClean: settings.phoneClean,
    email: settings.email,
    license: settings.license,
    hours: settings.hours,
    addresses: settings.addresses.map((entry) => ({ address: entry.address })),
  }
}

/**
 * The enquiry confirmation's copy, read from the `thank-you` page record.
 *
 * That page is the on-screen half of this exact moment — the visitor has just
 * submitted a form and been redirected to it — so the email says the same
 * thing by construction rather than by somebody remembering to keep two
 * pieces of copy in step. Its hero supplies the eyebrow, heading, lead and
 * button; its `next-steps` block supplies "What happens next"; its
 * `link-list` block supplies "In the meantime".
 *
 * If the record or a block is missing, what exists is still sent and the gap
 * is logged by name rather than papered over with invented copy — the same
 * habit as the migration scripts' unresolved-token reporting.
 */
export async function resolveEnquiryEmailContent(): Promise<EnquiryConfirmationContent> {
  const page = await resolvePageBySlug('thank-you')

  if (!page) {
    console.error(
      '[emailContent] no `pages` record with slug "thank-you", so the enquiry ' +
        'confirmation email has no CMS copy to send. Falling back to the heading and ' +
        'lead only. Restore that record to fix this.',
    )
  }

  const steps = page?.layout.find((section) => section.type === 'next-steps')
  const links = page?.layout.find((section) => section.type === 'link-list')

  if (page && !steps) {
    console.warn(
      '[emailContent] the "thank-you" page has no `next-steps` block, so the enquiry ' +
        'confirmation email will go out without its "What happens next" list.',
    )
  }

  const hero = page?.hero

  return {
    // The fallbacks are the same words the page itself carries today; they
    // only apply if the record has been emptied.
    eyebrow: hero?.eyebrow || 'Message received',
    heading: hero?.heading || 'Thank you — we’ll be in touch shortly',
    intro:
      hero?.description ||
      'Your enquiry is with our team. We answer every message personally, usually within one business day.',
    stepsHeading: steps?.type === 'next-steps' ? steps.content.heading : undefined,
    steps: steps?.type === 'next-steps' ? steps.content.steps : [],
    linksHeading: links?.type === 'link-list' ? links.content.heading : undefined,
    links: links?.type === 'link-list' ? links.content.links : [],
    cta:
      hero?.cta?.label && hero.cta.href
        ? { label: hero.cta.label, href: hero.cta.href }
        : DEFAULT_ENQUIRY_CTA,
  }
}
