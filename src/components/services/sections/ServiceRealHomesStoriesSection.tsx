import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ServiceDetail } from '@/lib/services'

export type ServiceRealHomesContent = {
  eyebrow: string
  heading: string
  headingAccent: string
  description: string
  testimonials: { quote: string; attribution: string }[]
  cta: { label: string; href: string }
}

/**
 * WordPress stores the gradient span flattened into the heading ("Real
 * Homes, Real Stories") — strip a trailing `accent` from `heading` so the
 * caller can render heading + accent once instead of the accent twice.
 */
export function stripHeadingAccent(heading: string, accent: string): string {
  if (!heading.trim().endsWith(accent)) return heading
  return `${heading.slice(0, -accent.length).replace(/[\s,]+$/, '')},`
}

export function getRealHomesContent(service: ServiceDetail): ServiceRealHomesContent | undefined {
  const content = service.realHomes
  // Content comes from Payload only — render nothing without CMS data.
  if (!content?.testimonials?.length) return undefined
  const headingAccent = content.headingAccent || 'Real Stories'
  const heading = stripHeadingAccent(content.heading || 'Real Homes,', headingAccent)
  return {
    eyebrow: content.eyebrow || '',
    heading,
    headingAccent,
    description: content.description || '',
    testimonials: content.testimonials,
    cta: content.cta?.label
      ? { label: content.cta.label, href: content.cta.href || '/contact' }
      : { label: '', href: '/contact' },
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
      <div className="mx-auto max-w-5xl">
        <SectionHeader
          eyebrow={eyebrow}
          title={`${heading} ${headingAccent}`.trim()}
          titleHighlight={headingAccent}
          description={description}
          align="center"
          size="lg"
          className="max-w-none"
        />
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
