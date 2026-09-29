import {
  absoluteUrl,
  linkRow,
  renderEmailShell,
  stepsBlock,
  textBlocks,
  textFooter,
  type EmailLink,
  type EmailSettings,
  type RenderedEmail,
} from './shell'

/**
 * The confirmation a visitor receives after sending an enquiry — from the
 * contact band, the consultation popup, or a service-location form.
 *
 * ## Where the words come from
 *
 * All of them come from the `thank-you` page record in Payload, and that is
 * the point. This email and `/thank-you` are the same message at the same
 * moment in the same journey; authoring them separately would guarantee they
 * drift. The page's hero eyebrow, heading, lead and CTA, its "What happens
 * next" steps and its "In the meantime" links are passed in here by
 * `resolveEnquiryEmailContent`, so editing that page in the admin edits this
 * email too.
 *
 * Two strings are AUTHORED rather than migrated, and neither could be
 * anything else: the subject line and the greeting. WordPress sent no email
 * at all for this form — Fluent Forms kept its notification settings in
 * database tables a WXR export does not carry — so there is no original
 * wording to be faithful to here, only the site's own voice to match. (The
 * same reasoning, and the same disclosure, as the authored `/thank-you` meta
 * description recorded in CLAUDE.md §8c.)
 */
export type EnquiryConfirmationContent = {
  eyebrow: string
  heading: string
  intro?: string
  stepsHeading?: string
  steps: { title: string; detail?: string }[]
  linksHeading?: string
  links: EmailLink[]
  cta?: EmailLink
}

export function renderEnquiryConfirmation({
  firstName,
  content,
  settings,
  baseUrl,
}: {
  firstName?: string
  content: EnquiryConfirmationContent
  settings: EmailSettings
  /** Only the preview route sets this; see `absoluteUrl`. */
  baseUrl?: string
}): RenderedEmail {
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()},` : 'Hi,'
  const links = content.links.map((link) => ({ ...link, href: absoluteUrl(link.href, baseUrl) }))

  const bodyHtml = [
    stepsBlock(content.stepsHeading || 'What happens next', content.steps),
    links.length ? linkRow(content.linksHeading || 'In the meantime', links) : '',
  ].join('')

  const html = renderEmailShell({
    // The inbox preview line: the reassurance, not the greeting.
    preheader: content.intro || 'We have your message and will be in touch shortly.',
    eyebrow: content.eyebrow,
    heading: content.heading,
    intro: [greeting, content.intro].filter((line): line is string => Boolean(line)),
    bodyHtml,
    button: content.cta ? { ...content.cta, href: absoluteUrl(content.cta.href, baseUrl) } : undefined,
    settings,
    baseUrl,
  })

  const text = textBlocks([
    greeting,
    content.heading,
    content.intro,
    content.steps.length > 0 &&
      [
        (content.stepsHeading || 'What happens next').toUpperCase(),
        ...content.steps.map(
          (step, index) =>
            `${String(index + 1).padStart(2, '0')}. ${step.title}${step.detail ? `\n    ${step.detail}` : ''}`,
        ),
      ].join('\n'),
    content.cta && `${content.cta.label}: ${absoluteUrl(content.cta.href, baseUrl)}`,
    links.length > 0 &&
      [
        (content.linksHeading || 'In the meantime').toUpperCase(),
        ...links.map((link) => `- ${link.label}: ${link.href}`),
      ].join('\n'),
    `Prefer to talk? Call ${settings.phone} (${settings.hours}).`,
    textFooter(settings),
  ])

  return {
    // AUTHORED. Short enough to survive a phone's subject truncation, and it
    // leads with the reassurance rather than the company name.
    subject: `Thanks for getting in touch — ${settings.name}`,
    html,
    text,
  }
}

/** The button used when `/thank-you` has no CTA of its own to lend. */
export const DEFAULT_ENQUIRY_CTA: EmailLink = {
  label: 'Book a free consultation',
  href: '/contact',
}
