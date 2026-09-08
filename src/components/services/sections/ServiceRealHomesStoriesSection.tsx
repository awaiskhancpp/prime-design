import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import type { ServiceDetail } from '@/lib/services'

export type ServiceRealHomesContent = {
  eyebrow: string
  heading: string
  headingAccent: string
  description: string
  testimonials: { quote: string; attribution: string }[]
  cta: { label: string; href: string }
}

const defaultTestimonials = [
  {
    quote:
      'Prime Design & Build’s team of experts brought new life to our home. Their commitment to quality and design is unparalleled.',
    attribution: 'Alex and Sophia',
  },
  {
    quote:
      'Choosing Prime Design & Build was the best decision we made for our home remodeling. Their expertise and professionalism made the entire process stress-free.',
    attribution: 'Robert and Laura',
  },
  {
    quote:
      'Prime Design & Build captured our vision perfectly and delivered exceptional results. Our home now reflects our unique style and personality.',
    attribution: 'Jonathan and Emma',
  },
]

export function getRealHomesContent(service: ServiceDetail): ServiceRealHomesContent {
  return {
    eyebrow: '#1 Home Remodeling Company in Silicon Valley',
    heading: 'Real Homes,',
    headingAccent: 'Real Stories',
    description:
      'Explore the success stories of homeowners who entrusted Prime Design & Build to create their dream living spaces.',
    testimonials: defaultTestimonials,
    cta: { label: 'Contact us now', href: '/contact' },
  }
}

export function ServiceRealHomesStoriesSection({
  eyebrow,
  heading,
  headingAccent,
  description,
  testimonials,
  cta,
}: ServiceRealHomesContent) {
  return (
    <Section className="">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
          {heading}{' '}
          <span className="bg-gradient-to-r from-brass to-brass-deep bg-clip-text text-transparent">
            {headingAccent}
          </span>
        </h2>
        <p className="mt-5 text-base leading-7  text-ink-2/70">{description}</p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {testimonials.map((item) => (
          <figure
            key={item.attribution}
            className="flex h-full flex-col border border-line bg-white p-8"
          >
            <span className="font-display text-5xl leading-none text-brass" aria-hidden>
              &ldquo;
            </span>
            <blockquote className="mt-4 flex-1 font-display text-lg leading-8 text-ink-2">
              {item.quote}
            </blockquote>
            <figcaption className="mt-6 text-sm italic text-brass-deep">
              — {item.attribution}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Button href={cta.href} variant="outline" size="md">
          {cta.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </Section>
  )
}
