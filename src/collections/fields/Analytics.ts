import type { Field } from 'payload'

/**
 * Analytics, verification, and tracking identifiers.
 *
 * These live in Site Settings rather than in environment variables so that a
 * tag can be corrected or a new platform added from the admin without a
 * deploy. The values are identifiers, not prose: each one is validated as a
 * bare platform ID, because the realistic mistake here is pasting the whole
 * `<script>` block (or the `gtag/js?id=…` URL) out of the WordPress source
 * instead of just the ID — which silently produces a tag that never fires.
 *
 * Every field is optional and empty by default. Nothing is emitted for a
 * platform whose ID is blank.
 */

/**
 * A bare identifier, in one of the two shapes these platforms actually use:
 * a prefixed ID (`GT-TW5S8VN`, `AW-16669484786`, `GTM-ABC123`) or a bare
 * token (`907561544155711` for the Meta Pixel, `p0z8k1muhv` for Clarity).
 * Both are legitimate, so an earlier version of this that required a dash
 * wrongly rejected the Pixel and Clarity IDs.
 *
 * Length and character counts are deliberately NOT enforced. Real Google
 * values do not all match the canonical shape — `GT-TW5S8VN` has no middle
 * segment and `AW-16669484786` carries 11 digits, and both are taken verbatim
 * from the live site's HTML. Rejecting on shape would reject working tags.
 */
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._-]{4,}$/

const isEmpty = (value: unknown): boolean => typeof value !== 'string' || value.trim() === ''

const validateId =
  (expected: string, example: string) =>
  (value: unknown): true | string => {
    if (isEmpty(value)) return true
    const trimmed = (value as string).trim()

    /*
     * The realistic mistake is pasting the surrounding code rather than the
     * ID, so each way that happens gets its own message. Angle brackets or
     * whitespace mean a script tag or a whole head snippet went in; a slash or
     * colon means a URL did.
     */
    if (/[<>]/.test(trimmed) || /\s/.test(trimmed)) {
      return `Enter only the ID, not the surrounding code. This should look like "${example}" — no <script> tag, no quotes, no spaces.`
    }
    if (/[/:]/.test(trimmed)) {
      return `Enter only the ID, not the URL. This should look like "${example}".`
    }
    if (!IDENTIFIER.test(trimmed)) {
      return `Does not look like an ID. Expected ${expected}, for example "${example}".`
    }
    return true
  }

/** WordPress-placed verification tokens are opaque strings; only reject markup. */
const validateToken =
  (example: string) =>
  (value: unknown): true | string => {
    if (isEmpty(value)) return true
    const trimmed = (value as string).trim()
    if (/\s/.test(trimmed)) {
      return `Enter only the token value, without spaces or quotes. It should look like "${example}".`
    }
    if (!/^[A-Za-z0-9._~+/=-]{6,}$/.test(trimmed)) {
      return `Enter only the token value. It should look like "${example}".`
    }
    return true
  }

export const AnalyticsFields: Field[] = [
  {
    name: 'analytics',
    type: 'group',
    label: 'Analytics & Site Verification',
    admin: {
      description:
        'Measurement, advertising, and search-console identifiers. Leave a field empty to switch that platform off — nothing is emitted for a blank ID. Changes take effect on the next page load, with no deploy.',
    },
    fields: [
      {
        type: 'tabs',
        tabs: [
          {
            label: 'Tracking IDs',
            fields: [
              {
                name: 'tracking',
                type: 'group',
                label: ' ',
                fields: [
                  {
                    name: 'googleTagManagerId',
                    type: 'text',
                    label: 'Google Tag Manager container ID',
                    validate: validateId('a container ID', 'GTM-XXXXXX'),
                    admin: {
                      description:
                        'Optional. If set, the container loads first and everything below stays available as a fallback — do not configure the same tags in both places, or page views are counted twice.',
                    },
                  },
                  {
                    name: 'googleTagId',
                    type: 'text',
                    label: 'Google tag ID',
                    validate: validateId('a Google tag ID', 'GT-TW5S8VN'),
                    admin: {
                      description:
                        'The "Google tag" ID (the GT- value from the Google tag snippet, or a G- measurement ID). Loads gtag.js for the site.',
                    },
                  },
                  {
                    name: 'googleAnalyticsId',
                    type: 'text',
                    label: 'Google Analytics measurement ID',
                    validate: validateId('a Google Analytics measurement ID', 'G-TBYM3E67T2'),
                    admin: {
                      description:
                        'Optional additional GA4 destination. Use the G- ID from the Analytics web stream; it is configured through the same Google tag.',
                    },
                  },
                  {
                    name: 'googleAdsId',
                    type: 'text',
                    label: 'Google Ads conversion ID',
                    validate: validateId('a conversion ID', 'AW-16669484786'),
                    admin: {
                      description:
                        'The AW- ID from the Google Ads tag. Loaded through the Google tag; the conversion actions themselves are configured in Google Ads.',
                    },
                  },
                  {
                    name: 'metaPixelId',
                    type: 'text',
                    label: 'Meta (Facebook) Pixel ID',
                    validate: validateId('a pixel ID', '907561544155711'),
                    admin: {
                      description:
                        'The numeric Pixel ID from Meta Events Manager. Fires a PageView on load.',
                    },
                  },
                  {
                    name: 'clarityProjectId',
                    type: 'text',
                    label: 'Microsoft Clarity project ID',
                    validate: validateId('a project ID', 'p0z8k1muhv'),
                    admin: {
                      description: 'The project ID from Clarity, e.g. p0z8k1muhv.',
                    },
                  },
                  {
                    name: 'nimbataTrackingNumber',
                    type: 'text',
                    label: 'Nimbata tracking number',
                    admin: {
                      description:
                        'The call-tracking number Nimbata issues (Tracking → Numbers). For your reference and for wrapping the number on the page in <span class="nimbata"> — it is not a script identifier, so it is not used to build a URL.',
                    },
                  },
                  {
                    name: 'nimbataScript',
                    type: 'textarea',
                    label: 'Nimbata tracking script',
                    admin: {
                      description:
                        'Paste the whole <script> tag from Nimbata → Tracking → Tracking Code, exactly as they give it. It is emitted at the end of <body> on every page, which is where Nimbata requires it. The vendor host is not reachable from our build environment, so the script is taken verbatim rather than reconstructed from an ID.',
                    },
                  },
                ],
              },
            ],
          },
          {
            label: 'Site Verification',
            description:
              'Ownership tokens for search engines and platforms. Each renders the matching meta tag in the site <head> on every page. In the WordPress source these are <meta name="…" content="…"> tags — copy only the content value.',
            fields: [
              {
                name: 'verification',
                type: 'group',
                label: ' ',
                fields: [
                  {
                    name: 'google',
                    type: 'text',
                    label: 'Google Search Console',
                    validate: validateToken('AbC123…'),
                    admin: {
                      description:
                        'The content of <meta name="google-site-verification">. If Search Console is already verified, a tag added in GTM (Admin → container → Google Search Console) can be used instead.',
                    },
                  },
                  {
                    name: 'bing',
                    type: 'text',
                    label: 'Bing Webmaster Tools',
                    validate: validateToken('A1B2C3D4…'),
                    admin: {
                      description: 'The content of <meta name="msvalidate.01">.',
                    },
                  },
                  {
                    name: 'yandex',
                    type: 'text',
                    label: 'Yandex Webmaster',
                    validate: validateToken('a1b2c3d4…'),
                    admin: {
                      description: 'The content of <meta name="yandex-verification">.',
                    },
                  },
                  {
                    name: 'pinterest',
                    type: 'text',
                    label: 'Pinterest',
                    validate: validateToken('a1b2c3…'),
                    admin: {
                      description: 'The content of <meta name="p:domain_verify">.',
                    },
                  },
                  {
                    name: 'facebookDomainVerification',
                    type: 'text',
                    label: 'Facebook domain verification',
                    validate: validateToken('a1b2c3…'),
                    admin: {
                      description: 'The content of <meta name="facebook-domain-verification">.',
                    },
                  },
                ],
              },
            ],
          },
          {
            label: 'Custom Code',
            description:
              'Escape hatch for anything not covered above. Code is inserted into raw HTML exactly as written, so it must come from a source you trust — a broken snippet here affects every page on the site.',
            fields: [
              {
                name: 'custom',
                type: 'group',
                label: ' ',
                fields: [
                  {
                    name: 'headCode',
                    type: 'textarea',
                    label: 'Head code',
                    admin: {
                      description:
                        'Inserted into <head> on every page, after the tags above. Typical use: a verification meta tag for a platform not listed, or a vendor snippet.',
                    },
                  },
                  {
                    name: 'bodyStartCode',
                    type: 'textarea',
                    label: 'Body code (start)',
                    admin: {
                      description:
                        'Inserted immediately after <body> opens — the usual place for a Google Tag Manager <noscript> fallback.',
                    },
                  },
                  {
                    name: 'bodyEndCode',
                    type: 'textarea',
                    label: 'Body code (end)',
                    admin: {
                      description:
                        'Inserted before </body>. For chat widgets and other non-critical scripts.',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]
