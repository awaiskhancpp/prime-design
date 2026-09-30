import { cache } from 'react'

import { richTextHasContent, type RichTextValue } from './richText'

/**
 * Sections a city page shares with its service and with every other city
 * page, and how one field is resolved across the three.
 *
 * Each mapper turns one raw Payload group — from a city record, a service
 * record or the Shared Sections global, which all use the same field
 * definitions (`collections/fields/sectionGroups.ts`) — into what the page
 * renders, leaving empty values undefined. `inherit` then takes each field
 * from the first layer that has it.
 */

type Raw = Record<string, unknown> | null | undefined

const textOr = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : undefined

const richOr = (value: unknown): RichTextValue | undefined =>
  richTextHasContent(value as RichTextValue) ? (value as RichTextValue) : undefined

const mediaUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

const rows = (value: unknown): Array<Record<string, unknown>> =>
  Array.isArray(value) ? (value as Array<Record<string, unknown>>) : []

/** Fields of `layers` merged: the first defined value wins; an empty array counts as unset. */
export function inherit<T extends object>(...layers: Array<T | undefined>): T | undefined {
  const merged: Record<string, unknown> = {}
  for (const layer of layers) {
    if (!layer) continue
    for (const [key, value] of Object.entries(layer)) {
      if (merged[key] !== undefined) continue
      if (value === undefined || (Array.isArray(value) && value.length === 0)) continue
      merged[key] = value
    }
  }
  return Object.keys(merged).length ? (merged as T) : undefined
}

export type LocationVideo = {
  eyebrow?: string
  title?: string
  description?: string
  tagline?: string
  videoUrl?: string
  poster?: string
}
export const mapLocationVideo = (g: Raw): LocationVideo => ({
  eyebrow: textOr(g?.eyebrow),
  title: textOr(g?.title),
  description: textOr(g?.description),
  tagline: textOr(g?.tagline),
  videoUrl: textOr(g?.videoUrl),
  poster: mediaUrl(g?.poster),
})

export type DontSettle = {
  eyebrow?: string
  heading?: string
  headingAccent?: string
  body?: string
  ctaLabel?: string
  image?: string
}
export const mapDontSettle = (g: Raw): DontSettle => ({
  eyebrow: textOr(g?.eyebrow),
  heading: textOr(g?.heading),
  headingAccent: textOr(g?.headingAccent),
  body: textOr(g?.body),
  ctaLabel: textOr(g?.ctaLabel),
  image: mediaUrl(g?.image),
})

export type PrimeDifference = {
  eyebrow?: string
  heading?: string
  body?: RichTextValue
  checklist?: string[]
  reasons?: Array<{ icon?: string; title: string; body?: RichTextValue }>
}
export const mapPrimeDifference = (g: Raw): PrimeDifference => ({
  eyebrow: textOr(g?.eyebrow),
  heading: textOr(g?.heading),
  // `richTextHasContent` rather than a truthiness check: an untouched
  // Lexical editor saves one empty paragraph.
  body: richOr(g?.body),
  checklist: rows(g?.checklist)
    .map((item) => textOr(item.text))
    .filter((item): item is string => Boolean(item)),
  reasons: rows(g?.reasons)
    .filter((reason) => textOr(reason.title))
    .map((reason) => ({
      icon: textOr(reason.image),
      title: reason.title as string,
      body: richOr(reason.description),
    })),
})

export type Quote = { heading?: string; quote?: string; attribution?: string; image?: string }
export const mapQuote = (g: Raw): Quote => ({
  heading: textOr(g?.heading),
  quote: textOr(g?.quote),
  attribution: textOr(g?.attribution),
  image: mediaUrl(g?.image),
})

export type SiliconValleyLoves = {
  eyebrow?: string
  heading?: string
  body?: string
  image?: string
  stats?: Array<{ value?: string; label?: string; detail?: string; showStars?: boolean }>
  buttons?: Array<{ label: string; url: string; variant?: string }>
}
export const mapSiliconValleyLoves = (g: Raw): SiliconValleyLoves => ({
  eyebrow: textOr(g?.eyebrow),
  heading: textOr(g?.heading),
  body: textOr(g?.body),
  image: mediaUrl(g?.image),
  stats: rows(g?.stats)
    .map((stat) => ({
      value: textOr(stat.value),
      label: textOr(stat.label),
      detail: textOr(stat.detail),
      showStars: Boolean(stat.showStars),
    }))
    .filter((stat) => Boolean(stat.value || stat.label || stat.detail)),
  buttons: rows(g?.buttons).flatMap((button) => {
    const label = textOr(button.label)
    const url = textOr(button.url)
    return label && url ? [{ label, url, variant: textOr(button.variant) }] : []
  }),
})

export type TestimonialCards = { items?: Array<{ name: string; quote?: string; avatar?: string }> }
export const mapTestimonialCards = (g: Raw): TestimonialCards => ({
  // Linked Testimonials documents, populated at depth 2; a bare id carries
  // nothing to show and is skipped.
  items: rows(g?.testimonials)
    .filter((item) => textOr(item.name))
    .map((item) => ({
      name: item.name as string,
      quote: textOr(item.quote),
      avatar: mediaUrl(item.image),
    })),
})

export type SharedCitySections = {
  locationVideo?: LocationVideo
  dontSettle?: DontSettle
  quote?: Quote
  primeDifference?: PrimeDifference
  testimonialCards?: TestimonialCards
  siliconValleyLoves?: SiliconValleyLoves
}

/** The Shared Sections global's city-page sections, once per request. */
export const resolveSharedCitySections = cache(async (): Promise<SharedCitySections> => {
  if (!process.env.DATABASE_URL) return {}
  const [{ getPayload }, { default: configPromise }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config: configPromise })
  const g = (await payload.findGlobal({ slug: 'shared-sections', depth: 2 })) as unknown as Record<
    string,
    Raw
  >
  return {
    locationVideo: mapLocationVideo(g.locationVideo),
    dontSettle: mapDontSettle(g.dontSettle),
    quote: mapQuote(g.quote),
    primeDifference: mapPrimeDifference(g.primeDifference),
    testimonialCards: mapTestimonialCards(g.testimonialCards),
    siliconValleyLoves: mapSiliconValleyLoves(g.siliconValleyLoves),
  }
})

/**
 * The Shared Sections global's landing-page defaults, keyed by the block type
 * they fill, in the block's own raw shape (same field names, depth 2).
 */
export const resolveSharedLandingDefaults = cache(
  async (): Promise<Record<string, Record<string, unknown>>> => {
    if (!process.env.DATABASE_URL) return {}
    const [{ getPayload }, { default: configPromise }] = await Promise.all([
      import('payload'),
      import('@payload-config'),
    ])
    const payload = await getPayload({ config: configPromise })
    const g = (await payload.findGlobal({ slug: 'shared-sections', depth: 2 })) as unknown as Record<
      string,
      Record<string, unknown> | null
    >
    const byBlock: Record<string, string> = {
      'prime-difference': 'landingPrimeDifference',
      'experience-difference': 'landingExperienceDifference',
      'service-areas': 'landingServiceAreas',
      'luxury-cta': 'landingLuxuryCta',
      'find-us': 'landingFindUs',
    }
    return Object.fromEntries(
      Object.entries(byBlock).flatMap(([blockType, key]) => (g[key] ? [[blockType, g[key]!]] : [])),
    )
  },
)

/** Whether a stored block value counts as "not filled in". */
const isEmpty = (value: unknown): boolean => {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return !value.trim()
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== 'id')
      .every(([, entry]) => isEmpty(entry))
  }
  return false
}

/** A block with every empty field filled from its shared defaults. */
export function withSharedDefaults<T extends Record<string, unknown>>(
  block: T,
  defaults: Record<string, unknown> | undefined,
): T {
  if (!defaults) return block
  const filled: Record<string, unknown> = { ...block }
  for (const [key, value] of Object.entries(defaults)) {
    if (key === 'id') continue
    if (isEmpty(filled[key]) && !isEmpty(value)) filled[key] = value
  }
  return filled as T
}
