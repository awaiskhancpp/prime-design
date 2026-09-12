import { getPayload } from 'payload'

import configPromise from '@payload-config'
import type { RichTextValue } from '@/lib/richText'
import { richTextHasContent } from '@/lib/richText'

export type GalleryReason = {
  icon?: string
  title: string
  body?: string
}

export type GalleryHero = {
  eyebrow?: string
  heading: string
  headingHighlight?: string
  description?: RichTextValue
  image?: string
}

export type GalleryWhyChooseUs = {
  eyebrow?: string
  eyebrowAccent?: string
  heading: string
  reasons: GalleryReason[]
}

export type GalleryValue = {
  hero: GalleryHero
  whyChooseUs: GalleryWhyChooseUs
}

function paragraph(text: string): RichTextValue {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [{ type: 'text', text, format: 0, detail: 0, style: '', mode: 'normal', version: 1 }],
        },
      ],
    },
  } as unknown as RichTextValue
}

/** WordPress gallery page (post 349) copy — canonical fallbacks. */
const fallback: GalleryValue = {
  hero: {
    eyebrow: 'Our Gallery',
    heading: 'A reflection of our remodeling projects in Silicon Valley',
    headingHighlight: 'remodeling projects',
    description: paragraph(
      'See our kitchen remodeling, bathroom remodeling, and other home remodeling work here at Prime Design & Build\u2019s gallery.',
    ),
  },
  whyChooseUs: {
    eyebrow: 'Experience the',
    eyebrowAccent: '\u201CPrime Difference\u201D',
    heading: 'Why choose Prime Design & Build?',
    reasons: [
      {
        icon: '/attention-to-detail.svg',
        title: 'Attention to Detail',
        body: 'We meticulously plan and execute every project with precision and attention to detail.',
      },
      {
        icon: '/quality-craftsmanship.svg',
        title: 'Quality Craftsmanship',
        body: 'Our commitment to quality ensures outstanding and beautiful home transformations.',
      },
      {
        icon: '/professional-expertise.svg',
        title: 'Professional Expertise',
        body: 'With years of industry experience, we create exceptional, tailored home remodels.',
      },
      {
        icon: '/customer-satisfaction.svg',
        title: 'Customer Satisfaction',
        body: 'We prioritize your satisfaction with exceptional service and communication.',
      },
    ],
  },
}

const textOr = (value: string | null | undefined) =>
  typeof value === 'string' && value.trim() ? value : undefined

const mediaUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

type PayloadGallery = {
  hero?: {
    eyebrow?: string | null
    heading?: string | null
    headingHighlight?: string | null
    description?: RichTextValue
    image?: unknown
  } | null
  whyChooseUs?: {
    eyebrow?: string | null
    eyebrowAccent?: string | null
    heading?: string | null
    reasons?: Array<{ icon?: string | null; title?: string | null; body?: string | null }> | null
  } | null
}

export async function resolveGallery(): Promise<GalleryValue> {
  if (!process.env.DATABASE_URL) return fallback

  const payload = await getPayload({ config: configPromise })
  const record = (await payload.findGlobal({ slug: 'gallery', depth: 2 })) as PayloadGallery

  const hero = record.hero
  const whyChooseUs = record.whyChooseUs

  const reasons = (whyChooseUs?.reasons || [])
    .filter((reason) => textOr(reason.title))
    .map((reason) => ({
      icon: textOr(reason.icon) || undefined,
      title: textOr(reason.title) || '',
      body: textOr(reason.body) || undefined,
    }))

  return {
    hero: {
      eyebrow: textOr(hero?.eyebrow) || fallback.hero.eyebrow,
      heading: textOr(hero?.heading) || fallback.hero.heading,
      headingHighlight: textOr(hero?.headingHighlight) || fallback.hero.headingHighlight,
      description:
        hero?.description && richTextHasContent(hero.description)
          ? hero.description
          : fallback.hero.description,
      image: mediaUrl(hero?.image),
    },
    whyChooseUs: {
      eyebrow: textOr(whyChooseUs?.eyebrow) || fallback.whyChooseUs.eyebrow,
      eyebrowAccent:
        whyChooseUs?.eyebrowAccent !== undefined && whyChooseUs?.eyebrowAccent !== null
          ? textOr(whyChooseUs.eyebrowAccent) || ''
          : fallback.whyChooseUs.eyebrowAccent,
      heading: textOr(whyChooseUs?.heading) || fallback.whyChooseUs.heading,
      reasons: reasons.length ? reasons : fallback.whyChooseUs.reasons,
    },
  }
}
