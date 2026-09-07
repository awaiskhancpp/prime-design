import Image from 'next/image'

import { Section } from '@/components/ui/Section'
import type { ServiceDetail } from '@/lib/services'
import { VideoCarousel, type CarouselVideo } from '@/components/landing/VideoCarousel'

export type PrimeDifferenceContent = {
  eyebrow?: string
  heading: string
  headingAccent?: string
  body?: string
  checklist?: string[]
  reasons?: { icon?: string; title: string; body?: string }[]
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

export function getWordPressDifferenceContent({
  eyebrow,
  heading,
  description,
  features,
}: {
  eyebrow?: string
  heading: string
  description?: string
  features: WordPressDifferenceFeature[]
}): PrimeDifferenceContent {
  return {
    eyebrow,
    heading,
    body: description,
    reasons: features.map((feature, index) => ({
      icon: presentationIcons[index],
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

const checklist = [
  'Experts on-site for accurate solutions',
  'Wide range of construction and remodel services',
  'Customer satisfaction is a priority',
  'Competitive pricing for our services',
  'Quick response for customer satisfaction',
]

export function getPrimeDifferenceContent(service: ServiceDetail): PrimeDifferenceContent {
  const spaceWord = spaceWordBySlug[service.slug] ?? 'home'

  return {
    eyebrow: 'Why Choose Prime Design & Build?',
    heading: 'The',
    headingAccent: 'Prime Difference',
    body: `At Prime Design & Build, we understand that your ${spaceWord} is the heart of your home, and when it comes to ${service.title.toLowerCase()}, we are the unrivaled experts.`,
    checklist,
    reasons,
  }
}

const reviewBadges = [
  { src: '/social/Yelp.png', alt: 'Yelp' },
  { src: '/social/Google.png', alt: 'Google' },
  { src: '/social/houzz.png', alt: 'Houzz' },
]

export function ServicePrimeDifferenceSection({
  eyebrow,
  heading,
  headingAccent,
  body,
  checklist,
  reasons,
  videos,
}: PrimeDifferenceContent) {
  return (
    <Section className="bg-white">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:items-center">
        <div>
          {eyebrow ? <p className="font-display text-lg italic text-ink-2/70">{eyebrow}</p> : null}
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
            &ldquo;{heading}
            {headingAccent ? ' ' : null}
            {headingAccent ? (
              <span className="bg-gradient-to-r from-brass to-brass-deep bg-clip-text text-transparent">
                {headingAccent}
              </span>
            ) : null}
            &rdquo;
          </h2>
          {body ? <p className="mt-6 text-base leading-7 text-ink-2/75">{body}</p> : null}

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

          <div className="mt-8 flex flex-wrap items-center gap-6">
            {reviewBadges.map((badge) => (
              <div key={badge.alt} className="flex flex-col items-start gap-1">
                <Image
                  src={badge.src}
                  alt={badge.alt}
                  width={110}
                  height={40}
                  className=" object-contain"
                />
              </div>
            ))}
          </div>
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

              <span className="text-xs font-semibold text-brass-deep/50">
                {String(index + 1).padStart(2, '0')}
              </span>

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
              {body ? <p className="mt-3 text-sm leading-6 text-ink-2/65">{body}</p> : null}
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
