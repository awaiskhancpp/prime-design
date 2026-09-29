import {
  COLOR,
  escapeHtml,
  panel,
  paragraph,
  renderEmailShell,
  textBlocks,
  textFooter,
  type EmailSettings,
  type RenderedEmail,
} from './shell'

/** Matches the month labels the booking modal prints on its own date chip. */
const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * The confirmation a visitor receives after booking a consultation through
 * `AppointmentScheduler`.
 *
 * ## Why it reads the way it does
 *
 * The wording is lifted from the scheduler's own final step — "Appointment
 * Confirmed", "We look forward to seeing you.", "Order #…" — so the email
 * repeats what the visitor has just read on screen instead of paraphrasing
 * it. The date chip (a bordered box with the day over the abbreviated month)
 * is that same screen's composition, rebuilt in tables.
 *
 * It carries no call-to-action button on purpose. The visitor has already
 * done the thing this email is about; the only action left is changing the
 * appointment, and that is a phone call, which the contact strip already
 * offers. A button here would only compete with the details it sits under.
 *
 * AUTHORED (no WordPress original exists — the export contains no booking
 * system of any kind): the subject line, the "Here are the details" lead and
 * the rescheduling sentence.
 */
export function renderAppointmentConfirmation({
  firstName,
  consultationLabel,
  when,
  timeLabel,
  orderId,
  settings,
  baseUrl,
}: {
  firstName?: string
  /** e.g. "Kitchen Remodeling Consultation" — the label the modal booked. */
  consultationLabel: string
  when: Date
  /** e.g. "10:00 AM" — the slot as the scheduler offered it. */
  timeLabel: string
  orderId: string
  settings: EmailSettings
  /** Only the preview route sets this; see `absoluteUrl`. */
  baseUrl?: string
}): RenderedEmail {
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()},` : 'Hi,'
  const dateLabel = when.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const detailsPanel = panel(`
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tbody>
                  <tr>
                    <td width="60" valign="top" style="padding-right:18px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="60" style="border:1px solid ${COLOR.line};background-color:${COLOR.white};">
                        <tbody>
                          <tr><td align="center" style="padding:8px 0 0;font-size:22px;font-weight:600;color:${COLOR.ink};line-height:26px;">${when.getDate()}</td></tr>
                          <tr><td align="center" style="padding:0 0 8px;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:${COLOR.muted};">${MONTH_SHORT[when.getMonth()]}</td></tr>
                        </tbody>
                      </table>
                    </td>
                    <td valign="top">
                      <div style="font-size:18px;font-weight:600;color:${COLOR.ink};line-height:26px;">${escapeHtml(consultationLabel)}</div>
                      <div style="margin-top:4px;font-size:15px;line-height:24px;color:${COLOR.body};">${escapeHtml(dateLabel)}</div>
                      <div style="margin-top:2px;font-size:15px;line-height:24px;color:${COLOR.body};">${escapeHtml(timeLabel)}</div>
                      <div style="margin-top:12px;font-size:11px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:${COLOR.brassDeep};">Order #${escapeHtml(orderId)}</div>
                    </td>
                  </tr>
                </tbody>
              </table>`)

  const bodyHtml = [
    detailsPanel,
    paragraph(
      `Need to change it? Call us on ${settings.phone} and we will find another time that suits you.`,
    ),
  ].join('')

  const html = renderEmailShell({
    preheader: `${consultationLabel} — ${dateLabel}, ${timeLabel}`,
    eyebrow: 'Appointment confirmed',
    heading: 'We look forward to seeing you.',
    intro: [greeting, 'Here are the details of your consultation.'],
    bodyHtml,
    settings,
    baseUrl,
  })

  const text = textBlocks([
    greeting,
    'We look forward to seeing you. Here are the details of your consultation.',
    [consultationLabel, dateLabel, timeLabel, `Order #${orderId}`].join('\n'),
    `Need to change it? Call us on ${settings.phone} and we will find another time that suits you.`,
    textFooter(settings),
  ])

  return {
    subject: `Your consultation is booked — ${dateLabel}, ${timeLabel}`,
    html,
    text,
  }
}
