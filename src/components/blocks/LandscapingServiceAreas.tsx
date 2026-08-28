import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import website from '../../../website.json'
import { Section } from '@/components/ui/Section'
import { Button } from '../ui/Button'

const citySlug = (city: string) =>
  city
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

export function LandscapingServiceAreas({ serviceSlug }: { serviceSlug?: string } = {}) {
  const { heading, cities, trailingLabel, trailingHref } = website.serviceAreas
  const targetServiceSlug = serviceSlug || 'kitchen-remodeling'

  return (
    <Section className="bg-white text-ink">
      <div className="grid gap-10  pt-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{heading}</p>
          <h2 className="mt-3 max-w-sm font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            Built across Silicon Valley, one neighborhood at a time.
          </h2>
          <Button href={trailingHref} variant="line" className="mt-6 text-ink">
            {trailingLabel}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Button>
          {/* <Link
            href={trailingHref}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink/70 transition-colors hover:text-brass-deep"
          >
            
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link> */}
        </div>

        <div className="flex flex-wrap gap-3">
          {cities.map((city) => (
            <Link
              key={city}
              href={`/${targetServiceSlug}/${targetServiceSlug}-in-${citySlug(city)}`}
              className="border border-line px-4 py-2 text-sm text-ink/75 transition-colors hover:border-brass hover:text-brass-deep"
            >
              {city}
            </Link>
          ))}
        </div>
      </div>
    </Section>
  )
}
