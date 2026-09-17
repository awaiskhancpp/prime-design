import type { Metadata } from 'next'

/** Site name suffix used in default `<title>` values. */
export const SITE_NAME = 'Prime Design & Build'

/**
 * Canonical production origin. Every absolute URL in metadata, structured data
 * and the sitemap is built from this, so the three can never disagree.
 */
export const SITE_URL = 'https://primedesignandbuild.com'

/** Absolute URL for a site-relative path (`/about` -> `https://…/about`). */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Decode the HTML entities WordPress stores inside Rank Math's title and
 * description fields.
 *
 * Rank Math keeps these values entity-encoded (`Prime Design &amp; Build`,
 * `Valley&#039;s`). A `<meta>` attribute is escaped again on render, so an
 * un-decoded value reaches Google as the literal text `&amp;` — which is what
 * the 45 service-location descriptions and the homepage title were doing.
 * Decoding here makes the rendered output correct no matter what a future
 * import writes into the CMS.
 */
export function decodeEntities(value: string): string {
  return value
    .replace(/&(?:amp|#0*38);/gi, '&')
    .replace(/&(?:apos|#0*39|#x27);/gi, "'")
    .replace(/&(?:quot|#0*34);/gi, '"')
    .replace(/&(?:lsquo|#8216);/gi, '‘')
    .replace(/&(?:rsquo|#8217);/gi, '’')
    .replace(/&(?:ldquo|#8220);/gi, '“')
    .replace(/&(?:rdquo|#8221);/gi, '”')
    .replace(/&(?:ndash|#8211);/gi, '–')
    .replace(/&(?:mdash|#8212);/gi, '—')
    .replace(/&(?:hellip|#8230);/gi, '…')
    .replace(/&(?:nbsp|#160);/gi, ' ')
    .replace(/&(?:lt|#0*60);/gi, '<')
    .replace(/&(?:gt|#0*62);/gi, '>')
}

const clean = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') return undefined
  const decoded = decodeEntities(value).replace(/\s+/g, ' ').trim()
  return decoded || undefined
}

/**
 * Structural shape shared by every Payload SEO field group (services,
 * landing pages, generic pages, service locations).
 */
export type SeoFields = {
  metaTitle?: string | null
  metaDescription?: string | null
  canonicalUrl?: string | null
  noIndex?: boolean | null
  ogTitle?: string | null
  ogDescription?: string | null
  ogImage?: { url?: string | null } | number | null
}

export type SeoOptions = {
  /**
   * Site-relative path of the page being rendered. Supplying it gives the
   * page a self-referencing canonical and an `og:url`, which WordPress
   * emitted on every page and which nothing in the App Router does for free.
   */
  path?: string
  /** `article` for blog posts, `website` for everything else. */
  type?: 'website' | 'article'
  /** Overrides the social image (absolute or site-relative). */
  image?: string | null
}

/** Falls back to the site-wide social image when a page has none of its own. */
const DEFAULT_OG_IMAGE = '/api/media/file/Prime-Kitchens-Open-Graph.gif'

const imageFrom = (seo: SeoFields | undefined, override?: string | null): string => {
  if (override) return absoluteUrl(override)
  const value =
    seo?.ogImage && typeof seo.ogImage === 'object' && 'url' in seo.ogImage
      ? seo.ogImage.url
      : undefined
  return absoluteUrl(value || DEFAULT_OG_IMAGE)
}

/**
 * Build full page metadata from a Payload SEO field group.
 *
 * - `metaTitle` / `metaDescription` win when set; otherwise the fallback title
 *   is suffixed with the site name — unless it already ends with it, which is
 *   what produced titles like "FAQs | Prime Design & Build | Prime Design &
 *   Build".
 * - The canonical is the CMS value when authored, else a self-referencing URL
 *   built from `path`.
 * - Open Graph and Twitter tags mirror the WordPress output.
 */
export function buildSeoMetadata(
  seo: SeoFields | undefined,
  fallbacks: { title: string; description?: string },
  options: SeoOptions = {},
): Metadata {
  const fallbackTitle = clean(fallbacks.title) || SITE_NAME
  const suffixed = fallbackTitle.toLowerCase().endsWith(SITE_NAME.toLowerCase())
    ? fallbackTitle
    : `${fallbackTitle} | ${SITE_NAME}`
  const title = clean(seo?.metaTitle) || suffixed
  const description = clean(seo?.metaDescription) || clean(fallbacks.description)
  const canonical = clean(seo?.canonicalUrl) || (options.path ? absoluteUrl(options.path) : undefined)
  const image = imageFrom(seo, options.image)
  const ogTitle = clean(seo?.ogTitle) || title
  const ogDescription = clean(seo?.ogDescription) || description

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: seo?.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: options.type || 'website',
      ...(canonical ? { url: canonical } : {}),
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [image],
    },
  }
}

/**
 * Title/description metadata for a resolved service detail. Kept for the
 * sub-service routes, which resolve a service rather than a page record.
 */
export function serviceMetadata(
  service?: { title: string; description?: string; seo?: SeoFields } | null,
  options: SeoOptions = {},
): Metadata {
  if (!service) return {}
  return buildSeoMetadata(service.seo, { title: service.title, description: service.description }, options)
}
