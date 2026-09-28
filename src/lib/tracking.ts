/**
 * Site-wide tracking and verification identifiers.
 *
 * These live in the Payload `site-settings` global (Site Settings → Analytics
 * & Site Verification) and are emitted by `AnalyticsScripts`. Keeping the
 * types and the readers here rather than inline in the component means the
 * shape is stated once.
 */

export type VerificationConfig = {
  google: string | null
  bing: string | null
  yandex: string | null
  pinterest: string | null
  facebookDomainVerification: string | null
}

export type CustomCodeConfig = {
  headCode: string | null
  bodyStartCode: string | null
  bodyEndCode: string | null
}

export type AnalyticsConfig = {
  googleTagManagerId: string | null
  googleTagId: string | null
  googleAnalyticsId: string | null
  googleAdsId: string | null
  metaPixelId: string | null
  clarityProjectId: string | null
  /** The tracking phone number, for reference and span-tag wrapping. */
  nimbataTrackingNumber: string | null
  /** The vendor's script tag, emitted verbatim at the end of `<body>`. */
  nimbataScript: string | null
  verification: VerificationConfig
  custom: CustomCodeConfig
}

/**
 * The fallback used when there is no database connection (local dev without
 * `DATABASE_URL`). Every platform is off.
 *
 * This is deliberately empty rather than mirroring the CMS values: the
 * tracking IDs are database state, and hardcoding a copy here would let the
 * site appear configured while the real CMS row was empty — the failure mode
 * CLAUDE.md §6 exists to prevent. An empty fallback makes that visible: no
 * tags render, which is obviously wrong, instead of tags rendering from a
 * hidden constant.
 */
export const LOCAL_ANALYTICS: AnalyticsConfig = {
  googleTagManagerId: null,
  googleTagId: null,
  googleAnalyticsId: null,
  googleAdsId: null,
  metaPixelId: null,
  clarityProjectId: null,
  nimbataTrackingNumber: null,
  nimbataScript: null,
  verification: {
    google: null,
    bing: null,
    yandex: null,
    pinterest: null,
    facebookDomainVerification: null,
  },
  custom: {
    headCode: null,
    bodyStartCode: null,
    bodyEndCode: null,
  },
}

/**
 * `metadata.other` entries for the verification tokens that are set.
 *
 * These are emitted through Next's metadata API rather than hand-written
 * `<meta>` tags so they are deduplicated and escaped, and so they appear in
 * the same place as the rest of the site's head metadata. WordPress emits the
 * same set from Rank Math.
 */
export function verificationMetadata(
  verification: VerificationConfig,
): Record<string, string> {
  const meta: Record<string, string> = {}
  const add = (name: string, value: string | null) => {
    if (value) meta[name] = value
  }

  add('google-site-verification', verification.google)
  add('msvalidate.01', verification.bing)
  add('yandex-verification', verification.yandex)
  add('p:domain_verify', verification.pinterest)
  add('facebook-domain-verification', verification.facebookDomainVerification)

  return meta
}
