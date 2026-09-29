import {
  COLOR,
  FONT,
  button,
  detailTable,
  escapeHtml,
  escapeParagraph,
  panel,
  renderEmailShell,
  textBlocks,
  textFooter,
  type EmailSettings,
  type RenderedEmail,
} from './shell'

export type LeadAlertInput = {
  kind: 'enquiry' | 'booking'
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  /** The service title, already resolved from the slug. */
  service?: string
  subject?: string
  message?: string
  /** Which form on the site this came from, e.g. "Consultation popup". */
  formName?: string
  /** The page it was submitted from. */
  sourceUrl?: string
  receivedAt?: Date
}

/**
 * The alert the team receives when a lead arrives.
 *
 * ## Designed around what the reader actually does with it
 *
 * This one is not a marketing email and is not trying to be. Whoever opens it
 * is usually on a phone, and the only thing they are going to do is call the
 * person back — so the composition is ordered by that job, not by politeness:
 *
 *   - **The subject line carries the lead.** `New enquiry — Sarah Chen ·
 *     Kitchen Remodeling` is legible on a lock screen without opening
 *     anything, which is where most of these are first read.
 *   - **The name is the heading**, because that is what identifies the lead.
 *   - **The call button sits above the detail**, not under it. Every other
 *     email here puts its action last; this one puts it first, because
 *     reading the message is optional and phoning back is not.
 *   - **No contact strip.** It prints the company's own phone number and
 *     opening hours, which the person reading this already knows.
 *
 * The submitter's address belongs in `Reply-To` when this is dispatched, so
 * that hitting Reply in any client answers the customer rather than the
 * sending mailbox. That is a header, not a template concern, so it is noted
 * here for whoever implements `dispatchLeadIntegrations` rather than done
 * here.
 *
 * Every value interpolated below is attacker-supplied — it came off a public
 * form — so all of it goes through `escapeHtml`/`escapeParagraph`.
 */
export function renderLeadAlert({
  lead,
  settings,
  baseUrl,
}: {
  lead: LeadAlertInput
  settings: EmailSettings
  /** Only the preview route sets this; see `absoluteUrl`. */
  baseUrl?: string
}): RenderedEmail {
  const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ').trim() || 'New lead'
  const phoneDigits = (lead.phone || '').replace(/[^\d+]/g, '')
  const noun = lead.kind === 'booking' ? 'booking' : 'enquiry'

  const meta = [
    lead.formName ? `Form: ${lead.formName}` : '',
    lead.sourceUrl ? `Page: ${lead.sourceUrl}` : '',
    lead.receivedAt
      ? `Received: ${lead.receivedAt.toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}`
      : '',
  ].filter(Boolean)

  const bodyHtml = [
    phoneDigits
      ? button({ label: `Call ${lead.phone}`, href: `tel:${phoneDigits}` })
      : lead.email
        ? button({ label: 'Reply by email', href: `mailto:${lead.email}` })
        : '',

    detailTable([
      { label: 'Phone', value: lead.phone || '', href: phoneDigits ? `tel:${phoneDigits}` : undefined },
      { label: 'Email', value: lead.email || '', href: lead.email ? `mailto:${lead.email}` : undefined },
      { label: 'Service', value: lead.service || '' },
      { label: 'Subject', value: lead.subject || '' },
    ]),

    lead.message?.trim()
      ? panel(
          `<div style="font-size:11px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:${COLOR.brassDeep};">Message</div>
                      <div style="margin-top:10px;font-size:15px;line-height:25px;color:${COLOR.ink2};">${escapeParagraph(lead.message.trim())}</div>`,
        )
      : '',

    meta.length
      ? `
      <div style="margin-top:30px;padding-top:18px;border-top:1px solid ${COLOR.hairline};font-family:${FONT};font-size:12px;line-height:20px;color:${COLOR.muted};">
        ${meta.map((line) => escapeHtml(line)).join('<br />')}
      </div>`
      : '',
  ].join('')

  const html = renderEmailShell({
    // The preview line does real work here: the start of the message tells
    // the reader whether this needs answering now, before they open it.
    preheader: lead.message?.trim()?.slice(0, 140) || `New ${noun} from ${name}`,
    eyebrow: lead.kind === 'booking' ? 'New booking' : 'New enquiry',
    heading: name,
    intro: lead.service ? `${lead.service}${lead.formName ? ` · ${lead.formName}` : ''}` : undefined,
    bodyHtml,
    settings,
    showContactStrip: false,
    baseUrl,
  })

  const text = textBlocks([
    `New ${noun} — ${name}`,
    [
      lead.phone && `Phone:   ${lead.phone}`,
      lead.email && `Email:   ${lead.email}`,
      lead.service && `Service: ${lead.service}`,
      lead.subject && `Subject: ${lead.subject}`,
    ]
      .filter(Boolean)
      .join('\n'),
    lead.message?.trim() && `MESSAGE\n${lead.message.trim()}`,
    meta.length > 0 && meta.join('\n'),
    textFooter(settings),
  ])

  return {
    subject: `New ${noun} — ${name}${lead.service ? ` · ${lead.service}` : ''}`,
    html,
    text,
  }
}
