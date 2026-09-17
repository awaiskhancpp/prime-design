import { SITE_NAME, SITE_URL, absoluteUrl, decodeEntities } from './seo'
import type { SiteSettingsValue } from './siteSettings'

/**
 * JSON-LD builders.
 *
 * The WordPress site ran Rank Math, which emitted an Organization /
 * LocalBusiness graph, a WebSite node, breadcrumbs and per-post Article and
 * VideoObject schema on every page. None of that survived the migration — the
 * App Router emits no structured data at all — so these builders restore it
 * from the CMS rather than from hardcoded copy.
 *
 * Deliberately NOT emitted: `aggregateRating` on the business node. The rating
 * the site displays is collected by the business about itself, and Google's
 * review-snippet guidelines disallow self-serving review markup; marking it up
 * risks a manual action rather than a rich result.
 */

type Json = Record<string, unknown>

const strip = (value?: string | null): string | undefined => {
  if (!value) return undefined
  const text = decodeEntities(String(value))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text || undefined
}

/** Drops undefined/empty members so the emitted graph stays tidy. */
const compact = (value: Json): Json =>
  Object.fromEntries(
    Object.entries(value).filter(([, v]) => {
      if (v === undefined || v === null || v === '') return false
      if (Array.isArray(v) && v.length === 0) return false
      return true
    }),
  )

/** `416 East Campbell Ave, Campbell CA 95008` -> PostalAddress parts. */
export function parseAddress(raw: string): Json {
  const text = strip(raw) || ''
  const match = text.match(/^(.*?),\s*([A-Za-z .'-]+?)[, ]+([A-Z]{2})\s+(\d{5})(?:-\d{4})?$/)
  if (!match) return compact({ '@type': 'PostalAddress', streetAddress: text, addressCountry: 'US' })
  const [, street, city, region, postal] = match
  return compact({
    '@type': 'PostalAddress',
    streetAddress: street.trim(),
    addressLocality: city.trim(),
    addressRegion: region,
    postalCode: postal,
    addressCountry: 'US',
  })
}

/** Stable @id values so nodes can reference one another across pages. */
export const ORG_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`

/**
 * The business node. `GeneralContractor` is the schema.org type for a
 * remodeling contractor and inherits from LocalBusiness, so it carries the
 * address, phone and opening-hours properties Google reads for local results.
 */
export function organizationSchema(settings: SiteSettingsValue, serviceAreas: string[] = []): Json {
  const addresses = (settings.addresses || [])
    .map((entry) => strip(entry?.address))
    .filter((value): value is string => Boolean(value))
  const sameAs = [
    settings.socialLinks?.googleBusiness,
    settings.socialLinks?.yelp,
    settings.socialLinks?.houzz,
    settings.socialLinks?.bbb,
  ].filter((value): value is string => Boolean(value))

  return compact({
    '@type': 'GeneralContractor',
    '@id': ORG_ID,
    name: strip(settings.name) || SITE_NAME,
    url: SITE_URL,
    telephone: strip(settings.phone),
    email: strip(settings.email),
    image: absoluteUrl('/api/media/file/Prime-Kitchens-Open-Graph.gif'),
    logo: absoluteUrl('/api/media/file/Prime-Kitchens-Logo.png'),
    address: addresses.length ? parseAddress(addresses[0]) : undefined,
    // Extra branches become additional PostalAddress nodes rather than being
    // dropped; a single LocalBusiness node may only carry one `address`.
    location: addresses.slice(1).map((value) => parseAddress(value)),
    areaServed: serviceAreas.map((name) => ({ '@type': 'City', name })),
    sameAs,
    // "Open: 8am - 6pm (Mon - Fri)" -> schema.org opening-hours shorthand.
    openingHours: /8am\s*-\s*6pm.*Mon\s*-\s*Fri/i.test(settings.hours || '')
      ? 'Mo-Fr 08:00-18:00'
      : undefined,
    priceRange: '$$',
  })
}

/** The WebSite node, including the on-site search endpoint at `/search`. */
export function websiteSchema(): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** Breadcrumb trail. Pass crumbs in order, root first. */
export function breadcrumbSchema(crumbs: Array<{ name: string; path: string }>): Json | undefined {
  if (crumbs.length < 2) return undefined
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: strip(crumb.name) || crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

/** A remodeling service offered in the Bay Area. */
export function serviceSchema(input: {
  name: string
  description?: string
  path: string
  image?: string
  areaServed?: string[]
}): Json {
  return compact({
    '@type': 'Service',
    name: strip(input.name),
    description: strip(input.description),
    url: absoluteUrl(input.path),
    image: input.image ? absoluteUrl(input.image) : undefined,
    serviceType: strip(input.name),
    provider: { '@id': ORG_ID },
    areaServed: (input.areaServed || []).map((name) => ({ '@type': 'City', name })),
  })
}

/** FAQ rich result. Only questions that have an answer are included. */
export function faqSchema(items: Array<{ question: string; answer: string }>): Json | undefined {
  const entries = items
    .map((item) => ({ q: strip(item.question), a: strip(item.answer) }))
    .filter((item) => item.q && item.a)
  if (!entries.length) return undefined
  return {
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.q,
      acceptedAnswer: { '@type': 'Answer', text: entry.a },
    })),
  }
}

/** Blog post. */
export function articleSchema(input: {
  title: string
  description?: string
  path: string
  image?: string
  publishedAt?: string
  updatedAt?: string
  author?: string
}): Json {
  return compact({
    '@type': 'BlogPosting',
    headline: strip(input.title),
    description: strip(input.description),
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    image: input.image ? absoluteUrl(input.image) : undefined,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt || input.publishedAt,
    author: input.author ? { '@type': 'Person', name: strip(input.author) } : { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  })
}

/** Wraps nodes into one `@graph` document. */
export function graph(...nodes: Array<Json | undefined>): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': nodes.filter((node): node is Json => Boolean(node)),
  })
}
