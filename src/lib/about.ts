import { getPayload } from 'payload'

import configPromise from '@payload-config'
import type { RichTextValue } from '@/lib/richText'
import { richTextHasContent, richTextToPlainText } from '@/lib/richText'
import website from '../../website.json'

export type AboutTeamMember = {
  name: string
  role: string
  description?: string
  image?: string
}

export type AboutValueItem = {
  icon: string
  title: string
  body?: RichTextValue
}

export type AboutHero = {
  eyebrow?: string
  heading: string
  headingHighlight?: string
  description?: RichTextValue
  image?: string
  imageSecondary?: string
  video?: string
  cta?: { label: string; href: string }
}

export type AboutTeamIntro = {
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

export type AboutGuidingPrinciple = {
  eyebrow?: string
  heading: string
  headingHighlight?: string
  body?: RichTextValue
  image?: string
  imageSecondary?: string
  ctaLabel?: string
  ctaHref?: string
}

export type AboutCoreValues = {
  heading: string
  description?: string
  values: AboutValueItem[]
}

export type AboutExperts = {
  eyebrow?: string
  heading: string
  description?: RichTextValue
  video?: string
  poster?: string
  badge?: string
  ctaLabel?: string
  ctaHref?: string
}

export type AboutFaqIntro = {
  heading: string
  description?: string
}

export type AboutValue = {
  hero: AboutHero
  team: AboutTeamIntro
  guidingPrinciple: AboutGuidingPrinciple
  coreValues: AboutCoreValues
  experts: AboutExperts
  faq: AboutFaqIntro
}

/** Minimal Lexical paragraph — `format` bitmask: 1 bold, 2 italic, 4 underline. */
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

/** Paragraph built from formatted segments (WordPress inline bold/italic/underline). */
function richParagraph(segments: Array<{ text: string; format?: number }>): RichTextValue {
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
          children: segments.map((segment) => ({
            type: 'text',
            text: segment.text,
            format: segment.format ?? 0,
            detail: 0,
            style: '',
            mode: 'normal',
            version: 1,
          })),
        },
      ],
    },
  } as unknown as RichTextValue
}

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

/** WordPress About page (post 343) copy — canonical fallbacks when CMS fields are empty. */
const fallback: AboutValue = {
  hero: {
    eyebrow: 'About us and our story',
    heading: 'The Go-To Choice for Homeowners In Silicon Valley',
    headingHighlight: 'Go-To Choice',
    description: richParagraph([
      { text: 'Our team of visionary leaders and dedicated professionals are committed to transforming your ' },
      { text: 'dreams', format: 1 },
      { text: ' into reality. With ' },
      { text: 'years of experience', format: 1 },
      { text: ' and a shared passion for excellence, we are here to deliver ' },
      { text: 'unparalleled', format: 2 },
      { text: ' service and create ' },
      { text: 'stunning spaces', format: 1 },
      { text: ' that exceed your expectations.' },
    ]),
    cta: { label: 'Unlock Your Dream Home Today', href: '/contact' },
  },
  team: {
    eyebrow: 'Driven by Passion, Guided by Expertise',
    heading: 'Meet our exceptional Team',
    headingHighlight: 'exceptional',
    body: richParagraph([
      { text: 'Our team of visionary leaders and dedicated ' },
      { text: 'professionals is committed to transforming', format: 8 },
      { text: ' your ' },
      { text: 'dreams', format: 1 },
      { text: ' into reality. With ' },
      { text: 'years of experience', format: 1 },
      { text: ' and a shared passion for excellence, we are here to deliver ' },
      { text: 'unparalleled', format: 2 },
      { text: ' service and create ' },
      { text: 'stunning spaces', format: 1 },
      { text: ' that exceed your expectations.' },
    ]),
    ctaLabel: 'Speak with Our Team',
    ctaHref: '#contact',
    introHeading: 'Meet the team',
    introSubheading: 'The Faces Behind Prime Design and Build',
    introBody: paragraph(
      'Here, we showcase the talented individuals who bring their expertise, passion, and creativity to Prime Design & Build. Each team member plays a vital role in shaping our company\u2019s success and delivering outstanding results for our clients. Through their dedication, skill, and commitment to craftsmanship, our team ensures that your home remodeling journey is nothing short of exceptional. Explore below to get to know the faces behind Prime Design & Build and discover the talent that sets us apart.',
    ),
  },
  guidingPrinciple: {
    eyebrow: 'Our Guiding Principle',
    heading: 'Prime Design & Build\u2019s Promise: Reliability in Every Project We Take On',
    headingHighlight: 'Reliability in Every Project We Take On',
    body: paragraphs(
      paragraph(
        'Our guiding principle is reliability. We believe in working closely with our clients to turn their vision into reality, with a commitment to delivering exceptional projects on time and within budget. Our team of experienced professionals upholds the highest standards of quality, safety, and expertise in every aspect of the project, from design to architecture, engineering, and completion.',
      ),
      paragraph(
        'Our reliability sets us apart in the industry and drives our mission to provide the best experience for every client, every time.',
      ),
    ),
    ctaLabel: 'Start your project',
    ctaHref: '/contact',
  },
  coreValues: {
    heading: 'Our Core Values',
    description:
      'At Prime Design & Build, we are passionately committed to delivering excellence in every facet of our business. We pride ourselves on upholding an unwavering standard of integrity, grounded in fairness, honesty, and personal responsibility.',
    values: website.about.coreValues.items.map((value) => ({
      icon: value.icon,
      title: value.title,
    })),
  },
  experts: {
    eyebrow: 'Experts in Silicon Valley',
    heading: 'This is why our customers love us!',
    description: richParagraph([
      { text: 'At Prime Design & Build, we combine the ' },
      { text: 'latest advancements', format: 9 },
      { text: ' in home technology with a relentless commitment to ' },
      { text: 'superior', format: 2 },
      { text: ' craftsmanship, ensuring every inch of your space is thoughtfully utilized for both functionality and stunning design.' },
    ]),
    ctaLabel: 'See our services',
    ctaHref: '/services',
  },
  faq: {
    heading: website.about.faq.heading,
    description: website.about.faq.description,
  },
}

const textOr = (value: string | null | undefined) =>
  typeof value === 'string' && value.trim() ? value : undefined

const mediaUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

type PayloadAbout = {
  hero?: {
    eyebrow?: string | null
    heading?: string | null
    headingHighlight?: string | null
    description?: RichTextValue
    image?: unknown
    imageSecondary?: unknown
    video?: unknown
    cta?: { label?: string | null; href?: string | null } | null
  } | null
  team?: {
    eyebrow?: string | null
    heading?: string | null
    headingHighlight?: string | null
    body?: RichTextValue
    ctaLabel?: string | null
    ctaHref?: string | null
    introHeading?: string | null
    introSubheading?: string | null
    introBody?: RichTextValue
  } | null
  guidingPrinciple?: {
    eyebrow?: string | null
    heading?: string | null
    headingHighlight?: string | null
    body?: RichTextValue
    image?: unknown
    imageSecondary?: unknown
    ctaLabel?: string | null
    ctaHref?: string | null
  } | null
  coreValues?: {
    heading?: string | null
    description?: string | null
    values?: Array<{ icon?: string | null; title?: string | null; body?: RichTextValue }> | null
  } | null
  experts?: {
    eyebrow?: string | null
    heading?: string | null
    description?: RichTextValue
    video?: unknown
    poster?: unknown
    badge?: unknown
    ctaLabel?: string | null
    ctaHref?: string | null
  } | null
  faq?: { heading?: string | null; description?: string | null } | null
}

export async function resolveAbout(): Promise<AboutValue> {
  if (!process.env.DATABASE_URL) return fallback

  const payload = await getPayload({ config: configPromise })
  const record = (await payload.findGlobal({ slug: 'about', depth: 2 })) as PayloadAbout

  const hero = record.hero
  const team = record.team
  const guiding = record.guidingPrinciple
  const coreValues = record.coreValues
  const experts = record.experts
  const faq = record.faq

  const heroImage = mediaUrl(hero?.image)
  const heroImageSecondary = mediaUrl(hero?.imageSecondary)

  const values = (coreValues?.values || [])
    .filter((value) => textOr(value.title))
    .map((value) => ({
      icon: textOr(value.icon) || '',
      title: textOr(value.title) || '',
      body: value.body && richTextHasContent(value.body) ? value.body : undefined,
    }))

  return {
    hero: {
      eyebrow: textOr(hero?.eyebrow),
      heading: textOr(hero?.heading) || fallback.hero.heading,
      headingHighlight: textOr(hero?.headingHighlight) || fallback.hero.headingHighlight,
      description:
        hero?.description && richTextHasContent(hero.description)
          ? hero.description
          : fallback.hero.description,
      image: heroImage,
      imageSecondary: heroImageSecondary,
      video: mediaUrl(hero?.video),
      cta: hero?.cta?.label
        ? { label: hero.cta.label, href: textOr(hero.cta.href) || fallback.hero.cta!.href }
        : fallback.hero.cta,
    },
    team: {
      eyebrow: textOr(team?.eyebrow) || fallback.team.eyebrow,
      heading: textOr(team?.heading) || fallback.team.heading,
      headingHighlight: textOr(team?.headingHighlight) || fallback.team.headingHighlight,
      body: team?.body && richTextHasContent(team.body) ? team.body : fallback.team.body,
      ctaLabel: textOr(team?.ctaLabel) || fallback.team.ctaLabel,
      ctaHref: textOr(team?.ctaHref) || fallback.team.ctaHref,
      introHeading: textOr(team?.introHeading) || fallback.team.introHeading,
      introSubheading: textOr(team?.introSubheading) || fallback.team.introSubheading,
      introBody:
        team?.introBody && richTextHasContent(team.introBody)
          ? team.introBody
          : fallback.team.introBody,
    },
    guidingPrinciple: {
      eyebrow: textOr(guiding?.eyebrow) || fallback.guidingPrinciple.eyebrow,
      heading: textOr(guiding?.heading) || fallback.guidingPrinciple.heading,
      headingHighlight:
        textOr(guiding?.headingHighlight) || fallback.guidingPrinciple.headingHighlight,
      body:
        guiding?.body && richTextHasContent(guiding.body)
          ? guiding.body
          : fallback.guidingPrinciple.body,
      image: mediaUrl(guiding?.image),
      imageSecondary: mediaUrl(guiding?.imageSecondary),
      ctaLabel: textOr(guiding?.ctaLabel) || fallback.guidingPrinciple.ctaLabel,
      ctaHref: textOr(guiding?.ctaHref) || fallback.guidingPrinciple.ctaHref,
    },
    coreValues: {
      heading: textOr(coreValues?.heading) || fallback.coreValues.heading,
      description: textOr(coreValues?.description) || fallback.coreValues.description,
      values: values.length ? values : fallback.coreValues.values,
    },
    experts: {
      eyebrow: textOr(experts?.eyebrow) || fallback.experts.eyebrow,
      heading: textOr(experts?.heading) || fallback.experts.heading,
      description:
        experts?.description && richTextHasContent(experts.description)
          ? experts.description
          : fallback.experts.description,
      video: mediaUrl(experts?.video),
      poster: mediaUrl(experts?.poster),
      badge: mediaUrl(experts?.badge),
      ctaLabel: textOr(experts?.ctaLabel) || fallback.experts.ctaLabel,
      ctaHref: textOr(experts?.ctaHref) || fallback.experts.ctaHref,
    },
    faq: {
      heading: textOr(faq?.heading) || fallback.faq.heading,
      description: textOr(faq?.description) || fallback.faq.description,
    },
  }
}

/**
 * Team members from the Payload Team collection (seeded with the WordPress
 * team). Returns an empty list when the collection has no members — the
 * TeamSection then falls back to its built-in list.
 */
export async function resolveTeamMembers(): Promise<AboutTeamMember[]> {
  if (!process.env.DATABASE_URL) return []

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'team',
    sort: 'createdAt',
    depth: 2,
    limit: 100,
  })
  return (result.docs as unknown as Array<{
    name?: string
    position?: string | null
    bio?: RichTextValue
    image?: unknown
  }>)
    .map((record) => ({
      name: typeof record.name === 'string' ? record.name : '',
      role: typeof record.position === 'string' ? record.position : '',
      description: richTextToPlainText(record.bio) || undefined,
      image: mediaUrl(record.image),
    }))
    .filter((member) => member.name)
}
