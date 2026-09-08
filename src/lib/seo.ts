import type { Metadata } from 'next'

/** Site name suffix used in default `<title>` values. */
export const SITE_NAME = 'Prime Design & Build'

/**
 * Structural shape shared by every Payload SEO field group (services,
 * landing pages, generic pages, service locations).
 */
export type SeoFields = {
  metaTitle?: string | null
  metaDescription?: string | null
  canonicalUrl?: string | null
  noIndex?: boolean | null
}

/**
 * Build full page metadata from a Payload SEO field group.
 *
 * - `metaTitle` / `metaDescription` win when set; otherwise the fallback
 *   title is suffixed with the site name and the fallback description is
 *   used verbatim.
 * - A canonical URL and the no-index directive are applied only when the
 *   CMS actually sets them (otherwise Next would emit empty directives).
 */
export function buildSeoMetadata(
  seo: SeoFields | undefined,
  fallbacks: { title: string; description?: string },
): Metadata {
  return {
    title: seo?.metaTitle || `${fallbacks.title} | ${SITE_NAME}`,
    description: seo?.metaDescription || fallbacks.description,
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  }
}

/**
 * Title/description-only metadata for a resolved service detail, matching
 * the historical output of the `/services/...` routes (no canonical or
 * robots directives). Returns empty metadata when the service is missing.
 */
export function serviceMetadata(
  service?: { title: string; description?: string; seo?: SeoFields } | null,
): Metadata {
  if (!service) return {}
  return {
    title: service.seo?.metaTitle || `${service.title} | ${SITE_NAME}`,
    description: service.seo?.metaDescription || service.description,
  }
}
