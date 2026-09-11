import { getPayload } from 'payload'

import configPromise from '@payload-config'
import type { RichTextValue } from '@/lib/richText'
import { richTextHasContent } from '@/lib/richText'
import website from '../../website.json'

export type HomepageChecklistItem = { lead: string; text: string }

export type HomepageFeatureBlock = {
  title: string
  body: RichTextValue
  ctaLabel: string
  ctaHref: string
  beforeImage?: string
  afterImage?: string
}

export type HomepageHero = {
  eyebrow?: string
  heading: string
  /** Words of the heading rendered in the accent color (`|`-separated). */
  headingHighlight?: string
  description?: string
  image?: string
  video?: string
  cta?: { label: string; href: string }
}

export type HomepageIntro = {
  eyebrow?: string
  heading: string
  body: RichTextValue
  image?: string
}

export type HomepageDifference = {
  eyebrow: string
  heading: string
  /** Words of the heading rendered in the accent color (`|`-separated). */
  headingHighlight?: string
  checklist: HomepageChecklistItem[]
}

export type HomepageIntroBlock = {
  eyebrow?: string
  heading: string
  /** Words of the heading rendered in the accent color (`|`-separated). */
  headingHighlight?: string
  body?: RichTextValue
}

export type HomepageFeatureBlocks = {
  eyebrow: string
  title: string
  /** Words of the title rendered in the accent color (`|`-separated). */
  titleHighlight?: string
  items: HomepageFeatureBlock[]
}

export type HomepageValue = {
  hero: HomepageHero
  intro: HomepageIntro
  difference: HomepageDifference
  projectsIntro: HomepageIntroBlock
  servicesIntro: HomepageIntroBlock
  featureBlocks: HomepageFeatureBlocks
  contactIntro: HomepageIntroBlock
  serviceAreas: { heading: string }
}

/** The current video shown in the hero — replaced by the CMS upload once set. */
const LOCAL_HERO_VIDEO =
  '/Prime%20Design%20Build%20Silicon%20Valleys%20Premier%20Home%20Remodeling%20Exper.mp4'
const LOCAL_HERO_POSTER = '/services/home-remodeling.jpeg'

/** WordPress homepage (post 2) copy — canonical fallbacks when CMS fields are empty. */
const fallback: HomepageValue = {
  hero: {
    heading: website.hero.headline,
    headingHighlight: 'design and build',
    cta: { label: website.hero.ctaLabel, href: website.hero.ctaHref },
  },
  intro: {
    heading:
      'Discover the Prime experience with a new home renovation, ADU, home addition or kitchen and bathroom remodel',
    body: paragraph(
      'Where we transform blueprints into reality with unwavering dedication and unmatched expertise. Your vision is our foundation, and together, we construct a future of enduring quality and innovation. Let\u2019s build something extraordinary.',
    ),
  },
  difference: {
    eyebrow: website.primeDifference.statLine,
    heading: website.primeDifference.heading,
    headingHighlight: 'Difference',
    checklist: [
      { lead: '', text: 'Experts on-site for interior design' },
      { lead: '', text: 'Certified general contractor, fully licensed.' },
      { lead: 'Family-owned', text: ' and operated business' },
      { lead: 'Competitive', text: ' pricing for our services' },
      { lead: 'Quick response', text: ' for customer satisfaction' },
    ],
  },
  projectsIntro: {
    heading: 'Our Latest Remodeling Projects',
  },
  servicesIntro: {
    heading: 'Our Services',
  },
  featureBlocks: {
    eyebrow: 'Remodel Your Entire Home With Prime Design & Build',
    title: "We don't just build Kitchens, We do it all.",
    titleHighlight: 'We do it all',
    items: [
      {
        title: 'Bathroom Remodeling',
        body: paragraphs(
          paragraph(
            'Let our expert team transform your bathroom into a space of beauty and functionality. Start your bathroom remodeling journey today!',
          ),
          paragraph('Your dream bathroom becomes a reality as we work closely with you to bring your vision to life.', 2),
        ),
        ctaLabel: 'Learn more',
        ctaHref: '/bathroom-remodeling',
        beforeImage: '/before-after/bathroom_remodeling_before.jpg',
        afterImage: '/before-after/bathroom_remodeling_after.jpeg',
      },
      {
        title: 'Complete Home Renovation',
        body: paragraphs(
          paragraph(
            'With a keen eye for detail and a commitment to craftsmanship, we employ innovative designs to create a home renovation that exceeds your expectations.',
          ),
          paragraph(
            'Whether it\u2019s a full-scale renovation or specific room transformations, we approach each project with the utmost care and professionalism.',
            2,
          ),
        ),
        ctaLabel: 'Learn more',
        ctaHref: '/home-remodeling',
        beforeImage: '/before-after/complete_remodeling_before.jpeg',
        afterImage: '/before-after/complete_remodeling_after.jpeg',
      },
    ],
  },
  contactIntro: {
    eyebrow: 'Contact',
    heading: website.contactForm.heading,
    headingHighlight: 'today',
    body: paragraph(
      'If you have any questions or you\u2019d like to find out more about our services, please get in touch.',
    ),
  },
  serviceAreas: {
    heading: website.serviceAreas.heading,
  },
}

/** Minimal Lexical paragraph — `format` bitmask: 1 bold, 2 italic. */
function paragraph(text: string, format = 0): RichTextValue {
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
          children: [{ type: 'text', text, format, detail: 0, style: '', mode: 'normal', version: 1 }],
        },
      ],
    },
  } as unknown as RichTextValue
}

/** Joins multiple paragraph rich-text values into one document. */
function paragraphs(...values: RichTextValue[]): RichTextValue {
  const children = values.flatMap((value) => {
    const nodes = value?.root?.children
    return Array.isArray(nodes) ? (nodes as unknown[]) : []
  })
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children,
    },
  } as unknown as RichTextValue
}

const textOr = (value: string | null | undefined) =>
  typeof value === 'string' && value.trim() ? value : undefined

const mediaUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

type PayloadHomepage = {
  hero?: {
    eyebrow?: string | null
    heading?: string | null
    headingHighlight?: string | null
    description?: string | null
    image?: unknown
    video?: unknown
    cta?: { label?: string | null; href?: string | null } | null
  } | null
  intro?: {
    eyebrow?: string | null
    heading?: string | null
    body?: RichTextValue
    image?: unknown
  } | null
  difference?: {
    eyebrow?: string | null
    heading?: string | null
    headingHighlight?: string | null
    checklist?: Array<{ lead?: string | null; text?: string | null }> | null
  } | null
  projectsIntro?: {
    eyebrow?: string | null
    heading?: string | null
    body?: RichTextValue
  } | null
  servicesIntro?: {
    eyebrow?: string | null
    heading?: string | null
    body?: RichTextValue
  } | null
  featureBlocks?: {
    eyebrow?: string | null
    title?: string | null
    titleHighlight?: string | null
    items?: Array<{
      title?: string | null
      body?: RichTextValue
      ctaLabel?: string | null
      ctaHref?: string | null
      beforeImage?: unknown
      afterImage?: unknown
    }> | null
  } | null
  contactIntro?: {
    eyebrow?: string | null
    heading?: string | null
    headingHighlight?: string | null
    body?: RichTextValue
  } | null
  serviceAreas?: { heading?: string | null } | null
}

export async function resolveHomepage(): Promise<HomepageValue> {
  if (!process.env.DATABASE_URL) return fallback

  const payload = await getPayload({ config: configPromise })
  const record = (await payload.findGlobal({ slug: 'homepage', depth: 2 })) as PayloadHomepage

  const hero = record.hero
  const intro = record.intro
  const difference = record.difference
  const projectsIntro = record.projectsIntro
  const servicesIntro = record.servicesIntro
  const featureBlocks = record.featureBlocks
  const contactIntro = record.contactIntro
  const serviceAreas = record.serviceAreas

  const heroImage = mediaUrl(hero?.image)
  const heroVideo = mediaUrl(hero?.video)

  const featureItems = (featureBlocks?.items || [])
    .filter((item) => textOr(item.title))
    .map((item) => ({
      title: textOr(item.title) || '',
      body: richTextHasContent(item.body)
        ? item.body!
        : paragraph(textOr(item.title) || ''),
      ctaLabel: textOr(item.ctaLabel) || '',
      ctaHref: textOr(item.ctaHref) || '',
      beforeImage: mediaUrl(item.beforeImage) || undefined,
      afterImage: mediaUrl(item.afterImage) || undefined,
    }))
    .filter((item) => item.body)

  return {
    hero: {
      eyebrow: textOr(hero?.eyebrow),
      heading: textOr(hero?.heading) || fallback.hero.heading,
      headingHighlight: textOr(hero?.headingHighlight) || fallback.hero.headingHighlight,
      description: textOr(hero?.description),
      image: heroImage || (heroVideo ? undefined : LOCAL_HERO_POSTER),
      video: heroVideo,
      cta: hero?.cta?.label
        ? { label: hero.cta.label, href: textOr(hero.cta.href) || fallback.hero.cta!.href }
        : fallback.hero.cta,
    },
    intro: {
      eyebrow: textOr(intro?.eyebrow),
      heading: textOr(intro?.heading) || fallback.intro.heading,
      body: intro?.body && richTextHasContent(intro.body) ? intro.body : fallback.intro.body,
      image: mediaUrl(intro?.image) || LOCAL_HERO_POSTER,
    },
    difference: {
      eyebrow: textOr(difference?.eyebrow) || fallback.difference.eyebrow,
      heading: textOr(difference?.heading) || fallback.difference.heading,
      headingHighlight:
        textOr(difference?.headingHighlight) || fallback.difference.headingHighlight,
      checklist:
        difference?.checklist
          ?.filter((item) => textOr(item.text) || textOr(item.lead))
          .map((item) => ({
            lead: textOr(item.lead) || '',
            text: textOr(item.text) || '',
          })) ?? fallback.difference.checklist,
    },
    projectsIntro: {
      eyebrow: textOr(projectsIntro?.eyebrow),
      heading: textOr(projectsIntro?.heading) || fallback.projectsIntro.heading,
      body:
        projectsIntro?.body && richTextHasContent(projectsIntro.body)
          ? projectsIntro.body
          : undefined,
    },
    servicesIntro: {
      eyebrow: textOr(servicesIntro?.eyebrow),
      heading: textOr(servicesIntro?.heading) || fallback.servicesIntro.heading,
      body:
        servicesIntro?.body && richTextHasContent(servicesIntro.body)
          ? servicesIntro.body
          : undefined,
    },
    featureBlocks: {
      eyebrow: textOr(featureBlocks?.eyebrow) || fallback.featureBlocks.eyebrow,
      title: textOr(featureBlocks?.title) || fallback.featureBlocks.title,
      titleHighlight: textOr(featureBlocks?.titleHighlight) || fallback.featureBlocks.titleHighlight,
      items: featureItems.length ? featureItems : fallback.featureBlocks.items,
    },
    contactIntro: {
      eyebrow: textOr(contactIntro?.eyebrow) || fallback.contactIntro.eyebrow,
      heading: textOr(contactIntro?.heading) || fallback.contactIntro.heading,
      headingHighlight:
        textOr(contactIntro?.headingHighlight) || fallback.contactIntro.headingHighlight,
      body:
        contactIntro?.body && richTextHasContent(contactIntro.body)
          ? contactIntro.body
          : fallback.contactIntro.body!,
    },
    serviceAreas: {
      heading: textOr(serviceAreas?.heading) || fallback.serviceAreas.heading,
    },
  }
}

/** Kept for the hero video fallback in components (CMS-less runs). */
export const localHeroVideo = LOCAL_HERO_VIDEO
