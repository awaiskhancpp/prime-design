import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'

type Area = { label?: string; href?: string }

/**
 * Every string rendered here comes from the caller (a Payload `service-areas`
 * block, or a service's `areasWeService` group). There are deliberately no
 * default headings or eyebrows: a section that invents its own copy when the
 * CMS field is empty makes it impossible to tell whether the content is
 * actually wired to Payload.
 */
export function LandingServiceAreasSection({
  eyebrow,
  heading,
  description,
  ctaLabel,
  ctaHref,
  areas = [],
  regionHeading,
}: {
  eyebrow?: string
  heading?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  areas?: Area[]
  /**
   * The state the listed cities belong to ("California" in the source),
   * shown under the heading. The WordPress section prints this beside a map
   * graphic; this design deliberately carries the label without the map.
   */
  regionHeading?: string
}) {
  const items = areas.filter((item) => item.label)
  if (!items.length) return null

  return (
    <Section className="bg-white text-ink">
      <div className="grid gap-10 pt-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{eyebrow}</p>
          ) : null}
          {heading ? (
            <h2 className="mt-3 max-w-sm font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              {heading}
            </h2>
          ) : null}
          {regionHeading ? (
            <p className="mt-2 font-display text-xl font-medium text-ink">{regionHeading}</p>
          ) : null}
          {description ? (
            <p className="mt-4 max-w-sm text-base text-ink/70">{description}</p>
          ) : null}
          {ctaHref ? (
            <Button href={ctaHref} variant="line" className="mt-6 text-ink">
              {ctaLabel}
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
