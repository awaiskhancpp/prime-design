import { SITE_URL } from '@/lib/seo'

/**
 * The shared shell every transactional email is built from.
 *
 * ## Why hand-written tables and inline styles
 *
 * Email clients are not browsers. Outlook on Windows renders through Word,
 * which has no flexbox, no grid, no `max-width` on divs and no reliable
 * external stylesheet; Gmail strips much of what survives that. So the layout
 * here is nested `<table role="presentation">` with every visual rule inline
 * on the element it applies to. The `<style>` block carries only the two
 * things that cannot be inlined — the mobile media query and the web font —
 * and the design is complete without either.
 *
 * ## What makes this look like the website
 *
 * The site's visual language is narrow and, luckily, almost entirely
 * email-safe:
 *
 *   - **Sharp corners everywhere.** Nothing on this site has a border radius.
 *     That is the single biggest gift to an email designer: a rectangular
 *     button is just a padded table cell, so it renders correctly in Outlook
 *     with no VML fallback at all.
 *   - **The brass eyebrow.** Tiny uppercase letter-spaced brass text above a
 *     heading is the site's signature (`SectionHeader`), and it reproduces
 *     exactly in email.
 *   - **Thin warm rules.** `#E4DED2` borders and the brass-at-20% hairline
 *     used between checklist rows.
 *   - **Ghosted brass numerals.** The numbered list on the service pages puts
 *     a large, pale brass `01` opposite each item; `stepsBlock` below is that
 *     same composition in a two-cell row.
 *   - **Ink footer, warm paper canvas.** As the site's footer and page
 *     background.
 *
 * Colours are the real theme tokens from `styles.css`. Where the site uses an
 * alpha value (`text-ink-2/75`) the flattened hex against its actual backdrop
 * is used instead, because `rgba()` is not dependable in Outlook.
 */

/** The site's theme tokens, plus the flattened equivalents of its alpha uses. */
export const COLOR = {
  ink: '#14213D',
  ink2: '#1F3358',
  /** `text-ink-2/75` flattened on white — the site's body copy colour. */
  body: '#576682',
  /** `text-ink-2/60` flattened on white — captions and labels. */
  muted: '#7A85A0',
  brass: '#C19A5B',
  brassDeep: '#8F6C3E',
  paper: '#FAF7F2',
  paper2: '#F1ECE3',
  line: '#E4DED2',
  /** `border-brass/20` flattened on white — the rule between checklist rows. */
  hairline: '#F3EBDE',
  white: '#FFFFFF',
  /** Readable body text on the ink footer. */
  onInk: '#B9C1D4',
} as const

/**
 * Outfit first, for the clients that honour a web font (Apple Mail, iOS),
 * then the closest widely-installed geometric sans. Everything is sized so it
 * still reads correctly on the fallback — the design never depends on Outfit
 * actually loading.
 */
export const FONT = `'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

/**
 * Escapes text for HTML. Every interpolation in these templates goes through
 * this: an internal lead alert renders a stranger's name and message, and an
 * unescaped `<` there is at best broken markup and at worst an injection into
 * whatever reads the mail.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Escapes, then turns newlines into `<br>` — for free-text message bodies. */
export function escapeParagraph(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br />')
}

export type EmailSettings = {
  name: string
  phone: string
  phoneClean: string
  email: string
  license: string
  hours: string
  addresses: { address: string }[]
}

export type EmailLink = { label: string; href: string }

/** What every template returns: a subject, the HTML part, and the text part. */
export type RenderedEmail = { subject: string; html: string; text: string }

/**
 * Site-relative hrefs have to be absolutised before they go in an email —
 * there is no document base to resolve `/our-projects` against in an inbox.
 * `mailto:`, `tel:` and anything already absolute pass through untouched.
 *
 * `baseUrl` exists for the preview route, which passes its own origin so the
 * logo and links resolve against the running dev server. Everything that
 * actually sends leaves it unset and gets the real site.
 */
export function absoluteUrl(href: string, baseUrl: string = SITE_URL): string {
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href
  return `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`
}

/**
 * The brand mark, and the same file `BrandMark` puts in the site header —
 * one logo, one asset, so the email and the site cannot drift apart.
 *
 * It is referenced from `public/` rather than from its Media collection
 * document (id 662, `Prime-Kitchens-Logo.png`) for the same reason the
 * favicon is: a fixed brand asset does not need to be editable per-send, and
 * `public/` needs no database round-trip and no `/api/media/file/…` hop. The
 * file is 300x176, displayed at half that, which keeps it sharp on the
 * high-density screens most mail is read on.
 */
const LOGO = { path: '/Prime-Kitchens-Logo-300x176.png', width: 150, height: 88 } as const

/* ------------------------------------------------------------------ *
 * Content primitives — the pieces each template composes.
 * ------------------------------------------------------------------ */

/** A body paragraph in the site's reading size. */
export function paragraph(text: string, options: { first?: boolean } = {}): string {
  return `<p style="margin:${options.first ? '0' : '16px 0 0'};font-family:${FONT};font-size:16px;line-height:26px;color:${COLOR.body};">${escapeParagraph(text)}</p>`
}

/**
 * The site's numbered-checklist composition: title and detail on the left, a
 * large pale brass numeral opposite, a hairline rule above each row.
 */
export function stepsBlock(heading: string, steps: { title: string; detail?: string }[]): string {
  if (!steps.length) return ''

  const rows = steps
    .map(
      (step, index) => `
              <tr>
                <td style="padding:20px 16px 20px 0;border-top:1px solid ${COLOR.hairline};font-family:${FONT};">
                  <div style="font-size:16px;font-weight:600;color:${COLOR.ink2};line-height:22px;">${escapeHtml(step.title)}</div>
                  ${
                    step.detail
                      ? `<div style="margin-top:6px;font-size:14px;line-height:22px;color:${COLOR.muted};">${escapeHtml(step.detail)}</div>`
                      : ''
                  }
                </td>
                <td width="46" style="padding:20px 0;border-top:1px solid ${COLOR.hairline};vertical-align:top;text-align:right;font-family:${FONT};font-size:28px;font-weight:600;line-height:1;color:#E7D6BC;">${String(index + 1).padStart(2, '0')}</td>
              </tr>`,
    )
    .join('')

  return `
      <div style="margin-top:34px;">
        <div style="font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${COLOR.brassDeep};">${escapeHtml(heading)}</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:10px;border-collapse:collapse;">
          <tbody>${rows}
            <tr><td colspan="2" style="border-top:1px solid ${COLOR.hairline};font-size:0;line-height:0;">&nbsp;</td></tr>
          </tbody>
        </table>
      </div>`
}

/**
 * Label/value rows — the submission itself in the internal alert, the booking
 * details in a confirmation. `href` turns a value into a tap target, which is
 * the whole point on a phone number.
 */
export function detailTable(rows: { label: string; value: string; href?: string }[]): string {
  const visible = rows.filter((row) => row.value?.trim())
  if (!visible.length) return ''

  const cells = visible
    .map(
      (row) => `
              <tr>
                <td style="padding:12px 0;border-top:1px solid ${COLOR.hairline};font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:${COLOR.muted};vertical-align:top;width:34%;">${escapeHtml(row.label)}</td>
                <td style="padding:12px 0;border-top:1px solid ${COLOR.hairline};font-family:${FONT};font-size:15px;line-height:24px;color:${COLOR.ink2};vertical-align:top;">${
                  row.href
                    ? `<a href="${escapeHtml(row.href)}" style="color:${COLOR.brassDeep};text-decoration:none;font-weight:600;">${escapeParagraph(row.value)}</a>`
                    : escapeParagraph(row.value)
                }</td>
              </tr>`,
    )
    .join('')

  return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px;border-collapse:collapse;">
        <tbody>${cells}
          <tr><td colspan="2" style="border-top:1px solid ${COLOR.hairline};font-size:0;line-height:0;">&nbsp;</td></tr>
        </tbody>
      </table>`
}

/**
 * A bordered panel — the site's `border border-line` box. Used for the one
 * fact an email exists to deliver, such as the date and time of a booking.
 */
export function panel(innerHtml: string): string {
  return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:28px;border-collapse:collapse;">
        <tbody>
          <tr>
            <td style="border:1px solid ${COLOR.line};background-color:${COLOR.paper};padding:24px 26px;font-family:${FONT};">${innerHtml}</td>
          </tr>
        </tbody>
      </table>`
}

/**
 * The primary action. A padded table cell, not a styled `<a>`, so the whole
 * block is clickable in Outlook — and with no border radius anywhere on this
 * site, it needs no VML fallback to render correctly there.
 */
export function button(link: EmailLink): string {
  return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;border-collapse:collapse;">
        <tbody>
          <tr>
            <td style="background-color:${COLOR.brass};">
              <a href="${escapeHtml(link.href)}" style="display:inline-block;padding:15px 30px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${COLOR.ink};text-decoration:none;">${escapeHtml(link.label)}</a>
            </td>
          </tr>
        </tbody>
      </table>`
}

/** A short list of secondary links, under a brass eyebrow. */
export function linkRow(heading: string, links: EmailLink[]): string {
  if (!links.length) return ''

  const items = links
    .map(
      (link) =>
        `<a href="${escapeHtml(link.href)}" style="font-family:${FONT};font-size:14px;line-height:28px;color:${COLOR.brassDeep};text-decoration:none;border-bottom:1px solid ${COLOR.line};">${escapeHtml(link.label)}</a>`,
    )
    .join(`<span style="color:${COLOR.line};">&nbsp;&nbsp;/&nbsp;&nbsp;</span>`)

  // No rule of its own: whatever precedes this (a steps list, a detail table)
  // already closes with one, and two hairlines a few pixels apart read as a
  // mistake rather than a divider.
  return `
      <div style="margin-top:30px;">
        <div style="font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${COLOR.brassDeep};">${escapeHtml(heading)}</div>
        <div style="margin-top:10px;">${items}</div>
      </div>`
}

/* ------------------------------------------------------------------ *
 * The shell.
 * ------------------------------------------------------------------ */

export type EmailShellOptions = {
  /**
   * The preview line inboxes show beside the subject. Left unset it fills
   * with whatever text comes first, which is usually the logo's alt text, so
   * every template sets it deliberately.
   */
  preheader: string
  eyebrow: string
  heading: string
  /**
   * The lead, in the larger intro size. An array renders as separate
   * paragraphs — a greeting and the message it introduces are two
   * paragraphs, not one string with a line break in it.
   */
  intro?: string | string[]
  /** Composed from the primitives above. */
  bodyHtml?: string
  button?: EmailLink
  settings: EmailSettings
  /**
   * The phone-first strip above the footer. On for anything a customer
   * receives — calling is the fastest path for both sides — and off for the
   * internal alert, where the team already knows its own number.
   */
  showContactStrip?: boolean
  /** Only the preview route sets this; see `absoluteUrl`. */
  baseUrl?: string
}

export function renderEmailShell(options: EmailShellOptions): string {
  const { preheader, eyebrow, heading, intro, bodyHtml, settings } = options
  const showContactStrip = options.showContactStrip ?? true
  const baseUrl = options.baseUrl ?? SITE_URL
  const logoSrc = absoluteUrl(LOGO.path, baseUrl)

  const addresses = settings.addresses
    .map((entry) => escapeHtml(entry.address).replace(/\r?\n/g, ', '))
    .filter(Boolean)

  const introHtml = (Array.isArray(intro) ? intro : intro ? [intro] : [])
    .filter((line) => line.trim())
    .map(
      (line) =>
        `<p style="margin:16px 0 0;font-family:${FONT};font-size:17px;line-height:28px;color:${COLOR.body};">${escapeParagraph(line)}</p>`,
    )
    .join('')

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>${escapeHtml(heading)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office"><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
  body { margin:0 !important; padding:0 !important; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table { border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; display:block; }
  /* iOS turns addresses and numbers into links in its own colour; this keeps
     them in ours wherever we have already made them links ourselves. */
  a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; font-size:inherit !important; font-family:inherit !important; font-weight:inherit !important; line-height:inherit !important; }
  @media only screen and (max-width:620px) {
    .sm-gutter { padding-left:22px !important; padding-right:22px !important; }
    .sm-heading { font-size:24px !important; line-height:30px !important; }
    .sm-stack { display:block !important; width:100% !important; text-align:left !important; }
    .sm-stack-gap { padding-top:14px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${COLOR.paper};">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${COLOR.paper};">
  <tbody>
    <tr>
      <td align="center" style="padding:28px 12px 40px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">
          <tbody>

            <!-- Brass hairline over the ink header — the site's top banner rule. -->
            <tr><td style="background-color:${COLOR.brass};font-size:0;line-height:0;height:3px;">&nbsp;</td></tr>

            <!-- Header -->
            <tr>
              <td align="center" style="background-color:${COLOR.ink};padding:26px 24px;">
                <!--
                  Most clients block remote images until the reader allows
                  them, so the alt text is styled to be the fallback wordmark
                  rather than left as the client's default blue serif: with
                  images off this still reads as the company name in the
                  brand's type, on the ink band, which is most of what the
                  logo was doing anyway. The height is an attribute rather
                  than a style so the box can grow to fit that text when the
                  image does not load.
                -->
                <a href="${absoluteUrl('/', baseUrl)}" style="text-decoration:none;">
                  <img src="${logoSrc}" width="${LOGO.width}" height="${LOGO.height}" alt="${escapeHtml(settings.name)}" style="width:${LOGO.width}px;font-family:${FONT};font-size:15px;line-height:22px;font-weight:600;letter-spacing:0.3px;color:${COLOR.white};text-decoration:none;" />
                </a>
              </td>
            </tr>

            <!-- Content card -->
            <tr>
              <!--
                The font on the card itself is belt and braces: every block
                below sets its own, but anything added later that forgets to
                would otherwise fall back to the client's default serif,
                which is how the lead alert's meta line first shipped.
              -->
              <td class="sm-gutter" style="background-color:${COLOR.white};border-left:1px solid ${COLOR.line};border-right:1px solid ${COLOR.line};padding:40px 40px 42px;font-family:${FONT};">
                <div style="font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${COLOR.brassDeep};">${escapeHtml(eyebrow)}</div>
                <h1 class="sm-heading" style="margin:14px 0 0;font-family:${FONT};font-size:28px;line-height:34px;font-weight:600;color:${COLOR.ink};letter-spacing:-0.4px;">${escapeHtml(heading)}</h1>
                ${introHtml}
                ${bodyHtml ?? ''}
                ${options.button ? button(options.button) : ''}
              </td>
            </tr>

            ${
              showContactStrip
                ? `<!-- Phone-first strip: calling is the fastest path for both sides. -->
            <tr>
              <td class="sm-gutter" style="background-color:${COLOR.paper2};border-left:1px solid ${COLOR.line};border-right:1px solid ${COLOR.line};border-top:1px solid ${COLOR.line};padding:22px 40px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tbody>
                    <tr>
                      <td class="sm-stack" style="font-family:${FONT};vertical-align:middle;">
                        <div style="font-size:11px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:${COLOR.brassDeep};">Prefer to talk?</div>
                        <a href="tel:${escapeHtml(settings.phoneClean)}" style="font-family:${FONT};font-size:22px;font-weight:600;color:${COLOR.ink};text-decoration:none;line-height:30px;">${escapeHtml(settings.phone)}</a>
                      </td>
                      <td class="sm-stack sm-stack-gap" align="right" style="font-family:${FONT};font-size:13px;line-height:21px;color:${COLOR.muted};vertical-align:middle;">
                        ${escapeHtml(settings.hours)}<br />
                        <a href="mailto:${escapeHtml(settings.email)}" style="color:${COLOR.brassDeep};text-decoration:none;">${escapeHtml(settings.email)}</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>`
                : ''
            }

            <!-- Footer -->
            <tr>
              <td class="sm-gutter" style="background-color:${COLOR.ink};padding:28px 40px 30px;font-family:${FONT};">
                <div style="font-size:14px;font-weight:600;color:${COLOR.white};letter-spacing:0.2px;">${escapeHtml(settings.name)}</div>
                ${addresses.length ? `<div style="margin-top:10px;font-size:13px;line-height:22px;color:${COLOR.onInk};">${addresses.join('<br />')}</div>` : ''}
                <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.12);font-size:12px;line-height:20px;color:${COLOR.onInk};">
                  ${escapeHtml(settings.license)}
                  &nbsp;&middot;&nbsp;
                  <a href="${SITE_URL}" style="color:${COLOR.onInk};text-decoration:none;">primedesignandbuild.com</a>
                </div>
              </td>
            </tr>

            <tr><td style="background-color:${COLOR.brass};font-size:0;line-height:0;height:3px;">&nbsp;</td></tr>

          </tbody>
        </table>

      </td>
    </tr>
  </tbody>
</table>
</body>
</html>`
}

/* ------------------------------------------------------------------ *
 * Plain text.
 * ------------------------------------------------------------------ */

/**
 * Every template ships a text alternative. It is not a nicety: a
 * `multipart/alternative` message with only an HTML part scores worse with
 * spam filters, and some clients and screen readers prefer the text part.
 */
export function textFooter(settings: EmailSettings): string {
  const addresses = settings.addresses.map((entry) => entry.address.replace(/\r?\n/g, ', '))
  return [
    '—',
    settings.name,
    `${settings.phone}  ·  ${settings.email}`,
    ...addresses,
    settings.license,
    SITE_URL,
  ].join('\n')
}

/**
 * Joins the parts of a plain-text body into blocks separated by a blank line,
 * dropping the ones that turned out empty. Written as a helper because the
 * obvious inline version — an array with `''` spacers and a `.filter(Boolean)`
 * — silently eats the spacers along with the empty parts, and the result is a
 * wall of text.
 */
export function textBlocks(parts: (string | undefined | false)[]): string {
  return parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .map((part) => part.trim())
    .join('\n\n')
}
