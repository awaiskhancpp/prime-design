import { cache } from 'react'

import { LOCAL_ANALYTICS, type AnalyticsConfig } from '@/lib/tracking'

type PayloadAnalytics = {
  analytics?: {
    tracking?: {
      googleTagManagerId?: string | null
      googleTagId?: string | null
      googleAnalyticsId?: string | null
      googleAdsId?: string | null
      metaPixelId?: string | null
      clarityProjectId?: string | null
      nimbataTrackingNumber?: string | null
      nimbataScript?: string | null
    } | null
    verification?: {
      google?: string | null
      bing?: string | null
      yandex?: string | null
      pinterest?: string | null
      facebookDomainVerification?: string | null
    } | null
    custom?: {
      headCode?: string | null
      bodyStartCode?: string | null
      bodyEndCode?: string | null
    } | null
  } | null
}

const payloadImports = () =>
  Promise.all([import('payload'), import('@payload-config')]) as Promise<
    [typeof import('payload'), typeof import('@payload-config')]
  >

/** Payload returns an empty string for a cleared text field; treat that as absent. */
const textOr = (value: string | null | undefined): string | null => {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed === '' ? null : trimmed
}

/**
 * The tracking identifiers, read from the Site Settings global.
 *
 * Cached per request: the root layout, and anything else that ever needs this,
 * share one query rather than one each.
 */
export const resolveAnalytics = cache(async (): Promise<AnalyticsConfig> => {
  if (!process.env.DATABASE_URL) return LOCAL_ANALYTICS

  const [{ getPayload }, { default: configPromise }] = await payloadImports()
  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
  })) as PayloadAnalytics

  const tracking = settings.analytics?.tracking
  const verification = settings.analytics?.verification
  const custom = settings.analytics?.custom

  return {
    googleTagManagerId: textOr(tracking?.googleTagManagerId),
    googleTagId: textOr(tracking?.googleTagId),
    googleAnalyticsId: textOr(tracking?.googleAnalyticsId),
    googleAdsId: textOr(tracking?.googleAdsId),
    metaPixelId: textOr(tracking?.metaPixelId),
    clarityProjectId: textOr(tracking?.clarityProjectId),
    nimbataTrackingNumber: textOr(tracking?.nimbataTrackingNumber),
    nimbataScript: textOr(tracking?.nimbataScript),
    verification: {
      google: textOr(verification?.google),
      bing: textOr(verification?.bing),
      yandex: textOr(verification?.yandex),
      pinterest: textOr(verification?.pinterest),
      facebookDomainVerification: textOr(verification?.facebookDomainVerification),
    },
    custom: {
      headCode: textOr(custom?.headCode),
      bodyStartCode: textOr(custom?.bodyStartCode),
      bodyEndCode: textOr(custom?.bodyEndCode),
    },
  }
})
