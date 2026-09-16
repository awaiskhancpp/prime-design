import type { RichTextValue } from '@/lib/richText'
import { richTextHasContent } from '@/lib/richText'
import { resolveCustomSection, type CustomSectionContent } from '@/lib/sections'

/**
 * Every block a page can render, mapped from the Pages collection's `layout`
 * field. The homepage, About and Gallery pages are ordinary records in that
 * collection, so they use the same sections as any other page.
 *
 * Nothing here carries fallback copy: a field that's empty renders empty.
 */

export type PageHeroContent = {
  eyebrow?: string
  heading: string
  headingHighlight?: string
  description?: RichTextValue
  image?: string
  imageSecondary?: string
  video?: string
  /** Optional external clip used from 768px up (WordPress homepage hero). */
  videoUrl?: string
  cta?: {
    label: string
    href: string
    style: 'filled' | 'outlined'
    showCalendarIcon: boolean
  }
  align: 'center' | 'left'
}

export type PageIntroContent = {
  eyebrow?: string
  heading: string
  body?: RichTextValue
  image?: string
}

export type PageHeadingContent = {
  eyebrow?: string
  heading: string
  headingHighlight?: string
  body?: RichTextValue
}

export type PageDifferenceContent = {
  eyebrow: string
  heading: string
  headingHighlight?: string
  checklist: Array<{ lead: string; text: string }>
  videos: Array<{
    title: string
    url: string
    /** Optional poster frame for the thumbnail strip. */
    poster?: string
    /** What the video says — rendered under the player like a testimonial. */
    summary?: RichTextValue
    speakerName?: string
    speakerRole?: string
  }>
}

export type PageFeatureBlocksContent = {
  eyebrow: string
  title: string
  titleHighlight?: string
  items: Array<{
    title: string
    body: RichTextValue
    ctaLabel: string
    ctaHref: string
    beforeImage?: string
    afterImage?: string
  }>
}

export type PageTeamIntroContent = {
  eyebrow?: string
  heading: string
  headingHighlight?: string
  body?: RichTextValue
  ctaLabel?: string
  ctaHref?: string
  introHeading?: string
  introSubheading?: string
  introBody?: RichTextValue
}

export type PageGuidingPrincipleContent = {
  eyebrow?: string
  heading: string
  headingHighlight?: string
  body?: RichTextValue
  image?: string
  imageSecondary?: string
  ctaLabel?: string
  ctaHref?: string
}

export type PageCoreValuesContent = {
  heading: string
  description?: string
  values: Array<{ icon: string; title: string; body?: RichTextValue }>
}

export type PageExpertsContent = {
  eyebrow?: string
  heading: string
  description?: RichTextValue
  video?: string
  poster?: string
  badge?: string
  ctaLabel?: string
  ctaHref?: string
  /** What the video says + optional on-screen attribution. */
  summary?: RichTextValue
  speakerName?: string
  speakerRole?: string
}

export type PageFaqIntroContent = { heading: string; description?: string }

export type PageWhyChooseUsContent = {
  eyebrow?: string
  eyebrowAccent?: string
  heading: string
  reasons: Array<{ icon?: string; title: string; body?: string }>
}

export type PageGenericContent = { eyebrow?: string; heading: string; body: string }

export type PageImageTextContent = PageGenericContent & {
  image?: string
  imageSide: 'left' | 'right'
}

export type PageGalleryContent = { heading?: string; images: string[] }

export type PageCtaContent = {
  heading: string
  body?: string
  label?: string
  href?: string
}

export type PageTestimonialVideosContent = {
  heading?: string
  description?: string
  videos: Array<{ title?: string; speaker?: string; url: string; poster?: string }>
}

export type PageReviewHighlightsContent = {
  badges: Array<{ image: string; alt: string }>
  stats: Array<{
    label?: string
    rating?: number
    count?: number
    url?: string
    linkLabel?: string
  }>
  /** How many featured testimonials to render as cards. */
  reviewLimit?: number
}

export type PageTestimonialsSpotlightContent = {
  eyebrow?: string
  heading?: string
  body?: RichTextValue
  ctaLabel?: string
  ctaHref?: string
  ctaNote?: string
  reviewLimit?: number
}

export type PageFaqIndexContent = {
  eyebrow?: string
  heading?: string
  description?: string
  searchPlaceholder?: string
  allLabel?: string
  emptyMessage?: string
}

export type PageConsultationsContent = {
  eyebrow?: string
  heading?: string
  description?: string
}

export type PageSection =
  | { type: 'hero'; content: PageHeroContent }
  | { type: 'intro'; content: PageIntroContent }
  | { type: 'difference'; content: PageDifferenceContent }
  | { type: 'projects'; content: PageHeadingContent }
  | { type: 'services'; content: PageHeadingContent }
  | { type: 'feature-blocks'; content: PageFeatureBlocksContent }
  | { type: 'contact-intro'; content: PageHeadingContent }
  | { type: 'team'; content: PageTeamIntroContent }
  | { type: 'guiding-principle'; content: PageGuidingPrincipleContent }
  | { type: 'core-values'; content: PageCoreValuesContent }
  | { type: 'experts'; content: PageExpertsContent }
  | { type: 'faq'; content: PageFaqIntroContent }
  | { type: 'gallery-tabs'; content: { heading?: string; description?: string } }
  | { type: 'why-choose-us'; content: PageWhyChooseUsContent }
  | { type: 'contact'; content: { city?: string; poster?: string } }
  | { type: 'testimonial-videos'; content: PageTestimonialVideosContent }
  | { type: 'review-highlights'; content: PageReviewHighlightsContent }
  | { type: 'testimonials-spotlight'; content: PageTestimonialsSpotlightContent }
  | { type: 'faq-index'; content: PageFaqIndexContent }
  | { type: 'consultations'; content: PageConsultationsContent }
  | { type: 'service-areas'; content: { heading?: string } }
  | { type: 'custom'; content: CustomSectionContent }
  | { type: 'content'; content: PageGenericContent }
  | { type: 'image-text'; content: PageImageTextContent }
  | { type: 'gallery'; content: PageGalleryContent }
  | { type: 'cta'; content: PageCtaContent }

const text = (value: unknown) => (typeof value === 'string' ? value : '')

const optionalText = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : undefined

const mediaUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

const rich = (value: unknown): RichTextValue | undefined =>
  richTextHasContent(value as RichTextValue) ? (value as RichTextValue) : undefined

const group = (value: unknown) =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

type PageBlock = Record<string, unknown> & { blockType?: string | null }

/** Maps one stored block onto the section the page renders. */
export function toPageSection(block: PageBlock): PageSection | undefined {
  switch (block.blockType) {
    case 'hero': {
      const cta = group(block.cta)
      return {
        type: 'hero',
        content: {
          eyebrow: optionalText(block.eyebrow),
          heading: text(block.heading),
          headingHighlight: optionalText(block.headingHighlight),
          description: rich(block.description),
          image: mediaUrl(block.image),
          imageSecondary: mediaUrl(block.imageSecondary),
          video: mediaUrl(block.video),
          videoUrl: optionalText(block.videoUrl),
          cta:
            cta.label && cta.href
              ? {
                  label: text(cta.label),
                  href: text(cta.href),
                  style: cta.style === 'outlined' ? 'outlined' : 'filled',
                  showCalendarIcon: Boolean(cta.showCalendarIcon),
                }
              : undefined,
          align: block.align === 'center' ? 'center' : 'left',
        },
      }
    }
    case 'intro':
      return {
        type: 'intro',
        content: {
          eyebrow: optionalText(block.eyebrow),
          heading: text(block.heading),
          body: rich(block.body),
          image: mediaUrl(block.image),
        },
      }
    case 'difference':
      return {
        type: 'difference',
        content: {
          eyebrow: text(block.eyebrow),
          heading: text(block.heading),
          headingHighlight: optionalText(block.headingHighlight),
          checklist: (Array.isArray(block.checklist) ? block.checklist : [])
            .map((item) => group(item))
            .filter((item) => item.lead || item.text)
            .map((item) => ({ lead: text(item.lead), text: text(item.text) })),
          videos: (Array.isArray(block.videos) ? block.videos : [])
            .map((item) => group(item))
            .filter((item) => item.url)
            .map((item) => ({
              title: text(item.title),
              url: text(item.url),
              poster: mediaUrl(item.poster),
              summary: rich(item.summary),
              speakerName: optionalText(item.speakerName),
              speakerRole: optionalText(item.speakerRole),
            })),
        },
      }
    case 'projects':
    case 'services':
    case 'contact-intro':
      return {
        type: block.blockType,
        content: {
          eyebrow: optionalText(block.eyebrow),
          heading: text(block.heading),
          headingHighlight: optionalText(block.headingHighlight),
          body: rich(block.body),
        },
      }
    case 'feature-blocks':
      return {
        type: 'feature-blocks',
        content: {
          eyebrow: text(block.eyebrow),
          title: text(block.title),
          titleHighlight: optionalText(block.titleHighlight),
          items: (Array.isArray(block.items) ? block.items : [])
            .map((item) => group(item))
            .filter((item) => item.title || rich(item.body))
            .map((item) => ({
              title: text(item.title),
              body: item.body as RichTextValue,
              ctaLabel: text(item.ctaLabel),
              ctaHref: text(item.ctaHref),
              beforeImage: mediaUrl(item.beforeImage),
              afterImage: mediaUrl(item.afterImage),
            })),
        },
      }
    case 'team':
      return {
        type: 'team',
        content: {
          eyebrow: optionalText(block.eyebrow),
          heading: text(block.heading),
          headingHighlight: optionalText(block.headingHighlight),
          body: rich(block.body),
          ctaLabel: optionalText(block.ctaLabel),
          ctaHref: optionalText(block.ctaHref),
          introHeading: optionalText(block.introHeading),
          introSubheading: optionalText(block.introSubheading),
          introBody: rich(block.introBody),
        },
      }
    case 'guiding-principle':
      return {
        type: 'guiding-principle',
        content: {
          eyebrow: optionalText(block.eyebrow),
          heading: text(block.heading),
          headingHighlight: optionalText(block.headingHighlight),
          body: rich(block.body),
          image: mediaUrl(block.image),
          imageSecondary: mediaUrl(block.imageSecondary),
          ctaLabel: optionalText(block.ctaLabel),
          ctaHref: optionalText(block.ctaHref),
        },
      }
    case 'core-values':
      return {
        type: 'core-values',
        content: {
          heading: text(block.heading),
          description: optionalText(block.description),
          values: (Array.isArray(block.values) ? block.values : [])
            .map((value) => group(value))
            .filter((value) => value.title || value.icon)
            .map((value) => ({
              icon: text(value.icon),
              title: text(value.title),
              body: rich(value.body),
            })),
        },
      }
    case 'experts':
      return {
        type: 'experts',
        content: {
          eyebrow: optionalText(block.eyebrow),
          heading: text(block.heading),
          description: rich(block.description),
          video: mediaUrl(block.video),
          poster: mediaUrl(block.poster),
          badge: mediaUrl(block.badge),
          ctaLabel: optionalText(block.ctaLabel),
          ctaHref: optionalText(block.ctaHref),
          summary: rich(block.summary),
          speakerName: optionalText(block.speakerName),
          speakerRole: optionalText(block.speakerRole),
        },
      }
    case 'faq':
      return {
        type: 'faq',
        content: { heading: text(block.heading), description: optionalText(block.description) },
      }
    case 'gallery-tabs':
      return {
        type: 'gallery-tabs',
        content: {
          heading: optionalText(block.heading),
          description: optionalText(block.description),
        },
      }
    case 'why-choose-us':
      return {
        type: 'why-choose-us',
        content: {
          eyebrow: optionalText(block.eyebrow),
          eyebrowAccent:
            block.eyebrowAccent === null || block.eyebrowAccent === undefined
              ? undefined
              : text(block.eyebrowAccent),
          heading: text(block.heading),
          reasons: (Array.isArray(block.reasons) ? block.reasons : [])
            .map((reason) => group(reason))
            .filter((reason) => reason.title)
            .map((reason) => ({
              icon: optionalText(reason.icon),
              title: text(reason.title),
              body: optionalText(reason.body),
            })),
        },
      }
    case 'contact':
      return {
        type: 'contact',
        content: { city: optionalText(block.city), poster: mediaUrl(block.poster) },
      }
    case 'testimonial-videos':
      return {
        type: 'testimonial-videos',
        content: {
          heading: optionalText(block.heading),
          description: optionalText(block.description),
          videos: (Array.isArray(block.videos) ? block.videos : [])
            .map((value) => group(value))
            .map((value) => ({
              title: optionalText(value.title),
              speaker: optionalText(value.speaker),
              // An uploaded file wins; the external URL is the fallback the
              // WordPress source used.
              url: mediaUrl(value.video) || text(value.externalUrl),
              poster: mediaUrl(value.poster),
            }))
            .filter((value) => value.url),
        },
      }
    case 'review-highlights':
      return {
        type: 'review-highlights',
        content: {
          badges: (Array.isArray(block.badges) ? block.badges : [])
            .map((value) => group(value))
            .map((value) => ({
              image: mediaUrl(value.image) || text(value.imagePath),
              alt: text(value.alt),
            }))
            .filter((value) => value.image),
          stats: (Array.isArray(block.stats) ? block.stats : [])
            .map((value) => group(value))
            .map((value) => ({
              label: optionalText(value.label),
              rating: typeof value.rating === 'number' ? value.rating : undefined,
              count: typeof value.count === 'number' ? value.count : undefined,
              url: optionalText(value.url),
              linkLabel: optionalText(value.linkLabel),
            }))
            .filter((value) => value.label || value.rating || value.linkLabel),
          reviewLimit: typeof block.reviewLimit === 'number' ? block.reviewLimit : undefined,
        },
      }
    case 'testimonials-spotlight':
      return {
        type: 'testimonials-spotlight',
        content: {
          eyebrow: optionalText(block.eyebrow),
          heading: optionalText(block.heading),
          body: rich(block.body),
          ctaLabel: optionalText(block.ctaLabel),
          ctaHref: optionalText(block.ctaHref),
          ctaNote: optionalText(block.ctaNote),
          reviewLimit: typeof block.reviewLimit === 'number' ? block.reviewLimit : undefined,
        },
      }
    case 'consultations':
      return {
        type: 'consultations',
        content: {
          eyebrow: optionalText(block.eyebrow),
          heading: optionalText(block.heading),
          description: optionalText(block.description),
        },
      }
    case 'faq-index':
      return {
        type: 'faq-index',
        content: {
          eyebrow: optionalText(block.eyebrow),
          heading: optionalText(block.heading),
          description: optionalText(block.description),
          searchPlaceholder: optionalText(block.searchPlaceholder),
          allLabel: optionalText(block.allLabel),
          emptyMessage: optionalText(block.emptyMessage),
        },
      }
    case 'service-areas':
      return { type: 'service-areas', content: { heading: optionalText(block.heading) } }
    case 'custom':
      return {
        type: 'custom',
        content: resolveCustomSection(block as unknown as Parameters<typeof resolveCustomSection>[0], mediaUrl),
      }

    // The generic blocks that existed before the sections were added.
    case 'content':
      return {
        type: 'content',
        content: {
          eyebrow: optionalText(block.eyebrow),
          heading: text(block.heading),
          body: text(block.body),
        },
      }
    case 'image-text':
      return {
        type: 'image-text',
        content: {
          eyebrow: optionalText(block.eyebrow),
          heading: text(block.heading),
          body: text(block.body),
          image: mediaUrl(block.image),
          imageSide: block.imageSide === 'left' ? 'left' : 'right',
        },
      }
    case 'gallery':
      return {
        type: 'gallery',
        content: {
          heading: optionalText(block.heading),
          images: (Array.isArray(block.images) ? block.images : [])
            .map((image) => mediaUrl(image))
            .filter((image): image is string => Boolean(image)),
        },
      }
    case 'cta':
      return {
        type: 'cta',
        content: {
          heading: text(block.heading),
          body: optionalText(block.body),
          label: optionalText(block.label),
          href: optionalText(block.href),
        },
      }
    default:
      return undefined
  }
}

/** Maps a page's stored blocks onto renderable sections, in order. */
export function toPageSections(blocks: PageBlock[] | null | undefined): PageSection[] {
  if (!blocks?.length) return []
  return blocks
    .map((block) => toPageSection(block))
    .filter((section): section is PageSection => Boolean(section))
}
