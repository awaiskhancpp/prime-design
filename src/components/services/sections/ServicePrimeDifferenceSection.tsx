import Image from '@/components/ui/Image'

import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { richTextHasContent, type RichTextValue } from '@/lib/richText'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ServiceDetail } from '@/lib/services'
import { VideoCarousel, type CarouselVideo } from '@/components/landing/VideoCarousel'

/**
 * Prose in this section is either a plain string or a Payload rich-text value.
 *
 * Service-location pages store both the paragraph and the four card
 * descriptions as `richText`, so an editor can bold a phrase the way the
 * WordPress original does ("we are the **unrivaled experts**"). The service
 * pages still hand this component plain strings, and both have to render.
 */
export type PrimeDifferenceProse = string | RichTextValue

export type PrimeDifferenceContent = {
  eyebrow?: string
  heading: string
  headingAccent?: string
  body?: PrimeDifferenceProse
  checklist?: string[]
  reasons?: { icon?: string; title: string; body?: PrimeDifferenceProse }[]
  /**
   * Social review badges (Google / Yelp / Houzz) shown under the checklist.
   * Only pages whose WordPress section carries them (the Shaker Kitchen
   * "Why Choose" template) pass this — every other page using this section
   * renders without them.
   */
  socials?: Array<{ image: string; href?: string }>
  videos?: CarouselVideo[]
}

export type WordPressDifferenceFeature = {
  title: string
  description?: string
}

const presentationIcons = [
  '/attention-to-detail.svg',
  '/quality-craftsmanship.svg',
  '/professional-expertise.svg',
  '/customer-satisfaction.svg',
]

/**
 * The Google / Yelp / Houzz review badges shown under the checklist. Every
 * page that renders this section has them in the WordPress source except
 * Home Remodeling and Bathroom Remodeling — those two pages use the gallery
 * "Why Choose Us" section instead, so they never reach this component.
 */
const defaultSocials = [
  { image: '/social/Yelp.png', href: 'https://www.yelp.com/biz/prime-kitchens-santa-clara' },
  { image: '/social/Google.png', href: 'https://maps.google.com/?cid=11837063325613881352' },
  {
    image: '/social/houzz.png',
    href: 'https://www.houzz.com/professionals/kitchen-and-bath-remodelers/prime-kitchens-pfvwus-pf~508047204',
  },
]

export function getWordPressDifferenceContent({
  eyebrow,
  heading,
  description,
  features,
  checklist,
}: {
  eyebrow?: string
  heading: string
  description?: string
  features: Array<WordPressDifferenceFeature & { icon?: string }>
  checklist?: string[]
}): PrimeDifferenceContent {
  return {
    eyebrow,
    heading,
    body: description,
    checklist,
    reasons: features.map((feature, index) => ({
      icon: feature.icon || presentationIcons[index],
      title: feature.title,
      body: feature.description,
    })),
  }
}

const spaceWordBySlug: Record<string, string> = {
  'kitchen-remodeling': 'kitchen',
  'bathroom-remodeling': 'bathroom',
  'home-remodeling': 'home',
  'european-kitchen-silicon-valley': 'kitchen',
  'shaker-kitchen-silicon-valley': 'kitchen',
  'custom-kitchen-silicon-valley': 'kitchen',
}

const reasons = [
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
]

/**
 * Renders either kind of prose, or nothing.
 *
 * An untouched Lexical editor saves a single empty paragraph, so a bare
 * truthiness check would leave a blank line under the heading on any page
 * whose field has been opened in the admin and left alone.
 */
function Prose({ value, className }: { value?: PrimeDifferenceProse; className: string }) {
  if (typeof value === 'string') {
    return value.trim() ? <p className={className}>{value}</p> : null
  }
  if (!richTextHasContent(value)) return null
  return (
    <div className={`${className} [&_p]:mt-0 [&_p+p]:mt-4`}>
      <RichTextContent data={value} />
    </div>
  )
}

export function ServicePrimeDifferenceSection({
  eyebrow,
  heading,
  headingAccent,
  body,
  checklist,
  reasons,
  socials,
  videos,
}: PrimeDifferenceContent) {
  const socialList = socials === undefined ? defaultSocials : socials
  return (
    <Section className="bg-white">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:items-center">
        <div>
          <SectionHeader
            eyebrow={eyebrow}
            title={headingAccent ? `${heading} ${headingAccent}` : heading}
            titleHighlight={headingAccent}
            size="lg"
            className="max-w-none"
          />
          <Prose value={body} className="mt-6 text-base leading-7 text-ink-2/75" />

          {checklist?.length ? (
            <ul className="mt-7 grid gap-4">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                    <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
                      <path
                        d="M4 10.5l3.5 3.5L16 6"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-base leading-6 text-ink-2/85">{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {socialList?.length ? (
            <div className="mt-8 flex flex-wrap items-center gap-5">
              {socialList.map((social, index) => {
                const image = (
                  <Image
                    src={social.image}
                    alt=""
                    aria-hidden="true"
                    width={44}
                    height={44}
                    className="h-10 w-auto object-contain"
                  />
                )
                return social.href ? (
                  <a
                    key={`${social.href}-${index}`}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {image}
                  </a>
                ) : (
                  <span key={`${social.image}-${index}`}>{image}</span>
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {(reasons || []).map(({ icon, title, body }, index) => (
            <div
              key={title}
              className="group relative border border-line bg-paper p-8 transition-shadow duration-300 hover:shadow-lg hover:shadow-ink/5"
            >
              <span
                className="absolute left-0 top-0 h-0.5 w-0 bg-brass transition-all duration-300 ease-out group-hover:w-full"
                aria-hidden
              />

              <div className="mt-5 flex h-[90px] w-[90px] items-center justify-center">
                {icon ? (
                  <Image
                    src={icon}
                    alt=""
                    aria-hidden="true"
                    width={90}
                    height={90}
                    className="h-[90px] w-[90px] object-contain"
                  />
                ) : null}
              </div>

              <h3 className="mt-6 font-display text-xl font-medium text-ink">{title}</h3>
              <Prose value={body} className="mt-3 text-sm leading-6 text-ink-2/65" />
            </div>
          ))}
        </div>
      </div>

      {videos?.length ? (
        <div className="mx-auto mt-14 max-w-3xl">
          <VideoCarousel videos={videos} />
        </div>
      ) : null}
    </Section>
  )
}
