import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'

type Area = { label?: string; href?: string }

export function LandingServiceAreasSection({
  eyebrow = 'Service areas',
  heading,
  description,
  ctaLabel,
  ctaHref,
  areas = [],
}: {
  eyebrow?: string
  heading?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  areas?: Area[]
}) {
  const items = areas.filter((item) => item.label)
  if (!items.length) return null

  return (
    <Section className="bg-white text-ink">
      <div className="grid gap-10 pt-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{eyebrow}</p>
          <h2 className="mt-3 max-w-sm font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            {heading || 'Built across Silicon Valley, one neighborhood at a time.'}
          </h2>
          {description ? (
            <p className="mt-4 max-w-sm text-base text-ink/70">{description}</p>
          ) : null}
          {ctaHref ? (
            <Button href={ctaHref} variant="line" className="mt-6 text-ink">
              {ctaLabel || 'Explore all areas'}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          {items.map((area, index) =>
            area.href ? (
              <Link
                key={`${area.label}-${index}`}
                href={area.href}
                className="border border-line px-4 py-2 text-sm text-ink/75 transition-colors hover:border-brass hover:text-brass-deep"
              >
                {area.label}
              </Link>
            ) : (
              <span
                key={`${area.label}-${index}`}
                className="border border-line px-4 py-2 text-sm text-ink/50"
              >
                {area.label}
              </span>
            ),
          )}
        </div>
      </div>
    </Section>
  )
}
