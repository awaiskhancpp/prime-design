import { renderAppointmentConfirmation } from '@/emails/appointmentConfirmation'
import { renderEnquiryConfirmation } from '@/emails/enquiryConfirmation'
import { renderLeadAlert } from '@/emails/leadAlert'
import { resolveEmailSettings, resolveEnquiryEmailContent } from '@/lib/emailContent'

/**
 * Renders the transactional email templates in a browser so they can be
 * looked at without sending anything.
 *
 * Development only. Nothing here is secret, but it is a workbench, not a
 * route the site needs in production — and the sample lead below is fake
 * data that has no business being reachable on the live domain.
 *
 *   /api/email-preview                      — index
 *   /api/email-preview?template=enquiry     — customer enquiry confirmation
 *   /api/email-preview?template=appointment — booking confirmation
 *   /api/email-preview?template=lead        — internal lead alert
 *   &format=text                            — the plain-text part instead
 *   &subject=1                              — just the subject line
 *
 * The enquiry template reads its copy from the real `thank-you` page record,
 * so this previews the actual email, not a mock of it.
 */
export const dynamic = 'force-dynamic'

const TEMPLATES = ['enquiry', 'appointment', 'lead'] as const
type TemplateName = (typeof TEMPLATES)[number]

const isTemplate = (value: string | null): value is TemplateName =>
  TEMPLATES.includes((value ?? '') as TemplateName)

/** Stand-in submission, so the lead alert has something to render. */
const SAMPLE_LEAD = {
  kind: 'enquiry' as const,
  firstName: 'Sarah',
  lastName: 'Chen',
  email: 'sarah.chen@example.com',
  phone: '(650) 555-0148',
  service: 'Kitchen Remodeling',
  subject: 'Full kitchen remodel, 1940s house',
  message:
    'We are looking to open up the kitchen into the dining room and replace the cabinetry. ' +
    'The house is from 1940 and we would like to keep the character.\n\n' +
    'Hoping to start in the spring — what does your availability look like?',
  formName: 'Consultation popup',
  sourceUrl: 'https://primedesignandbuild.com/services/kitchen-remodeling',
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not found', { status: 404 })
  }

  const url = new URL(request.url)
  const requested = url.searchParams.get('template')
  const settings = await resolveEmailSettings()
  // Render against this server rather than the production domain, so the
  // logo and links resolve to something that actually exists while you are
  // looking at them. A real send leaves this unset and gets the live site.
  const baseUrl = url.origin

  if (!isTemplate(requested)) {
    return new Response(indexPage(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  let rendered
  if (requested === 'enquiry') {
    rendered = renderEnquiryConfirmation({
      firstName: SAMPLE_LEAD.firstName,
      content: await resolveEnquiryEmailContent(),
      settings,
      baseUrl,
    })
  } else if (requested === 'appointment') {
    const when = new Date()
    when.setDate(when.getDate() + 6)
    rendered = renderAppointmentConfirmation({
      firstName: SAMPLE_LEAD.firstName,
      consultationLabel: 'Kitchen Remodeling Consultation',
      when,
      timeLabel: '10:00 AM',
      orderId: 'PDB-4RT9KQ2',
      settings,
      baseUrl,
    })
  } else {
    rendered = renderLeadAlert({ lead: SAMPLE_LEAD, settings, baseUrl })
  }

  if (url.searchParams.get('subject')) {
    return new Response(rendered.subject, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  if (url.searchParams.get('format') === 'text') {
    return new Response(rendered.text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  return new Response(rendered.html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function indexPage(): string {
  const rows = [
    ['enquiry', 'Enquiry confirmation', 'Sent to the visitor after a form submission.'],
    ['appointment', 'Booking confirmation', 'Sent to the visitor after booking a consultation.'],
    ['lead', 'Internal lead alert', 'Sent to the team when a lead arrives.'],
  ]
    .map(
      ([slug, title, note]) => `
      <tr>
        <td style="padding:14px 0;border-top:1px solid #E4DED2;">
          <a href="?template=${slug}" style="font-size:16px;font-weight:600;color:#14213D;text-decoration:none;">${title}</a>
          <div style="margin-top:4px;font-size:13px;color:#7A85A0;">${note}</div>
        </td>
        <td style="padding:14px 0;border-top:1px solid #E4DED2;text-align:right;font-size:13px;">
          <a href="?template=${slug}&format=text" style="color:#8F6C3E;">text</a>
          &nbsp;·&nbsp;
          <a href="?template=${slug}&subject=1" style="color:#8F6C3E;">subject</a>
        </td>
      </tr>`,
    )
    .join('')

  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Email previews</title></head>
<body style="margin:0;background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:56px 24px;">
    <div style="font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#8F6C3E;">Development</div>
    <h1 style="margin:12px 0 0;font-size:28px;font-weight:600;color:#14213D;">Email previews</h1>
    <p style="font-size:15px;line-height:24px;color:#576682;">
      The transactional templates, rendered with live Site Settings. The enquiry
      confirmation also reads its copy from the real <code>thank-you</code> page record.
    </p>
    <table width="100%" style="margin-top:24px;border-collapse:collapse;"><tbody>${rows}
      <tr><td colspan="2" style="border-top:1px solid #E4DED2;"></td></tr>
    </tbody></table>
  </div>
</body></html>`
}
